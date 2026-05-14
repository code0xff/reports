# Agent Commerce Protocol (ACP)

## Abstract

The Agent Commerce Protocol (ACP) is Virtuals Protocol's open standard
for autonomous AI-agent commerce: a four-phase interaction model —
Request, Negotiation, Transaction, Evaluation — backed by smart-contract
escrow on Base Mainnet, a cryptographically signed Proof of Agreement,
and a third-party Evaluator agent that attests whether deliverables
match the agreed terms.[^s01][^s08] The protocol shipped a public beta
in mid-2025, ported its memo-based v1 to a hook-based, ERC-8183-compliant
v2 in April 2026 (ACP Core at
`0x238E541BfefD82238730D00a2208E5497F1832E0` on Base Mainnet), and is
the commerce layer underneath user-facing agents such as Butler, AIXBT,
Luna, and the GAME framework.[^s02][^s06][^s07] The Virtuals team
reports more than 2,000 onboarded agents after roughly eighteen months
of production usage, runs an explicit subsidy programme (the Virtuals
Revenue Network) for ACP-routed jobs, and now integrates with x402 as
an HTTP payment rail via the Python SDK's
`BASE_MAINNET_ACP_X402_CONFIG_V2` configuration.[^s02][^s05][^s09]

## 1. Introduction

The first wave of agentic web infrastructure has split along two
axes — A2A focused on cross-framework agent messaging,[^s14] x402 on
HTTP-native per-request payments[^s13] — but neither standard specifies
the contract envelope that wraps a multi-step job: who funds the
escrow, who attests completion, what happens when a deliverable is
disputed. ACP is Virtuals Protocol's answer to that gap: it treats
each agent-to-agent interaction as a jobgoverned by three roles
(Client, Provider, Evaluator) with funds and deliverables held in
escrow until the Evaluator attests against a cryptographically signed
Proof of Agreement.[^s01][^s06][^s08] The result is closer in spirit
to Stripe's marketplace escrow or a freelance platform's milestone
mechanism than to a payment-only protocol — but with on-chain
settlement and a smart-contract-mediated dispute path. This report
walks through the ACP design, the v1 → v2 implementation shift, and
how production services use it today.

## 2. Background: from agent launchpad to commerce backbone

Virtuals Protocol began as an AI-agent launchpad — its $VIRTUAL token
launched in mid-2024 and the protocol added a service registry and the
Butler agent during 2025 before opening ACP to public beta on a "July
3" launch covered by independent venture write-ups in mid-2025.[^s07]
The framing has shifted over the following twelve months from a
launchpad for tokenized agents toward a *coordination* layer:
independent industry coverage describes ACP as "the commercial
backbone of Virtuals, providing a standardized framework for AI agents
to transact with each other and with humans using smart contract-based
escrow."[^s08] The protocol now sits across multiple chains —
RockawayX and DataWallet describe live deployments on Ethereum,
Solana, Ronin, Arbitrum, and the XRP Ledger, with planned BNB Chain
and X-Layer expansions — although the v2 contracts themselves still
treat Base Mainnet as the primary settlement chain.[^s02][^s09]

## 3. Protocol design — the four phases

ACP defines a structured four-phase interaction model.[^s01] In the
*Request* phase, agents establish initial contact and check basic
compatibility for a transaction. In the *Negotiation* phase, agents
agree on specific terms which are then cryptographically signed to
create a Proof of Agreement (PoA). In the *Transaction* phase, both
payment and deliverables are held in escrow while the work is
performed. In the *Evaluation* phase, a third-party Evaluator agent
assesses the work against the signed terms; only on a positive
attestation does the escrow release funds to the Provider.[^s01]

Three properties of this design are worth pulling out. First, the PoA
turns the negotiated job description into a tamper-evident artefact
that the Evaluator (and a later dispute) can refer back to, rather
than letting either party redefine the brief after work has started.
Second, the Evaluator role is *first-class*: ACP explicitly carves out
a market for "specialized agents that can assess whether transactions
meet their agreed terms,"[^s01] which both makes the verification
step pluggable and creates a new attack surface (evaluator capture,
collusion with the Provider). Third, ACP v2 renames the actor roles
from `buyer / seller / evaluator` to `client / provider / evaluator`,
and treats subscription jobs and fund-transfer jobs as first-class
primitives rather than memo conventions.[^s02]

## 4. Reference implementation

### 4.1 Smart contracts

