# Critique — ai-agent-brief-2026-11-25

## 1. Unsupported claims

No sentence making a factual assertion about an external event lacks a
`[^sNN]` ref. The "Why it matters" section's synthesis sentences (e.g. "The
pattern holding across four brief cycles now...") are analysis built on cited
facts above them, not new factual claims, so they are not citation-bearing by
design. No action needed.

## 2. Citation integrity

- All refs `[^s01]`–`[^s06]` used in `draft.md` and `draft.ko.md` exist in
  `working/sources.jsonl`; no orphan refs, no uncited sources.
- All six sources show `"accessed": "2026-11-25"` — within range.
- URL spot check (HEAD/GET via curl) on 3 of 6 sources: all three sampled
  (s01 Google Cloud blog, s02 mppx GitHub release, s04 OpenAI Shirudo page)
  returned 200.
- Quote spot check: s01's quote ("a valid token is no longer enough...")
  matches the web-fetch agent's verbatim capture of the page. s02's quote is
  assembled from two non-adjacent sentences in the same release-notes bullet,
  joined with an ellipsis, which is kept in the stored quote. s04's quote
  matches verbatim. No open items.

## 3. Reasoning gaps

- "Why it matters" draws a generalization from 4 items plus one 4-cycle-old
  stalled governance thread, but the brief states its evidence base
  explicitly ("the pattern holding across four brief cycles"), so this is a
  nit, resolved as-is: no overreach beyond what the text claims.
- No numbers are quoted without a timeframe or denominator; Google's dates
  (Feb 1 / Apr 1 2027) and mppx's version number are both precise and dated.

## 4. Missing counter-evidence

Checked for dissenting coverage of Google's Workspace agent mandate and for
any competing claim that mppx's x402/MPP bridge is unsound. No such coverage
exists in the 72-hour window — both releases are hours old. Resolved by
adding an explicit single-source note to both items in the draft (the Google
section and the mppx section each now state that the primary artefact is the
only coverage found).

## 5. Voice

Ran the `plain-prose` mechanical checks and resolved every finding below:

- **Em-dash density.** Original drafts had two paragraphs (the Shirudo
  section and, after the first fix pass, the mppx and "Why it matters"
  sections) with two em-dashes bracketing a single parenthetical in one
  sentence, or two dashes in one paragraph. All were rewritten — one dash
  kept per paragraph, the rest converted to colons or sentence breaks. Final
  counts: 7 em-dashes across 8 paragraphs in English, 8 across 9 in Korean,
  none doubled within a sentence or paragraph. Resolved.
- **"rather than" / "이 아니라" density.** English had 4 instances, Korean had
  4. Reduced to 1 genuine contrast per language ("coming soon" rather than
  live, in the Google section); the rest rewritten as plain assertions or
  colon constructions. Resolved.
- **Typo.** Line "a instance" → "an instance". Resolved.
- **Repeated section formula.** First four words and closing sentences of
  each subsection checked — no repeated template found. No action needed.
- **Rhyming bullets.** "Signals to watch" originally had two consecutive
  "Whether..." bullets; the second was rewritten as a plain noun-phrase
  bullet. Resolved.
- **Parallel-march closer.** "Why it matters" states one through-line rather
  than restating each item — no action needed.
- **Mirror translation.** Korean draft uses different sentence boundaries,
  connectors, and paragraph breaks than a literal translation would; spot
  checks of three paragraphs confirm it carries the same citations without
  mirroring English sentence-for-sentence. No action needed.
- **Marketing voice / emoji.** None found.
- **Paragraph length.** No paragraph exceeds 6 sentences in either language.
- **Section length vs importance.** Google's item (most consequential, has
  dates and numbers) runs two paragraphs; mppx and the OpenAI sandbox item
  run one each; Shirudo runs one longer paragraph justified by its
  off-beat framing. Lengths track substance. No action needed.

## 6. Diagrams

No section describes a message order, state machine, delegation chain, or
topology clean enough to warrant a new diagram this cycle — unlike the Nov 24
brief's x402 working-group handoff, today's items are four independent,
single-actor releases. Correctly omitted. Noted as a nit only in the sense
that the x402 story, once it actually moves again, will be worth a diagram in
a future brief.

## 7. Must-fix vs nit summary

No must-fix items remain open. All six items raised in the first pass (double
em-dashes in one sentence in both languages, excess "rather than"/"이 아니라"
density, the typo, and the missing single-source caveats) were fixed in this
revision and verified above. The two nits (rhyming bullets, no diagram this
cycle) were also addressed or confirmed as correct as-is.
