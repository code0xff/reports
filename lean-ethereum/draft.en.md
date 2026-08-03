## Abstract

Lean Ethereum is a protocol-redesign programme introduced by Ethereum Foundation researcher Justin Drake in a foundation blog post dated 31 July 2025. It is not a single EIP or hard fork but a decade-scale blueprint for rebuilding three layers — consensus, data, and execution — as "beacon chain 2.0", "blobs 2.0", and "EVM 2.0" respectively[^s01]. Two motivations are stated explicitly: the explosive rise of SNARKs and the looming quantum threat, with the programme's central thesis being that hash-based cryptography answers both at once[^s01].

Taking `leanroadmap.org` as its starting point, this report sets out the programme's definition, its pillars, its actual implementation state, its roadmap and governance, and the counter-arguments against it. The confirmed core facts are these. Validator signatures move from BLS12-381 to hash-based XMSS-family schemes (`leanSig`/`leanXMSS`), and the gap left by BLS's pairing-based aggregation is filled by STARK proofs produced in a purpose-built minimal zkVM (`leanVM`)[^s03][^s07][^s13]. Individual signatures grow from BLS's 96 bytes to roughly 2.5–3 kB[^s32][^s16], while the block-level aggregate proof compresses to a size independent of validator count — currently measured at around 200 KB[^s28]. Finality is targeted to fall from Gasper's current 64–95 slots to a handful of slots, with the 3-Slot Finality (3SF) paper as the academic anchor[^s04].

The gap between progress and promotional language is nonetheless wide. As of August 2026 no Lean-track change has reached mainnet, and the EIP list for the immediately pending hard fork, Glamsterdam, contains no post-quantum items[^s31]. The fast-finality protocol is still unchosen: live devnets run LMD-GHOST plus 3SF-mini, and the next devnet is slated to try a Goldfish plus RLMD-GHOST combination[^s28][^s29]. `leanSig` states of itself that it is unaudited research code[^s06], and `leanVM` has not yet reached NIST Level 1 security[^s13]. Layered on top is a dispute about urgency itself. The Ethereum Foundation's own position is that the threat "is not imminent"[^s17] and an independent cryptographer holds that a practical quantum computer this decade is "highly unlikely"[^s18], while some practitioners argue that a 3–4 year plan is in fact **too slow**[^s19].

## 1. Introduction

Ethereum's consensus layer has accumulated capability across several hard forks since the Beacon Chain launched. The protocol got stronger, but three structural debts came with it. First, finality is slow: Gasper typically requires 64–95 slots, meaning that even under ideal network conditions proposers build on a non-finalized chain extending at least 64 blocks[^s04]. Second, validator signatures depend on BLS12-381 pairings and are therefore exposed to quantum algorithms[^s03][^s17]. Third, the specification's own complexity has grown, raising the cost of formal verification and of writing a new client[^s21].

Lean Ethereum proposes to pay down all three by redesigning at layer granularity rather than by patching. The term's provenance is clear: Justin Drake's post titled "lean Ethereum" on the EF blog, 31 July 2025, is the original, and he describes it as both "a blueprint for hardening and scaling" and "an aesthetic. An art form. A craft."[^s01]. When numerous outlets reported in July 2026 that "Vitalik announced Lean Ethereum"[^s26][^s27], they were describing Buterin's roadmap update and his posting of *The Extremely Lean Chain* in that same period, which should be distinguished from the coinage[^s09].

There is also a scope difference in how the term is used. The EF blog's umbrella concept has three pillars: **lean consensus / lean data / lean execution**[^s01]. By contrast `leanroadmap.org`, this report's starting point, is a site scoped to the consensus workstream, and organises it under four headings: **Lean Consensus / Lean Cryptography / Lean Governance / Lean Craft**[^s02]. The three pillars and the four headings are not competing taxonomies but tables of contents at different levels — which is why a reader looking for the data and execution layers will not find them on `leanroadmap.org`.

This report proceeds through (1) why redesign now, (2) the technical content of each pillar, (3) the implementation state as evidenced by specs, devnets, and clients, (4) the roadmap and fork ordering, and (5) counter-arguments and risks.

## 2. Background: why "Lean"

### 2.1 Beam Chain as the direct ancestor

