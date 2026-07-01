# Gaps — ERC-1155 Multi Token Standard

Status after gather iteration 1: **all 18 claims meet the minimum sourcing threshold.**

## Under-sourced claims
- c15 (OpenSea supports ERC-1155) rests on a single authoritative primary (OpenSea docs, s07). This is a first-party statement from the platform in question, so it is treated as sufficient but is flagged single-source in the draft.

## Conflicting evidence
- None material. The only tension is quantitative: an aggregated blog claimed a "~60% gas reduction" and ~5.0M→1.8M figures for 100 transfers, which could not be traced to a primary benchmark. We instead cite RareSkills' reproducible measurement (132,437 vs 189,861 gas for 3 transfers, s05) and describe savings qualitatively. The unverifiable ~60% figure is deliberately excluded.

## Missing primary sources
- None for the core interface, events, metadata, and approval claims — all anchored to the EIP itself (s01/s04).

## Open questions (resolved or accepted)
- Exact "Final" date (commonly cited as June 2019) is not asserted with a primary timestamp; the draft states only that status is "Final" per the EIP header (s01). Accepted as a limitation rather than a gap.

## Counter-evidence (added in critique pass)
- A dissent sweep surfaced the recognised drawbacks of ERC-1155: added implementation complexity and historically less uniform wallet/infrastructure support than ERC-721, and unsuitability for pure 1/1 art or pure-fungible cases. This was missing from the first draft and is now represented via source s11 and a "The case against" paragraph in the Discussion (en + ko).

Gap list is considered closed for publishing.
