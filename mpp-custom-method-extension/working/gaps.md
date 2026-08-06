# Gaps — iteration 3 (closing)

## Resolved

- **c01–c30** all meet the minimum sourcing in `CLAUDE.md` §2.3.
- **G1 (registry status) — CLOSED.** `draft-ryan-httpauth-payment` is at version 01
  (18 Mar 2026, expires 19 Sep 2026), an *individual* submission, not adopted by any
  IETF working group, with "no formal standing" [s31]. The HTTP Payment Methods and
  HTTP Payment Intents registries are **proposed, not created** [s31][s04]. So the
  accurate statement is: a registry is specified and would be Specification Required,
  but no live IANA registry exists today, and identifier uniqueness is currently
  maintained by convention and by the `mpp-specs` repository.
- **G4 (replay enforcement) — CLOSED.** The core spec assigns single-use semantics to
  "the payment method infrastructure" [s03]. No general-purpose credential-consumption
  store exists in mppx's server dispatch path — it does HMAC provenance and route
  binding only [s10]. `@stellar/mpp` confirms the burden lands on the method: it
  refuses to construct a server charge method without an atomic `Store`, and claims
  `challenge.id` via compare-and-set before doing any settlement work [s32].
- **c23 reframed** — see G1.
- **Third-party adoption** — `@stellar/mpp` [s25][s26][s32], `mppx-hedera` [s27],
  `solana-foundation/mpp-sdk` [s30], NEAR Intents independent draft [s28].

## Accepted as remaining (carried into Limitations)

- **G5 — Rust/TypeScript asymmetry is characterised, not exhaustively mapped.**
  `mpp-rs` exposes intent-scoped traits (`ChargeMethod`, `SessionMethod`) over a fixed
  typed `ChargeRequest` [s14]; mppx lets a method declare an arbitrary request schema
  [s02]. I read the trait definitions but not the full Rust server integration, so the
  report limits itself to that difference and does not rank the two SDKs.
- **G6 — No peer-reviewed source.** The specification is ~5 months old [s16][s31];
  no academic literature exists. Sourcing is primary (IETF draft, specs repo, SDK
  source) plus independent implementations, one platform vendor [s15] and one
  third-party explainer [s16].
- **G7 — Production usage is unmeasured.** Packages exist and are versioned
  [s25][s27], but I found no data on live transaction volume through any
  third-party method. The report claims implementation activity, not adoption at scale.

## Conflicts to represent in the draft (do not resolve silently)

1. **`verify` vs `validate`/`broadcast` — CORRECTED during critique.** The original framing
   ("the documentation lags the SDK") was falsified by the counter-evidence sweep. The
   `Method.toServer` API reference *does* document `validate` and `broadcast` and marks
   `verify` "Legacy combined validation and settlement function. Use `validate` and
   `broadcast` for new methods." [s33]; dedicated pages exist for `validateCredential`
   [s36]. The real, narrower conflict is between the **API reference** (current) and the
   **narrative custom-method guide** at `/payment-methods/custom`, which still teaches
   `verify` alone [s01]. Both drafts were rewritten accordingly.
2. **Method identifier grammar.** Core ABNF is `payment-method-id = 1*LOWERALPHA`
   (a–z only) [s03][s04], but the official guide's packaged-SDK example uses
   `name: 'my-method'` [s01]. Shipped third-party methods use bare lowercase words
   (`stellar` [s26]).
3. **Authorship attribution — RESOLVED during critique.** Stripe's own launch post states
   "co-authored by Tempo and Stripe", published 2026-03-18 [s35], matching the independent
   explainer [s16]. `mpp.dev/overview` omits authorship rather than contradicting it [s18],
   and individual specification drafts carry their own author lists [s19]. The drafts no
   longer present this as a live disagreement.

## Sections without a primary source

None.


## Added by the critique pass (2026-08-06)

- **Independent corroboration for the registry finding.** IANA's HTTP Authentication Scheme
  Registry lists 16 schemes and "Payment" is not among them; the page references no
  "HTTP Payment Methods" registry [s34]. This replaces the draft's earlier appeal to general
  IETF process ("registries are normally created at RFC publication"), which was uncited.
- **Datatracker claims re-sourced from the API rather than a page summariser.** rev 01,
  time 2026-03-18, expires 2026-09-19, stream null, group 1027 = "Individual Submissions" [s31].
- **New caveat surfaced, now in the draft.** "Revalidate any external or on-chain state before
  the terminal operation, because a previous `validate` result is advisory." [s33] The
  `validate`/`broadcast` split introduces a TOCTOU gap the original draft did not mention.
- **npm source URLs repointed** from `npmjs.com` (403 to all scripted access) to
  `registry.npmjs.org`, the endpoint the data was actually read from [s20][s25][s27].

**No open gaps block publication. Gather loop closed at iteration 3 of 6; critique closed at pass 2.**
