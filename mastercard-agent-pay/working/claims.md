# Claims — Mastercard Agent Pay

## Introduction
- [ ] c01: Mastercard publicly announced a programme called "Agent Pay" in 2025 that re-uses its tokenization infrastructure to support AI-agent-initiated payments.
  - kind: factual
  - needs: Mastercard newsroom or filing using the phrase "Agent Pay" with a 2025 date
- [ ] c02: Mastercard frames Agent Pay as a partnership-led play rather than a closed product, naming Microsoft, IBM, and OpenAI as initial partners.
  - kind: factual
  - needs: primary press release(s) listing the partners

## Background: Agentic Commerce and the Payment Stack
- [ ] c03: "Agentic commerce" refers to commerce where AI agents discover, negotiate, and pay on behalf of a user, distinct from one-click or chatbot checkout.
  - kind: interpretive
  - needs: an industry/analyst definition or Mastercard/Visa/Stripe positioning document
- [ ] c04: Card networks and PSPs launched competing agentic-commerce stacks in 2025–2026, including Visa Intelligent Commerce, Stripe Agentic Commerce Protocol (with OpenAI), PayPal Agent Toolkit, and Google's Agent Payments Protocol (AP2).
  - kind: factual
  - needs: a primary announcement for each named programme
- [ ] c05: Tokenization (EMVCo / network token services) is the technical foundation reused by these agentic-payment stacks rather than a brand-new payment instrument.
  - kind: technical
  - needs: Mastercard/EMVCo doc explaining tokenization being extended for agents

## Mastercard's Strategy and Announcements
- [ ] c06: Mastercard's April 2025 announcement positioned Agent Pay as the "next frontier in commerce" and introduced "Agentic Tokens" as a new credential type.
  - kind: factual
  - needs: 2025 Mastercard press release or executive statement using both phrases
- [ ] c07: Mastercard followed the April 2025 framework announcement with productisation moves in 2025–2026: an Agent Toolkit / MCP server, ScamGuard agent-related protections, and merchant/acquirer pilots.
  - kind: factual
  - needs: developer documentation, MCP / Toolkit code or repo, and pilot/news coverage
- [ ] c08: Mastercard's agent strategy is multi-layered — combining network tokens, identity/biometrics, and merchant-side enablement — rather than a single SDK.
  - kind: interpretive
  - needs: Mastercard product page or technical brief enumerating these layers

## Technical Implementation
- [ ] c09: Agentic Tokens are issued on the same network-tokenization rails as Mastercard's existing Digital Enablement Service (MDES) / Click-to-Pay tokens, with additional metadata representing the agent and user consent.
  - kind: technical
  - needs: Mastercard developer documentation or technical white paper
- [ ] c10: Mastercard exposes its Agent Toolkit primarily through Model Context Protocol (MCP) plus SDK bindings for popular agent frameworks (e.g., LangChain), and the toolkit's source / docs are publicly available.
  - kind: technical
  - needs: public repo (GitHub) or developer-portal docs
- [ ] c11: Mastercard pairs Agentic Tokens with consumer-authentication mechanisms (Payment Passkeys / EMV 3-D Secure / biometrics) so that delegated authority is bound to a verified user.
  - kind: technical
  - needs: Mastercard or EMVCo document tying authentication to the agent-initiated flow
- [ ] c12: Mastercard's fraud / trust stack for agents (ScamGuard, Decision Intelligence) is positioned to score agent-initiated transactions and block scam-driven instructions.
  - kind: technical
  - needs: ScamGuard product page or Mastercard fraud-product brief mentioning agentic use

## Ecosystem and Use Cases
- [ ] c13: Microsoft has publicly integrated Mastercard's agent capabilities into Azure AI Foundry / Copilot Studio so that Copilot agents can transact via Mastercard.
  - kind: factual
  - needs: Microsoft or Mastercard press release; ideally a Microsoft engineering blog
- [ ] c14: IBM has integrated Mastercard agent capabilities into watsonx Orchestrate to enable enterprise agent buying flows.
  - kind: factual
  - needs: IBM newsroom or Mastercard press release naming watsonx Orchestrate
- [ ] c15: OpenAI / ChatGPT shopping integrates Mastercard rails for transaction completion in the agentic-commerce flow.
  - kind: factual
  - needs: OpenAI / Mastercard / Stripe announcement (recognising that Stripe's ACP also fronts OpenAI)

## Risk, Compliance, and Open Questions
- [ ] c16: Liability and chargeback rules for agent-initiated transactions are not yet codified in network rules and remain an open issue called out by Mastercard and analysts.
  - kind: interpretive
  - needs: Mastercard executive interview or industry analyst article explicitly noting this gap
- [ ] c17: Strong Customer Authentication (PSD2 in EU, Reg E in US) requirements may force the agent flow to fall back to a passkey-style step-up rather than fully unattended payments.
  - kind: interpretive
  - needs: regulator-side commentary or analyst article tying SCA to agentic commerce
- [ ] c18: Mastercard Agent Pay's competitive positioning is distinct from but overlaps with Visa Intelligent Commerce, Stripe ACP and Google AP2, with each emphasising a different trust anchor (network token / PSP / open protocol).
  - kind: interpretive
  - needs: comparative coverage or each provider's positioning material
