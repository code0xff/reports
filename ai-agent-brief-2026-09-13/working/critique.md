# Critique — ai-agent-brief-2026-09-13

## 1. Unsupported claims
Checked every paragraph in `draft.md` for factual assertions without a `[^s..]` ref. All factual sentences carry citations. The one uncited sentence in "Why it matters" ("None of these three groups are coordinating with each other") is a synthesis claim across the three cited items above it, not a new fact — acceptable without its own citation.

## 2. Citation integrity
- **Found and fixed (must-fix):** the NPCI paragraph originally cited `[^s08]` (NBC News, about Altman's endorsement) where it should have cited `[^s09]` (Business Recorder, the actual NPCI-registry source). Corrected in both languages.
- **Found and fixed (must-fix):** `validate-report` flagged `s10` and `s11` as never cited. Both are legitimate corroborating sources for the NPCI item; wove them into the prose (`s11` for MediaNama's paraphrase of Choudhary's keynote, `s10` alongside `s09` for the registry mechanism) rather than dropping them.
- **Found and fixed (must-fix):** `s08` (NBC) then came up uncited after the s08→s09 correction; added it alongside `s06` on the Altman-agreement sentence, which is exactly what it sources.
- All `[^s..]` refs in both drafts now resolve to an id present in `sources.jsonl`; `validate-report` passes clean.
- All 11 `sources.jsonl` entries show `accessed: 2026-09-13`, within range.
- Spot-checked 5 URLs (`s01`, `s05`, `s09`, `s02`, `s04`) with `curl -L`: all returned HTTP 200.
- Spot-checked quotes against fetched content for `s01` (rubyhack.ai — "clearly regarded what they were doing as hacking" confirmed), `s05` (darioamodei.com — "We must slow the pace..." confirmed), `s09` (Business Recorder — "A payment network needs to know which agent is acting..." confirmed). No mismatches found.

## 3. Reasoning gaps
- No causation-from-correlation issues found; the "Why it matters" section explicitly says the three groups are *not* coordinating, converging independently — it does not claim one caused another.
- No generalization from a single example: each of the three items is corroborated by 3+ independent sources (RubyGems: s01–s04; Amodei: s05–s08; NPCI: s09–s11).
- Amodei's "six to twelve months" figure is explicitly marked `_(vendor-stated forecast)_` rather than presented as a verified technical estimate.
- No "everyone/no one" generalizations found in either draft.

## 4. Missing counter-evidence
- **Found and fixed (must-fix):** initial draft presented Amodei's plan without any dissent. A `/research-web` sweep surfaced named, on-record skepticism (journalist Brian Merchant's "regulatory capture" critique, already present in the already-cited `s06` TechCrunch piece) — added to both drafts rather than treating the essay as uncontested.
- Checked for OpenAI pushback disputing the RubyGems *attribution* itself (as opposed to the "attack" characterization) — found none; OpenAI's dispute is specifically about framing ("benign tasks" vs. "attack"), which the draft already represents on both sides. No further counter-evidence found or needed here.
- Checked for NPCI's own confirmation or denial of the registry story — none exists yet; this absence is already flagged as a gap and marked `_(unverified — single source)_` rather than presented as fact.

## 5. Voice
- **Repeated section formula (must-fix, fixed):** "The previous brief covered..." opened both the Introduction and the NPCI subsection. Reworded the NPCI subsection's opening in both languages.
- **Em-dash density (must-fix, fixed):** four instances of 2 em-dashes inside a single paragraph or sentence (EN: RubyGems confession sentence, NPCI-confirmation paragraph, Why-it-matters paragraph, first Signals bullet; KO: NPCI mechanism sentence, Why-it-matters paragraph, last Signals bullet). Rewrote each using colons, parentheses, or sentence breaks instead of a second dash. The one remaining 2-dash paragraph (EN line 44) is the fixed `_(unverified — single source)_` marker plus one unrelated prose dash — the marker is a protocol-mandated fixed device, not rhythm, so left as-is.
- **`rather than` / `이 아니라` (must-fix, fixed):** found four "not X (rather than/이 아니라) Y" constructions across the two drafts, exceeding the one-per-document budget. Kept the single substantive one (the NPCI registry "layered on top of... rather than replacing" / "대체하는 것이 아니라 그 위에 얹는" — a real correction of what a reader might otherwise assume) and rewrote the RubyGems confession sentence and both figure captions as plain assertions.
- **Rhyming bullets:** checked "Signals to watch" (EN) and "지켜볼 신호" (KO) — grammatical forms vary (Whether/What/statement/statement in EN; question/statement/statement in KO). No fix needed.
- **Parallel-march closer:** "Why it matters" states one throughline, not a restated list of the three items. No fix needed.
- **Announced significance:** no instances of "Taken together," "It is worth noting," "이를 종합하면," or "결론적으로" found in either draft.
- **Mirror translation:** read both drafts side by side. Sentence order, paragraph breaks, and rhetorical framing differ between languages (e.g., the Korean NPCI paragraph restructures the English's dash-parenthetical as a plain clause; the Korean abstract opens with a time marker not present in the English opening clause). Korean was not a sentence-for-sentence mirror.
- **Paragraph length (must-fix, fixed):** one paragraph in the Amodei section ran 7 sentences in both languages. Split each into two paragraphs at the natural turn (support → dissent).
- **Section length tracks importance:** RubyGems and Amodei items (the two that are causally linked) run longer with a diagram and named dissent; the NPCI item, resting on anonymous sourcing, is deliberately shorter and more hedged. This is intentional, not an oversight.
- No emoji or marketing voice found in either draft.

## 6. Diagrams
- One mermaid sequence diagram (RubyGems attack chain). It earns its place: the item describes a multi-hop execution chain (agent → RubyGems → RubyDoc.info → third-party systems) that is easier to follow as a diagram than as prose, and the prose does not repeat what the diagram shows. Caption cites what the arrows assert and is present in both languages with translated participant labels and translated action text. Rendered the page locally (see Phase 7 render check) and confirmed the diagram renders as a figure, not a syntax-error box.
- The Amodei and NPCI items describe a public disagreement and a policy proposal, respectively — neither has an order, state machine, or topology worth diagramming. No diagram added for either; this was considered and rejected, not overlooked.

## 7. Must-fix vs nit summary
- **Must-fix found and resolved:** 3 citation-integrity bugs (wrong id, two uncited sources), 1 missing counter-evidence gap, 1 repeated section-opener template, 4 em-dash-density violations, 1 excess contrastive-rhythm pattern, 1 overlong paragraph. All fixed in this pass.
- **Nits:** none outstanding after the fixes above.
- **Open must-fix items: 0.** Report is ready for `publish`.
