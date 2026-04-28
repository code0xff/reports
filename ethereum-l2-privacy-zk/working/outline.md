# Outline — Ethereum and L2 privacy: solutions and practical zk applications

1. **Abstract** — One-paragraph synthesis: the privacy problem on a public ledger, the post-Tornado-Cash design space, and which zk applications are actually shipping in 2026.
2. **Introduction** — Why privacy on Ethereum is structurally hard, why the 2022 Tornado Cash sanctions reshaped the design space, and what "practical" means as an evaluation lens.
3. **Threat model and privacy taxonomy** — Sender / receiver / amount / contract-call confidentiality; on-chain anonymity sets vs. off-chain unlinkability; "shielded" (encrypted state) vs. "anonymous" (mixed transparent state).
4. **Existing privacy solutions on Ethereum and L2 (current state, 2024–2026)** — Tornado Cash post-sanctions; Aztec Network (zk rollup with shielded UTXO); Railgun (privacy on L1+L2); Privacy Pools (Buterin et al. 2023, 2024–2026 deployments); Semaphore / World ID-class anonymous-credential protocols; Nocturne sunset.
5. **The zk primitive layer that matters** — Groth16, PLONK / KZG, Halo2, Plonky3, STARKs; folding / Nova; client-side proving feasibility (e.g. Aztec's Noir / Barretenberg on a phone or laptop); ZK-friendly hashes (Poseidon).
6. **Practical zk applications today** — (a) shielded payments and DeFi, (b) Privacy-Pools-style compliance-aware mixing, (c) anonymous credentials and proof-of-personhood (Semaphore, World ID, Anon Aadhaar, ZK-Email, zkPassport), (d) zk rollup *as* an indirect privacy primitive, (e) private bridging / cross-chain messages.
7. **Recommendations: what's actually deployable today** — Concrete answer to "what would you build / use today" depending on the goal: private payments, compliance-friendly mixing, identity, or a privacy-by-default L2.
8. **Limitations and open problems** — Sanctions risk, anonymity-set sizing, regulatory uncertainty, prover hardware, audit gaps, the difference between "privacy" and "censorship resistance."
9. **References** — Generated from `working/sources.jsonl` by the renderer.
