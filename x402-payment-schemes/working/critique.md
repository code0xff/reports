# Critique

Self-review against PROTOCOL.md §3.

## Citation integrity
- Every section-level claim in draft.md / draft.ko.md has at least one `[^sNN]` ref tied to sources.jsonl. Two technical claims (batch-settlement deposit policy and the channel manager phases) are single-primary-source (only docs.x402.org loaded; the GitHub spec returned 404). Flagged inline with `_(unverified — single source)_` and in Limitations.

## Source diversity
- 11 of 16 sources are primary vendor docs (docs.x402.org, x402.org, Coinbase CDP, Coinbase product page, Cloudflare blog, GitHub specs). Two third-party blog/news pieces (BlockEden, Stablecoin Insider) provide independent commentary; BlockEden carries the Bankless caveat used in Discussion. Peer-reviewed sources do not exist for this topic.

## Counter-evidence
- The "adoption is real" narrative is balanced against the memecoin-inflation interpretation in Introduction and Discussion. Conflict is presented, not silently resolved.

## Weak reasoning
- The claim "Permit2 is the only feasible primitive for `upto`" is presented as the spec's own justification (settled amount unknown at sign time), sourced to docs and the upto spec.

## Must-fix items
- None. The "single source" annotations are deliberate flags, not unresolved gaps.
