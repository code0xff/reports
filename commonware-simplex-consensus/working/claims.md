# Claims — Commonware SimpleX Consensus

## Introduction
- [x] c01: SimpleX is a Byzantine fault-tolerant state-machine-replication protocol introduced by Benjamin Y. Chan and Rafael Pass (TCC 2023, IACR ePrint 2023/463), designed to be simpler than HotStuff/Tendermint while matching or beating their latency in the common case.
  - sources: s01, s02, s03
- [x] c02: Commonware ships a Rust implementation of SimpleX as the `simplex` module of `commonware-consensus` (crate version 2026.4.0), part of the `commonwarexyz/monorepo` repository.
  - sources: s05, s06, s07, s11, s15

## Background: BFT consensus context
- [x] c03: Simplex's per-view design lets it advance to the next view immediately on observing a certificate, removing the 2Δ leader-wait that Tendermint/HotStuff need; this cuts the per-faulty-leader cost from ~6Δ (Tendermint) to ~3Δ (Simplex).
  - sources: s17 (independent), s03, s04
  - kind: interpretive
- [x] c04: SimpleX targets the partial-synchrony model and tolerates f < n/3 Byzantine faults — the same fault model as PBFT and HotStuff.
  - sources: s01, s04

## The SimpleX algorithm (paper)
- [x] c05: SimpleX organizes execution into iterations h = 1, 2, …; the leader of iteration h is `Lₕ = H*(h) mod n` (deterministic round-robin via hash); per iteration, players cast a `notarize` vote on a leader's proposal, and a `finalize` vote on a notarized block.
  - sources: s04, s05, s07
- [x] c06: A block becomes notarized when ≥ 2n/3 (i.e. 2f+1) `notarize` votes are collected; an iteration is finalized when ≥ 2n/3 `finalize` votes are collected on its notarized block.
  - sources: s04, s05, s07
- [x] c07: Under good network conditions with an honest leader, SimpleX finalizes within roughly 3 message delays (3Δ — propose, notarize-vote, finalize-vote); the project measures Simplex worst-case (1/3 faulty proposers, 80ms RTT) at 400 ms vs HotStuff 2480 ms / Tendermint(Chained) 1840 ms.
  - sources: s03, s04, s06, s09
- [x] c08: SimpleX uses a per-iteration timer Tₕ that, on firing after 3Δ seconds, has the player vote for a "dummy block" — this lets iterations with crashed/Byzantine leaders advance without classical view-change machinery.
  - sources: s04, s07

## Commonware's implementation (`simplex` crate)
- [x] c09: Commonware's `simplex` source tree (in `consensus/src/simplex/`) is decomposed into `actors/`, `scheme/`, `mocks/`, plus `engine.rs`, `types.rs`, `config.rs`, `elector.rs`, `metrics.rs`, `mod.rs`.
  - sources: s06, s07, s08
- [x] c10: The Commonware engine wires three long-running actors — Voter (vote aggregation and view bookkeeping), Batcher (lazy batch signature verification), Resolver (request/response certificate fetch for missed views) — plus an Application supplied by the user that implements `certify` to gate finalization.
  - sources: s05, s06, s08
- [x] c11: The Commonware implementation ships four pluggable signature schemes — `ed25519`, `bls12381_multisig`, `secp256r1`, and `bls12381_threshold` — with the threshold variant supporting an embedded VRF for randomized leader election and recovering ~240-byte succinct certificates.
  - sources: s05, s10
- [x] c12: Commonware's blog and documentation explicitly position SimpleX as their default agreement primitive, citing two-network-hop block times and three-network-hop finality as the headline properties.
  - sources: s06, s09
- [x] c12b: The Commonware `simplex` implementation diverges from the paper in named, documented ways: distinct `nullify` message (vs unified vote), on-demand certificate fetch (vs proposal carrying full history), explicit leader timeout, leader-skip after `r` inactive views, message rebroadcast, treat local proposal/verification failure as immediate timeout, and an application `certify` gate before broadcasting `finalize`.
  - sources: s05, s06

## Performance & deployment claims
- [x] c13: Commonware's measured Alto benchmark (a "wicked fast" minimal blockchain on AWS c7g.xlarge) reports ~200 ms block time and ~300 ms finality after buffered-signature optimization, down from 255/375 ms. These are vendor-stated and workload-specific, not generic SimpleX benchmarks.
  - sources: s18
  - mark in draft: _(vendor-stated)_
- [x] c14: Independent academic engagement with SimpleX exists (Shoup, "Sing a Song of Simplex" / DispersedSimplex, DISC 2024), but no independent peer-reviewed empirical comparison of *Commonware's specific implementation* against major BFT engines (HotStuff/DiemBFT, Tendermint, Narwhal-Bullshark) was located in this gather.
  - sources: s16; absence of independent benchmark recorded in gaps/uncertainties
- [x] c14b: SimpleX (with modifications) is being adopted beyond Commonware: notably, Solana's Alpenglow upgrade (Votor) draws on Simplex insights, and the original simplex.blog lists Tempo and Ava Labs Go implementations.
  - sources: s03, s12, s13

## Limitations & open questions
- [x] c15: Because each iteration's leader is deterministic, SimpleX needs an explicit timeout / skip mechanism for unresponsive or faulty leaders; Commonware's implementation surfaces this as `leader_timeout` plus a "skip leader timeout if the designated leader hasn't participated in r views" rule.
  - sources: s05, s06
- [x] c16: As of crate v2026.4.0, `commonware-consensus` (which contains the `simplex` module) is labelled ALPHA on crates.io and explicitly "not yet recommended for production use".
  - sources: s11, s15
