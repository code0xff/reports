# Claims

## 서론 (Introduction)
- [x] c01: draft-httpauth-payment-00 "The 'Payment' HTTP Authentication Scheme"은 B. Ryan·J. Moxey·T. Meagher(Tempo Labs)와 J. Weinstein·S. Kaliski(Stripe)가 저자이며, 2026-06-03자(만료 2026-12-05) Standards Track 의도의 인터넷 드래프트다.
  - kind: factual
  - needs: 문서 메타데이터. (s01)
- [x] c02: 이 스킴은 RFC 9110의 HTTP 인증을 확장하여, 예약만 되고 정의되지 않았던 HTTP 402 "Payment Required"에 의미를 부여한다.
  - kind: technical
  - needs: 문서 + datatracker abstract. (s01, s02)

## 프로토콜 개요 (Protocol overview)
- [x] c03: 서버는 결제가 필요하거나 결제 크리덴셜 검증이 실패할 때 402와 함께 `WWW-Authenticate: Payment` 헤더를 MUST 반환한다.
  - kind: technical
  - needs: 문서 normative + 해설. (s01, s06)
- [x] c04: 일반 HTTP 인증이 실패 크리덴셜에 401을 쓰는 것과 달리, 이 스킴은 결제 관련 챌린지(검증 실패 포함)에 일관되게 402를 사용한다.
  - kind: interpretive
  - needs: 문서 401 관계 절 + 해설. (s01, s06)

## 챌린지·크리덴셜·리시트 (Scheme mechanics)
- [x] c05: 챌린지의 필수 파라미터는 id·realm·method·intent·request(base64url JCS JSON)이며, 선택 파라미터로 expires·digest·description·opaque가 있다.
  - kind: technical
  - needs: 문서 5.1 절. (s01)
- [x] c06: 클라이언트는 base64url JSON `{challenge, source(선택), payload}`를 `Authorization: Payment`로 제출하고, 성공 시 서버는 status·method·timestamp·reference를 담은 `Payment-Receipt` 헤더를 SHOULD 포함한다.
  - kind: technical
  - needs: 문서 5.2/5.3 절. (s01)
- [x] c07: `description` 파라미터는 표시 전용이며 결제 검증에 사용해서는 안 된다(클라이언트는 결제 인가 전에 금액을 MUST 검증).
  - kind: technical
  - needs: 문서 보안/금액검증 절. (s01)

## 레지스트리·협상 (Registry & negotiation)
- [x] c08: method 식별자는 소문자 ASCII, intent 식별자는 영숫자+하이픈이며, 둘 다 IANA "Specification Required" 정책으로 등록되어 코어 변경 없이 확장된다.
  - kind: technical
  - needs: 문서 6/7/12 절. (s01)
- [x] c09: 서버는 여러 `WWW-Authenticate: Payment` 헤더로 복수 method/intent를 제시할 수 있고, 클라이언트는 `Accept-Payment` 헤더로 q-가중 선호(예: `tempo/charge, solana/*;q=0.6`)를 선언할 수 있다.
  - kind: technical
  - needs: 문서 7.3/7.4 절. (s01)

## 보안 모델 (Security model)
- [x] c10: 스테이트리스 검증을 위해 챌린지 id는 realm|method|intent|request|expires|digest|opaque 7개 슬롯에 대한 서버 비밀키 HMAC-SHA256로 바인딩되어, 클라이언트의 결제 파라미터 변조를 막는다.
  - kind: technical
  - needs: 문서 5.1.2.1 절. (s01)
- [x] c11: 본 스킴과 함께 쓰는 결제수단은 단일사용(single-use) 증명 의미론을 MUST 제공하고, 서버는 동일 크리덴셜의 동시요청에 최대 1회 정산만 일어나도록 MUST 보장한다.
  - kind: technical
  - needs: 문서 11.3/11.5 절. (s01)
- [x] c12: 스펙은 모든 Payment 인증 흐름에 TLS 1.2 이상을 REQUIRE하고, 서버·중개자가 Payment 크리덴셜을 로깅/오류메시지에 포함하지 않도록 MUST NOT을 규정하며, 402 응답에 Cache-Control: no-store를 MUST 전송한다.
  - kind: technical
  - needs: 문서 11.2/11.8/11.10 절. (s01)
- [x] c13: 서버는 결제되지 않은 요청에 대해 부수효과(DB 쓰기, 외부 API 호출)를 수행하지 않아야 한다(MUST NOT) — 멱등성/부수효과 규정.
  - kind: technical
  - needs: 문서 11.4 절. (s01)

## 지위·생태계·x402 (Standing & ecosystem)
- [x] c14: IETF datatracker상 이 문서(draft-ryan-httpauth-payment)는 워킹그룹 미채택 개인 드래프트로 "IETF가 보증하지 않으며 IETF 표준 절차에서 공식 지위가 없다"고 명시된다 — 본문 'Standards Track' 의도와 대비된다.
  - kind: factual
  - needs: datatracker 상태 + 문서 intended status. (s02, s01)
- [x] c15: datatracker 버전·일자(draft-ryan-httpauth-payment-01, 2026-03-17 갱신·2026-09-19 만료)와 paymentauth.org 버전·일자(draft-httpauth-payment-00, 2026-06-03자·2026-12-05 만료)가 불일치한다.
  - kind: factual
  - needs: 두 출처의 메타데이터. (s01, s02)
- [x] c16: MPP는 두 프로덕션 메서드(Tempo=스테이블코인, Stripe=카드·지갑 등 법정화폐)를 제공하며 서버가 둘을 동시 광고할 수 있고, Cloudflare Agents·Stripe 등에서 채택 신호가 있다.
  - kind: factual
  - needs: 해설 + Cloudflare/Stripe 문서. (s05, s04)
- [x] c17: MPP는 x402와 하위 호환으로, x402의 'exact' 결제 흐름이 MPP의 charge intent에 직접 매핑되어 MPP 클라이언트가 기존 x402 서비스를 소비할 수 있다.
  - kind: interpretive
  - needs: 독립 비교 분석. (s06, s07)
