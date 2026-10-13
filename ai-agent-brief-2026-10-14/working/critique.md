# Critique

## 1. Unsupported claims
Every factual sentence in "What moved" carries an `[^sNN]` ref at the paragraph level. The "Why it matters" section is interpretive synthesis, not new factual assertion, and does not need separate citations beyond the ones already anchoring each item. No unsupported-claim issues found.

## 2. Citation integrity
- All four `[^s01]`–`[^s04]` refs exist in `sources.jsonl` and vice versa — no orphans either direction.
- All four sources show `accessed: 2026-10-14`, well inside 90 days.
- `curl -I`/GET on all four URLs returned HTTP 200.
- Spot-checked quotes: s02 (Google Cloud ADK quote) and s03 (TechCrunch Pluto quote) were pulled directly from WebFetch extraction of the live page and match. s01 (The Verge) is explicitly flagged in-draft as sourced from the RSS summary, not the full page, because WebFetch could not retrieve `theverge.com` in this run — this is disclosed, not a citation-integrity failure.

## 3. Reasoning gaps
- No causation-from-correlation claims found; each item is reported as a discrete event.
- No single-example generalizations to "most"/"everyone"/"no one."
- Numbers (billion listings, $42M split, 60% risk share, five languages) all carry a timeframe and source; the 60% figure is marked `_(vendor-stated)_` since Pluto is the only source.
- "Quiet protocol window" (c04) is explicitly scoped in Limitations as a two-repository sample, not an exhaustive claim across all seven named specs. This was flagged and hedged correctly before this critique was written.

## 4. Missing counter-evidence
Ran a second web sweep specifically looking for counter-evidence to "no protocol shipped this window": checked x402-foundation/x402 and google-agentic-commerce/AP2 PR/commit history directly via `gh api`, and ran targeted searches for Visa/Mastercard, Circle/Coinbase, and TechCrunch Disrupt 2026 coverage of agent payments. Found ongoing but all-unmerged spec PRs (x402 delivery-receipt, Cosmos SDK scheme; AP2 conformance-corpus and multi-hop delegation fixes) and no shipped protocol news in the window. This is represented in the draft (s04, "Why it matters," Limitations). No counter-evidence surfaced that was omitted.

## 5. Voice
Ran the plain-prose revision pass on both drafts.
- **Em-dash density, fixed:** English draft had 15 em-dashes across 9 paragraphs, including two sentences with two dashes each (Abstract, "Why it matters"). Rewrote all but one down to commas, periods, parentheses, or semicolons. Korean draft had 6; rewrote to 0, replacing with native punctuation.
- **`rather than` density, fixed:** English draft used it 4 times. Kept the one correcting a real misreading (Shopify's shopper-configured agents vs. the Sept 28 checkout opening); rewrote the other three as plain assertions ("instead of," "not," comma clause).
- **Rhyming bullets, fixed:** All four "Signals to watch" bullets in the Korean draft ended in `~는지`. Varied two to noun phrases. The English bullets were already mixed (noun phrase / noun phrase / whether-clause / gerund clause); no change needed there.
- **Repeated section formula:** Checked first four words and last sentences of each subsection; none repeat a template phrase across items. Each "What moved" item ends differently (a sourcing caveat, a plain observation, a vendor-stated flag) rather than a repeated "why it matters" tag.
- **Parallel-march closer:** "Why it matters" states one through-line and does not restate all three items in matched one-liners. No fix needed.
- **Mirror translation:** Compared draft.md and draft.ko.md side by side. The Korean was composed as independent Korean prose (different sentence breaks, different clause order, native connectors) rather than a sentence-for-sentence mirror — confirmed not a translation artifact.
- **Section length vs. importance:** Shopify and Pluto items get a sourcing/uncertainty sentence each because both are single-source; the ADK item, better sourced, spends its length on substance instead. Lengths already track how much there is to say, not a fixed template.
- No emoji, no marketing voice, no paragraph over 6 sentences.

## 6. Diagrams
One mermaid diagram (ADK five-language interoperability via MCP/A2A). It earns its place: the section describes a topology (five peer language implementations, all pairwise interoperable through two shared protocols), which is harder to parse as prose than as a graph. Caption cites exactly what the arrows assert. Present in both `draft.md` and `draft.ko.md` with translated node/edge labels. Rendered the report locally and confirmed the diagram renders as a figure, not a syntax-error box, in both languages.

## 7. Findings summary
- Voice issues found and fixed in this pass: 3 (em-dash density, `rather than` density, rhyming bullets).
- Nits: 0.
- Open items requiring a fix before publish: none.
