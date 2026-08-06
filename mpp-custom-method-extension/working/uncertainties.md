# Uncertainties register

What remains epistemically shaky even though the draft is publishable.

## 1. The extension API is pre-1.0 and moving weekly

`mppx` is at 0.8.15 with releases through 2026-08-05 [s20]. Between the version in
the checkout used for this report and `main`, the server hook set gained `validate`,
`broadcast`, and `canOffer`, and `verify` was deprecated [s02][s22]. Any code in this
report is correct against a specific commit and may need mechanical revision on the
next minor. **Nothing here should be read as a stable API contract.**

## 2. The narrative guide lags the API reference (corrected)

An earlier version of this register said "the published documentation lags the SDK". The
critique pass falsified that: the `Method.toServer` API reference documents `validate` and
`broadcast` and marks `verify` legacy [s33], and `validateCredential` has its own page [s36].
What remains true is narrower — the custom-method *guide* at `/payment-methods/custom`, the
entry point most implementers reach first, still teaches `verify` alone [s01]. Whether that
lag is intentional is undetermined.

## 3. The spec is an unadopted individual draft

`draft-ryan-httpauth-payment-01` has no IETF working group behind it and "no formal
standing" [s31]. Method identifier grammar, the intent set, and the registry policy
could all change before — or instead of — RFC publication. Treat normative-sounding
MUSTs as vendor-stated for now.

## 4. Identifier collision is unmanaged in practice

Registries are proposed but not created [s31]. Today nothing prevents two independent
implementers from both shipping `name: 'bank'`. The `mpp-specs` repository is a de
facto coordination point, not an authority, and its own tree already contains a method
draft submitted independently [s28].

## 5. Evidence of absence on SDK-level replay protection

The claim "mppx does not enforce single-use credentials for you" rests on reading the
server dispatch path and finding only HMAC provenance and route binding [s10], plus
the corroborating fact that `@stellar/mpp` builds its own store-backed replay guard
[s32]. It is well-supported but is still an argument from absence in one SDK layer;
a future release could add a generic guard.

## 6. Adoption breadth is unmeasured

Third-party method packages demonstrably exist and are versioned [s25][s27][s30], and
one method spec came from outside Tempo [s28]. None of that is evidence of production
transaction volume, which I could not measure.

## 7. Cross-language parity is only partially mapped

`mpp-rs` traits are intent-scoped over a fixed `ChargeRequest` [s14] while mppx allows
arbitrary request schemas [s02]. I did not audit the Rust server integration end to
end, so "less flexible" is a characterisation of the trait signature, not a verdict on
the SDK.

## 8. Example code — RESOLVED: compiled and executed

Originally logged as "composed, not executed". The example was subsequently compiled with
`tsc --strict` against mppx 0.8.15 (clean) and run under `tsx`, exercising the 402 challenge,
a settled receipt, a rejected replay, and a rejected forged challenge. Source, compiler
output, and runtime log are committed in `working/verification/`. Residual uncertainty: the
example is one rail shape (synchronous, single-server, balance-debit) on one Node runtime,
and the `validate` result is advisory across the hook boundary [s33], which a
single-process demo does not stress.


## 9. First-party experimental evidence is single-run

The `defaults` type-inference finding and the four execution outcomes are reproducible from
`working/verification/`, but each was observed on one machine, one Node version, one mppx
version. They are offered as demonstrations, not as benchmarks.
