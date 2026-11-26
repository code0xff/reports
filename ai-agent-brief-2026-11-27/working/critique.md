# Critique

## 1. Unsupported claims
None found. Every factual sentence in each "What moved" subsection traces to
[^s01]–[^s04]; the "Why it matters" section is explicitly framed as this
brief's own reading, not a sourced claim, consistent with prior briefs.

## 2. Citation integrity
- All four `[^s01]`–`[^s04]` refs exist in `working/sources.jsonl` and all
  four are cited in `draft.md`.
- All four sources show `accessed: 2026-11-27` — within range.
- Spot-checked all four URLs with `curl -o /dev/null -w %{http_code} -L`: all
  returned `200`.
- Quotes in `sources.jsonl` were taken verbatim from the fetched page text
  during the gather pass (PR body, release notes, issue body, blog
  paragraph); no drift found on re-check.

## 3. Reasoning gaps
- The Phantom/x402 item is explicitly marked `_(unverified, single source)_`
  and the draft states plainly that no second facilitator's behavior is
  confirmed — no overgeneralization from the one reported case.
- The mppx item avoids claiming the three fixes were a coordinated response
  to any incident; `working/uncertainties.md` records that this is unknown.
- No "most/everyone/no one" generalizations found in the draft.

## 4. Missing counter-evidence
Ran one additional web sweep (Google Workspace MCP GA, Phantom/x402/Lighthouse)
looking for independent confirmation or a dissenting account. Found none for
either — the Phantom collision has no response yet from any of the three
parties named, and the Google feature list is independently described only
in Google's own docs/codelabs (consistent with, not contradicting, the blog
post). Not a must-fix: the draft already marks both appropriately
(single-source / vendor-stated) rather than overstating confidence.

## 5. Voice
- No repeated section formula: "What moved" subsections differ in length
  (longest for the Phantom collision, shortest for the Google item relative
  to its complexity) and none opens or closes on a shared phrase.
- Em-dash count: 7 across ~7 prose paragraphs/blocks in `draft.md`, 1 in
  `draft.ko.md`; none doubled inside a single sentence after revision (two
  instances fixed during drafting).
- "rather than" appears twice in `draft.md` (identity-vs-login distinction;
  "coming soon" vs. shipped) — both correct a real possible misreading rather
  than supplying decorative rhythm; kept.
- "Signals to watch" bullets vary grammatically (a question-shaped bullet, a
  conditional, a yes/no check) — not rhyming.
- No parallel-march closer: "Why it matters" states one throughline, does not
  re-list the three items.
- No "taken together" / "it is worth noting" / 즉 / 결론적으로 found.
- Korean draft was written as Korean, not mirrored sentence-for-sentence from
  English (paragraph order and some clause groupings differ); no
  translationese tells (다만/오히려/이는 opening consecutive sentences) found
  on grep.

## 6. Diagrams
No message order, state machine, delegation chain, or topology this cycle —
the Phantom/x402 collision is a two-rule conflict describable in one sentence,
not a multi-step flow, and the mppx and Google items are each a single fix or
a policy change. No diagram added; none needed.

## 7. Must-fix vs nit
No must-fix items. No nits beyond what's already noted as judgment calls
above (none required action).

## Structure
- Abstract is faithful to the body; all four claims it raises are expanded in
  "What moved."
- Limitations section matches `gaps.md` (Amazon zero-day, Visa/Mastercard/
  Stripe/PayPal silence, single-sourcing).
- No emoji, no marketing voice.
- No paragraph exceeds ~6 sentences.
- Section lengths track importance: Phantom item is the longest and most
  technical, mppx item is a compact three-fix list, Google item is medium
  length with an explicit vendor-framing caveat.
