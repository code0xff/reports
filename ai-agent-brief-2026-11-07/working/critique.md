# Critique — ai-agent-brief-2026-11-07

## 1. Unsupported claims
None found. Every factual sentence in `draft.md` carries a `[^sNN]` ref, and the sentences that don't (e.g. the "Why it matters" framing, the Signals-to-watch items) are analysis/forward-looking, not new factual assertions.

## 2. Citation integrity
- `validate-report` passed with no warnings: all 8 sources cited, all `[^sNN]` refs resolve, all `accessed` dates are today.
- URL syntax: all 8 URLs are well-formed `https://` GitHub/HN/HackerNoon links; no HEAD check run against GitHub/HN (rate-limit risk for an unattended run), but all were successfully fetched via `gh api`/`gh pr view`/WebFetch during drafting, which is a stronger check than a bare HEAD.
- Spot-check of quotes: s01 (README tagline), s04 (PR #1182 body), s07 (PR #1202 body) all verified verbatim against the `gh pr view` / WebFetch output captured during drafting. s08's quote is a close paraphrase of PR #1179's summary (confirmed by re-fetching the PR body); tightened to match wording more closely — **nit**, not must-fix, since the paraphrase doesn't misstate anything.

## 3. Reasoning gaps
- No causation-from-correlation issues found; both mppx items cite the PR's own stated cause (node upgrade; missing error-phase tagging), not an inferred one.
- No single-example generalizations to "most"/"everyone"/"no one" — the draft is already careful to say "the submitter" and mark vendor-stated claims.
- "Hundreds of agents... dozens of MCP servers" (AIB) has no denominator but is explicitly marked `_(vendor-stated)_` and attributed to the submitter only — acceptable given the hedge.

## 4. Missing counter-evidence
- Ran one additional web sweep for independent (non-Zalando) commentary on AIB and for any card-network/PSP agent-commerce news in the window. Found none: the only coverage of AIB is the submitter's own Show HN text and a Zalando employee's blog post; TechCrunch/Verge/Ars searches for Mastercard/Visa/Stripe/PayPal agent-commerce activity turned up only old (pre-window) comparison pieces. This absence is already reflected in Limitations and `uncertainties.md`. **No must-fix** — the gap is the finding, and it's disclosed.
- No dissenting view exists yet for the mppx storage/recovery items (too new, no second-party usage reports) — disclosed in `uncertainties.md`.

## 5. Voice — must-fix findings, now corrected
- **Em-dash density (must-fix, fixed).** `grep -o '—' draft.md | wc -l` returned 12 across ~8 prose paragraphs — over budget, and two paragraphs (the Zalando analysis paragraph, lines 13 and 31) each carried two separate em-dash constructs in one paragraph. Rewrote both paragraphs to use at most one em-dash each, converting the rest to periods or plain subordinate clauses.
- **"Not X, but Y" / "X, not Y" rhythm (must-fix, fixed).** The construction recurred five times: Abstract ("a production identity pattern... not another vendor's platform feature"), the Zalando paragraph ("the broker, not the agent... instead of the agent carrying a copy"), the Tempo paragraph ("follows an incident rather than anticipates one"), and twice in "Why it matters" ("not from the protocols' own spec repos" / "not from a new spec revision"). Kept exactly one — the broker/agent credential-possession contrast, which corrects a real and non-obvious misreading (that delegation means copying a credential) — and rewrote the other four as plain assertions.
- **Repeated section formula:** checked first four words of every paragraph and last sentence of every subsection — no repeated opener or closer found; each subsection ends on a different note (an unanswered question, an audience statement, a direct causal link). No finding.
- **Rhyming bullets ("Signals to watch"):** the four bullets already vary in grammatical form (a conditional clause, a question-shaped noun phrase, a statement, a statement) — no finding.
- **Parallel-march closer:** "Why it matters" does not restate each item in matched one-liners; it makes one claim (production operators, not spec repos, are doing the identity/payment-rail work) and ties it to the shared delegation gap. No finding.
- **Announced significance:** no instances of "Taken together", "It is worth noting", "결론적으로", "즉" found by grep. No finding.
- **Mirror translation:** read `draft.ko.md` against `draft.md` side by side. The Korean was written independently — sentence boundaries, clause order, and even which facts open vs. close a paragraph differ from the English (e.g. the Korean Abstract leads with "대형 플랫폼의 새 기능이 아니라" as its own second sentence rather than folding it into sentence one as the English does). No mirror-translation smell. No finding.
- **Korean-specific tells:** no `다만`/`오히려`/`이는` chains, no `것` chains, no `~라는 점이다` habit endings found by grep. No finding.

## 6. Diagrams
- One mermaid sequence diagram (Figure 1, AIB token-exchange flow) in both languages, with translated participant/message labels in `draft.ko.md`. Caption cites exactly what the arrows assert (the agent never receives the user's token; the broker gates release on live consent) and matches `[^s02]`. No `;` inside any sequence label. This is a genuine delegation-chain topology — the one diagram-worthy shape in this edition — and the other two stories (storage backends, typed error) are code-level fixes with no topology worth drawing, so no diagram was added there. Will open the rendered page after `render-report` to confirm it renders as a figure, not a syntax-error box, per the standing reminder.

## 3b. Second pass — date-of-week error (must-fix, fixed)
A second read caught a factual error introduced during drafting: both the mppx Tempo outage and Cloudflare's Trusted Agent Delegation post are dated 2026-11-05 (confirmed via `date` arithmetic: 2026-11-05 is a Thursday), but the first draft called the outage "Monday's" and the Cloudflare post "Wednesday's" — internally contradictory, since both happened the same day — and separately said the two were "three days" apart from today (2026-11-07), when it's two. Replaced every relative/weekday reference in both `draft.md` and `draft.ko.md` with the correct weekday ("Thursday" / "목요일") or an explicit date, and fixed "three days ago" → "2026-11-05" / "two-day window".

## 7. Must-fix vs nit summary
- Must-fix: 3 (em-dash density, "not X but Y" repetition, weekday/date-arithmetic error) — all corrected.
- Nit: 1 (s08 quote tightened to track the PR body more closely).
- No open must-fix items after revision.
