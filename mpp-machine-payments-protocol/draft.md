# MPP (Machine Payments Protocol) 상세 분석 — mpp.dev/protocol 문서 기준

## 초록

Machine Payments Protocol(MPP)은 그동안 사실상 쓰이지 않던 HTTP `402 Payment Required` 상태 코드를 표준화하여, 에이전트·앱·서비스가 **하나의 HTTP 요청 안에서** 결제를 주고받게 만드는 개방형 기계 간(machine-to-machine) 결제 프로토콜이다[^s01][^s17]. MPP는 Tempo와 Stripe가 공동 개발했으며, 그 핵심은 IETF 인터넷 드래프트 `draft-ryan-httpauth-payment-01`로 제출된 "Payment" HTTP 인증 스킴이다[^s17][^s20]. 본 보고서는 `mpp.dev/protocol` 경로 아래의 1차 문서를 기준으로 MPP의 **Challenge·Credential·Receipt** 핵심 플로우, 세 가지 인텐트(charge·session·subscription), 세 가지 트랜스포트(HTTP·MCP/JSON-RPC·WebSocket), 결제 레일 매트릭스, 그리고 discovery·identity·refunds·security 고급 기능을 분석한다. 또한 IETF 드래프트·사양 저장소·외부 채택 사례를 교차 검증하여, MPP가 기술적으로 무엇을 정의하는지와 동시에 표준 지위·생태계 성숙도 측면에서 어디까지 와 있는지를 정직하게 구분한다.

## 서론 — 배경과 동기

웹 결제는 사람을 위해 최적화되어 있다. 리치 체크아웃 화면, 브라우저 자동화, 시각적 확인 절차는 사람 구매자에게는 친숙하고 빠르지만, 프로그램적 소비(programmatic consumption)에는 구조적 역풍이 된다 — MPP 문서는 이를 두고 "사람 구매자에게 결제 흐름을 친숙하고 빠르게 만드는 바로 그 요소들이 프로그램적 소비에는 구조적 역풍"이라고 표현한다[^s17]. AI 에이전트가 API 호출·도구 실행·콘텐츠 접근의 대가를 자율적으로 지불하려면, API 키 발급이나 구독 계약 같은 사전 협상 없이 요청-응답 한 번 안에서 결제가 끝나야 한다[^s24].

MPP는 이 빈틈을 메우기 위해 HTTP가 원래 예약해 두었던 `402 Payment Required`를 인증(authentication) 문제로 재해석한다. 서버는 "결제가 필요하다"는 도전(Challenge)을 보내고, 클라이언트는 결제 증명(Credential)으로 응답하며, 서버는 영수증(Receipt)을 돌려준다[^s01][^s18]. 본 보고서의 범위는 `mpp.dev/protocol` 하위 문서를 1차 근거로 삼되, IETF 드래프트(`datatracker`), 공개 사양 저장소(`tempoxyz/mpp-specs`), 그리고 Cloudflare·Parallel·Stripe 등 외부 채택·해설 자료로 교차 검증하는 것이다.

## 배경 — HTTP 402와 "Payment" 인증 스킴

MPP의 토대는 HTTP `402 Payment Required`다. MPP 서비스는 보호된 리소스에 결제가 필요함을 알리기 위해 이 상태 코드를 반환한다[^s02]. 그러나 402 자체는 본문이 비어 있는 빈 껍데기였고, MPP의 실질적 핵심은 이를 채우는 **"Payment" HTTP 인증 스킴**이다. 이 스킴은 IETF 인터넷 드래프트 `draft-ryan-httpauth-payment-01`로 정의되며, "HTTP 리소스가 접근 전에 결제 도전의 충족을 요구할 수 있게 하는 'Payment' HTTP 인증 스킴을 정의한다"고 명시한다[^s20]. 저자는 Tempo Labs의 Brendan Ryan·Jake Moxey·Tom Meagher와 Stripe의 Jeff Weinstein·Steve Kaliski다[^s20].

