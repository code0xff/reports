# Claims — High-performance Ethereum L2 (post-gather)

## Introduction
- [x] c01: Vitalik Buterin's 2020 "rollup-centric roadmap" made L2 rollups (not L1 sharding) the canonical Ethereum scaling path through the mid-2020s.
  - sources: s01
- [x] c01b: In early 2026 Vitalik reevaluated that roadmap, citing slow L2 decentralization and material L1 progress (Pectra block-capacity doubling, gas-cap increases), and reframed L2s as a spectrum of chains with varying degrees of connection to Ethereum rather than the single primary scaling story.
  - sources: s02
- [x] c02: The contemporary production L2 set runs well below the throughput frontier set by Solana / Monad / MegaETH; published numbers like Starknet's "127 TPS in late 2024" and zkSync's 2–4s blocks place major L2s in tens-to-low-hundreds TPS under realistic load, not thousands.
  - sources: s09, s19

## Background: the Ethereum L2 landscape today
- [x] c03: EIP-4844 introduced blob-carrying transactions and a separate blob fee market in March 2024 (Dencun upgrade), reducing L2 data-publication cost by roughly 10–100×.
  - sources: s03, s06
- [x] c04: PeerDAS (EIP-7594) is the next planned scaling step for blob bandwidth and shipped with the Fusaka mainnet upgrade on December 3, 2025; per-block blob limits start at 6/9 (target/max) at activation, raising to 10/15 (BPO1) and 14/21 (BPO2, January 7, 2026), with a long-term target near 128 blobs/slot at maturity.
  - sources: s04, s05
- [x] c05: The contemporary production L2 set is split between optimistic rollups (OP Stack: Base/OP, Arbitrum) and zk rollups (zkSync, Starknet, Linea, Scroll, Polygon zkEVM); a true Type-1 zkEVM proving unmodified Ethereum execution is not yet shipped at full equivalence as a production rollup, even though "real-time" proving is a 2026 demonstration milestone.
  - sources: s07, s08, s09
- [x] c06: Solana, Monad (mainnet Nov 24 2025), and MegaETH (mainnet Jan 22 2026) form the high-throughput reference set against which Ethereum L2 designs are now benchmarked, with vendor targets of 10k–100k TPS.
  - sources: s10, s11, s12

## The bottleneck taxonomy
- [x] c07: Data availability is the dominant gas-cost component for Ethereum L2s; before EIP-4844 ~98% of L2 cost was L1 data posting, and the post-4844 fee market makes blob basefees the dominant cost component again whenever blob demand approaches the per-block cap.
  - sources: s06, s21
- [x] c08: A vanilla single-threaded EVM mainloop is the throughput ceiling for any L2 retaining full Ethereum-equivalent semantics without parallelism; Reth's documented sustained sync rate is 100–200 mgas/s on commodity hardware (well under 1 gigagas/s).
  - sources: s13, s10
- [x] c09: State growth and per-key Merkle-proof I/O over the Merkle Patricia Trie are a primary scaling barrier; the active EIP responses are verkle trees (EIP-7736 leaf-level state expiry) and a renewed unified binary-tree alternative (EIP-7864).
  - sources: s16, s17, s18
- [x] c10: zk-proof generation latency remains a real bottleneck even after 2025–2026 prover-stack progress: zkSync's documented proof-generation time is ~1 hour and L1 hard-finality is 10–20 minutes; "real-time" sub-12s proving is a 2026 milestone for some teams but not yet uniform across production zk rollups.
  - sources: s19, s9
- [x] c11: Single-sequencer deployment is the dominant liveness/censorship bottleneck across production L2s in 2026: although Arbitrum, OP Mainnet, and Base are L2BEAT Stage 1 with permissionless fraud proofs, sequencing remains centralized at all three.
  - sources: s07
- [x] c12: MEV captured at the sequencer is a class-wide UX risk; the active 2025–2026 production response is OP-Stack-side fast confirmations via Flashbots Flashblocks (200 ms confirmations on Base / Unichain), while SUAVE was archived in May 2025.
  - sources: s25

## Architecture choices
- [x] c13: Optimistic rollups ship faster and cheaper to prove but pay with a 7-day exit window; zk rollups invert this — higher upfront engineering and per-block proving cost in return for cryptographic finality without challenge delays.
  - sources: s07, s08, s19
- [x] c14: Posting data to Ethereum blobs (EIP-4844 → PeerDAS) is the only DA option that inherits Ethereum's full security; alt-DA (Celestia ~1.33 MB/s, EigenDA ~100 MB/s claimed, Avail) trades meaningful cost reduction (Celestia ~55× cheaper than blobs at quoted 2025 prices) for a separate, smaller security set.
  - sources: s21, s22
- [x] c15: Based rollups (Taiko, sequencing delegated to L1 proposers) trade per-block latency for L1-equivalent censorship resistance; centralized sequencers trade censorship-resistance for sub-second pre-confirmations; shared sequencers (Espresso live, Astria shut down 2025) sit between but are not yet in widespread production.
  - sources: s20, s23, s24
- [x] c16: Parallel-EVM execution engines — MegaETH (sustained 35k TPS in stress test), Monad (10k+ TPS target with 800 ms finality), Reth 2.0 (~28 mainnet-blocks/sec), QuarkChain (10.8 GGas/s on 16 cores) — empirically beat single-threaded EVM by one to two orders of magnitude, but each measures itself on a different benchmark.
  - sources: s10, s11, s12, s13, s14, s15
- [x] c17: Pre-confirmations (Taiko / based-rollup style, originally proposed by Justin Drake) provide millisecond-scale UX finality without compromising L1 settlement, but only when economically backed by collateralised proposers.
  - sources: s20

## Recommended stack & tradeoffs
- [x] c18: For an "ultra-high-performance Ethereum L2 today" the realistic stack is: a Type-2 / Type-2.5 zkEVM with a Type-1 trajectory; Ethereum blobs (4844 → PeerDAS) for DA on the security path, with alt-DA only for explicit validium-style throughput plays; a parallel-EVM execution engine (Reth-derivative or Monad-style optimistic concurrency); centralized-but-monitored sequencer with Flashblocks-grade pre-confirmations as a 200 ms UX layer; and a defined migration path to a shared or based sequencer (Espresso, or a Justin-Drake-style based design).
  - sources: synthesis from s04, s07, s09, s10, s12, s13, s14, s20, s21, s23, s25
  - kind: interpretive
- [x] c19: Choosing alt-DA (Celestia, EigenDA) over Ethereum blobs is defensible only when the L2 explicitly accepts a smaller security set or runs as a validium; for a "rollup with Ethereum-equivalent security guarantees", PeerDAS-era blobs remain the only path.
  - sources: s05, s21
- [x] c20: A Type-1 zkEVM proving bit-identical Ethereum L1 blocks is not yet a shipped production rollup as of 2026; "real-time" proving (16 min → 16 s) is a 2026 demonstration milestone, with Linea/Scroll at Type-2 and zkSync/Starknet at Type-4 in production.
  - sources: s08, s09

## Limitations
- [x] c21: Most quantitative throughput claims for high-performance L2s in 2026 (MegaETH 100k TPS, Monad 10k+ TPS, QuarkChain 10.8 GGas/s) come from project-led measurement across heterogeneous benchmarks; treat as vendor-stated upper bounds in their own conditions until independently reproduced.
  - sources: s10, s11, s12, s14, s15
