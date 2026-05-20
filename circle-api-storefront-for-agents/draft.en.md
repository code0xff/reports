# Reading Circle's "Turn Your API into a Storefront for Agents" — Agent Stack, Gateway, and @circle-fin/x402-batching

## Abstract

This report reads Circle's 18 May 2026 blog post "Turn Your API into a Storefront for Agents"[^s01] down to the code level and traces it through Circle Agent Stack[^s02][^s03], the `@circle-fin/x402-batching` npm package[^s07], and two reference GitHub repositories (`circlefin/arc-nanopayments`[^s08] and the community sample `BlockRunAI/circle-nanopayment-sample`[^s10]). The headline of the blog reduces to one line: "turn any HTTP API into a storefront that accepts USDC nanopayments." Drop `createGatewayMiddleware({ sellerAddress, facilitatorUrl, networks })` into an Express app and add `gateway.require("$0.001")` to a route, and the rest of the stack — HTTP 402 negotiation[^s14], off-chain batched settlement via Circle Gateway[^s05], and onchain settlement on Arc Testnet (chain ID 5042002)[^s01][^s04] — is wired underneath. The report unpacks that line along three axes: (a) the blog body, (b) the server and client code, (c) the supporting GitHub repositories.

## 1. Introduction — What the blog actually announced

The blog's claim is crisp: "Gateway uses x402 for the HTTP payment flow. The server responds with 402 Payment Required, the caller retries with a signed payment authorization"[^s01]. Circle Gateway therefore occupies the x402 facilitator slot, takes USDC at nanopayment scale, and settles batches onchain.

The value of that one line is the compression of "how do I monetise my API for agents?" — a problem that would historically have required a billing system, login, KYC, and a payment processor — into **a single Express middleware**. That maps onto Circle for Agents' own headline: "Agents get stuck behind paywalls and authentication, halting workflows. USDC unlocks doors for agents to work uninterrupted"[^s06].

The rest of this report unpacks what that one-liner means at three layers: (a) the specification, (b) the code, and (c) the surrounding infrastructure.

## 2. Background — Where Agent Stack and Gateway sit

### 2.1 The five Agent Stack components

Circle launched Agent Stack on 11 May 2026[^s16]. The five components are (1) **Agent Wallets** — hold and move USDC and other tokens within policy, (2) **Agent Marketplace** — agents discover and pay for services, (3) **Circle CLI** — one entry point for every action (`circle wallet`, `circle gateway`, `circle services`), (4) **Nanopayments (powered by Circle Gateway)** — x402-compatible USDC micropayments, (5) **Circle Skills** — best-practice modules that drop into AI coding assistants like Claude Code, Cursor, and Codex[^s02][^s03]. Circle describes the stack as "chain- and protocol-agnostic open infrastructure designed for the agentic economy," summarised in one sentence as "agents can hold and move USDC through Agent Wallets … discover and evaluate services through Agent Marketplace … execute repeatable financial actions through CLI … settle payments using USDC"[^s02].

### 2.2 Gateway / Nanopayments / x402

Gateway plays two roles at once.

