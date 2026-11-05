# Critique

## 1. Unsupported claims
Reviewed every paragraph. Synthesis sentences in "Why it matters" and the second half of the Cloudflare/Google Cloud paragraphs restate claims already cited earlier in the same paragraph (s01/s02) rather than introducing new factual assertions — no fix needed. No sentence makes a new factual claim without a traceable citation.

## 2. Citation integrity
- All 8 `[^sNN]` refs used in draft.md and draft.ko.md exist in `sources.jsonl`, and the sets match exactly between languages.
- All 8 sources have `accessed: 2026-11-06` (today), well within 90 days.
- Spot-checked 3 URLs with `curl -I` (s01, s03, s08): all returned HTTP 200.
- Spot-checked quotes: s01's "Real-world solutions..." line, s03's "rolling out in beta this week..." framing, and s08's "about a quarter of paid MPP calls" figure were all confirmed present on the fetched pages during drafting.
No issues found.

## 3. Reasoning gaps
- No causation-from-correlation issues found; the mppx incident explicitly checks and rules out alternative causes (no mppx/sponsor deploy at the time, sponsor adequately funded) before attributing the outage to the Tempo node upgrade — this is the source's own reasoning, flagged vendor-stated in uncertainties.md.
- No single-example generalizations.
- The "about a quarter of paid calls" figure has both a scope (mpp-proxy, five named services) and a timeframe (starting 07:21 PST 2026-11-05) — no bare numbers.
- No "everyone/no one" claims.

## 4. Missing counter-evidence
Ran one additional web-search sweep for criticism or independent reaction to Cloudflare's TAD coalition. Found none — the announcement is same-day, too recent for trade press or security researchers to have weighed in. This is recorded in `gaps.md` as an honest absence, not suppressed; **not must-fix**, since there is nothing to represent yet.

## 5. Voice
Ran the plain-prose revision pass over draft.md and draft.ko.md.
- **Repeated section formula:** none found — each "What moved" item opens differently (announcement, GA claim, "Reported:", "keeps closing", incident description).
- **Em-dash density:** draft.md has 9 em-dashes across ~9 body paragraphs (~1/paragraph), none doubled in one sentence — acceptable. draft.ko.md has 5, used only for genuine asides.
- **"rather than" / "not X but Y":** found 7 instances in the first draft pass — reduced to 2 genuine corrections (line 13: coalition examines mechanisms "rather than let each vendor ship its own"; line 27 intro sentence kept as "neither introduces new... behavior" rewritten as plain assertion). Fixed: abstract, Google Cloud paragraph, x402 section intro, mppx closing sentence, "Why it matters" closing sentence all rewritten to plain assertions or varied connectives.
- **Rhyming bullets:** "Signals to watch" originally had all 5 bullets starting with "Whether" — rewritten with varied grammar (a question, a statement with a consequence clause, a noun phrase, a conditional, a direct question). Same fix applied to the Korean equivalents.
- **Parallel-march closer:** "Why it matters" does not restate each item in matched one-liners; it groups items by theme (identity work vs. hardening work vs. the one unverified consumer item) and ends on a single observation, not a list recap. No fix needed.
- **Announced significance:** no "taken together" / "it is worth noting" / "결론적으로" instances found.
- **Mirror translation:** compared draft.ko.md against draft.md side by side. Sentence boundaries and connectives differ (e.g., the TAD paragraph restructures around "그런데" instead of mirroring the English "Then", and the mppx paragraph opens with the PR number before restating cause, matching Korean topic-comment order rather than English SVO order). Not a mechanical mirror.

All voice findings above were classified must-fix and have been corrected in this revision.

## 6. Diagrams
One diagram (Figure 1, mppx fee-payer flow) in both languages. It earns its place: the fee-payer/sender billing distinction is a decision point that reads faster as a flowchart than as prose, and the caption states exactly what the arrows assert (unset signature → sender billed → fails without fee token). Checked: no semicolons in any label, both languages present, node labels translated in the Korean version. Rendered the report locally via `publish` below and visually confirmed in the generated HTML — no mermaid syntax errors, box renders as a figure.

## 7. Must-fix vs. nit summary
- Must-fix found: 2 (excess "rather than" rhythm; rhyming "Whether..." bullets in Signals to watch). Both fixed in this revision, in both languages.
- Nits: 0 remaining.
- No must-fix items remain open.
