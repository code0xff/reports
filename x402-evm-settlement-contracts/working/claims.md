# Claims

> Revised 2026-06-10 after the repo move to `x402-foundation/x402`. c09 was inverted
> (the contract now exists); c08 refined; c25–c31 added for the batch-settlement
> contract, deposit collectors, the capital-backed EVM binding, and the repo move.

## Introduction
- [x] c01: x402 is an HTTP-native payment protocol in which a resource server returns HTTP 402, a client supplies a signed payment payload, and a facilitator broadcasts the on-chain settlement while paying gas.
  - kind: factual
  - needs: x402 spec / scheme docs. (s06, s08)
- [x] c02: For the `exact` scheme on EVM, the Permit2 proxy path exists as a universal fallback for ERC-20 tokens that do not implement EIP-3009.
  - kind: technical
  - needs: scheme_exact_evm.md asset-transfer-method table. (s06)
- [x] c31: The canonical x402 repository moved from `coinbase/x402` to `x402-foundation/x402`; coinbase/x402 is now a development fork whose `main` is frozen at `dd927a2`, while the foundation tree (commit `dc656bb`, 2026-06-09) is the active source.
  - kind: factual
  - needs: coinbase/x402 README move notice + foundation repo HEAD. (s18, s19)

## Background: Permit2 and the witness pattern
- [x] c03: Permit2's `permitWitnessTransferFrom` lets a caller validate extra signed data (a "witness") alongside a one-time signature-based token transfer, and reverts if the requested amount exceeds the permitted amount.
  - kind: technical
  - needs: Uniswap Permit2 docs + ISignatureTransfer interface. (s04, s15, s16)
- [x] c04: Permit2 uses unordered, bitmap-based nonces so signed permits need not be spent in sequence and provide replay protection.
  - kind: technical
  - needs: ISignatureTransfer nonceBitmap doc + Uniswap docs. (s04, s15)
- [x] c05: The x402 proxy is the "spender" named in the Permit2 signature, not the facilitator; the witness binds `to` so the facilitator cannot redirect funds.
  - kind: technical
  - needs: scheme_exact_evm.md + base contract NatSpec. (s06, s01)

## The payment schemes
- [x] c06: The `exact` scheme transfers a fixed amount known in advance; the `upto` scheme authorizes a maximum and settles the actual amount determined at settlement time.
  - kind: factual
  - needs: scheme_exact.md + scheme_upto.md. (s05, s07)
- [x] c07: In `upto`, the `amount` field of PaymentRequirements is phase-dependent — maximum at verification, actual-to-settle at settlement — and the settled amount may be 0.
  - kind: technical
  - needs: scheme_upto.md + scheme_upto_evm.md. (s07, s08)
- [x] c08: `batch-settlement` is a scheme in which a payment commitment is accepted and access granted immediately, but value moves later; its synchronous settlement stores the commitment rather than executing a transfer.
  - kind: technical
  - needs: batch_settlement.md protocol-behavior section. (s09)
- [x] c10: The credit-backed Cloudflare binding of batch-settlement authenticates commitments with HTTP Message Signatures (RFC 9421), with Cloudflare acting as Merchant of Record, and ships no EVM contract.
  - kind: technical
  - needs: batch_settlement_cloudflare.md. (s10)
- [x] c25: batch-settlement now also ships a **capital-backed EVM binding** using stateless unidirectional payment channels (deposit once, off-chain cumulative vouchers, batched on-chain claims), implemented by the `x402BatchSettlement` contract.
  - kind: technical
  - needs: scheme_batch_settlement_evm.md summary + contract NatSpec. (s22, s19)

## Contract code analysis (proxies)
- [x] c11: `x402BasePermit2Proxy` is an abstract contract storing Permit2 as an immutable (reverting on zero) and inheriting OpenZeppelin ReentrancyGuard.
  - kind: technical
  - needs: x402BasePermit2Proxy.sol source. (s01)
- [x] c12: The base `_settle` validates settlementAmount != 0, owner != 0, to != 0, block.timestamp >= validAfter, then calls `PERMIT2.permitWitnessTransferFrom` with a child-supplied witnessHash/witnessTypeString.
  - kind: technical
  - needs: x402BasePermit2Proxy.sol `_settle`. (s01)
- [x] c13: `_executePermit` requires the EIP-2612 `value` to equal the Permit2 permitted amount, then calls `token.permit(...)` inside a try/catch that emits a failure event instead of reverting.
  - kind: technical
  - needs: x402BasePermit2Proxy.sol `_executePermit` + upto tests. (s01, s12)
- [x] c14: `x402ExactPermit2Proxy.settle` always passes `permit.permitted.amount` as the settlement amount and its Witness is `{to, validAfter}` with no facilitator field.
  - kind: technical
  - needs: x402ExactPermit2Proxy.sol + exact test. (s02, s13)
- [x] c15: `x402UptoPermit2Proxy.settle` accepts a caller-supplied `amount`, reverts AmountExceedsPermitted if amount > permitted, and reverts UnauthorizedFacilitator unless msg.sender == witness.facilitator.
  - kind: technical
  - needs: x402UptoPermit2Proxy.sol + upto tests. (s03, s12)
- [x] c16: The upto Witness includes a `facilitator` field bound into the witnessHash; the exact proxy has no such caller restriction.
  - kind: technical
  - needs: x402UptoPermit2Proxy.sol + x402ExactPermit2Proxy.sol. (s03, s02)

