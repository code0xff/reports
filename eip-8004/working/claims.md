# Claims — ERC-8004 (Trustless Agents)

## Introduction
- [x] c01: ERC-8004 defines three on-chain registries — Identity, Reputation, and Validation — to let autonomous agents discover each other and signal trust across organisational boundaries without pre-existing relationships. — s01, s02, s05
- [x] c02: ERC-8004 went live on Ethereum mainnet on 2026-01-29. — s07, s08, s10

## Background — Authors, Timeline, and Ecosystem
- [x] c03: ERC-8004 was co-authored by Marco De Rossi (MetaMask), Davide Crapis (Ethereum Foundation), Jordan Ellis (Google), and Erik Reppel (Coinbase); the draft EIP was created on 2025-08-13. — s01, s05
- [x] c04: ERC-8004 is designed to complement — not replace — agent-communication protocols like Google's A2A and the Model Context Protocol (MCP), and agent-payment protocols like Coinbase's x402 and Google's AP2. — s01, s11, s12

## Specification — The Three Registries
- [x] c05: The Identity Registry is an ERC-721 contract with URIStorage; each tokenId's URI resolves to an off-chain JSON registration file that lists endpoints (A2A, MCP, web, ENS, DID, email), wallet addresses, and the trust models the agent supports. — s01
- [x] c06: The Reputation Registry stores client feedback as a signed fixed-point value (int128 + valueDecimals) with optional tags and an external feedbackURI plus a KECCAK-256 feedbackHash; it exposes a `getSummary` view for on-chain aggregation. — s01, s13
- [x] c07: The Validation Registry is intentionally trust-model-agnostic: it defines request/response hooks keyed to a validator address, with responses scored 0–100, and leaves the concrete verification mechanism as a pluggable layer above the registry. — s01, s02

## Developer Perspective — Writing and Integrating an ERC-8004 Agent
- [x] c08: ERC-8004 supports four principal trust models that developers can mix: client-feedback reputation, stake-secured re-execution, zero-knowledge machine-learning (zkML) proofs, and trusted-execution-environment (TEE) attestations. — s01, s05, s14
- [x] c09: Feedback on the Reputation Registry is pre-authorised by the server agent and revocable; independent reviewers note this reduces spam but does not by itself defeat Sybil identity creation. — s01, s15, s06

## Builder Perspective — Running Registries, Validators, and Agent Marketplaces
- [x] c10: Within roughly a month of mainnet launch, ecosystem trackers (8004 Scan) reported more than 45,000 agent registrations across ERC-8004 deployments. — s07, s08
- [x] c11: The reference registry contracts at github.com/erc-8004/erc-8004-contracts are CC0-licensed, implemented as upgradeable contracts, tested with Hardhat, and deployed across 30+ EVM chains. — s09
- [x] c12: BNB Chain deployed ERC-8004 registries on both its mainnet and testnet in early 2026; other EVM L2s (Scroll, Base, Optimism, Arbitrum, Polygon) also have registry deployments. — s09, s16
- [x] c13: ERC-8004 has been publicly endorsed by multiple Ethereum-native infrastructure projects including ENS, EigenLayer, The Graph, and Taiko, and has been integrated by data/risk providers such as RedStone and Credora. — s07, s08

## Limitations and Open Questions
- [x] c14: ERC-8004 explicitly places validator-incentive design (collateral, rewards, slashing) outside its scope, leaving cryptoeconomic security to higher-level protocols that compose with the Validation Registry. — s01, s15
- [x] c15: Independent security reviewers flag weak Sybil resistance, unspecified validator economics, a capability-verification gap, and limited on-chain readability of validation results. — s15, s06
- [x] c16: Ethereum Magicians discussion surfaced design critiques — monopolistic single-score reputation, domain-bound identity, gas-vs-off-chain storage — that the authors defended as intentional choices. — s06
