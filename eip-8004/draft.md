# EIP-8004 — Trustless Agents on Ethereum

## Abstract

ERC-8004 is an Ethereum standard that adds a **trust layer** on top of existing agent-communication protocols (Google's Agent-to-Agent, Anthropic's Model Context Protocol) and agent-payment rails (Coinbase's x402, Google's AP2), letting autonomous agents discover one another and reason about whom to trust without a prior relationship [^s01][^s05][^s11][^s12]. It does so through three minimal on-chain registries — **Identity** (ERC-721-based handles with an off-chain JSON registration file), **Reputation** (pre-authorised, revocable feedback with integrity-committed off-chain detail), and **Validation** (trust-model-agnostic hooks a smart contract can call into) [^s01][^s13]. The EIP draft was filed on 2025-08-13 and the standard went live on Ethereum mainnet on 2026-01-29, with ecosystem trackers reporting 45,000+ agent registrations across EVM chains in the first month [^s01][^s07][^s08]. This survey covers the specification, the developer surface (how to register, how to choose a trust model), the builder surface (reference contracts, multi-chain deployment, validator operation), and the limitations that independent reviewers and the Ethereum Magicians discussion have repeatedly flagged [^s06][^s13][^s15].

## 1. Introduction

Agent-to-agent interaction now has two working standards for *how* agents communicate — Google's A2A for agent messaging and Anthropic's Model Context Protocol (MCP) for tool access — and at least two converging protocols for *how* they pay each other (Coinbase's x402 and Google's AP2) [^s11][^s12]. What was missing, as the ERC-8004 draft motivation puts it, was a standard for *who the other agent is* and *whether to trust them* [^s01]. ERC-8004 fills that gap by specifying three lightweight registry contracts that can be deployed on any EVM chain, letting an agent publish a verifiable identifier, clients publish feedback, and validators publish verification results — all without a central intermediary [^s01][^s02].

The proposal reached mainnet on 29 January 2026 after a five-month public-discussion cycle on the Ethereum Magicians forum [^s06][^s07][^s10]. Within a month, the ecosystem tracker **8004 Scan** reported 45,000+ registered agents across the set of EVM chains that host the registries [^s07][^s08]. That figure is tracker-reported rather than protocol-native, so the draft treats it as adoption signal rather than a hard count.

This survey is explicitly split along the same builder/developer seam used in our Canton/Daml report. A developer writing an agent cares about the registration JSON schema, the available trust models, and the reputation-feedback API; a builder operating registries, validators, or an agent marketplace cares about the reference contracts, multi-chain deployments, validator economics (which ERC-8004 deliberately leaves to higher layers), and security considerations [^s09][^s13][^s14][^s15].

## 2. Background — Authors, Timeline, and Ecosystem

