# Outline — Solana Protocol: A Detailed Technical Deep Dive

1. **Abstract** — one-paragraph synthesis (written last).

2. **Introduction** — What Solana is, the design thesis (a single high-throughput global state machine rather than sharding), the eight core innovations Solana names, and the scope of this report.

3. **Background: The Design Problem** — Why ordering time is the bottleneck in a distributed ledger; how conventional BFT chains pay a consensus-message cost per block; Solana's bet that a verifiable clock removes that cost.

4. **Proof of History and the Verifiable Clock** — The sequential VDF-style SHA-256 hash chain, how it encodes time and event ordering before consensus, leader slot assignment, and what PoH is and is not (not a consensus algorithm on its own).

5. **Consensus: Tower BFT and Leader Rotation** — PoH-anchored PBFT variant, vote lockouts, the leader schedule / slots / epochs, and how finality (optimistic confirmation vs. rooted/finalized) is reached.

6. **Transaction Flow and Networking** — Gulf Stream (mempool-less forwarding to leaders), Turbine (block propagation via shreds/stake-weighted tree), QUIC ingress, stake-weighted QoS, and the Transaction Processing Unit (TPU) / TVU pipeline.

7. **Execution: Sealevel Runtime and the Account Model** — The account-based (not UTXO, not EVM-single-threaded) state model, why declaring accounts up front enables parallel execution, programs vs. accounts, rent, and Sealevel/SVM parallelism.

8. **Fees, Economics, and Staking** — Base fee + priority fees, local fee markets, compute units, inflation schedule and staking rewards, MEV/Jito, and validator/hardware requirements.

9. **Performance, Reliability, and Firedancer** — Real-world throughput vs. theoretical claims, historical outages and their causes, and the Firedancer/multi-client roadmap (Frankendancer).

10. **Limitations** — What this report could not verify, contested figures, vendor-stated numbers, hardware-centralization critique, and open questions.

11. **References** — generated from sources.jsonl.
