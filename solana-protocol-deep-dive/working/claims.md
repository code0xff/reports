# Claims

Status key: [x] = met minimum sourcing threshold. Source ids in parentheses.

## Introduction
- [x] c01: Solana is architected as a single global state machine that scales with hardware rather than by sharding. (s03) — interpretive
- [x] c02: Solana's original design is described in terms of eight named core components. (s03) — factual
  - note: The branded 8-component list comes from Solana's "8 Innovations" blog, NOT the v0.8.13 whitepaper, which names only generic components. Attribute accordingly.

## Background: The Design Problem
- [x] c03: Classical replicated-ledger designs require nodes to exchange messages to agree on time/ordering, a throughput bottleneck. (s01, s02) — technical
- [x] c04: Solana's core claim is a verifiable passage of time (PoH), computed before consensus, lets validators agree on ordering without a per-event communication round. (s02, s08) — interpretive

## Proof of History and the Verifiable Clock
- [x] c05: PoH is a sequential SHA-256 hash chain (each output = next input) producing verifiable ordering and a count of elapsed calls/ticks. (s01, s04) — technical
- [x] c06: PoH generation is sequential (single core) but verification is parallelizable across cores. (s01) — technical
- [x] c07: PoH is not itself consensus; it is a clock/ordering primitive under Tower BFT. (s06, s03) — interpretive

## Consensus: Tower BFT and Leader Rotation
- [x] c08: Tower BFT is a PoH-optimized PBFT variant with exponentially increasing vote lockouts. (s08) — technical
- [x] c09: Time is divided into ~400ms slots grouped into epochs; a stake-weighted leader schedule is known in advance. (s07, s08) — factual
  - gap: exact slots-per-epoch figure not confirmed from a primary source → uncertainties.
- [x] c10: Solana distinguishes processed / confirmed / finalized(rooted) commitment, not a single instant finality. (s09) — technical

## Transaction Flow and Networking
- [x] c11: Gulf Stream removes the mempool by forwarding transactions to expected upcoming leaders using the known schedule. (s05, s06) — technical
- [x] c12: Turbine propagates blocks as erasure-coded shreds through a stake-weighted tree. (s10, s03) — technical
- [x] c13: Validators ingest over QUIC with stake-weighted QoS allocating ingress proportional to stake. (s11) — factual

## Execution: Sealevel Runtime and the Account Model
- [x] c14: Solana uses an account-based model (state in program-owned accounts); programs are stateless code separated from data. (s12) — technical
- [x] c15: Because transactions declare all accounts read/written up front, Sealevel schedules non-overlapping transactions in parallel. (s13) — technical
- [x] c16: Accounts must hold a rent-exempt minimum balance proportional to size to persist. (s12) — factual

## Fees, Economics, and Staking
- [x] c17: A fee = base fee per signature + optional priority fee (compute-unit price × limit). (s14) — technical
- [x] c18: Solana implements localized fee markets so hot-account congestion does not raise fees network-wide. (s15) — technical
- [x] c19: 50% of each base fee is burned, 50% to validator; after SIMD-0096 (May 2024) 100% of priority fees go to the validator. (s14, s16) — factual
- [x] c20: Inflation started ~8%, disinflates ~15%/yr toward ~1.5% terminal, funding staking rewards. (s17, s18) — factual
  - note: numeric schedule is single-source (s17); mark unverified-single-source in draft.

## Performance, Reliability, and Firedancer
- [x] c21: Marketed/theoretical TPS (~65,000) far exceeds sustained real-world non-vote TPS. (s28, s29) — interpretive
- [x] c22: Mainnet-beta has had multiple full/partial halts requiring coordinated restarts. (s19, s20, s21, s22, s23, s24) — factual
- [x] c23: Firedancer is an independent C client by Jump Crypto; hybrid "Frankendancer" runs on mainnet. (s25, s26) — factual
  - conflict: s25 (repo) says full Firedancer "not ready for production"; s26 says "live on mainnet." Present both.
- [x] c24: No protocol-enforced minimum hardware, but the recommended spec is costly and draws centralization criticism. (s27, s30) — interpretive
  - note: Nakamoto-coefficient figure (s30) is a single low-trust source → uncertainties.

## Not-yet-in-original-outline (surfaced during gather)
- [x] c25: Alpenglow (SIMD-0326) passed governance (~98% yes) and, once activated (targeted late 2026), replaces Tower BFT + PoH voting with Votor/Rotor, targeting ~150ms finality. (s31, s32, s33) — factual
