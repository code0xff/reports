# x402 Bazaar — The x402 Service Discovery Layer for Agents

## Abstract

If the x402 protocol solved "how does an agent pay," the **x402 Bazaar** solves the question left on top of it: "how does an agent know which paid services even exist?"[^s01] Coinbase launched it on 10 September 2025[^s03]. It auto-indexes x402 endpoints that the CDP Facilitator has *settled*, cataloguing them with semantic descriptions, payment metadata, and on-chain trust signals[^s01]. The defining design choice is that **there is no registration step** — "There is no separate registration step. The CDP Facilitator catalogs your service the first time it settles a payment for that endpoint"[^s01]. This report analyses, from primary docs and example code, (1) the settlement-triggered indexing model and resource schema, (2) the four `/v2/x402/discovery` endpoints — resources, search, merchant, mcp, and (3) the `declareDiscoveryExtension` of `@x402/extensions/bazaar` plus the `discoverable:true` / `wrapFetchWithPayment` code in `x402-express`.

## 1. Introduction — The discovery problem in x402

x402 standardised "a client pays for a gated resource in one round trip" on top of HTTP 402[^s09]. But the payment flow assumes the *client already knows which endpoint to call*. In autonomous-agent scenarios that assumption breaks — you must first know "where is the paid API that sells the data I need" before there is anything to pay for. The Bazaar fills exactly that slot as x402's discovery layer — "a discovery system enabling developers and AI agents to browse and search for x402-enabled services that are cataloged through the CDP Facilitator"[^s01]. Press coverage framed it as the "AI agents' marketplace"[^s10].

## 2. Background — Where the Bazaar sits

### 2.1 Why the facilitator is the indexer

The x402 facilitator brokers payment verification (`/verify`) and settlement (`/settle`) so sellers don't have to run blockchain infrastructure — "The facilitator handles payment verification and settlement so that sellers don't need to maintain their own blockchain infrastructure"[^s08]. Because it sees all settlement traffic, it is also the party best positioned to know "which endpoints are actually receiving payments." The Bazaar turns that vantage point into an index[^s01]. Coinbase's hosted facilitator states it charges no facilitator fee for USDC on Base[^s03].

### 2.2 The x402 standard is facilitator-agnostic

The x402 GitBook likewise defines the Bazaar as "the discovery layer of x402, letting clients enumerate facilitator-cataloged resources"[^s07]. That said, the Bazaar itself is a CDP-Facilitator-bound implementation, while the x402 standard is facilitator-agnostic[^s09]. So the Bazaar is best read as "a discovery service Coinbase built on top of x402" — a layer above the standard, not part of it _(interpretive)_[^s01][^s09].

## 3. Architecture — How the Bazaar works

### 3.1 Settlement-triggered auto-indexing

The Bazaar's most important design decision is that **registration derives from settlement**[^s01]. Four conditions are needed for a service to be indexed[^s01]:

1. Register `bazaarResourceServerExtension`.
2. Attach `declareDiscoveryExtension()` on the route.
3. Include `paymentPayload.resource` in the settlement payload.
4. Complete at least one successful settlement.

So only "an endpoint that has actually been paid once" lands in the catalogue — an automatic, weak sybil resistance ("a settlement is proof of existence"). Resources with no activity in 30 days are excluded, but newly indexed resources with no calls yet are exempt from that filter[^s01].

### 3.2 Resource schema

Each indexed resource carries[^s01]:

| Field | Meaning |
|---|---|
| `resource` | the monetized endpoint URL |
| `type` | protocol (currently `"http"`) |
| `x402Version` | supported protocol version |
| `accepts` | array of payment requirements (scheme/network/amount/asset/payTo) |
| `lastUpdated` | ISO 8601 timestamp |
| `metadata` | optional description + Bazaar input/output schemas and examples |

### 3.3 Quality ranking

Search blends two signals[^s01]:

- **Retrieval relevance** — hybrid full-text + semantic search.
- **Service quality** — (a) distinct buyers in 30 days (buyer reach), (b) transaction volume, (c) recency, (d) metadata completeness.

Quality metrics are recomputed on a 6-hour schedule, so new payments do not immediately move rankings[^s01].

## 4. Discovery API & MCP

The Bazaar exposes four endpoints under the CDP platform API[^s01].

### 4.1 Catalog — `GET /platform/v2/x402/discovery/resources`

Returns an `items` array newest-first with `limit` (default 100, max 1000) and `offset` pagination[^s01]. For inventory-style walking of the full catalogue.

### 4.2 Semantic search — `GET /platform/v2/x402/discovery/search`

Takes `query` (max 400 chars) plus `network`/`asset`/`scheme`/`payTo`/`maxUsdPrice`/`extensions` filters and returns up to 20 results — "optimized for query, filters, and quality ranking, not for walking the full catalog"[^s01].

### 4.3 Merchant lookup — `GET /platform/v2/x402/discovery/merchant?payTo=<address>`

Finds resources payable to a specific wallet address[^s01].

### 4.4 MCP server — `GET /platform/v2/x402/discovery/mcp`

The Bazaar also exposes a Model Context Protocol server[^s01] with two tools:

