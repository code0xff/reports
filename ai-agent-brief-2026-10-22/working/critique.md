# Critique — ai-agent-brief-2026-10-22

## 1. Unsupported claims

Checked every paragraph in `draft.md`. One citation per paragraph (or per fact-cluster within a paragraph) is the house pattern this site already uses; every factual paragraph in this draft carries at least one `[^sNN]`. No unsupported factual sentence found. **No must-fix.**

## 2. Citation integrity

- All four `[^s01]`–`[^s04]` refs (plus `[^s05]` added during this pass) exist in `working/sources.jsonl`.
- All five sources have `accessed: 2026-10-22` — within 90 days.
- `curl -L` against all five URLs returned `200`.
- Spot-checked quotes for s01 ("We price products, not people."), s03 ("Cloudflare injects a small script at the edge…"), and s04 ("Since LangChain 1.0+ uses LangGraph under the hood…") against the fetched page content; all three are present on the page. **No must-fix.**

## 3. Reasoning gaps

- No causation-from-correlation claims found; each item is reported as a discrete company action, not inferred from a trend.
- No single-example generalizations ("most", "everyone", "no one").
- The ~100,000-storefront figure (s03) has a timeframe (as of the Oct. 21 post) and is explicitly marked vendor-stated with no independent count — flagged correctly in Limitations.
- **No must-fix.**

## 4. Missing counter-evidence (must-fix, now fixed)

A targeted web search for dissenting views on WebMCP turned up real, non-trivial security commentary (prompt injection through tool metadata/return values; agents inheriting a shopper's authenticated-session permissions beyond what the task needs) that the first draft did not represent. This was flagged for required action and resolved: added one sourced caveat sentence to the Cloudflare/Commerce.com section (en + ko), added `s05` (Bitwarden) to `sources.jsonl` with `claim_refs: ["c02"]`, noted it in `working/gaps.md`, and added a corresponding line to Limitations in both languages. Marked `_(unverified — single source)_` since it is one vendor's security framing, not an assessment of this specific rollout.

A parallel search for dissenting coverage of Walmart's Agent Gateway found only general background concern about agentic-shopping fraud/liability (not specific to Agent Gateway or dated to this window) — already gestured at by the existing "Signals to watch" bullet on enforcement; no further change needed.

## 5. Voice

Ran the `plain-prose` revision pass.

- **Em-dash density (must-fix, fixed):** Initial draft had 16 em-dash characters across 11 paragraphs, with five instances of a paired em-dash parenthetical inside a single sentence (violates "never two in one sentence"). Rewrote all five as parentheses, commas, or restructured clauses in English; found and fixed the same pattern in one Korean sentence and one Korean heading. Final count: 6 in English, 9 in Korean (including diagram captions/code and one bullet each), none with two dashes in one sentence outside the diagrams.
- **"rather than" / contrast construction (must-fix, fixed):** Two occurrences in the first draft. Kept the one correcting a real misreading (Amazon "blocking" vs. "gating"); rewrote the WebMCP one as a plain two-sentence assertion.
- **Parallel-march closer (must-fix, fixed):** The original "Why it matters" paragraph used the identical template "X could already do A; what's new is B" three times in a row — exactly the pattern the skill flags. Rewrote to state the one thing the three items add up to (access didn't widen, it got a named owner) instead of restating each item a second time.
- **Repeated section formula:** Checked the first four words of every paragraph and the last sentence of every subsection — no repeated colon-label or template found across the three "What moved" items. Each item's closing sentence is different in content and grammar.
- **Rhyming bullets:** "Signals to watch" bullets vary in grammatical form (a question, a "whether" clause, two noun phrases) — no fix needed.
- **Mirror translation:** Read `draft.ko.md` against `draft.md` side by side. The Korean is not a sentence-for-sentence mirror — paragraph breaks, sentence counts, and clause order differ in several places (e.g. the abstract's second sentence splits differently, the Walmart section's quote placement differs). Judged as genuinely written Korean, not translated. **Nit, no change.**
- **Structure:** Abstract is faithful to the body (all three items and the through-line are represented, nothing added). Limitations reflects `gaps.md` plus the counter-evidence caveat added during this pass. No emoji, no marketing voice. No paragraph exceeds 6 sentences (checked programmatically). Section lengths track importance: Walmart (the biggest, most sourced story) gets two body paragraphs plus a diagram; Cloudflare gets two paragraphs; Google gets two paragraphs — roughly even, which is honest here since the three items are genuinely comparable in substance this window, not a sign of unweighed treatment.

## 6. Diagrams

One `mermaid` sequence diagram (Walmart's Agent Gateway approval/limit flow), present in both `draft.md` and `draft.ko.md` with translated participant/message labels. Checked:
- Diagram type (`sequenceDiagram`) is in the harness's allowed list.
- No block is empty.
- No `;` inside any label (checked by hand and via `validate-report`, which runs the harness's own mermaid lint and passed clean).
- `alt`/`else`/`end` balanced.
- Caption states exactly what the arrows assert and cites `[^s01]`.
- Rendered both `index.html` and `ko/index.html` via `render-report`; both contain a `<pre class="mermaid">sequenceDiagram` block and the mermaid runtime script. No headless browser was available in this environment to visually confirm the rendered figure (no `node`/`mmdc`); relied on the harness's built-in mermaid lint (which specifically catches the empty-block, wrong-type, and semicolon-in-label failure modes that render as a visible error box) plus manual syntax review. **Nit:** flag for a human to open the rendered page once, per `PROTOCOL.md`'s standing caution that a malformed diagram only fails in the browser.
- The diagram earns its place: the approval/limit branching is a genuine decision shape that the prose describes in full sentences; the diagram makes the two-path structure (limit vs. approval) visible at a glance. No diagram was added for the Cloudflare or Google items — neither has a message order or state machine distinct enough to be clearer as a figure than as prose.

## 7. Summary

- **Must-fix found: 3** (missing WebMCP counter-evidence; em-dash/paired-dash overuse; parallel-march closer in "Why it matters") — **all fixed** in this pass.
- **Nits: 2** (mirror-translation check passed but noted; diagram render not visually confirmed in a browser due to no `node`/`mmdc` in this environment, mermaid lint + manual syntax review used instead).

`validate-report ai-agent-brief-2026-10-22` passes after the revision, with no warnings.
