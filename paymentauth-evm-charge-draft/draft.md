# draft-evm-charge-00 분석: HTTP 결제 인증을 위한 EVM Charge Intent

## 초록

`draft-evm-charge-00` "EVM Charge Intent for HTTP Payment Authentication"은 2026년 6월 3일자 인터넷 드래프트로, Brett DiNovi(MegaETH Labs)·Conner Swenberg(Coinbase)·Kyle Scott(Monad Foundation)가 공동 저자다.[^s01] 이 문서는 **Tempo의 Machine Payments Protocol(MPP)** — HTTP 402 위에서 동작하는 결제수단 불가지(agnostic) "Payment" 인증 스킴 — 의 **EVM 메서드 바인딩**으로, 체인마다 별도 결제수단을 만들지 않고 "제어 흐름·데이터 구조·검증 로직이 동일하다"는 이유로 EVM 호환 체인을 단일 `evm` 메서드로 통합한다.[^s01][^s02][^s03] charge 플로우는 서버의 402 + `WWW-Authenticate: Payment` 챌린지 → 클라이언트의 오프체인 서명 → `Authorization: Payment` 제출 → 서버의 온체인 검증·정산 → `Payment-Receipt` + 200으로 이어진다.[^s01][^s03] 핵심은 **네 가지 크리덴셜 타입**이다: `permit2`(권장), `authorization`(EIP-3009 전용), `transaction`, `hash` — 서버 가스 부담 여부, 챌린지 바인딩 강도, 분할결제 지원이 서로 다르다.[^s01] 저자에 x402 설계자(Coinbase의 Conner Swenberg)가 포함되며, 독립 해설은 "MPP가 charge 레이어에서 x402와 하위 호환"이라고 평가한다 — 즉 이 드래프트는 x402 계열의 EVM 결제를 MPP 프레임워크로 표준화하려는 시도로 읽힌다.[^s05][^s01] 다만 v00 초판이자 비표준이며, 중앙화(Tempo L1)·게이트키핑(Stripe) 비판도 존재한다.[^s05][^s06]

## 1. 서론

본 보고서의 과업은 특정 문서 `https://paymentauth.org/draft-evm-charge-00.txt`를 정독하고 분석하는 것이다. 문서 메타데이터는 다음과 같다: 제목 "EVM Charge Intent for HTTP Payment Authentication", 식별자 `draft-evm-charge-00`, 상태 Internet-Draft, 일자 2026-06-03, 만료 2026-12-05, 저자 Brett DiNovi(MegaETH Labs)·Conner Swenberg(Coinbase)·Kyle Scott(Monad Foundation).[^s01]

문서가 푸는 문제는 명확하다 — EVM 계열 체인마다 결제수단을 따로 정의하는 대신, 동일한 제어 흐름·데이터 구조·검증 로직을 하나의 `evm` 메서드로 묶는 것이다.[^s01] 본 보고서는 (1) 문서가 속한 상위 프레임워크(MPP)를 먼저 정리하고, (2) charge 플로우·헤더, (3) 네 크리덴셜 타입, (4) 검증·정산·재생방지, (5) 보안과 x402 관계 순으로 분석한다. 자료는 대상 드래프트(1차)와 paymentauth.org의 베이스·디스커버리 드래프트, 그리고 독립 MPP 해설에 기반한다.[^s01][^s02][^s03][^s05]

## 2. 상위 프레임워크: MPP와 "Payment" HTTP 인증 스킴

`paymentauth.org`는 **Tempo의 Machine Payments Protocol(MPP)** 스펙 모음을 호스팅한다. 코어에는 "Payment" HTTP 인증 스킴(`draft-httpauth-payment`), 서비스 디스커버리(`draft-payment-discovery`; 서비스가 가격·결제수단·intent를 주석한 OpenAPI 문서를 게시하는 기계가독 계약),[^s04] JSON-RPC & MCP 전송이 있고, 그 위에 결제수단별 드래프트(Card·EVM·Hedera·Lightning·Solana·Stellar·Stripe·Tempo)와 세션 스펙이 올라간다. 저장소는 GitHub `tempoxyz/mpp-specs`로 관리된다.[^s02]

