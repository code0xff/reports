# Claims

## Introduction
- [x] c01: Visa Intelligent Commerce is Visa's platform for enabling AI agents to transact on consumers' and businesses' behalf using Visa's payment infrastructure.
  - kind: factual
  - needs: Visa primary
- [x] c02: VIC launched in April 2025 and is being deployed toward mainstream consumer use targeted for the 2026 holiday season.
  - kind: factual
  - needs: Visa announcement + independent reporting

## Background
- [x] c03: Visa's network underpinning VIC carries 4.8B credentials and 300B+ transactions annually across 150M+ merchant locations.
  - kind: factual
  - needs: Visa primary
- [x] c04: Agent-initiated commerce introduces new primitives because traditional card networks bind credentials to a human cardholder, not to a software agent acting on their behalf.
  - kind: interpretive
  - needs: Visa positioning + independent commentary

## Architecture
- [x] c05: VIC's platform exposes four service areas: Tokenization, Authentication (Passkeys + cardholder step-up), Payment Instructions, and Signals.
  - kind: technical
  - needs: developer.visa.com primary
- [x] c06: VIC provisions a new pass-through payment token specific to agents, bound to the agent so it can only be used in the context of that agent purchasing on the user's behalf.
  - kind: technical
  - needs: developer.visa.com primary
- [x] c07: Visa Intelligent Commerce Connect is a network-, scheme-, and token-vault-agnostic acceptance layer that brokers Visa and non-Visa agent payments through one integration on the Visa Acceptance Platform.
  - kind: factual
  - needs: Visa primary
- [x] c08: Intelligent Commerce Connect accepts payments initiated via multiple agent protocols including Trusted Agent Protocol, Machine Payments Protocol (MPP), Agentic Commerce Protocol (ACP), and Universal Commerce Protocol (UCP).
  - kind: factual
  - needs: Visa announcement

## Trusted Agent Protocol
- [x] c09: Visa's Trusted Agent Protocol signs the agent's identity into HTTP request headers so merchants can cryptographically verify agent legitimacy in-band.
  - kind: technical
  - needs: Visa primary + independent
- [x] c10: TAP uses HTTP Message Signatures (RFC 9421) over a Web Bot Auth-style flow with the agent recognition signature using Ed25519, plus PS256 for some consumer/payment containers.
  - kind: technical
  - needs: Visa specification
- [x] c11: Merchants discover and fetch agent public keys from Visa's well-known JWKS endpoint at https://mcp.visa.com/.well-known/jwks.
  - kind: technical
  - needs: Visa specification
- [x] c12: TAP signatures cover at minimum the `@authority` and `@path` HTTP message components and rely on an 8-minute created/expires window plus a nonce to defeat replay.
  - kind: technical
  - needs: Visa specification
- [x] c13: TAP transports three signal elements per request: Agent Intent, Consumer Recognition, and Payment Information.
  - kind: technical
  - needs: Visa primary

## Implementation
- [x] c14: Visa publishes an official MCP integration toolkit (`visa/mcp` / `visa/ai` on GitHub) including `@visa/token-manager`, `@visa/mcp-client`, and `@visa/api-client` Node/TypeScript packages.
  - kind: technical
  - needs: GitHub primary
- [x] c15: VIC uses X-Pay token-based authentication plus Message Level Encryption (MLE), rather than OAuth, for API communication.
  - kind: technical
  - needs: GitHub primary
- [x] c16: AWS and Visa published a reference integration that hosts VIC tools on Amazon Bedrock AgentCore, using AgentCore Runtime (micro-VM isolation), Identity, Gateway, Memory, and Observability.
  - kind: technical
  - needs: AWS primary
- [x] c17: The reference integration requires explicit human confirmation (`request_purchase_confirmation` followed by `confirm_purchase`) before VIC executes a payment.
  - kind: technical
  - needs: AWS primary

## Adoption & Discussion
- [x] c18: Visa and partners executed hundreds of controlled, real-world agent-initiated transactions in 2025 with partners including Skyfire, Nekuda, PayOS, and Ramp.
  - kind: factual
  - needs: Visa primary + independent
- [x] c19: Visa's Agentic Ready program, originally launched in the UK/Europe, expanded on April 29, 2026 to Asia Pacific and Latin America with 85+ additional partners.
  - kind: factual
  - needs: Visa announcement
- [x] c20: TAP differs from Google's AP2 in scope: TAP focuses on verifying the actor (agent identity, request authenticity), while AP2 focuses on the payment mandate itself across multiple rails.
  - kind: interpretive
  - needs: independent comparative analysis
