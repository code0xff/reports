## Introduction

Google's **Universal Commerce Protocol (UCP)** is an open, Apache-2.0-licensed standard for *agentic commerce* — the use case where an AI agent, not a human browser, walks a merchant's site, fills a cart, and pays.[^s01][^s04] UCP spans the entire shopping lifecycle (discovery → checkout → order management → post-purchase) rather than focusing narrowly on the payment leg, and it is co-developed with five large retailers (Shopify, Etsy, Wayfair, Target, Walmart) and endorsed by 30+ payments, retail, and tech organisations.[^s01][^s08] It launched publicly at NRF in January 2026, with Google's own "Business Agent" feature going live on January 12, 2026.[^s08][^s10]

This report covers (1) where UCP sits relative to AP2, A2A, and MCP; (2) the capability/extension/manifest architecture; (3) the payment-handler model and how AP2 plugs in as the payment layer; (4) a concrete implementation path on the agent side (Google ADK + `ap2` + `ucp-sdk`) and the merchant side (Native vs Embedded Checkout); and (5) how UCP compares with adjacent protocols like OpenAI's ACP and Visa's Trusted Agent Protocol.

## Background — what UCP is replacing

Earlier "agentic commerce" attempts had to pick one slice of the journey — payment (AP2), agent-to-agent messaging (A2A), tool calling (MCP) — and leave the rest to bespoke integrations. UCP's pitch is that the shopping journey is itself a protocol surface, and that the same kinds of fragmentation that drove TCP/IP-style layered standards apply here too.[^s06] Google states explicitly that UCP is **interoperable** with the adjacent standards, not a replacement: "UCP is fully compatible with protocols such as AP2, A2A, and MCP".[^s01][^s03] In particular the FAQ frames AP2 as a *layer inside* UCP: "We use UCP to orchestrate the broader purchase lifecycle, while AP2 can be used as a specialized payment layer within UCP."[^s07]

## Architecture — capabilities, extensions, discovery, transport

UCP standardizes commerce as a small set of **capabilities**, each defined by a JSON schema. The initial release ships four:[^s04]

- **Checkout** — cart sessions, dynamic pricing, tax computation.
- **Identity Linking** — OAuth 2.0-based account linking so the agent can act under a verified user identity without credential sharing.
- **Order** — webhook-based updates for order lifecycle events (status, tracking, returns).
- **Payment Token Exchange** — protocols for PSPs and credential providers to exchange payment tokens securely.

Capabilities can be augmented through **extensions** — e.g., a discount extension adds promotional-code support to base checkout, a fulfillment extension adds shipping options.[^s02] Shopify Engineering describes the extension model as deliberately decentralized: "merchants define custom extensions using reverse-domain naming without central approval", and the merchant and agent each publish a capability profile; the merchant "computes their intersection at request time" so both sides only operate on a feature set they both support.[^s06]

**Discovery.** Businesses publish a manifest at the well-known path `/.well-known/ucp`. Each manifest entry lists service definitions (with version and spec URL), available capabilities (with schemas and extension relationships), and payment handler configurations.[^s02] Agents resolve this dynamically — no hardcoded integration per merchant.

**Transport bindings.** A single capability can be exposed over multiple transports: classic **REST APIs** (with OpenAPI schemas), **JSON-RPC**, the **Model Context Protocol (MCP)** for AI-agent tooling, and **Agent2Agent (A2A)** for direct agent-to-agent communication. Merchants pick the transport(s) matching their platform.[^s02][^s03] The Google merchant guide formalises the choice between **Native Checkout** (deep API integration that lets checkout complete *inside* AI Mode/Gemini) and **Embedded Checkout** (an iframe handoff for merchants needing bespoke flows).[^s03]

## Payments — instruments, handlers, and AP2 inside UCP

UCP's payment architecture separates two things that usually get conflated:[^s02]

- a **payment instrument** is what a consumer carries (a card, a wallet credential, a buy-now-pay-later account);
- a **payment handler** is the *provider integration* — the code path that knows how to take an instrument and complete a charge.

