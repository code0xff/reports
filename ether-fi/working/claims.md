# Claims — Ether.fi

## Introduction
- [ ] c01: Ether.fi is a non-custodial Ethereum liquid restaking
  protocol that launched eETH on November 15, 2023 and pioneered
  native restaking through EigenLayer's EigenPods.
  - kind: factual
  - needs: ether.fi docs + an independent industry write-up.
- [ ] c02: Ether.fi is the largest liquid restaking protocol by TVL,
  with roughly $5 B in total value locked as of mid-May 2026 across
  Ethereum, OP Mainnet, and Scroll.
  - kind: factual
  - needs: DefiLlama snapshot.

## Background and protocol design
- [ ] c03: When a solo staker deposits 32 ETH, ether.fi mints a
  withdrawal safe plus two NFTs — a transferable T-NFT representing
  30 ETH and a soulbound B-NFT representing 2 ETH that backs
  slashing insurance and earns a boosted yield.
  - kind: technical
  - needs: ether.fi staking docs / whitepaper.
- [ ] c04: Reward distribution from staking is split 90 % to the
  staker, 5 % to the node operator, and 5 % to the protocol.
  - kind: technical
  - needs: ether.fi staking docs.
- [ ] c05: Node operators are selected through an auction mechanism;
  encrypted validator keys are stored on IPFS with hashes anchored
  on-chain so that stakers retain control of withdrawal credentials.
  - kind: technical
  - needs: ether.fi node-operator guide.
- [ ] c06: eETH is the rebasing liquid restaking token; weETH is the
  wrapped, non-rebasing version designed for DeFi composability.
  - kind: technical
  - needs: ether.fi docs.

## Native restaking and EigenLayer
- [ ] c07: ether.fi restakes its underlying ETH natively through
  EigenLayer's EigenPods, and the protocol's documentation states
  that there are no limits on the amount of ETH natively restaked
  versus LST-based restaking which is rate-limited.
  - kind: technical
  - needs: ether.fi docs.
- [ ] c08: This native-restaking design is one reason ether.fi
  describes eETH as automatically restaked while remaining liquid for
  use in DeFi.
  - kind: interpretive
  - needs: ether.fi docs + independent commentary.

## Product surface
- [ ] c09: ether.fi's product line spans eETH/weETH for liquid
  restaking, eBTC for Bitcoin restaking (with rewards from Babylon,
  Lombard, EigenLayer, Karak, Symbiotic, Etherfi, and Veda), Liquid
  vaults (weETHs / weETHk), and the Cash credit card.
  - kind: factual
  - needs: ether.fi docs + ether.fi home page.
- [ ] c10: eBTC and weETH are available on multiple chains through
  LayerZero's OFT pattern.
  - kind: technical
  - needs: ether.fi docs.
- [ ] c11: The ether.fi Cash credit card launched on the Scroll L2,
  is Visa-branded, gives 3 % cashback, and uses a per-cardholder
  Gnosis Safe wallet on Scroll that settles transactions in roughly
  one second via Visa's confirmation flow.
  - kind: technical
  - needs: CoinDesk launch coverage + ether.fi Cash page.
- [ ] c12: Cash supports two spending modes — Direct Pay using
  USDC/USDT/LiquidUSD vault balances, and Borrow Mode that borrows
  USDC against ETH collateral so users avoid a taxable sale.
  - kind: technical
  - needs: ether.fi Cash docs and industry write-ups.

## Tokenomics — ETHFI
- [ ] c13: ETHFI has a fixed total supply of 1,000,000,000 tokens
  with no further issuance, and was distributed as Investors 33.74 %,
  Treasury 21.62 %, Core Contributors 21.47 %, Airdrops 19.27 %, and
  Partnerships & Liquidity 3.90 %.
  - kind: factual
  - needs: ether.fi Medium announcement + Tokenomist.
- [ ] c14: ETHFI Season 1 airdrop distributed 6 % of total supply
  starting March 18, 2024 with a 90-day claim window, alongside a
  Binance Launchpool 2 % allocation.
  - kind: factual
  - needs: Medium + Bitrue / TokenInsight coverage.
- [ ] c15: ETHFI is positioned as a governance token over protocol
  parameters, treasury, and grants; the launch post also indicates
  it will be "value accruing" via a StakeRank mechanism rather than
  explicit fee-share at launch.
  - kind: interpretive
  - needs: ether.fi Medium post.
- [ ] c16: As of mid-May 2026 ETHFI's circulating supply is roughly
  83.6 % of total, with vesting events scheduled into 2027.
  - kind: factual
  - needs: Tokenomist.

## Security posture
- [ ] c17: The etherfi-protocol/smart-contracts repository publishes
  29 audit reports between February 2023 and March 2026, covering
  firms including CertiK, Omniscia, Nethermind, Solidified, Hats
  Finance, Zellic, Decurity, Halborn, Paladin, and Certora.
  - kind: factual
  - needs: GitHub audits directory listing.
- [ ] c18: From late 2024 onward Certora becomes the dominant
  auditor, contributing 14 of the most recent reports covering
  EETH share-inflation, Withdrawal Fee, Instant Withdrawal Merge,
  EigenLayer Slashing, Cumulative Merkle Distributor, V3.Prelude,
  Pectra features, Priority Queue, and a 2026-01-29 core-contract
  re-audit.
  - kind: factual
  - needs: GitHub audits directory listing.

## Adoption and market position
- [ ] c19: DefiLlama records ether.fi at $5.159 B TVL, with
  $198.97 M annualised fees and $48.57 M annualised revenue, with
  the bulk of value on Ethereum mainnet (≈$4.97 B) and a smaller
  share on OP Mainnet ($184.1 M).
  - kind: factual
  - needs: DefiLlama page.
- [ ] c20: Ether.fi raised $5.3 M in seed funding (February 28, 2023)
  and $27 M Series A (February 28, 2024) ahead of the ETHFI token
  launch.
  - kind: factual
  - needs: DefiLlama protocol page (funding section) / industry
    reporting.

## Discussion
- [ ] c21: Ether.fi differs from peer LRTs primarily on three axes:
  native restaking via EigenPods rather than LST-on-LST, stakers
  retain validator keys via the T-NFT/B-NFT pattern, and the
  protocol layers Liquid, eBTC, and Cash on top of the LRT base.
  - kind: interpretive
  - needs: ether.fi docs + competitor descriptions / industry write-ups.

## Limitations
- [ ] c22: TVL and tokenomics figures are point-in-time snapshots
  taken on 2026-05-14 and will move; ETHFI vesting events through
  2027 mean reported circulating supply is a moving target.
  - kind: interpretive
  - needs: explicit hedge in the report.