ACP v2 on Base Mainnet ships two core contracts: the **ACP Core**
contract at `0x238E541BfefD82238730D00a2208E5497F1832E0`, which
encodes the job lifecycle and escrow, and a **FundTransferHook**
at `0x90717828D78731313CB350D6a58b0f91668Ea702` that extends the
lifecycle for fund-transfer jobs.[^s02] _(unverified — single source)_
The architectural change relative to v1 is the move from a
memo-based primitive to a hook-based design: "Job lifecycle is now
extended via hook contracts attached at job creation," which is the
mechanism the protocol uses to attach reputation, gating, and
fund-transfer logic without forking the core escrow contract.[^s02]
v2 also supports Base Sepolia (chain id 84532) and BSC Testnet, with
the team describing it as the first iteration to support truly
multi-chain agent commerce.[^s02]

### 4.2 Off-chain SDKs and Butler

ACP ships open-source SDKs the Virtuals team treats as canonical:
`@virtuals-protocol/acp-node-v2` (Node.js, the v1 package
`@virtuals-protocol/acp-node` continues to support fixed-price
jobs)[^s02][^s04] and `virtuals-acp` for Python[^s05], plus an
`acp-cli` command-line tool that stores authentication tokens in the
OS keychain. The Node SDK exposes the protocol through an
`AcpClient` / `AcpAgent.create()` entry point with `onNewTask` and
`onEvaluate` callbacks; the Python SDK mirrors the same shape and
exports a `BASE_MAINNET_ACP_X402_CONFIG_V2` configuration that
combines ACP's escrow lifecycle with x402's HTTP payment
handshake.[^s04][^s05][^s13] Agents must register at the Service
Registry before peers can discover them, and the SDK defaults to
non-custodial wallet adapters (Privy and Solana adapters are shipped
in v2).[^s02][^s04]

Butler is the user-facing agent that opens jobs through ACP on a
human's behalf: it "discovers available provider agents, routes
tasks…and handles job setup, permissions, and on-chain payment
settlement," and now ships inside the Coinbase Base App as a Pro
Mode "plan-first workflow that enables structured research,
reviewable execution plans, and autonomous task execution for
complex ACP workflows."[^s03][^s07] Butler's payment surface is
deliberately narrow — the onboarding docs note that "Currently Butler
is standardized on USDC for stability and simplicity," which makes
USDC the canonical unit-of-account for ACP-mediated jobs today.[^s01]

### 4.3 v1 → v2 architectural shift

The April 2026 changelog enumerates five concrete differences between
v1 and v2: memo-based → hook-based architecture, single-chain →
multi-chain support, buyer/seller naming → client/provider naming,
single job model → first-class subscription and fund-transfer jobs,
and custodial → non-custodial agent wallets.[^s02] The v1 SDK is
*not* deprecated immediately — the changelog explicitly notes that v1
"continues supporting fixed-price jobs," but percentage-based pricing
for fund-managed jobs requires v2 — so the production fleet is
expected to run a mix of v1 and v2 contracts for some
time.[^s02]

## 5. Real-service implementations

### 5.1 Butler and the Base App

For end-users, the most visible ACP front-door is Butler. RockawayX's
public-beta write-up describes Butler as "an agent that helps users
discover and delegate work across a growing network of AI-powered
provider agents, routing tasks to the appropriate agents and handling
job setup and permissions through ACP."[^s07] The Butler Pro Mode
release (January 2026) introduced a plan-first workflow with
cost-estimation and reviewable execution plans before any escrow is
funded, and the integration into the Coinbase Base App was shipped
between Q1 and Q2 2026 according to the ACP changelog.[^s02][^s03]

### 5.2 Specialised agents

Independent industry coverage names AIXBT, Luna, and the GAME
framework as headline ACP-connected agents:

- **AIXBT** is a market-signals agent that "watches over 400 crypto
  influencers in real time and hit a high market cap of $500
  million," using ACP to discover counter-parties and price
  signal subscriptions.[^s11] _(market-cap figure is an adjacent
  scale metric, not ACP-specific volume)_
- **Luna** ($LUNA) is "the premier AI agent powered by Virtuals
  Protocol," operating as a livestream / pop-star agent that opens
  fan-engagement and tipping flows through ACP.[^s10]
- **GAME** (Generative Autonomous Multimodal Entities) is Virtuals'
  modular planner / executor framework: a High-Level Planner assigns
  goals while a Low-Level Planner runs executable actions, and the
  resulting agents register as ACP providers.[^s11][^s09]

### 5.3 Clusters and the Revenue Network

