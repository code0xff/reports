## Introduction

Visa Intelligent Commerce (VIC) is Visa's platform for letting AI agents transact on consumers' and businesses' behalf using Visa's payment infrastructure — agent-issued tokens, passkey-anchored authentication, payment instruction APIs, and a directory-backed protocol that lets merchants verify the agent on the wire.[^s01][^s02] VIC launched in April 2025 and Visa is positioning it for mainstream consumer use targeted at the 2026 holiday season, with the Agentic Ready program already operational in the UK, Europe and (as of April 29, 2026) Asia Pacific and Latin America.[^s09][^s11][^s12] As of mid-2026, the entire system is still pilot-scale — measured in hundreds of live agent-initiated transactions rather than mass-market volume.[^s09]

The remainder of this report covers (1) the platform's four service areas; (2) the Trusted Agent Protocol (TAP) wire format that VIC and partner protocols ride on; (3) the concrete developer surface (Visa Developer APIs, the `visa/mcp` toolkit, and AWS's Bedrock AgentCore reference architecture); and (4) the broader ecosystem and how VIC fits among AP2, ACP, and HTTP-payment protocols like x402.

## Background

Visa's network rates — 4.8B credentials, 150M+ merchant locations, 300B+ transactions per year — are the reason a "let agents pay too" play has economic gravity in the first place.[^s01] But conventional card credentials bind to a human cardholder, not to a software agent acting on that cardholder's behalf; this is the gap VIC is built to close, by issuing **agent-bound tokens** and accompanying them with a protocol that proves an HTTP request actually came from a trusted agent and not from a generic bot.[^s02][^s10] Independent commentary describes this as repositioning the network's trust model around the *actor*, complementary to but distinct from protocols that focus on the payment mandate itself.[^s13]

## Architecture — the VIC platform

The Visa Developer overview decomposes VIC into four integrated service areas:[^s02]

1. **Tokenization.** VIC provisions a "new pass-through payment token, specific to agents," for use at Visa-accepting merchants. The token is bound to the agent, "can only be used in context of the agent making purchases on the user's behalf," and is provisioned through the Visa Token Service.[^s02]
2. **Authentication.** Cardholder step-up plus Passkey setup: VIC stores a Visa Payment Passkey that future Payment Instructions are authenticated against. The reference integration uses FIDO device binding to create the passkey at enrollment.[^s02][^s06]
3. **Payment Instructions.** APIs to enroll the agent's token, submit a user instruction, retrieve credentials needed to fulfil that instruction at a merchant, and submit the outcome back to Visa.[^s02]
4. **Signals.** A back-channel for commerce data that feeds dispute resolution and post-purchase protection records.[^s02]

The operational lifecycle the docs walk through is: agent onboarding → user account creation with card provisioning and step-up verification → passkey establishment → user authorization of a specific purchase instruction → agent retrieval of payment credentials (validated against the authenticated instruction) → merchant payment completion via guest checkout or key entry → VisaNet enforcement of network-level controls → commerce signal submission for dispute resolution.[^s02]

**Visa Intelligent Commerce Connect** is the acceptance-side counterpart. It is a network-, scheme-, and token-vault-agnostic layer on top of the Visa Acceptance Platform that brokers Visa and non-Visa card payments initiated by agents through a single integration.[^s07][^s08] Visa describes Connect as accepting payments initiated via "Trusted Agent Protocol, Machine Payments Protocol (MPP), Agentic Commerce Protocol (ACP), and Universal Commerce Protocol (UCP)."[^s08] The initial pilot partners listed at announcement include Aldar, AWS, Diddo, Highnote, Mesh, Payabli and Sumvin.[^s08] Connect also handles "AI-ready" catalog normalization so merchant inventories can be discovered by agent platforms.[^s07]

## Trusted Agent Protocol (TAP)

TAP is the wire-level piece. It is "an open specification that signs an AI agent's identity into HTTP request headers" so any merchant can answer cryptographically whether a request came from a trusted agent.[^s10][^s15]

**HTTP message signatures.** The specification page documents two header fields used to carry the signature: `Signature-Input` (which contains created/expires timestamps, key identifier, algorithm, nonce, and a tag) and `Signature` (the signature value itself).[^s04] The agent recognition signature uses **Ed25519**, and certain container objects (consumer and payment data) are signed with **PS256**.[^s04] This is the RFC 9421 HTTP Message Signatures shape used by emerging Web Bot Auth designs.[^s15]

