# x402: HTTP-Native Payment Protocol

## Introduction

The HTTP 402 status code has been reserved since the early 1990s as "Payment Required" but was left without a normative definition — described in successive HTTP RFCs as reserved for future use [^s03]. For decades it was a placeholder that returned errors in browsers without any standard meaning. The rise of autonomous AI agents in 2024 and 2025 created new demand for a machine-readable payment protocol: agents need to pay for API calls, computational resources, and data without the friction of OAuth tokens, billing dashboards, or human approval loops. Traditional payment processors impose per-transaction fees (e.g., 2.9% plus a fixed fee) that make sub-dollar micropayments economically impractical [^s19] and require merchants to establish accounts, pass KYC, and integrate multi-step checkout flows designed for human users.

x402 addresses these constraints by treating payment as a first-class HTTP primitive. When a client requests a resource and has not yet paid, the server returns a standard 402 response carrying a machine-readable payment specification. The client parses the requirements, signs an authorization, and retries the request with proof of payment in a header. A facilitator — an optional intermediary — verifies the signature and submits the settlement transaction to the blockchain. The resource server then returns the requested content with a 200 response [^s03][^s05]. The entire cycle takes approximately two seconds [^s19].

Coinbase Developer Platform published x402 as an open-source project on 6 May 2025 [^s19][^s01]. In September 2025, Coinbase and Cloudflare co-founded the x402 Foundation to steward the protocol as a neutral open standard [^s08][^s23]. A second major version was released in December 2025, extending the scheme and extension systems and migrating the TypeScript SDK to the `@x402` npm organization [^s02][^s17].

## Core Protocol Architecture

### Components

The x402 protocol defines four participant roles:

- **Client**: any HTTP client — a browser, AI agent, CLI tool, or SDK — capable of parsing a 402 response and signing a payment payload.
- **Resource server**: an HTTP server that gates content or API responses behind payment. Middleware libraries for Express, Hono, Next.js, FastAPI, Flask, Gin, and other frameworks implement this role with minimal configuration [^s05].
- **Facilitator**: an intermediary that exposes `/verify` and `/settle` REST endpoints. Resource servers call `/verify` to validate a payment signature before serving content, then `/settle` to execute the on-chain transfer [^s05][^s21]. The facilitator abstracts blockchain complexity from both parties.
- **Blockchain**: the settlement layer. Currently supported layers include Base, Polygon, Arbitrum, World Chain, Solana, Stellar, and Algorand, with community facilitators extending the list further [^s05][^s06][^s14].

### Payment Flow

The canonical 12-step flow is:

1. Client requests a resource via standard HTTP.
2. Resource server detects no valid payment header.
3. Server responds with HTTP 402 and the `PAYMENT-REQUIRED` header containing a base64-encoded `PaymentRequired` object listing accepted payment options (scheme, network, token, amount, recipient, time window).
4. Client selects a payment option and constructs a `PaymentPayload`.
5. Client signs the payload using its private key (EIP-712 on EVM; equivalent on other chains).
6. Client retries the request with the `PAYMENT-SIGNATURE` header carrying the base64-encoded `PaymentPayload`.
7. Resource server forwards the payload to the facilitator's `/verify` endpoint.
8. Facilitator validates the signature: recovers the signer address, checks balance, confirms the time window, verifies amount and recipient, and simulates execution.
9. Resource server fulfills the request (business logic runs).
10. Resource server calls the facilitator's `/settle` endpoint to execute the on-chain transfer.
11. Facilitator submits the signed authorization to the blockchain and awaits confirmation.
12. Resource server returns HTTP 200 with the `PAYMENT-RESPONSE` header carrying a base64-encoded settlement receipt including the transaction hash [^s03][^s09][^s21].

### HTTP Headers

All payment data travels in HTTP headers, leaving the request and response bodies free for application content [^s02]:

| Header | Direction | Content |
|---|---|---|
| `PAYMENT-REQUIRED` | Server → Client | Base64-encoded JSON: accepted schemes, networks, amounts, recipient, expiry |
| `PAYMENT-SIGNATURE` | Client → Server | Base64-encoded JSON: signed `PaymentPayload` |
| `PAYMENT-RESPONSE` | Server → Client | Base64-encoded JSON: settlement receipt, transaction hash |

The V2 release replaced the earlier `X-PAYMENT` and `X-PAYMENT-RESPONSE` prefixed headers with these standardized forms to align with modern HTTP conventions [^s02].

### Trust Model

