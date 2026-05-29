# Google AP2 (Agent Payments Protocol) — Deep Technical Analysis with Example Code

## Introduction

The Agent Payments Protocol (AP2) is an open standard, announced by Google on 2025-09-17, for cryptographically proving the authority and intent behind a payment that an AI agent initiates on behalf of a user [^s03]. The launch included 60+ partners spanning card networks and PSPs (Mastercard, American Express, JCB, UnionPay, PayPal, Adyen, Worldpay), platform vendors (Salesforce, ServiceNow), and Web3 providers (Coinbase, MetaMask, Mysten Labs) [^s03][^s10][^s12].

The question AP2 answers is, on the surface, simple: *how can a merchant or a payment processor trust a payment request that comes from a non-deterministic, LLM-driven agent?* The answer is to insert a **Mandate** — a user- or agent-signed digital authorization — at every stage of the flow, and to carry each Mandate as a W3C Verifiable Credential [^s01][^s10][^s11]. AP2 itself only specifies *payment authorization*; catalog APIs, checkout transport, and other parts of a full "Commerce Protocol" are explicitly out of scope [^s01].

## Background — A2A, MCP, and the gap AP2 fills

Google already had two adjacent standards: MCP, which supplies context to models and tools, and A2A, which standardises agent-to-agent calls and delegation. Both handle *talking*; neither handles *money*. AP2 fills that gap. The spec is explicit: "AP2 operates as a security feature within a Commerce Protocol. … AP2 is designed explicitly to be compatible with the Universal Commerce Protocol (UCP) and integrates seamlessly" [^s01]. In other words, AP2 owns *payment authorization* only; the actual transport of cart and catalog information is owned by a separate protocol such as UCP.

Two things happened together on 2026-04-28: AP2 v0.2 landed on GitHub, and Google donated governance of the standard to the **FIDO Alliance** [^s12]. v0.2 added two substantive things — (1) Human-Not-Present payments (delayed autonomous execution by the agent) and (2) **Verifiable Intent**, a tamper-evident log of user-authorized agent actions co-developed with Mastercard and also donated to FIDO [^s12].

## Architecture and the Mandate model

### Five roles

The spec defines five roles [^s01]:

| Role | Abbr. | Responsibility | Agentic? |
|---|---|---|---|
| Shopping Agent | SA | Product discovery, cart assembly, purchase execution | **Must be agentic** |
| Credential Provider | CP | Supplies and scopes payment credentials | May be either |
| Merchant | M | Provides checkout; inventory/price integrity | May be either |
| Merchant Payment Processor | MPP | Processes payment; verifies Payment Mandate | May be either |
| Trusted Surface | TS | Obtains user consent, mints user-signed Mandates | **Must be non-agentic** |

The threat model is explicit: "AP2 assumes that, at a minimum, the Shopping Agent is agentic … the Agent itself is a potential attacker" [^s01]. That is, AP2 treats the Shopping Agent as a *potential adversary* on the user's behalf, and the only acceptable proof of user intent is a signature minted on a Trusted Surface. A single legal entity may play multiple roles, but every validation and processing step "MUST happen in deterministic code regardless of whether the role is agentic or not" [^s01].

### Two delegation models

A separate document, `agent_authorization.md`, splits Mandate delegation into two trust models [^s07]:

- **User Credential model.** An Issuer external to the agent (e.g. the user's wallet or passkey provider) attests the user's identity. The same user credential can delegate Mandates to many different agents [^s07].
- **Trusted Agent Provider model.** The agent's *provider* is the party the Verifier trusts. Simpler trust graph, but the Verifier needs an explicit trust relationship with every agent provider [^s07].

### v0.1 vs v0.2 — the Mandate model changed once

This is the place integrators most often get confused: the repo currently ships two generations of the Mandate model side by side.

**v0.1 (launch SDK, Pydantic).** `code/sdk/python/ap2/models/mandate.py` still defines the original three Mandate models [^s04]:

```python
class IntentMandate(BaseModel):
    user_cart_confirmation_required: bool = True
    natural_language_description: str   # e.g. "High top, old school, red basketball shoes"
    merchants: list[str] | None
    skus: list[str] | None
    requires_refundability: bool | None
    intent_expiry: str                  # ISO 8601

class CartContents(BaseModel):
    id: str
    user_cart_confirmation_required: bool
    payment_request: PaymentRequest     # W3C PaymentRequest
    cart_expiry: str
    merchant_name: str

class CartMandate(BaseModel):
    contents: CartContents
    merchant_authorization: str | None  # base64url-encoded JWT signed by merchant

class PaymentMandate(BaseModel):
    payment_mandate_contents: PaymentMandateContents
    # payment_mandate_id, payment_details_id, payment_details_total,
    # payment_response, merchant_agent, timestamp
```

The `merchant_authorization` docstring specifies that the JWT payload must contain `iss/sub/aud/iat/exp/jti/cart_hash`, where `cart_hash` is a secure hash over the canonical JSON of `CartContents` [^s04]. The "Intent → Cart → Payment" three-stage Mandate flow described in the original launch press is precisely this SDK [^s03][^s10][^s13].

**v0.2 (2026-04, current spec).** `specification.md` consolidates Mandates to two types — **Checkout Mandate** and **Payment Mandate** — both represented as **SD-JWTs** (Selective Disclosure JWTs) with a `vct` (Verifiable Credential Type) claim that encodes the schema version [^s01]. The JSON schemas are [^s05]:

```jsonc
// checkout_mandate.json — required fields
{
  "vct":          "mandate.checkout.1",
  "checkout_jwt": "<base64url JWT>",        // merchant-signed Checkout payload
  "checkout_hash":"<base64url sha-256>",    // hash of checkout_jwt
  "iat": 1746...,
  "exp": 1746...
}
```

```jsonc
// payment_mandate.json — required fields
{
  "vct":            "mandate.payment.1",
  "transaction_id": "<base64url hash of checkout_jwt>",  // ← link
  "payee":          { /* merchant.json */ },
  "payment_amount": { "currency":"USD", "amount":27999 }, // ISO 4217 minor units
  "payment_instrument": { /* payment_instrument.json */ },
  "execution_date": "2026-05-29T...",       // absent ⇒ execute immediately
  "risk_data":      { /* risk signals collected by the Trusted Surface */ }
}
```

The two Mandates are permanently bound by **the hash of the merchant's Checkout JWT** — the Payment Mandate's `transaction_id` equals the Checkout Mandate's `checkout_hash` [^s01][^s05]. The spec requires that "the Checkout JWT MUST be signed using a digital signature scheme (e.g., ECDSA) and not a deterministic signature (e.g., Ed25519)" — a deterministic scheme would produce the same signature for the same input and would let a verifier with a rainbow table recover the Checkout JWT [^s01].

### Human-Present vs Human-Not-Present

`flows.md` describes both [^s06]:

- **Human Present (`direct`).** The user signs *closed* Checkout and Payment Mandates at the moment of payment. The Shopping Agent builds the Mandate Content, the Trusted Surface renders it, the user authenticates (biometric) and consents, and the Trusted Surface signs with `user_sk`. The `checkout_jwt` hash permanently links the two Mandates, and the `agent_pk` is included as a confirmation claim that *sender-constrains* the Mandate so another agent cannot replay it [^s06].
- **Human Not Present (`autonomous`).** In Phase 1a the user signs *open* Mandates that carry constraints (price ceiling, time window, SKU set). After the user leaves, the agent autonomously assembles a cart (Phase 1b) and executes payment (Phase 2). If the Merchant or Credential Provider returns an `unresolved_constraint` error, the flow falls back to Human-Present — the user is brought back to sign closed Mandates [^s06].

## Code-level walkthrough — example implementation

The repository ships the same flow in Python, Go, and Android scenarios. The Python sample uses Google ADK (`google.adk.tools.tool_context`), an A2A message builder, and a separate MCP server variant per role [^s02][^s09]. The following condenses `code/samples/python/src/roles/shopping_agent/tools.py` into a runnable sketch [^s09]:

```python
# 1) Generate / load an ECDSA P-256 signing key for the user/agent
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from jwcrypto.jwk import JWK

raw_key = ec.generate_private_key(ec.SECP256R1())
jwk_key = JWK.from_pyca(raw_key)
# Set kid so verifiers can locate the key.

# 2) Shopping Agent → Merchant Agent: ask for a Checkout over A2A
from common.a2a_message_builder import A2aMessageBuilder

message = (
    A2aMessageBuilder()
    .set_context_id(shopping_context_id)
    .add_text("Create a checkout for the selected cart.")
    .add_data("cart_id", chosen_cart_id)
    .add_data("shopping_agent_id", "trusted_shopping_agent")
    .add_data("debug_mode", False)
    .build()
)
task = await merchant_agent_client.send_a2a_message(message)

# Merchant returns an ap2.checkout artifact: { checkout_jwt, checkout_hash, amount, ... }
checkout_data = _extract_first_data(task.artifacts, "ap2.checkout")
```

At this point `checkout_jwt` is a *merchant-ECDSA-signed JWT* and `checkout_hash` is its base64url SHA-256 [^s01][^s05][^s09]. The Shopping Agent now builds the two SD-JWTs:

```python
# 3) Build the Checkout Mandate as an SD-JWT
from ap2.sdk.generated.checkout_mandate import CheckoutMandate
from ap2.sdk.generated.payment_mandate import PaymentMandate
from ap2.sdk.mandate import MandateClient

checkout_mandate = CheckoutMandate(
    vct="mandate.checkout.1",
    checkout_jwt=checkout_data["checkout_jwt"],
    checkout_hash=checkout_data["checkout_hash"],
    iat=int(time.time()),
    exp=int(time.time()) + DEFAULT_MANDATE_TTL_SECONDS,  # 5–15 minutes
)

# 4) Build the Payment Mandate; the hash links the two
payment_mandate = PaymentMandate(
    vct="mandate.payment.1",
    transaction_id=checkout_data["checkout_hash"],   # ← link
    payee=DEMO_MERCHANT,
    payment_amount=Amount(currency="USD", amount=27999),  # $279.99
    payment_instrument=DEMO_PAYMENT_INSTRUMENT,            # e.g. card •••4242
)

# 5) Trusted Surface signs both Mandates with user_sk
mandate_client = MandateClient(signing_key=jwk_key)
checkout_sd_jwt = mandate_client.sign(checkout_mandate)
payment_sd_jwt  = mandate_client.sign(payment_mandate)

# 6) Send the Payment Mandate to the Credential Provider → receive a scoped token
token = await credentials_provider_client.exchange(payment_sd_jwt)

# 7) Send the token and the Checkout Mandate to the Merchant → initiate payment
receipt = await merchant_agent_client.finalize(
    token=token,
    checkout_sd_jwt=checkout_sd_jwt,
)
# The Merchant Payment Processor verifies that the Payment Mandate's
# transaction_id equals the hash of the Checkout JWT it is processing.
```

Steps 6–7 are exactly where the Mandate model earns its keep: the merchant verifies in deterministic code that the closed Checkout Mandate carries a valid user/agent signature, and the MPP verifies that the Payment Mandate is bound to the same Checkout via the hash [^s01][^s06]. The Human-Not-Present flow is structurally the same, except the user signature lands on the *open* Mandate up front and the agent layers its own signature to produce the *closed* Mandate later [^s06].

### Crypto rail — the x402 scenario

`code/samples/python/scenarios/a2a/human-not-present/x402/README.md` demonstrates a crypto payment under Human-Not-Present [^s08]. The trigger is a merchant-emitted price-drop event; once the price matches the user's intent, the Shopping Agent autonomously completes the purchase, skipping interactive steps like OTP [^s08]. The Merchant Agent advertises x402 support through its agent card and the CartMandate, and the payment runs on x402-compatible rails such as stablecoins [^s08]. Importantly, the *Mandate structure is identical* — what changes between the card rail and the crypto rail is only the PSP and Credential Provider implementation.

## Analysis — comparisons and tradeoffs

**AP2 vs A2A alone.** A2A standardises *messages*. There is no built-in way for a Shopping Agent's "please pay for this cart" message to demonstrate that the cart was actually approved by the user. AP2 stacks a *signed authorization* layer on top, turning non-deterministic LLM output into a deterministically verifiable authority [^s01][^s03].

**AP2 vs MCP.** MCP is model/tool context; AP2 is payment authority. They are orthogonal — Google's own announcement says they sit alongside each other [^s03][^s10]. The repo ships MCP variants (`merchant_agent_mcp`, `credentials_provider_mcp`, …) so the AP2 flow runs unchanged on MCP transport [^s02].

**AP2 vs Coinbase x402 alone.** x402 is an HTTP-402-based machine-to-machine payment protocol; it does not by itself answer *who has authority to pay*. AP2 uses x402 as a *rail* and stacks the Mandate authority layer on top [^s03][^s08].

**AP2 vs Mastercard Agent Pay.** Mastercard runs its own agent-pay effort, but the v0.2 Verifiable Intent work was co-developed with Mastercard and donated jointly to FIDO [^s12]. Rather than head-on competition, Mastercard chose to fold part of its work into AP2's Verifiable Intent _(unverified — single source: NoHacks coverage)_.

**Implication of the FIDO donation.** A standard owned by a single company is hard for merchants and issuers to adopt. Donating to FIDO accepts a slower iteration cadence in exchange for multi-stakeholder governance [^s12].

**Disagreement in independent writeups.** Vellum, Eco, and Medium describe AP2's Mandate / VC model consistently in spirit, but some still use the v0.1 "Intent / Cart / Payment" naming and others use the v0.2 "Checkout / Payment" naming [^s10][^s11][^s13]. Since both models live in the same repo, the right move is to name the version explicitly rather than pick a winner.

## Discussion

The single sentence "AP2 assumes that … the Agent itself is a potential attacker" compresses the entire security model into one assumption [^s01]. From it follow (1) the requirement that the Trusted Surface be **non-agentic**, (2) the requirement that every verification step runs in **deterministic code**, and (3) the ECDSA requirement on the Checkout JWT to support a safe hash-based linking primitive [^s01]. The structure is honest about an uncomfortable truth — *the agent itself* can never be the root of trust; trust has to come from a user signature or a separate non-agentic surface.

Open areas: (1) the dispute / chargeback flow is described conceptually ("Mandates can be used as evidence at the time of dispute") but is not normatively specified; (2) under the Trusted Agent Provider model, *how* a provider earns and audits its reputation is undefined; (3) no migration tooling between the v0.1 SDK models and the v0.2 SD-JWT schemas is visible in the repo [^s01][^s07].

For the ecosystem, AP2's biggest near-term contribution is that it pins down the *shape* of payment-authority objects. Once card networks and PSPs agree on what to verify, downstream infrastructure — risk models, insurance, certification — can attach to the same surface [^s03][^s12].

## Limitations

Not covered here: (1) third-party audit findings for the AP2 SDK; (2) automated v0.1 → v0.2 migration (no such tool exists today); (3) the final form Verifiable Intent will take inside FIDO governance; (4) card-network-specific token issuance and scoping policy; (5) device-OS-level integration that binds passkeys/biometrics to the Trusted Surface. The "60+ partners" figure and most adoption claims are vendor-stated and were not independently verified.

## Abstract

AP2 is a payment-authority standard that injects *user- or agent-signed Mandates*, carried as W3C Verifiable Credentials and serialised as SD-JWTs, into every step of an agent-initiated payment. Five roles (Shopping Agent, Credential Provider, Merchant, Merchant Payment Processor, Trusted Surface) divide responsibility; Shopping Agent is intrinsically agentic and Trusted Surface MUST be non-agentic, with all verification done in deterministic code. The v0.1 SDK shipped with three Mandate types (Intent / Cart / Payment) as Pydantic models, but the April 2026 v0.2 spec consolidates these into Checkout Mandate + Payment Mandate carried as SD-JWTs with a `vct` Verifiable-Credential-Type claim, permanently bound by the hash of the merchant's ECDSA-signed Checkout JWT. Human-Present flows have the user sign closed Mandates at payment time; Human-Not-Present flows have the user sign open Mandates with constraints in advance, with the agent later layering its own signature. The protocol is rail-agnostic — cards, real-time bank transfer, stablecoins, and the A2A x402 extension — and was donated to the FIDO Alliance on 2026-04-28. The reference repo (`google-agentic-commerce/AP2`, Apache-2.0) ships Python, Go, and Android samples plus an SD-JWT-based Python SDK, so the example code in this report is structured as a runnable sketch of the end-to-end flow.
