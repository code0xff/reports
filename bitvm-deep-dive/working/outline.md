# Outline

1. **Abstract** — what BitVM is, the optimistic verify-don't-compute paradigm, the BitVM1→2→X→3 arc, the 1-of-n trust model, and the headline tension (trust-minimized but not trustless; capital/liveness costs).

2. **Introduction** — Why Bitcoin Script can't do general computation; what problem BitVM solves (programmability without a soft fork); scope and source basis.

3. **Background: Bitcoin Script limits, Taproot, and the optimistic idea** — Script's non-Turing-completeness, Taproot/Tapscript leaves, the analogy to optimistic rollups (verify, don't execute), pre-signed transaction graphs.

4. **BitVM1 (2023): the original design** — NAND/Boolean-circuit model, bit-value commitments via hash preimages (Lamport-style), equivocation-as-punishment, two-party prover/verifier limitation, off-chain compute / minimal on-chain footprint.

5. **BitVM2 (2024): permissionless verification and the bridge** — permissionless challenging, ~3 on-chain tx (KickOff/Assert/Challenge/Disprove), Groth16 SNARK verifier in Script (~1GB+, chunked under 4MB), 1-of-n setup, the BitVM Bridge.

6. **BitVMX and BitVM3: the competing/successor designs** — BitVMX (RISC-V/MIPS CPU, hash chains not Merkle trees, message-linking); BitVM3 (garbled circuits, off-chain compute, ~1000x cheaper disputes).

7. **Trust model, deployments, and critiques** — 1-of-n vs trustless; capital-formation and liveness critiques (Whittle, Wall); real deployments (Citrea Clementine testnet 2025-04, Bitlayer mainnet beta 2025-07).

8. **Limitations** — fast-moving field, vendor/preprint-heavy sources, PDF/IACR fetch gaps, testnet-vs-mainnet maturity, unaudited research code.

9. **References** — built from sources.jsonl.
