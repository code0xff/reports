# Tempo MPP 스펙과 기술 구조 — 인텐트와 결제 방식별 플로우 분석

## 초록

본 보고서는 Tempo·Stripe의 **MPP(Machine Payments Protocol)** 를 마케팅이 아닌 **사양 수준**에서 해체한다. MPP의 기반은 IETF 인터넷 드래프트 "Payment" HTTP Authentication Scheme(`draft-ryan-httpauth-payment-01`, Tempo Labs + Stripe 공동 저작)이며[^s01], 그 위에 (a) `charge`·`session`·`subscription`의 세 **인텐트**[^s04][^s05][^s06]와 (b) Tempo·Stripe·Stellar·Solana·Lightning·Card 등 결제 **방식(method)** 이 별도 레지스트리로 얹힌다[^s03][^s08]. 핵심 흐름은 HTTP 402 위의 **challenge → credential → receipt** 3단계다 — 서버가 `WWW-Authenticate: Payment` 챌린지를 내고, 클라이언트가 `Authorization: Payment` credential로 재요청하며, 서버가 `Payment-Receipt`로 정산을 확인한다[^s01][^s04][^s12]. 본 보고서는 (1) 헤더 그래머와 상태 코드 (2) 세 인텐트의 필드와 플로우 (3) 결제 방식별 동작을 각각 1차 사양으로 정리하고, Stripe `mppx` 코드와 Stellar Soroban 채널 코드를 인용해 실제 헤더가 어떻게 오가는지 추적한다.

## 1. 서론 — MPP가 표준화하는 것

MPP는 "AI가 돈을 낸다"는 추상을 HTTP 한 요청 안에서 표준화한다. mpp.dev의 한 줄 — "MPP (Machine Payments Protocol) is the open standard for machine-to-machine payments via HTTP 402"[^s03]. 외부 정리도 같은 결 — "Stripe and Tempo's Machine Payments Protocol (MPP) is an open HTTP-native standard for billing AI agents"[^s11]. 그 토대는 두 가지로 갈린다.

- **core (payment-method agnostic)** — 결제 방식과 무관한 HTTP 인증 그래머. IETF "Payment" 스킴이 이 자리다[^s01].
- **extensions (method-specific)** — Tempo 스테이블코인, Stripe SPT, Stellar SEP-41 같은 방식별 사양. `mpp-specs` 리포는 이를 "payment-method agnostic core alongside extensions for specific payment method flows"로 명시한다[^s02].

이 2계층 구조 덕에 제3자(예: Visa)가 카드 기반 method spec을 독립적으로 추가할 수 있다 — 본 보고서가 MPP의 가장 중요한 설계 결정으로 보는 지점이다 _(interpretive)_[^s01][^s02].

## 2. "Payment" HTTP Authentication Scheme (draft)

### 2.1 저자·거버넌스·라이선스

기반 표준은 IETF `draft-ryan-httpauth-payment-01`이며 저자는 Tempo Labs의 Brendan Ryan·Jake Moxey·Tom Meagher와 Stripe의 Jeff Weinstein·Steve Kaliski다[^s01]. 사양 본문은 CC0 1.0(퍼블릭 도메인), 도구는 Apache-2.0/MIT 듀얼로 `tempoxyz/mpp-specs`에 호스팅된다[^s02].

### 2.2 `WWW-Authenticate: Payment` 그래머

서버가 결제를 요구할 때 보내는 챌린지는 다음 파라미터를 가진다[^s01].

| 파라미터 | 필수 | 의미 |
|---|---|---|
| `id` | ✓ | 파라미터에 바인딩된 챌린지 식별자 |
| `realm` | ✓ | RFC 9110 보호 공간 |
| `method` | ✓ | 결제 방식 식별자(소문자 ASCII) |
| `intent` | ✓ | 등록된 결제 인텐트 타입 |
| `request` | ✓ | method별 데이터(JCS 직렬화 후 base64url JSON) |
| `expires` | ✗ | RFC 3339 만료 시각 |
| `digest` | ✗ | RFC 9530 content digest(요청 본문 바인딩) |
| `description` | ✗ | 사람이 읽는 결제 목적 |
| `opaque` | ✗ | 서버 상관 데이터(base64url JSON 문자열 맵) |

사양은 "Unknown parameters MUST be ignored by clients"를 명시한다[^s01]. 중요한 점은 **한 응답에 여러 줄의 `WWW-Authenticate: Payment`** 가 올 수 있다는 것이다 — 즉 서버가 Tempo와 Stripe를 동시에 제시하고 클라이언트가 하나를 골라 결제한다[^s07].

### 2.3 `Authorization: Payment` credential 구조

클라이언트가 결제 후 재요청에 싣는 credential은 base64url JSON으로 세 필드를 담는다[^s01].

