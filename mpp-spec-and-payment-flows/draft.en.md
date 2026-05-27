# Tempo MPP Spec and Technical Structure — Intents and Per-Method Payment Flows

## Abstract

This report dissects Tempo and Stripe's **Machine Payments Protocol (MPP)** at the level of its specification rather than its marketing. The foundation is the IETF Internet-Draft "Payment" HTTP Authentication Scheme (`draft-ryan-httpauth-payment-01`, co-authored by Tempo Labs and Stripe)[^s01], on top of which sit (a) three **intents** — `charge`, `session`, `subscription`[^s04][^s05][^s06] — and (b) payment **methods** (Tempo, Stripe, Stellar, Solana, Lightning, Card) registered separately[^s03][^s08]. The core flow is a three-step **challenge → credential → receipt** cycle over HTTP 402: the server issues a `WWW-Authenticate: Payment` challenge, the client retries with an `Authorization: Payment` credential, and the server confirms settlement with a `Payment-Receipt`[^s01][^s04][^s12]. The report lays out, from primary sources, (1) the header grammar and status codes, (2) the fields and flows of the three intents, and (3) the per-method behaviour, quoting Stripe's `mppx` code and Stellar's Soroban-channel code to trace what actually crosses the wire.

## 1. Introduction — What MPP standardises

MPP standardises "an AI pays for something" inside a single HTTP request. mpp.dev's one-liner — "MPP (Machine Payments Protocol) is the open standard for machine-to-machine payments via HTTP 402"[^s03]. External coverage agrees — "Stripe and Tempo's Machine Payments Protocol (MPP) is an open HTTP-native standard for billing AI agents"[^s11]. Its foundation splits two ways.

- **core (payment-method agnostic)** — an HTTP authentication grammar independent of the payment rail. The IETF "Payment" scheme occupies this slot[^s01].
- **extensions (method-specific)** — per-rail specs for Tempo stablecoins, Stripe SPT, Stellar SEP-41, and so on. The `mpp-specs` repo phrases it as a "payment-method agnostic core alongside extensions for specific payment method flows"[^s02].

This two-layer split lets a third party (e.g. Visa) add a card-based method spec independently — the design decision this report treats as the most important one _(interpretive)_[^s01][^s02].

## 2. The "Payment" HTTP Authentication Scheme (draft)

### 2.1 Authors, governance, license

The base standard is IETF `draft-ryan-httpauth-payment-01`, authored by Tempo Labs' Brendan Ryan, Jake Moxey, and Tom Meagher, and Stripe's Jeff Weinstein and Steve Kaliski[^s01]. The spec text is CC0 1.0 (public domain) and the tooling is dual Apache-2.0/MIT, hosted at `tempoxyz/mpp-specs`[^s02].

### 2.2 The `WWW-Authenticate: Payment` grammar

The challenge a server sends to demand payment carries these parameters[^s01]:

| Param | Required | Meaning |
|---|---|---|
| `id` | ✓ | challenge identifier bound to the parameters |
| `realm` | ✓ | RFC 9110 protection space |
| `method` | ✓ | payment-method identifier (lowercase ASCII) |
| `intent` | ✓ | a registered payment-intent type |
| `request` | ✓ | method-specific data (JCS-serialised, base64url JSON) |
| `expires` | ✗ | RFC 3339 expiry |
| `digest` | ✗ | RFC 9530 content digest (binds the request body) |
| `description` | ✗ | human-readable purpose |
| `opaque` | ✗ | server correlation data (base64url JSON string map) |

The spec mandates "Unknown parameters MUST be ignored by clients"[^s01]. Critically, **a single response can carry multiple `WWW-Authenticate: Payment` lines** — the server offers Tempo and Stripe at once and the client picks one to pay[^s07].

### 2.3 The `Authorization: Payment` credential

After paying, the client's retry carries a base64url JSON credential with three fields[^s01]:

```json
{
  "challenge": { "id": "...", "realm": "...", "method": "...", "intent": "...", "request": "...", "expires": "...", "opaque": "...", "digest": "..." },
  "source": "did:key:...",
  "payload": { }
}
```

- `challenge` — echoes back the server's challenge.
- `source` — (optional) a W3C DID identifying the payment source.
- `payload` — method-specific proof (an EIP-712 signature for Tempo, an SPT for Stripe, etc.).

### 2.4 The `Payment-Receipt` header

A receipt is issued only on a 2xx response — "Receipts are only issued on successful payment responses (2xx status codes)"[^s01]. Its JSON carries `status`, `method`, `timestamp`, and `reference`[^s01].

### 2.5 Status codes and the problem registry

MPP deliberately separates three status codes — "402 = Payment barrier (initial challenge or retry needed); 401 = Authentication failure unrelated to payment; 403 = Payment succeeded but access denied by policy"[^s04]. Failures return RFC 9457 Problem Details (`application/problem+json`); the registry base is `https://paymentauth.org/problems/` and defines types such as `payment-required`, `payment-insufficient`, `payment-expired`, `verification-failed`, `method-unsupported`, `malformed-credential`, and `invalid-challenge`[^s01]. A malformed, expired, reused, or failed credential always returns a **402 with a fresh challenge attached**[^s01].

