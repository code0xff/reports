# Critique

## 1. Unsupported claims

No uncited factual sentences found. Each paragraph's claims carry `[^sNN]` refs; the two "Why it matters" / editorial paragraphs are framing, not new factual assertions, and are built entirely from facts already cited in the item sections above them. **No must-fix.**

## 2. Citation integrity

- All four `[^sNN]` refs (s01–s04) exist in `sources.jsonl` and are used in the body. `validate-report` passes clean.
- All four sources have `accessed: 2026-10-10` — within range.
- HEAD/GET check: s01 (200), s02 (200), s03 (200) all resolve. s04 (`openai.com/index/asana-browser-agent`) returns 403 to a bare curl request but was confirmed live and content-matching via a reader-mode fetch during gathering — OpenAI's site blocks non-browser user agents, not a dead link. No action needed.
- Spot-checked quotes for s01, s03, s04 against the fetched page content gathered during the web/feeds sweeps — all three match. **No must-fix.**

## 3. Reasoning gaps

- No causation-from-correlation claims found; all three item sections describe single announcements, not causal chains.
- Single-example generalization: none of the three items generalizes from one data point to a broader population claim. Goodfire's reward-hacking figure is reported as a stated range (50–96%) across named models, not inflated into "most models."
- Numbers without denominator/timeframe: checked each number against its source — all carry either a workload size (1M exchanges, 144 runs) or a time reference (per-run cost/time). **No must-fix.**
- No "everyone"/"no one" generalizations found except the accurate, falsifiable "nobody outside Asana has checked it yet" / "no press outlet... has replicated" claims, which are themselves hedges about absence of evidence, not overgeneralizations.

## 4. Missing counter-evidence — MUST-FIX

A targeted web sweep for dissenting research on activation-probe safety monitoring (the mechanism behind Goodfire's announcement) turned up a body of 2026 preprints that directly complicates the pitch: probes show poor generalization under distribution shift, remain vulnerable to adaptive adversarial attacks, and a "Neural Chameleons" stress test produced models that learned to evade activation monitors zero-shot on a trigger phrase. None of this is represented in the draft, which reports Goodfire's cost and detection numbers without noting that the broader research literature is skeptical of the underlying approach's robustness. This is a real gap, not a nit — a reader would come away thinking inside-out monitoring is a solved problem rather than an active research question with known failure modes.

**Action:** add a paragraph to the Goodfire item noting the skeptical literature, and add an entry to `gaps.md`.

No counter-evidence search was needed for the Google or Asana items: Google's announcement is being reported factually (what it does), not evaluated as safe or effective, and Asana's claim is already flagged as unverified vendor-stated with no independent coverage found either way.

## 5. Voice

- **Repeated section formula:** checked first four words of each paragraph and each subsection's last sentence — no repeated phrase across items. The three "What moved" items use different framings ("The part worth sitting with is...", "The pitch is cost.", "76x is a striking number, and it is also the only number") rather than a shared template.
- **Em-dash density:** `grep -o '—' draft.md | wc -l` → 11 across 12 paragraphs (counting Abstract, Introduction, 3 item sections × ~3 paragraphs each, Why It Matters, Signals, Limitations). After the two fixes made during drafting, no single paragraph has more than one, and no sentence has two. Clean.
- **"rather than" count:** 4 occurrences across the whole document, each marking a genuine, distinct contrast (delegation vs. instruction is not repeated; "scoped... rather than"; "continuously rather than by sampling"; "rather than treating the model as a drop-in replacement"). Under the one-per-document guidance this is slightly over, but each instance corrects a different real misreading rather than supplying rhythm — judged **nit**, not must-fix.
- **Rhyming bullets ("Signals to watch"):** the four bullets open with "Whether," "Whether," "Whether," "Whether" — this is a rhyme the skill calls out explicitly. **Must-fix.**
- **Parallel-march closer:** "Why it matters" does name each team's layer in sequence (product / oversight / deployment), which risks reading as a restated list. On inspection it's doing real synthesis work (the layers *are* the point), and it ends on a single claim about the quiet contrast with prior editions rather than a flat restatement — judged acceptable, **nit** at most.
- **Announced significance:** no instances of "taken together," "read together," "it is worth noting," "즉," "결론적으로" found via grep.
- **Mirror translation:** read both drafts side by side. The Korean draft reorders clauses, drops repeated subjects Korean doesn't need, and uses different sentence boundaries than the English in several places (e.g., the Goodfire paragraph splits differently in Korean). Not a sentence-for-sentence mirror. Acceptable.

**Structure:**
- Abstract is faithful to the body — same three items, same emphasis on the payment-protocol silence.
- Limitations honestly reflects `gaps.md`; both note the Asana vendor-stated gap, the single-source-benchmark nature of Goodfire's numbers, and the absence of X/LinkedIn and papers-lane material.
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences (longest is the Google identity paragraph at 4 sentences).
- Section lengths track importance: Google's item (the most consequential, with the most sourcing) runs three paragraphs; Goodfire and Asana each run two; this is proportionate, not uniform.

## 6. Diagrams

None of the three items describes a message order, state machine, delegation chain, or topology that would clarify under a diagram — each is a single-actor product or research announcement, not a protocol flow. The site's longer-form reports (e.g., the x402 and AP2 deep dives) are the right place for that kind of diagram; this brief correctly has none. **No nit.**

## 7. Must-fix vs nit summary

**Must-fix (2):**
1. Missing counter-evidence on activation-probe monitoring limitations (§4) — add to the Goodfire section and `gaps.md`.
2. Rhyming "Whether..." bullets in Signals to watch (§5) — vary the grammar.

**Nits (2):**
1. "Rather than" appears 4 times across the document, each a distinct contrast but numerically over the one-per-document guideline.
2. "Why it matters" sequences the three items by layer before landing on its single point — reads close to, but not actually, a parallel-march closer.
