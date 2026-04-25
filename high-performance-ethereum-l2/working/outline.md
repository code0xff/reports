# Outline — High-performance Ethereum L2: bottlenecks and architecture

1. **Abstract** — Single-paragraph synthesis: which bottlenecks dominate at the high-performance frontier, and which stack is most defensible today.
2. **Introduction** — Why "ultra-high-performance L2" is a distinct design target from a generic rollup; what "high performance" means quantitatively (TPS, gas/sec, finality, p99 latency).
3. **Background: the Ethereum L2 landscape today** — Rollup-centric roadmap, EIP-4844 blobs and PeerDAS, the optimistic vs. zk taxonomy, current production numbers (Base, Arbitrum, Optimism, zkSync, Starknet, Linea, Scroll), MegaETH / Monad / Solana-as-context.
4. **The bottleneck taxonomy** — Dissect each layer:
   - Data availability throughput (blob bandwidth, PeerDAS, alt-DA economics)
   - Sequencer single-threaded execution (EVM mainloop, mempool, state access)
   - State growth and state access (Merkle Patricia Trie I/O, verkle/binary tries, state expiry)
   - Proving cost / latency (zk circuit time, proving market economics, hardware)
   - Settlement / finality on L1 (challenge windows, validity proof verification gas)
   - MEV and orderflow (sequencer extractive value, FCFS/PBS/encrypted mempools)
   - Interop and bridging latency
5. **Architecture choices** — For each bottleneck, what the realistic options are: 4844 vs PeerDAS vs Celestia/EigenDA/Avail; zk vs optimistic vs Type-1 zkEVM; based-rollup vs centralized sequencer vs shared sequencer (Espresso/Astria); parallel EVM (Reth/MegaETH/Monad-style); pre-confirmations; encrypted mempools.
6. **Recommended stack & tradeoffs** — A concrete defensible answer to "if you had to ship one today, what would you ship and why," distinguishing near-term (2026–2027) from medium-term (2027+) bets, with tradeoffs surfaced honestly.
7. **Limitations** — Vendor-stated numbers, unaudited claims, missing independent benchmarks, fast-moving research (PeerDAS, FOCIL, EIP-7732).
8. **References** — Generated from `working/sources.jsonl` by the renderer.
