# Critique — Canton and Daml

Self-critique pass. Categories: must-fix (blocks publish), should-fix (address before next iteration), nit (optional).

## Must-fix
- None identified. Every footnote in `draft.md` and `draft.ko.md` resolves to an entry in `sources.jsonl`. Every major claim in `claims.md` is cited. Interpretive claims are tagged in prose.

## Should-fix (deferred; recorded here for transparency)
- **Wikipedia citation (s02) is trust=4.** It's used twice for the 2024 mainnet launch date. The Linux Foundation release (s03) independently places the GSF announcement at July 1 2024, and Wikipedia's date is consistent with the Canton Coin rewarding-utility blog (s07), which references the 2024 launch. Good enough for a factual date; swap for a harder primary timestamp in a later revision if easily fetchable.
- **Canton whitepapers (s05, s06) are access_limited.** Their textual content was not extractable by our fetcher. They are cited as primary sources only where corroborated by s04 / s07 / s08, which is defensible but not ideal. A future revision should extract the PDFs locally and refresh quotes.
- **CryptoNinjas (s19) is a news outlet on a tier-4 publication.** It corroborates the Digital Asset 2019 open-source announcement but would be stronger if paired with an archived Digital Asset press release. Not a publish-blocker.

## Counter-evidence / conflicts surfaced
- Broadridge's headline volumes are trade volumes, not protocol throughput; the draft makes this distinction explicitly in §6 to avoid reader confusion.
- Super-Validator reward splits are quoted from two slightly different framings across the ecosystem (Digital Asset docs vs third-party blogs). The draft cites only the vendor docs (s08) with an "evolving" qualifier.

## Style and structure
- Section 2 is intentionally long because the licensing story is where builders most often get surprised; balance feels right for the topic.
- Korean draft mirrors the English draft 1:1 in structure and footnotes; no divergence in claims.

## Decision
No must-fix items. Draft is publish-ready; proceeding to validate / render / prepublish-check.