A critical invariant of the protocol is that the facilitator cannot alter the recipient address or the payment amount after the client has signed. These fields are cryptographically bound to the client's EIP-712 signature; any modification would invalidate the signature and be rejected at the verification step. The facilitator's role is strictly to broadcast the pre-authorized transaction, not to custody or redirect funds [^s09].

### V2 Architectural Changes

The December 2025 V2 release introduced a modular, plugin-driven SDK design. Developers register new chains, assets, and payment schemes as standalone packages rather than modifying the SDK core. Lifecycle hooks allow custom logic to be injected at key points in the payment flow (pre-payment validation, post-settlement callbacks). The TypeScript packages were reorganized under the `@x402` npm organization with fine-grained package boundaries: `@x402/core`, `@x402/evm`, `@x402/svm`, `@x402/stellar`, framework middleware packages (`@x402/express`, `@x402/hono`, `@x402/next`, `@x402/fastify`), and `@x402/extensions` [^s04][^s02]. Python (`pip install x402`) and Go (`go get github.com/x402-foundation/x402/go`) SDKs provide equivalent coverage [^s05].

## Payment Schemes

A **scheme** in x402 terminology is a logical payment methodology. Schemes are network-specific in implementation but network-agnostic in concept: the `exact` scheme means "transfer a fixed amount," but how that transfer is constructed differs between an EVM chain and Solana [^s03]. The protocol is extensible; new schemes can be registered without modifying the core.

### The `exact` Scheme

The `exact` scheme transfers a precise, predetermined amount per request. It is the only production-grade scheme currently deployed by the CDP Facilitator. On EVM chains it supports three asset transfer methods [^s09]:

**EIP-3009 (recommended for compatible tokens)**: Tokens implementing `transferWithAuthorization` — primarily USDC and EURC — can be transferred entirely gaslessly. The client signs an authorization object containing `from`, `to`, `value`, `validAfter`, `validBefore`, and a replay-prevention nonce. The facilitator calls `token.transferWithAuthorization()` with the signature; the client never needs to hold ETH for gas.

**Permit2 (universal fallback for any ERC-20)**: Uniswap's Permit2 contract acts as a universal approval relay for tokens lacking EIP-3009. The client signs a witness-transfer authorization; the facilitator calls a canonical proxy contract at `0x402085c248EeA27D92E8b30b2C58ed07f9E20001` [^s09]. A one-time Permit2 approval is required; subsequent payments require only an off-chain signature. Gas sponsorship extensions (see §Extension System) can cover this one-time on-chain approval.

**ERC-7710 (smart contract accounts)**: Accounts implementing ERC-7710 delegation can authorize transfers through a delegation manager contract. Verification is simulation-based — the facilitator simulates `redeemDelegations()` to confirm validity. This enables smart wallet architectures and spend-limit policies without exposing a raw private key [^s09].

On Solana, the `exact` scheme uses SPL Token Program transfers (v1 and v2) and Token2022 program tokens [^s06].

All EVM `exact` payments require EIP-712 compatible signatures producing a 65-byte proof (r, s, v) [^s09].

### The `upto` Scheme

The `upto` scheme allows a client to authorize a maximum spending cap, with the actual charge determined by resource consumption at request completion. This enables metered pricing models such as per-token LLM inference billing or bandwidth-based API charges. The CDP Facilitator supports `upto` on Base, Base Sepolia, Polygon, Arbitrum, World, and World Sepolia [^s06].

### The `deferred` Scheme _(proposed)_

Cloudflare proposed a `deferred` scheme designed for scenarios where immediate on-chain settlement is impractical due to transaction throughput constraints [^s08][^s16]. Under this model, multiple micropayments are aggregated over a period and settled in a single periodic on-chain transaction. The design targets high-frequency use cases such as web crawling or streaming data access where millions of sub-cent payments occur per minute. As of April 2026, the deferred scheme is under active development with a community builder but has not been merged into the main specification.

## Extension System

x402 V2 formalized an extension layer, packaged as `@x402/extensions` in TypeScript and `pip install "x402-avm[extensions]"` for the Algorand variant. Extensions are opt-in capabilities that resource servers and clients can activate independently of the core payment flow.

### Bazaar (Service Discovery)

Bazaar is a resource discovery protocol embedded in x402 that enables payment-gated APIs to advertise their capabilities in a structured, machine-readable format [^s07][^s15]. When a resource server registers the `bazaar_resource_server_extension`, it automatically appends endpoint metadata — accepted input schemas (query parameters for GET/DELETE/HEAD endpoints, request body schemas for POST/PUT/PATCH endpoints), output schemas, pricing, and supported networks — to the 402 response at runtime [^s15].