Lean Consensus is not a newly invented plan. Its direct predecessor is "Beam Chain", proposed by Justin Drake at Devcon in Bangkok in November 2024[^s12][^s33]. That talk set out 4-second blocks, a lower minimum validator stake, and "chain snarkification" via zkVMs as the route to post-quantum safety, on a five-year roadmap with completion by 2029–2030[^s33]. The Lean Consensus 2026 plan document makes the lineage explicit, writing "Lean Consensus (formerly Beam Chain)"[^s08], and the Zig client Zeam describes itself in its own repository as an implementation of the Beam Chain unveiled at Devcon 7 Bangkok[^s22]. Lean Consensus is thus Beam Chain renamed and extended, and Lean Ethereum is the umbrella that stretches it to the data and execution layers.

### 2.2 The quantum threat model and the BLS dependency

Ethereum's quantum-vulnerable surface resolves into four places: the BLS signatures used to aggregate validator votes, the KZG commitments underwriting rollup data availability, secp256k1 ECDSA on ordinary accounts, and pairing-based SNARKs at the application layer[^s17]. All four rest on elliptic-curve discrete logarithms or pairings and are therefore within reach of Shor's algorithm; accounts whose public keys are already exposed on-chain are the most direct case[^s17].

What Lean Cryptography targets is the first of these — BLS in the consensus layer[^s03][^s17]. KZG in the data layer is to be replaced separately by STARK-based or lattice-based commitments, and ECDSA at the account layer has a path via account abstraction (EIP-8141) that lets individual accounts switch without waiting for the whole protocol[^s17]. For KZG the specific hazard is that a quantum computer recovering the secret behind the trusted setup could forge false proofs; one secondary analysis cites a March 2026 Google Quantum AI estimate of roughly 1,500 logical qubits[^s26]. ethereum.org states that breaking Ethereum's current cryptography would require roughly 1,200 logical qubits, potentially arriving "sometime around the end of this decade at the earliest"[^s17].

### 2.3 Snarkification: why the protocol must become provable

The second motivation has nothing to do with quantum computing. As SNARK/STARK verification cost decoupled from execution cost, making the consensus rules themselves a proving target became a practical choice[^s01]. Hash-based cryptography satisfies both demands at once: hash functions are quantum-resistant and are also cheap to verify inside an arithmetic circuit. That is the basis for Drake calling hash-based cryptography "a compelling, unified answer"[^s01]. This thesis is the programme's own claim, not an independently established result _(vendor-stated)_.

### 2.4 Treating simplicity as a security property

The design principles are stated as "Minimalism. Modularity. Encapsulated complexity. Formal verification. Provable security."[^s01], which `leanroadmap.org` organises as a separate heading, Lean Craft[^s02]. This is an epistemic goal rather than a performance one: a small, modular specification can be formally verified, and once verified the residual risk localises to implementation bugs. An independent pattern catalogue summarises the programme's aim as "a consensus protocol that is stable for decades, resilient against quantum adversaries, and verifiable on minimal devices"[^s21]. This is an interpretive judgement, and as §6 shows, the same catalogue also classifies the single-large-fork strategy as a risk[^s21].

## 3. Architecture: three pillars and four headings

### 3.1 Lean Consensus — beacon chain 2.0

The EF blog's definition is "hardened for ultimate security and decentralization, plus finality in seconds"[^s01]. The academic anchor is the 3-Slot Finality paper by D'Amato, Saltini, Tran, and Zanolini, which combines a partially synchronous finality gadget with two dynamically available consensus protocols to build an ebb-and-flow protocol "achieving finality within three slots after a proposal"[^s04].

But **the roadmap's target and the current specification must be kept apart.** `leanroadmap.org` foregrounds 3SF[^s02], while the lean consensus implementation actually running uses LMD-GHOST for fork choice and 3SF-mini for finality[^s29]. Slots are 4 seconds, divided into five 800 ms intervals: block proposal and fork choice in interval 0, attestation creation in 1, safe-target recalculation in 3, and attestation activation plus head update in 4[^s29]. The safe target is computed at a ⌈2V/3⌉ supermajority threshold and fed into 3SF-mini[^s29].

For devnet 6 the leading candidate is to replace that combination with **Goldfish + RLMD-GHOST + a trailing finality gadget**[^s28]. Goldfish, proposed in the 2022 paper by D'Amato, Neu, Tas, and Tse as an LMD-GHOST replacement, is secure in the sleepy model, reorg-resilient, and supports confirmation latency independent of the desired security level; the paper argues Goldfish is "structurally similar to LMD GHOST, providing a credible path to adoption in Ethereum"[^s24]. Per a client team's account, Goldfish considers only votes from the current slot while RLMD-GHOST counts votes from the last N slots as an intermediate form[^s28].

