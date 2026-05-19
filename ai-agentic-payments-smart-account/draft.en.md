# AI Agentic Payments and Smart Accounts — Concepts, Products, Features, and Code Analysis

## Abstract

This report traces the infrastructure being assembled to express AI-agent payment authority safely and programmably. Between late 2025 and mid-2026, almost every tier of the payments stack — card networks (Visa Trusted Agent Protocol, Mastercard Agent Pay), model providers (OpenAI Instant Checkout + Stripe ACP), cloud (Google AP2), and onchain rails (Coinbase x402, Circle Agent Stack) — shipped near-simultaneous announcements that all converge on the same problem[^s06][^s09][^s11][^s15][^s17][^s23]. Their common substrate is what the EOA model (key = account, one signature) cannot express: policies, session keys, and delegations. ERC-4337[^s01], EIP-7702[^s02], ERC-7579[^s03], and ERC-7710/7715[^s04][^s41] form the standards stack that fills that gap. The body of this report walks through the standards, surveys the products, then quotes representative open-source implementations (eth-infinitism EntryPoint, ZeroDev Kernel v3, Safe7579 Adapter, ERC-7579 SmartSession, Coinbase x402 facilitator, Pimlico ERC-20 Paymaster) to show what "an agent makes a payment" actually compiles down to in function calls.

## 1. Introduction — Why agentic payments need smart accounts

Over roughly seven months from autumn 2025 to spring 2026, virtually every first-tier payments actor announced an agentic payments product. Visa unveiled the Trusted Agent Protocol on 14 October 2025, explaining that "agent-initiated transactions [should be] as seamless and secure as any payment today"[^s06]. Mastercard launched the Agent Pay programme in the same year, framing it as "infrastructure for a new generation of intelligent transactions, where consumers and developers can empower AI agents to act on their behalf"[^s10]. Stripe and OpenAI jointly released the Agentic Commerce Protocol (ACP) on 29 September 2025 and turned on Instant Checkout in ChatGPT for US Etsy sellers and Shopify merchants[^s11][^s14][^s32]. Google announced the Agent Payments Protocol (AP2) on 17 September 2025[^s15]; Coinbase released the HTTP-402-based x402 protocol[^s17][^s19] in the same window. Circle bundled its USDC wallets, CCTP, and Nanopayments into the **Agent Stack** in May 2026[^s23].

That so many actors are solving the same problem at once is telling: the unit primitive of legacy payments — an **Externally Owned Account** where private key equals account — cannot natively express "the agent paid on the user's behalf, within these limits, on this merchant, until this expiry." Turnkey summarises the gap directly: EOAs "cannot respond to inputs like receiving tokens, they're restricted to private key/seed phrase operation, and they lack flexibility"[^s46]. There is no built-in policy engine, no session key, no delegation, no gas sponsorship.

Each industry layer is solving the gap with its own primitives — card networks add tokenization + agent intent, model providers add a shared payment token + checkout endpoint, onchain rails add smart accounts + session keys + paymasters[^s30][^s11][^s24]. Smart accounts are the common substrate underneath: the receiving "wallet" in every flow ultimately has to express policy, session, and delegation[^s30][^s29], and onchain that wallet is a smart account.

## 2. Background — The smart-account standards stack

### 2.1 ERC-4337 — Account abstraction without consensus changes

ERC-4337 makes account abstraction possible without touching the EVM consensus layer; its key pieces are an alt-mempool and an EntryPoint contract. The spec opens with "Account abstraction without consensus-layer protocol changes, instead relying on higher-layer infrastructure"[^s01]. A `UserOperation` carries the sender (the smart account), a nonce, optional factory data, callData, gas limits, an optional paymaster, and a signature; the EntryPoint processes operations in two phases (verification then execution)[^s01].

The canonical reference implementation at `eth-infinitism/account-abstraction` explains that the EntryPoint "validates UserOperations, handles account creation (if needed), executes the requested operations, [and] manages gas payments and refunds"[^s25]. EntryPoint v0.8 shipped in 2025, adding native EIP-7702 support, ERC-7562 validation rules, and the optional `executeUserOp()` account method[^s33].

### 2.2 EIP-7702 — EOAs that delegate to contract code

EIP-7702 defines a new transaction type (`SET_CODE_TX_TYPE = 0x04`) that lets an EOA delegate code to its own address[^s02]. The abstract reads:

