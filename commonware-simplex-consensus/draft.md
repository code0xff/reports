## Abstract

Simplex Consensus is a partially-synchronous Byzantine fault-tolerant (BFT) state-machine-replication protocol introduced by Benjamin Y. Chan and Rafael Pass at TCC 2023, designed to be both simple to describe and fast in the common case [^s01][^s02][^s03]. Commonware ships a Rust implementation of Simplex as the `simplex` module of the `commonware-consensus` crate, currently at version 2026.4.0 [^s05][^s11][^s15]. This report walks through the academic protocol — its iteration structure, two-vote (`notarize` + `finalize`) pattern, dummy-block skip, and `f < n/3` fault model — and then maps that protocol onto Commonware's actor-based engine (Batcher, Voter, Resolver, Application) [^s05][^s06][^s08]. We document Commonware's named divergences from the paper (distinct `nullify` message, on-demand certificate fetch, leader timeout, application `certify` gate) [^s05][^s06]; the four pluggable signature schemes including a BLS12-381 threshold variant with embedded VRF [^s05][^s10]; and the measured `~200 ms` block time / `~300 ms` finality figures published from the Alto benchmarking blockchain after buffered-signature optimization [^s18]. We also contextualize Simplex's wider adoption — Solana's Alpenglow / Votor [^s12][^s13] and Victor Shoup's independent peer-reviewed extension *DispersedSimplex* (DISC 2024) [^s16] — and surface what remains uncertain: the crate is labelled ALPHA, no third-party security audit was located, and no independent empirical benchmark of Commonware's specific implementation has been published [^s11][^s15].

## Introduction

Byzantine fault-tolerant state-machine replication (BFT-SMR) sits at the core of every permissioned blockchain and an increasing number of permissionless ones. For most of the last decade the dominant designs have been derivatives of PBFT (Castro & Liskov 1999), Tendermint, and HotStuff (Yin et al. 2019, the basis of LibraBFT/DiemBFT). Each of these accumulated machinery — three rounds of voting, view-change subprotocols, mandatory leader-wait timers — to achieve linear communication and chained commit pipelines. The cost of that machinery is most visible in worst-case latency: a single faulty leader in a chained Tendermint/HotStuff variant can waste several round-trips before the network advances [^s17].

Simplex Consensus, introduced by Benjamin Y. Chan and Rafael Pass in 2023, takes the opposite stance: keep the protocol description as small as possible and lean on the fact that, with rotating leaders, the cheapest way to recover from a bad leader is to immediately rotate. The paper's stated contribution is "a new and simple consensus protocol in the partially synchronous setting, tolerating `f < n/3` byzantine faults, which is essentially as simple to describe as the simplest known protocols, but it also enjoys an even simpler security proof, while matching and even improving the efficiency of the state-of-the-art" [^s01].

Commonware — the open-source Rust library at `commonwarexyz/monorepo` — adopted Simplex as its first consensus primitive (`consensus::simplex`) and later added a threshold-cryptography dialect built on top of the same protocol skeleton [^s06][^s09][^s10]. This report focuses on the technical content of the algorithm and Commonware's implementation, with explicit attention to where the implementation diverges from the paper.

## Background: BFT consensus context

Tendermint, HotStuff, and PBFT all share three structural commitments that Simplex relaxes:

1. **Mandatory leader-wait timers.** In Tendermint the leader must pause for ~2Δ before proposing, so that it has time to receive every honest party's reported certificate. The Decentralized Thoughts comparison frames this as the core source of Tendermint's `6Δ` per-faulty-leader cost ("Δ for the leader to enter the view, 2Δ leader wait, and Δ delay for each of the three messages") [^s17].
2. **A separate view-change subprotocol** for handling unresponsive leaders, layered on top of the steady-state path.
3. **Two- or three-phase voting** (prepare/precommit/commit) to cope with view changes that observed a partial certificate.

Simplex collapses these. Players "move to the next view upon receiving a cert in this view," and a vote in the next view counts as proof that no decision occurred in the previous view [^s17]. That removes the `2Δ` wait and turns the per-faulty-leader cost from ~6Δ down to ~3Δ [^s17]. The simplex.blog project page reports concrete worst-case figures — under 1/3 faulty proposers and an 80 ms message delay, Simplex confirms in `400 ms`, vs. `2480 ms` for HotStuff and `1840 ms` for chained Tendermint [^s03] _(vendor-stated)_.

