# Claims — Agent-Payments Smart-Account Design

## Introduction
- [ ] c01: AI 에이전트가 자율적으로 결제를 실행하는 시나리오를 EOA 단일 키 모델로 풀 경우, 권한 위임·정책·세션 키 같은 1차 안전망이 구조적으로 비어 있게 된다.
  - kind: interpretive
  - needs: 표준 / 기존 분석 1차 자료

## Background
- [ ] c02: Visa Trusted Agent Protocol과 Mastercard Agent Pay는 각각 카드 네트워크 메시지 위에 "trusted agent" 메타데이터를 운반하는 방식으로 동일 문제를 푼다.
  - kind: factual
  - needs: 양사 공지
- [ ] c03: OpenAI + Stripe의 ACP는 Shared Payment Token으로 사용자 결제 자격증명을 노출하지 않고 머천트에게 전달한다.
  - kind: factual
  - needs: Stripe / OpenAI 공지
- [ ] c04: Google AP2는 Intent / Cart / Payment 세 Mandate를 verifiable credentials로 묶어 비부인성을 만든다.
  - kind: factual
  - needs: Google Cloud / AP2 spec
- [ ] c05: 온체인 결제는 x402(HTTP 402 기반)와 MPP(`charge` / `session`)가 각각 단건 결제와 채널 결제로 갈라져 표준화 중이다.
  - kind: factual
  - needs: 양 표준 docs
- [ ] c06: 주요 스마트 계정 인프라(Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit)는 ERC-4337, ERC-7579, EIP-7702를 직간접적으로 모두 지원하며 모듈/세션/위임 추상이 거의 같은 형태로 수렴 중이다.
  - kind: interpretive
  - needs: 각 docs 종합

## Required Features
- [ ] c07: 에이전트 결제용 스마트 계정에는 세션 키 + 정책(머천트 화이트리스트·한도·만료) 패턴이 사실상 필수 기능이다.
  - kind: technical
  - needs: ZeroDev Permissions / SmartSessions / Privy Policies / Crossmint dual-key
- [ ] c08: ERC-4337 Paymaster를 활용한 USDC 가스 후원은 에이전트가 ETH 없이 결제할 수 있게 만든다.
  - kind: technical
  - needs: Pimlico/Circle Paymaster 문서
- [ ] c09: 정책 엔진은 (signer/policy/action) 또는 (UserOp policy/action policy/signature policy)처럼 분리된 객체로 노출되어야 합성 가능하다.
  - kind: technical
  - needs: ZeroDev / SmartSessions docs
- [ ] c10: 다체인·다자산 운용을 위해 x402 batch-settlement 같은 마이크로결제 채널과 인텐트 라우팅(LI.FI / Across) 통합이 필요하다.
  - kind: technical
  - needs: x402 docs / LI.FI agents docs
- [ ] c11: 카드 네트워크 친화 시나리오에서는 Visa TAP과 AP2 Mandate를 HTTP 레벨에서 운반할 수 있어야 한다.
  - kind: technical
  - needs: TAP / AP2 spec
- [ ] c12: 감사 가능성(non-repudiation)을 위해 (1) UserOperation/Mandate의 영구 로그, (2) 에이전트 호출 컨텍스트가 함께 보존되어야 한다.
  - kind: technical
  - needs: AP2 / SPT / EntryPoint event 자료
- [ ] c13: 키 관리는 EOA+컨트랙트 / SSS+TEE / dual-key+TEE 세 모델 중 시나리오에 맞게 선택되어야 하며, 단일 EOA 보관은 권장되지 않는다.
  - kind: interpretive
  - needs: Privy / Crossmint 등 1차 자료
- [ ] c14: LLM 측의 prompt injection이 결제로 흘러가지 않게 하려면 (a) 에이전트가 보는 cart 콘텐츠 자체가 서명된 객체여야 하고 (b) 정책 엔진이 LLM 외부에서 강제 가드 역할을 해야 한다.
  - kind: interpretive
  - needs: Whispers of Wealth 등 보안 연구 + AP2 Cart Mandate

## Cross-comparison
- [ ] c15: 본 보고서에서 정리한 10개 핵심 기능 가운데 모든 항목을 한 인프라가 자체적으로 충족하는 경우는 없으며, 실제 제품은 둘 이상의 인프라를 결합한다.
  - kind: interpretive
  - needs: 표 형태 매핑 + 각 인프라 docs

## Implementation Blueprint
- [ ] c16: 코어 계정은 ERC-7579 모듈러 인터페이스 위에서 EIP-7702 옵션을 받는 형태가 합리적 기본값이다.
  - kind: technical
  - needs: ERC-7579 / EIP-7702 spec
- [ ] c17: 권한 모듈은 ERC-7579 validator(`installModule(1, ...)`) 슬롯에 등록되는 SmartSessions / 자체 PolicyValidator로 구현 가능하다.
  - kind: technical
  - needs: ERC-7579 + SmartSessions
- [ ] c18: 결제 어댑터 레이어는 x402의 scheme + MPP의 intent를 모두 받아 단일 인터페이스로 노출할 수 있다.
  - kind: technical
  - needs: x402 / MPP docs
- [ ] c19: 가스 후원은 ERC-4337 Paymaster를 표준 진입점으로 두고, EOA-only 경로에는 EIP-3009·Permit2 폴백을 제공한다.
  - kind: technical
  - needs: Pimlico / x402 batch-settlement spec
- [ ] c20: 정책 엔진은 (signer / policy / action)을 데이터 모델로 두고, 각 객체를 EIP-712로 서명된 권한 객체로 표현해야 한다.
  - kind: technical
  - needs: ZeroDev Permissions / SmartSessions / EIP-712
- [ ] c21: 감사 로그는 (a) on-chain UserOperation events (b) AP2 Mandate 체인 (c) Stripe receipts·SPT log를 한 데 묶어야 한다.
  - kind: technical
  - needs: ACP / AP2 / ERC-4337

## Discussion
- [ ] c22: 풀스택 SaaS와 모듈러 컨트랙트는 단기적으로 분기지만, AgentKit·MetaMask Delegation Toolkit 등 어댑터 SDK가 둘을 흡수하는 방향으로 통합 중이다.
  - kind: interpretive
  - needs: AgentKit / MetaMask Toolkit docs
- [ ] c23: 카드 네트워크 결제와 온체인 결제는 dispute / chargeback 책임 모델이 달라, 같은 스마트 계정이 두 레일을 모두 지원하려면 별도 어댑터가 필요하다.
  - kind: interpretive
  - needs: TAP / AP2 / Crossmint dual-rail
