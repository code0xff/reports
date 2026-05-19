# AI 에이전트 결제와 스마트 계정 — 개념, 제품, 기능, 코드 분석

## 초록

이 보고서는 "AI 에이전트가 자율적으로 결제를 실행하는" 새 환경에서, 그 결제 권한을 안전하고 프로그래머블하게 표현하기 위해 등장하고 있는 **스마트 계정(Smart Account)** 인프라를 추적한다. 카드 네트워크(Visa Trusted Agent Protocol, Mastercard Agent Pay), 모델 사업자(OpenAI Instant Checkout + Stripe ACP), 클라우드(Google AP2), 그리고 온체인 결제 스택(Coinbase x402, Circle Agent Stack)이 2025년에서 2026년 사이에 거의 동시에 비슷한 결제 흐름을 표준화하기 시작했음을 보인다[^s06][^s09][^s11][^s15][^s17][^s23]. 그 공통 분모는 키 = 계정인 EOA(외부 소유 계정) 모델로는 충족할 수 없는 정책·세션·위임이며, ERC-4337[^s01], EIP-7702[^s02], ERC-7579[^s03], ERC-7710 / 7715[^s04][^s41]가 이 요구를 받쳐 주는 표준 스택이다. 본 보고서는 표준과 제품을 정리한 뒤, 대표적인 오픈소스 구현체(eth-infinitism EntryPoint, ZeroDev Kernel v3, Safe7579 Adapter, ERC-7579 SmartSession, Coinbase x402 facilitator, Pimlico ERC-20 Paymaster)의 코드 흐름을 인용해 "에이전트가 한 번의 결제를 만든다"는 동작이 실제로 어떤 함수 호출로 실현되는지 추적한다.

## 1. 서론 — AI 에이전트 결제에 왜 스마트 계정이 필요한가

2025년 가을부터 2026년 봄까지 약 7개월간, 결제 산업의 거의 모든 1차 사업자가 **에이전트 결제(agentic payments)** 제품을 발표했다. Visa는 2025년 10월 14일에 Trusted Agent Protocol(TAP)을 공개하며 "agent-initiated transactions를 기존 결제처럼 매끄럽고 안전하게 만든다"고 설명했고[^s06], Mastercard는 같은 해 Agent Pay 프로그램으로 "AI 에이전트가 사용자를 대신해 행동할 수 있는 인프라"라는 방향을 잡았다[^s09][^s10]. Stripe는 2025년 9월 29일 OpenAI와 함께 Agentic Commerce Protocol(ACP)을 공동 발표하고, ChatGPT 안에서 Etsy·Shopify 가맹점을 즉시 결제하도록 했다[^s11][^s14][^s32]. Google은 2025년 9월 17일 Agent Payments Protocol(AP2)을 공개했고[^s15], Coinbase는 같은 시기에 HTTP 402 기반 x402 결제 프로토콜을 출시했다[^s17][^s19]. Circle은 2026년 5월 Agent Stack을 묶어내며 USDC 지갑·CCTP·Nanopayments를 한 데 정렬했다[^s23].

이렇게 다양한 사업자가 동시에 같은 문제를 풀고 있다는 것은, 기존 결제 인프라의 가장 단순한 단위인 **개인키-주소 1:1의 EOA 모델**이 "AI 에이전트가 사용자를 대신해 결제한다"는 시나리오를 자연스럽게 표현하지 못한다는 뜻이다. Turnkey는 이 한계를 "EOA는 받는 토큰에 반응할 수도 없고, 개인키/시드 구문으로만 동작하며, 유연성이 부족하다"고 정리한다[^s46]. 즉 EOA에는 정책 엔진도, 세션 키도, 권한 위임도, 가스 후원도 1차 메커니즘으로 들어 있지 않다. 카드 네트워크는 카드 네트워크대로 이 문제를 "tokenization + agent intent"로, 모델 사업자는 "shared payment token + checkout endpoint"로, 온체인 측은 "스마트 계정 + 세션 키 + 페이마스터"로 풀고 있는 셈이다.

스마트 계정은 이 세 흐름의 공통 기층이다. 카드 네트워크는 자체 인프라를 들고 있지만, 그것을 받는 "지갑" 쪽에는 결국 정책/세션/위임을 표현할 수 있는 그릇이 필요하고[^s30][^s29], 온체인 결제 흐름에서는 그것이 곧 스마트 계정이다.

## 2. 배경 — 스마트 계정 표준 스택

### 2.1 ERC-4337 — 합의 변경 없는 계정 추상화

