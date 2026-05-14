# Ether.fi

## Abstract

Ether.fi is a non-custodial Ethereum liquid restaking protocol that
mints the rebasing token **eETH** (and its wrapped DeFi sibling
**weETH**) against ETH that the protocol restakes natively into
EigenLayer's EigenPods rather than restaking an underlying LST.[^s02]
[^s14] The protocol pairs each 32 ETH validator with a withdrawal
safe and two NFTs — a transferable **T-NFT (30 ETH)** and a soulbound
**B-NFT (2 ETH)** that backs slashing insurance — and matches stakers
to node operators through an auction whose validator keys are
encrypted on IPFS so that stakers retain the actual signing
material.[^s03][^s11] On top of that LRT base ether.fi has shipped
the **Liquid** vaults, the cross-chain Bitcoin LRT **eBTC**, and the
**Cash** Visa credit card on Scroll, which deploys a per-cardholder
Gnosis Safe and gives users a choice between spending stablecoins
directly or borrowing USDC against ETH collateral.[^s09][^s10][^s02]
DefiLlama records ether.fi at **$5.159 B TVL** with **$198.97 M
annualised fees** and **$48.57 M annualised revenue** on
2026-05-14, against an **ETHFI** governance token with fixed
1 B supply, roughly 83.6 % already circulating, and a vesting tail
that runs into 2027.[^s05][^s08] Security posture leans heavily on
formal verification: the public audits directory lists 29 reports
between 2023 and 2026, of which the most recent 14 are from
Certora.[^s06]

## 1. Introduction

Liquid restaking sits between two earlier categories. Liquid staking
tokens (LSTs) such as stETH or rETH issue a transferable receipt for
plain ETH staking; restaking protocols such as EigenLayer let
operators reuse staked capital to secure additional services.
Liquid restaking tokens (LRTs) combine the two — a transferable
receipt for ETH that has been restaked. Ether.fi is the largest LRT
by TVL[^s05] and is structurally distinctive in two ways: it does
**native** restaking through EigenPods on its own validators rather
than wrapping somebody else's LST,[^s02][^s14] and it keeps
validator keys in user-controlled withdrawal safes via a T-NFT /
B-NFT pattern[^s03] — the opposite of the trust posture taken by
custodial restaking products.

This report covers the protocol mechanics, the smart-contract
surface, the four customer-facing products (eETH/weETH, eBTC,
Liquid, Cash), the ETHFI tokenomics, and the security and adoption
state as of 2026-05-14.

## 2. Protocol design

### 2.1 The 32-ETH solo staker path

When a solo staker deposits 32 ETH, ether.fi mints "a withdrawal
safe and two NFTs (T-NFT, B-NFT)."[^s03] The T-NFT represents 30 ETH
and is transferable, the B-NFT represents 2 ETH and is soulbound,
and "the only way to recover the 2 ETH is for the validator to be
exited or fully withdrawn."[^s03] The B-NFT is not just an
accounting trick: it "is used to supply the deductible for slashing
insurance (in case of a slashing event) and represents a
responsibility to monitor the validator node for performance," and
it pays roughly a 50 % higher yield than the T-NFT to compensate for
that responsibility.[^s11] Reward distribution is split 90 % to
the staker, 5 % to the node operator, and 5 % to the
protocol.[^s11]

### 2.2 Node-operator auction and IPFS-encrypted keys

Operators do not pick their own validators directly; they bid into
an auction. "A node operator submits a bid in order to be available
to be assigned a validator node to run. Trusted node operators may
submit a nominal bid to be marked as available, while trustless node
operators participate in the auction mechanism and are assigned
validators based on their winning bid."[^s11] The matching is
designed so that stakers retain the validator keys: "Stakers
generate their validator keys and encrypt them via a shared secret
generated using the node operator public key associated with the
winning bid. Node operators store their public keys on IPFS, while
stakers store their encrypted validator keys on IPFS with their
hashes uploaded on-chain."[^s04]

### 2.3 Permissionless eETH minting and the LRT layer

The permissionless side of ether.fi is the LiquidityPool: any user
can deposit ETH and receive eETH, which is "a Liquid Restaking
Token that allows users to stake their ETH to accrue staking rewards
and automatically restake their ETH in EigenLayer."[^s02] eETH is
a rebasing token; **weETH is the wrapped non-rebasing version of
eETH that can be used throughout the DeFi ecosystem.**[^s02] In
practice the two coexist because rebasing breaks some DeFi
integrations (collateral accounting, AMM math) while wrapped
balances do not. Both weETH and eBTC are bridged "across multiple
chains via LayerZero."[^s02]

## 3. Native restaking through EigenLayer

