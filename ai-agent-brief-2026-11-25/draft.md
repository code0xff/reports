## Abstract

Google used today's post to turn a policy it had only described into one with
a calendar: Workspace and Google Cloud agents move off REST tokens and onto
MCP servers and a dedicated Agent Identity, with the old path contractually
closed on February 1, 2027.[^s01] Away from the big platforms, a payments
library did something the standards bodies that own x402 and MPP have not
managed in three brief cycles of trying — it made the two protocols work on
the same route, settling a Solana MPP challenge through an x402
facilitator.[^s02] OpenAI's stable Agents SDK line picked up sandbox hardening
that has nothing to do with the alpha line's Codex-provider churn covered the
last two days,[^s03] and OpenAI and Cisco open-sourced Shirudo, a tool that
has Codex write the shield instead of the policy.[^s04] The x402
payout-address question from two briefs ago is still unanswered.[^s05][^s06]

## Introduction

This is the standing brief on AI agents, developer tooling, and agent
payments: frameworks, the payment rails connecting agents to merchants (x402,
AP2, ACP, UCP, MPP, L402, Trusted Agent Protocol and successors), the card
networks' and PSPs' agentic-commerce products, and agent identity and
authorization. It covers November 23–25, 2026, checked against the fourteen
briefs before it so nothing already told here runs twice. Ars Technica
reported a claim that Amazon says attacker-controlled AI agents found and
exploited a zero-day with little human input; this brief could not fetch the
article or locate a primary Amazon source in the time available, so the claim
is omitted instead of repeated secondhand — see `working/gaps.md`.

## What moved

### Google makes MCP mandatory for Workspace agents, with a date attached

Google has talked about agent governance in pieces for weeks — Agent Gateway,
Model Armor, semantic policies. Today's post bundles those pieces and adds
something new: an enforcement date. Workspace's "AI Tools Addendum," in force
from February 1, 2027, requires agents to reach Gmail, Drive, Docs, Sheets,
Calendar, Chat, and Tasks through newly GA'd MCP servers or a new CLI, not the
REST API; usage-quota billing on top of that starts April 1, 2027.[^s01] Both
the MCP servers and the CLI carry built-in permission and DLP checks, and the
MCP servers reject OAuth clients that are not registered as agents at
all.[^s01] This post is the primary source and the sole coverage found in the
window; no independent press account of the Addendum had appeared as of this
fetch.

The identity side is a separate, also-new piece: Agent Identity, issued
through Google Cloud's Agent Registry, replaces shared or long-lived
credentials with dedicated OAuth client IDs scoped per agent, and revoking one
"stops access immediately."[^s01] Combined with a new Agent Gateway that
checks every LLM, MCP, and A2A request against that registry and a
default-deny outbound rule, the design puts policy in the request path rather
than at a one-time consent screen — "a valid token is no longer enough," as
the post puts it.[^s01] Several pieces are still "coming soon" rather than
live: time-limited approvals, a dashboard for users to see and revoke what an
agent has done, and Workspace access scoped to specific files, not whole
accounts. Google gave no detection-rate or false-positive numbers for
Model Armor or the DLP checks, so how much of this is enforcement versus
visibility is still an open question.

### mppx 0.22.0 puts x402 and MPP on the same route

Three briefs running have covered x402 Foundation governance as a story about
who decides, not what ships. A library release broke that pattern on Nov 24.
`mppx`, a payments client and server library from the Viem/Wagmi team at
wevm, shipped 0.22.0 with a native `solana/charge` MPP challenge sitting
beside the existing Solana `exact` x402 requirement on the same route. A
client's partially signed transfer is verified and settled through the
route's x402 facilitator, acting as fee payer for both protocols.[^s02] That
is interoperability built by a library maintainer, not agreed between the
two protocols' standards bodies — an instance of the gap this brief has been
tracking between platform-owned shipping speed and foundation-owned decision
speed, resolved from the shipping side. The same release adds a trusted
receiving-origin check for ERC-8004 verification, the Ethereum agent-identity
standard, to stop a signed request meant for one service being replayed
against another.[^s02] _(unverified, single source: the release notes are
the only coverage found in the window)_

