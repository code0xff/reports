# Outline — Agent Commerce / Agent Payments 카드 결제 프로토콜 및 서비스

Primary language: ko. Alternate: en.

## 1. 초록 (Abstract)
- 카드 레일 위에서 AI 에이전트가 구매 주체가 될 때 등장한 프로토콜·서비스 지형과
  운영 현실을 요약. (마지막에 작성)

## 2. 서론 — 문제 정의와 범위
- 에이전트 커머스(agentic commerce)와 에이전트 결제(agent payments)의 정의 구분.
- 본 리서치가 다루는 범위: 카드(Visa/Mastercard/Amex) 네트워크 레일 위 프로토콜,
  이를 구현한 PSP/플랫폼 서비스. 스테이블코인/x402 계열은 비교 대상으로만 참조.
- 조사 시점(2026-08) 기준 성숙도 스냅샷임을 명시.

## 3. 카드 레일과 에이전트 구매자: 구조적 충돌
- 카드 레일의 기본 가정: "사람이 화면 앞에 있다" (CIT vs MIT, SCA, 3DS challenge).
- 에이전트 구매가 깨뜨리는 것: 봇 트래픽 차단, 카드 온파일 재사용, 승인 책임,
  분쟁(chargeback) 시 "누가 승인했는가"의 증거.
- 기존 대체 경로(카드 온파일 + RPA/스크레이핑, 게스트 체크아웃 자동화)의 한계.

## 4. 프로토콜 지형과 기술 메커니즘
- 네트워크 주도: Visa Intelligent Commerce / Trusted Agent Protocol(TAP),
  Mastercard Agent Pay / Agentic Tokens, Amex 및 기타.
- 플랫폼 주도: Google AP2(Agent Payments Protocol) + mandate 구조,
  OpenAI–Stripe ACP(Agentic Commerce Protocol), Google UCP.
- 공통 빌딩블록: 결제 토큰화(network tokenization) 확장, 에이전트 식별자,
  위임 증서(mandate/intent) 서명, 3DS/Data-only 인증, 가맹점 측 신호 전달.
- 비카드 대조군: x402, L402, MPP 등 온체인/HTTP 네이티브 결제와의 설계 차이.
- 프로토콜 간 상호운용성(또는 그 부재)과 표준화 기구(EMVCo, W3C, Linux Foundation 등) 위치.

## 5. 서비스·구현 현황
- PSP/게이트웨이: Stripe, Adyen, Checkout.com, PayPal, Worldpay 등의 제품화 상태.
- 커머스 플랫폼/가맹점: Shopify, Etsy, Walmart 등 파일럿·연동 현황.
- 에이전트/모델 측: ChatGPT Instant Checkout, Gemini/Google Shopping, Perplexity 등.
- SDK·오픈소스 구현체와 실제 코드 수준 성숙도(레퍼런스 구현, 테스트 환경, 프로덕션 여부).

## 6. 실사용 및 운영 관점 평가
- 가맹점 온보딩 비용: 통합 작업량, 카탈로그/피드 요구사항, 수수료 구조.
- 승인·거절: 에이전트 트래픽의 승인율, 발급사 리스크 스코어링, false decline 위험.
- 책임과 분쟁: liability shift 규칙, chargeback reason code, 증거 요건, 환불 경로.
- 사기·남용: 프롬프트 인젝션, 에이전트 사칭, 봇 탐지(WAF/Cloudflare 시그널)와의 상호작용.
- 규제·컴플라이언스: PSD2 SCA, PCI DSS 4.0, 한국 여전법/전자금융거래법 관점의 제약.
- 운영 관측성: 로깅·감사 추적, 정산/리컨실리에이션, 고객 지원(CS) 부하.

## 7. 논의 — 채택 신호와 미해결 쟁점
- 실제 거래량·가맹점 수 등 공개된 채택 지표(있다면)와 그 신뢰도.
- 프로토콜 수렴 vs 파편화 시나리오.
- 카드 레일 vs 스테이블코인 레일의 역할 분담 전망.
- 도입을 검토하는 조직이 지금 결정해야 할 것과 미뤄도 되는 것.

## 8. 한계 (Limitations)
- 벤더 발표에 의존한 항목, 비공개 수수료/승인율, 파일럿 단계라 검증 불가한 주장.
- 조사 시점 이후 변경 가능성.

## 9. 참고문헌 (References) — 렌더러가 sources.jsonl에서 생성