> "Add a new EIP-2718 transaction type that allows Externally Owned Accounts (EOAs) to set the code in their account. This is done by attaching a list of authorization tuples – individually formatted as `[chain_id, address, nonce, y_parity, r, s]` – to the transaction."[^s02]

This lets an existing EOA temporarily inherit a smart account's contract logic and immediately gain batching, sponsorship, and session-key features[^s02][^s46]. EIP-7702 activated with the Pectra hard fork on 7 May 2025[^s46]. It is complementary to ERC-4337 rather than a replacement; EntryPoint v0.8 treats 7702 delegation as a first-class case[^s33].

### 2.3 ERC-7579 — Minimal modular smart accounts

ERC-7579 defines the **minimum** interfaces for modular smart accounts and their modules[^s03]. Modules come in four canonical types: validator (1), executor (2), fallback (3), and hook (4). Every compliant account must expose:

```solidity
function installModule(uint256 moduleTypeId, address module, bytes calldata initData) external
```

The function authorises the caller, invokes `onInstall(initData)` on the module, emits a `ModuleInstalled` event, and reverts on collision[^s03]. Session keys, policy engines, and automated-trade modules all plug into this same interface.

ERC-7579 is the standard used by ZeroDev Kernel, Safe (via the Safe7579 Adapter), Biconomy Nexus, Rhinestone, and OpenZeppelin's modular-account preset[^s26][^s27][^s35], which is why it is widely described as "the de facto modular standard for new smart account projects"[^s35]. The competing ERC-6900 mandates per-module storage namespacing and stricter validation splits — a richer but more prescriptive design, primarily used by Alchemy's Modular Account. 7579 deliberately keeps the surface minimal and leaves storage to the implementer, which has accelerated its adoption[^s35].

### 2.4 ERC-7710 / ERC-7715 — Delegation and permission requests

ERC-7710 standardises how a smart contract can delegate capabilities to another contract or to an EOA:

> "This proposal introduces a standard way for smart contracts to delegate capabilities to other smart contracts or Externally Owned Accounts (EOAs). The delegating contract (delegator) must be able to authorize a DelegationManager contract to call the delegator to execute the desired action."[^s04]

A delegate redeems authority by calling `redeemDelegations` on the Delegation Manager; the manager verifies the proof and invokes the privileged function on the delegator[^s41]. ERC-7715 is the companion: it defines how a dapp or AI agent **requests** permissions from a user's wallet, currently implemented by MetaMask as the `wallet_grantPermissions` JSON-RPC under the name "Advanced Permissions" — explicitly noting that "dapps (and AI agents) [can] request permissions from a user directly via the MetaMask extension"[^s05].

These two together provide almost exactly the same abstraction as the card networks' "Mandate" — the user signs, up front, "what this agent may do, within these limits, until this expiry," and the agent can only trigger payments inside that envelope.

## 3. The agentic-payments product landscape

The 2025–2026 launches cluster into four layers.

### 3.1 Card networks — Visa TAP and Mastercard Agent Pay

**Visa Trusted Agent Protocol (TAP)** was co-designed with Cloudflare and sits on top of HTTP Message Signatures (RFC 9421) and the emerging Web Bot Auth standard[^s40]. Each signed request carries three categories of evidence: (a) **Agent Intent** — that the agent is a Visa-trusted entity intending to purchase, (b) **Consumer Recognition** — loyalty tokens, device IDs, and other identifiers linking the agent to a real customer, and (c) **Payment Information** — hashed or tokenized credentials and settlement metadata[^s07]. The signatures are "specific to the merchant and purpose, and are time bound, cannot be replayed or relayed"[^s07]. The reference implementation lives at `visa/trusted-agent-protocol` and bills itself as "establishing a universal standard of trust between AI agents and merchants for the next phase of agentic commerce"[^s08]. Launch partners include Adyen, Ant International, Checkout.com, Coinbase, CyberSource, Elavon, Fiserv, Microsoft, Nuvei, Shopify, Stripe, and Worldpay[^s40].

**Mastercard Agent Pay**, announced 29 April 2025, layers "Agentic Tokens" onto Mastercard's existing tokenization stack[^s09]. PYMNTS quotes Mastercard's CSO directly: "We're building the infrastructure for a new generation of intelligent transactions, where consumers and developers can empower AI agents to act on their behalf with trust, transparency and precision"[^s10]. A separate announcement extended the programme through PayPal, and Mastercard also reported "the world's first live agentic payment" in Singapore on 4 March 2026 (DBS Bank authenticating, Hoppa mobility settling) — a single-vendor milestone, _(vendor-stated)_[^s10].

