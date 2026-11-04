# Critique

## 1. Unsupported claims
Checked every paragraph in `draft.md` against its citations. All factual
assertions carry a `[^sNN]` ref except the Introduction's cross-links and the
single transition sentence in "Why it matters" ("Split today's five items...")
and the Signals-to-watch framing sentences, which are editorial framing, not
new factual claims — no fix needed.

## 2. Citation integrity
- All 13 `[^s..]` refs used in `draft.md`/`draft.ko.md` exist in
  `sources.jsonl`; `validate-report` confirms no orphan refs and now zero
  never-cited sources (s13 added to the Signals bullet after the first
  validation pass flagged it).
- All 13 sources show `accessed: 2026-11-05` (today) — well within 90 days.
- Spot-checked 4 of 13 sources against the live page/API:
  - s01 (TechCrunch Uber): quote "It is very, very early and very limited
    traction that we are seeing so far" confirmed present, attributed to
    Dara Khosrowshahi on the 2026-11-04 earnings call.
  - s02 (Cloudflare blog): quote re: per-agent Allow/Block/Block-on-ads policy
    confirmed present verbatim.
  - s04 (x402 issue #3689): quote re: "the exception is logged and the loop
    continues as if the hook had passed" confirmed present in the issue body.
  - s09 (mppx PR #1168): quote re: automatic payment paths signing relayed
    challenges / losing policy through nested adapters confirmed present in
    the PR body.
  No dead links; all GitHub URLs resolve, both news URLs resolve (The Verge's
  parallel Uber piece was dropped rather than cited, since it could not be
  fetched — see `gaps.md`).

## 3. Reasoning gaps
- No causation-from-correlation issues found; every causal statement (e.g.
  "the fix recovers the receipt instead of discarding the claim") restates
  what the PR description itself says the code does.
- Single-example generalization check: the "why it matters" claim that mppx's
  session-payment subsystem has produced the same failure class three times
  is based on three distinct, named PRs across three editions (#1155, #1156,
  #1168), not one example — acceptable.
- Numbers all carry a timeframe and denominator (Uber: 4 rides / ~320M
  trips+orders, week of Halloween; DoorDash: "a few hundred," prior edition).
- No "everyone"/"no one" claims in the final draft (the TechCrunch headline
  itself uses "almost no one," but the draft's own prose avoids restating
  that as fact and instead gives the exact figures).

## 4. Missing counter-evidence
Ran one additional web check for dissenting views on the Uber/DoorDash
framing (e.g. a vendor or analyst arguing agent-commerce adoption is actually
proceeding faster than these two companies' numbers suggest). Found nothing
dated inside the window; the DoorDash and Uber disclosures are the only dated
primary data points on agent-order volume this week, and no rebuttal surfaced
in feeds or web search. Not a must-fix: the draft already hedges with
`_(vendor-stated)_` and notes in Limitations that these are company-reported
figures with no independent measurement.

## 5. Voice
Ran the `plain-prose` revision pass over both `draft.md` and `draft.ko.md`.

- **Repeated section formula:** none found. First four words of each
  paragraph differ; no colon-label repeats across items.
- **Em-dash density:** found and fixed. Original draft had up to 3 em-dashes
  in a single paragraph (Cloudflare, gate-hook, and mppx sections). Revised
  to at most 1 per paragraph, converting the rest to periods, commas, or
  parentheses. Final count: 2 em-dashes total in `draft.md` (both in the
  Figure 1 caption and one Signals bullet, each a single dash in its
  sentence), 1 in `draft.ko.md`. **Must-fix, resolved.**
- **"rather than" / "아니라":** found and fixed. English had 3 "rather than"
  instances; reduced to 0 (rewrote as plain assertions). Korean had 2 "아니라"
  instances; reduced to 1 (kept the one in "Why it matters" that corrects a
  real misreading — protection wasn't absent, it silently failed). **Must-fix,
  resolved.**
- **Rhyming bullets:** Signals-to-watch bullets vary in grammar (a yes/no
  question, a conditional clause, a flat statement, a feature note) — no fix
  needed.
- **Parallel-march closer:** "Why it matters" does not restate each item in
  matched one-liners; it states one through-line and stops. No fix needed.
- **Announced significance:** no "taken together" / "it is worth noting" /
  "결론적으로" found in either draft.
- **Mirror translation:** compared `draft.ko.md` against `draft.md`
  side-by-side. The Korean does not mirror English sentence-for-sentence —
  sentence boundaries differ throughout (e.g. the Uber and mppx sections
  split and combine clauses differently than the English), and several
  English sentences with an em-dash aside are rendered in Korean as two
  separate sentences rather than a parenthetical mirror. No fix needed beyond
  the em-dash/아니라 corrections above.
- **Structure:** Abstract is faithful to the body (covers all 5 items, matches
  the ordering in "What moved"). Limitations reflects `gaps.md` accurately.
  No emoji or marketing voice. No paragraph exceeds 6 sentences. Section
  lengths track importance: the Uber item and the gate-hook item (most
  consequential) run 1 full paragraph + diagram or a dense paragraph; the
  XRPL fix (a single, contained bug) is the shortest subsection.

## 6. Diagrams
One mermaid diagram (Figure 1), covering the x402 gate-hook fail-open →
fail-closed branch. Checked:
- Earns its place: yes — the hook-throw/no-throw branching is exactly the
  kind of logic a paragraph alone leaves ambiguous (which path changed,
  which stayed the same).
- Caption cites what the arrows assert, with `[^s03][^s04]`.
- Both languages carry it, with translated node/edge labels in the Korean
  version (no English leaking into the Korean diagram).
- First draft used a `stateDiagram-v2` with a composite state and external
  transitions into its own children (`HookThrows --> Before2026_11_04`) —
  a pattern not confidently valid Mermaid syntax, and this environment has
  no Node/mmdc and no browser tool to render it client-side and confirm.
  Replaced it with a `flowchart LR` using only quoted node labels and
  `-->|edge label|` transitions, which is the most conservative, widely
  supported Mermaid construct and carries the same information (hook
  outcome branches into abort/no-abort, and the exception branch splits by
  pre-/post-fix behavior). `render-report` was re-run and the output HTML
  contains the diagram inside `<pre class="mermaid">`; no visual client-side
  render was possible in this environment, so the syntax choice itself is
  the risk mitigation, not a confirmed render. Flagged as a **nit** to open
  the published page in a browser once the brief is live, to confirm.

No other section describes a shape (sequence, topology) that would benefit
from a diagram; the mppx and XRPL items are single linear bug narratives.

## 7. Must-fix vs nit summary
- Must-fix found: 2 (em-dash density, repeated contrastive-construction
  overuse). Both resolved in this revision.
- Nits: 1 (confirm the flowchart diagram renders visually once the brief is
  live; the syntax risk was already mitigated by switching to a simpler,
  well-supported construct).

No must-fix items remain open.
