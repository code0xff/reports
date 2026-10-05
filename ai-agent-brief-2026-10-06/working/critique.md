# Critique

## 1. Unsupported claims

Checked every paragraph in `draft.md` against citations. All factual assertions carry a `[^sNN]` ref except framing/analysis sentences in the Abstract, "Why it matters," and the opening/closing sentences of each subsection, which are the draft's own synthesis and correctly carry no citation. No unsupported factual claims found. **No findings.**

## 2. Citation integrity

- All 8 `[^s01]`–`[^s08]` refs used in `draft.md` exist in `working/sources.jsonl`, and the same 8 are used in `draft.ko.md` — no orphaned or missing refs in either language.
- All 8 sources have `accessed: 2026-10-06`, well within 90 days.
- Spot-checked all 8 URLs with `curl -L`: all returned HTTP 200.
- Quote spot-check (3 random: s01, s06, s04): s01's quote ("the same bug would surface in servers written by teams sharing no code...") matches the unite.ai fetch verbatim. s06's quote (Wikimedia's own words) matches the globalnews.ca fetch verbatim. s04's quote (x402 PR body) matches the PR description verbatim. **No findings.**

## 3. Reasoning gaps

- The MCP item presents five independently-confirmed cases as support for a "structural" framing; the draft already flags in its own body and in Limitations that this is Mohiuddin's own research validating his own prediction, not third-party replication — this is the correct hedge, not an omission.
- No causation-from-correlation issues found: the x402 item explicitly declines to claim the auth-capture feature inherits the batch-settlement bugs ("neither bug carries forward mechanically").
- The Wikimedia item correctly preserves Wikimedia's own hedge ("possibly tied to," "potentially malicious") rather than upgrading it to a confirmed causal claim.
- No "most/everyone/no one" generalizations found. **No findings.**

## 4. Missing counter-evidence

Ran two additional web searches: (a) for any Anthropic or third-party rebuttal of Mohiuddin's structural-flaw framing, (b) for any Wikimedia or OpenAI dispute of the May-outage linkage. Neither search surfaced dissent or denial — OpenAI's silence is itself noted in the s06 source and reflected in the draft ("OpenAI provided no comment"). No counter-evidence to add. **No findings, not must-fix.**

## 5. Voice

Ran the plain-prose revision pass on both `draft.md` and `draft.ko.md`.

- **Repeated section formula:** checked first four words of every paragraph and last sentence of every subsection in both languages. No repeated colon-label or templated opener found across the three "What moved" items — each has a distinct shape (longest for MCP, medium for x402, medium for Wikimedia). **No findings.**
- **Em-dash density:** `grep -c '—'` found one or zero per paragraph in both files after revision; the one sentence with two em-dashes (English, MCP section) was fixed during drafting. **No findings remaining.**
- **"Not X, but Y":** found and fixed during drafting — six instances in Korean, five in English, trimmed to one earned instance per language (the Wikimedia "confirmation of scope, not a new incident" point, which corrects a real possible misreading). **No findings remaining.**
- **Rhyming bullets:** "Signals to watch" bullets use varied grammar (a yes/no question, a conditional, a question with embedded clause, a comparison) in both languages. **No findings.**
- **Parallel-march closer:** "Why it matters" does not restate each item in matched one-liners; it states what each item does NOT do before landing on the shared through-line. **No findings.**
- **Announced significance:** no "taken together," "it is worth noting," "결론적으로," or "즉" found via grep. **No findings.**
- **Mirror translation:** read Korean and English side by side. Sentence boundaries, clause order, and emphasis differ throughout (e.g., the Korean abstract opens with the date range before the thesis, where English leads with the thesis; the Korean "why it matters" section restructures the x402 and Wikimedia sentences rather than mirroring English clause-for-clause). Korean is written as Korean, not a transliteration. **No findings.**

### Structure
- Abstract is faithful to the body; all three items and the through-line appear in both.
- Limitations honestly reflects `gaps.md` (same five points, same hedges).
- No emoji or marketing voice found.
- No paragraph exceeds 6 sentences (longest, the MCP second paragraph, is 5).
- Section lengths track importance: MCP item (most developed, two paragraphs) > x402 and Wikimedia items (one longer + one shorter paragraph each) — consistent with genuine weighting, not uniform treatment.

## 6. Diagrams

None of the three items describes a message order, state machine, delegation chain, or topology with enough structure to justify a diagram. The x402 auth-capture flow (authorize → capture/void) is a two-step sequence described in one sentence; a diagram for it would be decoration, not clarification. No diagram added. **Nit, not must-fix:** if a future brief covers x402's full escrow lifecycle (authorize, capture, void, refund) in one item, that would be worth a short sequence diagram.

## 7. Summary

**Must-fix: 0. Nits: 1** (optional future diagram, noted above, not applicable to this draft).

No revision required beyond what was already folded into `draft.md` / `draft.ko.md` during drafting (em-dash and "not X but Y" trims).
