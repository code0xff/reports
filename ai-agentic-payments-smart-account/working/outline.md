# Outline — AI 에이전트 결제와 스마트 계정

## 1. Abstract / 초록
- AI 에이전트가 자율적으로 결제를 실행해야 하는 새 환경에서 EOA(외부 소유 계정) 모델의 한계.
- 스마트 계정(Account Abstraction, ERC-4337, EIP-7702)이 어떻게 "프로그래머블 결제 권한"을 제공하는지.
- 본 보고서 범위: 개념 → 제품 landscape → 기능 비교 → 코드 분석.

## 2. Introduction — 왜 AI 에이전트 결제에 스마트 계정이 필요한가
- 에이전트 결제의 정의(Agentic Payments)와 시장 신호: Stripe·Visa·Mastercard·Google·OpenAI의 2024–2026 발표.
- EOA의 구조적 한계: 키 = 계정, 단일 서명, 정책/한도/위임 부재.
- 스마트 계정이 충족하는 기본 요건: 정책, 세션 키, 위임, 다중 서명/소셜 복구, 가스 추상화.

## 3. Background — 스마트 계정의 기술 표준
- ERC-4337 (UserOperation, EntryPoint, Bundler, Paymaster).
- EIP-7702 (EOA가 일시적으로 컨트랙트 코드를 갖는 모델, Pectra 활성화).
- ERC-7579 / ERC-6900 (모듈러 계정 표준).
- ERC-7710 / ERC-7715 (위임/권한 요청 표준).
- 세션 키, 한도, 통화·머천트 화이트리스트의 표준화 시도.

## 4. The Agentic Payments Product Landscape
- 결제 네트워크 측: Visa Intelligent Commerce / Trusted Agent Protocol, Mastercard Agent Pay, Stripe Agentic Commerce/x402.
- 모델 제공자·플랫폼 측: OpenAI Operator/Agentic Commerce Protocol, Google Agent Payments Protocol(AP2)·A2A.
- 온체인 인프라 측: Coinbase x402, Circle CCTP+Agent Toolkit, Privy/Crossmint/Biconomy/ZeroDev/Safe smart accounts as agent wallets.
- 결제 표준화 시도: Agent Commerce Protocol, x402 HTTP 402 revival, Mandate/Authorization Credential 패턴.

## 5. Functional Comparison — 에이전트 결제용 스마트 계정의 핵심 기능
- (a) 권한 위임과 세션 키(범위, 한도, 만료).
- (b) 정책 엔진 / 가드(머천트 화이트리스트, 카테고리, 일·월 한도).
- (c) 가스 추상화와 후원(Paymaster, USDC 가스).
- (d) 다중 체인·다중 자산 동작과 인텐트 라우팅.
- (e) 인증·신원·소비자 보호(Trusted Agent Protocol, Mandate, dispute).
- (f) 감사 가능성·로그·콜백.

## 6. Code-level Analysis — 대표 구현체 톺아보기
- 6.1 ERC-4337 EntryPoint v0.7/v0.8의 UserOperation 처리 흐름.
- 6.2 Safe{Core} (Safe v1.4 + 4337 Module + 7579 modules)에서 세션 키 모듈 구조.
- 6.3 ZeroDev Kernel v3 (7579 기반) + Permissions/Policy 모듈.
- 6.4 Coinbase x402 facilitator의 EIP-3009 `transferWithAuthorization` 사용.
- 6.5 Coinbase Agent Kit / Stripe Agent Toolkit의 SDK-level 결제 호출.
- 6.6 Google AP2 Mandate 객체와 A2A 메시지 흐름.

## 7. Discussion — 에이전트 결제에서의 보안·설계 트레이드오프
- 키·정책 분리의 위협 모델(에이전트 탈취, 프롬프트 인젝션, MEV·리플레이).
- 표준 단편화: ACP vs AP2 vs x402, 4337 vs 7702.
- UX·규제 긴장(KYC/AML, 카드 네트워크 규칙, 소비자 분쟁권).

## 8. Limitations
- 본 연구가 다루지 못한 영역(클로즈드 베타 제품의 내부 코드, 카드 네트워크 내부 사양 등).
- 표준이 빠르게 변동 중인 점.

## 9. References
- (sources.jsonl로부터 자동 생성)
