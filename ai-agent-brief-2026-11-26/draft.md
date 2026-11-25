## Abstract

Cloudflare turned on agent-facing search for every zone on its network today,
answering plain HTTP GET and the newly standardized HTTP QUERY method at a
per-site endpoint, so agents no longer need to parse a page.[^s01] On the x402
side, a service operator ran an unsanctioned audit of Coinbase's Bazaar
discovery listing and found that none of 10,000 sampled rows carry the call
method an agent needs to actually use them, and that where the live endpoint
could be checked, one in seven descriptions and one in twenty-seven prices had
already drifted from what the listing promised.[^s02] The same ecosystem
shipped something more mundane the day before: x402's Solana `exact` scheme
can now split one payment across up to nine recipients in a single verified
transaction.[^s03][^s04] Visa, Mastercard, and the IETF identity drafts
produced nothing dated inside this window. A carried-over gap from yesterday's
brief, Amazon's zero-day claim about attacker-controlled agents, is still
unverifiable for the same reason as before; see `working/gaps.md`.

## Introduction

This is the standing brief on AI agents, developer tooling, and agent
payments: frameworks, the payment rails connecting agents to merchants (x402,
AP2, ACP, UCP, MPP, L402, Trusted Agent Protocol and successors), the card
networks' and PSPs' agentic-commerce products, and agent identity and
authorization. It covers November 23–26, 2026, checked against the fourteen
briefs before it so nothing already told here runs twice.

## What moved

### Cloudflare makes every site searchable by agents, no crawler required

Cloudflare's "Search for Agents" went generally available today: flip a
toggle in the dashboard or the API, and Cloudflare indexes the zone and
exposes a search endpoint at `/.well-known/search` on the site's own domain.
Sites advertise the endpoint through `agent:*` metadata in their HTML, or in
front matter if Markdown for Agents is already enabled.[^s01] The query path
itself rides on HTTP QUERY, an IETF Proposed Standard published in June 2026
as RFC 10008 — new enough that this is one of its first visible production
uses at scale. The design choice that matters is what the endpoint returns:
"all it needs is the relevant information from your site," in Cloudflare's
framing, because the agent already carries its own model and doesn't need the
summary pre-chewed.[^s01] That is a bet against the retrieval-augmented-answer
pattern most "AI search" products have converged on, made by the company that
terminates a sizable share of the web's traffic. No independent coverage has
appeared yet; this is a day-old, vendor-stated launch, and the only test of
whether agents actually prefer raw content over a generated answer is how
many sites flip the toggle.

### An audit of x402's Bazaar listing finds the data behind it is thin

Three prior briefs have covered x402 Foundation governance as a story about
committees and proposal comparisons. A different kind of contribution landed
this week: a service operator, not a Foundation member, pulled 10,000 of the
87,419 rows in Coinbase's public Bazaar discovery listing and tried to
actually use them. Zero rows carry a top-level call method, so reaching every
listing with a plain GET would hit only 60% of them; the rest return 405.
Live-probing 200 rows unpaid, 190 returned a usable 402 response, but 14.7% of
those had a description that no longer matched the live challenge, and 3.7%
had a different price: one listing advertised $1.49 against a live price of
$0.10.[^s02] The author's own methodology needed a correction mid-audit. An
initial unreachable-row estimate of 21.5% dropped to 5.0% once they re-probed
using each row's own declared method instead of guessing GET, which is its
own small data point about how much trial and error discovery currently takes
even for someone trying in good faith.[^s02] Their proposed fixes are
narrow: surface the call method per row, publish a freshness field, and set
an explicit conformance expectation for indexers about whether listings are
live or snapshots. None of that has been adopted yet, and neither the
Foundation nor Coinbase has responded to the findings as of this writing.
_(single source, one contributor's self-run probe)_

### x402 ships multi-payee settlement for Solana, a day before the Bazaar findings

Less visible, and arguably more consequential for anyone actually moving
money: x402 merged atomic multi-payee splits for the Solana `exact` scheme on
November 24, across the TypeScript, Go, and Python SDKs.[^s03] A single
settled payment can now route to a primary `payTo` plus up to eight
additional recipients in one verified on-chain transaction, with facilitators
opting in per-route via a `maxSplits` parameter.[^s03][^s04] That's the kind
of change that lets a marketplace or an affiliate chain take a cut without a
second transaction, and it shipped the day before the Bazaar audit found that
the same ecosystem's discovery layer can't reliably tell an agent what to pay
in the first place. Settlement mechanics are getting more capable faster than
discovery data is getting more trustworthy — the gap this brief keeps
tracking between what ships and what's been agreed, now visible inside a
single protocol rather than between two.

## Why it matters

Put the two x402 items side by side and a pattern that spans several prior
briefs gets sharper: shipping speed and data-quality speed are decoupled.
Multi-payee splits required coordinated SDK work across three languages and
landed in days. Getting a discovery listing's method field populated
correctly requires no new code at all, and an outside contributor still had
to build a probe to find out it hadn't happened. Cloudflare's launch sits
on the other side of that same line — a platform-scale bet on agents reading
raw content instead of summaries, made without needing anyone's agreement,
because Cloudflare owns the whole path from request to response. Where a
single vendor controls the stack, things ship. Where shipping requires many
parties to agree on data hygiene nobody is specifically responsible for, it
doesn't.

## Signals to watch

- Does any facilitator actually turn `maxSplits` on in production, or does the
  capability sit unused in the SDKs?
- Coinbase's or the Foundation's response to the Bazaar audit: a method-field
  requirement, or the same stall that earlier wg-domain-discovery issues hit
  without consensus.
- Adoption of Cloudflare's agent-search endpoint by a named agent framework
  (LangChain, the OpenAI or Google agent SDKs) as a default tool would be the
  real test of the "raw content over summary" bet.
- mppx's two open Trusted Agent Protocol PRs (noted in `working/gaps.md`)
  merging would make this the next case of a library shipping
  interoperability before any standards body agreed to it.

## Limitations

This brief covers three items. A fourth candidate, reported talks between
Amazon and Meta to lift a marketplace block on Meta's Muse shopping agent,
was dropped for being speculative, single-sourced through a secondhand
report, and not substantially about payment rails or agent infrastructure.
The Amazon zero-day claim from Ars Technica remains unverifiable for a second
day; see `working/gaps.md`. Card-network coverage (Visa, Mastercard) produced
nothing dated inside this window.
