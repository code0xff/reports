# Mastercard Agent Pay: Approach, Technical Implementation, and the Agent Pay Launch

## Abstract

In April 2025 Mastercard announced **Agent Pay**, an "agentic payments" programme that extends its existing tokenization, identity, and fraud-prevention infrastructure so that AI agents — running inside platforms like Microsoft Copilot, IBM watsonx Orchestrate, OpenAI's ChatGPT (via Stripe), and PayPal — can initiate and complete card payments on a cardholder's behalf [^s01][^s02][^s12]. The programme is built around a new credential type, the **Mastercard Agentic Token**, issued on the same network-tokenization rails as Click-to-Pay / MDES credentials but cryptographically bound to a specific registered agent, a session, a merchant, and a piece of consumer intent [^s01][^s05][^s09]. Around this token Mastercard layers a registration / verification process branded "Know Your Agent" [^s08][^s09], a developer-facing **Agent Toolkit** that exposes a Model Context Protocol (MCP) server for API discovery [^s03][^s04], an **Agent Pay Acceptance Framework** for issuers and acquirers [^s02][^s12], and contributions to a verifiable-credential standard at the FIDO Alliance Payments Technical Working Group [^s18]. As of Q3 2025 the first agentic transactions had cleared on the Mastercard network [^s17]; on 2 March 2026 Banco Santander and Mastercard executed Europe's first end-to-end live AI-agent payment under a regulated banking framework [^s11]. The result is a multi-layered, partnership-driven play that overlaps with — but is positioned differently from — Visa Intelligent Commerce, Stripe and OpenAI's Agentic Commerce Protocol (ACP), and Google's Agent Payments Protocol (AP2) [^s06][^s10][^s13][^s14][^s15]. Critical open questions remain around chargeback liability, PSD2 / SCA treatment, and how much of the announced architecture is in production versus pilot.

## Introduction

For most of the card networks' history, "checkout" has meant a human pressing a button on a merchant's surface. Agentic commerce inverts that assumption: a software agent — an LLM-driven assistant such as Microsoft Copilot, ChatGPT, or an enterprise procurement bot — discovers products, assembles a cart, and triggers payment on behalf of the user, possibly without the user being present at the moment of payment [^s01][^s13][^s14]. That has forced every major card network and PSP to publish a position in 2025: Mastercard with Agent Pay, Visa with Intelligent Commerce, Stripe and OpenAI with the Agentic Commerce Protocol, and Google with the Agent Payments Protocol [^s06][^s10][^s13][^s14][^s15].

This report focuses on Mastercard's specific approach. It traces the public announcements (April 2025 framework launch, September 2025 productisation, October 2025 PayPal expansion, March 2026 Santander live transaction), then digs into the technical primitives — Agentic Tokens, the Agent Toolkit MCP server, the Agent Pay Acceptance Framework, and the Know-Your-Agent / Payment Passkey authentication stack — and finishes by comparing Mastercard's positioning to the parallel programmes from Visa, Stripe/OpenAI, and Google, and surfacing the open questions on liability and regulatory treatment.

## Background: Agentic Commerce and the Payment Stack

Agentic commerce in the card-network sense refers to commerce where an AI agent acts as the consumer's delegate: it interprets intent, negotiates with merchants, and triggers payment, while the consumer's identity, credentials, and authorisation remain anchored at the issuer _(interpretive — definition aligned across Mastercard, Visa, Stripe, and Google)_ [^s01][^s05][^s06][^s13]. The technical centre of gravity is not a new payment instrument — it is the existing EMVCo network-token rails (MDES on Mastercard, VTS on Visa) being extended with new metadata so that the network and issuer can recognise and govern agent-initiated traffic [^s01][^s05][^s09].

By late 2025 the card networks, large PSPs, and at least one hyperscaler had each shipped a competing stack:

- **Mastercard Agent Pay** — Agentic Tokens + Agent Toolkit MCP + Agent Pay Acceptance Framework [^s01][^s02].
- **Visa Intelligent Commerce** — Visa Agent APIs and tokenised payments scoped to verified AI agents [^s10][^s13].
- **Stripe / OpenAI Agentic Commerce Protocol (ACP)** — Shared Payment Tokens (SPTs) issued by Stripe and an Apache-2.0 protocol jointly maintained with OpenAI; consumed first by ChatGPT's Instant Checkout [^s14][^s15].
- **Google Agent Payments Protocol (AP2)** — payment-agnostic protocol whose trust model is built on signed Intent, Cart, and Payment Mandates; announced 17 September 2025 with 60+ partners including Mastercard, PayPal, American Express, Coinbase, and Etsy [^s06][^s07].

