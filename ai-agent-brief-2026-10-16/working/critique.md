# Critique

## 1. Unsupported claims

- Abstract and "What moved" sections: every factual sentence carries a `[^sNN]` ref except framing/transition sentences ("None of this is a payment protocol shipping", "That is a different kind of quiet than last edition's"), which are the brief's own analysis, not factual claims requiring a source. No unsupported factual assertions found. **Nit** — none to fix.
- "Why it matters": the claim that x402's governance PR is "the same" PR the prior edition covered is supported by s06 (PR #3801, last updated 2026-10-14, unchanged). Verified via `gh pr list` during drafting. No fix needed.

## 2. Citation integrity

- All `[^s01]`-`[^s06]` refs in `draft.md` and `draft.ko.md` resolve to entries in `working/sources.jsonl`. Confirmed by `validate-report`, which passed with no warnings.
- All six sources show `accessed: 2026-10-16`, well within 90 days.
- HTTP spot-check: s01, s02, s03, s05, s06 return 200. **s04 (openai.com/index/third-moment-research) returns 403 to a scripted `curl` fetch.** This matches the documented failure mode in CLAUDE.md (openai.com blocks datacenter/scripted fetches); the content was successfully retrieved and the cited quote verified via an `r.jina.ai` reader-proxy fetch during drafting, and the page is reachable in an ordinary browser. **Nit** — not a dead link, but worth flagging since an automated link-checker run later would flag it as broken.
- Quote spot-check (3 random: s01, s03, s04): all three quotes used in `sources.jsonl` match text pulled directly from the fetched page content. No fabricated quotes found.

## 3. Reasoning gaps

- The Third Moment Research item (s04) is a single vendor-published customer story; the draft already hedges this explicitly in-paragraph ("a single vendor-published customer story, and nobody outside OpenAI and Third Moment has verified...") and again in Limitations. No fix needed.
- The Stripe item's 88%/24x figures (c05) come from an analyst cited secondhand inside Stripe's own post, with no published methodology. The draft already flags this in Limitations ("trace to one analyst's unpublished methodology, cited secondhand"). No fix needed.
- No causation-from-correlation errors found; no unqualified "everyone"/"no one" claims found (the one "no outside platform has said..." and "nobody outside OpenAI and Third Moment has verified..." claims are accurate absence-of-evidence statements scoped to what this brief could find, not universal claims).

## 4. Missing counter-evidence — MUST-FIX

A targeted web sweep for counter-evidence on the Stripe/Monetize item turned up a real, documented backlash against usage-based AI billing that the draft does not mention: GitHub Copilot's June 2026 move to usage-based billing drew reports of users exhausting a month's quota in under a day and overage charges in the hundreds of dollars; Cursor faced "opaque pricing" criticism; Anthropic's Max plans drew a reported lawsuit over usage not matching what was promised; an auditing startup reported ~$1.7M in billing errors across AI coding-agent products. The draft's Stripe section presents usage-based and outcome-based pricing as the clean answer to subscription pricing not fitting agent work, without noting that usage-based billing itself has produced a wave of customer backlash over unpredictability this same year. This is the predictability problem Stripe's own post gestures at ("Predictability is becoming a product feature") but the draft doesn't connect the dot to the backlash that made predictability a selling point in the first place.

**Fix:** add one sentence to the Stripe "What moved" paragraph noting the backlash, and add an entry to `working/gaps.md`.

## 5. Voice

- **Repeated section formula:** checked first four words of each paragraph and each subsection's closing sentence (English and Korean). No repeated template found — openers are "Google added…", "This edition covers…", "Google's OAuth…", "At Config…"/"인도에서 연…", "Stripe's recap…"/"스트라이프가 주최한…", "Third Moment Research…"/"오픈AI가…", "Every item…"/"이번 창에…". No match.
- **Em-dash density:** `grep -c '—' draft.md` → 4, spread across a ~1,000-word document, none exceeding one per paragraph, none with two in one sentence. `draft.ko.md` → 0. Pass.
- **"not X, but Y" / rather than / 이 아니라:** English has 5 "instead of"/"rather than" constructions used as plain substitutions (factual, not decorative rhythm) and one genuine "not X, but Y" ("not independent reporting, but the specifics..."). Korean, after revision, has one "이 아니라" (새 스펙이 아니라 15년 된 OAuth 인프라 위에...), which corrects a real misreading (narrower identity answer vs. a new spec) — within the one-per-document budget. Pass.
- **Rhyming bullets ("Signals to watch" / "지켜볼 신호"):** grammatical forms vary — a gerund-led item, a noun-phrase item, a "whether" item, a flat statement, another "whether" item. Not uniform. Pass.
- **Parallel-march closer:** "Why it matters" does not restate each of the four items in matched one-liners; it states one through-line (payment specs vs. the infrastructure they assume) and closes on the single most relevant data point (x402's PR being unchanged). Pass.
- **Announced significance:** no "taken together", "it is worth noting", "결론적으로", "즉" found via grep. One instance of "Taken individually... Together..." in the Figma paragraph was tightened during drafting to state the concrete consequence (the shared context-layer pattern) rather than just announcing it. Pass.
- **Mirror translation:** compared English and Korean paragraph by paragraph. Sentence boundaries, word order, and example ordering differ throughout (e.g., the Korean DPoP paragraph restructures around "이 베일에서 중요한 부분은..." rather than mirroring the English "The part that matters..." sentence-for-sentence; the Korean Stripe paragraph reorders the Fin example's outcome list). Not a sentence-for-sentence mirror. Pass.
- Structure: Abstract is faithful to the body (all four items and the why-it-matters framing appear in both). Limitations honestly reflects `gaps.md` (same six points, same hedges). No emoji, no marketing voice. No paragraph exceeds 6 sentences (longest is the Stripe paragraph at 6 sentences — appropriately, as it's the most data-dense item). Section lengths track importance: Stripe (data-richest) and DPoP (most structurally important) run longest; the smaller items are proportionally shorter. Pass.

## 6. Diagrams

No section in this edition describes a message order, state machine, delegation chain, or topology dense enough to need a figure. The DPoP multi-agent delegation flow (agent A → token → STS exchange → agent B with new key) is the closest candidate, but it's a single two-step exchange fully stated in one sentence; a diagram would restate it without adding information. Correctly skipped in both languages. **Nit, resolved — no diagram needed.**

## 7. Must-fix vs nit summary

- **Must-fix (1), resolved:** Missing counter-evidence on usage-based billing backlash (§4). Added a sentence to the Stripe paragraph in both `draft.md` and `draft.ko.md` citing GitHub Copilot's June 2026 billing backlash (new source s07), and logged the change in `gaps.md`.
- **Nits (2):** s04's 403-to-curl (documented failure mode, not a dead link, no action needed beyond this note); diagram check confirmed correctly skipped.

No must-fix items remain open.
