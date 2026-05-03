## Abstract
Visa and Mastercard formally entered AI-agent payments in late April 2025, launching Visa Intelligent Commerce and Mastercard Agent Pay within one day of each other.[^s01][^s02] As of May 2026, both are extending existing card-network trust primitives, rather than replacing card rails: tokenized credentials, authentication, spend controls, and dispute/fraud guardrails are being adapted to agent-initiated commerce.[^s01][^s02][^s03] The key divergence is implementation emphasis. Visa pushes an ecosystem onboarding stack (`Trusted Agent Protocol`, `Intelligent Commerce Connect`, `Agentic Ready`), while Mastercard centers `Agentic Tokens` plus an `Acceptance Framework` for trusted-agent identification and merchant acceptance.[^s03][^s04][^s05][^s08]

## 1) Market Shift: Agentic Commerce
Visa announced Intelligent Commerce on April 30, 2025, and Mastercard announced Agent Pay on April 29, 2025.[^s01][^s02] Both describe a flow where AI agents discover products, decide, and execute payment on behalf of users under controlled permissions.[^s01][^s02] Independent reporting framed the launches as a direct move toward AI-native checkout standards.[^s10]

## 2) Visa’s Approach: Portfolio Expansion
Visa’s strategy is staged.

In April 2025, Intelligent Commerce introduced AI-ready cards, tokenized credentials, and consumer-defined controls.[^s01] In October 2025, Visa and Cloudflare introduced Trusted Agent Protocol (TAP) to help merchants identify legitimate agents and exchange trust signals.[^s05][^s11] In April 2026, Visa launched Intelligent Commerce Connect (ICC), positioning a single integration path via Visa Acceptance Platform for secure initiation, tokenization, authentication, and spend controls, including multi-network compatibility.[^s03]

Visa also expanded Agentic Ready globally (including APAC and LATAM) in April 2026 as a structured onboarding and readiness program for issuers and ecosystem partners.[^s04]

## 3) Mastercard’s Approach: Agent Pay + Agentic Tokens
Mastercard introduced Agent Pay with Agentic Tokens as a core credential and verification layer.[^s02] Its launch framing explicitly ties trusted-agent registration/verification to transaction safety and consumer controls.[^s02]

In October 2025, Mastercard and PayPal announced plans to connect Agent Pay with wallet infrastructure and pilot Mastercard’s Agent Pay Acceptance Framework.[^s07] In December 2025 LATAM communications, Mastercard stated that agent registration and verification are required before transactions occur on network rails.[^s08] In January 2026 AP coverage, Mastercard announced Australia’s first authenticated agentic transactions using Agent Pay.[^s09]

## 4) Implementation Comparison
Shared architecture:
1. Dedicated trust and authentication handling for machine-initiated transactions.[^s01][^s02][^s05][^s08]
2. Tokenized payment credentials instead of exposing raw PAN data.[^s01][^s02][^s03]
3. User-facing policy controls (limits/conditions) plus fraud/dispute safeguards.[^s01][^s02]

Differences:
- Visa foregrounds integration and interoperability (ICC as a hub/on-ramp model).[^s03]
- Mastercard foregrounds network-level acceptance rules with Agentic Tokens + Acceptance Framework.[^s02][^s08]

Inference: Visa’s narrative is ecosystem connectivity first; Mastercard’s is explicit network governance first.[^s03][^s08]

## 5) Traction and Expansion (2025–2026)
Visa reported hundreds of secure agent-initiated transactions, 100+ partners, and 20+ directly integrated agents/enablers by December 2025.[^s06] It then added business integration and regional expansion announcements in April 2026.[^s03][^s04]

Mastercard’s trajectory shows staged expansion: launch (Apr 2025), PayPal collaboration (Oct 2025), LATAM rollout (Dec 2025), and AP authenticated transactions (Jan 2026).[^s07][^s08][^s09]

However, most public metrics remain vendor-reported; third-party comparative data on approval, fraud, and chargebacks is still limited. _(vendor-stated)_ [^s06][^s08][^s09]

## 6) Risks and Practical Priorities
The core unresolved challenge is intent and liability alignment: proving who authorized what, under which constraints, and how disputes are adjudicated when an agent misbehaves. Visa’s TAP and Agentic Ready target trust signaling/readiness controls,[^s04][^s05] while Mastercard’s Acceptance Framework and Agentic Tokens target transaction-time trusted-agent enforcement.[^s02][^s08]

Practical priorities:
- Issuers: map agent permission policies to card risk engines.
- Merchants/PSPs: implement agent identification, allow/deny policy, and audit/dispute evidence capture.
- Agent builders: design for tokenized credentials, explicit user controls, and transaction transparency by default.

These priorities follow directly from the control surfaces both networks are promoting. _(inference)_ [^s01][^s02][^s03][^s08]
