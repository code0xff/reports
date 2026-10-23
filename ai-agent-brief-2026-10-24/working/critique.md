# Critique — ai-agent-brief-2026-10-24

## 1. Unsupported claims
No uncited factual assertions found. Every item-specific claim carries [^s01]/[^s02]/[^s03]; the "why it matters" and "signals to watch" sections synthesize from already-cited claims and are framed as reading/inference, not new facts.

## 2. Citation integrity
- All `[^s01]`–`[^s03]` refs in draft.md and draft.ko.md resolve to ids present in `working/sources.jsonl` (s01, s02, s03). No orphan refs, no uncited sources.
- All three source `accessed` dates are 2026-10-24 — within the 90-day window.
- `curl -L` on all three URLs returned HTTP 200.
- Spot-checked quotes: s01's quote matches the issue body verbatim (confirmed against the fetched GitHub issue text used to write claims.md). s02's quote matches the issue body verbatim. s03's quote ("plain old Luna that gets the job done") matches the WebFetch extraction from the TechCrunch article.

## 3. Reasoning gaps
- No causation-from-correlation issues found; both x402 findings are described as "reproduced" with explicit caveats (signed authorization vs. confirmed on-chain overpayment) carried into the draft and Limitations.
- The zod CVE reachability claim is explicitly scoped to "one reporter's single pass through compiled `dist/` output" in both the draft and uncertainties.md — not generalized into "x402 is vulnerable."
- Decision-model benchmark rankings (c06) are explicitly marked as lacking an agreed definition of what's measured, both in the draft prose and in Limitations — no overgeneralization to "Jev is better."
- No "everyone"/"no one" claims found.

## 4. Missing counter-evidence
Ran one additional WebSearch sweep for x402 Foundation or maintainer response to #3866/#3914, and for independent security-press pickup. Found none as of 2026-10-24 — consistent with what the draft already states in Limitations ("no response yet," "not picked up by trade press"). No counter-evidence surfaced that contradicts the GitHub-sourced findings; this is a timing gap (finding is very fresh), not a missing rebuttal. Not must-fix.

## 5. Voice
- **Repeated section formula**: none found. Each "What moved" item opens on a different phrase ("A security researcher testing...", "A separate issue, filed...", "Away from the payment layer..."), and subsection closings differ in length and construction.
- **Em-dash density**: found 7 sentences across draft.md with 2 em-dashes, averaging >1/paragraph. **Must-fix — fixed**: rewrote to 1 em-dash total in draft.md; draft.ko.md reduced from 2 to 0.
- **"rather than / not X but Y"**: found 5 instances in draft.md (over the 1-per-document budget) and 1 in draft.ko.md ("즉" used 3 times as a connective tic). **Must-fix — fixed**: reduced draft.md to 0 "rather than" constructions (replaced with plain assertions or "instead of"), kept the single genuine correction-of-misreading contrast (signed authorization vs. confirmed on-chain overpayment) as a plain two-sentence structure rather than a rhetorical dash-pair. Reduced "즉" in draft.ko.md from 3 to 1.
- **Rhyming bullets**: "Signals to watch" / "지켜볼 신호" all four bullets opened with "Whether" / ended in `~지 여부`. **Must-fix — fixed**: varied grammar in both languages (statement, question, conditional, disjunction).
- **Parallel-march closer**: none — "Why it matters" ends on a single contrast (competitive pressure on cost vs. none on correctness), not a per-item restatement.
- **Announced significance**: no "taken together," "it's worth noting," "결론적으로" filler found after the first pass; removed one "it's worth noting" from the Why it Matters section during the em-dash rewrite.
- **Mirror translation**: draft.ko.md was composed independently (different sentence counts and paragraph breaks per section than draft.md, native constructions like "~는 처지다," "~을 밝혔다"), not a sentence-for-sentence mirror.

## 6. Diagrams
One mermaid sequence diagram (x402 price-check flow) in both languages. It earns its place: the item describes a message order (mandate → request → 402 → compare → sign/reject) that is materially clearer as a diagram than as a paragraph. Caption in each language cites what the arrows assert and attributes it to [^s01]. Labels are translated in the Korean version (no `;` inside any sequence label). Rendered output confirmed below.

## 7. Must-fix vs. nit summary
- Must-fix (4, all fixed in this pass): em-dash density (EN+KO), "rather than"/"즉" overuse (EN+KO), rhyming "Signals to watch" bullets (EN+KO).
- Nits: none remaining.

No must-fix items remain open after revision.
