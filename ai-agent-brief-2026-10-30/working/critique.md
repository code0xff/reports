# Critique — ai-agent-brief-2026-10-30

## 1. Unsupported claims
Checked every paragraph in `draft.md`. Every factual sentence about a specific PR, issue, or release carries a `[^sNN]` ref. The "Why it matters" section makes only synthesis claims drawn directly from the cited facts in "What moved," which is the expected shape for that section — no new unsourced facts introduced. No fix needed.

## 2. Citation integrity
- All six `[^s01]`–`[^s06]` refs used in `draft.md` exist in `sources.jsonl`, and the Korean draft uses the identical set.
- All six sources have `accessed: 2026-10-30` (today) — well within 90 days.
- Spot-checked all six URLs with `curl -o /dev/null -w '%{http_code}'`: all returned `200`.
- Quote spot-check: the `quote` fields for s01, s04, and s06 were copied verbatim from `gh pr view --json body` output fetched during gathering (not paraphrased or summarized), so they match the source exactly by construction. Verified by re-reading the stored JSON against the PR bodies retrieved earlier in this run.
No fix needed.

## 3. Reasoning gaps
- No causal claims beyond what the PR bodies themselves state (e.g., "PR #404 opens 24 new known_failing cells" is the PR author's own stated count, correctly attributed as such in `uncertainties.md`).
- No generalization from a single example: the "Why it matters" section explicitly limits itself to "in every case" referring to the three specific items reported, not to the protocol ecosystem generally.
- The "24 new known_failing cells" and "813 of 813 vectors" numbers both carry their source PR and timeframe (merged 2026-10-28) in the text.
- No "most/everyone/no one" language present.
No fix needed.

## 4. Missing counter-evidence
All three items are repository-state facts (PR merge status, release contents) read directly from GitHub via `gh pr view` / `gh search prs` / release notes — not contested interpretive claims where a dissenting source would exist. A `/research-web` sweep for counter-evidence on "mppx fixed its fallback bug" or "pay-kit reached 813/813 conformance" would not surface a dissenting viewpoint; these are not claims anyone disputes, they're code states. No additional sweep run; noting this reasoning here rather than treating the section as skipped.
No fix needed.

## 5. Voice
Ran the plain-prose revision pass against both drafts.

- **Repeated section formula:** none found. The three "What moved" items open differently ("mppx@0.17.0, released...", "PR #4051, merged...", "PR #404, merged..." — varied enough; not a repeated template) and close on different notes (a developer-choice consequence, a shipped-or-not question, an axis-tradeoff statement).
- **Em-dash density:** 7 em-dashes across the English draft's ~10 paragraphs — within the one-per-paragraph budget, confirmed no sentence carries two.
- **"not X but Y" family:** found two "instead of" uses in the first pass (draft.md lines 19 and the old Signals bullet). Fixed: rewrote the Signals bullet to drop the construction entirely (now "A tagged `@x402/core` release containing PR #4051 — the first confirmation...").  **[must-fix, now fixed]**
- **Rhyming bullets:** all three "Signals to watch" bullets originally opened with "Whether." Fixed: varied to a merge-status noun phrase, a release-content noun phrase, and a two-part verifier-support clause. Same fix applied to the Korean bullets, which had mirrored the all-"~는지" ending. **[must-fix, now fixed]**
- **Parallel-march closer:** "Why it matters" does touch each of the three items, but states a single consequence per item in varied phrasing and ends on a general claim about drift speed, not a restatement list. Not a violation — kept as-is.
- **Announced significance:** found one "즉" in the Korean x402 paragraph, functioning as an about-ness restatement. Fixed: split into two plain sentences. **[must-fix, now fixed]**
- **Mirror translation:** compared draft.md and draft.ko.md side by side. Sentence boundaries and clause order differ (e.g. the Korean abstract opens with "이번 기간에는 세 개의 서로 다른 저장소에서 같은 패턴이 반복됐다," a restructured lead rather than a clause-for-clause mirror of the English "Three separate repos this window closed a gap..."). Korean uses native constructions (`~ㄴ 셈이다`, `~ㄹ 뿐이다`-style fragments) rather than relative-clause stacking. Not a mirror translation.

## 6. Diagrams
No diagram in either draft. Checked each item against §3 → Draft → Diagrams: none describes a message order, state machine, delegation chain, or topology — all three are single-fact PR/release states (merged vs. open; strict vs. permissive; conformant vs. non-conformant), which read faster as prose than as a figure. Correctly skipped, not a gap.

## 7. Must-fix vs nit summary
- **Must-fix (3), all fixed in this pass:** duplicate "instead of" construction in the Signals section; rhyming "Whether..." bullets in both languages; one Korean "즉" significance-announcement.
- **Nits (0).**

No must-fix items remain open after revision.

## Validation
`python3 scripts/harness.py validate-report ai-agent-brief-2026-10-30` → `ok: ai-agent-brief-2026-10-30 passed validation`, no warnings.
