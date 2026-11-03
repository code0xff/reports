# Critique — ai-agent-brief-2026-11-04

## 1. Unsupported claims

Reviewed every paragraph in `draft.md`. Each factual sentence carries a `[^sNN]` ref at the paragraph or sentence level, except framing/transition sentences that make no new factual claim (e.g. "The six: ..." as a list opener, "Separately, ..." as a connector). The "Why it matters" section's characterization of mppx's session-payment feature as "newer, less-scrutinized" is an inference, not a sourced fact — flagged and already logged in `uncertainties.md`. **Nit** (already hedged in uncertainties, not presented as a bare fact).

## 2. Citation integrity

- All 14 `[^sNN]` refs in `draft.md` (s01–s14) exist in `sources.jsonl`; no orphan refs, no uncited sources. Confirmed by diffing the ref set against the source-id set.
- All 14 sources have `accessed: 2026-11-04` — well within 90 days.
- Spot-checked 3 URLs via `curl -L -o /dev/null -w "%{http_code}"`: s01, s12, s13 all returned `200`.
- Quotes were taken directly from `gh pr view --json body` / `gh issue view --json body` output at fetch time, not transcribed from memory, so quote-to-page mismatch risk is low. Not independently re-spot-checked word-for-word against the rendered page, but the quotes are short, verbatim substrings of the JSON `body` field captured in this session.

No findings here rise to must-fix.

## 3. Reasoning gaps

- The "4% of paid Exa searches" figure has both a numerator and denominator (44/1,016) and an explicit timeframe (one hour) — already stated in the draft, not a bare percentage. OK.
- No "most people" / "everyone" / "no one" language found (`grep` clean).
- The "Why it matters" paragraph draws a contrast with "last edition's" pattern (one reviewer working a backlog) — this is a comparison across two specific, named editions, not a general trend claim, and is accurate against the 2026-11-03 draft read in Phase 0. OK.
- One single-example generalization risk: PR #1164's production numbers come from one integrator (Mercator) hitting one upstream (Exa). The draft does not generalize beyond this one incident — it reports Mercator's own report. Already caveated in `uncertainties.md` and `gaps.md`. Not must-fix.

## 4. Missing counter-evidence

All five items are merged, shipped bugfixes in open-source repos (x402-foundation/x402, wevm/mppx) — not contested claims, product announcements, or predictions with a plausible opposing view. Checked for dissent: no open issue or PR comment disputing any of the five merges was found during Phase 1 scouting. A targeted counter-evidence sweep (e.g. "x402 facilitator hook fix controversy" or "mppx session payment security concerns") was not run as a separate step because there is no claim here of the shape that invites a dissenting view — the closest candidate, whether PR #4052 "closes" issue #4050, is already hedged correctly in the draft ("tracking the gap... opened for TypeScript's exact scheme" — not claimed as fully closing #4050, and `gaps.md`/`uncertainties.md` note #4052 explicitly says it "does not close" #4050). Not must-fix.

## 5. Voice

Ran the plain-prose revision pass.

- **Repeated section formula:** checked first-four-words of each paragraph and each subsection's closing sentence. No repeated phrase found across items (`grep` of common closer templates returned nothing). No colon-label-under-every-item pattern (rejected that structure during drafting). OK.
- **Em-dash density:** initial draft had two sentences with two em-dashes each (the `tempo()` spending-limits parenthetical, and the "Three PRs — ... —" list intro). **Must-fix, fixed**: converted both to parentheses/commas. Re-checked after fix — now 6 em-dashes across 6 paragraphs (including one figure caption), max 1 per paragraph.
- **"not X but Y":** one legitimate instance ("not just bugs" — a real correction of what the reader might assume from "six fixes"). No others found in English. Korean has one matching instance ("단순 버그가 아니라 보안 구멍"), used for the same correction, not decoratively. Within the one-per-document budget. OK.
- **Rhyming bullets:** "Signals to watch" has three bullets; two open with "Whether" and one opens with "Independent confirmation of". Mild repetition but not a uniform template (not 3-for-3, grammar varies: two are implicit questions, one is a noun-phrase instruction). **Nit**, not must-fix.
- **Parallel-march closer:** "Why it matters" ends on mppx's session-payment surface specifically, not a restated list of all five items. OK, no closer violation.
- **Announced significance:** `grep` for "Taken together", "Read together", "It is worth noting", "worth noting", "즉", "결론적", "이를 종합" — no matches in either file. OK.
- **Mirror translation:** read EN and KO side by side. Korean uses different sentence breaks, different clause order, and drops the subject where natural (e.g. "여섯 건은 이렇다" instead of mirroring "The six:"); not a sentence-for-sentence translation. OK.
- Section lengths track importance: items 1 and 2 (the production incident and the six-bug sweep) are the longest; item 4 (the auth-capture fix) is a single short paragraph. This is intentional, not uniform. OK.
- No paragraph exceeds 6 sentences in either language. No emoji, no marketing language.

**Must-fix found and fixed:** the two double-em-dash sentences (now corrected in `draft.md`).

## 6. Diagrams

One mermaid `sequenceDiagram` in the "A retried Tempo broadcast..." subsection, present in both `draft.md` and `draft.ko.md` with translated labels/notes. Checked:
- Earns its place: the item describes a message order (client → server → RPC, retry, misclassification, fix) that is genuinely clearer as a sequence than as prose. Deleting it would lose the before/after contrast the `rect` blocks carry.
- Caption cites what the arrows assert (`[^s01]`), matching PROTOCOL.md's rule.
- No `;` inside sequence labels; labels in both languages use `<br/>` for line breaks inside notes, consistent with the harness's mermaid conventions used in prior briefs (e.g. 2026-11-03's `stateDiagram-v2`).
- Rendered page checked after `render-report` (see below) — figure displays, no syntax-error box.

No other subsection in this edition has a shape (state machine, topology, delegation chain) that would benefit from a second diagram; the six-bug mppx sweep is a flat list, not a sequence, and a diagram there would be decorative.

## 7. Summary

- **Must-fix: 1** (double em-dash sentences) — fixed during this pass.
- **Nits: 2** (inference framing in "Why it matters" already hedged in uncertainties; mild "Whether/Whether" bullet-opener repetition in Signals to watch).

No must-fix items remain open after revision. `validate-report ai-agent-brief-2026-11-04` passes.
