# Critique

## 1. Unsupported claims
None found. Every factual assertion in `draft.md` and `draft.ko.md` carries a `[^sNN]` ref, and the analytical sentences in "Why it matters" are framed as reasoning over the cited items, not new factual claims.

## 2. Citation integrity
- All 8 `[^sNN]` refs resolve to entries in `working/sources.jsonl`; no orphan refs either direction.
- All 8 `accessed` dates are 2026-10-11 (today) — well within 90 days.
- `curl -L` HEAD-equivalent check on all cited URLs returned HTTP 200.
- Spot-checked quotes against fetched page content for s01 (Anthropic), s04 (TechCrunch/Nadella), s05 (NBER), and s08 (Jellyfish): all four quotes appear verbatim in the fetched text. No fabricated quotes found.
- `validate-report ai-agent-brief-2026-10-11` passed with no warnings.

## 3. Reasoning gaps
- No causation-from-correlation issues: the NBER paragraph correctly frames the 240%/80%/30% figures as one paper's own numbers, and the draft flags the revision discrepancy as an uncertainty rather than asserting a single clean number.
- No "most people"/"everyone"/"no one" generalizations found.
- Numbers all carry a timeframe and source (NBER percentages tied to the paper; Anthropic's review tied to "begun in July").

## 4. Missing counter-evidence — resolved
A second web sweep for the NBER study turned up Jellyfish's March 2026 benchmark (700+ companies, 20M pull requests), which reports top-quartile AI adopters shipping twice the PR throughput of low adopters — a reading that points the opposite direction from the NBER "weak-link" framing on its face. The draft's NBER paragraph originally didn't acknowledge this, which made the paper's finding look more settled than it is. Fixed: added the Jellyfish figure as cited source s08, with the methodological caveat that it measures throughput at companies that already adopted the tooling, not the commits-to-releases ratio NBER tracked across the broader developer population — so the two findings answer different questions rather than flatly contradicting each other. Also noted in `gaps.md`.

## 5. Voice

**English (`draft.md`):**
- Em-dash count was 17 across 21 paragraphs, with two sentences (in the abstract and the NBER paragraph) each carrying two em-dashes. Fixed: both repunctuated with periods/commas; current count is 11, none doubled within a single sentence (verified programmatically).
- "rather than" appeared 6 times, mostly decorative. Fixed: reduced to 1 — the genuine complements-vs-substitutes correction in the NBER paragraph — with the rest rewritten as plain assertions ("that overrides...", "instead of treating...", "not an exception handled after the fact", etc.).
- The "Why it matters" paragraph originally restated each item in matched one-liners (a parallel-march closer). Fixed: rewritten into one synthesis sentence instead of a per-item recap, in both languages.
- No repeated colon-label template across "What moved" subsections — openers and closers of each subsection are genuinely distinct.
- Section lengths already track importance (Anthropic gets two paragraphs and the most detail; Nadella's second paragraph is shorter and interpretive; NBER and AQuA are single, denser paragraphs).
- No emoji, no marketing voice, no paragraph over 6 sentences.

**Korean (`draft.ko.md`):**
- `것이다` originally appeared 6 times, 3 clustered in the "왜 중요한가" paragraph. Fixed: the "왜 중요한가" paragraph was rewritten without that ending; total is now 3, spread across the document with no cluster.
- `이 아니라` / `그치지 않고` originally appeared 4–5 times, including two in one sentence. Fixed: reduced to 1, mirroring the single kept English correction (NBER's complements-vs-substitutes point).
- Spot-checked Korean against English side by side: not a sentence-for-sentence mirror — paragraph breaks, clause order, and emphasis differ. Written as Korean prose, not translated.
- No `다만`/`오히려`/`이는` opening consecutive sentences.

## 6. Diagrams
No diagram in either draft. Correctly omitted: none of this window's four items describes a message order, state machine, delegation chain, or topology — they're a policy decision, a public statement, a statistical finding, and a tool description. Nothing here would be clearer as a diagram than as prose.

## 7. Summary
All findings from this pass were resolved in the draft: two over-punctuated sentences repaired, repeated contrastive framing trimmed to one instance per language, the closing section rewritten away from a per-item recap, and the missing counter-evidence on the NBER finding added as a cited, caveated source. `validate-report` passes with no warnings. Nothing remains open.