- **`search_resources`** — semantic search returning matching descriptions, pricing, and schemas in relevance order.
- **`proxy_tool_call`** — calls a discovered resource by `toolName` and `arguments`.

The client-side `@x402/mcp` wraps a standard MCP client with automatic payment handling — "the @x402/mcp client automatically creates a payment payload and retries if payment is required"[^s01]. The agent never touches wallets or signing; it just "searches → calls."

## 5. Code analysis — server and client

### 5.1 Server side — `declareDiscoveryExtension`

The discovery extension ships as `@x402/extensions/bazaar` — "Facilitators catalog paid HTTP or MCP tools from server-declared input/output hints"[^s06]. The x402-foundation repo's `bazaar.ts` attaches `declareDiscoveryExtension` to a route's `extensions`[^s05]:

```ts
extensions: {
  ...declareDiscoveryExtension({
    input: { city: "San Francisco" },
    inputSchema: {
      properties: { city: { type: "string" } },
      required: ["city"],
    },
    output: {
      example: { city: "San Francisco", weather: "foggy", temperature: 60 },
    },
  }),
}
```

`inputSchema` tells an agent how to call the tool (the parameter shape), and `output.example` shows what the response looks like ahead of time — these two schemas are what let an agent "self-configure" without a human once the resource is in the Bazaar[^s10].

### 5.2 Server side — the `x402-express` shorthand

In `x402-express`'s `paymentMiddleware`, putting `discoverable: true` and `inputSchema` in the route config achieves the same effect[^s04]:

```js
app.use(
  paymentMiddleware(
    "0xB1De43C2Ca1195258FEE160adAcB1820c3776B7D",
    {
      "POST /rps/play": {
        price: "$0.001",
        network: "base",
        config: {
          name: "Rock-Paper-Scissors",
          discoverable: true,
          inputSchema: {
            type: "object",
            properties: { move: { type: "string", enum: ["rock", "paper", "scissors"] } },
          },
        },
      },
    },
    { facilitator },
  ),
);
```

Once this server settles one `$0.001` payment, `POST /rps/play` is auto-listed in the Bazaar catalogue[^s01][^s04].

### 5.3 Buyer side — `listCatalog` + `wrapFetchWithPayment`

The buying agent fetches the catalogue, then calls a discovered resource through `x402-fetch`'s `wrapFetchWithPayment`, which performs the 402 auto-payment retry[^s04]:

```js
const listCatalog = async () => {
  const r = await fetch("https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources");
  return r.json();
};

const fetchWithPayment = wrapFetchWithPayment(fetch, cdpAccount);
const catalog = await listCatalog();
const service = catalog.items[0];
const response = await fetchWithPayment(service.resource, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ move: "rock" }),
});
```

The flow is **Discovery → 402 Response → Facilitator Settlement → Retry with Proof → Paid Result**, with no account creation required[^s04].

## 6. Discussion — observations and limits

### 6.1 Trust signals replacing SEO

On the traditional web, service discovery leans on SEO, reviews, and directories. The Bazaar replaces that with **on-chain transaction activity** (distinct buyers, volume, recency)[^s01]. The service that ranks highest is not "the one humans searched/linked most" but "the one agents actually paid for most" — a ranking mechanism tuned for the agent economy _(interpretive)_[^s01][^s10].

### 6.2 The double edge of auto-indexing

No registration step drops the entry barrier to zero, but "one settlement and you're listed" leaves room for sybil/spam listings. The 30-day inactivity exclusion[^s01] and quality ranking[^s01] are partial defences, but the fact that a newly indexed resource is exempt from the inactivity filter after just one settlement remains a weakness _(interpretive)_.

### 6.3 Central facilitator dependency

The Bazaar uses the CDP Facilitator as its indexer, so "which services get discovered" is bound to one facilitator's settlement vantage point[^s01]. The x402 standard is facilitator-agnostic[^s09], so in principle another facilitator could run its own Bazaar-style index — but as of this writing the live Bazaar is CDP-hosted.

### 6.4 Comparison with MPP and Circle

Circle's Agent Marketplace ([`circle-api-storefront-for-agents`](../circle-api-storefront-for-agents/)) targets the same "agent service discovery" slot. MPP does not mandate a discovery standard — see the sister report [`mpp-spec-and-payment-flows`](../mpp-spec-and-payment-flows/). Of these, the Bazaar is the most automated in that it indexes facilitator settlement data directly _(interpretive)_.

## 7. Limitations

- This report reflects primary docs and example code as of 27 May 2026. The Coinbase launch page[^s02] was access-limited at fetch time, so the launch date (2025-09-10) and "self-improving / self-configuring" framing are corroborated via Yahoo[^s03] and MEXC[^s10].
- The exact quality-ranking weights are not published; this report covers only the signal list (buyer reach / volume / recency / metadata).
- The "200 ms" settlement figure is a Coinbase/coverage claim, with Yahoo itself noting real-world end-to-end is typically 300–500 ms once network latency is included[^s03].
- Whether non-CDP facilitators run independent Bazaar indexes is unconfirmed as of this writing.
- The `declareDiscoveryExtension` API surface is captured from the `bazaar.ts` example[^s05]; field names may shift across x402 V2 releases.
