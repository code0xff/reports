# Critique

## 1. Unsupported claims
Every factual sentence in "What moved" carries a `[^sNN]` ref. The "Why it matters" and "Introduction" sections make synthesis claims (e.g. "the industry moving on two different clocks") that are interpretive, not factual assertions, and are appropriately unfootnoted as analysis built on the cited facts above them.

## 2. Citation integrity
- All 9 `[^sNN]` refs in `draft.md`/`draft.ko.md` match ids in `sources.jsonl` (s01–s09).
- All sources have `accessed: 2026-09-29`, well within 90 days.
- HEAD/GET checks on 3 sampled URLs (Shopify newsroom, Nvidia solutions page, OpenAI misalignment-reports page) all returned 200.
- Quotes for those 3 sources were pulled directly from WebFetch extraction of the live pages during gathering, not paraphrased after the fact.

## 3. Reasoning gaps
- The Shopify/Instinct pairing is explicitly flagged in the draft itself as timing-and-partner-list correlation, not a documented technical integration (`working/uncertainties.md`); no causal claim is made.
- No "most people"/"everyone"/"no one" generalizations found.
- All numbers (valuation figures, timestamps, incident counts) carry a source and a date.

## 4. Missing counter-evidence
Searched for a dissenting or skeptical take on Nvidia's Open Agent Safety Platform and found none published within the window — coverage as of 2026-09-29 is uniformly descriptive of the launch, not evaluative. Noted in `gaps.md` that no independent security review exists yet; this is already reflected in the Limitations section and is not a missing-counter-evidence must-fix, since there is no counter-evidence to omit, only an absence of evaluation.

## 5. Voice
- Repeated section formula: none found — each "What moved" item opens differently and reaches its point differently.
- Em-dash density: fixed one paragraph in Limitations (en and ko) that had two em-dashes in one paragraph; all paragraphs now carry at most one.
- "rather than" appears 3 times across the English draft, each doing different, non-formulaic work (background link, tool description, signal bullet); none paired with "not X" rhetoric, so none read as a repeated tic.
- Signals-to-watch bullets vary in grammatical form (a question, a claim with "and whether," a claim with an em-dash aside, a flat noun phrase) in both languages.
- No parallel-march closer: "Why it matters" ends on the two-clocks synthesis, not a restatement of each item.
- No "Taken together"/"It is worth noting"/"결론적으로"/"이를 종합" filler found.
- Korean draft was written as Korean prose (own sentence structures, dropped subjects where natural), not a sentence-for-sentence mirror of the English.

## 6. Diagrams
One mermaid sequence diagram (Shopify checkout tool call order) in both languages, with a caption that states what the arrows assert (buyer confirmation gates `complete_checkout`). It earns its place: the four-tool call order is exactly the kind of message sequence a paragraph alone would garble. Rendered page confirmed as a figure, not a syntax-error box, in both `index.html` and `ko/index.html`.

## 7. Must-fix vs nit
No must-fix items remain open after the em-dash fix in Limitations (en/ko).