**The fast-finality protocol is undecided as of August 2026.** The 2026 plan lists Live-Simplex, Live-Minimmit, and ARFG as candidates and treats folding the chosen design into the official specification as a task for the year. The consensus structure is decomposed into three layers: ChFast (Goldfish / GHOST-Eph) for block production, ChMaj (RLMD) for the majority-filtered justified chain, and ChFin (BFT) for economic finality and accountability[^s08]. One secondary analysis states that finality becomes "about 8 seconds via Minimmit" and that the fault-tolerance threshold falls from ~33% to 17%[^s26]; the Minimmit paper itself never mentions Ethereum or lean consensus, and its own bound is n ≥ 5f+1, i.e. f < 20%[^s25]. The 8-second and 17% figures have no primary confirmation _(unverified — single source)_.

The consensus track also includes Attester-Proposer Separation (APS), which decouples the proposer and attester roles, and validator exit-queue improvements; the P2P track covers a Gossipsub v2.0 specification and set-reconciliation protocols to sustain 4-second block times[^s02].

### 3.2 Lean Cryptography — signatures after BLS

The replacement target and its substitute are unambiguous in primary sources: `leanXMSS` is the hash-based signature scheme for validator authentication, `leanSig` its Rust implementation, and `leanVM` the minimal zkVM used for aggregation[^s03]. The academic basis is the paper by Drake, Khovratovich, Kudinov, and Wagner, which analyses a generalized family of XMSS variants in a single framework to minimise security loss and ease parameter selection. Notably it avoids random oracles, defining explicit standard-model requirements on the underlying hash functions — which has the effect of giving cryptanalysts clearly defined targets[^s07].

Aggregation is the pivot of the design. Under BLS, aggregation was a cheap curve-point addition. Hash-based signatures have no such property, so a STARK proves that N individual XMSS signatures are all valid and **that proof is used as the aggregate signature**[^s16]. The problem thereby migrates from algebraic aggregation to proof-system performance.

The concrete figures: Ethereum's BLS12-381 signature is a G2 point at 96 bytes and its public key a G1 point at 48 bytes[^s32]. An XMSS/`leanSig` signature, by contrast, is roughly 2,500–3,000 bytes with an 8-element public key, targeting under 0.5 ms for both signing and verification, with an 8-year key lifetime[^s16]. The aggregate proof is reported at a constant size of roughly 100 KB[^s16]. The `leanVM` repository's own benchmarks report 1,426–1,550 XMSS aggregated per second at WHIR rate 1/2, with proof sizes of 122–327 KiB depending on configuration[^s13]. All of these figures are project-hosted benchmarks or restatements of them; no independent re-measurement was found _(vendor-stated)_.

The proof system combines WHIR (multilinear variant), SuperSpartan for AIR constraints, and Logup bus-based lookups, over a degree-5 extension of the KoalaBear prime (p = 2³¹ − 2²⁴ + 1)[^s08][^s13]. Hash digests are 4 field elements (~124 bits), and **provable** security is about 124 bits under the Johnson bound, with anything beyond that holding only under the proximity-gaps conjecture[^s13]. The repository states plainly that NIST Level 1 (128-bit classical / 64-bit quantum) has not been reached and that closing the gap requires either larger digests (5 elements) or a different prime (a Goldilocks branch under development)[^s13].

The hash function is set to Poseidon2 for circuit efficiency[^s08]. Because algebraic hash functions carry a shorter review history than SHA-2 or keccak, the EF runs a separate Poseidon Cryptanalysis Initiative — $150,000 in 2026 bounties, $130,000 in 2025, and a $992,000 collision prize valid until January 2029 — managed by the EF Poseidon Group led by George Kadianakis, Dmitry Khovratovich, and Antonio Sanso[^s10].

And the programme is working: CICO solutions to several round-reduced instances were verified across April, May, and July 2026, and the Zero-test problem was broken up to RF=6, RP=12 (claimed 27 July 2026)[^s10]. One paper reports solving three Poseidon2-31m and Poseidon2-31k instances with a new resultant-based approach, plus two Poseidon-256 instances[^s30]. Round-reduced instances falling is the bounty design working as intended, but it also means the security margin of the deployed parameters is still being priced.

