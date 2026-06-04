# Claims

## 서론 (Introduction)
- [x] c01: draft-card-charge-00 "Card Network Charge Intent for HTTP Payment Authentication"은 J. Brans(Visa)가 저자인 Informational 인터넷 드래프트로, 2026-06-03자(만료 2026-12-05)다.
  - kind: factual
  - needs: 문서 메타데이터. (s01)
- [x] c02: 이 문서는 MPP의 'card' 결제수단이 'charge' intent를 구현하는 방식을 정의하며, 원시 PAN 대신 암호화된 네트워크 토큰으로 일회성 카드 거래를 처리한다.
  - kind: technical
  - needs: 문서 개요. (s01)

## 상위 프레임워크 (Background)
- [x] c03: 이 'card' 메서드는 MPP의 method/intent 레지스트리에 등록되는 결제수단 바인딩으로, 베이스 "Payment" HTTP 인증 스킴(402)의 챌린지-응답 위에서 동작한다.
  - kind: technical
  - needs: 문서 + MPP 카드 문서. (s01, s02)
- [x] c04: MPP의 'card' 메서드는 카드망이 제공하는 암호화된 일회성 네트워크 결제 토큰과 다이내믹 데이터를 사용하며, 클라이언트와 서버가 각자 독립된 결제 제공자를 쓸 수 있다.
  - kind: technical
  - needs: MPP 카드 메서드 문서. (s02)

## 요청 스키마와 플로우 (Request & flow)
- [x] c05: 서버는 402 챌린지의 request에 amount(최소 통화단위)·currency(ISO 4217 소문자)·acceptedNetworks(visa/mastercard/amex/discover)·merchantName, 그리고 토큰 암호화용 RSA 공개키(encryptionJwk 또는 jwksUri+kid)를 담는다.
  - kind: technical
  - needs: 문서 Request Schema. (s01)
- [x] c06: 암호화 키는 RSA 최소 2048비트여야 하며(MUST) 알고리즘은 RSA-OAEP-256이어야 한다.
  - kind: technical
  - needs: 문서 Encryption Key 절. (s01)

## 네트워크 토큰 크리덴셜 (Credential)
- [x] c07: 크리덴셜의 encryptedPayload는 JWE compact 직렬화로, RSA-OAEP-256 키래핑 + AES-256-GCM 콘텐츠 암호화를 사용한다.
  - kind: technical
  - needs: 문서 Encrypted Payload 절. (s01)
- [x] c08: 암호화 페이로드 평문에는 토큰 데이터(paymentToken·토큰만료·eci)와 다이내믹 데이터(일회성 cryptogram, EMV SRC 사양의 dynamicDataType·만료)가 담기며, 네트워크명·panLastFour·만료 등 메타데이터는 표시 전용이다.
  - kind: technical
  - needs: 문서 Token/Dynamic Data 절. (s01)
- [x] c09: 네트워크 토큰은 Token Service Provider(TSP)가 프로비저닝하며 클라이언트·서버에 복호화 토큰이 노출되지 않는다 — "오직 암호화된 네트워크 토큰만 크리덴셜에 실린다".
  - kind: technical
  - needs: 문서 normative 인용. (s01)
- [x] c10: 네트워크 토큰화는 EMVCo 표준으로, 민감한 PAN을 비민감 대체값(토큰)으로 치환하고 거래마다 일회성 cryptogram으로 보호한다 — 본 드래프트의 토큰/다이내믹 데이터 모델의 기반이다.
  - kind: technical
  - needs: EMVCo/토큰화 1차 자료. (s03, s06)

## 검증·정산 (Verification & settlement)
- [x] c11: 서버는 challenge.id 매칭·만료 확인·method='card' 확인·acceptedNetworks 포함 확인을 수행하고, 각 크리덴셜은 챌린지당 1회만 사용 가능하며(MUST) challenge.id를 멱등키로 사용한다(MUST).
  - kind: technical
  - needs: 문서 Verification/Replay 절. (s01)
- [x] c12: Server Enabler(PSP/TSP)가 챌린지 공개키에 대응하는 개인키로 JWE를 복호화한 뒤 네트워크 토큰으로 카드망 승인을 요청하고, "승인 직후 최종 정산이 보류 중이어도 200을 반환해야 한다(SHOULD)".
  - kind: technical
  - needs: 문서 Settlement 절. (s01)

## 보안·PCI·생태계 (Security & ecosystem)
- [x] c13: 모든 MPP 교환은 TLS 1.2 이상에서 일어나야 하며(MUST, 1.3 권장), 클라이언트·서버는 encryptedPayload를 파싱해서는 안 된다(MUST NOT).
  - kind: technical
  - needs: 문서 Security/Credential 절. (s01)
- [x] c14: 빌링주소·카드소지자명·PAR(Payment Account Reference)은 크리덴셜 내 평문으로(TLS로 보호) 전송되며, 서버·중개자는 이를 평문 로깅하지 않아야 하고(SHOULD NOT) PAR을 가맹점 간 추적에 써서는 안 된다(SHOULD NOT).
  - kind: technical
  - needs: 문서 Billing Data Handling 절. (s01)
- [x] c15: 문서는 환불과 3DS/SCA를 규범적으로 정의하지 않으며, 환불 가역성은 카드망 차지백 규칙에 따른다고만 언급한다.
  - kind: technical
  - needs: 문서 — 미규정 확인. (s01)
- [x] c16: 본 카드 방식은 Visa Trusted Agent Protocol(TAP)·Visa Intelligent Commerce를 식별 보증·토큰 출처로 참조하며, Visa Intelligent Commerce Connect는 MPP·TAP·ACP로 개시된 결제를 수용한다.
  - kind: factual
  - needs: 문서 참조 + Visa 1차/뉴스. (s01, s04, s05)
- [x] c17: evm-charge가 온체인 서명(Permit2/EIP-3009)·온체인 정산인 데 비해, card-charge는 기존 카드망 승인·정산을 쓰며 동일한 402 Payment 스킴·charge intent를 공유한다.
  - kind: interpretive
  - needs: 두 드래프트 + MPP 멀티레일 해설. (s01, s07, s08)
