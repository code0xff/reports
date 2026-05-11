# MPP Session Mechanism and Implementation Deep Dive

## Abstract

MPP (Machine Payments Protocol) Session is an off-chain payment channel mechanism that enables autonomous AI agents to perform unlimited micropayments against HTTP APIs while bypassing blockchain throughput limitations. After depositing TIP-20 tokens into the `TempoStreamChannel` escrow smart contract, clients exchange EIP-712 typed-data vouchers off-chain as they consume services. Servers validate each voucher with a single `ecrecover` call — adding only microseconds of latency — while thousands of micropayments settle in just two on-chain transactions (open + close)[^s01]. This analysis draws primarily from the official Tempo blog[^s01], IETF draft-tempo-session-00[^s02], and mpp.dev technical documentation[^s03][^s04][^s05] to cover channelId derivation, the EIP-712 voucher structure, server accounting, the full session lifecycle, security considerations, and the SDK ecosystem.

---

## 1. Introduction

### 1.1 The Problem: AI Agent Micropayment Dilemma

Autonomous AI agents call many paid APIs — LLM inference, real-time data feeds, IoT sensor streams — on a per-request basis. Traditional payment models (subscriptions, API keys, account creation) cannot satisfy immediate, autonomous pay-per-use demands[^s05]. If each API request required an on-chain transaction, the resulting ~500ms finality latency would be incompatible with real-time streaming workloads[^s01].

### 1.2 MPP's Two Payment Models: charge vs session

MPP defines two payment intents[^s05]. The `charge` intent is a one-time payment that settles one on-chain transaction per request. The `session` intent combines pre-funded escrow with off-chain voucher exchange: only two on-chain transactions (open + close) are needed regardless of how many micropayments occur in between[^s01]. Cloudflare has integrated the session intent into its agentic payment infrastructure as the preferred model for token-based and streaming billing scenarios[^s06].

### 1.3 Standardization Status

MPP Session is submitted as IETF draft `draft-tempo-session-00`[^s02]. The underlying MPP protocol was co-authored by Tempo and Stripe as an open standard[^s05]. IETF drafts expire after six months without an update, and progression to RFC status could take years.

---

## 2. Background

### 2.1 HTTP 402-Based Payment Negotiation

MPP reuses the HTTP 402 Payment Required status code and standard authentication headers[^s02]. The server returns a 402 response with a `WWW-Authenticate: Payment` challenge containing: `id` (challenge identifier), `realm` (protection space), `method` ("tempo"), `intent` ("session"), `request` (Base64url-encoded JSON), and `expires` (RFC3339 timestamp). The client generates a voucher and retries with an `Authorization: Payment <credential>` header.

### 2.2 Tempo Blockchain and TIP-20

Tempo uses the TIP-20 token standard with built-in payment lanes, transfer memos, and compliance policies for stablecoins[^s07]. The chain provides deterministic sub-second finality _(specific sub-second figure is vendor-stated)_ and supports fee sponsorship, enabling gasless transactions where users pay gas in stablecoins[^s07]. An expiring-nonce system supports concurrent transaction submission[^s07]. The `TempoStreamChannel` escrow contract is deployed on mainnet (chain ID 4217, `0x33b901018174DDabE4841042ab76ba85D4e24f25`) and testnet Moderato (chain ID 42431, `0xe1c4d3dce17bc111181ddf716f75bae49e61a336`)[^s03].

---

## 3. MPP Session Architecture

### 3.1 The TempoStreamChannel Escrow Contract

The `TempoStreamChannel` escrow contract is the foundation of MPP Session[^s03]. The payer (client) deposits TIP-20 tokens into the contract; the payee (server) later submits the final voucher on-chain to claim payment. Any unused deposit is refunded to the payer at close. The model resembles pre-paying at a fuel station: funds are locked in advance and only actual consumption is deducted.

### 3.2 Deterministic channelId Derivation

Each payment channel is identified by a unique `channelId` derived from seven parameters[^s02]:

```
channelId = keccak256(abi.encode(
    payer,            // depositor address
    payee,            // recipient address
    token,            // TIP-20 token address
    salt,             // random value preventing channel reuse
    authorizedSigner, // hot-wallet signer (zero if payer signs directly)
    address(this),    // escrow contract address
    block.chainid     // chain ID
))
```

Including `address(this)` and `block.chainid` explicitly binds the channel to a specific contract deployment and chain[^s02], preventing both cross-contract and cross-chain replay attacks.

### 3.3 Channel State Model

The server maintains these fields per channel[^s02]:

- `acceptedCumulative`: Highest valid voucher cumulative amount accepted (monotonically increasing)
- `spent`: Cumulative amount charged for delivered service
- `settledOnChain`: Last cumulative amount settled on-chain (informational)
- `available = acceptedCumulative - spent`: Remaining service budget

### 3.4 Deposit Negotiation

