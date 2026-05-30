# OpenAI × Stripe Agentic Commerce Protocol (ACP)

## Introduction

The **Agentic Commerce Protocol (ACP)** is an Apache-2.0-licensed open standard, currently in `beta`, that defines how a buyer's AI agent and a merchant complete a purchase — including how the merchant gets paid without ever seeing the buyer's raw card. The specification is maintained jointly by OpenAI and Stripe as Founding Maintainers, with a stated path toward broader community governance [^s01][^s02]. The protocol's first production showcase is OpenAI's "Instant Checkout" inside ChatGPT, where Stripe operates as the first compatible PSP [^s01][^s04].

ACP only specifies the *interaction surface* between three parties — agent, PSP, merchant. It deliberately does not standardise the agent runtime, the merchant's commerce backend, or the PSP's settlement plumbing; those keep using whatever each party already has. What ACP standardises is the JSON over the wire and the headers around it [^s01][^s04].

## Background — Three parties and dated versions

The canonical actor model has three parties [^s04]:

- **Agent (ChatGPT).** "ChatGPT collects buyer, fulfillment, and payment information from the user" and "calls the merchant's Agentic Commerce Protocol endpoints" [^s04].
- **Merchant.** Performs validation, determines fulfillment options, calculates taxes, analyzes payment signals, and processes payments on its own systems [^s04].
- **PSP (Payment Service Provider).** "The PSP responds with a payment token that OpenAI passes on to the merchant to complete the payment" [^s04].

ACP is released as **dated spec snapshots**, each version frozen under `spec/<date>/`. The published series is `2025-09-29` (initial release), `2025-12-12` (fulfillment enhancements), `2026-01-16` (capability negotiation), `2026-01-30` (extensions, discounts, payment handlers), and `2026-04-17` (cart, feed, orders, delegate-authentication, MCP binding) [^s02]. RFC and SEP (Specification Enhancement Proposal) processes are documented in the repo (`rfcs/`, `docs/sep-guidelines.md`), and a parallel `unreleased/` directory hosts in-flight work [^s02].

## Architecture — Agentic Checkout + Delegated Payment

ACP is two REST sub-specs that compose [^s07][^s08]:

### Agentic Checkout

Hosted by the **merchant**. Endpoints (as of the 2026-04-17 OpenAPI) [^s08]:

```
POST   /checkout_sessions                                    createCheckoutSession
PATCH  /checkout_sessions/{checkout_session_id}              updateCheckoutSession
GET    /checkout_sessions/{checkout_session_id}              getCheckoutSession
POST   /checkout_sessions/{checkout_session_id}/complete     completeCheckoutSession
POST   /checkout_sessions/{checkout_session_id}/cancel       cancelCheckoutSession
```

The session response advertises a capability surface that tells the agent *how this merchant wants to be paid*. The 2026-04-17 example shows two payment handlers in the same response — one tokenized-card handler routed through Stripe and one seller-managed handler keyed off a saved card — each described by a reverse-DNS id and an explicit PSP attribution [^s06]:

```json
{
  "capabilities": {
    "payment": {
      "handlers": [
        {
          "id": "card_tokenized",
          "name": "dev.acp.tokenized.card",
          "requires_delegate_payment": true,
          "requires_pci_compliance": false,
          "psp": "stripe",
          "config": {
            "accepted_brands": ["visa","mastercard","amex","discover"],
            "supports_3ds": true,
            "3ds_versions": ["2.1.0","2.2.0"]
          }
        },
        {
          "id": "seller_pm_123",
          "name": "dev.acp.seller_backed.saved_card",
          "requires_delegate_payment": true,
          "requires_pci_compliance": false,
          "psp": "seller_managed"
        }
      ]
    },
    "interventions": {
      "supported": ["3ds","address_verification"],
      "enforcement": "conditional"
    }
  },
  "status": "ready_for_payment"
}
```

The crucial flag for a builder is `requires_pci_compliance: false`. The merchant does not handle raw card data; it works with a vault token. PCI scope lives on the PSP.

### Delegated Payment

