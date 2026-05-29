# Claims — Google AP2 (Agent Payments Protocol)

## Introduction
- [x] c01: Google announced AP2 on 2025-09-16/17 with 60+ launch partners spanning card networks, PSPs, and Web3 providers. [s03,s10,s12]
- [x] c02: AP2 is a payment-and-commerce extension to Google's A2A protocol and complements MCP, not a replacement. [s01,s03,s10]

## Background — A2A, MCP, and the gap AP2 fills
- [x] c03: AP2 operates as a security layer on top of a separate Commerce Protocol (e.g. UCP); catalog APIs and checkout transport are explicitly outside AP2's scope. [s01]
- [x] c04: In April 2026 Google released AP2 v0.2 and donated the protocol to the FIDO Alliance for community governance; v0.2 added Human-Not-Present payments and Verifiable Intent. [s12]

## Architecture and the Mandate model
- [x] c05: AP2 defines five roles — Shopping Agent, Credential Provider, Merchant, Merchant Payment Processor, Trusted Surface; the Trusted Surface MUST be non-agentic. [s01]
- [x] c06: v0.2 consolidates the v0.1 three-mandate model into Checkout Mandate + Payment Mandate carried as SD-JWTs identified by a `vct` claim. [s01,s05]
- [x] c07: The Payment Mandate's `transaction_id` equals the Checkout Mandate's `checkout_hash`, which is the base64url hash of the merchant-signed Checkout JWT. [s01,s05]
- [x] c08: AP2 requires the Checkout JWT to use a probabilistic signature scheme (e.g. ECDSA), not a deterministic one (e.g. Ed25519), to prevent rainbow-table attacks on the linking hash. [s01]
- [x] c09: AP2 defines two delegation models — User Credential and Trusted Agent Provider. [s07]
- [x] c10: AP2 distinguishes Human-Present (user signs closed mandates at payment time) from Human-Not-Present (user pre-signs open mandates with constraints). [s06]
- [x] c11: The v0.1 SDK still ships an `IntentMandate` with `user_cart_confirmation_required`, `natural_language_description`, `merchants`, `skus`, `requires_refundability`, `intent_expiry`. [s04,s05]

## Code-level walkthrough and example implementation
- [x] c12: The repo ships A2A and MCP variants in Python and Go, with the Python sample using Google ADK and an A2A message builder. [s02,s09]
- [x] c13: The Python SDK builds Mandates as SD-JWTs via `ap2.sdk.generated.checkout_mandate.CheckoutMandate` and `PaymentMandate` and signs with ECDSA P-256 (SECP256R1). [s09]
- [x] c14: A dedicated x402 sample runs autonomous purchases on price-drop triggers using x402-compatible crypto rails, skipping interactive OTP. [s08]

## Analysis — comparisons and tradeoffs
- [x] c15: AP2 is payment-rail-agnostic and supports cards, real-time bank transfers, and stablecoins; the crypto path uses the A2A x402 extension co-developed with Coinbase, MetaMask, and the Ethereum Foundation. [s03,s10]
- [x] c16: AP2 explicitly treats the Shopping Agent as a potential attacker on the user's behalf and therefore requires tamper-evident user-signed Mandates instead of relying only on standard web security. [s01]

## Discussion
- [x] c17: Independent technical writeups describe AP2 with the same Mandate/VC framing but disagree on naming — some use v0.1 (Intent/Cart/Payment), some v0.2 (Checkout/Payment). [s10,s11,s13]
- [x] c18: AP2's adoption value is tied to ecosystem reach (Mastercard, AmEx, PayPal, Adyen, Coinbase, MetaMask, …) and the FIDO Alliance donation. [s03,s10,s12]
