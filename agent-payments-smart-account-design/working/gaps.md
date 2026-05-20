# Gaps

## Sweep 1 — 2026-05-20

All 23 claims have at least the minimum sourcing required by `PROTOCOL.md` §2.3. Design-blueprint claims (c16–c21) rely on canonical EIP and spec sources plus first-party docs from each named infrastructure.

## Residual gaps (surfaced as Limitations / qualifiers)

- **ERC-7093 deployment status** — the standard interface is defined [s34] but actual deployed implementations across the six provider stack are uneven; this report cites the standard for the requirement, not for adoption claims.
- **Operational benchmarks** — gas-after-paymaster, claim cadence latency, and per-merchant throughput numbers are not available across providers as a clean apples-to-apples set. The blueprint cites design knobs (3× / 5× deposit multiplier, claim cadence) without proposing a "right" value.
- **LLM prompt-injection mitigation patterns** — academic work [s31][s32] frames the threat but does not prescribe a particular signed-cart format that all providers should adopt; the draft is honest that this is still emerging.
- **Cross-rail dispute model** — Visa TAP/Mastercard Agent Pay keep dispute inside the card network [s01][s02][s03] while on-chain rails have no standardised dispute path. The draft surfaces this gap explicitly rather than papering over it.

## Open questions for follow-up

- Whether a single "agent-payments smart account" reference implementation (combining ERC-7579 + EIP-7702 + SmartSessions + Paymaster + AP2 Mandate carry) will emerge before standards stabilise.
- Whether Coinbase Spend Permissions' deliberate avoidance of ERC-4337 EntryPoint will spread or remain a Coinbase-specific choice.
- Whether MetaMask Delegation Toolkit's "off-chain delegation" model becomes the default UX for agent permission requests.
