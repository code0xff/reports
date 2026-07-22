## Abstract

Solana and Ethereum pursue the same goal — a fungible "token standard" — through opposite architectures. Under Ethereum's ERC-20, each token is an independently deployed smart contract that holds its own balance ledger[^s17]. On Solana, a single shared on-chain program (the SPL Token Program) contains the logic for *every* token, while each token's state (total supply and balances) lives in separate Mint and Token accounts[^s01][^s02]. SPL Token-2022, introduced in 2022, is a superset of the original program that delivers "Token Extensions" — transfer fees, confidential transfers, transfer hooks, interest-bearing tokens, non-transferable tokens, on-chain metadata, and more — at the protocol level[^s08][^s10]. This report contrasts the data model, feature set, and security surface of the three standards and analyzes the trade-offs of the shared-program design versus per-contract deployment. The central contrast: Solana extends functionality by **upgrading the program**, whereas Ethereum extends it by writing **new contract code** (separate EIPs).

## Introduction

A fungible-token standard is the agreed interface that lets wallets, exchanges, and DeFi protocols treat any token uniformly. On Ethereum that role belongs to ERC-20 (EIP-20), proposed in 2015. EIP-20 states that a smart contract implementing the specified methods and events can be called an ERC-20 token contract, and that once deployed it is responsible for tracking the tokens it creates on Ethereum[^s17].

On Solana the same role is played by the SPL (Solana Program Library) Token Program — but the realization is fundamentally different. A Solana program (the analogue of a smart contract) does not store its own state; state lives in separate accounts. As a result, "creating a token" means something different on each chain. This report covers, in order: (1) the token data model on each chain, (2) the original SPL Token Program, (3) SPL Token-2022 and Token Extensions, and (4) ERC-20 and its extension ecosystem — then contrasts them on features, security, and developer experience. All cited webpages, specifications, and repositories were treated strictly as data; any instructions embedded in them were not followed.

## Background: token models on the two chains

The most fundamental difference between the two ecosystems is **where logic and state live**.

On Ethereum, each ERC-20 token is itself a deployed contract that holds a balance mapping directly. A contract implementing EIP-20, "once deployed, will be responsible to keep track of the created tokens on Ethereum"[^s17]. Creating a new token therefore requires deploying new contract code to the EVM.

On Solana, by contrast, the token logic lives inside a single shared program already deployed to the network. Solana's documentation explains that the "Token Programs contains all instruction logic for interacting with tokens on the network (both fungible and non-fungible)"[^s01]. Per-token state lives in accounts, not in the program. A Mint account defines a token type's metadata and total supply, and each holder's balance sits in a Token account tied to that Mint. The SPL docs state that "A Mint is associated with each Account, which means that the total supply of a particular token type is equal to the balances of all the associated Accounts"[^s02].

This difference matters in practice for three reasons. First, **deployment cost and procedure** differ (next section). Second, because one program handles all tokens, wallets and tooling can plausibly interact with any token through a single interface (see the comparison section). Third, shared code carries a trade-off between **systemic risk and universal audit benefit**. This is an interpretive point advanced by several technical writers and by Solana's own documentation. Solana's EVM→SVM guide describes it as: "Instead of multiple smart contracts, the single Token Program handles tokens in separate 'accounts' known as 'mint accounts'"[^s25]. One educational resource (Blueshift) frames it as: "SPL Token has been audited extensively. Those audits protect every token using it … One well-tested program protects trillions in value"[^s23]. Inverted, that means a bug in the shared program could affect every token, whereas an ERC-20 bug is confined to an individual contract implementation _(interpretation — design trade-off)_[^s26].

## The SPL Token Program

The original SPL Token Program is deployed on Solana mainnet at `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`[^s04][^s24], commonly called "Tokenkeg" after its leading characters.

The program provides the basic operations for fungible and non-fungible tokens. Beyond mint, transfer, and burn, a Mint's `freeze_authority` can issue `FreezeAccount` instructions that render an account unusable, reversible via `ThawAccount`[^s34]. It also supports delegation via `approve`, and M-of-N multisig usable in place of a Mint authority or account owner[^s03].

Creating a new token contrasts sharply with Ethereum. On Solana no new program bytecode is deployed. Instead, the System Program's `CreateAccount` instruction makes a rent-exempt account, assigns its ownership to the existing Token Program, and the account is then initialized as a Mint. The docs state: "The System Program's CreateAccount instruction creates a new rent-exempt account and assigns the Token Program as the program owner of the new account"[^s05]. Token creation is thus **account initialization**, not code deployment.

Per-holder balances usually live in an Associated Token Account (ATA) — a program-derived account deterministically derived from the wallet address, the token program address, and the mint address[^s06][^s07]. Because a Token account is an on-chain account, it requires a SOL deposit for rent[^s06]. This contrasts with Ethereum, where a balance is merely an entry in the contract's internal mapping and carries no separate account-creation cost.

