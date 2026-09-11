# Claims

## 서론
- [x] c01: "Know Your Agent"라는 용어는 2024년 Skyfire의 KYAPay 제품명에서 상업적으로 처음 쓰였고, 2026년에는 Visa·Mastercard·Cloudflare가 제품명으로 쓰지 않는데도 생태계 통칭이 됐다.
  - kind: factual
  - needs: Skyfire 자료 + 독립 설명 2건
- [x] c02: KYA를 정의하는 글들은 공통적으로 "에이전트 신원 + 인간 주체와의 바인딩 + 권한 범위 + 감사"의 조합으로 설명한다.
  - kind: interpretive
  - needs: 벤더/독립 정의 2건 이상

## 배경
- [x] c03: 기존 KYC·OAuth 흐름에서는 에이전트가 사용자와 구별되지 않아 책임 공백이 생기며, 학계는 "on-behalf-of" 위임 흐름을 요구한다.
  - kind: interpretive
  - needs: 논문 1건
- [x] c04: Authenticated Delegation 논문(2025-01)은 OAuth 2.0/OIDC를 에이전트 자격증명·메타데이터로 확장하는 인증된·인가된·감사 가능한 위임 프레임워크를 제안한다.
  - kind: technical
  - needs: arXiv 원문

## 상용 구현
- [x] c05: Mastercard Agent Pay는 Agentic Token 발급 전 KYC식 "Know Your Agent" 등록을 요구하며, 토큰은 등록된 에이전트·세션·상점·의도에 바인딩된다.
  - kind: technical
  - needs: Mastercard 문서 + 인터뷰
- [x] c06: Mastercard는 2026년 에이전트 거래 검증을 위한 개방 표준(Verifiable Intent)을 공개했고 FIDO·EMVCo·IETF·W3C 표준 위에 구축했다고 밝혔다.
  - kind: factual
  - needs: Mastercard 발표 + 보도
- [x] c07: Visa Trusted Agent Protocol(2025-09)은 Visa가 발급하는 Verified Agent ID와 발급사가 서명하는 소비자 동의 기록을 분리한다.
  - kind: technical
  - needs: Visa 문서 + 독립 비교
- [x] c08: Google AP2는 에이전트 신원 자체보다 사용자가 서명한 mandate(Intent/Cart/Payment)로 권한을 표현한다.
  - kind: technical
  - needs: AP2 문서(사이트 내 보고서 재인용 가능)
- [x] c09: Cloudflare Web Bot Auth는 HTTP Message Signatures로 크롤러/에이전트 신원을 검증하며 인간 주체 바인딩은 다루지 않는다.
  - kind: technical
  - needs: Cloudflare 문서
- [x] c10: Skyfire의 KYAPay는 에이전트에 지불 가능한 신원을 부여하고 지출 한도를 붙이는 상용 서비스다.
  - kind: factual
  - needs: Skyfire 문서 + 보도
- [x] c11: Sumsub는 2026년 1월 에이전트를 검증된 인간 신원에 라이브니스로 묶는 AI Agent Verification 제품을 출시했다.
  - kind: factual
  - needs: Sumsub 발표 + 2번째 출처

## 표준화
- [ ] c12: FIDO Alliance는 2025년 에이전트 상호작용 신뢰 표준 개발을 발표했고 Mastercard가 Payments WG에 verifiable credential 기반 에이전트 인증을 기여한다.
  - kind: factual
  - needs: FIDO 보도자료 + Mastercard
- [x] c13: Vouched는 2026년 3월 MCP-I를 DIF에 기부했고, DIF Trusted AI Agents WG가 이를 KYA-OS로 개명해 관리하며 DID/VC 기반이다.
  - kind: factual
  - needs: DIF 공지 + 2번째 출처
- [ ] c14: OpenID AuthZEN WG는 에이전트 시대 인가를 위해 AARP와 MCP 도구 인가 프로파일(COAZ)을 WG 드래프트로 채택했다.
  - kind: factual
  - needs: OpenID 발표 + 드래프트
- [x] c15: IETF WIMSE는 워크로드 신원을 다루며 에이전트 신원 논의의 기반으로 인용되지만 인간 주체 바인딩은 범위 밖이다.
  - kind: technical
  - needs: WIMSE 헌장

## 학술 연구
- [x] c16: BIND 논문(2026-08)은 사용자 생체 정보를 에이전트 ID와 권한 범위에 암호학적으로 바인딩해 인가 시점을 증명한다.
  - kind: technical
  - needs: arXiv
- [x] c17: 다중 에이전트 권한 전파 논문(2026-05)은 인가를 개별 접근이 아니라 위임 그래프 전체의 흐름 속성으로 다뤄야 한다고 주장한다.
  - kind: technical
  - needs: arXiv
- [x] c18: DID/VC 기반 에이전트 신원 논문(2025-11)은 사전 조율 없는 에이전트·주체 검증을 제안한다.
  - kind: technical
  - needs: arXiv

## 분석
- [x] c19: 현재 KYA 구현들은 결제 네트워크(Visa/Mastercard), 신원 벤더(Sumsub/Vouched/Skyfire), 인프라(Cloudflare)로 나뉘어 서로 다른 층을 검증하며 상호운용 표준은 아직 없다.
  - kind: interpretive
  - needs: 비교 자료 2건
- [x] c20: 규제 측면에서 EU AI Act 전면 적용(2026-08)과 결제 규제(PSD2/SCA)가 KYA 요구를 강제할 것이라는 주장은 대부분 벤더 발이며 규제 원문의 직접 근거는 약하다.
  - kind: interpretive
  - needs: 규제 원문 또는 독립 분석
- [x] c21: 에이전트 신원의 전역 유일성과 책임 귀속은 어느 구현도 해결하지 못했다(A2A 위협 모델링 논문과 일치).
  - kind: interpretive
  - needs: 논문 + 비교
