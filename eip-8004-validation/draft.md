# EIP-8004 Validation — Code-Level Verification of Trustless Agents

## Introduction

EIP-8004 (also tracked as ERC-8004, "Trustless Agents") is an Ethereum standard whose stated purpose is to let agents from different organisations discover each other and establish trust on-chain without prior contractual relationships [^s01]. It does this through three lightweight per-chain singletons — Identity, Reputation, and Validation [^s01][^s02]. This report focuses narrowly on the *Validation* registry: what it actually is at the Solidity level, how a developer wires a verification flow through it, and what kinds of "verification" the standard does and does not give you.

The standard's authors are deliberate that the Validation Registry is method-agnostic. Stake-secured re-execution, zkML proofs, and TEE oracles are all listed in the spec as legitimate validators, with the registry providing only the *hooks* to request and record their verdicts [^s01]. The on-chain code does not know whether the "response" recorded by a validator is the output of a re-executed inference, a verified ZK proof, or a TEE attestation digest — and that is by design [^s02][^s08].

## Background — The three registries

The Identity Registry is an ERC-721 contract; each agent is a token whose `tokenId` is its `agentId`, and whose `tokenURI` (called `agentURI` in the spec) resolves to a JSON registration file describing the agent's services [^s02]. Agents are globally addressed by `agentRegistry = "{namespace}:{chainId}:{identityRegistry}"`, e.g. `eip155:1:0x742...` [^s02]. The Reputation Registry holds feedback signals keyed to those `agentId`s. The Validation Registry holds verifier verdicts — what this report is about.

The three registries are independent contracts deployable as per-chain singletons; trust models are explicitly described as "pluggable and tiered, with security proportional to value at risk, from low-stake tasks like ordering pizza to high-stake tasks like medical diagnosis" [^s01]. Integrators choose which combination they care about. A consumer that only wants discovery can ignore Validation; a consumer that wants cryptographic re-execution evidence reads it.

## The Validation Registry at the code level

The current spec (Jan 2026 update, also the version reflected in the ChaosChain reference implementation) exposes two write entry points and four read accessors [^s02][^s03].

**Request.** The agent (or its operator) calls:

```solidity
function validationRequest(
    address validatorAddress,
    uint256 agentId,
    string  calldata requestURI,
    bytes32 requestHash
) external;
```

The function MUST be called by the owner or an approved operator of `agentId` — the reference implementation enforces this against the Identity Registry's ERC-721 ownership/operator state [^s02][^s03]. `requestURI` points to the off-chain payload (inputs, outputs, anything the validator needs); `requestHash` is the keccak-256 commitment to that payload and acts as the request's identifier [^s02]. The reference implementation also enforces two non-spec safety checks: it rejects `validatorAddress == agentOwner` ("Self-validation not allowed") and refuses to overwrite a `requestHash` already in use [^s03].

An event is emitted on success:

```solidity
event ValidationRequest(
    address indexed validatorAddress,
    uint256 indexed agentId,
    string requestURI,
    bytes32 indexed requestHash
);
```

**Response.** Only the `validatorAddress` named in the request may call back:

```solidity
function validationResponse(
    bytes32 requestHash,
    uint8   response,
    string  calldata responseURI,
    bytes32 responseHash,
    string  calldata tag
) external;
```

`response` is a `uint8` in `[0, 100]`, intended either as binary (0 = failed, 100 = passed) or as a graded scalar for verifiers whose output is a spectrum [^s02]. `responseURI`, `responseHash`, and `tag` are optional, where `tag` allows progressive states such as `"soft-final"` vs `"hard-final"` [^s02]. Importantly, the spec permits `validationResponse` to be called *multiple times* for the same `requestHash`, which is the mechanism used to advance a request through progressive states [^s02][^s03]. There is **no expiration window** baked into the spec or the Jan 2026 reference contract — instead, the request stays open and can be re-answered, and integrators that need a deadline must impose one in the wrapping protocol _(unverified — single source: the canonical spec and reference implementation are themselves the primary sources; no third-party commentary on the absence of an expiration window was located)_.

**Reads.** The Jan 2026 spec introduced on-chain read accessors that earlier critiques had requested [^s02][^s03][^s05]:

```solidity
function getValidationStatus(bytes32 requestHash) external view returns (
    address validatorAddress,
    uint256 agentId,
    uint8 response,
    bytes32 responseHash,
    string memory tag,
    uint256 lastUpdate
);

function getSummary(uint256 agentId, address[] calldata validatorAddresses, string calldata tag)
    external view returns (uint64 count, uint8 averageResponse);

function getAgentValidations(uint256 agentId)
    external view returns (bytes32[] memory requestHashes);

function getValidatorRequests(address validatorAddress)
    external view returns (bytes32[] memory requestHashes);
```

