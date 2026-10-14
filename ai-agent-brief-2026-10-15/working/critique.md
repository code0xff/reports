# Critique

## 1. Unsupported claims

Checked every paragraph in `draft.md` against `[^s..]` refs. All factual assertions carry a citation except two sentences in "Why it matters" (AP2 last-commit date, Visa TAP sample repo last-commit date) that were stated without inline refs even though the supporting sources (s04, s05) existed in `sources.jsonl`. **Fixed**: added `[^s04]` and `[^s05]` to those sentences in both `draft.md` and `draft.ko.md`.

No other unsupported factual sentences found. The framing sentences ("None of it touches payment," "it is a smaller story than the other two") are editorial judgment, not factual assertions, and don't need citations.

## 2. Citation integrity

- All five `[^s01]`–`[^s05]` refs used in the drafts exist in `sources.jsonl`. ✓ (after fix — s04/s05 were present in the file but uncited in prose until this pass; `validate-report` flagged this correctly.)
- All five sources have `accessed: 2026-10-15`, well within 90 days. ✓
- HEAD/GET check via curl on all five URLs: all returned `200`. ✓
- Spot-check of 3 random sources (s01, s02, s03) via `gh pr view` / WebFetch during drafting confirmed the quoted text is present on the page (the `quote` fields were built directly from the `gh pr view --json body` output and the WebFetch summary, not paraphrased after the fact). ✓

## 3. Reasoning gaps

- No causation-from-correlation claims. The "why it matters" paragraph explicitly frames the x402-vs-others gap as a correlation ("adoption... attract outside contributors") rather than asserting a causal mechanism.
- No single-example generalizations: the "x402 is the only active spec" claim is checked against six other named specs' repos (x402 itself, AP2 directly; TAP directly; ACP, UCP, MPP, L402 covered by the absence of any dated finding in two search sweeps plus prior editions' sampling — flagged honestly in `gaps.md` as not exhaustive).
- Numbers have denominators and timeframes: "four real EIP-3009 settlements" (on a named testnet, per the submitter), "0.01 USDC per verification," "six-month dormancy clock," "no commit since April 29, 2026" (specific date, specific repo). No bare percentages or unscoped counts.
- No "everyone/no one" language in the draft.

## 4. Missing counter-evidence

Ran one additional `/research-web`-style sweep (two WebSearch queries) specifically hunting for counter-evidence to the "x402 is the only active protocol" reading: recent AP2/ACP/UCP news, and recent Mastercard Agent Pay / Visa TAP updates. Both searches returned only material from April–May 2026 or earlier — nothing in or near this window, and nothing that contradicts the public-repo dormancy claim. The commercial-rollout claims found (Visa VIC rollout at PSPs, Mastercard Agent Pay operational status) are consistent with what prior editions have already reported and don't bear on the specific, narrower claim made here (no *public repo commits*). This is already caveated in `uncertainties.md`: the repos' silence doesn't rule out private-fork or off-GitHub work. **Not must-fix** — the claim is scoped correctly and the caveat is in place.

## 5. Voice

Ran the `plain-prose` revision pass on both `draft.md` and `draft.ko.md`.

- **Repeated section formula**: none found. The three "What moved" items open differently ("The x402 Technical Steering Committee opened...", "Also on October 14, a developer submitted...", "Google published documentation...") and close differently (one ends on process status, one on independent-verification caveat, one on a cross-reference to a prior edition).
- **Em-dash density**: found and fixed during drafting — two paragraphs originally had 2 distinct dash-uses each. Revised so each paragraph has at most one dash construction (a single dash or a single parenthetical pair). Verified by `grep`.
- **"rather than" / "not X but Y"**: found 5 occurrences in the first draft, cut to 1 in English (the UTA Trust Kit item's "an unaffiliated contributor... rather than from any of the named standards bodies," which corrects a real expectation) and the matching 1 in Korean. Verified by `grep -oE "rather than" draft.md | wc -l` → 1, and the Korean `이 아니라` construction limited to one similarly-earned use.
- **Rhyming bullets** ("Signals to watch"): the four bullets vary in grammar — one starts "Whether," one is a noun phrase, one is a noun phrase, one starts "Any." Not uniform. ✓
- **Parallel-march closer**: "Why it matters" does not restate each of the three items in matched one-liners; it makes one argument (governance/trust concentration in one protocol vs. dormancy in six) and supports it with the two repo-history facts. ✓
- **Announced significance**: no "taken together," "it is worth noting," "결론적으로," "즉" found via grep.
- **Mirror translation**: read EN and KO side by side. KO is not a sentence-for-sentence mirror — paragraph counts and clause breaks differ (e.g., the Introduction's asymmetry sentence is split differently in KO; the "why it matters" closing sentence restructures rather than transliterates). Sentence openers vary naturally in Korean (다만, 외부, 명명된...) rather than repeating a single connector.

Structure:
- Abstract is faithful to the body — all three items and the "none of it touches payment" framing appear in both.
- Limitations section matches `gaps.md` content (unmerged PRs, single-source technical claims, sampling-based dormancy claim, no papers lane, no X/LinkedIn).
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences (longest is the UTA Trust Kit paragraph at 5 sentences).
- Section lengths track importance: the governance-proposal item (most substantive) runs longest, the UTA Trust Kit item is mid-length, the Apigee item is shortest and says so explicitly ("It is a smaller story than the other two").

## 6. Diagrams

No diagram in this edition. None of the three items describes a message order, state machine, delegation chain, or topology with enough distinct steps to earn a figure — each is a single governance/registry/documentation event, not a protocol flow. Correctly omitted; a diagram here would have been decoration. (Nit, not must-fix: if a future edition covers the XP review cycle once ratified — TSC review every two weeks, dormancy at six months — that *would* be a state-machine candidate for a diagram.)

## 7. Must-fix vs nit summary

**Must-fix (found and resolved before this critique was finalized):**
1. Two factual sentences in "Why it matters" lacked inline citations despite supporting sources existing — fixed by adding `[^s04]`/`[^s05]` in both languages.
2. Em-dash overuse in two paragraphs (2 distinct dash-constructions each) — fixed by converting extra dashes to periods/colons.
3. "rather than" used 5 times across the document (budget: 1) — fixed by rewriting 4 instances as plain assertions, keeping the one that corrects a real expectation.

**Nits:**
1. No diagram this edition — correctly omitted, flagged only as a watch-item for a future edition if the XP process ratifies.
2. The UTA Trust Kit's on-chain settlement count and the Apigee feature's actual ship date both rest on single primary sources; already marked in `uncertainties.md` and reflected in the Limitations section.

No must-fix items remain open as of this version of `critique.md`.
