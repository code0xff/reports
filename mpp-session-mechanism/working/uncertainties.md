# Uncertainties — mpp-session-mechanism

## Vendor-stated / early-signal claims

- **Tempo finality ~500ms**: Confirmed as "sub-second" in docs.tempo.xyz; the specific ~500ms figure appears in Tempo/MPP marketing materials but has not been independently benchmarked. _(vendor-stated)_
- **Voucher verification in microseconds**: Stated in IETF draft and mpp.dev docs. Plausible given that `ecrecover` is a precompile-level operation, but no independent benchmark is cited. _(vendor-stated)_
- **"1 million TPS and beyond"**: Quoted from tempo.xyz/blog/mpp-sessions as theoretical throughput capacity for off-chain voucher processing. Not independently verified. _(vendor-stated)_
- **10 vouchers/second rate limit**: IETF draft Section 13.3 states "SHOULD limit voucher submissions to 10 per second per session" — normative-optional guidance, not protocol-mandatory. Server implementations may vary. _(normative-optional)_

## Structurally immature / likely to change

- **IETF draft-tempo-session-00**: Submitted as an IETF draft. Drafts expire after six months without an update. Long-term governance and RFC progression are uncertain. _(early signal)_
- **mppx v0.6.17 (May 9, 2026)**: SDK is actively developed with 76 releases; API surface may change significantly before 1.0. _(early signal)_
- **Cloudflare MPP agentic payments**: Confirmed in Cloudflare docs as part of broader "agentic payments" infrastructure — not yet a stable, versioned product. _(early signal)_

## Epistemic limitations

- No independent security audit of the TempoStreamChannel escrow contract is publicly available.
- Exact Solidity state variable names (`closeRequestedAt`, `finalized`) not confirmed from fetched contract source — inferred from IETF draft prose.
- `mpp-rs` standalone Rust crate status unclear; may only exist as part of `solana-foundation/mpp-sdk`.
- Privy hot-wallet delegation integration with MPP sessions: referenced in prior context but not fetched and verified in this gather pass.
