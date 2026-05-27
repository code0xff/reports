# Claims — EIP-8004 Validation

## Introduction
- [x] c01: EIP-8004 (a.k.a. ERC-8004) introduces three registries — Identity, Reputation, Validation — and Validation is the registry that records cryptographic or economic evidence about completed agent work. [s01,s02,s10]
- [x] c02: Validation in EIP-8004 is intentionally method-agnostic — the registry stores hashes and a numeric response but does not prescribe whether the underlying verification uses staked re-execution, TEEs, zkML, or another mechanism. [s01,s02,s08]

## Background — EIP-8004 architecture
- [x] c03: The Identity Registry assigns each agent a portable on-chain `agentId` (ERC-721 tokenId) that subsequent Reputation and Validation entries reference. [s01,s02,s10]
- [x] c04: EIP-8004 is built so the three registries are independent, lightweight contracts deployable as per-chain singletons; trust models are pluggable. [s01,s02]

## The Validation Registry at the code level
- [x] c05: The Validation Registry exposes `validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash)` callable only by the owner or operator of `agentId`; `requestHash` is a keccak-256 commitment to the off-chain payload. [s02,s03]
- [x] c06: The Validation Registry exposes `validationResponse(bytes32 requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag)` callable only by the designated `validatorAddress`; `response` is a uint8 0–100 (binary or graded). [s02,s03]
- [x] c07: The Jan 2026 spec/reference does NOT specify an expiration window for requests; instead `validationResponse` is callable multiple times for the same `requestHash`, enabling progressive states (e.g. soft vs. hard finality via `tag`). [s02,s03]
- [x] c08: The Jan 2026 update adds on-chain read accessors — `getValidationStatus`, `getSummary`, `getAgentValidations`, `getValidatorRequests` — which partially address an earlier critique that smart contracts could not read validation results, though aggregation is still designed for off-chain consumption. [s02,s03,s05]

## Verification methods plugged into the registry
- [x] c09: Stake-secured re-execution validators (e.g. operator sets or AVS-style designs) implement EIP-8004 validation by re-running the agent's task off-chain and writing a pass/fail score back via `validationResponse`. [s01,s08,s12]
- [x] c10: zkML-based validators (e.g. JOLT-Atlas) can satisfy EIP-8004 by verifying a ZK proof of correct ML inference and then writing the score back to the Validation Registry, with practical proving feasible for small models today and large LLMs still taking minutes. [s07]
- [x] c11: TEE-attested validators are explicitly within scope; Phala's ERC-8004 TEE agent adds a `TEERegistry` extension that records (teeArch, codeMeasurement, pubkey, codeConfigUri, verifier) and gates key registration on whitelisted verifiers checking remote-attestation evidence. [s01,s06]

## End-to-end developer workflow
- [x] c12: A canonical CC0-licensed reference implementation lives at `github.com/erc-8004/erc-8004-contracts` (upgradeable variants) and `github.com/ChaosChain/trustless-agents-erc-ri` (the Jan 2026 reference impl); most third-party SDKs build against these. [s03,s04,s14]
- [x] c13: As of early 2026 EIP-8004 contracts are deployed on Ethereum mainnet and on Base, Arbitrum, Polygon, Optimism, and BNB Chain. [s04,s12,s13]
- [x] c14: An integrator can complete an end-to-end cycle by (1) minting an agent ERC-721 in the Identity Registry, (2) calling `validationRequest(validatorAddress, agentId, requestURI, requestHash)`, (3) waiting for the validator's `validationResponse(...)`, and (4) reading the resulting event or `getValidationStatus(requestHash)`. [s02,s03]

## Analysis & limitations
- [x] c15: EIP-8004 does not specify validator economics — collateral, slashing, or rewards — explicitly leaving them "outside the scope of this registry" and to higher-level protocols. [s02,s08,s09]
- [x] c16: A single-aggregate score creates a documented risk of monopolistic or biased trust signals; the spec mitigates by encouraging filterable aggregation (by validator, tag) but does not solve it. [s05,s09]
- [x] c17: Validation security is only as strong as the chosen validator — registry registration alone does not vet validators, and a self-validation check exists in the reference contract precisely because nothing else prevents an operator from running their own validator. [s03,s09]

## Discussion
- [x] c18: EIP-8004 entered mainnet usage in early 2026 with substantive adoption (tens of thousands of registered agents) and backing from ENS, EigenLayer, The Graph, Taiko, and BNB Chain. [s11,s12,s13]
