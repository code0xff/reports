# VISA Trusted Agent Protocol: How AI Agents Get Paid Through Visa

## Abstract

Visa's **Trusted Agent Protocol (TAP)** is a card-network-issued specification that lets AI agents prove, on every HTTP request, that they are running on a Visa-vetted runtime, that a known consumer stands behind the request, and (optionally) that a payment credential is attached. TAP rides on the IETF's RFC 9421 HTTP Message Signatures standard, distributes agent public keys through a JWKS endpoint at `https://mcp.visa.com/.well-known/jwks`, and decomposes each request into three logical building blocks — *Agent Intent*, *Consumer Recognition*, and *Payment Information* — that map to dedicated HTTP headers and JSON body objects. The protocol does not by itself authorize a payment; the resulting transaction still rides Visa's existing authorization/clearing/settlement rails and complements other agentic-commerce protocols (ACP, MPP, AP2, x402, UCP) rather than replacing them[^s01][^s03][^s11].

## 1. Introduction

In October 2025 Visa announced TAP as the identity envelope for what it brands **Visa Intelligent Commerce** — an umbrella program that includes APIs, a "Trusted Agent Registry", and the merchant-facing "Intelligent Commerce Connect" on-ramp[^s02][^s05][^s15]. The launch was justified by a 4,700% surge in AI-driven traffic to U.S. retail sites over the prior year, cited from Adobe Data Insights, August 2025 _(vendor-stated)_[^s03]. Merchants had been responding to that surge by indiscriminately blocking automated clients, which simultaneously broke legitimate agentic checkout flows. Visa's framing is explicit: rather than mandate a new payment rail, TAP issues "verifiable, time-bound signatures that cannot be replayed", letting merchants choose whether to engage with agent traffic[^s02].

Independent observers have placed TAP inside a wider "protocol wars" of agentic commerce — alongside OpenAI/Stripe's Agentic Commerce Protocol (ACP)[^s16], Mastercard's Agent Pay / Agentic Tokens, Google's AP2, Stripe's Machine Payments Protocol (MPP), and Coinbase's x402[^s09][^s11][^s12][^s13]. The consensus from third-party reads is that these protocols operate at different layers of the stack — identity, authorization, checkout, settlement — and are largely complementary[^s11].

## 2. Background: from card-on-file to agent-on-file

Card-not-present authentication has, for two decades, leaned on 3-D Secure, EMV tokenization, and network tokens to defang stolen-PAN attacks. None of these primitives say anything about the *software* that initiates the call — they assume a browser or a known merchant SDK. Agentic commerce breaks that assumption: the originator may now be an autonomous LLM-driven runtime acting on behalf of a logged-in consumer.

Rather than invent a new credential, Visa borrowed the trust substrate the broader web is converging on: **HTTP Message Signatures (RFC 9421)**. Cloudflare framed its own deployment as "Web Bot Auth", arguing that "HTTP Message Signatures is a standard that defines the cryptographic authentication of a request sender" and that key directories beat IP allow-lists for scalable bot identity[^s07]. The IETF draft `draft-meunier-web-bot-auth-architecture-05` formalises the architecture as "enabling automated clients to cryptographically sign outbound requests, allowing HTTP servers to verify their identity with confidence" (active Internet-Draft, expires 3 September 2026)[^s08]. TAP plugs Visa's commerce-specific data (consumer hint, payment container) into that signature envelope[^s01][^s07].

Visa and Cloudflare announced TAP as co-developed and committed to aligning the spec with IETF, the OpenID Foundation, and EMVCo[^s03]. That alignment is the strongest non-Visa signal that TAP is meant to live inside web standards rather than as a Visa-only header set _(early signal)_[^s03][^s07].

## 3. Protocol architecture

### 3.1 The three building blocks

Visa decomposes a TAP request into three components[^s01][^s09]:

1. **Agent Intent** — an HTTP-level cryptographic proof that the request originates from a Visa-recognised agent runtime and what the request is for. Independent reporting reads this as the agent signalling "I'm a legit Visa-trusted agent here with intent to buy"[^s12].
2. **Consumer Recognition** — a JSON body object (`agenticConsumer`) carrying a Visa-issued, JWS-signed `idToken` plus `contextualData` (device, IP, country, postal code)[^s01].
3. **Payment Information** — an optional JSON body object (`agenticPaymentContainer`) carrying a hashed credential, an encrypted payment payload, card metadata, or an HTTP-402 `browsingIOU`[^s01].

