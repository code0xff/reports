# x402 batch-settlement vs MPP session — Mechanism Comparison and Implementation Analysis

## Abstract

This report compares the two HTTP-402-anchored off-chain payment channel standards that surfaced in near lock-step in early-to-mid 2026 — Coinbase / x402 Foundation's **`batch-settlement` scheme**[^s04] and Tempo / Stripe's **MPP `session` intent**[^s14][^s20] — along the same six axes (payment unit, trust model, multi-chain reach, governance, settlement trigger, refund / dispute). The two arrived at almost the same abstraction — **one deposit → cumulative EIP-712 voucher → periodic batched settlement** — for the same problem: per-request on-chain payment cannot carry AI-agent micropayments. They diverge on payment unit (merchant-side N vs. user-side N), multi-chain reach (EVM-only vs. Tempo / Stellar / …), and governance (Foundation vs. IETF draft). The second half walks through how each lands in real code, with snippets quoted from the x402-foundation repo's EVM binding[^s04] and the `mppx` TypeScript SDK[^s19], and explains the design points the two standards share and the points they do not.

## 1. Introduction — The problem both standards solve

x402's `exact` scheme moves USDC one transfer at a time via EIP-3009 `transferWithAuthorization`[^s11]; MPP's `charge` intent is structurally the same single-shot payment[^s12][^s14]. Both standards started there. The problem appears the moment that single-shot pattern is forced onto LLM token billing, streaming data feeds, or machine-to-machine API calls: (a) per-request gas exceeds the per-request payment, (b) block-finality latency becomes response latency, (c) facilitator load scales linearly with N.

Both standards arrived at the same answer in early-to-mid 2026 — "the user deposits once into an escrow, then off-chain cumulative EIP-712 vouchers are exchanged, and the merchant (or a channel manager) batches settlement periodically." x402 expresses that answer as the `batch-settlement` scheme[^s04][^s07]; MPP expresses it as the `session` intent[^s14][^s20]. Putting them side by side along six axes is what lets us see where the same abstraction splits at the spec and the code level.

## 2. Background — The shared foundation

### 2.1 HTTP 402 challenge / retry

Both standards live on top of HTTP 402. x402 V2 defines `PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE` headers[^s09]; MPP defines `WWW-Authenticate: Payment` / `Authorization: Payment` / `Payment-Receipt`[^s14][^s18]. The two header conventions are partially being unified at IETF — MPP is submitted as `draft-ryan-httpauth-payment-01`, authored by Tempo Labs (Brendan Ryan, Jake Moxey, Tom Meagher) and Stripe (Jeff Weinstein, Steve Kaliski)[^s14]. x402 instead chose Foundation-level governance, established by Coinbase and Cloudflare in September 2025[^s10].

### 2.2 EIP-712 / EIP-3009

Both use **EIP-712 typed-data signing** as the core signing primitive[^s22]. On EVM both partially reference EIP-3009 `transferWithAuthorization` for settlement[^s23], but for the **deposit** step x402 batch-settlement uses `receiveWithAuthorization` for EIP-3009 tokens like USDC and falls back to **Permit2** for ERC-20s without EIP-3009[^s04]. MPP `session` has the channel contract supply its own deposit function, and its EIP-712 domain is bound to that contract address and chain id[^s15][^s16].

### 2.3 Governance split

- **x402 Foundation** — Founded by Coinbase + Cloudflare in September 2025[^s10]. The specs live in `x402-foundation/x402` under `specs/schemes/`[^s02]. License: Apache-2.0[^s01].
- **MPP** — Co-stewarded by Tempo Labs and Stripe; specs at `tempoxyz/mpp-specs` (CC0 1.0, with tooling under Apache or MIT) and hosted on `paymentauth.org`[^s13][^s26]. IETF draft `draft-ryan-httpauth-payment-01` expires 19 September 2026[^s14].

## 3. x402 batch-settlement — Deep dive

### 3.1 Where the scheme sits

As of May 2026 the formal x402 schemes are `exact`, `upto`, and `batch-settlement`, with Cloudflare's `deferred` proposed[^s06]. `batch-settlement` was officially announced on 13 May 2026[^s07][^s08] with the explicit goal of enabling "sub-cent crypto payments" by reducing per-request on-chain gas[^s24][^s25]. The same repo is mirrored from the pre-Foundation `coinbase/x402` upstream[^s21].

