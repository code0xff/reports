# Smart-Account Infrastructure Deep Dive — Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit

## Abstract

This report traces six representative smart-account / wallet infrastructure providers (Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit) as of May 2026, from primary sources. The same phrase — "smart account" — covers very different scopes across the six: Safe, ZeroDev, and Biconomy sit firmly in the ERC-4337[^s25] + ERC-7579[^s27] contract camp; Privy[^s14] and Crossmint[^s20] are full-stack hosting platforms wrapping key infrastructure and policy engines; Coinbase AgentKit[^s21] is a framework- and wallet-agnostic adapter layer on top. The report compares them along six axes — (a) architecture, (b) standards adoption, (c) modules and plugins, (d) key custody, (e) gas / paymaster, (f) agent / session support — and then walks through the implementation patterns of Safe7579 Adapter, ZeroDev Kernel v3 Permissions, Biconomy SmartSessions, Privy's SSS+TEE, Crossmint's dual-key+TEE, and Coinbase's Spend Permissions, with code citations from each provider's primary repository.

## 1. Introduction — Why look at the infrastructure layer separately?

"Smart account" is a label that covers every non-EOA contract wallet, but the companies competing under that label have very different identities. Safe positions itself as the long-validated multisig contract wallet that adopts 4337 / 7579 through adapters[^s01][^s03]. ZeroDev is "ERC-4337 + 7579 + gas-efficient modular smart account"[^s05]. Biconomy frames Nexus as "the operating system for smart accounts"[^s11]. Privy is "TEE-based self-custodial key infrastructure + server wallets"[^s13][^s30]. Crossmint is "smart-contract-based wallets stacked with card and stablecoin payment rails in a single API"[^s17][^s20]. Coinbase AgentKit is "framework- and wallet-agnostic action infrastructure for AI agents"[^s21]. Which axis you read by determines the comparison's conclusion.

The six axes used throughout this report:

- **(a) Architecture** — contract wallet itself vs. key infrastructure vs. full-stack SaaS.
- **(b) Standards adoption** — which of ERC-4337 / ERC-7579 / EIP-7702 / ERC-7710·7715 / ERC-7484·7739 are followed.
- **(c) Modules and plugins** — whose module ecosystem the account plugs into (own / Rhinestone / proprietary policy engine).
- **(d) Key custody** — EOA + contract / MPC / SSS+TEE / dual-key+TEE / user device.
- **(e) Gas / paymaster** — direct ERC-4337 Paymaster, in-house settlement, or hybrid.
- **(f) Agent / session** — how session keys, delegation, and policy engines are exposed.

## 2. Background — The shared standards stack

### 2.1 ERC-4337

ERC-4337 specifies "Account abstraction without consensus-layer protocol changes, instead relying on higher-layer infrastructure" — UserOperations flowing through an alt-mempool to a singleton EntryPoint contract[^s25]. All six providers in this report support ERC-4337 directly or via an adapter.

### 2.2 ERC-7579 — Minimal modular interface

ERC-7579 defines the *minimum* interfaces for modular smart accounts and their modules: "This proposal outlines the minimally required interfaces and behavior for modular smart accounts and modules to ensure interoperability across implementations"[^s27]. Its core ABI is `installModule(uint256 moduleTypeId, address module, bytes calldata initData)`, with four module types (validator, executor, fallback, hook)[^s27]. Adopters include Safe (via adapter), ZeroDev Kernel, Biconomy Nexus, Rhinestone, and OpenZeppelin Contracts' modular account preset[^s29]. The three contract-centric providers in this report (Safe, ZeroDev, Biconomy) all sit in this camp.

### 2.3 EIP-7702 — EOAs that delegate to contract code

EIP-7702 introduces a new transaction type (`0x04`) that lets an EOA temporarily inherit contract code at its own address[^s26]. Safe's documentation describes it as "a step towards account abstraction, enabling EOAs (Externally Owned Accounts) to have both code and storage"[^s02]. Biconomy Nexus lists EIP-7702 compatibility explicitly[^s09], and ZeroDev maintains a dedicated `7702.zerodev.app` example surface[^s08].

### 2.4 ERC-7484 · 7739 · SmartSessions

Biconomy Nexus is the most multi-standard of the three contract providers, claiming compliance with ERC-7579, 4337, 7739 (nested EIP-712 ergonomics), 7562 (4337 validation rules), and 7484 (module security registry)[^s09][^s28]. Session keys themselves are standardised in a separate module — `erc7579/smartsessions`: "SmartSession is an advanced module for ERC-7579 compatible smart accounts, enabling granular control over session keys"[^s12].

