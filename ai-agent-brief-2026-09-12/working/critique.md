# Critique — ai-agent-brief-2026-09-12

## 1. Unsupported claims
Checked every paragraph in `draft.md`. All factual assertions carry a `[^sNN]` ref except:
- The Abstract and "Why it matters" sections — these are the brief's own synthesis (explicitly framed as such), not new factual claims, so no citation is expected there. `uncertainties.md` already flags the KYA/tooling grouping as this brief's own reading, not the companies' framing.
No must-fix findings.

## 2. Citation integrity
- All `[^s01]`–`[^s08]` refs used in `draft.md` and `draft.ko.md` exist in `sources.jsonl`; `s03` was initially unused (validate-report warning) and has since been folded into the KYA section (both languages) with a verified quote — `validate-report` now passes with no warnings.
- All 8 sources show `accessed: 2026-09-12`, well within 90 days.
- URLs are all `https://`, well-formed; no dead-link check via curl was run because a fetch/HEAD against these hosts already succeeded during drafting (WebFetch on each), except `openai.com/index/put-data-to-work`, which returns HTTP 403 to this harness's fetcher — recorded in `gaps.md` and in Limitations, not silently dropped.
- Spot-checked 3 quotes against live pages via WebFetch: `s02` (Forkast, both the Fourez and Yang quotes), `s06` (Google Developers Blog, ADK for Kotlin), `s08` (Unite.AI). All three verbatim on the page. One quote initially misattributed during drafting (a Fourez quote first drafted against `s03`/PYMNTS) was caught by this check and corrected to its actual source (`s02`/Forkast) — see revision history below.
No must-fix findings remaining.

## 3. Reasoning gaps
- No causation-from-correlation claims found.
- No single-example generalizations ("most", "everyone", "no one" not used).
- The $3-5 trillion by 2030 figure and the "165 million x402 transactions" style figures were checked for denominator/timeframe — the $3-5T figure carries its timeframe (by 2030) and is marked `_(vendor-stated)_`; no other undated/denominator-less figures made it into the draft.
No must-fix findings.

## 4. Missing counter-evidence
- Ran an additional web sweep specifically for skepticism or dissent on the KYA framework (searches for independent analysis, criticism, "hard part" framing). Result: no independent critical analysis exists yet beyond Forkast's own "now comes the hard part" framing and Biometric Update's observation that no dispute-resolution mechanism is specified. Both are already cited. This is recorded in `gaps.md` as an actual absence in coverage, not an oversight in this brief — **not a must-fix**, since the gap is in the world's coverage, not in this brief's search.
- Checked for independent coverage of Google's two tooling releases: none found beyond Google's own blog network and developer reposts. Recorded as vendor-stated in both `uncertainties.md` and the Limitations section.
No must-fix findings.

## 5. Voice
Ran the `plain-prose` revision pass over both `draft.md` and `draft.ko.md`.

- **Repeated section formula**: none found — first four words of each paragraph and each subsection's last sentence are all distinct (checked via grep).
- **Em-dash density**: found and fixed. Original draft had a paragraph with two em-dashes in one sentence (Limitations) and a paragraph with three em-dashes total (KYA section), including one sentence wrapping a quote in a double-dash parenthetical. Rewrote all of these — final draft has zero paragraphs with more than one em-dash, and zero sentences with two. **Must-fix, fixed.**
- **"Not X" / "rather than" density**: original draft had ~6 rhetorical contrast constructions across a 9-paragraph brief (abstract, three "what moved" items, "why it matters", limitations), including one paragraph ("Why it matters") with three separate "not X" constructions back to back. Cut to 3 substantive, well-separated corrections (KYA is a press release not a wire format; OpenAI's Data agent is not developer infrastructure; KYA's fix is shared principles not a fourth protocol) plus 2 low-key factual negations in Limitations. **Must-fix, fixed** (was templated rhythm in "Why it matters" specifically; now varied).
- **Rhyming bullets**: "Signals to watch" bullets checked — one starts with "Whether," the other three are noun phrases with varied internal structure. No rhyme. Nit-level only, no change needed.
- **Parallel-march closer**: "Why it matters" does not restate each item in matched one-liners; it names the one thing they add up to (both are admissions that self-created fragmentation is the real obstacle) and stops. No finding.
- **Announced significance**: no "taken together," "it is worth noting," "즉," "결론적으로" found via grep.
- **Mirror translation**: read both drafts side by side. Korean is not a sentence-for-sentence mirror — paragraph counts match (as required by shared structure) but sentence boundaries, clause order, and the "왜 중요한가" section's phrasing diverge from a literal translation of the English. `아니라` count was brought down from 7 to 3 to match the English contrast reduction, for the same reason (repeated Korean contrast marker reads as translated rhythm).
- **Structure**: Abstract is faithful to the body (matches the three "what moved" items and the interoperability framing in "why it matters"). Limitations honestly reflects `gaps.md` (same items, same order of priority). No emoji or marketing voice. No paragraph exceeds 6 sentences (the longest, the KYA section's second paragraph, runs 5). Section lengths track importance: KYA gets two paragraphs plus a diagram (best-sourced, most consequential item), Google's tooling gets two paragraphs (well-sourced but no independent press), OpenAI's Data agent gets one paragraph (thinnest fit to the beat, correctly the shortest treatment).

## 6. Diagrams
- One `mermaid` block (`graph LR`), covering the KYA section's actual topology (three separate protocols feeding into shared principles, output being cross-network recognition). This has real shape — three previously non-interoperating systems converging — so it earns its place; deleting it would lose the one part of the KYA story that is structural rather than narrative.
- Caption cites what the arrows assert (`[^s01][^s02][^s04]`) and matches the body text.
- Present in both `draft.md` and `draft.ko.md` with translated node labels.
- Rendered the report via `render-report` and opened `index.html` in the browser to confirm the diagram box renders as a figure, not a syntax-error block (see rendering step below).
- No other section describes a message order, state machine, delegation chain, or topology that would need its own diagram — "why it matters" is an argument, not a process, and correctly has no diagram.

## 7. Must-fix vs nit summary
- **Must-fix (2, both fixed in this pass)**: em-dash density/placement; repeated "not X" contrast rhythm in "Why it matters" and across the brief.
- **Nits (0 remaining)**: none outstanding after the voice pass.
- **Gaps carried forward (not must-fix, already in `gaps.md`)**: no independent/adversarial analysis of KYA exists yet; no independent press on Google's two tooling releases; OpenAI's own Data-agent page is unreachable from this harness.

No must-fix items remain open. Ready for `publish`.
