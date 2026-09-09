# Critique — ai-agent-brief-2026-09-10

## 1. Unsupported claims

Checked every paragraph in `draft.md` against its citations. All factual assertions
carry a `[^sNN]` ref except:

- The Introduction's summary of the 2026-09-09 brief's contents — not a claim about
  this window, background recap only, no citation needed.
- "Why it matters"'s framing sentences (that all three items are about *reach* vs.
  *authorization*) — analytical synthesis, not a factual assertion requiring a
  citation; the underlying facts it synthesizes are each cited in their own section.

No must-fix here.

## 2. Citation integrity

- All 8 `[^sNN]` refs used in `draft.md` and `draft.ko.md` exist in `sources.jsonl`
  (s01–s08), and both language files cite the same set.
- All 8 sources have `accessed: 2026-09-10` — within range.
- HTTP check via curl on all 8 URLs: 7 returned 200. `s04` (newsbytesapp.com)
  returned 403 to curl with a browser user-agent, consistent with bot-blocking
  rather than a dead page — WebFetch retrieved and quoted this page successfully
  during drafting. Not treated as a dead link; noted here for the record. **Nit.**
- Spot-checked quotes for s02, s05, s07 against fetched page content: all three
  match. No fabricated quotes found.

## 3. Reasoning gaps

- No causation-from-correlation claims found; each item's claims are about what
  was announced, not what it will cause.
- Single-example generalization: initially, the Cymphony section presented the
  85,000-file figure and the "$100M valuation" as if establishing an
  uncontested category thesis. **Fixed**: added a paragraph noting the category
  is contested (competitors named in the same source, Balkansky's own
  "nobody's going to get rid of their Okta" framing) so the section doesn't
  read as a single vendor's pitch taken at face value.
- Numbers without denominator/timeframe: none found — the 85,000-file figure,
  30-plus backers, and 27%/41%/15% trust figures all carry their source's
  stated scope (one customer, Mastercard's own count, a named June 2026 survey).
- "Everyone"/"no one" language: the original draft's "everyone at the same
  event was watching for" (Abstract) is a hedge-free overgeneralization about
  an unnamed audience. **Fixed**: this is the kind of claim the skill flags —
  see Voice section below, item now reads as narrower and attributed.

## 4. Missing counter-evidence — must-fix, now resolved

Two gaps found on the adversarial sweep, both now folded into the draft:

- **Mastercard/Agent Connect**: initial draft presented the launch without any
  signal of consumer-side friction. A second search surfaced a June 2026
  Checkout.com survey (27% trust no organization to run an AI shopping agent;
  41%/15% delegation split by category) that directly counters any reading of
  merchant-side infrastructure as itself evidence of consumer adoption. Added
  as a new paragraph in the Mastercard section, new source s08, both languages.
- **Cymphony**: initial draft treated Sequoia's framing ("if companies are not
  spending money on agent security...") as an uncontested thesis. The same
  TechCrunch source it was already sourced to also names five competitors
  (Microsoft, Okta, CyberArk, Wiz, Varonis) and quotes Balkansky himself
  hedging Cymphony as additive, not a replacement. Added as a new sentence in
  the Cymphony section, both languages, using the source already cited (s06,
  no new source needed).

Both items required a fix before this brief could ship; both are now resolved in the draft above.

## 5. Voice

Ran the plain-prose revision pass over both `draft.md` and `draft.ko.md`.

- **Em-dash density**: initial draft had three paragraphs with 2 em-dashes each
  (Cymphony funding sentence, Cymphony traction sentence, Limitations
  paragraph) — all fixed to ≤1 per paragraph, using colons, parentheses, or
  splitting into two sentences. Re-checked after the counter-evidence
  additions; still ≤1 per paragraph in both languages. **Fixed.**
- **`rather than` / `이 아니라` density**: 5 occurrences in `draft.md`, each
  checked individually — all are functional distinctions tied to a specific
  citation (a strategic choice, a factual "expected not shipped" gap, a quoted
  hedge, a sourcing caveat), not decorative rhythm. One pair in the Limitations
  section sat close together with parallel phrasing; reworded one to a plain
  "not... directly" construction to break the echo. **Nit, addressed.**
- **Rhyming bullets**: "Signals to watch" originally had 3 of 5 bullets opening
  with "Whether" — a filled-slot tell. Rewritten to vary grammar: a direct
  question, a gerund-led statement, a fragment ending on a question, a labeled
  colon construction, and a plain noun phrase. Same fix mirrored in Korean,
  where all 4 non-EMVCo bullets ended in `~는지`. **Fixed, both languages.**
- **Repeated section formula**: checked the first four words of every
  paragraph and the last sentence of each `###` subsection — no repeated
  colon-label or closing-sentence template found across the three "What
  moved" items. Section lengths are uneven (Mastercard and NPCI sections run
  longer than a single paragraph; the structure tracks how much there was to
  say, not a fixed template).
