# Outline — Five Attacks on x402 Agentic Payment Protocol

## 1. Abstract
- 1–2 paragraphs summarizing the paper's claim that x402's HTTP–blockchain
  boundary is a distinct cross-layer attack surface, and naming the four
  attack classes / five concrete attacks plus mitigations.

## 2. Introduction
- What x402 is (HTTP 402 revival, payment payload in `X-PAYMENT`,
  facilitator-mediated verify-then-settle).
- The cross-layer trust gap: synchronous HTTP vs. probabilistic blockchain
  finality.
- Why x402 deserves formal analysis now (Coinbase release in May 2025,
  ~13,000 registered servers in Bazaar by April 2026, A2A integration).
- This report's scope and structure.

## 3. Background and System Model
- x402 protocol flow: request → 402 + PaymentRequirements →
  X-PAYMENT (PaymentPayload, signed) → /verify → /settle → on-chain
  settlement → resource grant.
- Entity model `(C, R, F, B, N, T, λ)` from the paper.
- EIP-712 typed signing, EIP-3009 `transferWithAuthorization`, and Permit2
  (`x402ExactPermit2Proxy`, `x402UptoPermit2Proxy`) as concrete settlement
  paths.
- Four security properties the paper formalizes: authorization soundness,
  payment–service correspondence, replay resistance, facilitator
  k-atomicity.

## 4. The Five Attacks
- 4.1 Attack I-A — Revert-grant under optimistic execution.
- 4.2 Attack I-B — Unauthorized settlement preemption (caller-unbound
  EIP-3009 / Permit2).
- 4.3 Attack II — Replay / idempotency across the HTTP–chain boundary.
- 4.4 Attack III — HTTP / proxy-level confusion: header mutation (D1)
  and cache leakage (D2).
- 4.5 Attack IV — Server-selection attacks on Bazaar-style discovery:
  metadata manipulation (E1) and Sybil flooding (E2).
- For each: threat model, failure event, attack steps, root cause.

## 5. Evaluation and Implementation Audit
- Testbed: Hardhat/Anvil + Base Sepolia + four live endpoints,
  >25,000 payment requests across 48 configurations, MockUSDC
  implementing EIP-3009.
- Key quantitative results: RGP₀ up to 5.18 %, DGR = n (live: 248
  HTTP grants per single on-chain settlement), nginx cache leakage 100 %
  without `Cache-Control: no-store`, E1 selection 68.8–71.8 %, E2
  Sybil-5 aggregate 60.2 %.
- Cross-implementation audit of three SDK families
  (Coinbase TS, third-party Python, third-party Rust): 11 vulnerabilities
  across six audited properties.

## 6. Proposed Mitigations
- M1 canonical/typed encoding with freshness; M2 facilitator-bound
  settlement (sender == endorsed facilitator); M3 single-use grants with
  `pay_id × resource_id` claim before grant; M4 two-phase
  (reserve-then-settle) execution and k-finality gating; M5 cache and
  header hygiene; M6 metadata validation and Sybil resistance on
  discovery layers.
- Map of mitigations to attacks (Table 6 in the paper).

## 7. Discussion
- Security–latency tradeoff and Corollary 10 confirmation-depth guidance
  (k ≥ 3 for <$1, k ≥ 12 for >$10 on Base, T_b ≈ 2 s).
- Compatibility direction: EIP-712 typed signing, EIP-3009, EIP-8004 as a
  trust/registry layer rather than a replacement.
- Positioning vs. payment-channel atomicity research, PoS reorg attacks,
  and MCP / tool-poisoning literature.

## 8. Limitations
- Reorg risk estimated through controlled local-chain injection, not
  observed live-network reorgs.
- Audit covers three SDK families and four endpoints — not exhaustive.
- Out of scope: fully malicious resource servers, R–F collusion, and
  Attack IV variants E3–E5.
- Selection-rate evidence depends on the specific LLMs and scout catalog.

## 9. References
- Generated from `working/sources.jsonl`.