## 3. Provider Deep Dive

### 3.1 Safe — Verified core + adapters for 4337 / 7579 / 7702

The Safe Smart Account is one of the longest-running multisig contract wallets, and its design principle is "don't touch the core." ERC-4337 support is therefore not baked in: it arrives via the **Safe4337Module**, an external module — "Safe ERC-4337 compatibility is provided via Safe Modules and the Fallback Handler"[^s01]. The module wears two hats at once: as a Safe Module it can participate in transaction execution, and as a Fallback Handler it absorbs functions Safe doesn't natively expose (notably `validateUserOp`)[^s01]. The module is optional and requires Safe v1.4.1+[^s01].

ERC-7579 is handled the same way through **Safe7579 Adapter**, co-developed by Rhinestone and Safe. The adapter is both a Safe Module and a Fallback Handler[^s03], which immediately makes 14 audited Rhinestone modules — dead-man switch, flash-loan, social recovery, etc. — usable without changing Safe's core[^s03]. The umbrella `safe-modules` repo also hosts the 4337 Module, the Allowance Module, the Passkey Module, and the Recovery Module under LGPL-3.0[^s04].

For EIP-7702, Safe's overview describes it as "a step towards account abstraction" and tracks the actual integration on a separate `7702-safe` page[^s02]. The "Safe Smart EOA" pattern combines 7702 with 4337.

The one-line takeaway: **Safe = "leave the core alone, add capability through modules and adapters."** Of the six providers, this design grants the most direct freedom of module choice.

### 3.2 ZeroDev — Kernel v3 + Composable Permissions

ZeroDev's flagship product is the contract itself, **Kernel**. The repo's one-liner reads "Kernel is a smart contract account that is: Compatible with ERC-4337, Modular (supports ERC-7579 plugins), Highly gas-efficient"[^s05]. ZeroDev's own Kernel v3 launch announcement says it is the "First modular account for EntryPoint 0.7, First audited account for ERC-7579, First account with composable permissions"[^s08] _(vendor-stated)_. Pimlico's comparison documentation independently calls Kernel "the most widely used modular smart account"[^s33].

The permissions model is the more substantive piece. From Kernel v3 onwards, ZeroDev generalised session keys into a first-class permissions system — "In EntryPoint 0.7 (Kernel v3), session keys have been upgraded into a more powerful permissions system"[^s07]. The abstraction is three objects, one per question — "Who (what key) can perform the action? When (under what condition) can the action be performed? What is the action anyways?"[^s06]:

- **Signer (Who)** — key type and algorithm (ECDSA / WebAuthn / Multisig).
- **Policy (When)** — conditions (spend limit, contract allowlist, time window).
- **Action (What)** — the execution function the key invokes.

A permission can compose up to 254 policies with one signer[^s34]. On each UserOperation, Kernel runs every policy and verifies the signer's signature over `userOpHash` before passing to execution[^s34]. This separation is what lets one key carry "USDC up to \$100 + whitelisted merchants + within 24 hours" as a composite permission expressible in a single interface.

### 3.3 Biconomy — Nexus + SmartSessions

Biconomy's new smart account is **Nexus**, positioned as "the operating system for smart accounts" — "Nexus is a minimal & non-opinionated implementation"[^s11]. Nexus simultaneously complies with ERC-7579, 4337, 7739, 7562, and 7484[^s09][^s28]. Architecturally it splits into four pieces: (1) a minimal-proxy core account, (2) Validation modules (ECDSA / passkey / custom), (3) Execution modules (batch / automation / cross-chain), (4) Fallback handlers[^s09]. License: MIT[^s10].

Session keys come from the same `erc7579/smartsessions` module described above. The standardised four-step flow is: (1) deploy the SmartSession contract, (2) install the SmartSession module on the smart account, (3) configure a session with policies, (4) use the session key[^s12]. Policy types are split three ways — UserOperation validation, action-specific, and ERC-1271 signature[^s12]. The abstraction is structurally identical to ZeroDev's signer/policy/action; the units of separation differ.

Nexus also introduces **Enable Mode**, which activates a module mid-transaction, and **Resource Locking**, which time-locks module uninstallation to prevent double-spend in chain-abstracted execution[^s11].

