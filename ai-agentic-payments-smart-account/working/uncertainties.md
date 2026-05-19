# Uncertainties

This register tracks claims that are publishable but epistemically shaky as of 2026-05-19.

- **AP2, ACP, TAP adoption numbers** — early partner counts (Visa "100+ partners", AP2 "60+ organizations") are vendor-stated and likely to shift.
- **"First live agentic payment" milestone (Mastercard, Singapore, March 2026)** — single vendor source ([s10] and Mastercard product page).
- **EIP-7702 long-term security model** — multiple advisory write-ups warn about sweeping risks (sponsored relayers, delegate replacement). We surface this honestly rather than relying on vendor claims.
- **x402 transaction volume ($24M / 50M+ tx) figures** — coming from Coinbase and ecosystem posts; not yet independently audited.
- **Whether ACP, AP2, x402, and TAP converge** — currently four parallel standards (commerce / payment authorization / HTTP payment / agent identity). Convergence is the prevailing analyst narrative ([s40]) but it is an interpretive claim, not a settled fact.
- **Compliance / dispute behavior under agentic payments** — the card networks claim chargeback and KYC remain unchanged, but legal precedents for AI-initiated transactions are scant.
- **Code excerpt fidelity** — code summaries (e.g., EntryPoint `handleOps`, x402 settlement) are extracted from GitHub READMEs and spec docs rather than the running binaries. Production deployments may differ across networks.