- **Parallel-march closer**: "Why it matters" ends on one synthesis sentence
  ("infrastructure first, authorization boundary after"), not a restatement of
  all three items in turn. No closer list found.
- **Announced significance**: no instances of "it is worth noting," "taken
  together," "이를 종합하면," or "결론적으로" found via grep.
- **Mirror translation check**: read both drafts side by side. The Korean
  reorders clauses per-sentence (e.g., the Mastercard opening sentence splits
  differently, the Cymphony paragraph leads with the funding structure before
  the product description in a different rhythm than the English) rather than
  mapping 1:1. Sentence count differs slightly per paragraph in a few places
  where Korean idiom required a split or merge. Treated as acceptable —  not a
  literal mirror.
- No emoji, no marketing voice found in either language.

## 6. Diagrams

- One diagram pair (before/after Agent Connect topology) in the Mastercard
  section. Each earns its place: the entire point of the item is that the
  integration topology changes from a mesh to a hub, which is exactly what the
  two graphs show and a paragraph alone would have to enumerate awkwardly.
  Deleting it would cost the reader the one-glance comparison.
- Caption states exactly what the diagram shows (mesh → hub) and cites the
  same two sources as the surrounding prose.
- Both languages carry the diagram with translated node/subgraph labels
  (가맹점/플랫폼/Agent Connect).
- Checked mermaid syntax by hand: `graph LR` with `subgraph "..."` blocks,
  bracketed node labels, `---` edges, no semicolons in any label. Rendered via
  `render-report` (see below) and the figure displayed correctly in both
  language pages — not just syntax-checked by hand, actually opened. No
  malformed diagrams found.
- No other section in this brief describes a message order, state machine, or
  delegation chain — the NPCI and Cymphony items are single-actor product
  launches with no interaction sequence worth diagramming. No additional
  diagram suggested.

## 7. Structure

- Abstract is faithful to the body: all three items and the "reach vs.
  authorization" synthesis are represented, no claim in the Abstract that
  isn't developed in the body.
- Limitations section matches `gaps.md` — social-lane credentials, missing
  NPCI primary source, Mastercard 403, and the quiet papers lane are all
  reflected.
- No emoji or marketing voice.
- No paragraph exceeds 6 sentences (checked programmatically).
- Section lengths track importance: Mastercard and NPCI each get a diagram or
  extended discussion plus a counter-evidence paragraph; Cymphony gets two
  paragraphs; none are padded to match each other's length.

## Must-fix / nit count

- **Must-fix found: 2** (missing counter-evidence for both Mastercard and
  Cymphony sections) — both fixed in this revision.
- **Nits found: 3** (newsbytesapp curl 403 vs. WebFetch success — informational
  only; `rather than` clustering in Limitations — fixed; mirror-translation
  spot check — passed, no fix needed).
- **Must-fix remaining: 0.**
