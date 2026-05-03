# Tempo MPP and AI Agent Payments: Stripe Market Application

## Abstract

As of May 3, 2026, Tempo's Machine Payments Protocol (MPP) is not just a blockchain feature that lets AI agents pay. It is a payment-authentication protocol built around HTTP 402, allowing agents and services to exchange pricing requirements, payment authorization, settlement proof, and resource delivery in the same machine-to-machine flow.[^s01][^s02][^s04] Tempo is a payments-focused Layer 1 incubated by Stripe and Paradigm, with stablecoin-native gas, payment lanes, deterministic settlement, payment metadata, and smart-account features designed for payment workloads.[^s13][^s14][^s15][^s16] MPP connects that settlement substrate with Stripe's PaymentIntents, Shared Payment Tokens (SPTs), cards, Link, BNPL, Dashboard, fraud, refunds, and reporting stack.[^s05][^s10][^s11][^s12]

For Stripe's market strategy, the distinction is important. ACP, SPT, and Agentic Commerce Suite (ACS) address retail agentic commerce: checkout inside AI surfaces such as ChatGPT, Google AI Mode, and Gemini. MPP addresses machine-native commerce: agents paying for APIs, MCP tools, data, content, browser sessions, compute, and LLM token usage.[^s01][^s08][^s09][^s10][^s22][^s23][^s24] MPP therefore extends Stripe's AI-agent payments strategy from "AI helps users buy products" to "AI pays for internet services as it works."

## 1. Where Tempo and MPP Fit

Tempo defines itself as a Layer 1 built for payments at scale. Its public materials emphasize stablecoin payments, payment lanes, stablecoin fee payment, structured memos, deterministic settlement, and modern wallet signing.[^s13][^s14][^s15] Tempo's GitHub organization similarly describes the chain as designed for stablecoin payments, highlighting TempoTransaction, TIP-20, payment lanes, and EVM compatibility through Reth.[^s16]

MPP is the machine-to-machine payment standard co-authored by Tempo and Stripe. Stripe announced it on March 18, 2026 as an open, internet-native standard for agents to pay businesses and each other, and Fortune reported that MPP launched alongside Tempo's mainnet.[^s01][^s18] The MPP site summarizes the protocol as charging for API requests, tool calls, and content through HTTP 402.[^s02][^s03]

MPP is not best understood as a Tempo-only stablecoin protocol. The Payment HTTP Authentication draft is payment-method agnostic and separates the core scheme from method-specific specifications, including Stripe, Tempo, card, Solana, Stellar, and Lightning.[^s04][^s06][^s17][^s21] Visa's card-based MPP spec and SDK point in the same direction: MPP can coordinate card payments as well as stablecoin settlement.[^s17] Strategically, MPP is a multi-rail payment coordination layer with Tempo as a default stablecoin strength.

## 2. How MPP Works

MPP extends the HTTP authentication pattern into payments. A client or agent requests a resource. If payment is required, the server returns HTTP 402 and a payment challenge. The client creates a credential that satisfies the challenge and retries with `Authorization: Payment`. The server verifies payment or authorization, then returns the resource with a payment receipt.[^s01][^s04][^s11]

This is different from redirecting a human to a checkout page. Payment terms live in machine-readable positions such as HTTP headers, API responses, and JSON-RPC or MCP `_meta` fields.[^s04][^s08] The MCP transport draft explicitly maps payment challenges and receipts into `tools/call`, `resources/read`, and `prompts/get` operations.[^s08] That makes MPP a natural fit for paid MCP tools.

Stripe's implementation has two main payment paths. In the crypto path, Stripe creates a crypto PaymentIntent and deposit address, then detects and captures stablecoin payments on supported networks such as Tempo.[^s11][^s12] In the SPT path, the client creates a Shared Payment Token and the server creates a PaymentIntent with that token. That lets cards, Link, wallets, and other Stripe-supported methods enter the same MPP flow.[^s05][^s11][^s12]

