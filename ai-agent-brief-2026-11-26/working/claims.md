# Claims

c01. Cloudflare's "Search for Agents," GA as of November 25, 2026, lets any
     zone expose a per-site search endpoint at `/.well-known/search` that
     answers plain HTTP GET and the IETF-standardized HTTP QUERY method, and
     advertises itself to agents through `agent:*` HTML metadata rather than
     a shared external discovery spec.

c02. An independent audit of 10,000 rows (of 87,419 reported) in Coinbase's
     public x402 Bazaar discovery listing found 0 rows carry a top-level
     `method` field, and of 200 live-probed rows, 14.7% have a description
     that diverges from the live 402 challenge and 3.7% have a diverging
     price — meaning an agent following the listing's own data would guess
     wrong on access method most of the time and get stale terms on a
     meaningful minority of calls. _(single source — one contributor's
     self-run audit, not yet corroborated or disputed by the Foundation or
     Coinbase)_

c03. x402 merged atomic multi-payee splits for the Solana `exact` scheme
     (PR #3968, November 24, 2026), letting a single payment settle to a
     primary `payTo` plus up to eight additional recipients in one
     verified on-chain transaction, opt-in per facilitator via `maxSplits`.

c04. Taken together, the Bazaar audit and the multi-payee shipped feature
     show the x402 ecosystem's maturity gap running in two directions at
     once this week: payment settlement mechanics (who gets paid, how many
     ways) are shipping into production, while the basic data hygiene of
     discovery listings (what does this endpoint actually want, and is that
     description still true) lags behind adoption.
