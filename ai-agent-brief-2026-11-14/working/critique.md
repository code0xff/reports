# Critique

## 1. Unsupported claims

Checked every paragraph against its citations. All factual assertions in the body carry a `[^sNN]` ref. The two uses of `_(vendor-stated)_` and `_(single outlet confirmed)_` correctly flag the two claims that rest on a single party's account (OpenAI's own framing of future controls; TechCrunch alone on the Amazon block). No bare assertions found. **No must-fix.**

## 2. Citation integrity

- All 8 `[^s01]`–`[^s08]` refs used in `draft.md` and `draft.ko.md` exist in `working/sources.jsonl`, and all 8 sources are cited at least once (checked both drafts; `s03` is reused for the DoorDash/Square/Toast/Uber Eats sentence, `s02`/`s06` reused within their items — expected).
- All 8 sources have `"accessed": "2026-11-14"`, today's date — within the 90-day window.
- Spot-checked 5 of 8 URLs with `curl -L -A "Mozilla/5.0"`: TechCrunch (200), UCP PR #1053 (200), UCP Food Checkout spec page (200), mppx PR #1286 (200) all resolve. `openai.com/index/introducing-chatgpt-wallet` returns 403 to a scripted request — this is OpenAI's known bot-blocking behavior, not a dead link (confirmed via its own RSS feed entry and via TechCrunch's independent coverage of the same announcement), and is already disclosed in `gaps.md`/`uncertainties.md` as a fetch limitation.
- Spot-checked quotes in `sources.jsonl` against the underlying pages for s04 (ucp.dev spec: "Unless the AP2 Mandates extension is supported..." — verbatim, confirmed by the web-fetch subagent's earlier report), s06 (mppx PR #1286 body: "Lets the Web Bot Auth and TAP client provers... sign with a key that never leaves a remote signer" — verbatim from the PR body fetched via `gh pr view`), and s01 (TechCrunch paraphrase matches the subagent's verbatim report of the article). **No must-fix.**

## 3. Reasoning gaps

- No causation-from-correlation claims found; all three items are described as independent decisions, and the "Why it matters" section explicitly frames the shared design choice as a pattern across separately-sourced events, not a causal link between them.
- No single-example generalizations: each claim about the industry ("industry default... is agent-prepares, human-approves") is scoped to the two specific systems observed (ChatGPT Wallet, UCP) rather than claimed as a universal rule, and is phrased as a reading of this window's evidence, not an established fact.
- Numbers: "a limited number of U.S. ChatGPT Pro subscribers" carries no denominator, and the draft does not invent one — it is left as vendor-stated vagueness, which is honest. The six-hour checkout TTL and the 2026-11-11/12/13 merge dates are all sourced and dated.
- No "everyone"/"no one" claims found. **No must-fix.**

## 4. Missing counter-evidence

Ran one additional targeted check: searched for independent (non-OpenAI, non-TechCrunch) coverage of ChatGPT Wallet, and for any coverage disputing UCP's Food Checkout as a real launch vs. a documentation-only change.

- No dissenting coverage found arguing ChatGPT Wallet's human-approval design is cosmetic or that OpenAI overstates the card protections — the claim as drafted (approval-per-transaction, not standing authorization) is the architecture both sources describe consistently; there is no counter-claim to represent.
- No coverage, dissenting or otherwise, discusses UCP's Food Checkout beyond the project's own repository — this absence is already recorded in `gaps.md` ("No independent... coverage of the Food Checkout launch was found this window") and reflected in the Limitations section. This is a disclosed gap, not a hidden one, so it is **not** classified must-fix under item 4's rule — the draft already flags it rather than asserting adoption it can't support.

## 5. Voice

- **Repeated section formula:** first four words of each "What moved" paragraph differ ("OpenAI launched ChatGPT...", "The design choice worth...", "On 2026-11-11, UCP's...", "The checkout itself is...", "The spec caps what...", "Three PRs merged into...", "That's a breaking change..."). No colon-label template repeats across items. No must-fix.
- **Em-dash density:** `grep -o '—' draft.md | wc -l` → 2, across 10 body paragraphs (well under 1/paragraph average), and no sentence carries two. Same check on `draft.ko.md` → 0 em-dashes (Korean correctly avoids the mark). No must-fix.
- **"not X, but Y" / "rather than":** 1 instance of "rather than" in the body (Limitations section, "rests on the post's title and RSS summary rather than its full body") — a genuine correction, within the one-per-document budget. No must-fix.
- **Rhyming bullets:** "Signals to watch" bullets open with "Which", "Whether", "Whether", "Whether" — three of four share an opener. **Nit**: vary at least one.
- **Parallel-march closer:** "Why it matters" does not restate each item in matched one-liners; it states the one shared pattern and moves on. No must-fix.
- **Announced significance:** no instances of "Taken together," "It is worth noting," "즉," "결론적으로" found via grep. No must-fix.
- **Mirror translation:** read EN and KO side by side. The Korean does not mirror English sentence-for-sentence — paragraph breaks match but sentence counts and clause order differ throughout (e.g., the ChatGPT Wallet section's second paragraph restructures the "design choice" framing into separate short sentences rather than following English's clause order). Korean correctly drops redundant subjects and avoids transliterated connectives. No must-fix.

### Structure
- Abstract is faithful to the body (three items, same framing, same "not a protocol launch" framing used in both).
- Limitations section matches `gaps.md` (OpenAI fetch failure, Verge fetch failure, no independent UCP coverage) — all three gaps are represented.
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences (longest is the ChatGPT Wallet second paragraph at 6 sentences, within bound).
- Section lengths track importance: ChatGPT Wallet gets 2 paragraphs, UCP gets 2 paragraphs plus a diagram, mppx gets 2 paragraphs — roughly even, which matches that all three are genuinely comparable-weight stories this window (not manufactured evenness; each merited similar space on its own facts).

## 6. Diagrams

One `mermaid` `stateDiagram-v2` in the UCP item, present in both `draft.md` and `draft.ko.md` with translated edge labels. Caption cites what the arrows assert (the checkout lifecycle per the spec, `[^s04]`). Rendered `index.html` and `ko/index.html` both show correctly HTML-escaped mermaid source (`--&gt;`) inside `<pre class="mermaid">`, confirmed by inspecting the rendered output directly; no raw `-->` or unescaped characters that would break mermaid's parser. No semicolons inside any label. The diagram earns its place — the checkout item has a real state machine with branching and merge points (two paths to `canceled`) that a paragraph alone would make harder to follow. ChatGPT Wallet and mppx items have no topology or state machine worth drawing; correctly left as prose. No must-fix.

## 7. Summary

**Must-fix: 0. Nits: 1** (vary the "Signals to watch" bullet openers).

Applying the one nit now; no further revision cycle needed after that.
