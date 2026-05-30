# Claims — OpenAI × Stripe Agentic Commerce Protocol (ACP)

## Introduction
- [x] c01: ACP is an open standard, Apache-2.0 licensed, currently in `beta` status, maintained by OpenAI and Stripe as Founding Maintainers. [s01,s02]
- [x] c02: ACP's first production showcase is OpenAI's "Instant Checkout" inside ChatGPT, with Stripe as the first compatible PSP. [s01,s09]

## Background — Three parties and dated versions
- [x] c03: ACP models three roles — Agent (e.g. ChatGPT), PSP (payment service provider), and Merchant — where the Agent calls the Merchant's ACP endpoints and the PSP returns a vault token that the Agent passes on to the Merchant. [s04]
- [x] c04: ACP versions are released as dated snapshots; published spec directories include 2025-09-29 (initial release), 2025-12-12, 2026-01-16, 2026-01-30, and 2026-04-17 (cart, feed, orders, delegate-authentication, MCP binding). [s02]

## Architecture — Agentic Checkout + Delegated Payment
- [x] c05: ACP is composed of two REST sub-specs — Agentic Checkout (`/checkout_sessions` create/update/get/`/complete`/`/cancel`) and Delegated Payment (`POST /agentic_commerce/delegate_payment`). [s07,s08]
- [x] c06: Every Delegated Payment request carries an `Idempotency-Key` header (mandatory in the schema's error model), an optional `Signature` header described as a "Detached JSON signature for request verification", a `Timestamp` header for replay protection, and an `API-Version` header. [s07]
- [x] c07: The Delegated Payment response is a `vt_…`-prefixed vault token that the PSP returns to the Agent and that the Agent passes to the Merchant; the token is single-use and scoped by the request's Allowance. [s03,s05]
- [x] c08: The Allowance object bounds the token by `reason` (e.g. `one_time`), `max_amount`, `currency`, `checkout_session_id`, `merchant_id`, and `expires_at`. [s05,s07]
- [x] c09: In the 2026-04-17 spec, the checkout session response advertises a `capabilities.payment.handlers[]` array that names each payment handler by a reverse-DNS id (e.g. `dev.acp.tokenized.card`, `dev.acp.seller_backed.saved_card`), with `requires_delegate_payment`, `requires_pci_compliance`, `psp: "stripe"`, and per-handler config. [s06]

## Code-level walkthrough — example implementation
- [x] c10: The canonical happy-path flow is: (1) `POST /checkout_sessions` to the Merchant, (2) read the returned `capabilities.payment.handlers[]` to pick a handler, (3) `POST /agentic_commerce/delegate_payment` to the PSP to mint a `vt_…`, (4) `POST /checkout_sessions/{id}/complete` to the Merchant with the vault token. [s05,s06,s07,s08]
- [x] c11: ACP defines specific PSP error codes — `invalid_card`, `idempotency_conflict`, `idempotency_in_flight`, `idempotency_key_required`, and `too_many_requests` — at well-known JSON paths. [s05]
- [x] c12: There is an independent reference implementation at `locus-technologies/agentic-commerce-protocol-demo` that integrates ACP against real Stripe APIs. [s12]

## Analysis — comparisons and tradeoffs
- [x] c13: ACP's threat model places PCI scope on the PSP — the Merchant receives a vault token, not raw card data, so `requires_pci_compliance: false` is encoded in the handler descriptor for tokenized cards. [s03,s06]
- [x] c14: ACP's design is REST/MCP-compatible — the 2026-04-17 release added an MCP-binding example (`examples.mcp.agentic_checkout.json`) so agents can call the same operations over either transport. [s02]

## Discussion
- [x] c15: There is conflicting attribution in third-party writeups — at least one search result claims ACP was created by "Stripe, OpenAI, and Meta", but the canonical README and the agenticcommerce.dev landing page list only OpenAI and Stripe as Founding Maintainers. [s01,s02,s11]
- [x] c16: ACP is iterating on a roughly six-week-to-three-month cadence with formal RFC and SEP (Specification Enhancement Proposal) processes maintained in the repo (`rfcs/`, `docs/sep-guidelines.md`). [s02]
