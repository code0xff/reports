## Abstract

Three separate repos this window closed a gap in one place and opened or exposed one somewhere adjacent. mppx shipped the fix for the MPP fallback bug this brief flagged on 2026-10-29, but the identical bug in Solana Foundation's pay-kit client is still sitting unmerged three weeks after someone filed the fix[^s01][^s03]. The x402 Foundation ported a defensive JSON-parsing check from its Python SDK to TypeScript, closing one specific cross-SDK gap[^s04][^s05]. And pay-kit's Python and TypeScript SDKs reached full conformance on version-1 transactions — which immediately widened the gap with the Go, PHP, and Ruby verifiers that can't read what the newly-conformant SDKs now write[^s06].

## Introduction

This edition covers **2026-10-27 through 2026-10-30**. Background on the payment-rail landscape lives in the site's [agent commerce protocol comparison](../agent-commerce-protocol/); the capability-drift thread continues from the [2026-10-29 edition](../ai-agent-brief-2026-10-29/), which first reported the mppx/pay-kit fallback bug and the zod CVE that hadn't reached `@coinbase/cdp-sdk`.

## What moved

### mppx fixes the fallback bug; pay-kit's side of the same bug is still open three weeks later

mppx@0.17.0, released 2026-10-29, ships PR #1133: a 402 response whose `WWW-Authenticate` header names no `Payment` scheme no longer makes the client throw `No Payment schemes found.` and abort. It now returns no challenges for that response, which lets the fetch fall through to x402 or whatever protocol the server actually speaks — the behavior MPP's documented fallback chain promised and the 2026-10-29 edition found missing[^s01][^s02].

Solana Foundation's pay-kit has the same defect in `SessionFetch`, and PR #359, the fix for it, has been open since 2026-10-06. It is still unmerged as of this run, 24 days later[^s03]. Two teams built two independent clients, landed on the identical bug, and are now three weeks apart on fixing it. A developer picking mppx today gets the fallback chain as documented; a developer picking pay-kit does not.

### x402 closes one more Python-to-TypeScript drift gap

PR #4051, merged 2026-10-29, ports a check from the Python SDK's HTTP layer into the TypeScript core package: `decodePaymentSignatureHeader`, `decodePaymentRequiredHeader`, and `decodePaymentResponseHeader` used to cast whatever `JSON.parse` returned straight to a payment type, so a response body that was `null`, an array, a string, a number, or a boolean came back typed as valid payment data instead of failing. The decoders now throw on anything that isn't an object[^s04]. The fix is a direct port of Python PR #3917, tracked under issue #4050 — the same pattern of a defensive check landing in one language weeks before its sibling that this brief covered with the zod CVE on 2026-10-28 and 2026-10-29. It isn't clear yet whether this specific change has shipped in a published npm release; the TypeScript version-bump PR that day merged six hours before PR #4051 did, so the fix sits on `main` without a confirmed release tag as of this run[^s05].

### pay-kit's SDKs reach full conformance — and that widens the gap with the verifiers that can't read what they now write

PR #404, merged 2026-10-28, brings pay-kit's Python and TypeScript SDKs to 813 of 813 offline conformance vectors, matching the Rust reference kit, and adds version-1 transaction support to both. That's the fix. The side effect: the Go, PHP, and Ruby verifiers in the same project can't decode version-1 transactions yet, so the PR opens 24 new cross-SDK cells tracked as `known_failing` — cases where a newly-conformant Python or TypeScript client builds a transaction that an older verifier in another language can't read[^s06]. Reaching parity on one axis (conformance to the spec) created a new gap on another (cross-language interoperability), inside the same pull request.

## Why it matters

None of these three repos regressed. Each merged a real fix for a real bug. But in every case, "fixed" turned out to be a property of one SDK, one client, or one language — not of the protocol. mppx is correct and pay-kit is not, on the identical bug. x402's TypeScript SDK is now as strict as its Python one, for one specific check, pending confirmation it shipped. And pay-kit's own conformance suite grew by 24 failing cases the moment two of its five language targets caught up with the other three. A protocol whose reference implementations drift apart faster than any one of them can be patched does not get safer by patching the first one you find.

## Signals to watch

- Whether pay-kit PR #359 merges, closing the gap mppx closed on 2026-10-29.
- A tagged `@x402/core` release containing PR #4051 — the first confirmation the fix reached anyone running `npm install`.
- Go, PHP, and Ruby verifier support for version-1 transactions, and whether pay-kit's 24 `known_failing` cells shrink or grow in the next conformance pass.

## Limitations

Card-network and PSP agent-commerce products (Mastercard Agent Pay, Visa Intelligent Commerce and Trusted Agent Protocol, Stripe's Agentic Commerce Protocol, PayPal Agent Ready) produced no dated primary announcement inside this window, for the third edition running. AP2 and Visa's trusted-agent-protocol repos had no merged PRs or releases in this window. Congress's Delaware document deadline is 2026-11-09 and nothing has moved since the 2026-10-29 edition. No item in this window traced to an X or LinkedIn post. All six sources are GitHub pull requests, issues, or release notes — primary for what each project did, not for whether any of it works in a deployed system.
