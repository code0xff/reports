# MPP (Machine Payments Protocol) — A Documentation-Grounded Technical Analysis

## Abstract

The Machine Payments Protocol (MPP) standardizes the long-dormant HTTP `402 Payment Required` status code so that agents, apps, and services can settle payments **inside a single HTTP request**[^s01][^s17]. MPP was co-developed by Tempo and Stripe, and its core is the "Payment" HTTP authentication scheme submitted to the IETF as Internet-Draft `draft-ryan-httpauth-payment-01`[^s17][^s20]. Grounded in the primary documentation under `mpp.dev/protocol`, this report analyzes MPP's **Challenge·Credential·Receipt** core flow, its three intents (charge, session, subscription), its three transports (HTTP, MCP/JSON-RPC, WebSocket), its payment-rail matrix, and the advanced capabilities of discovery, identity, refunds, and security. It cross-checks those docs against the IETF draft, the spec repository, and third-party adopters, separating honestly what MPP defines technically from where it stands in terms of standards status and ecosystem maturity.

## Introduction — Background and Motivation

Web payments are optimized for humans. Rich checkout screens, browser automation, and visual verification are familiar and fast for human buyers but become structural headwinds for programmatic consumption — the MPP docs put it as "the very things that make these payment flows familiar and fast for human purchasers are structural headwinds for programmatic consumption"[^s17]. For an AI agent to autonomously pay for an API call, tool invocation, or content access, payment must complete within one request/response cycle, with no pre-negotiated API keys or subscription contracts[^s24].

To close this gap, MPP reinterprets the `402 Payment Required` status that HTTP had originally reserved as an authentication problem. The server issues a Challenge ("payment required"), the client answers with a Credential (payment proof), and the server returns a Receipt[^s01][^s18]. This report's scope is to treat the documents under `mpp.dev/protocol` as primary evidence while cross-validating with the IETF draft (`datatracker`), the open spec repo (`tempoxyz/mpp-specs`), and external adopters/commentators such as Cloudflare, Parallel, and Stripe.

## Background — HTTP 402 and the "Payment" Authentication Scheme

MPP's foundation is HTTP `402 Payment Required`. MPP services return this status to indicate that a protected resource requires payment for access[^s02]. But 402 itself was an empty shell with no body; MPP's substance is the **"Payment" HTTP authentication scheme** that fills it. The scheme is defined in IETF Internet-Draft `draft-ryan-httpauth-payment-01`, which states that it "defines the 'Payment' HTTP authentication scheme, enabling HTTP resources to require a payment challenge to be fulfilled before access"[^s20]. Its authors are Tempo Labs' Brendan Ryan, Jake Moxey, and Tom Meagher, and Stripe's Jeff Weinstein and Steve Kaliski[^s20].

The protocol was **co-developed by Tempo and Stripe**, with SDKs maintained by Tempo Labs and Wevm[^s17]. The specs live openly at `github.com/tempoxyz/mpp-specs` in a modular Core / Intents / Methods / Extensions structure; the specification documents are CC0 1.0 (public domain) and the tooling is Apache-2.0/MIT[^s19]. Its standards status, however, is still provisional. The Internet-Draft explicitly states that "this I-D is not endorsed by the IETF and has no formal standing in the IETF standards process," and it expires on 19 September 2026[^s20]. In other words, MPP is "an open specification proposed to the IETF"[^s17] — not yet a ratified standard _(vendor-stated)_.

## Core Protocol — Challenge · Credential · Receipt

MPP's operation reduces to a round trip of three objects.

**Challenge.** The server delivers the payment requirement in a `WWW-Authenticate: Payment` header on the `402` response. The header carries `id` (challenge identifier), `realm` (protection space), `method` (payment method, e.g. `tempo`), `intent` (payment type, e.g. `charge`), and `request` (payment details)[^s02][^s03]. An example[^s02]:

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment id="abc123",
    realm="mpp.dev", method="tempo", intent="charge", request="eyJ..."
