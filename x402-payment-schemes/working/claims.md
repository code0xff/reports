# Claims

## Introduction
- [x] c01: x402 is an open HTTP-native payment protocol that revives the HTTP 402 status code for machine-payable resources.
  - kind: factual
  - needs: primary doc + vendor announcement
- [x] c02: As of late April 2026 Coinbase reported on the order of ~$50M cumulative volume and ~165M transactions on x402.
  - kind: factual
  - needs: vendor figure + independent reporting with caveat

## Background
- [x] c03: An x402 transaction follows a challenge–retry cycle where a server returns HTTP 402 with payment requirements and the client retries with a signed payment header.
  - kind: technical
  - needs: docs primary
- [x] c04: x402 separates "scheme" (payment semantics) from "network" (execution chain), advertised via CAIP-2 identifiers.
  - kind: technical
  - needs: docs primary
- [x] c05: Facilitators expose `/verify` and `/settle` endpoints that servers can delegate to instead of handling on-chain settlement themselves.
  - kind: technical
  - needs: docs primary

## Current state
- [x] c06: The x402 specification currently defines three production scheme types: `exact`, `upto`, and `batch-settlement`.
  - kind: factual
  - needs: docs overview + GitHub spec listing
- [x] c07: The `exact` scheme is for fixed-price requests where the buyer signs for the advertised amount.
  - kind: technical
  - needs: spec
- [x] c08: The `upto` scheme is for single-request usage-based billing where the buyer authorizes a maximum and the seller charges actual usage at settlement.
  - kind: technical
  - needs: spec
- [x] c09: The `batch-settlement` scheme uses stateless unidirectional escrow channels and off-chain cumulative vouchers, with periodic on-chain claim/settle/refund.
  - kind: technical
  - needs: docs primary
- [x] c10: Cloudflare has proposed a "deferred" scheme that decouples cryptographic verification from financial settlement.
  - kind: factual
  - needs: Cloudflare blog primary

## Analysis
- [x] c11: On EVM, the `exact` scheme uses EIP-3009 `transferWithAuthorization` by default, falling back to Permit2 via a canonical `x402ExactPermit2Proxy` for ERC-20s without EIP-3009.
  - kind: technical
  - needs: spec
- [x] c12: The `upto` EVM implementation uses Permit2 because the settled amount is not known when the buyer signs.
  - kind: technical
  - needs: docs primary
- [x] c13: The `exact` scheme is available on EVM, Solana, TON, Stellar, Aptos, and Hedera, while `batch-settlement` is EVM-only.
  - kind: technical
  - needs: docs network/token-support page
- [x] c14: Each `upto` authorization MUST be settled at most once, and the settled amount must not exceed the authorized maximum.
  - kind: technical
  - needs: scheme_upto.md spec

## Discussion
- [x] c15: x402 has transitioned from a Coinbase-led project to a vendor-neutral foundation backed by Cloudflare, Stripe, Google, Visa, Mastercard, and AWS among others.
  - kind: factual
  - needs: announcement + independent reporting
- [x] c16: A material share of reported x402 transaction counts in 2025 was inflated by "x402"-themed memecoin activity rather than genuine paid-resource usage.
  - kind: interpretive
  - needs: independent analysis citing Bankless