Hosted by the **PSP**. A single endpoint [^s07]:

```
POST /agentic_commerce/delegate_payment        delegatePayment
```

Request headers per the OpenAPI [^s07]:

| Header | Purpose |
|---|---|
| `Authorization: Bearer …` | PSP API credential |
| `Idempotency-Key` | Required by the error model (`idempotency_key_required`) |
| `Request-Id` | Correlation |
| `Signature` | Detached JSON signature for request verification |
| `Timestamp` | ISO 8601 timestamp for request timing validation |
| `API-Version` | Dated ACP version (e.g. `2026-04-17`) |
| `Accept-Language`, `User-Agent`, `Content-Type` | Standard |

`Signature` is declared `required: false` in the OpenAPI, but the error model and headers list it as a first-class verification primitive [^s07]. In production deployments it is almost certainly mandatory; the report flags this as an under-specified field _(see uncertainties)_.

The body has four top-level objects: `payment_method`, `allowance`, `risk_signals`, and `metadata` [^s05]:

```json
{
  "payment_method": {
    "type": "card",
    "card_number_type": "fpan",
    "number": "4242424242424242",
    "exp_month": "11", "exp_year": "2026",
    "name": "Jane Doe", "cvc": "223",
    "checks_performed": ["avs","cvv"],
    "display_brand": "visa", "display_last4": "4242"
  },
  "allowance": {
    "reason": "one_time",
    "max_amount": 2000,
    "currency": "usd",
    "checkout_session_id": "csn_01HV3P3XYZ9ABC",
    "merchant_id": "acme_store",
    "expires_at": "2025-10-09T07:20:50.52Z"
  },
  "risk_signals": [
    { "type": "card_testing", "score": 10, "action": "manual_review" }
  ],
  "metadata": { "source": "chatgpt_checkout" }
}
```

The PSP responds with a vault token whose id is the `vt_…` prefix [^s05]:

```json
{
  "id": "vt_01J8Z3WXYZ9ABC",
  "created": "2025-09-29T11:00:00Z",
  "metadata": { "source": "agent_checkout", "merchant_id": "acme_store" }
}
```

The token is single-use and scoped by the `allowance` — it can only be used to charge up to `max_amount` in `currency` against `merchant_id` for the named `checkout_session_id` before `expires_at` [^s03][^s05]. The OpenAI spec page makes the security claim plain: "PSP-returned credentials are narrowly scoped and cannot be used outside the defined limits of the user-approved purchase" [^s03].

Error model is structured and stable, with PSP-side conditions getting well-known codes [^s05]:

```
invalid_card
idempotency_conflict          (same key, different body)
idempotency_in_flight         (same key, request still processing)
idempotency_key_required
too_many_requests
```

## Code-level walkthrough — example implementation

The canonical happy-path is four HTTP calls. Below is a runnable Python sketch using `requests`; the request bodies are the example payloads shipped in the repo verbatim [^s05][^s06][^s07][^s08]:

