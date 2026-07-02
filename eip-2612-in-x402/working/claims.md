# Claims — EIP-2612 and how to use it in x402

## Introduction
- [x] c01: Under plain ERC-20, granting a spender an allowance requires the token holder to send an on-chain `approve` transaction and therefore hold the chain's native asset for gas.
  - kind: technical
  - needs: EIP-20 spec / EIP-2612 motivation section
- [x] c02: x402 is an open payment protocol, initiated by Coinbase, that revives the HTTP 402 "Payment Required" status code to let clients (including AI agents) pay for HTTP resources with stablecoin signatures instead of API keys or subscriptions.
  - kind: factual
  - needs: x402 whitepaper/site + independent reporting
- [x] c03: x402's core value proposition depends on the payer never needing to submit an on-chain transaction themselves; signature-based authorization standards (EIP-3009, EIP-2612) are what make that possible.
  - kind: interpretive
  - needs: x402 docs describing gasless flow

## Background: EIP-2612 Permit
- [x] c04: EIP-2612 adds three functions to ERC-20 — `permit(owner, spender, value, deadline, v, r, s)`, `nonces(owner)`, and `DOMAIN_SEPARATOR()` — allowing allowance changes via an off-chain signed message.
  - kind: technical
  - needs: EIP-2612 spec text
- [x] c05: The permit signature is an EIP-712 typed-data signature over the struct `Permit(address owner,address spender,uint256 value,uint256 deadline,uint256 nonce)` bound to the token's domain separator.
  - kind: technical
  - needs: EIP-2612 spec + reference implementation (e.g. OpenZeppelin ERC20Permit)
- [x] c06: EIP-2612 nonces are strictly sequential per owner, so multiple pending permits from one owner cannot be settled out of order.
  - kind: technical
  - needs: spec text + implementation code
- [x] c07: `permit` only sets an allowance; moving funds still requires a separate `transferFrom` call, which the spender (not the owner) can submit and pay gas for.
  - kind: technical
  - needs: spec + technical writing
- [x] c08: EIP-3009 (`transferWithAuthorization` / `receiveWithAuthorization`) differs from EIP-2612 by authorizing a transfer directly (not an allowance) and by using random 32-byte nonces that permit parallel, unordered authorizations.
  - kind: technical
  - needs: EIP-3009 spec + comparison writing
- [x] c09: DAI implements an earlier, non-conforming permit variant (bool allowed, no value parameter), so "has permit" does not imply EIP-2612 conformance.
  - kind: technical
  - needs: DAI contract source or authoritative writeup