### 3.4 Privy — Embedded + Server Wallets on SSS + TEE

Privy puts its weight on **key infrastructure and a policy engine**, not on a contract of its own. The product surface splits into embedded wallets (in-app, user-facing) and server wallets (API, autonomous backend)[^s14]. The pitch is "high-performance self-custodial wallets that work on any chain"[^s13].

The core security architecture combines **Shamir's Secret Sharing with AWS Nitro Enclaves (TEE)**. Privy's security page sums it up: "Keys are only stored as encrypted shares distributed across separate security boundaries"[^s15]. Keys are split into a 2-of-2 SSS configuration — an Enclave share encrypted by the TEE's key, and an Auth share held by Privy under user credentials. Signing reconstructs the key inside the TEE only for the duration of the operation, then disperses the shares again[^s30]. The explicit goal is self-custody without relying on a single infrastructure operator for key security[^s30].

For agents, Privy's docs split flows into two custody models: (1) agent-controlled, developer-owned wallets and (2) user-owned wallets with agent signers[^s16]. Either way, policies are first-class — "Policies are critical as they define the boundaries within which your agents can operate"[^s16]. The policy surface is transfer limits, contract allowlists, recipient restrictions, time-based controls, and action-specific rules[^s16].

The one-line takeaway: **Privy = "keys that only recombine inside a TEE, plus a policy engine, delivered as SaaS."** It does not compete head-on with the contract camp; instead, AgentKit's `PrivyWalletProvider` lets the same Privy-managed EOA serve as a signer underneath a contract account[^s21].

### 3.5 Crossmint — Smart-contract Wallets + Dual-Key + Card / USDC Rails

Crossmint bundles **smart-contract wallets, card issuance, stablecoin payments, and AI-agent tools** behind one API. Its self-description: "Give agents fiat and stablecoin wallets, and issue virtual cards via Visa Intelligent Platform"[^s17]. The wallet-infrastructure page emphasises 50+ blockchains behind one unified API[^s20].

The key model is **dual-key + TEE**. Two keys are co-owners of the same smart-contract wallet — the Owner Key stays with the user as a master override ("the owner can use it to halt the agent, withdraw")[^s19], and the Agent Key lives inside a TEE for day-to-day signing[^s18]. That split is what lets one Crossmint wallet handle x402 stablecoin payments and Visa / Mastercard card rails simultaneously[^s17].

A second pillar of the design is signer rotation through the smart contract: "Crossmint wallets are based on open-source smart contracts, replacing fragile single-key setups with resilient, onchain security"[^s20] — which Crossmint pitches explicitly as a vendor-lock-in escape valve. Compliance posture: SOC 2 Type II on the wallet-infrastructure page[^s20]; MiCA CASP authorisation in Crossmint's own comparison content _(vendor-stated)_[^s35].

### 3.6 Coinbase AgentKit — Framework- and wallet-agnostic action infrastructure

Coinbase AgentKit is not a contract but **an integration SDK for AI agents acting onchain**. Its definition reads: "AgentKit is a framework for easily enabling AI agents to take actions onchain. It is designed to be framework-agnostic, so you can use it with any AI framework, and wallet-agnostic, so you can use it with any wallet"[^s22]. Those two sentences are the design.

AgentKit accepts two plugin classes.

- **WalletProvider** — `CdpEvmWalletProvider`, `CdpSmartWalletProvider`, `ViemWalletProvider`, **`PrivyWalletProvider`**, **`ZeroDevWalletProvider`**, `CdpV2SolanaWalletProvider`, `SolanaKeypairWalletProvider`[^s22]. Privy and ZeroDev can therefore plug in as the backing wallet directly.
- **ActionProvider** — 50+ actions (TypeScript), 30+ (Python), across 40+ protocols including Compound, Uniswap, OpenSea, Across, Jupiter, Morpho, and Superfluid[^s22][^s31].

License: Apache-2.0, subject to the Coinbase Developer Platform Terms of Service[^s21]. Framework integrations cover LangChain, Vercel AI SDK, MCP, OpenAI Agents SDK, Eliza, Strands Agents, and AutoGen[^s21].

Two adjacent Coinbase products complete the picture:

