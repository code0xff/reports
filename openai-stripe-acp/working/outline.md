# Outline — OpenAI × Stripe Agentic Commerce Protocol (ACP)

1. **Abstract / 초록** — what ACP is and the smallest accurate description of an end-to-end flow.
2. **Introduction** — why an agent-facing commerce protocol was needed, where ChatGPT Instant Checkout fits, and what ACP scopes itself to.
3. **Background — Three parties and dated versions** — Agent / PSP / Merchant model, the dated-version release cadence, and how the spec evolved from 2025-09-29 through 2026-04-17.
4. **Architecture — Agentic Checkout + Delegated Payment** — the two sub-specs, their REST endpoints, request headers (Signature, Timestamp, Idempotency-Key, API-Version), the `vt_…` vault token, the Allowance constraint object, payment-handler discovery (`dev.acp.tokenized.card`, `psp: "stripe"`).
5. **Code-level walkthrough — example implementation** — a worked example: agent creates a checkout session, posts `delegate_payment` to the PSP, receives `vt_…`, completes the session.
6. **Analysis — comparisons and tradeoffs** — ACP vs Google AP2 (Mandates vs Vault Tokens), ACP vs Coinbase x402 (HTTP-402 vs delegated tokens), ACP vs EIP-8004 (on-chain agent identity vs off-chain payment authority), and what Stripe gets out of being the founding PSP.
7. **Discussion** — beta status, the disputed claim that Meta is a co-creator, governance path, and what's missing (dispute flow, validator economics for non-card rails).
8. **Limitations** — what this report does not cover and what is unverified.
9. **References** — generated from sources.jsonl.
