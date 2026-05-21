# Gaps

## Sweep 1 — 2026-05-21

All 15 claims have at least the minimum sourcing required by `PROTOCOL.md` §2.3. Technical claims about storage proofs (c04, c05), DA sampling (c06, c07), and transparency logs (c03, c13) carry both first-party docs and at least one independent technical analysis.

## Residual gaps (surfaced as Limitations / qualifiers)

- **EAS how-it-works page** [s24] was access-limited under scripted fetch; EAS-specific claims rely on the docs landing page [s11] and the schema page [s12].
- **Filecoin PoSt parameters** (window cadence, fault recovery) are not transcribed; the report cites only the high-level distinction between PoRep and PoSt.
- **Arweave SPoRA economic mechanics** are out of scope; only the proof-of-access semantics is cited.
- **EigenDA committee size and slashing rules** rely on Avail's secondary comparison [s16] rather than EigenDA primary docs.
- **Government deployments** (Estonia [s05], Dutch [s23]) are at vendor/portal level; deeper case studies not pulled in this sweep.

## Open questions

- Real-world legal acceptance of OpenTimestamps proofs in court.
- Live throughput of EAS attestations on mainnet (no first-party figure cited here).
- Independent benchmarks comparing Celestia DAS verification time vs EigenDA DAC attestation latency.
