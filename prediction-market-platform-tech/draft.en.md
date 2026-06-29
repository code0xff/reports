## Abstract

A prediction market is an information-aggregation mechanism: it lets people trade contracts tied to the outcome of a future event so that the market price can be read as the crowd's estimate of that event's probability[^s05][^s11][^s12]. This report dissects the technical machinery that actually makes such platforms run, centered on Polymarket — the largest crypto-native prediction market[^s10]. Polymarket combines (1) Polygon as its execution and settlement layer, (2) the Gnosis Conditional Token Framework (CTF, ERC-1155) to mint outcome tokens, (3) a hybrid central limit order book (CLOB) that matches orders off-chain and settles atomically on-chain, (4) UMA's Optimistic Oracle for outcome resolution, and (5) proxy (smart-contract) wallets plus a relayer for a gasless experience[^s01][^s02][^s03][^s04][^s05]. This design dramatically improves performance and usability over fully on-chain models (Augur), but it introduces operator trust at the matching stage and a token-weighted-voting oracle as a governance attack surface at the settlement stage[^s16][^s17]. A regulated, centralized exchange (Kalshi) is contrasted as the alternative axis that implements the same "binary event contract" economics without a blockchain[^s13][^s14]. Both reported volumes and oracle-governance soundness are contested; this report presents both sides rather than resolving them silently.

## Introduction

A prediction market is a device for converting the question "will this event happen?" into a market price. If you create a contract that pays $1 if an outcome occurs and $0 otherwise, its equilibrium price is naturally read as the participants' aggregated probability for that event[^s05][^s11]. This "price-as-probability" reading is what turns a prediction market into an information-aggregation mechanism rather than mere betting _(interpretive)_[^s11][^s12].

The technical foundation matters because the mechanism must solve two trust problems. The first is **trading and custody trust** — who holds the money, and how are orders matched and settled? The second is **resolution trust** — who decides, and how, whether the real-world event actually occurred? Platforms differ in whether they assign each problem to on-chain code, off-chain operators, or a regulator, and that choice is precisely what determines their architecture.

The scope here is to take Polymarket as the primary case and dissect its stack down to the contract level, with a fully on-chain model (Augur) and a regulated off-chain model (Kalshi) as comparison axes. Polymarket is the anchor for a simple reason: its 2024 U.S. presidential market saw billions of dollars in reported trading, and multiple outlets reported it as the largest market of its kind[^s08][^s09][^s10].

## Background — Market Microstructure of Prediction Markets

Prediction-market platforms form markets in one of two main ways. One is a **central limit order book (CLOB)**, which matches buy and sell orders directly; the other is an **automated market maker (AMM)** that continuously quotes prices and acts as counterparty[^s01][^s11]. Polymarket uses the former; early Augur and Gnosis-family experiments leaned toward cost-function market makers.

The theoretical basis for the AMM family is Hanson's **Logarithmic Market Scoring Rule (LMSR)**. LMSR maintains a cost function `C(q) = b · log Σ e^(q_ω/b)`, allows trades at any time to provide infinite liquidity, and bounds the market maker's worst-case loss to a constant that grows logarithmically in the number of outcomes (`b·ln2` for two outcomes)[^s11]. The parameter `b` jointly controls liquidity depth and the maximum loss[^s11]. LMSR was once called the "de facto standard market maker for prediction markets"[^s11], but Polymarket chose a CLOB model that leaves liquidity and price discovery to the participants' limit orders.

The third core component is the **conditional token**. In the Gnosis Conditional Token Framework, depositing collateral mints a set of ERC-1155 tokens, one per outcome ("split"); combining all outcome tokens redeems the collateral ("merge"); and at resolution the oracle's reported payout vector lets only the winning tokens be redeemed for collateral ("redeem")[^s06][^s02]. A condition is defined as "a question to be answered in the future by a specific oracle in a particular manner," and the position ID serves as the ERC-1155 token ID[^s06].

## Polymarket's On-Chain Architecture

### Execution layer: Polygon

Polymarket's smart contracts are deployed on **Polygon**, where they hold participant collateral, manage positions, and execute final settlement once the outcome is verified[^s05][^s01]. Polygon's dual layer — Bor producing ~2-second blocks while Heimdall periodically checkpoints to Ethereum — separates fast soft finality from Ethereum-grade finality[^s20].

