# Critique

## 1. Unsupported claims
Every factual sentence in the "What moved" sections carries a `[^sNN]` ref on the paragraph that introduces the claim. The "Why it matters" section makes an interpretive claim (today's pattern vs. prior editions) that is explicitly framed as analysis, not a new factual assertion, and draws only on the three already-cited items. No must-fix.

## 2. Citation integrity
- All three `[^s01]`–`[^s03]` refs exist in `working/sources.jsonl`; `validate-report` confirms no orphaned or missing refs.
- All three sources have `accessed: 2026-11-08`, well within 90 days.
- URL check via `curl -L`: all three return HTTP 200 (Stripe blog, Google Developers Blog, GitHub PR).
- Quote spot-check: the Stripe quote ("Agents can now have structured access...") and the Google quote ("What is easy for humans to skim past...") were pulled verbatim from the fetched page text during the scouting pass. The mppx quote is the PR's own description text, verified against `gh pr view`/`gh api` output captured during scouting. No mismatches found.

No must-fix.

## 3. Reasoning gaps
- Google's percentages (13%, 6%, 83%, 41%, 57%, 39%, 70%/77%/105%) are all given with a stated base (file-reading sessions, encounters, detours) and come from one dated source — correctly hedged `_(vendor-stated — ... no outside replication)_` rather than presented as generalizable fact.
- "Why it matters" draws a cross-item pattern from exactly three data points. This is flagged explicitly in the prose as a reading of this window only ("If this keeps up..."), not asserted as an established trend — acceptable for a brief's analysis section, not a must-fix.
- No "everyone/no one" generalizations found in either draft.

No must-fix.

## 4. Missing counter-evidence
Ran one additional web search sweep (`Mastercard Agent Pay OR Visa Trusted Agent Protocol OR PayPal agentic commerce news November 2026`, `x402 OR AP2 OR UCP agent payment protocol news November 2026`) specifically looking for dissent or counter-moves against the "quiet quarter for protocols" framing in Limitations. Found no November 2026 coverage disputing or qualifying that reading — results topped out at Q2 2026 analysis pieces already summarized in `gaps.md`. No counter-evidence to add.

## 5. Voice
Ran the `plain-prose` revision pass over both drafts.

- **Repeated section formula**: checked first four words of every paragraph (see below) — no repeats found. No must-fix.
  - Three items cleared / This edition covers / Stripe shipped / This is a narrower / Google published / The finding is / mppx merged / Where Zalando's / None of today's / Card-network and
- **Em-dash density**: found two sentences with two em-dashes each (Stripe's parenthetical aside; mppx's CI-gap sentence) — **must-fix, fixed**: Stripe's aside converted to parentheses, mppx's sentence rewritten without dashes. Korean draft had the same mppx double-dash sentence — **must-fix, fixed**.
- **"Rather than" / "not X but Y"**: two occurrences in English (Stripe's purpose contrast, mppx's typed-error contrast), both correcting a real misreading (agents querying vs. agents paying; typed error vs. raw retry) rather than decorative — within budget, no fix needed.
- **Rhyming bullets**: "Signals to watch" bullets open with "Whether / A second organization / Whether / Any" and close on varied phrasing (at all / generalizes / release / silent) — not a rhyme set. No fix needed.
- **Parallel-march closer**: "Why it matters" makes one single point about the window's pattern rather than restating each item — no fix needed.
- **Announced significance**: no "taken together / it is worth noting / 결론적으로 / 즉" found in English. Korean draft had one "즉" in the mppx paragraph — **must-fix, fixed** (removed along with the em-dash rewrite).
- **Mirror translation**: compared Korean and English paragraph by paragraph. Sentence boundaries, connective choice (각, 즉 removed, 반면 avoided), and clause order diverge from the English in each section — not a sentence-for-sentence mirror.

## 6. Diagrams
None of this window's three items describes a message order, state machine, delegation chain, or topology complex enough to need a diagram — Stripe's item is a data-access feature, Google's is a measurement finding, and mppx's Zone-payment flow is adequately described in one sentence (withdraw → server verifies settlement event). A sequence diagram here would restate that one sentence in boxes. Correctly omitted; not flagged as a nit.

## 7. Summary
- **Must-fix found and fixed**: 3 (English em-dash double-up ×2 sentences; Korean em-dash double-up + 즉, same sentence).
- **Nits**: 0.

All must-fix items were revised in `draft.md` and `draft.ko.md`. Re-ran `validate-report ai-agent-brief-2026-11-08`: passed.
