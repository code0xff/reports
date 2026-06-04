# Outline

1. **초록 (Abstract)** — 문서 정체(MPP의 카드 charge 바인딩, Visa의 J. Brans 저자, Informational), 핵심(네트워크 토큰을 JWE로 암호화해 PAN 미노출·PCI 축소), evm-charge와의 대비, Visa Intelligent Commerce/TAP 맥락.

2. **서론 (Introduction)** — 문서 메타데이터, 문제(에이전트가 기존 카드 레일로 결제하되 PAN 노출 없이), 범위(정독 분석 + MPP·카드 네트워크 맥락).

3. **상위 프레임워크 속 위치 (Background)** — MPP method/intent 레지스트리에서 'card' 메서드 + 'charge' intent, 'stripe' 메서드와의 구분, Payment 스킴(402)과의 관계.

4. **요청 스키마와 카드 charge 플로우 (Request & flow)** — amount(최소단위)·currency(ISO4217 소문자)·acceptedNetworks·merchantName·encryptionJwk/jwksUri, 서버가 RSA 공개키로 챌린지 → 클라이언트 enabler가 토큰 암호화.

5. **네트워크 토큰 크리덴셜 (Credential)** — JWE(RSA-OAEP-256 키래핑 + AES-256-GCM), 토큰 데이터(paymentToken·만료·ECI)·다이내믹 데이터(cryptogram, EMV SRC), 메타데이터(panLastFour 등 표시용), "클라이언트는 복호화 토큰 접근 불가".

6. **검증·정산 (Verification & settlement)** — 챌린지 바인딩(HMAC)·일회성/재생방지(challenge.id 멱등키), Server Enabler(PSP/TSP)가 JWE 복호화 후 카드망 승인, "승인 즉시 200 반환(최종 정산은 보류)".

7. **보안·PCI·PII와 생태계 비교 (Security & ecosystem)** — TLS 필수·크리덴셜 비파싱·PAR 취급·빌링데이터 평문(TLS 보호)·PCI 스코프 축소; evm-charge(온체인)와 대비; Visa TAP/Intelligent Commerce Connect, 3DS/SCA·환불 미규정.

8. **한계 (Limitations)** — v00·Informational·미채택, 단일-문서 의존, 3DS/환불 미규정, 단일 저자(Visa) 이해관계, 빠른 변동.

9. **참고문헌 (References)** — sources.jsonl 기반.