Servers include `suggestedDeposit` and `maxDeposit` parameters in the challenge payload to guide clients on appropriate deposit sizes[^s03]. The SDK respects `maxDeposit` as an upper bound on capital locked per channel[^s04]. For example, `maxDeposit: '1'` locks up to 1 pathUSD — enough for 100 requests at $0.01 each.

---

## 4. The Cryptographic Voucher System

### 4.1 EIP-712 Typed Data Signature

Vouchers use EIP-712 structured data signing[^s02]. The type definition is:

```
Voucher: [
  { name: "channelId",        type: "bytes32" },
  { name: "cumulativeAmount", type: "uint128" }
]
```

The domain separator uses:
- `name`: "Tempo Stream Channel"
- `version`: "1"
- `chainId`: Tempo chain ID (e.g., 42431)
- `verifyingContract`: escrow contract address

The signing hash is computed as:

```
signingHash = keccak256("\x19\x01" || domainSeparator || structHash)
```

### 4.2 Cumulative Semantics

Vouchers specify totals, not deltas[^s02]. Each voucher authorizes "withdrawal of up to X total so far." The contract computes `delta = cumulativeAmount - settled` for each settlement. A sequence of vouchers for 100, 250, and 400 authorizes deltas of 100, 150, and 150 respectively. Servers enforce monotonic increase by rejecting any voucher with `cumulativeAmount ≤ acceptedCumulative`[^s02]. Non-advancing vouchers are handled idempotently.

### 4.3 Single ecrecover Verification

Voucher verification requires exactly one `ecrecover` call[^s03]. This is a CPU-bound operation requiring no RPC calls, achieving microsecond-level latency _(vendor-stated)_[^s01]. "Vouchers are not bottlenecked by blockchain throughput; they are processed in pure CPU-bound signature checks"[^s04].

### 4.4 Low-S ECDSA Rule

All signatures must use low-s values (s ≤ secp256k1_order / 2)[^s02]. Servers reject high-s signatures. This rule prevents ECDSA signature malleability attacks. Both 65-byte `(r, s, v)` and 64-byte EIP-2098 compact formats are accepted.

### 4.5 Authorized Signer Delegation

The `channelId` derivation includes an `authorizedSigner` parameter[^s02]. When this field is non-zero, the contract verifies that the recovered signer matches `channel.authorizedSigner` rather than `channel.payer`. This separates deposit authority (cold wallet) from signing authority (hot wallet). Compromise of the authorized signer key risks only the per-channel locked deposit, not the main account's broader holdings.

---

## 5. Session Lifecycle

### 5.1 Open: Channel Establishment

The client submits an on-chain transaction depositing TIP-20 tokens into the `TempoStreamChannel` contract[^s02][^s03]. The server recognizes the channel as valid after on-chain confirmation. With the TypeScript SDK[^s04]:

```typescript
const mppx = Mppx.create({
  methods: [tempo({
    account: privateKeyToAccount('0x...'),
    maxDeposit: '1',
  })],
})
```

When the first request receives a 402, the SDK automatically opens the channel and sends the initial voucher.

### 5.2 Consume: Off-Chain Voucher Exchange

After channel opening, each request carries an off-chain voucher in the `Authorization: Payment` header[^s02][^s03]. The server's processing order is:

1. Validate voucher signature (`ecrecover`)
2. Confirm `cumulativeAmount > acceptedCumulative` (monotonicity)
3. Confirm `cumulativeAmount ≤ channel.deposit` (deposit cap)
4. Persist `spent` to durable storage before delivering service (crash-safety principle)
5. Deliver service
6. Return `Payment-Receipt` header (channelId, acceptedCumulative, spent, available)

### 5.3 Streaming Pause: payment-need-voucher Event

During SSE streaming, if `available` is exhausted the server pauses the stream and emits[^s02]:

```
event: payment-need-voucher
data: {
  "channelId": "0x6d0f4fdf...",
  "requiredCumulative": "250025",
  "acceptedCumulative": "250000",
  "deposit": "500000"
}
```

The client inspects the `deposit` value to decide whether a new voucher alone suffices or a top-up deposit is required.

### 5.4 Top-Up: Replenishing the Channel

Additional deposits can be made without closing the channel[^s01][^s03]. A top-up does not change the `channelId` — it increases the channel's deposit in place. If the server has issued a forced-close request, a successful top-up cancels the close timer. The SDK exposes this via a top-up API call.

### 5.5 Cooperative Close

In normal termination, the server calls `close(channelId, cumulativeAmount, sig)` on the escrow contract[^s02][^s03]. The contract verifies the server's signature, pays `cumulativeAmount` to the payee, and refunds the remainder to the payer. The SDK completes this via `const receipt = await session.close()`.

### 5.6 Forced Close

If the server is unresponsive or refuses cooperative close, the payer calls `requestClose(channelId)`[^s02]. A 15-minute grace period begins during which the server may still submit a final voucher on-chain for settlement. After the grace period, the payer calls `withdraw(channelId)` to recover the full remaining deposit. The 15-minute window is designed to "provide time to detect close requests and submit final settlements, even during network congestion or maintenance windows"[^s02].

