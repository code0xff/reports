# Outline — Canton and Daml

Eight top-level sections, lean academic. Mandatory Abstract / Introduction / Limitations / References are pinned.

1. **Abstract** — one-paragraph summary of what Canton and Daml are, what claims the report makes, and the builder/developer framing.

2. **Introduction** — positioning Canton and Daml inside the enterprise-DLT / tokenised-assets landscape. Who makes them (Digital Asset), who governs the public deployment (Global Synchronizer Foundation / Canton Network), and why the builder vs developer split matters (different audiences see different parts of the stack).

3. **Background — Origins, Licensing, and Ecosystem** — timeline from Daml (2016) → open-source Daml (2019) → Canton as privacy-preserving synchronization protocol → Canton Network mainnet launch (2024) and post-launch trajectory. License posture for Daml compiler, Canton protocol, and Canton Enterprise. Notable consortium members and production users (Deutsche Börse D7, HKEX Synapse, Broadridge DLR, Goldman Sachs GS DAP).

4. **Architecture and Privacy Model** — Daml as a smart-contract DSL compiled to DAML-LF; Canton as a generalized state machine over a network of Participant Nodes and Synchronizers; the need-to-know privacy model and sub-transaction privacy; virtual shared ledger composed per contract; BFT-ordered synchronizers (including the Global Synchronizer); role of the Canton Coin (CC) utility token.

5. **Developer Perspective — Writing Daml on Canton** — Daml language features (templates, choices, controllers, observers, keys, propose/accept patterns); Daml Script and Daml Triggers; testing and Daml REPL; the Ledger API (gRPC and JSON); code generation for TypeScript / Java / Python clients; Daml Finance standard library; IDE and SDK experience; CI/deployment via `daml` assistant and DAR packaging; upgrade and versioning (smart-contract upgrades, DAML-LF compatibility).

6. **Builder Perspective — Deploying, Running, and Joining the Canton Network** — private Canton vs consortium Canton vs public Canton Network; Super Validator onboarding and governance (Global Synchronizer Foundation, Linux Foundation Decentralized Trust); economic layer (CC emission, feature fees, validator rewards); integration surface (off-ledger services, oracles, bridges); compliance and data-residency story; operational footprint (Kubernetes, observability, HSM, audit exports); interoperability with external chains and with traditional systems.

7. **Limitations and Open Questions** — concentration risk around Digital Asset IP and tooling; opacity of sub-transaction privacy to external auditors; performance numbers that are mostly vendor-stated; immature CC tokenomics; ecosystem depth versus EVM; upgrade and cross-domain semantics still maturing; regulatory treatment of CC.

8. **References** — `sources.jsonl` dump.