For security the spec mandates TLS 1.2+ ("Servers MUST NOT issue Payment challenges over unencrypted HTTP") and forbids logging credentials ("Servers and intermediaries MUST NOT log Payment credentials")[^s01].

### 2.6 The intent / method registries

Intents and methods are two separate registries. A method spec must define (1) an identifier (lowercase ASCII), (2) the JSON schema for the challenge's `request` parameter, (3) the JSON schema for the credential's `payload`, and (4) the verification procedure[^s04]. Those four pieces are the contract a method extension must satisfy.

## 3. Intents — Payment patterns

### 3.1 charge — one-time payment

The simplest intent. mpp.dev/intents/charge defines a seven-step flow (request → 402 challenge → pay → credential retry → verify+settle → network confirm → resource + receipt)[^s05]. Its request schema[^s05]:

| Field | Type | Required |
|---|---|---|
| `amount` | string | ✓ |
| `currency` | string | ✓ |
| `description` | string | ✗ |
| `expires` | string | ✗ |
| `externalId` | string | ✗ |
| `recipient` | string | ✗ |

Method-specific fields are added through `methodDetails` — "Payment methods extend this schema with method-specific fields through methodDetails"[^s05]. charge fits "a single payment with a known cost" (paid APIs, content access, tool calls); metered/high-volume cases should use session[^s05].

### 3.2 session — streaming-channel payment

session is an off-chain payment channel for continuous activity. The flow: (1) deposit into an escrow contract to open the channel → (2) issue a signed cumulative voucher per request instead of an on-chain transaction → (3) the server periodically settles the accumulated vouchers on-chain → (4) refund the unspent deposit when the channel closes[^s04][^s08][^s09]. Cloudflare's one-liner — "Session — A streaming payment over a payment channel. Use for pay-as-you-go or per-token billing with sub-cent costs and sub-millisecond latency"[^s08]. The mechanism detail (TempoStreamChannel, channelId derivation, EIP-712 voucher structure) is covered in the sister report [`mpp-session-mechanism`](../mpp-session-mechanism/). (The `mpp.dev/intents/session` page returned 404 at fetch time, so session fields are reconstructed from secondary sources — see `gaps.md`.)

### 3.3 subscription — recurring payment

subscription charges at most once per period from a single authorisation — "The client authorizes a fixed payment amount once, and the server reuses that authorization to collect at most one charge per billing period"[^s06]. Its request schema is `amount`, `currency`, `periodCount`, `periodUnit` (day/week/month) required, plus `description`/`externalId`/`methodDetails`/`recipient`/`subscriptionExpires` optional[^s06]. After charging the first period, the server returns a `subscriptionId` in the receipt and reuses it for later periods. The spec is explicit that "a subscriptionId alone doesn't grant access" — the server must layer on session/account context[^s06].

## 4. Payment methods

mpp.dev and Cloudflare docs enumerate **Tempo, Stripe, Lightning, Solana, Stellar (SEP-41), Monad, RedotPay, Card, and Custom**[^s03][^s08].

### 4.1 Tempo — stablecoin

Tempo is the sub-second stablecoin method[^s08]. In charge it is an on-chain transfer; in session it uses EIP-712 cumulative vouchers. The server verifies vouchers with `ecrecover`, achieving sub-100ms verification with no RPC call and per-request micropayments as small as $0.0001 — "Agents deposit funds into an escrow contract (roughly 500ms setup time), then issue cumulative EIP-712 signed vouchers with each subsequent request"[^s09]. If the balance runs out mid-stream, the server emits a `payment-need-voucher` event and the client auto-signs a new voucher[^s15].

### 4.2 Stripe — SPT / card / wallet / fiat

The Stripe method splits two ways[^s07]:

- **crypto** — on-chain transfer on the Tempo network (testnet/mainnet). "Direct on-chain payment that uses crypto deposit addresses."
- **fiat (SPT)** — Shared Payment Token covering cards, wallets, and other fiat methods. "Card, wallet, and other payment methods that shared payment tokens (SPTs) support"[^s07]. An SPT triggers payment without exposing the buyer's credentials[^s13].

### 4.3 Stellar — SEP-41 + Soroban ed25519 channel

The Stellar method implements session via a Soroban contract[^s10]. (1) the client opens a channel with an ed25519 commitment key and a USDC deposit → (2) per request it receives a challenge (`channel: C..., amount, cumulativeAmount, network, reference`), read-only-simulates `prepare_commitment`, and signs the commitment bytes locally with ed25519 → (3) the server verifies locally via `Keypair.verify()` and updates cumulative tracking → (4) on close it settles with one on-chain transaction at the highest cumulative commitment — "The server closes the channel by submitting one on-chain transaction with the highest cumulative commitment and signature"[^s10]. Where Tempo uses EVM's EIP-712 + ecrecover, Stellar uses Soroban's ed25519 + Keypair.verify() — the same abstraction, per-chain.

### 4.4 Solana / Lightning / Card / Monad / RedotPay