베이스 "Payment" 인증 스킴은 HTTP 402 "Payment Required" 위에서 동작하며 "결제수단 불가지 설계로, 등록된 결제수단 식별자를 통해 어떤 결제 네트워크·통화든 지원"한다.[^s03] 챌린지는 `WWW-Authenticate: Payment`로 `id`·`realm`·`method`·`intent`·`request`(base64url JSON)·(선택)`expires`를 싣고, 크리덴셜은 `Authorization: Payment`로 `{challenge, source, payload}` base64url JSON을 싣는다.[^s03] 결제 method·intent는 별도 스펙·IANA 레지스트리로 등록되어 코어 변경 없이 확장된다.[^s03] MPP는 intent를 **charge**(일회성 거래)와 **session**(에스크로 후 서명 바우처 스트리밍)으로 구분하며, 본 드래프트는 그중 **charge intent의 EVM 바인딩**이다.[^s05][^s01] 실제로 문서는 IANA에 결제수단 `evm`(EVM 호환 체인 ERC-20 전송)과 intent `charge`(일회성 ERC-20 전송, `evm`에 적용)를 등록한다.[^s01]

## 3. Charge 플로우와 HTTP 헤더

charge 플로우는 여섯 단계다.[^s01][^s03]

1. 클라이언트가 보호된 리소스를 요청한다.
2. 서버가 `402 Payment Required`와 함께 `WWW-Authenticate: Payment` 챌린지(`id`·`realm`·`method`·`intent`·`request`·`expires`)를 보낸다.
3. 클라이언트가 크리덴셜 타입에 맞는 방식으로 인가에 서명한다.
4. 클라이언트가 base64url 크리덴셜을 `Authorization: Payment`로 제출한다.
5. 서버가 검증하고 온체인 정산한다.
6. 서버가 `Payment-Receipt` 헤더와 `200 OK`를 반환한다.

챌린지의 `request`에는 `amount`(base units)·`currency`(ERC-20 컨트랙트 주소)·`recipient`·(선택)`description`·`externalId`, 그리고 `methodDetails`로 `chainId`(EIP-155)·`credentialTypes`·`splits`(recipient·amount·memo 배열)가 담긴다.[^s01] 크리덴셜은 에코된 `challenge`, 타입별 `payload`, 선택적 `source`(`did:pkh:eip155:...` 권장)로 구성되고, 리시트는 `method`·`challengeId`·`reference`(tx 해시)·`status`·`timestamp`(RFC3339)·`chainId`를 담는다.[^s01]

## 4. 네 가지 크리덴셜 타입

문서의 설계 중심은 네 가지 크리덴셜 타입이며, 토큰 호환성·가스 부담·바인딩 강도에서 트레이드오프가 갈린다.[^s01]

- **`permit2`(권장)**: 클라이언트가 오프체인 EIP-712 Permit2 인가에 서명하면 서버가 트랜잭션을 구성·브로드캐스트하고 **가스를 부담**한다. batch 전송으로 원자적 분할결제를 지원하며, 챌린지 바인딩은 witness 데이터로 한다.
- **`authorization`(EIP-3009 토큰 전용)**: 클라이언트가 오프체인 `transferWithAuthorization` 메시지에 서명하고 서버가 토큰 컨트랙트에 제출한다. Permit2 사전조건이 없어 **셋업 제로**이고 서버가 가스를 부담하며, 바인딩은 온체인 nonce로 한다.
- **`transaction`**: 클라이언트가 완성된 ERC-20 전송 트랜잭션에 서명하고 서버가 브로드캐스트하며 **클라이언트가 가스를 부담**한다. Permit2가 없는 체인의 폴백.
- **`hash`**: 클라이언트가 직접 트랜잭션을 브로드캐스트하고 확정된 해시를 제시하면 서버가 온체인 검증한다. **가장 약한 챌린지 바인딩**이며 분할결제를 지원하지 않는다.

즉 `permit2`/`authorization`은 서버 가스 부담(가스리스 클라이언트), `transaction`/`hash`는 클라이언트 가스 부담이라는 축과, `permit2`만 원자적 splits를 온전히 지원한다는 축으로 구분된다.[^s01]

## 5. 검증·정산·재생방지

**검증(permit2 예).** 정산 전 서버는 (1) 유효한 EIP-712 서명, (2) deadline 미만료, (3) 서명자의 잔액·Permit2 allowance 충분, (4) `witness.challengeHash`가 챌린지 `id`/`realm`에서 유도한 값과 일치, (5) 전송 금액·수취인이 request와 일치, (6) splits의 경우 `transferDetails` 배열이 permitted·splits와 일치하는지를 MUST 검증한다.[^s01]

