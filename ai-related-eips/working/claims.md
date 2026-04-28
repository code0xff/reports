# Claims — AI-related EIPs in 2026 (EIP-8126 deep dive)

## Introduction
- [ ] c01: A coherent cluster of "AI-related" EIPs / ERCs emerged on Ethereum between mid-2025 and Q1 2026, driven by the perceived need for agent identity, agent verification, agent-tradable assets, and agent-payment primitives.
  - kind: interpretive
  - needs: at least one independent listing or commentary plus the canonical EIPs page.
- [ ] c02: ERC-8004 ("Trustless Agents") is the keystone of this cluster — the single most-cited AI EIP — with mainnet activation on January 29, 2026 and authorship spanning Coinbase, MetaMask, ENS, EigenLayer, The Graph, Google, and the Ethereum Foundation.
  - kind: factual
  - needs: ERC-8004 spec page + at least one news source with mainnet date and authorship.

## The 2025–2026 AI EIP cluster
- [ ] c03: ERC-7857 ("AI Agents NFT with Private Metadata"), introduced by 0G Labs in January 2025, extends ERC-721 to support encrypted metadata, oracle-mediated re-encryption on transfer, and dynamic updates so AI models / memory modules can be tokenized while keeping training data private.
  - kind: factual
  - needs: official EIPs page, 0G Labs blog.
- [ ] c04: ERC-8183 ("Agentic Commerce"), proposed on February 25, 2026, lets AI agents use on-chain smart contracts to trustlessly manage payments by turning every task into a programmable "Job" with conditional payment release after validation.
  - kind: factual
  - needs: at least one news / explainer source.
- [ ] c05: EIP-8141 ("Frame Transaction"), authored by Vitalik Buterin and targeted for the Hegotá upgrade in H2 2026, introduces a frame-based transaction type with default code so existing EOAs can use smart-account features (P256 / SECP256K1 verification, social recovery, gasless flows) without deploying contract code or relying on bundlers.
  - kind: factual
  - needs: EIP-8141 spec + secondary commentary.
- [ ] c07: ERC-8211 ("Smart Batching"), introduced by Biconomy in 2026, lets several blockchain operations execute together while resolving transaction values in real time — an infra EIP that agentic / DeFi agent flows benefit from.
  - kind: factual
  - needs: at least one news source.

## EIP-8126 deep dive
- [ ] c08: ERC-8126 ("AI Agent Verification") — also referenced in the Magicians thread title as "AI Agent Registration and Verification" — is a Draft Standards Track ERC created on 2026-01-15 by Leigh Cronian (@cybercentry) and Chris Johnson; as of February 10, 2026 the proposal remains Draft.
  - kind: factual
  - needs: canonical EIPs page + Magicians thread / X confirmation.
- [ ] c09: ERC-8126 declares required dependencies on EIP-155 (chain ID), EIP-191 (signed-data), EIP-712 (typed-data), EIP-721 (NFT identity), EIP-3009 (transferWithAuthorization), and EIP-8004 (Trustless Agents).
  - kind: factual
  - needs: canonical EIPs page.
- [ ] c10: ERC-8126 defines five verification categories — Ethereum Token Verification (ETV), Media Content Verification (MCV), Solidity Code Verification (SCV), Web Application Verification (WAV), Wallet Verification (WV) — each producing a 0–100 risk score; the overall risk score is the **mean** of all applicable category scores, with five risk tiers: Low (0–20), Moderate (21–40), Elevated (41–60), High (61–80), Critical (81–100).
  - kind: technical
  - needs: canonical EIPs page (s extracted) + secondary commentary.
- [ ] c11: ERC-8126 verification is privacy-preserving: providers generate Zero-Knowledge Proofs through Private Data Verification (PDV) so verification *evidence* is accessible only to the agent's wallet holder, with the on-chain attestation being a unified risk score plus proof IDs.
  - kind: technical
  - needs: spec page + secondary commentary.
- [ ] c12: ERC-8126 is "primarily an off-chain standard for verification providers" — no on-chain smart contract interface is required to submit verification requests or perform verification — but the spec defines an *optional* on-chain registry interface emitting an `AgentVerified(agentId, overallRiskScore, etvProofId, mcvProofId, scvProofId, wavProofId, wvProofId, summaryProofId)` event with a `getLatestRiskScore(agentId)` view function.
  - kind: technical
  - needs: spec page + erc8126.ai or Magicians excerpt.
- [ ] c13: ERC-8126 offers an optional Quantum Cryptography Verification (QCV) that quantum-resistant-encrypts sensitive verification data using AES-256-GCM or equivalent post-quantum encryption, returning a unique `record_id` and a `decryption_url` for authorized retrieval.
  - kind: technical
  - needs: spec page + 8126.ai or news.
- [ ] c14: Verification providers may post final risk scores and proof IDs as attestations to ERC-8004's Validation Registry, leveraging ERC-8004's pluggable validation interface and ERC-721 portable identity model.
  - kind: technical
  - needs: spec page (integration section).
- [ ] c15: Sybil-attack mitigation in ERC-8126 relies on ERC-8004's minting costs and reputation system; ERC-8126 itself does not specify a per-verification fee or stake mechanism.
  - kind: technical
  - needs: spec page (security considerations).
- [ ] c16: ERC-8126 ships a TypeScript / Viem reference implementation but, as of April 2026, no production mainnet contract addresses or third-party security audits have been surfaced.
  - kind: factual
  - needs: spec page + absence-of-evidence noted.

## How these EIPs compose
- [ ] c17: The 2026 AI agent stack on Ethereum can be drawn as five layers — identity (ERC-8004 Identity), reputation+verification (ERC-8004 Reputation/Validation, ERC-8126), tokenized agent assets (ERC-7857), payments / programmable jobs (ERC-8183), authenticated off-chain I/O (EIP-8128) — with adjacent infra (EIP-8141 native AA, ERC-8211 batching) increasing UX viability.
  - kind: interpretive
  - needs: synthesis from prior claims and at least one third-party stack framing.

## Open issues and contradictions
- [ ] c18: "AI EIP" is used loosely in 2026 industry coverage — sometimes meaning protocol-layer Ethereum changes that benefit AI use cases, sometimes meaning ERCs explicitly mentioning AI agents in their abstract; the ambiguity matters because most "AI EIPs" are ERCs (application layer), not core protocol changes.
  - kind: interpretive
  - needs: at least one source treating multiple EIPs as "AI" without sharp definition.
- [ ] c19: Apart from ERC-8004 (mainnet 2026-01-29), most AI-related ERCs (7857 with limited cross-ecosystem adoption, 8126, 8183) and adjacent infra EIPs (8141, 8128) were still in Draft / proposal status as of April 2026; production deployment is concentrated on ERC-8004.
  - kind: factual
  - needs: spec status pages + at least one "what's shipped vs draft" commentary.
