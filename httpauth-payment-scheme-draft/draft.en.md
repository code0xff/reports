# Analyzing draft-httpauth-payment-00: The "Payment" HTTP Authentication Scheme

## Abstract

`draft-httpauth-payment-00`, "The 'Payment' HTTP Authentication Scheme," is an Internet-Draft authored by B. Ryan, J. Moxey, T. Meagher (Tempo Labs) and J. Weinstein, S. Kaliski (Stripe), dated 2026-06-03 (expiring 2026-12-05), with an *intended* status of Standards Track.[^s01] It is the **core** of Tempo's **Machine Payments Protocol (MPP)** — a payment-method-agnostic authentication scheme that extends HTTP Authentication (RFC 9110) to give meaning to the long-reserved-but-undefined **HTTP 402 "Payment Required"** status code.[^s01][^s02] It is challenge-response: the server challenges with `402` + `WWW-Authenticate: Payment` (id, realm, method, intent, request, …), the client submits base64url JSON `{challenge, source, payload}` via `Authorization: Payment`, and the server verifies/settles and returns the resource with a `Payment-Receipt`.[^s01] Methods and intents are registered in an **IANA "Specification Required" registry**, extensible without changing the core, and the security model centers on **HMAC-SHA256 challenge binding, single-use proofs, idempotency, and mandatory TLS**.[^s01] However, the IETF datatracker classifies this document as an **unadopted individual draft ("not endorsed by the IETF … no formal standing")**, and the datatracker version/date diverges from the paymentauth.org version/date.[^s02][^s01] Ecosystem-wise, it ships two production methods (Tempo = stablecoin, Stripe = fiat), shows Cloudflare/Stripe adoption signals, and is reported backward-compatible with x402.[^s05][^s04][^s06]

## 1. Introduction

This report's task is to read and analyze the document `https://paymentauth.org/draft-httpauth-payment-00.txt`. Metadata: title "The 'Payment' HTTP Authentication Scheme," authors B. Ryan, J. Moxey, T. Meagher (Tempo Labs) and J. Weinstein, S. Kaliski (Stripe), status Internet-Draft (intended Standards Track), dated 2026-06-03, expiring 2026-12-05.[^s01] The problem is clear — HTTP 402 was long *reserved* with undefined semantics, and this scheme extends RFC 9110 HTTP Authentication to give 402 a standard meaning (fulfill a payment challenge before access).[^s01][^s02] This document is the *parent core* of the EVM charge intent (`draft-evm-charge-00`) analyzed previously; here it is read directly, in the order protocol overview → scheme mechanics → registry/negotiation → security model → IETF standing/ecosystem. Evidence is the target draft (primary) plus the IETF datatracker and ecosystem docs/independent commentary.[^s01][^s02][^s04][^s05][^s06]

## 2. Protocol overview and the place of 402

The request flow is simple — the client sends a normal request, the server signals payment requirements with 402, the client retries with proof of payment, and the server verifies and returns the resource.[^s01][^s06] The key norm is that "servers MUST return 402 with a `WWW-Authenticate: Payment` header when payment is required **or when a payment credential fails validation**."[^s01]

This reveals a distinction from ordinary HTTP authentication: usual schemes use 401 Unauthorized for *failed* credentials, but this scheme uses **402 consistently** for all payment-related challenges, including verification failure.[^s01][^s06] So 402 becomes the dedicated status code for the "payment authentication" domain, and the document separately specifies when to return/not return 402 (§4.4) and interaction with other authentication schemes (§4.4.3).[^s01]

## 3. Challenge, credential, and receipt

**Challenge (`WWW-Authenticate: Payment`).** Required parameters are `id` (challenge identifier, bound to the parameters), `realm` (RFC 9110 protection space), `method` (payment method identifier), `intent` (IANA-registered intent), and `request` (base64url, JCS-serialized JSON of method-specific data). Optional parameters are `expires` (RFC 3339), `digest` (RFC 9530 content digest), `description` (display-only), and `opaque` (server correlation data, returned unchanged).[^s01]

**Credential (`Authorization: Payment`).** The client submits base64url JSON `{challenge (echoed parameters), source (optional payer identifier), payload (method-specific proof)}`.[^s01]

**Receipt (`Payment-Receipt`).** On success the server SHOULD include a `Payment-Receipt` header carrying `status ("success"), method, timestamp (RFC 3339), reference (method-specific)`.[^s01] A key safeguard: `description` is display-only and must not be used for payment verification, and the client MUST verify the amount *before* authorizing payment.[^s01]

## 4. The method/intent registry and negotiation

The scheme's extensibility comes from **registry separation**. `method` identifiers are lowercase ASCII (a–z) and `intent` identifiers are alphanumeric + hyphens, both registered under IANA **"Specification Required"** policy (RFC 8126). A method spec must define request schema, payload schema, verification procedure, and settlement procedure — so a new method (EVM, Solana, Card, Stripe, …) is added as a separate spec without touching the core.[^s01]