ERC-4337은 EVM의 합의 계층을 손대지 않고도 계정 추상화를 가능하게 하는 표준으로, 그 핵심은 별도의 alt-mempool과 EntryPoint 컨트랙트다. 명세는 "Account abstraction without consensus-layer protocol changes, instead relying on higher-layer infrastructure"라는 단순한 문장으로 시작한다[^s01]. UserOperation은 sender(스마트 계정), nonce, factory, callData, callGasLimit, verificationGasLimit, paymaster, signature 등의 필드를 가지며, EntryPoint는 verification → execution 두 단계로 이를 처리한다[^s01].

레퍼런스 구현인 `eth-infinitism/account-abstraction` 리포지터리는 "EntryPoint는 UserOperation을 검증하고, 필요하면 계정을 생성하고, 요청된 동작을 실행하고, 가스 결제와 환불을 관리한다"고 설명한다[^s25]. EntryPoint v0.8은 2025년 출시되어 EIP-7702 네이티브 지원, ERC-7562 검증 규칙, executeUserOp() 옵셔널 메서드를 추가했다[^s33].

### 2.2 EIP-7702 — EOA가 컨트랙트 코드를 위임받는 모델

EIP-7702는 새로운 트랜잭션 타입(SET_CODE_TX_TYPE = 0x04)을 정의하고, EOA가 자기 주소에 컨트랙트 코드를 "위임"할 수 있도록 했다[^s02]. 명세의 추상은 다음과 같다.

> "Add a new EIP-2718 transaction type that allows Externally Owned Accounts (EOAs) to set the code in their account. This is done by attaching a list of authorization tuples – individually formatted as `[chain_id, address, nonce, y_parity, r, s]` – to the transaction."[^s02]

이 트랜잭션은 EOA 보유자가 일시적으로 스마트 계정의 코드를 자기 주소에 끼워 넣고, 그 위에서 batching/sponsorship/세션 키 같은 기능을 즉시 쓸 수 있게 한다[^s02][^s46]. EIP-7702는 2025년 5월 7일 Pectra 하드포크에 포함되어 활성화되었다[^s46]. 4337과는 경쟁이 아니라 보완 관계이며, EntryPoint v0.8은 7702 위임을 1급 시민으로 다룬다[^s33].

### 2.3 ERC-7579 — 모듈러 스마트 계정의 최소 인터페이스

ERC-7579는 모듈러 스마트 계정과 모듈의 **최소 인터페이스**를 정의한다[^s03]. 모듈은 네 가지 타입으로 분류된다: validator(1), executor(2), fallback(3), hooks(4). 계정은 다음과 같은 함수를 노출한다.

```solidity
function installModule(uint256 moduleTypeId, address module, bytes calldata initData) external
```

이 함수는 호출자를 인증하고, 모듈의 `onInstall(initData)`를 호출하고, `ModuleInstalled` 이벤트를 발생시킨다[^s03]. 세션 키, 정책 엔진, 자동 거래 모듈 등이 모두 이 동일한 인터페이스 위에 얹힌다.

ERC-7579는 ZeroDev Kernel, Safe(Safe7579 Adapter 경유), Biconomy Nexus, Rhinestone, OpenZeppelin의 modular account preset이 모두 채택했고[^s26][^s27][^s35], 그래서 "신규 모듈러 스마트 계정의 사실상 표준"이 되었다는 평가가 따라붙는다[^s35]. 경쟁 표준인 ERC-6900은 모듈별 스토리지 네임스페이싱과 더 강한 검증 분리 등을 강제하며, Alchemy의 Modular Account 진영이 채택한다. ERC-7579는 명시적으로 "최소 인터페이스"를 표방하고 그 위에 스토리지/세부 분기 결정을 구현자에게 맡긴다 — 그래서 7579 진영이 더 빠르게 확산됐다는 것이 일반적인 해석이다[^s35].

### 2.4 ERC-7710 / ERC-7715 — 위임과 권한 요청

ERC-7710은 "스마트 컨트랙트가 다른 스마트 컨트랙트나 EOA에게 능력을 위임"하는 표준이다.

> "This proposal introduces a standard way for smart contracts to delegate capabilities to other smart contracts or Externally Owned Accounts (EOAs). The delegating contract (delegator) must be able to authorize a DelegationManager contract to call the delegator to execute the desired action."[^s04]