### 3.2 Agent Intent on the wire

Agent Intent is transported as two HTTP headers defined by RFC 9421:

```
Signature-Input: sig2=("@authority" "@path");
                   created=...; expires=...;
                   keyid="..."; alg="..."; nonce="...";
                   tag="agent-payer-auth"
Signature: sig2=:<base64 signature>:
```

The covered components include `@authority` and `@path`. The metadata parameters carry `created` and `expires` (whose delta is capped at an 8-minute validity window), `keyid` (resolved against Visa's JWKS), `alg` (the chosen signing algorithm), a `nonce` for replay protection, and a `tag` of either `agent-browser-auth` (catalogue browsing) or `agent-payer-auth` (checkout)[^s01]. Supported signing algorithms are `Ed25519`, `PS256` (RSA-PSS, preferred over RS256), and `ES256`[^s01]. The Visa reference implementation in `github.com/visa/trusted-agent-protocol` uses Ed25519 keypairs and ships a CDN-proxy, agent-registry, merchant-frontend, and merchant-backend that verify these headers end-to-end[^s06].

### 3.3 Public-key distribution

Merchant verifiers resolve the `keyid` in the signature by calling:

```
GET https://mcp.visa.com/.well-known/jwks?keyID={keyid}
```

The response is a JSON Web Key object (RFC 7517-style: `kty`, `kid`, `use`, `alg`, plus algorithm-specific material such as `n`/`e` for RSA)[^s01]. This is structurally identical to the Web Bot Auth proposal's key-directory model, which Cloudflare describes as a `Signature-Agent` header pointing to "where the origin can find the public keys the agent used when signing the request"[^s07][^s08].

### 3.4 Consumer Recognition

`agenticConsumer` is a JSON object placed inside the request body. Its fields, lifted verbatim from the Visa specification[^s01]:

- `nonce` — must match the `nonce` parameter inside `Signature-Input`.
- `idToken` — a JWT/JWS signed by Visa whose claims include `iss`, `sub`, `aud`, `exp`, `iat`, plus obfuscated `phone_number` and `email`, with `phone_number_mask` and `email_mask` variants intended for UI rendering.
- `contextualData` — device identifiers, country code (ISO 3166-1 alpha-2), postal code, IP address.
- `kid`, `alg`, `signature` — JWS metadata that lets a merchant verify the token independently.

The `sub` claim is described as a "locally unique consumer identifier within Visa"[^s01]. Merchants are expected to hold their own mapping from a hashed `phone_number`/`email` to a local customer record, so that an existing relationship can be recognised without exposing PII to the agent runtime[^s01].

### 3.5 Payment Information

`agenticPaymentContainer` is the optional payment envelope[^s01]. It can carry:

- `paymentCredentialsHash` — the SHA hash of `account || expiration || CVV`, used as a fingerprint without disclosing the PAN to the agent.
- `payload` — an encrypted blob, sealed to the merchant's public key, containing the network token, expiry, cardholder name, and shipping/billing addresses.
- `cardMetadata` — non-secret rendering hints (`lastFour`, `paymentAccountReference`, card-art URLs).
- `browsingIOU` — for HTTP `402 Payment Required` flows: an `invoiceId`, `amount`, `CAID`, `AID`, `sequenceCounter`, `kid`, `alg`, and merchant-side `signature` letting the merchant counter-sign a price quote that the agent can later present at checkout[^s01].

The container is deliberately schema-flexible — Visa's spec keeps both "form-keying a web checkout" and "API-style encrypted payload delivery" as supported behaviours, so merchants can adopt TAP without re-platforming their checkout[^s01][^s02].

## 4. Transaction lifecycle

A TAP-aware checkout proceeds in roughly six steps[^s01][^s07]:

1. **Sign.** The agent runtime constructs the RFC 9421 signature base over `@authority`, `@path`, `created`, `expires`, `keyid`, `alg`, `nonce`, and `tag`, signs with its private key (Ed25519 / PS256 / ES256), and attaches `Signature-Input` and `Signature` headers.
2. **Send.** The agent issues the HTTP request (browsing or checkout) with the JSON body containing `agenticConsumer` and, if applicable, `agenticPaymentContainer`.
3. **Resolve key.** The merchant extracts `keyid` and calls `GET https://mcp.visa.com/.well-known/jwks?keyID={id}`, cacheing the JWK locally.
4. **Verify.** The merchant validates the minimum required parameters in `Signature-Input`, checks that `created < now < expires` (≤ 8 minutes), rejects duplicate nonces within the window, validates the `tag` parameter, reconstructs the canonical signature base string, and verifies the signature with an RFC 9421 library[^s01][^s17].
5. **Inspect consumer & payment.** The merchant unwraps `agenticConsumer.idToken`, validates the JWS using the JWKS, hashes the obfuscated `phone_number` / `email` against its CRM, and decrypts `agenticPaymentContainer.payload` against its private key (or hashes a card-on-file via `paymentCredentialsHash`).
6. **Authorize.** With agent and consumer cryptographically attested, the merchant runs the actual authorization through its existing Visa rails — network token, 3-D Secure step-up if risk demands it, then the standard auth/clearing/settlement pipeline. TAP itself never *authorizes* the payment; it only attests the originator[^s01][^s12].

The `browsingIOU` object is the cleanest example of TAP's HTTP-native design: a merchant responds to a browse request with an HTTP `402 Payment Required`, embeds an IOU signed with the merchant's own key, and the agent later presents that IOU back at checkout so the merchant can match the quote it issued to the credentials the consumer ultimately uses[^s01].

## 5. Ecosystem and adoption

Visa published TAP as an "ecosystem-led framework", citing collaboration with Adyen, Ant International, Checkout.com, Cloudflare, Coinbase, CyberSource, Elavon, Fiserv, Microsoft, Nuvei, Shopify, Stripe, and Worldpay at launch[^s03]. The October 14, 2025 press release also commits Visa to standards-body alignment with IETF, the OpenID Foundation, and EMVCo, and to interoperability with the Agentic Commerce Protocol and x402 specifically[^s03].

On December 18, 2025 Visa reported the first end-to-end secure agentic transactions — citing agent enablers (Skyfire, Nekuda, PayOS, Ramp), merchant and platform partners (Consumer Reports, Gensmo, Henry Labs, BeyondStyle, Bose, Fabrique, Honeylove, Jomashop, Rye, Price.com), and Akamai for security — with 100+ ecosystem partners and 30+ sandbox participants[^s04]. The same release set the 2026 holiday season as the public target for "millions of consumers" using AI agents to complete purchases, with pilots expanding into Asia Pacific and Europe in early 2026 _(vendor-stated)_[^s04].

The merchant-side on-ramp is **Intelligent Commerce Connect**, unveiled April 8, 2026, which Visa describes as a "network, protocol, and token vault-agnostic 'on ramp'" that accepts payments initiated via Trusted Agent Protocol, Stripe's MPP, OpenAI/Stripe's ACP, and Google's UCP through a single integration[^s15]. Independent comparisons read Connect as Visa's bet that no single protocol will win, and that merchants will need a switchboard[^s11][^s13].

## 6. Analysis: trust model and limits

### 6.1 What TAP authenticates — and what it does not

TAP authenticates two facts on each request: (a) the request was signed by a private key bound to a Visa-recognised agent runtime (Agent Intent), and (b) Visa has issued a JWS-signed ID Token asserting a consumer identity that maps to the merchant's records (Consumer Recognition)[^s01]. It does **not** issue a payment authorization: a successful TAP verification is a precondition that lets the merchant choose to engage; the actual transaction still rides Visa's existing authorization/clearing/settlement rails, optionally with 3-D Secure step-up as risk demands[^s01][^s05]. Independent commentary echoes this scoping: "TAP's centerpiece is how agents present credentials to merchants" — the *credential layer*, not the *authorization layer*[^s12].

### 6.2 Where TAP sits in the agentic-commerce stack

Crossmint's comparison of agentic-payment protocols slots ACP at the checkout layer, AP2 at the authorization layer, x402 at the settlement layer, and MPP at the budget/session layer, and notes explicitly that they are "more complementary than competitive… an agent system might use AP2 for authorization, ACP for e-commerce checkout, and x402 or MPP for machine-to-machine payments"[^s11]. TAP slots underneath all of those as an identity envelope on the HTTP transport. Simon Taylor's read in Fintech Brainfood is consistent: "Card-rail agentic payments use Visa, Mastercard, and Amex networks plus existing acquirer relationships, layered with agent-specific cryptography: ephemeral Shared Payment Tokens, AP2 mandates, and signed identity headers"[^s13].

Mastercard's parallel framework, "Agent Pay", is described by Mastercard as "a framework for letting the network verify what an AI agent is buying, on whose intent, and within what limits"[^s14]. Compared with TAP's identity-focused scope, Mastercard's design centres on *intent mandates* and *agentic tokens* — closer to AP2's authorization layer than to TAP's request-signature layer — which makes TAP and Agent Pay differently positioned even if they overlap on the same use case[^s09][^s14]. Digital Commerce 360's same-day comparison frames the distinction as Visa emphasising "seamless credential transmission" and Mastercard emphasising "pre-transaction agent authentication and scale"[^s09].

### 6.3 Honest gaps

Three operational areas remain under-specified in the public spec:

- **Revocation.** Key lifecycle relies on the JWKS endpoint and the `expires` timestamp; no per-agent revocation message or status endpoint is documented in the spec[^s01]. Oscilar's independent critique frames this more broadly: "Cryptographic protocols like TAP are necessary but not sufficient — they require complementary fraud prevention"[^s10]. _(interpretive — single independent source)_
- **Registry governance.** TAP's `keyid` resolution currently points at a Visa-operated JWKS at `https://mcp.visa.com/.well-known/jwks`[^s01]. Visa has committed to aligning the spec with IETF, OpenID Foundation, and EMVCo[^s03], but no joint-governance arrangement (who can publish keys, how disputes are arbitrated) has been published _(early signal)_[^s03].
- **Liability assignment.** No public documentation describes how chargebacks behave when a TAP-signed agent transaction is later disputed. Card-rail liability flows from issuer/acquirer rules, not from the protocol layer, but the *evidentiary* role of a TAP signature in a dispute is unspecified.
- **Privacy posture.** Independent reporting (Sam Boboev / Finextra; primary URL returned `403` to scripted fetch, so the framing is paraphrased from web-search excerpts) contrasts Mastercard's Verifiable Intent — built around "selective disclosure commitments inside a single credential chain" — with TAP's obfuscation-plus-payload-partitioning approach, which leans on merchants holding mapping tables for hashed identity fields. The point lands as a design-choice trade-off, not a defect, but readers should be aware that competing protocols are taking a more privacy-preserving stance on consumer identity disclosure. _(interpretive — primary source not retrievable; treat as early signal)_

## 7. Limitations

- **In-development status.** Visa labels TAP as "in the process of development and deployment", and the dominant body of public detail is vendor-stated[^s02][^s05]. The IETF Web Bot Auth track on which TAP rests is an active Internet-Draft (`-05`, expires 3 September 2026), not a published RFC[^s08]. Cloudflare — co-developer of the protocol — confirms the same direction of travel and explicitly notes that TAP and Mastercard's Agent Pay "will continue to evolve"[^s17].
- **No independent security analysis.** No peer-reviewed cryptographic review of TAP exists at the time of writing; the strongest independent coverage ([s10], [s11], [s13]) reads protocol-level documents rather than auditing them.
- **No published interoperability conformance suite.** Visa has announced co-development with Cloudflare[^s03] and interop with ACP/MPP/UCP/x402 via Intelligent Commerce Connect[^s15], but no public conformance corpus has been released.
- **Pilot-stage adoption signals.** Bank participation listed in earlier Visa Intelligent Commerce pilots (DBS, OCBC, UOB, HSBC Singapore, Standard Chartered, Bank of China Singapore) is reported via Visa's press releases and aggregated third-party recaps; we did not find independent confirmation from each named bank _(vendor-stated)_[^s04].

The agentic-commerce stack as of mid-2026 looks settled enough that TAP, ACP, AP2, MPP, x402, and UCP can be reasoned about as a layered architecture — but the integrations between them, the registry governance, and the liability model are all early-signal. A future revision of this report should re-check the IETF Web Bot Auth status, Visa's public revocation/governance documentation, and any independent cryptographic review that emerges.
