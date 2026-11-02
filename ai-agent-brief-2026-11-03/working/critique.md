# Critique

## 1. Unsupported claims
Every factual sentence in each "What moved" subsection carries a `[^sNN]` ref tying it to a PR or issue body quoted verbatim via `gh pr/issue view`. The "Why it matters" and "Signals to watch" sections are interpretation, correctly left uncited, and the interpretation is hedged in `uncertainties.md`. No unsupported factual claim found. **Nit**: the Abstract's "of real consequence" (SVM bug) and "with no way... to collect" (mppx bug) are characterizations rather than quotes, but both are directly supported by the cited issue bodies' own descriptions of impact.

## 2. Citation integrity
- All 11 `[^s..]` refs in `draft.md` and `draft.ko.md` resolve to `s01`–`s11` in `sources.jsonl`. No orphan refs, no uncited sources.
- All 11 sources have `accessed: 2026-11-03` — same day, well within 90 days.
- Spot-checked URL reachability (curl HEAD-equivalent) on s01 (PR #4080), s08 (PR #4033), s10 (PR #1157): all returned 200.
- Quote spot-check: all 11 quotes were extracted directly from `gh pr view`/`gh issue view` JSON output during collection, not paraphrased after the fact, so they match the source bodies by construction. Verified s01, s08, s10 word-for-word against the retained tool output.

## 3. Reasoning gaps
- "Why it matters" draws a generalization ("x402 and its adjacent protocols are getting the kind of attention that finds bugs like these") from three bugs across two repos in one 48-hour window — a small sample, flagged explicitly in `uncertainties.md` as an editorial reading, not a trend claim. Kept as framed; **nit**, not must-fix, since the hedge is present and visible.
- No claims about "most" / "everyone" / "no one" present.
- The one quantified claim without a denominator issue: "2,890 unit and MCP tests... 32 confirmation-and-retry regressions" — these numbers come straight from the PR body and are presented as what the PR's own CI run reported, not as an external measurement, so no denominator is owed.

## 4. Missing counter-evidence
Searched x402 PR #4102 (the cleanup sweep) for review comments or dissent: only one comment, a Vercel deploy-bot notice, no technical pushback. Searched for maintainer or community skepticism of the "review attention is increasing" reading: none found — this is this edition's own interpretation, not a claim being made by a third party, so there is no counter-claim to represent. No must-fix here.

## 5. Voice
Ran the plain-prose mechanical checks on both `draft.md` and `draft.ko.md`:
- **Repeated section formula**: first-four-words check across all "What moved" paragraphs showed no repeated opener. Each subsection leads differently (PR number, issue number, or "Issue #1044 described...").
- **Em-dash density**: revised during drafting so every paragraph in `draft.md` carries at most one `—`; verified with `awk` paragraph-split count, zero paragraphs over 1.
- **"rather than" / "not X but Y"**: two uses total in `draft.md` ("rather than" ×2), zero of the templated "X rather than Y" rhythm the skill flags; both are plain corrections, not decorative contrast. Acceptable.
- **Rhyming bullets**: "Signals to watch" bullets open with "Whether", "Whether", "Whether" — all three share the same opener. **Must-fix.**
- **Parallel-march closer**: "Why it matters" ends on a single synthesis sentence, not a per-item restatement. No closer violation.
- **Announced significance**: removed "Read together with" during drafting (flagged by the skill's explicit example list) and replaced with a plain causal sentence. No remaining instances of "Taken together" / "it's worth noting" / "즉" / "결론적으로".
- **Mirror translation**: Korean draft was composed independently (different sentence counts and ordering within paragraphs, e.g. the mppx paragraph splits differently in Korean than English), not a line-for-line mirror. Korean-specific tells (다만/오히려/이는 chains, `~것이다` habit endings) not present on inspection.

**Fixed**: the three "Signals to watch" bullets all opened with "Whether" (지켜볼 신호 bullets all ended in the same `~지` form). Revised both languages to vary grammar: a question, a plain statement needing an imperative, and a statement with a trailing question. No must-fix remains.

## 6. Diagrams
The mppx replay mechanism (settle → forward → disconnect-or-finish → retry-with-recovery) is a state machine, so a `stateDiagram-v2` was added to both `draft.md` and `draft.ko.md` with a cited caption (`[^s10]`). No other section describes a message order, delegation chain, or topology that would earn a second diagram — the x402 fixes are isolated one-line/two-line code changes, not protocols with a shape. Caption cites the source its states rest on. Both languages carry a translated version. No `;` inside any state label. **Will re-render and open the page before publish to confirm no syntax-error box** (tracked below, must-do before publish, not a critique must-fix since it is a build-time check).

## 7. Must-fix vs nit summary
- **Must-fix (1, fixed)**: "Signals to watch" bullets all opened with "Whether" / `~지` — revised to vary grammar in both languages.
- **Nits (2)**: Abstract characterizations are interpretive paraphrase rather than quotation (acceptable, but noted); "Why it matters" generalization from a 3-item/48-hour sample is explicitly hedged already, flagged only for visibility.

No must-fix items remain open.

Structure check: Abstract is faithful to the body (names all three items, in the same order as "What moved"). Limitations section matches `gaps.md` content (card-network silence, AP2's bug backlog, UCP's inactivity, single-domain sourcing) with no omissions. No emoji or marketing language found. No paragraph exceeds 6 sentences (longest is 4). Section lengths track importance: the x402 parity-bug section (most developed, 2 paragraphs) is longest, the SVM and mppx sections are one paragraph each, proportional to a 3-item day.
