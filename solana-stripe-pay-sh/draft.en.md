# Solana Foundation and pay.sh: An In-Depth Analysis Based on the Official Website and GitHub Code

## Abstract

pay.sh is an AI agent API payment gateway launched in May 2026 by the Solana Foundation in collaboration with **Google Cloud** — not Stripe. It enables AI agents to discover, access, and pay for APIs on a per-request basis using USDC stablecoins on Solana, requiring only a Solana wallet with no account creation or API keys. Stripe's connection to pay.sh is indirect: Stripe co-authored the Machine Payments Protocol (MPP) with Tempo, and pay.sh supports MPP as one of its two open payment standards. This report provides a detailed analysis of pay.sh's technical architecture, core protocols (x402 and MPP), ecosystem, and limitations, drawing exclusively from the official website (pay.sh), the Solana Foundation blog, and publicly available GitHub repositories.

## Introduction

The rise of autonomous AI agents capable of independently consuming internet services has exposed a critical infrastructure gap: existing API payment models — monthly subscriptions, API key provisioning, billing account setup — are designed for human-in-the-loop workflows and cannot accommodate the immediate, sub-cent, pay-per-use needs of AI agents[^s15]. In response, 2025–2026 saw the emergence of competing machine-native payment standards built on HTTP 402: Coinbase's x402, Tempo and Stripe's MPP, and others[^s05][^s09].

Against this backdrop, the Solana Foundation and Google Cloud jointly launched **pay.sh** on May 5, 2026[^s10][^s11]. Solana Foundation CPO Vibhu Norby described it as: "In collaboration with Google Cloud, we're introducing Pay.sh, a gateway service designed to bridge the gap between autonomous agents and enterprise infrastructure."[^s11]

An important factual clarification is warranted. Some reports have characterized Stripe as a co-developer of pay.sh. This is inaccurate. Stripe co-developed the Machine Payments Protocol (MPP) with Tempo[^s05][^s13], and pay.sh adopted MPP as a supported standard — creating an **indirect** connection to Stripe's ecosystem[^s03][^s09]. The direct co-development partner for pay.sh is Google Cloud[^s01].

## Background: The Rise of AI Agent Payment Infrastructure

### HTTP 402: From Forgotten Code to Payment Standard

HTTP 402 "Payment Required" was reserved in the early 1990s HTTP specification with the original intention of supporting digital cash or micropayment schemes. It went unused for over 30 years because no widely-adopted payment infrastructure emerged to support it. Various companies used it non-standardly for rate-limiting or billing notifications, but no cohesive standard materialized[^s17].

By 2025–2026, AI agent economics gave the dormant status code new relevance. Coinbase launched x402, and Tempo with Stripe announced MPP, both formalizing HTTP 402 as the foundation for machine-to-machine payments[^s09][^s13].

### Limitations of Existing API Payment Models

Existing API payment infrastructure presumes human-driven onboarding: contract review, API key issuance, billing account configuration. For AI agents that must discover and access thousands of APIs instantly, paying fractions of a cent per call, this model is fundamentally mismatched[^s15]. pay.sh, x402, and MPP all share the design principle that "payment is the credential" — a single HTTP exchange replaces the entire authentication and billing pipeline[^s01].

### The 2026 Protocol Landscape

Three major directions coexist in the 2026 AI agent payment market[^s09][^s12][^s13]:

- **x402** (Coinbase → Linux Foundation): Open standard using HTTP 402 for stablecoin payments. Transferred to Linux Foundation in April 2026.
- **MPP** (Tempo + Stripe): Open standard proposed to the IETF as an HTTP Authentication Scheme. Supports stablecoins and traditional fiat.
- **pay.sh** (Solana Foundation + Google Cloud): An API gateway supporting both x402 and MPP, built on Google Cloud infrastructure.

## pay.sh: Overview, Launch, and Business Model

### Launch and Partnership

pay.sh launched publicly on May 5, 2026 as a joint announcement by the Solana Foundation and Google Cloud[^s10]. The platform allows AI agents to connect a Solana wallet to AI interfaces (Gemini, Claude Code, Codex, and others), fund the wallet via credit card or stablecoin in approximately 60 seconds, and then immediately browse a marketplace of APIs with live pricing and instant payment settlement[^s01][^s07].

### Business Model: Pay-per-Request

