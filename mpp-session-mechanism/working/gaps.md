# Gaps — Gather Pass 1 (2026-05-11)

## Under-sourced claims

- **c05** (Tempo ~500ms finality): docs.tempo.xyz describes "deterministic sub-second finality" but does not give an exact 500ms figure. The 500ms number comes from prior MPP blog context. Marked _(vendor-stated — sub-second confirmed, 500ms specific unverified)_.
- **c06** (2D nonce, fee sponsorship): docs.tempo.xyz confirms "expiring nonce system" for concurrent transactions and "gasless transactions" sponsorship. "2D nonce" terminology not explicitly used; functionality confirmed.
- **c09** (channel state fields): IETF draft s02 confirms `acceptedCumulative`, `spent`, `settledOnChain`; `closeRequestedAt`/`finalized` field names not in extracted draft text — likely in contract source.
- **c25** (RFC9457 error types): IETF draft s02 confirms 8 specific problem URIs; the draft lists more than the two initially scoped (`invalid-signature`, `insufficient-balance`). All 8 should be documented.
- **c28** (mpp-rs Rust SDK): Web search confirms Solana's mpp-sdk includes Rust code, but an independent `mpp-rs` crate was not definitively confirmed as a standalone package. Marked _(single-sourced from search snippet)_.
- **c29** (Cloudflare integration): s06 confirms Cloudflare MPP integration but describes it as "agentic payments" — not specifically "Cloudflare AI Gateway" branding. Terminology softened in draft.

## Conflicting evidence

- None found.

## Sections with no independent primary source

- **Section 8 — Performance**: Sub-ms latency for sessions vs ~500ms for charge is repeated across multiple vendor sources but not independently benchmarked. All latency figures are vendor-stated.
- **Section 7 — Server Security**: Crash-safety "spend-first" pattern and ~10/s DoS rate limit confirmed in IETF draft (s02). No independent security audit found.

## Open questions after pass 1

- Exact Solidity field names for channel state (`closeRequestedAt`, `finalized`) — not confirmed from fetched sources.
- Whether `mpp-rs` is a standalone crate or only exists within `solana-foundation/mpp-sdk`.
- Privy hot-wallet delegation integration with MPP sessions — not fetched in this pass.
- Independent performance benchmarks for voucher verification speed.
- Public security audit: none found.

## Status

All 29 claims have at least one source. Claims c05, c06, c09, c28, c29 are partially confirmed with minor terminology gaps. **Gap list is acceptable for publishing after minor wording adjustments in draft.**
