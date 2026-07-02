# Cloudflare's x402-Based Payment Tools

## Abstract

Cloudflare documents a family of x402-protocol payment tools for agents under its developer-docs tree at `/agents/tools/payments/x402/`. This report catalogues and analyzes those tools, cross-checking the documentation against public code repositories and independent reporting. Cloudflare's x402 toolkit is two-sided: seller-side monetization tools (the x402-proxy Worker template, the x402-hono middleware, and `withX402`/`paidTool` for MCP servers) and buyer-side payment tools (`withX402Client` in the Agents SDK, an OpenCode plugin, and a Claude Code hook). Around this tree sit the September 2025 announcement of the x402 Foundation co-founded with Coinbase, Cloudflare's own NET Dollar stablecoin, and the Monetization Gateway announced in July 2026 — positioning x402 as the payment layer of Cloudflare's agentic-economy strategy. Documented limits remain: the default facilitator's dependence on Coinbase, a security model that delegates private keys to agents, and early adoption metrics inflated by meme-coin activity.

## 1. Introduction

For AI agents to consume web resources autonomously, the human-centric payment gates of account creation, API keys, and subscription contracts become bottlenecks. x402 is an open protocol that revives the long-reserved HTTP `402 Payment Required` status code to make per-request stablecoin payments without accounts or session tokens[^s01][^s15]. On September 23, 2025, Cloudflare announced x402 support and its intent to establish the x402 Foundation together with Coinbase[^s06][^s09], and has since expanded x402 integration across its Agents SDK and developer documentation.

This report takes the Cloudflare documentation path specified by the user (`developers.cloudflare.com/agents/tools/payments/x402/`) as its primary source and describes in detail the four tool families documented beneath it — charging for HTTP content, charging for MCP tool calls, paying from the Agents SDK, and paying from coding-tool plugins[^s01]. Each tool was verified against actual source code on GitHub (cloudflare/agents, cloudflare/templates, x402-foundation/x402) and npm registry metadata[^s12][^s14][^s16].

## 2. Background: the x402 protocol

The x402 payment flow is a three-party structure. The client needs only a crypto wallet, with "no accounts, credentials, or session tokens to manage"[^s01]. The server (seller) answers a request for a protected resource with a 402 response carrying payment requirements; when the client retries with a signed payment payload, the server verifies it and delivers the resource[^s01][^s15]. Verification and on-chain settlement can be delegated to a third-party facilitator; the default facilitator referenced by Cloudflare's docs is Coinbase-operated `https://x402.org/facilitator`, which performs verification and blockchain submission without holding funds[^s01][^s19].

Cloudflare's docs describe two payment schemes. `exact` transfers a fixed amount — typically ERC-20 USDC on EVM chains — to the merchant address and supports EVM, Solana, Aptos, Stellar, Hedera, and Sui[^s01][^s15]. `upto` authorizes a maximum and settles the actual usage dynamically, and is EVM-only[^s01][^s15]. The standard monorepo additionally documents a `batch-settlement` scheme (EVM) that uses escrow and off-chain vouchers to redeem many small charges on-chain in batches[^s15]. Per Cloudflare's docs, supported networks include Base, Ethereum, Polygon, Optimism, Arbitrum, Avalanche, Solana, Aptos, Stellar, and Sui, with testing on the `base-sepolia` testnet using test USDC from the Circle faucet[^s01][^s03]. The standard itself is maintained in the x402-foundation organization's monorepo, which publishes the v1/v2 specifications and multi-language SDKs (@x402/core, @x402/evm, @x402/fetch, @x402/hono, @x402/mcp, and more)[^s15].

## 3. The x402 tools Cloudflare provides

Cloudflare's documentation tree consists of four sub-pages: charging for HTTP content, charging per MCP tool call, paying from the Agents SDK, and coding-tool plugins[^s01].

### 3.1 Charging for HTTP content — the x402-proxy template and x402-hono

The first seller-side tool is the **x402-proxy template**, "a Cloudflare Worker that sits in front of any HTTP backend"[^s02]. In `wrangler.jsonc` you declare the receiving wallet (`PAY_TO`), the network (`NETWORK`; base-sepolia for testing, base for production), and protected routes with prices (`PROTECTED_PATTERNS`, e.g. `/api/premium/*` at $0.10). Requests to protected routes receive a 402 with payment instructions; after payment the proxy verifies it and forwards the request to the origin[^s02]. The template exists in the cloudflare/templates repository under `x402-proxy-template`, implemented as a transparent proxy combining x402 payments with stateless cookie (JWT) authentication[^s14].

For finer control, developers insert the `paymentMiddleware` from the **x402-hono** package directly into a Hono-based Worker. The middleware takes three elements: a wallet address, per-route pricing configuration, and the facilitator endpoint[^s02]. x402-hono is an npm package published from the x402-foundation/x402 monorepo, and the same import appears in the template source (`src/auth.ts`)[^s14][^s16].

