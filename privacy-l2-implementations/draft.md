## Introduction

"Privacy-enabled L2" is an ambiguous label. Almost every Ethereum L2 today uses zero-knowledge proofs *somewhere*, but the proofs almost always exist to **scale** computation, not to **conceal** it: a vanilla zkEVM like Linea, Scroll, or Taiko verifies that a batch of EVM transitions is correct, while still posting the inputs and outputs of those transitions in cleartext to L1.[^s13] What this report cares about is the narrower class of L2s that deliver *confidential transfers* — protocols where transaction amounts, senders, receivers, or even contract calls are hidden from third parties by design.

In 2026, that narrow class consists of three meaningfully different architectures:

1. **Privacy-native execution layers** — privacy is a property of the chain itself, with private state, private contracts, and client-side proving baked in. The exemplar is **Aztec Network**.[^s01][^s02]
2. **Execution layers with optional private state** — accounts, notes, and balances can be public or private per-object, and clients generate their own proofs for private state transitions. The exemplar is **Polygon Miden**.[^s06][^s09]
3. **Shielded-pool smart-contract systems deployed on existing L2s** — privacy is added on top of an otherwise transparent L2 via a deployed contract set that shields and unshields assets. The exemplar is **Railgun**, which runs on Ethereum mainnet and on Arbitrum and Polygon.[^s10][^s12]

The rest of the report walks each of the three architectures, names the implementations, and ends with a comparative cheat sheet for integrators choosing among them.

## Background — why standard zkEVMs are not enough

Standard zkEVMs (Linea, Scroll, Taiko, Polygon zkEVM, zkSync Era) use ZK proofs to compress and verify execution of EVM bytecode. Their privacy story is structural: a third party that fetches the L2 block data still sees the calldata, the storage diffs, and the values that flowed between accounts. As one industry comparison summarises, "their privacy aspects relate to inherent zero-knowledge proof mechanisms used for scalability rather than transaction confidentiality features."[^s13] To get confidential transfers you have to either change the execution model (Aztec, Miden) or layer a shielded-pool contract on top (Railgun).

The deeper architectural argument that Aztec, in particular, leans on is that "the EVM's transparent, queryable state makes privacy essentially impossible without compromising security" — privacy has to be designed into the contract layer, not bolted on.[^s03]

## Aztec Network — privacy-native zkRollup

Aztec is the most aggressive design point in the survey: an L2 whose contract layer treats private and public state as composable, not as two separate worlds.[^s01][^s05]

**Asset model.** Aztec represents assets as **notes** rather than balances. A note is a UTXO-shaped object that records ownership and value. A transfer consumes input notes and emits new output notes; the ZK proof shows that input value equals output value (the classic "join-split") without revealing either side. Spent notes are recorded in a **Nullifier Tree**; all notes ever created are recorded in a **Note Tree**; Merkle roots from both trees are posted to Ethereum L1 for settlement.[^s01]

**Execution split.** Transactions are split between two execution environments:[^s01][^s03]

- The **Private Execution Environment (PXE)** runs **client-side** in the user's browser. It holds keys, manages encrypted notes, executes private contract functions, and emits the ZK proof. The sequencer never sees the private inputs.
- The **Aztec Virtual Machine (AVM)** runs on sequencers and executes public contract functions. Sequencers re-execute and attest, public functions get validator "training wheels", and private actions can compose with public logic in the same contract.

**Developer surface.** Smart contracts are written in **Noir**, an open-source Rust-like language for ZK programming, with `private` and `public` function modifiers and a contract framework (`aztec.nr`) that mediates between PXE and AVM.[^s03][^s04] Noir 1.0 was released as a pre-release in February 2026.[^s04]

**Network state in 2026.** Aztec ran a community-first token sale in February 2026 raising $61M from 16,700+ participants.[^s04] The **Alpha Network** launched on 31 March 2026 as a privacy-native L2 with private smart contracts.[^s04][^s05] However, on 17 March 2026 the team disclosed a **critical vulnerability in the proving system** that could lead to severe protocol disruption and theft of user funds; the fix is packaged into the **v5 release planned for July 2026**.[^s04] _(early signal — single industry source; users should treat any current security guarantee as conditional on v5 shipping.)_

