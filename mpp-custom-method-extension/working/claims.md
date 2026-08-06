# Claims — Extending MPP with Custom Payment Methods

## Introduction
- [x] c01: MPP is a joint Stripe/Tempo specification whose stated design goal is to work with any payment network rather than a single rail.
  - kind: factual
  - needs: project-hosted overview plus at least one independent write-up stating co-authorship and network-neutrality
- [x] c02: MPP treats "payment method" as a first-class, pluggable extension point rather than a fixed enumeration.
  - kind: technical
  - needs: spec text or SDK API showing methods are declared, not enumerated by the core
- [x] c03: The reference TypeScript SDK `mppx` ships a documented path for third parties to add a payment method without modifying the SDK.
  - kind: technical
  - needs: mpp.dev custom-method guide and/or exported `Method.from/toClient/toServer` API

## Background — the MPP method abstraction
- [x] c04: The MPP wire exchange is a 402 `WWW-Authenticate: Payment` challenge, an `Authorization: Payment` credential, and a `Payment-Receipt` response header.
  - kind: technical
  - needs: protocol spec page or specs repo showing the three header roles
- [x] c05: The payment method is identified on the wire by a lowercase ASCII `method` parameter carried in the challenge, alongside an `intent` parameter.
  - kind: technical
  - needs: spec text showing `method=` and `intent=` auth-params
- [x] c06: MPP's specification is layered into core / intents / methods / extensions, so a new method is an additive document rather than a core change.
  - kind: technical
  - needs: mpp-specs repo structure
- [x] c07: MPP defines a small closed set of intents (at least charge, session/subscription) that a custom method must reuse rather than invent.
  - kind: technical
  - needs: spec listing intents; check whether custom intents are permitted
- [x] c08: The built-in methods shipped by `mppx` (tempo, stripe, x402, evm) are implemented through the same `Method` abstraction exposed to third parties.
  - kind: technical
  - needs: mppx source showing built-ins call `Method.from`/`toServer`/`toClient`

## The custom-method extension surface
- [x] c09: A custom method is defined by exactly four fields — `name`, `intent`, `schema.request`, `schema.credential.payload` — via `Method.from()`.
  - kind: technical
  - needs: `src/Method.ts` type definition
- [x] c10: The client half requires exactly one function, `createCredential`, which returns a serialized credential string.
  - kind: technical
  - needs: `Method.toClient` signature and `Credential.serialize`
- [x] c11 (AMENDED): The server half requires exactly one settlement function that returns a Receipt or throws — `verify` in the documented form, or `broadcast` in the current SDK, and the two are mutually exclusive.
  - kind: technical
  - needs: `Method.toServer` signature; `VerifyFn`/`BroadcastFn` return types; the options union
  - resolved: s02 (union of `{broadcast, validate?}` | `{verify}`), s22
- [x] c12: `Method.toServer` exposes optional lifecycle hooks (`request`, `authorize`, `preflight`, `respond`, `stableBinding`, `defaults`) that let a method intervene at distinct points in the challenge lifecycle.
  - kind: technical
  - needs: `src/Method.ts` hook types with doc comments
- [x] c13 (PARTLY FALSIFIED): `defaults` changes the caller-facing type by making the defaulted request fields optional at the call site.
  - kind: technical
  - needs: `WithDefaults` type in `src/Method.ts` or docs — then an actual compile
  - result: true at runtime, false at the type level in mppx 0.8.15 unless the `defaults`
    type argument is supplied explicitly (`Method.toServer<typeof m, typeof defaults>`).
    Inferred `defaults` collapses to `{}` so `WithDefaults` never applies. See c36 and
    working/verification/.
- [x] c14: The request schema may be a `z.pipe` transform, so a method can accept human-readable input and emit normalized wire values.
  - kind: technical
  - needs: docs example and/or a built-in method using `z.pipe`

## Implementation — a worked custom method
- [x] c15: A minimally functional custom method can be implemented in a single file on each side, with no SDK fork and no changes to `Mppx.create()`'s call shape.
  - kind: technical
  - needs: working example composed from the documented API; verified against real SDK type definitions
- [x] c16: `Credential.serialize({ challenge, payload })` is the supported way for `createCredential` to produce its return value, and it binds the payload to the challenge.
  - kind: technical
  - needs: `src/Credential.ts` implementation
- [x] c17: A server method's `request` hook runs on both the initial 402 and on credential resubmission, so side-effectful setup inside it must be idempotent.
  - kind: technical
  - needs: docs statement plus SDK code path showing the hook invoked twice
- [x] c18: `Receipt.from()` requires at minimum a method name, status, and reference identifying the settled payment.
  - kind: technical
  - needs: `src/Receipt.ts`