A notable advanced feature is **Bot Management integration**. A `bot_score_threshold` distinguishes human users from automated crawlers so that only bot traffic is charged[^s02], and the template ships a registry of bot identifiers for AI operators including Google, Microsoft, OpenAI, Anthropic, Perplexity, and Meta[^s14]. This connects directly to Cloudflare's pay-per-crawl strategy of charging AI crawlers[^s06].

### 3.2 Charging for MCP tool calls — withX402 and paidTool

For MCP (Model Context Protocol) server operators, the tool is the Agents SDK's `agents/x402` module. Wrapping a server with `withX402(new McpServer({...}), X402_CONFIG)` adds a `paidTool` method, which the docs describe as "a drop-in replacement for `tool` that adds x402 payment requirements"[^s03][^s13]. `X402Config` takes three fields — network (base/base-sepolia), recipient wallet, and facilitator URL — and `paidTool` takes a tool name, description, USD price, input schema, and handler to declare per-call pricing (e.g. $0.01 for a squaring tool)[^s03].

When a paid tool is called without payment, the server returns 402 with payment requirements; the client pays via x402, attaches proof, retries, and receives the result. Free `tool`s and paid `paidTool`s can be mixed on one server[^s03]. A complete working example lives at `examples/x402-mcp` in the cloudflare/agents repository[^s03][^s13]; the sibling `examples/x402` gates HTTP endpoints directly with the `@x402/*` libraries, without the MCP wrappers[^s13].

### 3.3 Paying from the Agents SDK — withX402Client

The buyer-side tool is `withX402Client`. Wrapping an MCP client inside a Durable Objects-based Agent class makes it handle payment automatically when it encounters a 402 response[^s04]. The wallet is built with viem's `privateKeyToAccount(this.env.MY_PRIVATE_KEY)`; the private key is managed via `.dev.vars` locally and `wrangler secret put` in production[^s04]. The implementation lives at `packages/agents/src/mcp/x402.ts` in cloudflare/agents, where the signature `confirmationCallback?: (payment: PaymentRequirements[]) => Promise<boolean>` is visible[^s12].

Payment approval follows a human-in-the-loop pattern. The first argument of `callTool` is the confirmation callback; the docs state "set to null for the agent to pay automatically." Developers implement `onPaymentRequired(paymentRequirements)` returning a boolean promise to define their approval workflow[^s04][^s12].

### 3.4 Coding-tool plugins — OpenCode and Claude Code

The last page covers plugins that let AI coding tools pay when they hit paid resources. The **OpenCode plugin** registers a custom tool at `.opencode/plugins/x402-payment.ts` using three packages — `@x402/fetch`, `@x402/evm`, and viem — with the tool description "Fetch a URL with x402 payment. Use when webfetch returns 402."[^s05] The **Claude Code integration** registers a `.claude/scripts/handle-x402.mjs` script under the PostToolUse hook (WebFetch matcher) in `.claude/settings.json`; it detects 402 responses, pays, retries, and injects the result as `additionalContext`[^s05].

Both approaches configure the wallet from the `X402_PRIVATE_KEY` environment variable. Notably, the pre-payment approval logic remains a placeholder comment in the documented code — `// Your human-in-the-loop confirmation flow...` — leaving the real implementation of spending controls to the developer[^s05].

## 4. Analysis

### 4.1 A two-sided toolkit

Arranged by role, Cloudflare's x402 tools form a two-sided structure: seller-side (monetization) via the x402-proxy template and x402-hono (HTTP resources) and `withX402`/`paidTool` (MCP tools); buyer-side (payment) via `withX402Client` (agents) and the OpenCode/Claude Code plugins (coding tools)[^s01][^s02][^s03][^s04][^s05]. A single vendor docs tree supplying SDKs for both the demand and supply sides of payments reads as a design to close the loop of machine-to-machine commerce on Cloudflare's own platform (Workers, Durable Objects, Bot Management) _(interpretive)_.

### 4.2 Position in the ecosystem: consumer and co-designer

Per npm metadata, x402-hono, @x402/fetch, and @x402/evm are maintained and published by Coinbase engineers (including x402 creator Erik Reppel), with the repository pointing at the x402-foundation/x402 monorepo[^s16] — Cloudflare is a consumer of the protocol-layer packages. At the same time, the GitHub API shows coinbase/x402 has become a fork of x402-foundation/x402[^s15][^s16], evidence that the foundation handover announced in September 2025 — Cloudflare CEO Matthew Prince: "The Internet's core protocols have always been driven by independent governance"[^s09] — was executed at the level of code governance. Cloudflare's own contribution is a proposed deferred payment scheme that decouples the cryptographic handshake from settlement to enable batch processing and traditional payment methods, announced for integration into the pay-per-crawl beta with aggregated daily billing[^s06].

