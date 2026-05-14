# Gaps — Ether.fi

Status: closed. Each claim is supported by at least one primary or
technical-tier source. Core technical claims (T-NFT/B-NFT split,
node-operator auction, native restaking, Cash card mechanics) are
cross-referenced between ether.fi's own documentation and at least one
independent write-up.

## Resolved
- c01–c02: Definition / TVL / launch timing — ether.fi docs (s02),
  DefiLlama (s05), Medium intro post (s11).
- c03–c05: Solo staker mechanics, T-NFT/B-NFT split, IPFS key
  exchange — staking whitepaper (s03), node-operators guide (s04),
  Medium intro (s11).
- c06: eETH rebasing vs weETH wrapped — ether.fi docs (s02).
- c07–c08: Native restaking through EigenLayer with no LST-cap —
  ether.fi docs (s02) and EigenLayer landing (s14).
- c09–c10: Product line (eETH/weETH/eBTC/Liquid/Cash) and
  LayerZero cross-chain — ether.fi docs (s02) and ether.fi home (s01).
- c11–c12: Cash card mechanics — CoinDesk launch coverage (s09) and
  the ether.fi Cash page (s10).
- c13–c15: ETHFI allocation, airdrop schedule, governance role —
  Medium announcement (s07), Tokenomist (s08), Bitrue write-up (s12).
- c16: Circulating supply — Tokenomist (s08).
- c17–c18: Audit cadence and Certora dominance — public audits
  directory listing (s06).
- c19–c20: TVL / fees / revenue / funding — DefiLlama (s05).
- c21: Differentiation vs peer LRTs — Gate Learn explainer (s13).
- c22: Limitations are explicit in the draft itself.

## Accepted limitations
- The Tokenomist vesting page (s08) shows headline allocation totals
  but does not expose the per-allocation cliff/linear schedule in the
  plain-text excerpt we could read; the draft therefore cites the
  schedule only at the aggregate level.
- The ether.fi GitBook export (s02) is silent on withdrawal-queue and
  EigenPod plumbing details; the draft cites the audit-report titles
  (s06) as the most concrete public surface for those components.
- Gate Learn (s13) was access-limited via direct curl (403 to bot
  UAs); the page is publicly reachable in a browser and was read via
  the search-result summary, but we mark the source `access_limited`
  with `quote: null` rather than fabricate one.
