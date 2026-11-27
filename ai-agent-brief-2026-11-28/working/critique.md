# Critique — ai-agent-brief-2026-11-28

## 1. Unsupported claims
Checked every paragraph in `draft.md` against its citation. All factual sentences in "What moved" carry a `[^sNN]` ref. The Introduction and Limitations are scene-setting/meta, not factual claims needing citation. No fix needed.

## 2. Citation integrity
- All 5 `[^s..]` refs used in `draft.md` (s01–s05) exist in `sources.jsonl`; `claim_refs` resolve to real claim ids in `claims.md`.
- All 5 sources `accessed: "2026-11-28"` — well within 90 days.
- URL check: s02–s05 return HTTP 200. s01 (TechCrunch) returns 403 to a bare `curl` — expected bot-blocking (the same URL was successfully read by the web-fetch subagent earlier in this run, with full article content and a matching quote). **Nit**, not a dead link.
- Quote spot-check (3 of 5): s03 and s05 quotes are exact substrings of the PR bodies fetched directly via the GitHub API. s02's quote ("Do not use a bare URL or create a link preview.") is an exact match to the HN Algolia API's stored comment text. All three pass.
- **Must-fix, found and already corrected during this pass**: a sixth source (`s06`, Notion's MCP tools-faqs page) was added mid-draft with a fabricated quote claiming the page documents an `upgrade_url` field — a follow-up fetch confirmed that exact text is not on the page, nor on two adjacent pages checked. The source entry was removed from `sources.jsonl` and the draft sentence that relied on it was rewritten to state honestly that Notion's docs are silent on this specific behavior, in both `draft.md` and `draft.ko.md`. Outcome: fixed.

## 3. Reasoning gaps
- **Must-fix, found and corrected**: the Notion item originally said the HN thread had "over sixty comments." The HN Algolia API for item 50658093 shows 59 points and 22 comments. Fixed in both `draft.md` and `draft.ko.md`.
- No causation-from-correlation issues: each of the three items describes a single dated event with a named source, not a trend inferred from one example.
- The ~170 MB / ~5 KB figures in the x402 item come with both the input size and the resulting allocation stated together, and are attributed to the PR's own description, not elevated to a measured benchmark.
- No "everyone/no one/most people" generalizations found.

## 4. Missing counter-evidence
- **Amazon/Meta**: searched for a denial from either company dated to this window. None found; TechCrunch's own piece notes neither company responded to its request for comment, which the draft already states. No fix needed.
- **Notion**: searched for Notion's own documentation of upgrade-prompt behavior as context. Found that Notion's docs mention plan-gated tools and rate-limit error fields but nothing matching the described behavior — this is genuine useful context (it neither confirms nor debunks the claim) and was added to both drafts (see §2 above, correctly sourced this time via direct description rather than a fabricated quote).
- **x402**: no dissenting view exists to search for — these are undisputed, merged code changes with before/after behavior documented in the PR itself.

## 5. Voice
Ran the plain-prose revision pass against both languages.
- **Repeated section formula**: first four words of each "What moved" paragraph differ (TechCrunch reported.../A post to r/ClaudeCode.../The x402 Foundation merged...). No colon-label-under-every-item pattern. Pass.
- **Em-dash density**: `grep -o '—' draft.md | wc -l` → 13 across ~9 paragraphs, with the two instances of two-per-sentence found and fixed (Muse aside, PR #4468 aside) during drafting. Re-checked after fixes: no sentence has more than one. Pass.
- **"Not X, but Y" family**: 2 occurrences of "rather than" in `draft.md` (one on the fetch-failure sentence, one inside the CBOR-parser description), both substantive corrections of a real distinction (commentary vs. artifact; crash vs. clean rejection), not decorative rhythm. Within the one-ish budget for a document this length. Pass.
- **Rhyming bullets**: "Signals to watch" — three bullets, one a "Whether... and if... whether" compound, one a yes/no-shaped question, one a straightforward bring-forward on an open PR. Not uniform. Pass.
- **Parallel-march closer**: "Why it matters" states one shared reading (boundaries built for humans, now crossed by agents) rather than restating each of the three items in turn. Pass.
- **Announced significance**: no "Taken together" / "it is worth noting" / "즉" / "결론적으로" found via grep. Pass.
- **Mirror translation**: read side by side — the Korean restructures sentences (e.g., the abstract opens with "서로 무관한 세 가지 소식이지만 전부 같은 문제의 변주다" rather than mirroring the English clause order) and uses native connectors, not a line-for-line mirror. Pass.
- Section lengths are uneven by design: the x402 item (three sub-fixes, most technical substance) runs longest, the Amazon/Meta item is medium, matching its one-fact-plus-context shape. Pass.
- No emoji, no marketing language. No paragraph exceeds 6 sentences after the fixes above.

## 6. Diagrams
None of the three items describes a message order, state machine, delegation chain, or topology distinct enough to earn a diagram — the Amazon/Meta item is a negotiation with no defined steps, the Notion item is a single request/response pair, and the x402 item is three independent bug fixes, not a flow. Correctly omitted. No finding.

## 7. Must-fix vs nit summary
- Must-fix (2, both found and fixed in this pass): comment-count error (22, not "over sixty"); fabricated Notion docs quote and the source entry built on it.
- Nit (1): s01's 403 to a bare curl request is normal bot-blocking, not a dead link — noted for the record, no action needed.
- **0 must-fix remain open.**

## validate-report output
See terminal output captured during the publish step; no blocking errors were reported, only informational lines (if any) are noted there.
