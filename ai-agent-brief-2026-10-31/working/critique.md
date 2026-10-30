# Critique

## 1. Unsupported claims
None found. Every factual sentence in each "What moved" subsection carries an `[^sNN]` ref, and the Why-it-matters / Signals / Limitations sections are explicitly interpretive synthesis over already-cited facts, consistent with how prior editions (e.g. 2026-10-30) treat that section.

## 2. Citation integrity
- All 6 `[^sNN]` refs in `draft.md` and `draft.ko.md` resolve to an id in `sources.jsonl` (s01–s06); no orphan refs, no uncited sources.
- All 6 sources show `accessed: 2026-10-31` — within policy.
- Spot-checked 3 URLs with `curl -L -o /dev/null -w "%{http_code}"`: s01 (TechCrunch), s02 (x402 PR #3971), s06 (mppx PR #1138) all returned `200`.
- Quotes in `sources.jsonl` were taken verbatim from the fetched page / `gh pr view` body text at gather time (not reconstructed from a summary), per PROTOCOL.md §3 → Draft → Voice sourcing rules.
- `validate-report ai-agent-brief-2026-10-31` passes with no warnings.

**Status: no must-fix.**

## 3. Reasoning gaps
- Checked for causal overreach: the "Why it matters" section explicitly frames its observation as a pattern across four independent repos, not a causal claim between them. No fix needed.
- DoorDash's number is explicitly flagged in-draft as a CEO's rounded estimate, not an audited figure — avoids treating it as precise.
- No "everyone/no one" generalizations found.
- All numeric claims (29% fee cut, 4.2x fewer transactions, 15s/25s windows, several hundred orders vs. ~3M daily) carry their source and, where relevant, their timeframe/denominator inline.

**Status: no must-fix.**

## 4. Missing counter-evidence
- Ran one additional WebSearch + WebFetch sweep looking for independent corroboration of DoorDash's "several hundred orders" figure. Found only a pymnts.com article about DoorDash's **Q2** 2026 call (Aug 2026), which discusses agentic volume being "low" but gives no figure and is not about the same Q3 call TechCrunch reported — not corroboration, and not contradiction either. No dissenting view found. This gap is recorded in `gaps.md` and the claim is marked `_(unverified — single source)_` in both drafts, per the brief-specific style rule. This does not block publication (PROTOCOL.md's single-source marker convention exists precisely for this case).
- The mppx/x402/pay-kit items are primary-source code claims (PR bodies, diffs, test counts); there is no "opposing view" to seek for a merged PR's own description of what it changed.

**Status: no must-fix** (gap disclosed, not hidden).

## 5. Voice
Ran the plain-prose mechanical checks via grep on both `draft.md` and `draft.ko.md`.

- **Repeated section formula:** first-four-words and closing-sentence check across all four "What moved" subsections — no repeated phrase found across items. **(checked, clean)**
- **Em-dash density:** initial draft had 2 paragraphs with 2 em-dashes each (one with two in a single sentence). **Must-fix, fixed**: rewrote the DoorDash paragraph (removed one dash, made it two sentences), the pay-kit paragraph (one dash removed via "because" conjunction), the Why-it-matters paragraph (one dash replaced with a colon), and the mppx-identity paragraph's double-dash parenthetical (replaced with parentheses) — same fix applied in Korean. Re-checked: every paragraph in both languages now has at most 1 em-dash, none has 2 in one sentence.
- **"Not X, but Y" / rather than:** one real correction kept (mppx §: "measured the challenge's expiry... not the signed `validBefore` value" — this *is* the bug, not decoration). The one decorative "rather than" in the identity paragraph was rewritten as a plain statement. **Must-fix, fixed.**
- **Rhyming bullets:** "Signals to watch" / "지켜볼 신호" originally had all 4 bullets start with "Whether…" / end in "…는지" — a rhyme-the-slots pattern. **Must-fix, fixed**: rewrote with varied grammar (a "whether X, and whether Y" clause, a colon-plus-options noun phrase, a question-shaped clause, and a short fragment) in both languages.
- **Parallel-march closer:** "Why it matters" restates each item but in varied sentence shapes (contrast clause, dependent clause, short declarative), not matched one-liners — judged acceptable, **nit only**.
- **Announced significance:** no "taken together / it is worth noting / 결론적으로 / 이를 종합하면" found. One Korean "즉" used as a restating connective was flagged as a borderline about-ness tell and rewritten as a standalone assertion. **Must-fix, fixed.** A second "즉" (meaning "i.e., a breaking change") is a plain explanatory gloss, not significance-announcing — left as is, **nit, no change needed**.
- **Mirror translation:** Korean draft was composed independently (different paragraph breaks, different connective choices, idiomatic phrasing like "날이 서 있다," "핀을 박아") rather than translated sentence-for-sentence from English. **Checked, clean.**
- **Paragraph length:** "Why it matters" ran 7 sentences in English. **Must-fix, fixed**: merged two clauses to bring it to 6. Korean equivalent paragraph was also tightened by merging two short sentences.
- **Emoji / marketing voice:** none.
- **Section lengths track importance:** the DoorDash item (new real-world data) and the identity-breaking-change item run longer; the two short interior paragraphs (pay-kit's dependency) are deliberately shorter. Proportional, not uniform.

## 6. Diagrams
No diagram included. None of today's four items describes a message order, state machine, delegation chain, or topology with enough shape to earn one — they are a single earnings-call quote and three narrative bug-fix/breaking-change writeups. Confirmed as a deliberate omission, not an oversight (PROTOCOL.md §3 → Draft → Diagrams: skip when nothing has a shape worth drawing). **Nit, no diagram added.**

## 7. Summary
- **Must-fix found: 6** (em-dash density/double-dash sentences in 2 paragraphs × 2 languages treated as one class; rhyming bullets in Signals-to-watch × 2 languages; one decorative "rather than"; one paragraph over length; one Korean "즉" restating connective). **All 6 fixed in this pass.**
- **Nits: 3** (parallel-march closer judged acceptable as-is; one Korean "즉" gloss judged acceptable as-is; no-diagram decision noted for the record).
- **Open must-fix after revision: 0.**

`validate-report ai-agent-brief-2026-10-31` re-run after fixes: passes clean.
