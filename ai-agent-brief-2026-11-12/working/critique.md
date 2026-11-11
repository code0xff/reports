# Critique

## 1. Unsupported claims
None found. Every factual sentence in the three "What moved" sections carries a `[^sNN]` ref. The "Why it matters" and "Signals to watch" sections are synthesis/forward-looking and correctly carry no new factual claims beyond what's already cited above them.

## 2. Citation integrity
- All five `[^s01]`–`[^s05]` refs resolve to entries in `sources.jsonl`; no orphan refs.
- All five sources have `accessed: 2026-11-12` (today) — well within 90 days.
- Spot-checked all 5 URLs with `curl -L`: all returned HTTP 200.
- Quote spot-check: s01's CBS quote matches the fetched content reported by the research agent; s04's A2UI quote ("the first stable version of our open protocol for generative UI") matches the agent's direct fetch; s05's PR-body quote matches `gh pr view 1274 --json body` output verbatim. s02 is marked `access_limited: true` with no quote (fetch timed out twice) — correctly flagged rather than fabricated. s03 (HN) quote is a factual description of the thread (title + score/comments), not a misattributed claim.

## 3. Reasoning gaps
- No causation-from-correlation issues found — each item's claims are direct (what a company/PR did), not inferred effects.
- No single-example generalization: the "Why it matters" section explicitly scopes its claim to "this window" and three named systems, not a universal trend claim.
- Numbers (199 points, 203 comments, version numbers) all carry source and context.
- No "everyone/no one" language present.

## 4. Missing counter-evidence
Searched for criticism or dissent on the United AI-agent restriction (query: "United Airlines AI agent ban reaction criticism overblown"). Found nothing specific to this story — search results surfaced an unrelated, earlier United/Delta/Southwest humanoid-robot cabin ban (a different policy, different topic) and general United-AI chatbot criticism from earlier in the year. No counter-evidence on the booking-agent restriction itself was found to omit. Not a must-fix.

## 5. Voice
- **Repeated section formula:** none found. First-four-words extraction across all paragraphs and sub-sections shows no repeated openers or colon-label pattern.
- **Em-dash density:** EN draft: 5 em-dashes across ~13 paragraphs (well under 1/paragraph); none with two in one sentence after revision. KO draft: 2 em-dashes.
- **"not X, but Y":** EN has 1 (`rather than` — "concrete rather than categorical"), within the 1-per-document budget. KO has 4 occurrences of `~이 아니라 ~` but each corrects a distinct, real contrast (categorical vs. concrete reasons; request-time vs. construction-time failure; silent gap vs. bug; reading directly vs. via a quoted excerpt) in different sections — not a repeated rhythmic tic. Judged a **nit**, not must-fix, since each instance carries distinct factual content rather than decorative parallelism.
- **Rhyming bullets:** "Signals to watch" bullets vary in grammar (a question, a noun phrase, a "whether" clause, a statement) — no rhyme.
- **Parallel-march closer:** Limitations section lists distinct, unrelated gaps in varying lengths, not a restatement of the three "What moved" items. No closer restates all three items in matched form.
- **Announced significance:** no "taken together" / "it is worth noting" / "결론적으로" found via grep.
- **Mirror translation:** KO draft was written independently per section (different sentence counts, different clause order, different connective words — e.g. the Why-it-matters section's EN uses three short independent clauses per system, KO restructures as full sentences with different rhythm). Not a sentence-for-sentence mirror.

No must-fix voice findings.

## 6. Diagrams
None included. None of the three items (a corporate access policy, a protocol version bump already covered by ecosystem-status prose, a one-PR bugfix) has a message order, state machine, or topology distinct enough to earn a diagram beyond what the previous edition's sequence diagram already showed for the underlying mppx identity flow. Judged correctly omitted, not a nit — a diagram here would illustrate nothing not already said in one sentence.

## 7. Summary
**Must-fix: 0. Nits: 1** (the KO `~이 아니라~` frequency, judged acceptable on inspection since each instance is factually distinct).

`validate-report ai-agent-brief-2026-11-12` passed with no warnings.
