# Outline — Google AP2 (Agent Payments Protocol)

1. **초록 / Abstract** — what AP2 is, what version state it is in (v0.1 → v0.2, FIDO donation), and the smallest accurate description of how a transaction is authorized.
2. **Introduction** — why "agent-led payments" needed a new protocol layer beyond A2A/MCP, and what AP2 is specifically scoped to do (and not do).
3. **Background — A2A, MCP, and the gap AP2 fills** — where AP2 sits relative to Google's earlier agent stack, and why Verifiable Credentials / SD-JWTs entered the picture.
4. **Architecture and the Mandate model** — the five roles, agentic vs non-agentic distinction, v0.1 three-mandate model vs v0.2 two-mandate consolidation, schema fields, signing, SD-JWT structure, Human-Present vs Human-Not-Present flows.
5. **Code-level walkthrough and example implementation** — actual SDK class names, JSON schema, a worked Python example building a CheckoutMandate + PaymentMandate as SD-JWTs and exchanging them with a Merchant Agent, plus the x402 / crypto rail variant.
6. **Analysis — comparisons and tradeoffs** — AP2 vs raw A2A, AP2 vs MCP, AP2 vs Coinbase x402 alone, AP2 vs Mastercard Agent Pay; FIDO donation; ecosystem traction.
7. **Discussion** — open questions around trust models, dispute resolution, and what is still ambiguous.
8. **Limitations** — what this report does not cover and what is unverified.
9. **References** — generated from sources.jsonl.
