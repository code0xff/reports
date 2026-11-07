# Claims

c01. Stripe launched agent-facing access to a merchant's own Stripe data on 2026-11-05 through three paths — the Stripe MCP, the Queries API, and the Reports API (300+ modeled tables) — aimed at merchants using agents like Claude or Cursor to analyze their own business, not at agents making payments on a user's behalf.

c02. Stripe's Queries API is free for all Stripe users through 2027-01-31, after which it bills per credit; the Reports API stays free — a pricing structure that subsidizes adoption during the rollout window. _(vendor-stated)_

c03. Google's internal agent-trace data (published 2026-11-06) found that stale `TODO(bug/...)`/`FIXME(bug/...)` comments pulled coding agents into unprompted, bug-ID-driven detours in 6% of encounters, adding 70% more steps, 77% more tokens, and 105% more wait time per session (p<0.0001, fixed-effects regression). _(vendor-stated — Google's own internal data, no independent replication)_

c04. mppx shipped Zone-balance payments for its `tempo` charge method on 2026-11-07 (PR #1216): a payer can settle a charge from a Zone balance via a direct withdrawal to the payee, verified by the server against the withdrawal's on-chain settlement, instead of paying on Tempo directly.

c05. (why it matters) This window's three items share a pattern distinct from the prior two editions': agents consuming a vendor's own data (Stripe) and agents getting better at working around flaws in existing systems (Google's comment hygiene finding; mppx's Zone-balance option) — not a new payment rail, identity scheme, or card-network product.