EigenLayer is the protocol that introduced restaking to
Ethereum;[^s14] ether.fi's design choice is to plug *new* ETH
deposits into EigenLayer through its own EigenPod-backed validators
rather than restaking somebody else's LST. The ether.fi docs frame
this advantage in operational terms: "There are NO LIMITS on the
amount of ETH that can be natively restaked into EigenLayer. The
limits only exist for LST's that are looking to restake the LST
into EigenLayer."[^s02] _(point-in-time — EigenLayer governance
could change the cap policy)_ The protocol describes the user
ergonomics as "Staking with eETH on ether.fi automatically restakes
your ETH and accrues staking rewards while allowing users to use
eETH in other DeFi protocols. No other liquid staking protocol has
this capability."[^s02] _(vendor-stated; the precise framing of
"no other protocol" is the team's marketing)_

The architecture this implies — own validators, own EigenPods, own
LRT — is the reason ether.fi can claim "no LST-cap" status and a
key reason it ended up dominating the LRT TVL chart rather than
sharing it with LST-on-LST restakers.[^s13][^s05]

## 4. Product surface

### 4.1 eETH and weETH

eETH is the rebasing LRT; weETH is its non-rebasing wrapper.[^s02]
The docs treat them as the entry point, with eETH "permissionless,
easy complexity" and weETH the wrapper most often plugged into
DeFi.[^s02] Wrapped variants `weETHs` and `weETHk` are issued from
Liquid vaults and accumulate additional rewards on top of the LRT
base.[^s02]

### 4.2 eBTC — Bitcoin restaking

eBTC is ether.fi's Bitcoin LRT. Users can "Mint weETHs, weETHk or
eBTC" with a 0.01-unit minimum deposit, and eBTC rewards stack
across "Lombard, Babylon, Eigenlayer, Karak, Symbiotic, Etherfi,
and Veda points, along with an APY represented by a 7-day trailing
average."[^s02] The token is multi-chain through LayerZero's OFT
pattern.[^s02]

### 4.3 Liquid vaults

Liquid is ether.fi's strategy-vault layer. Vault tokens such as
`weETHs` and `weETHk` represent positions inside automated yield
strategies, with mints and redemptions accessible through the same
dapp surface as eETH and eBTC.[^s02] The home page bundles Liquid
alongside Stake and Cash as the three top-level product
verticals.[^s01]

### 4.4 Cash — a Visa credit card on Scroll

Cash is the customer-facing front-end that closes the loop between
LRT yield and everyday spending. CoinDesk's launch coverage spells
out the architecture clearly: "ether.fi's approach centers on
deploying an individual self-custodial wallet for each cardholder
on Scroll. When spending, ether.fi triggers a deduction from the
cardholder's Scroll-based wallet. That onchain transaction verifies
that the account is eligible to process the transaction in 1
second, and Visa confirms back to the merchant."[^s09] The product
ships in two modes. *Direct Pay* spends supported stablecoin
balances — "Currently, only USDC, USDT, and LiquidUSD are eligible
for Direct Pay mode."[^s10] *Borrow Mode* loans USDC against ETH
collateral: "The card borrows USDC against your ETH collateral to
pay the merchant. You keep your ETH (and its upside), avoiding a
taxable sale. You can repay the loan later with your staking
yield."[^s10] Cashback is 3 % across all transactions, the card is
Visa-branded, and the per-cardholder wallet is a Gnosis Safe on
Scroll.[^s09]

## 5. Tokenomics — ETHFI

The ETHFI governance token was announced on **March 16, 2024** with
a fixed total supply of 1,000,000,000 and "no plans for additional
issuance,"[^s07] and the Season 1 airdrop "allocates 6 % of the
total token supply, with the initial distribution phase commencing
on March 18" 2024 with a 90-day claim window.[^s12] The allocation
across stakeholders is **Investors 33.74 %, Treasury 21.62 %, Core
Contributors 21.47 %, User Airdrops 19.27 %, and Partnerships &
Liquidity 3.90 %**.[^s08] As of 2026-05-14 Tokenomist reports
**circulating supply at 835,965,183 tokens (83.60 % unlocked)**
with vesting that runs into 2027.[^s08] _(per-allocation cliff /
linear schedule is not exposed as text on the page)_

ETHFI's stated role is governance — "ETHFI gives community members
a direct mechanism to contribute to the protocol and influence the
growth of the ether.fi ecosystem"[^s07] — over grant programs,
protocol parameters, fee structures, and treasury. The launch post
also signals that **"ETHFI will be value accruing and you can hold
on to ETHFI to improve your StakeRank,"**[^s07] though it stops
short of committing to an explicit fee switch at launch.

## 6. Security posture

