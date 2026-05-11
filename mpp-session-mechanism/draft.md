# MPP Session 동작 메커니즘과 구현 상세 분석

## 초록 (Abstract)

MPP(Machine Payments Protocol) Session은 AI 에이전트가 블록체인 처리량 한계를 우회하면서 HTTP API에 대한 무제한 마이크로결제를 수행할 수 있도록 설계된 오프체인 결제 채널 메커니즘이다. `TempoStreamChannel` 에스크로 스마트 컨트랙트에 TIP-20 토큰을 예치한 후, 클라이언트는 EIP-712 타입 서명 기반의 누적 바우처를 오프체인으로 교환하며 서비스를 소비한다. 서버는 단일 `ecrecover` 호출로 바우처를 검증하므로 마이크로초 수준의 지연시간만이 발생하며, 수천 건의 마이크로결제를 단 두 번의 온체인 트랜잭션(open + close)으로 정산할 수 있다. 본 분석은 공식 블로그[^s01], IETF 드래프트 draft-tempo-session-00[^s02], mpp.dev 기술 문서[^s03][^s04][^s05]를 1차 자료로 삼아 channelId 결정론적 파생, EIP-712 바우처 구조, 서버 회계 모델, 생명주기 전체, 보안 고려사항 및 SDK 생태계를 상세히 분석한다.

---

## 1. 서론

### 1.1 문제: AI 에이전트의 마이크로결제 딜레마

자율 AI 에이전트는 LLM 추론, 실시간 데이터 피드, IoT 센서 스트림 등 다수의 유료 API를 per-request 단위로 호출한다. 그러나 기존 결제 방식인 구독, API 키, 계정 생성은 즉각적이고 자율적인 pay-per-use 수요를 충족하지 못한다[^s05]. 블록체인 결제를 대안으로 사용할 경우, 각 요청마다 온체인 트랜잭션이 필요하다면 약 500ms의 확정 지연이 발생하여 실시간 스트리밍에는 적합하지 않다[^s01].

### 1.2 MPP의 두 결제 모델: charge vs session

MPP는 이 문제를 해결하기 위해 두 가지 결제 intent를 정의한다[^s05]. `charge` intent는 단건 일회성 결제로, 요청마다 온체인 트랜잭션이 발생한다. `session` intent는 사전 예치(escrow)와 오프체인 바우처 교환을 결합한 결제 채널 모델로, 온체인 트랜잭션 2회(open + close)만으로 수천 건의 오프체인 마이크로결제를 처리할 수 있다[^s01]. Session intent는 Cloudflare의 에이전트 결제 인프라에도 통합되어 토큰 기반 스트리밍 과금 시나리오에 특히 적합한 것으로 평가된다[^s06].

### 1.3 표준화 현황

MPP Session은 IETF 드래프트 `draft-tempo-session-00`으로 제출되어 있으며[^s02], 기반 MPP 프로토콜은 Tempo와 Stripe가 공동 저작한 오픈 표준이다[^s05]. 드래프트는 6개월 단위로 갱신되지 않으면 만료되며, 최종 RFC 승격까지는 수년이 소요될 수 있다.

---

## 2. 배경

### 2.1 HTTP 402 기반 결제 협상

MPP는 HTTP 402 Payment Required 상태 코드와 표준 인증 헤더 체계를 재활용한다[^s02]. 서버는 402 응답과 함께 `WWW-Authenticate: Payment` 헤더로 결제 챌린지를 발행한다. 헤더에는 `id`(챌린지 식별자), `realm`(보호 공간), `method`("tempo"), `intent`("session"), `request`(Base64url JSON 페이로드), `expires`(RFC3339 만료 시각)가 포함된다. 클라이언트는 바우처를 생성하여 `Authorization: Payment <credential>` 헤더로 재요청한다.

### 2.2 Tempo 블록체인과 TIP-20

