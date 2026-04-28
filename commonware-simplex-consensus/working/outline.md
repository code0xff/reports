# Outline — Commonware SimpleX Consensus

1. **Abstract** — One-paragraph summary of what SimpleX is and what Commonware ships.
2. **Introduction** — Why the BFT-SMR landscape needed a "simpler" alternative; positioning of SimpleX (Chan & Pass, 2023) and how Commonware adopted it.
3. **Background: BFT consensus context** — Brief refresher on PBFT, Tendermint, HotStuff, view-change costs, and the optimistic-vs-pessimistic-path tradeoff that motivates SimpleX.
4. **The SimpleX algorithm (paper)** — Protocol description: leader rotation each iteration, two-vote pattern (notarize + finalize), 3Δ message latency, blocking vs. non-blocking finality, safety/liveness assumptions, fault model (≤ f Byzantine out of 3f+1).
5. **Commonware's implementation (`simplex` crate)** — How `commonware-consensus::simplex` realizes the paper: actor decomposition (voter, batcher, resolver, nuller), pipelined views, signed message types, integration with `p2p`, `cryptography`, `storage`; configuration knobs (leader timeout, namespace, BLS/Ed25519); divergences from the paper.
6. **Performance & deployment claims** — Reported throughput / finality numbers from Commonware's blog and benchmarks; conditions under which SimpleX outperforms HotStuff-style protocols; current production-readiness status.
7. **Limitations & open questions** — What is still vendor-stated, what independent analysis exists, what edge cases (network partitions, leader DoS) are explicitly noted as future work.
8. **References** — Generated from `working/sources.jsonl` by the renderer.
