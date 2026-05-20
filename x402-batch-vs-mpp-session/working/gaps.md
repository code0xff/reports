# Gaps

## Sweep 1 — 2026-05-20

All 18 claims have at least the minimum sourcing required by `PROTOCOL.md` §2.3. The EVM batch-settlement binding spec is now sourced from the canonical x402-foundation repo [s04] in addition to the conceptual spec [s03] and the Cloudflare variant [s05].

## Residual gaps (surfaced as Limitations / qualifiers)

- **TypeScript and Go reference implementations of batch-settlement** — confirmed to exist (per [s07], "TypeScript and Go implementations") but the exact package paths under `typescript/packages/mechanisms/evm/` are partially obscured by GitHub UI fetches. The code snippets in the draft are reconstructed from spec text [s04] and from the canonical Express example [s27], not from the batch-settlement mechanism package itself.
- **mpp-specs `session.md`** could not be fetched directly via raw URLs (404). Session details rely on Stellar's MPP channel guide [s15], Tempo streamed payments docs [s16], the mpp.dev streamed-payments guide [s17], the Tempo MPP Sessions blog post [s20], and the mppx SDK README [s19].
- **TempoStreamChannel contract addresses** are referenced indirectly via the existing `mpp-session-mechanism` report; this comparison report treats them as already established (the prior report's `s03`) and only cites the streamed-payments docs which describe the mechanism without explicit addresses.
- **Cumulative voucher EIP-712 type hash** for MPP — described conceptually in the Stellar guide [s15] and Tempo docs [s16] but not transcribed character-for-character in the draft.
- **x402 batch-settlement support across non-EVM networks** — none yet; the docs explicitly limit batch-settlement to EVM [s06][s07]. The draft surfaces this honestly.

## Open questions for follow-up

- Whether x402 batch-settlement will ever support bidirectional channels (it currently does not).
- Whether MPP `session` and x402 `batch-settlement` will converge into a single adapter / scheme.
- Operational characteristics under burst load (claim batching cadence, refund races) — known design parameters but no public throughput benchmark yet.
