# draft-httpauth-payment-00 분석: "Payment" HTTP 인증 스킴

## 초록

`draft-httpauth-payment-00` "The 'Payment' HTTP Authentication Scheme"은 B. Ryan·J. Moxey·T. Meagher(Tempo Labs)와 J. Weinstein·S. Kaliski(Stripe)가 저자인 인터넷 드래프트로, 2026-06-03자(만료 2026-12-05)이며 Standards Track을 *의도*한다.[^s01] 이 문서는 Tempo의 **Machine Payments Protocol(MPP)** 의 **코어** — RFC 9110의 HTTP 인증을 확장해, 예약만 되고 정의되지 않았던 **HTTP 402 "Payment Required"** 에 의미를 부여하는 결제수단 불가지(agnostic) 인증 스킴이다.[^s01][^s02] 동작은 챌린지-응답이다: 서버가 `402` + `WWW-Authenticate: Payment`(id·realm·method·intent·request 등)로 챌린지하면, 클라이언트가 base64url JSON `{challenge, source, payload}`를 `Authorization: Payment`로 제출하고, 서버가 검증·정산 후 `Payment-Receipt`와 함께 자원을 반환한다.[^s01] 결제수단·의도는 **IANA "Specification Required" 레지스트리**로 등록되어 코어 변경 없이 확장되며, 보안 모델은 **HMAC-SHA256 챌린지 바인딩·단일사용 증명·멱등성·TLS 필수**를 중심으로 한다.[^s01] 다만 IETF datatracker는 이 문서를 워킹그룹 **미채택 개인 드래프트("IETF 미보증·공식 지위 없음")**로 분류하며, datatracker 버전·일자와 paymentauth.org 버전·일자가 불일치한다.[^s02][^s01] 생태계로는 두 프로덕션 메서드(Tempo=스테이블코인, Stripe=법정화폐), Cloudflare·Stripe 채택 신호, x402 하위 호환이 보고된다.[^s05][^s04][^s06]

## 1. 서론

본 보고서의 과업은 문서 `https://paymentauth.org/draft-httpauth-payment-00.txt`를 정독·분석하는 것이다. 메타데이터: 제목 "The 'Payment' HTTP Authentication Scheme", 저자 B. Ryan·J. Moxey·T. Meagher(Tempo Labs)·J. Weinstein·S. Kaliski(Stripe), 상태 Internet-Draft(Standards Track 의도), 일자 2026-06-03, 만료 2026-12-05.[^s01] 문서가 푸는 문제는 명확하다 — HTTP 402는 오래 *예약*만 되어 의미가 정의되지 않았는데, 이 스킴이 RFC 9110 HTTP 인증을 확장해 402에 표준적 의미(결제 챌린지 충족 후 접근 허용)를 부여한다.[^s01][^s02] 본 보고서는 앞서 분석한 EVM charge intent(`draft-evm-charge-00`)의 *상위 코어*인 이 문서를 정독하고, 프로토콜 개요 → 스킴 메커닉 → 레지스트리·협상 → 보안 모델 → IETF 지위·생태계 순으로 분석한다. 자료는 대상 드래프트(1차)와 IETF datatracker, 그리고 생태계 문서·독립 해설이다.[^s01][^s02][^s04][^s05][^s06]

## 2. 프로토콜 개요와 402의 위치

요청 흐름은 단순하다 — 클라이언트가 일반 요청을 보내면 서버가 402로 결제 요건을 알리고, 클라이언트가 결제 증명을 붙여 재시도하면 서버가 검증 후 자원을 반환한다.[^s01][^s06] 핵심 규범은 "서버는 결제가 필요하거나 결제 크리덴셜 검증이 **실패**할 때 402와 함께 `WWW-Authenticate: Payment` 헤더를 MUST 반환한다"는 것이다.[^s01]

여기서 일반 HTTP 인증과의 차이가 드러난다. 보통의 인증 스킴은 *실패한* 크리덴셜에 401 Unauthorized를 쓰지만, 이 스킴은 검증 실패를 포함한 모든 결제 관련 챌린지에 **일관되게 402를 사용**한다.[^s01][^s06] 즉 402는 "결제 인증 도메인"의 전용 상태코드로 자리매김하며, 문서는 402를 언제 반환/미반환하는지(4.4절)와 다른 인증 스킴과의 상호작용(4.4.3절)을 별도로 규정한다.[^s01]