피위임자는 `redeemDelegations` 함수를 통해 위임을 행사하고, `DelegationManager`는 위임의 유효성을 검증한 뒤 본 컨트랙트의 권한 함수를 호출한다[^s41]. ERC-7715는 보완 표준으로, **dapp/AI 에이전트**가 사용자 지갑에 권한을 명시적으로 요청하는 방법을 정의한다. MetaMask는 이를 `wallet_grantPermissions` JSON-RPC와 함께 "Advanced Permissions"라는 이름으로 구현하며, "dapp(과 AI 에이전트)이 MetaMask 확장에서 직접 사용자로부터 권한을 요청할 수 있게 한다"고 명시한다[^s05].

이 두 표준은 카드 네트워크의 "Mandate"와 거의 동형의 추상을 제공한다 — 사용자가 사전에 "어떤 행위까지 누구에게 허락한다"를 서명으로 못박고, 에이전트는 그 범위 안에서만 결제를 트리거한다.

## 3. 에이전트 결제 제품 지형도

2025–2026년의 에이전트 결제 발표는 크게 네 층으로 분류된다.

### 3.1 카드 네트워크 — Visa TAP과 Mastercard Agent Pay

**Visa Trusted Agent Protocol**은 Cloudflare와 공동 설계되었고, HTTP Message Signature(RFC 9421)와 떠오르는 Web Bot Auth 위에서 동작한다[^s40]. 메시지는 (a) Agent Intent(에이전트가 이 머천트에서 구매할 의도가 있는지), (b) Consumer Recognition(이 에이전트가 어느 사용자/계정을 대표하는지), (c) Payment Information(토큰화된 결제 데이터)을 함께 실어 보낸다[^s07]. 모든 서명은 "머천트와 목적에 한정되며, 시간 제한이 있고, 리플레이/릴레이가 불가능"하다[^s07]. 리포지터리는 `visa/trusted-agent-protocol`로 공개되어 있고, "Establishing a universal standard of trust between AI agents and merchants for the next phase of agentic commerce"라는 한 줄로 정체성을 요약한다[^s08]. Adyen, Ant International, Checkout.com, Coinbase, CyberSource, Elavon, Fiserv, Microsoft, Nuvei, Shopify, Stripe, Worldpay 등 12개사가 런치 파트너로 등재되어 있다[^s40].

**Mastercard Agent Pay**는 2025년 4월 29일 발표된 에이전틱 결제 프로그램으로, 기존 토큰화 인프라 위에 "Agentic Token"을 얹는다[^s09]. PYMNTS는 Vosburg CSO의 발언을 다음과 같이 인용한다.

> "We're building the infrastructure for a new generation of intelligent transactions, where consumers and developers can empower AI agents to act on their behalf with trust, transparency and precision."[^s10]

Mastercard는 PayPal과의 협력을 별도 보도자료로, FIDO Alliance Payments WG와의 통합을 별도 자료로 발표했다[^s10]. 2026년 3월 4일 싱가포르에서 "세계 최초의 라이브 agentic 결제"가 DBS Bank, Hoppa 모빌리티와 함께 실행됐다는 마일스톤도 보도되어 있다[^s10] _(vendor-stated)_.

### 3.2 모델 사업자 — OpenAI + Stripe ACP

Stripe와 OpenAI는 2025년 9월 29일 **Agentic Commerce Protocol(ACP)**을 Apache 2.0으로 공개했다[^s11][^s12][^s37]. 핵심 객체는 **Shared Payment Token(SPT)**이다.

> "After the buyer uses their preferred payment method, Stripe issues a Shared Payment Token (SPT), a new payment primitive that lets applications like ChatGPT initiate a payment without exposing the buyer's payment credentials."[^s11]

SPT는 "특정 머천트와 카트 총액에 스코핑"되며[^s11], ChatGPT는 그 토큰을 머천트의 ACP checkout endpoint로 POST한다. ACP 리포지터리는 OpenAI와 Stripe가 founding maintainer로 공동 운영하고, OpenAPI 스펙·JSON 스키마·RFC를 포함한다[^s13]. 같은 날 OpenAI는 ChatGPT에서 미국 Etsy 판매자 단일 품목을 즉시 구매할 수 있는 Instant Checkout을 출시했고[^s32][^s14], Shopify의 100만 머천트(SKIMS, Glossier, Spanx, Vuori 등)로 확장한다고 발표했다[^s14]. Stripe는 이를 통해 "여러 PSP 중 하나"의 위치로 자리 잡고, ACP 위에 자신의 SPT가 첫 호환 토큰이 된다고 명시한다[^s11].