**Negotiation.** A server may return **multiple `WWW-Authenticate: Payment` headers** offering different methods/intents, and the client may declare q-weighted preferences via an `Accept-Payment` header (e.g., `Accept-Payment: tempo/charge, solana/*;q=0.6, stripe/charge;q=0.2`). The server SHOULD filter and order accordingly.[^s01] This content-negotiation pattern enables MPP's multi-rail behavior where "the client picks whichever method it supports."[^s01][^s05]

## 5. Security model

The security section (§11) is layered, from threat model to caching.[^s01]

**Challenge binding (HMAC-SHA256).** For stateless validation, the server computes the challenge `id` as an HMAC-SHA256 (under a server secret) over a string of seven fixed slots: `realm | method | intent | request (base64url) | expires | digest | opaque`. This blocks request-integrity attacks where a client modifies payment details (amount, recipient).[^s01]

**Replay and concurrency.** "Payment methods used with this specification MUST provide single-use proof semantics," and "servers MUST ensure that concurrent requests with the same Payment credential result in at most one successful payment settlement."[^s01]

**Idempotency.** "Servers MUST NOT perform side effects (database writes, external API calls) for requests that have not been paid."[^s01]

**Transport, storage, caching.** It "REQUIRES TLS 1.2 or later for all Payment authentication flows," mandates that "servers and intermediaries MUST NOT log Payment credentials or include them in error messages, debugging output, or analytics," and requires `Cache-Control: no-store` on 402 responses.[^s01] Error responses are standardized via RFC 9457 Problem Details, and verification failures, expired challenges, and malformed credentials all return a fresh 402 challenge.[^s01]

## 6. IETF standing, ecosystem, and the x402 relationship

**Standing (important).** The body *intends* Standards Track, but the IETF datatracker classifies this document (`draft-ryan-httpauth-payment`) as an **unadopted individual draft**, stating it is "not endorsed by the IETF and has no formal standing in the IETF standards process."[^s02][^s01] So at present this is not "a standard" but "an individual proposal to become one." Moreover, the datatracker version/date (`draft-ryan-httpauth-payment-01`, updated 2026-03-17, expiring 2026-09-19) **diverges** from the paymentauth.org version/date (`draft-httpauth-payment-00`, dated 2026-06-03, expiring 2026-12-05) — the site distribution and the IETF submission use different naming/date schemes, and this report treats them as the same lineage without asserting identity.[^s01][^s02] _(metadata conflict between the two sources)_

**Ecosystem.** MPP ships two production methods — Tempo (stablecoin) and Stripe (cards, wallets, and other fiat) — and when a server advertises both, the client picks the one it supports.[^s05] An independent explainer summarizes that MPP separates the core scheme from per-method specs (Tempo, Stripe, Solana, Card) and intents (charge, session).[^s08] Adoption signals include Cloudflare Agents' MPP documentation and Stripe's MPP payments documentation.[^s04][^s07] The spec repository is GitHub `tempoxyz/mpp-specs`, described as "specifications for the Machine Payments Protocol — powered by the 'Payment' HTTP authentication scheme."[^s03]

**Relationship to x402.** Independent comparison holds that both protocols use 402 but differ in philosophy — x402 (Coinbase) is permissionless with zero protocol fees, while MPP features production fiat (Stripe), native streaming sessions, removal of the facilitator concept, and IETF submission.[^s06] The key point: "**MPP is backwards compatible with x402**, as the core x402 'exact' payment flow maps directly onto MPP's charge intent, so MPP clients can consume existing x402 services."[^s06] _(an external assessment — not a normative guarantee in the core document.)_ MPP's use of 402 even for failed credentials is also noted as a design choice distinct from schemes that use 401.[^s06]

## 7. Limitations

- **v00, unadopted.** Despite the body's Standards Track intent, the IETF datatracker shows an unadopted individual draft ("not endorsed by the IETF … no formal standing"); fields and procedures may change.[^s02][^s01]
- **Version/date mismatch.** The datatracker (`-ryan-…-01`, 2026-03-17) and the site (`-httpauth-…-00`, 2026-06-03) differ in number and date; identity of the two is not asserted.[^s01][^s02]
- **Single-document dependence.** Content statements rest on that document (s01) as the sole primary source; reproduced faithfully but not validated by independent implementation, audit, or peer review, and "the document specifies" ≠ "safe/adopted."[^s01]
- **x402 compatibility / adoption are external.** The x402 backward-compatibility and Cloudflare/Stripe adoption come from external docs/commentary, not a normative guarantee of the core document nor proof of broad production use.[^s04][^s06][^s07]
- **Conflict of interest.** The authors are from Tempo Labs and Stripe, so the standards proposal is tied to those firms' commercial products — an independence caveat, not a technical defect.[^s01]
