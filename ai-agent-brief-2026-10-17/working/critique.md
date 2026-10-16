# Critique

## 1. Unsupported claims
No uncited factual assertions found outside the standard `[^sNN]` pattern; every paragraph in "What moved" and "Why it matters" traces back to a cited source. The "Why it matters" synthesis paragraph is interpretive (explicitly framed as a reading across items already cited individually), which is appropriate for that section.

## 2. Citation integrity — **must-fix found and fixed**
- **Found:** `draft.md` and `draft.ko.md` cited `[^s06]` for the Replit/TechCrunch claim and `[^s07]` for the AP2-dormancy claim, but `working/sources.jsonl` has `s06` = AP2 commit history and `s07` = TechCrunch Replit piece — the refs were swapped from what they pointed to. **Fixed:** swapped all four occurrences (two in each language file) so `[^s06]` now points to AP2 commits and `[^s07]` to TechCrunch, matching `sources.jsonl`.
- All seven `[^sNN]` refs used in the draft exist in `sources.jsonl`; no orphaned or unused source IDs.
- All seven source `accessed` dates are 2026-10-17 (today), well within 90 days.
- `curl -L` against all 7 URLs returned 200.
- Spot-checked quotes for s01 (OpenAI misalignment report), s03 (Cloudflare), s04 (x402 PR #3827) against live-fetched page content gathered during drafting — all three quotes are verbatim or near-verbatim excerpts actually present on the page.

## 3. Reasoning gaps
- "Why it matters" draws a three-way pattern (authorization-layer gap) from three items; this is stated as a reading, not a proven causal claim, and is appropriately hedged ("None of these are coordinated").
- The "sixth consecutive edition" count for x402 activity is a claim about this brief's own sampling history, not an external fact — acceptable as self-referential continuity tracking, consistent with how prior editions phrased it.
- No "most people" / "everyone" / "no one" generalizations found.
- The 362-address figure and the June 26 / September 25 dates are given with source and timeframe; no bare numbers without denominator.

## 4. Missing counter-evidence
- Ran one additional web sweep for dissenting/contextual coverage of the OpenAI wallet incident and the Replit/Anthropic claim specifically. Found: TechCrunch's own reporting already supplies the counter-evidence for Replit (named insiders disputing Masad's claim), which is represented in the draft. No independent source disputes OpenAI's account of the wallet incident; this is noted in Limitations as a single-source account on OpenAI's internal reasoning.
- No must-fix counter-evidence gap identified.

## 5. Voice — **must-fix found and fixed**
- **Em-dash density (must-fix):** initial draft had 23 em-dashes across 9 paragraphs, including six sentences with two dashes used as a paired parenthetical (a "never two in one sentence" violation) and one paragraph with 4. Fixed by converting paired dashes to colons, commas, or parentheses, and splitting one long sentence. Final count: 3 em-dashes total, none paired within a single sentence, none exceeding one per paragraph. Korean draft had 9 dashes with the same paired pattern in two places; both fixed (converted to sentence breaks / commas), consistent with the skill's note that the dash is not native Korean punctuation.
- **"Rather than" / "이 아니라" density (must-fix):** English had 4 occurrences; reduced to 2 by converting two to plain assertions. Korean had 5 occurrences of 아니라; reduced to 3 (one in a section heading, one in the abstract's central Cloudflare claim, one in "why it matters" — each corrects a real reader assumption rather than supplying rhythm).
- **Repeated section formula:** checked first four words of each paragraph and each subsection's last sentence — no repeated template phrase found across the four "What moved" items. Each item's closing sentence is different in both content and grammatical shape (a continuation thread for Cloudflare, an open question for x402, a disputed-claim framing for Replit).
- **Section length:** lengths already track substance — the OpenAI item gets two full paragraphs (the most load-bearing finding), Cloudflare and Replit get one each, x402 gets one longer paragraph given the technical detail. No padding found.
- **Parallel-march closer:** "Why it matters" does not restate all four items as matched one-liners; it picks the three that share the authorization-gap pattern and states the one synthesis, then stops. No change needed.
- **Rhyming bullets ("Signals to watch"):** checked grammatical form of each of the 5 bullets — mix of "Whether X", "Any Y", not uniform; acceptable as-is (nit: first three do start with "Whether", a mild rhyme, but each covers structurally different content — judgment call, not mechanical repetition).
- **Announced significance:** no instances of "Taken together," "It is worth noting," "즉," "결론적으로," found via grep.
- **Mirror translation:** read both drafts side by side — section order and claims match (required for a shared citation set), but sentence structure, clause order, and phrasing diverge throughout; the Korean is not a sentence-for-sentence mirror (e.g., the Abstract's sentence boundaries differ between languages, and the Korean uses different connector choices and emphasis points).

## 6. Diagrams
No message order, state machine, delegation chain, or topology appears in this brief's content — the four items are a disclosure, a scoring system description, a spec PR, and a contested executive statement, none of which has a "shape" that a diagram would clarify beyond the prose. No diagram added; this is a correct omission, not a gap (nit only, noted for completeness).

## 7. Must-fix vs nit summary
- **Must-fix (2, both resolved):** citation ID swap (s06/s07); em-dash and "rather than" / 아니라 density in both languages.
- **Nits (2, no action required):** mild rhyme in first three "Signals to watch" bullets; no diagram (correctly judged unnecessary).

No must-fix items remain open.