Stripe Agent Toolkit(`@stripe/agent-toolkit`)은 OpenAI Agents SDK, LangChain, CrewAI, Vercel AI SDK, MCP를 함수 호출 도구로 묶어 주며, "에이전트의 라이브 모드 접근을 제한하려면 restricted API key(`rk_*`)를 쓰라"는 안전 가이드를 강조한다[^s44].

### 3.3 클라우드 / 모델 — Google AP2와 A2A

Google은 2025년 9월 17일 **Agent Payments Protocol(AP2)**을 Coinbase와 60여 개 조직과 함께 공개했다[^s15]. AP2는 그 자체로 메시지 캐리어를 정하지 않고, **Agent2Agent(A2A)** 프로토콜과 **MCP**의 확장으로 동작할 수 있다고 명시한다[^s15]. 핵심 객체는 세 가지 Mandate다 — **Intent Mandate**(사용자가 사전에 서명한 의도), **Cart Mandate**(에이전트가 만든 카트에 사용자가 서명한 결과), **Payment Mandate**(특정 결제 수단으로 정산되도록 인증한 결과)이다[^s38][^s39]. 제3의 해설 자료는 "Credential Provider"라는 네 번째 역할이 사실상 존재한다고 본다 — PayPal, Apple Pay, Google Wallet, Coinbase Smart Wallet 같은 PCI 규제 지갑이 이 자리에 들어간다[^s39] _(interpretive)_. Adyen, American Express, Etsy, Forter, Mastercard, Mysten Labs, PayPal, Salesforce, Worldpay 등이 파트너로 발표되었다[^s15].

### 3.4 온체인 — Coinbase x402와 Circle Agent Stack

**x402**는 HTTP "402 Payment Required" 상태 코드를 부활시켜, 클라이언트가 서명된 결제를 요청 헤더에 실어 보내 자원을 받는 흐름을 정의한다[^s17][^s19]. "x402 is an open standard for internet native payments"라는 한 문장이 리포지터리 README의 정체성이다[^s17]. 결제는 facilitator라는 별도 서버가 검증(`/verify`)과 정산(`/settle`)을 담당하며, 자원 서버는 블록체인 인프라를 직접 운영하지 않아도 된다[^s19]. Coinbase Developer Platform이 호스팅하는 facilitator는 Base, Polygon, Arbitrum, World Chain, Solana 위에서 ERC-20 결제를 처리한다[^s19]. Cloudflare는 Coinbase와 함께 x402 Foundation을 출범시켰고, "Cloudflare 위의 사이트들이 매일 10억 건이 넘는 HTTP 402 코드를 내보낸다"는 점을 정량적 근거로 든다[^s20]. **Circle**은 2026년 5월 Agent Stack을 묶어 **Agent Wallets, Agent Marketplace, Circle CLI, Nanopayments(Circle Gateway 기반), Circle Skills**를 한 셋으로 정렬했다[^s23]. Circle은 별도로 "Build Autonomous Payments with Circle Wallets, USDC, and x402" 튜토리얼을 공개해 Circle Developer-Controlled Wallets + x402-express 미들웨어로 에이전트가 USDC로 API에 결제하는 코드 예시를 보였다[^s24].

### 3.5 스마트 계정 인프라 — Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit

이 층은 "에이전트가 들고 있는 지갑"을 만드는 쪽이다. ZeroDev Kernel은 ERC-4337 호환 + ERC-7579 모듈 + 가스 최적화를 표방하는 모듈러 스마트 계정이고[^s26], Safe는 Safe7579 Adapter를 통해 14개 Rhinestone 모듈을 사용할 수 있게 된다[^s27]. Biconomy Nexus는 ERC-7579, 4337, 7739, 7562, 7484 다섯 표준을 모두 따른다[^s35][^s36]. Privy는 "agent-controlled, developer-owned" 모델과 "user-owned with agent signer" 모델을 모두 지원하며, 정책은 전송 한도, 컨트랙트 화이트리스트, 수취인 제한, 시간 기반 제어로 표현된다[^s29]. Crossmint는 "dual-key" 아키텍처를 채택해 owner key는 사용자 보유, agent key는 TEE 안에서 운영하고, x402와 Visa/Mastercard 카드 레일을 동시에 지원한다[^s30]. Coinbase AgentKit은 "Every agent deserves a wallet"이라는 슬로건으로, LangChain, Eliza, Vercel AI SDK, MCP, OpenAI Agents SDK, Strands Agents를 묶고 50개 이상의 action provider를 노출한다[^s22]. 같은 진영의 Coinbase Agentic Wallets는 "AI 에이전트를 위해 설계된 최초의 지갑 인프라"로 자신을 정의한다[^s21].

