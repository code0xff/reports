## Abstract

Two days after x402 closed a known gap in how its facilitator handles throwing lifecycle hooks, two more gaps turned up in the same part of the codebase. One is a typo-grade bug that leaves the Python SIWX extension's replay check never actually running[^s02]. The other drops the one diagnostic field an aborting hook sets, but only on the Go facilitator's newer code path[^s03]. Neither is fixed yet. The same window also closed out a cross-client gap that had nothing to do with hooks: the Go client's ERC-20 allowance check could sign an unnecessary approval or attempt a doomed read, something the TypeScript and Python clients already avoided[^s01].

## Introduction

This edition covers **2026-10-30 through 2026-11-02**. Background on the payment-rail landscape lives in the site's [agent commerce protocol comparison](../agent-commerce-protocol/). The hook-isolation fix this edition's findings sit downstream of — x402 PR #3151, merged 2026-10-30[^s04] — was covered in the [2026-11-01 edition](../ai-agent-brief-2026-11-01/).

## What moved

### x402's Go client catches up on an allowance check the other two SDKs already had right

PR #3916, merged 2026-10-30, fixes how the Go SDK's `exact` and `upto` payment schemes decide whether an ERC-20 approval is needed before a transfer. Both schemes asserted that the signer supported `ClientEvmSignerWithReadContract` directly, instead of resolving it the way the SDK's own batch-settlement path and its EIP-2612 scheme already did. Two consequences followed: a signer built without an RPC client issued an allowance read that could only fail, and a configured `RPCURL` or `RPCByChainID` fallback was never consulted, so the client could sign an approval even when the existing allowance was already sufficient[^s01]. The fix routes both schemes through the same `resolveReadSigner` helper batch-settlement uses. Nobody filed a bug report for this one; it came out of review feedback on an earlier, unrelated PR (#3551), the kind of parity gap that surfaces when one reviewer happens to compare three code paths side by side.

### A Python SIWX extension's anti-replay check has never actually run

Issue #4079, filed 2026-10-31 and still open, traces a bug with an unusually sharp failure mode. The Sign-In-With-X extension's `create_siwx_request_hook` is supposed to reject a storage backend unless it implements both `has_used_nonce` and a second capability the hook checks for under the name `has_record_nonce`, a method that does not exist anywhere in the codebase. The actual capability both the Protocol contract and the TypeScript SDK check for is `record_nonce`. A storage that implements exactly the documented pair fails at hook creation with a `ValueError`. A storage that implements only `record_nonce` passes the (broken) guard, but because `record_nonce` itself is gated on the same flag, it is never called. A replayed SIWX signature passes the "has this nonce been used" check forever, because nothing ever recorded that it had been used in the first place[^s02]. The bug report pins the exact file and line (`hooks.py:L105`) against its working TypeScript twin, and names the PyPI version it reproduces against (2.26.0) and the commit at `main` (`e208bd39`).

### The Go facilitator's newer error path drops a hook's diagnostic message

Issue #4081, filed the same day, found a narrower but related defect: when a V2 facilitator hook aborts verification or settlement with `{Abort: true, Reason, Message}`, the `Reason` reaches the resource server but the `Message`, whatever free-text diagnostic the hook author set, gets built into an empty string on both the `Verify` and `Settle` V2 code paths. The V1 branch of the same functions keeps the message, as does the server-side V2 hook handling; only the facilitator-side V2 builders drop it. The fix, per the report, is a one-line pass-through at two call sites, but nobody has merged it yet[^s03].

## Why it matters

x402's facilitator hooks got a real fix on 2026-10-30, the throwing-hook isolation bug this beat covered two editions ago, and within the next day and a half two more problems turned up adjacent to it: one in the Go facilitator's error-building code, one in an unrelated extension's nonce storage check. Neither is the kind of defect code review usually catches before merge — both require someone to compare what a function is supposed to accept against what it actually checks for, line by line, across languages. The Go client also needed two of its own parity fixes this window: the allowance check above, and a separate one-line fix for a trailing slash in the facilitator URL that TypeScript and Python had already stripped[^s05]. Three defects, three different causes, one pattern: x402 ships in three languages at once, and keeping all three behaviorally identical is turning out to be harder than fixing any single bug once it's found.

## Signals to watch

- Whether #4079 or #4081 gets a merged fix in the next edition, or sits the way two mppx PRs sat for three to four weeks earlier this month.
- A maintainer response to either report. Both currently rest on a third-party contributor's own reading of the code.
- Whether x402's other extensions — Bazaar, the batch-settlement treasury logic — get audited for the same class of capability-name mismatch that broke SIWX's nonce check.

## Limitations

Card-network and PSP agent-commerce products (Mastercard Agent Pay, Visa Intelligent Commerce and Trusted Agent Protocol, Stripe's Agentic Commerce Protocol, PayPal) produced no dated primary announcement inside this window, for the sixth edition running. AP2 had no repository activity at all in this window; UCP's only merged change was a one-line documentation fix. DoorDash's Q3 earnings disclosure on third-party agent order volume, which this beat would otherwise have led with, was already covered in the 2026-10-31 edition. All five sources in this edition are GitHub pull requests or issues from a single repository; two of the three main findings are unconfirmed, unfixed bug reports rather than merged changes, so this edition reports what was found, not what was resolved.
