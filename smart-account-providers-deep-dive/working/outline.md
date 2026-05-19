# Outline — Smart Account Providers Deep Dive

## 1. Abstract / 초록
- 여섯 인프라가 같은 표준(ERC-4337, ERC-7579, EIP-7702)을 공유하지만 위치/포지셔닝이 다르다.
- 본 보고서는 (a) 아키텍처 (b) 표준 채택 (c) 모듈/플러그인 (d) 키 관리 모델 (e) 가스/페이마스터 (f) 에이전트/세션 지원을 1차 소스로 비교한다.

## 2. Introduction — 왜 인프라를 따로 봐야 하는가
- "스마트 계정"이라는 같은 단어가 가리키는 범위가 제공자마다 다르다.
- 비교 축 6가지 정의.

## 3. Background — 공통 표준 스택
- ERC-4337 EntryPoint, UserOperation, Paymaster.
- ERC-7579 / 6900 모듈러 표준.
- EIP-7702 EOA 코드 위임.
- ERC-7710/7715, ERC-7484, ERC-7739, SmartSessions.

## 4. Provider Deep Dive
- 4.1 Safe (Safe Smart Account, Safe{Core}, Safe7579 Adapter, Permissionless Module)
- 4.2 ZeroDev (Kernel v3, Permissions, MetaIntents)
- 4.3 Biconomy (Nexus, MEE, Smart Sessions integration)
- 4.4 Privy (Server Wallets, Embedded Wallets, Agentic Wallets, Policies)
- 4.5 Crossmint (Smart Wallets, Dual-Key + TEE, Card/USDC rails)
- 4.6 Coinbase AgentKit (CDP Wallets, AgentKit action providers, x402)

## 5. Comparison — Feature Matrix
- 표 형태 비교: ERC-4337 / 7579 / 7702 / Custody / Paymaster / Session keys / Multi-chain / 라이선스.

## 6. Implementation Patterns — 코드 레벨 톺아보기
- 6.1 Safe Module / Fallback Handler 패턴 (Safe7579 Adapter).
- 6.2 Kernel `installModule(1, validator)` 흐름.
- 6.3 Nexus K1Validator / SmartSessions enable flow.
- 6.4 Privy server wallet authorization key 패턴.
- 6.5 Crossmint dual-key + TEE 서명 흐름.
- 6.6 AgentKit `agentkit.ts` action provider 등록.

## 7. Discussion — 트레이드오프와 선택 기준
- 모듈러 vs 일체형, 자체 호스팅 vs SaaS, 비커스터디 vs MPC/TEE.
- 에이전트 결제 / 카드 발급 / dApp 임베디드 별 적합도.

## 8. Limitations
- 클로즈드 베타 / 비공개 코드, 빠른 버전 변화, 단일 시점 비교의 한계.

## 9. References — auto-generated.