이 프로토콜은 **Tempo와 Stripe가 공동 개발**했으며, SDK는 Tempo Labs와 Wevm이 유지한다[^s17]. 사양은 `github.com/tempoxyz/mpp-specs`에 공개되어 있고 Core·Intents·Methods·Extensions의 모듈식 구조를 가지며, 사양 문서는 CC0 1.0(퍼블릭 도메인), 도구는 Apache-2.0/MIT 라이선스다[^s19]. 다만 표준 지위는 아직 잠정적이다. 해당 인터넷 드래프트는 스스로 "이 I-D는 IETF의 승인을 받지 않았으며 IETF 표준화 과정에서 어떠한 공식적 지위도 갖지 않는다"고 밝히고 있고, 만료일은 2026년 9월 19일이다[^s20]. 즉 MPP는 "IETF에 제안된 개방형 사양"[^s17]일 뿐, 아직 인준된 표준이 아니다 _(vendor-stated)_.

## 핵심 프로토콜 — Challenge · Credential · Receipt

MPP의 작동은 세 가지 객체의 왕복으로 환원된다.

**Challenge(도전).** 서버는 `402` 응답에 `WWW-Authenticate: Payment` 헤더를 실어 결제 요건을 전달한다. 헤더는 `id`(도전 식별자), `realm`(보호 영역), `method`(결제 방식, 예: `tempo`), `intent`(결제 유형, 예: `charge`), `request`(결제 세부 정보)를 담는다[^s02][^s03]. 예시는 다음과 같다[^s02]:

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment id="abc123",
    realm="mpp.dev", method="tempo", intent="charge", request="eyJ..."
