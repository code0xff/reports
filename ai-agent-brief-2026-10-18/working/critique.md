# Critique

## 1. Unsupported claims
Checked every paragraph in `draft.md` against `sources.jsonl`. All factual assertions carry a `[^sNN]` ref except framing/transition sentences (e.g. "None of this is a payment protocol shipping") which are the report's own analysis, not factual claims requiring a citation. No fix needed.

## 2. Citation integrity
- All `[^sNN]` refs in `draft.md`/`draft.ko.md` resolve to entries in `sources.jsonl` (`validate-report` passes clean, no unresolved-citation or uncited-source warnings).
- All sources carry `accessed: 2026-10-18`, well within 90 days.
- Spot-checked HTTP status for s01, s03 (now s05 — adk-recipes blog), s03-original-techcrunch (dropped, see below): all returned 200.
- Spot-checked quotes: s01's CERT-In quote ("exceeded the authorisation of their assigned tasks") and s05's adk-recipes quote ("machine readability as the primary consideration") were both confirmed present via direct WebFetch of the source page. s09 (Cloudflare/OpenAI) quote confirmed via direct WebFetch.

**Must-fix, resolved during drafting:** the original scouting pass treated "Amazon blocks Meta's Muse" / The Verge's October 17 synthesis piece as this window's third "what moved" item. Checking the underlying dates showed the Amazon/Muse block is from late September and Cloudflare's crawler-default change from September 15 — outside the 72-hour window and not a new development, just a magazine recap. Pulled that item and its sources (former s03/s04) entirely, replaced with the Cloudflare/OpenAI discovery-pilot disclosure (genuinely dated 2026-10-15, within window). Recorded the reasoning in `gaps.md` so a future edition doesn't re-introduce the same recap as "news" if it resurfaces.

## 3. Reasoning gaps
- No causation-from-correlation issues found: each "what moved" item states only what the source states, and "Why it matters" is explicitly framed as this edition's interpretive reading, not a factual claim.
- No single-example generalizations: the India item is explicitly qualified as "the fourth jurisdiction," not a universal claim.
- Numbers (hundreds of millions of pages, 1% of network, five and a half months of AP2 dormancy) all carry their source and, where relevant, a caveat that the figure is vendor-stated and unverified (see `uncertainties.md`).
- No "everyone/no one" claims beyond "none of the affected organizations found the intrusion on their own," which is directly supported by the TechCrunch India article's own framing across all four cited incidents.

## 4. Missing counter-evidence
Ran additional WebSearch sweeps targeting: (a) any CERT-In dispute or provider denial — none found; (b) any resolution or update to the Amazon/Muse situation — none found, which is part of why that item was dropped rather than kept with a stale "ongoing" framing; (c) any card-network (Visa/Mastercard) news in-window — none found, consistent with the established AP2/ACP/UCP/MPP/L402/TAP dormancy pattern already noted. No counter-evidence surfaced that contradicts a claim actually made in the draft.

## 5. Voice
Ran the `plain-prose` revision pass on both drafts after the item swap:
- **Repeated section formula:** checked first-four-words of every paragraph and last sentence of every subsection in both languages — no repeats found.
- **Em-dash density:** EN 3 em-dashes across ~9 paragraphs (under 1/paragraph); KO 1. Neither has two in one sentence.
- **"Rather than" / "아니라":** EN reduced from 5 to 1 occurrence (kept the one in the Cloudflare/OpenAI section header, which is a real distinction between crawl-heuristics and identity-verification, not rhythm). KO reduced from 9 to 1 occurrence, same section kept for the same reason.
- **Rhyming bullets:** EN Signals bullets open with "Whether" (3x) and "Any" (1x) — acceptable variety for a 4-item list; KO bullets varied to avoid uniform "~는지" endings on all four.
- **Parallel-march closer:** "Why it matters" states the single shared gap once, does not restate each item in matched one-liners.
- **Announced significance:** no "taken together," "읫을 종합하면," or similar filler found.
- **Mirror translation:** KO draft was written as independent Korean prose (different sentence boundaries, different clause order) rather than a sentence-for-sentence mirror of the English; spot-checked side by side.

**Nit:** the "Why it matters" paragraph in both languages is a single ~6-sentence paragraph tying three items together — at the upper bound of length but not split, since the three clauses build one argument rather than three separable points.

## 6. Diagrams
None of this window's three items describe a message order, state machine, delegation chain, or topology — CERT-In's disclosure is a single accusatory finding, the Cloudflare/OpenAI item is a data-pipeline description better served by prose, and the adk-recipes item is a repo structure (three folders), which is already clearly enumerable in a sentence. No diagram added; none would survive the "does the reader lose anything if deleted" test.

## 7. Must-fix vs nit summary
- **Must-fix (1, resolved):** dropped the stale Amazon/Muse "what moved" item and replaced it with a genuinely in-window item; cleaned up `sources.jsonl`, `claims.md`, `gaps.md`, `uncertainties.md` to match.
- **Must-fix (1, resolved):** em-dash and "rather than"/"아니라" density were both over budget before the voice pass; rewritten down to within budget in both languages.
- **Nits (2, accepted as-is):** "Why it matters" paragraph length in both languages; KO signals-bullet grammar variety was adjusted but remains a judgment call rather than a hard rule violation.

No must-fix items remain open. `validate-report` passes clean.
