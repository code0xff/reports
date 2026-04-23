# Outline — ERC-8004 (Trustless Agents)

Eight top-level sections. Mandatory Abstract / Introduction / Limitations / References pinned.

1. **Abstract** — one-paragraph summary of what ERC-8004 standardises, why it matters, current status, and the main builder/developer-relevant claims.
2. **Introduction** — the agent-economy context, ERC-8004's role as a trust layer on top of agent-communication protocols (A2A, MCP) and agent-payment protocols (x402, AP2), current mainnet status.
3. **Background — Authors, Timeline, and Ecosystem** — proposal history (draft Aug 2025, mainnet Jan 2026), authors (De Rossi / Crapis / Ellis / Reppel), Ethereum Foundation dAI team, the Ethereum Magicians discussion, ecosystem backers (ENS, EigenLayer, The Graph, Taiko, BNB Chain).
4. **Specification — The Three Registries** — Identity (ERC-721 + URIStorage + off-chain JSON registration file), Reputation (feedback, score, tags, URI, KECCAK-256), Validation (validator-addressed hooks, response 0-100 score, getSummary). Quote the key function signatures.
5. **Developer Perspective — Writing and Integrating an ERC-8004 Agent** — registering an agent, hosting the registration file, choosing a trust model (reputation / stake-secured re-execution / zkML / TEE), combining with A2A / MCP for transport and with x402 / AP2 for payment, reading signals on-chain via getSummary, indexing via subgraphs.
6. **Builder Perspective — Running Registries, Validators, and Agent Marketplaces** — reference contracts on github.com/erc-8004/erc-8004-contracts (CC0, Hardhat, upgradeable), multi-chain deployments (BNB Chain, Scroll, 30+ networks), validator operation and economics (not specified by the ERC itself), composition with EigenLayer / zkML stacks / TEE oracles, the 45k+ mainnet agents in the first month.
7. **Limitations and Open Questions** — Sybil at the identity layer, validator incentive layer being out-of-scope, capability-verification gap flagged by independent reviewers, privacy of off-chain registration/feedback files, on-chain readability of validation results, monopolistic-aggregation concern from Ethereum Magicians.
8. **References** — `sources.jsonl` dump.