These programmes overlap heavily — Mastercard appears as a partner on both Stripe's SPT integration (via "agentic network tokens" provisioned from Mastercard or Visa, [^s05]) and on Google's AP2 [^s06] — but emphasise different trust anchors: a network token (Mastercard/Visa), a PSP-issued payment primitive (Stripe), or an open mandate protocol (Google).

## Mastercard's Strategy and Announcements

### April 2025 — the framework launch

On 29 April 2025 Mastercard introduced Agent Pay, framed as the "next frontier in commerce" [^s01]. The launch named four primary partners — Microsoft (Azure OpenAI Service and Copilot Studio integration), IBM (watsonx Orchestrate for B2B use cases), Braintree, and Checkout.com (merchant-side tokenization) — and introduced "Mastercard Agentic Tokens" as a new credential type built on the same tokenization that already powers mobile contactless, secure card-on-file, and Mastercard Payment Passkeys [^s01]. Chief Product Officer Jorn Lambert was quoted: "The launch of Mastercard Agent Pay marks our initial steps in redefining commerce in the AI era, including new merchant interfaces to distinguish trusted agents from bad actors." [^s01]

### September 2025 — productisation

On 10 September 2025 Mastercard followed up with a productisation wave [^s02]:

- **Agent Toolkit** — an MCP server on Mastercard Developers, designed so that IDEs and agent frameworks (Claude, Cursor, GitHub Copilot) can discover Mastercard's APIs [^s02][^s03][^s04].
- **Agent Sign-Up** — a registration mechanism for agents seeking access to AI-enabled Mastercard products [^s02].
- **Insight Tokens** — a "secure and governed way for agents to access and apply permissioned insights from Mastercard." [^s02]
- **Agentic Consulting Services** — advisory for issuers, acquirers, merchants, and AI enablers [^s02].
- A widened partner roster: Stripe, Google, Ant International's Antom, PayOS, Citi, U.S. Bank, SAP Concur, and the FIDO Alliance Payments Working Group [^s02].

### October 2025 — PayPal

On 27 October 2025 Mastercard and PayPal announced that Agent Pay would be integrated into PayPal's wallet and that PayPal would pilot the Agent Pay Acceptance Framework with merchants and AI agents [^s12]. PayPal explicitly committed to interoperability with "common agentic protocols" — code for ACP and AP2 [^s12].

### Q3 2025 earnings — first transactions

On the 30 October 2025 earnings call, CEO Michael Miebach stated: "Our first agentic transaction took place on our network this quarter." [^s17] U.S. Bank and Citibank cardholders were enabled, with all remaining U.S. issuers planned to follow in November and a global rollout in early 2026 [^s17].

### March 2026 — Europe-first live payment with Santander

On 2 March 2026 Banco Santander and Mastercard announced the successful completion of "Europe's first live end-to-end payment executed by an artificial intelligence agent," processed inside Santander's live payment infrastructure and orchestrated using Mastercard Agent Pay together with PayOS and Microsoft Azure OpenAI Service / Copilot Studio [^s11] _(early signal — pilot in a regulated banking environment, not a commercial rollout)_.

Across these milestones the strategy is consistently multi-layered: network tokens for the credential, identity/biometrics for the human leg, merchant-side enablement for acceptance, and standards bodies (FIDO, AP2) for interoperability — rather than a single SDK [^s02][^s08][^s18].

## Technical Implementation

### Agentic Tokens

A Mastercard Agentic Token is functionally an EMVCo-style network token: the consumer's funding PAN is never released to the agent or the merchant, and the network maps the token back to the latest issued PAN at authorisation time. What is new is the metadata bound to the token: an agent identity, a session, a merchant constraint, and a representation of consumer intent and consent [^s01][^s05][^s09].

Stripe's developer documentation, which provisions agentic network tokens directly from Mastercard or Visa for its Shared Payment Token product, describes the rail-level mechanics: "agentic network tokens are network-issued, secure digital credentials that allow authorized AI agents to initiate payments on a customer's behalf without exposing underlying card details … payment networks automatically map the agentic network token to the latest FPAN when sending authorization requests to the issuers." [^s05] In other words, Agentic Tokens reuse the existing token-mapping path; the new behaviour sits in scope-and-consent metadata rather than in a new authorisation message format [^s05][^s09].

Mastercard's Chief Digital Officer, Pablo Fourez, on Checkout.com's recorded discussion: agents need to be registered through a KYC-style "Know Your Agent" process before a token can be provisioned, and user intent data (his example: "Adidas shoes, size 10, €80") accompanies the token through the transaction [^s09]. That intent payload is the link Mastercard is making to FIDO's verifiable-credential work and to Google's AP2 mandate model [^s06][^s18].

### Agent Toolkit and MCP server