## 3. 챌린지·크리덴셜·리시트

**챌린지(`WWW-Authenticate: Payment`).** 필수 파라미터는 `id`(챌린지 식별자, 파라미터에 바인딩)·`realm`(RFC 9110 보호 공간)·`method`(결제수단 식별자)·`intent`(IANA 등록 의도)·`request`(base64url·JCS 직렬화 JSON, 메서드별 데이터)다. 선택 파라미터로 `expires`(RFC 3339)·`digest`(RFC 9530 콘텐츠 다이제스트)·`description`(표시 전용)·`opaque`(서버 상관관계 데이터, 변경 없이 반환)가 있다.[^s01]

**크리덴셜(`Authorization: Payment`).** 클라이언트는 base64url JSON `{challenge(에코된 챌린지 파라미터), source(선택적 지불자 식별자), payload(메서드별 증명)}`를 제출한다.[^s01]

**리시트(`Payment-Receipt`).** 결제 성공 시 서버는 `status("success")·method·timestamp(RFC 3339)·reference(메서드별)`를 담은 `Payment-Receipt` 헤더를 SHOULD 포함한다.[^s01] 중요한 안전장치로, `description`은 표시 전용이며 결제 검증에 사용해선 안 되고, 클라이언트는 결제 인가 *전에* 금액을 MUST 검증한다.[^s01]

## 4. method/intent 레지스트리와 협상

이 스킴의 확장성은 **레지스트리 분리**에서 온다. `method` 식별자는 소문자 ASCII(a–z), `intent` 식별자는 영숫자+하이픈이며, 둘 다 IANA **"Specification Required"** 정책(RFC 8126)으로 등록된다. 메서드 스펙은 request 스키마·payload 스키마·검증 절차·정산 절차를 정의해야 한다 — 따라서 새 결제수단(EVM·Solana·Card·Stripe 등)은 코어를 건드리지 않고 별도 스펙으로 추가된다.[^s01]

**협상.** 서버는 서로 다른 method/intent를 제시하는 **복수의 `WWW-Authenticate: Payment` 헤더**를 반환할 수 있고, 클라이언트는 `Accept-Payment` 헤더로 q-가중 선호를 선언할 수 있다(예: `Accept-Payment: tempo/charge, solana/*;q=0.6, stripe/charge;q=0.2`). 서버는 이를 필터·정렬해 SHOULD 제시한다.[^s01] 이 콘텐츠-협상 패턴이 "에이전트가 자신이 지원하는 결제수단을 고르는" MPP의 멀티-레일 동작을 가능케 한다.[^s01][^s05]

## 5. 보안 모델

문서의 보안 절(11장)은 위협 모델부터 캐싱까지 다층적이다.[^s01]

**챌린지 바인딩(HMAC-SHA256).** 스테이트리스 검증을 위해 서버는 챌린지 `id`를 `realm | method | intent | request(base64url) | expires | digest | opaque` 7개 고정 슬롯 문자열에 대한 서버 비밀키 HMAC-SHA256로 계산한다. 이로써 클라이언트가 결제 세부(금액·수신자 등)를 변조하는 요청-무결성 공격을 차단한다.[^s01]

**재생방지·동시성.** "본 스펙과 함께 쓰는 결제수단은 단일사용(single-use) 증명 의미론을 MUST 제공"하며, "서버는 동일 Payment 크리덴셜의 동시 요청이 최대 1회의 성공 정산만 일으키도록 MUST 보장"한다.[^s01]

**멱등성.** "서버는 결제되지 않은 요청에 대해 부수효과(DB 쓰기·외부 API 호출)를 수행하지 않아야 한다(MUST NOT)" — 결제 전 부작용 금지.[^s01]

**전송·저장·캐싱.** "모든 Payment 인증 흐름에 TLS 1.2 이상을 REQUIRE"하고, "서버·중개자는 Payment 크리덴셜을 로깅·오류메시지·디버깅·분석에 포함하지 않아야 한다(MUST NOT)"며, 402 응답에는 `Cache-Control: no-store`를 MUST 전송한다.[^s01] 오류 응답은 RFC 9457 Problem Details로 표준화되고, 검증 실패·만료 챌린지·변조 크리덴셜 등은 모두 새 402 챌린지로 회신한다.[^s01]

