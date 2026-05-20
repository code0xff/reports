# Critique — simplex-and-alpenglow-consensus

Adversarial pass. Findings are classified as blocking (must fix before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §4.1 governance result (98.27%, 1.05% opposed, 0.69% abstain) — quoted from PANews [s11]; cross-referenced with CoinDesk [s10] and CoinSpeaker [s12] which mention the same vote. **OK.**
- §4.2 fast-path / slow-path thresholds — quoted directly from SIMD-0326 [s05] and Helius [s06]. **OK.**
- §4.3 five-certificate definitions and indirect finalisation — quoted verbatim from SIMD-0326 [s05]. **OK.**
- §4.4 Rotor single-shred design — quoted from Helius [s06]; the 18 ms / 1 Gb/s figure is tagged `_(unverified — single source)_` per Alchemy [s07]. **OK.**
- §4.6 20+20 model — quoted from both SIMD-0326 [s05] and the Anza blog [s04]. **OK.**
- §5 pseudocode blocks — reconstructed from SIMD-0326 [s05] and external technical analyses; clearly labelled as derived from the spec rather than verbatim Anza code. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to a sources.jsonl entry.
- Seven sampled URLs returned 200 or 301 (Sei follows a redirect). All accessed dates are 2026-05-20.

## 3. Reasoning gaps

- §6 / §7 trade-off framing (33% Byzantine vs 20+20) is sourced from SIMD-0326 [s05], Sei [s08], and Anza [s04]; the report does not silently pick a winner — it surfaces the Sei critique alongside the Anza framing. **OK.**
- §3.4 benchmarks (400 / 480 / 1840 / 2480 ms) are sourced from simplex.blog [s01] and explicitly flagged as "author-published" both in §3.4 and in `uncertainties.md`. **OK.**

## 4. Missing counter-evidence

- A natural counter: "Alpenglow's 2,000-validator cap is a hard centralisation step backward." Surfaced indirectly in §7.2 via Sei [s08]; could be expanded. **Nit.**
- A second counter: "PoH removal sacrifices Solana's wallclock-ordering UX." Not surfaced. **Nit.**

## 5. Tone and structure

- Abstract reflects the body (paper identity, fast/slow path, BLS aggregation, 20+20, governance milestones). **OK.**
- Limitations honestly reflect `gaps.md` and `uncertainties.md`. **OK.**
- Pseudocode blocks are clearly labelled and quoted from the spec. **OK.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 2 (deferable: expand 2,000-validator centralisation discussion; surface PoH-removal UX counter)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