Mastercard's public developer artefact is the Agent Toolkit on GitHub, published under MIT licence and distributed via npm as `@mastercard/developers-mcp` [^s03]. The toolkit is a Node 18+ TypeScript / JavaScript MCP server that exposes a fixed set of tools — `get-services-list`, `get-documentation`, `get-documentation-section-content`, `get-documentation-page`, `get-api-operation-list`, `get-api-operation-details`, plus dedicated OAuth 1.0a / 2.0 / Open Finance integration guides — and connects over stdio to Claude Desktop, Cursor, and VS Code (with explicit JSON configuration examples for each) [^s03][^s04]. Importantly, this server is a service-discovery and documentation surface; it does not itself execute payments. The payment execution path is the Agent Pay Acceptance Framework on the issuer/acquirer side [^s02][^s09].

### Agent Pay Acceptance Framework

The Acceptance Framework is the merchant- and issuer-facing side of Agent Pay. It defines (a) how agents are registered and verified, (b) how the network recognises and flags agent-initiated transactions, and (c) how issuers and acquirers process them [^s02][^s09][^s12]. PayPal's wallet integration (October 2025) is the most concrete public deployment of this framework: PayPal will "pilot the Mastercard Agent Pay Acceptance Framework and partner to co-develop and test with agents and merchants in the market" [^s12]. Mastercard has also described an "agent-aware" merchant surface where merchants expose product-attribute metadata (size, fare class, refund conditions) so that agents can make informed decisions [^s09][^s19].

### Identity, authentication, and verifiable intent

Where the agent is one principal, the cardholder is the other. Mastercard pairs Agentic Tokens with **biometric Payment Passkeys** built on FIDO authentication and aligned with EMVCo's Payment Passkeys initiative [^s08][^s09]. Pablo Fourez has framed the architecture as binding "intent and consent data to payment tokens" so that traceability and accountability are end-to-end [^s08].

The standards layer is moving with this. The FIDO Alliance announced (28 April 2026) two new technical working groups — Agentic Authentication and Payments — with Mastercard and Visa co-chairing the Payments TWG and Mastercard contributing its "Verifiable Intent" framework, designed to interoperate with Google's AP2 mandate model [^s18]. The goal is a verifiable-credential standard that attests to "key facts like amount, merchant and item category" and provides "cryptographically verifiable proof that the shopper approved the transaction" [^s18].

### Fraud, ScamGuard, and the trust stack

The agent-initiated channel needs a parallel fraud control. Mastercard has folded its existing Scam Protect / Decision Intelligence stack into the Agent Pay Acceptance Framework, with the framework "beginning by registering and verifying AI agents before they can transact on the Mastercard network" and each agent "uniquely identified and enabled to initiate transactions using agentic tokens — dynamic, cryptographically secure credentials that ensure every transaction is traceable and authenticated." [^s02] Public material is high-level; concrete model details for scoring agent-initiated traffic are not disclosed _(vendor-stated — see Uncertainties)_ [^s02][^s08].

## Ecosystem and Use Cases

- **Microsoft Copilot / Azure AI Foundry.** Mastercard's April 2025 launch named Microsoft as the lead AI partner, with integration into Azure OpenAI Service and Copilot Studio so that Copilot-built agents can transact through Mastercard rails [^s01]. The March 2026 Santander pilot was orchestrated on the same Azure OpenAI + Copilot Studio + PayOS stack [^s11].
- **IBM watsonx Orchestrate.** The same April 2025 announcement named IBM and watsonx Orchestrate as the lead B2B integration partner, with the goal of automating procurement-style flows for business users [^s01].
- **OpenAI / ChatGPT.** Mastercard's link to ChatGPT shopping is indirect: OpenAI's Instant Checkout is built on Stripe's ACP and Shared Payment Tokens, and Stripe explicitly provisions "agentic network tokens" from Mastercard or Visa as part of that flow [^s05][^s14][^s15]. So a ChatGPT-initiated purchase on a Stripe-supported merchant can ultimately settle through Mastercard's Agentic Token rails, but the contractual surface the consumer touches is ChatGPT + Stripe, not Mastercard directly [^s05][^s14] _(unverified — single source for the precise card-network path)_.
- **PayPal.** Wallet-level integration of Agent Pay, with Mastercard cards-on-file in PayPal becoming usable through agentic flows; explicit interoperability with "common agentic protocols" (ACP, AP2) is part of the partnership announcement [^s12].
- **Issuer pilots.** U.S. Bank and Citibank were the first U.S. issuers enabled; full U.S. issuer rollout was planned for November 2025 with global rollout in early 2026 [^s17].
- **Acquirer / merchant pilots.** Braintree and Checkout.com (April 2025) plus Stripe, Antom, PayOS, and SAP Concur (September 2025) sit on the acquirer/merchant side [^s01][^s02]. The Santander pilot demonstrates the issuer-side path in a regulated EU bank [^s11].

