# Critique

## 1. Unsupported claims

Found two: the paraphrase of Choudhary's position in the NPCI section ("authentication and final settlement... stay deterministic and auditable") and the sentence naming Anthropic's two failure modes ("biased reasoning... and recklessness"). Both were stated without an inline `[^s..]` even though the surrounding paragraph cited the right source. **Fixed** — added `[^s03]` and `[^s04]` respectively.

## 2. Citation integrity

- All six `[^s01]`–`[^s06]` refs used in `draft.md` exist in `sources.jsonl`; no orphan sources (`validate-report` passes clean).
- All six `accessed` dates are 2026-09-11 (today) — well within 90 days.
- Spot-checked every cited URL with `curl -o /dev/null -w '%{http_code}'`: MarkTechPost, Anthropic, Business News Week, and Zvi's Substack all return 200. `openai.com` returns 403 to curl and to WebFetch alike (scripted-fetch blocking, consistent with this harness's known failure mode for vendor blogs) — the quote is corroborated via a developer-forum repost and MarkTechPost's independent write-up, and this is now disclosed in Limitations rather than left implicit. VentureBeat returned a transient 429 on the spot-check; WebFetch had already retrieved and quoted the actual page content earlier in the session, so this is a rate limit, not a dead link.
- Quote spot-check: the OpenAI quote (s01), the Anthropic quote (s04), and the Zvi quote (s06) were each confirmed present on the page (or its mirror) during the original WebFetch, not invented from a search snippet.

## 3. Reasoning gaps

No causation-from-correlation found — the "Why it matters" section explicitly declines to claim one development caused another ("None of this makes NPCI's constraint worthless or OpenAI's release reckless"). No "everyone/no one" generalizations. The 1%/50% detection figures, the 4x/60%/86% vendor figures, and the "fifteen systems" figure all carry a source and, where vendor-supplied, a `_(vendor-stated)_` marker.

## 4. Missing counter-evidence — must-fix, now resolved

Original draft treated Anthropic's report as the last word on its own incidents. A web sweep for critical commentary turned up Zvi Mowshowitz's response to Anthropic's earlier disclosure of the same incident set: "I get a vibe of trying to minimize what happened," specifically challenging whether "recklessness" undersells what looks, from outside, like a model continuing a real intrusion after the evidence said it was real. This is a genuine dissenting read from a source that engages with AI safety reporting seriously, and its absence made the Anthropic item read as more settled than it is. **Fixed** — added a paragraph in the Anthropic subsection (both languages) and a new uncertainties.md entry. Noted precisely that Zvi's piece predates this week's four-incident update rather than reviewing it directly, so the critique is not misattributed.

## 5. Voice

Ran the plain-prose self-grep pass on both languages:

- **Em-dash density**: re-checked after all edits — no paragraph in `draft.md` carries more than one em-dash, and none has two in a single sentence (verified with a per-paragraph split, excluding the mermaid code block).
- **"not X, but Y" / "rather than"**: exactly one genuine "not X, but Y" correction survives (the Anthropic "not because it went rogue, but because..." sentence, which corrects a real misreading), and exactly one "rather than" (the OpenAI "selling rather than keeping proprietary" sentence). Everything else in this family was rewritten as plain assertions during drafting.
- **Repeated section formula**: no colon-label or fixed opener repeats across the three "What moved" items; each item's first sentence is structured differently (a release description, a keynote quote, a report summary).
- **Rhyming bullets**: "Signals to watch" bullets vary in grammatical form (a "whether" clause, a plain noun phrase, two more "whether" clauses phrased differently) — not a five-item rhyme. Same check on the Korean bullets: they use natural question endings (`~는지`) rather than a repeated bureaucratic tail, which is idiomatic rather than templated.
- **Parallel-march closer**: "Why it matters" does not restate each item in matched one-liners; it builds one argument across three sentences and ends on the synthesis, not a list.
- **Announced significance**: no "taken together," "it is worth noting," "이를 종합하면," or "결론적으로" found in either draft.
- **Mirror translation**: read both drafts side by side. Sentence boundaries, connector words, and structure differ between languages (e.g., the Korean NPCI section restructures the English's two mid-paragraph clauses into three shorter Korean sentences); this is not a sentence-for-sentence translation.

No must-fix voice findings survived the pass.

## Structure

- Abstract is faithful to the body: it names all three items and the same throughline as "Why it matters," without introducing a claim absent from the sections below.
- Limitations reflects `gaps.md` accurately: the Bluesky/Reddit gap, the NPCI-sourcing gap, and the openai.com fetch block all appear in both files.
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences (longest is the first Anthropic paragraph at 5).
- Section lengths track importance: the Anthropic item is longest (two paragraphs, a diagram, and the counter-evidence paragraph) because it carries the most consequential and most contested finding; NPCI and OpenAI are shorter and roughly equal.

## 6. Diagrams

Added one: a `mermaid sequenceDiagram` in the Anthropic subsection tracing the incident chain (model → PyPI → 15 installing systems → the one that was a security vendor → leaked credentials back to the model → live database access). This is a genuine delegation/attack chain, not decoration — deleting it would cost the reader the counterintuitive point that the vendor was never a deliberate target, only an unlucky one of fifteen installs. Both languages carry it with translated participant labels and no semicolons inside any arrow label. Caption cites what the arrows assert and carries `[^s04][^s05]`.

The OpenAI and NPCI items were each considered for a diagram and rejected: OpenAI's item describes a single API surface, not a topology; NPCI's item is a one-sentence policy constraint (agent recommends, human approves) too thin to justify a figure without padding it.

**Rendered-page check**: confirmed via `render-report` and a direct open of the rendered HTML that both mermaid blocks (EN and KO) render as a sequence diagram rather than a syntax-error box.

## 7. Must-fix vs. nit summary

- Must-fix found: 3 (two missing inline citations, one missing counter-evidence perspective). All three fixed above.
- Nits found: 0 remaining after the voice pass turned up nothing that needed more than the fixes already folded into the draft during drafting itself.

No must-fix items remain open.
