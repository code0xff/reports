# Critique

## 1. Unsupported claims
Checked every paragraph in `draft.md` against `[^sNN]` coverage. Findings:
- All factual assertions in "What moved" carry a citation. The "Why it
  matters" section is explicitly synthesis/interpretation and does not
  introduce new facts beyond what §"What moved" already cited, so it is not
  held to per-sentence citation — consistent with how prior briefs in this
  series have treated the synthesis section.
- No must-fix. **0 findings.**

## 2. Citation integrity
- All 6 (now 7, after the counter-evidence pass added s07) `[^sNN]` refs used
  in `draft.md` and `draft.ko.md` exist in `sources.jsonl`, and every source
  in `sources.jsonl` is used by at least one ref in both languages.
- All `accessed` dates are `2026-09-09` — within 90 days.
- Spot-checked HTTP status on all 7 URLs: all returned `200`.
- Spot-checked exact quote text against the live page for s02 (TechCrunch),
  s04 (The Hacker News), and s05 (GitHub PR body via `gh api`): all three
  quotes are verbatim substrings of the fetched page/API response. s01, s03,
  s06, s07 were extracted directly from a single WebFetch pass each and are
  used as short paraphrase-quotes; no discrepancy found on re-fetch.
- `harness.py validate-report ai-agent-brief-2026-09-09` → `ok`.
- **0 must-fix.**

## 3. Reasoning gaps
- No causal claims stronger than the evidence: the "Why it matters" section
  explicitly states "None of this week's items required the others to
  happen," avoiding a false-causation read of three coincidental stories.
- Numbers carry timeframe/denominator: "40 previously undocumented... across
  86 verification cases" (has denominator); "under six hours" (has an
  explicit window, sourced to GTIG's own telemetry, flagged as
  single-vantage-point in Limitations and Uncertainties).
- No "everyone/no one" generalizations found.
- **0 must-fix.**

## 4. Missing counter-evidence
Ran a second web sweep specifically hunting for dissent on the two headline
items:
- **Meta Muse**: found that Meta opened a public bug bounty at launch (up to
  $300k, up to $130k for prompt injection) and stated it is sharing design
  and source with external auditors, with a continuous public audit planned
  (`research.meta.ai`, added as **s07**). This is a material fact that was
  missing from the original draft — the section originally implied Meta's
  own account was the *only* account, when in fact Meta has already invited
  outside testing, just not yet produced results. **Must-fix — added.**
  Draft revised (English and Korean) to state the bug bounty exists, with
  the caveat that an invitation is not yet a completed audit. The "Signals
  to watch" bullet was rewritten from "will anyone test this" to "did the
  bounty pay out and what did it find" now that the mechanism is confirmed
  to exist.
- **GTIG report**: searched for direct rebuttal of the specific six-hour
  credential-harvesting finding; found none. Found a published critique
  (flyingpenguin.com, 2026-05-12) of GTIG's attribution methodology, but it
  targets an earlier, separate GTIG report (on AI-assisted vulnerability
  exploitation), not this one. Treating it as a direct rebuttal of *this*
  finding would misrepresent it. **Nit** — added to `uncertainties.md` as
  general-caution context (GTIG's attribution track record has been
  challenged before) rather than folded into the draft body as if it
  disputed this specific report.
- **MPP/XRPL and the Tamarin paper**: no counter-evidence sought beyond what
  is already flagged — the PR has no independent coverage (noted in-draft as
  vendor/spec-sourced) and the paper's findings are not yet triaged for
  real-world exploitability (noted in `uncertainties.md`).

## 5. Voice
Ran the `plain-prose` mechanical checks via `grep` on both `draft.md` and
`draft.ko.md` after the initial draft and again after the counter-evidence
revision:
- **Repeated section formula**: none found. First sentences of the three
  "What moved" subsections open differently (a date-led lede, a
  timeline-led lede, a "two smaller developments" lede); no colon-label
  repeated across items.
- **Em-dash density**: every paragraph in both languages has at most one
  em-dash; none has two in a single sentence. (Two paragraphs originally had
  2 each — line 48 and 54 pre-revision — both rewritten.)
- **"Not X, but Y" / `rather than` / `이 아니라`**: reduced to exactly one
  surviving instance per language (the GTIG "tool orchestration... not
  autonomous exploit discovery" contrast, which corrects a real likely
  misreading of the finding). Four other instances in English and three in
  Korean were rewritten as plain assertions.
- **Rhyming bullets**: "Signals to watch" bullets use varied grammar
  (whether-clauses, a fragment, a full statement); not all five rhyme.
- **Parallel-march closer**: "Why it matters" ends on the single synthesis
  point (the industry has moved from debating the boundary to building one)
  rather than restating all three items in matched one-liners.
- **Announced significance**: no "taken together" / "it is worth noting" /
  "즉" / "결론적으로" found.
- **Mirror translation**: Korean draft was written independently per section
  (verified by comparing sentence counts and clause order per paragraph —
  they diverge, e.g. the Korean Muse section restructures the Sentinel
  quote's surrounding sentence rather than mirroring English clause order).
- **0 must-fix, 0 nits remaining** after revision.

## 6. Diagrams
- One diagram (Figure 1, Muse/Sentinel sequence) in both `draft.md` and
  `draft.ko.md`, labels translated, structurally identical.
- Subtractive test: deleting it would cost the reader the delegation-chain
  shape (propose → gate → approve/deny → release credential) that the prose
  around it only partially conveys in words; kept.
- Caption cites `[^s01]`, matching the sourced architecture description.
- No `;` inside any message or note label (checked by eye and via
  `validate-report`, which passed).
- **Rendered-page check**: ran `render-report`, which wrote
  `<pre class="mermaid">` blocks into both language pages and confirmed
  `prepublish-check`'s mechanical trap scan (semicolons in labels, etc.)
  passes clean. This sandbox has no Node runtime or browser available (no
  `node`, `npx @mermaid-js/mermaid-cli`, or headless browser could run), so
  the diagram was **not** visually confirmed rendering in an actual browser
  as PROTOCOL.md §3 asks — only checked by hand against mermaid
  `sequenceDiagram` grammar (matched `alt`/`end`, valid `->>`/`-->>` arrows,
  `<br/>` instead of a literal newline, no `;` in any label) and by the
  harness's static checks, both of which are clean. Recorded as a residual
  risk in `working/gaps.md` rather than asserted as verified.
- No other section in this brief describes a shape (message order, state
  machine, topology) without a diagram — the GTIG and MPP items are
  narrative/prose-appropriate. **0 must-fix.**

## 7. Summary
- **Must-fix found: 1** (missing counter-evidence on Meta's bug bounty /
  external-audit posture) — **fixed** in both languages, plus a new source
  (s07) and an update to `working/uncertainties.md`.
- **Nits found: 1** (GTIG attribution-methodology caveat) — **addressed** by
  adding scoped context to `working/uncertainties.md` without overstating it
  as a rebuttal of this report.
- No must-fix items remain open.
