## Abstract

An on-chain order book exchange is an attempt to implement a central limit order book (CLOB) on a blockchain — and that is itself a hard engineering problem. Order books demand frequent order placement and cancellation plus low-latency matching, which is fundamentally mismatched to Ethereum L1's low throughput and high gas costs[^s05][^s08][^s12]. This report dissects the four technical families that emerged to sidestep that problem: (A) hybrid off-chain matching with on-chain settlement (0x, dYdX v3)[^s07], (B) app-specific chains with a validator in-memory order book (dYdX v4)[^s01], (C) on-chain CLOBs atop parallel-execution general-purpose L1s (Solana's Serum/OpenBook, Injective, Sei)[^s05][^s04][^s09], and (D) a fully on-chain CLOB on a purpose-built trading L1 (Hyperliquid)[^s03]. Each family picks a different point on the spectrum between decentralization/verifiability and performance/latency, and the MEV / fair-ordering problem is handled with mechanisms such as frequent batch auctions (FBA)[^s04][^s10]. In the 2025 on-chain derivatives market the fully on-chain model (Hyperliquid) took a dominant share, demonstrating the commercial viability of the approach — though that share swung sharply as rivals appeared[^s13][^s14].

## Introduction

The mainstream of decentralized exchanges (DEXs) was long the automated market maker (AMM). AMMs set prices via a bonding curve and liquidity pools, which makes on-chain implementation simple. A **central limit order book (CLOB)**, by contrast, matches buy and sell limit orders on **price-time priority** — the same mechanism traditional finance exchanges use[^s05]. CLOBs offer finer price discovery and market making, but have been known as a model "usually difficult to implement on-chain due to its high scalability and throughput requirements"[^s05].

"On-chain order book" is in fact a spectrum. At one end is the **fully on-chain** model, where order placement, cancellation, and matching all happen on the blockchain; at the other is the **hybrid** model, where matching is done off-chain and only the resulting fills settle on-chain[^s03][^s07][^s08]. This report walks that spectrum, analyzing which technical breakthroughs enabled each point and what strengths and weaknesses each choice carries.

## Background — Why On-Chain Order Books Are Hard

The crux is the workload of running an order book. In a fully on-chain book, "every single component of the trading process, from order to matching to settlement, must be executed as a transaction onchain"[^s08]. In particular, when a large order fills against multiple price levels, "each fill requires updating the order book state, transferring assets between parties, calculating weighted average prices, and potentially triggering cascading orders, all in one transaction," so compute and gas costs balloon[^s08]. Worse, active market makers continually re-quote as prices move, so an order book demands roughly 100× the throughput of trades[^s12]. Ethereum L1's throughput and gas cannot bear this — dYdX itself cited the lack of any chain that "can handle even close to the throughput needed to run a first class orderbook and matching engine" as the core reason for leaving[^s12].

The second challenge is **control over transaction ordering**. If a block producer (or sequencer) can choose the order of transactions in a block, MEV (maximal extractable value) such as front-running and sandwiching arises. An academic survey notes that "consensus protocols adopted in many blockchains do not enforce rules on the ordering of transactions," and that the simplest single-sequencer alternative, First-Come-First-Serve, "orders transactions according to their arrival time at the sequencer, ensuring fairness in processing and reducing front-running by limiting sequencers' ability to order transactions arbitrarily"[^s10]. Because in an order book ordering is execution, these venues are especially sensitive to the fair-ordering problem.

## Technical Architecture Taxonomy

### (A) Hybrid: off-chain matching + on-chain settlement

The first workaround was to move the expensive work — matching — off the chain. 0x calls this "off-chain order relay with on-chain settlement": cryptographically signed orders are broadcast over arbitrary off-chain channels, and an interested counterparty injects them into 0x's Exchange contract to execute and settle on-chain[^s07]. Order creation and cancellation happen gaslessly off-chain; on-chain cost is incurred only on a fill[^s07]. dYdX v3 belonged to the same family — core trade logic settled to the StarkEx rollup, but the order book and matching engine ran on servers operated by the dYdX team[^s12].

### (B) App-specific chain: a validator in-memory order book

dYdX v4 took a different road — making the exchange itself a blockchain. The dYdX Chain is "an L1 blockchain built on top of CometBFT and using CosmosSDK"[^s02], and its key innovation is how it handles the order book. "Validators are responsible for storing orders in an in-memory orderbook (i.e. off chain and not committed to consensus)," with orders and cancels gossiped across the network so the validators' books become eventually consistent[^s01][^s15]. Matching happens in real time, and "the resulting trades are then committed on-chain each block"[^s01]. That is, orders never touch chain state; only fills go through consensus. The matching logic lives in a Cosmos module called `x/clob`[^s15].

### (C) On-chain CLOB atop a parallel-execution general-purpose L1

The third family lets a high-performance general-purpose L1 host the book directly. **Serum** was the first exchange to make a fully on-chain CLOB work on Solana, implementing "the CLOB execution model... usually difficult to implement on-chain" on top of Solana's parallel execution[^s05]. Because transactions touching disjoint state (accounts) run concurrently, each market could be processed in parallel as independent program state. When FTX's collapse jeopardized Serum's upgrade keys, the community forked it into **OpenBook**, and OpenBook v2 was rewritten to "decouple order matching from settlement through an event heap system"[^s06].

**Injective** embeds the order book at the chain-protocol level and blocks MEV by design. Injective's order book "employs Frequent Batch Auctions (FBA), processing all transactions within discrete intervals simultaneously at a uniform clearing price, effectively mitigating MEV exploits like front-running and sandwich attacks"[^s04]. Since all orders in a block clear at the same price, arrival order within the block confers no advantage[^s08]. Injective reports ~0.65s block times and up to 25,000 TPS on Tendermint consensus _(vendor-stated)_[^s04].