- **x402 facilitator** — `/verify` + `/settle` REST endpoints for validating and settling payment payloads[^s14][^s15]. The interface matches Coinbase's facilitator but the asset model is **chain-abstracted USDC** — Circle's own phrasing is "Gateway already provides chain-abstracted USDC across supported blockchains"[^s05]; TronWeekly's coverage echoes it: "Gateway pairs with x402 to settle USDC micropayments at scale for autonomous AI agents"[^s17].
- **Nanopayments batched settlement** — Gateway does not push every payment onchain. "Gateway's new batching feature will enable deferred settlement by bundling transactions offchain and settling them onchain"[^s05]. The same line appears in [`circlefin/arc-nanopayments`](https://github.com/circlefin/arc-nanopayments) — "Circle Gateway batches many signed offchain authorizations into a single onchain settlement, enabling economically viable sub-cent payments"[^s08].

### 2.3 Arc Testnet and chain ID 5042002

The blog's example pins the middleware to Arc Testnet with `networks: ["eip155:5042002"]`[^s01]. Arc itself is Circle's own chain — "the Economic OS for the internet"[^s12] — positioned as a stablecoin-native settlement environment: "a stablecoin-native settlement environment, eliminating gas token volatility concerns"[^s04]. The facilitator endpoint is `https://gateway-api-testnet.circle.com`, and `https://faucet.circle.com/` issues testnet USDC[^s01].

## 3. Architecture — Five-step payment flow

The flow the blog defines[^s01]:

1. **Agent requests a paid resource** — plain HTTP `POST http://localhost:3000/research/company-brief`.
2. **Server responds 402** — `createGatewayMiddleware` automatically returns a `PAYMENT-REQUIRED` header with (scheme, network, token, payTo, amount).
3. **Agent retries with a signed payment authorization** — the client SDK (`@circle-fin/x402-batching/client`) checks the Gateway balance, signs an EIP-3009 `transferWithAuthorization` against the GatewayWallet contract, and resubmits with a `PAYMENT-SIGNATURE` header[^s10][^s18].
4. **Gateway verifies and records revenue in the Seller Gateway Balance** — Gateway acts as the facilitator, validating in-line so the response is unblocked, while the actual USDC transfer is deferred to the batch settlement[^s04][^s05]. Revenue accumulates in the Seller Wallet's Gateway Balance.
5. **Seller withdraws to a Payout Wallet** — one CLI line moves accumulated balance to the payout wallet: `circle gateway withdraw --amount ... --recipient $PAYOUT_WALLET_ADDRESS`[^s01].

That is the blog's identity. The merchant never operates a key-management infrastructure, an on-chain transaction queue, a node, or gas budgeting — **Circle Gateway sits in those positions as the facilitator**.

## 4. Code analysis — Reading `@circle-fin/x402-batching`

### 4.1 The npm package

The package the blog imports is `@circle-fin/x402-batching`[^s01]. The npm page describes it as a small package — v3.0.4, 0 dependencies, 8 dependents — and summarises it as "gas-free micropayments via Circle Gateway using the open x402 protocol, with payments signed off-chain and settled in batches by Circle Gateway"[^s07]. It exposes two entry points: `@circle-fin/x402-batching/server` (merchant) and `@circle-fin/x402-batching/client` (agent)[^s07][^s10]. Peer dependencies are `@x402/core` and `viem`, plus `@x402/evm` for EVM schemes[^s07].

### 4.2 Server side — `createGatewayMiddleware`

The blog's full Express example, quoted verbatim[^s01]:

```typescript
import express from "express";
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";
import { formatUnits } from "viem";

type PaidRequest = express.Request & {
  payment?: {
    payer: string;
    amount: string;
    network: string;
    transaction?: string;
  };
};

const app = express();
app.use(express.json());

const gateway = createGatewayMiddleware({
  sellerAddress: process.env.SELLER_WALLET_ADDRESS!,
  facilitatorUrl: "https://gateway-api-testnet.circle.com",
  networks: ["eip155:5042002"], // Arc Testnet
});

app.post(
  "/research/company-brief",
  gateway.require("$0.001"),
  (req: PaidRequest, res) => {
    const payment = req.payment;
    const paidAmount = payment?.amount
      ? `${formatUnits(BigInt(payment.amount), 6)} USDC`
      : "$0.001";

    res.json({
      company: "ExampleCo",
      brief: "ExampleCo is expanding into agent-accessible data products...",
      paid: {
        amount: paidAmount,
        payer: payment?.payer,
        network: payment?.network,
        transaction: payment?.transaction,
      },
    });
  },
);
```

Three things stand out:

- `createGatewayMiddleware` accepts **just three options** — `sellerAddress` / `facilitatorUrl` / `networks`[^s01].
- Per-route pricing is a **USD string** — `gateway.require("$0.001")`. The middleware handles 6-decimal USDC conversion; the handler converts back with `formatUnits(BigInt(amount), 6)`[^s01].
- Payment metadata is injected onto `req.payment` as `{ payer, amount, network, transaction? }`, so handlers can enrich responses with payment context[^s01].

In a Next.js App Router project the same middleware is exposed as a route wrapper — "`export const GET = withGateway(handler, "$0.001", "/api/premium/quote")`"[^s04]. The `circlefin/arc-nanopayments` repository shows this pattern end-to-end with Next.js + Supabase[^s08].

### 4.3 Client side — `GatewayClient` + `circle services pay`

The same package exposes a client SDK at the `/client` subpath. `BlockRunAI/circle-nanopayment-sample` documents it: "client (`src/client.ts`) leverages `GatewayClient` from `@circle-fin/x402-batching` to check Gateway balance, call the API with automatic 402 flow handling, sign EIP-3009 authorizations against the GatewayWallet contract, and receive paid responses"[^s10].

The blog compresses the same flow into a single CLI line, `circle services pay`[^s01]:

```bash
circle services pay \
  http://localhost:3000/research/company-brief \
  --address "$AGENT_WALLET_ADDRESS" \
  --chain ARC-TESTNET \
  -X POST \
  --max-amount 0.001 \
  --output json
```

That CLI (a) sends the initial request and receives 402, (b) checks the balance at `gateway-api-testnet.circle.com`, (c) signs an EIP-3009 authorization against the `GatewayWallet` contract, and (d) resubmits with the `PAYMENT-SIGNATURE` header — exactly what the SDK would do, in one shell line.

### 4.4 CLI — `circle wallet` / `circle gateway` / `circle services`

The blog shows the full setup flow as CLI[^s01]:

```bash
which circle || npm install -g @circle-fin/cli
circle skill install --tool codex
circle wallet status --type agent
circle wallet login <YOUR_EMAIL> --testnet

circle wallet list --type agent --chain ARC-TESTNET
circle wallet create --output json

circle wallet balance --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET
circle wallet fund --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET
circle gateway deposit --amount 10 --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET --method direct
circle gateway balance --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET

circle services pay <URL> --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET ...

circle gateway withdraw --amount 0.001 --address "$SELLER_WALLET_ADDRESS" \
  --chain ARC-TESTNET --recipient "$PAYOUT_WALLET_ADDRESS" --output json
```

The five-step flow maps 1:1 onto these commands. `circle wallet` covers key infrastructure, `circle gateway` covers settlement-balance management, `circle services` triggers actual payments, and `circle skill install` injects Circle Skills into AI coding assistants like Claude Code / Cursor / Codex[^s09].

### 4.5 Reference GitHub repositories

To see the flow in real code, two repositories are the canonical starting points.

- **`circlefin/arc-nanopayments`** — Circle's official reference implementation. Apache-2.0, TypeScript 96.6%. Structure: (a) Next.js App Router (`/app`) exposing paywalled routes, (b) Supabase for payment persistence, (c) LangChain + Deep Agents buyer agent in `agent.mts`, (d) a seller dashboard with real-time payment monitoring[^s08]. Route prices span `$0.0003 – $0.03`.
- **`BlockRunAI/circle-nanopayment-sample`** — Community sample. TypeScript Express + autonomous agent client. The server gates `GET /risk-profile` at `$0.01`; the client automates 402 → EIP-3009 signing → retry[^s10]. The npm scripts (`npm run setup` / `server` / `client` / `deposit` / `balance`) follow the five-step flow exactly[^s10].

Two more repositories support the codebase.

- **`circlefin/skills`** — Apache-2.0. The README states it provides "best-practice guidance for USDC payments, crosschain transfers, wallets, and smart contracts, plus Circle's MCP server for real-time SDK and documentation context"[^s09]. 13 core skills work across Claude Code, Cursor, Vercel Skills CLI, Codex, and Windsurf[^s09]. `circle skill install --tool codex` (in the blog) installs from this repo[^s01][^s09].
- **`circlefin/arc-node`** — Rust implementation of the Arc chain node itself[^s12]. To verify smart-account / settlement assumptions directly, this is the starting point.

On the standards side, the `coinbase/x402` repo (now mirrored as `x402-foundation/x402`) contains issue #447 "x402 x Circle Gateway," which tracks Circle's integration from the standards-body angle[^s11][^s13][^s14].

### 4.6 How Circle maps onto the x402 standard

- **x402 scheme** — `@circle-fin/x402-batching` belongs to the x402 `batch-settlement` camp as the name implies[^s07][^s14]. The EVM-binding details (channelId, ChannelConfig, cumulative voucher, claim/settle/refund) are surveyed in the sister report [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/).
- **Facilitator role** — Gateway performs both `/verify` (instant) and `/settle` (deferred, batched)[^s14][^s15]. This differs from Coinbase's facilitator default of immediate settlement.
- **EIP-3009 anchoring** — the client signs an EIP-3009 `transferWithAuthorization` — the same primitive used by x402's EVM `exact` scheme[^s18][^s14]. Gateway verifies the signature in line and batches the actual USDC movement against the GatewayWallet contract[^s10].

## 5. Comparison — Circle's position

### 5.1 vs. Coinbase facilitator

The x402 spec does not bake any single facilitator into the standard. Coinbase Developer Platform's facilitator processes ERC-20 payments on Base, Polygon, Arbitrum, World Chain, and Solana[^s14], whereas **Circle Gateway treats its own chain (Arc) as the first-class settlement environment and treats USDC as a chain-abstracted asset**[^s05]. The "$0.000001 nanopayments" claim is Circle's own positioning[^s04].

### 5.2 vs. MPP `session` intent

As the sister report [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/) shows, x402 batch-settlement is shaped for "one merchant × many users," while MPP `session` is shaped for "one user × one merchant." Circle aligns with the x402 batch-settlement camp[^s07][^s14], so it does not compete head-on with MPP `session` — it solves a different traffic shape _(interpretive)_.

### 5.3 Standards compatibility

Circle implements its own facilitator while keeping the x402 standard interface (402 response + `PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE` headers + `/verify` + `/settle`)[^s01][^s14]. The same client SDK should work against another facilitator (e.g. Coinbase-hosted) without rewriting the call site — Circle's strategy is "adopt the standard while differentiating on settlement infrastructure" _(interpretive)_.

## 6. Discussion — Merchant design points

### 6.1 The operational meaning of a `$0.000001` price unit

The blog opens at `gateway.require("$0.001")`, while `circlefin/arc-nanopayments` exposes routes from `$0.0003` to `$0.03`[^s08]. That price band is "one LLM call" or "one data lookup" priced as a payment unit, which forces the merchant to **rebuild an API as a per-call product, not a subscription**. Circle Nanopayments' own floor ($0.000001) defines the lower bound of that re-pricing[^s04].

### 6.2 Multi-chain (Arc / EVM / Solana)

The blog's code pins to Arc Testnet only, but Agent Stack itself is positioned as "chain- and protocol-agnostic open infrastructure"[^s02]. Gateway's chain-abstracted USDC model is designed to let one user receive USDC balances from many chains into the same Gateway Balance[^s05]. Future EVM / Solana expansion is signposted in Circle's own materials[^s05].

### 6.3 Agent Marketplace as a discovery layer

The blog points at Agent Marketplace as the discovery channel for paid APIs. The agents.circle.com landing page already lists Meeting Prep / Quant Analysis / Research / Domain Search / Social Analytics / Crypto Analysis as priced categories ($0.022–$0.301)[^s06]. The shape is consistent with the analyst framing of the marketplace as "the search engine of the agent era" _(interpretive)_[^s06]. As of this writing, listing is submitted through a Google Form — that fact is recorded in this report's uncertainties[^s01].

### 6.4 Five merchant-side decisions

The decision points this report extracts for a merchant adopting the blog's pattern:

1. **Price unit** — `$0.001` / `$0.0003` / `$0.03`? Lower prices improve batching efficiency but compress per-call margin.
2. **Chain choice** — stay on Arc Testnet, or leave room for other chains.
3. **Payout Wallet model** — withdraw to an EOA, an MPC wallet, or another SaaS?
4. **Marketplace listing** — strong merchant marketing makes it optional; weak marketing makes it close to mandatory.
5. **Dispute / refund policy** — the x402 standard does not specify a dispute procedure[^s14], so the merchant must define its own.

## 7. Limitations

- This report reflects the blog, docs, npm, and GitHub metadata as of 20 May 2026. Arc Mainnet launch, finalised chain IDs, and Gateway production facilitator are out of scope.
- The `@circle-fin/x402-batching` npm page was access-limited under scripted fetch; package metadata (v3.0.4, 0 deps, 8 dependents) comes from search snippets plus the `BlockRunAI` sample README[^s07][^s10].
- The `circlefin/arc-nanopayments` README could not be fetched as raw text, so code excerpts rely on the repo metadata summary[^s08]. For production use, the live repo should be consulted directly.
- x402 issue #447's discussion text was not directly cited; only its existence is confirmed[^s11].
- Quantitative identifiers (Arc Testnet chain ID `5042002`, the GatewayWallet contract address) are taken from the blog's code citation and were not cross-checked against an independent chain registry.
- Circle Wallets and Agent Stack are operated by Circle Technology Services, LLC (CTS) as a software provider, not as a regulated financial / advisory service, as the blog itself states[^s01]. This report preserves that disclaimer.
