# 스마트 계정 인프라 심층 비교 — Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit

## 초록

본 보고서는 2025–2026년 시점의 여섯 대표 스마트 계정/지갑 인프라(Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit)를 1차 소스로 추적한다. 같은 단어("스마트 계정")가 가리키는 범위는 제공자마다 명백하게 다르다 — Safe·ZeroDev·Biconomy는 ERC-4337[^s25] + ERC-7579[^s27] 컨트랙트 진영, Privy[^s14]·Crossmint[^s20]는 호스팅 키 인프라와 정책 엔진을 묶은 풀스택, Coinbase AgentKit[^s21]은 그 위에 다양한 지갑/AI 프레임워크 어댑터를 얹는다. 본 보고서는 (a) 아키텍처, (b) 표준 채택, (c) 모듈·플러그인, (d) 키 관리, (e) 가스/페이마스터, (f) 에이전트·세션 지원의 여섯 축으로 비교한 뒤, Safe7579 Adapter, ZeroDev Kernel v3 Permissions, Biconomy SmartSessions, Privy의 SSS+TEE, Crossmint dual-key+TEE, Coinbase Spend Permissions의 구현 패턴을 코드 인용과 함께 정리한다.

## 1. 서론 — 왜 인프라를 따로 봐야 하는가

"스마트 계정"은 EOA가 아닌 모든 컨트랙트 지갑을 포함하는 단어다. 하지만 같은 단어를 들고 시장에서 경쟁하는 회사들의 정체성은 서로 매우 다르다 — Safe는 "오랫동안 검증된 다중 서명 컨트랙트 지갑이 4337/7579를 어댑터로 받아들이는 모델"[^s01][^s03], ZeroDev는 "ERC-4337 + 7579 + 가스 최적화의 모듈러 스마트 계정"[^s05], Biconomy는 "스마트 계정의 운영체제"[^s11], Privy는 "TEE 기반 self-custodial 키 인프라 + 서버 지갑"[^s13][^s30], Crossmint는 "온체인 스마트 컨트랙트 위에 카드/스테이블코인 결제 레일을 동시에 묶은 풀스택"[^s17][^s20], Coinbase AgentKit은 "프레임워크와 지갑 모두에 agnostic한 에이전트 행위 인프라"[^s21]다. 그래서 어떤 축을 보느냐에 따라 동일한 비교가 다른 결론에 도달한다.

본 보고서는 여섯 개의 비교 축을 미리 박아두고 진행한다.

- **(a) 아키텍처** — 컨트랙트 지갑 자체 vs 키 인프라 vs 풀스택 SaaS 중 어디에 무게가 실리는가.
- **(b) 표준 채택** — ERC-4337 / ERC-7579 / EIP-7702 / ERC-7710·7715 / ERC-7484·7739 중 무엇을 따르는가.
- **(c) 모듈 · 플러그인** — 누구의 모듈 생태계 위에 서는가 (자체 / Rhinestone / 자체 정책 엔진).
- **(d) 키 관리** — EOA + 컨트랙트 / MPC / SSS+TEE / dual-key+TEE / 사용자 디바이스 중 어디에 키가 있는가.
- **(e) 가스 / 페이마스터** — ERC-4337 Paymaster를 그대로 쓰는가 자체 정산을 제공하는가.
- **(f) 에이전트 · 세션** — 세션 키, 권한 위임, 정책 엔진을 어떤 형태로 노출하는가.

## 2. 배경 — 공통 표준 스택

### 2.1 ERC-4337

ERC-4337은 "Account abstraction without consensus-layer protocol changes, instead relying on higher-layer infrastructure"라는 문장으로 시작하는 표준으로, EntryPoint 컨트랙트와 alt-mempool 위에 UserOperation을 흘려보낸다[^s25]. 본 보고서의 여섯 제공자는 모두 ERC-4337을 직간접적으로 지원한다.

### 2.2 ERC-7579 — 모듈러 인터페이스

ERC-7579는 모듈러 스마트 계정과 모듈의 **최소 인터페이스**를 정의한다 — "This proposal outlines the minimally required interfaces and behavior for modular smart accounts and modules to ensure interoperability across implementations"[^s27]. 네 가지 모듈 타입(validator, executor, fallback, hook)과 `installModule(uint256 moduleTypeId, address module, bytes calldata initData)`이 핵심 ABI다[^s27]. 채택 진영은 Safe(어댑터 경유), ZeroDev Kernel, Biconomy Nexus, Rhinestone, OpenZeppelin Contracts modular account preset 등으로[^s29], 본 보고서의 컨트랙트-중심 제공자 셋(Safe·ZeroDev·Biconomy)이 이 진영에 속한다.