The x402-foundation repo's `specs/schemes/batch-settlement/` directory ships three documents[^s02]:

- `scheme_batch_settlement.md` — the conceptual (network-agnostic) spec.
- `scheme_batch_settlement_evm.md` — the EVM binding.
- `scheme_batch_settlement_cloudflare.md` — Cloudflare's variant where Cloudflare itself is the Merchant of Record billing identified agents.

### 3.2 Three phases — Commit / Accumulate / Redeem

The conceptual spec defines a three-phase lifecycle that every binding must follow:

> "The client produces a cryptographic payment commitment and attaches it to the request. The commitment is validated and stored. The resource is served immediately."[^s03]
>
> "The network retains the commitment in a voucher store, channel state, account ledger, or billing system."[^s03]
>
> "Value is transferred out of band through an onchain contract call, a channel close, a fiat batch invoice, or any rail the network defines."[^s03]

The conceptual spec explicitly allows two trust models — capital-backed (the user locks funds on-chain) and credit-backed (an identified party billed after the fact)[^s03]. The EVM binding is capital-backed; the Cloudflare binding is credit-backed[^s04][^s05].

### 3.3 EVM binding — channelId, ChannelConfig, voucher

The EVM binding[^s04] defines a channel's identity in a single line:

```text
channelId = EIP712Hash(ChannelConfig)
```

`ChannelConfig` carries seven fields: (a) `payer`, (b) `payerAuthorizer` (an EOA used for signing, zero for EIP-1271 contract wallets), (c) `receiver`, (d) `receiverAuthorizer` (claim / refund authority), (e) `token` (the ERC-20), (f) `withdrawDelay` (15 minutes – 30 days, both bounds enforced), and (g) `salt`. The hash is taken under the "x402 Batch Settlement" EIP-712 domain, which itself binds to `chainId` and the deployed `x402BatchSettlement` contract address[^s04]. Two identical `ChannelConfig`s on two different chains therefore produce different channelIds.

A voucher is an EIP-712 signature over two fields[^s04]:

- `channelId` — derived above.
- `maxClaimableAmount` — a **monotonically increasing** ceiling.

The server maintains `chargedCumulativeAmount` in its channel state and validates that each new voucher's ceiling equals "(previous chargedCumulativeAmount) + (this request's amount)"[^s04]. The voucher is therefore "a cumulative ceiling that includes the next request," and the ceiling discipline gives both monotonicity and no-double-charge in the same field.

### 3.4 Deposit — ERC-3009 or Permit2

The spec defines two gasless deposit methods[^s04]:

1. **ERC-3009 `receiveWithAuthorization`** — for EIP-3009-compliant tokens such as USDC.
2. **Permit2** — the generic ERC-20 fallback.

Both go through canonical collector contracts at fixed addresses[^s04]:

- `ERC3009DepositCollector`: `0x4020806089470a89826cB9fB1f4059150b550004`
- `Permit2DepositCollector`: `0x4020425FAf3B746C082C2f942b4E5159887B0005`

This removes the user's `approve()` step, and a facilitator-side paymaster can sponsor the gas — Cointelegraph's wording is "deposits, batched settlements and refunds are all sponsored by the transaction's facilitator"[^s07].

### 3.5 claim / settle / refund / forced withdraw

The EVM binding splits settlement into four distinct functions[^s04]:

- **claim** — `claimWithSignature` validates many vouchers across many channels in one call and updates per-channel `totalClaimed`. **No token transfer happens here.** A relay-friendly variant accepts an EIP-712 `ClaimBatch` signature from the `receiverAuthorizer`[^s04].
- **settle** — transfers all claimed-but-unsettled funds for a (receiver, token) pair in one transaction. It is **permissionless**[^s04].
- **refund** — cooperative refund. The receiver side can return up to `balance - totalClaimed` to the payer, optionally relayed via EIP-712 signature. The refund nonce increments before the amount cap is applied, so a zero-value refund still advances the nonce[^s04].
- **timed withdrawal (escape hatch)** — the payer starts a grace period (15 minutes – 30 days). The server must claim outstanding vouchers within that window. After the window expires, `finalizeWithdraw` caps the transfer to the remaining unclaimed escrow[^s04].

The spec proposes three batching strategies for servers: periodic batching, threshold-triggered claiming, and claim-before-withdraw[^s04]. The server is effectively a **channel-state custodian** — the operational load that a per-request facilitator would carry is moved to the merchant-side channel manager.

