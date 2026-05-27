# Gaps

## Sweep 1 — 2026-05-27

All 18 claims have at least the minimum sourcing per `PROTOCOL.md` §2.3. The endpoint, schema, ranking, and MCP claims (c04–c13) rest on the CDP Bazaar docs [s01]; the code claims (c14–c16) on bazaar.ts [s05], the extensions directory [s06], and the HeimLabs tutorial [s04].

## Residual gaps (surfaced as Limitations / qualifiers)

- **Coinbase launch page** [s02] was access-limited under scripted fetch; launch date (2025-09-10) and the "self-improving / self-configuring" framing are corroborated via Yahoo [s03] and MEXC [s10].
- **x402.gitbook.io Bazaar page** [s07] returned 404/redirect at fetch time; the GitBook concept is referenced but quoted minimally.
- **Exact quality-ranking weights** — the docs describe the *signals* (buyer reach, volume, recency, metadata completeness) but not the numeric weighting; out of scope.
- **Non-CDP facilitator discovery** — whether facilitators other than Coinbase's CDP run their own Bazaar-style index is not confirmed; x402 spec is facilitator-agnostic but the live Bazaar is CDP-hosted.

## Open questions

- Whether the Bazaar index is queryable without a CDP API key.
- How spam/sybil resistance works given auto-indexing on first settlement.
- Whether other ecosystems (MPP, Circle) will expose a comparable discovery index.
