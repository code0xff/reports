# Outline — Agent Commerce Protocol (ACP)

## 1. Abstract
- One-paragraph summary: what ACP is, why it matters, primary technical
  components (4 phases, escrow + Proof of Agreement + Evaluator), and a
  one-line summary of real-service uptake.

## 2. Introduction
- Why agent commerce needs its own protocol layer (HTTP/web payments,
  account-mediated APIs, and agent loops don't compose by default).
- Why Virtuals Protocol authored ACP: agent launchpad → service
  marketplace → standardized commerce primitive.
- Scope: the canonical four-phase ACP, the v1 → v2 architectural shift,
  and how ACP is wired into real services (Butler, x402, Aixbt, GAME,
  Luna, Autonomous Media House, Autonomous Hedge Fund).

## 3. Protocol design — the four phases
- Request, Negotiation (Proof of Agreement / PoA), Transaction (escrow),
  Evaluation (Evaluator agent). Role naming change in v2
  (Buyer/Seller/Evaluator → Client/Provider/Evaluator).
- Smart-contract role: escrow + cryptographic proof of agreement +
  evaluator attestation.
- Where ACP differs from A2A and x402: ACP enforces three-party escrow
  with a separate evaluator, not just a two-party payment handshake.

## 4. Reference implementation
- On-chain components: `ACP Core` and `FundTransferHook` contracts on
  Base Mainnet (v2 addresses).
- Off-chain components: facilitator-style SDKs (Node.js, Python, CLI),
  Butler agent, non-custodial wallets (Privy / Solana adapters), event
  transport (SSE).
- v1 (memo-based) vs v2 (hook-based, ERC-8183) — non-custodial wallets,
  multi-chain, composite identity, percentage-based pricing.
- Integration with x402 (`BASE_MAINNET_ACP_X402_CONFIG_V2` in the
  Python SDK) — ACP can use x402 as a payment rail.

## 5. Real-service implementations
- Butler as the user-facing agent that opens jobs through ACP and now
  ships in the Base App.
- Live agent ecosystems: Aixbt (signals / KOL monitoring), GAME
  framework (planner+executor architecture), Luna ($LUNA pop-star agent),
  the Autonomous Media House cluster, and the Autonomous Hedge Fund
  cluster.
- Virtuals Revenue Network as an economic subsidy (up to ~$1M/month for
  ACP-listed agents, announced at Consensus Hong Kong, February 2026).

## 6. Standardization and adoption
- ERC-8183 ("Agentic Commerce") forum proposal by davidecrapis.eth
  (March 4, 2026), co-authored with the Ethereum Foundation dAI team.
- v2's ERC-8183 compliance and what generalizing the standard buys
  (any chain, hook-based reputation integrations).
- Adoption figures: over 2,000 agents onboarded after ~18 months in
  production as of the April 2026 v2 changelog, plus the public Dune
  dashboards Virtuals points at.

## 7. Discussion
- Where ACP fits among adjacent standards (A2A for messaging, x402 for
  payments, ERC-8004 for trustless agent identity / reputation).
- Open economic and security questions: evaluator capture, escrow
  abuse, subsidy-driven volume vs. organic demand, custody and key
  management for non-custodial agent wallets.

## 8. Limitations
- Most operational figures come from Virtuals' own docs and a small
  number of partner write-ups.
- ERC-8183's standardization status is "proposed", not "final"; the
  community discussion is ongoing.
- Adoption numbers and Revenue Network claims are vendor-stated.
- No independent academic security treatment of ACP exists at the time
  of this report.

## 9. References
- Generated from `working/sources.jsonl`.
