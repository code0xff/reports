# Critique — ai-agent-brief-2026-10-12

## 1. Unsupported claims
None found. Every factual sentence in `draft.md` and `draft.ko.md` carries a `[^sNN]` ref; framing/analysis sentences in "Why it matters" are explicitly marked as synthesis rather than fact and don't need one.

## 2. Citation integrity
- All `[^s01]`–`[^s08]` refs used in both drafts resolve to entries in `sources.jsonl` (s01–s08, no gaps).
- All 8 sources have `accessed: 2026-10-12`, well within 90 days.
- Spot-checked 3 URLs: `blog.cloudflare.com/clef-faster-cheaper-multimodal/` (200) and `github.com/coinbase/x402/commits/main` (200) resolve directly; `bleepingcomputer.com/...` returns 403 to a plain curl request (bot-blocking on the publisher's side) but was successfully fetched and read via WebFetch during drafting — not a dead link.
- Quotes in `sources.jsonl` for s01, s04, s05 match text pulled directly from the fetched pages during drafting, not from feed/search summaries.

## 3. Reasoning gaps
- No causation-from-correlation claims. The CrowdStrike attribution is explicitly reported at the source's own "moderate confidence," not upgraded to certainty.
- The Shinhan (~25,000) vs. KB Kookmin (119) discrepancy is stated as an open discrepancy, not resolved or averaged.
- No "everyone"/"no one" generalizations. "Anthropic has not issued a public statement" is a dated, falsifiable claim, not a sweeping one.

## 4. Missing counter-evidence
Searched for dissenting readings of the ARTEX incident (e.g., downplaying AI's role vs. framing it as proof agentic tools are categorically dangerous) and found none distinct enough from the CrowdStrike-sourced reporting already cited — coverage across BleepingComputer, ThePrint/Reuters, and Security Affairs converges on the same facts rather than disputing them. No counter-evidence found for Cloudflare's or Sophos's vendor claims either; the absence of independent benchmarking is already flagged in `gaps.md` and in the draft's own text (Clef/Clef-omni accuracy, Daybreak's selection criteria) rather than glossed over.

## 5. Voice
- Em-dash count rechecked after revision: no paragraph in `draft.md` carries more than one, no sentence carries two.
- `rather than` appears once in `draft.md` (the Sophos/Anthropic/NBER verification-gap sentence), correcting a real distinction rather than decorating a sentence — kept.
- No repeated colon-label template across the three "What moved" items; each opens differently and runs a different length (2, 3, 2 paragraphs).
- "Signals to watch" bullets vary grammatically: a yes/no question, a compound question, a noun phrase, a question, a statement ending in a question — not a rhyming list.
- "Why it matters" does not restate each item in a matched one-liner; it states one throughline and stops.
- No "Taken together" / "Read together" / "It is worth noting" / 이를 종합하면 / 결론적으로 found via grep.
- Korean draft read side-by-side with English: paragraph order and claims match (as required, since sources are shared), but sentence structure, clause order, and connective choices differ — not a mirror translation. Korean uses native constructions (그치지 않고 avoided, 즉 avoided) rather than templated connectors.

## 6. Diagrams
The ARTEX/Claude Code item has real shape — one attacker-run orchestrator routing to four model backends — so a `flowchart` was added to both languages with translated labels and a caption stating what the arrows assert (CrowdStrike's reconstruction, not a verified technical topology). No other item in this brief has a shape worth drawing (Clef-omni is a single product update; Sophos/Daybreak is a before/after metric, not a topology), so no diagram was added there — consistent with the rule that a diagram should earn its place rather than decorate.

## 7. Must-fix vs. nit
No must-fix items. No nits beyond what's already noted above as resolved during drafting (em-dash density and the one earlier double-em-dash sentence, fixed before this critique was written).