```json
{
  "challenge": { "id": "...", "realm": "...", "method": "...", "intent": "...", "request": "...", "expires": "...", "opaque": "...", "digest": "..." },
  "source": "did:key:...",
  "payload": { }
}
```

- `challenge` — 서버가 보낸 챌린지를 그대로 에코.
- `source` — (선택) W3C DID 형식의 결제 출처.
- `payload` — method별 결제 증명(예: Tempo면 EIP-712 서명, Stripe면 SPT).

### 2.4 `Payment-Receipt` 헤더

성공(2xx) 응답에만 receipt가 발급된다 — "Receipts are only issued on successful payment responses (2xx status codes)"[^s01]. 형식은 `status`, `method`, `timestamp`, `reference`를 담은 JSON이다[^s01].

### 2.5 상태 코드와 problem 레지스트리

MPP는 세 상태 코드를 의도적으로 분리한다 — "402 = Payment barrier (initial challenge or retry needed); 401 = Authentication failure unrelated to payment; 403 = Payment succeeded but access denied by policy"[^s04]. 실패는 RFC 9457 Problem Details(`application/problem+json`)로 반환되고, 레지스트리 base는 `https://paymentauth.org/problems/`다 — `payment-required`, `payment-insufficient`, `payment-expired`, `verification-failed`, `method-unsupported`, `malformed-credential`, `invalid-challenge` 같은 타입을 정의한다[^s01]. credential이 깨지거나(만료·재사용 포함) 검증이 실패하면 항상 **새 챌린지를 동봉한 402**가 돌아온다[^s01].

보안 요건으로 사양은 TLS 1.2 이상을 강제하고("Servers MUST NOT issue Payment challenges over unencrypted HTTP"), credential을 로그·에러·분석에 남기는 것을 금지한다("Servers and intermediaries MUST NOT log Payment credentials")[^s01].

### 2.6 intent / method 레지스트리

intent와 method는 각각 별도 레지스트리다. method spec은 (1) 식별자(소문자 ASCII) (2) `request` 파라미터의 JSON 스키마 (3) credential `payload`의 JSON 스키마 (4) 검증 절차를 정의해야 한다[^s04]. 이 4요소가 method extension의 계약이다.

## 3. Intents — 결제 패턴

### 3.1 charge — 단건 결제

가장 단순한 인텐트다. mpp.dev/intents/charge는 7단계 흐름(요청 → 402 챌린지 → 결제 → credential 재요청 → 검증·정산 → 네트워크 확정 → resource + receipt)을 정의한다[^s05]. request 스키마는 다음과 같다[^s05].

| 필드 | 타입 | 필수 |
|---|---|---|
| `amount` | string | ✓ |
| `currency` | string | ✓ |
| `description` | string | ✗ |
| `expires` | string | ✗ |
| `externalId` | string | ✗ |
| `recipient` | string | ✗ |

method별 추가 필드는 `methodDetails`로 확장된다 — "Payment methods extend this schema with method-specific fields through methodDetails"[^s05]. charge는 "단일 결제로 비용이 미리 알려진" 시나리오(유료 API, 콘텐츠 접근, tool call)에 맞고, 고빈도·미터링은 session을 권한다[^s05].

### 3.2 session — 스트리밍 채널 결제

session은 연속 활동을 위한 오프체인 결제 채널이다. 흐름은 (1) 에스크로 컨트랙트에 디포짓해 채널 개설 → (2) 매 요청마다 온체인 트랜잭션 대신 서명된 누적 voucher 발행 → (3) 서버가 누적 voucher를 주기적으로 온체인 정산 → (4) 채널 종료 시 미사용 디포짓 환불이다[^s04][^s08][^s09]. Cloudflare의 한 줄 — "Session — A streaming payment over a payment channel. Use for pay-as-you-go or per-token billing with sub-cent costs and sub-millisecond latency"[^s08]. session의 메커니즘 상세(TempoStreamChannel, channelId 파생, EIP-712 voucher 구조)는 자매 보고서 [`mpp-session-mechanism`](../mpp-session-mechanism/)에 정리되어 있다. (본 보고서 작성 시점에 `mpp.dev/intents/session` 페이지가 404였으므로 session 필드는 2차 자료로 재구성했다 — `gaps.md` 참조.)

### 3.3 subscription — 정기 결제

subscription은 한 번의 권한 부여로 주기당 최대 1회 과금하는 인텐트다 — "The client authorizes a fixed payment amount once, and the server reuses that authorization to collect at most one charge per billing period"[^s06]. request 스키마는 `amount`, `currency`, `periodCount`, `periodUnit`(day/week/month) 필수 + `description`/`externalId`/`methodDetails`/`recipient`/`subscriptionExpires` 선택이다[^s06]. 서버는 첫 주기 과금 후 receipt에 `subscriptionId`를 담아 돌려주고 이후 주기에 재사용한다. 다만 사양은 "a subscriptionId alone doesn't grant access"를 명시한다 — 서버는 세션/계정 컨텍스트를 추가로 적용해야 한다[^s06].

