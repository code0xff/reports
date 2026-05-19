# Claims — AI 에이전트 결제와 스마트 계정

> 표기: `[ ]` 미수집 / `[~]` 부분 수집 / `[x]` 최소 출처 기준 충족.

## Introduction

- [ ] c01: 2024–2026년 Stripe, Visa, Mastercard, Google, OpenAI 모두 "AI 에이전트가 자율적으로 결제를 실행하는" 시나리오를 공식 제품·프로토콜로 발표했다.
  - kind: factual
  - needs: 각 회사의 공식 공지·블로그·기술 사양 1차 출처
- [ ] c02: 일반 EOA(개인키-주소 1:1) 모델은 AI 에이전트에게 정책·한도·세션을 강제할 수 있는 1차 메커니즘을 제공하지 않는다.
  - kind: interpretive
  - needs: ERC-4337/EIP 문서 또는 분석가 의견
- [ ] c03: "Agentic payment"는 사용자가 사전에 권한을 부여한 에이전트가 사용자의 명시적 클릭 없이 결제를 트리거하는 결제 흐름을 가리키며, 카드 네트워크는 이를 EMV "credentialed agent" 카테고리로 분리하기 시작했다.
  - kind: factual
  - needs: Visa Trusted Agent Protocol / Mastercard Agent Pay 공식 문서

## Background — Smart Account standards

- [ ] c04: ERC-4337는 별도 컨센서스 변경 없이 alt-mempool과 EntryPoint 컨트랙트만으로 계정 추상화를 구현하는 표준이며, EntryPoint v0.7과 v0.8이 공개되어 있다.
  - kind: technical
  - needs: ERC-4337 EIP 문서, eth-infinitism/account-abstraction 저장소
- [ ] c05: EIP-7702는 EOA가 트랜잭션 단위로 컨트랙트 코드를 "위임"받아 실행할 수 있도록 하는 새 트랜잭션 타입이며, 이더리움 Pectra 업그레이드에 포함되었다.
  - kind: technical
  - needs: EIP-7702 명세, Pectra 활성화 사실
- [ ] c06: ERC-7579는 모듈러 스마트 계정 인터페이스를, ERC-6900은 플러그인 기반 모듈러 계정 인터페이스를 정의하며 두 표준은 경쟁/상호 보완 관계다.
  - kind: technical
  - needs: ERC-7579·ERC-6900 EIP 문서, 양쪽 진영 비교 글
- [ ] c07: ERC-7710/ERC-7715는 스마트 계정이 외부에 권한을 "부여"하고 다른 dapp이 그 권한을 "요청"하는 표준을 정의한다.
  - kind: technical
  - needs: 두 EIP 문서
- [ ] c08: ERC-4337 EntryPoint 컨트랙트는 UserOperation 구조를 검증→실행→정산하는 단일 진입점이다.
  - kind: technical
  - needs: EntryPoint 소스 코드(eth-infinitism/account-abstraction)

## The Agentic Payments Product Landscape

- [ ] c09: Visa는 2025년 "Intelligent Commerce"와 "Trusted Agent Protocol(TAP)"을 발표했고, TAP은 카드 네트워크 메시지에 에이전트 신뢰 신호와 의도(intent)를 실어 보낼 수 있는 프로토콜이다.
  - kind: factual
  - needs: Visa 공식 페이지·블로그
- [ ] c10: Mastercard는 2025년 "Agent Pay"를 발표하며 Microsoft Agent Pay·IBM 등과 협력 사례를 공개했다.
  - kind: factual
  - needs: Mastercard 공식 보도자료
- [ ] c11: Stripe는 2025년 "Agentic Commerce Protocol(ACP)"과 LLM·에이전트용 Stripe Agent Toolkit·shared payment token 등을 공개했고, 일부 시나리오에서는 OpenAI와 공동 구현했다.
  - kind: factual
  - needs: Stripe 공식 블로그·문서, OpenAI 협업 공지
- [ ] c12: OpenAI는 ChatGPT/Operator에서 "Instant Checkout"과 ACP 통합을 통해 에이전트 결제를 라이브 출시했다.
  - kind: factual
  - needs: OpenAI 공지, Stripe ACP 페이지
- [ ] c13: Google은 2025년 "Agent Payments Protocol(AP2)"과 Agent-to-Agent(A2A) 표준을 공개했고, Mandate/Cart/Payment Credential 객체를 정의한다.
  - kind: factual
  - needs: Google AP2 깃허브, 블로그
- [ ] c14: Coinbase는 2025년 HTTP 402 기반 결제 프로토콜 x402와 Agent Kit(AgentKit)을 발표했고, 다수의 facilitator 구현이 GitHub에 존재한다.
  - kind: factual
  - needs: x402 깃허브 저장소, Coinbase 발표
