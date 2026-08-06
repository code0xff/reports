# Outline — Extending MPP with Custom Payment Methods

Primary language: en. Alternate: ko.

## 1. Abstract
Written last. What the method abstraction is, what the extension surface looks like,
what a working custom method costs to build, and where the sharp edges are.

## 2. Introduction
- Why MPP separates "protocol" from "payment method" at all.
- The concrete question: what does it take to add a rail MPP does not ship?
- Scope: `mppx` (TypeScript reference SDK) as the primary implementation surface;
  the `Payment` HTTP authentication scheme as the wire contract.
- Non-goals: comparing rails on economics, or evaluating Tempo the chain.

## 3. Background — the MPP method abstraction
- The Payment authentication scheme: 402 → `WWW-Authenticate: Payment` challenge →
  `Authorization: Payment` credential → `Payment-Receipt`.
- Layering: core (HTTP semantics) / intents (charge, session, subscription) /
  methods (concrete rails) / extensions (discovery, identity).
- Where the method name and intent live on the wire, and why that placement is
  what makes third-party methods possible without a protocol fork.
- What the built-in methods (tempo, stripe, x402, evm) demonstrate about the shape
  a method must take.

## 4. The custom-method extension surface
- `Method.from()` — the shared, transport-neutral definition: `name`, `intent`,
  `schema.request`, `schema.credential.payload`.
- `Method.toClient()` — `createCredential`, `context`, `canHandleChallenge`.
- `Method.toServer()` — `verify` (required) plus the optional hook set:
  `request`, `defaults`, `authorize`, `preflight`, `respond`, `stableBinding`,
  `alias`, `extensions`, `transport`, `html`.
- Which hooks are mandatory, which are rail-specific, and what each one is for.
- Type-level behaviour: how `defaults` and `z.pipe` change the caller's API.

## 5. Implementation — a worked custom method
- End-to-end example: definition module, client half, server half, wiring into
  `Mppx.create()` on both sides.
- The full request/response trace the example produces.
- Variants: the `request` hook for rails that must mint an invoice before the
  challenge; `context` for per-call client parameters; `respond` for methods that
  answer management requests directly.
- Testing a custom method locally.

## 6. Packaging, discovery, and interoperability
- Inline (dynamic extension) vs. published first-party SDK: directory layout,
  `exports` map, peer-dependency pinning, re-exporting `Mppx`.
- Discovery: how a client learns a server accepts a non-standard method.
- Cross-language reality: TypeScript (`mppx`) vs. Rust (`mpp-rs`) — is the
  extension surface symmetric?
- Naming: what governs a method identifier, and whether a registry exists.

## 7. Security and design analysis
- Verification is the whole trust boundary: what "always reject invalid proofs" means.
- Binding a credential to a challenge (and to the request body via digest).
- Replay / single-use proof semantics, and whose job it is.
- Secret leakage through the challenge (the challenge is public).
- Decimal-safe amount handling; idempotency of the `request` hook.
- Failure modes a custom-method author will actually hit.

## 8. Limitations
- What could not be verified: registry status, production adoption of third-party
  methods, stability guarantees of the SDK surface.
- Version pinning: which `mppx` version this report was written against.