### 2.3 EIP-7702 — EOA가 코드를 위임받는다

EIP-7702는 EOA가 자기 주소에 컨트랙트 코드를 일시적으로 위임받을 수 있게 하는 새 트랜잭션 타입(0x04)이다[^s26]. Safe는 별도 페이지로 7702를 "EOA에 코드와 스토리지를 부여하는 어카운트 추상화의 한 단계"라고 설명한다[^s02]. Biconomy Nexus는 "EIP-7702 (Ethereum account abstraction roadmap compatibility)"를 명시적으로 받아들이고[^s09], ZeroDev는 별도 `7702.zerodev.app` 도메인으로 예제 사이트를 유지한다[^s08].

### 2.4 ERC-7484 · 7739 · SmartSessions

Biconomy Nexus는 ERC-7579, ERC-4337 외에도 ERC-7739(nested EIP-712 ergonomics), ERC-7562(EIP-4337 검증 규칙), ERC-7484(모듈 보안 레지스트리) 다섯 표준을 동시에 따른다고 명시한다[^s09][^s28]. 세션 키는 별도 모듈인 `erc7579/smartsessions`에서 표준화된다 — "SmartSession is an advanced module for ERC-7579 compatible smart accounts, enabling granular control over session keys"[^s12].

## 3. Provider Deep Dive

### 3.1 Safe — 검증된 코어 + 어댑터로 4337/7579/7702를 받아들이는 모델

Safe Smart Account는 다중 서명 컨트랙트 지갑으로 가장 오래 운영되어 온 표준 중 하나다. 핵심 설계 원칙은 **"코어를 건드리지 않는다"**다. Safe는 ERC-4337을 코어에 박지 않고 **Safe4337Module**을 통해 외부 모듈로 받아들인다 — "Safe ERC-4337 compatibility is provided via Safe Modules and the Fallback Handler"[^s01]. 모듈은 (1) Safe Module로서 4337 호환 실행을 가능하게 하고, (2) Fallback Handler로서 EntryPoint가 호출하는 `validateUserOp` 같은 함수를 받아낸다[^s01]. 이 모듈은 Safe v1.4.1 이상에서 옵션으로 활성화된다[^s01].

ERC-7579는 같은 방식으로 **Safe7579 Adapter**가 처리한다. Adapter는 Rhinestone과 Safe가 공동 개발한 컨트랙트로, Safe Module이자 Fallback Handler 두 역할을 동시에 맡는다[^s03]. 통과되는 능력은 Rhinestone 진영의 14개 감사 완료 모듈 — dead man switch, flash-loan, social recovery 등 — 이 Safe 코어를 건드리지 않은 채 곧장 쓸 수 있게 된다는 점이다[^s03]. `safe-modules` 리포는 4337 모듈, Allowance 모듈, Passkey 모듈, Recovery 모듈을 함께 호스팅한다[^s04]. 라이선스는 LGPL-3.0[^s04].

EIP-7702에 대해서 Safe는 "EIP-7702는 EOA가 코드와 스토리지를 갖게 하는 한 단계"라고만 명시하고[^s02], 실제 통합은 7702 페이지에서 별도로 추적한다. 7702와 4337의 합쳐진 흐름이 Safe Smart EOA의 핵심 사용 사례다.

핵심 한 줄: **Safe = "코어는 그대로, 능력은 모듈로 / 어댑터로 추가한다."** 이 설계는 이 보고서가 다루는 다른 제공자들의 모듈 선택 자유도를 가장 직접적으로 보장하는 형태다.

### 3.2 ZeroDev — Kernel v3 + Composable Permissions

ZeroDev의 핵심 제품은 컨트랙트 자체인 **Kernel**이다. 리포 한 줄 소개는 "Kernel is a smart contract account that is: Compatible with ERC-4337, Modular (supports ERC-7579 plugins), Highly gas-efficient"[^s05]. ZeroDev는 Kernel v3 출시 발표에서 자기 자신을 "First modular account for EntryPoint 0.7, First audited account for ERC-7579, First account with composable permissions"라고 표현했다[^s08] _(vendor-stated)_. Pimlico의 비교 페이지도 같은 진영의 다른 1차 자료로서 "Kernel은 가장 널리 쓰이는 모듈러 스마트 계정"이라고 평한다[^s33].

