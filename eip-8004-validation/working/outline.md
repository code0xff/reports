# Outline — EIP-8004 Validation (Code-level Verification)

1. **Abstract** — what EIP-8004 validation actually does on-chain and how builders integrate it.
2. **Introduction** — why "trustless agents" need a verification primitive distinct from identity and reputation, and the gap this fills relative to off-chain attestations.
3. **Background: EIP-8004 architecture** — the three registries (Identity, Reputation, Validation), agentId model, and where Validation fits.
4. **The Validation Registry at the code level** — Solidity interface (`validationRequest`, `validationResponse`, events), agentValidatorId vs agentServerId roles, data hashes, expiration windows, and how the registry stays *unopinionated* about what "valid" means.
5. **Verification methods plugged into the registry** — staked re-execution / TEE attestation / zkML / crypto-economic validators; how each writes a response back; reference implementations (erc-8004-contracts, JOLT-Atlas zkVM, EigenLayer AVS pattern).
6. **End-to-end developer workflow** — building an agent: register identity → request job → call `validationRequest(dataHash)` → validator runs work → submits `validationResponse(score)` → reader contracts/clients consume the result. Tooling, SDKs, indexers, gas costs.
7. **Analysis & limitations** — composability gaps (smart contracts cannot easily read responses), single-score aggregation risk, missing economic-incentive specification, scalability of zk/TEE methods, and security pitfalls.
8. **Discussion** — production readiness in 2026, ecosystem traction signals, comparisons with off-chain attestation stacks (EAS, EigenLayer AVSs).
9. **Limitations** — what this report does not cover (formal verification of the contracts, audit findings depth, non-EVM ports).
10. **References** — generated from sources.jsonl.