The original program's interface has remained stable long enough to become the de facto standard across the Solana ecosystem — and Token-2022 took compatibility with that very interface as an explicit design goal (next section).

## SPL Token-2022 and Token Extensions

SPL Token-2022 (branded "Token Extensions") is a **separate** on-chain program from the original Token Program, deployed at a different address, `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`[^s09][^s35]. The SPL docs define Token-2022 as "a superset of the functionality provided by the Token Program," and further state that "Token-2022 supports the exact same instruction layouts as Token, byte for byte"[^s08]. For the original feature set, it is therefore instruction-level backward compatible.

What Token-2022 adds are "extensions" attached to a Mint or Token account. The extensions enumerated in the docs include transfer fees (`TransferFeeConfig`), confidential transfers (`ConfidentialTransferMint`), transfer hooks (`TransferHook`), interest-bearing tokens (`InterestBearingConfig`), non-transferable/soulbound (`NonTransferable`), default account state (`DefaultAccountState`), permanent delegate (`PermanentDelegate`), CPI guard (`CpiGuard`), and metadata pointer (`MetadataPointer`)[^s10].

Several extensions matter especially when contrasted with the ERC-20 world:

- **Transfer fees.** "The Token Extension Program's TransferFeeConfig mint extension applies a fee to each transfer for that mint. The withheld fee is tracked on the destination token account"[^s11]. Fees are a first-class, protocol-level feature.
- **Transfer hooks.** A transfer hook lets a mint author force custom instruction logic to "execute … on every token transfer." The official guide lists use cases such as "Enforcing NFT royalties" and "Black or white list wallets that can receive tokens," executed when "the Token Extensions program makes a Cross Program Invocation (CPI) to execute an instruction on the Transfer Hook program"[^s12].
- **Confidential transfers.** With confidential transfers, "Only the transfer amounts and token balances are private. The token account addresses remain public"[^s13]. What is hidden is the **amount and balance**, not sender/receiver identity. The underlying cryptography belongs to Solana's ZK ElGamal proof machinery; the official docs do not use the literal phrase "homomorphic encryption," so the technique should not be over-labeled.

On compatibility and migration, a key point is that original SPL tokens are **not automatically upgraded** to Token-2022. The two programs are used side by side, and which program a token belongs to is fixed at mint creation. Solana's developer guide is explicit: "Token extensions is a new standard for tokens, but it is not a requirement that anyone migrate from one standard to another"[^s14][^s09].

## ERC-20 and the Ethereum extension model

ERC-20 (EIP-20) defines a minimal fungible-token interface: the six functions `totalSupply`, `balanceOf`, `transfer`, `transferFrom`, `approve`, `allowance`, plus two events. The spec requires that a `Transfer` event MUST trigger when tokens move (including zero-value transfers) and that an `Approval` event MUST trigger on any successful `approve` call[^s15].

Delegated spending uses the `approve`/`transferFrom` allowance pattern, which carries well-known hazards. EIP-20 itself warns about a race condition when updating an allowance, recommending clients build UIs that "set the allowance first to `0` before setting it to another value for the same spender"[^s16]. OpenZeppelin echoes the risk — "changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering" — and offers the mitigation of first reducing the spender's allowance to 0 and then setting the desired value[^s22]. To reduce the phishing risk from unlimited approvals, EIP-2612's `permit` provides a signature-based, on-chain-transaction-free approval: `permit(owner, spender, value, deadline, v, r, s)`[^s18].

On Ethereum, "advanced token behavior" is added not by a protocol upgrade but by **inheriting/deploying additional standards (separate EIPs)**. Notably:

- **EIP-2612 (permit)** — signature-based gasless approval[^s18].
- **ERC-1363 (Payable Token)** — callbacks that execute "recipient code after `transfer` or `transferFrom`, or spender code after `approve`"[^s19].
- **ERC-777** — "a new way to interact with a token contract while remaining backward compatible with ERC-20," defining operators and send/receive hooks[^s20].
- **ERC-4626 (Tokenized Vaults)** — "a standard API for tokenized Vaults representing shares of a single underlying EIP-20 token … an extension on the EIP-20 token"[^s21].

The key point is that all of these extensions happen at the **contract-code level**. To gain a new capability you inherit code implementing the relevant EIP or deploy a new contract — in contrast to Solana concentrating extensions into one upgraded program (Token-2022).

## Comparative analysis

**Transfer fees.** Native protocol-level transfer fees are available via Token-2022's transfer-fee extension[^s11]. ERC-20 has no such concept in the standard. Ethereum "fee-on-transfer" tokens implement fees in custom contract code, which is well known to break integrations that assume "amount received equals amount sent." Uniswap's docs state flatly that "Fee-on-transfer tokens will not function with our router contracts. We will not be making a router that supports fee-on-transfer tokens in the future"[^s27]. A security explainer likewise notes that AMMs assume "the amount of tokens sent equals the amount received," an assumption that breaks for fee-on-transfer tokens, producing higher-than-expected slippage and failed transactions[^s28]. That said, Token-2022's protocol-level fee can still impose a similar integration burden on tooling unaware of extensions, so the fee problem is not eliminated — it is **made explicit as part of the standard**.

