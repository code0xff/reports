# The L402 Payment Flow and Its Ecosystem: Libraries, Lightning Usage, and Multi-Rail/Card Support

## Abstract

L402 (formerly LSAT) is an open protocol, published by Lightning Labs in 2020, for paying for and authenticating access to APIs and services over the Lightning Network.[^s03][^s04] It works as a four-step exchange that repurposes the HTTP 402 status code to combine a **macaroon** (a cryptographic bearer credential) with a **Lightning invoice**: the server challenges with `WWW-Authenticate: L402 macaroon=…, invoice=…`, and the client presents the **preimage** obtained by paying the invoice as `Authorization: L402 <macaroon>:<preimage>`.[^s01][^s02] Because the macaroon commits to the invoice's payment_hash, the server verifies statelessly and locally, with no backend node lookup.[^s06][^s07] Reference implementations include the server-side **Aperture** (reverse proxy) and **Boltwall**, and client-side **lsat-js, gol402, Fewsats/l402-python**.[^s05][^s06][^s13][^s14] In the Lightning ecosystem, Lightning Loop has used L402 in production via Aperture, and it is used by AI-agent tooling (LangChainBitcoin, MCP) and Fewsats applications.[^s07][^s06][^s10] Crucially, **L402 as a protocol is Bitcoin/Lightning-only** (blip-0026 calls it "Lightning-native"), and the chain-agnostic space (Ethereum/Solana) is filled by a separate protocol, **x402** (USDC on Base/Solana).[^s12][^s11][^s08] However, an **aggregator layer such as Fewsats** generalizes the L402 "offer" into a USD-denominated `payment_methods` array, supporting **credit card (Stripe checkout) and Lightning** together, plus a parallel **x402 (USDC)** flow — i.e., card and other-chain support happens at the ecosystem layer, not in the protocol.[^s09][^s10]

## 1. Introduction

L402 is a Lightning-native protocol that merges payment and authentication into a single token; it first appeared in 2020 as LSAT and was later renamed after the HTTP status code it activates.[^s03][^s11] This report answers the user's five questions: (1) the payment flow, (2) reference libraries, (3) real Lightning-ecosystem usage, (4) support for other protocols such as Ethereum/Solana, and (5) approaches to non-blockchain payments such as cards. Evidence draws on Lightning Labs' primary spec and blog, major implementation repositories, Fewsats documentation, and neutral landscape/comparison analyses.[^s01][^s04][^s06][^s10][^s11]

## 2. The payment flow

L402 operates as a four-step payment-and-authentication exchange.[^s01][^s02]

1. **Request** — a client (agent, CLI, or browser) sends a normal HTTP request to a protected endpoint.
2. **Challenge** — the server responds `402 Payment Required` with `WWW-Authenticate: L402 macaroon="<base64>", invoice="<bolt11>"`, presenting both a macaroon and a Lightning invoice.[^s02]
3. **Payment** — the client pays the invoice over Lightning and receives a **preimage** as proof.[^s01]
4. **Access** — the client re-sends the request as `Authorization: L402 <base64(macaroon)>:<hex(preimage)>`; the server verifies the credential and serves the resource.[^s02]

The key property is **stateless verification**. Because the macaroon commits to the invoice's payment_hash, the server (or reverse proxy) verifies the macaroon+preimage with only a root key and basic cryptography, without querying a backend Lightning node per request.[^s01][^s06] Lightning Labs puts it as: "L402 verification is a local computation. The cryptographic artifact is the proof. There is no intermediary to ask, and no one who can fail to confirm."[^s07] The macaroon is also a bearer token that can carry caveats, so once issued it can be reused on subsequent requests until its caveats expire.[^s11]

## 3. Reference libraries

The implementation ecosystem splits into server-side and client-side.[^s06]

- **Aperture** (Lightning Labs): the canonical L402 implementation — a **reverse proxy** that forwards gRPC (HTTP/2) and REST requests, issuing macaroons and Lightning invoices to new users and forwarding requests carrying a valid L402.[^s05][^s06]
- **Boltwall** (Tierion): LND/Node.js/TypeScript Lightning paywall and authentication middleware; a server can dictate how long authorization is valid based on a payment, or restrict access to the originating IP.[^s13][^s06]
- **Other server-side**: Go middleware for Gin/Echo (LSAT-middleware), a Rust `l402_middleware`.[^s06]
- **Client-side**: `lsat-js` (JS)[^s14], `l402-ts` (TS), `gol402` (Go), `Fewsats/l402-python` (Python).[^s06][^s09]
- **Agent tooling**: LangChainBitcoin (LangChain agents traversing/paying L402 APIs), an n8n node, MCP server skills.[^s06]

Interoperability is reported — an L402 issued by one implementation (e.g., Aperture) can have a caveat added and still validate against another (e.g., Boltwall).[^s06]

## 4. Real Lightning-ecosystem usage

