# Claims

## Introduction
- [x] c01: BitVM enables Turing-complete/expressive contracts on Bitcoin without any change to Bitcoin's consensus rules (no soft fork).
  - kind: factual
  - needs: BitVM1 whitepaper + repo statement. (s01, s06)
- [x] c02: BitVM does not execute computation on Bitcoin; it only *verifies* it, analogously to optimistic rollups, with on-chain action required only on dispute.
  - kind: technical
  - needs: BitVM1 paper "merely verified" + off-chain compute quote. (s01, s02)

## Background
- [x] c03: BitVM relies on Taproot/Tapscript: programs are committed as leaves in a Taproot tree so the on-chain footprint stays minimal despite large off-chain programs.
  - kind: technical
  - needs: BitVM1 paper Taproot leaf description. (s01, s02)
- [x] c04: BitVM uses pre-signed challenge-response transaction sequences agreed by the parties before any dispute.
  - kind: technical
  - needs: BitVM1 paper pre-signed tx + BitVMX pre-signed graph. (s01, s05)

## BitVM1
- [x] c05: BitVM1 represents computation as a Boolean (NAND/logic-gate) circuit, with each gate getting its own Taproot script leaf.
  - kind: technical
  - needs: BitVM1 paper NAND/circuit. (s01, s02)
- [x] c06: Bit values are committed using two hashes (hash0/hash1); revealing a preimage sets a bit, and revealing both preimages (equivocation) lets the counterparty seize the deposit.
  - kind: technical
  - needs: Fermat annotated bit-commitment quote. (s02)
- [x] c07: BitVM1 is explicitly limited to a two-party (single prover, single verifier) setting.
  - kind: technical
  - needs: BitVM1 paper "limited to the two-party setting" quote. (s01, s02)

## BitVM2
- [x] c08: BitVM2 introduces permissionless verification — anyone running a Bitcoin full node can challenge a faulty operator, not just a predefined validator set.
  - kind: technical
  - needs: BitVM2 page + bridge paper. (s03, s04)
- [x] c09: BitVM2 resolves disputes in a small constant number of on-chain transactions (on the order of three), shifting the fraud-proof execution burden onto the challenger.
  - kind: technical
  - needs: BitVM2 page tx flow (KickOff/Assert/Challenge/Disprove). (s03, s07)
- [x] c10: BitVM2 implements a Groth16 SNARK verifier in Bitcoin Script that is gigabyte-scale (~1.0–1.2 GB after optimization, down from multi-GB estimates) and must be split into sub-program chunks under Bitcoin's ~4 MB limit.
  - kind: technical
  - needs: Alpen analysis + repo README + bridge paper. (s06, s07, s04)
- [x] c11: The BitVM Bridge uses a 1-of-n trust model: as long as one operator is honest, deposits cannot be stolen (a dishonest set can at worst burn/freeze, not steal).
  - kind: technical
  - needs: BitVM2 page trust model + Decrypt + Bitlayer. (s03, s08, s09)

## BitVMX and BitVM3
- [x] c12: BitVMX (Lerner et al., May 2024) designs a general-purpose virtual CPU instantiable for RISC-V or MIPS, verified in Bitcoin Script.
  - kind: technical
  - needs: BitVMX arXiv abstract. (s05)
- [x] c13: BitVMX uses hash chains of program traces with memory-mapped registers instead of Merkle trees for instructions/memory, and adds a message-linking protocol; it does not require signature equivocation as BitVM1 does.
  - kind: technical
  - needs: BitVMX arXiv contributions + verbatim quote. (s05)
- [x] c14: BitVM3 (Robin Linus, July 2025) moves computation off-chain using garbled circuits, cutting worst-case dispute cost by roughly 1000x versus prior Script-based on-chain verification.
  - kind: technical
  - needs: BitVM3 paper + secondary explainer. (s10, s11)

## Trust model, deployments, and critiques
- [x] c15: BitVM bridges are widely characterized as "trust-minimized" but not "trustless," reducing trust from an honest majority to a 1-of-n existential-honesty assumption.
  - kind: interpretive
  - needs: Decrypt + Bitlayer + BitVM2 page. (s08, s09, s03)
- [x] c16: A central critique is that BitVM bridges are an optimistic *reimbursement* system requiring operators to front their own BTC liquidity for withdrawals, so capital formation and liveness/solvency of operators are non-trivial unsolved problems.
  - kind: interpretive
  - needs: Decrypt (Whittle/Wall) + Alpen capital overhead. (s08, s07, s12)
- [x] c17: A complete BitVM bridge design was first deployed on testnet by Citrea (Clementine) in 2025, and Bitlayer launched a BitVM Bridge mainnet beta on 2025-07-15 using operators from major mining pools.
  - kind: factual
  - needs: Coindesk/Citrea PR + Bitlayer blog. (s13, s09)
- [x] c18: Capital lockup in BitVM designs scales with bridge value and bonds must be provisioned up front in pre-signed transaction graphs, reducing capital efficiency; reducing this is an active research area.
  - kind: technical
  - needs: Alpen open problems + Decrypt. (s07, s08)
