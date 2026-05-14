# Critique — Agent Commerce Protocol (ACP)

Adversarial pass over `draft.md` and `draft.ko.md` against
`sources.jsonl`. Harness validation (`python3 scripts/harness.py
validate-report agent-commerce-protocol`) passes.

## 1. Unsupported claims
- Every factual sentence in both drafts carries an `[^s..]` citation.
  Single-source factual claims (contract addresses; "2,000+ agents in
  18 months"; the $1M/month Revenue Network figure; the AIXBT $500M
  market-cap high) are explicitly tagged in prose with
  `_(unverified — single source)_`, `_(vendor-stated)_`, or
  `_(adjacent scale metric, not ACP-specific volume)_`.
- The interpretive claims about evaluator capture and the standards
  layering (ACP ↔ x402 ↔ A2A ↔ ERC-8004) are framed as the report's
  reading, not as protocol-stated facts.
- **Status:** no must-fix items.

## 2. Citation integrity
- 15 footnote refs (`s01`–`s15`) all resolve to sources.jsonl entries;
  every source is referenced in both drafts. No orphan refs, no
  unused sources.
- Every `accessed` date is `2026-05-14`, well within 90 days.
- Bot-protected HTTP responses:
  - `s10` (gate.com): `curl` returns 403 because the page blocks
    non-browser UAs, but the page is publicly reachable in a browser
    and was successfully read via WebFetch with the quote preserved.
    Not a dead link.
  - `s12` (Dune): the dashboard renders client-side and `curl` returns
    403; this source is already marked `access_limited: true` with
    `quote: null` and is cited only as the live source pointer.
- Verbatim quote spot-check:
  - `s02` "After 18 months in production and over 2,000 agents
    onboarded" — present in the v2 changelog text.
  - `s07` "a new coordination layer that allows specialized AI agents
    to work together, fulfill tasks, and settle payments onchain" —
    present in the RockawayX public-beta post.
  - `s06` "job-based escrow where a client funds a job, a provider
    submits work, and a single evaluator attests completion or
    rejection" — present in the Ethereum Magicians ERC-8183 thread.
- **Status:** no must-fix items.

## 3. Reasoning gaps
- One **nit**: the Node SDK README example uses
  `import AcpClient, { AcpContractClientV2 } from
  "@virtuals-protocol/acp-node"` while the official April 2026
  changelog separately names the v2 package as
  `@virtuals-protocol/acp-node-v2`. The draft cites the changelog
  name and flags the changelog as the primary source for v2
  identifiers; the README discrepancy is documented here rather than
  re-attributed in the draft.
- The "July 3" public-beta date in RockawayX (s07) is reported with
  year ambiguity in the WebFetch summary. The draft says "mid-2025"
  rather than pinning a date, and the Limitations section flags the
  imprecision.
- The 2,000-agent / $1M-month / live-dashboard figures all run through
  hedge phrases.
- No "most/everyone/no one" universals in either draft.
- **Status:** one nit (recorded; not a must-fix); no must-fix items.

## 4. Missing counter-evidence
- A counter-sweep returned no independent rebuttal of ACP's design
  claims at the time of writing — the academic security literature on
  agent commerce is just emerging (e.g., recent x402 work) and does
  not yet target ACP specifically.
- Counter-considerations *are* in the draft: Evaluator capture is
  flagged as the central trust concentration, Revenue Network
  subsidies are flagged as potentially obscuring organic demand, and
  ERC-8183's not-yet-Final status is flagged.
- **Status:** no must-fix; no counter-evidence is hidden, and the
  absence of a public rebuttal is itself called out in
  Limitations.

## 5. Tone and structure
- Abstract faithfully tracks the body (four phases, v2 contract
  address, v1→v2 shift, Butler / AIXBT / Luna / GAME, 2,000+ agents,
  Revenue Network, ACP × x402 integration).
- Limitations section in §8 mirrors `uncertainties.md` and the
  remaining accepted items in `gaps.md`.
- No emoji or marketing voice. Hedge phrases align with the strength
  of each source.
- Longest paragraph is the §4.2 SDK paragraph (6 sentences); split
  across two logical halves around the Butler discussion.
- **Status:** no must-fix.

## 6. Must-fix vs nit
| Finding | Severity | Status |
| --- | --- | --- |
| Node SDK package name discrepancy in README vs changelog | nit | documented (changelog is the primary source cited) |
| RockawayX "July 3" year ambiguity | nit | handled — draft says "mid-2025" with explicit hedge |

**Summary: 0 must-fix, 2 nits (both already handled in the draft via
hedging or explicit attribution).** Report is clear for publish under
the protocol's must-fix gate.