Tempo supports one-time charge and session patterns. The Tempo charge draft defines amount, TIP-20 currency address, recipient, memo, and split fields.[^s06] The Tempo session draft uses on-chain escrow and off-chain vouchers for high-frequency streaming payment channels. Charge requires the full amount upfront; session lets a client pay incrementally as resources are consumed, which maps well to LLM token streaming.[^s07] Stripe Sessions 2026 introduced streaming payments that combine Metronome usage tracking with Tempo stablecoin micropayments, aiming to collect payment as tokens are used.[^s22]

## 3. The AI Agent Payment Problem

Useful agents need to call paid APIs, datasets, browser infrastructure, model endpoints, compute, and SaaS actions. The old flow requires account creation, billing portals, payment-method entry, API keys, subscriptions, and usage management. Stripe frames these as human-centric steps that agents struggle to complete without intervention.[^s01] Stripe's machine payments docs similarly describe agents paying programmatically for resources such as API calls or services.[^s10]

MPP's market is therefore closer to agent-to-service commerce than consumer checkout. Quicknode offers MPP as pay-per-request access to blockchain endpoints without accounts, API keys, or subscriptions.[^s19] Privy documents MPP with server wallets as the signing layer and `mppx` handling 402 flows automatically.[^s20] Stellar describes MPP as programmatic per-request payments over HTTP for AI agents and APIs, with both charge and session intents.[^s21]

The primitive that matters here is not a checkout button. It is budget, authorization, usage metering, receipt, refund, and reconciliation. The PaymentAuth draft includes challenge binding, replay protection, idempotency, concurrent request handling, and amount verification.[^s04] The Stripe charge draft adds SPT single-use constraints, amount verification, HTTPS requirements, and idempotency.[^s05] MPP is trying to standardize how an agent proves payment, avoids credential reuse, and handles failure and retry.

## 4. How Stripe Applies MPP to Its AI-Agent Payments Market

Stripe's prior AI-agent payment surface had two main parts. OpenAI Instant Checkout, ACP, ACS, and Stripe's agentic-commerce docs address retail commerce inside AI apps.[^s23][^s24][^s25] Link wallets for agents and SPTs form a credential layer that lets a user delegate limited payment authority without exposing raw payment details.[^s05][^s11][^s22]

MPP adds a third surface. It lets Stripe participate when an agent buys an API call, tool invocation, web access, LLM inference, compute, data, or digital content rather than a consumer product.[^s01][^s10][^s19][^s21] Stripe says MPP payments can appear in the Stripe API and Dashboard like other transactions, settling into existing balances while reusing payout schedules, tax calculation, fraud protection, reporting, accounting integrations, and refunds.[^s01][^s10][^s11] This is the core market application: keep the protocol machine-native, but bring merchant operations back into Stripe.

Tempo supplies the settlement substrate. Stripe lists Tempo, Solana, and Stripe card networks among machine-payment availability paths, but the Tempo path is especially suited to low-dollar-value charges such as 0.01 USDC and on-chain settlement.[^s10][^s11] Tempo's payment lanes, stablecoin gas, memos, deterministic settlement, and smart-account features are designed for sub-cent or high-frequency payment use cases that do not fit conventional card economics.[^s13][^s15] Visa's MPP card extension shows the other side of Stripe's strategy: keep stablecoins for machine-speed settlement, but let MPP expand into incumbent card networks too.[^s17]

Stripe Sessions 2026 shows the intended direction. Stripe framed AI products as consuming tokens too quickly and in too-small units for traditional payment systems to collect in real time. It then introduced streaming payments that combine Metronome usage tracking with stablecoin micropayments on Tempo.[^s22] This indicates that Stripe sees agent payments as an AI-native billing primitive, not just another checkout channel.

## 5. Competitive Landscape: MPP, x402, AP2, and Network Tokens