These addressed a specific community critique from Ethereum Magicians, where spengrah objected that there was "no way in the current standard for an arbitrary smart contract to read the result of a validation response" and proposed adding a `getValidationResponse()` accessor [^s05]. Marco-MetaMask had argued that keeping the surface light was deliberate for gas-efficiency reasons and because "single feedback or validation won't be used to decide trust — people will always aggregate entries" [^s05]. The Jan 2026 update is a partial reconciliation: contracts *can* now read individual statuses and an on-chain average, but the spec still warns that real aggregation is expected off-chain, and the reference implementation explicitly comments that `getSummary` without filters may exceed gas limits for popular agents [^s03].

The Validation Registry contract stores `(requestHash → Request)` and `(requestHash → Response)` mappings plus reverse indices keyed by `agentId` and by `validatorAddress` [^s03]. State is append-only by construction: there are no delete paths in the reference implementation, and the spec's security section notes that "on-chain pointers and hashes cannot be deleted, ensuring audit-trail integrity" [^s02].

## Verification methods plugged into the registry

What turns a `validationResponse(...)` call into actual trust is *who* the validator is and *what they did before calling back*. The spec is explicit that "validator smart contracts could use, for example, stake-secured inference re-execution, zkML verifiers or TEE oracles to validate or reject requests" and that "incentives and slashing related to validation are managed by the specific validation protocol and are outside the scope of this registry" [^s02].

**Stake-secured re-execution.** A validator (typically an operator set, often described in commentary as an AVS-style design where an EigenLayer-style restaking layer collateralises operators) reads `requestURI`, re-runs the agent's task, and writes a 0–100 score back via `validationResponse` [^s01][^s08][^s12] _(interpretive — independent commentary describes the pattern; the registry itself is agnostic to it)_. The economic guarantee is entirely off-registry: the registry just stores the verdict.

**zkML.** The ICME write-up on JOLT-Atlas describes the flow as: "agent executes ML inference, JOLT-Atlas generates a ZK proof of execution, the dataHash commits to the proof and verification parameters, the validator contract verifies the proof on-chain, and the `ValidationResponse` records the verification result" [^s07]. In code terms, the validator is a contract whose business logic is `verifyProof(...)` from a zkSNARK verifier, gated by `msg.sender == request.validatorAddress`. The same source is candid that this is practical for small models today and that large LLMs "still take minutes" of proving time [^s07] _(early signal)_.

**TEE attestation.** Phala's `erc-8004-tee-agent` adds a `TEERegistry` extension that records per-`agentId` keys as `(teeArch, codeMeasurement, pubkey, codeConfigUri, verifier)` tuples [^s06]. `addKey` is gated on the verifier being whitelisted and is supposed to validate that "the TEE attestation is valid, the codeMeasurement matches the public input in the proof, and the pubkey matches the public input in the proof" [^s06]. The TEE registry is a sibling rather than a replacement for the Validation Registry: the Validation Registry remains the place to record per-task verdicts, while the TEE Registry binds agent identity to a measurement of the code that produced those outputs.

## End-to-end developer workflow

A minimal integrator flow against the Jan 2026 contracts looks like this [^s02][^s03][^s14]:

1. **Mint identity.** Deploy or look up the per-chain `IdentityRegistry` singleton and mint an agent NFT whose `agentURI` resolves to the registration file (services list — A2A, MCP, OASF endpoints, ENS, wallet addresses) [^s02].
2. **Pick a validator.** Choose a contract address that implements your trust model (re-execution AVS, zkML verifier, TEE-attested oracle). The registry does not enumerate validators; discovery happens via the registration file or via the off-chain agent ecosystem [^s01][^s14].
3. **Commit work.** Compute `requestHash = keccak256(payload)` where `payload` contains everything the validator needs (inputs, outputs, any intermediate state). Upload the payload to `requestURI` (IPFS, HTTPS, etc.).
4. **Request validation.** Call `validationRequest(validatorAddress, agentId, requestURI, requestHash)` as the agent owner/operator [^s02][^s03].
5. **Validator responds.** The validator pulls the payload from `requestURI`, performs its method-specific check, and calls `validationResponse(requestHash, response, responseURI, responseHash, tag)` from the address it was registered as [^s02][^s03].
6. **Consume.** Off-chain consumers listen for the `ValidationResponse` event; on-chain composers call `getValidationStatus(requestHash)` or `getSummary(agentId, validators, tag)`. The reference implementation explicitly recommends filtering by validator and/or tag for popular agents because unfiltered `getSummary` can exceed gas limits [^s03].

Tooling that smooths these calls is concentrated around two repositories. `erc-8004/erc-8004-contracts` is the canonical CC0-licensed registry, shipped with upgradeable (UUPS) variants (`IdentityRegistryUpgradeable.sol`, `ReputationRegistryUpgradeable.sol`, `ValidationRegistryUpgradeable.sol`) [^s04]. `ChaosChain/trustless-agents-erc-ri` is the Jan 2026 reference implementation that most third-party SDKs target, including `create-8004-agent`, `erc-8004-js`, `erc-8004-py`, the Agent0 SDK (JS + Python), and chaoschain-sdk; Agent0 also publishes a subgraph for multi-chain indexing [^s03][^s14].

