# Claims

## Introduction
- [x] c01: Google's Universal Commerce Protocol (UCP) is an Apache-2.0-licensed open standard for agentic commerce that spans discovery, checkout, and post-purchase.
  - kind: factual
  - needs: ucp.dev + Google docs
- [x] c02: UCP launched publicly at NRF in January 2026, co-developed with Shopify, Etsy, Wayfair, Target, and Walmart.
  - kind: factual
  - needs: Google blog + independent

## Background
- [x] c03: UCP is explicitly interoperable with three adjacent standards: AP2 (payment mandates), A2A (agent-to-agent), and MCP (model-context tools).
  - kind: factual
  - needs: Google primary
- [x] c04: AP2 acts as a specialized payment layer within UCP rather than a competitor — UCP orchestrates the lifecycle, AP2 carries the consent and price mandates.
  - kind: technical
  - needs: Google FAQ + codelab

## Architecture
- [x] c05: UCP standardizes a small set of "capabilities" — Checkout, Identity Linking, Order, and Payment Token Exchange — each defined by a JSON schema.
  - kind: technical
  - needs: GitHub spec
- [x] c06: Businesses publish a discovery manifest at `/.well-known/ucp` listing capabilities, schemas, extensions, and payment handler configurations.
  - kind: technical
  - needs: Google developers blog
- [x] c07: UCP supports multiple transport bindings — REST APIs, JSON-RPC, MCP, and A2A — so a merchant can choose the one matching its platform.
  - kind: technical
  - needs: Google primary
- [x] c08: UCP uses decentralized extensibility: merchants define their own extensions using reverse-domain naming without central approval, and merchant/agent capability profiles are intersected at request time.
  - kind: technical
  - needs: Shopify engineering blog

## Payments
- [x] c09: UCP separates payment instruments (what consumers use) from payment handlers (the provider integrations), and merchants advertise which handlers they accept.
  - kind: technical
  - needs: Google developers blog
- [x] c10: AP2 secures transactions with a double-signature mandate flow: a merchant-signed CartMandate (price lock) and a user-signed PaymentMandate that references it.
  - kind: technical
  - needs: codelab + ucp.dev
- [x] c11: The CartMandate carries a cryptographic merchant authorization with an expiration window (10 minutes in the codelab example).
  - kind: technical
  - needs: codelab primary
- [x] c12: Production AP2 mandates are signed as SD-JWT-VC verifiable credentials; the codelab's SHA-256 hashes are deliberately a mock substitute.
  - kind: technical
  - needs: codelab primary
- [x] c13: At launch UCP-powered checkout uses Google Pay tokens processed through merchants' existing PSP infrastructure; merchants do not need a Google Pay API integration on their own properties.
  - kind: technical
  - needs: Google FAQ + ALM Corp

## Implementation
- [x] c14: Google publishes Python SDKs that pair with UCP/AP2: `google-adk` (agent framework), `google-genai` (Gemini), `ap2` (mandates), and `ucp-sdk` (UCP).
  - kind: technical
  - needs: codelab primary
- [x] c15: The reference agent uses five tools wrapping UCP/AP2 — `discover_theaters`, `search_movies`, `get_movie_detail`, `create_checkout`, `complete_purchase` — and `require_confirmation=True` gates the purchase step on explicit human approval.
  - kind: technical
  - needs: codelab primary
- [x] c16: Merchants can integrate via Native Checkout (direct API integration with AI Mode/Gemini) or Embedded Checkout (iframe handoff for bespoke flows).
  - kind: technical
  - needs: Google developers primary
- [x] c17: To be eligible at launch, merchants must add a `native_commerce: true` attribute in Merchant Center, keep their feed accurate, and have a PSP that processes Google Pay tokens.
  - kind: technical
  - needs: ALM Corp + Google FAQ

## Adoption & comparison
- [x] c18: UCP is endorsed by 30+ organizations including Stripe, PayPal, Mastercard, Visa, Klarna, Adyen, Best Buy, Macy's, Kroger, and Sephora.
  - kind: factual
  - needs: ucp.dev + Google blog
- [x] c19: UCP's commercial scope is broader than OpenAI's ACP, which is checkout-centric, but UCP launches first within Google's surfaces (Search AI Mode, Gemini App, Google Shopping) while ACP is interface-agnostic.
  - kind: interpretive
  - needs: independent comparative analysis
- [x] c20: UCP's scope differs from Visa's Trusted Agent Protocol: UCP standardizes the commerce lifecycle and orchestration, while TAP focuses on cryptographically authenticating the agent actor at the HTTP layer.
  - kind: interpretive
  - needs: independent commentary
