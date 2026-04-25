# Uncertainties

## Vendor-stated and likely-to-shift
- **Throughput claims for high-performance L2 / EVM-compatible chains.** MegaETH 100k TPS target with 35k TPS sustained over a 7-day stress test (s10, s11), Monad 10k+ TPS at 800ms finality (s12), Reth 2.0 ~28 mainnet-blocks/sec (s14), QuarkChain 10.8 GGas/s on 16 cores (s15). These are project-led measurements on differently-shaped benchmarks; treat as upper bounds in their own conditions, not as comparable apples-to-apples numbers.
- **PeerDAS BPO timeline.** BPO1 (10/15) and BPO2 (14/21 by Jan 7 2026) are documented forks (s04), but actual capacity scaling depends on observed validator-side performance after each BPO. 128-blob long-term target (s05) is a horizon, not a 2026 number.
- **Vitalik's 2026 reevaluation** of the rollup-centric roadmap (s02) is a public statement, not a formal EF roadmap document. The practical impact on L2 vs L1 capital allocation is still playing out.
- **Real-time zkEVM proving** (s09 — "16 minutes → 16 seconds, 45x cost reduction, multiple teams have demonstrated real-time proof generation faster than Ethereum's 12s block time") is a milestone-grade claim from late-2025/2026 reporting. Production zk rollups still have meaningful proving lag (s19: zkSync ~1h proving, 10–20 min hard finality).

## Asymmetric source quality
- DA-layer comparisons (s21, s22) come from third-party blogs and project blogs. Concrete cost ratios (e.g., 55x cheaper than Ethereum blobs) are time-stamped and depend on the prevailing blob basefee, which fluctuates.
- Astria shutdown (s24) is reported by The Block as a 2025 event; we have not pulled the team's primary post-mortem.

## Class-wide risks not specific to one project
- **Centralized sequencers** are a single point of failure for liveness and censorship-resistance across essentially every production L2 today (s07). The failure mode is a known UX risk, not a hypothetical.
- **MEV** at the sequencer is a class-wide UX risk; encrypted mempools (SUAVE archived 2025, s25) and shared sequencers (Espresso live, Astria dead, s23, s24) are all in flux.
