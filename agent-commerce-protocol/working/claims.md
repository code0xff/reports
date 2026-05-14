# Claims — Agent Commerce Protocol (ACP)

## Introduction
- [ ] c01: ACP is Virtuals Protocol's open standard that lets
  autonomous AI agents coordinate, transact, and operate as composable
  on-chain businesses.
  - kind: factual
  - needs: Virtuals whitepaper + an independent industry write-up.
- [ ] c02: ACP entered public beta in mid-2025 and is positioned as the
  commerce backbone of the Virtuals agent ecosystem.
  - kind: factual
  - needs: RockawayX / Backpack / DataWallet article and the protocol's
    own docs.
- [ ] c03: ACP enforces three-party escrow with a separate evaluator
  agent, not just a two-party payment handshake — which distinguishes
  it from purely HTTP-layer payment protocols like x402 or messaging
  standards like A2A.
  - kind: interpretive
  - needs: ACP docs side-by-side with x402 and A2A descriptions.

## Protocol design — the four phases
- [ ] c04: ACP defines a four-phase interaction: Request, Negotiation,
  Transaction, and Evaluation, with the negotiated terms signed as a
  Proof of Agreement before any funds move.
  - kind: technical
  - needs: Virtuals whitepaper canonical phase definitions.
- [ ] c05: Both payment and deliverables are held in escrow during the
  Transaction phase and only released when the Evaluator attests that
  the work matches the agreed terms.
  - kind: technical
  - needs: whitepaper + glossary.
- [ ] c06: ACP v2 renames the actor roles from `buyer / seller /
  evaluator` to `client / provider / evaluator`, while keeping the
  Evaluator's third-party verification role.
  - kind: factual
  - needs: ACP changelog.

## Reference implementation
- [ ] c07: ACP v2 ships two core smart contracts on Base Mainnet — ACP
  Core at `0x238E541BfefD82238730D00a2208E5497F1832E0` and
  FundTransferHook at `0x90717828D78731313CB350D6a58b0f91668Ea702`.
  - kind: technical
  - needs: changelog contract listing; ideally a block-explorer
    confirmation.
- [ ] c08: ACP standardizes USDC as the payment token for its current
  Butler-mediated flows.
  - kind: technical
  - needs: Butler / whitepaper quote.
- [ ] c09: ACP v1 was memo-based, while v2 replaces the Memo primitive
  with hook contracts attached at job creation and conforms to the
  proposed ERC-8183 standard.
  - kind: technical
  - needs: ACP changelog and ERC-8183 thread.
- [ ] c10: ACP ships open-source Node.js (`@virtuals-protocol/acp-node`
  / `acp-node-v2`), Python (`virtuals-acp`), and CLI (`acp-cli`)
  implementations.
  - kind: factual
  - needs: GitHub READMEs.
- [ ] c11: ACP can route payments through x402; the Python SDK exposes
  a `BASE_MAINNET_ACP_X402_CONFIG_V2` configuration that combines ACP
  jobs with x402-style HTTP payments.
  - kind: technical
  - needs: Python SDK README.

## Real-service implementations
- [ ] c12: Butler is the user-facing ACP onboarding agent that
  discovers provider agents, routes tasks, and handles escrow and
  permissions on behalf of the user, and now ships inside the Base App.
  - kind: factual
  - needs: RockawayX article + Butler doc index.
- [ ] c13: A growing set of independent Virtuals-launched agents —
  including AIXBT (KOL monitoring), Luna ($LUNA pop-star agent), and
  agents built on the GAME framework — plug into ACP through the
  Service Registry.
  - kind: factual
  - needs: Backpack / Gate Learn / OpenAIToolsHub write-ups.
- [ ] c14: Virtuals positions two umbrella "clusters" — the Autonomous
  Media House and the Autonomous Hedge Fund — as flagship multi-agent
  workflows that compose specialized agents through ACP.
  - kind: factual
  - needs: industry article describing both clusters.
- [ ] c15: At Consensus Hong Kong in February 2026 Virtuals launched
  the Virtuals Revenue Network, distributing up to roughly $1 million
  per month to agents transacting through ACP.
  - kind: factual
  - needs: industry coverage of the announcement.

## Standardization and adoption
- [ ] c16: ERC-8183 ("Agentic Commerce") was opened for community
  discussion by davidecrapis.eth on March 4, 2026 and specifies a
  job-based escrow with client / provider / evaluator roles.
  - kind: technical
  - needs: ethereum-magicians.org thread.
- [ ] c17: As of the April 2026 v2 changelog, Virtuals reports that ACP
  has been "in production" for ~18 months and onboarded more than 2,000
  agents.
  - kind: factual
  - needs: changelog page.
- [ ] c18: Virtuals publishes live ACP metrics on Dune dashboards
  (e.g., the `hashed_official/acp-virtuals` dashboard) and on the
  protocol-metrics page of its whitepaper.
  - kind: factual
  - needs: Dune dashboard URL + whitepaper metrics page.

## Discussion
- [ ] c19: Compared with x402 (HTTP-payment handshake) and the A2A
  protocol (agent-to-agent messaging), ACP specifies the contract
  envelope around an entire job — pre-funded escrow, third-party
  attestation, and on-chain dispute resolution — rather than just the
  payment leg.
  - kind: interpretive
  - needs: x402 docs + A2A docs + ACP docs.
- [ ] c20: ACP centralizes trust on the Evaluator agent, creating an
  "evaluation market" but also a new attack surface (evaluator capture,
  collusion with the Provider, biased rubrics).
  - kind: interpretive
  - needs: Virtuals whitepaper acknowledgement of evaluator role +
    independent commentary.

## Limitations
- [ ] c21: Most operational figures (agents onboarded, jobs processed,
  Revenue Network distribution) are vendor-stated and have not yet been
  independently audited.
  - kind: interpretive
  - needs: an explicit note in the report's Limitations section.