- [ ] c15: Circle은 USDC와 CCTP·Agent Toolkit을 통해 AI 에이전트용 다체인 스테이블코인 결제 인프라를 제공한다.
  - kind: factual
  - needs: Circle 공식 문서
- [ ] c16: 다수의 스마트 계정 인프라 제공자(Safe, ZeroDev, Biconomy, Privy, Crossmint, Alchemy, thirdweb)가 "AI agent wallet" 또는 "agent-ready smart account" 포지셔닝을 명시적으로 갖고 있다.
  - kind: factual
  - needs: 각 회사 공식 문서/블로그 최소 한 곳씩

## Functional Comparison

- [ ] c17: 에이전트용 스마트 계정 구현은 공통적으로 "세션 키 + 정책(한도·머천트·만료)" 패턴을 제공한다.
  - kind: interpretive
  - needs: ZeroDev Permissions, Safe Session Key Module, Biconomy Modules 등 코드/문서
- [ ] c18: ERC-4337 Paymaster를 통해 가스를 USDC 등 스테이블코인으로 후원할 수 있으며, 이는 에이전트가 ETH를 보유할 필요 없는 결제 흐름을 가능하게 한다.
  - kind: technical
  - needs: ERC-4337 명세, Pimlico/Alchemy/Biconomy Paymaster 문서
- [ ] c19: Visa TAP과 Google AP2 모두 "Mandate"(권한 위임 자격)와 "intent verification"을 핵심 객체로 정의하지만 메시지 캐리어(카드망 vs HTTP/A2A)가 다르다.
  - kind: interpretive
  - needs: 양쪽 사양 문서 비교
- [ ] c20: x402 결제 흐름은 EIP-3009 `transferWithAuthorization` 같은 EIP-712 서명 결제를 활용하여, 사용자가 매 결제마다 온체인 트랜잭션을 직접 보내지 않아도 되게 한다.
  - kind: technical
  - needs: x402 facilitator 코드, EIP-3009 명세
- [ ] c21: 다체인 라우팅을 위해 Across·Li.Fi·Relay 같은 인텐트/브리지 인프라가 에이전트 SDK와 통합되는 사례가 존재한다.
  - kind: factual
  - needs: 공식 통합 발표
- [ ] c22: 카드 네트워크의 에이전트 결제 프로토콜은 dispute / chargeback / 소비자 보호를 카드 네트워크 책임으로 명시한다.
  - kind: factual
  - needs: Visa·Mastercard 공식 문서

## Code-level Analysis

- [ ] c23: eth-infinitism/account-abstraction 저장소의 `EntryPoint.sol`에서 `handleOps()`는 `_validatePrepayment` → 계정 `validateUserOp` 호출 → `_executeUserOp` 순서를 따른다.
  - kind: technical
  - needs: EntryPoint 소스
- [ ] c24: Safe v1.4의 4337 호환은 `Safe4337Module`(별도 모듈)을 통해 이루어지며, Safe 코어는 변경 없이 모듈러 확장으로 4337을 지원한다.
  - kind: technical
  - needs: safe-modules 저장소
- [ ] c25: ZeroDev Kernel v3은 ERC-7579 호환 모듈러 스마트 계정이며, "Permissions" 시스템으로 세션 키·서명자·정책을 분리한다.
  - kind: technical
  - needs: zerodevapp/kernel 저장소
- [ ] c26: Coinbase의 x402 reference facilitator는 EIP-3009 `transferWithAuthorization` 또는 EIP-2612 permit을 사용해 HTTP 402 응답에서 받은 결제 요구사항을 온체인 USDC 이체로 변환한다.
  - kind: technical
  - needs: coinbase/x402 저장소 facilitator 코드
- [ ] c27: Stripe Agent Toolkit(`@stripe/agent-toolkit`)은 LangChain/AI SDK 등을 위한 도구 셋을 제공하고, 결제 트리거가 가능하다.
  - kind: technical
  - needs: stripe/agent-toolkit 저장소
- [ ] c28: Google AP2는 `payment_protocol` repo에서 Mandate/Cart/Payment 객체를 정의하고, A2A 메시지로 직렬화한다.
  - kind: technical
  - needs: google-agentic-commerce/AP2 저장소

## Discussion

- [ ] c29: 에이전트 결제에서 가장 자주 지적되는 위협은 (a) 에이전트 권한 탈취/오용, (b) 머천트 측 프롬프트 인젝션 또는 위조 청구, (c) 다중 에이전트 환경의 책임 귀속 문제다.
  - kind: interpretive
  - needs: 보안 연구·업계 의견 1+
- [ ] c30: 표준 단편화(ACP, AP2, x402, TAP, MCP)가 단기 통합 부담을 만들지만, "스마트 계정 + 위임 + 세션 키" 추상화 위에서는 각 프로토콜이 어댑터 수준에서 합쳐질 수 있다.
  - kind: interpretive
  - needs: 통합 사례 또는 분석 글