pay.sh's core value proposition is eliminating subscriptions and minimum spend requirements in favor of per-request micropayments[^s10]. Pricing ranges from free to $10.00 per API call, with many endpoints priced at $0.001 or below[^s02] _(unverified — single source)_. As of launch, over 70 API providers were registered (72+ per the official site[^s02]; 75+ per launch-day reporting[^s11] — the count is growing via open GitHub PRs).

Payments use USDC on the Solana network. Solana's approximately 400-millisecond finality and ~$0.00025 transaction fee make it well-suited for high-frequency micropayments[^s14] _(vendor-stated)_.

## Technical Architecture and GitHub Code Analysis

### Overall Architecture: GCP-Backed API Proxy

pay.sh operates as an API proxy on Google Cloud Platform. It receives agent requests, applies access controls, rate limits, and verification, then forwards to backend Google Cloud services or community APIs. The Solana wallet serves as both identity layer and payment mechanism — no Google account is required[^s01][^s15].

```
AI Agent → pay CLI/MCP → [HTTP 402 detected] → wallet signing request
→ payment proof (x402 or MPP) → GCP API Proxy → actual API service
```

### solana-foundation/pay: The CLI Tool

The GitHub repository `solana-foundation/pay` is the core client implementation[^s03]. Key technical characteristics:

- **Primary languages**: Rust (83.9%), TypeScript (13.5%) _(unverified — single source)_[^s03]
- **Installation**: Homebrew (`brew install pay`), NPM (`npm install -g @solana/pay`), or source build (`just install pay`)
- **Core behavior**: Wraps existing CLI tools (curl, claude, codex) to transparently intercept HTTP 402 responses, prepare stablecoin transactions, request biometric wallet authorization, and retry with payment proof _(unverified — single source)_[^s03]
- **Built-in MCP server**: Enables AI assistants (Claude Code, Codex) to request paid API calls through the local wallet approval flow _(unverified — single source)_[^s03]
- **Biometric security**: Platform-native authentication (Touch ID on macOS, Windows Hello on Windows, GNOME Keyring on Linux) prevents AI agents from accessing private keys directly _(unverified — single source)_[^s03]
- **Payment Debugger**: A locally-running web UI that visualizes 402 challenge-response cycles as sequence diagrams, showing protocol headers and flow details — all data stays on-device[^s03]

### solana-foundation/mpp-sdk: Multi-Language SDK

`solana-foundation/mpp-sdk` is a standalone SDK implementing Solana as a payment method for MPP[^s04]. It supports multiple languages _(unverified — single source)_:

| Language | Package | Codebase share |
|----------|---------|----------------|
| TypeScript | `@solana/mpp` | 26.0% |
| Rust | `solana-mpp` | 39.5% |
| Go | — | 14.8% |
| Python | — | 11.8% |
| Lua | — | 6.8% |

Server-side capabilities include SPL token and Token-2022 acceptance, transaction fee sponsorship, split payments across multiple recipients, replay attack protection, and session-based payments[^s04].

## Core Protocols: x402 and MPP

### x402: From Coinbase to the Linux Foundation

x402 is an open HTTP payment standard developed by Coinbase that revives HTTP 402 for stablecoin payments. When a server requires payment it issues an x402 response; the client attaches a signed stablecoin payload in the `X-PAYMENT` header and retries — the entire flow is atomic[^s09].

On April 2, 2026, Coinbase transferred x402 to the Linux Foundation, establishing the **x402 Foundation** as a neutral governing body[^s08]. Founding members include Adyen, Amazon Web Services, American Express, Ampersend.ai, Base, Circle, Cloudflare, Coinbase, Fiserv, Google, KakaoPay, Mastercard, Merit Systems, Microsoft, Polygon Labs, PPRO, Shopify, Sierra, **Solana Foundation**, **Stripe**, thirdweb, and Visa[^s08]. The Solana Foundation was noted as processing approximately 65% of all x402 transaction volume at the time of the announcement[^s14] _(vendor-stated)_.

As of May 2026, x402 had processed approximately 165 million transactions across 480,000+ transacting agents[^s09] _(vendor-stated)_.

### MPP: The Stripe and Tempo Open Standard

MPP (Machine Payments Protocol) is an open standard co-authored by Tempo and Stripe, publicly announced March 18, 2026[^s05][^s13]. On March 30, 2026, engineers from Tempo Labs and Stripe submitted `draft-httpauth-payment-00` to the IETF as a Standards Track Internet-Draft[^s16] _(early signal)_.

Tempo is a blockchain startup incubated by Stripe and venture firm Paradigm that raised $500 million at a $5 billion valuation in 2025[^s13]. Stripe's co-authorship of MPP reflects its strategy to bridge traditional card payment infrastructure with machine-native agent payments.