## 4. Payment Methods — 결제 방식

mpp.dev와 Cloudflare 문서가 열거하는 결제 방식은 **Tempo, Stripe, Lightning, Solana, Stellar(SEP-41), Monad, RedotPay, Card, Custom**이다[^s03][^s08].

### 4.1 Tempo — 스테이블코인

Tempo는 sub-second 확정의 스테이블코인 결제 방식이다[^s08]. charge에서는 on-chain 이체로, session에서는 EIP-712 누적 voucher로 동작한다. session에서 서버는 ecrecover로 voucher를 검증하므로 RPC 호출 없이 sub-100ms 검증을 달성하고, 마이크로결제 단가는 요청당 $0.0001까지 내려간다 — "Agents deposit funds into an escrow contract (roughly 500ms setup time), then issue cumulative EIP-712 signed vouchers with each subsequent request"[^s09]. 잔액이 mid-stream에 소진되면 서버가 `payment-need-voucher` 이벤트를 내고 클라이언트가 새 voucher를 자동 서명한다[^s15].

### 4.2 Stripe — SPT / card / wallet / fiat

Stripe method는 두 갈래다[^s07].

- **crypto** — Tempo 네트워크(testnet/mainnet)에서 on-chain 이체. "Direct on-chain payment that uses crypto deposit addresses."
- **fiat (SPT)** — Shared Payment Token으로 카드·지갑·기타 fiat 결제를 지원한다. "Card, wallet, and other payment methods that shared payment tokens (SPTs) support"[^s07]. SPT는 결제 자격증명을 노출하지 않고 결제를 트리거한다[^s13].

### 4.3 Stellar — SEP-41 + Soroban ed25519 채널

Stellar method는 session을 Soroban 컨트랙트로 구현한다[^s10]. (1) 클라이언트가 ed25519 commitment 키와 USDC 디포짓으로 채널 개설 → (2) 매 요청마다 챌린지(`channel: C..., amount, cumulativeAmount, network, reference`)를 받아 `prepare_commitment`를 read-only 시뮬레이션하고 commitment bytes를 ed25519로 로컬 서명 → (3) 서버가 `Keypair.verify()`로 로컬 검증하고 누적값을 갱신 → (4) 종료 시 가장 높은 누적 commitment 하나로 단일 온체인 정산이다 — "The server closes the channel by submitting one on-chain transaction with the highest cumulative commitment and signature"[^s10]. 즉 Tempo가 EVM의 EIP-712 + ecrecover를 쓴다면 Stellar는 Soroban의 ed25519 + Keypair.verify()를 쓰는, 같은 추상의 체인별 변형이다.

### 4.4 Solana / Lightning / Card / Monad / RedotPay

이들은 같은 method extension 계약(식별자 + request/payload 스키마 + 검증 절차)을 따르되 결제 레일만 다르다 — Solana는 SDK가 먼저 나오고 spec이 후행, Lightning은 Bitcoin Lightning invoice, Card는 암호화된 network token 결제다[^s08][^s09].

## 5. Per-flow walkthrough — 헤더 단위 추적

### 5.1 charge × tempo + stripe 동시 제시 (Stripe `mppx`)

Stripe의 MPP 서버 SDK(`mppx`)는 `Mppx.create`로 method를 등록하고 `Mppx.compose`로 한 라우트에 여러 method를 동시에 건다[^s07].

```ts
import { Mppx, stripe, tempo } from 'mppx/server';

const mppx = Mppx.create({
  methods: [
    tempo.charge({ currency: PATH_USD, recipient: recipientAddress, testnet: true }),
    stripe.charge({ client: stripeClient, networkId: process.env.STRIPE_PROFILE_ID!, paymentMethodTypes: ['card', 'link'] }),
  ],
  secretKey: mppSecretKey,
});

const response = await Mppx.compose(
  mppx.tempo.charge({ amount: '0.01', recipient: recipientAddress }),
  mppx.stripe.charge({ amount: '0.50', currency: 'usd' }),
)(request);

if (response.status === 402) return response.challenge;
return response.withReceipt(Response.json({ data: '...' }));
```

이때 402 응답은 두 줄의 챌린지를 동시에 싣는다[^s07].

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment id="chal_abc123", method="tempo", intent="charge", ...
WWW-Authenticate: Payment id="chal_def456", method="stripe", intent="charge", ...
Content-Type: application/problem+json
Cache-Control: no-store