These follow the same method-extension contract (identifier + request/payload schema + verification procedure), differing only in the rail — Solana's SDK shipped ahead of its spec, Lightning uses Bitcoin Lightning invoices, Card uses encrypted network-token payments[^s08][^s09].

## 5. Per-flow walkthroughs

### 5.1 charge × tempo + stripe offered together (Stripe `mppx`)

Stripe's MPP server SDK (`mppx`) registers methods with `Mppx.create` and binds several to one route with `Mppx.compose`[^s07]:

```ts
import { Mppx, stripe, tempo } from 'mppx/server';

const mppx = Mppx.create({
  methods: [
    tempo.charge({ currency: PATH_USD, recipient: recipientAddress, testnet: true }),
    stripe.charge({ client: stripeClient, networkId: process.env.STRIPE_PROFILE_ID!, paymentMethodTypes: ['card', 'link'] }),
  ],
  secretKey: mppSecretKey,
});

const response = await Mppx.compose(
  mppx.tempo.charge({ amount: '0.01', recipient: recipientAddress }),
  mppx.stripe.charge({ amount: '0.50', currency: 'usd' }),
)(request);

if (response.status === 402) return response.challenge;
return response.withReceipt(Response.json({ data: '...' }));
```

The 402 response then carries two challenge lines at once[^s07]:

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment id="chal_abc123", method="tempo", intent="charge", ...
WWW-Authenticate: Payment id="chal_def456", method="stripe", intent="charge", ...
Content-Type: application/problem+json
Cache-Control: no-store

{ "type": "https://paymentauth.org/problems/payment-required", "title": "Payment Required", "status": 402, "challengeId": "..." }
```

The agent picks one, pays, and resends the chosen method's credential in `Authorization: Payment`. Stripe requires the `2026-03-04.preview` API version for this feature; mainnet means dropping `testnet: true` and using a live `profile_` networkId[^s07].

### 5.2 charge × tempo crypto PaymentIntent

On the crypto path, the Stripe PaymentIntent returns Tempo deposit addresses and supported tokens via `crypto_display_details`[^s07]:

```json
{ "id": "pi_123", "status": "requires_action",
  "next_action": { "type": "crypto_display_details",
    "crypto_display_details": { "deposit_addresses": {
      "tempo": { "address": "0xtempo_address", "supported_tokens": [{ "token_currency": "usdc", "token_contract_address": "0x…" }] } } } } }
```

### 5.3 session × Stellar (Soroban)

The Stellar session uses `@stellar/mpp/channel/server` (signature verification + cumulative tracking) and `@stellar/mpp/channel/client` (auto ed25519 signing, transparent 402 handling)[^s10]. The server tracks cumulative commitments in an in-memory store and settles once on close — where charge is one settlement per request, session is N requests → one settlement[^s10].

## 6. Discussion — design observations

### 6.1 The two-layer structure

MPP's most important design decision is the split between **core (the IETF draft)** and **method extensions (separate specs)**[^s01][^s02]. The core defines only a rail-agnostic HTTP grammar; per-rail differences are absorbed into each method spec's four-part contract (identifier, request schema, payload schema, verification procedure)[^s04]. That lets Tempo (EIP-712), Stellar (ed25519), Stripe (SPT), and card (network token) coexist in the same `WWW-Authenticate: Payment` line, and lets one server offer several methods at once[^s07] _(interpretive)_. Each method spec is maintained as a separate file in the `methods/` directory of the `mpp-specs` repo[^s14].

### 6.2 intent × method orthogonality

Intent (what you pay for — one-shot/streaming/recurring) and method (which rail you pay on) are orthogonal. The same `charge` intent runs over tempo, stripe, or stellar; the same tempo method runs charge or session. That orthogonality is exactly why the registries are split in two[^s04][^s07].

### 6.3 SDK ecosystem

MPP ships SDKs in TypeScript (`mppx`), Python (`pympp`), and Rust (`mpp-rs`), with middleware for Hono, Express, Next.js, and Elysia[^s08]. A server handles 402 issuance, credential verification, and receipt attachment with one middleware layer; the client patches global fetch to handle 402 transparently.

### 6.4 Relationship to x402

MPP's session intent and x402's batch-settlement scheme share the same "off-chain cumulative voucher + batched settlement" abstraction but differ in traffic shape — the head-to-head is in the sister report [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/).

## 7. Limitations

- This report reflects primary specs and docs as of 27 May 2026. `draft-ryan-httpauth-payment-01` may be revised, and field names can shift in later revisions.
- The `mpp.dev/intents/session` page was 404 at fetch time, so session-intent field detail is reconstructed from mpp.dev/protocol[^s04], Cloudflare[^s08], Formo[^s09], the Stellar guide[^s10], and the sister report.
- Of the payment methods, only Tempo, Stripe, and Stellar are covered at flow level; the request/payload JSON schemas for Solana, Lightning, Card, Monad, and RedotPay are out of scope.
- The `paymentauth.org` charge sub-spec (`draft-payment-intent-charge-00`) and the file listing of the mpp-specs methods directory are referenced by URL but not directly quoted.
- Figures like "sub-100ms / $0.0001" are explainer-stated and not independently benchmarked — flagged in `uncertainties.md`[^s09].