- **CDP Wallets / Smart Accounts** — a user can opt into a smart account where their EOA serves as the signer for a smart contract wallet, unlocking gas sponsorship, transaction batching, and Spend Permissions[^s24].
- **Spend Permissions** — a separate contract (`SpendPermissionManager`) summarised as "Spend Permissions enable apps to spend native and ERC-20 tokens on behalf of users"[^s23]. The manager is added as an owner of the user's Smart Wallet and is invoked by the spender (the app) via `spend(...)`, which validates the limit and moves the funds[^s23]. Notably, the design deliberately avoids routing through the ERC-4337 EntryPoint, to keep paymasters from consuming user tokens for gas[^s23]. License: MIT[^s23].
- **Agentic Wallets** — Coinbase markets these as "the first wallet infrastructure designed specifically for AI agents"[^s32] _(vendor-stated)_.

One-line takeaway: **Coinbase AgentKit = "accept wallet, policy, and action as modules and wire them into AI frameworks."**

## 4. Comparison — Feature matrix

| Axis | Safe | ZeroDev | Biconomy | Privy | Crossmint | Coinbase AgentKit |
|---|---|---|---|---|---|---|
| Core asset | Smart-account contract + modules | Kernel contract + Permissions | Nexus contract + modules | TEE key infra + policy SaaS | Smart-contract wallets + card / USDC stack | Action / wallet adapter SDK |
| ERC-4337 | ✓ via `Safe4337Module`[^s01] | ✓ via Kernel (EP 0.7)[^s07] | ✓ via Nexus[^s09] | ✓ via smart-wallet option[^s14] | ✓ contract-based[^s20] | ✓ via WalletProviders[^s22] |
| ERC-7579 | ✓ via `Safe7579 Adapter`[^s03] | ✓ Kernel v3[^s05][^s08] | ✓ Nexus[^s09][^s10] | — (delegated to external SC) | not stated (own contract) | — (depends on WalletProvider) |
| EIP-7702 | ✓ docs[^s02] | ✓ `7702.zerodev.app` examples[^s08] | ✓ Nexus[^s09] | — | — (smart-contract model) | — (WalletProvider-specific) |
| Custody | Contract multisig + modules | Contract + Permissions | Contract + modules | SSS 2-of-2 + TEE[^s15][^s30] | Dual-key + TEE[^s18][^s19] | Delegated per WalletProvider |
| Paymaster / Gas | External 4337 infra | Built-in + ERC-4337 Paymaster[^s05] | Nexus Paymaster[^s09] | Embedded gas sponsorship[^s14] | Gas + Visa rails simultaneously[^s17] | Per WalletProvider |
| Session / permissions | 7579 modules through adapter (e.g. SmartSessions)[^s03] | Composable Permissions (signer/policy/action)[^s06][^s34] | SmartSessions module[^s12] | Policies (limits / allowlists / time)[^s16] | Owner/Agent Key + merchant allowlist[^s18] | Per WalletProvider + Spend Permissions[^s23][^s24] |
| Multi-chain | Safe is itself multi-chain | 15+ EVM chains | EVM-leaning | "any chain"[^s13], Solana included | 40+ chains[^s18], 50+ mentioned[^s20] | EVM + Solana[^s22] |
| License | LGPL-3.0[^s04] | MIT[^s05] | MIT[^s10] | SaaS terms | SaaS terms + open-source contracts[^s20] | Apache-2.0[^s21] |

Of the six, only three — Safe (via adapter), ZeroDev (Kernel), Biconomy (Nexus) — adopt ERC-7579 directly[^s29]. The other three (Privy, Crossmint, Coinbase) either do not adopt 7579 or delegate it to external contracts _(interpretive)_[^s35].

## 5. Implementation patterns — Code-level reading

### 5.1 Safe — Module + Fallback Handler double registration

Because Safe does not modify its core, the **Fallback Handler** is how 4337 / 7579 entry-point functions reach the account. The Safe4337Module satisfies two interfaces at once:

1. **As a Safe Module**, it gets registered into the account and can participate in execution.
2. **As a Fallback Handler**, it absorbs calls to functions Safe doesn't natively expose, notably `validateUserOp(...)`.

When the EntryPoint calls `validateUserOp`, the Safe Proxy delegates to the fallback handler, which checks the Safe owners' signatures[^s01]. After validation, the EntryPoint calls `executeUserOp` on the Safe to execute the user's calldata[^s01]. The Safe7579 Adapter follows the same double-registration pattern, accepting any 7579 module without touching the Safe core[^s03].

