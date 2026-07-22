# Critique — solana-protocol-deep-dive

Adversarial verification pass. Assume the draft is wrong and try to break it.

## 1. Unsupported claims
Every factual/technical assertion in `draft.md` carries a `[^sNN]` citation. Interpretive framing sentences (e.g. "Solana approaches scaling from the opposite direction") are clearly editorial and adjacent to cited support. No naked factual claim found.
- Verdict: **no must-fix.**

## 2. Citation integrity
- All 34 `[^sNN]` refs in both `draft.md` and `draft.ko.md` resolve to ids present in `sources.jsonl` (mechanically checked).
- No footnote-definition blocks (`[^sNN]: ...`) and no manual `## References` / `## 참고문헌` heading — renderer builds the bibliography.
- All `accessed` dates are 2026-07-22 (within 90 days).
- URL liveness spot-check (curl, 200 OK): solana.com/docs/core/fees, docs.anza.xyz/consensus/leader-rotation, github.com/firedancer-io/firedancer, helius.dev/blog/turbine-block-propagation-on-solana.
- Quote spot-checks against fetched content passed (fees 5,000 lamports 50/50; leader-schedule offset; Turbine shreds/FEC).
- Verdict: **no must-fix.**

## 3. Reasoning gaps
- TPS: numbers are given with timeframe/denominator (real-time vs non-vote vs theoretical ceiling) and flagged as point-in-time analytics. OK.
- Outages: each incident has a date + attributed cause; no over-generalisation of "always down." The improving-reliability counter-fact (1+ year without outage) is included, balancing the narrative. OK.
- Removed the potential contradiction around PoH verification "cheap" vs. the VDF critique: the text now says verification parallelizes but still redoes the work, consistent with Shoup's point.
- No "everyone/no one" absolutes.
- Verdict: **no must-fix.**

## 4. Missing counter-evidence
- **PoH-as-VDF critique (added).** Adversarial search surfaced Victor Shoup / Bill Buchanan's argument that PoH is not a true VDF because verification is not succinct. Added as s34 and woven into the PoH section of both drafts, reframing PoH as proof-of-sequential-work-used-as-clock. This was the one substantive gap in the original draft. **Resolved.**
- **Firedancer status conflict.** Already represented as an explicit conflict (repo README vs Breakpoint reporting).
- **TPS marketing vs reality.** Already represented (65k theoretical vs ~1.4–3.8k real non-vote).
- **Centralization.** Critique (Nakamoto coefficient) included and explicitly down-weighted as single low-trust source.
- Verdict: counter-evidence now represented; **no must-fix open.**

## 5. Tone and structure
- Abstract is faithful to the body and written last; it names the trade-off the body argues.
- Limitations section mirrors `gaps.md`/`uncertainties.md` (vendor-sourcing, single-source inflation, unaudited TPS, low-trust centralization figures, unresolved Firedancer conflict, unactivated Alpenglow).
- No emoji, no marketing voice. Vendor claims are attributed and, where relevant, qualified.
- Long paragraphs (outages) are dense but each is a single coherent enumeration; acceptable for an academic report.
- Verdict: **no must-fix; minor nit** — outages paragraph is long (deferred, readable as a list-in-prose).

## 6. Must-fix vs nit — summary
- **must-fix: 0 open** (1 found and resolved: PoH/VDF counter-evidence).
- **nits: 1 deferred** (dense outages paragraph).

Ready for validate → render → prepublish.
