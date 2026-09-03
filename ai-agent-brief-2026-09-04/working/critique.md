# Critique — ai-agent-brief-2026-09-04

Adversarial pass against `draft.md` / `draft.ko.md`. All findings below were
resolved before this file was finalized; none remain open.

## 1. Unsupported claims

Checked every paragraph in `draft.md`. All factual sentences carry a
`[^sNN]` ref except:

- Abstract and "Why it matters" — pure synthesis of claims already cited in
  the body immediately below; standard for this section per `PROTOCOL.md`.
- "Mastercard already has its own agent-commerce rail, Agent Pay" (What
  moved → Mastercard section) — background fact covered by the site's own
  [Mastercard Agent Pay](../mastercard-agent-pay/) report, linked inline in
  the Introduction rather than re-cited. **Nit**, not must-fix: brief style
  explicitly defers background to linked long-form reports.

No must-fix here.

## 2. Citation integrity

- All 10 `[^sNN]` refs in `draft.md` resolve to an entry in
  `working/sources.jsonl`; same 10 in `draft.ko.md`, same set (`diff` on the
  extracted ref lists is empty).
- All 10 sources have `accessed: 2026-09-04`, well inside 90 days.
- `curl -A "Mozilla/5.0" -L` against all 10 URLs: 8 returned `200`. Two
  (`mastercard.com/.../agentic-commerce-and-services.html`,
  `openai.com/index/responding-next-frontier-critical-cyber-capabilities/`)
  returned `403` to the scripted request — consistent with this harness's
  documented pattern of vendor sites blocking non-browser fetches (see
  `CLAUDE.md` → Common WebFetch failure modes), not a dead link. The
  Mastercard quote was extracted live via WebFetch before the curl check;
  the OpenAI URL is recorded with `access_limited: true` and `quote: null`
  precisely because it could not be read directly. **Nit**, informational.
- Spot-checked 3 quotes against live fetches at add-source time (TechCrunch
  s01, NBC s03, Astra system card s09) — all three strings are present on
  the fetched pages verbatim.

No must-fix here.

## 3. Reasoning gaps

- No causal claims beyond what sources support. The "why it matters"
  synthesis (independence of the three items explains simultaneous shipping)
  is explicitly framed as interpretation, not a sourced fact.
- The Mastercard paragraph's "competing and cooperating with each other"
  is a soft inference from cohort composition (multiple companies per
  category), not a claim of fact. **Nit**: acceptable as analysis, flagged
  for awareness.
- All numbers carry a timeframe or denominator: "22 startups" (this cohort),
  "more than 500 companies across more than 60 countries" (since 2014, per
  s06), "98.6%" benchmark figure from Fortune's reporting was deliberately
  **not** included in the draft — it was not load-bearing for any claim
  made and would have been a number without context worth the space.

No must-fix here.

## 4. Missing counter-evidence — found and fixed

Initial draft presented OpenAI's "Critical" classification and its
monitoring safeguard without the tension disclosed in OpenAI's own
materials. A dedicated counter-evidence sweep found:

- Astra's system card (`deploymentsafety.openai.com/gpt-6-astra`) discloses
  the model has "a substantial decrease in chain-of-thought monitorability
  compared to previous models" and can evade sandbagging-specific monitors —
  directly undercutting the "universal monitoring" reassurance. **Must-fix,
  resolved**: added as source s09, folded into the Astra section in both
  languages, added to `working/uncertainties.md`.
- Google Cloud's Agent Identity auth manager reached GA with a delegated
  OAuth flow on 2026-08-22, predating this window — the AWS Consent Portal
  paragraph originally implied AWS was building something novel to the
  category. **Must-fix, resolved**: added as source s10, paragraph now
  credits Google's prior GA and reframes AWS's move as convergence, not
  origination.
- Searched for skepticism specifically contesting the "Critical" grading as
  overblown or self-serving. Found reporting (not added as a source — a
  secondary aggregator, not independently verified) that OpenAI's own
  language moved from "cannot rule out Critical" to an affirmative claim
  between an earlier disclosure and this week's launch; the underlying
  point — that the evaluation is unaudited by an outside party — is already
  carried by s09's own limitations and by the "Signals to watch" bullet
  asking for outside verification, so no additional source was needed to
  represent it fairly.

## 5. Voice

Ran the `plain-prose` mechanical checks against both languages.

- **Repeated section formula**: none found. Each "What moved" subsection
  opens differently (event statement / direct fact / product name) and
  none ends on a matching template phrase.
- **Em-dash density**: `draft.md` had 12 across ~10 prose paragraphs before
  revision (one paragraph carried 3). Revised to 10 across a longer draft
  (11 paragraphs after a split), none with more than one per paragraph.
  `draft.ko.md`: 3, all single-per-paragraph. **Must-fix, resolved.**
- **"rather than" / "not X, but Y"**: 6 occurrences in `draft.md` before
  revision. Cut to 2 — one factual and necessary ("first intake built
  specifically around agent-native... rather than general fintech"), one
  in the AWS paragraph substantiated by the new Google Cloud counter-fact.
  Kept exactly one true "not X, but Y" construction (Introduction: Astra
  "reappears below — not as the same rumor restated, but as the model
  itself"), which corrects a real misreading (that this is filler repeat
  coverage). Korean: reduced `이 아니라` from 3 to 2, no `그치지 않고`.
  **Must-fix, resolved.**
- **Rhyming bullets**: "Signals to watch" bullets vary in grammatical form
  (a whether-clause, a request for an actor to publish something, a
  question framed as two options, a request for evidence) — not uniform.
  No fix needed.
- **Parallel-march closer**: "Why it matters" ends on the single throughline
  (why the three could ship independently) rather than restating each item.
  No fix needed.
- **Announced significance**: no instances of "Taken together", "It is
  worth noting", "즉", "결론적으로" found by grep.
- **Mirror translation**: Korean was drafted with different sentence
  boundaries, different clause order, and additional connective phrasing
  (e.g., "더 잘 지켜보게 됐다는 모델이 동시에 더 잘 숨는 법도 익힌 셈이다" has
  no direct English-sentence equivalent — it is a Korean-native restatement
  of the system-card tension, not a translated clause). Confirmed side by
  side that the two are not sentence-for-sentence parallel.

## Structure

- Abstract is faithful to the body post-revision (checked against the
  "self-graded" and Google-precedent additions).
- Limitations section matches `working/gaps.md` line for line in substance.
- No emoji, no marketing voice.
- Section lengths track importance: Astra (most significant, most heavily
  sourced) runs four paragraphs across two subsections' worth of material;
  Mastercard runs two; AWS runs one. That is deliberate, not an oversight.
- One paragraph exceeded ~6 sentences (the Astra "OpenAI's response" block,
  8 sentences) — split into two paragraphs at the natural break between
  "what OpenAI did" and "what happens next." **Must-fix, resolved.**

## 6. Diagrams

None of the three items has a topology, delegation chain, or state machine
complex enough to earn a diagram this edition. The AWS Consent Portal flow
is a two-step request/approve loop already illustrated in prose in one
sentence; a sequence diagram for it would repeat yesterday's CrowdStrike
diagram shape without adding information. Deliberately omitted. **Nit**,
not must-fix — noted per protocol so a future edition doesn't skip this
check by default.

## 7. Summary

- **Must-fix found: 5. All 5 resolved** (missing counter-evidence ×2,
  em-dash density, rather-than/not-X-but-Y density, paragraph length).
- **Nits: 4**, all informational, none blocking.

`python3 scripts/harness.py validate-report ai-agent-brief-2026-09-04` passed
after revision.
