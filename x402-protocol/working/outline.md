# Outline: x402 Protocol — Features, Architecture, and Extensions

## 1. Abstract

Summary of the report: what x402 is, its significance, key findings.

## 2. Introduction

- Background: HTTP 402 "Payment Required" — a long-reserved status code (RFC 7231) never formally defined
- Why now: the rise of AI agents requiring autonomous, machine-to-machine payments
- Origins: Coinbase Developer Platform launched x402 in May 2025
- Scope of this report: protocol specification, payment schemes, extensions, ecosystem

## 3. Core Protocol Architecture

- Four components: Client, Resource Server, Facilitator, Blockchain
- HTTP payment flow (12-step lifecycle: request → 402 → PaymentPayload → verify → settle → 200)
- Header schema: PAYMENT-REQUIRED, PAYMENT-SIGNATURE, PAYMENT-RESPONSE
- Facilitator model: /verify and /settle endpoints, trust minimization via signed authorizations
- V2 architectural changes: modular SDK, lifecycle hooks, header modernization, data in headers not body

## 4. Payment Schemes

- Scheme concept: extensible logical payment methodologies
- `exact` scheme: fixed-amount transfers
  - EVM: three asset transfer methods — EIP-3009, Permit2, ERC-7710 (smart account delegation)
  - Solana: SPL token transfers
  - Signing: EIP-712 compatible, 65-byte cryptographic proof
  - Canonical Permit2 proxy: 0x402085c248EeA27D92E8b30b2C58ed07f9E20001
- `upto` scheme: consumption-based, client authorizes max, pays actual usage
- `deferred` scheme: Cloudflare-proposed, batched settlements for high-throughput scenarios

## 5. Extension System

- Bazaar: service discovery — APIs advertise input/output schemas, indexed at agentic.market
  - bazaar_resource_server_extension for FastAPI/Flask/Django
  - Supports GET/POST endpoints with JSON Schema validation
- Sign-in-with-x (SIWx): wallet-controlled sessions via CAIP-122; planned for V2
- Gas Sponsorship Extensions:
  - EIP-2612 Gas Sponsorship (for permit-capable tokens)
  - ERC-20 Approval Gas Sponsorship (for base ERC-20s like USDT)
- Payment Identifiers: idempotency support
- A2A x402 Extension (Google Agentic Commerce): agent-to-agent payment flow
- Algorand/AVM Extensions: ExactAvmServerScheme for AVM chains
- MCP (Model Context Protocol) Integration: per-tool monetization in AI agent frameworks

## 6. Multi-Chain and Token Support

- CAIP-2 network identifiers (e.g., eip155:8453 for Base)
- CDP Facilitator supported networks: Base, Polygon, Arbitrum, World, Solana (mainnet + testnets)
- Token support: EIP-3009 (USDC, EURC), any ERC-20 via Permit2, SPL tokens on Solana, Token2022
- Protocol is chain/token agnostic — community facilitators for Stellar, Algorand, TRON, BNB, Bitcoin
- CDP Facilitator pricing: 1,000 free tx/month, then $0.001/tx

## 7. Ecosystem, Governance, and Adoption

- x402 Foundation: co-founded by Coinbase and Cloudflare (announced September 2025)
- Partners: AWS, Stripe, Vercel, World, Google, Visa, Circle
- SDKs: TypeScript (@x402/* packages), Python (pip install x402), Go
- 50+ facilitators, 100+ services, 119M+ Base transactions, 35M+ Solana transactions
- ~$600M annualized payment volume (as of early 2026)
- MCP ecosystem: 50+ MCP servers accepting x402 payments
- Adoption examples: agentic.market, AgentKit, Cloudflare Workers, Solana developer tooling

## 8. Limitations and Discussion

- Payments irreversible once settled — no native refund mechanism
- Facilitator trust requirement (single point of trust despite trust-minimizing design)
- ROADMAP.md is unpublished — governance transparency gaps
- Transaction metric inflation (memecoins labeled "x402" skew volume stats)
- No formal third-party security audits yet
- Competing approaches: L402 (Lightning Network), EVMAuth, Stripe stablecoin tooling
- EIP-3009 token dependency: initially only USDC natively supported (broadened via Permit2 in V2)
- Many extensions still "coming soon" or in active development