The closest comparison is x402. Coinbase and the x402 Foundation describe x402 as reviving HTTP 402 for internet-native payments, with API services, AI agents, paywalls, and microservices as core use cases.[^s26][^s27] x402's strengths are permissionless on-chain settlement, facilitator infrastructure, and low developer friction.[^s26][^s27] MPP is trying to take a broader route through Payment Auth, multiple payment method specifications, MCP transport, discovery, Stripe SPT, and Tempo sessions.[^s03][^s04][^s07][^s08][^s09]

Google AP2 solves a different layer. AP2 focuses on proving authorization, authenticity, and accountability when an agent transacts on behalf of a user through cryptographic mandates.[^s28] That is strong for retail commerce intent. MPP is stronger for machine-to-service execution, where a paid resource responds with a challenge and a credential/receipt cycle.[^s04][^s08] The two could become complementary: AP2 proves what a user authorized, while MPP or x402 executes paid access over HTTP.

Visa and Mastercard are extending agent payments through existing network trust and tokenization. Visa's MPP card spec brings tokenized card credentials into MPP-compatible workflows, while Mastercard Agent Pay emphasizes agentic tokens built on tokenization capabilities.[^s17][^s29] PayPal's OpenAI partnership similarly brings wallet and merchant reach into ChatGPT checkout.[^s30] The market is less likely to produce a single protocol winner than a set of interoperable rails and risk models.

## 6. Risks and Open Questions

The first risk is lack of market-performance data. Fortune covered the MPP and Tempo mainnet launch, but public evidence on transaction volume, payment failures, fraud and disputes, and merchant ROI remains limited.[^s18] Quicknode labels its MPP access alpha.[^s19] The IMF frames agentic payments as early experimentation and avoids definitive conclusions.[^s33] The evidence supports "important early infrastructure," not "settled standard."

The second risk is authorization and security. A 2026 SoK on autonomous LLM agents in commerce lists MPP among protocols that enable agentic commerce while creating new attack surfaces.[^s31] A runtime-verification paper on agent payment protocols highlights replay and context-binding failures as practical risks.[^s32] MPP drafts address these concerns through challenge binding, replay protection, TLS, credential confidentiality, and confused-deputy guidance, but real-world agent runtimes remain difficult to constrain.[^s04][^s08]

The third risk is wallet and custody friction. Stablecoin settlement is attractive for low-cost, high-frequency payments, but agents still need wallets, signing keys, funding, policies, and spending limits. Privy-style server wallets reduce the friction but do not remove the risk of spending loops or mistaken automated calls.[^s20][^s31] The SPT path lets agents use cards and Link, but if approval prompts become too frequent, the agent-native experience weakens.[^s05][^s11]

The fourth risk is neutrality. MPP is open and method-extensible, but it was co-designed by Tempo and Stripe and has a Stripe PaymentIntents adoption path.[^s01][^s04][^s05] That is a strength for Stripe merchants, but non-Stripe processors and non-Tempo chains may question neutrality. Stellar support, Visa's card extension, and competition from x402 will test whether MPP becomes a broad coordination layer or a Stripe/Tempo distribution advantage.[^s17][^s21][^s26][^s27]

## 7. Conclusion

Tempo MPP is a key extension of Stripe's AI-agent payments strategy from retail checkout to machine-native commerce. ACP, ACS, and SPT help AI apps complete purchases for users. MPP helps agents pay for internet services while they work.[^s01][^s10][^s23][^s24] That distinction changes the center of gravity from catalog, cart, fulfillment, and consumer approval to API access, tool invocation, usage metering, streaming settlement, receipts, and reconciliation.[^s08][^s09][^s19][^s22]

Stripe appears to be applying MPP in three layers. First, standardize the wire protocol through HTTP 402, Payment Auth, and MCP transport.[^s04][^s08] Second, use Tempo as a stablecoin settlement rail for sub-cent, high-frequency, streaming AI usage.[^s07][^s13][^s22] Third, wrap machine-native payments in PaymentIntents, SPT, Link, card networks, Dashboard, fraud, tax, refunds, and reporting.[^s05][^s10][^s11][^s17] If it works, MPP lets Stripe move beyond being an AI checkout provider and become an operating layer for paid access and settlement in the agent economy.
