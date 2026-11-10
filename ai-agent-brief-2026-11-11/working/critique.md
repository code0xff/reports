# Critique

## 1. Unsupported claims

No uncited factual assertions found. Every paragraph in "What moved" carries `[^sNN]` refs on its substantive claims. "Why it matters" and "Introduction" make interpretive claims (the through-line, the link to the prior edition) that are explicitly framed as this report's own reading, not sourced facts — acceptable.

## 2. Citation integrity

- All `[^s01]`–`[^s07]` refs used in `draft.md` exist in `working/sources.jsonl`; no orphaned refs.
- All 7 sources `accessed: "2026-11-11"` — within 90 days.
- HTTP check (curl, `-L -A "Mozilla/5.0"`) on all 7 URLs: all returned `200`.
- Spot-checked all 7 quotes (not just 3) against raw page HTML via curl:
  - s01 quote was originally a paraphrase, not verbatim text on the page. **Fixed**: replaced with the actual bracketed-arrow text from the PR body.
  - s02, s03, s04, s05, s06, s07: confirmed verbatim substrings on their respective pages.

## 3. Reasoning gaps

- No causation-from-correlation claims found; the "Why it matters" section explicitly frames the connection across the three items as an editorial reading ("Each is a different company solving its own version of the same problem"), not a causal claim.
- No unsupported generalizations ("most", "everyone", "no one") found via grep.
- The one percentage-free number claim ("Four pull requests... between 2026-11-08 and 2026-11-10") carries its own date range as the denominator/timeframe.

## 4. Missing counter-evidence

- Ran additional web searches for: eBay/Muse blocking (no corroboration found beyond The Verge, which this harness could not fetch — moved to Limitations and dropped as a claim), Gemini 4 Carbon "swarm" feature (no independent coverage found describing such a feature — dropped as a claim and logged in Limitations), and card-network/PSP agentic-commerce announcements in the window (none found). No counter-evidence surfaced against the three items actually used; they are vendor/code-level facts (merged PRs, a beta launch) rather than contested claims, so no dissenting view was expected or found.
- **Must-fix resolved**: initial draft asserted the eBay/Muse story with a The Verge citation only; dropped after the lane could not independently fetch or corroborate it (now in Limitations, not in "What moved").

## 5. Voice

- **Repeated section formula**: none found. Section lengths differ by substance: the mppx item (most consequential, most technical) runs three paragraphs plus a diagram; the Adobe item runs one paragraph; no colon-label repeats across items.
- **Em-dash density**: original draft had up to 3 em-dashes in single paragraphs, including two paired dashes within one sentence (English abstract, mppx paragraph, "Why it matters" paragraph, Adobe paragraph) and a translated-feeling 2-per-paragraph density in the Korean abstract and "why it matters" section. **Fixed**: rewrote all of these to parentheses, periods, or plain clauses. Remaining dashes: one per paragraph at most, except the fixed `_(vendor-stated — ...)_` marker format, which is a convention, not decoration.
- **"rather than" / "not X, but Y"**: original draft had 4 instances of this contrast rhythm across a 7-section brief. **Fixed**: cut to one real correction (OpenAI's business agent disclosure point was simplified to remove it entirely; the mppx Link-identity point and the "why it matters" closer keep one each as substantive, non-decorative contrasts).
- **Rhyming bullets**: "Signals to watch" originally had 3 of 4 bullets starting with "Whether". **Fixed**: varied grammar (a noun phrase, a question, a colon-led assertion) in both languages.
- **Parallel-march closer**: "Why it matters" does not restate each item in matched one-liners; it states the one connecting idea and stops.
- **Announced significance**: no "Taken together", "It is worth noting", "이를 종합하면", "결론적으로" found via grep.
- **Mirror translation**: Korean draft was written with different sentence boundaries and connectors than the English (e.g., the abstract splits OpenAI's point into two short sentences in Korean rather than mirroring the English's single contrastive clause); not a sentence-for-sentence translation.

## 6. Diagrams

- One `mermaid` sequence diagram added to the mppx section (both languages), showing the shared `401 → attestation → 402 → payment` shape across all four PRs. Earns its place: four distinct PRs reduce to one repeated flow, which is exactly what a diagram should compress. Caption cites what the arrows assert (identity-before-payment, same shape across issuer types). Korean version uses translated `participant` aliases and a translated caption.
- No other section in this brief describes a message order, state machine, or topology worth a second diagram; OpenAI's and Adobe's items are single-actor feature launches with no sequence to draw.
- Rendered-page check: pending `publish` (render happens at that step); will re-check the rendered HTML before calling this done.

## 7. Must-fix vs. nit summary

- Must-fix found: 3 (em-dash/dash-pairing density, "rather than" overuse, one unverified claim — eBay/Muse — initially under-sourced). All 3 resolved above.
- Nits found: 2 (rhyming "Signals to watch" bullets, s01 quote being a paraphrase rather than verbatim). Both resolved above.
- No must-fix items remain open.