```

`request`와 선택적 `opaque` 파라미터는 base64url로 인코딩된 JCS(JSON Canonicalization Scheme) JSON이다[^s03][^s06]. 디코딩하면 `amount`·`currency`·`recipient` 같은 방식별 결제 정보가 들어 있다[^s03]. 보안의 핵심은 도전 `id`가 도전 파라미터에 **암호학적으로 바인딩**된다는 점이다. 바인딩은 통상 `realm | method | intent | request | expires | digest | opaque`를 HMAC으로 묶어, 클라이언트가 조건을 바꿔치기해 크리덴셜을 재사용하지 못하게 한다[^s03][^s15]. 서버는 한 번의 402 응답에 여러 Challenge를 실어 클라이언트가 선호하는 결제 방식을 고르게 할 수 있다[^s03] — Stripe 문서의 실제 예시에서도 `tempo`와 `stripe` 두 개의 `WWW-Authenticate: Payment` 헤더가 동시에 제시된다[^s18].

**Credential(크리덴셜).** 클라이언트는 `Authorization: Payment <base64url 크리덴셜>` 헤더로 응답한다[^s04]. 크리덴셜은 세 부분으로 구성된다: 서버가 보낸 Challenge를 원래 와이어 값 그대로 되돌려 echo한 `challenge`, 지불자 신원을 나타내는 `source`(주소·DID·계정 ID), 그리고 방식별 결제 증명인 `payload`다[^s04]. Tempo charge의 경우 payload는 `transaction`(non-zero, pull 모드), `hash`(non-zero, push 모드), `proof`(0원 신원 검증) 세 가지 변형을 가진다[^s04]. 재사용 방지는 엄격하다: "각 크리덴셜은 정확히 한 번의 요청에만 유효하며" 서버는 재생(replay)된 크리덴셜을 거부해야 한다[^s04].

**Receipt(영수증).** 결제가 성공하면 서버는 `Payment-Receipt` 헤더에 base64url JSON 영수증을 실어 돌려줄 수 있다. 필드는 `challengeId`·`method`·`reference`(트랜잭션 해시 또는 인보이스 ID)·`settlement`(실제 정산 금액·통화)·`status`·`timestamp`다[^s05]. 다만 이 헤더는 **선택 사항**이며, 문서는 "서버는 보통 감사를 위해 포함하지만, 클라이언트는 올바른 동작을 위해 영수증이 필요하지 않다"고 명시한다[^s05].

결제 실패는 조용히 끝나지 않는다. 실패한 결제 시도는 새 Challenge와 Problem Details 본문을 담은 `402`로 되돌아오며, 오류 유형에는 `invalid-challenge`·`malformed-credential`·`payment-expired`·`verification-failed`가 있다[^s02]. 또한 토큰 인증과 결제 인증이 함께 적용될 때 서버는 토큰을 먼저 검증하고, 토큰 검증이 실패하면 `401`을 반환하여 결제 요건이 미인증 클라이언트에 노출되지 않도록 한다[^s02].

### 트랜스포트 — 같은 모델, 세 가지 전송 방식

MPP는 동일한 Challenge·Credential·Receipt 모델을 세 가지 트랜스포트에 바인딩한다[^s06][^s07][^s08].

| 요소 | HTTP | MCP/JSON-RPC | WebSocket |
|------|------|--------------|-----------|
| Challenge | `WWW-Authenticate: Payment` 헤더[^s06] | 에러 코드 `-32042` + `data.challenges`[^s07] | `mpp` 디스크리미네이터 메시지[^s08] |
| Credential | `Authorization: Payment` 헤더[^s06] | `_meta`의 `org.paymentauth/credential`[^s07] | `authorization` 메시지[^s08] |
| Receipt | `Payment-Receipt` 헤더[^s06] | `_meta`의 `org.paymentauth/receipt`[^s07] | `payment-receipt` 메시지[^s08] |

HTTP 트랜스포트는 RFC 9110 표준 헤더 세 개를 그대로 활용한다[^s06]. MCP/JSON-RPC 트랜스포트는 도전을 JSON-RPC 에러 코드 `-32042`("Payment Required")로 전달하고, 크리덴셜·영수증을 도구 호출의 `_meta` 필드에 네이티브 JSON으로 실어 기존 MCP 도구 호출 워크플로 안에 결제를 끼워 넣는다[^s07]. WebSocket 트랜스포트는 지속 연결에서 결제 메시지를 **인밴드(in-band)**로 교환한다 — "클라이언트와 서버가 결제 메시지를 인밴드로 교환하므로 바우처 충전을 위한 별도 요청이 필요 없다." 채널 잔액이 소진되면 서버가 `payment-need-voucher`를 보내고 클라이언트가 새 `authorization`으로 즉시 충전하므로, SSE 방식이 요구하는 별도 HTTP 왕복 오버헤드를 없앤다. 이 때문에 WebSocket은 고빈도 미터링(metering)에 적합하다[^s08].

## 인텐트와 결제 레일 — 결제 패턴과 그 위의 네트워크

MPP는 세 가지 핵심 **인텐트**로 결제 패턴을 추상화한다: charge(일회성), session(사용량 기반/채널), subscription(반복)[^s17].

**Charge — 일회성 결제.** charge는 "즉각적인 일회성 결제"로, 클라이언트가 고정 금액을 지불하고 서버가 응답 전에 트랜잭션을 정산한다[^s09]. 요청 스키마는 `amount`·`currency`(필수)와 `description`·`expires`·`externalId`(멱등성 키)·`recipient`(선택)를 가지며, Tempo 통합은 `methodDetails`로 `chainId`·`feePayer`를 더한다[^s09]. 플로우는 위의 Challenge→Credential→Receipt 그대로다: 402 수신 → 네트워크에서 결제 이행 → 크리덴셜로 재시도 → 검증·정산 → 200 + 영수증[^s09].

**Session — 사용량 기반 결제(아키텍처적 차별점).** session 인텐트는 페이먼트 채널을 통한 pay-as-you-go 결제다[^s17]. 독립 해설에 따르면, 에이전트는 에스크로 컨트랙트에 자금을 예치하고(약 500ms 설정 시간) 이후 매 요청마다 **누적 EIP-712 서명 바우처**를 발행한다. 서버는 RPC 호출이나 DB 조회 없이 `ecrecover`만으로 바우처를 검증하므로 sub-100ms 지연이 가능하고, 요청당 $0.0001 수준의 마이크로결제가 세션 종료 시 단일 온체인 트랜잭션으로 일괄 정산된다[^s22] _(독립 해설 기반, 일부 세부는 vendor-stated)_. 1차 문서 측면에서는 Tempo 방식이 "페이먼트 채널을 통한 near-zero 지연의 Session"을 광고하고[^s16], WebSocket 트랜스포트가 인밴드 바우처 충전 메커니즘을 정의함으로써 이를 뒷받침한다[^s08]. 참고로 `mpp.dev/intents/session` 전용 페이지는 2026-06-03 접근 시 404를 반환하여, 세션 메커니즘은 인접 문서들로부터 재구성했다(한계 절 참조).

**Subscription — 반복 결제.** subscription은 "반복 유료 접근을 매개"한다. 클라이언트가 고정 금액을 한 번 승인하면 서버는 그 승인을 재사용해 "청구 주기당 최대 한 번" 청구한다[^s10]. 필드는 `amount`·`currency`·`periodCount`(양의 정수 배수)·`periodUnit`(`day`/`week`/`month`)이며 `subscriptionExpires`(RFC 3339)가 선택 사항이다[^s10]. 생애주기는 활성화(첫 주기 즉시 청구, 이후 `subscriptionId` 포함 영수증 반환) → 갱신(주기마다 한 번 청구, 미납 주기엔 접근 전 청구 또는 402) → 재사용(서버가 인증 세션·계정 신원·리소스 범위 등 로컬 셀렉터로 후속 요청을 활성 구독에 연결하며, `subscriptionId`만으로 키잉하지 않음)으로 구성된다[^s10].

**결제 레일 매트릭스.** MPP는 다수의 결제 방식을 제공하지만, 인텐트 지원 범위는 레일마다 다르다[^s11]:

| 방식 | 지원 인텐트 | 레일 특성 |
|------|-------------|-----------|
| Tempo | charge·session·subscription | TIP-20 스테이블코인, 오프체인 바우처[^s11][^s16] |
| EVM | charge | 스테이블코인, x402 exact 플로우[^s11] |
| Stripe | charge | Shared Payment Tokens, 카드·월렛[^s11][^s18] |
| Card | charge | 암호화 네트워크 토큰(Visa·Mastercard 등)[^s11] |
| Lightning | charge·session | BOLT11 인보이스, 선불 세션[^s11] |
| Solana | charge | SOL·SPL 토큰 서명 트랜잭션[^s11] |
| Stellar | charge·session/channel | SEP-41 토큰, 채널 기반 세션[^s11] |
| Monad | charge | ERC-20, push·pull 정산[^s11] |
| RedotPay | charge | 잔액 또는 스테이블코인 레일[^s11] |
| Custom | (정의 가능) | 요청 스키마·크리덴셜·검증 로직 전부 커스텀[^s11] |

즉 session/채널을 광고하는 레일은 Tempo·Lightning·Stellar뿐이고, 나머지는 대부분 charge 전용이다[^s11] _(unverified — single source)_. **Tempo가 사실상의 기준 레일**이다: TIP-20 스테이블코인을 쓰고 "트랜잭션이 ~500ms에 결정적 확정으로 정산"되며, 서버가 `feePayer` 계정을 지정해 가스를 대납하면 클라이언트는 가스 토큰 없이 서명만으로 결제할 수 있다. 2D 논스로 동시 트랜잭션도 지원한다[^s16].

## 고급 기능 — discovery · identity · refunds · security

**Discovery(사전 발견).** 클라이언트는 `/openapi.json`에 제공되는 표준 **OpenAPI 3.1** 문서로 결제 조건을 미리 알 수 있다. 이는 자문(advisory) 계층이며 런타임 402 Challenge가 여전히 권위를 가진다[^s12]. 결제 정보는 두 확장으로 전달된다: 결제가 필요한 오퍼레이션에 붙는 `x-payment-info`(amount·currency·intent·method 등을 담은 `offers` 배열)와, 루트 레벨의 선택적 메타데이터 `x-service-info`(categories·docs)[^s12].

**Identity(자금 이동 없는 접근 제어).** MPP는 모든 크리덴셜의 `source` 필드에 신원을 심어, 결제 없이도 신원 기반 접근 제어를 가능케 한다[^s13]. 서버가 `amount: 0` Challenge를 발급하면 클라이언트는 키 소유를 증명하는 `proof` 메시지에 서명하고("클라이언트가 Challenge에 서명해 키 소유를 증명한다. 온체인 자금 이동은 없다"), 서버는 0원 Challenge에 대해 `transaction`·`hash` payload를 거부하고 `proof`를 요구한다[^s13]. 다만 기본값에서는 "유효한 0원 proof가 Challenge 만료까지 재사용 가능"하므로, 단일 사용 강제(예: `store` 파라미터)가 없으면 프로덕션 신원/접근 제어에는 명시적 재생 방지가 필요하다[^s13][^s15]. 활용 사례로는 장기 작업의 0원 상태 폴링, 1회 결제 후 동일 신원의 무료 재접근, 멀티스텝 에이전트 워크플로의 단계 간 신원 일치 검증이 있다[^s13].

**Refunds(환불).** charge 플로우의 환불은 **프로토콜 외부**에서 일어난다 — 서버가 크리덴셜 `source` 주소로 직접 자금을 되돌려 보내며, 시점·트리거는 전적으로 서비스 로직에 달려 있다[^s14]. 반면 session은 미청구 예치금에 대해 **자동 환불**을 구현한다: 서버가 만료 후 청구하지 않으면 잠긴 자금이 클라이언트로 자동 반환된다. 서버가 최종 바우처로 `session.close()`를 호출해 청구분을 정산하면 잔여 자금이 자동 반환되고, 서버가 응답하지 않으면 클라이언트가 유예 기간 후 `requestClose()`·`withdraw()`로 독립적으로 회수할 수 있다[^s14].

**Security(보안 모델).** MPP 보안의 중심은 `MPP_SECRET_KEY` 보호다. 문서는 "공격자가 키를 얻으면 당신의 realm에 대해 서버가 발급한 것처럼 보이는 Challenge를 발행할 수 있다"고 경고한다 — 즉 전체 신뢰 모델이 HMAC 기반 Challenge ID에 묶여 있다[^s15]. 주요 지침은 다음과 같다[^s15]:

- **본문 무결성**: 변경 요청(POST·PUT·PATCH)에는 `digest` 파라미터를 포함해 클라이언트가 Challenge 수령 후 페이로드를 바꾸지 못하게 한다.
- **재생 방지**: 서버가 여러 인스턴스로 돌면 프로세스 로컬 메모리가 아니라 공유 원자적 저장소를 써야 한다. 0원 proof 플로우는 프로덕션 신원/접근 제어에 쓰기 전 명시적 재생 방지가 필요하다.
- **비밀 취급**: `Authorization: Payment`·`Payment-Receipt` 헤더를 로그·에러 메시지·트레이스에 남기지 않는다. 402 응답에는 `Cache-Control: no-store`, 영수증 포함 성공 응답에는 `Cache-Control: private`을 적용한다.
- **키 관리**: `MPP_SECRET_KEY`는 신뢰된 서버에만 두고 브라우저·앱·프론트엔드 번들에 넣지 않으며, 관리형 시크릿 스토어(AWS Secrets Manager, HashiCorp Vault 등)에서 주입하고 겹침 윈도우를 둔 회전을 구현한다.

## 분석 — x402 대비 포지셔닝, 성숙도, 채택

**x402와의 관계.** MPP는 x402와 경쟁이 아니라 **호환**으로 자리매김한다. Cloudflare는 "MPP 클라이언트가 기존 x402 서비스를 수정 없이 소비할 수 있다"고 명시하며, TypeScript·Python·Rust 3개 언어의 공식 SDK를 제공한다[^s21]. 다만 설계 철학에는 분명한 차이가 있다. 독립 해설에 따르면 MPP의 세션은 **결제 기반**(에스크로 예치 → 서명 바우처 스트리밍 → 일괄 정산)인 반면, x402의 SIWx 확장은 **인증 기반**(지갑 소유 증명 → JWT 수령)으로, 서로 다른 문제를 푼다[^s22] _(interpretive)_. 즉 MPP는 "지속적 결제 스트림"을, x402 계열은 "인증된 세션 토큰"을 지향한다.

**채택 신호.** 외부 채택은 초기 단계이되 실재한다. Stripe는 Shared Payment Tokens로 카드·월렛 결제를 MPP에 연결하고(미국 법인 사업자 한정), 유효한 SPT 크리덴셜 수신 시 서버가 자동으로 `PaymentIntent`를 생성한다[^s18]. Cloudflare는 Agents 플랫폼에 MPP를 편입해 3개 언어 SDK를 제공하고[^s21], Parallel은 Tempo+MPP 통합을 문서화한다[^s23]. 그러나 **상업적 거래량은 사실상 미미하다.** 한 독립 분석은 "어느 프로토콜도 아직 의미 있는 상업적 거래량이 없다"며, MPP가 2026년 3월 말 기준 약 31,100건·약 $3,730의 거래량을 기록했다고 보고하되 이를 "미검증, 2주 경과"로 명시한다[^s22] _(unverified — single source)_. 파트너 발표와 프로덕션 채택은 별개라는 경고다.

종합하면, MPP는 **기술적으로는 잘 정의된** 402 기반 결제 인증 프레임워크다 — Challenge·Credential·Receipt라는 단순한 3객체 모델을 세 트랜스포트와 다수 레일에 일관되게 매핑하고, 세션 채널로 마이크로결제를, identity 확장으로 자금 없는 접근 제어를 지원한다. 동시에 **표준·생태계 측면에서는 초기**다: IETF 인준 전이고, 프로토콜·핵심 레일·핵심 결제 방식이 모두 두 공동 저자에서 나오며, 실거래량은 자가 보고 수준에 머문다.

## 한계 (Limitations)

- **전용 session 사양 페이지 부재.** `mpp.dev/intents/session`은 2026-06-03 접근 시 404였다. 세션 메커니즘(바우처·에스크로·정산)은 WebSocket 트랜스포트[^s08], Tempo 방식[^s16], 환불[^s14], 결제 방식 목록[^s11], 그리고 독립 해설[^s22]에서 재구성한 것으로, 1차 사양 페이지를 직접 읽어 확정하지 못했다.
- **MPP vs x402 캐노니컬 페이지 부재.** `mpp.dev/comparison/mpp-vs-x402` 역시 404였다. x402 비교는 Cloudflare[^s21]와 독립 해설[^s22]에 의존한다.
- **EIP-712/ecrecover 세부의 간접 근거.** 세션의 EIP-712 바우처·`ecrecover` 검증·sub-100ms 수치는 주로 독립 해설[^s22]에서 왔고, 1차 문서는 "채널·near-zero 지연"[^s08][^s16] 수준의 간접 확인에 그친다.
- **거래량 수치의 단일·미검증 출처.** ~31,100건/~$3,730는 단일 출처이며 출처 스스로 미검증·2주 경과로 표시했다[^s22].
- **벤더 주도·감사 부재.** 프로토콜·Tempo 레일·Stripe SPT가 모두 공동 저자 측이며, 대부분의 "외부" 설명도 통합사·해설자다. 레퍼런스 구현에 대한 독립 보안 감사는 확인되지 않았다.
- **레일별 성숙도 편차.** 매트릭스가 광고하는 일부 레일(Monad, RedotPay, Stellar 채널)의 프로덕션 준비도는 독립적으로 검증하지 못했다.