## Polygon Miden — execution layer with private notes

Miden takes a different design route: rather than making the *whole chain* private, it makes privacy a **per-object choice** inside an actor-model execution layer.[^s06][^s09]

**Account and note model.** Each account is an independent state machine (an actor), and **notes** are the asynchronous messages between actors that move assets or data.[^s06] Notes are stored in **Merkle Mountain Ranges**, accounts in **Sparse Merkle Trees**, and **nullifiers** in their own Sparse Merkle Tree.[^s06] Each note carries an inline **script** that defines the conditions under which the note can be consumed; the script is executed as part of the transaction and the result is included in the proof.[^s07]

**Public vs private notes.** Notes come in two flavours:[^s06]

- **Public notes** record their full content on-chain.
- **Private notes** record only the hash; the actual content is held off-chain by the holder.

This is the key knob: the same network supports transparent payments and shielded payments without forking the protocol. Accounts can likewise be public, private, or encrypted variants.[^s06]

**Proving model.** Miden is **STARK-based** and supports **client-side proving**: users locally generate proofs for their own state transitions, "without having to disclose the state to the network."[^s09] Transactions are then **recursively aggregated** into batches and the batches into blocks, with the final block proof posted to Ethereum.[^s06][^s07] The marketing page additionally claims **post-quantum** crypto and a **recursive proof** pipeline.[^s08]

The pragmatic consequence: an application can run public flows for things that should be auditable (price discovery, governance) and private flows for things that should not (payroll, treasury, individual orders), inside the same chain and the same proof system.

## Railgun — shielded-pool smart contracts on existing L2s

Railgun does not run its own chain. It deploys a coordinated **set of smart contracts** on multiple chains — Ethereum mainnet, **Arbitrum**, **Polygon**, and others — that maintains a shielded pool of ERC-20s.[^s10][^s12] Users deposit ("shield"), transact entirely inside the pool using ZK proofs, and withdraw ("unshield"), and the smart contracts on each chain enforce the shielded-pool invariants. From the L2 operator's perspective, this is just another deployed application.

**Fee model.** Railgun's 2026 fee structure is a flat **0.25% fee for shielding and unshielding transactions**, plus optional **relayer fees** (commonly a ~10% premium over current gas prices) if users want to pay gas out of their shielded balance.[^s11] Internal shielded-to-shielded transfers carry whichever chain's base gas applies, plus the protocol economics.

**Private Proof of Innocence (PPOI).** Railgun's 2026 signature feature is PPOI, which lets a user "cryptographically prove their funds don't originate from blacklisted addresses without revealing identity or transaction history."[^s11] This is the compliance angle: it tries to give institutions a way to use a shielded pool without losing the ability to demonstrate non-association with sanctioned activity.

**Trade-offs.** Compared with Aztec, Railgun keeps liquidity on the same L1/L2s where it already lives and so onboards faster, but it cannot hide *contract calls themselves* — only token transfers within the pool. Aztec, by being an L2 in its own right, can hide both, but pays for that by needing its own bridges, sequencers, and ecosystem.[^s10][^s12]

## Comparison and implementation guidance

| Axis | Aztec | Miden | Railgun |
|---|---|---|---|
| Position in stack | Standalone privacy L2 | Standalone execution L2 with per-object privacy | Shielded-pool smart contracts on existing L2s |
| What is hidden | Amounts, senders, receivers, contract calls | Note contents and account state, per-object choice | Token transfer details within the shielded pool |
| Proof system | zkSNARKs (Noir circuits + PXE) | STARKs (recursive, client-side option) | zkSNARKs (in-contract verifier) |
| State model | Notes + Nullifier Tree, dual private/public state | Actor accounts + UTXO-style notes, public/private notes | Shielded UTXOs inside the pool contracts |
| Proving location | Client-side via PXE | Optional client-side; otherwise operator | Client-side for the user's spend |
| Developer language | Noir (`aztec.nr`) | Miden Assembly (MASM-family) | Solidity callers + Railgun SDK |
| Compliance posture | Private by default; no native sanctions story | Per-object choice supports both | PPOI for non-association proofs |
| Live status (May 2026) | Alpha Network live since 31 March 2026, but under known critical proving-system vuln until v5 (July 2026) | Public testnets and live deployments via Miden code base | Live on Ethereum, Arbitrum, Polygon and other EVMs |

