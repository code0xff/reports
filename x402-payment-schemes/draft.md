## Introduction

x402 is an open, HTTP-native payment protocol that operationalizes the long-dormant HTTP 402 "Payment Required" status code, originally proposed by Coinbase and now governed by a multi-vendor foundation.[^s01][^s13] Its design goal is to let any HTTP resource — a paywalled article, an API call, an AI-agent tool — be paid for inline, without accounts, sessions, or out-of-band billing infrastructure.[^s02][^s13] Schemes are the part of x402 that decides *how* money moves: fixed price, metered usage, batched off-chain channels, or (proposed) deferred settlement. This report surveys every scheme defined as of May 2026, the networks each runs on, and the implementation choices a server or client developer has to make.

Coinbase has reported on the order of ~165 million transactions and roughly ~$50M cumulative volume across x402 by late April 2026, with ~69k active agents.[^s13] These figures are vendor-stated and, as independent analysis has noted, partially inflated by speculative "x402"-themed memecoin activity rather than paid-resource consumption.[^s14] _(early signal)_

## Background

The base flow is a single challenge–retry round trip. A client requests a protected resource; the server replies `402 Payment Required` with a `PAYMENT-REQUIRED` header (renamed from earlier `X-PAYMENT-REQUIRED` in V2) carrying one or more payment requirements; the client picks one, signs a payload, and resubmits the request with a `PAYMENT-SIGNATURE` header; the server (directly or via a facilitator) verifies the payload, processes the request, and settles the payment; the response carries a `PAYMENT-RESPONSE` confirmation alongside the resource.[^s02][^s15] x402 V2 also reorganises the SDK so chains and schemes are registered as plugins and replaces several legacy `X-*` headers.[^s12]

A payment requirement carries (at minimum) `scheme`, `network`, `amount`, `asset`, `payTo`, `maxTimeoutSeconds`, and an `extra` block for network-specific metadata.[^s01] `network` is a CAIP-2 identifier (`eip155:<chainId>`, `solana:<genesisHash>`, `tvm:<workchain>`, `aptos:<chainId>`, etc.), so the scheme/network split is what lets the same protocol speak to ERC-20s, SPL tokens, TON jettons, and Soroban tokens behind a single header contract.[^s06]

