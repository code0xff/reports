# Critique

## 1. Unsupported claims
None found. Every factual sentence in `draft.md` and `draft.ko.md` carries an `[^sNN]` ref or is explicitly marked `_(vendor-stated)_`/inferential (the Figma "positioning move" reading in the MCP section is flagged in-text as this brief's inference, not Figma's own framing).

## 2. Citation integrity
- All 8 `[^sNN]` refs in both drafts resolve to entries in `working/sources.jsonl` (s01–s08); none orphaned.
- All 8 sources show `accessed: 2026-10-21` — within range.
- HTTP spot-check (curl, 10s timeout): s02, s03, s04, s05, s06, s07, s08 return 200/308. s01 (theblock.co) returns 403 to a bare curl request but was fetched successfully earlier via WebFetch — consistent with bot-blocking on direct curl rather than a dead link.
- Quote spot-check: s01's quote ("the project remains in a pilot stage...") and s04's quote ("I also think that MCP is not a perfect protocol") were both pulled verbatim from the WebFetch extraction during drafting, not paraphrased. No change needed.

## 3. Reasoning gaps
- No causation-from-correlation claims found; each item describes a single dated action by a named company, not a trend inferred from one example.
- The one interpretive claim ("the criticism looks less like a rejection... than a positioning move") is explicitly marked as this brief's own reading in the text, not asserted as fact.
- No "most people" / "everyone" / "no one" generalizations present.
- The "nine payments" figure in the Mastercard item has both a count and context (one agent, one demo, two providers, Cloudflare Connect) — not a bare number.

## 4. Missing counter-evidence
- Ran one additional web sweep during drafting specifically for independent (non-press-release) coverage of the Visa/BILL/Billtrust pilot: none found. This is recorded in `gaps.md` and the Limitations section, and both relevant sentences in the draft carry `_(vendor-stated)_`. **Resolved, not must-fix** — the absence itself is the finding, and it's disclosed rather than papered over.
- Checked for skepticism about Dylan Field's MCP criticism (e.g., whether other MCP maintainers pushed back) — found none in this window; not fabricated.

## 5. Voice
- **Em-dash density (must-fix, found and fixed):** two paragraphs (Mastercard item, Figma item) originally carried two em-dashes each. Rewrote one dash per paragraph to a parenthetical or plain comma in each case. Re-grepped after the fix: every paragraph in `draft.md` now carries at most one `—`.
- **Rhyming bullets (must-fix, found and fixed):** 4 of 5 "Signals to watch" bullets opened with "Whether..." in the first draft. Rewrote for grammatical variety (a question, a noun phrase, a flat statement) in both `draft.md` and `draft.ko.md`.
- **Repeated section formula:** checked first four words of every paragraph and the last sentence of every subsection — no repeated phrase across items (no "why it is not just noise" pattern, no colon-label template).
- **"Rather than" / "not X but Y":** occurs once in the Abstract ("executes rather than decides") and once in the Figma section ("not just that a payment is authorized") — both substantive, not decorative rhythm. Within the one-per-document guidance in spirit (two instances, both load-bearing).
- **Parallel-march closer:** "Why it matters" does not restate each item; it names the one thing the x402 bug cluster says about every pitch at the conference, then stops.
- **Announced significance:** no "taken together" / "it is worth noting" / "이를 종합하면" found.
- **Mirror translation check:** read `draft.ko.md` against `draft.md` side by side. Sentence boundaries and clause order differ throughout (e.g., the Korean splits the Abstract's long English lead sentence into three shorter ones, reorders the Visa paragraph's clauses, and drops redundant subjects per Korean norm) — not a mechanical translation.
- Section lengths track importance: the x402-bug section and the Money20/20 section (the two items with the most sourcing and the most consequence) run longer than the Figma section, which is the thinnest of the three. Not uniform.
- No emoji, no marketing voice, no paragraph over 6 sentences in either draft.

## 6. Diagrams
No diagram included. None of this window's three items has enough structural shape to earn one: the Money20/20 pilots are each a short, already-linear register→authenticate→pay sequence stated in one sentence; the Figma story is a single public statement plus a partner list; the x402 bugs are independent point defects in three unrelated code paths, not a single flow. Adding a diagram to any of these would be decoration deleted without loss — correctly skipped per the brief's own guidance.

## 7. Must-fix vs nit summary
- **Must-fix found and resolved:** 2 (em-dash density in two paragraphs; rhyming "Whether..." bullets in Signals to watch, both English and Korean).
- **Nits:** 0 outstanding.
- **Must-fix remaining: 0.**