### Outcome tokens: the Conditional Token Framework (ERC-1155)

Each binary market has two tokens — a Yes token that redeems for $1 if the event occurs and a No token that redeems for $1 if it does not. These tokens are always fully collateralized: every Yes/No pair is backed by exactly $1 of stablecoin locked in the CTF contract[^s02]. This follows directly from Polymarket's adoption of the Gnosis CTF (ERC-1155)[^s02][^s06].

### Trading model: the hybrid CLOB

Polymarket's exchange is a hybrid-decentralized design: "off-chain order matching with on-chain settlement via the Exchange contract"[^s01]. A centralized **operator** manages the order book and matches buy/sell orders off-chain, so traders need not pay gas for each order creation, cancellation, or update[^s05][^s20]. Orders are expressed as EIP-712 signed structured data, and the Exchange contract can only execute exactly the order the user signed — trading is non-custodial and "the operator cannot set prices or execute unauthorized trades"[^s01]. Once a match is found, settlement occurs atomically on Polygon, with USDC and outcome tokens swapped all-or-nothing in a single transaction[^s01][^s20]. Separating matching (off-chain) from settlement (on-chain) is the essence of this "hybrid exchange" design[^s20].

### Collateral asset

Collateral is denominated in a stablecoin pegged 1:1 to the U.S. dollar[^s05]. The exact label, however, varies by source: the academic analysis describes it as "USDC"[^s05], the proxy-wallet docs state that balances are held as **USDC.e** (bridged USDC on Polygon)[^s04], and the current CTF docs use the UI label **pUSD**[^s02]. The economic substance (a 1:1 dollar-pegged stablecoin) is the same, but the name shown to users is shifting.

### Gasless experience: proxy wallets and relayers

Polymarket assigns each user a smart-contract wallet: a **proxy wallet** for email/Magic Link logins, and a Safe structure for browser-wallet (e.g., MetaMask) connections[^s04]. The proxy wallet "enables gasless transactions and automatically executes multi-step transactions," with transactions relayed by a gas-station-network-style relayer that pays the gas[^s04]. As a result users never handle gas or approval popups, yet retain non-custodial control: only the key holder can move funds[^s04].

## Oracles and Market Resolution

After trading ends, a market resolves its outcome via an oracle. Polymarket uses **UMA's Optimistic Oracle (OO)** for this[^s03][^s07]. It works as the "optimistic" name implies: someone proposes an outcome while posting a bond (about $750 per the docs), and if no one disputes within a liveness window (~2 hours) the result is finalized[^s03]. That is, "statements are assumed valid unless challenged"[^s07].

If a dispute is raised, the resolution procedure kicks in. The Polymarket–UMA adapter ignores the first dispute and recreates the request with the same parameters, so that malicious or mistaken disputes cannot stall resolution[^s19]. If the same request is disputed a second time, it is treated as a more fundamental disagreement and escalates to UMA's **Data Verification Mechanism (DVM)**, where UMA token holders vote to finalize the outcome (voting takes roughly 48 hours)[^s03][^s07]. The intent of this "assume honesty first" design is efficiency: academic analysis notes that most queries are resolved cheaply and quickly at the OO layer, while only the small fraction of disputed cases invoke the more resource-intensive voting process[^s21]. One technical explainer puts that share at about 98.5% _(unverified — single source)_[^s19].

But this settlement model has caused real controversy. In July 2025, a market asking whether President Zelenskyy wore a suit drew over $237 million in volume and was finalized only after an initial "Yes" was overturned to "No" on a second review[^s15][^s16]. UMA's oracle finalized "No" on the grounds that a "consensus of credible reporting" had not been sufficiently established, even as users compiled 40+ media headlines describing the outfit as a suit[^s15]. More structurally, a dispute over a Strategy (formerly MicroStrategy) Bitcoin-sale market put the token-weighted-voting oracle itself on trial — one investigation found that in most disputed markets more than half of UMA votes came from the ten largest wallets, and at least 60% of active UMA voters could be linked to live Polymarket accounts[^s17].

## Comparative Analysis — Other Platforms' Technical Models

