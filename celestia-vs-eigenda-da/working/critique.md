# Critique

Self-critique pass on `draft.md` and `draft.en.md` for Celestia-vs-EigenDA.

## Must-fix
- None outstanding. Validate-report passes; every footnote in the drafts resolves to a source in `sources.jsonl`; every cited source has at least one `claim_refs` entry.

## Resolved during drafting
- **Single-source factual claim (Manta Pacific adoption, s14):** flagged with `_(unverified — single source)_` in both drafts.
- **Vendor-stated throughput (EigenDA 100 MB/s):** flagged `_(vendor-stated)_` in both drafts.
- **Interpretive claim about DAS vs retrieval-based model (c13/c17):** flagged `_(interpretive)_`.
- **Conflict between EigenLabs framing and Avail's DAC framing of EigenDA:** both views presented in Comparative Analysis without silent resolution.
- **Slashing-as-future-state risk:** explicitly flagged `_(early signal)_` in Discussion.

## Defer (nits)
- Korean draft uses Korean technical terms transliterated alongside English (e.g. "약속/commitment"); acceptable house style for a bilingual modular-blockchain report.
- Some sources cluster around vendor blogs (Celestia docs, EigenCloud blog); independent counterweights present via L2BEAT (s11, s12), Avail Project blog (s07), CoinDesk (s04, s06), and the Al-Bassam et al. paper (s08). Source diversity is acceptable for the topic but could be deepened with a peer-reviewed comparative survey if one becomes available.

## Source diversity check
- Tier 1 (peer-reviewed): s08, s09.
- Tier 2 (primary/official docs and blogs): s01, s02, s03, s05, s10, s13, s15, s16, s17, s18, s19.
- Tier 3 (technical writing): s11, s12.
- Tier 4 (news): s04, s06, s14.
- Tier 4 (competing-vendor analysis): s07.

## Counter-evidence check
- The Avail Project blog (s07) is included specifically as a non-friendly view of EigenDA's model and as a competing-vendor view of Celestia; this is the most natural counter-evidence available.
- L2BEAT walk-throughs (s11, s12) are explicitly independent of both vendors and surface risk language.

## Uncertainties surfaced honestly
- See `working/uncertainties.md`.

Conclusion: No must-fix items. Report is ready for the publish phase.
