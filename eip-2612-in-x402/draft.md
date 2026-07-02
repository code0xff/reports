# EIP-2612 Permit and Its Role in x402

## Abstract

EIP-2612 extends ERC-20 with a `permit` function that lets a token holder grant an allowance by signing an off-chain EIP-712 message instead of sending an on-chain `approve` transaction, removing the need for the payer to hold the chain's native gas asset[^s01]. x402 is an open payment protocol, initiated by Coinbase and now stewarded by an industry foundation co-launched with Cloudflare, that revives the HTTP 402 "Payment Required" status code so that clients — including AI agents — pay for HTTP resources with signed stablecoin authorizations rather than API keys or subscriptions[^s10][^s20]. This report examines how the two fit together. On EVM networks, x402's `exact` scheme settles payments through one of three asset-transfer methods: EIP-3009 `transferWithAuthorization` (the recommended path, used by USDC), Permit2 signature transfers (the universal fallback for any ERC-20), and ERC-7710 delegation for smart accounts[^s04]. EIP-2612 enters the picture through the `eip2612GasSponsoring` extension: for tokens that implement `permit`, the client signs an EIP-2612 permit authorizing the canonical Permit2 contract, and the facilitator submits it atomically during settlement via `x402ExactPermit2Proxy.settleWithPermit`, so the payer never spends gas even for the one-time Permit2 approval[^s05][^s17]. We reconstruct the full mechanism from the protocol specifications and SDK source, walk through client, server, and facilitator code paths, and analyze the security properties — permit front-running, phishing-drain incidents, phantom-function hazards, and the cross-layer attacks documented in early academic work on x402[^s14][^s13][^s24]. We conclude that EIP-2612's role in x402 is deliberately narrow but strategically important: it is not the payment primitive itself, but the gasless on-ramp that extends x402's zero-native-token user experience from EIP-3009 stablecoins to the long tail of ERC-20 assets.

## Introduction

The interplay between `approve` and `transferFrom` is arguably one of the reasons ERC-20 succeeded: it lets tokens be used inside other contracts under application-specific conditions. But the design has a structural cost. Because `approve` is defined in terms of `msg.sender`, a user's first action with any ERC-20 must be an on-chain transaction from their own account, which means holding the chain's native asset for gas — even when the user only wants to pay someone in the token itself[^s01].

EIP-2612 was written to remove exactly this friction, and x402 is among the most visible systems now built on top of signature-based token authorization. x402 is an open standard for "internet-native payments" that returns HTTP 402 responses carrying machine-readable payment requirements; the client answers with a signed payment payload, and a *facilitator* service verifies and settles the payment on chain[^s12][^s10]. Coinbase launched the protocol and later moved it into a foundation co-founded with Cloudflare; Cloudflare reports that sites on its network already emit over a billion HTTP 402 response codes daily to bots and crawlers, which it cites as latent demand for a standardized payment handshake[^s10][^s20].

The protocol's core user-experience promise is that the payer signs messages but never submits transactions: settlement gas is paid by whoever broadcasts the settlement — in practice the facilitator[^s04][^s20]. That promise is only realizable because of token-level standards that separate authorization from execution: EIP-3009's `transferWithAuthorization` and EIP-2612's `permit`[^s04][^s12]. Understanding precisely where each standard sits in x402's design — and why the protocol treats them differently — is the subject of this report.

Three questions organize the analysis. First, what exactly does EIP-2612 specify, and how does it differ from EIP-3009 (Section: Background)? Second, how does x402 structure its payment flow and where does EIP-2612 plug in (Sections: The x402 protocol, How x402 uses EIP-2612)? Third, what must an implementer actually do — and what can go wrong (Sections: Implementation walkthrough, Security considerations)?

## Background: EIP-2612 Permit

### The specification

EIP-2612 (status: Final) requires a compliant token to implement three functions beyond ERC-20[^s01]:

```solidity
function permit(address owner, address spender, uint value,
                uint deadline, uint8 v, bytes32 r, bytes32 s) external
function nonces(address owner) external view returns (uint)
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

A call to `permit(owner, spender, value, deadline, v, r, s)` sets `allowance[owner][spender]` to `value`, increments `nonces[owner]` by one, and emits an `Approval` event — if and only if the current block time is at or before `deadline`, `owner` is not the zero address, the supplied nonce equals `nonces[owner]`, and `(v, r, s)` is a valid secp256k1 signature by `owner` over the EIP-712 typed structure `Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)` bound to the token's `DOMAIN_SEPARATOR`[^s01]. The domain separator commits to the token's name, version, chain id, and contract address, following EIP-712's typed structured data scheme[^s01][^s03]. Crucially, the specification notes that nowhere does `permit` reference `msg.sender`: *anyone* may submit the signed permit, which is what allows a relayer — or, in x402, a facilitator — to pay the gas[^s01].

Two structural properties matter for payments. First, permit nonces are sequential: each successful `permit` increments the owner's nonce by exactly one, which prevents signature replay but also means multiple outstanding permits from one owner must land in order[^s01][^s15]. Second, `permit` only writes an allowance. Moving funds still requires a `transferFrom`, which the spender can submit and pay for; Circle's documentation for USDC describes the flow as "a relayer submits permit(...) to the USDC contract, which writes the allowance just like approve"[^s01][^s11].

### EIP-3009: the contrasting design

EIP-3009 (`transferWithAuthorization` / `receiveWithAuthorization`, status: Draft) solves the same gasless problem with different trade-offs. Its own motivation section states the two primary differences: EIP-2612 uses sequential nonces while EIP-3009 uses random 32-byte nonces, and EIP-2612 relies on the ERC-20 allowance pattern while EIP-3009 authorizes a transfer directly[^s02]. Random, unordered nonces let a user sign any number of authorizations concurrently without ordering risk, and the transfer-scoped authorization avoids creating a persistent allowance at all: Circle summarizes it as "no allowance is created; the signed authorization lets a relayer move tokens once within a time window"[^s02][^s11]. EIP-3009 also uses a two-sided validity window (`validAfter`, `validBefore`) rather than EIP-2612's single `deadline`[^s02].

USDC implements both standards simultaneously — its contracts expose `permit` (EIP-712 domain name "USDC", version "2") as well as `transferWithAuthorization`[^s11]. The x402 documentation likewise lists USDC among common EIP-2612 tokens[^s17].

A caution on conformance: the EIP-2612 specification itself documents that the `permit` deployed in mainnet `dai.sol` predates the standard and does not conform to it — DAI's variant takes a `bool allowed` instead of a `value` and calls its deadline `expiry`, which changes the signed message[^s01]. The x402 documentation nevertheless lists DAI among "common EIP-2612 tokens"[^s17]. These two sources conflict for mainnet DAI; integrators should treat "has a permit function" and "is EIP-2612 conformant" as distinct predicates and verify the actual typed-data layout per token deployment[^s01][^s17].

## The x402 protocol

### Flow and components

x402 defines a request–response payment handshake with three components: a client (often an AI agent), a resource server, and a facilitator[^s06][^s10]. The canonical five-step flow: the client requests a resource; the server responds `402 Payment Required` with machine-readable payment requirements; the client retries with a signed payment authorization; the facilitator verifies and settles it on chain; the server returns the resource plus a settlement confirmation header[^s10][^s06].

The wire format changed between protocol versions. In v1, the 402 response carries a JSON body whose `accepts` array lists `PaymentRequirements` (scheme, network, `maxAmountRequired`, asset, `payTo`, plus an `extra` field carrying the token's EIP-712 domain `name` and `version`), and the client retries with the base64-encoded signed payload in an `X-PAYMENT` header[^s07]. In v2, the canonical wire locations are the base64-encoded `PAYMENT-REQUIRED` response header and the `PAYMENT-SIGNATURE` request header, amounts are expressed as `amount`, and networks use CAIP-2 identifiers such as `eip155:8453`[^s06][^s20].

The facilitator exposes three standardized HTTP endpoints — `POST /verify`, `POST /settle`, and `GET /supported` — so resource servers can delegate all blockchain interaction[^s06]. Coinbase operates a hosted facilitator (free tier, then per-transaction pricing) that processes ERC-20 payments on Base, Polygon, Arbitrum, World, and Solana "through either EIP-3009 (USDC, EURC) or Permit2 (any ERC-20)"[^s20]. The protocol itself charges no fees[^s12].

### The `exact` scheme on EVM

The first and dominant scheme is `exact`: the payer authorizes a specific amount. Both the v1 and v2 core specifications define `exact` on EVM around EIP-3009: "the exact scheme uses EIP-3009 (Transfer with Authorization) to enable secure, gasless transfers of specific amounts of ERC-20 tokens," with a unique 32-byte nonce per authorization enforced at the token contract level[^s07][^s06]. The v2 payload carries the EIP-3009 authorization tuple — `from`, `to`, `value`, `validAfter`, `validBefore`, `nonce` — plus the 65-byte signature, mirroring the on-chain call exactly[^s04][^s06].

The v2 `exact` EVM scheme generalizes this into three *asset transfer methods*[^s04]:

| Method | Use case | x402's own recommendation |
|---|---|---|
| **EIP-3009** | Tokens with native `transferWithAuthorization` (e.g., USDC) | "Recommended (Simplest, truly gasless)" |
| **Permit2** | Tokens without EIP-3009; proxy + Permit2 | "Universal Fallback (Works for any ERC-20)" |
| **ERC-7710** | Smart accounts with delegation support | Smart-account option |

In all three, "the Facilitator cannot modify the amount or destination. They serve only as the transaction broadcaster" — and the facilitator, not the payer, pays gas[^s04]. Clients default to EIP-3009 when the server's `extra.assetTransferMethod` field is absent[^s04].

There is also an `upto` scheme for metered usage (client signs a maximum, server settles the actual amount), which uses the Permit2 transfer method exclusively[^s08].

## How x402 uses EIP-2612

### Not the payment rail — the gasless on-ramp

A common misreading is that x402 settles payments by calling `permit()` and then `transferFrom()` on the payment token. The specifications describe a different architecture. For tokens lacking EIP-3009, x402 routes payment through **Permit2**, Uniswap's canonical approval contract, which extends signature-based transfers to every ERC-20: "any ERC20 token, even those that do not support EIP-2612, can now use permit style approvals," with unordered, non-monotonic nonces[^s16][^s04]. The client signs a Permit2 `permitWitnessTransferFrom` message whose *witness* binds the recipient address and a `validAfter` timestamp, and whose `spender` is a small audited proxy, `x402ExactPermit2Proxy`, deployed at the same CREATE2 address (`0x402085c248EeA27D92E8b30b2C58ed07f9E20001`) across supported chains; the proxy enforces that funds can only move to the witnessed `to` address, so the facilitator cannot redirect them[^s04].

Permit2 has a bootstrap problem, though: the token holder must first grant the Permit2 contract an ERC-20 allowance, which classically requires one on-chain `approve` — and therefore gas[^s04]. The scheme spec offers three options: (A) the user pays for a standard `approve(Permit2)` transaction themselves; (B) the facilitator sponsors an ERC-20 approval via a batched transaction (`erc20ApprovalGasSponsoring`); or (C) **the EIP-2612 path**: "if the token supports EIP-2612, the user signs a permit authorizing Permit2," and the facilitator calls `x402ExactPermit2Proxy.settleWithPermit()`[^s04].

This is EIP-2612's precise role in x402, formalized as the `eip2612GasSponsoring` extension: "the client signs an off-chain permit authorizing the Permit2 contract, and the facilitator submits it atomically during settlement via x402ExactPermit2Proxy.settleWithPermit," so even the one-time approval step costs the payer no gas[^s17][^s05]. The extension is advertised by the server in the `extensions` object of the 402 response; the client, upon detecting an insufficient Permit2 allowance, includes the permit fields (`from`, `asset`, `spender` = canonical Permit2, `amount`, `nonce`, `deadline`, 65-byte `signature`) under `extensions.eip2612GasSponsoring.info` in the payment payload[^s05][^s17].

### Settlement: one atomic transaction

The proxy's `settleWithPermit` executes two steps in a single transaction: first it submits the EIP-2612 permit to the token — `IERC20Permit(token).permit(owner, address(PERMIT2), value, deadline, v, r, s)` — then it runs the standard Permit2 settlement, `permitWitnessTransferFrom`, transferring the payment to the witnessed recipient[^s04]. The facilitator's verification duties before settling are specified: confirm the asset actually implements `IERC20Permit`, confirm the permit signature recovers to the payer and names the expected spender (the canonical Permit2 contract), and simulate `settleWithPermit` end to end[^s05]. Atomicity means the answer to "what if permit lands but the transfer fails" is simply that the whole settlement transaction reverts — a meaningful simplification versus ad-hoc permit-then-transferFrom relaying[^s05][^s17].

So the division of labor in an x402 payment for a permit-token is: **EIP-2612 authorizes Permit2 once; Permit2 authorizes the specific transfer every time.** After the first settlement consumes the permit and installs the allowance, subsequent payments need only Permit2 signatures — which, unlike EIP-2612's sequential nonces, use unordered nonces and thus tolerate concurrent in-flight payments[^s16][^s02]. The sequential-nonce constraint of EIP-2612 therefore only binds during onboarding, not during steady-state payment traffic — an architectural choice that neutralizes EIP-2612's main concurrency weakness while exploiting its main strength, near-universal availability in modern ERC-20s[^s02][^s16][^s04].

One inconsistency between spec and SDK deserves note. The extension spec's example shows the permit `amount` as "typically MaxUint" — an unlimited allowance to Permit2[^s05] — while the Go SDK signs a permit whose value equals the exact Permit2 `permitted.amount` for that payment, with a comment stating "the proxy contract enforces permit2612.value == permittedAmount"[^s18]. These reflect different points on a real trade-off (one permit forever vs. one permit per payment, which re-serializes on the sequential nonce) and the surface is evidently still settling _(early signal)_[^s05][^s18].

### Ecosystem spread

Support for the permit-based path extends beyond the reference stack. Coinbase's hosted facilitator advertises Permit2 settlement for "any ERC-20"[^s20]; third-party implementations track the extension explicitly — the t402 project, for example, carries a work item to "implement EIP-2612 gas sponsoring spec … integration with existing facilitator" citing x402's `specs/extensions/eip2612_gas_sponsoring.md`[^s09]; and client issue trackers document the v1→v2 migration pain of moving from EIP-3009-only signing to Permit2-token support[^s09]. The x402 SDKs ship the extension in TypeScript, Go, and Python[^s17].

## Implementation walkthrough

This section reconstructs the concrete steps for each role, following the reference SDKs and specs. Code excerpts are abridged from the x402 repository.

### Client: signing the EIP-2612 permit

The client needs four pieces of token metadata to build the EIP-712 domain — name, version, chain id, verifying contract — and one piece of state, the owner's current permit nonce. The server supplies `name` and `version` in `PaymentRequired.extra` (they are required fields precisely because signatures constructed against a wrong domain fail; USDC, for instance, uses version "2")[^s04][^s11]. The Go client shows the canonical sequence: read `nonces(owner)` from the token, build the typed-data domain from the advertised name/version plus chain id and token address, assemble the `Permit` message with `spender` fixed to the canonical Permit2 address, and sign typed data[^s18]:

```go
// abridged from go/mechanisms/evm/exact/client/eip2612.go
nonce, _ := signer.ReadContract(ctx, token, EIP2612NoncesABI, "nonces", owner)
domain := TypedDataDomain{Name: tokenName, Version: tokenVersion,
                          ChainID: chainID, VerifyingContract: token}