Tempo 블록체인은 TIP-20 토큰 표준을 사용하며, 결제 레인(payment lanes), 이체 메모, 컴플라이언스 정책이 내장된 스테이블코인을 지원한다[^s07]. 체인은 결정론적 서브-세컨드 확정성(deterministic sub-second finality)을 제공하며 _(구체적 수치는 vendor-stated)_, 수수료 후원(fee sponsorship)을 통해 사용자가 스테이블코인으로 가스비를 납부할 수 있는 가스리스(gasless) 경험을 가능하게 한다[^s07]. 만료형 논스(expiring nonce) 시스템은 병렬 트랜잭션 제출을 지원한다[^s07]. TempoStreamChannel 에스크로 컨트랙트는 메인넷(chain ID 4217, `0x33b901018174DDabE4841042ab76ba85D4e24f25`)과 테스트넷 Moderato(chain ID 42431, `0xe1c4d3dce17bc111181ddf716f75bae49e61a336`)에 배포되어 있다[^s03].

---

## 3. MPP Session 아키텍처

### 3.1 TempoStreamChannel 에스크로 컨트랙트

MPP Session의 핵심은 `TempoStreamChannel` 에스크로 스마트 컨트랙트다[^s03]. payer(클라이언트)가 TIP-20 토큰을 컨트랙트에 예치하면, payee(서버)는 나중에 최종 바우처를 온체인에 제출하여 정산할 수 있다. 미사용 예치금은 close 시 payer에게 환급된다. 이 구조는 "주유소 선결제" 패턴과 유사하다: 선불로 충전한 후 실제 사용량만큼만 차감된다.

### 3.2 channelId 결정론적 파생

각 결제 채널은 고유한 `channelId`로 식별되며, 이는 7개 파라미터의 결정론적 해시로 파생된다[^s02]:

```
channelId = keccak256(abi.encode(
    payer,           // 예치자 주소
    payee,           // 수신자 주소
    token,           // TIP-20 토큰 주소
    salt,            // 채널 재사용 방지 무작위값
    authorizedSigner, // 위임 서명자 (없으면 payer와 동일)
    address(this),   // 에스크로 컨트랙트 주소
    block.chainid    // 체인 ID
))
```

`address(this)`와 `block.chainid`를 포함함으로써 channelId는 특정 컨트랙트 배포본과 체인에 명시적으로 바인딩된다[^s02]. 이는 크로스-컨트랙트 재생 공격(cross-contract replay)과 크로스-체인 재생 공격을 모두 방지한다.

### 3.3 채널 상태 모델

서버는 각 채널에 대해 다음 상태 필드를 유지한다[^s02]:

- `acceptedCumulative`: 수락된 가장 높은 유효 바우처의 누적 금액 (단조 증가)
- `spent`: 제공된 서비스에 대해 청구된 누적 금액
- `settledOnChain`: 마지막으로 온체인 정산된 누적 금액 (정보용)
- `available = acceptedCumulative - spent`: 잔여 사용 가능 금액

### 3.4 suggestedDeposit / maxDeposit 협상

서버는 챌린지 페이로드에 `suggestedDeposit`과 `maxDeposit` 파라미터를 포함하여 클라이언트가 적절한 예치금 규모를 결정하도록 안내한다[^s03]. 클라이언트 SDK는 `maxDeposit`을 상한으로 설정하며, 채널당 최대 잠금 금액을 제어한다[^s04]. 예를 들어 `maxDeposit: '1'`은 최대 1 pathUSD를 채널에 잠그며, 요청당 $0.01 과금 시 최대 100회 요청을 커버한다.

---

## 4. 암호학적 바우처 메커니즘

### 4.1 EIP-712 타입 데이터 서명

바우처는 EIP-712 구조화 데이터 서명 표준을 사용한다[^s02]. 타입 정의는 다음과 같다:

```
Voucher: [
  { name: "channelId",        type: "bytes32" },
  { name: "cumulativeAmount", type: "uint128" }
]
```

도메인 분리자(domain separator)는 다음 파라미터로 구성된다:
- `name`: "Tempo Stream Channel"
- `version`: "1"
- `chainId`: Tempo 체인 ID (예: 42431)
- `verifyingContract`: 에스크로 컨트랙트 주소

서명 해시 계산식은 다음과 같다:

```
signingHash = keccak256("\x19\x01" || domainSeparator || structHash)
```

### 4.2 누적(Cumulative) 의미론

