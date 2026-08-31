# Critique — ai-agent-brief-2026-08-31

## 1. Unsupported claims

Reviewed every paragraph in `draft.md`. All factual sentences carry a
`[^s..]` ref except framing/connective sentences ("Why it is not just
noise: ...") which are the brief's own analysis, consistent with house
style for the "why it matters" line in each subsection. No bare factual
assertions found without a citation after revision (one candidate sentence —
a claimed crypto-vs-card-network tension inside the Agentic Payments
Alliance — was drafted, could not be sourced to a fetched, quotable page on
re-check, and was removed rather than shipped uncited). **Resolved, no
must-fix.**

## 2. Citation integrity

- `python3 scripts/harness.py validate-report ai-agent-brief-2026-08-31` →
  `ok: passed validation`, no warnings.
- All 9 sources (`s01`–`s09`) in `sources.jsonl` have `accessed: 2026-08-31`
  (today), well within 90 days.
- Every `[^s01]`–`[^s09]` ref used in `draft.md` resolves to an entry in
  `sources.jsonl`; every source is cited at least once.
- Spot-checked 3 sources' quotes against live fetches: s01 (Anthropic MHS
  preview), s04 (PYMNTS McInerney quote), s06 (PPC Land 57.4%/42.6% figure)
  — all three quotes matched page content on fetch. **No dead links found**
  among the 9 (all fetched successfully this run except s07 and s02 on one
  attempt each, both of which succeeded on the citation-relevant fetch used
  to source the actual quote in `sources.jsonl`).

## 3. Reasoning gaps

- No causation-from-correlation issues found: each "why it matters" line is
  explicitly framed as connective analysis, not a causal claim about the
  news items themselves.
- No generalization from a single example: all four "what moved" items are
  independently corroborated by at least one non-vendor source (s02/s01,
  s04/s03, s06/s05, s08+s09/s07).
- Numbers checked for denominator/timeframe: MHS "hours or minutes" vs.
  "weeks or months" is flagged vendor-stated; BotBase's "57.4%/42.6%" figure
  carries its timeframe (June 2026) and is attributed to independent
  reporting; the "~700 agents" and "~7x since 2023" figures both carry
  their source and rough-count framing ("roughly").
- No "everyone"/"no one"/"most people" generalizations found in the draft.

## 4. Missing counter-evidence — must-fix, now resolved

Initial draft did not surface any skepticism of OpenAI's Hugging Face
account. A targeted counter-evidence sweep found Fortune's comparison of
OpenAI's report against Hugging Face's own post-mortem: OpenAI's version
omits the specific prompt given to the agents and contains no code or
message excerpts, while Hugging Face's post-mortem reportedly did include
specific technical evidence. **This was a must-fix** (the draft's account of
a vendor-authored incident report needs the "how much do we actually know"
counter-frame) — added to `draft.md` and `draft.ko.md` as `[^s09]`, source
added to `sources.jsonl`. A parallel sweep for skepticism of the Agentic
Payments Alliance found real tension (crypto-native vs. traditional-rail
member interests) reported by Payments Dive/American Banker coverage, but a
direct fetch of the Payments Dive piece did not surface a quotable passage
supporting the specific framing drafted, so that addition was dropped rather
than shipped un-sourced (see §1). **Not treated as a second must-fix**: the
Alliance section already carries an uncertainty flag (`_(early signal)_`)
and `working/uncertainties.md` already notes the Alliance is a governance
body, not a shipped spec, which covers the same underlying "this could go
several ways" honesty the missing tension-sentence would have added.

## 5. Tone and structure

- Abstract is faithful to the body: all four items and the cross-cutting
  "who decides what trusted agent means" framing in the Abstract match the
  body's "Why it matters" section.
- Limitations section matches `gaps.md`: GitHub/papers lanes not exercised,
  OpenAI account vendor-stated, Alliance is pre-technical — all three
  appear in both files.
- No emoji, no marketing voice found.
- No paragraph exceeds ~6 sentences after revision (longest is the OpenAI
  item's first paragraph, now split by the added counter-evidence sentence
  into two logical units within the same paragraph — acceptable length).

## 6. Must-fix vs. nit summary

- **Must-fix found: 1** (missing counter-evidence on the OpenAI/Hugging Face
  report) — **resolved** in this pass.
- **Nits found: 0** after the uncited tension-sentence was self-corrected
  during drafting rather than shipped.
- **Open must-fix items: 0.** Report is ready for the publish gate.