Simplex inherits the standard partial-synchrony fault model from PBFT and HotStuff: there exists an unknown global stabilization time after which all messages are delivered within a known bound `Δ`, and the protocol tolerates `f < n/3` Byzantine faults [^s01][^s04].

## The SimpleX algorithm (paper)

### Iteration and leader rotation

Players execute iterations `h = 1, 2, 3, …` sequentially. Each player "advances to the next iteration `h+1` once it has seen a notarized blockchain of length `h`" [^s04]. The leader of iteration `h` is deterministic: `Lₕ = H*(h) mod n` [^s04]. There is no separate election protocol — the schedule is a public hash applied to the iteration counter.

### Two-vote pattern: notarize and finalize

Inside each iteration the leader proposes a block extending the longest notarized chain it has seen. Players cast at most one `notarize` vote per iteration. A *notarization* for block `b` is "a set of signed messages from `2n/3` unique players" [^s04]. Once a player observes a notarization for the iteration's block, it sends a `finalize` message. If a player "sees `2n/3 ⟨finalize, h⟩` messages for some iteration number `h`, each signed by a different player," it deems iteration `h` finalized [^s04].

The standard BFT quorum-intersection argument — any two `2f+1` quorums share at least one honest party, so two distinct values cannot both gather enough finalize votes — supplies safety [^s01][^s04].

### Dummy blocks: skipping a faulty iteration

Liveness in the absence of an honest leader is handled by a per-iteration timer `Tₕ`. If a player's `Tₕ` "fire[s] locally after `3Δ` seconds [and] player `i` still hasn't finished iteration `h`," that player "sends to everyone a vote for the dummy block" instead of waiting on the leader [^s04]. A dummy block carries no transactions but lets the chain advance: once enough dummy votes accumulate, the iteration is "skipped" and players move to `h+1` without a classical view-change subprotocol [^s04][^s07]. This is the key mechanism that lets Simplex avoid HotStuff's three-phase pipeline.

### Latency

With an honest leader and timely network, all honest players "have finished iteration `h` and moved on to iteration `h+1` … by time `t + 2δ`," with finalization visible after another `δ`, giving the optimistic 3-message-delay finalization that the protocol is known for [^s04]. With a faulty leader, every honest player enters iteration `h+1` "by time `t + 3Δ + δ`" [^s04]. These are stated in the paper's protocol section and restated by the project page [^s01][^s04].

### Independent academic engagement

The paper has been picked up academically. Victor Shoup's *Sing a Song of Simplex* (DISC 2024, IACR ePrint 2023/1916) "fleshes out details of the Simplex atomic broadcast protocol and modifies it so that leaders disperse blocks in a more communication-efficient fashion, resulting in a protocol called DispersedSimplex that maintains the simplicity and optimal latency characteristics of the original Simplex protocol," and adds a stable-leader variant [^s16].

## Commonware's implementation: the `simplex` crate

Commonware's monorepo organizes the implementation under `consensus/src/simplex/`, with files `engine.rs`, `types.rs`, `config.rs`, `elector.rs`, `metrics.rs`, `mod.rs`, plus `actors/`, `mocks/`, and `scheme/` subdirectories [^s06]. The crate `commonware-consensus` is at `2026.4.0` [^s05].

### Headline properties

The `simplex/mod.rs` module-level documentation advertises "Wicked Fast Block Times (2 Network Hops)," "Optimal Finalization Latency (3 Network Hops)," "Externalized Uptime and Fault Proofs," and "Require Certification Before Finalization" [^s06]. The Anti-Framework blog post sketches the budget as `~300 ms` block times / `~450 ms` finality at `~150 ms` average inter-validator RTT — these are theoretical projections, not measurements [^s09] _(vendor-stated)_.

### Actors

The engine is split into three long-running actors plus a user-supplied Application:

