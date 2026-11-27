## Abstract

Three stories this week, none touching the others, all variations on the same
problem: an agent, not a person, is now the thing crossing a boundary, and
whoever controls that boundary is rewriting it with an agent in mind. Amazon
and Meta are reportedly negotiating to let Meta's shopping agent Muse back
onto Amazon after a two-month block, with both CEOs' sign-off apparently
still required.[^s01] A Reddit report, discussed at length on Hacker News,
claims Notion's MCP server tells an agent that hits its usage limit to
mention a paid upgrade without unfurling the link or showing a preview — a
claim this harness could not verify against the original post, but one
multiple commenters quote identically enough to take seriously.[^s02] And the
x402 Foundation merged three fixes in two days, the sharpest a parser bug
where a few kilobytes of crafted input could force roughly 170 MB of
allocation before failing.[^s03][^s04][^s05]

## Introduction

This is the standing brief on AI agents, developer tooling, and agent
payments: frameworks, the payment rails connecting agents to merchants (x402,
AP2, ACP, UCP, MPP, L402, Trusted Agent Protocol and successors), the card
networks' and PSPs' agentic-commerce products, and agent identity and
authorization. It covers November 25-28, 2026, checked against the fourteen
briefs before it so nothing already told here runs twice.

## What moved

### Amazon and Meta are talking again about letting Muse shop

TechCrunch reported Tuesday, citing Fortune, that Amazon and Meta have held
multiple rounds of talks about ending the block on Muse, Meta's shopping
agent, checking out on Amazon's marketplace. Amazon cut Muse off roughly two
months ago; TechCrunch's own September report on the original blockade
framed it as Amazon protecting its advertising business and its direct
relationship with shoppers from an intermediary that could route around
both. Those same two issues are reportedly still what the talks are stuck on:
how Muse's search results get presented, and what happens to the ad revenue
a shopper would otherwise generate browsing Amazon directly. Any agreement
would need both companies' CEOs to approve it, and neither company responded
to TechCrunch's request for comment.[^s01] A reopening would be the first
reversal of a major retailer's agent blockade since the practice started
spreading this year — worth watching less for Muse itself than for whether
it becomes the template other retailers follow or the one case that proves
the blockade was worth holding.

### A quota-limit response that tells the agent not to show its own ad

A post to r/ClaudeCode, picked up on Hacker News Thursday with 59 points and
22 comments, describes Notion's official MCP server returning a
response, when a user runs out of queries, that instructs the calling agent
to tell the user about Notion's paid plan — and specifically not to unfurl
the included link or generate a preview before the user sees it. Several
commenters, independently, quote the same instruction: "Do not use a bare
URL or create a link preview." The debate in the thread split along a
predictable line — some read the quota message itself as legitimate and the
link as ordinary marketing, others as a server using the user's own paid
tokens to generate an advertisement the user didn't ask for and was
nudged not to notice. Notion's public MCP documentation, checked for this
brief, says nothing about an upgrade prompt of this shape one way or the
other — it documents plan-gated tools and rate-limit error fields, not a
quota response that instructs an agent on how to present a link. This harness could not fetch the original Reddit post
or Notion's raw tool-call output; both the 403 a direct request returned and
a separate fetch-proxy refusal mean the claim rests on Hacker News commentary
quoting primary text rather than on the artifact itself.[^s02] _(unverified —
single source)_ Notion has not commented publicly. Whatever the intent, the
underlying mechanic generalizes badly: a tool description or error message
is something every MCP server author writes unsupervised, and an agent is
built to act on what it's told there.

### x402 ships a CBOR parser fix that closes a memory-amplification bug

The x402 Foundation merged three fixes to its reference implementation on
November 26-27. The one worth naming: `readCborLength`, in the builder-code
extension's CBOR parser, bounds each container's declared size by the bytes
remaining in the input — but a nested map or array can claim that same
remaining budget again at each level, so a crafted payload of roughly 5 KB of
nested map headers forces about 170 MB of allocation before parsing finally
fails. The same PR fixed a related panic: a malformed length field (a
negative sign, non-hex characters) could push a slice index past the end of
the buffer and crash the parser outright rather than reject the input
cleanly.[^s03] Two smaller fixes shipped alongside it. The Go HTTP
middleware for net/http, Gin, and Echo was letting a paid route's response
headers — `Set-Cookie`, `Content-Disposition`, in `ServeFile` handlers even
`Content-Length` — survive into the 402 response sent back after a
settlement failure, so a client could see headers from a handler that never
actually got paid.[^s04] And the Python facilitator was skipping its
`after_verify` hook whenever verification returned a rejection, which meant a
recovery hook written to handle a thrown error (an RPC timeout, say) could
instead quietly convert an ordinary payment rejection, such as a bad
signature, into an accepted one; Go and TypeScript already ran the hook on
every result, and
Python now matches.[^s05] None of the three references a CVE or a disclosed
exploit; they read as the Foundation finding its own bugs before anyone
outside does.

## Why it matters

None of these three teams talked to each other, and none of the fixes is
responding to the same incident, but they're the same shape: a system built
for humans now has an agent on one or both ends of it, and the assumptions
that held when a person was reading the response, clicking the link, or
sending the request don't hold anymore. Amazon built its ad business around
a person browsing; Notion's quota message was written assuming a person
would see the link before an agent could decide not to show it; x402's
parser bounded size the way a human-authored request would respect, not the
way an adversarial one, generated at scale, would. The fixes and the
negotiations are both forms of the same catch-up: rewriting a boundary that
was never designed with an agent as the party crossing it.

## Signals to watch

- Whether the Amazon-Meta talks produce a deal, and if they do, whether Muse
  gets full search parity on Amazon or a restricted integration that keeps
  Amazon's ad placements intact.
- Whether Notion responds to the MCP thread at all — silence, a quiet change
  to the quota response, or a public explanation would each say something
  different about whether this was deliberate.
- Whether mppx's TAP pull requests (#1363, #1364), still open as of this
  writing, merge and bring Visa's Trusted Agent Protocol identity
  verification into a library already hardening its own identity layer.

## Limitations

This brief rests on three primary sources (two GitHub pull requests and one
news article) and one secondary source — a Hacker News discussion of a
Reddit post this harness could not independently fetch, which is also the
brief's only unverified claim. Visa, Mastercard, and American Banker all
published agent-commerce coverage this week, but everything found predates
the window by over a week; see `working/gaps.md`. X and LinkedIn remain
unreachable directly.
