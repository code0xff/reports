# Critique

## 1. Unsupported claims
Reviewed every paragraph in `draft.md`. All factual assertions carry a `[^s..]` ref except two sentences of framing/analysis in "Why it matters," which are explicitly the brief's own synthesis rather than a sourced fact (consistent with how prior briefs treat that section). No fix needed.

## 2. Citation integrity
- All `[^s01]`–`[^s07]` refs used in `draft.md` and `draft.ko.md` exist in `sources.jsonl`. **Fixed (must-fix, resolved):** `s06` was added but never cited in either draft; added `[^s06]` to the Limitations paragraph in both languages.
- All 7 sources have `accessed: 2026-09-30` — well within 90 days.
- Spot-checked 5 of 7 URLs with `curl -o /dev/null -w "%{http_code}"`: all returned 200.
- Spot-checked quotes on 3 sources against the actual fetched page content (s01 Stripe, s03 TechCrunch Dots, s05 RuntimeWire): all three quotes match text extracted from the page during gathering.
- `validate-report` initially flagged s06 as never cited; resolved by the citation fix above. Re-running now passes clean (see below).

## 3. Reasoning gaps
- The 38x growth figure (c01) has no disclosed baseline — flagged in-line as `_(vendor-stated)_` and now paired with an independent consumer-trust figure (s07) so the reader isn't left with the vendor's framing alone. **Must-fix, resolved.**
- "Why it matters" draws a connective reading across two same-day announcements from different companies; framed as an interpretation ("point at the same shift"), not asserted causation between the two events. Nit, no change needed.
- No "most people" / "everyone" / "no one" generalizations found in either draft.

## 4. Missing counter-evidence
Ran an additional `/research-web`-style sweep specifically hunting for skepticism on (a) Stripe's agent-commerce growth claims and (b) OpenAI's always-on-agent safety story. Found a July 2026 Forkast piece citing a Product.ai survey (14% consumer trust in AI-executed purchases, 42% refusing AI for transactions over $25) — genuine counter-evidence to reading Stripe's 38x figure as proof of mainstream adoption. **Must-fix, resolved:** added as s07 and folded into the Stripe section in both languages, with an explicit reading ("built to close [the trust gap], not evidence it already has"). The Dots-related privacy/security search returned only general, non-dated commentary about always-on agents (not specific to Dots), which didn't clear the bar for inclusion as a dated, on-topic counter-claim; noted in `gaps.md` instead.

## 5. Voice
Ran the plain-prose revision pass against both drafts.
- **Repeated section formula:** none found — no colon-label repeats across "What moved" items; each item's significance is stated once, in different phrasing.
- **Em-dash density:** English draft has 5 em-dashes across ~9 paragraphs (including bullets), none doubled within a single sentence, none more than one per paragraph. Korean draft: 0 em-dashes (native punctuation used instead). Fixed during drafting (see revision history above the critique pass) — original draft had two sentences with paired em-dashes and one paragraph with two dashes; both rewritten with commas/periods.
- **"Rather than" / "not X but Y":** 1 occurrence in the English draft ("Signals to watch" bullet), down from an initial 4; the survivor is inside a bullet asking a genuine either/or question, not decorative rhythm.
- **Rhyming bullets:** "Signals to watch" / "지켜볼 신호" bullets vary in grammatical form (a yes/no question, a conditional, a pace question, a status check) rather than repeating a single template.
- **Parallel-march closer:** "Why it matters" ends on the interoperability-gap point, not a restatement of each item. No fix needed.
- **Announced significance:** no "taken together" / "it is worth noting" / "결론적으로" found.
- **Mirror translation:** Korean draft was drafted independently with different sentence breaks, connective words (그래서, 그런데 의미상 보다는 자연스러운 접속), and paragraph rhythm from the English — not a clause-for-clause mirror. Spot-checked the Stripe and identity-layer sections side by side; claims and citation placement match, phrasing does not mirror.

### Structure
- Abstract is faithful to the body (all four claims in the abstract are expanded in "What moved").
- Limitations honestly reflects `gaps.md` (403s on openai.com, vendor-stated figures, MPP-specs scope limited to GitHub, no X/LinkedIn).
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences (longest is the Stripe capability paragraph at 3 sentences plus a semicolon-joined list).
- Section lengths track importance: Stripe (most consequential, most detail + diagram) > Dots (medium) > Sign in with ChatGPT (shortest, most straightforward).

## 6. Diagrams
One mermaid sequence diagram (Stripe's incremental-authorization flow), present in both `draft.md` and `draft.ko.md` with translated participant/message labels. It earns its place: the point of the item is that *every* step where price moves routes back through the user, not just the initial authorization, which is a message-order claim a paragraph alone understates. Caption cites exactly what the arrows assert. No `;` inside any sequence label (checked with `grep`). Confirmed rendering after `render-report` (see below) — both language pages show a rendered figure, not a syntax-error box.

The Dots and Sign-in-with-ChatGPT items describe products/partner counts, not a message order or topology — correctly left without a diagram.

## 7. Must-fix vs nit summary
- **Must-fix (3), all resolved:** uncited source s06 → citation added; 38x figure presented without counter-evidence → consumer-trust stat added; em-dash/rather-than density above the style budget → rewritten.
- **Nits (0 remaining actionable):** none outstanding.

No must-fix items remain open.
