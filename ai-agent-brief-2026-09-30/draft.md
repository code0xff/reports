## Abstract

Stripe added incremental authorization, bank-account-linked spending data, and purchase protection to Link's wallet for agents, and says agentic purchases through it are up 38x in a month _(vendor-stated)_, with Muse, Grok Bot, and Instinct named as users. The same day, at DevDay 2026, OpenAI launched Dots, an always-on personal agent styled after Meta's Muse, and widened its "Sign in with ChatGPT" identity layer from 6 partners to 16 while opening an enterprise app Marketplace. The payment-protocol side of the beat — x402, AP2, ACP, MPP — produced nothing checkable for a fourth straight brief.

## Introduction

This edition covers **2026-09-27 through 2026-09-30**. Background on the payment-rail side of the standing beat lives in the site's [agent commerce protocol comparison](../agent-commerce-protocol/) and [agent-to-merchant card-payments coverage](../agent-commerce-card-payments/); this brief adds a product update from Stripe, not a spec change. Everything below traces back to two events on 2026-09-29: Stripe's own announcement, and OpenAI's DevDay keynote.

## What moved

### Stripe teaches Link's agent wallet to negotiate its own spending limit

Link's wallet for agents launched in April 2026 as a way to let an AI system hold a scoped, revocable credential instead of a user's real card number[^s02]. Stripe's September 29 update adds three things on top of that base: incremental authorization, so an agent that quoted a flight at $400 can come back and ask for $460 once baggage fees land instead of failing the transaction outright; consumer-permissioned access to Financial Connections data across more than 12,000 institutions, covering 97% of US bank accounts, so an agent can factor a user's actual balances and history into what it recommends; and purchase protection covering accidental damage, lost items, price drops, and returns, extended for the first time to a purchase an agent made on a human's behalf[^s01].

```mermaid
sequenceDiagram
    participant User
    participant Agent
    participant Link
    participant Merchant
    Agent->>Link: request authorization ($400 estimate)
    Link->>User: approve?
    User-->>Link: approved
    Link-->>Agent: scoped token
    Agent->>Merchant: checkout (actual: $460)
    Agent->>Link: request incremental authorization (+$60)
    Link->>User: approve overage?
    User-->>Link: approved
    Link-->>Agent: updated token
    Agent->>Merchant: complete purchase
```
*Every step where the price moves routes back through the user, not just the first one — the feature Stripe is selling is that an agent can hit a moving price without either failing the purchase or silently absorbing the difference.*

Stripe says agentic purchases made through Link grew 38x over the past month and names Meta's Muse, xAI's Grok Bot, and Instinct as agents already using the wallet, with Muse first to get the new purchase protections[^s01]. The 38x figure has no disclosed baseline, so it says more about direction than scale _(vendor-stated)_. It also sits against a consumer-trust survey from April 2026 that found only 14% of people trust AI to make a purchase without their own verification, and 42% refuse to let AI touch a transaction over $25[^s07] — a gap Stripe's new approval-at-every-step design is arguably built to close, not evidence it already has.

### OpenAI gives ChatGPT a body that doesn't need the chat window

Dots, unveiled at DevDay on September 29, is OpenAI's answer to an agent that keeps running when nobody is typing to it[^s03]. It's powered by GPT-6 Astra and reachable through Slack and Teams, with SMS coming later. A user can spin up several "specialist Dots," each with its own identity and credentials, to work a defined goal in the background: watching customer feedback for a developer, say, or reanalyzing data for a scientist[^s03]. OpenAI also wired Dots into Microsoft's Agent 365 security controls, choosing to lean on an outside governance layer instead of building its own. TechCrunch describes Dots' visual style as "bubbly" and "cartoonish," explicitly comparable to Meta's Muse; both companies are now shipping a persona alongside the capability, not just the capability[^s03]. Nothing in OpenAI's own materials or TechCrunch's report ties Dots to a payment or checkout feature. If that connection exists, it hasn't been announced.

### An identity layer that started as a login button is turning into a platform

OpenAI opened "Sign in with ChatGPT" in beta in July 2026 with six partners: Airtable, GitLab, HubSpot, Notion, Supabase, and Vercel. By default it hands a third-party app nothing more than a name, an email, and a profile picture[^s05]. At DevDay, that grew to 16 launch partners including Figma, plus a new OpenAI Marketplace where more than 30 enterprise software vendors let customers apply part of an existing OpenAI spend commitment toward their products[^s04]. Broader access, to files, tokens, or billing, still needs a separate consent flow that a user or an org admin has to approve on its own[^s05]. That design puts OpenAI in the identity-broker seat for every one of those 16 apps, a different kind of leverage than selling API calls.

## Why it matters

Two things happened on the same calendar day that would normally sit on opposite ends of the beat: Stripe made the rail agents already use handle a wider range of real purchases, and OpenAI made its own account system the thing a growing list of outside apps authenticate against. Neither announcement mentions the other, but they point at the same shift. An agent's ability to act on a user's behalf now depends less on what the agent itself can do and more on which wallet and which identity provider it's plugged into. The payment-protocol layer underneath all of this (x402, AP2, ACP, MPP) hasn't moved in four briefs running, so the wallets and identity layers are advancing faster than the open standards meant to make them interoperable with each other.

## Signals to watch

- Whether Stripe discloses an absolute transaction count behind the 38x growth figure, or it stays a ratio.
- Whether Dots or any successor gets a purchasing feature, and if so, whether it routes through Link, Instant Checkout, or something OpenAI-specific.
- Whether "Sign in with ChatGPT" partner growth (6 → 16 in two months) keeps pace, and whether any partner asks for the broader permission grant rather than the default identity-only one.
- Any x402, AP2, ACP, or MPP filing, release, or spec PR — absent for a fourth consecutive brief.

## Limitations

Both of OpenAI's own DevDay pages (its recap and the Dots announcement) returned HTTP 403 to this harness's fetch tool; everything about Dots and the identity-layer expansion here comes from TechCrunch's reporting, not OpenAI's primary text. Stripe's growth and adoption figures are vendor-stated with no independent verification found this window. The MPP-specs check covered only `tempoxyz/mpp-specs`' merged pull requests in-window, which were CI configuration changes[^s06] — that rules out spec movement on GitHub specifically, not movement anywhere else. Feeds, web search, and GitHub were all reachable this window; nothing from X or LinkedIn was read directly.
