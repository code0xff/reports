# Claims — Lean Ethereum

## 서론 (Introduction)
- [x] c01: "Lean Ethereum" is an umbrella research/engineering programme announced by Ethereum Foundation researchers in mid-2025, not a single EIP or hard fork.
  - kind: factual
  - needs: an EF-hosted or EF-authored primary post dated 2025 that introduces the term, plus one independent report
  - sources: s01, s26, s27
- [x] c02: The two stated motivations for Lean Ethereum are post-quantum security and snarkification (making the protocol cheaply provable), rather than raw throughput alone.
  - kind: factual
  - needs: primary text listing the motivations
  - sources: s01, s03
- [x] c03: `leanroadmap.org` tracks the Lean Consensus workstream specifically, and organises it under four headings (consensus, cryptography, governance, craft), which is a narrower framing than the three-pillar "lean consensus / lean data / lean execution" umbrella.
  - kind: factual
  - needs: the roadmap site itself plus a source using the three-pillar framing
  - sources: s02, s01, s26

## 배경 (Background)
- [x] c04: Lean Ethereum is the direct successor of the "Beam Chain" consensus-layer redesign that Justin Drake presented at Devcon SEA in November 2024.
  - kind: factual
  - needs: a record of the Beam Chain talk plus a source connecting Beam Chain to Lean Ethereum
  - sources: s12, s08, s22
- [x] c05: Ethereum's current validator signature scheme (BLS12-381) is not post-quantum secure, and this is the specific cryptographic dependency Lean Cryptography is designed to replace.
  - kind: technical
  - needs: primary spec/research text naming BLS and its quantum exposure
  - sources: s03, s17, s07
- [x] c06: Under today's Casper FFG + LMD-GHOST, finality takes roughly 12.8 minutes (two epochs), which Lean Consensus aims to reduce to a small number of slots.
  - kind: factual
  - needs: consensus-spec-derived number plus roadmap statement of the target
  - sources: s04, s02, s29
- [x] c07: A core design premise of Lean Ethereum is that reducing protocol complexity is itself a security measure ("Lean Craft": minimalism, modularity, formal verification).
  - kind: interpretive
  - needs: primary text arguing complexity reduction as a security goal
  - sources: s01, s02, s21

## 아키텍처 (Architecture)
- [x] c08: Lean Consensus targets 3-Slot Finality (3SF), meaning a block is finalized about three slots after proposal rather than after two epochs.
  - kind: technical
  - needs: 3SF research paper or spec, plus the roadmap's own description
  - sources: s04, s02, s29
- [x] c09: The fork-choice rule paired with 3SF in the Lean Consensus track is called Goldfish.
  - kind: technical
  - needs: a primary spec/paper naming Goldfish in the lean/3SF context
  - sources: s24, s28, s08
- [x] c10: Lean Cryptography replaces BLS aggregate signatures with hash-based signatures from the XMSS family (`leanSig`) plus a SNARK-based aggregation scheme (`leanMultisig`).
  - kind: technical
  - needs: leanSig/leanMultisig repositories or specs
  - sources: s06, s13, s07, s03
- [x] c11: Hash-based post-quantum signatures are individually far larger than BLS signatures, and the programme's answer to that bandwidth problem is recursive proof aggregation rather than smaller signatures.
  - kind: technical
  - needs: concrete size figures for leanSig signatures vs. BLS's 96 bytes, plus a statement that aggregation is the mitigation
  - sources: s32, s16, s13, s15, s03, s34
- [x] c12: Lean Ethereum's cryptographic stack depends on algebraic hash functions (Poseidon2) and FRI-family proof systems (FRI/STIR/WHIR) whose security margins are less established than SHA-2/keccak, and the programme runs an explicit cryptanalysis effort in response.
  - kind: technical
  - needs: primary evidence of a Poseidon cryptanalysis initiative plus a paper on Poseidon or FRI-family security
  - sources: s10, s30, s13, s08
- [x] c13: "Lean Execution" refers to replacing/wrapping the EVM's proving target with a minimal SNARK-friendly instruction set, with RISC-V named as the leading candidate.
  - kind: technical
  - needs: a primary Ethereum-research post proposing RISC-V or a minimal zkVM ISA for L1 execution
  - sources: s01, s27, s11

## 구현 현황 (Implementation state)
- [x] c14: The Lean Consensus effort has run a numbered sequence of post-quantum devnets (pq-devnet-0 onward) starting in late 2025, each adding a specific capability.
  - kind: factual
  - needs: roadmap milestone list plus at least one independent or repo-side confirmation of a devnet
  - sources: s02, s14, s15, s28
- [x] c15: Lean Consensus is being implemented by multiple independent client teams in different languages (including Ream in Rust, Zeam in Zig, and a C++ implementation), rather than as a single reference client.
  - kind: technical
  - needs: at least two of the named client repositories
  - sources: s14, s22, s23, s15
- [x] c16: `leanSpec` is the executable/reference specification repository for the Lean Consensus protocol.
  - kind: technical
  - needs: the leanSpec repository
  - sources: s05, s03
- [x] c17: Parts of the Lean cryptography/consensus stack are being formally verified using the Lean 4 theorem prover.
  - kind: factual
  - needs: primary evidence of Lean 4 formal-verification work in this programme
  - sources: s02, s21
- [x] c18: As of mid-2026, published benchmarks show leanSig verification meeting or beating its target while aggregate proof size still exceeds target.
  - kind: factual
  - needs: the benchmark table from the roadmap/leanBench, ideally with a second reading
  - sources: s02, s13, s16

## 로드맵과 거버넌스 (Roadmap and governance)
- [x] c19: The Ethereum Foundation circulated a draft multi-fork plan (a "strawmap") in early 2026 that schedules Lean-related changes across several upgrades through roughly 2029.
  - kind: factual
  - needs: a primary EF/ethereum-magicians post plus one independent report
  - sources: s20, s26, s17
- [x] c20: Publicly reported Lean-associated throughput targets are on the order of 10,000 TPS on L1 and ~1,000,000 TPS across L2s.
  - kind: factual
  - needs: two sources; identify whether these come from EF primary text or from press interpretation
  - sources: s01, s20, s26
- [x] c21: In 2026 Vitalik Buterin published an "Extremely Lean Ethereum" variant that pushes further than the baseline roadmap, proposing to shrink enshrined L1 state toward zero using ZK proofs.
  - kind: factual
  - needs: the primary post plus one independent report
  - sources: s09, s26, s27
- [x] c22: Lean-track changes are being sequenced after the Glamsterdam fork rather than inside it.
  - kind: factual
  - needs: fork-scope evidence for Glamsterdam plus a statement of where Lean items land
  - sources: s31, s26, s27

## 분석과 반론 (Analysis)
- [x] c23: The dominant near-term technical risk to the Lean Cryptography plan is not the signature scheme's PQ security but the performance and security of the proof system used to aggregate signatures.
  - kind: interpretive
  - needs: benchmark/aggregation-gap evidence and cryptanalysis evidence to support the reading
  - sources: s13, s10, s30, s15
- [x] c24: Independent commentary treats the Lean timeline as aspirational, noting that no Lean-track change had shipped to Ethereum mainnet as of mid-2026.
  - kind: interpretive
  - needs: at least one independent source expressing timeline skepticism; mainnet-status evidence
  - sources: s20, s27, s31
- [x] c25: There is real disagreement over whether the quantum threat justifies rewriting the consensus layer now, versus deferring PQ migration.
  - kind: interpretive
  - needs: sources on both sides of the urgency question
  - sources: s17, s18, s19