## 4. 기능 비교 — 에이전트 결제용 스마트 계정의 핵심 기능

대부분의 구현체에서 다음 여섯 가지 능력이 공통적으로 등장한다.

**(a) 위임과 세션 키.** 사용자는 한 번의 서명으로 "이 키는 이 컨트랙트의 이 함수를, 이 한도 안에서, 이 시각까지" 행사할 수 있다고 못박는다. ERC-7579의 validator 슬롯이 그 자리이고[^s03], ZeroDev는 이를 "permissions system"으로 일반화했다[^s34]. Rhinestone과 Biconomy가 공동 개발한 ERC-7579용 SmartSession 모듈은 동일한 추상을 한 단계 더 표준화했다[^s28]. 카드 네트워크 측에서는 Visa TAP의 Agent Intent 클레임[^s07]과 AP2의 Intent Mandate[^s38]가 동일한 추상의 카드망 버전이다.

**(b) 정책 엔진과 가드.** Privy는 "Policies are critical as they define the boundaries within which your agents can operate"라고 명시하며 전송 한도, 컨트랙트/수취인 화이트리스트, 시간 기반 제어, 행위별 규칙을 정책으로 다룬다[^s29]. SmartSession은 같은 추상을 userOpPolicies, actionPolicies, ERC-1271 signature policy로 분리해 표현한다[^s28].

**(c) 가스 추상화와 후원.** ERC-4337의 Paymaster는 "user operation의 가스 결제 책임을 위임받는 특수 컨트랙트"다[^s42]. Pimlico의 오픈소스 ERC-20 Paymaster는 "유저가 ERC-20 토큰으로 가스를 내고, 오라클이 가격을 가져오게" 한다고 설명한다[^s42]. 이 덕에 에이전트는 ETH를 보유하지 않고도 USDC로만 결제할 수 있다.

**(d) 다체인·다자산.** Circle은 USDC를 CCTP로 체인 간 이동시키고 x402로 API 결제 단위까지 쪼개는 흐름을 묶었다[^s23][^s24]. LI.FI는 2026년에 "For Agents" 문서 탭과 Intents Stack을 정식 출시했고, 27개 브리지·31개 DEX·58개 체인을 단일 API로 추상화한다[^s43].

**(e) 인증·신원·소비자 보호.** Visa TAP은 카드 네트워크가 책임지는 dispute·chargeback 구조를 그대로 유지하면서 에이전트 신호만 추가로 운반한다[^s07]. Mastercard도 카드 네트워크 토큰화 위에 Agentic Token을 얹어 동일 모델을 유지한다[^s09]. AP2는 Verifiable Credentials와 FIDO 표준을 활용해 "non-repudiable audit trail"을 만든다는 입장이다[^s15].

**(f) 감사 가능성과 로그.** SPT는 "프로그램적으로 통제·권한·로깅"된다고 명시되고[^s12], AP2의 세 Mandate는 의도 → 카트 → 결제 순서의 서명 체인으로 비부인성을 만든다[^s15]. 온체인 측에서는 모든 UserOperation이 EntryPoint 이벤트로 영구 기록된다[^s25].

## 5. 코드 레벨 분석 — 대표 구현체 톺아보기

### 5.1 EntryPoint.handleOps — 모든 UserOperation의 단일 입구

`eth-infinitism/account-abstraction` 리포의 EntryPoint 컨트랙트에서, `handleOps`는 다음 시그니처로 시작한다.

```solidity
function handleOps(
    PackedUserOperation[] calldata ops,
    address payable beneficiary
) external virtual nonReentrant
```

내부적으로는 각 op에 대해 `_validatePrepayment`를 호출해 (a) UserOperation 해시 계산 (b) 가스 필드 상한(uint120) 검증 (c) `_validateAccountPrepayment` → 계정의 `validateUserOp` 호출 (d) nonce 유일성 확인 (e) paymaster가 있으면 `_validatePaymasterPrepayment` 호출의 순서로 사전 검증을 끝낸다[^s25]. 이후 `_executeUserOp`가 `innerHandleOp`를 저수준 호출로 실행하고, OOG / low-prefund / revert 세 가지 실패 모드를 분기 처리한 뒤 `_postExecution`에서 환불을 정산한다[^s25]. 즉 외부에서 보면 `handleOps(ops, beneficiary)` 한 줄이지만, 그 안에서 (1) 계정의 자가 인증, (2) paymaster의 가스 약속, (3) 실제 callData 실행, (4) 정산까지가 단일 트랜잭션 안에서 순서대로 일어난다[^s01][^s25].

