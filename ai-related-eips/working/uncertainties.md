# Uncertainties

## "AI EIP" is a contested category
- Industry coverage (s18, s19, s20) groups protocol-layer EIPs (8141), identity-adjacent EIPs (8128), and explicitly-AI ERCs (7857, 8004, 8126, 8183, 8211) under a single "AI EIP" framing. The grouping is useful for narrative but loose: most are ERCs (application layer), not core protocol changes. Readers should treat the cluster as *EIPs the AI agent ecosystem cares about*, not *EIPs that change AI behavior at the protocol level*.

## Vendor-stated and likely-to-shift
- **ERC-8004 production status**: mainnet activation date (2026-01-29) is reported by CoinDesk (s02). Adoption-volume projections seen in earlier search results are forward-looking, not measured; excluded from this draft.
- **ERC-8126** is Draft as of February 10, 2026 (s08); its required dependency on ERC-8004 means it cannot ship before 8004 stabilizes. The optional on-chain registry interface (s06) is *not yet* deployed at any canonical mainnet address.
- **ERC-8126 verification providers** are off-chain entities (s06); the spec deliberately accepts a "trust the verification provider" assumption while mitigating it with ZK proofs (so the user can verify the proof without trusting the provider's storage), reputation, and Quantum Cryptography Verification (QCV).
- **ERC-7857** has been live as an ERC-721 extension since January 2025 (s03, s04) with primary champion 0G Labs; cross-ecosystem adoption beyond 0G's own stack is not surfaced in this gather.
- **EIP-8141** is targeted for Hegotá in H2 2026 (s11, s12); upgrade timing is not yet locked in by core devs.
- **ERC-8183** (s10) is a February 25, 2026 proposal; spec maturity is early.

## Source asymmetry
- ERC-7857 / 8004 / 8126 / 8141 have canonical eips.ethereum.org pages we reached (s01, s03, s05, s11).
- ERC-8211 is mentioned only in news framing (s18); we have no canonical spec text. Cluster-level reference only.
