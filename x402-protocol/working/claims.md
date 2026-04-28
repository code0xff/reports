# Claims: x402 Protocol

## Introduction

- [ ] c01: HTTP 402 "Payment Required" was reserved in RFC 7231 but left without a formal definition for over 30 years.
  - kind: factual
  - needs: RFC 7231 text or historical source confirming 402 was reserved but undefined

- [ ] c02: x402 was publicly launched by Coinbase Developer Platform in May 2025.
  - kind: factual
  - needs: official announcement or blog post with a May 2025 date

- [ ] c03: x402 is designed to enable AI agents to make autonomous, machine-to-machine payments without human intervention or API keys.
  - kind: technical
  - needs: primary source (spec or official docs) describing the agent payment use case

## Core Protocol Architecture

- [ ] c04: The x402 protocol defines three custom HTTP headers — PAYMENT-REQUIRED, PAYMENT-SIGNATURE, and PAYMENT-RESPONSE — that carry all payment data outside the response body.
  - kind: technical
  - needs: spec or official documentation confirming these three headers and their roles

- [ ] c05: The facilitator is a trust-minimizing intermediary that verifies and settles payments without being able to alter the recipient address or amount, which are cryptographically bound by the client's EIP-712 signature.
  - kind: technical
  - needs: exact EVM scheme spec or official docs confirming this constraint

- [ ] c06: x402 V2 replaced deprecated X-* prefixed headers (e.g., X-PAYMENT) with standardized headers (PAYMENT-SIGNATURE, PAYMENT-REQUIRED, PAYMENT-RESPONSE) and moved all payment data into HTTP headers, freeing the response body.
  - kind: technical
  - needs: V2 launch article or changelog confirming this migration

- [ ] c07: The CDP Facilitator exposes /verify and /settle REST endpoints that resource servers call to validate and execute payments.
  - kind: technical
  - needs: official Coinbase docs or spec confirming these endpoints

## Payment Schemes

- [ ] c08: The `exact` scheme on EVM supports three asset transfer methods: EIP-3009 (for USDC/EURC), Permit2 (for any ERC-20), and ERC-7710 (for smart contract accounts with delegation).
  - kind: technical
  - needs: exact EVM scheme spec (scheme_exact_evm.md) confirming all three methods

- [ ] c09: The Permit2 proxy contract for x402 is deployed at the canonical address 0x402085c248EeA27D92E8b30b2C58ed07f9E20001.
  - kind: factual
  - needs: official spec or documentation confirming this address

- [ ] c10: The `upto` scheme allows clients to authorize a maximum spending limit and pay only for actual resource consumption, enabling metered-pricing use cases such as per-token LLM inference.
  - kind: technical
  - needs: official documentation or spec describing upto scheme behavior

- [ ] c11: Cloudflare proposed a `deferred` payment scheme that batches micropayments into periodic on-chain settlements, targeting high-throughput scenarios such as web crawling.
  - kind: technical
  - needs: Cloudflare blog post or x402 source confirming deferred scheme proposal

## Extension System

- [ ] c12: Bazaar is a resource discovery extension built into x402 that allows payment-gated APIs to advertise input/output schemas, making them indexable on agentic.market without manual submission.
  - kind: technical
  - needs: official x402 docs or Algorand AVM extension docs describing Bazaar

- [ ] c13: Sign-in-with-x (SIWx) is a planned authentication extension based on CAIP-122 that enables wallet-controlled sessions, eliminating repeated on-chain interactions for authenticated access.
  - kind: technical
  - needs: V2 launch article or official docs describing SIWx

- [ ] c14: x402 V2 added two gas sponsorship extensions — EIP-2612 Gas Sponsorship (for permit-capable tokens) and ERC-20 Approval Gas Sponsorship (for base ERC-20s like USDT) — enabling gasless payments for any ERC-20 token.
  - kind: technical
  - needs: Coinbase ERC-20 launch announcement or official docs describing these extensions

- [ ] c15: Google's A2A x402 Extension implements a three-message flow (payment-required, payment-submitted, payment-completed) to enable agent-to-agent commerce within the A2A protocol.
  - kind: technical
  - needs: a2a-x402 GitHub repo README or spec

- [ ] c16: x402 provides a Model Context Protocol (MCP) integration that enables per-tool monetization, allowing MCP servers to charge for individual tool calls with multi-chain support.
  - kind: technical
  - needs: mcp-go-x402 or Cloudflare blog describing MCP integration

## Multi-Chain and Token Support

- [ ] c17: The CDP Facilitator supports Base, Polygon, Arbitrum, World Chain, and Solana on mainnet, using CAIP-2 identifiers (e.g., eip155:8453 for Base, solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp for Solana mainnet).
  - kind: factual
  - needs: CDP network support documentation listing these networks and CAIP-2 IDs

- [ ] c18: The protocol supports all ERC-20 tokens on EVM via Permit2, and SPL tokens (v1 and v2) plus Token2022 tokens on Solana, going beyond its initial USDC-only scope.
  - kind: factual
  - needs: network support docs or ERC-20 launch announcement

- [ ] c19: Community facilitators extend x402 to additional networks including Stellar, Algorand, TRON, BNB Chain, and Bitcoin, beyond the chains natively supported by the CDP Facilitator.
  - kind: factual
  - needs: awesome-x402 list or ecosystem page confirming community facilitators for these chains

## Ecosystem, Governance, and Adoption

- [ ] c20: The x402 Foundation was co-founded by Coinbase and Cloudflare in September 2025 to steward protocol governance as an independent entity.
  - kind: factual
  - needs: Cloudflare blog post or x402.org confirming foundation launch date and co-founders

- [ ] c21: By early 2026, x402 had processed over 119 million transactions on Base and 35 million on Solana, with approximately $600 million in annualized payment volume.
  - kind: factual
  - needs: two independent sources citing these metrics

- [ ] c22: The CDP Facilitator offers 1,000 free monthly transactions and charges $0.001 per transaction beyond that threshold, with the protocol itself imposing no additional fees.
  - kind: factual
  - needs: official Coinbase pricing documentation

- [ ] c23: Major technology and financial companies — including AWS, Stripe, Vercel, Google, Visa, and Circle — have announced support for or integration with x402.
  - kind: factual
  - needs: ecosystem page or official announcements confirming each partner

## Limitations and Discussion

- [ ] c24: x402 payments are irreversible push payments with no native refund mechanism defined in the protocol, requiring out-of-band solutions or future escrow extensions.
  - kind: technical
  - needs: official FAQ or documentation confirming the no-refund constraint

- [ ] c25: The official ROADMAP.md file for x402 contains only a placeholder ("update coming soon"), indicating a transparency gap in the project's public governance documentation.
  - kind: factual
  - needs: direct verification of the ROADMAP.md content

- [ ] c26: Published transaction volume metrics for x402 may be inflated because blockchain tokens with "x402" in their name are sometimes counted alongside genuine protocol transactions.
  - kind: interpretive
  - needs: at least one independent analysis noting this conflation