The appeal is operational: the six-plus-year-old Safe core stays unchanged, new capabilities arrive only as adapters or modules.

### 5.2 ZeroDev Kernel — `installModule(1, sessionKeyValidator, initData)`

Kernel v3 expresses session keys as generalised Permissions on top of ERC-7579[^s07]. The standard 7579 ABI applies:

```solidity
function installModule(uint256 moduleTypeId, address module, bytes calldata initData) external
```

`moduleTypeId = 1` is the validator slot[^s27]. Installing a session-key module as a validator means it will receive every UserOperation and answer two questions: (1) was the signature produced by the session key, and (2) is the call's selector / value / expiry inside the encoded policy[^s07]. ZeroDev's Permissions model bundles up to 254 policies with a single signer per permission[^s34], which is what makes "USDC up to \$100 + whitelisted merchant + within 24 hours" a single composite permission rather than three separate modules.

### 5.3 Biconomy Nexus + SmartSessions — Enable Mode and policy separation

Biconomy SmartSessions follows the same 7579 ABI. The standardised four-step install is (1) deploy SmartSession, (2) install the module on the account, (3) configure a session with policies, (4) use the session key[^s12]. Policies split three ways — UserOp validation, action-specific, ERC-1271 signature[^s12]. Nexus adds **Enable Mode** (modules can be activated mid-transaction) and **Resource Locking** (uninstall is time-locked, to block double-spend in cross-chain abstraction)[^s11]. License: MIT[^s10].

ZeroDev Permissions and SmartSessions reach the same abstraction (signer / policy / action) but at different unit sizes: ZeroDev composes them inside one module, SmartSessions separates policy classes across modules _(interpretive)_[^s06][^s12].

### 5.4 Privy — Authorization key + SSS + TEE

A Privy server wallet authenticates API calls with an **authorization key** held by the developer's backend, not the user's device[^s16]. On top of that, the policy engine enforces transfer limits, contract allowlists, recipient restrictions, time-based controls, and action-specific rules[^s16].

Signing itself always happens inside a TEE. The custody flow is four steps: (1) split the key with 2-of-2 SSS, (2) encrypt the Enclave share with the TEE's key while the Auth share is locked under user credentials, (3) reconstruct the key inside the TEE for the signing call only, (4) immediately re-disperse the shares[^s30]. The complete key therefore exists only "for the brief window of an authenticated operation"[^s15].

Worth noting: Coinbase AgentKit's `PrivyWalletProvider` consumes this infrastructure and exposes it as an EOA-like interface to AgentKit users[^s21]. Privy's key infrastructure composes cleanly with contract accounts elsewhere in the stack.

### 5.5 Crossmint — Dual-Key + TEE

A Crossmint smart-contract wallet has two keys as co-owners. The **Owner Key** stays with the user and acts as a master override — "the owner can use it to halt the agent, withdraw"[^s19]. The **Agent Key** lives inside a TEE and signs day-to-day transactions[^s18]. Contract-level guards enforce stored policies (merchant allowlists, spend limits).

The dual-key model is explicitly the inverse of "one key, one signature": losing one key is recoverable via the other, and an agent-key compromise can be paused by the owner key without losing the account address. Crossmint frames the model as "resilient, onchain security" against fragile single-key setups[^s20].

### 5.6 Coinbase — WalletProvider + Spend Permissions

The two core abstractions in AgentKit are `WalletProvider` and `ActionProvider`[^s22]. A new action is added by subclassing `ActionProvider` and using the `@CreateAction` decorator; the registered action is then exposed to LangChain, OpenAI Agents SDK, Vercel AI SDK, and the rest of the supported frameworks as a function-calling tool[^s22][^s21].

`SpendPermissionManager` is a simpler permission model implemented as a stand-alone contract. The one-liner is "Spend Permissions enable apps to spend native and ERC-20 tokens on behalf of users"[^s23]. Mechanically: (1) the manager is added as an owner of the user's Smart Wallet, (2) the spender (app) calls `spend(...)` on the manager, (3) the manager validates the configured limit and moves the funds out of the user's account[^s23]. The deliberate design choice to skip the ERC-4337 EntryPoint is to prevent paymasters from spending user tokens for gas[^s23]. License: MIT[^s23].

CDP Smart Wallet sits underneath this, with the EOA acting as the signer for the smart-contract wallet; users optionally receive both an EOA and a smart account, and gas sponsorship / batching / spend permissions are opt-in[^s24].