## Contract code analysis (batch settlement)
- [x] c26: `x402BatchSettlement` derives channel identity from an immutable `ChannelConfig` via an EIP-712 hash bound to chainId and contract address (`channelId = getChannelId(config)`); channels are created implicitly on first deposit.
  - kind: technical
  - needs: x402BatchSettlement.sol getChannelId + scheme_batch_settlement_evm.md. (s19, s22)
- [x] c27: Deposits go through a pluggable `IDepositCollector` whose `collect` must transfer tokens to the calling settlement contract; `deposit` verifies the contract balance increased by exactly `amount` (rejecting fee-on-transfer/failed pulls), and collectors are gated by `onlyx402BatchSettlement` so only the settlement contract can invoke them.
  - kind: technical
  - needs: x402BatchSettlement.deposit + IDepositCollector/DepositCollector. (s19, s20, s23)
- [x] c28: Claiming (`claim` / `claimWithSignature`) updates per-channel `totalClaimed` from cumulative payer vouchers and moves no tokens; a separate permissionless `settle(receiver, token)` sweeps `totalClaimed - totalSettled` to the receiver in one transfer. Cumulative monotonicity provides voucher replay protection without per-payment nonces.
  - kind: technical
  - needs: x402BatchSettlement claim/_processVoucherClaim/settle + spec. (s19, s22)
- [x] c29: Voucher signatures are verified two ways — ECDSA recover against `payerAuthorizer` when set, or `SignatureChecker` (EIP-1271) against `payer` when `payerAuthorizer == 0`. Distinct EIP-712 type hashes (Voucher/Refund/ClaimBatch) prevent cross-function replay.
  - kind: technical
  - needs: _processVoucherClaim + type-hash constants + spec security section. (s19, s22)
- [x] c30: Unclaimed escrow exits via cooperative refund or a payer-controlled timed withdrawal (15 min–30 day delay). `finalizeWithdraw` and `claim` are independent entry points with no on-chain reservation for unclaimed vouchers, so a withdrawal landing before a claim can force `ClaimExceedsBalance` — a liveness risk pushed to integrator policy. `refundNonce` advances at the start of `_executeRefund`, even on a no-op refund, invalidating pre-signed refund digests.
  - kind: technical
  - needs: initiate/finalizeWithdraw + refund/_executeRefund + implementer notes + spec. (s19, s23, s22)

## Security properties and threat model
- [x] c17: The proxies hold no token custody — tokens move directly from owner to `witness.to` via Permit2 — per README and the proxyNeverHoldsTokens test.
  - kind: technical
  - needs: README + test_settle_proxyNeverHoldsTokens. (s11, s12)
- [x] c18: The proxies are immutable (no owner/admin/upgrade) with `nonReentrant` on all settle functions; the batch contract uses `ReentrancyGuardTransient` (EIP-1153) and isolates channel funds by channelId (test_crossChannel_isolation).
  - kind: technical
  - needs: README + proxy modifiers + batch contract + batch tests. (s11, s03, s12, s19, s24)
- [x] c19: Single-use/replay protection differs by contract: the proxies rely on Permit2 nonces, while the batch contract relies on cumulative-monotonic `totalClaimed` plus a per-channel refund nonce.
  - kind: technical
  - needs: scheme_upto.md + Uniswap docs + batch contract/spec. (s07, s15, s19, s22)
- [x] c20: The proxies and the batch-settlement stack are intended to deploy to the same address on every EVM chain via Arachnid's CREATE2 deployer (identical initCode; CBOR metadata disabled); the two deposit collectors take the settlement address in their constructors so their initCode depends on it.
  - kind: technical
  - needs: base NatSpec + README deterministic-build + foundry.toml + foundation README. (s01, s11, s14, s25)

## Discussion
- [x] c21: The `upto` scheme requires the client to trust the server to charge fairly (server can settle anything up to the signed maximum); batch-settlement inherits the same trust shape at channel scale (client bears risk up to signed maxClaimableAmount).
  - kind: interpretive
  - needs: scheme_upto.md security considerations + batch EVM spec security section. (s07, s22)
- [x] c22: The x402 spec acknowledges integrators inherit Permit2/proxy security properties and any future vulnerabilities, and notes the proxy Witness was changed post-audit; no audit document was located for either the proxies or the batch contract.
  - kind: technical
  - needs: scheme_exact_evm.md + absence of audit source. (s06)
- [x] c24: Independent security research (Five Attacks on x402) argues the exact settlement path does not bind facilitator identity, enabling preemption/griefing; the upto facilitator binding mitigates this, and the batch claim path (receiver-restricted, no Permit2 nonce, cumulative no-op replay) sidesteps the same vector.
  - kind: interpretive
  - needs: arXiv preprint Attack I-B + contract caller checks. (s17, s02, s03, s19)
- [x] c23: The canonical Upto proxy address changed between the two pins — `0x4020a4f3…0002` at `dd927a2` vs `0x402015c7…0002` in the foundation README — while Exact (`0x402085c2…0001`) is unchanged; the batch stack deploys at `…0003`/`…0004`/`…0005` on Base, Arbitrum, World Chain, and Polygon.
  - kind: factual
  - needs: dd927a2 README + foundation README addresses/deployments. (s11, s25)
