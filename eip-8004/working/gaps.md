# Gaps — ERC-8004

After one gather sweep (2026-04-23).

## Under-sourced claims
- None. Every claim c01–c16 has at least one primary or independent source; the controversial adoption figure (45k agents) is independently reported by two outlets (s07, s08). Validation-model and security claims are each backed by both a primary (s01) and an independent review (s13, s15).

## Sources that conflict
- BNB Chain coverage (s16) quotes ~24,000 Ethereum-deployment identities at time of writing; mainnet-launch-era reporting (s07, s08) quotes 45k+ across multiple chains in the first month. The numbers are consistent once chain scope is accounted for (Ethereum-only vs multi-chain), but the draft should surface that the "45k" figure is cross-chain and comes from 8004 Scan, not official Ethereum Foundation metrics.

## Sections without a primary source
- None. Every section has at least one primary source (either the EIP text, the reference contracts repo, Ethereum Magicians, or the protocol partners' own posts).

## Open questions surfaced during reading
- Independent audit reports for the reference registry contracts (github.com/erc-8004/erc-8004-contracts) were not located in this sweep. Logged as a limitation.
- Peer-reviewed analysis of ERC-8004's trust model (as opposed to explainers/blog posts) does not appear to exist yet. Treated as a limitation, not a gap.
- The precise mapping between ERC-8004 validation hooks and EigenLayer AVS or SemiOtic/JOLT-Atlas zkML stacks is described conceptually (s14) but concrete production integrations are still forming. Logged as an uncertainty.

## Decision
Proceed to draft. Remaining unknowns are epistemic and belong in Limitations.
