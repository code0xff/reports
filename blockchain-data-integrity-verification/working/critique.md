# Critique — blockchain-data-integrity-verification

Adversarial pass. Findings classified as blocking (must be resolved before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §2.1–§2.2 OpenTimestamps mechanics — quoted directly from opentimestamps.org [s01], Wikipedia [s02], and ProofSnap [s03]. **OK.**
- §2.4 Filecoin PoRep/PoSt, Arweave SPoRA — sourced from OpenSourceForU [s13] and Gemini Cryptopedia [s14]. **OK.**
- §3.2 Estonia adoption timeline — sourced from the EU Interoperable Europe portal [s05] which is a public-sector source. **OK.**
- §3.6 Chainlink PoR mechanism — sourced from Chainlink docs [s10] and Messari [s25]. **OK.**
- §5.2 "Sigstore decided blockchain was less optimal" — explicitly flagged as Chainguard Academy's framing [s08] in `uncertainties.md`. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to a sources.jsonl entry.
- The unused-source diff is empty: every source in `sources.jsonl` is cited at least once.
- All `accessed` dates are 2026-05-21.

## 3. Reasoning gaps

- The taxonomy (seven approaches) is editorial; this is acknowledged in §6 and `uncertainties.md`. **OK.**
- §5.4 distinguishes tamper-evidence vs availability — this is an interpretive separation but each branch carries primary citations. **OK.**

## 4. Missing counter-evidence

- A natural counter: "ZK proofs subsume much of the tamper-evidence pattern via SNARK-based attestations." Briefly acknowledged in §6 as out of scope. **Nit.**
- A second counter: "Some claims that 'IBM Food Trust' is effectively private and not blockchain-relevant." Not surfaced. **Nit.**

## 5. Tone and structure

- Abstract reflects the body (seven approaches, nine products, two integrity senses). **OK.**
- Limitations honestly reflect `gaps.md` and `uncertainties.md`. **OK.**
- Pattern × product matrix is dense but readable. **OK.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 2 (deferable: surface ZK-proof counter; surface "private chain ≠ blockchain" critique)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
