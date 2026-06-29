# Gaps

## Iteration 1 (2026-06-29)

All 16 claims (c01–c16) meet the minimum sourcing threshold (PROTOCOL §3):
- ARD/ecosystem claims (c03–c06) have independent corroboration (Google blog s06, Hugging Face s07, Search Engine Journal s08) beyond the spec itself.
- Hermes-Hub-specific implementation claims (c07–c13) rely on the project's own primary docs (site, README, ai-catalog.json) — acceptable for technical/implementation claims, flagged in uncertainties as self-reported.
- Identity/relationship claims (c14, c15) presented as a conflict with both sides attributed.

### Conflicts to present (not resolve) in draft
1. **Product identity.** Repo GitHub description: "The Skills Hub for Hermes Agent by Nous Research" (s02) vs product README/site: "the work board where AI agents get hired and paid," ARD marketplace, no Nous Research mention (s01, s03). Third-party aggregator echoes the repo description (s12). → Present both; note primary product docs do not support the Nous Research link.
2. **ARD version label.** README cites "ARD v0.9" (s03) while Hermes Hub's own ai-catalog.json declares specVersion "1.0" (s04). → Note the internal inconsistency.

### Remaining gaps (acceptable → Limitations)
- **No independent coverage of Hermes Hub itself.** All Hermes-Hub-specific facts trace to its own site/repo or aggregators echoing it; no third-party audit, security review, or usage/adoption data was found. This is the central limitation.
- ARD adoption is nascent (only Hugging Face serves a live registry; s09).
- "Machine Payments Protocol (MPP)" appears to be Hermes Hub's own Stripe-based naming (PaymentIntent + HTTP 402), not a separately documented external standard — described as the project states it.

Gap list effectively empty for drafting; the no-independent-coverage gap is surfaced honestly in Limitations. Proceed to Phase 5.
