# Gaps — MPP

## Resolved
- All 24 claims (c01–c24) meet the minimum source threshold:
  - Core protocol mechanics: covered by primary mpp.dev docs (s01–s16) plus the IETF draft (s20) and the spec repo (s19).
  - Origin/governance/maturity: corroborated across mpp.dev (s17), Stripe (s18), GitHub (s19), IETF (s20), Cloudflare (s21), and independent explainers (s22, s24).

## Remaining gaps (carried to Limitations)
- **Session intent page**: `mpp.dev/intents/session` returned 404 on 2026-06-03. Session mechanics are reconstructed from the WebSocket transport (s08), Tempo method (s16), refunds (s14), payment-methods (s11), and an independent explainer (s22). The dedicated session spec page could not be read directly.
- **MPP vs x402 page**: `mpp.dev/comparison/mpp-vs-x402` returned 404. The comparison is sourced from Cloudflare (s21) and the formo explainer (s22) instead of the canonical comparison page.
- **Adoption volume figures** (~31,100 tx / ~$3,730): single-source (s22) and explicitly self-flagged as unverified and two weeks stale at time of writing. Marked unverified in the draft.
- **EIP-712 voucher / ecrecover session detail**: primary-doc confirmation is indirect (s08/s16 describe channels and near-zero latency); the EIP-712/ecrecover specifics come from the independent explainer (s22). Qualified in prose.
- No independent security audit of the reference implementation was found.