### 3.2 Model providers — OpenAI + Stripe ACP

Stripe and OpenAI co-released the **Agentic Commerce Protocol (ACP)** under Apache 2.0 on 29 September 2025[^s11][^s12][^s37]. Its central primitive is the **Shared Payment Token (SPT)**:

> "After the buyer uses their preferred payment method, Stripe issues a Shared Payment Token (SPT), a new payment primitive that lets applications like ChatGPT initiate a payment without exposing the buyer's payment credentials."[^s11]

The SPT is "scoped to a specific merchant and cart total"[^s11]; ChatGPT posts it to the merchant's ACP checkout endpoint. The repository is jointly maintained by OpenAI and Stripe as founding maintainers and contains an OpenAPI spec, JSON Schemas, and RFC drafts[^s13]. The same day, OpenAI shipped Instant Checkout for US Etsy single-item purchases in ChatGPT, with Shopify's million-plus merchants — SKIMS, Glossier, Spanx, Vuori — slated to follow[^s14][^s32]. Stripe explicitly frames itself as "the first compatible PSP" with the SPT[^s11].

The **Stripe Agent Toolkit** (`@stripe/agent-toolkit`) wraps the Stripe API as function-calling tools for OpenAI Agents SDK, LangChain, CrewAI, Vercel AI SDK, and MCP, with the explicit security note: "use restricted API keys (`rk_*`) to limit your agent's access to only the functionality it requires, especially in live mode"[^s44].

### 3.3 Cloud / model providers — Google AP2 and A2A

