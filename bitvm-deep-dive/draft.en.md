# BitVM: Universal Computation Verification and Trust-Minimized Bridges on Bitcoin

## Abstract

BitVM is a paradigm for enabling expressive, effectively Turing-complete contracts on Bitcoin without any change to Bitcoin's consensus rules — no soft fork.[^s01][^s06] Its core idea is "verify, don't compute": computations are not executed on Bitcoin but only *verified*, much like optimistic rollups, with on-chain action required only in case of a dispute.[^s01][^s02] This report traces four generations: BitVM1 (2023), built on Boolean (NAND) circuits and a two-party prover/verifier model;[^s01] BitVM2 (2024), which introduced permissionless verification, a Groth16 SNARK verifier in Bitcoin Script, and the BitVM Bridge;[^s03][^s04] BitVMX (2024), a RISC-V/MIPS virtual CPU built on hash chains instead of Merkle trees;[^s05] and BitVM3 (2025), which moves computation off-chain via garbled circuits, cutting dispute cost roughly 1000×.[^s10][^s11] The resulting BitVM Bridge uses a 1-of-n trust model: if even one operator is honest, deposits cannot be stolen (a fully dishonest set can at worst freeze or burn, not steal).[^s03][^s08] But this is "trust-minimized," not "trustless," and the requirement that operators front their own BTC liquidity for withdrawals leaves capital-formation and liveness as unresolved critiques.[^s08][^s07] Real deployments are confirmed at Citrea (Clementine) testnet (2025) and Bitlayer mainnet beta (2025-07-15).[^s13][^s09]

## 1. Introduction

Bitcoin Script is deliberately limited: no loops, restricted opcodes, no native big-integer arithmetic or general computation. This made running Ethereum-style smart contracts directly on Bitcoin essentially impossible. BitVM addresses exactly this gap — granting Bitcoin programmability without changing its consensus rules (no soft fork).[^s01][^s06]

BitVM's answer is indirection. Instead of *computing* an arbitrary function on Bitcoin, make that computation *verifiable*. A prover claims that function f on some input yields output y; if the claim is false, a verifier can perform a succinct fraud proof and punish the prover.[^s01] This is isomorphic to optimistic rollups, and the honest path leaves almost no on-chain trace. This report reads BitVM's primary materials (whitepapers, project pages, the reference implementation) alongside independent analyses, journalism, and critique to balance capability against limitation.[^s01][^s03][^s05][^s06][^s07][^s08]

## 2. Background: Bitcoin Script limits, Taproot, and the optimistic idea

BitVM is enabled by **Taproot**, activated in 2021. Taproot/Tapscript lets a single output commit to many scripts as tree leaves and reveal only the leaf actually used. BitVM commits a large program as leaves of a Taproot tree, so the on-chain footprint stays minimal no matter how large the off-chain program is.[^s01][^s02]

The second pillar is the **pre-signed transaction graph**. Before any dispute, the prover and verifier pre-sign the sequence of transactions that make up the challenge-response game. As long as cooperation continues, the parties "can perform arbitrarily complex, stateful off-chain computation, without leaving any trace in the chain. On-chain execution is required only in case of a dispute."[^s01] This pre-signed-graph structure is later generalized by BitVMX's message-linking protocol.[^s05]

## 3. BitVM1 (2023): the original design

Robin Linus's original BitVM (2023) represents computation as a **Boolean circuit**. Using the fact that any computable function can be expressed as a Boolean circuit, each logic gate (notably NAND) gets its own Taproot script leaf.[^s01][^s02]

Bit values are committed using **Lamport-style commitments**: the commitment holds two hashes, hash0 and hash1, and the prover reveals one preimage to set a bit to 0 or 1. Revealing *both* preimages (equivocation) lets the counterparty seize the deposit — an "incentive-based commitment" that puts an economic penalty on lying.[^s02] Disputes are resolved on-chain via the pre-signed challenge-response transactions.[^s01]

BitVM1's defining constraint is its **two-party limitation**. The paper states that "the main drawback of the model proposed here is that it is limited to the two-party setting with a prover and a verifier."[^s01] An arbitrary third party cannot challenge a dishonest prover; only the pre-paired verifier can. This limitation is the central motivation for BitVM2.

## 4. BitVM2 (2024): permissionless verification and the bridge

The headline advance of BitVM2 (Linus, Aumayr, Pelosi, Zamyatin, Maffei) is **permissionless verification**. Rather than a predefined validator set, "anyone can act as verifier" — any user running a Bitcoin full node can challenge a faulty operator.[^s03][^s08] The initial setup still uses a 1-of-n honesty assumption, but runtime challenges need not come from the original group.[^s03]

Disputes resolve in a small constant number of on-chain transactions (the core flow is roughly three — named stages KickOff/Assert/Challenge/Disprove). The design's trick is to shift the fraud-proof execution burden onto the challenger, "reducing the total worst-case computation to a single step f_i, executed by the verifier."[^s03][^s07] The prover commits to the output and intermediate states; the challenger need only show that *one* step's transition is wrong.