### 3.6 Multi-token reach, EVM-only

A real differentiator: **batch-settlement accepts any EVM ERC-20**. Cointelegraph reports "AI agents using batch settlement will be able to accept any Ethereum-native ERC-20 tokens, not just stablecoins"[^s07]. The Permit2 fallback is what makes this possible. The flip side is that batch-settlement is EVM-only — the x402 docs nail this down: "x402 supports the batch-settlement scheme on EVM"[^s06].

## 4. MPP session — Deep dive

### 4.1 Where the intent sits

MPP classifies payment patterns by intent. The mppx TypeScript SDK exposes four — `charge`, `stream`, `session`, `free` — and defines `session` as "Multiple paid requests over a single payment channel"[^s19]. `session` is what this report compares to x402's batch-settlement.

### 4.2 Unidirectional channel + cumulative commitment

Stellar developer docs summarise the model precisely:

> "The funder deposits tokens once, then makes many off-chain payments by signing cumulative commitments."[^s15]
>
> "Each commitment is cumulative. The server tracks the highest commitment it has seen; closing the channel batch-settles all payments in a single on-chain transaction."[^s15]

The model is therefore: (1) deposit once, (2) exchange EIP-712 cumulative commitments off-chain, (3) close the channel and settle the highest commitment in one transaction. The server only needs to remember "the highest commitment seen so far"[^s15].

### 4.3 Tempo integration and the SSE flow

MPP `session` is tightly coupled to Tempo-native capabilities — sub-second finality, payment lanes, transaction memos, fee sponsorship, TIP-20. Tempo's "Accept streamed payments" documentation describes the server side as:

> "If the channel balance runs out mid-stream, the server emits a payment-need-voucher event and the client automatically signs a new voucher."[^s16]

The `stream` intent is essentially `session` plus Server-Sent Events to enable per-token billing. The mpp.dev guide presents the same flow for an LLM token-billing scenario[^s17].

### 4.4 Multi-chain reach and IETF standardisation

MPP `session` was designed multi-chain from day one. Stellar provides a Soroban implementation[^s15]; Tempo provides the `TempoStreamChannel` escrow contract on its own mainnet[^s16]; Stripe's docs show the same intent layered with cards, SPTs, and Lightning, hosting non-EVM rails behind the same HTTP contract[^s18]. The protocol itself is filed at IETF as `draft-ryan-httpauth-payment-01`, with intent / method definitions hosted alongside on paymentauth.org[^s14][^s26].

### 4.5 Security: the mpp-rs advisory

The protocol's model being safe is one thing; a particular SDK being safe is another. The 2026 GHSA-fxc9-7j2w-vx54 advisory reports that the `mpp-rs` Rust SDK's "tempo/session handler lacks enforcement that sessions are active and paid for, enabling unlimited session creation without charges"[^s31]. That is an implementation defect, not a spec defect, but it illustrates the threat surface any session-channel standard creates when the server's channel accounting is not airtight.

## 5. Comparison — Six axes

| Axis | x402 batch-settlement | MPP session |
|---|---|---|
| Payment unit (traffic shape) | **One merchant × many users** — claim/settle sweeps every channel for a (receiver, token) pair in one transaction[^s04] | **One user × one merchant** — one user, one channel, the server only retains the highest commitment[^s15] |
| Trust model | EVM binding is capital-backed (escrow); Cloudflare binding is credit-backed (MoR)[^s04][^s05] | Capital-backed, unidirectional channel; the same pattern on Tempo and Stellar[^s15][^s16] |
| Multi-chain reach | EVM-only (Base, Ethereum, any EVM-compatible ERC-20)[^s06][^s07] | Tempo · Stellar · Stripe cards / SPT etc.[^s14][^s15][^s16][^s18] |
| Governance | x402 Foundation (Coinbase + Cloudflare, founded 2025-09), `x402-foundation/x402` Apache-2.0[^s01][^s10] | Tempo Labs + Stripe, `tempoxyz/mpp-specs` CC0 1.0, IETF `draft-ryan-httpauth-payment-01`[^s13][^s14][^s26] |
| Settlement trigger | claim → settle, two-step. claim is transfer-free, settle is permissionless and batched[^s04] | server-initiated `close`, single step, highest-commitment-and-go[^s15] |
| Dispute / refund | Cooperative refund + timed-withdrawal escape hatch (15 min – 30 days)[^s04] | Server closes at its discretion; the spec does not standardise a dispute procedure and assumes a trusted server[^s15][^s20] |