One secondary analysis states that recent cryptanalytic results prompted a shift away from depending on a single hash function[^s26]; no primary source confirms a decision to move off Poseidon2. `leanSpec` still ships Poseidon subspecifications[^s05] and the 2026 plan still names Poseidon2[^s08] _(unverified — single source)_.

### 3.3 Lean Data — blobs 2.0

The primary definition is a single sentence: "post-quantum blobs, plus granular blob sizing for a calldata-like developer experience"[^s01]. The core task is replacing KZG commitments with hash-based, quantum-resistant mechanisms, with STARK-based commitments cited as a leading candidate[^s17]. Because validators under PeerDAS sample only a fraction of the data rather than downloading all of it, Lean Data's goal is not to change user-facing latency or L1 finality but to grow rollup capacity without increasing every validator's download burden[^s26].

Of the three pillars, Lean Data rests on the thinnest evidence. No `leanData` repository or specification corresponding to `leanSpec`/`leanSig`/`leanVM` appears in the evidence collected, and the detail depends on secondary analysis.

### 3.4 Lean Execution — EVM 2.0

The definition is "a minimal, SNARK-friendly instruction set (possibly RISC-V), boosting performance"[^s01]. The word "possibly" matters: this is not settled. Press reporting presents RISC-V and `leanISA` as competing candidates, with the EVM surviving as a compatibility layer rather than an execution engine[^s27].

The operating principle is to replace re-execution with proof verification. Once verification cost becomes a constant independent of execution scale, throughput scaling decouples from verification cost. A community-authored ethresear.ch post describes the architecture as progressing from single-threaded execution to parallel execution committees organised by recursive SNARK aggregation ("execution trees")[^s11]. That post is community interpretation rather than EF authorship, and no EF-written Lean Execution design document was found within the scope of this gather.

### 3.5 The Extremely Lean Chain: a variant beyond the baseline

On 6 July 2026 Vitalik Buterin posted *The Extremely Lean Chain*, a variant that pushes past the baseline roadmap. The core idea is "pushing responsibility to stakers to manage and occasionally ZK-prove their state"[^s09].

The phases run as follows. Phase 1A replaces the 48-byte public key with a 5-byte deposit-tree index and removes withdrawal credentials from on-chain state. Phase 1B leaves only 6 bytes per validator on-chain (1 byte of effective balance plus a 5-byte public-key index). Balance updates happen not per epoch but through a daily proof: each validator generates "a STARK that walks through the chain since the previous day"[^s09]. Phase 2 adds privacy: validators present a fresh public key daily, identity re-randomizes each day, and the concept of a long-term validator index disappears entirely. Withdrawal addresses are hidden behind a hiding commitment of the form `hash(withdrawal_address, secret)`[^s09].

The open problems Buterin himself enumerates are equally explicit. Phase 2's daily re-registration implicitly excludes offline validators, so the inactivity-eviction mechanism must be revisited. Rational proposers have an incentive to censor balance-update proofs, so explicit proposer rewards or a FOCIL-like forced-inclusion device is required. Social slashing coordination "would have to be more explicitly wargamed". And privacy features may obscure centralisation rather than enable decentralisation[^s09]. At a scale of one million validators, more than 100 STARKs per slot arise, making aggregation mandatory[^s09].

## 4. Implementation state

### 4.1 Specifications and repositories

`leanSpec` is an executable specification repository written in Python 3.12+ with Pydantic models, covering protocol definitions and fork logic, cryptographic subspecifications (Poseidon, KoalaBear, XMSS), SSZ serialization, networking, state transition, and fork-choice rules. At the time of access it was actively maintained with 1,048 commits, 143 stars, and 80 forks[^s05]. `pq.ethereum.org` describes it as the executable specification used by roughly ten client teams[^s03].

On the cryptography side the work splits into `leanSig` (Rust, generalized XMSS) and `leanVM` (the minimal zkVM, formerly `leanMultisig`). `leanSig`'s README states that the code "has not been audited and is not meant to be used in production"[^s06]. That is honest self-description of research-stage code rather than a defect, but it is a fact that must accompany any reading of the roadmap's language.

### 4.2 The devnet sequence

The post-quantum devnets are numbered and sequential, each adding one capability.