## Risk, Compliance, and Open Questions

### Liability and chargebacks

Card-network rules for agent-initiated transactions are not yet codified in public network documents [^s10]. The "trust" story Mastercard tells — Know Your Agent + biometric Payment Passkey + intent-bound tokens — is presented as the substrate on which future liability rules can be written, but the actual chargeback reason codes, dispute pathways, and merchant-vs-issuer liability shifts remain industry open questions [^s10] _(interpretive — no public network-rule text)_.

### PSD2 / SCA in Europe

In the EU and UK, PSD2 / Strong Customer Authentication requires a cardholder authentication step for most cardholder-initiated electronic payments, while Merchant-Initiated Transactions are out of scope of SCA [^s16]. Whether an agent-initiated payment is treated as cardholder-initiated (requiring SCA, possibly via a Payment Passkey step-up) or merchant-initiated (covered by a prior mandate / standing instruction) is an open question that the FIDO Payments TWG, Mastercard, and Visa are actively working on [^s16][^s18]. The European Commission's PSD3 / Payment Services Regulation proposals may redefine these boundaries [^s16].

### Counter-evidence: the adversarial side

The "trusted agent" narrative has a dissenting signal. Visa's own threat-landscape note reports a 25% increase in malicious-bot-initiated transactions over the six months ending in early 2026, rising to 40% in the United States, alongside a "more than 450% increase in dark-web community posts … mentioning 'AI Agent' over the past six months" [^s20]. That growth predates Mastercard's full Agent Pay rollout and applies pressure on the Know-Your-Agent gate: the registration step is necessary but not sufficient if attackers can compromise legitimately registered agent identities. A second open issue, distinct from fraud, is "AI mistake" liability — an agent that buys the wrong size, wrong date, or wrong refund tier — which the current chargeback framework has no clean reason code for [^s10] _(interpretive — analyst observation, not a codified rule)_.

### Competitive comparison

Mastercard's posture is distinctive on three points:

1. **The credential is a network token.** Visa is taking the same approach with Visa Intelligent Commerce, also tokenization-led [^s10][^s13]. Stripe's ACP is one layer up — Stripe issues a Shared Payment Token, then resolves to a Mastercard or Visa agentic network token underneath when relevant [^s05][^s14]. Google's AP2 is one layer up again — payment-agnostic, with the actual card-network call delegated downstream [^s06].
2. **Identity is anchored at the cardholder's bank.** Mastercard, like Visa, pushes the authentication anchor to the issuer's Payment Passkey / biometric stack [^s08][^s13]; ACP and AP2 treat the agent–merchant–network call as the substrate and leave identity to the participating wallet or PSP [^s06][^s14].
3. **Acceptance framework, not just a protocol.** Mastercard ships an Acceptance Framework that issuers and acquirers operate against, plus an MCP toolkit for developers, plus consulting [^s02][^s09][^s12]. Stripe / OpenAI ship a protocol [^s14][^s15]; Google ships a protocol [^s06]; Visa ships an API platform with similar acceptance language but less prescriptive merchant detail in public material [^s13].

The four are interoperable in intent — Mastercard sits on the AP2 contributors list [^s06] and underpins Stripe's agentic network tokens [^s05] — but their commercial centres of gravity differ.

## Limitations

This report depends heavily on Mastercard-, Visa-, Stripe-, and Google-published sources and on industry trade press. Several specifics are not publicly available and are flagged either inline as _(vendor-stated)_ / _(early signal)_ / _(unverified — single source)_ or in `working/uncertainties.md`:

- No public Mastercard network-rule text defines chargeback handling, dispute reason codes, or liability allocation for agent-initiated transactions.
- The Mastercard MCP server (Agent Toolkit) is a documentation and service-discovery interface; the actual payment-execution code paths are part of internal issuer/acquirer integrations rather than the public repo.
- Transaction volumes and adoption metrics for Agent Pay have not been publicly disclosed beyond "first agentic transaction" and the Santander Europe-first pilot.
- The Mastercard ↔ OpenAI link is operationally through Stripe's ACP + agentic network tokens; treat any "Mastercard partners with OpenAI" framing in vendor material as accurate only at the ecosystem level, not as a direct bilateral SDK.
- Standards convergence (FIDO Payments TWG, AP2, ACP, Verifiable Intent) is a stated intent at this stage rather than a shipped baseline.

These items are documented openly so that follow-up reports — especially after Q4 2025 / FY2026 disclosures — can replace early-signal claims with measured outcomes.