Google introduced the **Agent Payments Protocol (AP2)** on 17 September 2025 with Coinbase and over 60 partner organisations[^s15]. AP2 is transport-agnostic and can ride on top of the **Agent2Agent (A2A)** protocol or **Model Context Protocol (MCP)**[^s15]. It is built around three **Mandates** — **Intent Mandate** (the user's up-front authorisation), **Cart Mandate** (the user's signature on the agent's assembled cart), and **Payment Mandate** (the authorisation against a specific payment instrument)[^s38][^s39]. A third-party guide identifies an implicit fourth role, the **Credential Provider** — typically a PCI-regulated wallet such as PayPal, Apple Pay, Google Wallet, or Coinbase Smart Wallet[^s39] _(interpretive)_. Adyen, American Express, Etsy, Forter, Mastercard, Mysten Labs, PayPal, Salesforce, ServiceNow, UnionPay, and Worldpay are among the listed partners[^s15].

### 3.4 Onchain — Coinbase x402 and Circle Agent Stack

**x402** revives the HTTP 402 status code: a client sends a signed payment in the request header to receive the resource[^s17][^s19]. The README declares itself in one line: "x402 is an open standard for internet native payments"[^s17]. A facilitator server handles verification (`/verify`) and settlement (`/settle`), so the resource server never needs its own blockchain infrastructure[^s19]. Coinbase Developer Platform hosts a facilitator that processes ERC-20 payments on Base, Polygon, Arbitrum, World Chain, and Solana[^s19]. Cloudflare partnered with Coinbase to launch the **x402 Foundation**, noting that "every day, sites on Cloudflare send out over a billion HTTP 402 response codes"[^s20]. **Circle's Agent Stack** (May 2026) bundles Agent Wallets, Agent Marketplace, Circle CLI, Nanopayments (powered by Circle Gateway), and Circle Skills[^s23]. A separate Circle tutorial wires Circle Developer-Controlled Wallets together with the `x402-express` middleware to show an agent paying for an API endpoint in USDC[^s24].

### 3.5 Smart-account infrastructure — Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit

This is the layer that supplies the *wallet the agent holds*. ZeroDev Kernel positions itself as "Compatible with ERC-4337, Modular (supports ERC-7579 plugins), Highly gas-efficient"[^s26]. Safe extends its battle-tested core through the Safe7579 Adapter, giving access to "14 audited modules developed by Rhinestone, such as a dead man switch, flash-loan, social recovery"[^s27]. Biconomy Nexus complies with ERC-7579, 4337, 7739, 7562, and 7484 simultaneously and supports session keys as plugins[^s35][^s36]. Privy ships two custody models — "agent-controlled, developer-owned" wallets and "user-owned wallets with agent signers" — and exposes policies for transfer limits, contract allowlists, recipient restrictions, time windows, and action-specific rules[^s29]. Crossmint adopts a "dual-key" architecture: the owner key stays with the user, the agent key lives inside a Trusted Execution Environment, and a single agent wallet can pay over x402 stablecoins or Visa/Mastercard rails[^s30]. Coinbase AgentKit ("Every agent deserves a wallet") packages OpenAI Agents SDK, LangChain, Eliza, Vercel AI SDK, MCP, and Strands Agents with 50+ action providers across Base, Ethereum, and Solana[^s22]. Coinbase positions its companion Agentic Wallets as "the first wallet infrastructure designed specifically for AI agents"[^s21].

## 4. Functional comparison — What every agent-ready smart account does

Six capabilities recur across implementations.

**(a) Delegation and session keys.** A single user signature pins down "this key may call these selectors on this contract, up to this limit, until this expiry." In ERC-7579 this is a validator slot[^s03]; ZeroDev generalised the same idea as a "permissions system"[^s34]; the joint Rhinestone–Biconomy `smartsessions` module gives a portable implementation[^s28]. The card-network analogues are Visa TAP's Agent Intent claim[^s07] and AP2's Intent Mandate[^s38] — different envelopes, same primitive.

**(b) Policy engine and guards.** Privy makes the design tension explicit: "Policies are critical as they define the boundaries within which your agents can operate"[^s29]. SmartSession splits the same concept into UserOperation-policies, action-policies, and ERC-1271 signature-policies[^s28].

**(c) Gas abstraction and sponsorship.** ERC-4337's Paymaster is "a special smart contract under the ERC-4337 specification that user operations are able to delegate the responsibility of gas fee payments to"[^s42]. Pimlico's open-source ERC-20 Paymaster shows the canonical pattern: users pay gas in USDC or DAI; an oracle prices it; the paymaster covers ETH gas to the bundler[^s42]. The agent never has to hold ETH.

**(d) Cross-chain and cross-asset.** Circle moves USDC across chains via CCTP and breaks payments down to API-level units with x402[^s23][^s24]. LI.FI shipped a "For Agents" docs surface in 2026 and aggregates 27 bridges, 31 DEXes, and 58 chains behind a single API[^s43].

**(e) Identity, authentication, and consumer protection.** Visa TAP keeps dispute and chargeback inside the card network and merely adds an agent-identity signal alongside the existing message[^s07]; Mastercard does the same on top of its tokenization[^s09]. AP2 leans on Verifiable Credentials and FIDO to produce a "non-repudiable audit trail"[^s15].

**(f) Auditability and logs.** The SPT is "programmatically controlled, permissioned, and logged"[^s12]; AP2's three-mandate chain (intent → cart → payment) builds explicit non-repudiation[^s15]; onchain every UserOperation is permanently recorded as an EntryPoint event[^s25].

## 5. Code-level analysis — Looking at representative implementations

### 5.1 `EntryPoint.handleOps` — the single entry to every UserOperation

The EntryPoint contract in `eth-infinitism/account-abstraction` exposes:

```solidity
function handleOps(
    PackedUserOperation[] calldata ops,
    address payable beneficiary
) external virtual nonReentrant
```

For each op it runs `_validatePrepayment`, which (a) computes the operation hash, (b) checks gas fields fit in `uint120`, (c) calls `_validateAccountPrepayment` → the account's own `validateUserOp`, (d) confirms the nonce is fresh, and (e) if a paymaster is present, runs `_validatePaymasterPrepayment`[^s25]. Then `_executeUserOp` low-level-calls `innerHandleOp`, branches on out-of-gas / low-prefund / revert, and finishes with `_postExecution` for the refund calculation[^s25]. From the outside it's one call (`handleOps(ops, beneficiary)`); inside, the single transaction holds account self-validation, paymaster gas promise, callData execution, and accounting all in order[^s01][^s25].

EntryPoint v0.8 keeps that flow but adds native EIP-7702 delegation handling and ERC-7562 validation rules; the biggest v0.7 → v0.8 change is the split into PackedUserOperation calldata-friendly layout, plus 7702 as a first-class case[^s33].

### 5.2 ZeroDev Kernel v3 — separating signers from policies on top of ERC-7579

Kernel calls itself "Compatible with ERC-4337, Modular (supports ERC-7579 plugins), Highly gas-efficient"[^s26]. From EntryPoint 0.7 onward, Kernel v3 lifted the older session-key concept into a generalised permissions system:

> "In EntryPoint 0.7 (Kernel v3), session keys have been upgraded into a more powerful permissions system."[^s34]

The session-key flow is roughly: (1) the user signs a permission object naming the target contract, allowed selectors, value cap, and expiry; (2) they install the module via a UserOperation calling `installModule(1, sessionKeyValidatorAddress, initData)` — module type 1 is `validator`[^s03]; (3) when the dapp (or agent) submits a UserOperation, the EntryPoint invokes `validateUserOp`, the account routes validation to the session-key validator, which (4) checks the signature against the session key and the call against the encoded scope, and returns success[^s03][^s34].

The canonical ERC-7579 community implementation is **SmartSession** at `erc7579/smartsessions`. The module bills itself as "an advanced module for ERC-7579 compatible smart accounts, enabling granular control over session keys"[^s28] and splits configuration into three policy classes: UserOperation-validation policies, action-specific policies, and ERC-1271 signature-validation policies[^s28]. The license is AGPL-3.0 and the README notes the module is beta[^s28].

### 5.3 Safe7579 Adapter — adding ERC-7579 without changing Safe core

Safe took the opposite route: leave the audited core alone and adopt 7579 through an adapter. The Safe7579 Adapter, co-built by Rhinestone and Safe, "makes Safe Smart Accounts compliant with ERC-7579" by acting as both a Safe Module and a Fallback Handler — as a module it lets Safe use any 7579 module, and as a fallback handler it absorbs functions (like `validateUserOp`) that Safe doesn't natively expose[^s27]. Through it, "14 audited modules developed by Rhinestone (such as a dead man switch, flash-loan, social recovery, etc.)" become directly usable[^s27].

This is structurally the same pattern card networks use: leave the verified payment core untouched and bolt new agent capabilities on as a module / adapter on the side.

### 5.4 Coinbase x402 — facilitator calls EIP-3009 `transferWithAuthorization`

The EVM `exact` scheme of x402 handles a payment in two stages. **Verification (Phase 2)** runs five checks in sequence:

1. "Verify the signature is valid and recovers to the `authorization.from` address."[^s18]
2. "Verify the `client` has sufficient balance of the `asset`."[^s18]
3. "Verify the authorization parameters (Amount, Validity Window) meet the `PaymentRequirements`."[^s18]
4. "Verify the Token and Network match the requirement."[^s18]
5. "Simulate `token.transferWithAuthorization(...)` to ensure success."[^s18]

**Settlement (Phase 3)** is one sentence:

> "Settlement is performed via the facilitator calling the `transferWithAuthorization` function on the `EIP-3009` compliant contract with the `payload.signature` and `payload.authorization` parameters from the `PAYMENT-SIGNATURE` header."[^s18]

`payload.authorization` is the EIP-3009 tuple — `from`, `to`, `value`, `validAfter`, `validBefore`, `nonce`[^s31]; `payload.signature` is the 65-byte EIP-712 signature over it[^s18]. USDC and other EIP-3009 tokens collapse the whole transfer into one on-chain call that recovers the signature, checks the nonce, checks the validity window, and moves the funds — no prior `approve()` required[^s31]. That is what lets x402 plausibly claim "payments over a single HTTP request, no accounts and no API keys"[^s17][^s31].

Circle's tutorial wires up the same flow as five lines of Express middleware:

```typescript
app.use(
  paymentMiddleware(
    recipientWallet.address as `0x${string}`,
    { "GET /risk-profile": { price: "$0.01", network: "base-sepolia" } },
    { url: "https://x402.org/facilitator" }
  )
);
```

Any Express route is now a paid endpoint that requires \$0.01 in USDC[^s24].

A live community issue in the x402 repo proposes treating an ERC-4337 `UserOperation` as a first-class payment payload — explicitly unifying the EOA-signs-EIP-3009 flow with the smart-account-signs-UserOperation flow[^s48].

### 5.5 Pimlico ERC-20 Paymaster — the standard implementation of gas sponsorship

Pimlico's `erc20-paymaster` declares: "This repository contains an ERC-4337 paymaster implementation allowing users to pay for gas fees with ERC-20 tokens, leveraging an oracle to fetch latest prices"[^s42]. It supports EntryPoint v0.6 and v0.7, takes the maximum gas fee in the chosen ERC-20 during validation, and refunds excess after execution[^s42]. License is MIT; the repo was archived on 6 November 2025 in favour of `pimlicolabs/singleton-paymaster` _(unverified — single source)_[^s42].

### 5.6 AP2 Mandates — a signature chain of intent → cart → payment

The `google-agentic-commerce/AP2` repository describes itself as containing "code samples and demos of the Agent Payments Protocol"[^s16]. The three Mandates are all "tamper-proof, cryptographically-signed digital contracts that serve as verifiable proof of a user's instructions," signed by Verifiable Credentials[^s15]. Reference demos are written on Google ADK + Gemini, but the protocol itself is tool-agnostic: "The Agent Payments Protocol doesn't require the use of either"[^s16]. The illustrated guide makes the implicit Credential Provider role explicit — "the entity that holds the user's payment instrument and produces a tokenized payment reference for inclusion in the Payment Mandate"[^s39].

### 5.7 Visa TAP — HTTP message signatures (RFC 9421)

Visa TAP solves "the agent makes a payment" inside the card-network message flow rather than on the EVM. It signs HTTP headers under RFC 9421 with three constraints stacked on top: time-bound, merchant-domain-bound, and Ed25519[^s40]. Visa's own wording is clear:

> "The protocol employs cryptographic message signatures that are specific to the merchant and purpose, and are time bound, cannot be replayed or relayed."[^s07]

Merchants verify the signature against a Visa-operated directory of agent public keys[^s40]. The header itself is split into three chunks — Agent Intent, Consumer Recognition, and Payment Information (hashed credentials / tokenized data / settlement metadata)[^s07].

## 6. Discussion — Security and design trade-offs

### 6.1 Threat model

Agentic payments move the weakest link of payments from "the key" to "intent parsing." The Grok / Bankr incident of May 2026 was the textbook example: the attacker did not break a contract; they convinced the agent to use its own wallet[^s47].

> "The failure point was intent parsing, not reentrancy, oracle manipulation or flawed blockchain infrastructure."[^s47]

Academic red-teaming of AP2 itself ("Whispers of Wealth") reached the same conclusion: "simple adversarial prompts can reliably subvert agent behavior"[^s45].

Both results point in the same direction: a smart account's policy engine — session-key limits, merchant allowlists, time bounds — is not a way to stop a misled agent, but a way to cap the loss when one is misled. That is why ZeroDev Permissions[^s34], SmartSession policies[^s28], Privy policies[^s29], and Crossmint's dual-key-plus-TEE design[^s30] all emerged in parallel.

### 6.2 Standards fragmentation

As of mid-2026, the agent-payments stack contains at least five overlapping standards: commerce (ACP, UCP), payment authorization (AP2), HTTP payment (x402), agent identity (Visa TAP), and agent tooling / transport (MCP, A2A)[^s40]. The short-term cost is integration burden; the dominant interpretation is that, on top of a "smart account + delegation + session keys" abstraction, the five collapse into adapters _(interpretive)_[^s40]. The x402 issue proposing first-class ERC-4337 UserOperation support[^s48] and Crossmint paying over both x402 and card rails from one SDK[^s30] are early signs in that direction.

### 6.3 Regulation and UX tension

Card networks effectively keep dispute, chargeback, and KYC liability inside their existing perimeter and only add agent-identity signals[^s07][^s09]. Onchain rails can only enforce limit / session / policy at the code level, and the dispute path for "the user signed a permission that was then misused" is not yet standardised. AP2 pulling in Verifiable Credentials and FIDO can be read as an attempt to close that asymmetry _(interpretive)_[^s15].

## 7. Limitations

- We do not have access to closed-beta internals at the card networks and model providers. Visa TAP's agent-directory operation, Mastercard's exact Agentic Token vault, and OpenAI Operator's full permission model are covered only at the documented level.
- Code citations track main-branch READMEs and specs, not the deployed bytecode of any specific network. Production deployments may differ.
- Vendor-disclosed quantitative figures (e.g. x402 transaction counts) are not independently audited and are marked `_(vendor-stated)_`.
- ERC-4337 EntryPoint versions, the ERC-7579 module ecosystem, and EIP-7702 are all changing fast through 2024–2026; an exact v0.8 / v0.9 deployment-address matrix needs separate research.
- Standards fragmentation in this space is unresolved, so the report's taxonomy (card networks / model providers / cloud / onchain / infrastructure) may need to be rearranged as the ecosystem consolidates.