**정산.** permit2 단건은 `Permit2.permitWitnessTransferFrom()`, 분할은 `permitBatchWitnessTransferFrom()`으로 호출되어 모든 전송이 원자적이다 — 문서는 "all succeed or all revert"라고 명시한다.[^s01] `authorization`은 토큰의 `transferWithAuthorization()`, `transaction`은 서명된 EIP-1559 tx 브로드캐스트, `hash`는 `eth_getTransactionReceipt()`로 영수증을 조회한다. 모든 정산은 블록 포함(성공 영수증)을 요구한다.[^s01]

**재생방지·챌린지 바인딩.** 문서의 핵심 보안 속성은 "서명이 동일한 결제 파라미터라도 다른 챌린지에 재사용될 수 없다"는 것이다.[^s01] 이는 타입별로 — permit2는 EIP-712 구조체의 `witness.challengeHash`, EIP-3009는 `nonce = keccak256(challenge.id || challenge.realm)`, transaction/hash는 서버가 온체인 상태를 대조하는(상대적으로 약한) 방식으로 구현된다.[^s01] 재생방지도 타입별로 permit2/authorization은 온체인 nonce 소비, transaction은 chainId+nonce, hash는 해시 중복 추적으로 처리한다.[^s01]

## 6. 보안 고려사항과 x402와의 관계

**보안.** 문서는 다층 보안 고려를 둔다.[^s01] 가스 스폰서십(permit2/authorization에서 서버가 가스 부담) 시 실패 트랜잭션을 통한 **DoS** 위험을 지적하고, 브로드캐스트 전 `eth_call` 시뮬레이션을 완화책으로 권고한다. 분할결제는 batch 원자성("all succeed or all revert")으로 부분 실패를 막고, `hash` 타입은 바인딩이 약하다는 점, RPC 신뢰(서버가 체인 상태를 RPC로 확인)와 fee payer 위험도 별도 절에서 다룬다.[^s01]

**x402와의 관계.** 본 드래프트는 진공에서 나온 것이 아니다. 저자에 **x402 설계자(Coinbase의 Conner Swenberg)**가 포함되고, 크리덴셜이 Permit2 witness·EIP-3009 `transferWithAuthorization`에 기반한다는 점은 x402의 EVM 결제 방식과 같은 계열이다.[^s01] 독립 해설은 "**MPP가 charge 레이어에서 x402와 하위 호환**"이라고 평가하며, MPP는 facilitator 개념을 제거하고 프로덕션급 법정화폐 지원을 갖춘 반면 x402는 퍼미션리스를 우선한다고 본다.[^s05] 따라서 evm-charge는 x402 계열 EVM 결제를 MPP의 method/intent 레지스트리로 흡수·표준화하려는 시도로 해석된다. _(해설자 평가 — 드래프트가 x402 호환을 명문으로 보장한다고까지는 미확인)_[^s05][^s01]

**비판.** 상위 생태계에는 중앙화 비판이 따른다 — Tempo는 출범 시 "중앙화된 검증자 집합"을 가진 VC 투자 L1이고, Stripe 의존이 핀테크 게이트키핑 우려를 낳으며 스테이블코인 수용이 미국 사업자 중심이라는 한계가 지적된다.[^s05][^s06] 이는 evm-charge 드래프트 자체의 결함이라기보다 MPP/Tempo 전반의 우려다.

## 7. 한계

- **v00 초판·비표준.** draft-evm-charge-00은 2026-06-03자 초판으로 2026-12-05 만료 예정이며 IETF가 보증한 표준이 아니다. 필드·크리덴셜·검증 절차는 개정에서 바뀔 수 있다.[^s01][^s03]
- **단일-문서 의존.** 문서 *내용*에 관한 기술 서술은 그 문서(s01)가 유일 1차 출처다. 충실히 옮겼으나 독립 구현·감사·동료심사로 검증된 바는 없으며, "문서가 규정한다"가 "안전·유효·채택됨"을 뜻하지 않는다.[^s01]
- **베이스 스킴 명명 차이.** 베이스 "Payment" 인증 스킴이 IETF datatracker에는 `draft-ryan-httpauth-payment-01`, MPP 해설에는 `draft-httpauth-payment-00`로 지칭된다 — 동일 계열로 보이나 완전 동일성은 단정하지 않는다.[^s03][^s05]
- **미배포·미구현.** 이 드래프트의 실제 서버/클라이언트 구현·배포·상호운용 사례는 확인되지 않았다.
- **x402 호환·중앙화 비판은 외부 평가.** x402 charge-레이어 호환과 Tempo/Stripe 비판은 독립 해설의 평가로, 드래프트 본문의 명문 보장이 아니다.[^s05][^s06]