L402 has run in Lightning Labs' own products since release. Notably, **Lightning Loop** (the Lightning↔on-chain swap service) uses L402 via Aperture.[^s07] In 2026 Lightning Labs positions L402 as "the internet-native payments protocol for agents," framing the core problem as: agents can read docs, write code, and call APIs, but "cannot, by and large, pay for things."[^s07] Application examples include Fewsats' **Sherlock** (domain purchases), **Amazon-MCP** (product search/purchase), and LangChainBitcoin.[^s06][^s10] A proposal, **blip-0026**, aims to standardize L402 as a Lightning protocol spec, describing it as "a standardized way of adding LN micropayments to any existing HTTP-REST or gRPC API," and noting multiple teams already implementing it.[^s12]

## 5. Approach to other protocols and non-Lightning payments

To answer the user's questions (Ethereum/Solana support, card payments) precisely, two **layers** must be separated.

**(a) The L402 standard — Lightning-only.** blip-0026, the spec, the 2026 positioning post, and the neutral landscape all consistently confirm L402 is Bitcoin/Lightning-only. blip-0026 references BOLT-11 invoices and preimage-based proof; it is "Lightning-native" and does not provide for alternative payment methods.[^s12][^s07] The neutral landscape analysis (April 2026) likewise calls L402 "single-rail by design."[^s11] So **L402 itself does not support Ethereum or Solana.**

**(b) The chain-agnostic space belongs to x402.** Paying with USDC on Base/Solana/EVM is filled not by L402 but by **x402**, published by Coinbase in 2025. Per comparison analysis, L402 "settles payments in Bitcoin over the Lightning Network using macaroons … that make verification stateless," while x402 "settles in USDC stablecoins on EVM chains, primarily Base and Solana," with Base completing in 1–3 seconds and Solana under a second.[^s08] L402 and x402 are thus separate, competing/complementary protocols.[^s08][^s11]

**(c) Cards and non-Lightning rails live at the aggregator layer.** Non-blockchain (card) payment is approached not by the protocol but by **aggregator products like Fewsats**, which generalize the L402 "offer." A Fewsats L402 offer is a generalized structure with `amount`, `currency` ('USD'), and a `payment_methods` array.[^s09] In Fewsats' **Sherlock**, an offer exposes `payment_methods: ['credit_card', 'lightning']`, where **credit card returns a Stripe checkout URL** and Lightning returns an invoice, priced in USD cents (e.g., 1105 = $11.05).[^s10] Fewsats further offers, in the same client, a parallel **x402 purchase flow (USDC on Base, Coinbase CDP)** as a separate mechanism.[^s10][^s09] In short, *support for cards, USDC, and other chains is not a feature of the L402 protocol but a property of payment aggregators that wrap L402 and run multiple rails in parallel.*

## 6. Discussion

**Protocol vs. aggregator.** The most common confusion around L402 is asking, at a single layer, "does L402 support cards/USDC?" Precisely: the L402 standard is Lightning-only (§5a), and multi-rail is achieved by (i) the separate x402 protocol and (ii) aggregators (Fewsats) that speak both.[^s11][^s10] In practice, APIs and MCP servers must handle **mixed traffic** because an arriving agent might speak x402, L402, or a card-identity protocol.[^s11]

**Structural difference.** The neutral landscape frames L402's distinguishing feature as: unlike x402/MPP, which authorize a single payment per request, L402 issues a bearer macaroon tied to a Lightning payment hash that can be reused on subsequent requests until its caveats expire.[^s11] This reusable-credential model suits agent workloads with many repeated calls.[^s08][^s11]

**Trade-offs.** L402 (BTC/Lightning) offers millisecond settlement and stateless verification but exposes users to Bitcoin's volatility; x402 (USDC) is price-stable but carries on-chain confirmation latency (Base 1–3s).[^s08] Choosing a rail is therefore a trade-off among volatility, settlement finality, latency, and ecosystem (Lightning nodes vs. EVM wallets).[^s08]

## 7. Limitations

- **Fast-moving.** Agent payments (L402/x402/MPP) are changing rapidly in 2025–2026; libraries, offer schemas, and integrations may shift within months. This report is pinned to early June 2026.[^s07][^s11]
- **Risk of conflating layers.** The claim "L402 supports cards/USDC" refers to Fewsats' generalized offer, not the protocol; the text separates these.[^s09][^s10][^s12]
- **Fewsats offer snapshot differences.** The l402-python example (`['onchain']`) and Sherlock (`['credit_card','lightning']`) differ, so whether there is one unified schema or product-specific variants is not certain — only the conclusion of parallel multi-rail support is confirmed by both sources.[^s09][^s10]
- **Primary-source issues.** The `introduction.md` in `lightninglabs/L402` returned 404 (path change), so the spec was confirmed via the docs site and repo landing; blip-0026 is still a draft/open PR.[^s02][^s04][^s12]
- **Source nature / maintenance.** Most evidence is primary repos, vendor docs, and technical blogs (no peer review), and the current maintenance activity of some libraries (Boltwall, lsat-js) was not verified.[^s06][^s13]
