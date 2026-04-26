## Abstract

A coherent cluster of "AI-related" EIPs / ERCs has formed on Ethereum between mid-2025 and Q1 2026. **ERC-8004 ("Trustless Agents")** is the keystone — three on-chain registries for Identity, Reputation, and Validation — and it shipped to mainnet on January 29, 2026 [^s01][^s02][^s17]. This report's deep dive is on **ERC-8126 ("AI Agent Verification")**, a Draft Standards Track ERC created on January 15, 2026 by Leigh Cronian and Chris Johnson, in Draft as of February 10, 2026 [^s05][^s07][^s08]. ERC-8126 sits one layer above ERC-8004 and turns "registered agent" into "verified, risk-scored agent" via five verification categories — **ETV** (Ethereum Token), **MCV** (Media Content), **SCV** (Solidity Code), **WAV** (Web Application), **WV** (Wallet) — each producing a 0–100 score, with the overall risk score being the **mean** of applicable categories and tiered Low/Moderate/Elevated/High/Critical [^s05][^s06]. Verification is privacy-preserving: providers generate ZK proofs through **Private Data Verification (PDV)** so evidence is accessible only to the agent's wallet holder; the optional on-chain registry emits an `AgentVerified` event with proof IDs and exposes `getLatestRiskScore(agentId)` [^s06]. A **Quantum Cryptography Verification (QCV)** mode adds AES-256-GCM-grade post-quantum encryption with a `record_id` + `decryption_url` retrieval pattern [^s06]. The ERC declares dependencies on **EIP-155, EIP-191, EIP-712, EIP-721, EIP-3009, and EIP-8004** [^s05]. Around it sit **ERC-7857** (AI Agent NFT with private metadata, 0G Labs, Jan 2025) [^s03][^s04], **ERC-8183** (agentic commerce, proposed Feb 25, 2026) [^s10], plus adjacent infrastructure EIPs **EIP-8141** (Frame Transaction native AA, Hegotá H2 2026) [^s11][^s12], **EIP-8128** (Signed HTTP Requests with Ethereum, RFC 9421 + CAIP-10) [^s13][^s14][^s15], and **ERC-8211** (smart batching) [^s18]. As of April 26, 2026 only ERC-8004 has reached mainnet; everything else, including ERC-8126, is Draft / proposal status [^s19].

## Introduction

The phrase "AI EIP" did not exist as a category on Ethereum a year ago. By April 2026 it does, with industry coverage routinely grouping protocol-layer changes, identity primitives, and explicitly-AI ERCs under a single "AI EIP cluster" framing [^s18][^s19][^s20]. The grouping is loose — most members are ERCs (application-layer standards), not core protocol changes — but it tracks a real shift: agentic systems on Ethereum need **identity**, **verifiable trustworthiness**, **tradable assets**, **payments**, and **authenticated off-chain I/O**, and ERCs are appearing to cover each of those needs.

The shift began with ERC-8004's August 2025 publication and accelerated through Q1 2026: ERC-8004 reached mainnet on January 29, 2026 [^s02], **ERC-8126 was created January 15, 2026** [^s05], EIP-8128 was posted to Magicians on January 19, 2026 [^s14], and ERC-8183 was proposed February 25, 2026 [^s10]. The Ethereum Foundation's dAI Team explicitly positions Ethereum as "the settlement and coordination layer for AI agents and the machine economy" [^s18].

This report does two things. First, it walks through the AI EIP cluster as it stands in April 2026 — what each EIP / ERC actually specifies, and what is shipped vs. drafted. Second, it goes deep on **ERC-8126** specifically, because once an agent is registered (ERC-8004), the next problem is *how do you decide whether to trust it?* — and ERC-8126 is the spec that answers exactly that question.

## The 2025–2026 AI EIP cluster

### ERC-8004 — Trustless Agents (the keystone)

