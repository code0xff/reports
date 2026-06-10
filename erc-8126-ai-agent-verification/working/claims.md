# Claims — ERC-8126

Status legend: [ ] open, [x] sourced to threshold.

## Introduction
- [x] c01: ERC-8126 is a Standards Track ERC titled "AI Agent Verification", created 2026-01-15, authored by Leigh Cronian (@cybercentry) and Chris Johnson (@virtuals_io). [s01,s02]
- [x] c02: ERC-8126's canonical front-matter and project site label it **Final**, reached unusually fast (Draft 2026-02-10 → Last Call late May → Final) — earlier-cycle summaries called it Draft, a conflict the report represents rather than resolves. [s02,s03,s05]
- [x] c03: ERC-8126 separates "identity" (ERC-8004) from "verification/trust" (its own contribution), layering above ERC-8004. [s01,s03]

## Background: agent identity and the ERC-8004 stack
- [x] c04: ERC-8004 ("Trustless Agents") defines an ERC-721-based on-chain identity registry with tokenURI metadata + Reputation/Validation registries. [s04,s06]
- [x] c05: ERC-8004 is itself a recent, still-evolving Draft (created 2025-08-13). [s04]
- [x] c06: A broader agentic-payments/identity ecosystem (x402 on EIP-3009, A2A) is forming that ERC-8126 plugs into. [s07,s08]
- [x] c07: ERC-8126 retrieves agent metadata via tokenURI(agentId) on the ERC-8004 Identity Registry (agentWallet, contractAddress, imageUrl, solidityCode, url) — though the community noted no standardized extraction schema. [s01,s03]

## Technical anatomy
- [x] c08: ERC-8126 defines five verification types — ETV, MCV, SCV, WAV, WV — each mapped to an external standard (OWASP SCSVS/WSTG, C2PA). MCV applies only when the agent has media. [s01,s02]
- [x] c09: Verification is privacy-preserving via PDV producing ZKPs; underlying data not stored; risk score accessible only to the wallet holder. [s01,s02]
- [x] c10: ERC-8126 specifies a 0–100 risk score in five tiers, aggregated as the arithmetic mean of applicable verification scores. [s01,s02]
- [x] c11: Verification executes off-chain (no gas, evolving logic, competing providers) with only an optional on-chain interface (AgentVerified event, getLatestRiskScore). [s01,s02]
- [x] c12: ERC-8126 declares dependencies on EIP-155, 191, 712, 3009, 721, and ERC-8004. [s02]
- [x] c13: ERC-8126 includes an OPTIONAL QCV path using AES-256-GCM with quantum-resistant key exchange. [s01]
## Critical analysis
- [x] c14: Off-chain provider execution reduces the guarantee to provider honesty/independence; the spec itself lists provider collusion as an attack vector mitigated only by using multiple providers. [s01,s03]
- [x] c15: Arithmetic-mean aggregation can mask a single critical sub-score; the community itself debated simple-average vs weighted models. (interpretive) [s02,s03]
- [x] c16: The spec states a score reflects compliance at verification time and does not guarantee future agent behavior. [s01]
- [x] c17: PDV's assumed ZK tooling (e.g. Groth16) requires trusted-setup ceremonies and audited circuits, which the spec acknowledges. [s01]
- [x] c18: ERC-8126's stability is structurally capped by ERC-8004's immaturity — including ERC-8004's still-unfinished Validation Registry. [s04,s06]

## Discussion: implications & adoption outlook
- [x] c19: There is a real 2025–2026 demand signal for agent trust/verification on Ethereum (ERC-8004 mainnet, x402, A2A), independent of ERC-8126. [s07,s08,s10]
- [x] c20: ERC-8126 is closer to a vendor/implementer-shaped spec than a consensus standard: single-origin authorship (@cybercentry + Virtuals), a self-published three-standard suite with marketing sites, and scarce independent analysis. (interpretive) [s05,s09,s03]
