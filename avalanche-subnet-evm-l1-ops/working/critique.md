# Critique — 2026-09-10

## Citation integrity
- Every `[^sNN]` in both drafts resolves to `working/sources.jsonl` (34/34); no source is uncited. Checked by script.
- Quotes in the draft were compared against the `quote` field of each source. Two paraphrases tightened: the 80% rule (s22) and the upgrade.json persistence rule (s11) are now verbatim in both languages.

## Unsupported / over-reached claims
- "P-Chain does not validate blocks" (§6.1) — inference from s07/s01, not a quoted sentence. Kept as analysis; the sentence before it cites what P-Chain *does* do. Not must-fix.
- "L1 node needs lower spec because it holds no C-Chain state" (§4.4) — inference from s02 (atomic txs/shared memory removed) + s06 tiers. Marked as reasoning, not quoted. Nit.
- Figure 2 shows `completeValidatorRegistration` as an operator call. s05 describes the P-Chain reply; the completing call is in s21 ("anybody can complete"). Caption cites s05/s21-adjacent sources; acceptable.
- 5-validator PoA arithmetic (§5.2) is the author's, derived from the quoted 80% rule. Fine.

## Conflicts represented
- Fee: 1.33 (ACP-77, AvaCloud) vs "approximately 1.3" (Foundation blog). Both shown.
- L1 count: 52/69/524 — deliberately not stated; recorded in Limitations.

## Source diversity
- Ava Labs-hosted material dominates (22 of 34). Counter-weight: OP docs, Arbitrum docs, Cosmos SDK, Coin Bureau, Nansen, an anonymous Substack, two vendor blogs. Vendor sources are marked `_(vendor-stated)_` on every numeric claim they support.

## Voice (plain-prose pass)
- Repeated openers: none (script: first three words of every paragraph, both languages).
- Em-dashes: 7 per draft, all in mandated figure captions (`_Figure N — …_`) or the mandated `_(unverified — single source)_` marker. Zero in body prose.
- `not X but Y`: Korean draft reduced from 3 to 1 (§2.1, an actual correction of the "owner issues P-Chain txs" assumption). English: 1 (same place).
- No parallel-march closer; §7 ends on the single misreading the report exists to correct.
- Section lengths are uneven by design: §5 (operations) is the longest because it holds the failure modes; §6.4 adoption is short because the evidence is thin.
- Korean draft was written first and the English written separately, not translated sentence-for-sentence.

## Diagrams
- Three mermaid blocks per draft: flowchart (architecture), sequenceDiagram (deployment), flowchart (decision). Each has an italic caption citing sources. No `;` in any sequence label. Rendered page checked in a browser after publish (see below).

## Must-fix
- none open.

## Nits (deferred)
- §6.2 "Cosmos halts below ⅔" cites a vendor table; a CometBFT primary would be better.
- Granite date left out of body; could be added once the blog body is fetchable.
