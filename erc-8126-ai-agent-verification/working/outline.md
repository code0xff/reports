# Outline — ERC-8126: AI Agent Verification

Primary language: ko (bilingual ko/en). Academic structure.

## 1. Abstract (초록)
What ERC-8126 is, what it adds on top of ERC-8004, the five verification
mechanisms, the ZK/PDV privacy model, the 0–100 risk score, current draft
status, and the report's main judgment.

## 2. Introduction (서론)
- Why agent verification on-chain is being proposed now (autonomous AI
  agents transacting on Ethereum; agentic payments).
- The problem: identity (who is this agent?) vs verification (is this
  agent safe / what it claims to be?).
- ERC-8004 establishes portable identity; ERC-8126 proposes the
  verification/trust layer above it.
- Scope and method of this report.

## 3. Background: agent identity and the ERC-8004 stack (배경)
- ERC-8004 "Trustless Agents" — ERC-721-based identity registry,
  tokenURI metadata, pluggable registries. Its own status/history.
- The broader landscape: A2A, agentic payments (x402, EIP-3009),
  trust/reputation registries.
- Where ERC-8126 sits in this stack and what gap it claims to fill.

## 4. Technical anatomy of ERC-8126 (기술 구조)
- The five verification types: ETV, MCV, SCV, WAV, WV — what each checks
  and against which external standard (OWASP SCSVS/WSTG, C2PA).
- Private Data Verification (PDV): ZKPs, no data storage, risk-score-only
  disclosure to wallet holder.
- Risk scoring framework: 0–100, five tiers, arithmetic mean aggregation.
- Off-chain execution model + optional on-chain interface
  (AgentVerified event, getLatestRiskScore).
- Dependency graph: EIP-155/191/712/3009/721 + ERC-8004.
- Optional QCV quantum-resistant encryption.

## 5. Critical analysis (비판적 분석)
- Trust model: off-chain providers, provider collusion/independence,
  "verified ≠ safe in future".
- Aggregation soundness: arithmetic-mean risk score — does averaging
  hide critical failures?
- Privacy vs accountability: score visible only to wallet holder —
  consequences for counterparties relying on it.
- ZK maturity: Groth16 trusted setup, audited circuits, post-quantum gaps.
- Standardization realism: dependence on a still-early ERC-8004; whether
  ERC-8126 is genuinely "standardizable" or vendor-shaped.
- Source independence problem (authors' affiliation; single-origin draft).

## 6. Discussion: implications & adoption outlook (논의 — 시사점과 전망)
- My own assessment: what ERC-8126 gets right, where it likely changes
  before/if it reaches Final, and realistic adoption paths.
- Who benefits (agent marketplaces, wallets, agentic-payment rails).
- Competitive/complementary standards and likely consolidation.
- Conditions under which this becomes infrastructure vs stays a niche draft.

## 7. Limitations (한계)
- ERC-8126 is an early draft; status may shift; spec text may change.
- Single-origin documentation; limited independent third-party analysis.
- Reference implementation not independently audited at time of writing.
- Any remaining open gaps from gaps.md land here.

## 8. References (참고문헌)
Built by the renderer from working/sources.jsonl.
