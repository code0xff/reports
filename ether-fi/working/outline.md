# Outline — Ether.fi

## 1. Abstract
- One paragraph: ether.fi is a non-custodial Ethereum liquid restaking
  protocol that owns the largest LRT TVL (≈$5B on Ethereum), pairs
  user deposits with auctioned node operators while keeping validator
  keys in user-controlled withdrawal safes, and bundles staking with
  Liquid vaults, eBTC, and a Visa-branded Cash card on Scroll.

## 2. Introduction
- Why liquid restaking (LRT) is its own category beyond LST.
- ether.fi's specific positioning: native restaking through
  EigenLayer's EigenPods rather than restaking existing LSTs.
- Scope of the report: protocol mechanics, smart-contract
  architecture, products (eETH / weETH / eBTC / Liquid / Cash),
  tokenomics, audit posture, and adoption.

## 3. Background and protocol design
- The 32-ETH solo staker flow: withdrawal safe + T-NFT (30 ETH,
  transferable) + B-NFT (2 ETH, soulbound) issued at validator
  registration; reward split 90 % staker / 5 % node operator / 5 %
  protocol.
- Node operator auction model: bids matched to validators; encrypted
  validator keys and operator public keys exchanged via IPFS so that
  stakers retain their keys.
- Permissionless eETH minting via the LiquidityPool; eETH is a
  rebasing LRT, weETH is the wrapped non-rebasing wrapper used in
  DeFi.

## 4. Native restaking and EigenLayer
- "No limits" claim: native ETH restaked through EigenPods is not
  subject to the LST-restaking caps that other LRTs face.
- How automatic restaking works for end-users: deposit ETH, receive
  eETH, and the protocol routes the ETH through its EigenPod-backed
  validators.
- Where this differs from LST-on-LST restakers (KelpDAO, Renzo, etc.).

## 5. Product surface
- 5.1 eETH / weETH (and how rebasing vs wrapped affects DeFi
  integration).
- 5.2 eBTC, native Bitcoin restaking through Babylon / Lombard /
  Karak / Symbiotic / Veda, bridged via LayerZero.
- 5.3 Liquid vaults (weETHs / weETHk and a USD variant) and the way
  they layer additional yield strategies on top of eETH/eBTC.
- 5.4 Cash credit card: Scroll-based per-cardholder Gnosis Safe
  wallets, Visa-issued physical card, Direct Pay mode
  (USDC/USDT/LiquidUSD) and Borrow mode (USDC against ETH
  collateral), 3 % cashback.

## 6. Tokenomics — ETHFI
- Fixed 1 B supply, allocation split (Investors 33.74 %, Treasury
  21.62 %, Core Contributors 21.47 %, Airdrops 19.27 %, Partnerships
  & Liquidity 3.90 %).
- Season 1 airdrop (6 %) on 2024-03-18; subsequent seasons every ~4
  months tied to loyalty points; ETHFI as governance token, with
  signaling toward value accrual / StakeRank.
- Circulating ≈83.6 % as of mid-May 2026; vesting extends into 2027.

## 7. Security posture
- Audit cadence (29+ audit reports in the public repo, with Certora's
  formal verification dominating 2024-2026 reviews).
- Notable Certora reports: EETH share-inflation, Withdrawal Fee,
  Instant Withdrawal Merge v2.49, EigenLayer Slashing, Cumulative
  Merkle Distributor, Pectra Features Upgrade, Priority Queue
  (2026-03-05), Reaudit Core Contracts (2026-01-29).
- How concentration on a single auditor partner cuts both ways.

## 8. Adoption and market position
- TVL: $5.16 B (Ethereum $4.97 B, OP Mainnet $184 M, Scroll
  negligible) per DefiLlama at 2026-05-14, with $199 M annualised
  fees and $48.6 M annualised revenue.
- Funding: $5.3 M seed (Feb 2023), $27 M Series A (Feb 2024); ETHFI
  market cap ≈$374 M at $0.45.
- Cash card distribution as the bridge between LRT yield and
  real-world spending.

## 9. Discussion
- Where ether.fi differs from competing LRTs (Renzo, KelpDAO,
  Puffer): native restaking vs LST-restaking, key custody, and
  product breadth (Cash + Liquid + eBTC).
- Open questions: Pectra/EigenLayer slashing exposure, B-NFT slashing
  insurance economics, dependence on Certora for ongoing
  verification, future of Liquid vaults' counterparty risk.

## 10. Limitations
- TVL and tokenomics figures are point-in-time mid-May 2026; ETHFI
  is still vesting.
- GitBook documentation for some technical surfaces (withdrawal
  queue, key generation flow) was only partially exposed via the
  LLM-friendly export.
- No independent academic security treatment of ether.fi exists at
  time of writing.
- Cash and Liquid product surfaces depend on partners (Scroll, Visa,
  Lombard, Karak, etc.) whose own risk profiles are out of scope.

## 11. References
- Generated from `working/sources.jsonl`.