ERC-8004 is the spec everything else in the cluster references. It introduces three lightweight on-chain registries — Identity, Reputation, Validation — and explicitly leaves application-specific logic off-chain [^s01]. The Identity Registry is built on ERC-721 NFTs that resolve to an agent's registration file, making every agent immediately compatible with existing wallets, marketplaces, and management tools [^s01][^s17]. The Reputation Registry stores client-signed feedback as fixed-point values (`int128` plus a `valueDecimals` `uint8` precision indicator, plus optional tags) [^s01]. The Validation Registry exposes hooks for validator smart contracts so different trust models — reputation, stake-secured re-execution, zkML proofs, TEE oracles — can plug in [^s01][^s16].

ERC-8004 was authored by Marco De Rossi (MetaMask), Davide Crapis (Ethereum Foundation), Jordan Ellis (Google), and Erik Reppel (Coinbase), with input "from over 100 industry leaders including ENS, EigenLayer, and The Graph" [^s02]. It went live on Ethereum mainnet on January 29, 2026, with adoption concentrated on L2s where micropayments and frequent feedback submissions are economical [^s02][^s17]. Independent commentary frames ERC-8004 as a trustless on-chain extension of Google's A2A (Agent2Agent) protocol [^s20].

### ERC-7857 — AI Agents NFT with Private Metadata

ERC-7857 was introduced by 0G Labs in January 2025 [^s04]. It extends ERC-721 to support **encrypted metadata, oracle-mediated re-encryption on transfer, and dynamic updates** so AI models, neural-network weights, and memory modules can be tokenized while keeping training data private [^s03][^s04]. The 0G framing is "iNFTs" — intelligent NFTs — that "represent AI agents as NFTs, providing transferability, decentralization, complete asset control, and royalties" [^s04]. The technical observation 7857 makes is correct: ERC-721 metadata is open by design, and "existing NFT standards cannot securely transfer AI models and data between owners" [^s04]. Cross-ecosystem adoption beyond 0G's own stack was not surfaced in this gather.

### ERC-8183 — Agentic Commerce / programmable escrow

ERC-8183, proposed February 25, 2026 [^s10], is the payment primitive: AI agents use on-chain smart contracts to "trustlessly manage payments" by turning every task into a programmable **Job** with conditional release after the work is validated [^s10]. The spec is early; primary documentation is news-side coverage rather than a stabilized canonical page in this gather.

### EIP-8141 — Frame Transaction (adjacent infra)

EIP-8141, authored by Vitalik Buterin and targeted for the Hegotá upgrade in H2 2026 [^s11][^s12], is not an AI EIP, but it is the protocol-layer change the AI cluster repeatedly references because it makes smart accounts the default. The mechanism: a **frame** is a sequence of distinct operations the protocol handles directly; a `VERIFY` frame targeting an address with no contract code does not revert — instead, the EVM applies built-in default code that handles SECP256K1 and P256 verification [^s11]. Existing EOAs migrate to smart-account features (social recovery, spending limits, gas payments in USDC) "without changing their address" [^s12]. Agent UX flows benefit because "every Ethereum user could soon have access to features … without third-party relayers or wrapper contracts" [^s12].

### EIP-8128 — Signed HTTP Requests with Ethereum (adjacent infra)

EIP-8128, posted to the Ethereum Magicians forum on January 19, 2026 by `jacopo-eth` [^s14], standardizes authenticating arbitrary HTTP requests using Ethereum accounts via **RFC 9421 (HTTP Message Signatures)** [^s15]. Its key id format is `erc8128:<chainId>:<address>`, reusing CAIP-10's `eip155` syntax so an HTTP server implementing RFC 9421 can verify the signature against the on-chain key [^s14]. As of April 26, 2026 the canonical text is **not yet on eips.ethereum.org**; only the Magicians thread and the eip.tools catalog page exist [^s13][^s14]. EIP-8128 is *not technically an AI EIP* — its abstract makes no reference to AI [^s14] — but the agent stack adopts it because authenticated HTTP is what an off-chain agent needs to talk to servers / oracles / model APIs while preserving the on-chain identity claim.

### ERC-8211 — Smart Batching (cluster mention)

ERC-8211, introduced by Biconomy, "allows several blockchain operations to execute together while resolving transaction values in real time" [^s18]. Treated here as a secondary cluster member; canonical spec text was not surfaced in this gather.