**Key directory.** Visa publishes a JWKS at the well-known endpoint `https://mcp.visa.com/.well-known/jwks`, and merchants resolve agent public keys by key ID from this set.[^s04]

**Request binding and replay protection.** The signature covers, at minimum, the `@authority` and `@path` HTTP message components, so any modification of authority or path invalidates the signature; together with merchant-specific, purpose-bound, time-limited semantics this is what keeps a captured signature from being reused on a different site or page.[^s03][^s04] A nonce blocks replay within an 8-minute created/expires window — "if the nonce received matches a recorded nonce, the message should be blocked."[^s04]

**Three signal elements.** Per request, TAP transports:[^s03]

- **Agent Intent** — an attestation that the agent is a Visa trusted agent and what it intends to do (browse, fetch product details, purchase a specific item).
- **Consumer Recognition** — verifiable consumer data (merchant account tokens, device identifiers for repeat customers, country/postal code parameters), so the merchant can treat the visitor as a known account when applicable.
- **Payment Information** — flexible carriage of payment data: hashed credentials for key-entry verification, API/protocol-based token passing, or an IOU posture for deferred settlement.

The spec is open and is hosted on GitHub at `visa/trusted-agent-protocol`.[^s05]

## Implementation — building against VIC

Visa publishes an MCP-first integration toolkit at `visa/mcp` (mirrored as `visa/ai`), which gives developers three Node/TypeScript packages plus reference apps:[^s06]

- **`@visa/token-manager`** — generates JWE tokens for MCP authentication.
- **`@visa/mcp-client`** — MCP client with automatic auth wiring.
- **`@visa/api-client`** — REST client supporting **X-Pay token-based authentication** plus **Message Level Encryption (MLE)**. Importantly, the API surface uses X-Pay rather than OAuth, and traffic is MLE-encrypted in addition to TLS.[^s06]

The repository also ships a Documentation MCP Server at `https://sandbox.mcp.visa.com/mcp/doc` exposing a `get-docs` tool so the agent can pull structured API schemas at build/runtime. The `vic-agent/` demo (LangGraph-powered) walks through VTS card tokenization, FIDO device binding, Visa Payment Passkey creation, and VIC enrollment in a single workflow.[^s06]

**Reference cloud architecture (AWS).** AWS published a joint reference integration that hosts VIC tooling on **Amazon Bedrock AgentCore**.[^s12] The architecture leans on five AgentCore building blocks: **Runtime** (serverless host for agents and MCP servers, with micro-VM sandboxes that isolate payment credentials and PII), **Identity** (inbound auth via Amplify, outbound auth to Visa endpoints), **Gateway** (governed, auditable access to MCP servers and external tools), **Memory** (short-term conversational state, future long-term preferences), and **Observability** (OpenTelemetry-based audit trace of every reasoning step, tool call, MCP invocation, and auth flow).[^s12] At payment time the agent calls a `request_purchase_confirmation` tool (which surfaces an explicit human confirmation) and only then triggers `confirm_purchase`, which invokes VIC APIs to retrieve credentials, authenticate against the user's passkey, and complete the transaction.[^s12]

**End-to-end implementation outline.** Putting the pieces together, a minimal agent → VIC → merchant flow looks like:

1. Enroll the agent and onboard the user — VTS tokenization, step-up verification, FIDO device binding, Passkey creation.[^s02][^s06]
2. When the user issues an instruction (e.g., "book this flight under $400"), submit it as a Payment Instruction so VIC has an authenticated record bound to the passkey.[^s02]
3. The agent walks the merchant. For merchants that participate in TAP, every request the agent sends carries `Signature-Input` + `Signature` headers; the merchant verifies against the JWKS at `mcp.visa.com/.well-known/jwks` and reads the three signal elements off the request.[^s03][^s04]
4. At checkout, the agent calls VIC's Payment Instructions API to retrieve the credentials needed (and, on the AWS reference architecture, requires explicit user confirmation first).[^s02][^s12] If the merchant is on Intelligent Commerce Connect, the same flow works for non-Visa networks via the same integration.[^s07][^s08]
5. After purchase, the agent posts the outcome and any Signals back to VIC for dispute and reconciliation records.[^s02]

## Adoption and discussion