- **Batcher** — "responsible for collecting messages from peers and lazily verifying them when a quorum is met" [^s05]. Lazy verification matters: rather than verifying every signature on receipt, the Batcher waits until `2f+1` votes of a kind exist and then performs aggregated signature verification. On detecting an invalid signature, it bisects the collected message set to identify the offender [^s05].
- **Voter** — "directing participation in the current view" [^s05]. The Voter tracks per-view state (proposal payloads, certificate state, "interesting" views within an `activity_timeout` of the last finalized view) and broadcasts `notarize`, `nullify`, or `finalize` votes; it also assembles certificates once a quorum of votes is collected.
- **Resolver** — "fetching artifacts from previous views required to verify proposed blocks in the latest view" [^s05]. This is the on-demand cert-fetch path used when a node missed a view (e.g. to verify a parent's notarization).
- **Application** — supplied by the user. After observing a `notarization(c, v)`, the engine asks the Application's `certify` method whether to proceed; only on success is `finalize(c, v)` broadcast [^s05][^s06]. This means the application can "optionally delay or prevent finalization" [^s06].

The engine wires three separate network channels for these flows: `vote_network` (individual votes), `certificate_network` (aggregated certificates), and `resolver_network` (request/response cert fetch with rate limiting and peer selection) [^s08].

### Message and certificate types

`simplex/types.rs` defines the wire vocabulary explicitly [^s07]:

- `Vote<S, D>` enum with three variants: `Notarize`, `Nullify`, `Finalize`.
- `Certificate<S, D>` enum with three variants: `Notarization`, `Nullification`, `Finalization`. Each is the aggregated form recovered when `2f+1` matching votes arrive.
- `Artifact<S, D>` aggregates votes and certificates and additionally carries a `Certification(Round, bool)` for tracking locally-certified notarizations.

A `VoteTracker<S, D>` keeps per-signer votes via separate `AttributableMap` instances, which is what makes it possible to externalise fault and uptime proofs (a signer's vote pattern is a verifiable audit trail) [^s07].

### Configuration knobs

The `Engine` config exposes `epoch`, `leader_timeout`, `certification_timeout`, `activity_timeout`, `skip_timeout`, `timeout_retry`, `mailbox_size`, `fetch_concurrent`, `fetch_timeout`, `replay_buffer`, `write_buffer`, `page_cache`, plus a `namespace` for cross-instance domain separation; `cfg.assert()` validates these before the engine spawns its actors [^s08].

### Pluggable signature schemes

The `simplex` crate ships four schemes under `simplex/scheme/` [^s05]:

1. **`ed25519`** — high-speed individual signatures, 32-byte public keys, no aggregation.
2. **`bls12381_multisig`** — BLS12-381 with aggregation; slower verification but smaller certificates.
3. **`secp256r1`** — NIST P-256 for ecosystems that need it; "does not benefit from batch verification, so signatures are verified individually" [^s05].
4. **`bls12381_threshold`** — BLS12-381 *threshold* signatures with a `2f+1` of `3f+1` quorum. The threshold variant supports an embedded VRF and recovers a single threshold signature per view, so consensus certificates become "~240-byte certificates (roughly the size of an average transaction)" verifiable against a static public key [^s10]. "Block election is driven by the embedded VRF (the leader of view `v+1` is only known at the conclusion of view `v`)" [^s10]. Note: a separate `consensus::threshold_simplex` dialect was introduced in 2024 [^s10]; in v2026.4.0 the crate's published module list shows only `simplex` (with `bls12381_threshold` as one of its schemes), `aggregation`, `marshal`, `ordered_broadcast`, and `types` [^s05].

### Documented divergences from the paper

The `mod.rs` doc and the docs.rs page list the implementation's named deviations from the academic protocol [^s05][^s06]:

1. **On-demand certificate fetch** rather than embedding all historical notarizations/nullifications in every proposal, mediated by the Resolver actor.
2. **Distinct `notarize` and `nullify` messages** rather than a unified vote with a "block or dummy" payload, simplifying parsing and accounting.
3. **Explicit `leader_timeout`** to trigger early view transitions when a designated leader is unresponsive.
4. **Skip leader timeout** entirely when the designated leader hasn't participated in the previous `r` views — a small optimization that avoids waiting on a leader that the network already believes is gone.
5. **Message rebroadcast** to keep progress on lossy networks where view messages might otherwise be silently dropped.
6. **Treat local proposal/verification failure as an immediate timeout**, rather than waiting for the timer to fire.
7. **Application `certify` gate** before broadcasting `finalize`: even after seeing `notarization(c, v)`, the engine asks the application whether the block is acceptable, and only on success broadcasts `finalize(c, v)` [^s05][^s06].

## Performance and deployment

### Measured benchmarks (Alto)

The most concrete public numbers come from "Alto," described as "a minimal (and wicked fast) blockchain for continuously benchmarking the Commonware Library" [^s18]. The blog post on buffered-signature optimization reports, on AWS `c7g.xlarge` instances [^s18] _(vendor-stated)_:

- block time `255 ms → 200 ms` (≈20% reduction);
- finality `375 ms → 300 ms` (≈20% reduction);
- CPU usage `26% → 9%` (≈65% reduction).

These are workload-specific (a minimal benchmarking chain, not a general-purpose application) and measured by Commonware itself. The estimator example in the monorepo reports purely *latency* statistics (mean / median / stdev per region and per proposer) and does not publish a transaction-throughput figure [^s06].

### Adoption signals

The simplex.blog project page lists production implementations as "Commonware (Rust), Tempo, Solana Alpenglow (Votor variant), and Ava Labs (Go)" [^s03] _(vendor-stated)_. Solana's Alpenglow upgrade is the most documented external case: Anza describes Votor as "a new voting mechanism that replaces Tower BFT, Proof of History, and gossip for vote propagation," and explicitly credits Simplex for showing that "efficient Byzantine agreement can be reached in a rotating leader Proof-of-Stake setting with extremely small messages, provided there is a tight upper-bound on network delay" [^s12]. Helius reports the upgrade is targeted at lowering Solana's finality "from over ten seconds to the low-hundreds of milliseconds" with mainnet activation projected for late 2026 [^s13].

### Production-readiness status

The crates.io page for `commonware-consensus` states that the crate "is ALPHA software and is not yet recommended for production use" [^s15]. Commonware's stability matrix defines five tiers — ALPHA (breaking changes expected, no migration path), BETA (formats stable, breaking changes have a migration path), GAMMA (API stable, extensively tested and fuzzed), DELTA (battle-tested, bug-bounty eligible), EPSILON (feature-frozen) [^s11]. As of v2026.4.0 (April 14, 2026) [^s11], specific tier assignments per crate are not enumerated on the public README, but the ALPHA label remains the active one for `commonware-consensus`.

## Limitations

Several limitations are honest to surface:

- **Vendor-stated performance.** Every quantitative claim cited above (the simplex.blog comparative numbers, the Anti-Framework theoretical budget, the Alto buffered-signature numbers) comes from project-led publications [^s03][^s09][^s18]. No independent peer-reviewed empirical benchmark of *Commonware's specific Rust implementation* against HotStuff/DiemBFT, Tendermint, or Narwhal-Bullshark was located in this gather. Independent academic engagement does exist with the *protocol itself* (Shoup's DispersedSimplex, DISC 2024) [^s16], but that is a protocol-design paper, not a head-to-head measurement.
- **Threshold-Simplex evolution.** The `consensus::threshold_simplex` dialect described in the September 2024 blog post [^s10] appears, by v2026.4.0, to be exposed as `simplex`'s `bls12381_threshold` scheme rather than a standalone module [^s05]. Anything written about the dialect should be qualified by date.
- **Deterministic per-iteration leader.** Because the leader of each iteration is `H*(h) mod n`, an attacker who can predict and target the next leader can attempt to delay it; Commonware mitigates with `leader_timeout` and the "skip after `r` inactive views" rule [^s05][^s06], and the `bls12381_threshold` scheme moves to a VRF-based, post-iteration-known leader [^s10]. Whether this is sufficient against motivated attackers is an empirical question; the paper does not claim leader-DoS resistance beyond the standard timeout argument [^s01].
- **Leader transaction-ordering control (class-wide).** Like all leader-based BFT-SMR protocols, Simplex lets the iteration's leader choose the order of transactions inside its block. Safety and liveness say nothing about that ordering. This is a class-wide limitation of leader-based protocols rather than a Simplex-specific flaw, but applications that need order-fairness must layer additional mechanisms on top _(interpretive)_.
- **Audit status.** No public third-party security audit of the `simplex` crate was located. Safety claims rest on the academic correctness proofs [^s01] and Commonware's deterministic-simulation coverage cited as ">90%" [^s09]. Until an external audit is published, treat security claims as `_(unverified — single source)_` from the maintainer.
- **Production claims.** The crate is still labelled ALPHA on crates.io [^s15]. External adoption of Simplex (Alpenglow, Tempo, Ava Labs) is not the same as adoption of *Commonware's implementation* [^s03][^s12].