---

## 6. Server Implementation and Security

### 6.1 Crash-Safe Accounting

Servers must maintain `acceptedCumulative`, `spent`, and `settledOnChain` in durable storage[^s02]. Critically, `spent` must be persisted before service delivery — the "spend-before-serve" principle[^s02]. This ensures accurate billing state survives server crashes, preventing double-delivery of service.

### 6.2 DoS Defenses

The IETF draft specifies[^s02]:

- Voucher submissions SHOULD be limited to 10 per second per session.
- `minVoucherDelta` MUST be enforced when present.
- A minimum deposit (at least 1 USD equivalent recommended) SHOULD be required.
- Non-monotonic vouchers are handled idempotently (return current state without reprocessing).
- Format validation SHOULD precede expensive ECDSA recovery to minimize computational cost.

### 6.3 Replay Attack Prevention

MPP Session replay protection uses three complementary layers[^s02]:

1. **channelId binding**: Vouchers are bound to a specific contract/chain/payer-payee pair
2. **Cumulative monotonicity**: Any voucher ≤ `acceptedCumulative` is immediately rejected
3. **On-chain enforcement**: The contract rejects withdrawals below the already-settled amount

### 6.4 RFC9457 Error Responses

Servers return payment errors in RFC9457 Problem Details format[^s02]. The draft defines eight problem types (all prefixed with `https://paymentauth.org/problems/`):

| Problem Type | HTTP Status |
|---|---|
| `session/invalid-signature` | 402 |
| `session/signer-mismatch` | 402 |
| `session/amount-exceeds-deposit` | 402 |
| `session/delta-too-small` | 402 |
| `session/channel-not-found` | 410 |
| `session/channel-finalized` | 410 |
| `session/challenge-not-found` | 402 |
| `session/insufficient-balance` | 402 |

---

## 7. Performance, SDK Ecosystem, and Adoption

### 7.1 Performance Characteristics

The core performance advantage of MPP Session is that in-session requests require only off-chain voucher verification — no on-chain confirmation delay[^s01][^s03]. Voucher processing occurs in microseconds _(vendor-stated)_, contrasting with ~500ms for per-request `charge` payments _(vendor-stated)_. Two on-chain transactions amortize across thousands of micropayments, substantially reducing the effective per-request on-chain cost[^s01].

### 7.2 SDK Ecosystem

MPP supports a multi-language SDK ecosystem[^s05]:

- **TypeScript (mppx)**: `wevm/mppx`, v0.6.17 as of May 9, 2026 (76 releases)[^s09]. Built on Viem/Wagmi with automatic payment handling via a global fetch interceptor.
- **Python (pympp)**: `pip install "pympp[tempo]"`, requires Python 3.10+[^s08].
- **Rust, Go, Ruby**: Official SDKs available[^s05].
- **Framework middleware**: Hono, Express, Next.js, Elysia[^s05][^s06].

### 7.3 Real-World Adoption

Cloudflare has integrated MPP into its agentic payments infrastructure, supporting Tempo stablecoin payments alongside Stripe card payments (charge intent) at a single endpoint[^s06]. Primary use cases are LLM inference marketplaces (per-token billing), real-time data feeds, and IoT microtransactions[^s01][^s06].

---

## 8. Limitations

**IETF Draft Status**: `draft-tempo-session-00` will expire six months after submission without an update[^s02]. Progression to RFC could take years. Protocol details may change during standardization.

**Authorized Signer Key Theft**: Compromise of the `authorizedSigner` hot-wallet key exposes the full per-channel deposit balance. The main account is protected, but per-channel balances are at risk[^s02].

**Forced Close Exposure Window**: If a server refuses cooperative close, the payer cannot recover funds during the 15-minute grace period. If the server does not submit a final settlement, the payer recovers the full deposit — but a service outage occurs during the wait[^s02].

**Single Blockchain Dependency**: The session intent is currently defined only for Tempo/EIP-712[^s02]. MPP's other payment rails (Solana, Stellar, Lightning) would require separate session channel specifications.

**Implementation-Level Vulnerability (GHSA-fxc9-7j2w-vx54)**: A GitHub Security Advisory published March 26, 2026 disclosed a Critical vulnerability in `mpp-rs` before v0.8.0: the `tempo/session` handler did not enforce that sessions were active and paid, enabling unlimited session creation without payment[^s10]. The vulnerability was fixed in v0.8.0. This is an implementation-level defect rather than a protocol-design flaw, but it demonstrates that official SDK implementations can carry severe security gaps.

**No Public Security Audit**: No independent security audit of the `TempoStreamChannel` contract has been publicly disclosed as of May 2026.

**Vendor-Stated Performance Figures**: Voucher verification latency in microseconds, Tempo sub-second finality, and theoretical 1M TPS are all sourced from vendor materials and have not been independently benchmarked.