```python
import json, time, uuid, requests

MERCHANT = "https://acme.example.com"
PSP      = "https://stripe-acp.example.com"   # Stripe ACP base
API_VER  = "2026-04-17"

def H(idempotency_key=None, signature=None):
    h = {
        "Content-Type": "application/json",
        "API-Version": API_VER,
        "Request-Id": str(uuid.uuid4()),
        "Timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if idempotency_key: h["Idempotency-Key"] = idempotency_key
    if signature:       h["Signature"]       = signature
    return h

# 1) Agent → Merchant: create the checkout session
r = requests.post(f"{MERCHANT}/checkout_sessions",
    headers=H(idempotency_key="agent-" + str(uuid.uuid4())),
    json={
        "currency": "usd",
        "line_items": [{"id": "item_123"}],
        "fulfillment_details": {
            "name": "John Doe", "phone_number": "15551234567",
            "email": "johndoe@example.com",
            "address": {
                "name": "John Doe", "line_one": "1234 Chat Road",
                "city": "San Francisco", "state": "CA",
                "country": "US", "postal_code": "94131"
            }
        }
    })
session = r.json()
checkout_session_id = session["id"]

# 2) Agent picks a handler from capabilities.payment.handlers[]
#    A handler with requires_delegate_payment=true means we need a vault token.
handler = next(h for h in session["capabilities"]["payment"]["handlers"]
               if h["requires_delegate_payment"])
assert handler["name"] == "dev.acp.tokenized.card"
assert handler["psp"]  == "stripe"

# 3) Agent → PSP: delegate_payment to mint a vault token, scoped by allowance
total = next(t for t in session["totals"] if t["type"] == "total")["amount"]
r = requests.post(f"{PSP}/agentic_commerce/delegate_payment",
    headers=H(idempotency_key="delegate-" + checkout_session_id,
              signature="<detached-jws-of-request-body>"),
    json={
        "payment_method": {
            "type": "card", "card_number_type": "fpan",
            "number": "4242424242424242",
            "exp_month": "11", "exp_year": "2026",
            "name": "Jane Doe", "cvc": "223",
            "checks_performed": ["avs", "cvv"]
        },
        "allowance": {
            "reason": "one_time",
            "max_amount": total,
            "currency": "usd",
            "checkout_session_id": checkout_session_id,
            "merchant_id": handler["config"]["merchant_id"],
            "expires_at": "2026-05-30T07:20:50.52Z"
        },
        "risk_signals": [{"type": "card_testing", "score": 10, "action": "manual_review"}],
        "metadata": {"source": "chatgpt_checkout"}
    })
vault = r.json()
assert vault["id"].startswith("vt_")    # vault token

# 4) Agent → Merchant: complete the session using the vault token
r = requests.post(f"{MERCHANT}/checkout_sessions/{checkout_session_id}/complete",
    headers=H(idempotency_key="complete-" + checkout_session_id),
    json={"payment_token": vault["id"]})
print(r.json())                          # status: completed, order id, etc.
```

This is faithful to the structure of the canonical example JSON [^s05][^s06]: the request shapes (line items, fulfillment, allowance) and the response shapes (handler descriptors, vault token id) match the repo's example artefacts. Real production code should add signed bodies (the `Signature` header is a detached JSON signature [^s07]) and handle the documented error codes [^s05]. An independent reference implementation that wires this end-to-end against real Stripe APIs is `locus-technologies/agentic-commerce-protocol-demo` [^s12].

The 2026-04-17 release also added an **MCP binding** (`examples.mcp.agentic_checkout.json`), so the same Agentic Checkout operations can be invoked over MCP transport instead of REST. ACP advertises itself as "REST and MCP compatible" [^s01][^s02].

## Analysis — comparisons and tradeoffs

**Vault token vs Mandate.** Google's AP2 represents authority as a user-signed Mandate carried as an SD-JWT; ACP represents authority as a PSP-issued vault token (`vt_…`) constrained by an Allowance. Mandates put cryptographic authority on the user's signature; vault tokens put scoping on the PSP. The two protocols can coexist — a Mandate could authorise *which* checkout the agent may attempt, while the vault token bounds *how* the charge can run — but they answer different questions. _(interpretive)_

**ACP vs Coinbase x402.** x402 is a payment-rails protocol (HTTP 402 for machine-to-machine). ACP is a *checkout* protocol that delegates the rail. In the 2026-04-17 spec the only credential type Delegated Payment supports is `card` ("Exactly one credential type is currently supported: card" [^s07]), so a crypto rail would have to be expressed either as a future `payment_method.type` or as a different handler under `capabilities.payment.handlers[]`. The handler model is *extensible by reverse-DNS name*, which is the obvious place for that growth [^s06].

**ACP vs EIP-8004.** EIP-8004 is an on-chain *identity / reputation / validation* layer for agents; it does not handle payment authorization at all. ACP and EIP-8004 are orthogonal — an EIP-8004 identity could be the *agent_id* that a merchant logs in ACP `metadata`, but the actual money-movement is ACP-side.