바우처는 델타가 아닌 누적 총액을 나타낸다[^s02]. 즉, 각 바우처는 "지금까지 총 X 이하 인출 가능"을 승인한다. 서비스 소비가 진행되면 컨트랙트는 `delta = cumulativeAmount - settled`로 실제 정산액을 계산한다. 예를 들어 바우처 #1이 100, #2가 250, #3이 400을 명시하면 각각 100, 150, 150의 델타가 인출된다. 서버는 `acceptedCumulative`를 초과하지 않는 바우처를 거부하여 단조 증가성을 강제한다[^s02]. 단조 증가하지 않는 바우처는 멱등 처리된다.

### 4.3 단일 ecrecover 검증

서버는 바우처 검증을 위해 `ecrecover` 한 번만 호출한다[^s03]. 이는 CPU-bound 연산으로 RPC 호출이 전혀 불필요하며, 마이크로초 수준의 지연시간을 달성한다 _(vendor-stated)_[^s01]. "바우처는 블록체인 처리량에 병목되지 않으며, 순수 CPU-bound 서명 검사로 처리된다"[^s04].

### 4.4 저-s(low-s) ECDSA 규칙

모든 서명은 저-s 값(s ≤ secp256k1_order / 2)을 사용해야 한다[^s02]. 서버는 고-s 서명을 거부한다. 이 규칙은 ECDSA 서명 가단성(malleability) 공격을 방지한다. 65바이트 `(r, s, v)` 형식과 64바이트 EIP-2098 콤팩트 형식 모두 허용된다.

### 4.5 위임 서명(Authorized Signer)

`channelId` 파생에 `authorizedSigner` 파라미터가 포함된다[^s02]. 이 필드가 0이 아닌 경우, 컨트랙트는 복구된 서명자가 `channel.payer` 대신 `channel.authorizedSigner`와 일치하는지 확인한다. 이를 통해 주 자금 보관 콜드월렛과 별도의 핫월렛 키로 바우처에 서명할 수 있다. 위임 서명자 키가 탈취되면 채널의 잔여 예치금 전체가 위험에 처할 수 있으며, 주 자금 자체는 분리되어 보호된다.

---

## 5. Session 생명주기

### 5.1 Open: 채널 개설

클라이언트는 `TempoStreamChannel` 컨트랙트에 TIP-20 토큰을 예치하는 온체인 트랜잭션을 제출한다[^s02][^s03]. 서버는 온체인 확인 후 채널을 유효한 것으로 인식하고 서비스 제공을 시작한다. TypeScript SDK에서는 다음과 같이 초기화된다[^s04]:

```typescript
const mppx = Mppx.create({
  methods: [tempo({
    account: privateKeyToAccount('0x...'),
    maxDeposit: '1',
  })],
})
```

첫 번째 요청이 402를 받으면 SDK가 자동으로 채널을 개설하고 초기 바우처를 전송한다.

### 5.2 Consume: 오프체인 바우처 소비

채널이 열린 이후의 각 요청은 오프체인 바우처를 `Authorization: Payment` 헤더에 담아 전송한다[^s02][^s03]. 서버의 처리 순서는 다음과 같다:

1. 바우처 서명 검증 (`ecrecover`)
2. `cumulativeAmount > acceptedCumulative` 확인 (단조 증가 검증)
3. `cumulativeAmount ≤ channel.deposit` 확인 (예치금 초과 방지)
4. 내구성 있는 저장소에 `spent` 먼저 저장 (충돌 안전성 원칙)
5. 서비스 제공
6. `Payment-Receipt` 헤더 반환 (channelId, acceptedCumulative, spent, available 포함)

### 5.3 Streaming Pause: payment-need-voucher 이벤트

SSE(Server-Sent Events) 스트리밍 중 `available` 잔액이 소진되면 서버는 스트림을 일시 중단하고 다음 SSE 이벤트를 전송한다[^s02]:

```
event: payment-need-voucher
data: {
  "channelId": "0x6d0f4fdf...",
  "requiredCumulative": "250025",
  "acceptedCumulative": "250000",
  "deposit": "500000"
}
```