## ERC-8126 deep dive — AI Agent Verification

Once an agent is registered via ERC-8004, the natural next question is: **should I trust this agent?** ERC-8126 is the spec that gives an answer.

### Status, authorship, dependencies

- **Title (canonical):** *AI Agent Verification* [^s05]. The Magicians thread title and the project landing page (`erc8126.ai`) use the longer phrase **"AI Agent Registration and Verification"** [^s07][^s09], but the registration half is handled by ERC-8004; the canonical EIPs page focuses on verification only.
- **Status / dates:** Standards Track ERC, status **Draft**, **created 2026-01-15** [^s05]. The author confirmed Draft status as of February 10, 2026 [^s08].
- **Authors:** Leigh Cronian (`@cybercentry`), Chris Johnson [^s05][^s08].
- **Required dependencies:** EIP-155 (chain ID), EIP-191 (signed-data), EIP-712 (typed-data), EIP-721 (NFT identity), EIP-3009 (`transferWithAuthorization`), and ERC-8004 (Trustless Agents) [^s05].

### The five verification categories

ERC-8126's central design is that agent trust is *multi-dimensional*; reducing it to one signal hides the failure mode. The spec instead defines five verification types and presents them in alphabetical order (ETV → MCV → SCV → WAV → WV) "for clarity and consistency" [^s06]. Each category produces an independent 0–100 risk score [^s05][^s06]:

- **ETV (Ethereum Token Verification)** — applicable when `contractAddress` exists in the agent's metadata. Verifies contract deployment by calling `eth_getCode` and confirming non-zero bytecode; checks against known vulnerability patterns; recommends OWASP Smart Contract Security Verification Standard. Returns 0–100 risk score [^s05].
- **MCV (Media Content Verification)** — applicable when `imageUrl` is present. Performs forensic analysis to detect AI-generated content, synthetic media, or deepfakes; verifies content provenance and embedded metadata; validates watermarks, steganographic payloads, or signatures; recommends C2PA Implementation Guide frameworks. Returns 0–100 [^s05].
- **SCV (Solidity Code Verification)** — applicable when `solidityCode` is in metadata. Verifies deployment via `eth_getCode`, checks for reentrancy / flash-loan-attack patterns; recommends OWASP SCSVS. Returns 0–100 [^s05].
- **WAV (Web Application Verification)** — uses resolved `url` or `endpoints`. Verifies HTTPS endpoint reachability, SSL certificate validity, common security tests; recommends OWASP Web Security Testing Guide v4.2. Returns 0–100 [^s05].
- **WV (Wallet Verification)** — verifies the agent's wallet transaction history, checks against threat-intelligence databases. Returns 0–100 [^s05].

### Risk scoring and tiers

The **overall risk score is the mean of all applicable category scores** [^s05]. The spec then partitions the 0–100 range into five tiers [^s05]:

| Tier | Range | Assessment |
|---|---|---|
| Low Risk | 0–20 | Minimal concerns |
| Moderate | 21–40 | Some concerns, review recommended |
| Elevated | 41–60 | Notable concerns, caution advised |
| High Risk | 61–80 | Significant concerns detected |
| Critical | 81–100 | Severe concerns, avoid interaction |

Two design observations follow. First, taking the *mean* of applicable categories means an agent with three excellent scores and one critical-tier score lands somewhere in the middle — which protects against a single-category false positive but also softens a real single-category red flag. The spec leaves it to integrators to decide whether to also enforce per-category minimums. Second, the categories are conditionally applicable: an agent without a `solidityCode` field simply has no SCV score, and the overall mean is computed without it.

### Privacy: ZK proofs and Private Data Verification

ERC-8126 verification is **privacy-preserving by construction**. The spec states that verification providers generate Zero-Knowledge Proofs through **Private Data Verification (PDV)**, with results accessible only to the agent's wallet holder [^s05]. The on-chain attestation carries proof IDs (one per category plus a summary) and the unified risk score; the underlying *evidence* — the actual scan output, the WAV's exact endpoint findings, the WV's threat-intel cross-references — never goes on-chain in plaintext [^s05][^s06]. This is the inverse of "publish your scan results to a public database."

