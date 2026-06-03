# Claims — MPP (Machine Payments Protocol)

## Introduction
- [x] c01: MPP is an open protocol for machine-to-machine payments that standardizes the HTTP 402 "Payment Required" status code with an extensible framework working across any payment network.
  - kind: factual
  - needs: protocol overview + an independent description
- [x] c02: MPP targets programmatic consumption because conventional human checkout flows (browser automation, visual verification, rich checkout) are structural headwinds for agents.
  - kind: interpretive
  - needs: overview statement of motivation

## Background — HTTP 402 & the Payment scheme
- [x] c03: MPP is co-developed by Tempo (Tempo Labs) and Stripe, with SDKs maintained by Tempo Labs and Wevm.
  - kind: factual
  - needs: 2 sources (mpp.dev + Stripe/independent)
- [x] c04: The core of MPP is the "Payment" HTTP authentication scheme defined in IETF Internet-Draft draft-ryan-httpauth-payment-01, authored by Brendan Ryan, Jake Moxey, Tom Meagher (Tempo Labs), Jeff Weinstein, Steve Kaliski (Stripe).
  - kind: factual
  - needs: IETF datatracker page
- [x] c05: The draft is an active Internet-Draft with no formal IETF standing, expiring 2026-09-19, and the spec is licensed CC0 1.0 (public domain) with tooling under Apache-2.0/MIT.
  - kind: factual
  - needs: IETF page + GitHub repo
- [x] c06: The specifications live in the open repo github.com/tempoxyz/mpp-specs, modularized into Core, Intents, Methods, and Extensions.
  - kind: technical
  - needs: repo README

## Core protocol — Challenge · Credential · Receipt
- [x] c07: A server signals payment is required by returning HTTP 402 with a `WWW-Authenticate: Payment` header whose challenge carries id, realm, method, intent, and a base64url-JCS-encoded request.
  - kind: technical
  - needs: http-402 + challenges docs
- [x] c08: The challenge `id` is cryptographically bound (HMAC) to the challenge parameters (realm, method, intent, request, expires, digest, opaque) to prevent reuse with modified terms.
  - kind: technical
  - needs: challenges + security docs
- [x] c09: The client responds with `Authorization: Payment <base64url credential>` containing the echoed challenge, a source identity (address/DID/account), and a method-specific payment payload.
  - kind: technical
  - needs: credentials doc
- [x] c10: Each credential is valid for exactly one request and servers must reject replayed credentials.
  - kind: technical
  - needs: credentials/security docs
- [x] c11: On success the server may return an optional `Payment-Receipt` header carrying a base64url JSON receipt (challengeId, method, reference, settlement, status, timestamp); clients do not need it for correct operation.
  - kind: technical
  - needs: receipts doc
- [x] c12: MPP binds the same Challenge/Credential/Receipt model to three transports — HTTP headers, MCP/JSON-RPC (error -32042 + `_meta` keys), and WebSocket (in-band voucher messages).
  - kind: technical
  - needs: transports docs

## Intents & payment methods
- [x] c13: MPP defines three core intents — charge (one-time), session (pay-as-you-go via payment channels), and subscription (recurring fixed payments).
  - kind: factual
  - needs: overview + intents docs
- [x] c14: The charge intent settles a fixed amount before returning the response, with credential payloads of type transaction (pull), hash (push), or proof (zero-amount identity).
  - kind: technical
  - needs: charge + credentials docs
- [x] c15: The session intent uses an escrow deposit plus cumulative EIP-712 signed vouchers verified via ecrecover with no RPC/DB lookup, enabling sub-100ms latency and sub-cent micropayments that batch-settle on close.
  - kind: technical
  - needs: independent explainer + websocket/tempo docs
- [x] c16: The subscription intent authorizes a fixed amount once and lets the server collect at most one charge per billing period (periodCount × periodUnit of day/week/month); reuse is application-controlled, not keyed only on subscriptionId.
  - kind: technical
  - needs: subscription doc
- [x] c17: MPP ships multiple payment methods (Tempo, EVM, Stripe, Card, Lightning, Solana, Stellar, Monad, RedotPay, Custom), of which only Tempo, Lightning, and Stellar advertise session/channel support while most support charge only.
  - kind: technical
  - needs: payment-methods doc
- [x] c18: Tempo is the canonical rail using TIP-20 stablecoin transfers with ~500ms finality and optional `feePayer` gas sponsorship so clients sign without holding gas tokens.
  - kind: technical
  - needs: tempo method doc

## Advanced capabilities
- [x] c19: Clients can discover payment terms ahead of time via an OpenAPI 3.1 document using `x-payment-info` (offers) and `x-service-info` extensions, while runtime 402 challenges remain authoritative.
  - kind: technical
  - needs: discovery doc
- [x] c20: MPP supports identity/access-control without moving funds by issuing zero-amount challenges that require a `proof` credential signed over the challenge id, verified against the source DID.
  - kind: technical
  - needs: identity doc
- [x] c21: Refunds in charge flows are out-of-protocol server-initiated transfers to the credential source, whereas session deposits that go unclaimed return to the client automatically (with client-side requestClose/withdraw fallback).
  - kind: technical
  - needs: refunds doc
- [x] c22: MPP's security model centers on protecting `MPP_SECRET_KEY` (its compromise lets an attacker mint valid-looking challenges), mandates a `digest` binding for mutating requests, a shared atomic replay store across instances, and never logging credential/receipt headers.
  - kind: technical
  - needs: security doc

## Analysis — positioning, maturity, adoption
- [x] c23: MPP is positioned as compatible with x402 — MPP clients can consume existing x402 services without modification — while differing in that MPP sessions are payment-based (escrow + streamed vouchers + batch settlement) versus x402/SIWx authentication-based (prove wallet ownership, receive a JWT).
  - kind: interpretive
  - needs: cloudflare + independent explainer
- [x] c24: MPP has early third-party adoption (Stripe Shared Payment Tokens, Cloudflare Agents with SDKs in TS/Python/Rust, Parallel) but negligible commercial volume as of early 2026 (~31,100 tx / ~$3,730, flagged unverified).
  - kind: factual
  - needs: independent adopters + critical explainer