Merchants advertise which handlers they accept, the agent picks one, and each handler publishes its own schema for configuration and instrument data. Reference handlers in the spec include **Shop Pay**, **Google Pay**, and a **mock handler** for testing; PayPal support has been announced as on the roadmap.[^s02][^s09] Critically the FAQ notes that merchants do not need a Google Pay API integration on their own properties — they only need a PSP that can process Google Pay-formatted tokens.[^s07][^s10]

**AP2 inside UCP.** The Google codelab "Secure Agent Commerce with AP2 and UCP" walks an agent (built with the Google ADK) through booking movie tickets across multiple merchants, and shows the precise place where AP2 plugs in.[^s05] The flow uses a double-signature mandate model:[^s05]

1. **CartMandate** — when the agent calls UCP's `create_checkout`, the merchant returns a session embedding a **merchant-signed** mandate carrying the cart ID, total, merchant authorization signature ("price lock"), and a **10-minute expiration window**.
2. **PaymentMandate** — the agent creates a **user-signed** mandate that references the CartMandate ID, carries payment-method metadata, and acts as the user's spending consent.
3. **Verification** — at settlement the merchant verifies both signatures before fulfilling: the merchant signature proves the price is authentic and unchanged, the user signature proves consent. Neither side can move money unilaterally.

The codelab is explicit that the mandate cryptography it uses (SHA-256 hashes plus mock signatures) is for the tutorial only; production AP2 mandates are signed as **SD-JWT-VC verifiable credentials**, and a real wallet SDK replaces the chat-based confirmation step.[^s05]

## Implementation — building an agent against UCP + AP2

The codelab pins down a concrete agent stack. Required Python packages are `google-adk` (the agent framework), `google-genai` (Gemini access), `fastapi` + `uvicorn` (the merchant-side servers in the demo), and the protocol SDKs `ap2` and `ucp-sdk` (both from GitHub).[^s05] The agent itself exposes five tools, each wrapping one UCP or AP2 operation:[^s05]

| Tool | Protocol action | Purpose |
|------|------------------|---------|
| `discover_theaters` | UCP discovery | Fetch `/.well-known/ucp` and read each merchant's capability list |
| `search_movies` | UCP MCP call | JSON-RPC catalogue search across merchants |
| `get_movie_detail` | UCP MCP call | Pull detailed showtimes from a chosen merchant |
| `create_checkout` | UCP MCP call | Open a checkout session and receive a CartMandate |
| `complete_purchase` | AP2 flow | Create a PaymentMandate, sign it, submit both mandates |

The purchase step is wrapped with `require_confirmation=True`, which pauses the agent and surfaces an explicit user-confirmation UI before any mandate is signed and submitted.[^s05] In production the codelab notes that UCP discovery would resolve through a registry rather than hardcoded localhost URLs, merchants would host live MCP endpoints, mandate signatures would use SD-JWT-VC, and an official wallet SDK would mediate user consent.[^s05]

**Merchant-side integration.** A merchant has two integration paths.[^s03] **Native Checkout** lets checkout complete entirely within AI Mode or Gemini using direct UCP/AP2 calls — this maximises the agentic experience and is the path Google recommends for full agentic features. **Embedded Checkout** routes the user into a merchant-controlled iframe and is offered for merchants who need highly bespoke branding or complex flows. At launch eligibility requires three things: a Merchant Center account with up-to-date feeds, the `native_commerce: true` attribute set on eligible products, and a PSP that processes Google Pay tokens.[^s07][^s10] UCP-powered checkout is initially US-only.[^s10] In both paths the merchant remains the **Merchant of Record**, retaining customer data, business rules, and the direct storefront relationship.[^s01][^s03]

## Adoption and comparison

UCP's endorsement footprint is what tells you it is meant to be the industry-level layer rather than a Google-internal protocol: 30+ endorsers including **Stripe, PayPal, Mastercard, Visa, Klarna, Adyen** on the payments side, and major retailers like **Best Buy, Macy's, The Home Depot, Flipkart, Zalando, Kroger, Sephora, Ulta**.[^s01][^s08] The Business Agent rollout went live January 12, 2026 with Lowe's, Michael's, and Reebok among the first retailers using branded chat on Google Search.[^s08]

