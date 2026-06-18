# Uncertainties — Behavior Control Techniques for AI Agent Payments

Register of what remains epistemically shaky even if the draft ships.

- **Standard maturity / churn.** AP2 (v0.2, donated to FIDO 2026), x402 (v2), Stripe ACP (beta), MPP, IETF Payment auth draft, ERC-8004 are all young and changing; this is a 2026-06 snapshot. _(vendor-stated / draft)_
- **Vendor-stated security claims.** Visa "cannot be replayed or relayed", Mastercard tokenization, AP2 "tamper-proof audit trail" are issuer/vendor marketing language, not independent audits. Mark _(vendor-stated)_.
- **Guardrail efficacy is probabilistic.** LLM-side guardrails / prompt-injection defenses reduce but do not eliminate risk; red-team papers (AP2, Grok) show bypasses. Treat as defense-in-depth layer, not a guarantee.
- **On-chain vs off-chain enforcement.** Claim that on-chain validators are "harder to bypass" is interpretive; depends on key custody (a compromised session key still spends within its scope).
- **Taxonomy of control dimensions** (c01) is a synthesis across sources, not a single canonical standard — mark interpretive.
- **Adoption signals** for newer controls (SmartSessions, Spend Permissions, AP2 HNP) are largely project-hosted; real-world independent adoption data is thin. Independent comparison (s51) judges "broader card-based implementations are still maturing" and that no single protocol covers all scenarios — added to Limitations.
- **Off-chain vs infrastructure-level enforcement.** Application-logic spending limits are bypassable (by the agent, a compromised prompt, or a bug) unless enforced at the credential/network layer; the draft now flags this in §4 (interpretive).
