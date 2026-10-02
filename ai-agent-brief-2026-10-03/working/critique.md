# Critique — ai-agent-brief-2026-10-03

## 1. Unsupported claims
Reviewed paragraph by paragraph. All factual assertions in "What moved" and "Why it matters" carry a `[^sNN]` ref or are explicitly flagged as uncited interpretation (e.g. the Apple/Muse timing link, which the draft states is Ars Technica's framing, not a confirmed causal claim). No bare factual assertions found without support.

## 2. Citation integrity
- All 8 `[^s01]`–`[^s08]` refs used in both `draft.md` and `draft.ko.md` exist in `working/sources.jsonl`; no orphan refs, no uncited sources.
- All 8 sources have `accessed: 2026-10-03` (today), well within 90 days.
- `curl -L` HEAD/GET check: 7 of 8 URLs return 200. `arstechnica.com` returns 403 to a scripted/curl request — consistent with Ars Technica's known bot-blocking (it returned full content to WebFetch during gathering); not treated as a dead link.
- Spot-checked quotes for s01 (GitHub PR #3637 body), s05 (TechCrunch), s08 (PaymentsDive) against the fetched page content gathered earlier in this session — all three quotes are verbatim or near-verbatim from the source page.
- `validate-report` passed with no warnings.

## 3. Reasoning gaps
- The Apple/Muse causal link is explicitly hedged in both drafts ("Apple hasn't confirmed that connection, and Meta disputes the underlying claim") — not asserted as causation.
- The x402 "maintainers are watching" framing is presented as one read among others, qualified by "not a crisis," avoiding overclaiming from two bug fixes.
- No "everyone/no one" generalizations found.
- PaymentsDive's claim that Stripe/Google/FIDO/card networks are "coalescing" is flagged in both `gaps.md` and the Limitations section as the publication's framing, not a fresh joint statement — avoids presenting an ongoing effort as new news.

## 4. Missing counter-evidence
Ran one additional targeted search for dissent on each major finding:
- No counter-evidence found disputing that the x402 bugs were real or overstated; the PRs' own test descriptions are the only detail available, consistent with the gap already noted (no third-party review exists yet).
- No pushback found on Apple's FDA change itself; coverage is uniformly descriptive, not critical. No developer backlash or counter-framing located in-window.
- No dissenting view found on the audit-trail framing; this reflects a consensus point among the cited speakers rather than a contested claim.
No must-fix counter-evidence gaps identified.

## 5. Voice
- Em-dash count: 0 in `draft.md`, 0 in `draft.ko.md` — well under the one-per-paragraph budget.
- "rather than" / "not X but Y": reduced to one meaningful instance per report in English (the "Why it matters" framing, which corrects a real misreading — that the three items are unrelated); Limitations section retains one more, also substantive. Revised away three decorative instances that were originally in the x402 and Apple sections.
- "Signals to watch" bullets: originally three of four started with "Whether" (English) and all three started with "~는지" (Korean) — rhyming bullets, must-fix. **Fixed**: varied grammar in both languages (see draft).
- No repeated section-formula phrase found across the three "What moved" items — section lengths differ (x402 item is the longest and most technical, PaymentsDive item is the shortest), reflecting genuine difference in substance rather than template.
- No parallel-march closer: "Why it matters" ends on the asymmetry of the three responses (code / permission system / public statement only), not a restatement of each item.
- No "Taken together" / "Read together" / "it is worth noting" / 종합하면 / 결론적으로 found.
- Korean draft was written independently, not mirrored sentence-for-sentence from English; paragraph counts and sentence boundaries differ between the two language versions.
- No emoji or marketing voice. No paragraph exceeds 6 sentences.

**Must-fix found and fixed:** rhyming "Signals to watch" bullets (English and Korean).
**Nits:** none remaining.

## 6. Diagrams
No diagram in this brief. None of the three items describes a message order, state machine, delegation chain, or topology clearly enough to earn a figure — the x402 refund/baseline bugs are single-condition logic fixes, not multi-step flows; Apple's permission change and the PaymentsDive panel are not processes. Correctly omitted.

## 7. Must-fix vs nit summary
- Must-fix: 1 (rhyming signal bullets) — **fixed**.
- Nits: 0 outstanding.