The cleanest cut is **payment-unit traffic shape**. x402 batch-settlement is shaped for "one merchant sweeping vouchers from many users in one batch" — API servers, agent fleets hitting the same endpoint[^s04]. MPP `session` is shaped for "one user running one channel for a long while against one merchant" — an agent camped on one LLM endpoint[^s15]. Both standards define unidirectional channels; the scenarios they layer on top differ _(interpretive)_[^s07][^s20].

## 6. Implementation patterns — Code-level reading

### 6.1 x402 server side — `paymentMiddleware` + scheme registration

The V2 Express example declares payment requirements per-route through `paymentMiddleware` and registers schemes with `x402ResourceServer.register(network, scheme)`[^s27]. The same repo's "advanced server" examples (all_networks, bazaar, hooks, dynamic-price, eip2612-gas-sponsoring) show how the same middleware composes with V2 extensions such as multi-chain configuration, payment hooks, and gas sponsorship[^s28]. The canonical `exact` registration is:

```typescript
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();
app.use(
  paymentMiddleware(
    {
      "GET /your-endpoint": {
        accepts: {
          scheme: "exact",
          price: "$0.10",
          network: "eip155:84532",
          payTo: evmAddress,
        },
        description: "Your endpoint",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(
      new HTTPFacilitatorClient({ url: facilitatorUrl }),
    ).register("eip155:84532", new ExactEvmScheme()),
  ),
);
```

To switch a route to `batch-settlement` (conceptually) the server registers a `BatchSettlementEvmScheme` in the same slot and changes the route's `accepts.scheme` to `"batch-settlement"`. The server then needs three additional configuration points: (a) **channel storage** — file-based for a single process, Redis for distributed deployments, (b) **batch cadence** — periodic / threshold / pre-withdraw, and (c) a **deposit policy multiplier** — at least 3× the per-request maximum, default 5×. (Those three are the values surveyed in the sister report [`x402-payment-schemes`](../x402-payment-schemes/) and in the spec body[^s04].) The server is effectively running its own **channel manager** that retains cumulative vouchers and periodically invokes `claimWithSignature` + `settle`[^s04].

### 6.2 User side — deposit, sign cumulative voucher

The user flow compresses to three steps[^s04][^s07]:

1. **Open / top up channel** — submit a deposit through either `ERC3009DepositCollector` or `Permit2DepositCollector`, materialising a `ChannelConfig` and locking USDC (or any ERC-20). No `approve()` transaction needed.
2. **Per-request voucher** — sign `(channelId, maxClaimableAmount = previous chargedCumulativeAmount + this request's amount)` as an EIP-712 typed-data signature each time.
3. **Optional withdraw** — when done, call `initiateWithdraw` and (after the 15-min–30-day grace period) `finalizeWithdraw` to claim back the unspent escrow. If the server fails to claim within the grace window, the user can claim the entire remaining balance.

The design point is that **a user pays the deposit cost once per merchant relationship**. A user running a channel with a 30-day grace period can send thousands of micropayments against the same merchant and end up with only two on-chain transactions per cycle: one deposit, one settle.

### 6.3 MPP `session` client — `tempo.session()` + `.sse()`

The mpp.dev streamed-payments guide compresses the client into a single block:

```typescript
const session = tempo.session({
  account: privateKeyToAccount("0x..."),
  maxDeposit: "1", // Lock up to 1 pathUSD per channel
});

const stream = await session.sse("http://localhost:3000/api/sessions/poem");

for await (const word of stream) {
  process.stdout.write(word + " ");
}

await session.close(); // Settle and reclaim unspent deposit
```

That one block contains the entire channel lifecycle: (1) open + deposit, (2) SSE stream with per-token charging, (3) close and reclaim unspent balance[^s17]. `session.sse()` listens for `payment-need-voucher` events from the server and signs new vouchers automatically, so the stream is not interrupted when one voucher's ceiling is exhausted[^s16][^s17]. For interactive scenarios that need bidirectionality, `.ws()` replaces `.sse()`, and "vouchers and content travel over a single socket rather than separate HTTP requests"[^s17].

### 6.4 MPP server side — verify commitment, close on the highest

Stellar's MPP Session Guide summarises the server side directly:

> "Server (`@stellar/mpp/channel/server`): Validates ed25519 signatures via Soroban simulation."[^s15]
> "Client (`@stellar/mpp/channel/client`): Signs commitments with the private key; handles automatic 402 responses."[^s15]
> "Close function: Submits settlement using the highest cumulative amount and corresponding signature."[^s15]

On EVM, EIP-712 + `ecrecover` replaces ed25519, but the server-side logic is identical: validate each incoming commitment, update `highestCommitment`, then on `close` submit one transaction with that maximum[^s15][^s20]. The sister report [`mpp-session-mechanism`](../mpp-session-mechanism/) records the exact `TempoStreamChannel` mainnet / testnet contract addresses and the channelId derivation function in its own primary sources.

### 6.5 Side by side

Same abstraction, different texture.

- **Server load** — x402 batch-settlement asks the server to manage **many channels for many users** (storage, cadence, multiplier). MPP `session` asks the server to retain **one channel's highest commitment per user**.
- **Client texture** — x402 is "the protocol itself" — the server announces `accepts` per request and the client signs vouchers to match. MPP centres on an SDK abstraction — `tempo.session()` wraps the whole lifecycle. Both standards expose both flavours, but the centre of gravity differs.
- **Multi-chain code split** — x402 changes one parameter (CAIP-2 `network: "eip155:..."`) within the EVM family; MPP changes the entire method (`tempo.session()` vs. `@stellar/mpp/channel/*` vs. `stripe.charge(...)`).

## 7. Discussion — Which standard fits when

### 7.1 Fit by scenario

(interpretive) The design decisions produce natural fits.

- **A single endpoint with many agents paying the same fee** — x402 batch-settlement fits naturally; merchant-side claim/settle sweeps many channels at once[^s04][^s07].
- **One agent camped on one LLM endpoint, token-billed** — MPP `stream` / `session` fits naturally; SSE / WebSocket carries `payment-need-voucher` events while one channel runs the whole session[^s16][^s17].
- **Cards, SPT, and stablecoins mixed at the same endpoint** — MPP wins; the spec was designed for "WWW-Authenticate: Payment" lines advertising several methods at once[^s18].
- **Accepting arbitrary ERC-20 as the payment asset** — x402 batch-settlement wins; the Permit2 fallback enables gasless deposit even for non-EIP-3009 tokens[^s04][^s07].

### 7.2 Potential convergence

Analysts have raised the possibility of the two standards being **bundled inside the same SDK adapter** _(interpretive)_. The x402 community has an open issue on "Enable EIP-4337 Smart Wallet / UserOperation Support in x402 Protocol"[^s30], and MPP's `mpp-specs` repo is explicit that intent / method orthogonality is a design goal[^s13]. Nothing at the spec level prevents a single SDK from exposing "x402 `batch-settlement` + MPP `session`" as parallel intents.

### 7.3 The cost of fragmentation

The two standards do not share a governance body. x402 Foundation specs are Apache-2.0 but not RFCs[^s01]; MPP is on the IETF track but RFC promotion takes time[^s14]. For a merchant the tension is between (a) the integration cost of "I don't know which standard my user's SDK will speak" and (b) the abstraction convergence that lets one adapter layer absorb the difference.

## 8. Limitations

- This report reflects primary specs and SDK docs as of 20 May 2026. Both x402 V2 and MPP intent definitions are moving fast; field / function names may drift after specific version cut-overs.
- The exact TypeScript / Go batch-settlement package paths under `typescript/packages/mechanisms/evm/` were partly obscured by GitHub UI restrictions; the code citations are reconstructed from the spec text[^s04] and the canonical `paymentMiddleware` Express example[^s27], not from the batch-settlement mechanism package itself.
- The `session.md` of `mpp-specs` was not directly fetchable via raw URLs; the MPP-side citations rely on the Stellar guide[^s15], the Tempo streamed-payments docs[^s16], the mpp.dev guide[^s17], and the Tempo MPP Sessions blog[^s20]. The sister report [`mpp-session-mechanism`](../mpp-session-mechanism/) holds deeper citations of the same intent.
- The two standards covered here are not exhaustive of off-chain channel families. Lightning Network channels, Solana state-channel variants, and ERC-7824 are adjacent families that deserve separate reports.
- Some vendor-quoted numbers (e.g. x402 batch-settlement's "sub-cent" claim) are surfaced as vendor-stated; this report does not independently audit those figures.