**Sei** began as a Cosmos-SDK trading chain "optimized to run an on-chain orderbook"[^s09]. But with v2 it abandoned the "orderbook-based trading" focus to become "the first production-ready, fully parallelized EVM blockchain"[^s09]. So "built-in order book + parallel execution" is accurate for Sei v1's design intent, but after v2 the native order book is no longer the chain's central narrative _(early signal / partly historical)_[^s09].

### (D) Fully on-chain CLOB on a purpose-built trading L1

**Hyperliquid** represents the fully on-chain end of the spectrum. Its trading engine, HyperCore, runs on the chain itself rather than as a separate contract, and the docs state that "HyperCore does not rely on the crutch of off-chain order books" and achieves "full decentralization with one consistent order of transactions achieved through HyperBFT consensus"[^s03]. Every order, cancel, fill, and liquidation is an L1 transaction with consensus-level finality. Throughput is documented at "200k orders / second," with median end-to-end latency of 0.2 seconds for a co-located client _(vendor-stated)_[^s03].

The "full decentralization" self-claim is strongly contested, however. Critics note the network runs only ~16–30 validators with a large share of stake concentrated in Foundation nodes, and that the node software ships as a signed single binary rather than full source[^s16][^s17]. One critic (Kyle Samani) argued the Foundation can jail validators without justification and force software upgrades, and Singapore's MAS added Hyperliquid to its Investor Alert List on 26 June 2026[^s17]. In other words, "on-chain" in the sense that the order book lives in consensus state is distinct from "decentralized" in the sense that the validator set and governance are distributed; Hyperliquid is strong on the former while the latter is disputed _(interpretive)_.

## Strengths and Weaknesses by Technology

**Hybrid off-chain matching (0x, dYdX v3).** Strength: performance and cost — order management is gasless and only fills go on-chain[^s07]. Weakness: trust enters at the matching step. dYdX v3 required users "to trust the dYdX server to match orders fairly and not front-run or censor," and the rollup's single sequencer was itself a centralization point[^s12] _(interpretive)_.

**App-specific chain (dYdX v4).** Strength: sovereignty and performance customization — own validators, fee structure, and MEV handling. The cost is twofold. First, instead of borrowing Ethereum's security you must "trust an entirely new set of validators"[^s12]. Second, the move to a standalone chain drew criticism for fragmenting the user base and complicating bridging[^s12] _(interpretive)_.

**Parallel-execution general-purpose L1 (Serum/OpenBook, Injective, Sei).** Strength: composability — other DeFi on the same chain can share the book's liquidity, and they share general-purpose security. Weakness: the exchange is hostage to the chain's performance, congestion, and governance, and — as on Solana — liquidity can fragment across multiple order books (OpenBook, Phoenix, etc.) _(interpretive)_.

**Fully on-chain dedicated L1 (Hyperliquid).** Strength: verifiability — because the book itself is consensus state, no one can secretly reorder matches[^s03]. The cost is twofold. First, infrastructure specialization: matching that performance requires consensus (HyperBFT) and an execution engine designed for trading from scratch[^s03][^s08], and "most viable implementations require their own dedicated chain" rather than L1 deployment[^s08]. Second, execution-level decentralization does not guarantee governance decentralization: Hyperliquid's small validator set, Foundation stake control, and closed-source binary have drawn sustained criticism that the network is effectively permissioned[^s16][^s17] _(interpretive)_.

## Discussion — Trade-offs and Convergence

The axis running through all four families is "**where does matching happen?**" Off-chain matching buys performance but imports operator trust; fully on-chain matching buys trustlessness but demands dedicated infrastructure. dYdX v4 chose an interesting middle — matching in validator memory (off-chain), settlement in consensus (on-chain)[^s01]. So even under the single label "on-chain order book," the trust models differ fundamentally.

On the MEV / fair-ordering problem, one technique stands out. The **frequent batch auction (FBA)** turns continuous matching (CLOB) into discrete-time batched clearing, removing the advantage of arrival order[^s04][^s08]. Academic work compares FBA and its continuous counterpart, the CLOB, on welfare loss and liquidity provision, showing the two are a trade-off rather than a simple ranking[^s11].

Commercial fortunes moved somewhat independently of this technical debate. In the 2025 on-chain derivatives market the fully on-chain Hyperliquid surpassed $3 trillion in cumulative volume and held a dominant position[^s13]. That share was not stable, however — from ~70–80% in spring–summer 2025 it briefly cratered when an incentive-driven rival (Aster) appeared, then recovered to ~44% of volume and over 70% of open interest by April 2026[^s14]. In short, the fully on-chain order book is commercially proven, but share leadership is driven far more by liquidity and incentive flows than by technology _(interpretive)_.

## Limitations

- **Vendor-stated numbers.** Hyperliquid's 200k orders/sec and Injective's 25,000 TPS come from project docs; no independent benchmark was obtained. Read them as design targets / self-reported capacity.
- **Fast-moving market share.** Hyperliquid's dominance swung 80%→10%→44% within a year, so this report gives a range rather than a single figure.
- **Sei's shifting identity.** "Order-book trading L1" fits v1's design intent, but after v2 Sei became a general-purpose parallel EVM and the native order book is no longer central.
- **Matching-engine internals.** Core code paths (HyperCore, dYdX `x/clob` memclob) are documented but not independently audited within this report's sources.
- **Definitional ambiguity.** "Fully on-chain" is a spectrum; dYdX v4 (validator memory) and Hyperliquid (consensus state) carry different trust models under the same label.
- **On-chain ≠ decentralized.** Even when the order book lives in consensus state (Hyperliquid), the validator set and governance can be centralized; the two must be assessed separately[^s16][^s17].
