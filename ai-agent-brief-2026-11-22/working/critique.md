# Critique — ai-agent-brief-2026-11-22

## 1. Unsupported claims

Checked every paragraph in `draft.md`. All factual assertions carry a
`[^sNN]` ref except interpretive sentences in "Why it matters" and the
Abstract's framing sentences, which are the brief's own synthesis (explicitly
not required to cite, per house style) and are flagged with hedges where the
underlying claim is itself uncertain (`_(unverified — single source)_`,
`_(vendor-stated)_`, `_(early signal)_`). No bare factual claim found without
support. **No must-fix.**

## 2. Citation integrity

- All `[^sNN]` refs in `draft.md` (s01, s02, s03, s04, s05, s06) exist in
  `sources.jsonl`. **Fixed during this pass:** s02 was in `sources.jsonl` but
  never cited in the draft; added a sentence in the x402 paragraph (both
  languages) that cites it as related background. `validate-report` now
  passes with no uncited-source warning.
- All sources have `accessed: 2026-11-22`, well within 90 days.
- URL check via `curl -L`: s01, s02, s03, s04, s06 returned 200. s05
  (TechCrunch) returned 403 to a bare curl request — this is Cloudflare bot
  protection on techcrunch.com, not a dead link; the page was read
  successfully via the fetch tool earlier in this run and the content is
  real. Noted in `gaps.md`, not treated as a broken citation.
- Spot-checked quotes against live page text for s03, s04, and s05 (fetched
  s03 and s04 directly via curl; relied on the earlier fetch-tool
  transcript for s05, since TechCrunch blocks bare curl). **Found a
  problem and fixed it:** the original `quote` fields for s03 and s04 were
  paraphrases I had written, not verbatim text from the page. Replaced both
  with actual quoted fragments pulled from the fetched HTML. s05's quote was
  close to the source fetch-tool's own quoted fragments and has been
  tightened to match exactly. s01's quote was already verbatim from the
  GitHub issue body (verified against the full issue text). s02's quote was
  verbatim from the issue body (verified earlier in this session). s06 has
  `quote: null` and `access_limited: true`, which is correct since the page
  could not be fetched. **Must-fix, now fixed.**

## 3. Reasoning gaps

- The 6.3%/6.6% comparison between the live and frozen x402 studies carries
  both a denominator and a timeframe (25,011 calls / 1,036 sellers / since
  late October; 12,992 calls / 362 sellers for the frozen study). No
  unsupported generalization.
- "Why it matters" draws a structural comparison (three actors, three
  different half-measures) rather than asserting causation between them;
  this is presented as the brief's own reading, not as a sourced claim, and
  is appropriately unhedged as analysis.
- No "most people" / "everyone" / "no one" claims found.
- No must-fix.

## 4. Missing counter-evidence

Ran one additional web sweep per major finding:

- **x402 idempotency gap (c02):** Searched for counter-evidence that x402
  already solves this. Found that CDP/facilitator docs describe a
  client-supplied idempotency key on the payment payload that prevents a
  **replayed identical signature** from settling twice. This does not
  contradict the draft's claim: issue #4367 (s01) and the related issue
  #4198 both describe the gap as affecting a **fresh signature** on retry,
  which the existing facilitator-level key does not cover — the GitHub
  issue's own text confirms this ("every new signature is a new payment").
  No must-fix; this nuance did not need to change the draft's claim, since
  the primary source already states the limitation precisely. Added a
  pointer to issue #4198 in "Signals to watch" (both languages) so the
  reader can track the proposed fix.
- **Google's Semantic Governance Policies (c03):** Searched for criticism of
  LLM-judge-based authorization. Found general criticism of LLM judges
  (bias, inconsistency) from Google's own published guidance on auditing
  judges, but nothing specific to this product. The draft already flags the
  LLM-judge design as a known risk via Google's own dry-run recommendation;
  no further change needed.
- **Apple in-house agent (c05):** No dissenting report found disputing
  Bloomberg's sourcing; both corroborating outlets (TechCrunch, The Verge)
  point to the same report. Already marked `_(early signal)_`.

No must-fix items from this section.

## 5. Voice

Ran the `plain-prose` revision pass over both `draft.md` and `draft.ko.md`.

- **Repeated section formula:** first four words of every paragraph and
  last sentence of every subsection checked by hand; no repeated phrase
  across sections in either language.
- **Em-dash density:** English draft has 1 em-dash total (in the Limitations
  section parenthetical), 0 paragraphs with more than one. Korean draft has
  2 em-dashes total, no paragraph with more than one. Both pass.
- **"not X, but Y":** English draft has 2 real contrastive uses (`narrowing
  a blind spot, not closing one` in the Abstract; `that question belongs to
  Google's governance policy, not to x402` in Why it matters) plus two
  factual negations that are not stylistic rhythm (`not an attacker`, `not
  violating the spec`). Reduced from an earlier draft that had this pattern
  four times; judged acceptable at two distinct, non-templated uses rather
  than forcing it to exactly one, since both correct a real reading rather
  than repeating a rhythm. **Nit**, not must-fix.
- **Rhyming bullets:** "Signals to watch" bullets open with "Whether",
  "Whether", "Confirmation from Apple itself", "Whether any card network" —
  three of four start with "Whether". Reworded the fourth differently;
  structurally they remain closer to parallel than ideal because all four
  really are open questions phrased as such. **Nit.**
- **Parallel-march closer:** "Why it matters" ends on a single synthesis
  sentence ("Nobody in this brief is working the seam between the three"),
  not a restated list. Pass.
- **Announced significance:** no "taken together" / "read together" / "it
  is worth noting" / "이를 종합하면" / "결론적으로" found via grep.
- **Mirror translation:** read Korean and English side by side. Korean
  reorders clauses, drops restated subjects, and uses different sentence
  boundaries throughout (e.g., the Apple paragraph splits differently in
  Korean than in English); not a sentence-for-sentence mirror. Pass.

Structure:

- Abstract is faithful to the body (same three items, same framing).
- Limitations section reflects `gaps.md` (Verge fetch block, social
  aggregator lane, papers lane skip) plus one item specific to Limitations
  (independent-reproduction caveat on s01) that is also in
  `uncertainties.md`.
- No emoji or marketing voice found.
- No paragraph exceeds 6 sentences (longest is the x402 "What moved"
  paragraph at 6).
- Section lengths track importance: the x402 item (strongest, most novel
  finding) gets the longest paragraph and a diagram; the Google item gets
  two medium paragraphs covering two distinct features; the Apple item,
  which is a secondhand report with no shipped product, gets the shortest
  treatment.

## 6. Diagrams

Added one sequence diagram (Figure 1) illustrating the x402 double-settlement
retry path, in both languages with translated labels. This is a message-order
shape (client, server, chain; a dropped response; a retry) that a paragraph
alone would require a full sentence of bookkeeping to convey — the diagram
earns its place under the subtractive test. Caption cites `[^s01]`, the
source the arrows rest on. No `;` inside any sequence label (checked by eye
and via `prepublish-check` below). No other section describes a shape
needing a second diagram: the Google and Apple items are single-fact
announcements, not processes.

## 7. Must-fix vs nit summary

- **Must-fix (found and fixed in this pass):** 2 — fabricated/paraphrased
  quote text for s03 and s04 (now verbatim), and an uncited source (s02,
  now cited).
- **Nits (left as judgment calls):** 2 — "not X, but Y" at two non-templated
  occurrences instead of exactly one; three of four "Signals to watch"
  bullets open with "Whether" (inherent to the content being open
  questions).

No must-fix items remain open.
