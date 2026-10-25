# Claims

## What moved

- c01: A third-party contributor (not an x402 Foundation maintainer) opened issue #3943 and spec PR #3944 on x402-foundation/x402, proposing an `agent-messaging` extension that lets agents discover a messaging endpoint, exchange a store-and-forward mailbox, and carry `payment.request`/`payment.receipt` envelopes referencing x402 `PaymentRequirements`, explicitly without granting spending authority.
- c02: The same spec, under the identifier `x402m/1`, has a same-day reference implementation (Node + Python) in a separate, zero-star repository the proposer created, and is also under review as part of a separate PR (#71) on the Solana Foundation's fork of x402.
- c03: No x402 Foundation maintainer has commented on, reviewed, or endorsed the proposal as of this writing; the author's own update comment is the only substantive discussion on either thread.
- c04: PR #3935 on x402-foundation/x402 fixes the Python SDK bug (issue #3930, flagged unconfirmed in the 2026-10-25 brief) where `register_exact_evm_client`/`register_exact_svm_client` ignored the caller's `networks` filter for the legacy V1 payment scheme, letting a testnet-scoped client still sign a mainnet V1 payment.
- c05: PR #3935 includes new unit tests that fail on `main` and pass with the fix, and mirrors the filtering behavior already present in the TypeScript SDK; it remains unmerged and has not been reviewed by a maintainer yet.
- c06: PR #634 on universal-commerce-protocol/ucp, defining the `dev.ucp.shopping.policy.return` extension (structured, machine-readable return/refund terms across catalog, cart, checkout, and order), merged 2026-10-23, incorporating design changes from PR #966.

## Why it matters

- c07: Across this window's three items, the two x402 developments (the messaging proposal and the testnet fix) both originate from outside the Foundation's own maintainer group and remain unmerged/unendorsed, continuing a pattern this brief's predecessor also observed: x402's hardening is happening through outside review, not Foundation-led spec work.
- c08: UCP's return-policy extension, by contrast, shipped through the project's normal multi-PR review cadence (#572 → #257 → #634/#966) with a named core contributor (Ilya Grigorik) directly involved, showing a payment-adjacent protocol with a different governance model proceeding on a materially different cadence than x402's.

## Signals to watch

- c09: Whether any x402 Foundation maintainer comments on or reviews issue #3943 / PR #3944 before the one-week unsigned-commit closure window (commits must be signed per the repo's bot check) expires.
- c10: Whether PR #3935 merges, and whether the same V1-network-filter gap exists in the Go SDK (unconfirmed as of this writing).
- c11: Whether PR #3920 (the expected-amount client control from the overcharge thread) resolves the concurrency gap flagged on 2026-10-25, which remained open and unmerged as of this check.
