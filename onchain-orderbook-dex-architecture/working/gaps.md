# Gaps

## Iteration 1 (2026-06-29)

All 15 claims (c01–c15) meet the minimum sourcing threshold (PROTOCOL §3):
- Factual (c06, c15): ≥2 independent sources.
- Technical (c01–c05, c07–c11): ≥1 primary/technical source each.
- Interpretive (c12–c14): ≥1 source, marked interpretive.
- Academic tier-1 sources present: s10 (MEV survey), s11 (FBA vs CLOB).

### Conflicts / nuances to present (not resolve) in draft
1. **Hyperliquid market share is volatile.** Peak ~71–80% (May–Aug 2025) → trough ~10–38% during the Aster incentive surge (Sep–late 2025) → ~44% volume / ~70% open interest (Apr 2026)[s13][s14]. → Present as a range with the Aster disruption, not a single figure.
2. **Sei pivoted.** v1 was a Cosmos-SDK trading L1 with a native on-chain orderbook module; v2 became a general-purpose parallelized EVM and de-emphasized the native orderbook narrative[s09]. → Present honestly: c11 is true for v1's design intent, but the native module is no longer the headline.
3. **Hyperliquid 200k orders/sec** is vendor-stated (own docs, s03). → Mark `_(vendor-stated)_`.

### Remaining minor gaps (acceptable → Limitations)
- No independent third-party benchmark of Hyperliquid/dYdX throughput; performance numbers are vendor docs or derived.
- Matching-engine internals (HyperCore, dYdX x/clob memclob) are documented but not all open-source-audited in depth here.

Gap list effectively empty for drafting. Proceed to Phase 5.
