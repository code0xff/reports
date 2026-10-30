# Claims

## What moved

- c01: On DoorDash's Q3 2026 earnings call (reported 2026-10-30), CEO Tony Xu said third-party AI agents have placed "maybe several hundred orders in total" on DoorDash so far, against a baseline of roughly 3 million deliveries/day. _(single source — no independent transcript corroboration found)_
- c02: DoorDash names Muse, Instinct, and Fo among the third-party agents currently placing orders, and positions itself as wanting a "healthy relationship with third-party agent makers" rather than blocking them (contrast with Amazon, which blocks personal AI agents).
- c03: x402 PR #3971 (merged 2026-10-29) completes a three-PR series adding Solana transaction-v1 (SIMD-0385) support to the batch-settlement, exact, and upto schemes, cutting a full channel-redemption cycle's base fees by ~29% and transaction count by ~4.2x per the PR's own measurement table.
- c04: pay-kit PR #406 (merged 2026-10-28) re-pins pay-kit's vendored x402 submodule to a rebased, not-yet-merged x402 branch commit, because the earlier pinned commit had been rebased out from under it — pay-kit depends on an unmerged x402 branch, not a released version.
- c05: mppx PR #1131 (merged 2026-10-29) adds a 15-second minimum-remaining-validity floor for Tempo sponsored transactions, after a prior attempt (#1099) was replaced following review.
- c06: mppx PR #1137 (merged 2026-10-29, ~2.5 hours after #1131) fixes a bug in #1131's own pre-sign re-check: it measured the challenge's expiry instead of the fee payer's fixed `validBefore` value, so preparation slower than ~10 seconds produced a transaction the server had to reject anyway.
- c07: mppx PR #1138 (merged 2026-10-29) is a breaking change (`feat(identity)!`) that gives every 402 challenge one shared identity nonce instead of one per offer, to fix routes with multiple payment-stage-identity offers throwing on creation.
- c08: At least two automated review findings were still open when mppx PR #1138 merged: one that a credential could be checked against a nonce the client never saw, another that a verifier failing to reject an undefined nonce could accept a proof without one. _(vendor/project-stated, not independently confirmed as exploitable)_

## Why it matters

- c09: Four unrelated events this window — a real-world adoption number, a cross-repo dependency on an unmerged branch, a same-day self-correction, and a breaking change shipped with open security findings — point the same direction: the gap between "a PR merged" and "the system behaves correctly in production" is where this beat's actual risk sits, not in whether a protocol spec itself is sound.