Facilitators and discovery indexes (including `agentic.market`) crawl these structured responses to build a searchable catalog of payable services. Service operators do not need to manually submit their endpoints; the Bazaar extension and a valid 402 response shape are sufficient for automatic indexing [^s05][^s15]. This is significant for the agent economy: an AI agent can discover what services exist and what they cost before committing to a payment, enabling cost-aware routing.

### Sign-in-with-x (SIWx) _(vendor-stated, not yet shipped)_

SIWx is a planned authentication extension based on CAIP-122 ("Sign-In with Caip Account") that links wallet identity to reusable sessions [^s02][^s05]. Rather than requiring a full on-chain payment per request, SIWx would allow a client to prove wallet control once and receive a session credential valid for subsequent requests. This addresses the overhead of settling a blockchain transaction for every API call in interactive or low-latency scenarios. The extension is listed as an "immediate fast-follow" item in the V2 roadmap but has no published specification or implementation as of April 2026.

### Gas Sponsorship Extensions

A practical barrier to Permit2-based payments is the one-time on-chain ERC-20 approval that new payers must submit before any gasless transfer is possible. x402 V2 introduced two gas sponsorship mechanisms to absorb this cost [^s02][^s05]:

- **EIP-2612 Gas Sponsorship**: for tokens that implement EIP-2612's `permit()` function, the facilitator sponsors the Permit2 approval on-chain using an off-chain signed permit message, requiring zero gas from the buyer.
- **ERC-20 Approval Gas Sponsorship**: for base ERC-20 tokens (such as USDT) that lack both EIP-3009 and EIP-2612, the facilitator sends a small ETH amount to the client to cover the approval gas fee, placing the approval on-chain immediately.

Both mechanisms keep the end-to-end payment experience gasless for the payer, at the cost of additional facilitator-side logic and subsidy.

### Payment Identifiers

Payment identifiers provide idempotency guarantees at the protocol level. When a client includes a stable identifier in the `PaymentPayload`, the resource server can detect and reject duplicate submissions (e.g., a retried request after a network timeout) without double-charging. This extension is described in the CDP FAQ but has minimal independent documentation [^s07].

### A2A x402 Extension (Agent-to-Agent)

Google's Agentic Commerce team published a specification and Python implementation extending x402 to the Agent-to-Agent (A2A) communication protocol [^s10]. The A2A x402 Extension defines a three-message flow:

1. **payment-required**: the merchant agent sends payment terms as a structured A2A message.
2. **payment-submitted**: the client agent signs and returns payment proof.
3. **payment-completed**: the merchant verifies the payment on-chain and delivers the service.

The library follows a "functional core, imperative shell" architecture with executor middleware that automates the flow for agent frameworks. The extension is language-agnostic at the specification level _(unverified — single source)_ [^s10].

### MCP (Model Context Protocol) Integration

x402 integrates with Anthropic's Model Context Protocol to enable per-tool monetization in AI agent frameworks [^s08][^s11]. MCP servers can specify payment requirements at the individual tool level, with optional "mixed mode" where some tools are free and others are paid. Client-side x402 transport handles 402 detection automatically, presenting the payment requirement to a configured signer and retrying without user intervention. The mcp-go-x402 library supports multi-chain signer configuration with priority fallback ordering and per-option spending limits via `.WithMaxAmount()` [^s11].

### Algorand/AVM Extensions

A community implementation (`x402-avm` on PyPI) extends x402 to the Algorand Virtual Machine, adding an `ExactAvmServerScheme` with network identification using Algorand's genesis hash format (e.g., `algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=` for testnet) [^s15]. The package bundles the Bazaar extension and FastAPI/Flask framework middleware.

## Multi-Chain and Token Support

### Network Identification

x402 uses CAIP-2 (Chain Agnostic Improvement Proposal 2) identifiers for all network references, enabling a single client implementation to target multiple blockchains through a consistent string format. Examples: `eip155:8453` (Base mainnet), `eip155:137` (Polygon), `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` (Solana mainnet) [^s05][^s06].

### CDP Facilitator Coverage

The Coinbase Developer Platform facilitator — the primary production facilitator — supports the following networks as of April 2026 [^s06]:

| Network | CAIP-2 ID | Type | Schemes |
|---|---|---|---|
| Base | eip155:8453 | EVM mainnet | exact, upto |
| Base Sepolia | eip155:84532 | EVM testnet | exact, upto |
| Polygon | eip155:137 | EVM mainnet | exact, upto |
| Arbitrum | eip155:42161 | EVM mainnet | exact, upto |
| World Chain | eip155:480 | EVM mainnet | exact, upto |
| World Sepolia | eip155:4801 | EVM testnet | exact, upto |
| Solana | solana:5eykt4… | SVM mainnet | exact |
| Solana Devnet | solana:EtWTRA… | SVM testnet | exact |

Pricing: 1,000 transactions per month are free; subsequent transactions cost $0.001 each. The protocol itself charges no fees [^s06][^s05].

A free, unauthenticated testnet facilitator is also provided at `x402.org`, supporting Base Sepolia and Solana Devnet for development purposes [^s06].

### Token Support

On EVM networks, x402 V2 supports all ERC-20 tokens via Permit2, with fully gasless handling for EIP-3009-compatible tokens (USDC and EURC). This expanded the original v1 scope, which was effectively limited to USDC due to EIP-3009 rarity [^s22][^s06]. On Solana, SPL Token Program (v1 and v2) and Token2022 tokens are supported [^s06]. Stellar's integration natively supports USDC, PYUSD, and USDY as first-class assets rather than bridged or wrapped equivalents [^s14].

### Community-Extended Networks

The ecosystem page lists community facilitators extending x402 to additional networks including Stellar, Algorand, TRON, BNB Chain, and Bitcoin [^s12][^s14][^s15]. The protocol specification explicitly welcomes such contributions and defines backwards compatibility guarantees that prevent breaking changes to existing network support without security justification [^s03].

## Ecosystem, Governance, and Adoption

### x402 Foundation

In September 2025, Coinbase and Cloudflare co-founded the x402 Foundation as an independent stewardship body for the protocol [^s08][^s23]. The Foundation's mandate is to encourage adoption and maintain the protocol's neutrality. As of April 2026, the structural details of the Foundation (legal form, governance rules, membership) have not been formally published; the Cloudflare announcement stated that further specifics were forthcoming _(vendor-stated)_ [^s08].

### Ecosystem Partners

The x402 ecosystem page lists AWS, Cloudflare, Stripe, Vercel, World, Google, Visa, and Circle among organizations that have announced support for or integration with x402 [^s23][^s08]. Cloudflare has the most documented technical integration: native x402 support in its Agents SDK and Workers platform, a live playground environment using testnet USDC on Base, and authorship of the deferred scheme proposal. Coinbase operates the primary CDP Facilitator. The depth of integration for other named partners varies [^s12][^s23].

### SDKs and Tooling

Production-ready SDKs exist in TypeScript (the `@x402` npm organization with modular packages), Python (`pip install x402`), and Go. Community implementations exist in Rust (axum support via `x402-rs`), Java, and other languages [^s05][^s04][^s12]. The ecosystem includes 50-plus facilitators, dashboards (x402station), proxy CLIs (x402-proxy), and service discovery tools (x402search, EntRoute, OpenClaw with 13,000-plus indexed APIs) [^s12].

### Adoption Metrics

Reported adoption figures vary significantly across sources and time periods, reflecting both genuine growth and methodology differences:

- CryptoSlate (December 2025): 75 million total transactions, $24 million settled over the first seven months [^s17].
- Sherlock (early 2026): 119 million-plus transactions on Base, $600 million annualized payment volume [^s19].
- Solana Foundation: 35 million-plus transactions and $10 million-plus volume on Solana since its summer 2025 launch [^s13].
- MEXC News: $600 million annualized aggregate volume [^s18].

A reported 92% collapse in daily transaction volume between December 2025 and February 2026 (from an average of 731,000 to 57,000 daily transactions) _(unverified — single source)_ raises questions about how much of the early peak reflected genuine protocol usage versus speculative or test activity (see §Limitations and Discussion).

## Limitations and Discussion

### Payment Irreversibility

x402 payments are push payments and are irreversible once settled on-chain. The protocol defines no native refund mechanism. The CDP FAQ acknowledges this explicitly, noting that refunds require a separate out-of-band transfer or a future escrow-based conditional payment extension [^s07]. This is a significant constraint for any use case involving partial delivery, disputed output quality, or user error.

### Facilitator Trust Requirement

