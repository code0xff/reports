# Critique — Ether.fi

Adversarial pass over `draft.md` and `draft.ko.md` against
`sources.jsonl`. Harness validation
(`python3 scripts/harness.py validate-report ether-fi`) passes.

## 1. Unsupported claims
- Every factual sentence in both drafts carries an `[^s..]` citation.
  Single-source quantitative claims (TVL, fees, revenue, market cap,
  ETHFI unlock %, the "no LST cap" framing, the "no other protocol"
  marketing line) are explicitly tagged with `_(point-in-time)_` or
  `_(vendor-stated)_` in prose.
- Interpretive claims (the three structural differences from peer
  LRTs; partner-risk concentration on Certora) are written as the
  report's reading rather than as facts.
- **Status:** no must-fix items.

## 2. Citation integrity
- 14 of 15 source IDs (`s01`–`s14`) are referenced in both drafts.
  `s15` (the smart-contracts repo root) is intentionally kept as a
  navigational anchor but is not cited in the text; this is the same
  pattern as the unused-anchor sources in the prior reports.
- Every `accessed` date is `2026-05-14`, well inside the 90-day
  freshness window.
- HTTP status sweep (curl -L -A "Mozilla/5.0"):
  - 11/15 sources return 200.
  - `s07` (etherfi.medium.com), `s11` (medium.com/etherfi), `s12`
    (Bitrue), and `s13` (Gate Learn) return 403 to non-browser UAs.
    All four pages were successfully read via WebFetch and are
    publicly reachable in a browser; they are bot-protected, not
    dead. `s13` is also flagged `access_limited: true` in
    `sources.jsonl`.
- Verbatim quote spot-check:
  - `s03` "When a staker deposits 32 ETH into ether.fi, it mints a
    withdrawal safe and two NFTs (T-NFT, B-NFT)" — present in the
    ether.fi staking whitepaper.
  - `s09` "ether.fi's approach centers on deploying an individual
    self-custodial wallet for each cardholder on Scroll" — present
    in the CoinDesk September 9, 2024 launch article.
  - `s06` "2026.03.05 - Certora (Priority Queue).pdf" — present in
    the etherfi-protocol/smart-contracts audits directory listing.
- **Status:** no must-fix items.

## 3. Reasoning gaps
- The "no other liquid staking protocol has this capability"
  quote (s02) is the team's marketing framing; the draft cites it
  inside a `_(vendor-stated)_` qualifier so the report does not
  assert it as a neutral truth.
- The "no LST cap" claim is hedged with `_(point-in-time —
  EigenLayer governance could change the cap policy)_` because it
  reflects EigenLayer's policy at doc-write time, not a permanent
  invariant.
- Numbers are reported with denominators (TVL by chain breakdown;
  audit cadence as "29 reports between 2023-02-25 and 2026-03-05";
  reward split as 90 / 5 / 5).
- No "everyone / no one / always" universals beyond the explicitly
  attributed marketing line.
- **Status:** no must-fix.

## 4. Missing counter-evidence
- A counter-sweep returned no independent academic security paper
  on ether.fi specifically at time of writing; the closest adjacent
  literature (x402 attacks, EigenLayer slashing analyses) does not
  bear directly on ether.fi's LRT contract surface.
- Counter-considerations are surfaced in §8 Discussion: Pectra
  slashing exposure for B-NFT economics, Certora-centric audit
  concentration as partner risk, and Cash-card counterparty surfaces
  (Scroll, Visa, Direct Pay stablecoins).
- **Status:** no must-fix; the absence of public academic rebuttal
  is itself called out in §9 Limitations.

## 5. Tone and structure
- Abstract faithfully tracks the body — native EigenPod restaking,
  T-NFT/B-NFT pattern, Liquid / eBTC / Cash, TVL / fees / revenue,
  ETHFI mechanics, 29-audit-report tail.
- §9 Limitations mirrors `uncertainties.md` and the accepted items
  in `gaps.md` (TVL snapshot, tokenomist tranche-level opacity,
  GitBook plumbing thinness, absence of independent academic work).
- No emoji or marketing voice in the report's own prose; quoted
  marketing lines are clearly attributed.
- Longest paragraph (§4.4 Cash) is six sentences and is logically
  scoped to one product.
- **Status:** no must-fix.

## 6. Must-fix vs nit
| Finding | Severity | Status |
| --- | --- | --- |
| 4 bot-protected URLs return 403 to curl | nit | acknowledged — all pages reachable via browser and read via WebFetch; `s13` also marked `access_limited` |
| `s15` (smart-contracts repo root) is unused as a footnote | nit | acceptable navigational anchor, consistent with prior reports |

**Summary: 0 must-fix, 2 nits (acknowledged and tolerated).** Report
clear for publish under the protocol's must-fix gate.