**PCI scope is the headline value.** A merchant integrating ACP receives `vt_…` tokens, not PANs. The handler descriptor literally encodes `requires_pci_compliance: false` on the merchant side [^s06], and the Delegated Payment OpenAPI keeps card primitives behind the PSP boundary [^s03][^s07]. For a merchant that previously had to architect around PCI for agent flows, this is the biggest practical reason to adopt.

**What Stripe gets.** Being the first compatible PSP locks Stripe as the default vault-token issuer for ChatGPT Instant Checkout traffic [^s01][^s04]. The protocol is open and Apache-2.0, so a future PSP can issue its own `vt_…` tokens, but the network effect from being shipped *with* ChatGPT is real.

## Discussion

**Disputed attribution.** Stripe's own ACP docs page and at least one widely-circulated search summary describe ACP as "an open standard created by Stripe, OpenAI, and Meta" [^s10][^s11]. The canonical project landing page at agenticcommerce.dev [^s01] and the GitHub README [^s02] list only OpenAI and Stripe as Founding Maintainers; Meta is not in `MAINTAINERS.md`. The cleanest reading is that the canonical README is authoritative for governance and Meta is either an implementer that some downstream writers misattributed, or a participant whose role has not yet shown up in the maintainer list. The report presents both citations and does not resolve.

**Governance.** The repo carries `docs/governance.md`, `docs/operating-model.md`, RFC and SEP processes (`rfcs/`, `docs/sep-guidelines.md`), and a CLA process under `legal/cla/` [^s02]. That is more governance scaffolding than typical "post-on-our-blog" specs; combined with the dated-snapshot release cadence, ACP looks like it is being run as a standards effort rather than a Stripe SDK.

**What is still missing.** The Delegated Payment OpenAPI states "Exactly one credential type is currently supported: card" [^s07], so non-card rails (stablecoins, bank, wallets that are not card-tokenised) are not formally specified yet. Dispute / chargeback semantics are referenced indirectly through the order example files but not given normative spec text. The `Signature` header is declared optional in the OpenAPI even though real deployments would require it [^s07]; that gap is in the spec, not the implementations.

## Limitations

This report does not cover: (1) Stripe-side internal mechanics for how `vt_…` tokens map to Stripe `PaymentIntent` or vault keys; (2) the OpenAI launch blog quotes (the page is `access_limited: true` for WebFetch); (3) the production behaviour of the `Signature` header (we only quote the OpenAPI text); (4) RFC-stage features not yet in a dated snapshot (e.g. `rfc.delegate_authentication.md`, `rfc.intent_traces.md`, `rfc.marketing_consent.md`) beyond noting they exist; (5) the discount and extension JSON Schemas in detail.

## Abstract

The Agentic Commerce Protocol (ACP) is an Apache-2.0 open standard for AI-agent-led purchases, maintained by OpenAI and Stripe and currently in `beta`. It is composed of two REST sub-specs — **Agentic Checkout** (merchant-hosted; `/checkout_sessions` create/update/complete/cancel) and **Delegated Payment** (PSP-hosted; `POST /agentic_commerce/delegate_payment`) — joined by a payment-handler descriptor (`dev.acp.tokenized.card`, `psp: "stripe"`, `requires_pci_compliance: false`). The agent calls the merchant to open a session, picks a handler from `capabilities.payment.handlers[]`, calls the PSP's Delegated Payment to mint a single-use vault token (`vt_…`) scoped by an Allowance (`reason: "one_time"`, `max_amount`, `currency`, `checkout_session_id`, `merchant_id`, `expires_at`), and submits that vault token back to the merchant's `/complete`. Headers include `Idempotency-Key`, `Signature` (detached JSON signature), `Timestamp`, and `API-Version`; errors are structured (`invalid_card`, `idempotency_conflict`, …). Dated spec snapshots run from `2025-09-29` to `2026-04-17`, with an MCP binding added in the latest release; OpenAI's "Buy it in ChatGPT" Instant Checkout is the showcase consumer and Stripe is the founding PSP. Third-party writeups dispute whether Meta is a co-creator; the canonical README and landing page say only OpenAI and Stripe. The 2026-04-17 spec supports only `card` as a credential type; non-card rails and full dispute semantics are still open.