- [x] c19: A custom method can be exercised end-to-end against a local server without any Tempo chain access.
  - kind: technical
  - needs: SDK test files or examples that run a non-chain method in-process

## Packaging, discovery, and interoperability
- [x] c20: MPP documents two distinct packaging paths for a custom method — inline dynamic extension and a published first-party SDK package.
  - kind: technical
  - needs: mpp.dev custom guide
- [x] c21: The recommended first-party SDK layout separates a shared definition module from `./client` and `./server` subpath exports and declares `mppx` as a peer dependency.
  - kind: technical
  - needs: mpp.dev custom guide package.json example; corroborate against how `mppx` itself is laid out
- [x] c22: MPP has a discovery extension that lets a client learn which methods a server accepts before paying.
  - kind: technical
  - needs: mpp-specs extensions doc and/or `src/discovery` in mppx
- [x] c23 (REFRAMED): The core draft specifies an IANA "HTTP Payment Methods" registry under a Specification Required policy, but that registry is proposed rather than created, so identifier uniqueness is presently maintained by convention.
  - kind: factual
  - needs: IANA considerations section + IETF Datatracker draft status
  - resolved: s04 (registry text, "initially empty") + s31 (individual draft, no WG adoption, registries not created)
- [x] c24: The Rust SDK `mpp-rs` exposes an equivalent third-party method extension surface to `mppx`.
  - kind: technical
  - needs: mpp-rs repo API; if absent, record the asymmetry

## Security and design analysis
- [x] c25: In a custom method the SDK performs no rail-specific validation, so `verify` is the sole trust boundary for payment authenticity.
  - kind: interpretive
  - needs: SDK code showing generic verify dispatch; docs warning
- [x] c26: MPP requires single-use proof semantics — a payment proof must succeed exactly once — and for a custom method the SDK does not enforce this for you.
  - kind: technical
  - needs: spec requirement text plus evidence about what the SDK does or does not enforce
- [x] c27: The challenge is client-visible, so any secret placed in `schema.request` is disclosed to the payer.
  - kind: technical
  - needs: wire-format evidence that request fields are serialized into the 402 header; docs warning
- [x] c28: MPP binds a credential to a request body via an RFC 9530 SHA-256 digest parameter for body-bearing methods.
  - kind: technical
  - needs: spec digest text and/or `src/BodyDigest.ts`
- [x] c29: `stableBinding` exists because the default credential-to-route binding only covers a fixed subset of request fields (amount/currency/recipient), which is insufficient for some rails.
  - kind: technical
  - needs: `StableBindingFn` doc comment and the default binding implementation
- [x] c30: Monetary amounts cross the MPP wire as decimal strings in base units, and custom methods are directed to use integer/`parseUnits` math rather than floating point.
  - kind: technical
  - needs: schema types in SDK plus docs guidance

## Limitations
- [x] c31: This report's SDK-level findings are pinned to a specific `mppx` version and the SDK is pre-1.0, so the extension API carries no stability guarantee.
  - kind: factual
  - needs: package version and semver/pre-1.0 status


## Claims added during gathering
- [x] c32: mppx 0.8.14 deprecated the combined `verify` hook in favour of a `validate` (non-mutating) / `broadcast` (terminal) split, and `toServer.Options` is now a discriminated union accepting either shape.
  - kind: technical
  - needs: CHANGELOG entry + the union in src/Method.ts
  - resolved: s22, s02
- [x] c33: The published custom-method guide still teaches the deprecated `verify` hook, so the documentation and the SDK disagree.
  - kind: factual
  - needs: both project-hosted artefacts read on the same day
  - resolved: s01 vs s22/s02 (both accessed 2026-08-06)
- [x] c34: Third parties outside Tempo have shipped MPP payment methods as independent packages and at least one independently submitted method specification.
  - kind: factual
  - needs: package metadata + a spec draft with an external author
  - resolved: s25, s26, s27, s30 (packages), s28 (independent submission)
- [x] c35: A custom method must implement its own replay protection; the SDK's server dispatch provides HMAC challenge provenance and route binding but no credential-consumption store.
  - kind: technical
  - needs: SDK dispatch code + a shipped method that builds its own guard
  - resolved: s10, s32, s03 (spec assigns single-use to the method), and direct execution
- [x] c36: In mppx 0.8.15, `defaults` is applied at runtime but does not narrow the caller-facing route type unless the `defaults` type argument is passed explicitly to `Method.toServer`.
  - kind: technical
  - needs: a compile + run of both forms
  - resolved: executed — see working/verification/ (tsc clean only with explicit generic; runtime challenge shows defaults applied)