**Implementation guidance.** Choose based on what the application actually needs to hide:

- If the *application itself* must be private — private order books, confidential lending positions, identity-bound but unlinkable interactions — the privacy-native model (Aztec) is the only one of the three that hides contract calls in addition to transfers, but accepts (a) a separate chain with its own bridges and (b) a current security caveat until v5 ships.[^s01][^s04]
- If the application is mostly transparent but needs *selective privacy* for some flows (payroll, treasury, B2B settlements) inside an otherwise auditable system, **Miden's per-note public/private choice** maps directly to that shape.[^s06][^s07]
- If the application already lives on a transparent L2 and the requirement is *confidential token movement only*, **Railgun's shielded-pool contracts** are the lowest-integration path and offer PPOI when compliance is in scope.[^s10][^s11]

Fee-wise, in early 2026 a third-party comparison reports Aztec internal private transfers under $0.10 (vs $5–$15 to bridge in from L1), and Railgun's flat 0.25% plus L2 gas; Miden's economics depend on the specific deployment and the prover.[^s11]

## Limitations

- All three implementations are moving targets in 2026. Aztec, in particular, currently runs under a publicly disclosed critical proving-system vulnerability; the security narrative will look different after v5.[^s04]
- The Miden architectural detail in this report leans on a third-party deep dive (Obscura) plus a HackMD analysis; the project's own homepage at fetch time disclosed only marketing-level detail. Treated as well-sourced but not yet whitepaper-anchored in this report.
- The report excludes non-Ethereum-L2 privacy chains (Penumbra, Namada, Aleo, Zcash), which are sometimes referenced in industry coverage alongside L2s but are L1s or app-chains and therefore out of scope.[^s14]
- Fee numbers are point-in-time and come from a single 2026 third-party comparison; they will move with proving-cost improvements and L2 gas dynamics.[^s11]

## Abstract

In 2026, "privacy-enabled L2" splits into three architectures rather than one. **Aztec Network** is a privacy-native zkRollup whose contract layer (Noir, `aztec.nr`) treats private and public state as composable, models assets as notes with a Note Tree and Nullifier Tree posted to Ethereum, runs private execution client-side in a Private Execution Environment (PXE), and runs public execution on sequencers in the Aztec VM; its Alpha Network went live on 31 March 2026 but operates under a publicly disclosed critical proving-system vulnerability slated for fix in v5 (July 2026), with a $61M community TGE and Noir 1.0 pre-release as 2026's adoption signal. **Polygon Miden** is a STARK-based execution layer with an actor-model account system and a UTXO-style note system; notes can be public (full content on-chain) or private (only the hash on-chain), each carries a script enforcing consumption conditions, and proofs are generated client-side and recursively aggregated into batches and blocks before settling on Ethereum, giving per-object privacy without forcing the whole chain to be opaque. **Railgun** is a shielded-pool smart-contract system deployed on Ethereum mainnet plus L2s including Arbitrum and Polygon, charges a flat 0.25% shield/unshield fee with an optional relayer-paid gas mode at ~10% gas premium, and shipped Private Proof of Innocence (PPOI) in 2026 as a way to prove shielded funds did not originate from blacklisted addresses without revealing identity. The three sit at different points on the same trade-off curve: deeper privacy and a separate execution layer (Aztec), per-object privacy inside a normal execution layer (Miden), and shielded-pool privacy added on top of existing transparent L2s (Railgun). Implementers should choose by what actually needs to be private (contract calls, selective flows, or only token movement) and by where their liquidity already lives.