Beyond individual agents, Virtuals positions two umbrella *clusters*
as flagship ACP deployments: the **Autonomous Media House** (an
agent-operated creative agency) and the **Autonomous Hedge Fund** (a
multi-agent asset-management cluster).[^s09] To bootstrap demand, the
**Virtuals Revenue Network** launched at Consensus Hong Kong in
February 2026 and distributes "up to $1 million per month to agents
selling services through ACP" — an explicit subsidy targeted at
ACP-routed throughput rather than launchpad token mechanics.[^s09]
_(vendor-stated; the precise per-agent vs aggregate split is not
documented in the sources we can read)_

## 6. Standardization and adoption

### 6.1 ERC-8183

ACP v2 conforms to the proposed **ERC-8183 ("Agentic Commerce")**
standard, opened for community discussion on Ethereum Magicians on
March 4, 2026 by `davidecrapis.eth`.[^s06] The proposal specifies
"job-based escrow where a client funds a job, a provider submits work,
and a single evaluator attests completion or rejection," with hooks
(`IACPHook`, `beforeAction`) for reputation and gasless flows.[^s06]
The thread does not declare a formal Draft/Review/Final status, so we
treat the standard as an open community draft rather than a settled
EIP. ERC-8183 is a sibling to **ERC-8004 ("Trustless Agents")**, an
on-chain agent identity / reputation registry whose specification
explicitly notes that "payments are orthogonal to this protocol and
not covered here";[^s15] ACP positions itself as the payment / escrow
layer that complements ERC-8004's identity layer.

### 6.2 Adoption

The clearest public adoption number comes from the v2 changelog,
which reports that ACP has been in production for roughly eighteen
months and onboarded "over 2,000 agents."[^s02] _(vendor-stated; not
independently audited)_ Virtuals publishes a live ACP dashboard on
Dune (the `hashed_official/acp-virtuals` workspace) and a
protocol-metrics page in its whitepaper that tracks total jobs, total
aGDP (agentic GDP — total value an agent processes, including service
fees and trading volume), and total unique active wallets.[^s01]
[^s12] _(the dashboard renders client-side and could not be scraped
through WebFetch; we cite it as the live source rather than freezing
a stale number.)_

## 7. Discussion

ACP, x402, A2A, and ERC-8004 fit together more cleanly than the
overlapping names suggest. **A2A** standardizes the messaging surface
between agent runtimes;[^s14] **x402** standardizes the *payment*
surface on top of HTTP 402;[^s13] **ERC-8004** standardizes
*identity / reputation* on-chain;[^s15] **ACP** standardizes the
*job envelope* — escrow, Proof of Agreement, third-party evaluation —
that wraps a multi-step transaction. The ACP × x402 configuration
exported by the Python SDK is the explicit composition: ACP supplies
the contract envelope and Evaluator, x402 supplies the per-request
HTTP payment rail.[^s05][^s13]

That layering also exposes ACP's largest open question: the Evaluator.
Routing trust to a third-party agent makes verification pluggable and
creates a new market — but it also concentrates the failure mode
("evaluator capture", collusion with the Provider, biased rubrics)
that ACP's whitepaper acknowledges by carving out the role
explicitly.[^s01] The ERC-8183 thread proposes hooks for reputation
integration, which is the most natural defensive direction —
binding Evaluator selection to ERC-8004-style identity and reputation
rather than to whichever agent the Client picked at job creation.
Whether the Revenue Network subsidies (c.$1M/month) drive durable
demand once the subsidy ends is the parallel economic question and
likely the cleanest measure of whether ACP graduates from "Virtuals'
internal coordination layer" to "neutral standard the wider ecosystem
adopts."[^s09]

## 8. Limitations

Three caveats bound the strength of this report.

First, almost all quantitative claims (2,000+ agents, $1M/month
Revenue Network, the ACP × x402 integration) come from Virtuals'
own docs, partner write-ups, or a Dune dashboard whose live numbers
we could not extract in this sweep; the report cites the dashboard
as the live source of truth rather than freezing a stale snapshot.

Second, the public-beta launch is described as "July 3" in
independent coverage with the year ambiguous between 2025 and 2026
in the WebFetch summary; we say "mid-2025" because subsequent
documented v1 features predate March 2026, but acknowledge the
imprecision.

Third, ERC-8183 is an open community draft on Ethereum Magicians,
not a Final EIP, so the standard could change materially before any
"Final" listing; v2's claim of compliance should be read against
that moving target. No independent academic security analysis of
ACP — comparable to recent work on x402 — exists at the time of
writing, so attack-surface claims are largely the protocol's own
acknowledgement of the Evaluator-trust pattern and our reading of
adjacent standards rather than an empirical audit.
