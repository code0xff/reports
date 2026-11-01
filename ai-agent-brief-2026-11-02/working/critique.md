# Critique — AI agent brief, 2026-11-02

## 1. Unsupported claims

Checked every paragraph in `draft.md` against its citations.

- Abstract: all four factual claims trace to s01/s02/s03, cited inline.
- Introduction: the PR #3151 reference now carries [^s04] (added during this pass — it was previously named in prose without a citation).
- "What moved" §1 (#3916): cited [^s01]; the "follow-up to review feedback on #3551" detail is the PR's own stated provenance, not independently verified, but is attributed to the PR itself so no separate citation is needed.
- "What moved" §2 (#4079): cited [^s02]; the file/line and version details are drawn directly from the issue body already cited.
- "What moved" §3 (#4081): cited [^s03].
- "Why it matters": the trailing-slash fix is now named explicitly and carries [^s05] (previously implied without a citation).
- Limitations: "sixth edition running" is a factual claim about prior editions' content, not this edition's sources — verified by reading the five most recent prior briefs' Limitations sections directly (not re-cited, since it describes the corpus of prior reports, which `PROTOCOL.md` treats as the working record rather than an external source).

**Status: resolved.** Both previously uncited mentions (PR #3151, PR #4067) now carry footnotes.

## 2. Citation integrity

- All `[^s01]`–`[^s05]` refs in `draft.md` and `draft.ko.md` exist in `sources.jsonl`; both files now cite all five sources (verified with `grep -o`).
- All five `accessed` dates are `2026-11-02` (today), well within 90 days.
- Spot-checked HTTP status on 3 of 5 URLs (s01, s02, s04): all returned 200.
- Quote spot-check: s01's quote matches the exact commit message text for PR #3916 (fetched via `gh api repos/x402-foundation/x402/commits`); s02 and s03's quotes match their issue bodies verbatim (fetched via `gh issue view --json body`); s04 matches the PR #3151 commit message; s05 matches the PR #4067 body. No paraphrase passed off as a quote.

**Status: no issues.**

## 3. Reasoning gaps

- "Why it matters" draws a pattern from three defects in one repository over roughly 36 hours. That is a small sample — explicitly scoped to "three defects, three different causes, one pattern" rather than claiming a general trend across the ecosystem, and the Limitations section already flags the single-repository, single-lane sourcing.
- No claim of causation beyond what the issue reports themselves assert (e.g., #4079's reasoning chain from the wrong method name to a non-functional replay check is the issue author's own, cited as such).
- No "most/everyone/no one" generalizations found in either draft.
- The "sixth edition running" claim has a timeframe (reviewed against prior editions) and is falsifiable; no bare numbers without denominators were found.

**Status: no must-fix.**

## 4. Missing counter-evidence

Ran one additional web sweep targeting the opposite claim: that x402's facilitator hook layer is, in fact, well-tested and the two new issues are minor/already triaged. Searched GitHub for any maintainer response, linked PR, or "wontfix"/"duplicate" label on #4079 and #4081, and for any blog post or forum discussion disputing the SIWX nonce-check severity. Found none — both issues remain open, unlabeled, with no maintainer comment as of this writing. This absence is itself reported in the draft's Signals-to-watch and Limitations sections ("unconfirmed... bug reports", "since both currently rest on a third-party contributor's own reading of the code"), so the counter-evidence search changed nothing in the draft but confirms the hedging already present is warranted.

**Status: no must-fix.** (Absence of rebuttal is represented, not hidden.)

## 5. Voice

Ran the plain-prose mechanical checks:

- **Repeated section formula**: first four words of every paragraph and subsection differ; no repeated opener found.
- **Em-dash density**: 4 in `draft.md` (one per paragraph/bullet, none doubled in a single sentence) after revision; 0 in `draft.ko.md`.
- **"Rather than" / "이 아니라"**: one occurrence in each language, at the parallel point in the Limitations section (English "rather than merged changes"; Korean "해결된 것이 아니라 발견된 것을 전한다"). Both correct a real possible misreading (that this edition reports fixes, when it mostly reports open findings). Kept.
- **Rhyming bullets**: the "Signals to watch" list originally had all three bullets open with "Whether". **Must-fix, fixed**: revised to vary grammatical form (a whether-clause, a noun phrase, a whether-clause with different structure) in both languages.
- **Parallel-march closer**: "Why it matters" ends on a single synthesizing sentence, not a per-item recap. No fix needed.
- **Announced significance**: no instances of "taken together," "it is worth noting," "이를 종합하면," or similar found in either draft.
- **Mirror translation**: read side by side; the Korean restructures sentences (e.g., splits/reorders clauses, uses Korean-native connectors like 그런데, 즉) rather than mirroring English syntax. Not a literal translation.
- **Section length**: the SIWX finding (§2) is the longest "what moved" subsection, reflecting that it is the most severe and best-evidenced finding; the hook-message-drop finding (§3) is shorter, matching its narrower scope. Lengths track importance.
- **Emoji / marketing voice**: none found.
- **Paragraph length**: longest paragraph (SIWX finding) is 7 sentences; split is marginal but each sentence carries distinct technical content (what's checked, what should be checked, the two failure branches, the consequence, the evidence). Left as one paragraph — a nit, not a must-fix, since splitting it would separate a cause from its immediate consequence.

**Status: one must-fix found and resolved (rhyming bullets). One nit left open (paragraph length, judgment call).**

## 6. Diagrams

This edition's three findings are all point defects in request/response handling (a dropped field, a misspelled capability check, a signer-resolution branch) — none describes a message order, state machine, delegation chain, or topology distinct enough to earn a diagram. A diagram was considered and rejected: the SIWX nonce-check failure could be drawn as a two-branch flowchart, but the prose already states both branches in one sentence each, and a diagram would repeat rather than clarify. No diagram added to either language. This is consistent with `PROTOCOL.md` §3's guidance to skip a diagram that would be decoration.

**Status: no diagram; decision documented, not a gap.**

## 7. Must-fix vs. nit summary

- **Must-fix (2, both resolved during this pass):** missing citations on PR #3151 and PR #4067 mentions (§1); rhyming "Whether…" bullets in Signals to watch (§5).
- **Nits (1, left open, judgment call):** the SIWX paragraph runs 7 sentences; a split was considered and rejected because the sentences are causally chained.

No must-fix items remain open.
