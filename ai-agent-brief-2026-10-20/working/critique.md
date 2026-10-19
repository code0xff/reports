# Critique — ai-agent-brief-2026-10-20

## 1. Unsupported claims
None found. Every factual sentence in both drafts carries a `[^sNN]` ref or is covered by the same paragraph's preceding citation. The one normative sentence in "Why it matters" ("x402 and AP2's... assume the layer underneath them already works") is an inference from the Introduction's already-cited dormancy facts, not a new factual claim.

## 2. Citation integrity
- All `[^s01]`–`[^s07]` refs resolve in `sources.jsonl`; `validate-report` passes with no warnings after adding the missing `[^s03]` cite.
- All seven sources `accessed: 2026-10-20` — within range.
- s01, s02, s04, s05 were fetched directly (not from search-engine summaries); quotes were taken verbatim from the fetched text. s03 and s06/s07 are GitHub pages/API responses, fetched via `gh api` / WebFetch and quoted accurately.
- Spot-check: s01's quote ("Average success rate is hovering around 10%") matches the NorForge fetch. s04's quote (Gallot's "frontier models cannot be trusted regardless of origin") matches the TechCrunch fetch. s05's quote on the 1.4%/distillation framing matches the TechCrunch fetch. No discrepancies found.

## 3. Reasoning gaps
- No causation-from-correlation issues: each item's claims stay at the level the sources support (NorForge's own uncertainty language is preserved rather than smoothed over).
- No single-example generalizations: "Why it matters" explicitly scopes to "this window" rather than claiming a trend.
- Numbers carry timeframes throughout (23 hours, 48 hours, 1.4%, since April 29, since October 2025).
- No "everyone/no one" claims present.

## 4. Missing counter-evidence
Ran one additional web sweep specifically for dissent on each major claim:
- **Cairn attribution**: no outlet disputes NorForge's technical findings; the only pushback found is Cairn's own author disclaiming hacking intent, which the draft already includes.
- **Microsoft's framing**: TechCrunch's own self-interest critique is already folded into the draft — this is the counter-evidence.
- **OpenCode's distillation claim**: "outside observers aren't convinced" is already in the draft, sourced from the same TechCrunch piece's citation of skeptical commentary.
No must-fix counter-evidence gap found; all identified dissent is already represented.

## 5. Voice
- **Repeated section formula**: none found. Each item's opening and closing sentences use distinct constructions; no colon-label or "why it matters" boilerplate repeats across items.
- **Em-dash density**: EN has one em-dash usage per paragraph at most (verified by direct inspection, not just raw character count, since paired dashes form a single parenthetical). KO had one paragraph with two separate usages — fixed by converting the second to a period.
- **"not X, but Y"**: one real instance in the Introduction ("not settlement, but who an agent is..."), correcting a real distinction. No other instances in either language.
- **Rhyming bullets**: EN "Signals to watch" originally had 4/5 bullets starting with "Whether" — fixed to vary grammar. KO "지켜볼 신호" originally had all 5 ending in `~것인가` — fixed to vary endings.
- **Parallel-march closer**: "Why it matters" originally restated all three items in matched semicolon clauses ("Cairn showed...; Microsoft is betting...; OpenCode showed...") — rewritten to vary structure and weight (Cairn gets a declarative sentence, OpenCode gets the "didn't even need to be sophisticated" turn, Microsoft gets the "bet" framing) rather than a uniform list. Same fix mirrored in Korean as independent prose, not a translation of the new English.
- **Announced significance**: no "taken together" / "it is worth noting" / 즉 / 결론적으로 found in either language.
- **Mirror translation**: checked side by side — sentence order, clause structure, and rhetorical turns differ between EN and KO (e.g., the "Why it matters" section uses different sentence breaks and emphasis order in Korean rather than mirroring the English 1:1).
- **Structure**: section lengths track importance — the Cairn item gets two full paragraphs (most consequential, most sourcing complexity), Microsoft and OpenCode get two paragraphs each but shorter, matching their smaller gap/uncertainty footprint. No paragraph exceeds 6 sentences. No emoji or marketing language present.

## 6. Diagrams
None of the three items describes a message order, state machine, delegation chain, or topology — these are discrete incidents (a hacking campaign, a product launch, a credential breach), not a process. No diagram added; this matches the brief's own skip condition ("skip it on a brief where nothing has a shape worth drawing").

## 7. Must-fix vs nit
All must-fix items identified above (missing `[^s03]` citation, KO em-dash density, rhyming bullets in both languages, parallel-march closer) were fixed during this pass. No must-fix items remain open. No nits remain worth recording.
