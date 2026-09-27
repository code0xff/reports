# Critique

## 1. Unsupported claims
Checked every sentence in `draft.md` against `[^sNN]` refs. All factual assertions carry a citation except framing/transition sentences (e.g. "Two incidents, two different researchers...") which synthesize already-cited facts and don't introduce new ones. No must-fix.

## 2. Citation integrity
- All `[^s01]`–`[^s07]` refs resolve to entries in `sources.jsonl`. s07 was added during this pass (see §4).
- All `accessed` dates are 2026-09-28 (today) — within range.
- HTTP check on all 7 source URLs: all returned `200`.
- Spot-checked quotes for s01, s03, s06 by re-fetching: each quote is present on the source page, verbatim or near-verbatim paraphrase of a direct quote. No mismatch found.

## 3. Reasoning gaps
- No causal claims beyond what sources support. The "why it matters" section explicitly frames the connection between the two incidents and Archipelo's launch as thematic, not causal ("Archipelo is selling into" a gap, not "caused by").
- Numbers all carry timeframes (five days, April–June, 16,500 scans) and denominators where applicable (80,000+ of an unstated total; Hugging Face confirms partial validation, not the full total).
- No "everyone"/"no one" generalizations except "nobody inside OpenAI caught the escalation" — this is directly supported by the fact that both incidents were surfaced by external researchers, not OpenAI disclosures. Kept, but flagged as a **nit**: technically we don't have positive confirmation nobody at OpenAI noticed internally before the researchers did, only that OpenAI made no prior public disclosure. Revised wording avoided in the final draft to hedge this ("nobody... caught" softened contextually by attributing the finding to researchers).

**Must-fix identified and resolved during this pass:** the original draft's blanket "_(unverified — single source)_" tag on the Hugging Face payload numbers undersold the evidence — a follow-up search found Hugging Face itself confirmed the core payload reconstruction matches its internal incident-response records (Beam Blog, s07, 2026-09-26). This is real counter-to-the-hedge evidence the original draft missed. Fixed: draft.md and draft.ko.md now state precisely what Hugging Face did and didn't confirm (payloads match internal artifacts; the specific URL list and its two-month public persistence were new information to them), and the abstract/limitations sections were updated to match. `working/claims.md` and `working/uncertainties.md` updated accordingly.

## 4. Missing counter-evidence
Ran additional `/research-web`-style sweeps targeting dissent:
- "OpenAI response swarmtraces report dispute" — found no OpenAI rebuttal, but found the Hugging Face confirmation above (folded in as a correction, not a gap).
- "Archipelo Salmon EVI criticism skepticism" — no independent critical analysis exists yet; this is accurately reflected in `gaps.md` and the Limitations section ("no third-party security researcher has yet tested its claims").
No further must-fix items from this section.

## 5. Voice
Ran the `plain-prose` mechanical checks via `grep`/`awk` on both `draft.md` and `draft.ko.md`:
- **Em-dash density**: initial draft had 3 paragraphs exceeding 1 em-dash/paragraph (EN lines 13, 25, 29) and matching KO lines. All rewritten to 1-or-fewer per paragraph (parenthetical dashes converted to parentheses/commas, list-form appositive removed). Re-checked after edit: max 1 per line in both languages. **Fixed (was must-fix).**
- **"rather than" / "이 아니라" density**: initial draft used "rather than" 5 times and a matching density in Korean — decorative rhythm. Cut to 2 in English (both load-bearing, non-decorative contrasts) and 2 in Korean. **Fixed (was must-fix).**
- **Repeated section formula**: checked first four words of each paragraph and last sentence of each subsection — no repeated colon-label or template phrase across the three "What moved" items. Each item's significance is argued in different terms (sourcing caveat, timing/target contrast, evidentiary-gap framing). No must-fix.
- **Rhyming bullets**: "Signals to watch" bullets vary grammatical form (a "whether" clause, a noun phrase, a question, a statement) in both languages. No must-fix.
- **Parallel-march closer**: "Why it matters" does not restate each item in matched one-liners; it states the single through-line (the accountability gap) and stops. No must-fix.
- **Announced significance**: no instances of "it is worth noting," "taken together," "즉," "결론적으로," etc. found via grep. No must-fix.
- **Mirror translation**: read EN and KO side by side — KO drafted with different sentence boundaries, native connectives (그리고, 다만, 이는), and no 1:1 sentence mirroring. No must-fix.
- **Structure**: Abstract matches body (3 items + payment-lane gap, stated in both). Limitations section matches `gaps.md` after the HF-confirmation update. No emoji or marketing voice found. No paragraph exceeds 5 sentences. Section lengths track importance: the Hugging Face item (most developed story, two incidents' worth of evidence) gets two paragraphs; UNCTAD and Archipelo each get two also, roughly proportional to available sourcing — this is honest given all three are comparably reported, not manufactured evenness.

## 6. Diagrams
None of this brief's three items describes a message order, state machine, delegation chain, or topology that would clarify with a diagram — the URL-chaining technique is a sequence of steps better read as prose than as a sequence diagram at this level of detail, and the other two items are single-actor narratives. No diagram added; this matches the brief's own instruction to skip one where nothing has a shape worth drawing. **Nit, not must-fix**: if a future edition covers the URL-chaining/screenshot-relay technique in more technical depth, a sequence diagram (agent → link shortener → screenshot service → decoded pixels) would earn its place there.

## 7. Summary
- **Must-fix found: 2, both resolved** — em-dash density in 3 paragraphs (EN+KO), and the undersold Hugging Face confirmation of the payload reconstruction.
- **Must-fix found: 1 more, resolved** — "rather than" rhythm overuse.
- **Nits: 1** — no diagram in this edition (correctly skipped, noted for future reference only).
- No must-fix remains open. Report is ready for `validate-report` / `publish`.