- **pq-devnet-0** (October 2025): completed at the Cambridge PQ Interop on 4–6 October 2025, with Ream (Rust), Zeam (Zig), and Quadrivium/Qlean (C++) proving P2P cross-client interoperability and messaging semantics[^s15][^s02].
- **pq-devnet-1**: the goal was to implement `leanSig` post-quantum signing and verification in the clients, with naive concatenation aggregation and baseline performance metrics. The configuration was five validators, one per client instance, 4-second slots, and PQ parameters of 64 hash chains, chain length 8, max lifetime 2³², activation time 2¹⁸. Participating clients were Ream, Zeam, Qlean, Lantern, and Grandine, with the validator set fixed at genesis[^s14]. Sources disagree on timing: `leanroadmap.org` records December 2025[^s02] while Pier Two described a mid-November 2025 target[^s15].
- **pq-devnet-2** (January 2026): `leanMultisig` aggregation integrated[^s02].
- **pq-devnet-3** (February 2026): the aggregator role separated and a signature-propagation protocol established[^s02].
- **pq-devnet-4** (targeted March 2026): recursive aggregation via `leanVm`[^s02].
- **pq-devnet-5**: block-level aggregation proof and Goldfish fork choice[^s02].

Here the roadmap snapshot and client-side reality diverge. `leanroadmap.org` marks devnet 4 as active and devnet 5 as merely planned[^s02], but one client team (ethlambda / LambdaClass) reports that as of 16 June 2026 devnet 5 was implemented and interop devnets were running. What follows rests on that single team's report and is not a programme-level confirmation[^s28]. On that account devnet 5's key achievement was replacing per-attestation aggregation with a single block-level proof, dropping a block carrying maximum attestations "from several MBs to around 200KB"[^s28]. This is the most concrete measured support for the constant-size aggregation claim in §3.2.

### 4.3 The multi-client strategy

Lean Consensus is being built as several independent implementations in different languages rather than a single reference client. The eight teams `leanroadmap.org` lists are Ream (Rust, ReamLabs), Zeam (Zig, BlockBlaz), Qlean-mini (C++, QDRVM), Lantern (C, Pier Two), ethlambda (Rust, LambdaClass), gean (Go, GeamLabs), Peam (Rust), and a Lighthouse fork (Rust)[^s02]. The devnet-1 document confirms actual participation by Ream, Zeam, Qlean, Lantern, and Grandine[^s14]. Local devnets are integrated through `lean-quickstart`, which brings up ethlambda alongside Zeam and Ream in a single command[^s23].

The 2026 plan's quantitative targets are five or more client implementations, 10,000 validators in a long-running devnet lasting more than a month, monthly devnet releases, 1,000 XMSS aggregated per second, a 2-to-1 recursive proof in roughly 200 ms, and propagation of a 256 KB SNARK in under one second[^s08].

### 4.4 Formal verification

`leanroadmap.org` reports the work of mathematically proving the security properties of the FRI, STIR, and WHIR proof systems in Lean 4 at 40% progress[^s02]. An independent catalogue likewise lists Lean 4 formal verification of signature aggregation and consensus logic as a component of the programme[^s21]. No verified-theorem artefact was located within the scope of this gather, and the progress figure is self-reported _(vendor-stated)_. It should also be noted that the coincidence between the Lean 4 theorem prover's name and "Lean Ethereum" is not established as causal by the evidence in this report.

### 4.5 Benchmarks against targets

The benchmark table on `leanroadmap.org` shows two things at once. `leanSig` verification cost is listed at "39% of target" — that is, roughly 2.5× faster than the target. Aggregate size, by contrast, overshoots: 234% of target in the simple configuration and 313–391% in the efficient one[^s02]. Aggregation throughput also varies by hardware, from 97% of target (M4 Max, efficient) down to 38% (i9-12900H)[^s02]. `leanVM`'s reported 122–327 KiB proof sizes[^s13] and devnet 5's measured ~200 KB[^s28] are consistent with that overshoot. In other words, **the signature scheme has beaten its target and the remaining bottleneck is aggregate proof size.**

One caveat is required. The site renders its absolute targets (μs, aggregations per second, KiB) client-side, and those values are not recoverable by scripted access. Only the ratios to target are therefore citable, and the absolute targets that form their denominators were not confirmed within the evidence of this report.

## 5. Roadmap and governance

### 5.1 The strawmap

