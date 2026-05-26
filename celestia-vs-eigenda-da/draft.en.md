## Introduction

The modular blockchain paradigm decouples execution, consensus, settlement, and data availability (DA) into separable layers rather than concentrating them in a single monolithic chain. Celestia's foundational blog argues that consensus should be reduced to "ordering transactions and guaranteeing their data availability," with execution validity living in upper layers[^s03]. Within this paradigm Celestia and EigenDA are the two most prominent "general-purpose DA layers," but they start from different architectural premises: Celestia is a standalone proof-of-stake chain secured by the TIA token[^s01][^s04], while EigenDA is an Actively Validated Service (AVS) with no native consensus, secured by ETH restaked through EigenLayer[^s05][^s17]. This report compares their technical foundations, trust models, throughput, and operational posture.

## Background: The Data Availability Problem

The DA problem asks how a light client can confirm that block data was actually published without trusting full nodes. Al-Bassam, Sonnino, and Buterin (2018) formalized that combining fraud proofs with probabilistic sampling lets light clients "eliminate the honest-majority assumption"[^s08]. This result underpins modern Data Availability Sampling (DAS).

DAS lays block data out as a k×k square, erasure-codes it to a 2k×2k square via Reed–Solomon, and has light clients randomly sample coordinates so that any meaningful withholding is detected with high probability[^s01][^s13]. Reed–Solomon's mathematical structure guarantees that enough surviving chunks suffice to reconstruct the original data[^s01].

Orthogonal to DAS, KZG polynomial commitments (Kate, Zaverucha, Goldberg, 2010) give "constant-size" commitments and openings — both the commitment and an opening proof fit in a single elliptic-curve group element[^s09]. KZG underlies the chunk-correctness proofs in EigenDA and the blob commitments in Ethereum's danksharding roadmap[^s05][^s10].

## Celestia: Architecture and Technical Foundation

Celestia is a Cosmos-stack PoS chain. Its consensus engine is `celestia-core`, a fork of CometBFT (the Tendermint successor), with validators staking the TIA token[^s16][^s01]. Mainnet beta launched on 31 October 2023, accompanied by a TIA airdrop to 580,000 addresses[^s04].

Celestia's data structure identity is the Namespaced Merkle Tree (NMT). Each internal node carries the min/max namespace range of its descendants; leaves take the form `<NsID>||<Message Data>` sorted by namespace[^s19]. As a result, a rollup can download only the data for its namespace and still prove completeness[^s01].

At the block level, Celestia treats the data as a k×k square, erasure-codes it into a 2k×2k square, and commits to row and column roots in the Tendermint block header[^s01]. Light nodes verify DA themselves via random sampling, removing the need to trust full nodes[^s13][^s11].

Ethereum L2s reach Celestia DA through **Blobstream** (renamed from Quantum Gravity Bridge). Blobstream relays validator-signed attestations of Celestia's data root to an on-chain light client on Ethereum; the production implementation is now an SP1-based ZK light client that verifies Tendermint consensus and the data commitments[^s02][^s11].

## EigenDA: Architecture and Technical Foundation

EigenDA is not a chain; it is an AVS on top of EigenLayer. ETH restakers register as EigenDA operators that run DA nodes, and security flows from EigenLayer's shared-security model "that allows the same stake to be utilized across a variety of applications"[^s05][^s17]. EigenDA went live on Ethereum mainnet on 9 April 2024 alongside EigenLayer Stage 2[^s06].

The dispersal pipeline is the canonical way to read EigenDA[^s05][^s10][^s12]:

1. The rollup sequencer uploads a blob to the **Disperser**.
2. The Disperser Reed–Solomon erasure-codes the blob into chunks — V2 (Blazar) expands one blob into 8,192 chunks with 8× redundancy, where any 1,024 chunks suffice for recovery — and generates a KZG commitment plus multi-reveal proofs for those chunks.
3. Chunks are dispersed to EigenDA operators; each operator verifies its chunks against the KZG commitment and returns a BLS signature.
4. Aggregated BLS signatures form a Data Availability Certificate (DA-Cert) that is posted to an Ethereum L1 contract; rollups verify the certificate inside their own contracts.

EigenDA therefore has no native consensus — the final DA guarantee resolves at the Ethereum settlement layer when the attestation is accepted[^s12][^s17]. Instead of light-client DAS, EigenDA uses a retrieval-based model in which consumers fetch chunks directly and attestation vouches for the survival of enough chunks[^s07] _(interpretive)_.

EigenDA V2 (codename Blazar) advertises **100 MB/s** throughput by splitting a lightweight control plane from a high-bandwidth data plane _(vendor-stated)_[^s10]. EigenLayer slashing went live on mainnet on 17 April 2025, formalising that "an Operator's staked funds can be burned if they fail to meet the commitments they've agreed to with an AVS"[^s18].

