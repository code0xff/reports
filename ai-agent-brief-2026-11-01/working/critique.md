# Critique

## 1. Unsupported claims
Every factual sentence in each "What moved" subsection carries a `[^sNN]` ref at the paragraph or sentence level matching the source it draws from. The abstract's claims are restatements of the body and inherit the body's citations. **No must-fix.**

## 2. Citation integrity
- All 8 `[^sNN]` refs in `draft.md` resolve to `s01`–`s08` in `working/sources.jsonl`; no orphan refs either direction.
- All 8 sources have `accessed: 2026-11-01` (today) — well within 90 days.
- Spot-checked all 5 non-trivial URLs with `curl -L -o /dev/null -w "%{http_code}"`: all returned `200`.
- Quote spot-check: s01, s03, s04, s05, s06, s07 quotes were copied verbatim from `gh pr view` output of the PR body text (not paraphrased); s08's quote was copied verbatim from the web-fetch agent's extraction of the BankInfoSecurity article, attributed to Anthropic's own statement as quoted by the outlet. No mismatches found.

**No must-fix.**

## 3. Reasoning gaps
- The "why it matters" throughline claims a shared failure *shape* across five items from five different projects — this is a pattern claim, not a causal claim, and is phrased that way ("the pattern is where each failure sat," not "caused by"). Acceptable.
- No claim in the draft generalizes from a single example to "most"/"everyone"/"no one." Cursor's "5,000 users" figure is explicitly marked as vendor-stated and unaudited, both in-line and in `uncertainties.md`.
- All numeric claims (11 hours, 5,000 users, three-to-four weeks, more-than-a-year) carry their timeframe or denominator in the sentence they appear in.

**No must-fix.**

## 4. Missing counter-evidence
- Ran one additional web-search sweep specifically for dissent on the Cursor/Anthropic incident framing. Found one outlier (techbytes.app) claiming a typosquatted publisher handle rather than a compromised verified account — contradicted by every other outlet surveyed (BankInfoSecurity, DarkReading, TheNextWeb, doublepulsar) and by both companies' own statements. Added to `gaps.md` rather than the body, since it does not meet the bar of credible counter-evidence (single low-trust source, contradicted by primary-party statements).
- Ran a second sweep for card-network/PSP agent-commerce news in this window specifically to check whether the Limitations section's "fifth edition running with nothing" claim still holds. Confirmed: no dated item surfaced for this window; existing older items (Visa Agentic Ready APAC/LatAm expansion, Nuvei/Visa PoC) predate the window and are not presented as current.

**No must-fix** — counter-evidence search performed, result recorded in `gaps.md`, draft framing unchanged because the counter-claim does not survive scrutiny.

## 5. Voice
Loaded `plain-prose` and ran the mechanical checks with `grep`:

- **Repeated section formula** — checked first-four-words of every paragraph and subsection openers; all five "What moved" items open with a different subject/structure (hook mechanics, a dependency bump, a PR-pair rebase, a spec exception, a version number). No repeated colon-label or "why it matters" boilerplate per item. **No must-fix found; none to begin with.**
- **Em-dash density** — initial draft had 4 em-dashes in two paragraphs (pay-kit, mppx) and 3 each in two others (Cursor item, why-it-matters), several with two dashes in one sentence. **Must-fix, fixed**: rewrote all five offending paragraphs to ≤1 em-dash per paragraph and zero sentences with two dashes, in both `draft.md` and `draft.ko.md`. Re-checked with `grep -o '—' draft.md | wc -l`: now 2 total across the whole document (1 in the x402 paragraph, 1 in Limitations), each the only one in its paragraph.
- **"Rather than" / "not X but Y"** — found 2 instances of "rather than" plus one "not that... but" construction. Reduced the mppx paragraph's "rather than" to "instead of" to avoid a second near-duplicate; kept one "rather than" (signals section) and rewrote the why-it-matters "not that... but" into a plain assertion ("nothing here was badly built"). **Must-fix, fixed.**
- **Rhyming bullets** — the Korean "지켜볼 지점" list originally had all four bullets ending in the same `~할지`/`~될지` whether-form, a mechanical tell. **Must-fix, fixed**: rewrote to vary grammatical form (noun-phrase topic + question, statement, etc.). The English "Signals to watch" list already mixed "Whether…" openers with plain statements; left as-is.
- **Parallel-march closer** — "Why it matters" does not restate each of the five items in matched one-liners; it describes the shared failure shape once and names which item exemplifies which sub-pattern unevenly (not a 1:1 recap). **No must-fix.**
- **Announced significance** — grepped for "Taken together," "Read together," "It is worth noting," "이를 종합하면," "결론적으로," "즉": none present in either draft. **No must-fix.**
- **Mirror translation** — read `draft.ko.md` against `draft.md` side by side. Sentence counts and clause order differ throughout (e.g., the pay-kit and mppx paragraphs restructure cause/effect order in Korean rather than mirroring English clause-for-clause); the Korean was composed independently rather than translated. **No must-fix.**
- **Structure**: Abstract (5 sentences, one per item) is faithful to the body. Limitations matches `gaps.md` on both the card-network silence and the Cursor timeline-variance point (now also covers the techbytes.app discrepancy via `gaps.md`, not the body, correctly). No emoji or marketing language found. One paragraph (why-it-matters) ran 9 sentences — **must-fix, fixed**: split into two paragraphs in both languages at the natural turn from "the four protocol/spec items" to "the Cursor/publisher-signature item." Section lengths track importance: the Cursor and x402 items (most novel/consequential) run longer than the UCP item (narrower, single-PR change).

## 6. Diagrams
Considered a diagram for the x402 hook-isolation item (gate hooks vs. advisory hooks, four loops) and for the UCP identity-linking conditions (four-condition gate). Decided against both: the hook item is a two-category state distinction expressible in one sentence ("gate hooks block, advisory hooks don't"), and the UCP conditions are a flat AND-list, not a sequence, state machine, or topology. Neither has the kind of shape — message order, delegation chain, multi-state transition — that a mermaid diagram clarifies over prose. No diagram added; this is a considered skip, not an oversight.

## 7. Must-fix vs. nit summary
- **Must-fix (4), all resolved:** em-dash density/pairing in 4 paragraphs; one redundant "rather than"/"not X but Y" construction; rhyming Korean bullet list; one 9-sentence paragraph exceeding the ~6-sentence guideline.
- **Nits (0).**

No must-fix items remain open after revision.
