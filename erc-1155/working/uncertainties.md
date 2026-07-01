# Uncertainties — ERC-1155 Multi Token Standard

Claims that are publishable but remain epistemically shaky or context-dependent:

- **Magnitude of gas savings.** Savings are real but highly workload-dependent. The concrete figure cited (132,437 vs 189,861 gas for a 3-item batch, ~30% in that test, s05) does not generalize to a fixed percentage; larger batches save more, single transfers save nothing. Widely repeated "~60%" figures could not be traced to a primary benchmark and are excluded.
- **"Semi-fungible" is a usage pattern, not a protocol primitive.** The EIP does not define a "semi-fungible" type; it only enables "other configurations" (s01). The semi-fungible framing comes from ethereum.org and ecosystem writing (s03) and describes how the id/supply model is used, not a distinct on-chain type.
- **Security posture is implementation-dependent.** Reentrancy safety and approval hygiene depend on the concrete implementation and on user behavior, not on the base standard. The EIP mandates the balance/event ordering rule (s04) but delegates most protection to implementers; OZ and reviewers add reentrancy guards (s05).
- **Adoption breadth.** We confirm OpenSea and OpenZeppelin support (s07, s02/s06) but do not quantify overall ecosystem penetration or on-chain deployment counts; those would need indexer/analytics data not gathered here.
- **"Final" status date** is stated as a header fact (s01) without an independent timestamp corroboration.
