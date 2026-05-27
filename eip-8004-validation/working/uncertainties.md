# Uncertainties

- **Spec is mid-flight.** The Validation Registry portion of the ERC-8004 spec is explicitly labelled "still under active update and discussion with the TEE community" both in the canonical repo and in the ChaosChain reference. Function signatures, the TEE extension surface, and storage layout may shift later in 2026.
- **Adoption metrics are vendor/scan-stated.** Counts like "45,000 agents" and "24,000 Ethereum-deployed identities" come from 8004 Scan and ecosystem press, not independent on-chain audits. Treat as directional, not verified head-counts.
- **zkML maturity for full LLMs is asserted, not measured here.** JOLT-Atlas integration is real, but production-grade throughput for large models is not yet evidenced by a deployed validator. Claim c10 is marked accordingly.
- **Validator economics are out of scope.** The spec explicitly delegates collateral/slashing to "specific validation protocols" — meaning real trust still lives outside the registry. Integrators who treat a high `response` score as a trust primitive without checking who the validator is, and what stake backs them, are not getting trust from EIP-8004 alone.
- **No formal verification or audit findings included.** This report cites contract sources and security commentary but does not summarise audit-report findings; treat security claims as architectural, not assured.