EntryPoint v0.8은 같은 흐름 위에 EIP-7702 네이티브 지원과 ERC-7562 검증 규칙을 더했다[^s33]. v0.7과 비교했을 때 가장 큰 변화는 PackedUserOperation을 온체인 calldata-friendly 구조로 분리한 것과, 7702 위임 트랜잭션을 1급 시민으로 받아들이는 것이다[^s33].

### 5.2 ZeroDev Kernel v3 — ERC-7579 위에서 권한을 분리하기

ZeroDev Kernel은 "Compatible with ERC-4337, Modular (supports ERC-7579 plugins), Highly gas-efficient"라는 세 줄 정체성을 가진 스마트 계정이다[^s26]. EntryPoint 0.7 시점부터 Kernel v3은 기존 세션 키 개념을 "permissions system"으로 일반화했다.

> "In EntryPoint 0.7 (Kernel v3), session keys have been upgraded into a more powerful permissions system."[^s34]

세션 키 위임 흐름은 일반적으로 다음과 같이 진행된다. (1) 사용자가 대상 컨트랙트, 허용 selector, value 상한, 만료를 가진 permission 객체에 서명한다. (2) 그 권한을 표현하는 모듈을 `installModule(1, sessionKeyValidatorAddress, initData)` UserOperation으로 계정에 설치한다 — 여기서 모듈 타입 1은 validator이다[^s03]. (3) 이후 dapp(혹은 에이전트)이 UserOperation을 보내면, EntryPoint는 `validateUserOp`를 호출하고, 계정은 이를 세션 키 validator로 라우팅한다. (4) validator는 세션 키 서명을 검증하고, 호출이 인코딩된 scope 안에 있는지 확인한 뒤 성공을 돌려준다[^s03][^s34].

ERC-7579 동맹 진영의 공식 모듈은 `erc7579/smartsessions` 리포의 **SmartSession**이다. 모듈은 "ERC-7579 호환 스마트 계정에서 세션 키를 세밀하게 통제하기 위한 고급 모듈"이라고 자신을 소개하며 세 종류의 정책을 분리해 표현한다 — UserOperation 검증 정책, action별 정책, ERC-1271 서명 검증 정책[^s28]. 라이선스는 AGPL-3.0이고, "beta"라는 단서를 명시하고 있다[^s28].

### 5.3 Safe7579 Adapter — Safe 코어를 건드리지 않고 ERC-7579를 입히기

Safe는 다년간 검증된 코어를 그대로 둔 채로 ERC-7579를 받아들였다. Safe7579 Adapter는 Rhinestone과 Safe가 공동 개발한 스마트 컨트랙트로, "Safe Smart Account를 ERC-7579 호환으로 만든다"고 설명한다[^s27]. 어댑터는 Safe Module이자 Fallback Handler 두 역할을 동시에 수행한다 — 모듈로서는 ERC-7579 모듈을 Safe가 사용할 수 있게 하고, Fallback Handler로서는 Safe가 기본 제공하지 않는 `validateUserOp` 같은 함수를 받아낸다[^s27]. 이를 통해 "14개의 Rhinestone 감사 완료 모듈(dead man switch, flash-loan, social recovery 등)"이 곧장 Safe 위에서 사용 가능해진다[^s27].

이 설계는 카드 네트워크가 Visa/Mastercard 코어를 그대로 두고 에이전트 신호만 별도 메시지로 운반하는 방식과 구조적으로 매우 비슷하다 — 둘 다 검증된 결제 코어를 건드리지 않고 새 능력을 모듈/어댑터로 끼워 넣는 패턴이다.

### 5.4 Coinbase x402 — facilitator가 EIP-3009 transferWithAuthorization을 부른다

x402의 EVM 'exact' 스킴은 결제를 두 단계로 처리한다. **검증(Phase 2)**에서 facilitator는 다음을 차례로 확인한다.

1. "Verify the signature is valid and recovers to the `authorization.from` address."[^s18]
2. "Verify the `client` has sufficient balance of the `asset`."[^s18]
3. "Verify the authorization parameters (Amount, Validity Window) meet the `PaymentRequirements`."[^s18]
4. "Verify the Token and Network match the requirement."[^s18]
5. "Simulate `token.transferWithAuthorization(...)` to ensure success."[^s18]

**정산(Phase 3)**에서는 한 문장으로 끝난다.