At an internal workshop in January 2026 the EF presented a draft strategic framework it calls a "strawmap", placing seven protocol upgrades through 2029[^s20]. The priorities fall into three buckets — scaling, user-experience improvement, and hardening L1 against emerging threats — with quantum resistance at the top of the third[^s20]. ethereum.org sets completion of core post-quantum infrastructure at roughly 2029, distributed across "milestones I, J, L, M" and their planned hard forks[^s17]. `pq.ethereum.org` likewise targets 2029 for L1 protocol upgrade completion and states that full execution-layer migration takes additional years beyond that[^s03].

The five "north star" goals are fast finality on L1, gigagas throughput on L1, teragas-scale data availability for L2, post-quantum security, and native protocol-level privacy[^s27].

### 5.2 Fork ordering

- **Glamsterdam** (H2 2026): combines the Amsterdam execution-layer and Gloas consensus-layer upgrades. The headliners are EIP-7732 (ePBS) and EIP-7928 (Block-Level Access Lists), alongside EIP-8037/8038 (state creation and access gas costs), EIP-7954 (maximum contract size 24 KiB → 32 KiB), EIP-7997, EIP-7708, EIP-2780, and EIP-8159. The gas-limit target is 200 million, with mainnet tentatively 16 September 2026 and Sepolia activation tentatively 3 August 2026[^s31]. **This list contains no post-quantum or lean-consensus items**[^s31].
- **Hegotá**: the fork after Glamsterdam, introducing FOCIL (EIP-7805) as its censorship-resistance headliner; one report characterises it as "likely the final upgrade of the pre-Lean age"[^s26][^s27].
- **I\***: the first substantively Lean-oriented upgrade[^s26].
- **L\***: several forks later, the bundled Lean Consensus deployment[^s26].

The Lean track therefore lands **after** Glamsterdam, not inside it.

### 5.3 Throughput targets and their provenance

The primary figures are "1 gigagas/sec on L1: 10K TPS" and "1 teragas/sec on L2"[^s01]. Readings of the L2 figure diverge: one secondary analysis reads it as roughly 1 GB/sec, theoretically about 10 million TPS[^s26], while other reporting records roughly 1 million TPS[^s20]. This report takes the primary figure (1 teragas/sec) as its reference and leaves the interpretive divergence visible. Ethereum's current effective throughput is reported at 15–30 TPS[^s20].

### 5.4 Lean Governance: bundling

It is not incidental that `leanroadmap.org` makes its fourth heading "Lean Governance — strategic bundling of protocol upgrades for efficient delivery"[^s02]. The 2026 plan frames Lean Consensus as a redesign delivered in "a single hard fork"[^s08], and the independent catalogue likewise describes it as "targeting a single major fork"[^s21]. It is a choice that reduces coordination cost — but as §6 shows, the same property reads as a risk.

## 6. Analysis and counter-arguments

### 6.1 The real bottleneck is the proof system, not the signature

The near-term risk to Lean Cryptography is not the quantum safety of hash-based signatures; that part is comparatively solid. XMSS-family security reduces to standard-model properties of the hash function and requires no random oracle[^s07]. The problem is that with BLS's cheap algebraic aggregation gone, STARK proving takes its place, binding the consensus layer's real-time budget to the performance and security of the proof system[^s16].

Three pieces of evidence support this reading. First, aggregate size is the item still short of target, at 234–391%[^s02]. Second, that `leanVM` has not reached NIST Level 1 and that the remedy is either larger digests or a different prime means performance and security are competing over the same parameters[^s13]. Third, provable security stops at ~124 bits under the Johnson bound, with anything beyond resting on conjecture[^s13]. Pier Two points the same way: "Without cheap pairing based aggregation new merkle or hash multisig approaches or heavier per validator costs may alter reward and slash models."[^s15]. Add that round-reduced Poseidon2 instances are in fact falling during the bounty window[^s10][^s30], and the centre of cryptanalytic gravity sits in the hash-and-proof stack rather than the signature scheme. This is an interpretive judgement.

### 6.2 The alternative: lattice-based signatures are smaller

The programme presents hash-based signatures as effectively the only post-quantum option. They are not. NIST has standardised lattice-based signatures that are far smaller than XMSS-family schemes. On one comprehensive survey's figures, Falcon-512 is 666 bytes at Level 1 and Falcon-1024 is 1,280 bytes, while ML-DSA-44 (CRYSTALS-Dilithium) is 2,420 bytes; hash-based SPHINCS+ is 7,856 bytes at Level 1 and SLH-DSA-256s reaches 29,792 bytes[^s34]. At roughly 2.5–3 kB, `leanSig`[^s16] sits in the middle of that spectrum — but a Falcon-based design would have faced a far smaller size problem in the first place.

