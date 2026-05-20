# Outline — Agent-Payments Smart-Account Design

## 1. Abstract / 초록
- 에이전트 결제 시나리오에서 스마트 계정에 요구되는 능력의 합집합.
- 본 보고서는 (a) 위협 모델 (b) 기능 체크리스트 (c) 구현 청사진 세 부분으로 구성.

## 2. Introduction — 무엇을 풀려고 하는가
- 사용자가 직접 클릭하지 않는 결제(agentic payments)의 정의 재확인.
- 단일 키 + 단일 서명 = 단일 신뢰 모델의 한계.
- "스마트 계정"이라는 도구상자에서 실제로 무엇을 골라 써야 하는가.

## 3. Background — 사례 정리
- 3.1 카드 네트워크 측: Visa TAP, Mastercard Agent Pay (Mandate, agent intent, tokenization).
- 3.2 모델 사업자 측: OpenAI Instant Checkout + Stripe ACP (SPT, checkout endpoint).
- 3.3 클라우드: Google AP2 (Intent / Cart / Payment Mandate, A2A·MCP).
- 3.4 온체인 결제 표준: x402, MPP, EIP-3009, Permit2.
- 3.5 스마트 계정 인프라: Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit, MetaMask Delegation Toolkit.

## 4. Required Features — 위협 모델에서 도출하는 체크리스트
- 4.1 권한 위임과 세션 키(scope·한도·만료).
- 4.2 정책 엔진(머천트 화이트리스트, 카테고리, 일/월 한도).
- 4.3 가스 추상화와 Paymaster (USDC gas).
- 4.4 다체인 / 다자산 라우팅 (인텐트, 브리지).
- 4.5 키 모델 (EOA + 컨트랙트 / SSS+TEE / dual-key+TEE).
- 4.6 인증·신원·소비자 보호 (Mandate, TAP, Trusted Agent).
- 4.7 감사 / 로그 / 인보킹 컨텍스트.
- 4.8 분쟁·환불·복구 (timed withdraw, dispute, social recovery).
- 4.9 마이크로결제 채널 (x402 batch-settlement / MPP session).
- 4.10 에이전트 정합성·프롬프트 인젝션 방어(LLM 측 통제).

## 5. Cross-comparison — 누가 무엇을 충족하는가
- 표 형태로 6개 인프라 × 10개 기능 매핑.

## 6. Implementation Blueprint — 어떻게 만들 것인가
- 6.1 코어 계정 선택 (ERC-7579 + EIP-7702).
- 6.2 권한 모듈 (SmartSessions / ZeroDev Permissions / 자체 PolicyValidator).
- 6.3 결제 어댑터 레이어 (exact / upto / batch-settlement / MPP session).
- 6.4 가스 후원 (Paymaster).
- 6.5 신원 / Mandate 운반 (AP2 + TAP 헤더).
- 6.6 정책 엔진 데이터 모델 (signer / policy / action).
- 6.7 감사 로그 / 알림 / 사용자 콘솔.
- 6.8 LLM 안전 가드 (intent confirmation, signed cart).

## 7. Discussion — 트레이드오프와 우선순위
- 단방향 채널 vs 단건 결제.
- 풀스택 SaaS vs 모듈러 컨트랙트.
- 카드 네트워크 vs 온체인 정산.
- 출시 우선 vs 보안 우선.

## 8. Limitations
- 빠르게 변하는 표준, 단일 시점 비교.

## 9. References — auto-generated.