### The optional on-chain interface

ERC-8126 is "primarily an off-chain standard for verification providers, and no on-chain smart contract interface is required to submit verification requests or perform verification types" [^s06]. But the spec defines an *optional* on-chain registry interface that integrators can deploy to make verification results discoverable on-chain [^s06]:

```solidity
event AgentVerified(
    uint256 indexed agentId,
    uint8 overallRiskScore,
    bytes32 etvProofId,
    bytes32 mcvProofId,
    bytes32 scvProofId,
    bytes32 wavProofId,
    bytes32 wvProofId,
    bytes32 summaryProofId
);

function getLatestRiskScore(uint256 agentId) external view returns (uint8);
```

Two design choices stand out. The event indexes only the `agentId` (so subscribers can filter for "verifications for this agent"), and the proof IDs are `bytes32` — i.e. content-addressable references that resolve to off-chain ZK proofs rather than the proofs themselves. The view function returns just a `uint8` overall score, deliberately keeping the on-chain footprint small.

### Quantum Cryptography Verification (QCV)

The spec offers an **optional** post-quantum mode: **QCV** quantum-resistant-encrypts sensitive verification data using "AES-256-GCM or equivalent post-quantum encryption algorithm," returning a unique `record_id` for the encrypted record and a `decryption_url` for authorized retrieval [^s06]. The Security Considerations section explicitly calls out current ECDSA signatures and elliptic-curve ZKPs as "facing potential quantum computing vulnerabilities" — QCV is the spec's hedge against that horizon [^s05].

### ERC-8004 integration

Verification providers may post final risk scores and proof IDs as **attestations to ERC-8004's Validation Registry**, leveraging ERC-8004's pluggable validation interface and ERC-721 portable identity model [^s05][^s06]. This is the composition pattern the cluster reaches for: ERC-8004 supplies the *agentId* (an ERC-721 NFT), ERC-8126 supplies the *verification attestations* against that agentId.

### Sybil resistance

ERC-8126 does not specify its own anti-Sybil mechanism. Under "Attack Vectors" the spec writes: "Malicious actors could create many agents in ERC-8004. Mitigated by minting costs and reputation systems" [^s06]. In other words, ERC-8126 deliberately *delegates* Sybil-cost to ERC-8004's identity-mint cost and to its reputation registry — there is no per-verification fee or stake mechanism inside ERC-8126 itself. Whether ERC-8004's mint cost is high enough to deter Sybil swarms in production is an open empirical question, not addressed by 8126.

### Production maturity

The spec ships a **Reference Implementation in TypeScript / Viem** that "demonstrates metadata resolution, verification scoring, and PDV proof generation" [^s06]. As of April 2026 **no deployed mainnet contract addresses or third-party security audits** of the optional on-chain registry interface have been surfaced in this gather. Reference implementations exist; production deployment does not.

### Reading the rationale honestly

ERC-8126 makes one large claim and one unstated assumption.

The **claim**: agent trust is multi-dimensional and selective disclosure is non-negotiable; therefore the verification standard must produce per-category scores backed by ZK proofs rather than a single signed scan report.

The **unstated assumption**: there will be a robust ecosystem of *competing* verification providers, so no single provider can become a Sybil-resistant chokepoint. The spec itself acknowledges the failure mode under "Attack Vectors" — "provider collusion mitigated by using multiple independent providers" [^s06] — but does not specify how providers gain Sybil-resistant economic skin in the game. That is left to the ecosystem; it is the cleanest place where ERC-8126 might fail to deliver on its promise if real adoption lands on a small handful of providers.

## How these EIPs compose

The April 2026 agent stack on Ethereum can be drawn as five layers, with adjacent infra:

| Layer | EIP / ERC | Status (April 2026) |
|---|---|---|
| Identity | ERC-8004 Identity Registry [^s01] | Mainnet (2026-01-29) [^s02] |
| Reputation / Verification | ERC-8004 Reputation + Validation Registry [^s01]; ERC-8126 verification (ETV/MCV/SCV/WAV/WV + ZKP + QCV) [^s05][^s06] | 8004 mainnet; 8126 Draft |
| Tokenized agent assets | ERC-7857 (iNFT, private metadata, oracle re-encryption) [^s03][^s04] | Draft / 0G adoption |
| Payments / programmable jobs | ERC-8183 (agentic commerce) [^s10] | Proposed Feb 25, 2026 |
| Authenticated off-chain I/O | EIP-8128 (Signed HTTP Requests with Ethereum, RFC 9421 + CAIP-10) [^s14][^s15] | Draft (not yet on canonical EIPs site) [^s13] |
| **Adjacent infra: native AA** | EIP-8141 (Frame Transaction, default code, Hegotá H2 2026) [^s11][^s12] | Targeted for H2 2026 |
| **Adjacent infra: batching** | ERC-8211 (smart batching) [^s18] | Cluster mention only |

Read top-down: an agent registers on ERC-8004, gets verified via ERC-8126 (which posts attestations back to ERC-8004's Validation Registry), owns its private intelligence as an ERC-7857 iNFT, accepts and executes jobs via ERC-8183, and authenticates its HTTP traffic via EIP-8128. The infra layer (EIP-8141, ERC-8211) makes the gas / UX of all of that viable.

## Open issues and contradictions

- **"AI EIP" is contested terminology.** Industry coverage groups protocol-layer EIPs (8141), identity-adjacent EIPs (8128), and explicitly-AI ERCs under one banner [^s18][^s19][^s20]. The grouping is useful for narrative but is not a formal EIP category.
- **Most of the cluster is not yet shipped.** ERC-8004 reached mainnet on 2026-01-29 [^s02]. ERC-7857 has been live as an ERC-721 extension since January 2025 but cross-ecosystem adoption beyond 0G Labs is sparse [^s04]. ERC-8126, ERC-8183, EIP-8141, EIP-8128, and ERC-8211 are all Draft / proposal in April 2026 [^s05][^s10][^s11][^s13][^s18][^s19].
- **Cross-EIP composition is mostly informal.** ERC-8126 explicitly depends on ERC-8004 [^s05]; EIP-8128 + EIP-8141 imply each other but the spec authors are different and there is no joint integration document.
- **Naming drift.** ERC-8126 is referenced in the Magicians thread and on the project landing page as "AI Agent Registration and Verification" — the canonical title per the EIPs page is **"AI Agent Verification"**, with ERC-8004 handling the *registration* half [^s05][^s07][^s09].
- **Verification-provider economics are unspecified.** ERC-8126's "use multiple independent providers" mitigation against provider collusion [^s06] does not come with a Sybil-resistant gating mechanism on *who* can be a provider. That is an ecosystem question, not a spec question.

## Limitations

- **ERC-8126 is Draft.** No deployed mainnet contract addresses; only a TypeScript / Viem reference implementation is in the spec [^s06]. Numbers and event signatures cited here are accurate to the spec at gather time but may shift before Final.
- **No public audit.** No third-party security audit of ERC-8126 (or of the on-chain registry interface) was located.
- **Vendor-stated adoption.** Long-horizon claims ("130,000 ERC-8004 agents projected by 2026") are forward-looking projections, not measurements; we excluded them rather than cite them.
- **EIP-8128 canonical text is not yet on eips.ethereum.org.** A direct GET on `https://eips.ethereum.org/EIPS/eip-8128` returned 404 during this gather. Primary text relied on the Magicians thread (s14) and the eip.tools catalog page (s13).
- **ERC-8211 is a cluster mention, not a deep dive.** We did not retrieve canonical spec text; only news-level framing (s18).
- **Cross-EIP composition.** The "five-layer stack" framing is a synthesis of the cited specs and third-party explainers; no formal integration document binds the layers together. Treat the table as descriptive, not normative.
- **Drafts can move quickly.** All EIP / ERC numbers and statuses cited here are accurate as of April 26, 2026 to the best of this gather; readers should re-verify against the canonical EIPs repository before taking implementation decisions.
