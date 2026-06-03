# Uncertainties — MPP

- **Standards status is provisional.** `draft-ryan-httpauth-payment-01` is an Internet-Draft that *explicitly disclaims* IETF endorsement and formal standing, and expires 2026-09-19 (per datatracker). Field names, error codes (e.g. `-32042`), and `_meta` keys may change before/without standardization. _(vendor-stated / pre-standard)_
- **Vendor-led ecosystem.** Both the protocol and the canonical rail (Tempo) and a primary payment method (Stripe SPT) come from the two co-authors. Most "independent" descriptions (Cloudflare, Parallel, Zuplo, formo) are integrators/commentators, not neutral standards bodies. _(vendor-led)_
- **Adoption is early.** Production volume is negligible and self-reported; partner/SDK announcements are not the same as production traffic. _(early signal)_
- **Session detail granularity.** Exact voucher schema, escrow contract semantics, and settlement guarantees are inferred from a mix of primary docs and one independent explainer; the dedicated session spec page was unreachable at access time. _(weakly evidenced)_
- **Per-method maturity varies.** The payment-method matrix advertises rails (Monad, RedotPay, Stellar channels) whose production-readiness was not independently verified. _(immature)_