Facilitators are a separate service tier with two endpoints: `/verify` accepts the signed payload plus the payment requirements and returns a verification verdict for the advertised `scheme`/`network`; `/settle` submits the payment on-chain and waits for confirmation.[^s07] Servers can run the whole flow themselves, but in practice they usually delegate to a facilitator (Coinbase's CDP facilitator, PayAI, x402.rs, Mogami, and others) to avoid hot-wallet operations and gas management.[^s14] Multiple production facilitators support Base, Solana, Polygon, Avalanche, and more.[^s07]

## Current state — defined schemes

As of May 2026 the canonical x402 specification defines three production schemes — `exact`, `upto`, and `batch-settlement`.[^s01][^s10] A fourth, `deferred`, has been proposed by Cloudflare but is not yet a merged spec.[^s11]

**`exact` — fixed-price requests.** The buyer authorizes exactly the advertised amount. It is the recommended choice "when the final charge is known before the response is generated, such as a fixed-price API call, file download, or gated page."[^s03] On EVM the default transfer method is the token-native EIP-3009 `transferWithAuthorization`, which is what USDC supports; for ERC-20s without EIP-3009, x402 falls back to a Permit2-based path through a canonical proxy contract (see Analysis).[^s03][^s09] Beyond EVM, `exact` has implementations on Solana (SPL/Token-2022 transfer), TON (signed W5R1 jetton message), Stellar (SEP-41 `transfer()`), Aptos (`primary_fungible_store::transfer`), and Hedera (HBAR/HTS Transfer Transaction).[^s06]

**`upto` — single-request usage-based billing.** The buyer signs once for a maximum; the server, after processing, declares the actual charge at settlement, which the facilitator validates against the signed maximum.[^s04][^s08] This is the scheme designed for LLM token generation, bandwidth metering, and other "I won't know the cost until I serve the response" cases.[^s04] The settlement override accepts raw atomic units (`"50000"`), percentages (`"50%"`), dollar strings (`"$0.05"`), or `"0"` for a free response.[^s04] The official spec sets two non-negotiable rules: each authorization MUST be settled at most once, and the settled amount must be less than or equal to the previously authorized maximum.[^s08]

**`batch-settlement` — stateless unidirectional channels.** The buyer makes a single on-chain escrow deposit, then per-request signs a *cumulative* voucher that records the channel's running total claimable amount; the seller verifies and serves immediately without settling on-chain.[^s05] Periodically the server's channel manager runs three batched operations: **claim** (sweep many vouchers in one transaction), **settle** (move claimed funds to the receiver), and **refund** (cooperative refund of idle channels after vouchers are claimed).[^s05] The per-request `price` is still a maximum, and the spec recommends a deposit policy with a minimum 3× and default 5× multiplier of the per-request maximum to keep the channel solvent against bursty usage.[^s05] _(unverified — single source: the linked GitHub spec for `scheme_batch_settlement_evm.md` was not directly retrievable.)_

**Networks per scheme.** `exact` runs on EVM, Solana, TON, Stellar, Aptos, and Hedera; `upto`'s documented variant is EVM-only (Permit2-based); `batch-settlement` is EVM-only and was shown live on `eip155:84532` (Base Sepolia).[^s05][^s06]

## Current state — proposed schemes

Cloudflare's `deferred` scheme is a proposal — not yet merged — that decouples cryptographic verification from financial settlement: a server validates the buyer's signed intent immediately, but settles later via subscriptions, daily batches, or even traditional banking rails.[^s11] The motivation is real-world agent workloads like Cloudflare's "pay per crawl" service, where the cost of per-request on-chain settlement dominates the payment itself.[^s11] _(early signal — vendor proposal, not yet a canonical scheme.)_

## Analysis — implementation paths

### `exact` on EVM: EIP-3009 vs Permit2

The EVM specification documents two transfer paths. The default is the token's own `transferWithAuthorization` from EIP-3009: the payload is `{signature, authorization{from, to, value, validAfter, validBefore, nonce}}` and the facilitator (a) recovers the signature to `from`, (b) checks balance, (c) checks the authorization matches the payment requirement, (d) simulates the call, and (e) broadcasts it.[^s09] The Permit2 path is used when the token lacks EIP-3009: the buyer signs a `permitWitnessTransferFrom` whose witness binds `recipient + validAfter`, and the facilitator routes through a canonical `x402ExactPermit2Proxy` at `0x402085c248EeA27D92E8b30b2C58ed07f9E20001`, deployed via CREATE2 at the same address across chains so that "the destination cannot be altered by the facilitator."[^s09] Permit2 requires a one-time approval, which can be obtained via direct approval, a gas-sponsored approval, or an EIP-2612 permit if the token supports it.[^s09]

### `upto` on EVM: why Permit2 is the only feasible primitive

`upto` cannot use EIP-3009 directly because the value the buyer signs is the *maximum*, not the actual charge, and EIP-3009 has no nonce/witness mechanism for amount mutation; the EVM `upto` implementation therefore uses Permit2's nonce and witness mechanisms to bind the recipient and the validity window while leaving the final amount as a settlement-time choice, validated by the facilitator against the signed cap.[^s04][^s08] The spec's "settle at most once" rule means the nonce is single-use even when the final amount is zero.[^s08]

### `batch-settlement` operationally

Server-side configuration for `batch-settlement` requires (a) channel storage (file-based for single-process deployments, Redis for distributed), (b) cadence intervals for the claim/settle/refund operations, and (c) a deposit policy multiplier (minimum 3×, default 5× the per-request maximum).[^s05] Client-side registration uses `"eip155:*"` to opt into batch settlement on every EVM chain the client supports.[^s05]

### SDK surface

The reference SDKs are TypeScript, Python, and Go. The TypeScript stack is published as `@x402/core`, plus per-network modules (`@x402/evm`, `@x402/svm`), an Express middleware (`@x402/express`), and a fetch wrapper (`@x402/fetch`) for clients; Python and Go ship parallel packages.[^s10][^s02] Server registration is "register the scheme implementations for the networks you advertise"; clients mirror with "register implementations for networks you can pay on."[^s01]

## Discussion

x402 moved out of Coinbase-as-sole-steward in late 2025 and into the x402 Foundation, whose governing body includes Cloudflare and Stripe and whose founding members include Adyen, AWS, American Express, Google, Mastercard, Microsoft, Shopify, and Visa.[^s11][^s13] V2, launched in early 2026, formalised the plug-in architecture for scheme and chain registration, added dynamic per-request routing/pricing, and introduced wallet-based sessions that let clients skip the full payment flow on repeated access to a previously purchased resource (intended for LLM-inference loops).[^s12]

The headline adoption numbers — ~165M transactions, ~$50M cumulative, ~69k agents — should be read carefully. An independent write-up citing Bankless analysis estimated that ~150,000 of the ~150–163k *weekly* transactions in October 2025 came from the PING memecoin's "x402"-labelled activity rather than from paid-resource consumption.[^s14] Genuine utility signal comes from concrete deployments: Pinata's account-free IPFS uploads, Snack Money's per-article paywalls, Questflow's autonomous microtransactions (~130k transactions), and Lowe's Innovation Lab proof-of-concept, plus Google's adoption of x402 as a crypto rail inside the Agent Payments Protocol.[^s14]

The most consequential design choice for adopters is which scheme to advertise. The trade-off is straightforward: `exact` keeps everything on one transaction and is easiest to integrate, `upto` needs Permit2 and settlement-time amount logic but matches the cost shape of LLM workloads, and `batch-settlement` amortises gas across many requests at the cost of running a channel manager and tying up a 3–5× deposit. The proposed `deferred` scheme is a fourth axis — verify-now/settle-later — but is not yet canonical.[^s05][^s08][^s11]

## Limitations

- The canonical `batch-settlement` EVM spec file on GitHub returned a 404 to direct fetch during this research; the description here relies on the docs.x402.org page (a primary vendor source) without an independent technical second.
- The `deferred` scheme is Cloudflare-proposed and not merged into the x402 specification at the time of writing; its inclusion above is as a proposal, not as a shipped scheme.
- The transaction and dollar-volume figures are vendor-reported, and the only independent commentary located here flags substantial memecoin-driven inflation; the underlying Bankless analysis was not retrieved directly.
- Production deployments of the Permit2 proxy on every advertised EVM chain were not independently re-verified — the spec asserts CREATE2 deployment at the same address but per-chain verification was out of scope.

## Abstract

x402 is an HTTP-native payment protocol that uses the `402 Payment Required` status code to let any web resource demand cryptographic payment authorization inline. As of May 2026 it defines three production schemes — `exact` (fixed-price single-shot), `upto` (single-request usage-based billing with a signed maximum), and `batch-settlement` (off-chain cumulative-voucher channels with batched on-chain redemption) — and one proposed scheme, Cloudflare's `deferred`, which separates verification from settlement. `exact` is the most broadly supported, running on EVM, Solana, TON, Stellar, Aptos, and Hedera; `upto` and `batch-settlement` are EVM-only. Implementation on EVM relies on EIP-3009 `transferWithAuthorization` when available and otherwise on Permit2 routed through a canonical `x402ExactPermit2Proxy` deployed via CREATE2; `upto` uses Permit2 specifically because the buyer cannot pre-sign the final amount. The protocol moved from Coinbase stewardship to a multi-vendor foundation in late 2025, and V2 (early 2026) reorganised SDKs around plug-in chain/scheme registration; headline adoption figures are large but vendor-stated, with credible independent analysis noting heavy inflation from memecoin activity rather than paid-resource usage.

