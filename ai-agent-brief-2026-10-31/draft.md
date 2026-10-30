## Abstract

DoorDash's CEO put a number on agentic commerce for the first time this window, and it is small: "several hundred" orders against roughly 3 million deliveries a day[^s01]. The rest of the window came from the usual GitHub repos, but with a sharper edge than most editions: x402 finished a fee-saving transaction format and pay-kit had to pin itself to an unmerged branch to get it[^s02][^s03], mppx shipped a timing fix that was itself broken until a second patch landed two and a half hours later[^s04][^s05], and a breaking identity change merged with two security-review findings still open[^s06].

## Introduction

This edition covers **2026-10-28 through 2026-10-31**. Background on the payment-rail landscape lives in the site's [agent commerce protocol comparison](../agent-commerce-protocol/); the capability-drift thread continues from the [2026-10-30 edition](../ai-agent-brief-2026-10-30/), which found mppx and pay-kit independently landing on the same fallback bug three weeks apart.

## What moved

### DoorDash puts a number on agentic orders, and it's three digits

Asked about AI agents ordering on DoorDash's behalf during the company's Q3 2026 earnings call, CEO Tony Xu told analysts: "What I mean by that is if you look at where AI agents are today, we are seeing maybe several hundred orders in total from some of these third-party agents"[^s01]. He named Muse, Instinct, and Fo among the agents already placing orders, and framed DoorDash's posture as wanting to "develop a healthy relationship with third-party agent makers." TechCrunch contrasts that with Amazon, which blocks personal AI agents outright, while Walmart has gone the other way and rolled out a welcome mat[^s01]. Xu's number is a CEO's rounded estimate from a call, not an audited metric, and no second outlet's write-up of the same call turned up in this run, so it stays a single-source figure _(unverified — single source)_. It is nonetheless the first concrete count this beat has gotten from any merchant, after a month of protocol specs and payment-rail announcements with no deployed-usage data behind them.

### x402 finishes its transaction-v1 series; pay-kit has to chase an unmerged branch to use it

x402 PR #3971, merged 2026-10-29, is "Part 3 of 3 of SVM transaction v1 (SIMD-0385) support" — the final piece after two earlier merged PRs added the spec negotiation and the exact/upto settlement paths[^s02]. The payoff is concrete: a facilitator redeeming 1,000 payment channels needs 625 transactions and 8.1 million lamports in base fees under the old v0 format; under v1 it needs 150 transactions and 5.75 million lamports, a 29% fee cut and 4.2x fewer transactions to land, because a v1 transaction can carry 4096 bytes against v0's 1232[^s02]. Cross-testing with Solana Foundation's pay-kit (the SDK covered in the 2026-10-30 edition for its conformance work) turned up real bugs along the way: a Kit 8.5 signature-verification regression that broke every exact payment, and a hardcoded treasury-owner assumption that failed against pay-kit's own test validator[^s02].

But pay-kit's own PR to pick up this work, #406, merged a day *before* #3971 did, because pay-kit vendors x402 as a git submodule pinned to a feature-branch commit, not to a release. Its description says plainly that x402's branch "was rebased onto x402 main," so the commit pay-kit had pinned no longer existed on that branch, and the PR's entire purpose is moving the pin to the new commit and rebuilding the vendored package[^s03]. Pay-kit's current v1-transaction behavior therefore traces to a commit on an upstream branch that could still change before x402 ever merges it — a dependency relationship that works only because the two teams are actively coordinating, and would be invisible risk for anyone else vendoring x402 the same way.

### mppx fixes a sponsored-transaction timing bug, then fixes the fix

mppx's Tempo sponsored transactions sign with a `validBefore` fixed 25 seconds out, but the fee payer needs at least 15 seconds of that left when it countersigns. PR #1131, merged 2026-10-29, added that 15-second floor on both client and server, replacing an earlier attempt (#1099) that review had already sent back once[^s04]. The fix itself was wrong: its pre-sign recheck compared the *challenge's* expiry against the clock, not the *signed* `validBefore` value — so with the default five-minute challenge window, any client preparation step slower than about 10 seconds still produced a transaction the server had to reject, the exact failure #1131 was supposed to prevent. PR #1137, merged two and a half hours later the same day, corrects the recheck to measure the right value[^s05]. Both PRs leave one known gap out of scope: retry challenges on credential-bearing requests still skip the floor entirely.

### mppx ships a breaking identity redesign with its own review findings unresolved

PR #1138, merged 2026-10-29 and marked `feat(identity)!` for a breaking change, rewrites how mppx verifies caller identity on payment routes. Previously, a route with more than one payment-stage identity offer (the normal case for `tempo()`'s two default currencies) threw at creation time if an identity verifier was attached; the fix gives every 402 challenge a single shared identity nonce instead of one per offer, so a proof binds to the challenge itself regardless of which offer the client pays[^s06]. The PR's own description acknowledges two automated review findings still open when it merged: a credential could be checked against a nonce the client was never shown, and a verifier that fails to reject an undefined nonce could accept a proof that never carried one at all. Neither has been confirmed as exploitable in a shipped verifier. The project put both findings in the PR text itself, which is the only reason this brief has them: they weren't dug up from a separate issue tracker.

## Why it matters

Four unrelated repos, four different kinds of gap, one pattern: in each case the thing that shipped was correct about the system it changed and silent about the system around it. x402's fee savings are real and its cross-testing caught real bugs, but pay-kit gets them by pinning to code that hasn't landed anywhere official yet. mppx's timing fix was itself timing-dependent in a way nobody caught until the next commit, and its identity rewrite fixed a real integration blocker while shipping with its own reviewers' objections still open. None of this is protocol-level failure: x402, mppx, and pay-kit are all doing active, visibly-tested engineering. The gap this window exposes sits one layer down, between a PR that fixes the bug it names and a system that has been checked for the bugs it didn't think to name. DoorDash's three-digit order count is the same gap from the deployment side — the specs keep shipping faster than anyone is placing orders through them.

## Signals to watch

- Whether x402 PR #3971 lands in a tagged release, and whether pay-kit's pin tracks a merged `main` commit instead of a feature branch once it does.
- mppx's two open review findings on PR #1138: a follow-up fix like #1131 got, or nothing.
- DoorDash's next earnings call, for an order count that has moved off "several hundred," or a comparable figure from any other merchant.
- The retry-challenge gap both tempo PRs left out of scope. Still open.

## Limitations

Card-network and PSP agent-commerce products (Mastercard Agent Pay, Visa Intelligent Commerce and Trusted Agent Protocol, Stripe's Agentic Commerce Protocol, PayPal Agent Ready) produced no dated primary announcement inside this window, for the fourth edition running. AP2 and Google's agentic-commerce repos had no merged PRs or releases in this window. DoorDash's order figure could not be independently corroborated beyond the one outlet that reported it. No item in this window traced to an X or LinkedIn post. Five of six sources are GitHub pull requests — primary for what each project changed, not for whether any of it behaves correctly once deployed, which is exactly the gap this edition's "why it matters" turns on.