The etherfi-protocol/smart-contracts repository publishes a public
audits directory that lists **29 reports between 2023-02-25 and
2026-03-05**.[^s06] The early years are a mix of CertiK (Feb 2023),
Omniscia (May 2023), Nethermind (Jul 2023), Solidified (Oct 2023),
Hats Finance (Dec 2023), Zellic (Jan and Mar 2024), Decurity (Apr
2024), Halborn (Jun and Aug 2024), and Paladin (Sep 2024).[^s06]
From October 2024 onwards the audit cadence is dominated by
**Certora's formal verification**, with 14 reports covering EETH
share inflation, the withdrawal fee, the instant-withdrawal merge
in v2.49, EigenLayer slashing, the cumulative Merkle distributor,
the V3.Prelude refactor (twice), the Pectra features upgrade, the
weETH withdrawal adapter, safe-key generation and the restaker bug
fix, Liquid-Refer / KING / cross-pod approval, a full core-contract
re-audit on 2026-01-29, and most recently the Priority Queue
component on 2026-03-05.[^s06] The cadence is unusually formal for
a DeFi protocol but concentrates a lot of the verification burden
on a single auditor partner, which is itself a posture worth
flagging.

## 7. Adoption and market position

DefiLlama records ether.fi at **$5.159 billion TVL** on 2026-05-14
— **$4.974 B on Ethereum**, **$184.1 M on OP Mainnet**, and
≈$187 K on Scroll — with **annualised fees of $198.97 M and
annualised revenue of $48.57 M**.[^s05] _(point-in-time)_ ETHFI
trades at **$0.45** with a circulating market cap of **$373.98 M**
and a fully-diluted valuation of ≈$447.83 M.[^s05][^s08] On the
fundraising side, DefiLlama reports an initial **$5.3 M seed on
February 28, 2023** and a **$27 M Series A on February 28,
2024**.[^s05]

The strategic frame is to treat the Cash card as the consumer
mouth of an LRT supply chain. CoinDesk's coverage describes the
card as a way to "spend fiat while using their crypto assets as
collateral,"[^s09] which is precisely the loop the ether.fi home
page advertises with the tagline "Save, Grow, Spend. Do more with
your crypto."[^s01] Whether the consumer side will earn its
keep economically — Cash, Liquid, and the various seasons of
loyalty rewards — is the open question that adoption metrics like
TVL alone do not answer.

## 8. Discussion

The three structural differences that distinguish ether.fi from
peer LRT designs are worth holding together. First, **native
restaking** — ether.fi's underlying ETH is restaked through its own
EigenLayer EigenPods, rather than wrapping somebody else's LST and
inheriting that LST's EigenLayer cap exposure.[^s02][^s14] Second,
**key custody** — the T-NFT / B-NFT pattern and the IPFS-encrypted
key handoff keep validator keys in the staker's possession and
slashing insurance funded by the bonded operator, rather than
collapsing both roles into a single custodial entity.[^s03][^s04]
Third, **product breadth** — eETH/weETH plus eBTC plus Liquid plus
Cash gives ether.fi a vertically integrated funnel from base LRT
yield through automated strategy vaults into a real-world payments
surface that few other LRTs operate.[^s09][^s10]

The open questions are mostly downstream of those choices. Pectra's
EigenLayer slashing primitives are now in scope (Certora reviewed
them on 2025-04-12 and again as part of the Pectra features
upgrade in September and October 2025),[^s06] which makes the
B-NFT slashing-insurance economics directly exposed to a much more
active slashing surface than under earlier EigenLayer parameters.
Certora's central role in audits also makes a *partner-risk*
consideration: a single auditor's review cadence is high signal,
but it can also synchronise blind spots. And Cash card distribution
depends on Scroll, Visa, and the Direct Pay stablecoin set
(currently USDC, USDT, LiquidUSD), which together create
counterparty surfaces that the LRT contract architecture itself
cannot mitigate.[^s10]

## 9. Limitations

TVL, fees, revenue, and ETHFI market-cap figures are DefiLlama and
Tokenomist snapshots taken on 2026-05-14 and will move; the
per-allocation ETHFI vesting schedule (cliffs and linear release
windows for each tranche) is not exposed as plain text on the
Tokenomist page, so the report cites the aggregate state and the
"vesting into 2027" wording rather than tranche-level claims.

The ether.fi GitBook export is rich on user-facing surface but
relatively light on the deepest plumbing — particularly the
withdrawal queue and the precise oracle / accounting flow inside
the LiquidityPool. The audit-report titles in the public repo
(s06) reveal the surface area Certora has covered, which is the
most concrete public substitute for that documentation but is not
the same as a narrative spec.

Finally, no independent academic security treatment of ether.fi
exists at the time of writing; security claims rely on the public
audits directory and on Certora's individual report titles, not on
external empirical replication.
