# Gaps — sweep 1

## Resolved this sweep
- c03 EIP-4844 (s03, s06)
- c04 PeerDAS / Fusaka with concrete dates (s04, s05)
- c05 zkEVM type taxonomy + production picture (s08, s09)
- c06 Monad / MegaETH adoption signals (s10, s11, s12)
- c09 Verkle / binary tree / state expiry (s16, s17, s18)
- c10 zkSync proving and finality numbers (s19, s9)
- c11 Sequencer centralization picture via L2BEAT stages (s07)
- c12 Flashbots / Flashblocks / SUAVE archived (s25)
- c14 DA layer comparison with concrete throughput / cost numbers (s21, s22)
- c15 Based-rollup, shared-sequencer, with Astria shutdown (s20, s23, s24)
- c16 Parallel-EVM ceilings (s10, s12, s13, s14, s15)
- c17 Pre-confirmations (s20)

## Revisions needed (must do before draft)
- **c01 must be rewritten.** Vitalik *reevaluated* the rollup-centric roadmap in early 2026 (s02), not reaffirmed it. Split into:
  - c01 (origin): The 2020 rollup-centric roadmap (s01).
  - c01b (reevaluation): The 2026 reevaluation citing slow L2 decentralization and L1 progress (s02).
- **c02 must be weakened.** Numbers we have are project-specific (Starknet 127 TPS late 2024, zkSync 2–4s blocks); we don't have a single l2beat-style aggregate that says "low hundreds TPS each." Reframe as: contemporary L2s operate well below the Solana / Monad / MegaETH frontier in production, with most major L2s in the tens-to-low-hundreds TPS range under realistic load.
- **c20 must be qualified.** s09 says "2026: multiple teams have demonstrated real-time proof generation faster than Ethereum's 12-second block times," which is closer to Type-1-feasible than the original claim ("not in production as of 2026"). Reframe: real-time proving is a 2026 *demonstration* milestone, not yet shipped as a Type-1-equivalent production rollup.

## Outstanding gaps (acceptable for Limitations)
- No independent peer-reviewed empirical benchmark of MegaETH / Monad numbers — c21 acknowledges this.
- "Validium" definitional source not pulled (used informally for c19) — will reference s21's framing of Eclipse-style high-throughput-low-cost DA usage.
- Specific blob-saturation event data (e.g., recent month where blob basefee spiked) not pulled. Mitigated: claim restated to be qualitative ("becomes dominant when demand approaches the cap") rather than quoting a specific event.

## Conflicts retained for the draft
- Throughput claims for parallel-EVM are vendor-stated and across heterogeneous benchmarks (MegaETH 35k TPS sustained from a stress test; Monad 10k+ TPS target; QuarkChain 10.8 GGas/s on 16 cores; Reth 2.0 28 mainnet-blocks/sec). These are NOT directly comparable. Will be presented honestly.
- "Real-time zk-EVM" framing (s09 optimistic) vs zkSync's actual ~1h proving + 10–20m finality (s19) — both presented; the gap is reflected in proof-pipeline maturity differences across teams.

Sweep count: 1 of 6 used. Stopping here; remaining gaps are Limitations material, not gather material.
