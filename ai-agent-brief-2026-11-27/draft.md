## Abstract

Phantom's wallet now adds a security check of its own to every Solana
transaction — and that check names the exact account that x402's own
anti-fraud rule forbids naming, so paying an `exact` requirement through
Phantom currently fails verification on at least one hosted facilitator.[^s03]
Separately, the library behind MPP's identity extensions shipped three small
fixes in two days: a host-spoofing hole in signed identity requests, a
private key that macOS's keychain tool was leaking to any other local process
via `ps`, and four IP-identifying headers a proxy was passing through
unstripped.[^s01][^s02] And Google rebuilt how agents reach Google Workspace,
moving the agent-facing surface off plain REST and onto MCP servers and a CLI
that run under dedicated, revocable agent identities — with enforcement
starting February 1, 2027.[^s04] A fetched page from Google's own blog
contained an embedded instruction trying to redirect this research process
into creating an unrelated document; it was not followed, and is recorded
here as a data point about what agents researching this beat now have to
filter.

## Introduction

This is the standing brief on AI agents, developer tooling, and agent
payments: frameworks, the payment rails connecting agents to merchants (x402,
AP2, ACP, UCP, MPP, L402, Trusted Agent Protocol and successors), the card
networks' and PSPs' agentic-commerce products, and agent identity and
authorization. It covers November 24–27, 2026, checked against the fourteen
briefs before it so nothing already told here runs twice.

## What moved

### A wallet's own fraud check breaks x402 payments on Solana

`@x402/svm` 2.32.0 added a rule, `assertFeePayerIsolatedFromInstructions`,
that rejects any Solana transaction where a non-payment instruction touches
the facilitator's fee-payer account, because that pattern is how a malicious
instruction could siphon funds from the account paying network fees. On
November 25, Phantom's Chrome extension started adding its own protective
instructions to every transaction before signing: four Lighthouse assertions
that check account state hasn't changed underneath the signature. One of
those four names the fee payer. The two checks were each written to catch a
different kind of attack, and together they now reject a transaction neither
would reject alone. The result, reported by a facilitator operator who
caught it on a production checkout page: Phantom users paying an `exact`
requirement get `invalid_exact_svm_payload_transaction_fee_payer_transferring_funds`
from Coinbase Developer Platform's hosted facilitator, and the payment does
not go through. Phantom's iOS app changed its payment flow the next day too,
and the reporter's own pre-check, which mirrors the facilitator's rule,
already refuses it, though they could not capture the iOS transaction to
confirm it carries the identical assertion.[^s03] _(unverified, single
source)_ Neither Phantom, Coinbase, nor the x402 Foundation has responded as
of this writing, and it isn't yet clear whether every x402 Solana facilitator
enforces the same rule or just this one.

### mppx closes three identity-adjacent holes in two days

Three smaller fixes, same library, same week, none disclosed as a CVE. PR
#1353 (merged November 24) stops a server from reconstructing a signed
identity request's URL purely from the incoming `Host` header, which had let
a relay present one service's signed request as though it belonged to
another — a classic host-header-confusion bug, just applied to signed
identity rather than login. Release 0.22.1 (November 25) fixed the CLI's
macOS keychain integration, which had been passing the user's private key as
a command-line argument to `security`, visible to any other process on the
same machine through `ps`; it now goes over stdin instead. The same release
stripped `Forwarded`, `X-Real-IP`, `True-Client-IP`, and `CF-Connecting-IP`
from proxied requests, closing a path by which a proxy was handing the
client's real IP to the identity or payment endpoint on the other end.[^s01][^s02]
None of the three looks like it followed a disclosed incident; they read as
routine hardening of a protocol that increasingly sits underneath real money
movement.

### Google puts agent access to Workspace behind its own identity layer

Google's Workspace and Cloud teams made two things generally available on
November 25: remote MCP servers for Gmail, Drive, Docs, Sheets, Slides,
Calendar, Chat, and Tasks, and a CLI for local agents — both of which reject
OAuth clients that aren't flagged as agent clients. New terms require agents
to use these paths instead of Workspace's existing REST APIs, with technical
enforcement beginning February 1, 2027. A new Agent Gateway verifies agent
identities against a Google Cloud Agent Registry and applies default-deny
outbound policy to LLM, MCP, and Agent2Agent traffic. _(vendor-stated)_
Google frames this as a shift from "a valid token is enough" to a model where
every agent carries its own identity, scope, and audit trail — a framing
that is itself a claim about what the old model got wrong, not a measured
fact.[^s04] Admins can see, audit, and revoke agents today; a user-facing
version of the same controls, along with per-file access restrictions, is
listed as "coming soon" rather than shipped.

## Why it matters

Three different layers of the agent stack tightened identity enforcement
this week, and one of them broke something in the process. Google's change
and mppx's three fixes are the kind of hardening nobody notices unless it's
pointed out: a platform deciding tokens aren't enough, a library closing
holes before anyone exploits them. The Phantom collision is the same
instinct running into itself — a wallet and a payment protocol each adding a
check meant to stop fraud, neither aware the other exists, producing a
transaction that is secure by both standards and payable by neither. As more
of the stack adds its own verification layer independently, that kind of
collision gets more likely, not less: the more parties checking, the more
chances for two correct checks to disagree.

## Signals to watch

- Whether Phantom, Coinbase, or the x402 Foundation acknowledges the
  fee-payer collision, and whether the fix lands in `@x402/svm` (relaxing the
  rule for wallet-added Lighthouse assertions) or in Phantom (dropping the
  fee-payer assertion) — the choice says which side considers itself
  responsible for compatibility.
- Whether mppx's TAP pull requests (#1363, #1364) merge, which would put
  Visa's Trusted Agent Protocol identity verification into a payment library
  already shipping its own identity hardening.
- Whether Google's February 1, 2027 enforcement date holds, and whether the
  "coming soon" user-facing revocation controls ship before it does.

## Limitations

This brief is sourced to three primary artifacts (two GitHub items, one
vendor blog) and found no independent reporting on any of them; see
`working/gaps.md` for what that leaves unconfirmed, including a third day
running without access to Ars Technica's Amazon zero-day report. Visa,
Mastercard, Stripe, and PayPal produced nothing dated inside this window.
