# Critique — 2026-09-16

## Citation integrity
- All refs resolve; all 29 sources cited (script). Quotes compared to `quote` fields; Sketchfab, DeviantArt, RFC 9309, CAWG, NRF quotes are verbatim.

## Over-reach checks
- "No major AI company honours noai" rests on Originality.AI (s05, vendor). Phrased as "no large operator committed to reading it", attributed. Google's spec omission is quoted.
- "Sketchfab has not enforced the clause" phrased as not-found; in Limitations.
- The Hamburg conflict (LG per EPRS vs OLG per NRF/Encypher) is presented as two rulings at two instances, with BGH appeal noted; the "time-of-collection" inference is labelled vendor-stated.
- TripoSR "trained on Objaverse CC-BY subset" is the model card's own statement; the inference that NoAI played no role is the author's and is stated as such ("selection criterion in which the tag plays no part").
- Andersen trial slip: tier-5 only, marked.
- Figure 2 arrows: EU chain (Art.4 → Art.53 → list) is sourced; the dotted "signal irrelevant" edges to US/UK are the author's characterisation of rulings that do not mention signals — caption says so.

## Conflicts represented
- LG Hamburg (natural-language OK, per s16) vs OLG Hamburg (not OK, s29/s25).
- Andersen: September 2026 trial (search snippet) vs April 2027 (s23) — the later, dated source used, caveated.
- Objaverse: Sketchfab "before the tag" vs Decoder "NoAI-tagged models included" — both quoted; consistent if tags were applied retroactively to already-collected models.

## Source diversity
- 4 papers/proceedings, 12 primaries (Sketchfab ×3, DeviantArt, W3C, IETF, CAWG, CC ×2, EPRS, Commission, RFC), 6 news, 3 law-firm notes, 3 vendor blogs, 1 tier-5 tracker (used once, marked).

## Voice
- Body em-dashes: KO 0; EN 2, both inside verbatim quotes. `이 아니라`: 1 (the §4 heading-level assertion "CC와 NoAI는 양립하지 않는다" is not that pattern; the one instance is in §5.2 "신호가 아니라 공정이용" as a section title — acceptable as the report's single corrective).
- Repeated openers: none. Section weights: §2 and §5 longest by design; §6 short because two papers settle it.

## Diagrams
- Two flowcharts (timeline TB, jurisdiction LR with subgraphs). No sequence labels with `;`. Render check after publish.

## Must-fix
- none.

## Nits
- CG Channel Nov-2023 article would replace the search-abstract corroboration if it becomes reachable.
- Objaverse-XL source-share percentages (56% GitHub etc.) appeared only in a search abstract and were left out.
