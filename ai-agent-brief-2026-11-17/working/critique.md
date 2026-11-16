# Critique

## 1. Unsupported claims
None found. Every factual sentence in both drafts carries a `[^sNN]` ref, or is explicitly flagged as this brief's own interpretive reading (the "Why it matters" section, which synthesizes rather than asserts new facts).

## 2. Citation integrity
- All four `[^s01]`–`[^s04]` refs exist in `sources.jsonl` and are used. — ok
- All four sources have `accessed: "2026-11-17"`, well within 90 days. — ok
- `curl -I`/GET on all four URLs returned HTTP 200. — ok
- Quote spot-check (3 of 4, picked s01, s02, s03): all three quotes were read verbatim from the fetched pages during drafting (AG press release, TechCrunch article, GTIG blog). No discrepancy. — ok

`validate-report` passed with no warnings.

## 3. Reasoning gaps
- No causal claims beyond what sources state. The "Why it matters" section is explicit that the three items are not causally linked ("not one story, but they rhyme") rather than asserting a false causal connection — this is a deliberate hedge, not a gap.
- No single-example generalizations: each claim is scoped to its one item ("a framework," "a proposal," "a lawsuit"), not generalized to "all agents" or "the industry."
- The "at least 80 cyber incidents" figure has a source (AG's complaint via the press release) but no further breakdown; this is already named as a gap (complaint PDF not read directly).
- No "most people"/"everyone"/"no one" claims present.

## 4. Missing counter-evidence
Searched for counter-evidence on each major finding:
- **CA AG lawsuit:** OpenAI's rebuttal is already quoted directly in the draft ("single out OpenAI..."). No additional defense-side legal commentary was found in the window beyond what's cited.
- **GTIG report:** Searched for independent corroboration or skepticism of the "first time, no human in the loop" claim; found none dated in this window — this is already flagged as a gap and in Limitations.
- **x402 proposal:** Searched for objections to policy-in-protocol; the PR's own author raises the strongest counter-argument already, and it's quoted. No external commentary found.
No must-fix counter-evidence gaps; existing gaps.md entries cover the absences.

## 5. Voice

Ran the plain-prose revision pass on both drafts.

**Findings (before fix):**
- **[must-fix] Paired em-dash asides.** EN paragraph in Introduction ("not the subject of this edition — nothing ... — but") and in the CA AG section ("untested in court — Florida's ... — so") each use two em-dashes as a parenthetical in one sentence, violating "never two in one sentence." Same pattern mirrored in KO (Introduction and CA AG section). **Fixed**: converted both to parenthetical commas/restructured sentences in both languages.
- **[must-fix] Doubled "rather than" in one paragraph.** EN CA AG section used "rather than" twice in the same paragraph ("hazard rather than any single output" / "open rather than as a foregone result"), reading as a mini-template within one paragraph. **Fixed**: reworded the second instance to a plain assertion.
- **[nit] KO mirrors EN sentence-for-sentence in two paragraphs.** The Introduction and CA AG paragraphs in Korean followed the English clause order almost exactly (same two-dash structure, same clause breaks), which is the mirror-translation tell even though the words are idiomatic Korean. **Fixed** alongside the em-dash fix — rewrote both paragraphs with different clause order and sentence breaks from the English.
- No repeated section-opening formula: checked first four words of every paragraph across both languages; all distinct.
- No rhyming bullets: "Signals to watch" mixes three "Whether..." items with one plain statement; same mix in KO ("~ 인지" x3 then a plain noun-phrase final bullet) — acceptable variation, not mechanical.
- No parallel-march closer: "Why it matters" ends on the single synthesis, does not restate each item.
- No "taken together"/"it is worth noting"/announced-significance phrases found via grep in either language.
- Section lengths already track importance: the CA AG item (most developed, two sources, legal theory discussion) runs longest; the GTIG item is medium with a diagram; the x402 item is shortest, matching how thin its sourcing is.
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences.

All must-fix voice items above have been corrected in both `draft.md` and `draft.ko.md`.

## 6. Diagrams
One diagram (the `exploit_agent` loop) appears in both languages with translated labels. Caption cites what the arrows assert ("no step waits for a human to review it"[^s03]). Checked the rendered `index.html` and `ko/index.html` — both show a `<pre class="mermaid">` block with valid flowchart syntax (no `;` in labels, arrows render), and the mermaid runtime script is present. Confirmed by inspecting the rendered HTML output directly.
The other two items (a lawsuit, a protocol spec PR) have no inherent shape worth drawing — a diagram there would be decoration. Not flagged.

## 7. Must-fix vs nit summary
- Must-fix: 2 (both voice, both fixed before this critique was finalized)
- Nit: 1 (KO mirror-translation, fixed alongside the must-fix for efficiency, though classified as a nit)

No must-fix items remain open.