So why hash-based? The same survey supplies the reasoning. Hash-based security "relies solely on the preimage and collision resistance of cryptographic hash functions", making it "the most conservative class of post-quantum primitives", whereas Falcon's NTRU assumption is "less extensively analyzed than MLWE" and "leaves open long-term theoretical questions"[^s34]. A second reason is SNARK-friendliness: verifying a lattice signature inside a circuit costs more than verifying hash-based operations, so a design that aggregates via STARK proving naturally prefers hash-based primitives[^s01].

A third reason is specific to Ethereum consensus. Because validators sign only once per slot, a **synchronized** signature scheme suffices and full statelessness is not required[^s34]. That is the logic by which Drake et al. justify a stateful XMSS variant, and it distinguishes this decision from general-purpose signature-scheme selection[^s07]. In sum, the choice is an explicit trade rather than an unavoidable constraint: conservative assumptions and circuit-friendliness are bought with signature size, and the cost is meant to be recovered through aggregation.

### 6.3 Operational complexity: the price of stateful signatures

XMSS-family schemes are stateful. Reusing a one-time key collapses security, so validators must track key usage exactly. Pier Two addresses this directly: "Key lifecycle and tooling become central. If Lean adopts stateful hash based schemes like XMSS or LMS validators will need reliable key rotation tracking and backup workflows."[^s15]. Larger signatures also affect gossip bandwidth, block size planning, and storage[^s15]. `leanSig`'s 8-year key lifetime[^s16] and devnet 1's max-lifetime 2³² parameter[^s14] are attempts to manage this through parameter choice.

### 6.4 Bundling: governance advantage or single point of failure

The programme presents a single large fork as a delivery efficiency[^s02][^s08]. The independent pattern catalogue classifies the same fact as a top-line trade-off: "Single bundled fork means a failure in one component delays the entire upgrade", alongside "heavy dependence on open research questions" and heavy coordination overhead across many teams[^s21].

This objection is not new to 2026. It was raised at the moment Beam Chain was announced, by Ethereum core developer Péter Szilágyi: "we should be [wary] of introducing too many changes at once that impact everything across the board."[^s33]. What is notable is that the criticism already split in two directions at that point. Ethereum builder Martin Köppelmann objected that the proposal was insufficiently ambitious: "The big new feature is… a big refactoring. Sorry @DrakeFJustin, but [in my opinion] Ethereum needs to be more ambitious." EigenLayer principal engineer Bowen Li took issue with the timeline: "My eyes HURT when seeing anything Ethereum present[s] takes 5 [years] to ship." Delphi Digital founding partner José Maria Macedo called the proposal disappointing, saying it would not enhance competitiveness or create compelling narrative momentum[^s33]. "Too much at once" and "too little, too slowly" have coexisted as criticisms from the start.

One secondary analysis frames the fragility as systemic rather than monolithic: dependencies span zkVMs, P2P protocols, and multi-client implementations, so delays cascade[^s26]. The same analysis reports that the EF's 2026 budget was cut by about 40% with 54 positions eliminated[^s26], a figure resting on a single secondary source _(unverified — single source)_.

### 6.5 The urgency dispute: three positions

At least three positions coexist on how urgent the quantum threat is.

**(a) Not imminent, but prepare now** — the official ethereum.org position: "This is not an imminent threat. But cryptographic transitions take years, and Ethereum's security model is designed to last centuries."[^s17]. `pq.ethereum.org` similarly notes that most engineering roadmaps place cryptographic relevance in the early-to-mid 2030s while still pulling its own completion target forward to 2029[^s03].

**(b) Signature migration should be deliberate** — a16z crypto's Justin Thaler argues that a CRQC arriving in the 2020s is "highly unlikely" and that a 5–10 year window is "unsupported by publicly known progress". Because signatures have no harvest-now-decrypt-later exposure, deliberate rather than immediate migration is warranted, and "implementation vulnerabilities will be a far bigger security risk than a cryptographically relevant quantum computer for years to come"[^s18]. Insofar as it treats early adoption of immature schemes as itself a hazard, this is a counter-argument to the Lean schedule.