## 6. Discussion — Trade-offs and selection criteria

### 6.1 Modular contracts vs. full-stack SaaS

The six providers cluster into two broad camps:

- **The modular-contract camp (Safe, ZeroDev, Biconomy)** treats module portability across 4337 / 7579 as the headline asset. The pitch is that the same SmartSessions module works on all three _(interpretive)_[^s28]. The trade-off is that hosting, custody, policy SaaS, and card issuance must be assembled separately.
- **The full-stack SaaS camp (Privy, Crossmint, Coinbase CDP)** bundles custody, policies, gas, compliance, and (for Crossmint) card issuance into one API. The trade-off is vendor lock-in risk — a recurring critique in analyst comparisons _(interpretive)_[^s35].

The split is not clean. Coinbase AgentKit, nominally full-stack, absorbs `ZeroDevWalletProvider` and `PrivyWalletProvider` as first-class providers[^s22]. Crossmint advertises its underlying contracts as open-source[^s20]. Safe runs both modular contracts and Safe{Core} SaaS.

### 6.2 Convergence of the session-key abstraction

The striking observation is that **all six providers arrive at almost the same abstraction**. ZeroDev Permissions' signer / policy / action[^s06], SmartSessions' (UserOp / action / signature) policies[^s12], Privy Policies' (transfer limits / contract allowlists / recipient restrictions / time windows / action rules)[^s16], Crossmint's (owner key + agent key + merchant allowlist + spend cap)[^s18], and Coinbase Spend Permissions' (spender / recipient / amount / recurring period)[^s23] are the same abstraction in different syntax.

This convergence is most plausibly the de facto standardisation imposed by the 7579 module ecosystem — Rhinestone–Biconomy's SmartSessions becoming the standards candidate[^s12], ZeroDev's Permissions matching it natively[^s06], and full-stack SaaS providers exposing the same policy objects through their own SDKs.

### 6.3 Key-model divergence

The contrast is sharper on key models:

- **EOA + contract (Safe, ZeroDev, Biconomy)** — user's EOA owns / signs for the contract account; with EIP-7702 the EOA itself can take on contract code[^s02][^s09].
- **SSS + TEE (Privy)** — key split, reconstituted only inside the TEE[^s15][^s30].
- **Dual-key + TEE (Crossmint)** — two keys co-own the contract; one lives only inside a TEE[^s18][^s19].
- **WalletProvider delegation (Coinbase AgentKit)** — absorbs whichever of CDP / Privy / ZeroDev / Viem is configured[^s22].

The clearest takeaway of the comparison: "smart account" does not pick a security model. Installing the same 7579 module above an EOA, an SSS-protected key, or a TEE-bound agent key yields entirely different threat models underneath.

### 6.4 Where does each fit?

Generalising is dangerous, but the following has at least direct primary support _(interpretive)_:

- **In-app user onboarding** — Privy's embedded wallets (passkey / social login + automatic gas sponsorship) fit most naturally[^s13][^s14].
- **Agent paying with both card and USDC** — Crossmint's single-SDK approach is the most explicit[^s17][^s35].
- **Onchain automation / trading autonomy** — Coinbase AgentKit has the widest action ecosystem[^s21][^s31].
- **Module freedom and self-hosting** — Safe + 7579 module camp is the most direct[^s03].
- **Modular + gas-efficient + fast time-to-ship** — Kernel v3 and Nexus compete head-on[^s05][^s09].

## 7. Limitations

- The comparison reflects primary sources as of 19 May 2026. All six providers are moving fast, so version specifics (EntryPoint 0.7 / 0.8, Kernel v3.x, Nexus v1.2) are likely to drift in the short term.
- ZeroDev's detailed permission docs and parts of Biconomy's SmartSessions documentation were not always reachable directly (JS-heavy pages, access errors); we filled in with the Kernel v3 launch announcement, third-party glossaries, and the canonical GitHub READMEs.
- Crossmint's MiCA CASP authorisation is cited from its own comparative content; this report did not cross-check against the regulator's public registry.
- Privy, Crossmint, and Coinbase Agentic Wallets are partly closed-source SaaS; we describe them at first-party README / docs fidelity, not at deployed-binary fidelity.
- The comparison is limited to the six providers named. Adjacent platforms (Turnkey, Dynamic, Alchemy Modular Account, OpenZeppelin Contracts modular account preset) were not compared here.