Although the facilitator cannot alter payment amounts or recipients (which are cryptographically bound), clients must still trust the facilitator to behave correctly. Independent security researchers have identified three concrete failure modes when a facilitator is compromised or unavailable [^s26]:

- **Fabrication**: the facilitator falsely claims a payment settled; the resource operator delivers the service and receives nothing.
- **Censorship**: the facilitator refuses to verify or settle valid payments; since it is the only settlement path, clients are locked out of all x402-gated services behind that facilitator.
- **Downtime**: the facilitator endpoint goes offline, cascading into unavailability for every service it backs regardless of individual operator health.

The current protocol relies on the resource server accepting the facilitator's HTTP response at face value — there is no cryptographic receipt, no on-chain confirmation requirement, and no economic bond penalizing misbehavior. Proposed mitigations include independent on-chain receipt verification, local signature validation (bypassing the `/verify` endpoint), operator self-settlement via direct `transferWithAuthorization` calls, and long-term on-chain slashing mechanisms [^s26]. Self-hosting a facilitator is possible but requires blockchain infrastructure and maintenance [^s03][^s09].

### Governance Transparency

The official ROADMAP.md file in the coinbase/x402 repository contains only the placeholder text "(update coming soon)" _(unverified — single source)_ [^s25]. The x402 Foundation's structural details remain unpublished as of April 2026 [^s08]. This creates a governance transparency gap that may concern organizations evaluating x402 for production use.

### Metric Reliability

Transaction volume metrics carry material uncertainty. Published peak figures appear to include speculative activity: CryptoSlate notes that "exchanges list speculative tokens branded 'x402'" despite the protocol having no native token [^s17]. The reported 92% daily volume decline in early 2026 _(unverified — single source)_ is consistent with the protocol's peak figures having included significant speculative or test activity rather than organic protocol usage. Independent verification of genuine protocol transaction counts is not currently possible through public sources.

### Token and Extension Immaturity

In v1, only USDC was practically usable due to EIP-3009's rarity; the broadening to all ERC-20s via Permit2 is a V2 capability that requires the gas sponsorship extensions to remain seamless [^s22]. Sign-in-with-x and the deferred payment scheme, both significant for real-world adoption, remain unshipped as of April 2026. The ROADMAP.md stub provides no timeline guidance.

### Security Audit Status

No public record of a formal third-party security audit of the x402 protocol specification or the CDP Facilitator implementation was found during research [^s16]. Given that the facilitator handles on-chain settlement of real stablecoin payments, this is a material risk disclosure for prospective integrators.

### Competing Approaches

**L402 (Lightning Network)**: The Lightning Labs L402 specification repurposed the same HTTP 402 code using Lightning Network invoices and macaroon tokens as access credentials. L402 has multi-year production maturity but is limited to Bitcoin's ecosystem and is not chain-agnostic [^s16].

**EVMAuth**: A newer standard using ERC-1155 tokens as time-limited, role-based access credentials. EVMAuth provides more granular authorization control (subscription tiers, delegation, transferable access) than x402's payment-centric model. The two protocols address different problem surfaces and may be complementary [^s16].

**Stripe / Visa agentic payments**: Both Stripe and Visa are building stablecoin support and agent-payment tooling. These approaches carry the trust guarantees of established financial infrastructure but inherit its friction (account requirements, KYC, minimum transaction values) [^s16].

## Abstract

x402 is an open, internet-native payment protocol built on the HTTP 402 status code, designed to embed stablecoin payments directly into the standard request/response cycle for machine-to-machine and AI agent commerce. Launched by Coinbase in May 2025 and stewarded since September 2025 by the x402 Foundation (co-founded with Cloudflare), the protocol defines three custom HTTP headers, a trust-minimizing facilitator model, and an extensible scheme system covering fixed-amount (`exact`), consumption-based (`upto`), and proposed batched (`deferred`) payments. The V2 release (December 2025) broadened token support to all ERC-20 assets via Permit2 and formalized the extension system, which includes Bazaar (service discovery), Sign-in-with-x (wallet sessions, planned), and gas sponsorship extensions. The CDP Facilitator supports Base, Polygon, Arbitrum, World Chain, and Solana; community facilitators extend coverage to Stellar, Algorand, TRON, and others. Reported annualized payment volume reaches $600 million, though peak figures appear inflated by speculative activity and a 92% daily volume decline in early 2026 raises reliability questions. Significant open issues include payment irreversibility, facilitator trust dependency, governance opacity, and the unshipped status of several headline extensions.