> "Settlement is performed via the facilitator calling the `transferWithAuthorization` function on the `EIP-3009` compliant contract with the `payload.signature` and `payload.authorization` parameters from the `PAYMENT-SIGNATURE` header."[^s18]

여기서 `payload.authorization`은 `from`, `to`, `value`, `validAfter`, `validBefore`, `nonce` 필드를 가진 EIP-3009 구조이고[^s31], `payload.signature`는 그것에 대한 65바이트 EIP-712 서명이다[^s18]. USDC를 비롯한 EIP-3009 호환 토큰은 이 한 번의 트랜잭션으로 (1) 서명을 ecrecover로 검증하고 (2) nonce 사용 여부를 확인하고 (3) validAfter/validBefore 범위를 확인하고 (4) 내부적으로 이체를 실행한다[^s31]. 따라서 사용자는 prior approval 트랜잭션을 보내지 않고도 facilitator(혹은 가맹점)가 자신의 USDC를 한 번 이체해 가도록 허용할 수 있다 — 이게 x402가 "내부 어카운트나 API 키 없이 HTTP 한 번으로 결제"를 표방할 수 있는 이유다[^s17][^s31].

Circle은 같은 흐름을 자체 Express 미들웨어로 단순화해 보여 준다.

```typescript
app.use(
  paymentMiddleware(
    recipientWallet.address as `0x${string}`,
    { "GET /risk-profile": { price: "$0.01", network: "base-sepolia" } },
    { url: "https://x402.org/facilitator" }
  )
);
```

이 한 블록만 추가하면 임의의 Express 라우트가 "0.01달러를 USDC로 받아야 응답하는 API"가 된다[^s24].

흥미롭게도 x402 커뮤니티는 ERC-4337 스마트 계정의 UserOperation을 x402에 1급으로 받아들이자는 이슈를 공개해 두고 있다 — 즉 "EOA 서명으로 EIP-3009를 부른다"는 현재 흐름을, "스마트 계정의 UserOperation으로 결제를 위임한다"는 흐름으로 통합하려는 시도다[^s48].

### 5.5 Pimlico ERC-20 Paymaster — 가스 후원의 표준 구현

Pimlico의 `erc20-paymaster` 컨트랙트는 "이 리포는 ERC-4337 paymaster 구현을 담고 있고, 유저가 ERC-20 토큰으로 가스를 결제할 수 있게 하며, 오라클로 최신 가격을 가져온다"고 자신을 정의한다[^s42]. EntryPoint v0.7과 v0.6 모두를 지원하며, 정산 시 (1) validation 단계에서 maximum fee를 토큰으로 선취 (2) 실제 가스 사용량이 더 작으면 잔여분을 환불하는 패턴을 쓴다[^s42]. 라이선스는 MIT이며, 2025년 11월 6일자로 리포가 archived 처리되었고 후속 구현은 `pimlicolabs/singleton-paymaster`로 이전됐다[^s42] _(unverified — single source)_.

### 5.6 AP2 Mandate — 의도 → 카트 → 결제의 서명 체인

Google AP2의 `payment_protocol` 샘플 리포는 "Agent Payments Protocol의 코드 샘플과 데모"를 제공한다고 README에 적혀 있다[^s16]. 세 Mandate(Intent, Cart, Payment)는 모두 "tamper-proof, cryptographically-signed digital contracts that serve as verifiable proof of a user's instructions"로, Verifiable Credentials에 의해 서명된다[^s15]. 실제 데모는 Google ADK + Gemini 위에서 구현되어 있지만, AP2 자체는 그것에 종속되지 않는다고 명시한다 — "The Agent Payments Protocol doesn't require the use of either"[^s16]. 제3자 해설은 "Credential Provider"가 사실상 네 번째 역할로 동작하며 PayPal·Apple Pay·Google Wallet·Coinbase Smart Wallet 같은 PCI 규제 지갑이 이 자리에 들어간다고 본다[^s39].

### 5.7 Visa TAP — RFC 9421 위의 HTTP 헤더 서명

Visa TAP은 EVM 토큰 흐름과 달리 카드 네트워크 메시지 흐름이지만, "에이전트가 결제를 만든다"는 동일 문제를 푼다. 명세는 RFC 9421 HTTP Message Signature 위에 (1) 시간 제한 (2) 머천트 도메인 바인딩 (3) Ed25519 서명을 얹는다[^s40]. Visa 측 표현은 다음과 같다.