### 4.3 Beyond the docs tree: Monetization Gateway and NET Dollar

The x402 docs tree is one piece of Cloudflare's payments strategy. On September 25, 2025, Cloudflare announced **NET Dollar**, a dollar-backed stablecoin for the agentic web, citing its contributions to the AP2 and x402 standards[^s11]. On July 1, 2026, it unveiled the **Monetization Gateway**, which lets customers "charge for any asset protected by Cloudflare: web pages, datasets, APIs, or MCP tools," with payments settling over x402; at launch it supports stablecoins only, including Open USD and USDC, and is in a waitlist stage[^s07]. Independent reporting notes that payment verification happens at the edge before requests reach origin servers, and places the launch against competitors such as Amazon Bedrock AgentCore (USDC via x402 on Base)[^s08]. Where pay-per-crawl addressed the single scenario of charging AI crawlers, the Monetization Gateway generalizes it to arbitrary resource monetization[^s07].

## 5. Discussion

### 5.1 x402 among competing standards

x402 is not an isolated standard. Google's Agent Payments Protocol (AP2) states that it supports traditional rails plus "stablecoins and crypto via its x402 extension," and Google published the A2A x402 extension with Coinbase, the Ethereum Foundation, and others as a separate repository[^s17][^s18]. x402 thus both competes with AP2 and is absorbed into it as its crypto payment rail. Cloudflare naming AP2 and x402 side by side in the NET Dollar announcement fits the same pattern[^s11].

### 5.2 Adoption signals and their limits

On-chain data shows rapid growth and froth at once. According to Chainalysis, x402 transactions on Base went from near-zero in mid-2025 to 100 million cumulative by Q1 2026 — but much of the Q4 2025 surge was driven by the meme coin PING, a pay-to-mint experiment charging 1 USDC (over 150,000 transactions in its first month), after which speculative activity cooled and growth moderated[^s10]. The same analysis offers real-usage signals — transactions of $1+ rising from 49% to 95% of volume, tester-to-payer conversion improving 4x — while cautioning that "whether this reflects sustainable adoption or simply a different cohort of users remains to be seen"[^s10].

A more critical view exists. Per an Artemis analysis reported by CoinDesk in March 2026, x402 processes only about $28,000 in daily volume across roughly 131,000 daily transactions (average payment $0.20), with about half of observed activity estimated to be artificial self-dealing — set against an ecosystem valuation of roughly $7 billion, leading to the verdict that "the x402 'agent payments' boom is still mostly a mirage"[^s21]. Even x402 creator Erik Reppel conceded that "as teams move from testing to production and start serving real users, these percentages should naturally decline," and the article notes that "the merchants that x402 is designed to serve are still rare"[^s21]. Seller-side tools like Cloudflare's Monetization Gateway can be read as aimed precisely at that supply shortage _(interpretive)_.

### 5.3 Risks: facilitator concentration and key delegation

Security-side limits are documented as well. Security firm Halborn flags the structural concentration of verification and settlement in facilitators, recommending multiple facilitators or direct on-chain verification, and prescribes hard spending limits, recipient allowlists, and human approval for high-value transactions for agents[^s19]. Academic work points the same way: "Five Attacks on x402" (arXiv) demonstrates that combining synchronous HTTP authorization with asynchronous blockchain settlement "introduces a cross-layer attack surface absent from conventional web and on-chain payments," validated as five reproducible attacks on Base Sepolia and live endpoints[^s20]. Cloudflare's own tool design — auto-payment when `withX402Client`'s confirmation callback is null, and the approval-flow placeholder in the coding plugins — shows that implementing these controls is left to the end developer[^s04][^s05].

## 6. Limitations

First, the Monetization Gateway was, at the time of research, a waitlist-stage product announced one day earlier; details such as supported tokens (including "Open USD") and the facilitator architecture rest on vendor statements and may change _(vendor-stated)_[^s07]. Whether the "payment verification and enforcement at the edge" implies Cloudflare operating its own facilitator is not clear from the documentation. Second, we could not confirm whether Cloudflare's proposed deferred scheme has been merged as a standard x402 scheme — the monorepo documents a similar batch-settlement scheme, but their identity was not verified[^s06][^s15]. Third, the quantitative adoption picture rests on Chainalysis (cumulative transactions) and the Artemis analysis reported by CoinDesk (daily volume, artificial-activity share); methodological differences make the two hard to compare directly, and some articles quantifying the decline from the 2025 peak (e.g. −92% daily transactions) could not be extracted and were not cited. Fourth, Cloudflare's docs reference x402-hono (v1.x) while the standard monorepo also carries the @x402/hono (v2.x) line, suggesting possible documentation lag across a version transition[^s15][^s16]. Fifth, the documentation path also surfaced as `agents/agentic-payments/x402/` during research, indicating the docs tree may be in the middle of a reorganization.
