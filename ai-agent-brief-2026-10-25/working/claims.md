# Claims — ai-agent-brief-2026-10-25

## What moved

c01. Between 2026-10-22 and 2026-10-24, a third party (AgenticFinanceGraph) measured 32,605 x402 settlements across 80 Bazaar-listed Base sellers (12–23 Oct) and found 1,126 (3.5%) at least 10x the seller's own median, 65 at least 100x, and 25 of those at least $1 — the first mainnet-scale evidence of how often the price-drift pattern from issue #3866 actually occurs, framed by its own author as a ceiling, not proof of exploitation.

c02. Three independently built implementations (the x402-foundation core PR #3920, Tanilo's `@tanilo/x402-guard` package, and a third referenced in the thread) converged on the same design — bind the expected price/recipient/asset at the moment a quote is first accepted, reject any later drift pre-signature — and in the process of reviewing each other, found gaps in each other's code: Tanilo disclosed its own package only checked payTo when the terms explicitly named one, and a reviewer (NSPG13) found a concurrency race in PR #3920 itself where two simultaneous calls on a fresh client can both pass the empty-ledger check before either anchor is written.

c03. PR #3920 remained open and under active review as of 2026-10-24T22:15Z, not yet merged into `@x402/core`.

c04. On 2026-10-24, a new issue (#3930) reported that x402's Python `register_exact_evm_client`/`register_exact_svm_client` helpers filter V2 network registration by the caller's `networks` argument but register the V1 scheme for every legacy network regardless — so a client explicitly scoped to a testnet still signs a V1-scheme mainnet payment if the server answers with a V1 402. The TypeScript equivalent helpers already filter V1 by `networks`; the Python/Go helpers do not. _(unverified — single source, no maintainer response yet)_

c05. On 2026-10-23, PR #3910 (open, not yet merged) proposed adding a `payer !== payTo` self-payment prohibition to `x402Facilitator.verify()`/`settle()`, to block wash-settlement (an address paying itself to inflate apparent sales volume or abuse settlement-gated catalog indexing), plus pre-signing invariants for multi-transaction atomic-group and fee-sponsorship mechanisms.

c06. On 2026-10-23, Go and Python ports (PRs #3881 and #3877, both merged) closed a gap where `ResolveSettlementOverrideAmount`/`resolve_settlement_override_amount()` accepted a percent or dollar settlement override that resolved above the amount actually authorized in `PaymentRequirements` — e.g., a 500% override of 1,000,000 atomic units previously resolved to 5,000,000 before the fix. This was a port of a fix already merged in the TypeScript SDK (PR #3338), tracked under issue #3876 ("SDK drift").

## Why it matters

c07. x402's price- and settlement-safety hardening this window happened entirely through public GitHub review among competing implementers and independent security researchers, not through the x402 Foundation issuing a spec ruling or a coordinated disclosure; no fix has merged into `@x402/core` yet.

c08. The pattern repeats across three unrelated code paths this window (client-side price drift, V1/V2 network-scoping, settlement overrides) — each a case where one of x402's three SDKs (TypeScript, Python, Go) implemented a safety check the others lacked, rather than a single shared defect.