ERC-8004 was co-authored by **Marco De Rossi** (MetaMask), **Davide Crapis** (Ethereum Foundation; also leads the Foundation's dAI team), **Jordan Ellis** (Google), and **Erik Reppel** (Coinbase) [^s01][^s05]. The authorship is a deliberate choice: the standard has to sit *above* A2A (Google), *above* x402 (Coinbase), *above* the existing Ethereum NFT and tooling stack (MetaMask), and *under* the Ethereum Foundation's broader decentralised-AI agenda [^s05].

The EIP was filed on 2025-08-13 and posted to Ethereum Magicians for public discussion on 2025-08-14 [^s01][^s06]. It was formally presented in October 2025 and rolled out to Ethereum mainnet on 2026-01-29, with Ethereum's official channel stating that "ERC-8004 allows AI agents to interact across organizations ensuring credibility travels everywhere" [^s07][^s10]. During a roughly three-month testnet phase, more than 10,000 agents registered and 20,000+ feedback entries were exchanged [^s08].

The standard's position in the broader stack is complementary rather than competitive. **A2A** remains the transport for agent-to-agent messages; **MCP** remains the tool/context protocol; **x402** and **AP2** are the payment rails; ERC-8004 is the trust and identity layer that lets an agent reason about whether the other end of any of those channels is who it claims to be [^s01][^s11][^s12]. The early adopter list reflects that framing — ENS for identity resolution, EigenLayer for cryptoeconomic validator stacking, The Graph for indexing on-chain signals, Taiko for L2 execution, RedStone and Credora for data and risk signals plugged into validation and reputation [^s08][^s18]. BNB Chain deployed the registries on both its mainnet and testnet in early 2026, positioning itself as a low-fee hub for agent workloads [^s16].

## 3. Specification — The Three Registries

ERC-8004 specifies three registry contracts, each deployable once per EVM chain [^s01][^s02]. The registries are intentionally small — the rationale section calls this out explicitly, arguing that on-chain composability comes from common schemas plus event emission rather than from rich on-chain application logic [^s01].

### 3.1 Identity Registry

The Identity Registry extends **ERC-721 with URIStorage** [^s01][^s04]. Each agent is minted a unique `agentId` (tokenId) whose `tokenURI` resolves to an off-chain **agent registration file** — a structured JSON document declaring the agent's name, description, supported endpoints (A2A, MCP, web, ENS, DID, email), controlled wallet addresses, and `supportedTrust` models [^s01]. Because the handle is an ERC-721 NFT, every agent is immediately compatible with the existing Ethereum wallet, marketplace, and indexer tooling [^s04]. The core functions in the draft are:

```solidity
register(string agentURI, MetadataEntry[] calldata metadata) returns (uint256 agentId)
setAgentURI(uint256 agentId, string calldata newURI)
setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes calldata signature)
getMetadata(uint256 agentId, string metadataKey) returns (bytes memory)
```
(source: EIP-8004 specification) [^s01]

The standard adds an optional domain-binding helper: an agent *may* prove control of an HTTPS endpoint by hosting `/.well-known/agent-registration.json` containing a registration list [^s01]. This is explicitly optional — critics on Ethereum Magicians (pcarranzav) observed that mandating domain binding would prevent multiple agents from being hosted under one domain, and the authors kept it as a non-mandatory affirmation [^s06].

### 3.2 Reputation Registry

The Reputation Registry is where **clients post feedback** about agents they have interacted with [^s01][^s13]. Its data model is deliberately schema-light: a single feedback entry is `(int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)` [^s01][^s13]. The fixed-point score plus `valueDecimals` lets bounded values (e.g. 0–100) be aggregated on-chain without float arithmetic; tags are left to application developers; the URI points to a richer off-chain JSON (logs, artefacts, receipts) and the KECCAK-256 hash commits to that payload so it cannot be swapped out after the fact [^s13].

Key functions:

```solidity
giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)
revokeFeedback(uint256 agentId, uint64 feedbackIndex)
appendResponse(uint256 agentId, address clientAddress, uint64 feedbackIndex, string responseURI, bytes32 responseHash)
getSummary(uint256 agentId, address[] calldata clientAddresses, string tag1, string tag2) returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)
```
(source: EIP-8004 specification) [^s01]

Two design choices in this surface are load-bearing and have been debated publicly. First, feedback is **pre-authorised**: a server agent chooses which clients can post feedback before they do, which Composable Security's review notes "reduces spam, but many identities can still exist" [^s13]. Second, aggregation is explicitly a *read-side* operation performed by `getSummary` (or off-chain indexers like The Graph), not a property of the registry itself — the authors' response to monopolistic-score concerns on Ethereum Magicians was that "single feedback or validation won't be used to decide trust. People will always aggregate entries" [^s06].

### 3.3 Validation Registry

The Validation Registry is trust-model-agnostic [^s01][^s02][^s04]. It defines request and response hooks keyed to a **validator address**; the registry itself does not care whether that validator re-executes the work, verifies a zkML proof, checks a TEE attestation, or runs a cryptoeconomic protocol via EigenLayer — it only records the request, the response (scored 0–100, with 0 = fail and 100 = pass), and the evidence URI plus hash [^s01][^s04][^s14]. Key functions:

```solidity
validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash)
validationResponse(bytes32 requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag)
getValidationStatus(bytes32 requestHash) returns (address validatorAddress, uint256 agentId, uint8 response, bytes32 responseHash, string tag, uint256 lastUpdate)
getSummary(uint256 agentId, address[] calldata validatorAddresses, string tag) returns (uint64 count, uint8 averageResponse)
```
(source: EIP-8004 specification) [^s01]

This layering is the central design bet of ERC-8004: keep the on-chain footprint minimal, let validation protocols compose above the registry, and let indexers and client applications aggregate signals as needed. The tradeoff is that several security-relevant decisions — who is allowed to be a validator, how much they stake, how fraud is penalised — are **explicitly out of scope** for the ERC and must be supplied by a higher-level protocol [^s13][^s15].

## 4. Developer Perspective — Writing and Integrating an ERC-8004 Agent

For a developer, the ERC-8004 surface is small and familiar. The typical workflow is:

1. **Write the agent** in the framework of your choice; ensure it can sign an Ethereum transaction and expose one or more endpoints (HTTPS for plain web, A2A for agent-to-agent, MCP for tool/context access) [^s01][^s11].
2. **Author the registration JSON** — name, description, image, `services[]` (`{type, url}`), `supportedTrust[]`, and optional identity proofs (`ens`, `did`, `agent-registration.json`) [^s01][^s02][^s04].
3. **Host the registration file** somewhere stable — plain HTTPS for the minimum case, or IPFS / Filecoin / Arweave for censorship-resistance [^s02]. Pin the hash; the NFT's tokenURI will point at it.
4. **Mint an identity** by calling `register(agentURI, metadata)` on the chain you care about — the reference contracts are deployed on 30+ EVM chains including Ethereum mainnet, Base, Arbitrum, Optimism, Polygon, BNB Chain, and Scroll [^s09][^s16]. Because the registry is singleton-per-chain, all agents on a given chain share the same registry address [^s01][^s09].
5. **Choose a trust model** and declare it in `supportedTrust`. The ERC acknowledges four principal models that can be combined [^s01][^s05][^s14]:
   - **Reputation** — accept feedback via the Reputation Registry; cheapest, works for low-value interactions; defeated by Sybil at high value [^s01][^s13].
   - **Stake-secured re-execution** — a validator (typically an EigenLayer AVS) re-runs a deterministic subset of the agent's work and stakes against correctness [^s04][^s14].
   - **zkML** — the agent (or a proving service) produces a zero-knowledge proof that an ML inference ran correctly; the validator is an on-chain verifier. Practical today for small models; large LLM proofs remain minute-scale [^s14].
   - **TEE attestation** — the agent runs in a trusted execution environment and submits a hardware attestation; easier than zkML but inherits trust in the hardware vendor and its side-channel posture [^s04][^s14].
6. **Integrate payments and transport separately.** ERC-8004 is a trust layer, not a payments or messaging protocol — pair it with A2A (messaging), MCP (tool access), and x402 / AP2 (payments) as appropriate [^s01][^s11][^s12]. These can be listed in the registration file's `services[]` so clients discover them automatically.

On the client side, a developer reading ERC-8004 signals typically combines two views: the on-chain `getSummary` calls for bounded aggregate scores, and a subgraph / off-chain indexer (The Graph) for per-entry detail, tag filtering, and feedback-chain traversal [^s01][^s08][^s13]. The tradeoff favoured by the authors is that most useful trust decisions happen off-chain over aggregated signals — on-chain composability is intentionally a secondary path [^s06].

## 5. Builder Perspective — Running Registries, Validators, and Agent Marketplaces

For a builder operating infrastructure rather than a single agent, ERC-8004 defines a very narrow interface and expects the surrounding stack to do most of the work.

### 5.1 Reference contracts

The primary implementation lives at `erc-8004/erc-8004-contracts` on GitHub under a **CC0 / Public Domain** licence [^s09]. The contracts are upgradeable (IdentityRegistryUpgradeable, ReputationRegistryUpgradeable, ValidationRegistryUpgradeable), developed and tested with Hardhat, and deployed by the 8004 team to 30+ EVM networks out of the box [^s09]. The CC0 licence is a deliberate fit with the ERC's design: the contracts are expected to be widely forked, redeployed, and embedded. Public-domain licensing removes any ambiguity about derivative works [^s09].

### 5.2 Multi-chain topology

Because ERC-8004 is singleton-per-chain, every host chain that wants native agent identity runs its own instance [^s01][^s09]. **BNB Chain** deployed the registries on both its mainnet and testnet and framed itself as "an early hub for agent systems that require low fees and fast execution" [^s16]. Layer-2s including **Scroll, Base, Arbitrum, Optimism, and Polygon** host registries and have been tagged by ecosystem commentary as vehicles for agent portability across ecosystems [^s09][^s16]. Cross-chain identity reuse — a single agent discoverable on multiple registries — is not specified by the ERC and in practice relies on off-chain tooling to mirror registrations; the standard itself provides only a namespace-chainId-address triple to identify an entry [^s01][^s16].

### 5.3 Validator economics (deliberately out of scope)

ERC-8004 does not define validator incentives. Composable Security's review is explicit: "Economics — collateral, rewards, penalties — are not specified" [^s13]. In practice, validator economics come from the protocol layered above the Validation Registry: **EigenLayer AVSs** for stake-backed re-execution, **zkML services** for proof generation and verification, **TEE oracle networks** for attested execution, and bespoke **reputation DAOs** for curated reviewer sets [^s13][^s14][^s15]. That keeps the ERC small but means a production builder picking ERC-8004 is really picking *ERC-8004 plus a specific validation stack*; the security properties depend on the latter as much as the former [^s15].

### 5.4 Ecosystem integrations

Beyond the core registries, the ERC-8004 ecosystem has formed around a set of integrators [^s08][^s18]. ENS provides human-readable identity resolution. EigenLayer provides the cryptoeconomic substrate for validator slashing. The Graph provides subgraph indexing for the Reputation and Validation registries. Taiko provides an EVM-equivalent L2 deployment target. RedStone and Credora publicly announced in February 2026 that they are shipping data-feed and risk-intelligence integrations targeting ERC-8004 validators and reputation tags, particularly for DeFi agents [^s18]. Coinbase's x402 has launched **Agentic.market**, a marketplace where agents can be discovered and transacted with using stablecoins — a natural consumer for ERC-8004 identities even where the standard is not yet the only ID primitive [^s12].

### 5.5 Adoption signal

Within roughly one month of mainnet, the **8004 Scan** explorer reported 45,000+ agents registered across the multi-chain footprint [^s07][^s08]. BNB Chain coverage separately reported over 24,000 identities tracked on Ethereum-based deployments at time of writing [^s16]. These figures are not protocol-native metrics — they are tracker-reported — and should be treated as upper-bound adoption signals rather than hard agent counts, since the standard has no on-chain uniqueness guarantee and Sybil registrations inflate the total _(interpretive)_ [^s08][^s13][^s16].

## 6. Limitations and Open Questions

**Sybil resistance is weak at the identity layer.** The Identity Registry is permissionless to mint; anyone can register any number of agents [^s01]. Pre-authorised feedback in the Reputation Registry limits spam *within* an agent's feedback log but does not prevent an attacker from standing up 10,000 agent identities, feeding each other positive reviews from related client-agent pairs, and then interacting with real counterparties [^s13][^s15].

**Validator economics are out of scope.** The ERC itself specifies no staking, no slashing, and no reward schedule [^s13][^s15]. Every concrete deployment therefore inherits the security posture of whatever AVS / zkML / TEE stack it composes with. Treat security claims about ERC-8004 as claims about the composed system, not the registry alone [^s15].

**Capability verification is indirect.** Registration proves the agent *said* it supports a set of trust models; it does not prove the agent *actually* performs the work it advertises [^s13][^s15]. Validation compensates only to the extent that a validator exists and is trusted; otherwise clients rely on reputation, which brings the Sybil limit back into play.

**On-chain readability of validation results is partial.** Ethereum Magicians commenter spengrah observed that "I don't see a way in the current standard for an arbitrary smart contract to read the result of a validation response" — the registry emits events and exposes getters but does not make validation outcomes first-class in a way that protocol logic elsewhere can bind to tightly [^s06]. The authors' response was that validation is intentionally a signal layer, not an enforcement layer [^s06].

**Aggregation risks monopolisation.** Ethereum Magicians commenter daniel-ospina warned that single-score reputation metrics "facilitate monopolistic behaviour" and argued for modular, context-dependent trust vectors [^s06]. The standard does support multiple tags per feedback entry and query-time filtering, but the default aggregation path — a `getSummary`-style averaged score — remains a natural attractor for marketplaces, and the incentive to rank by one number is present [^s06].

**Reference-contract audits were not located in this sweep.** The `erc-8004/erc-8004-contracts` repository is published, CC0, upgradeable, and multichain [^s09]. We did not locate a public third-party audit of the contracts themselves in this sweep; builders running high-value deployments should verify audit status independently before use.

**Peer-reviewed analysis is absent.** Every source used in this survey is either the EIP text itself, a discussion-forum post, an industry explainer, a vendor blog, or mainstream crypto news [^s01][^s06][^s13][^s14][^s15]. No peer-reviewed paper on ERC-8004's trust model was found at time of writing. That is characteristic for a standard just three months past mainnet launch, but it is a real epistemic limit and is logged in `uncertainties.md`.

## 7. References

Sources live in `working/sources.jsonl`; references below are keyed by `id`.

[^s01]: Marco De Rossi, Davide Crapis, Jordan Ellis, Erik Reppel, *ERC-8004: Trustless Agents* (EIP draft, 2025-08-13). https://eips.ethereum.org/EIPS/eip-8004
[^s02]: BuildBear Labs, *ERC-8004: Trustless Agents with Reputation, Validation & Identity*. https://www.buildbear.io/blog/erc-8004
[^s03]: CCN, *What Is ERC-8004? Inside Ethereum's Proposed Standard for Trustless AI Agents*. https://www.ccn.com/education/crypto/erc-8004-ai-agents-on-chain-ethereum-how-works-risks-explained/
[^s04]: Backpack Learn, *ERC-8004 Explained: Ethereum's AI Agent Standard Guide 2025*. https://learn.backpack.exchange/articles/erc-8004-explained
[^s05]: CoinDesk, *Ethereum's ERC-8004 aims to put identity and trust behind AI agents* (2026-01-28). https://www.coindesk.com/markets/2026/01/28/ethereum-s-erc-8004-aims-to-put-identity-and-trust-behind-ai-agents
[^s06]: Ethereum Magicians, *ERC-8004: Trustless Agents* (discussion thread). https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098
[^s07]: crypto.news, *Ethereum gears up for ERC-8004 rollout on mainnet this week*. https://crypto.news/ethereum-erc-8004-ai-agents-mainnet-launch-2026/
[^s08]: BitcoinEthereumNews, *ERC-8004 Mainnet Launch: What This Agent Protocol Actually Does*. https://bitcoinethereumnews.com/tech/erc-8004-mainnet-launch-what-this-agent-protocol-actually-does/
[^s09]: *erc-8004/erc-8004-contracts* (GitHub). https://github.com/erc-8004/erc-8004-contracts
[^s10]: Yahoo Tech, *ERC-8004 'Agents' Standard Nears Mainnet as Ethereum Teases Rollout*. https://tech.yahoo.com/ai/articles/erc-8004-agents-standard-nears-094213453.html
[^s11]: Google Cloud, *Announcing Agent Payments Protocol (AP2)*. https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol
[^s12]: Coinbase Developer Platform, *Welcome to x402*. https://docs.cdp.coinbase.com/x402/welcome
[^s13]: Composable Security, *ERC-8004: a practical explainer for trustless agents*. https://composable-security.com/blog/erc-8004-a-practical-explainer-for-trustless-agents/
[^s14]: Wyatt Benno (ICME), *Trustless Agents — with zkML*. https://blog.icme.io/trustless-agents-with-zkml/
[^s15]: QuillAudits, *ERC-8004: Infrastructure for Autonomous AI Agents*. https://www.quillaudits.com/blog/smart-contract/erc-8004
[^s16]: Bankless Times, *BNB Chain Backs ERC-8004 for On-chain AI Identities* (2026-02-04). https://www.banklesstimes.com/articles/2026/02/04/bnb-chain-backs-erc-8004-for-on-chain-ai-identities/
[^s17]: *awesome-erc8004* (GitHub). https://github.com/sudeepb02/awesome-erc8004
[^s18]: RedStone, *ERC-8004 Gives AI Agents Identity. RedStone and Credora Power Them with Data and Risk Intelligence* (2026-02-12). https://blog.redstone.finance/2026/02/12/erc-8004-gives-ai-agents-identity-redstone-and-credora-power-them-with-data-and-risk-intelligence/
