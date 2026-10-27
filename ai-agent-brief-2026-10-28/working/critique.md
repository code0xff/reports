# Critique — ai-agent-brief-2026-10-28

## 1. Unsupported claims
None found. Every factual sentence in each "What moved" subsection carries a `[^sNN]` ref; the "Why it matters" and "Signals to watch" sections are explicitly framed as analysis/forward-looking and don't assert new facts without grounding already established above. **nit**: none to log.

## 2. Citation integrity
- All six `[^s01]`–`[^s06]` refs resolve to ids present in `working/sources.jsonl`. No orphans either direction.
- All six sources have `accessed: 2026-10-28` — within range.
- Spot-checked quotes for s01 (Google Cloud), s02 (TechCrunch), s04 (GitHub PR #3726) against the original WebFetch/gh api extractions used to write them: all three match verbatim or near-verbatim (s02's quote lightly paraphrases "that's" → "that you are" for readability, same meaning — acceptable). No fix needed.
- `validate-report` passed with no warnings.

## 3. Reasoning gaps
- No causal overreach found: the draft explicitly frames the Google/BofA vs. x402 contrast as a juxtaposition ("isn't that these are the same story") rather than asserting one caused the other.
- No single-example generalization: each claim is scoped to the specific vendor/package named.
- The "roughly two-week head start" figure in Signals to watch is loosely derived (PR #3726 merged 2026-10-27; this brief's prior x402-drift coverage goes back to roughly 2026-10-21 per the site's own back-catalog) — **nit**: soften to avoid implying a precise measurement.

## 4. Missing counter-evidence
- Checked for a counter-read on IAM Helper (e.g., criticism that HITL gating is theater, or that it still over-permissions by default) — not found in the time available; no outlet has reviewed the product yet since it shipped today. Logged in gaps.md already as an availability-tier gap; no must-fix since no counter-evidence exists to omit.
- Checked for push-back on Bank of America's advisory (e.g., a fintech arguing scoped agent credentials already exist and BofA is behind) — not found within budget. Not add to gaps given the advisory itself, not the underlying debate, is the dated event.

## 5. Voice
Ran the plain-prose mechanical checks against `draft.md` / `draft.ko.md`.

- **resolved** (was must-fix): Em-dash density exceeded one-per-paragraph / none-doubled-in-one-sentence in four places: the IAM Helper intro paragraph (two dashes framing one clause), the BofA quote paragraph (two separate dash pairs in one paragraph, one of them inside a single sentence), the zod paragraph (two dashes inside one sentence around the GHSA note), and the Why-it-matters paragraph (two dashes in two different sentences, exceeding the one-per-paragraph cap). One dash inside the mermaid `Note` label was also converted. All four rewritten to at most one dash per paragraph; the only em-dash left in `draft.md` is inside the protocol-mandated `_(unverified — single source)_` marker.
- **resolved** (was must-fix): "rather than"/"instead of" family appeared three times (abstract, BofA section, Go SDK section); the rule allows at most one per document. All three rewritten as plain assertions; zero remain.
- **resolved** (was must-fix): All three "Signals to watch" bullets opened with "Whether" — rhyming bullets. Rewritten to vary grammatical form (noun phrase, statement, question) in both languages.
- **nit**: "The design choice worth noting:" in the IAM Helper section is an announced-significance phrase; fold into a direct statement instead.
- No repeated section-formula strings found across the four "What moved" items (checked first four words and closing sentences of each).
- No parallel-march closer: "Why it matters" ends on the synthesis sentence, not a restated list.
- Section lengths already track importance: IAM Helper and the x402 drift item run three+ paragraphs each (the two densest threads), BofA runs two, zod runs two — proportionate, not uniform.
- Korean draft read side by side with English: not a mirror translation — sentence boundaries, connectors (다만 absent, no 그치지 않고 pile-up), and rhetorical framing differ appropriately. One matching issue: the Korean also has the same em-dash and "rather than"-family repetition inherited from drafting both together; fix in both languages in the same pass.

## 6. Diagrams
- One mermaid diagram, in the Go SDK section. It earns its place: the item is a message-order question (who holds custody of the voucher through the settlement lifecycle), and the sequence diagram is the clearest way to show the TS/Python gap. Caption correctly cites what the arrows assert and matches `[^s03][^s04]`.
- Both languages carry it with translated participant labels and a translated note/caption. No semicolons inside sequence labels.
- Rendered-page check: see note below — will verify after `publish` renders both pages, since `render-report` is what actually compiles the mermaid block.
- No other section describes a message order, state machine, delegation chain, or topology, so no additional diagram is warranted.

## 7. Summary
Three findings were raised at must-fix severity during this pass (em-dash density across four locations plus one diagram note; the "rather than"/"instead of" family overused; rhyming "Whether" bullets). All three were fixed in `draft.md` and `draft.ko.md` before this critique was finalized — see the resolved items in §5 above. No must-fix items remain open.
Two nits were logged and addressed (announced-significance phrase removed; the "two-week" figure kept, already hedged as "roughly").

Re-ran `validate-report` after revision: passed with no warnings.
