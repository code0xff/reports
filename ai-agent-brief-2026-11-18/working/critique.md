# Critique — ai-agent-brief-2026-11-18

## 1. Unsupported claims
Checked every paragraph against its citations.
- Abstract, Introduction, "What moved," "Why it matters": every factual assertion either carries a `[^sNN]` ref or is explicitly framed as this brief's own reading (e.g. "Read together..." in the Abstract, "there is no evidence the two tracks are converging" in "Why it matters") rather than a fact needing a citation.
- "Why it matters" restates facts already cited earlier in the same edition (mppx, Daydream) without re-citing; this is standard for a synthesis section that does not introduce new facts. No fix needed.
- Limitations section's claim about the dropped Grok Bot story is supported by the investigation recorded in `gaps.md`, not by a source in this report's bibliography (correct — it's a gap, not a claim).
No must-fix here.

## 2. Citation integrity
- All six `[^s01]`–`[^s06]` refs used in `draft.md` exist in `sources.jsonl`; `validate-report` confirms no dangling refs.
- All six sources have `accessed: 2026-11-18` — within 90 days.
- HEAD/GET check on all six URLs: all returned `200`.
- Spot-checked 3 sources' `quote` fields against the original fetch transcripts (s01, s02, s04): all three quotes are verbatim substrings of what the subagent fetches returned. No fabricated quotes.
No must-fix here.

## 3. Reasoning gaps
- No causation-from-correlation claims found; the brief explicitly declines to assert a causal link between the identity work and the commerce work ("Why it matters" says the opposite — that they are *not* connected).
- Single-example generalization risk: Pedestal AI's "20% drop in missed deliveries" is one unnamed customer's self-reported number for one deployment. The draft already hedges this in Limitations and `uncertainties.md`. No further action.
- No "most people" / "everyone" / "no one" claims found.
No must-fix here.

## 4. Missing counter-evidence
- Ran one additional targeted search for counter-evidence to the "Why it matters" framing (identity and commerce layers are disconnected): searched for any agentic-commerce product that does name an open identity or payment standard in its checkout flow, to check whether Daydream is representative or an outlier. Did not find a counter-example dated in this window; several agentic-commerce products from outside the window (AWS AgentCore Payments, Visa/OpenAI pilots) do name rails, which the Introduction and prior editions already cover as background, so the "no one in this window named a rail" framing holds for the window but is not a claim about the whole beat. No change needed — the draft already scopes its claim to "this window."
No must-fix here.

## 5. Voice
Ran the plain-prose mechanical checks via grep (see tool output in this session):
- Em-dash density: 4 total across 19 paragraphs in `draft.md`, 1 in `draft.ko.md`; no paragraph has more than one, no sentence has two. Pass.
- "rather than" / "not X, but Y": one genuine instance in `draft.md` (`rather than leaving the extension as a spec...`), correcting a real misreading (a maintained SDK shipping code vs. the extension staying unshipped). No repeats. Pass.
- Repeated section formula: checked first four words of every paragraph and each subsection's closing sentence — no phrase repeats across items. Section lengths vary with importance (mppx item: 2 paragraphs + diagram; Daydream: 2 paragraphs; funding: 1 paragraph). Pass.
- Rhyming bullets in "Signals to watch": 2 of 3 open with "Whether," one does not; grammar varies enough (a question-form clause vs. a flat noun phrase). Nit, not must-fix — tightened was considered but a 3-item list with 2/3 sharing a form is not the "five bullets all ending the same way" failure mode this check targets.
- Parallel-march closer: "Why it matters" does not restate each item in matched one-liners; it states one throughline. Pass.
- Announced significance ("Taken together," "it is worth noting," "즉," "결론적으로"): none found via grep. Pass.
- Mirror translation: read `draft.ko.md` against `draft.md` side by side. Sentence boundaries, clause order, and connective choices differ (e.g. the Korean "왜 중요한가" section restructures the English's "answer different halves" line into "서로 다른 절반에 서로 다른 방에서 답하고 있다" rather than translating word-for-word; the abstract opens with a reordered clause). Korean-specific tells (`~라는 점이다`, `~라고 할 수 있다`, `다만`/`오히려`/`이는` as sentence openers) checked via grep: none found. Pass.
- Structure: Abstract is faithful to the body (same three items, same throughline). Limitations honestly reflects `gaps.md` (same four points, condensed). No emoji or marketing voice. No paragraph exceeds 6 sentences (longest is 4). Section lengths track importance: mppx (most substantive, has a diagram) > Daydream > funding roundup (shortest).

No must-fix found in this pass.

## 6. Diagrams
- Added one `mermaid sequenceDiagram` under the mppx item (the only item with a real message-order shape: agent signs → server queries registry → server compares → grants/denies). Present in both `draft.md` and `draft.ko.md` with translated participant labels and a caption citing what the arrows assert, tied to `[^s01]`. No `;` inside any sequence label.
- Daydream and the funding item have no real shape (one-click checkout is a black box from the outside; funding rounds are not a process) — no diagram added for either, per the "skip it when nothing has a shape worth drawing" rule.
- Rendered-page check: must be done after `render-report` in the publish step, before calling this done (see Phase 7).

## 7. Summary
**Must-fix: 0. Nits: 1** (the 2-of-3 "Whether" bullet-opener pattern in "Signals to watch" — judged acceptable, not changed).

No revision required before publish.
