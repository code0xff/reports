# Claims — Five Attacks on x402 Agentic Payment Protocol

## Introduction
- [x] c01: x402 is Coinbase's protocol that reuses HTTP 402 to drive
  per-request agentic micropayments and entered public release in 2025.
  - sources: s03, s05, s06
- [x] c02: As of April 2026 the x402 ecosystem registers on the order of
  ten thousand servers (the paper cites 13,000 and a snapshot of 13,760
  endpoints across 420 domains).
  - sources: s01, s13
- [x] c03: Prior to this paper, x402 had received little formal academic
  security analysis; existing payment-channel and API-security work does
  not directly cover the HTTP/chain coupling x402 introduces.
  - sources: s01, s14

## Background and System Model
- [x] c04: x402 has three phases — request-and-quote, payment
  presentation, and verify-settle-grant via the facilitator.
  - sources: s01, s03
- [x] c05: x402 settlement uses EIP-3009 `transferWithAuthorization`
  for USDC/EURC and Permit2 paths for arbitrary ERC-20, all over
  EIP-712 typed signatures.
  - sources: s04, s08, s09, s11
- [x] c06: The paper formalizes four security properties (authorization
  soundness, payment–service correspondence, replay resistance,
  facilitator k-atomicity) and proves them as Theorems 6–9.
  - sources: s01

## The Five Attacks
- [x] c07: Attack I-A reaches RGP₀ ≈ 5.18 % at p_reorg = 0.05 and
  δ = 400 ms; Byzantine facilitator control reaches 100 %.
  - sources: s01
- [x] c08: Attack I-B exploits caller-unbound EIP-3009 / Permit2
  settlement; on Base Sepolia the live trace charges the payer while
  the endpoint returns HTTP 402.
  - sources: s01, s08, s11
- [x] c09: Attack II — without HTTP-layer idempotency, one payment
  yields many grants; live endpoint produced 248 HTTP grants from one
  settlement.
  - sources: s01
- [x] c10: Attack III cache leakage hits 100 % on nginx without
  `Cache-Control: no-store`, drops to 0 % once the header is in place.
  - sources: s01
- [x] c11: Attack IV — E1 single-listing selection 68.8–71.8 % across
  three LLMs; E2 Sybil-5 aggregate 60.2 %.
  - sources: s01

## Evaluation and Implementation Audit
- [x] c12: 25,000+ payment requests across 48 configurations on
  Hardhat/Anvil and Base Sepolia, plus 2,160 discovery decisions for
  Attack IV; rate metrics carry 95 % Wilson CIs.
  - sources: s01
- [x] c13: Audit covers Coinbase TS, third-party Python, third-party
  Rust SDKs, and four live endpoints; 11 vulnerabilities across five
  classes.
  - sources: s01
- [x] c14: No audited SDK binds payments to the requested resource;
  none emits `Cache-Control: no-store` or `private` by default; only
  SDK-A settles before granting but does not wait for reorg
  resistance.
  - sources: s01

## Proposed Mitigations
- [x] c15: Six mitigations (M1–M6) span canonical encoding,
  facilitator-bound settlement, single-use grants with resource
  binding, two-phase execution, cache/header hygiene, and
  discovery-layer defenses.
  - sources: s01
- [x] c16: Corollary 10 recommends k ≥ 3 for resources < $1
  (target ≤ 10⁻²) and k ≥ 12 for resources > $10 (≤ 10⁻⁴) on Base.
  - sources: s01

## Discussion
- [x] c17: x402's exposure is a structural cross-layer authorization
  gap: HTTP is synchronous and irrevocable, chain settlement is
  asynchronous and probabilistic.
  - sources: s01, s14
- [x] c18: Findings were privately disclosed to Coinbase via
  HackerOne under reports #3679163, #3679179, #3679220.
  - sources: s01

## Limitations
- [x] c19: Revert-grant probabilities come from controlled local reorg
  injection and an analytic Bernoulli model, not observed
  public-network reorgs; the authors flag this explicitly.
  - sources: s01
- [x] c20: Audit coverage is limited (three SDK families, four live
  endpoints, three LLMs across 12 categories); Attack IV variants
  E3–E5 are not validated empirically.
  - sources: s01