**(c) 3–4 years is too slow** — criticism runs in the opposite direction too. StarkWare co-founder Eli Ben-Sasson said "'3-4 years' as the timeline is way too long. Especially for quantum readiness," and former EF researcher Dankrad Feist argued "3-4 years is very slow. I think we should be ambitious and get it done in ~1 year."[^s19]. Ben-Sasson also challenged technical vagueness: "New kinds of state: what does that mean? Who is affected by it?"[^s19].

What is notable is that (b) and (c) oppose each other symmetrically: one holds that rushing immature cryptography in is dangerous, the other that putting it in late is. The programme splits the difference by making "cryptographic agility — the ability to upgrade core primitives without destabilizing the network" an explicit design principle[^s03].

### 6.6 A roadmap is not a release

As of August 2026 no Lean-track change has landed on Ethereum mainnet. Glamsterdam's EIP list contains no post-quantum or lean-consensus items[^s31], and the first Lean-oriented fork sits at I\*, after Hegotá[^s26]. Independent reporting makes the point: "Roadmaps are not releases. Ethereum has a long history of ambitious timelines that slip, sometimes by years."[^s20]. Another notes that "three to four years, on this record, reads to many as the optimistic bound of a five-to-eight-year reality"[^s27]. That said, engineering progress is not absent: a numbered series of devnets, five or more interoperating clients, and a block proof reduced from several MB to roughly 200 KB are work in flight rather than plans on paper[^s14][^s28].

### 6.7 The double edge of privacy

Phase 2 of the Extremely Lean Chain puts validator anonymity into the protocol. As Buterin himself notes, this may promote decentralisation or may conceal centralisation; the observation that large operations "will be inherently leaky, and reveal enough data in aggregate" is offered alongside, but the problem remains that social slashing coordination becomes impossible without an additional privacy-protocol proof[^s09]. Period length carries a trade-off too: one hour is the practical minimum, and longer periods weaken validator anonymity[^s09].

## 7. Limitations

The conclusions above should be read within the following limits.

**Areas without primary sources.** For Lean Data there is no specification repository in the collected evidence corresponding to `leanSpec`/`leanSig`/`leanVM`; the detail depends on secondary analysis[^s26] and a single sentence in the EF blog[^s01]. No EF-authored design document for Lean Execution was found either — the ethresear.ch post under that title is community-authored[^s11]. `leanISA` appears only in press reporting[^s27].

**The strawmap itself was not retrievable.** The individual names of the seven forks and their contents are unconfirmed. Only Glamsterdam and Hegotá are named; beyond that the evidence offers letter placeholders such as I\* and L\*[^s26] and ethereum.org's "milestones I, J, L, M"[^s17]. That the workshop was internal and the strawmap is a draft framework[^s20] explains the gap.

**Dependence on project-hosted benchmarks.** Every quantitative figure for aggregation performance, proof size, and verification speed comes from the programme's own repositories or benchmark pages[^s02][^s13], or from restatements of them[^s16]. No independent re-measurement was found. The 40% formal-verification progress figure[^s02] is likewise self-reported, and no verified-theorem artefact was confirmed.

**Parameters are unsettled.** `leanSig` is unaudited research code[^s06], and `leanVM` falls short of NIST Level 1 with a remedy that could go to larger digests or a different prime[^s13]. The signature sizes (~2.5–3 kB) and aggregate sizes cited above are therefore not final parameters. The 4-second slot is likewise a devnet configuration value, not a ratified mainnet value[^s14][^s29].

**Undecided protocol choices.** The fast-finality protocol is still being selected among Live-Simplex / Live-Minimmit / ARFG[^s08], and fork choice is scheduled to move from LMD-GHOST to Goldfish + RLMD-GHOST[^s28][^s29]. "Finality in seconds" is therefore a target, not a specification. The ~8-second finality and 17% fault-tolerance threshold come from a single secondary source[^s26], while the Minimmit paper's own bound is f < 20%[^s25].

**Single-source items.** The reported shift away from depending on Poseidon2[^s26] and the EF's 2026 budget cut of ~40% with 54 positions eliminated[^s26] each rest on one secondary source.

**Conflicts left standing.** The timing of pq-devnet-1 (November vs. December 2025)[^s02][^s15], the reading of the L2 throughput target (~1 million vs. ~10 million TPS)[^s20][^s26], and the lag between the roadmap site's devnet status and client-team reporting[^s02][^s28] are presented side by side rather than resolved.

**Time sensitivity.** This report is based on material accessed on 3 August 2026. Because the programme targets monthly devnets[^s08], the implementation-state section will age quickly.