## 6. IETF 지위·생태계·x402 관계

**지위(중요).** 본문은 Standards Track을 *의도*하지만, IETF datatracker는 이 문서(`draft-ryan-httpauth-payment`)를 워킹그룹 **미채택 개인 드래프트**로 분류하고 "IETF가 보증하지 않으며 IETF 표준 절차에서 공식 지위가 없다"고 명시한다.[^s02][^s01] 즉 현 시점에서 이것은 "표준"이 아니라 "표준이 되려는 개인 제안"이다. 나아가 datatracker 버전·일자(`draft-ryan-httpauth-payment-01`, 2026-03-17 갱신·2026-09-19 만료)와 paymentauth.org 버전·일자(`draft-httpauth-payment-00`, 2026-06-03자·2026-12-05 만료)가 **불일치**한다 — 사이트 배포본과 IETF 제출본의 명명·날짜 체계가 다르며, 본 보고서는 동일 계열로 보되 완전 동일성은 단정하지 않는다.[^s01][^s02] _(두 출처 간 메타데이터 상충)_

**생태계.** MPP는 두 프로덕션 메서드를 제공한다 — Tempo(스테이블코인)와 Stripe(카드·지갑 등 법정화폐) — 서버가 둘을 동시 광고하면 클라이언트가 지원 수단을 고른다.[^s05] 독립 해설은 MPP가 코어 스킴과 메서드별 스펙(Tempo·Stripe·Solana·Card), 그리고 intent(charge·session)를 분리한다고 정리한다.[^s08] 채택 신호로는 Cloudflare Agents의 MPP 문서와 Stripe의 MPP 결제 문서가 있다.[^s04][^s07] 스펙 저장소는 GitHub `tempoxyz/mpp-specs`로, "'Payment' HTTP 인증 스킴으로 구동되는 MPP 스펙"이라고 기술한다.[^s03]

**x402와의 관계.** 독립 비교 분석은 두 프로토콜이 모두 402를 쓰지만 철학이 다르다고 본다 — x402(Coinbase)는 퍼미션리스·무프로토콜수수료이고, MPP는 법정화폐(Stripe) 프로덕션 지원·네이티브 스트리밍 세션·facilitator 개념 제거·IETF 제출을 특징으로 한다.[^s06] 핵심은 "**MPP가 x402와 하위 호환**으로, x402의 'exact' 결제 흐름이 MPP의 charge intent에 직접 매핑되어 MPP 클라이언트가 기존 x402 서비스를 소비할 수 있다"는 점이다.[^s06] _(외부 평가 — 코어 문서가 명문 보장하는 사안은 아님)_ 또한 MPP가 검증 실패에도 402를 쓰는 것은 401을 쓰는 다른 인증 스킴과 구별되는 설계 선택으로 지적된다.[^s06]

## 7. 한계

- **v00·미채택.** 본문 Standards Track 의도와 달리 IETF datatracker상 미채택 개인 드래프트("IETF 미보증·공식 지위 없음")다. 필드·절차는 개정에서 바뀔 수 있다.[^s02][^s01]
- **버전·일자 불일치.** datatracker(`-ryan-…-01`, 2026-03-17)와 사이트(`-httpauth-…-00`, 2026-06-03)의 번호·날짜가 다르며, 동일 문서 관계를 단정하지 않는다.[^s01][^s02]
- **단일-문서 의존.** 문서 내용 서술은 그 문서(s01)가 유일 1차 출처다. 충실히 옮겼으나 독립 구현·감사·동료심사 검증은 없으며 "문서가 규정한다"가 "안전·채택됨"을 뜻하지 않는다.[^s01]
- **x402 호환·채택 신호는 외부 평가.** x402 하위호환과 Cloudflare/Stripe 채택은 외부 문서·해설의 서술로, 코어 문서의 명문 보장이나 광범위 프로덕션 사용을 단정하지 않는다.[^s04][^s06][^s07]
- **이해관계.** 저자가 Tempo Labs·Stripe로, 표준 제안이 이들 상업 제품과 직접 연결된다는 독립성 유의점이 있다.[^s01]