**Vs OpenAI ACP.** OpenAI's Agentic Commerce Protocol is "checkout-centric"; UCP covers more of the lifecycle (post-purchase, loyalty, returns) but launches inside Google's surfaces (Search AI Mode, Gemini App, Google Shopping).[^s09][^s10] ACP is positioned as interface-agnostic. The Checkout.com analysis frames the two as complementary moments — ACP captures demand inside AI assistants, UCP converts shoppers already engaging with Google's discovery surfaces — and explicitly recommends merchants "prepare to support both".[^s09]

**Vs Visa Trusted Agent Protocol.** TAP and UCP solve different problems. TAP cryptographically authenticates *the agent actor* in HTTP request headers so merchants know "is this a legitimate agent" at the network edge; UCP standardises *the merchant interface* the agent talks to once it has been recognised, and AP2 sits inside UCP to carry the consent and price mandates. They are orthogonal, and Visa's own Intelligent Commerce Connect explicitly enumerates UCP among the protocols it accepts.[^s09]

For implementers the practical takeaway is: build the *agent* on Google ADK + `ap2` + `ucp-sdk`, route discovery through `/.well-known/ucp`, surface a `require_confirmation` gate before any PaymentMandate is signed, and verify both mandates server-side before fulfillment.[^s05][^s07] Build the *merchant* on top of Merchant Center, advertise the handlers you accept (Google Pay token-capable PSP at minimum), and pick Native vs Embedded based on how much agentic surface you want.[^s03][^s10]

## Limitations

- AP2 is described here through Google's UCP codelab walkthrough; the AP2 spec repository itself was not directly read, so SD-JWT-VC profile details (claims set, key binding) are summarised second-hand.
- UCP launched in January 2026 and the launch is US-only; international rollout timing and the full list of GA-shipping payment handlers come from vendor copy, not from independent verification.
- The merchant-side capability intersection mechanism described in the Shopify Engineering write-up was not cross-checked against a wire-level example in the spec; it is single-sourced from a co-developer.
- The independent comparative pieces (Checkout.com, ALM Corp, MetaRouter) are industry analysis, not peer-reviewed work; no peer-reviewed sources exist yet for this very recent standard.

## Abstract

Google's Universal Commerce Protocol (UCP) is an Apache-2.0 open standard, launched at NRF in January 2026 and co-developed with Shopify, Etsy, Wayfair, Target and Walmart, that standardises the *whole* agentic-commerce lifecycle — discovery, checkout, order management, and post-purchase — rather than just the payment leg. Architecturally it ships four capabilities (Checkout, Identity Linking, Order, Payment Token Exchange), an extension mechanism with decentralized reverse-domain naming, a `/.well-known/ucp` discovery manifest, and multiple transport bindings (REST, JSON-RPC, MCP, A2A). On the payments side UCP separates *instruments* from *handlers* and treats Google's Agent Payments Protocol (AP2) as a specialized payment layer that plugs into UCP: AP2's double-signature flow has the merchant issue a signed CartMandate (price lock, 10-minute expiration) at checkout, the user sign a PaymentMandate that references it, and both signatures are verified before fulfillment, with production deployments using SD-JWT-VC verifiable credentials. A concrete agent build uses Google ADK plus the `ap2` and `ucp-sdk` packages, exposes five UCP/AP2 tools (`discover_theaters`, `search_movies`, `get_movie_detail`, `create_checkout`, `complete_purchase`), and wraps the purchase step with `require_confirmation=True` for explicit human consent. Merchants integrate via Native Checkout (deep API integration inside Google's AI surfaces) or Embedded Checkout (iframe handoff), require a `native_commerce: true` attribute in Merchant Center and a Google Pay-token-capable PSP at launch, and retain Merchant-of-Record status throughout. UCP is endorsed by 30+ organisations including Stripe, PayPal, Mastercard, Visa, Klarna, Adyen and a long list of major retailers, and is positioned as complementary to OpenAI's ACP (more checkout-centric, interface-agnostic) and to Visa's Trusted Agent Protocol (which sits one layer below as actor verification on the HTTP edge).