ZeroDev Kernel v3의 권한 모델은 **세션 키를 "permissions system"으로 일반화한 것**이다 — "In EntryPoint 0.7 (Kernel v3), session keys have been upgraded into a more powerful permissions system"[^s07]. ZeroDev가 권한을 표현하는 추상은 세 개의 객체다 — "Who (what key) can perform the action? When (under what condition) can the action be performed? What is the action anyways?"[^s06]. 즉,

- **Signer (Who)** — ECDSA / WebAuthn / Multisig 등 키 타입과 알고리즘을 지정한다.
- **Policy (When)** — 한도, 컨트랙트 화이트리스트, 시간 윈도우 등 조건을 지정한다.
- **Action (What)** — 호출할 실행 함수를 지정한다.

권한은 N개의 정책(최대 254개)과 1개의 시너로 조합 가능하다는 것이 launch spec에 명시되어 있다[^s34]. UserOperation을 받으면 Kernel은 (1) 모든 정책을 통과시키고 (2) 시너가 userOpHash에 대해 서명했는지 확인한 뒤 실행으로 넘어간다[^s34]. 이 분리 덕에 같은 키가 한도가 다른 두 권한을 동시에 들 수 있고, 그 결과 에이전트 결제·자동화·소셜 복구가 한 인터페이스에서 표현된다.

### 3.3 Biconomy — Nexus + SmartSessions

Biconomy는 자기 새 스마트 계정을 **Nexus**라고 부르고, 이를 "스마트 계정을 위한 운영체제"로 포지셔닝한다 — "Nexus is a minimal & non-opinionated implementation"[^s11]. Nexus는 ERC-7579, ERC-4337, ERC-7739, ERC-7562, ERC-7484 다섯 표준을 동시에 따른다고 자체 문서에 명시한다[^s09][^s28]. 코어 구성은 (1) Minimal Proxy 코어 계정, (2) Validation 모듈(ECDSA/passkey/custom), (3) Execution 모듈(batch/automation/cross-chain), (4) Fallback Handler의 4분할이다[^s09]. 라이선스는 MIT[^s10].

Biconomy의 세션 키는 별도 모듈인 **SmartSessions**로 처리된다. SmartSessions는 Rhinestone과 Biconomy가 공동 저작한 ERC-7579 모듈로, 세 종류의 정책으로 권한을 표현한다 — UserOperation 검증 정책, action별 정책, ERC-1271 서명 검증 정책[^s12]. SmartSessions의 설치 흐름은 (1) SmartSession 컨트랙트를 배포 (2) 스마트 계정에 모듈 설치 (3) 세션을 정책과 함께 설정 (4) 세션 키로 동작을 수행하는 4단계로 표준화되어 있다[^s12]. 즉 ZeroDev Permissions의 signer/policy/action 추상과 거의 동형의 추상이 다른 진영에도 동일하게 존재한다.

Nexus는 추가로 "Enable Mode"로 모듈을 트랜잭션 중에 즉시 활성화하는 패턴과, "Resource Locking" 타임락으로 모듈 즉시 제거를 막아 체인 추상화의 더블 스펜드 방지를 만든다[^s11].

### 3.4 Privy — Embedded + Server Wallets, SSS + TEE 기반 자기 보관

Privy는 컨트랙트 자체보다는 **키 인프라와 정책 엔진**에 무게를 둔다. 제품 표면은 두 갈래로 나뉜다 — embedded wallets(앱에 박혀 사용자 상호작용을 처리)와 server wallets(API로 백엔드가 자율적으로 처리)다[^s14]. "high-performance self-custodial wallets that work on any chain"[^s13]이라는 한 줄이 정체성을 요약한다.