클라이언트는 `deposit` 값을 확인하여 추가 바우처(voucher)만 필요한지 또는 top-up(추가 예치)이 필요한지 판단한다.

### 5.4 Top-up: 채널 재충전

채널을 닫지 않고 추가 예치가 가능하다[^s01][^s03]. Top-up은 새로운 channelId를 생성하지 않으며, 기존 채널의 deposit을 증가시킨다. 서버가 강제 종료 요청을 감지한 경우, top-up은 해당 강제 종료 타이머를 취소한다. SDK를 통해 구현된다.

### 5.5 Cooperative Close: 협력적 종료

정상 종료 시 서버가 `close(channelId, cumulativeAmount, sig)` 함수를 호출한다[^s02][^s03]. 컨트랙트는 서버의 서명을 검증하고, `cumulativeAmount`만큼을 payee에게 지급하며, 나머지 예치금을 payer에게 환급한다. SDK에서는 `const receipt = await session.close()`로 완결된다.

### 5.6 Forced Close: 강제 종료

서버가 응답하지 않거나 협력적 종료를 거부하는 경우, payer는 `requestClose(channelId)` 함수를 호출한다[^s02]. 이후 15분의 유예 기간이 시작되며, 이 기간 동안 서버는 최종 바우처를 온체인에 제출하여 정산할 수 있다. 15분 경과 후에도 서버가 응답하지 않으면 payer는 `withdraw(channelId)` 함수로 전체 잔여 예치금을 복구한다. 15분의 유예 기간은 "네트워크 혼잡이나 유지보수 기간에도 서버가 종료 요청을 감지하고 최종 정산을 제출할 시간을 확보"하기 위해 설계되었다[^s02].

---

## 6. 서버 구현 및 보안

### 6.1 충돌 안전 회계

서버는 채널당 `acceptedCumulative`, `spent`, `settledOnChain` 세 필드를 내구성 있는 저장소에 유지해야 한다[^s02]. 결정적으로, 서비스 제공 전에 `spent`를 먼저 저장하는 "선불 선기록(spend-before-serve)" 원칙을 따라야 한다[^s02]. 이를 통해 서버 크래시 후 재시작 시에도 이미 청구된 금액이 정확히 기록되어 이중 서비스 제공이 방지된다.

### 6.2 DoS 방어

IETF 드래프트는 다음 DoS 방어 조치를 명시한다[^s02]:

- 세션당 바우처 제출 속도를 초당 10건으로 제한해야 한다(SHOULD).
- `minVoucherDelta` 파라미터가 존재하는 경우 이를 강제해야 한다.
- 최소 예치금 요건(최소 1 USD 상당 권장)을 설정해야 한다.
- 단조 증가하지 않는 바우처는 멱등 처리한다(재처리 없이 기존 상태 반환).
- 비싼 ECDSA 복구 전에 형식 검증을 먼저 수행하여 계산 비용을 최소화한다.

### 6.3 재생 공격 방지

MPP Session의 재생 공격 방지는 세 겹의 구조로 구성된다[^s02]:

1. **channelId 바인딩**: 바우처가 특정 컨트랙트/체인/쌍(payer-payee)에 고정됨
2. **누적 단조성**: 이전 acceptedCumulative보다 낮은 바우처는 즉시 거부
3. **온체인 강제**: 컨트랙트가 settled 이하의 인출 시도를 거부

### 6.4 RFC9457 오류 응답

서버는 RFC9457 Problem Details 형식으로 결제 오류를 반환한다[^s02]. IETF 드래프트가 정의하는 8개의 문제 유형은 다음과 같다:

| 문제 타입 | HTTP 상태 |
|---|---|
| `session/invalid-signature` | 402 |
| `session/signer-mismatch` | 402 |
| `session/amount-exceeds-deposit` | 402 |
| `session/delta-too-small` | 402 |
| `session/channel-not-found` | 410 |
| `session/channel-finalized` | 410 |
| `session/challenge-not-found` | 402 |
| `session/insufficient-balance` | 402 |

모든 URI는 `https://paymentauth.org/problems/` 접두사를 갖는다.

---

## 7. 성능 특성, SDK 생태계 및 실제 적용