{ "type": "https://paymentauth.org/problems/payment-required", "title": "Payment Required", "status": 402, "challengeId": "..." }
```

클라이언트(에이전트)는 둘 중 하나를 골라 결제하고, 고른 method의 credential을 `Authorization: Payment`로 재전송한다. Stripe 측은 이 기능에 `2026-03-04.preview` API 버전을 요구하며, mainnet 전환은 `testnet: true` 제거 + 라이브 `profile_` networkId 설정으로 이뤄진다[^s07].

### 5.2 charge × tempo crypto PaymentIntent

crypto 경로에서 Stripe PaymentIntent는 `crypto_display_details`로 Tempo 디포짓 주소와 지원 토큰을 돌려준다[^s07].

```json
{ "id": "pi_123", "status": "requires_action",
  "next_action": { "type": "crypto_display_details",
    "crypto_display_details": { "deposit_addresses": {
      "tempo": { "address": "0xtempo_address", "supported_tokens": [{ "token_currency": "usdc", "token_contract_address": "0x…" }] } } } } }
```

### 5.3 session × Stellar (Soroban)

Stellar session은 `@stellar/mpp/channel/server`(서명 검증 + 누적 추적)와 `@stellar/mpp/channel/client`(자동 ed25519 서명, 402 투명 처리)로 구성된다[^s10]. 서버는 in-memory store로 누적 commitment를 추적하다가 종료 시 한 번의 온체인 트랜잭션으로 정산한다 — charge가 요청당 1회 정산이라면 session은 N요청 → 1정산이라는 점이 핵심 차이다[^s10].

## 6. 논의 — 설계 관찰

### 6.1 2계층 구조의 의미

MPP의 가장 중요한 설계 결정은 **core(IETF draft) + method extension(별도 spec)** 의 분리다[^s01][^s02]. core는 결제 방식과 무관한 HTTP 그래머만 정의하고, 방식별 차이는 method spec의 4요소 계약(식별자·request schema·payload schema·검증 절차)으로 흡수한다[^s04]. 덕분에 Tempo(EIP-712), Stellar(ed25519), Stripe(SPT), card(network token)가 같은 `WWW-Authenticate: Payment` 줄 안에서 공존하고, 한 서버가 여러 method를 동시에 제시할 수 있다[^s07] _(interpretive)_. 각 method spec은 `mpp-specs` 리포의 `methods/` 디렉토리에 별도 파일로 관리된다[^s14].

### 6.2 intent × method 직교성

intent(무엇을 결제하는가 — 단건/스트리밍/정기)와 method(어떤 레일로 결제하는가)는 직교한다. 같은 `charge` intent가 tempo·stripe·stellar 어느 method로도 실행되고, 같은 tempo method가 charge·session 어느 intent로도 동작한다. 이 직교성이 레지스트리를 둘로 나눈 이유다[^s04][^s07].

### 6.3 SDK 생태계

MPP는 TypeScript(`mppx`), Python(`pympp`), Rust(`mpp-rs`) 세 SDK와 Hono·Express·Next.js·Elysia 미들웨어를 제공한다[^s08]. 서버는 미들웨어 한 겹으로 402 발행·credential 검증·receipt 부착을 처리하고, 클라이언트는 글로벌 fetch가 402를 투명하게 처리하도록 패치된다.

### 6.4 x402와의 관계

MPP의 session intent와 x402의 batch-settlement 스킴은 같은 "오프체인 누적 voucher + 배치 정산" 추상을 공유하지만 트래픽 형상이 다르다 — 두 표준의 head-to-head 비교는 자매 보고서 [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/)에 정리되어 있다.

## 7. 한계

- 본 보고서는 2026년 5월 27일 시점의 1차 사양·docs를 기준으로 한다. `draft-ryan-httpauth-payment-01`은 개정될 수 있고, 필드명은 후속 리비전에서 바뀔 수 있다.
- `mpp.dev/intents/session` 페이지가 fetch 시점에 404였으므로, session intent의 필드 상세는 mpp.dev/protocol[^s04], Cloudflare[^s08], Formo[^s09], Stellar 가이드[^s10]와 자매 보고서로 재구성했다.
- 결제 방식 중 Tempo·Stripe·Stellar만 플로우 수준으로 다뤘고, Solana·Lightning·Card·Monad·RedotPay의 request/payload JSON 스키마는 본 보고서 범위 밖이다.
- `paymentauth.org`의 charge intent sub-spec(`draft-payment-intent-charge-00`)과 mpp-specs의 methods 디렉토리 파일 목록은 URL로만 참조하고 본문을 직접 인용하지 않았다.
- "sub-100ms / $0.0001" 같은 수치는 explainer가 제시한 값이며 독립 벤치마크를 거치지 않았다 — `uncertainties.md`에 명시[^s09].