To do this, BitVM2 implements a **Groth16 SNARK verifier in Bitcoin Script**. That script is gigabyte-scale — starting from a ~7 GB estimate before optimization, down to roughly 1.2 GB (Alpen's analysis) and about 1 GB in the reference repository.[^s06][^s07] _(The specific figure varies by source and time and is trending down with optimization — read it as a range, not a single number.)_ Because of Bitcoin's ~4 MB limit, the verifier is split into sub-program chunks under 4 MB across multiple transactions.[^s07][^s04] The bottleneck stems from Bitcoin Script's lack of native big-integer arithmetic and opcodes for the elliptic-curve pairings.[^s07]

On top of this machine sits the **BitVM Bridge**, whose key property is **1-of-n** security: one honest operator suffices, and "even if all operators are dishonest, they cannot steal deposits — only burn them."[^s03] The reference implementation is written in Rust and contains the BitVM2 bridge (peg-in/peg-out, MuSig2 signing, chunk splitting), but the repository is explicitly experimental research code marked "DO NOT USE IN PRODUCTION!".[^s06]

## 5. BitVMX and BitVM3: competing and successor designs

**BitVMX** (Sergio Demian Lerner et al., May 2024; RootstockLabs and Fairgate) designs a **general-purpose virtual CPU** verified in Bitcoin Script. It can be instantiated for standard architectures like RISC-V or MIPS, giving broad compatibility unlike BitVM1's non-standard single CPU.[^s05] The key difference is its data structures: the paper states that "unlike BitVM1, our approach does not require the creation of Merkle trees for CPU instructions or memory words" — using **hash chains** of program traces with memory-mapped registers and n-ary search to locate errors.[^s05] It also drops the signature-equivocation requirement and adds a **message-linking protocol** that emulates stateful contracts by sharing state across transactions. "BitVMX can be instantiated to balance transaction cost vs round complexity, prover cost vs verifier cost."[^s05]

**BitVM3** (Robin Linus, July 2025) changes direction. Where the prior two versions attempted *on-chain* computation in Bitcoin Script, BitVM3 moves computation *off-chain* using **garbled circuits**, a cryptographic technique from the 1980s.[^s10][^s11] As a result, worst-case dispute cost falls from multi-megabyte transactions to roughly 2.5 kvB (about $5 at current fees) — a "nearly 1000× improvement" — while also simplifying the transaction graph.[^s11] BitVM3 is, however, a relatively new design with no evidenced production bridge deployment yet.

## 6. Trust model, deployments, and critiques

BitVM bridges lower the trust assumption from honest-majority (t-of-n) to **existential honesty (1-of-n)** — only one active, rational operator is needed while the rest may be malicious.[^s03][^s09] Yet nearly every source frames this as "**trust-minimized**," not "trustless."[^s08][^s09]

The sharpest critique concerns **capital formation and liveness**. A BitVM bridge is technically closer to an optimistic *reimbursement* system: operators front their own BTC to process user withdrawals and recover it later from the deposit. In Decrypt's independent reporting, Tyler Whittle argues that "BitVM bridges treat capital formation as trivial. But the bridge protocol is not well defined until it describes HOW this upfront capital is raised."[^s08] Taproot Wizards co-founder Eric Wall turned skeptical after learning the withdrawal details, reporting "I just got banned from the BitVM builders chat for asking more questions."[^s08] On the other side, BitVM rollup developer Edan Yago counters that withdrawal limits matched to operator liquidity and multiple operator sets can mitigate the problem.[^s08] The design creates a liveness dependency in which all operators must remain functional and solvent, raising denial-of-service risk during demand spikes.[^s08]

The capital-efficiency problem is corroborated by independent technical analysis: operators must stake funds covering Disprove costs *upfront*, accumulating with the number of operators × withdrawal requests and locked until bridge-out completes — which Alpen labels "an active area of research."[^s07] That security bonds must be provisioned at setup time inside pre-signed transaction graphs increases capital lockup and operating cost.[^s07] Critical write-ups such as "BitVM Bridges Considered Unsafe" (Whittle, Rijndael) make the same point.[^s12]

Even so, deployment is underway. Citrea put its BitVM-based bridge **Clementine** on testnet in 2025, reported as "the first complete BitVM bridge design."[^s13] Bitlayer launched a **BitVM Bridge mainnet beta** on 2025-07-15, stating "the Mainnet Beta is now live — and this is only the beginning," using major mining pools (Antpool, F2Pool, SpiderPool) as validators.[^s09] These remain testnet and mainnet *beta* respectively, however — too early to call a mature, high-TVL production bridge. _(early signal)_

## 7. Limitations

- **Fast-moving target.** BitVM evolved BitVM1→2→X→3 in under two years. Any "current state" claim (script sizes, transaction counts, deployment status) may be stale within months; figures here are pinned to mid-2026 sources.[^s05][^s10]
- **Moving numbers.** The Groth16-in-Script size has been quoted at 7 GB → ~3 GB → ~1.2 GB → ~1 GB. Treat any specific figure as approximate and trending down.[^s04][^s06][^s07]
- **Vendor/preprint-heavy evidence.** The strongest technical detail is project-hosted (bitvm.org), preprint (arXiv, IACR), or vendor-blog (Bitlayer, Alpen); peer review is limited. The BitVMX arXiv paper and independent journalism/critique (Decrypt, Whittle) are the most independent anchors.[^s05][^s08]
- **PDF access.** The BitVM2 bridge paper (s04) and BitVM3 paper (s10) were not read as full text (marked `access_limited`); their claims are cross-checked via the HTML project page (s03), the reference repo (s06), and secondary explainers (s07, s11).
- **Maturity.** What is confirmed reaches Citrea testnet and Bitlayer mainnet *beta*. A fully-audited, high-TVL mainnet BitVM bridge is not established as of 2026-06, and production-readiness claims are treated conservatively.[^s09][^s13]