### 7.1 성능 비교

MPP Session의 핵심 성능 이점은 세션 중 오프체인 바우처 검증만이 필요하다는 점이다[^s01][^s03]. 온체인 확정 지연이 없으므로 바우처 처리는 마이크로초 단위로 이루어지며 _(vendor-stated)_, 이는 단건 `charge` 결제의 ~500ms 지연과 극명히 대조된다 _(vendor-stated)_. 온체인 트랜잭션 2회(open + close)로 수천 건의 마이크로결제를 처리할 수 있어 건당 온체인 비용을 대폭 절감한다[^s01].

### 7.2 SDK 생태계

MPP는 다중 언어 SDK 생태계를 지원한다[^s05]:

- **TypeScript (mppx)**: `wevm/mppx` 저장소, v0.6.17 (2026-05-09 기준, 76회 릴리즈)[^s09]. Viem/Wagmi 기반으로 전역 fetch 인터셉터를 통한 자동 결제 처리를 제공한다.
- **Python (pympp)**: `pip install "pympp[tempo]"` 설치, Python 3.10+ 요구[^s08].
- **Rust, Go, Ruby**: 공식 SDK 제공[^s05].
- **프레임워크 미들웨어**: Hono, Express, Next.js, Elysia 지원[^s05][^s06].

### 7.3 실제 적용 사례

Cloudflare는 MPP를 에이전트 결제 인프라에 통합하여 Tempo 스테이블코인 결제와 Stripe 카드 결제(charge intent)를 단일 엔드포인트에서 지원한다[^s06]. 주요 적용 영역으로는 LLM 추론 마켓플레이스(토큰 단위 과금), 실시간 데이터 피드, IoT 마이크로트랜잭션이 꼽힌다[^s01][^s06].

---

## 8. 한계 및 불확실성

**IETF 드래프트 단계**: `draft-tempo-session-00`은 6개월마다 갱신되지 않으면 만료되며, RFC 승격까지 수년이 소요될 수 있다[^s02]. 프로토콜 세부 사항은 표준화 과정에서 변경될 가능성이 있다.

**위임 서명 키 탈취 위험**: `authorizedSigner` 핫월렛 키가 탈취되면 채널의 잔여 예치금 전체가 위험에 처한다. 주 자금은 분리되지만, 채널당 잠긴 금액의 손실 위험이 존재한다[^s02].

**강제 종료 중 서버 도주(rug) 위험**: Cooperative Close를 서버가 거부하면 payer는 15분 유예 기간 동안 자금을 회수하지 못한다. 서버가 강제 종료 전에 최종 바우처를 제출하지 않으면 payer가 전액 복구하지만, 이 기간 동안 서비스 중단이 발생한다[^s02].

**Tempo 블록체인 단일 의존성**: 현재 Session intent는 Tempo/EIP-712 기반만 지원하며[^s02], MPP의 다른 결제 수단(Solana, Stellar, Lightning)은 Session 채널 구현을 별도로 정의해야 한다.

**구현 레벨 보안 취약점 (GHSA-fxc9-7j2w-vx54)**: 2026년 3월 공개된 GitHub Security Advisory에 따르면, `mpp-rs` 라이브러리의 v0.8.0 이전 버전에서 `tempo/session` 핸들러가 세션의 유효성을 검증하지 않아 결제 없이 무제한 세션 생성이 가능한 치명적(Critical) 결제 우회 취약점이 존재했다[^s10]. 해당 취약점은 v0.8.0에서 수정되었다. 이는 프로토콜 설계 자체의 결함이 아닌 구현 레벨의 결함이나, 공식 SDK 구현에도 심각한 보안 문제가 발생할 수 있음을 보여준다.

**독립 보안 감사 미공개**: TempoStreamChannel 컨트랙트에 대한 독립적인 보안 감사 보고서는 공개적으로 확인되지 않는다.

**성능 수치의 vendor-stated 특성**: 바우처 검증 마이크로초, Tempo 서브-세컨드 확정성, 이론적 1M TPS 등의 수치는 모두 공급자 발표 자료에 근거하며 독립적인 벤치마크로 검증되지 않았다.