핵심 보안 아키텍처는 **SSS(Shamir's Secret Sharing) + TEE(AWS Nitro Enclaves)** 조합이다. Privy 공식 보안 페이지의 한 줄은 "Keys are only stored as encrypted shares distributed across separate security boundaries"[^s15]. 키는 2-of-2 SSS로 (1) Enclave 샤드(TEE 키로 암호화) (2) Auth 샤드(Privy가 사용자 자격증명으로 잠금)로 쪼개진다. 두 샤드 모두 TEE 내부에서만 잠시 결합해 서명을 만들고, 즉시 다시 흩어진다[^s30]. 이는 "self-custodial을 유지하면서 단일 인프라 제공자에게 키 보안을 의존하지 않는다"는 명시적 목표를 갖는다[^s30].

에이전트 시나리오는 별도 페이지에서 두 모델로 정리된다 — (1) 에이전트가 제어하고 개발자가 소유한 지갑, (2) 사용자가 소유하고 에이전트를 시너로 추가한 지갑[^s16]. 어느 쪽이든 정책이 1급 시민이다 — "Policies are critical as they define the boundaries within which your agents can operate"[^s16]. 정책 표현은 전송 한도, 컨트랙트 화이트리스트, 수취인 제한, 시간 기반 제어, 행위별 규칙이다[^s16].

핵심 한 줄: **Privy = "TEE 안에서만 결합되는 키 + 정책 엔진을 SaaS로 제공한다."** 컨트랙트 진영(Safe/ZeroDev/Biconomy)과 직접 경쟁이라기보다는 그 아래에 키 인프라를 공급하는 위치에 가깝다 — 실제로 Coinbase AgentKit은 Privy를 자기 WalletProvider 중 하나로 받는다[^s21].

### 3.5 Crossmint — Smart-contract Wallets + Dual-Key + Card/USDC Rails

Crossmint는 **스마트 컨트랙트 지갑 + 카드 발급 + 스테이블코인 결제 + AI 에이전트 도구**를 하나의 API로 묶는 풀스택을 표방한다 — "Give agents fiat and stablecoin wallets, and issue virtual cards via Visa Intelligent Platform"[^s17]. 50개 이상의 블록체인을 단일 API로 추상화한다는 점이 wallet-infrastructure 페이지의 자체 포지셔닝이다[^s20].

키 모델은 **dual-key + TEE**다. 두 개의 키가 한 스마트 컨트랙트 지갑 안에서 분리되어 동작한다 — Owner Key는 사용자 측에 남아서 "halt the agent, withdraw … or modify permissions"라는 마스터 오버라이드 역할을 하고[^s19], Agent Key는 TEE 안에서만 매일의 거래를 서명한다[^s18]. 이 분리 덕에 Crossmint는 같은 지갑이 x402 stablecoin payment와 Visa/Mastercard 카드 결제를 동시에 운용한다는 시나리오를 광고한다[^s17].

또 다른 설계 특징은 **컨트랙트 기반이라 시너를 교체할 수 있다**는 점이다 — "Crossmint wallets are based on open-source smart contracts, replacing fragile single-key setups with resilient, onchain security"[^s20]. 이는 vendor lock-in 회피를 명시적 자산으로 내세우는 포지셔닝이다. 컴플라이언스는 SOC 2 Type II 인증이 wallet-infrastructure 페이지에 명시되어 있고[^s20], MiCA CASP 인가는 Crossmint 자체 비교 페이지에서 확인된다 _(vendor-stated)_[^s35].

### 3.6 Coinbase AgentKit — 프레임워크/지갑 agnostic 행위 인프라

Coinbase AgentKit은 컨트랙트가 아니라 **AI 에이전트가 온체인에서 행위하기 위한 통합 SDK**다. 공식 정의는 "AgentKit is a framework for easily enabling AI agents to take actions onchain. It is designed to be framework-agnostic, so you can use it with any AI framework, and wallet-agnostic, so you can use it with any wallet"[^s22]. 이 두 줄이 핵심이다 — 프레임워크와 지갑 모두에 잠금이 없다고 선언한다.

AgentKit은 두 종류의 플러그인을 받는다.

- **WalletProvider** — `CdpEvmWalletProvider`, `CdpSmartWalletProvider`, `ViemWalletProvider`, **`PrivyWalletProvider`**, **`ZeroDevWalletProvider`**, `CdpV2SolanaWalletProvider`, `SolanaKeypairWalletProvider` 등이 제공된다[^s22]. 즉 Privy와 ZeroDev 같은 다른 제공자가 곧장 backend로 들어올 수 있다.
- **ActionProvider** — 50+ 액션(TypeScript), 30+ 액션(Python). Compound, Uniswap, OpenSea, Across, Jupiter, Morpho, Superfluid 등 40+ 프로토콜과 묶여 있다[^s22][^s31].

라이선스는 Apache-2.0이고, 약관은 Coinbase Developer Platform Terms of Service에 종속된다[^s21]. 프레임워크 통합은 LangChain, Vercel AI SDK, MCP, OpenAI Agents SDK, Eliza, Strands Agents, AutoGen으로 명시되어 있다[^s21].

Coinbase의 같은 진영에는 두 가지 보완 인프라가 함께 있다.

- **CDP Wallets / Smart Accounts** — 사용자가 EOA와 함께 또는 별도로 smart account를 받을 수 있고, EOA가 그 smart contract wallet의 시너 역할을 한다[^s24]. 가스 후원·트랜잭션 배칭·spend permission을 모두 사용 가능[^s24].
- **Spend Permissions** — 별도 컨트랙트(`SpendPermissionManager`)로, "Spend Permissions enable apps to spend native and ERC-20 tokens on behalf of users"라는 한 줄로 정체성을 요약한다[^s23]. SpendPermissionManager는 Coinbase Smart Wallet의 owner로 추가되어 정해진 한도 안에서 사용자 자금을 옮길 권한을 갖는다[^s23]. 흥미로운 설계 결정은 **ERC-4337 EntryPoint를 사용하지 않는다**는 것 — 그렇게 해서 Paymaster가 사용자의 토큰을 가스로 소진하는 시나리오를 막는다[^s23].
- **Agentic Wallets** — Coinbase는 자신이 "AI 에이전트를 위해 설계된 최초의 지갑 인프라"라고 자기 포지셔닝한다[^s32] _(vendor-stated)_.

핵심 한 줄: **Coinbase AgentKit = "지갑 / 정책 / 액션을 모듈로 받고, AI 프레임워크와 묶어 에이전트의 행위 레이어를 만든다."**

## 4. Comparison — 기능 매트릭스

| 축 | Safe | ZeroDev | Biconomy | Privy | Crossmint | Coinbase AgentKit |
|---|---|---|---|---|---|---|
| 핵심 자산 | Smart Account 컨트랙트 + 모듈 | Kernel 컨트랙트 + Permissions | Nexus 컨트랙트 + Modules | TEE 키 인프라 + 정책 SaaS | Smart-contract 지갑 + 카드/USDC 풀스택 | Action / Wallet adapter SDK |
| ERC-4337 | ✓ via `Safe4337Module`[^s01] | ✓ via Kernel(EP 0.7)[^s07] | ✓ via Nexus[^s09] | ✓ smart-wallet 통합 옵션[^s14] | ✓ 컨트랙트 지갑 기반[^s20] | ✓ 다양한 WalletProvider 경유[^s22] |
| ERC-7579 | ✓ via `Safe7579 Adapter`[^s03] | ✓ Kernel v3[^s05][^s08] | ✓ Nexus[^s09][^s10] | — (외부 SC 지갑에 위임) | 명시되지 않음 (자체 컨트랙트) | — (지갑 어댑터에 의존) |
| EIP-7702 | ✓ docs 제공[^s02] | ✓ 7702.zerodev.app 예제 사이트[^s08] | ✓ Nexus 명시[^s09] | — | — (스마트 컨트랙트 모델) | — (WalletProvider별) |
| Custody 모델 | 컨트랙트 다중서명 + 모듈 | 컨트랙트 + Permissions | 컨트랙트 + Modules | SSS 2-of-2 + TEE[^s15][^s30] | Dual-key + TEE[^s18][^s19] | WalletProvider별 위임 |
| Paymaster / Gas | 별도 4337 인프라 사용 | 자체 정산 + ERC-4337 Paymaster[^s05] | Nexus Paymaster[^s09] | Embedded 가스 후원[^s14] | 가스 후원 + Visa 결제 동시[^s17] | WalletProvider별 |
| 세션 / 권한 | Safe7579 Adapter 위의 모듈 (e.g. SmartSessions)[^s03] | Composable Permissions (signer/policy/action)[^s06][^s34] | SmartSessions 모듈[^s12] | Policies (한도/화이트리스트/시간)[^s16] | Owner/Agent Key + 한도/머천트 화이트리스트[^s18] | WalletProvider별 + Spend Permissions[^s23][^s24] |
| 다중 체인 | Safe 자체가 멀티체인 | 15+ EVM 체인 | EVM 위주 | "any chain"[^s13], 솔라나 포함 | 40+ 체인[^s18], 50+ 위주[^s20] | EVM + Solana[^s22] |
| 라이선스 | LGPL-3.0[^s04] | MIT[^s05] | MIT[^s10] | 사용 약관(SaaS) | 사용 약관(SaaS) + 오픈소스 컨트랙트[^s20] | Apache-2.0[^s21] |

여섯 제공자 중 ERC-7579를 직접 채택한 것은 Safe(어댑터 경유), ZeroDev(Kernel), Biconomy(Nexus) 셋이고[^s29], 나머지 셋(Privy, Crossmint, Coinbase)은 7579를 직접 채택하지 않거나 어댑터/외부 컨트랙트로 위임한다 _(interpretive)_[^s35].

## 5. 구현 패턴 — 코드 레벨 톺아보기

### 5.1 Safe — Module + Fallback Handler 더블 등록

Safe는 코어를 변경하지 않기 때문에, 4337/7579의 진입점 함수를 받기 위한 **Fallback Handler**가 핵심이다. Safe4337Module은 두 가지 인터페이스를 동시에 만족한다.

1. **Safe Module로서** — 모듈이 Safe 계정에 등록되어, 트랜잭션 실행에 참여할 수 있게 된다.
2. **Fallback Handler로서** — Safe가 기본으로 가지지 않은 `validateUserOp(...)` 같은 함수를 외부에서 호출했을 때 받아낸다.

EntryPoint가 `validateUserOp`를 호출하면 Safe Proxy가 fallback handler에 위임하고, handler는 Safe 소유자의 서명을 검증한다[^s01]. 검증이 끝나면 EntryPoint가 다시 `executeUserOp`를 호출해 사용자 콜데이터를 실행한다[^s01]. 7579 어댑터도 동일한 더블 등록 패턴을 쓴다 — Safe7579 Adapter는 Module + Fallback Handler로 동시에 등록되어 Safe 코어를 건드리지 않고 7579 모듈을 받아들인다[^s03].

이 패턴의 매력은 **검증된 Safe 코어가 6년 넘게 운영된 그 상태로 유지된다**는 것이다 — 새 능력은 어댑터/모듈 형태로만 추가된다.

### 5.2 ZeroDev Kernel — `installModule(1, sessionKeyValidator, initData)`

Kernel v3은 ERC-7579 위에서 세션 키를 일반화된 Permissions로 표현한다[^s07]. 표준 7579 ABI를 그대로 쓴다:

```solidity
function installModule(uint256 moduleTypeId, address module, bytes calldata initData) external
```

여기서 `moduleTypeId = 1`은 validator 슬롯이다[^s27]. 세션 키 모듈을 validator로 설치하면, 그 모듈은 (1) UserOperation에 포함된 서명이 세션 키의 것인지 (2) 호출 selector·value·만료 등이 인코딩된 policy 안에 있는지를 검증하고 결과를 EntryPoint에 돌려준다[^s07]. ZeroDev의 Permissions 모델에서는 이 한 모듈 안에 N개의 정책(최대 254개)과 1개의 시너가 합쳐져 있다고 명시되어 있다[^s34]. 즉 같은 세션 키가 "USDC 100달러까지 자동 결제 + 화이트리스트된 머천트만 + 24시간 안에"라는 식의 합성 권한을 동시에 들 수 있다.

### 5.3 Biconomy Nexus + SmartSessions — Enable Mode와 정책 분리

Biconomy SmartSessions의 설치 흐름은 정확히 같은 7579 ABI를 따른다. 표준화된 4단계는 (1) SmartSession 컨트랙트 배포 (2) 스마트 계정에 모듈 설치 (3) 정책과 함께 세션 구성 (4) 세션 키로 동작 수행이다[^s12]. 정책은 세 종류로 분리된다 — UserOperation 검증 정책, action별 정책, ERC-1271 서명 검증 정책[^s12]. Nexus는 추가로 **Enable Mode**로 모듈을 트랜잭션 한가운데에서 활성화하는 패턴과, **Resource Locking** 타임락으로 모듈 즉시 제거를 방지해 체인 추상화 시 더블 스펜드를 막는다[^s11]. 라이선스는 MIT[^s10].

ZeroDev Permissions와 SmartSessions는 결과적으로 같은 추상(signer/policy/action)이지만, ZeroDev가 한 모듈 안에서 합성을 다루는 반면 SmartSessions는 정책 종류별로 모듈을 분리하는 식의 단위 차이가 있다 _(interpretive)_[^s06][^s12].

### 5.4 Privy — Authorization Key + SSS + TEE 결합

Privy의 서버 지갑은 백엔드가 보유한 **authorization key**로 API를 인증한다 — 사용자 디바이스가 아닌 백엔드가 책임 주체다[^s16]. 그 위에서 정책 엔진이 전송 한도·컨트랙트 화이트리스트·수취인 제한·시간 기반 제어를 강제한다[^s16].

서명 자체는 항상 TEE 안에서 일어난다. Privy의 키 보관 흐름은 (1) 키를 SSS로 2-of-2 분할 (2) Enclave 샤드는 TEE 키로 암호화, Auth 샤드는 사용자 자격증명으로 잠금 (3) 서명이 필요하면 두 샤드를 TEE 안에서만 잠시 결합 (4) 즉시 다시 분산이라는 4단계다[^s30]. 결과적으로 키의 완전 형태는 "특정 인증된 동작이 진행되는 짧은 순간"에만 메모리 안에 존재한다[^s15].

흥미롭게도 Coinbase AgentKit의 `PrivyWalletProvider`는 이 인프라를 그대로 받아 AgentKit 사용자에게는 EOA-like 인터페이스로 노출한다[^s21]. 즉 Privy의 키 인프라는 다른 진영의 컨트랙트 모델과 자연스럽게 합쳐진다.

### 5.5 Crossmint — Dual-Key + TEE

Crossmint의 스마트 컨트랙트 지갑은 두 키가 같은 컨트랙트의 owner로 들어 있는 구조다. **Owner Key**는 사용자 측에 남아 "the owner can use it to halt the agent, withdraw"라는 마스터 오버라이드를 담당한다[^s19]. **Agent Key**는 TEE 안에서만 운영되어 매일의 트랜잭션을 서명한다[^s18]. 컨트랙트 가드는 스토리지에 박힌 정책(머천트 화이트리스트·한도)을 강제한다.

이 dual-key 모델은 사용자가 키를 잃어버려도 owner key로 복구할 수 있게 만들고, agent key가 탈취되어도 owner key가 더 강한 권한으로 즉시 정지를 걸 수 있게 만든다는 점에서, "단일 키 + 단일 서명"의 EOA 모델과 정반대 방향의 설계다. Crossmint 자체 비교 글은 이 모델을 "Single-Key Setup에 대비된 resilient 설계"로 표현한다[^s20].

### 5.6 Coinbase — WalletProvider + Spend Permissions

Coinbase AgentKit의 코어 추상은 `WalletProvider`와 `ActionProvider`이다[^s22]. 새 액션을 추가하려는 개발자는 `ActionProvider`를 상속하고 `@CreateAction` 데코레이터로 함수를 등록한다[^s22]. 이렇게 등록된 액션은 LangChain·OpenAI Agents SDK·Vercel AI SDK 등의 함수 호출 도구로 노출된다[^s21].

`SpendPermissionManager`는 별도 컨트랙트로 동작하는 더 단순한 권한 모델이다. 한 줄 정의는 "Spend Permissions enable apps to spend native and ERC-20 tokens on behalf of users"[^s23]. 핵심 구현 디테일은 (1) SpendPermissionManager가 사용자 Smart Wallet의 owner로 추가된다 (2) spender(앱)는 manager에 `spend(...)`를 호출한다 (3) manager가 한도 안인지 검증하고 사용자 계정에서 토큰을 옮긴다는 순서다[^s23]. ERC-4337 EntryPoint를 거치지 않는 의도적 설계는 paymaster가 사용자 토큰을 가스로 소진하는 시나리오를 차단하기 위함이다[^s23]. 라이선스는 MIT[^s23].

CDP Smart Wallet은 그 위에서 "EOA가 smart contract wallet의 시너 역할을 한다"는 모델로 동작한다 — 사용자는 옵션으로 EOA + smart account를 함께 받고, 가스 후원·트랜잭션 배칭·spend permission이 추가 옵션으로 켜진다[^s24].

## 6. 논의 — 트레이드오프와 선택 기준

### 6.1 모듈러 컨트랙트 vs 풀스택 SaaS

여섯 제공자는 두 가지 큰 진영으로 갈린다.

- **모듈러 컨트랙트 진영(Safe, ZeroDev, Biconomy)** — ERC-4337/7579 위에서 모듈 호환성을 핵심 자산으로 삼는다. 같은 SmartSessions 모듈을 세 제공자의 계정 어디에 설치해도 동작한다는 점이 가장 큰 마케팅 포인트다 _(interpretive)_[^s28]. 단점은 호스팅 키 관리·정책 SaaS·카드 발급 같은 운영 기능을 직접 만들어야 한다는 것이다.
- **풀스택 SaaS 진영(Privy, Crossmint, Coinbase CDP)** — 키 관리부터 정책 엔진, 가스, 컴플라이언스, 카드 발급까지 한 API로 묶는다. 빠른 적용에 절대적으로 유리하지만, 컨트랙트가 그들의 소유라는 점에서 vendor lock-in 위험을 분석가들이 자주 지적한다 _(interpretive)_[^s35].

이 분기는 깔끔하지 않다. Coinbase AgentKit은 풀스택 진영에 속하지만 동시에 `ZeroDevWalletProvider`와 `PrivyWalletProvider`를 받아들여 다른 진영을 흡수한다[^s22]. Crossmint는 SaaS이지만 컨트랙트는 오픈소스라고 명시한다[^s20]. Safe는 모듈러 컨트랙트이지만 Safe{Core} SaaS도 운영한다.

### 6.2 세션 키 추상의 수렴

흥미로운 관찰은 **여섯 제공자 모두가 거의 같은 추상에 도달했다**는 것이다. ZeroDev Permissions의 signer/policy/action[^s06], SmartSessions의 (UserOp policy / action policy / signature policy)[^s12], Privy Policies의 (전송 한도 / 컨트랙트 화이트리스트 / 수취인 제한 / 시간 윈도우 / 행위별 규칙)[^s16], Crossmint의 (owner key + agent key + 머천트 화이트리스트 + 한도)[^s18], Coinbase Spend Permissions의 (spender + recipient + amount + recurring period)[^s23]는 표현 방식만 다른 같은 추상이다.

이 수렴은 7579 모듈 생태계가 만든 사실상의 표준일 가능성이 크다 — Rhinestone과 Biconomy가 공동 저작한 SmartSessions가 표준 후보로 자리잡고[^s12], ZeroDev가 거의 같은 추상을 자체 Permissions로 갖고 있고[^s06], 풀스택 SaaS들이 동일한 정책 객체를 자기 SDK로 노출하는 셈이다.

### 6.3 키 모델의 분기

키 모델은 오히려 분기가 크다.

- **EOA + 컨트랙트(Safe, ZeroDev, Biconomy)** — 사용자 EOA가 컨트랙트 지갑의 owner/시너이고, EIP-7702가 활성화되면서 EOA 자체가 컨트랙트 코드를 받아들일 수도 있다[^s02][^s09].
- **SSS + TEE(Privy)** — 키를 분할하고 TEE 안에서만 결합[^s15][^s30].
- **Dual-Key + TEE(Crossmint)** — 두 키가 같은 컨트랙트의 owner로 들어가고, 한쪽은 TEE 안에서만 동작[^s18][^s19].
- **WalletProvider 위임(Coinbase AgentKit)** — CDP / Privy / ZeroDev / Viem 중 어느 모델이든 흡수[^s22].

따라서 "스마트 계정"이 보안 모델까지 결정하지 않는다는 점이 본 비교의 가장 분명한 결론이다. 같은 7579 모듈을 설치해도 그 아래의 키가 EOA·SSS·TEE 어느 모델에 있느냐에 따라 위협 모델이 완전히 달라진다.

### 6.4 어떤 적합도가 어디로 가는가

(interpretive) 일반화하기 어려운 영역이지만 다음 정도는 자료로 받쳐진다.

- **dApp 임베디드 사용자 온보딩** — Privy의 embedded wallet이 가장 잘 어울리는 위치 (passkey/소셜 로그인 + 자동 가스 후원)[^s13][^s14].
- **에이전트가 카드와 USDC를 동시에 쓰는 결제** — Crossmint가 가장 명시적으로 한 SDK로 묶는다[^s17][^s35].
- **온체인 자동화·트레이딩 자율 에이전트** — Coinbase AgentKit의 액션 생태계가 가장 넓다[^s21][^s31].
- **모듈 자유도와 자체 호스팅** — Safe + 7579 모듈 진영이 가장 직접적이다[^s03].
- **모듈러 + 가스 효율 + 빠른 출시** — Kernel v3과 Nexus가 직접 경쟁한다[^s05][^s09].

## 7. 한계

- 본 비교는 2026년 5월 19일 시점의 1차 소스를 기준으로 한다. 6개 제공자 모두 빠르게 변하고 있어 일부 버전 정보(EntryPoint 0.7/0.8, Kernel v3.x, Nexus v1.2)는 단기간에 갱신될 가능성이 크다.
- ZeroDev의 권한 모델 세부와 Biconomy의 일부 SmartSessions 페이지는 JS 렌더링·접근 제한으로 직접 fetch가 어려운 구간이 있었다 — 4th-party 글과 GitHub 리포 README로 보완했다.
- Crossmint MiCA CASP 인가는 자체 비교 페이지에서 확인했으며 규제 당국의 공식 등록부로는 본 보고서에서 교차 검증하지 않았다.
- Privy·Crossmint·Coinbase Agentic Wallets 같은 클로즈드 / 부분 공개 코드는 1차 README 또는 공식 docs 수준까지만 다뤘다.
- 본 비교는 "스마트 계정 인프라" 6곳에 한정되었고, Turnkey, Dynamic, Alchemy Modular Account, OpenZeppelin Contracts modular account preset 같은 인접 진영은 비교 대상에 포함되지 않았다.
