# Claims

## Introduction
- [x] c01: Baseline Ethereum and standard zkEVMs (Linea/Scroll/Taiko) do not provide native confidential transfers; their zero-knowledge proofs are for scaling, not transaction privacy.
  - kind: technical
  - needs: independent zkEVM analysis
- [x] c02: A practical "privacy-enabled L2" in 2026 falls into one of three architectures — privacy-native execution (Aztec), execution layer with optional private state (Miden), or shielded-pool smart contracts deployed on existing L2s (Railgun).
  - kind: interpretive
  - needs: cross-source synthesis

## Background
- [x] c03: The EVM's transparent, queryable state makes privacy essentially impossible without compromising security, motivating the move to a different execution model.
  - kind: interpretive
  - needs: Aztec / Bankless commentary
- [x] c04: zkEVMs use ZK proofs to compress and verify execution but, by default, post inputs/outputs to L1 in cleartext.
  - kind: technical
  - needs: zkEVM comparison

## Aztec
- [x] c05: Aztec is a zkRollup whose contract layer treats private and public state as composable, exposing private and public functions in Noir contracts.
  - kind: technical
  - needs: Aztec primary
- [x] c06: Aztec models assets as notes; transfers consume input notes and produce output notes through join-split ZK proofs equating input and output values without revealing them.
  - kind: technical
  - needs: Aztec primary
- [x] c07: Private execution happens client-side in a Private Execution Environment (PXE) that holds keys and generates ZK proofs; public execution runs in the Aztec VM on sequencers.
  - kind: technical
  - needs: Aztec primary
- [x] c08: Aztec uses a Note Tree and a Nullifier Tree to track all notes ever created and all notes spent, anchoring state via Merkle roots posted to Ethereum L1.
  - kind: technical
  - needs: Aztec primary
- [x] c09: In March 2026 the Aztec team disclosed a critical vulnerability in the proving system; a remediated v5 release was planned for July 2026.
  - kind: factual
  - needs: independent reporting
- [x] c10: Aztec ran a community token sale in February 2026 raising $61M from 16,700+ participants, and Noir 1.0 was released as a pre-release.
  - kind: factual
  - needs: independent reporting

## Polygon Miden
- [x] c11: Miden is a STARK-based execution layer that ships an actor-model account system and a UTXO-style note system as separate database trees (accounts in SMTs, notes in MMRs, nullifiers in SMTs).
  - kind: technical
  - needs: Miden primary + Obscura deep dive
- [x] c12: Miden notes can be public (full content on-chain) or private (only the hash on-chain), and notes carry scripts that enforce consumption conditions.
  - kind: technical
  - needs: Miden primary + HackMD
- [x] c13: Miden lets clients generate proofs locally and the network recursively aggregates transaction proofs into batches and blocks before settling on Ethereum.
  - kind: technical
  - needs: Miden primary + HackMD

## Railgun
- [x] c14: Railgun is a smart-contract-based shielded-pool privacy system deployed on multiple chains including Ethereum mainnet and major L2s such as Arbitrum and Polygon.
  - kind: technical
  - needs: Railgun primary + Chainscore
- [x] c15: Railgun charges a flat 0.25% fee for shielding/unshielding and offers an optional relayer-paid gas model that adds roughly a 10% premium to gas at submission.
  - kind: factual
  - needs: Baltex 2026 comparison
- [x] c16: Railgun's Private Proof of Innocence (PPOI) lets a user prove their shielded funds did not originate from a blacklisted address without revealing identity or transaction history.
  - kind: technical
  - needs: Baltex comparison

## Comparison & implementation
- [x] c17: Aztec and Miden enforce privacy at the execution layer (private state is part of the chain itself), while Railgun enforces privacy via a smart-contract shielded pool that lives on top of an otherwise transparent L2.
  - kind: interpretive
  - needs: cross-source synthesis
- [x] c18: At 2026 levels, internal Aztec private transfers are reported under $0.10, while Railgun shielded transfers carry the L2 base gas plus the 0.25% protocol fee.
  - kind: factual
  - needs: Baltex 2026 comparison

## (No section after this)