As of early 2026, ERC-8004 contracts are deployed on Ethereum mainnet, Base, Arbitrum, Polygon, Optimism, and BNB Chain, with BNB Chain explicitly positioning itself as "an early hub for agent systems that require low fees and fast execution" [^s04][^s12][^s13]. Reported registration counts — over 45,000 agents protocol-wide within the first month, around 24,000 on Ethereum-based deployments — come from ecosystem trackers (8004 Scan) rather than independent on-chain audits and should be treated as directional _(vendor-stated)_ [^s12][^s13].

## Analysis & limitations

**Composability is partially solved, not fully.** The Jan 2026 read accessors `getValidationStatus` / `getSummary` directly answer the spengrah critique that arbitrary contracts could not see validation results [^s03][^s05]. But the spec still pushes serious aggregation off-chain: `getSummary` is documented (in code comments) as designed for off-chain consumption and as risky to call unfiltered [^s03]. On-chain composers should treat the registry as a notarised log, not an oracle.

**Validator economics are out of scope.** Both QuillAudits and Composable Security flag that ERC-8004 "does not specify economic incentives for validators; security depends on composing higher-level protocols" [^s08][^s09]. The spec confirms this: "Incentives and slashing related to validation are managed by the specific validation protocol and are outside the scope of this registry" [^s02]. A high `response` score from a validator with no stake means nothing.

**Self-validation is contract-prevented, validator quality is not.** The reference contract refuses calls where `validatorAddress == agentOwner` or where the requester names themselves as validator [^s03]. But beyond that, registration as a "validator" is permissionless: the registry will accept any address. Trust has to be sourced from a layer outside EIP-8004 — staking, attestation, social, or audit-driven [^s09].

**Single-aggregate score risk.** Daniel-Ospina raised on Magicians that single-score aggregation can facilitate monopolistic or biased reputation [^s05]. The Jan 2026 update mitigates by letting consumers filter `getSummary` by validator address and by tag, but it does not eliminate the risk — an integrator that just calls `getSummary(agentId, [], "")` gets the unfiltered mean and inherits whatever bias the dominant validators carry.

**The spec is mid-flight.** Both the canonical repo's `ERC8004SPEC.md` and the ChaosChain reference carry an explicit warning that "this section is still under active updates with the TEE community. Expect further changes later in 2026. Consider this EXPERIMENTAL." [^s03][^s04]. The function signatures shown here are accurate at the time of writing but may shift.

## Discussion

EIP-8004 in 2026 has the shape of an infrastructure standard that won the easy part (Identity), the medium part (Reputation), and is iterating on the hard part (Validation). The Validation Registry as it stands is intentionally a thin notarisation layer — it commits *who said what about which task* — and offloads every interesting question (what counts as a valid proof, who pays for being wrong, who aggregates the signals) to whatever protocol sits above. That minimalism is the source of both its rapid cross-chain deployment [^s04][^s12][^s13] and its main critique: a developer who treats `response == 100` as trust will be disappointed, because the registry does not vouch for the validator.

Compared to off-chain attestation stacks like EAS (Ethereum Attestation Service) or AVS-mediated trust layers, EIP-8004 occupies a narrower niche: it is *specifically* the agent-discovery + per-task verdict-recording surface, not a general attestation framework. The standard's traction comes from co-positioning with agent-payment protocols (x402, AP2) — Validation answers the question "did this agent do the thing I paid for" in a way that downstream payment rails can read [^s11].

## Limitations

This report does not cover: (1) formal verification or detailed audit findings on the registry contracts; (2) non-EVM ports (a TRON SDK exists [^s14] but was not exercised here); (3) the Reputation Registry's feedback semantics beyond what is necessary to understand Validation; (4) the agent-side cryptography for binding TEE attestations to specific inferences (Phala-side concerns); (5) economic modelling of validator marketplaces. Several pieces — especially zkML throughput numbers and adoption counts — depend on vendor-stated metrics that this report flagged but did not independently verify.

## Abstract

EIP-8004's Validation Registry is the on-chain notarisation surface for verdicts on agent work. At the code level it is two write functions — `validationRequest(validatorAddress, agentId, requestURI, requestHash)` called by the agent owner, and `validationResponse(requestHash, response, responseURI, responseHash, tag)` called by the named validator — plus four read accessors added in the Jan 2026 spec update to make individual statuses and filterable summaries readable by other contracts. The standard is method-agnostic: re-execution AVSs, zkML verifiers (e.g. JOLT-Atlas), and TEE oracles (e.g. Phala's TEERegistry extension) all plug in by writing a `uint8` 0–100 score back. The registry deliberately does not specify validator economics or trust — those live in the wrapping protocol — which is both why deployment across Ethereum, Base, Arbitrum, Polygon, Optimism, and BNB Chain happened quickly in early 2026 and why "registry says 100" is not the same as "result is verified". Integrators should pick validators with backed economic guarantees, mint identities via the ERC-721 Identity Registry, commit work via keccak-256 hashes, and treat the Validation Registry as an auditable log rather than as oracle truth.