Adoption to date is pilot-scale. Visa reported "hundreds of controlled, real-world agent-initiated transactions" with named pilot partners Skyfire, Nekuda, PayOS and Ramp; the company says over 100 global partners and 30+ in the VIC sandbox, with 20+ agents integrated directly.[^s09] Use cases tested span Skyfire/Consumer Reports product purchases, Nekuda enabling Gensmo purchases from Fabrique, PayOS's B2B/online shopping with BeyondStyle/Jomashop, and Ramp B2B bill payments with cashback capture.[^s09] The Agentic Ready program, originally UK/EU, expanded on April 29, 2026 to Asia Pacific and Latin America with 85+ additional partners coming online.[^s11]

In competitive context, independent analysis frames TAP as fundamentally about *actor verification* — proving "this HTTP request is from a legitimate Visa-onboarded agent" — and contrasts it with Google's AP2, an open, payment-agnostic mandate framework that lets agents transact across cards, bank transfers, or stablecoins, and with OpenAI/Stripe Instant Checkout, which is a conversational checkout UX rather than an actor-verification protocol.[^s13] These are complementary, not strictly competing — Intelligent Commerce Connect explicitly states it will accept payments initiated through TAP, MPP, ACP and UCP, so the same merchant can absorb agent traffic from multiple protocol families on one integration.[^s08] The same independent analysis warns that cryptographic actor verification alone is not enough: it has to be paired with behavioral and risk infrastructure to detect a *legitimately onboarded* agent that has gone off-script.[^s13]

For implementers, the practical takeaway is straightforward: if you are building an agent that needs to pay, target VIC's Payment Instructions + Tokenization APIs via the `visa/mcp` toolkit (or the Bedrock AgentCore reference if you are on AWS); if you are building a merchant, target Intelligent Commerce Connect on the Visa Acceptance Platform and verify inbound TAP signatures against the well-known JWKS; in both cases, plan for X-Pay + MLE rather than OAuth, and plan a human-confirmation step before each settled transaction.[^s02][^s04][^s06][^s12]

## Limitations

- Production scale is pilot-level; "hundreds of transactions" is the largest verifiable count and "mainstream adoption by 2026 holiday season" is a vendor projection, not a measured outcome.[^s09]
- Visa's well-known JWKS endpoint and the precise `alg`/key-rotation policy are documented as today's contract but not pinned by an external standards body; integrators should treat the URL and algorithm list as configurable.
- The exact authorization-time rule set VisaNet applies to agent-bound tokens (which agents can spend, under what limits) is described qualitatively in product copy; the public docs do not enumerate the controls.
- The AWS reference integration's tool names (`request_purchase_confirmation`, `confirm_purchase`) are sourced to AWS's blog only and were not independently re-verified against Visa's own developer documentation.

## Abstract

Visa Intelligent Commerce (VIC) is Visa's agentic-commerce platform: a four-part service surface (Tokenization, Authentication/Passkey, Payment Instructions, Signals) plus an acceptance-side aggregator (Intelligent Commerce Connect) that brokers Visa and non-Visa card payments through one integration on the Visa Acceptance Platform. It rides on the Trusted Agent Protocol (TAP), an open spec that signs an agent's identity into HTTP request headers using RFC 9421 HTTP Message Signatures: agent-recognition signatures use Ed25519 (some container objects use PS256), public keys resolve via JWKS at `mcp.visa.com/.well-known/jwks`, signatures bind `@authority`/`@path`, and replay is bounded by an 8-minute window plus a nonce. Each TAP request carries three signal elements — Agent Intent, Consumer Recognition, Payment Information. Implementation is concrete today: Visa publishes a `visa/mcp` Node/TypeScript toolkit (`@visa/token-manager`, `@visa/mcp-client`, `@visa/api-client`) using X-Pay tokens and Message Level Encryption (not OAuth), and AWS ships a Bedrock AgentCore reference integration with isolated micro-VM runtime, identity/gateway/memory/observability components, and a mandatory human confirmation step before settlement. Adoption is still pilot-scale (hundreds of real transactions, partners including Skyfire/Nekuda/PayOS/Ramp), but Intelligent Commerce Connect accepts initiations from multiple protocol families (TAP, MPP, ACP, UCP), and the Agentic Ready program is now operational in the UK, EU, and as of April 29 2026 in Asia Pacific and Latin America. TAP's contribution is best understood as *actor verification* — orthogonal to mandate-centric frameworks like Google's AP2 — and independent analysis cautions that it must be paired with behavioral risk tooling to catch onboarded-but-misbehaving agents.
