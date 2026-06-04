# Analyzing draft-evm-charge-00: The EVM Charge Intent for HTTP Payment Authentication

## Abstract

`draft-evm-charge-00`, "EVM Charge Intent for HTTP Payment Authentication," is an Internet-Draft dated 3 June 2026, co-authored by Brett DiNovi (MegaETH Labs), Conner Swenberg (Coinbase), and Kyle Scott (Monad Foundation).[^s01] It is the **EVM method binding** of **Tempo's Machine Payments Protocol (MPP)** — a payment-method-agnostic "Payment" HTTP authentication scheme that operates over HTTP 402 — and it unifies EVM-compatible chains under a single `evm` method because "the control flow, data structures, and verification logic are identical across these chains."[^s01][^s02][^s03] The charge flow runs: server 402 + `WWW-Authenticate: Payment` challenge → client off-chain signature → `Authorization: Payment` submission → server on-chain verification/settlement → `Payment-Receipt` + 200.[^s01][^s03] Its core is **four credential types**: `permit2` (recommended), `authorization` (EIP-3009 only), `transaction`, and `hash` — differing in who pays gas, challenge-binding strength, and split-payment support.[^s01] One author is x402's designer (Coinbase's Conner Swenberg), and an independent explainer calls MPP "backward-compatible with x402 at the charge layer" — so this draft reads as an effort to standardize x402-style EVM payments inside the MPP framework.[^s05][^s01] It is, however, a v00 first edition and non-standard, and centralization (Tempo L1) and gatekeeping (Stripe) critiques exist around the broader stack.[^s05][^s06]

## 1. Introduction

The task of this report is to read and analyze a specific document, `https://paymentauth.org/draft-evm-charge-00.txt`. Its metadata: title "EVM Charge Intent for HTTP Payment Authentication," identifier `draft-evm-charge-00`, status Internet-Draft, dated 2026-06-03, expiring 2026-12-05, authored by Brett DiNovi (MegaETH Labs), Conner Swenberg (Coinbase), and Kyle Scott (Monad Foundation).[^s01]

The problem it solves is explicit: rather than defining a separate payment method per EVM chain, fold the identical control flow, data structures, and verification logic into one `evm` method.[^s01] This report (1) situates the document in its parent framework (MPP), then analyzes (2) the charge flow and headers, (3) the four credential types, (4) verification/settlement/replay, and (5) security and the x402 relationship. Evidence is the target draft (primary) plus paymentauth.org's base and discovery drafts and an independent MPP explainer.[^s01][^s02][^s03][^s05]

## 2. The parent framework: MPP and the "Payment" HTTP authentication scheme

`paymentauth.org` hosts **Tempo's Machine Payments Protocol (MPP)** specifications. The core includes the "Payment" HTTP authentication scheme (`draft-httpauth-payment`), service discovery (`draft-payment-discovery`; services publish an OpenAPI document annotated with pricing, payment methods, and intents as a machine-readable contract),[^s04] and JSON-RPC & MCP transport; above it sit per-method drafts (Card, EVM, Hedera, Lightning, Solana, Stellar, Stripe, Tempo) and session specs. The repository is `tempoxyz/mpp-specs` on GitHub.[^s02]

The base "Payment" scheme runs over HTTP 402 "Payment Required" and is "payment-method agnostic, supporting any payment network or currency through registered payment method identifiers."[^s03] The challenge (`WWW-Authenticate: Payment`) carries `id`, `realm`, `method`, `intent`, `request` (base64url JSON), and optional `expires`; the credential (`Authorization: Payment`) carries base64url JSON `{challenge, source, payload}`.[^s03] Methods and intents are registered in their own specs and IANA registries, extensible without changing the core.[^s03] MPP distinguishes **charge** intent (one-shot) from **session** intent (escrow once, then stream signed vouchers); this draft is the **EVM binding of the charge intent**.[^s05][^s01] Accordingly the document registers, with IANA, the payment method `evm` (ERC-20 transfer on EVM chains) and the intent `charge` (one-time ERC-20 transfer, applicable to `evm`).[^s01]

## 3. The charge flow and HTTP headers

The charge flow has six steps.[^s01][^s03]

1. Client requests a protected resource.
2. Server responds `402 Payment Required` with a `WWW-Authenticate: Payment` challenge (`id`, `realm`, `method`, `intent`, `request`, `expires`).
3. Client signs the authorization in the manner appropriate to the credential type.
4. Client submits a base64url credential via `Authorization: Payment`.
5. Server verifies and settles on-chain.
6. Server returns a `Payment-Receipt` header and `200 OK`.

The challenge's `request` carries `amount` (base units), `currency` (ERC-20 contract address), `recipient`, optional `description`/`externalId`, and `methodDetails` with `chainId` (EIP-155), `credentialTypes`, and `splits` (recipient/amount/memo array).[^s01] The credential contains the echoed `challenge`, a type-specific `payload`, and an optional `source` (`did:pkh:eip155:...` recommended); the receipt carries `method`, `challengeId`, `reference` (tx hash), `status`, `timestamp` (RFC3339), and `chainId`.[^s01]

## 4. The four credential types

The document's design centers on four credential types, trading off token compatibility, gas burden, and binding strength.[^s01]

- **`permit2` (recommended)**: the client signs an off-chain EIP-712 Permit2 authorization; the server constructs and broadcasts the transaction and **pays gas**. It supports atomic split payments via batch transfers, with challenge binding via witness data.
- **`authorization` (EIP-3009 tokens only)**: the client signs an off-chain `transferWithAuthorization` message and the server submits it to the token contract. No Permit2 prerequisite (**zero setup**), the server pays gas, and binding uses an on-chain nonce.
- **`transaction`**: the client signs a complete ERC-20 transfer transaction and the server broadcasts it; the **client pays gas**. A fallback for chains without Permit2.
- **`hash`**: the client broadcasts the transaction itself and presents the confirmed hash, which the server verifies on-chain. This is the **weakest challenge binding** and does not support splits.

So the types split along one axis of server-pays-gas (`permit2`/`authorization`, gasless client) vs. client-pays-gas (`transaction`/`hash`), and another where only `permit2` fully supports atomic splits.[^s01]

## 5. Verification, settlement, and replay protection

**Verification (permit2 example).** Before settling, the server MUST verify: (1) a valid EIP-712 signature, (2) the deadline not expired, (3) the signer's balance and Permit2 allowance sufficient, (4) `witness.challengeHash` matches the value derived from the challenge `id`/`realm`, (5) transfer amounts and recipients match the request, and (6) for splits, the `transferDetails` array matches the permitted and splits arrays.[^s01]

**Settlement.** A single permit2 transfer calls `Permit2.permitWitnessTransferFrom()`; splits call `permitBatchWitnessTransferFrom()`, making all transfers atomic — the document states "all succeed or all revert."[^s01] `authorization` calls the token's `transferWithAuthorization()`, `transaction` broadcasts a signed EIP-1559 tx, and `hash` fetches a receipt via `eth_getTransactionReceipt()`. All settlement requires a successful receipt (inclusion in a block).[^s01]

**Replay and challenge binding.** The document's key security property is that "the signature cannot be reused against a different challenge, even if the payment parameters are identical."[^s01] This is realized per type — permit2 via `witness.challengeHash` in the EIP-712 struct, EIP-3009 via `nonce = keccak256(challenge.id || challenge.realm)`, and transaction/hash via the server matching on-chain state (weaker).[^s01] Replay protection likewise differs: permit2/authorization consume an on-chain nonce, transaction uses chainId+nonce, and hash uses hash-deduplication tracking.[^s01]

## 6. Security considerations and the x402 relationship

**Security.** The document layers several considerations.[^s01] With gas sponsorship (server pays gas for permit2/authorization), it flags **DoS** risk via failed transactions and recommends `eth_call` simulation before broadcast as mitigation. Split payments use batch atomicity ("all succeed or all revert") to prevent partial failure; it also addresses the weak binding of `hash`, RPC trust (the server confirms chain state via RPC), and fee-payer risks in dedicated sections.[^s01]

**Relationship to x402.** This draft did not appear in a vacuum. One author is **x402's designer (Coinbase's Conner Swenberg)**, and the credentials are built on Permit2 witnesses and EIP-3009 `transferWithAuthorization` — the same family as x402's EVM payments.[^s01] An independent explainer assesses that "**MPP is backward-compatible with x402 at the charge layer**," and that MPP eliminates the facilitator concept and ships production-ready fiat while x402 prioritizes permissionlessness.[^s05] So evm-charge reads as an attempt to absorb and standardize x402-style EVM payments via MPP's method/intent registry. _(an explainer's assessment — the draft is not confirmed to guarantee x402 compatibility in normative text)_[^s05][^s01]

**Critiques.** The broader stack draws centralization critiques — Tempo is a VC-backed L1 with "centralized validator sets at launch," and Stripe dependency raises fintech-gatekeeping concerns, with stablecoin acceptance currently US-centric.[^s05][^s06] These are concerns about MPP/Tempo overall rather than defects of the evm-charge draft itself.

## 7. Limitations

- **v00, non-standard.** draft-evm-charge-00 is a first edition dated 2026-06-03, expiring 2026-12-05, and is not an IETF-endorsed standard; fields, credentials, and procedures may change in revisions.[^s01][^s03]
- **Single-document dependence.** Technical statements about the document's *content* rest on that document (s01) as the sole primary source. It is reproduced faithfully but not validated by independent implementation, audit, or peer review; "the document specifies" does not mean "safe/valid/adopted."[^s01]
- **Base-scheme naming difference.** The base "Payment" scheme appears as `draft-ryan-httpauth-payment-01` on the IETF datatracker and as `draft-httpauth-payment-00` in MPP commentary — apparently the same lineage, but identity is not asserted with certainty.[^s03][^s05]
- **No deployment/implementation.** No server/client implementation, deployment, or interop of this draft was confirmed.
- **x402 compatibility / centralization are external assessments.** The x402 charge-layer compatibility and the Tempo/Stripe critiques are commentators' assessments, not normative guarantees in the draft.[^s05][^s06]
