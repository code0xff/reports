# Claims

## Introduction
- [x] c01: x402 is an HTTP-native payment protocol in which a resource server returns HTTP 402, a client supplies a signed payment payload, and a facilitator broadcasts the on-chain settlement while paying gas.
  - kind: factual
  - needs: x402 spec / scheme docs describing facilitator-broadcast, client-signs model. (s06, s08)
- [x] c02: For the `exact` scheme on EVM, the Permit2 proxy path exists as a universal fallback for ERC-20 tokens that do not implement EIP-3009.
  - kind: technical
  - needs: scheme_exact_evm.md asset-transfer-method table. (s06)

## Background: Permit2 and the witness pattern
- [x] c03: Permit2's `permitWitnessTransferFrom` lets a caller validate extra signed data (a "witness") alongside a one-time signature-based token transfer, and reverts if the requested amount exceeds the permitted amount.
  - kind: technical
  - needs: Uniswap Permit2 docs + ISignatureTransfer interface. (s04, s15, s16)
- [x] c04: Permit2 uses unordered, bitmap-based nonces so signed permits need not be spent in sequence and provide replay protection.
  - kind: technical
  - needs: ISignatureTransfer nonceBitmap doc + Uniswap docs. (s04, s15)
- [x] c05: The x402 proxy is the "spender" named in the Permit2 signature, not the facilitator; the witness binds `to` so the facilitator cannot redirect funds.
  - kind: technical
  - needs: scheme_exact_evm.md "Important Logic" + base contract NatSpec. (s06, s01)

## The payment schemes
- [x] c06: The `exact` scheme transfers a fixed amount known in advance; the `upto` scheme authorizes a maximum and settles the actual amount determined at settlement time.
  - kind: factual
  - needs: scheme_exact.md + scheme_upto.md summaries. (s05, s07)
- [x] c07: In `upto`, the `amount` field of PaymentRequirements is phase-dependent — maximum at verification, actual-to-settle at settlement — and the settled amount may be 0.
  - kind: technical
  - needs: scheme_upto.md core properties §5 + scheme_upto_evm.md settlement rules. (s07, s08)
- [x] c08: `batch-settlement` is a scheme in which a payment commitment is accepted and access granted immediately, but value moves later out-of-band; it is not settled by a synchronous on-chain transfer.
  - kind: technical
  - needs: batch_settlement.md protocol-behavior section. (s09)
- [x] c09: There is no `x402BatchSettlement.sol` contract in `contracts/evm/src`; the directory contains only the three proxies plus the ISignatureTransfer interface and a mock, while batch-settlement exists only as scheme specs.
  - kind: factual
  - needs: directory listing of contracts/evm/src + specs/schemes/batch-settlement. (s01, s02, s03, s09, s10)
- [x] c10: The reference Cloudflare binding of batch-settlement is credit-backed and authenticates commitments with HTTP Message Signatures (RFC 9421), with Cloudflare acting as Merchant of Record.
  - kind: technical
  - needs: batch_settlement_cloudflare.md. (s10)

## Contract code analysis
- [x] c11: `x402BasePermit2Proxy` is an abstract contract that stores the Permit2 address as an immutable set in the constructor (reverting on the zero address) and inherits OpenZeppelin's ReentrancyGuard.
  - kind: technical
  - needs: x402BasePermit2Proxy.sol source. (s01)
- [x] c12: The base `_settle` validates settlementAmount != 0, owner != 0, to != 0, and block.timestamp >= validAfter, then calls `PERMIT2.permitWitnessTransferFrom` with a child-supplied witnessHash and witnessTypeString.
  - kind: technical
  - needs: x402BasePermit2Proxy.sol `_settle`. (s01)
- [x] c13: `_executePermit` requires the EIP-2612 `value` to equal the Permit2 permitted amount, then calls `token.permit(...)` inside a try/catch that emits a failure event (reason/panic/data) instead of reverting, so a redundant or unsupported permit does not abort settlement.
  - kind: technical
  - needs: x402BasePermit2Proxy.sol `_executePermit` + upto test cases. (s01, s12)
- [x] c14: `x402ExactPermit2Proxy.settle` always passes `permit.permitted.amount` as the settlement amount (exact transfer) and its Witness is `{to, validAfter}` with no facilitator field.
  - kind: technical
  - needs: x402ExactPermit2Proxy.sol + exact test test_settle_transfersExactPermittedAmount. (s02, s13)
- [x] c15: `x402UptoPermit2Proxy.settle` accepts a caller-supplied `amount`, reverts with AmountExceedsPermitted if amount > permit.permitted.amount, and reverts with UnauthorizedFacilitator unless msg.sender == witness.facilitator.
  - kind: technical
  - needs: x402UptoPermit2Proxy.sol + upto tests. (s03, s12)
- [x] c16: The upto Witness includes a `facilitator` field bound into the witnessHash, so only the address the payer signed for can call settle; the exact proxy has no such caller restriction.
  - kind: technical
  - needs: x402UptoPermit2Proxy.sol WITNESS_TYPEHASH + settle access check. (s03, s02)

## Security properties and threat model
- [x] c17: Both proxies hold no token custody — tokens move directly from owner to `witness.to` via Permit2 — which the README states and an upto test (proxyNeverHoldsTokens) checks.
  - kind: technical
  - needs: README security section + test_settle_proxyNeverHoldsTokens. (s11, s12)
- [x] c18: The contracts are immutable with no owner/admin/upgrade mechanism and rely on OpenZeppelin ReentrancyGuard (`nonReentrant` on all external settle functions), with an upto test asserting reentrancy is blocked.
  - kind: technical
  - needs: README security + source modifiers + test_settle_blocksReentrancy. (s11, s03, s12)
- [x] c19: Single-use / replay protection for an authorization is provided by Permit2's nonce mechanism rather than by the proxy itself.
  - kind: technical
  - needs: scheme_upto.md §1 + Uniswap docs. (s07, s15)
- [x] c20: The proxies are intended to deploy to the same address on every EVM chain via Arachnid's CREATE2 deployer, which requires identical initCode; the repo disables CBOR metadata (`cbor_metadata=false`, `bytecode_hash="none"`) to keep bytecode reproducible.
  - kind: technical
  - needs: base contract NatSpec + README deterministic-build + foundry.toml. (s01, s11, s14)

## Discussion
- [x] c21: The `upto` scheme requires the client to trust the server to charge a fair amount, because the server can settle for anything up to the signed maximum.
  - kind: interpretive
  - needs: scheme_upto.md security considerations. (s07)
- [x] c22: The x402 spec acknowledges that integrators inherit the security properties (and any future vulnerabilities) of Permit2 and the proxy, and notes the Witness type was changed post-audit (the `extra` field removed).
  - kind: technical
  - needs: scheme_exact_evm.md implementer notes + post-audit comment. (s06)
- [x] c24: Independent security research (Five Attacks on x402) argues the exact settlement path does not bind facilitator identity, enabling settlement preemption/griefing by an observer who races the legitimate facilitator and consumes the nonce; the upto proxy's facilitator binding mitigates this while the exact proxy does not.
  - kind: interpretive
  - needs: arXiv preprint Attack I-B + contract caller checks. (s17, s02, s03)
- [x] c23: The canonical Exact proxy address is 0x402085c248EeA27D92E8b30b2C58ed07f9E20001 and the canonical Upto address is 0x4020a4f3b7b90CCA423b9FabCC0CE57c6c240002, but a legacy Base Sepolia Upto deployment uses different bytecode (with CBOR metadata) at a different address.
  - kind: factual
  - needs: README canonical-addresses + deployments table. (s11)