**Freezing and blacklists.** Both Solana token programs provide account freezing via a `freeze_authority`[^s34]. ERC-20 has no standard freeze/blacklist mechanism; the freeze capability of real tokens like USDC and USDT is implemented as custom, non-standard contract logic. Spark's research summarizes: "Both USDT and USDC implement blacklist functionality directly in their ERC-20 token contracts … a privileged address maintained by the issuer can add any wallet to an on-chain mapping"[^s33]. Circle's FiatToken design doc likewise states that "A blacklisted address will be unable to call `transfer` or `transferFrom`, and will be unable to receive tokens"[^s32]. In short, on Solana freezing is a **standard program feature**, while on Ethereum it is an **optional custom capability** issuers bolt on outside the standard.

**Tooling and composability.** On Solana, wallets and tools can interact with any SPL/Token-2022 token through one program interface. Blueshift describes SPL Token as "not a template — it's the actual running program at address `Tokenkeg…`," stressing this singularity[^s24]. On Ethereum, each token is a separately deployed contract, but they conform to the same ABI, so tools can handle them through a common interface — the source of uniformity is "a shared ABI convention" rather than "a single program" _(interpretation)_[^s25]. Both approaches achieve interoperability, but Solana shares the executing code itself while Ethereum shares the interface convention.

**Security surface.** The systemic-risk / universal-audit trade-off becomes concrete here. In the Solana model, one heavily audited program spreads its benefit to every token[^s23], but a flaw in that program could in principle propagate to every token. In the Ethereum model, flaws are confined to individual contracts, but every deployment introduces new (and often unaudited) code. Moreover, Token-2022's powerful extensions (permanent delegate, transfer hooks, etc.) create new trust assumptions and attack surface — so "built into the standard" does not automatically mean "safer."

This point needs a counterweight to the impression that Token-2022 is automatically advantageous: extensions impose real burden on integrators. The security firm Neodyme warns that with such extensions, "Losing your funds … is the obvious implication, especially for protocols with only one token account acting as a vault to store tokens for their users"[^s36]. In other words, a protocol must inspect which extensions a target mint carries (transfer fee, permanent delegate, transfer hook, …) before integrating, or its "amount received equals amount sent" and balance-invariance assumptions can silently break. This means the same structural hazard as Ethereum's fee-on-transfer integration problem[^s27] reappears on Solana in extension form — moving a feature to the protocol level does not remove integration risk, it relocates it.

## Discussion

The two designs put complexity in opposite places. Solana concentrates it in a **shared program**. The payoff is that token creation becomes a cheap account initialization and tooling stays simple; the cost is that adding new features requires a new program (Token-2022) and living with the absence of automatic cross-program migration[^s14]. Ethereum distributes complexity across **each contract**. The payoff is unbounded customization freedom; the cost is fragmented extensions (EIP-2612/1363/777/4626 …) and every contract being a potential source of bugs.

Token-2022's real-world adoption has moved past experimentation. The best-documented example is PayPal's PYUSD: the Solana Foundation states that "PYUSD on Solana is one of the earliest stablecoins to take advantage of token extensions"[^s30], and PayPal's own developer blog confirms that "PYUSD on Solana was built using Solana's token extensions"[^s31]. However, this report does not quantify Token-2022's share of overall supply or issuers, so PYUSD should be read as a **concrete production case**, not evidence of broad market share.

Overall, the axis separating the two models is less "which is superior" than "where each chose to place complexity and trust." Token-2022 can be seen as an attempt to lift into the protocol level the features (fees, hooks, metadata, authority controls) that the ERC-20 ecosystem historically solved through a scatter of separate EIPs.

## Limitations

- **No quantitative adoption data.** Market-share figures — Token-2022 vs the original SPL Token by supply, or usage versus ERC-20 — are not covered. PYUSD and similar are case evidence only.
- **Depth of cryptography.** The ZK ElGamal proof structure behind confidential transfers was not verified at the protocol level; the report relies on the public docs' description ("amounts and balances private, addresses public")[^s13].
- **Nature of absence claims.** The claim that "the ERC-20 standard has no fees/freeze" rests on the canonical EIP-20 text; it was not proven by exhaustively checking every extension EIP.
- **Interpretive points.** Systemic risk vs universal audit, and the source of tooling uniformity, are analytical stances on design trade-offs, not measured outcomes.
- **Some secondary sourcing.** Details such as USDT's `destroyBlackFunds` rely on research writing (Spark) and were not cross-checked against the contract source itself.
- **Fast-moving target.** The Token Extensions set and the EIP ecosystem keep growing, so any specific extension list is point-in-time.