## Comparative Analysis

**Trust model.** Celestia's primary security assumption is the honesty of its own TIA-staked validator set[^s01][^s11]. EigenDA has no validator set of its own and instead leans on the restaker pool that signs attestations and submits them to Ethereum L1[^s12][^s17]. The two models differ structurally in *where* the securing capital comes from — Celestia's TIA market cap versus ETH-denominated restake — and that difference is the cleanest axis of comparison _(interpretive)_[^s05][^s07].

**Verifiability.** Celestia treats light-client DAS as the central device for shrinking trust assumptions[^s01][^s13]. A competing-vendor analysis from Avail labels EigenDA closer to a Data Availability Committee model, arguing that end users "can only confirm that committee members agreed to store data"[^s07]. EigenLabs frames the same system as a restaking-secured decentralized service[^s05][^s17]. These two framings disagree and are presented here as a disagreement rather than silently resolved.

**Throughput.** Celestia launched mainnet at 2 MB blocks, has since enlarged to 8 MB, and at a 6-second block time runs around 1.33 MB/s today[^s04][^s07]. EigenDA V2 (Blazar) advertises 100 MB/s as a target _(vendor-stated)_[^s10]. Both numbers reflect different measurement regimes and security assumptions; direct numeric comparison should be read with that caveat _(interpretive)_.

**Use of polynomial commitments.** Both systems use KZG-family commitments but in different roles. Celestia layers DAS and (when needed) fraud-proof-style integrity defences on top of 2D Reed–Solomon and NMT; EigenDA uses KZG commitments as the core correctness proof for chunk dispersal[^s09][^s05][^s10].

**Bridging and integration.** Celestia surfaces DA on EVM chains through Blobstream (now an SP1-based ZK light client)[^s02][^s11]. EigenDA needs no separate bridge — DA-Certs are written directly to Ethereum L1 contracts[^s12].

## Discussion: Adoption, Trade-offs, Risks

On the adoption front, Celestia absorbed several EVM L2s in its first year, with Manta Pacific the most-cited early integrator[^s14] _(unverified — single source)_. EigenDA serves AVS-aligned rollups as well as multi-DA setups such as Manta's[^s07]. Reporting suggests both systems are integrated with major rollup frameworks (Arbitrum Orbit, OP Stack, Polygon CDK), but the precise count of live integrations varies across sources[^s07].

On the risk side, Celestia depends on the safety and liveness of its own validator set. L2BEAT's independent walk-through notes that DA guarantees can break if a dishonest supermajority finalises unavailable blocks while light nodes fail to reconstruct, or if Blobstream contracts are upgraded with zero delay[^s11].

EigenDA inherits EigenLayer's general risks. Slashing only activated on mainnet in April 2025, and because the model is per-AVS opt-in, EigenDA-specific slashing conditions and their real-world bite are still being settled[^s18]. The Disperser is also today operated as a single EigenLabs-hosted service; the advertised security model relies on subsequent decentralization of dispersal and on slashing becoming enforceable in practice _(early signal)_[^s05][^s10].

## Limitations

- The throughput and cost numbers in this report reflect the snapshot at writing. Both systems are moving fast (e.g. Celestia's Matcha/Fibre roadmap, EigenDA's V2/Blazar rollout) and several figures will likely change after publication[^s10][^s07].
- EigenDA-specific slashing parameters are only partially documented at the time of writing; the EigenLayer slashing primitive itself is live[^s18].
- The Manta Pacific–Celestia adoption story (`s14`) was access-limited at fetch time and is cited at headline level only. A primary press release or post-mortem would strengthen this claim.
- This report deliberately excludes other DA candidates (Avail, NEAR DA, EIP-4844 blobs) — comparing those is a separate study.

## Abstract

Celestia and EigenDA both call themselves "general-purpose DA layers," but they start from different architectural premises. Celestia is a standalone PoS chain that fuses CometBFT consensus, 2D Reed–Solomon erasure coding, Namespaced Merkle Trees, and light-client DAS into one coherent stack. EigenDA has no native consensus; it is an EigenLayer AVS that secures itself with restaked ETH, uses KZG commitments and BLS attestations, and posts DA Certificates directly to Ethereum L1. This report sets out (1) the DA problem and the theoretical primitives behind it — DAS, Reed–Solomon, KZG; (2) Celestia's consensus, data structures, and Blobstream bridge; (3) EigenDA's Disperser-Operator-attestation pipeline; and then compares the two systems across trust model, verifiability, throughput, use of polynomial commitments, and bridging, before discussing adoption, slashing, and operational risk. The substantive takeaway is not which system is "better" but that the difference in trust assumptions and the source of securing capital is the design difference.