**Kalshi** shows the opposite axis. Kalshi is a CFTC-regulated U.S. exchange registered as a **Designated Contract Market (DCM)**, subject to the Commodity Exchange Act and 23 Core Principles[^s13]. It obtained its CFTC license in November 2020, becoming the first regulated platform to trade event contracts directly, and runs on centralized, off-chain order-book infrastructure modeled on traditional derivatives exchanges rather than a blockchain[^s14]. Where Polymarket entrusts resolution to an on-chain oracle, Kalshi entrusts it to the regulator and its own exchange compliance.

**Augur** is the archetype of the fully on-chain axis. It is a trustless prediction market on Ethereum whose native token **REP (Reputation)** holders report market outcomes by staking REP on a result[^s12]. As disputes grow, token holders post progressively larger bonds to challenge a proposed outcome, and if the bonds cross a threshold REP "forks" into per-outcome versions, forcing holders to migrate to the version matching reality — a last-resort backstop[^s12]. If UMA is a general-purpose oracle called from outside, Augur builds the oracle itself into the protocol and its token.

All three share the same "binary event contract" economics but diverge on where trust sits: Kalshi in the regulator, Polymarket in a hybrid of (off-chain operator + on-chain oracle), and Augur in fully on-chain token governance.

## Discussion — Technical Trade-offs and Trust Models

**The off-chain matching trade-off.** A hybrid CLOB gives clear advantages over a fully on-chain AMM in matching speed, cancellation cost, and UX, because order management costs no gas and only settlement is on-chain[^s01][^s05][^s20]. But because a single operator performs matching and ordering, it introduces operator trust — censorship or priority manipulation _(interpretive)_. The design narrows that surface by having the contract execute only signed orders and forbidding it from setting prices[^s01], yet the fairness of matching itself remains off-chain.

**Is the oracle a single point of failure?** The Optimistic Oracle works cheaply and quickly for most unambiguous markets[^s19], but in markets whose outcome interpretation is ambiguous, token-weighted voting risks becoming a court of the majority rather than a court of facts _(interpretive)_[^s17]. The Zelenskyy-suit and Strategy-Bitcoin markets show that resolution risk — "a market that looks obvious in reality can still pay out differently if a dispute escalates" — exists independently of event risk[^s15][^s17]. The overlap between voters and bettors, and the absence of KYC, are cited as structural factors amplifying this risk[^s15][^s17].

The opposing view deserves equal weight, however. Academic analysis frames these disputes not as outright failures but as design trade-offs: the optimistic model presumes rational, well-incentivized participants, and the root cause of contentious resolutions is often **ambiguity in natural-language question phrasing** rather than fraud — "ambiguity in question phrasing can lead to inconsistent interpretations or contentious resolutions"[^s21]. In the Zelenskyy market, UMA/Polymarket grounded the "No" finalization in the absence of a confirmed "consensus of credible reporting," and several commentators likewise argued the question itself was poorly designed because it never strictly defined what counts as a suit[^s15]. In other words, the token-weighted-voting capture risk and the question-design ambiguity risk are distinct; the more accurate diagnosis is that both were operating at once _(interpretive)_.

**Reading the volume figures.** Finally, reported volume should not be taken at face value. The 2024 election market's headline volume was reported at roughly $3.6–3.7 billion[^s08][^s09], but an academic decomposition finds that raw on-chain flows mix secondary trading with primary minting/burning, so "exchange-equivalent turnover" may be less than half the headline (e.g., the Trump market's October surface volume of $958.48M vs. $391.03M exchange-equivalent)[^s05]. Independent analysis estimated wash trading at about one-third of the presidential market's volume, with true volume below the reported figure[^s18]. Any volume number should therefore be read as an upper bound on turnover.

## Limitations

- **Closed infrastructure.** Polymarket's off-chain matching engine and relayer operations are not open-source beyond public contracts and audit reports, so descriptions of those components rely on Polymarket's own docs and third-party reverse-engineering.
- **Evidence level for governance risk.** The capture risk of UMA's token-weighted voting rests on news reporting, one investigative dataset (s17), and individual dispute cases. A peer-reviewed analysis (s21) treats the risk qualitatively as a design trade-off, but no study directly quantifying capture has been confirmed. Those claims are marked interpretive.
- **A fast-moving stack.** The collateral asset's label (USDC/USDC.e/pUSD) and login/settlement details are being updated, and Augur's 2025 "Lituus" revival is early-stage, so its oracle/forking design may change.
- **Volume measurement.** Reported volume varies widely by methodology; this report presents no single definitive figure.