- [x] c10: USDC (Circle's implementation) supports both EIP-2612 permit and EIP-3009 authorizations on major EVM chains.
  - kind: factual
  - needs: Circle docs + contract source

## The x402 protocol
- [x] c11: In x402, a server answers an unpaid request with HTTP 402 and a `PaymentRequirements` JSON body; the client retries with an `X-PAYMENT` header carrying a base64-encoded signed payment payload.
  - kind: technical
  - needs: x402 spec in the coinbase/x402 repo
- [x] c12: x402 defines a facilitator with `/verify` and `/settle` endpoints so resource servers can accept payments without running chain infrastructure themselves.
  - kind: technical
  - needs: x402 spec + facilitator docs
- [x] c13: The first and dominant x402 scheme is `exact`, which on EVM networks is specified around EIP-3009 `transferWithAuthorization` for USDC.
  - kind: technical
  - needs: x402 scheme spec (exact/evm)
- [x] c14: The x402 `exact` EVM payload contains the EIP-3009 authorization fields (from, to, value, validAfter, validBefore, nonce) plus the signature, mirroring the on-chain call.
  - kind: technical
  - needs: x402 spec / types in repo
- [x] c15: Settlement gas in x402 is paid by the facilitator (or whoever submits the settlement transaction), not by the payer.
  - kind: technical
  - needs: x402 docs/spec

## How x402 uses EIP-2612
- [x] c16: x402 uses EIP-2612 permit as the documented path to support arbitrary ERC-20 tokens that lack EIP-3009, via a permit-then-transferFrom settlement.
  - kind: technical
  - needs: x402 repo docs/code (e.g. exact scheme for permit tokens, or `upto`/other schemes), PRs/issues
- [x] c17: Because EIP-2612 needs two on-chain steps (permit, then transferFrom) unless bundled, facilitators either multicall them atomically or accept a two-transaction settlement; this is a real design difference from the single-call EIP-3009 path.
  - kind: interpretive
  - needs: facilitator implementation code or design discussion
- [x] c18: The sequential nonce of EIP-2612 constrains concurrent x402 payments from the same payer, whereas EIP-3009's random nonces do not.
  - kind: interpretive
  - needs: spec comparison + any x402 discussion of this
- [x] c19: The x402 ecosystem has extended beyond USDC-only: SDKs/facilitators (including third-party ones) advertise support for permit-style ERC-20 assets.
  - kind: factual
  - needs: two independent ecosystem sources (docs, repos, announcements)

## Implementation walkthrough
- [x] c20: A client can produce a valid EIP-2612 permit signature with standard libraries (viem `signTypedData` / ethers `signTypedData`) given the token's name, version, chainId, and verifying contract.
  - kind: technical
  - needs: library docs + example code
- [x] c21: Correct permit signing requires reading the token's actual EIP-712 domain (name/version), because tokens differ (e.g. USDC version "2"), and a mismatched domain makes the signature revert.
  - kind: technical
  - needs: EIP-712/2612 spec + token docs or code
- [x] c22: The x402 reference stack provides middleware (e.g. Express/Hono/Next) that gates routes on payment and delegates verification/settlement to a facilitator via HTTP.
  - kind: technical
  - needs: coinbase/x402 repo code
- [x] c23: A custom facilitator can settle a permit-based payment by calling `permit()` followed by `transferFrom()` in one transaction using a multicall or a small settlement contract.
  - kind: technical
  - needs: example implementation or repo code

## Security considerations and pitfalls
- [x] c24: Anyone who observes a permit signature can front-run the intended `permit()` call; robust integrations must treat a front-run permit (nonce consumed, allowance already set) as success, not failure.
  - kind: technical
  - needs: known griefing writeups (e.g. permit front-running / DoS pattern)
- [x] c25: An unlimited-value or long-deadline permit is a phishing vector: a single signed message can drain a wallet after social engineering, as seen in real incidents.
  - kind: factual
  - needs: 2 independent security sources/incident reports
- [x] c26: x402's exact scheme mitigates value risk by having the payer sign only the exact payment amount with a short validity window.
  - kind: interpretive
  - needs: x402 spec text
- [x] c27: Permit deadlines and EIP-3009 validAfter/validBefore serve the same replay/staleness role; expired authorizations must be rejected at verification, before settlement.
  - kind: technical
  - needs: specs + facilitator verification code
- [x] c28: Some ERC-20s cannot be used with the permit flow at all (no permit function, or the phantom-function hazard where a token silently accepts `permit()` calls via fallback, e.g. WETH), and integrations must detect this.
  - kind: technical
  - needs: security research on phantom permit (e.g. Multichain incident writeups)

## Discussion: design trade-offs and ecosystem state
- [x] c29: For x402-style micropayments, EIP-3009 is the better-fitting primitive (single call, parallel nonces, transfer-scoped), while EIP-2612 is the broader-compatibility primitive (many more tokens implement it).
  - kind: interpretive
  - needs: comparison sources + adoption evidence
- [x] c30: Uniswap's Permit2 provides permit-style approvals for tokens without EIP-2612 and is a plausible alternative integration path for x402-like systems.
  - kind: interpretive
  - needs: Permit2 docs + any discussion in x402 ecosystem
- [x] c31: x402 has measurable ecosystem traction since launch (facilitators, chains, transaction volume) but remains young and evolving; scheme definitions beyond `exact` are still in flux.
  - kind: factual
  - needs: 2 independent adoption sources + repo state
