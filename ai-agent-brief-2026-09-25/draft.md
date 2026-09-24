## Abstract

Meta's Muse agent can now check out on Shopify stores through Shop Pay, and eligible US merchants are reportedly enrolled by default. Danske Bank and Mastercard completed a live agent payment in Denmark, and GoCardless did the same over UK direct debit. Google put an MCP front end on API Gateway and started letting Gemini phone businesses. Three of the five items are payments, and all three ride rails that already exist.

## Introduction

This edition of the `ai-agent-brief` series covers **2026-09-22 through 2026-09-25** (72 hours). The standing beat is agent frameworks and developer tooling, agent payment rails and protocols, the card networks' and PSPs' agent products, agent identity, and the standards behind them. The [previous brief](../ai-agent-brief-2026-09-24/) covered local-model agents and ChatGPT's mobile Work tab. Background on the card-network side is in the site's reports on [Mastercard Agent Pay](../mastercard-agent-pay/) and [Google UCP](../google-ucp-agent-payments/).

## What moved

### Shopify opens its checkout to Muse

Shopify and Meta announced around 2026-09-21 that Muse can browse Shopify stores and complete purchases through Shop Pay[^s01]. Shopify's CEO said the company is "partnering deeply with Muse to enable agentic checkout". Forkast adds that Shopify switched agent checkout on by default for eligible US merchants, about a million of them, and that a merchant who wants out must find the Meta channel under Sales channels > Agentic and turn Direct checkout off[^s02] _(unverified — single source)_.

This is the merchant-side counterpart to the Amazon block on Muse covered in earlier briefs. One platform lets the agent in with no per-store integration, the other shuts it out, and the merchant's own preference sits behind a setting most will never open.

### Danske Bank and Mastercard complete a live agent payment

On 2026-09-21 an AI agent booked a coffee tasting on Mastercard's Priceless platform and paid with a Danske Bank card, which the two companies describe as Denmark's first agent payment[^s03]. PayOS orchestrated the flow. The card number was not exposed: the agent received a tokenized credential scoped to that agent and to the customer's consent policy, and the purchase was authenticated with Mastercard Payment Passkeys. Danske's head of personal banking called it "a new way for customers to interact with financial services", and Tech Times describes the run as a controlled proof of concept rather than a product _(vendor-stated)_.

The issuer could see that an agent, not the cardholder, initiated the payment. That is the property the [Mastercard Agent Pay report](../mastercard-agent-pay/) treats as the hard part, and this is one transaction showing it working at a real issuer.

### GoCardless runs an agent payment over direct debit

On 2026-09-22 GoCardless said it had completed the UK's first live agentic account-to-account payment, a recurring donation to the charity Trussell set up through a conversational checkout[^s04]. It ran under the FCA's AI Live Testing programme. GoCardless's CEO argued that account-to-account payments are "the natural foundation for agentic commerce", and the company cites a survey in which 64% of UK consumers are open to AI managing recurring payments _(vendor-stated)_.

### API Gateway becomes an MCP server

Google Cloud API Gateway entered public preview on 2026-09-24 as a remote MCP server: annotate an OpenAPI 3.x spec and the gateway turns MCP calls into REST calls[^s05]. Existing JWT or API-key checks apply to each `tools/call`. The catch is that `tools/list` is open by default and can be locked only with JWT, since "API keys cannot secure this method." A gateway holds up to 1,000 tools.

### Gemini can call businesses for you

Google began testing "Call for Me" on 2026-09-24[^s06]. Gemini rings a business from the user's own number, introduces itself, works through phone menus, waits on hold and talks to whoever answers, with a live transcript and a takeover button. It starts with paying Gemini subscribers on Pixel 11 phones in the US. No payment step is described.

## Why it matters

The payment stories share a feature: none of them needed a new protocol. Shopify used a checkout button, Danske and Mastercard used tokenized cards, GoCardless used direct debit. What differed was who set the default. Shopify's merchants were reportedly enrolled by Shopify, and Danske's test ran inside an issuer's own pilot. The site's protocol reports, on [x402](../x402-protocol/) and [UCP](../google-ucp-agent-payments/), describe agents negotiating with each merchant. Today's evidence points at platforms making that choice for them.

## Signals to watch

- Shopify's own documentation for the default-on setting, and any merchant complaint about agent orders they did not expect.
- A second issuer repeating Danske's run, or a dispute case involving an agent-initiated card payment.
- Do GoCardless and the FCA publish results from AI Live Testing?
- Whether Google's preview adds a way to protect `tools/list` with an API key, or leaves it JWT-only.

## Limitations

The three payment items each rest on one trade article; none of the vendors' own announcements was read. Danske's run was one transaction, and GoCardless's was a single donation. Ars Technica's piece on the OpenAI agent and the Australian government breach was left out as a follow-up to incidents earlier briefs already covered, and The Verge's Gemini coverage could not be fetched. Bluesky and Reddit were unavailable (see `working/gaps.md`).