> "The protocol employs cryptographic message signatures that are specific to the merchant and purpose, and are time bound, cannot be replayed or relayed."[^s07]

머천트는 그 서명을 Visa가 운영하는 에이전트 공개키 디렉토리에 대조해 검증한다[^s40]. 헤더는 Agent Intent, Consumer Recognition, Payment Information(해시 카드 자격 / 토큰화 데이터 / 정산 정보)의 세 청크로 구분된다[^s07].

## 6. 논의 — 보안과 설계 트레이드오프

### 6.1 위협 모델

에이전트 결제는 결제 흐름의 가장 약한 고리를 "키"에서 "의도 파싱(intent parsing)"으로 옮긴다. 2026년 5월의 Grok/Bankr 사건은 이를 거의 교과서적으로 보여 줬다 — 공격자는 컨트랙트를 깬 게 아니라, 에이전트를 설득해 자신의 지갑을 사용하게 만들었다[^s47].

> "The failure point was intent parsing, not reentrancy, oracle manipulation or flawed blockchain infrastructure."[^s47]

학계 측에서는 AP2 자체를 prompt injection으로 공격한 "Whispers of Wealth" 논문이 같은 결론에 도달했다 — "simple adversarial prompts can reliably subvert agent behavior"[^s45].

이 두 결과는 모두 한 방향을 가리킨다. 스마트 계정의 정책 엔진(세션 키 한도, 머천트 화이트리스트, 시간 제한)은 "에이전트가 잘못 설득되었을 때 손실 상한을 끊는" 도구라는 점이다. 그래서 ZeroDev Permissions[^s34], SmartSession 정책[^s28], Privy policy[^s29], Crossmint dual-key + TEE[^s30] 같은 패턴이 동시에 진화한 것은 우연이 아니다.

### 6.2 표준 단편화

2026년 상반기 기준으로 에이전트 결제 스택은 최소 다섯 표준이 동시에 존재한다 — 상거래(ACP, UCP), 결제 인증(AP2), HTTP 결제(x402), 에이전트 신원(Visa TAP), 그리고 에이전트 도구·통신(MCP, A2A)[^s40]. 짧게 보면 통합 부담이지만, 길게 보면 "스마트 계정 + 위임 + 세션 키"라는 공통 추상 위에서는 각각이 어댑터 수준으로 결합 가능하다는 해석이 우세하다[^s40] _(interpretive)_. x402 측이 ERC-4337 UserOperation을 1급으로 받아들이는 이슈[^s48]나, Crossmint가 x402와 Visa/Mastercard 카드 레일을 같은 SDK에서 다루는 것[^s30]이 그 신호다.

### 6.3 규제와 UX 긴장

카드 네트워크 측은 자신들의 dispute / chargeback / KYC 책임을 그대로 유지한다는 선언으로 규제 부담을 사실상 카드 네트워크 안에 가두려 한다[^s07][^s09]. 반면 온체인 결제는 한도/세션/정책을 코드 수준에서만 강제할 수 있고, 사용자가 한 번 서명한 권한이 잘못 행사되었을 때의 dispute 경로가 아직 표준화되어 있지 않다. AP2가 Verifiable Credentials와 FIDO 표준을 끌어들인 것도 이 비대칭을 메우려는 시도로 읽힌다[^s15] _(interpretive)_.

## 7. 한계

- 본 보고서는 카드 네트워크와 모델 사업자의 클로즈드 베타 내부 구현은 다루지 못한다. Visa TAP의 디렉토리 운영, Mastercard Agentic Token의 정확한 token vault 동작, OpenAI Operator의 권한 모델은 공개 문서 수준으로만 다뤘다.
- 코드 인용은 메인 브랜치 README와 명세 문서 기준으로 작성되어 있으며, 특정 네트워크 배포본의 정확한 바이트코드까지는 검증하지 않았다.
- x402 거래량(50M+ tx)과 같이 벤더가 공개한 수치는 독립 감사를 거치지 않았으므로 `_(vendor-stated)_`로 표시했다.
- ERC-4337 EntryPoint, ERC-7579 모듈러 표준, EIP-7702는 2024–2026년 사이에 빠르게 변동했고, EntryPoint v0.8 / v0.9의 정확한 배포 주소 매트릭스는 추가 조사가 필요하다.
- 에이전트 결제 영역은 표준 단편화가 지속되고 있어, 본 보고서의 분류(카드 네트워크 / 모델 사업자 / 클라우드 / 온체인 / 인프라)는 향후 통합 흐름에 따라 재정렬될 가능성이 높다.
