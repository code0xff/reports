# Uncertainties — pay.sh GitHub Code Analysis

These items are publishable but epistemically shaky and should be
qualified in the draft.

## "MPP" naming

The repo cannot decide what MPP stands for. The top-level README
expands it as "Machine Payments Protocol" (`s01`); the embedded Payment
Debugger README expands it as "Monetized Payment Protocol" (`s19`); the
underlying IETF-style draft at paymentauth.org titles the spec
"Solana Charge Intent for HTTP Payment Authentication" (`s28`).
This is recent enough that an authoritative resolution may simply not
exist yet — flagged in c13 and surfaced in the draft.

## Project maturity

The repo published `pay-v0.13.0` through `pay-v0.16.0` and
`@solana/pay` `v1.0.0-beta.13` through `v1.0.16` between 2026-05-03
and 2026-05-06 (`s26`). Anything we say about specific versioned
behaviour can become stale within days. Treat all version numbers as
"as of 2026-05-08" snapshots.

## Vendor-led ecosystem

Both protocol SDKs (`solana-foundation/mpp-sdk`,
`solana-foundation/x402-sdk`) are owned by the Solana Foundation;
the launch press is heavily Solana × Google Cloud co-marketing. The
report should mark interoperability claims (e.g. "75+ APIs",
"50+ community providers") as vendor-stated when the only source is
launch coverage (`s29`–`s31`).

## Source code at HEAD vs released binaries

The Cargo workspace declares `version = "0.16.0"` (`s03`), and the
latest release tag matches (`s26`). We read source at the cloned HEAD
(commit `e72cddda`, 2026-05-07, `s27`), which may include
post-`v0.16.0` fixes. Differences should be small, but version-pinned
claims (e.g. exact crate names, exact MCP tool list) reflect HEAD.

## Static reading vs runtime behaviour

We did not execute the binary. Statements about user prompts ("Touch
ID asks the user to authorize"), wallet ergonomics ("Apple Pay-like"),
or success rates of catalog endpoints are inferences from comments
and docstrings, not measurements.
