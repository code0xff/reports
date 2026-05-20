# Critique — l402-aperture-protocol-deep-dive

Adversarial pass. Findings are classified as blocking (must be resolved before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §3.2 "macaroon identifier commits to payment_hash H" — quoted directly from L402 protocol spec [s05]. **OK.**
- §3.5 "gRPC returns HTTP 200 with `grpc-status: 402` trailer" — quoted from L402 protocol spec [s05]. **OK.**
- §4.1 "v0.5.0, March 25 2026, Lightning Loop production" — sourced from pkg.go.dev [s10]. **OK.**
- §4.2 seven-package table — sourced from pkg.go.dev [s10]. **OK.**
- §4.3 `sample-conf.yaml` block — extracted from the actual file [s11]. **OK.**
- §5.1 "no canonical Go client SDK" — tagged `_(unverified — single source)_`. **OK.**
- §5.2 "seven composable skills" — quoted from Lightning Labs 2026-02-11 blog [s09]. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to a sources.jsonl entry.
- Eight sampled URLs (lightninglabs/L402, /aperture, 2020 LSAT post, L402 docs, blips PR, lsat-js, boltwall, pkg.go.dev) all returned `200`.
- All `accessed` dates are 2026-05-20.

## 3. Reasoning gaps

- §6 comparison table uses interpretive language for axes like "censorship resistance" and "price stability." Those are sourced from ln.bot [s16], a Lightning-sympathetic publication. The report is explicit about this in the Limitations section. **OK.**
- §7 "When to pick L402" — explicitly tagged `(interpretive)`. **OK.**

## 4. Missing counter-evidence

- A natural counter: "L402's BTC volatility makes it impractical for commerce." This is surfaced in §6's price-stability row and §7's "Where L402 is the wrong fit" sub-bullet. **OK.**
- A second counter: "Lightning Network UX is hard for non-Bitcoin-native users." Not surfaced. **Nit** (out of scope; this report focuses on the protocol/proxy not the UX).

## 5. Tone and structure

- Abstract reflects the body (LSAT → L402 rename, three components, Aperture, comparison). **OK.**
- Limitations honestly reflect `gaps.md` and `uncertainties.md`. **OK.**
- Code snippets (yaml + go) are clearly labelled and verbatim from source files. **OK.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 1 (surface Lightning UX counter)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
