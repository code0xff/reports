# Critique

## 1. Unsupported claims

Reviewed paragraph by paragraph. All factual assertions in "What moved" carry a `[^sNN]` ref on the sentence making the claim (dots mechanics → s01; DevDay framing → s02; HN corroboration → s03; x402 PR → s04; MPP PR → s05; Photon → s06). The "Why it matters" section is argument/synthesis built on already-cited facts, not new factual claims, so no additional citations needed there. No changes required.

## 2. Citation integrity

- All six `[^s01]`–`[^s06]` refs in `draft.md` exist in `sources.jsonl`; `validate-report` passes clean.
- All six sources show `accessed: 2026-10-02` — within the 90-day window.
- Spot-checked live status: s04, s05, s06, s03 all return HTTP 200. s01/s02 (openai.com) return 403 to a scripted `curl`, consistent with the known OpenAI bot-blocking behavior — the content was actually retrieved and quoted via an HTML-reader proxy, and the DevDay recap page independently corroborates the dots launch date and framing. Not a dead link; flagged in Limitations already as resting on OpenAI's own channels.
- Quote spot-check (3 of 6): s01's quote on specialist-dots identity matches the fetched page text verbatim. s04's quote matches the PR body verbatim. s06's quote matches the TechCrunch fetch summary verbatim. No mismatches found.

## 3. Reasoning gaps

- "Why it matters" draws a causal-sounding link between OpenAI's identity model and x402's identity requirement ("the shape of the problem is the same"). This is explicitly framed as parallel, not causal — the draft states the two teams were not responding to each other. No fix needed.
- The claim "first evidence in five briefs" is a count claim with a clear denominator (prior five editions, each explicitly checked for protocol-spec activity) and is sourced to the prior brief's own text, which this draft references. Sound.
- No "everyone/no one/most people" generalizations found in the draft.
- Photon's growth numbers (40,000 sign-ups, 10x revenue, <3% churn) carry no independent denominator or baseline — correctly marked `_(vendor-stated)_` rather than asserted as fact.

## 4. Missing counter-evidence

Searched for dissenting views on both main findings:
- x402 adoption/security skepticism: academic sources (e.g., "Five Attacks on x402 Agentic Payment Protocol," arXiv) document real protocol-level weaknesses (replay, double-spend exposure, no dispute resolution) predating this window. These are background critique of x402 generally, not a rebuttal of the specific in-window claim (that a Go SDK PR added a delegated-identity requirement and an MPP spec clarified fee-sponsorship language) — the draft does not claim x402 is secure or broadly adopted, so no must-fix. Added as a gap note for context since a reader evaluating "why does identity suddenly matter to a payment protocol" benefits from knowing the protocol has documented authorization weaknesses independent of this week's change.
- OpenAI dots: searches surfaced only generic, dated OpenAI privacy/security criticism unrelated to dots specifically (no dots-specific controversy found in-window). Not a must-fix.

**Action:** added one line to `gaps.md` noting the existing x402 security-literature context.

## 5. Voice

Ran the plain-prose revision pass on both `draft.md` and `draft.ko.md`.

- **Repeated section formula:** checked first four words of every paragraph and subsection closers — no repeated template found; each section opens differently (dateline, direct claim, quote-adjacent framing).
- **Em-dash density:** EN draft has 3 em-dashes total across 23 paragraph-level blocks, none more than one per paragraph/sentence (confirmed via grep + manual read). KO draft has zero em-dashes. Fixed during drafting (original draft had 16 before revision — paragraphs with two em-dashes were rewritten to parentheses or plain commas).
- **"Rather than" / "not X but Y":** reduced from 5 instances to 2 real ones (the dots approval-model contrast, and Photon's narrower-bet framing), both of which correct a real distinction rather than supplying rhythm.
- **Rhyming bullets:** "Signals to watch" bullets vary in grammatical form (whether-clause, statement, statement-with-semicolon-clause, whether-clause with different structure) in both languages — not uniform.
- **Parallel-march closer:** "Why it matters" ends on a single through-line statement, not a restated per-item list.
- **Announced significance:** no "taken together," "it is worth noting," "즉," "결론적으로" found.
- **Mirror translation:** read EN and KO side by side — KO is not a sentence-for-sentence mirror (different sentence breaks, native connectives, no translationese `것` chains); verified no habitual `~것이다`/`~라는 점이다` endings and no repeated `다만/오히려/이는` openers.
- **Section length:** the dots item (two "What moved" paragraphs plus a diagram) is the longest, appropriately, since it has the most to say; Photon is a single, shorter paragraph. Lengths track substance, not a fixed template.
- No emoji, no marketing voice. No paragraph exceeds 6 sentences.

No must-fix voice issues remained after the inline revision done during drafting.

## 6. Diagrams

One diagram, in the "dots" item: a `flowchart LR` showing the five paths a dot's action can take through built-in rules, Custom Rules, and auto-review before execution. This earns its place — the approval model is exactly the kind of branching decision structure a paragraph renders poorly and a flowchart renders clearly, and deleting it would lose the "only one of five paths skips a human" point the caption makes explicit. The caption cites what the arrows assert (four of five paths involve a checkpoint). Present in both `draft.md` (English labels) and `draft.ko.md` (translated Korean labels, not transliterated). Checked rendered HTML (`render-report` output) in both `index.html` and `ko/index.html`: the `<pre class="mermaid">` block is well-formed, `-->` and `|label|` syntax has no stray semicolons, and HTML-entity-escaped arrows (`--&gt;`) match the pattern used in the prior published brief's working sequence diagram. No other section in this brief describes a shape (the protocol-spec item is a narrative of two independent merges, not a sequence; Photon's item is a funding event) — no additional diagrams needed.

## 7. Must-fix vs nit summary

- Must-fix: 0
- Nits: 0 (one informational addition made to `gaps.md` for reader context, not a correction)

Report is ready for `publish`.