MPP's key technical differentiator is payment method flexibility[^s07][^s06]:

- **Stablecoins**: Tempo payment channels (TIP-20 token transfers)
- **Fiat**: Stripe cards (Visa, Mastercard, etc.) via Shared Payment Tokens
- **Bitcoin**: Lightning Network BOLT11 invoices
- **Solana**: SOL and SPL tokens
- **Stellar, Monad, RedotPay**: Network-native assets

MPP supports multi-method challenges where clients select their preferred payment method in a single HTTP negotiation, and session-based billing to minimize per-request overhead[^s07].

### pay.sh Protocol Integration

pay.sh supports both x402 and MPP, bridging the Coinbase/Linux Foundation and Stripe/Tempo ecosystems[^s03][^s09][^s15]. While x402 and MPP share a common philosophy (HTTP 402-based, no accounts required), they are maintained by separate organizations with distinct governance models. pay.sh's dual-protocol support can be read as a hedge against ecosystem fragmentation _(interpretive)_.

## Ecosystem and Partnerships

### Google Cloud Official APIs

The foundational partnership is with Google Cloud. Through pay.sh's GCP proxy, the following official services are available on a stablecoin pay-per-request basis[^s01][^s11]:

- **Gemini** (generative AI inference)
- **BigQuery** (data analytics)
- **BigTable** (NoSQL database)
- **Cloud Run** (serverless containers)
- **Vertex AI / Model Garden** (ML platform)

### Community API Ecosystem

Beyond Google Cloud, over 70 community API providers participate[^s02]. Key services by category:

- **E-commerce**: Rye, BigCommerce, Purch
- **Data & Intelligence**: Exa, Dune Analytics, Nansen, ATXP
- **Communications**: AgentMail, StablePhone, StableEmail
- **Solana Infrastructure**: Helius, Alchemy, Quicknode, Allium, The Graph
- **AI/ML**: fal.ai, dTelecom, Alibaba Cloud OCR

API providers can join the registry by submitting a pull request to the open-source GitHub repository[^s02].

### Supported AI Clients and Launch Partners

pay.sh officially supports the following AI clients[^s02][^s03]: Claude Code (Anthropic), Gemini (Google), Codex (OpenAI), Openclaw, and Hermes. Launch partners included PayAI, Crossmint, Merit Systems, Corbits, Moonpay, Sponge Wallet, ATXP, and Tektonic Company[^s01].

### Solana's Position in the x402 Foundation

As both an x402 Foundation founding member and the network processing approximately 65% of x402 transaction volume, the Solana Foundation occupies a structurally central position in the emerging AI agent payment ecosystem[^s08][^s14] _(vendor-stated)_. Notably, Stripe is also an x402 Foundation founding member — meaning Stripe participates in both the x402 and MPP governance structures simultaneously[^s08].

## Limitations and Discussion

pay.sh is at an early stage and several structural limitations warrant careful consideration.

**Google Cloud centralization**: As a GCP-backed proxy, pay.sh is directly exposed to Google Cloud availability and policy decisions[^s15]. This creates a structural tension between the decentralization narrative of blockchain payments and the centralized cloud dependency of the actual service.

**Protocol fragmentation risk**: x402 and MPP are technically similar but organizationally distinct standards governed by different foundations. If both ecosystems grow independently, developers may face fragmented tooling and support costs[^s13]. pay.sh's dual-protocol support mitigates but does not eliminate this risk[^s05].

**MPP's early standardization stage**: MPP was submitted as an IETF Internet-Draft on March 30, 2026. IETF drafts expire after six months without renewal, and full standardization typically requires years. MPP's long-term governance and adoption trajectory remain uncertain _(early signal)_[^s16].

**Stripe's geographic restrictions**: MPP payments via Stripe (fiat) are currently limited to US businesses, excluding New York and Texas[^s06]. For a globally-deployed AI agent ecosystem, this represents a significant practical constraint on the Stripe-MPP payment path.

**No independent security audit**: As of May 8, 2026, no public independent security audit of `solana-foundation/pay` or `solana-foundation/mpp-sdk` is available. Security properties (biometric key isolation, replay protection, payment-as-credential) are documented in README files but have not been externally validated[^s03].

**Undisclosed revenue model**: The Solana Foundation has not publicly disclosed pay.sh's revenue model (whether a protocol fee is charged, and if so, how it is structured).