### OpenAI hardens the sandbox nobody was watching

The last two briefs covered OpenAI's Agents SDK v1.0.0 alpha line breaking its
own save format twice in three days as it wired in native Codex support. On
Nov 24, the separate stable 0.x line shipped v0.26.0, and its changes are
unrelated: Docker sandboxes now reject privileged containers and added
capabilities outright, CPU-limit and TAR-path-validation checks are bounded
per component instead of per run, and local-image access through the Codex
tool requires explicit application approval.[^s03] The release's own
automated review calls it a "GREEN LIGHT TO SHIP" minor version with
supported upgrade paths — a vendor CI verdict, not independent
testing.[^s03] Two separate release lines inside the same SDK, moving at
different speeds and for different reasons, is its own small data point about
how OpenAI is managing the transition to 1.0.

### Shirudo: an agent that writes the fix, not the policy

OpenAI and Cisco open-sourced Shirudo on Nov 23: an eBPF tool that lets an
operator deploy temporary, signed "shields" blocking an exploited code path
while a permanent patch is prepared, without restarting the service.[^s04]
Codex's role is narrow — generating and testing a shield, which a human
operator still approves before it loads. The one worked example is a
Codex-generated shield that blocked the Java4Shell exploit against
Elasticsearch by adding an input check to Java's Base64 decoder; OpenAI calls
this "a controlled test" and publishes no performance or false-positive
data beyond it.[^s04] Shields are cryptographically signed and a TPM can
attest when one loads or is removed, but the signing and key-management
scheme itself is not specified in the announcement. This sits at the edge of
the standing beat: it is agent-authored tooling, not agent identity or
payments. Still, it is the clearest example this week of "agents do the
work, humans keep the approval," the same split Anthropic's Claude Ship drew
two days ago for code review.

## Why it matters

Every item above except one shipped inside infrastructure its author
controls end to end: Google's own Workspace and Cloud stack, OpenAI's own SDK
and sandbox, OpenAI and Cisco's own kernel tooling. The exception is the
interoperability piece, and it came from a library maintainer stitching two
protocols together at the client, not from either protocol's foundation
agreeing on anything. The one piece of this beat that sits outside any
single company's control is x402's payout-address proof, handed from the
Discovery WG to the Identity WG on Nov 16. It has had zero comments in three
days, and the TSC meeting that was supposed to address a related conformance
question today had not produced a visible outcome as of this brief's last
fetch.[^s05][^s06] The pattern holding across four brief cycles now: when one
company owns the fix, it ships in a day; when a fix needs several
organizations to agree, it does not move at all.

## Signals to watch

- Whether the Nov 25 x402 TSC meeting actually resolved tsc#21's conformance-test
  question, and whether wg-identity#52 gets any response at all before the
  next brief.
- Other payment libraries picking up mppx's x402/MPP bridge, versus this
  staying a one-library quirk.
- Adoption of Google's new Agent Identity model versus how many customers
  still rely on REST tokens as the February enforcement date approaches.
- Independent testing of Shirudo's shields beyond the single Java4Shell
  demonstration, and whether its signing scheme gets documented.

## Limitations

The Amazon zero-day claim reported by Ars Technica could not be verified: the
article itself refused this brief's fetch, and Amazon's security-blog listing
returned no post content, likely because it renders client-side. Card-network
and PSP newsrooms were not checked directly this cycle. The x402 TSC meeting
referenced above was scheduled for Nov 25 but had not visibly concluded as of
this brief's last fetch at 08:09 JST; its outcome is deferred to the next
brief. Shirudo's signing and key-management details come only from the
announcement post, not the linked repository or docs, which this brief did
not fetch.