message := map[string]interface{}{
    "owner": owner, "spender": PERMIT2Address,
    "value": amount, "nonce": nonce, "deadline": deadline,
}
sig, _ := signer.SignTypedData(ctx, domain, GetEIP2612EIP712Types(), "Permit", message)
```

In the TypeScript SDK the whole decision is automated: `ExactEvmScheme` "signs the EIP-2612 permit and includes it in the payment payload" whenever the server advertises `eip2612GasSponsoring`, the transfer method is `permit2`, and the client's Permit2 allowance is insufficient — the integrator writes no permit-specific code[^s17]. Under the hood this is standard EIP-712 typed-data signing of the `Permit` struct defined in the specification[^s01][^s15].

The client then sends *two* signatures in one payment payload: the Permit2 `permitWitnessTransferFrom` signature in `payload`, and the EIP-2612 permit fields in `extensions.eip2612GasSponsoring.info`[^s05].

### Server: advertising the extension

A resource server gates routes with the stock middleware (`@x402/express`, `@x402/hono`, `@x402/next`, or the Python/Go equivalents) and declares the extension in its route configuration[^s23][^s17]:

```typescript
import { declareEip2612GasSponsoringExtension } from "@x402/extensions/eip2612-gas-sponsoring";

const routes = {
  "GET /api/data": {
    accepts: [{ scheme: "exact", network: "eip155:84532",
                price: "$0.01", payTo: "0xYourAddress" }],
    extensions: { ...declareEip2612GasSponsoringExtension() },
  },
};
```

Everything else — 402 emission, header parsing, facilitator calls — is the middleware's job; the x402 README's pitch is a single `app.use(paymentMiddleware({...}))` line[^s23]. Verification and settlement are delegated over HTTP to a facilitator implementing `/verify` and `/settle`[^s06].

### Facilitator: verify, then settle atomically

Per the scheme spec, a facilitator receiving a Permit2-method payment first checks the Permit2 signature recovers to the payer, then checks `ERC20.allowance(from, Permit2)`; if the allowance is insufficient it looks for the `eip2612GasSponsoring` payload (or the sponsored-approve alternative), and only if neither exists returns `412 Precondition Failed` with error code `PERMIT2_ALLOWANCE_REQUIRED`, signaling the client that a one-time on-chain approval is unavoidable[^s04]. For the permit path it must verify the asset implements `IERC20Permit`, verify the permit's spender is the canonical Permit2 contract, and simulate `settleWithPermit` before broadcasting[^s05]. Settlement is then a single transaction into the proxy[^s04]:

```solidity
function settleWithPermit(EIP2612Permit calldata permit2612,
    ISignatureTransfer.PermitTransferFrom calldata permit,
    address owner, Witness calldata witness, bytes calldata signature) external {
  IERC20Permit(permit.permitted.token).permit(owner, address(PERMIT2),
      permit2612.value, permit2612.deadline, permit2612.v, permit2612.r, permit2612.s);
  _settleInternal(permit, owner, witness, signature); // permitWitnessTransferFrom
}
```

The `_settleInternal` body enforces `block.timestamp >= witness.validAfter` and constructs the transfer to the witnessed recipient only, so a malicious facilitator cannot substitute its own address[^s04].

### Timing and expiry mapping

The two standards' freshness controls map onto each other: EIP-2612 contributes a single `deadline` for the approval, while the Permit2 authorization carries its own `deadline` and the witness carries `validAfter` — together reproducing the two-sided `validAfter`/`validBefore` window that EIP-3009 has natively[^s01][^s02][^s04]. Facilitators must reject expired or not-yet-valid authorizations at verification time, before any gas is spent[^s05][^s06].

## Security considerations and pitfalls

### Front-running and the "permit griefing" pattern

Because a permit is valid regardless of who submits it, "another party can always front run this transaction and call permit before the intended party. The end result is the same for the Permit signer"[^s01]. OpenZeppelin's documentation generalizes the warning: permits "can be submitted by anyone" and therefore "can be frontrun"; integrating contracts should treat an already-applied permit (nonce consumed, allowance in place) as success rather than reverting[^s15]. For x402 facilitators the mitigation is structural — `settleWithPermit` is simulated immediately before broadcast, and a front-run permit merely makes the inner `permit()` call redundant — but implementations that treat a permit revert as fatal would convert a costless griefing move into a denied payment[^s15][^s05].

### Phishing-drain incidents

The same property that makes permit gasless makes it a potent phishing primitive: a victim who signs one typed-data message on a malicious site has, invisibly and at zero gas cost, granted an attacker an allowance. SlowMist's incident analysis reconstructs the pattern — "the victim signed the permit and shared it with the phishing website without broadcasting it … the hacker obtained this signature information and submitted the permit on-chain," then drained funds with `transferFrom` — and reported over 300 victims and roughly $690,000 stolen via malicious permit-family signatures by May 2023[^s13]. Neptune Mutual, citing Scam Sniffer data, attributes most of the $55 million lost to phishing in January 2024 alone to signed ERC-20 permits[^s22]. Academic measurement of the underlying allowance mechanism found unlimited approvals in 60% of 25.4M studied approval transactions, with 22% of users at high risk of token theft through approved-but-unspent allowances[^s26].

x402's design narrows this surface in the payment path: the `exact` scheme has the payer sign the exact amount with a short validity window, and the Permit2 witness pins the recipient, so neither the facilitator nor an observer can amplify a payment signature into a drain[^s04][^s06]. The residual risk concentrates in the EIP-2612 approval itself when the MaxUint pattern from the spec example is used — an unlimited allowance to Permit2 — whose safety then rests entirely on Permit2's own signature checks; the exact-value permit signed by the Go SDK is the conservative alternative[^s05][^s18][^s26].

### Phantom permits

Tokens that lack `permit` entirely can fail *silently* rather than loudly. Dedaub's "phantom function" research showed that WETH — which has no permit — accepts any call to `permit()` without reverting because its old-style fallback runs `deposit()`; Multichain/Anyswap contracts that relied on `permit()` reverting for invalid authorizations could therefore be drained of user allowances, with "$431M in WETH … stolen in a single, direct transaction, from just 3 victim accounts" as the demonstrated worst case _(single-origin technical detail: the discoverer's own writeup)_[^s14]. This is precisely why the x402 extension spec makes "verify the asset address actually implements IERC20Permit" the facilitator's first verification step; the spec does not prescribe the probing method, but simulation of the full settlement — which the spec does mandate — would surface a permit that silently no-ops rather than executing[^s05][^s14].

### Protocol-layer attacks

Early academic scrutiny of x402 itself reports that combining synchronous HTTP authorization with asynchronous blockchain settlement "introduces a cross-layer attack surface absent from conventional web and on-chain payments": five practical attacks across authorization, payload binding, replay protection, and web-layer handling, validated against testnets, live endpoints, and three open-source SDKs, yielding unpaid-service or paid-but-denied outcomes[^s24]. A second preprint highlights a privacy gap orthogonal to fund safety: payment metadata (resource URLs, descriptions, reason strings) flows to the resource server and the centralized facilitator before settlement, typically without any data-processing agreement[^s25]. Both papers are 2026 preprints and their findings should be weighted accordingly _(early signal)_[^s24][^s25].

### Practical failure modes checklist

From the sources above, an integrator's checklist reduces to: verify real EIP-2612 conformance per deployment (mainnet DAI's `bool allowed` variant signs a different message than the standard `Permit` struct)[^s01][^s17]; fetch the live EIP-712 domain (`name`, `version`) instead of assuming it — USDC's version is "2"[^s11][^s18]; read the current sequential nonce at signing time and expect serialization during onboarding[^s01][^s15]; treat front-run permits as success[^s15]; enforce deadlines at verification, not settlement[^s05][^s06]; and never infer permit support from a non-reverting call[^s14].

## Discussion: design trade-offs and ecosystem state

### Why EIP-3009 first, EIP-2612 second

x402's own scheme table encodes the hierarchy: EIP-3009 is "recommended (simplest, truly gasless)," Permit2 is the "universal fallback"[^s04]. The reasons trace directly to the standards' structures. EIP-3009 authorizes a transfer, not an allowance — one signature, one on-chain call, no persistent state beyond a consumed nonce — and its random nonces permit unlimited concurrent authorizations, which fits machine-speed micropayments where an agent may have many payments in flight[^s02]. EIP-2612 authorizes an allowance that must then be spent, uses order-sensitive sequential nonces, and leaves persistent allowance state behind[^s01][^s02]. For the payment itself, EIP-3009 is simply the better-shaped primitive; it is the route through which the hosted facilitator settles USDC and EURC, the flagship x402 assets[^s20][^s04].

What EIP-2612 has that EIP-3009 lacks is *reach*. EIP-3009 remains a Draft ERC, with USDC as its notable production implementation[^s02][^s11], whereas permit is widespread among modern ERC-20s — OpenZeppelin ships `ERC20Permit` as a standard building block, and the x402 docs describe EIP-2612 support in "many modern ERC-20 tokens"[^s15][^s17]. x402's architecture composes the two rationally: rather than defining a bespoke permit-then-transferFrom payment scheme (with EIP-2612's concurrency limits infecting every payment), it uses one EIP-2612 signature to bootstrap into Permit2, and Permit2's unordered-nonce witness transfers — functionally EIP-3009-like — carry all subsequent payments[^s04][^s16]. EIP-2612 is thus consumed exactly once per (owner, token, chain) in the happy path.

### Alternatives inside the same architecture

The same slot EIP-2612 occupies can be filled by other mechanisms, and the spec treats them as peers: facilitator-sponsored on-chain `approve` batches (`erc20ApprovalGasSponsoring`) for tokens without permit, and ERC-7710 delegation for smart accounts — the latter also covering the population EIP-2612 structurally cannot serve, since contract wallets such as Safe cannot produce the EOA signatures permit requires[^s04][^s15]. Cloudflare is additionally proposing a deferred-payment scheme using HTTP message signatures with settlement over traditional rails, which would bypass token-level authorization entirely for some flows[^s10].

### Adoption signals

Ecosystem indicators are strong but noisy, and the numbers conflict by scope and date. BlockEden reports ~119M transactions on Base plus 35M on Solana and roughly $600M annualized volume as of March 2026 — alongside a 92% collapse in daily transactions between December 2025 (731k/day) and February 2026 (57k/day), which it reads as speculative traffic washing out[^s21]. InfoQ, in January 2026, reported "over 100 million payment flows" in the protocol's first six months[^s19]. The foundation roster (Cloudflare co-founding; Google Cloud, AWS, Stripe, Vercel and others participating per multiple reports) and the SDK surface (TypeScript, Go, and Python in the reference stack; community implementations such as the Rust facilitator x402-rs) indicate durable institutional investment regardless of which volume figure one credits _(vendor-adjacent figures; no independent audit)_[^s10][^s21][^s17][^s28]. Third-party trackers corroborate the permit path spreading beyond the reference stack: t402 carries a work item to implement the `eip2612GasSponsoring` spec, and client issue trackers document v1→v2 migrations from EIP-3009-only signing toward Permit2-token support[^s09][^s27].

## Limitations

- **Spec volatility.** x402 v2, the Permit2 asset-transfer method, and the `eip2612GasSponsoring` extension are 2025–2026 artifacts under active revision. We documented one live spec/SDK divergence (MaxUint vs exact-value permits) and the proxy contract address/type-string carry "post-audit" annotations suggesting recent change; details in this report may drift[^s05][^s18][^s04].
- **Vendor-weighted sourcing.** The mechanism description necessarily leans on x402's own specifications, docs, and SDK code (primary but project-hosted). Independent implementations corroborate the interface but not every behavioral claim; adoption figures are ecosystem-reported, mutually inconsistent, and unaudited[^s21][^s19].
- **Thin peer-reviewed base.** The only academic treatments of x402 found are two 2026 arXiv preprints[^s24][^s25]; no peer-reviewed analysis of the `eip2612GasSponsoring` path exists yet, and our security analysis of that specific composition is synthesized from component-level sources.
- **DAI ambiguity unresolved on-chain.** We report the mainnet-DAI conformance conflict between the EIP-2612 spec text and x402 docs but did not independently verify current DAI deployments across chains[^s01][^s17].
- **No empirical measurement.** This report is documentary; we did not instrument facilitators, measure settlement latencies/gas, or attempt the described attacks.