```

The `request` and optional `opaque` parameters are base64url-encoded JCS (JSON Canonicalization Scheme) JSON[^s03][^s06]; decoded, `request` holds method-specific details like `amount`, `currency`, and `recipient`[^s03]. The security crux is that the challenge `id` is **cryptographically bound** to the challenge parameters: the binding typically HMACs `realm | method | intent | request | expires | digest | opaque` so a client cannot reuse a credential with altered terms[^s03][^s15]. A server may present multiple Challenges in a single 402 so the client can pick its preferred method[^s03] — and Stripe's own example shows two `WWW-Authenticate: Payment` headers (`tempo` and `stripe`) offered at once[^s18].

**Credential.** The client responds with an `Authorization: Payment <base64url credential>` header[^s04]. A credential has three parts: the echoed `challenge` (preserving the original wire values), a `source` identifying the payer (address, DID, or account ID), and a method-specific `payload` of payment proof[^s04]. For a Tempo charge the payload comes in three variants: `transaction` (non-zero, pull mode), `hash` (non-zero, push mode), and `proof` (zero-amount identity verification)[^s04]. Replay protection is strict: "each credential is valid for exactly one request," and servers must reject replayed credentials[^s04].

**Receipt.** On success the server may return a `Payment-Receipt` header carrying a base64url JSON receipt with `challengeId`, `method`, `reference` (transaction hash or invoice ID), `settlement` (the actual settled amount and currency), `status`, and `timestamp`[^s05]. This header is **optional**: the docs note that "servers typically include it for auditability, but clients don't need it for correct operation"[^s05].

Failures are not silent. A failed payment attempt returns a fresh `402` with a Problem Details body, with error types including `invalid-challenge`, `malformed-credential`, `payment-expired`, and `verification-failed`[^s02]. When both token and payment authentication apply, the server verifies tokens first and returns `401` if token validation fails, so payment requirements are not exposed to unauthenticated clients[^s02].

### Transports — One Model, Three Carriers

MPP binds the same Challenge·Credential·Receipt model to three transports[^s06][^s07][^s08].

| Element | HTTP | MCP/JSON-RPC | WebSocket |
|---------|------|--------------|-----------|
| Challenge | `WWW-Authenticate: Payment` header[^s06] | error code `-32042` + `data.challenges`[^s07] | `mpp`-discriminated message[^s08] |
| Credential | `Authorization: Payment` header[^s06] | `_meta` key `org.paymentauth/credential`[^s07] | `authorization` message[^s08] |
| Receipt | `Payment-Receipt` header[^s06] | `_meta` key `org.paymentauth/receipt`[^s07] | `payment-receipt` message[^s08] |

The HTTP transport reuses three RFC 9110 standard headers as-is[^s06]. The MCP/JSON-RPC transport delivers the challenge as JSON-RPC error code `-32042` ("Payment Required") and carries credentials/receipts as native JSON in the tool call's `_meta` field, slotting payment into existing MCP tool-calling workflows[^s07]. The WebSocket transport exchanges payment messages **in-band** over a persistent connection — "the client and server exchange payment messages in-band—no separate requests needed for voucher top-ups." When the channel balance depletes, the server sends `payment-need-voucher` and the client immediately tops up with a fresh `authorization`, eliminating the extra HTTP round trip that SSE would require; this makes WebSocket well-suited to high-frequency metering[^s08].

## Intents and Payment Rails

MPP abstracts payment patterns into three core **intents**: charge (one-time), session (pay-as-you-go via channels), and subscription (recurring)[^s17].

**Charge — one-time payment.** Charge is "an immediate one-time payment" where the client pays a fixed amount and the server settles before returning the response[^s09]. Its request schema has `amount`/`currency` (required) plus `description`, `expires`, `externalId` (idempotency key), and `recipient` (optional); Tempo integrations add `chainId` and `feePayer` via `methodDetails`[^s09]. The flow is the Challenge→Credential→Receipt round trip above: receive 402 → fulfill payment on the network → retry with credential → verify and settle → 200 + receipt[^s09].

**Session — pay-as-you-go (the architectural differentiator).** The session intent is pay-as-you-go through payment channels[^s17]. Per an independent explainer, the agent deposits funds into an escrow contract (~500ms setup), then issues **cumulative EIP-712 signed vouchers** with each subsequent request. The server verifies vouchers via `ecrecover` with no RPC call or database lookup, enabling sub-100ms latency, and micropayments as small as $0.0001 per request batch-settle into a single on-chain transaction when the session closes[^s22] _(independent explainer; some specifics are vendor-stated)_. On the primary-doc side, Tempo advertises a "Session (near-zero latency via payment channels)"[^s16], and the WebSocket transport defines the in-band voucher top-up mechanism that backs it[^s08]. Note that the dedicated `mpp.dev/intents/session` page returned 404 on 2026-06-03, so the session mechanism was reconstructed from adjacent docs (see Limitations).

**Subscription — recurring payment.** Subscription "mediates recurring paid access": the client authorizes a fixed amount once and the server reuses that authorization to collect "at most one charge per billing period"[^s10]. Fields are `amount`, `currency`, `periodCount` (positive integer multiplier), and `periodUnit` (`day`/`week`/`month`), with optional `subscriptionExpires` (RFC 3339)[^s10]. The lifecycle is Activation (charge the first period immediately, then return a receipt with `subscriptionId`) → Renewal (one charge per period; in unpaid periods charge before granting access or return 402) → Reuse (the server links later requests to an active subscription via local selectors like authenticated session state, account identity, or resource scope — not keyed on `subscriptionId` alone)[^s10].

**Payment-rail matrix.** MPP ships many methods, but intent support varies by rail[^s11]:

| Method | Intents | Rail properties |
|--------|---------|-----------------|
| Tempo | charge·session·subscription | TIP-20 stablecoins, off-chain vouchers[^s11][^s16] |
| EVM | charge | stablecoins, x402 exact flows[^s11] |
| Stripe | charge | Shared Payment Tokens, cards/wallets[^s11][^s18] |
| Card | charge | encrypted network tokens (Visa, Mastercard, …)[^s11] |
| Lightning | charge·session | BOLT11 invoices, prepaid sessions[^s11] |
| Solana | charge | SOL/SPL token signed transactions[^s11] |
| Stellar | charge·session/channel | SEP-41 tokens, channel-based sessions[^s11] |
| Monad | charge | ERC-20, push and pull settlement[^s11] |
| RedotPay | charge | balance or stablecoin rails[^s11] |
| Custom | (definable) | fully custom request schema, credential, verification[^s11] |

In other words, only Tempo, Lightning, and Stellar advertise session/channel support; the rest are mostly charge-only[^s11] _(unverified — single source)_. **Tempo is the de-facto reference rail**: it uses TIP-20 stablecoins, "transactions settle in ~500ms with deterministic confirmation," and a server can sponsor gas via a `feePayer` account so the client signs without holding gas tokens. 2D nonces enable concurrent transactions[^s16].

## Advanced Capabilities — Discovery · Identity · Refunds · Security

**Discovery.** Clients can learn payment terms ahead of time from a standard **OpenAPI 3.1** document served at `/openapi.json`; this is an advisory layer while runtime 402 Challenges remain authoritative[^s12]. Payment info travels in two extensions: `x-payment-info` on paid operations (an `offers` array with amount, currency, intent, method) and an optional root-level `x-service-info` (categories, docs)[^s12].

**Identity (access control without moving funds).** MPP embeds identity in every credential's `source` field, enabling identity-based access control without a financial transaction[^s13]. When the server issues an `amount: 0` Challenge, the client signs a `proof` message demonstrating key ownership ("the client signs the Challenge to prove key ownership. No funds move on-chain"), and the server rejects `transaction`/`hash` payloads for zero-amount Challenges, requiring `proof`[^s13]. By default, however, "a valid zero-dollar proof remains reusable until the Challenge expires," so without single-use enforcement (e.g. a `store` parameter), production identity/access control needs explicit replay protection[^s13][^s15]. Use cases include zero-dollar polling of long-running jobs, free re-access after a one-time payment by the same identity, and identity continuity across stages of a multi-step agent workflow[^s13].

**Refunds.** In charge flows, refunds happen **outside the protocol** — the server sends funds back to the credential's `source` address, with timing and triggers entirely up to service logic[^s14]. Sessions, by contrast, implement **automatic refunds** of unclaimed deposits: if the server never claims after expiration, the locked funds return to the client automatically. The server settles claimed amounts by calling `session.close()` with the final voucher (returning the remainder), and if the server is unresponsive the client can independently recover via `requestClose()` and `withdraw()` after a grace period[^s14].

**Security.** MPP security centers on protecting `MPP_SECRET_KEY`. The docs warn that "if an attacker gets the key, they can mint Challenges that appear server-issued for your realm" — the entire trust model is bound to HMAC-backed Challenge IDs[^s15]. Key guidance[^s15]:

- **Body integrity:** include a `digest` parameter for mutating requests (POST, PUT, PATCH) so clients cannot alter the payload after receiving a Challenge.
- **Replay protection:** use a shared atomic store (not process-local memory) when running more than one instance; zero-amount proof flows need explicit replay protection before production identity/access use.
- **Secret handling:** never log `Authorization: Payment` or `Payment-Receipt` headers; apply `Cache-Control: no-store` to 402 responses and `Cache-Control: private` to successful responses carrying a receipt.
- **Key management:** keep `MPP_SECRET_KEY` only on trusted servers (never in browsers, apps, or frontend bundles), inject it from a managed secret store (AWS Secrets Manager, HashiCorp Vault, …), and rotate with overlap windows.

## Analysis — Positioning vs x402, Maturity, Adoption

**Relationship to x402.** MPP positions itself as **compatible** with x402, not competing. Cloudflare states that "MPP clients can consume existing x402 services without modification" and provides official SDKs in three languages (TypeScript, Python, Rust)[^s21]. The design philosophies differ, though: per an independent explainer, MPP's sessions are **payment-based** (deposit escrow → stream signed vouchers → batch settlement), whereas x402's SIWx extension is **authentication-based** (prove wallet ownership → receive a JWT), solving distinct problems[^s22] _(interpretive)_. MPP aims at a "continuous payment stream"; the x402 family aims at "authenticated session tokens."

**Adoption signals.** External adoption is early but real. Stripe connects card/wallet payments to MPP via Shared Payment Tokens (US legal entities only), automatically creating a `PaymentIntent` when it receives a valid SPT credential[^s18]. Cloudflare folds MPP into its Agents platform with three-language SDKs[^s21], and Parallel documents a Tempo+MPP integration[^s23]. But **commercial volume is effectively negligible.** One independent analysis says "neither protocol has meaningful commercial volume yet," reporting MPP at roughly 31,100 transactions and ~$3,730 in volume as of late March 2026 while explicitly flagging the figure as "unverified, 2 weeks old"[^s22] _(unverified — single source)_ — a reminder that partner announcements and production adoption are different things.

On balance, MPP is a **technically well-defined** 402-based payment-authentication framework — mapping a simple three-object Challenge·Credential·Receipt model consistently across three transports and many rails, supporting micropayments via session channels and fund-free access control via the identity extension. It is at the same time **early on standards and ecosystem**: pre-IETF-ratification, with the protocol, its core rail, and a core payment method all originating from the two co-authors, and real transaction volume still at self-reported levels.

## Limitations

- **No dedicated session spec page.** `mpp.dev/intents/session` returned 404 on 2026-06-03. The session mechanism (vouchers, escrow, settlement) was reconstructed from the WebSocket transport[^s08], the Tempo method[^s16], refunds[^s14], the payment-methods list[^s11], and an independent explainer[^s22]; the primary spec page could not be read directly.
- **No canonical MPP-vs-x402 page.** `mpp.dev/comparison/mpp-vs-x402` also returned 404. The x402 comparison relies on Cloudflare[^s21] and the independent explainer[^s22].
- **Indirect evidence for EIP-712/ecrecover detail.** The session's EIP-712 vouchers, `ecrecover` verification, and sub-100ms figures come mainly from the independent explainer[^s22]; primary docs only confirm "channels / near-zero latency" indirectly[^s08][^s16].
- **Single, unverified volume figure.** The ~31,100 tx / ~$3,730 figure is single-source and self-flagged as unverified and two weeks stale[^s22].
- **Vendor-led, no audit found.** The protocol, the Tempo rail, and Stripe SPT all come from the co-authors, and most "external" descriptions are integrators/commentators. No independent security audit of the reference implementation was found.
- **Uneven per-rail maturity.** The production-readiness of some advertised rails (Monad, RedotPay, Stellar channels) was not independently verified.
