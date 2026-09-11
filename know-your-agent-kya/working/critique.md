# Critique — 2026-09-11

## Citation integrity
- All refs resolve; all 29 sources cited (checked by script after a renumbering fix: the first draft had s24/s13/s12/s27/s25/s23 pointing at the wrong records — Skyfire release, AP2, propagation paper, Sumsub CTO, Visa coverage, Sumsub launch — corrected by context-scoped replacement and re-verified against the id→title map).
- Quotes cross-checked against `quote` fields. The Fourez, Popov, Zholudev, Cohen-style quotes are verbatim.

## Over-reach checks
- Figure 1 is the author's taxonomy; the caption says so ("배치한 것") and cites every product it places.
- Figure 2 explicitly disclaims being either network's actual sequence.
- "Visa TAP has no Verified Agent ID / directory" — phrased as absence from primary sources, recorded in Limitations.
- Article 50 reading relies on one law-firm summary (s23); the sentence "does not require verifying the agent" is the summary's, attributed.
- §7's reference to the A2A threat-model paper is prose recall from this site's A2A report, not a citation here; kept as an unsourced aside? No — reworded to cite nothing and stand as analysis. (Checked: the sentence names the finding without a footnote; acceptable as interpretive, but flagged as nit.)

## Conflicts represented
- Skyfire: homepage claims principal binding (s02) vs product page listing checkpoints/badges (s20). Both quoted; judgment withheld.
- KYA origin 2024 (s01) vs first primary 2025-06 (s27). Both dated.

## Source diversity
- 5 peer/preprint papers, 9 primaries (Visa, Cloudflare, FIDO, OpenID, IETF, DIF ×2, AP2, Skyfire ×2), 6 news, 4 vendor blogs, 1 law firm, 1 tier-5 explainer used only for the naming claim and marked single-source.

## Voice
- Em-dashes in body prose: 0 (both). Captions/markers only.
- Korean `이 아니라`: 1 remaining, inside a translated AP2 quote. English: 0 "not X but Y" patterns as rhythm.
- Repeated openers: none. Section lengths track content: §3 is the spine, §6 is one paragraph because the finding is one sentence.

## Diagrams
- 2 per draft, flowchart TB + sequenceDiagram. No `;` in labels. Render check after publish.

## Must-fix
- none.

## Nits
- §7 A2A-paper aside could cite arXiv:2602.11327 directly if added as a source.
- Mastercard's own token-framework page (403) would replace the PYMNTS paraphrase.
