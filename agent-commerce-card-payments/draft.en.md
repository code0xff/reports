## Abstract

In roughly fourteen months — from Mastercard Agent Pay in April 2025 to Agent Pay for Machines in June 2026 — at least seven distinct protocols and programmes appeared for running AI-agent purchases over card rails[^s30][^s17]. This report does not treat them as a single competitive list. It decomposes them into four layers: **identification, delegation, checkout, and settlement**. Visa's Trusted Agent Protocol defines how a merchant recognises an agent, not how a payment is authorised[^s01]; Google's AP2 defines the signed evidence of what a user delegated[^s05]; ACP (OpenAI/Stripe) and UCP (Google/Shopify) are checkout API specifications[^s03][^s14]; and the card networks' token programmes move the money underneath[^s30]. More than one of these can participate in a single transaction, and Visa Intelligent Commerce Connect is explicitly designed as an on-ramp that accepts four of them at once[^s07].

The most underrated fact in this landscape is that **the rules have already been written.** The public Visa Core Rules dated 18 April 2026 add §4.1.24 Agentic Platform Requirements, defining `Agentic Transaction` as a formal transaction type and creating two registered roles, `Agentic Payment Provider` and `Agentic Payment Enabler`, with a pre-transaction requirement to "obtain Cardholder acknowledgement that they are responsible for actions taken by the Agentic Payment Provider"[^s38]. Liability is therefore not a blank slate: the default sits with the cardholder[^s41][^s42], and the contested zone is what happens when that default meets an agent's error.

The operational picture is considerably colder than the specification documents. ChatGPT Instant Checkout, launched September 2025, was discontinued in March 2026 in favour of retailer-run apps[^s08]; in Walmart's pilot, conversion for in-chat direct checkout ran three times lower than redirecting to the merchant's own site[^s11]. Over the same period Shopify reported AI-driven traffic up 8x and orders from AI-powered search up nearly 13x[^s34], and Google rolled UCP checkout into U.S. Search and Gemini alongside a Universal Cart launch[^s40]. These are not contradictory: **"AI is changing discovery" and "AI owns the in-chat checkout" are moving at different speeds.** For a merchant running its own commerce stack, the real cost is not the payment integration but real-time product data hygiene, and implementation plus conformance testing is measured in months, not weeks[^s32]. For merchants on a platform, Shopify's Agentic Storefronts opens the channel with no integration work at all[^s39] — onboarding cost is decided by which stack you are on, not by which protocol you pick.

## Introduction — Problem Statement and Scope

### The two terms are not the same thing

The industry uses "agentic commerce" and "agent payments" interchangeably, but the actual specifications sit at different layers. ACP describes itself as "an open standard ... that defines how AI agents interact with businesses to complete purchases on behalf of buyers," with building blocks of Agentic Checkout, Cart and Feed, Delegate Payment, Delegate Authentication, and Orders and Webhooks[^s03] — a specification of the **commerce flow**. AP2, by contrast, is a specification of **authorisation**: the cryptographic expression of what a user delegated[^s05]. Mastercard Agentic Tokens and Visa Intelligent Commerce solve the **settlement** problem of putting that authorisation onto network token infrastructure[^s30]. UCP sits across both, adopting an architecture that separates what consumers pay with (instruments) from payment handlers, and providing "secure agentic payments support" through AP2 compatibility[^s14].

This distinction matters operationally because when a merchant says it "supports agentic commerce," what has actually been built differs entirely by layer. Exposing a product feed, verifying a signed mandate, and authorising through an agent-scoped token are three separate pieces of work.

### Scope

This report covers protocols running over card network rails (Visa, Mastercard, American Express) and the PSP and platform services implementing them. On-chain and HTTP-native payment schemes such as x402 appear only as a design contrast. Everything is a snapshot as of 3 August 2026, and product strategy in this space moves far faster than the specifications — OpenAI reversing its checkout strategy within six months is the evidence[^s08].

## Card Rails vs. the Agent Buyer: Structural Conflict

### Where the CIT/MIT dichotomy breaks

Card rules split transactions two ways. Per Visa Acceptance Solutions, "an MIT is any transaction initiated by a merchant as a follow-on to an initial Cardholder-Initiated Transaction (CIT)," and the stored credential framework exists to identify "the initial storage and subsequent use of payment credentials by merchants"[^s27]. Compliance with that framework is expected to yield higher authorisation approval rates for credential-on-file transactions[^s27].

An agent transaction is neither. The user authenticated at delegation time but is not present at payment time, and the merchant did not initiate it either. At the protocol layer, each programme fills the gap with additional signals. Visa TAP introduces two values for the HTTP signature `tag` field — `agent-browser-auth` for browsing and `agent-payer-auth` for a payment attempt[^s01] — while American Express makes Agent Registration, which issues an agent an ID, a distinct component[^s28].

### The rules have already been written

At the rule layer, the networks went further. The public Visa Core Rules dated 18 April 2026 add §4.1.24 Agentic Platform Requirements and **define `Agentic Transaction` as a formal transaction type**: "An Electronic Commerce Transaction that is undertaken by an Agentic Payment Provider on behalf of a Cardholder, using a Payment Credential, that is both ... based on the Cardholder-defined payment instruction(s) [and] completed ... without direct interaction between the Cardholder and Merchant"[^s38]. Two registered roles were created — `Agentic Payment Provider` (the provider of an application that searches, discovers and purchases on the cardholder's behalf and stores and transmits a Token) and `Agentic Payment Enabler` (the entity connecting that provider to Visa's network) — and both must enrol in the Visa Intelligent Commerce programme and register with Visa[^s38].

The pre-transaction requirements are specific. Section 4.1.24.3 requires an Agentic Payment Provider to obtain cardholder consent, state the expiration date of the payment instruction, **"obtain Cardholder acknowledgement that they are responsible for actions taken by the Agentic Payment Provider,"** and verify the cardholder's identity in accordance with the Visa Intelligent Commerce specifications[^s38]. Section 4.1.24.2 prohibits undertaking an Agentic Transaction in a card-present environment and prohibits aggregating multiple Agentic Transactions into a single transaction[^s38]. The networks did not merely add signals — they **created a transaction type and participant roles in the rulebook.** This returns below in the liability discussion.

### Bot defence comes first

Before an agent can pay, it has to be able to reach the merchant's site at all. Merchant responses diverge here: in a survey of 500 fraud, risk and security leaders, 48% allow agentic traffic by default with after-the-fact monitoring, 31% block by default, and 20% decide case by case[^s31]. Either way the site must first judge whether a request is a legitimate agent, which is why the first concern of the card-network protocols is **identification**, not payment. The TAP specification explicitly scopes itself to two interactions: browsing, where the agent determines product and inventory information, and payment, where it supplies what is needed to purchase[^s01]. Technically it sits on RFC 9421 HTTP Message Signatures, carrying `created`/`expires` (maximum eight-minute validity), `keyid`, `nonce` and `alg`, so that "servers are able to reject reused or expired signatures, thereby preventing replay attacks"[^s01].

This shares a root with Cloudflare's Web Bot Auth, where the infrastructure or remote browsing platform an agent uses signs its HTTP requests and Cloudflare validates the signatures[^s13]. In October 2025 Cloudflare published a signature-agent card registry format extending the RFC 7517 JWKS specification with operator names, contact methods, expected crawl rates and other metadata, using Ed25519 key pairs[^s36].

The problem is that almost nobody is verifying. DataDome's analysis of 7.9 billion AI agent requests in January–February 2026 found that "80% of AI agents do not properly identify themselves, and 80% of sites do not verify agent identity"[^s33]. The same study recorded 16.4M requests spoofing Meta-ExternalAgent and 7.9M spoofing ChatGPT-User, while PerplexityBot showed the highest impersonation rate at roughly 2.4% of requests[^s33]. _(security-vendor measurement — no independent verification)_ A signature-based identification layer that exists on paper but is not adopted leaves only the incentive to impersonate.

### Regulation does not resolve it

Agent payments get no special carve-out in the EU. Per Osborne Clarke's analysis, "agentic payments remain subject to PSD2 and the RTS requirements concerning Strong Customer Authentication (SCA)," and the core questions are functional — "who, within a given scheme, is in fact providing a payment service; who holds or controls the customer's funds ... what constitutes valid authorisation and meets the SCA requirements"[^s18]. The same analysis expects that "disputes will increasingly focus on whether the user authorised all elements of the transaction (the specific payee, amount and timing)"[^s18]. Regulation has not yet answered; the audit trails these protocols are building are effectively the candidate answer.

## Protocol Landscape and Technical Mechanisms

### By layer

| Layer | Specification | What it defines | Public spec |
|---|---|---|---|
| Identification | Visa TAP[^s01], Cloudflare Web Bot Auth[^s13] | How a merchant recognises and verifies an agent | Yes (RFC 9421-based) |
| Delegation | Google AP2[^s05], Mastercard Verifiable Intent[^s06] | Cryptographic evidence of what the user authorised | AP2: yes |
| Checkout | ACP[^s03][^s21], UCP[^s14][^s15] | Cart, inventory, order and refund APIs | Yes |
| Settlement | Mastercard Agentic Token[^s30], Visa Intelligent Commerce[^s25], Amex ACE[^s28] | Authorisation and settlement via network tokens | Mostly closed |
| On-ramp | Visa Intelligent Commerce Connect[^s07] | Accepting the above through one integration | Pilot |
| Rules | Visa Core Rules §4.1.24[^s38] | Transaction type, participant roles, pre-transaction consent | Public (18 Apr 2026) |

### AP2 — splitting delegation into two credentials

AP2 v0.2 splits delegation into a **Checkout Mandate** (shared with merchants) and a **Payment Mandate** (shared with credential providers, networks and payment processors). Each has an open stage capturing constraints — budget, allowed instruments, goals — and a closed stage authorising a specific transaction amount bound to the checkout[^s05]. These are Verifiable Digital Credentials: "tamper-evident, cryptographically signed digital objects that serve as the building blocks of a transaction," forming a chained, non-repudiable audit trail[^s05].

Worth noting: the widely cited "Intent Mandate / Cart Mandate" naming from early coverage has been superseded by the Checkout/Payment Mandate structure in v0.2[^s05]. Secondary material written at the 2025 announcement no longer matches the current specification.

Governance also changed. On 28 April 2026 Google announced it was "donating the Agent Payments Protocol (AP2) to the FIDO Alliance," and in the same post said Verifiable Intent — an AP2-compatible standard co-developed with Mastercard that "creates a tamper-proof log of user-authorized agent actions to ensure accountability" — was also being donated to FIDO[^s06]. The reference implementation is Apache 2.0 with 3.1k stars and 54 commits, but the samples are a human-present card payment flow depending on ADK and Gemini 3.1 Flash Lite Preview, and PyPI publication is still planned rather than shipped[^s22].

### Visa TAP — identity, not payment

TAP deliberately avoids payment authorisation. The specification describes credential transmission and verification, not authorisation rules or settlement mechanisms, and places upstream agent discovery and registration out of scope[^s01]. It also states that while "agents could have bi-lateral agreements with Merchants and interact through authenticated, secure interfaces, this protocol is applicable to the scenario when the Agent is initially unknown to the Merchant"[^s01] — positioning itself as a **first-contact trust bootstrap**.

What the merchant receives, alongside signature verification, is a Consumer Recognition Object (a JWT `idToken`, contextual location/device data, and a matching nonce) and a Payment Container (a payment credential hash, card metadata, or an encrypted payload depending on checkout method)[^s01]. The reference implementation is on GitHub under MIT with five modules — TAP Agent, Merchant Frontend, Merchant Backend, CDN Proxy, Agent Registry — but it is a six-commit demonstration ecosystem[^s02].

### ACP — a checkout API plus scoped tokens

ACP is not a card network protocol. Built by Stripe and OpenAI with Meta participating, it is published under Apache 2.0 and states that "Stripe is the first compatible PSP with its Shared Payment Token" and "OpenAI is the first AI platform to implement ACP with ChatGPT"[^s03][^s04]. Payment goes two ways: a Shared Payment Token is a scoped credential Stripe manages, while Delegate Payment hands the merchant a vault token usable with its existing PSP under Allowance constraints — amount, currency, checkout session, expiry[^s03].

The specification repository uses date-based versioning with 2026-04-17 as the latest stable release and is still marked **Beta**. Apache 2.0, 1.5k stars, 78 open issues, 46 open pull requests; OpenAI and Stripe are founding stewards with a stated path toward "broader community governance and future neutral foundation stewardship"[^s21]. The changelog records breaking changes going back to 2025-09-29 — something any integration plan must account for[^s21].

### UCP — data standardisation first

UCP is led by Google and Shopify and was announced on 11 January 2026. Architecturally it "models a unique payments architecture, separating what consumers use to pay (instruments) from payment handlers (payment processors)," with merchants publishing capabilities at a `/.well-known/ucp` discovery endpoint and implementing checkout over REST or MCP bindings[^s14]. Its core promise: "With UCP, you own your business logic, and you remain the Merchant of Record"[^s14].

The merchant-facing requirements are more concrete. Per Google Merchant Center, the feature applies only to products eligible in the United States, Canada and Australia and to participating merchants and partners; only listings carrying the `native_commerce(checkout_eligibility)` attribute show the buy button; the merchant remains seller of record; and payment uses standard FPANs stored in the user's Google Wallet[^s15]. It is an early access programme[^s15].

That stage is expanding rather than stalled. On 19 May 2026 Google announced Universal Cart, with UCP checkout rolling out across U.S. Search and the Gemini app in summer 2026, Canada and Australia following and the U.K. later, plus YouTube checkout and hotel booking and local food delivery verticals. Initial merchant partners named include Nike, Sephora, Target, Ulta Beauty, Walmart, Wayfair, and Shopify merchants such as Fenty and Steve Madden[^s40].

### Mastercard and Amex — network-side tokens and guarantees

Mastercard Agent Pay was announced on 29 April 2025. Agentic Tokens are described as building "upon proven tokenization capabilities that today power global commerce solutions like mobile contactless payments, secure card-on-file, and Mastercard Payment Passkeys, as well as programmable payments like recurring expenses and subscriptions"[^s30]. On consumer protection the release says only that "consumers will have complete control over what the agent is allowed to purchase on their behalf" and that the programme includes "a process to help clarify agentic transactions that may be unfamiliar or unrecognized"[^s30]. No field-level public specification for the Agentic Token was found, which distinguishes it from TAP, ACP and AP2 _(no public developer spec)_.

On 10 June 2026 Mastercard announced Agent Pay for Machines (AP4M), targeting high-frequency, low-value transactions that are "continuous, embedded, permissioned and executed at machine speed," using Verifiable Intent for credentialing and supporting multi-rail settlement across cards, accounts and stablecoins[^s17]. More than thirty launch partners were named, including Adyen, Ant International, BVNK, Checkout.com, Cloudflare, Coinbase, Global Payments, OKX, Stripe and Tempo[^s17]. _(vendor-stated — no independent performance verification)_

American Express published the ACE (Agentic Commerce Experiences) developer kit on 14 April 2026, comprising five services: Identify (Agent Registration), Activate (Account Enablement), Contextualize (Intent Intelligence), Fulfill (Payment Credentials), and Enhance (Cart Context). Only Account Enablement, Intent Intelligence and Payment Credentials specifications were available at publication; Agent Registration and Cart Context remain under development[^s28]. Its Agent Purchase Protection, discussed below, is the programme's most significant differentiator.

### These are a stack, not substitutes

Visa Intelligent Commerce Connect (8 April 2026) makes this explicit. Visa describes it as "a network, protocol, and token vault-agnostic 'on ramp' to agentic commerce," supporting TAP, the Machine Payments Protocol (MPP), ACP and UCP, and handling non-Visa card networks subject to availability[^s07]. It is in pilot with Aldar, AWS, Diddo, Highnote, Mesh, Payabli and Sumvin, with expansion planned across 2026[^s07]. Adyen took the same position with Adyen Agentic on 16 June 2026, supporting UCP, AP2, ACP and Meta's AI checkout, in limited availability for U.S. enterprise merchants[^s24].

### Contrast: x402 and the finality question

The fundamental difference between card rails and on-chain payments is **reversibility**. Cards are designed around disputes and pull-backs — as Checkout.com puts it, "chargebacks were built for a world where the buyer clicked pay"[^s26]. Visa's rulebook keeps that premise: it defines Agentic Transaction as a sub-type of electronic commerce transaction and extends the compelling-evidence provisions rather than creating a separate dispute track[^s38]. x402 sits at the other end — it describes itself as "an open, neutral standard for internet-native payments" built on stablecoin settlement, and its public material documents no dispute or refund mechanism[^s37]. The scale differs in kind too: CoinDesk reports x402 processed roughly 75 million transactions totalling $24 million over a recent 30-day window, mostly sub-dollar payments, with Visa, Mastercard and Ripple joining the standard[^s29]. Machine-to-machine micropayments averaging about $0.32 do not work economically on card rails; conversely, retail purchases requiring consumer protection are hard to put on a rail with no dispute path. The likely outcome is division of labour rather than competition _(interpretive)_.

## Services and Implementation Status

### PSPs and platforms

Stripe announced its Agentic Commerce Suite on 11 December 2025 — a low-code solution letting businesses sell across multiple AI agents through one integration, handling Shared Payment Tokens that "let AI agents securely pass a buyer's payment credentials to businesses." Named retailers include Coach, Kate Spade, URBN (Anthropologie, Free People, Urban Outfitters), Revolve, Ashley Furniture, Halara, ABT Electronics and Nectar, with platforms including Squarespace, Wix, Etsy, WooCommerce, commercetools and BigCommerce[^s20]. At the level of public documentation, Stripe is currently furthest along on end-to-end integration guidance[^s03].

Adyen Agentic comprises Agentic Feed (real-time catalogue, pricing, availability), Agentic Cart (checkout, tax, fulfilment, order orchestration) and Agentic Payments (authentication, token portability, risk management), and emphasises merchant-of-record preservation[^s24]. Amex ACE, as noted, still has two of five components in development[^s28]. **Announcing support and shipping production integration documentation are entirely different stages**, and as of August 2026 few have reached the latter.

### The agent side — and the first failure

ChatGPT Instant Checkout launched in September 2025 for single-item purchases from U.S. Etsy sellers, with Shopify merchants promised next[^s08]. In March 2026 OpenAI discontinued native in-chat checkout in favour of retailer-run apps inside ChatGPT; purchases now complete on the merchant's own site, either in an in-app browser or a separate tab[^s08]. Retailers cited the need for greater checkout control and earlier access to customer data, and Walmart's Daniel Danker described the original approach as "a very temporary moment in time"[^s08]. Forrester independently confirmed the shutdown and reported that in Walmart's pilot, direct checkout converted three times worse than redirecting to the merchant site[^s11].

Retail executives had largely predicted this outcome before launch. One specialty retail C-suite executive said the platform was not "ready for prime time," citing missing real-time inventory, coupon and promotion support, customer data collection, loyalty integration and store pickup[^s09]. The single-item restriction structurally excluded basket-oriented categories[^s09].

### The maturity gap in reference implementations

The three reference implementations show the gap directly. ACP has 1.5k stars, 78 issues, 46 PRs, date-based releases and a changelog — but is Beta[^s21]. AP2 has 3.1k stars, 54 commits, 57 issues, 73 PRs, and is not yet on PyPI[^s22]. Visa TAP has 192 stars, 6 commits, 9 issues, and is a demonstration ecosystem[^s02]. Even discounting stars as a popularity rather than readiness signal, **none of these can fairly be called a stable specification.**

## Operational Evaluation

### 1) Onboarding cost — it is the data, not the payment

This is the most counter-intuitive finding. PayPal surveyed 498 U.S. merchants between 23 February and 3 March 2026 and found roughly 50% said their current payment setup needs only minor integration work for agent-initiated purchases[^s35]. The payment side is comparatively light.

The heavy side is product data. UCP requires the `native_commerce(checkout_eligibility)` attribute in the Merchant Center feed[^s15], and ACP's feeds are designed for real-time price and availability broadcast rather than a nightly batch export[^s32]. Orium's practitioner analysis concludes that "protocol implementation and conformance testing are measured in months, not weeks" and that "the merchants who move fastest ... aren't the ones with the most development resources. They're the ones whose data is already clean"[^s32]. Shopify's results support this: it has structured over one billion products with clean attributes, real-time pricing and accurate inventory, and traffic from catalogue-powered AI search converts at twice the rate of general AI search relying on scraped or outdated data[^s34].

That "months" figure applies to merchants running their own commerce stack. For merchants on a platform the integration work disappears. Shopify's Agentic Storefronts is a sales channel connecting a merchant's products to AI shopping platforms, automatically activated for eligible merchants, "with no apps to install, no custom integrations, and no transaction fees beyond standard processing rates"[^s39]. It abstracts UCP so that "a merchant's checkout rules, discounts, and terms ... work consistently regardless of which AI agent initiates the interaction"[^s39]. This automatic activation is what circulating claims of "one million merchants live" actually refer to — not one million individual protocol implementations. **Onboarding cost is determined by which stack you are on, not by which protocol you choose** _(interpretive)_.

Fee structures are not transparent. During the Instant Checkout period merchants were described only as paying "a small fee on each order"[^s09]; a 4% fee was reported when Shopify onboarding began in January 2026[^s23]. This could not be confirmed against OpenAI's own documentation, and an earlier statement put the figure near 2%, so **the public fee rate cannot be cited definitively** _(press-reported — primary confirmation failed)_.

### 2) Authorisation and declines — invisible friction

Declines behave qualitatively differently in agent flows. As PYMNTS puts it, "if the transaction is declined because the purchase pattern appears unusual, the consumer may never see a checkout screen or receive context around the rejection," with the consequence that "approval rates alone may not capture lost conversion if consumers never encounter the decline directly"[^s12]. When a human pays, a decline creates a retry loop; an agent quietly gives up or moves to another merchant.

The older lesson of the stored credential framework applies here too: sending the right indicators raises approval rates[^s27]. It is plausible that correctly transmitting TAP signatures, agent IDs and cart context will similarly determine approval outcomes for agent traffic. However, **no primary data disclosing actual authorisation rates for agent-initiated transactions was found** — an explicit limitation of this report.

### 3) Liability and disputes — the default is the cardholder; the fight is over agent error

The starting point needs correcting first: liability allocation is not a blank slate. Visa Core Rules §4.1.24.3 requires an Agentic Payment Provider, before undertaking a transaction, to **"obtain Cardholder acknowledgement that they are responsible for actions taken by the Agentic Payment Provider"**[^s38]. Rivero's analysis reaches the same place, noting that under existing scheme rules "the cardholder is responsible for what their agent did on their behalf," and that agentic transactions "are currently indistinguishable from card-not-present e-commerce payments, governed by existing authorisation and dispute rules"[^s41][^s42]. **The default sits with the consumer.**

The contested ground is below fraud. The same analysis observes that "a cardholder claiming misrepresentation, that the agent presented options in a confusing or incomplete way, sits in an entirely different grey zone"[^s41], because existing rules "would still likely treat the transaction as authorised, because the cardholder delegated authority to the agent"[^s42].

The dispute process itself has not been given a separate track. No agent-specific dispute condition or reason code was found in the public Visa Core Rules; instead the compelling-evidence provisions were extended to accept "login IDs for an Agentic Payment Provider and Merchant's e-commerce site or application"[^s38]. The rule-layer response is not a new dispute type but **inserting agent identifiers into the existing evidence requirements.**

Amex's programme partially reverses that default. Amex Agent Purchase Protection is the most concrete published exception. It applies to eligible charges where an agent deviates from authenticated purchase intent, conditional on the Card Member having initiated a return with the merchant where possible[^s28]. The exclusion is equally explicit: claims are unavailable where "purchase intent is subjective or non-verifiable (e.g. 'best' or 'really nice')"[^s28]. Amex's Luke Gebb stated: "As long as we're dealing with a registered agent ... we will stand behind that transaction and credit the consumer so they're not out of pocket"[^s10].

That exclusion looks minor but in fact defines the programme's boundary. A large share of the reason to delegate to an agent is "just buy me a good one" — and that is precisely what falls outside coverage.

Everyone else is vaguer. Mastercard's press release mentions only "a process to help clarify agentic transactions that may be unfamiliar or unrecognized"[^s30], and the Visa ICC announcement contains no liability statement at all[^s07]. Mastercard is reported to be planning a form of scheme-carried liability for certified agents, but this could not be confirmed against a primary source[^s41] _(unverified — single source)_.

What remains practically actionable for merchants is evidence capture. Checkout.com recommends collecting order context, execution data (timestamps, session tokens, Agent IDs) and account patterns, and adopting protocols like TAP and AP2 to verify agent legitimacy and intent[^s26]. The same piece projects global chargeback cases growing 24% between 2025 and 2028, driven by card-not-present volume[^s26]. And roughly two-thirds of surveyed U.S. merchants say a standardised liability framework is urgently needed[^s35].

### 4) Fraud and abuse — signatures do not defend intent

Two distinct risks need separating.

**Agent impersonation** is already measured. In the DataDome data cited above: 16.4M requests spoofing Meta-ExternalAgent, 7.9M spoofing ChatGPT-User, and a 2.4% impersonation rate for PerplexityBot; in a test sending spoofed agent requests to roughly 700,000 of the most-visited websites, most responded 200 OK[^s33]. Signature-based identification is aimed precisely at this.

**Prompt injection** is a different animal. A large-scale public red-teaming competition published in March 2026 reported 464 competitors submitting 272,000 attack attempts against 13 frontier models across 41 behavioural targets, producing 8,648 confirmed successes. Attack success rates ranged from 0.5% (Claude Opus 4.5) to 8.5% (Gemini 2.5 Pro), and universal strategies transferred across 21 of the 41 behaviours, indicating "fundamental weaknesses in instruction following architectures"[^s16]. However, that study covered tool-calling, coding and computer-use settings and **did not directly measure payment scenarios** — transfer to a payment context is inference.

The key point is a limit in protocol design. AP2's signed mandates record non-repudiably what the user authorised[^s05]. But injection contaminates the expression of intent itself, and a mandate built from a contaminated intent is cryptographically perfectly valid. **The signature layer stops forgery; it does not stop a misled authorisation.** Amex conditioning coverage on deviation from "authenticated purchase intent"[^s28], and Mastercard and Google pushing Verifiable Intent as a "tamper-proof log"[^s06], both read as attempts to close this gap through after-the-fact liability allocation rather than prevention _(interpretive)_.

Operator surveys point to unpreparedness. Darwinium surveyed 500 U.S. and U.K. fraud, risk and security leaders: 97% reported AI-facilitated attacks increasing over the past twelve months, and 75% estimated that more than 26% of current fraud attempts are AI-assisted. On agentic traffic, 48% allow by default with after-the-fact monitoring, 31% block by default, and 20% decide case by case[^s31]. _(security-vendor survey)_

### 5) Regulation — Korea needs a separate path

The EU maintains PSD2/SCA application with the validity of delegated authorisation unresolved[^s18]. Korea faces a more structural constraint. Reporting on a Korea Institute of Finance paper (24 May 2026) notes that the Electronic Financial Transactions Act restricts delegation or lending of access media to third parties, and the Real Name Financial Transactions Act imposes a real-name principle with strict agency rules, making structures where AI directly executes financial transactions limited in practice. The same paper proposed testing agent-based payment systems through the financial regulatory sandbox with gradual expansion or statutory reform[^s19].

The practical difference is large. Most overseas protocols rest on the premise that a user delegates payment credentials to an agent — and in Korea that premise is itself the item under review. Domestic adoption is less a protocol-selection problem than a regulatory-pathway problem _(interpretive)_.

### 6) Observability — new fields to build

Agent transactions require fields that existing payment logs do not carry: agent ID, session nonce, mandate hash, cart context, and evidence of authentication at delegation time[^s26][^s01][^s28]. These serve as both dispute evidence and audit material. For settlement and reconciliation, unless the agent channel is segmented and its approval, refund and dispute rates tracked separately, the "invisible declines" described above[^s12] dilute into aggregate metrics and the problem goes unnoticed _(interpretive)_.

## Discussion — Adoption Signals and Open Questions

### Read the numbers by layer

The published figures measure different things.

- **AI-referred traffic**: Shopify Q1 2026 — traffic up 8x, orders from AI-powered search up nearly 13x[^s34].
- **Autonomous agent payment pilots**: Visa — "hundreds" of successful agent-initiated transactions as of December 2025, 100+ ecosystem partners, 30+ active in the VIC sandbox[^s25].
- **Native in-chat checkout**: roughly 30 Shopify merchants were reported live on Instant Checkout as of February 2026 _(unverified — single source)_. Claims of "one million Shopify merchants live" also circulate; those describe *exposure eligibility* from Agentic Storefronts auto-activation[^s39], not merchants wired through to payment.
- **Non-card rails**: x402 at roughly 75 million transactions / $24 million over 30 days, mostly sub-dollar[^s29].
- **Non-Western markets**: Alipay reported 120 million transactions in one week in February 2026 via the Qwen app, but concentrated in food and beverage and not on card rails[^s11].

Forrester places the whole category at "stages one or two of five," "overhyped too early" but "generationally impactful" if interoperability improves[^s11]. Traffic is real; autonomous payment is still pilot-stage — that is the honest summary.

### Control of checkout behind the cooperation announcements

On the surface everyone joins everyone's standard. Mastercard is an AP2 launch partner and sits in the FIDO payments working group[^s06]; Visa ICC accepts four competing protocols[^s07]; Adyen supports four[^s24].

But each is defending a different position. UCP and ACP both foreground the merchant remaining merchant/seller of record[^s14][^s15], while Visa ICC places a protocol-neutral on-ramp above them to own the integration point[^s07]. Visa making the Agentic Payment Provider a registered role with mandatory Intelligent Commerce enrolment[^s38] also brings agent operators inside the network's jurisdiction at the rule layer.

OpenAI's retreat was the first verdict in that contest: retailers demanded control of checkout, and the party unwilling to concede it stepped back[^s08]. Generalising that to "AI platforms failed to own checkout" would miss the counter-evidence, though. Over the same period Google rolled UCP checkout into U.S. Search and Gemini, extended it to YouTube and to hotel and food-delivery verticals, and launched Universal Cart[^s40], while Shopify widened the channel by auto-activating Agentic Storefronts for eligible merchants[^s39]. What failed was **a specific design that took checkout control away from the merchant**, not payment on AI surfaces generally _(interpretive)_.

### Multi-protocol becomes the default

Adopting only one protocol forfeits an entire inbound channel. UCP opens Google AI Mode and Gemini; ACP opens the ChatGPT ecosystem; Meta's AI checkout opens another. Visa ICC positioning as an "on ramp" and Adyen Agentic as a "universal translator" signals the market has already reached this conclusion[^s07][^s24]. The catch: each additional on-ramp layer wants fees and data access, so channel expansion and margin pressure arrive together _(interpretive)_.

### What to decide now, what to defer

On the evidence:

**Do now**
- Clean up real-time product data (price, inventory, attributes). It is a precondition regardless of protocol, has the longest lead time, and catalogue quality doubles conversion[^s32][^s34].
- Decide an agent-traffic policy — allow, block, or case-by-case — and log it. The industry currently splits 48/31/20[^s31].
- Start capturing dispute evidence fields. Agent IDs, session tokens, timestamps and cart context cannot be reconstructed retroactively[^s26].
- Check Visa Intelligent Commerce registration status. Participating as an agent operator is now a rule-level requirement, with identity verification and the cardholder responsibility acknowledgement as pre-conditions before a credential can be stored[^s38].

**Defer**
- Exclusive bets on a single protocol. ACP is still Beta with a breaking-change history[^s21], AP2 is immediately post-FIDO-donation with no working-group output yet[^s06], and UCP, while expanding, is still region-limited early access[^s15][^s40].
- Building your own agent checkout UX. Even the platform vendors reversed course within six months[^s08], and if you are on a platform the channel opens automatically[^s39].

### The near-term shape of real usage

Evidence converges on low-risk, repeat, well-structured categories. Alipay's volume was food and beverage[^s11]; x402 concentrates on micropayments[^s29]; merchants with clean catalogues convert better[^s34]. Amex excluding subjective intent such as "best" from coverage[^s28] points the same way — precisely specified repurchase opens first, and judgement-laden purchases come later _(interpretive)_.

## Limitations

- **No authorisation-rate data.** No primary data disclosing issuer approval or decline rates for agent-initiated transactions was found. Only mechanism descriptions[^s12] were available. Every statement about approval rates in this report is structural inference.
- **Scope of the dispute-rule check.** The Visa Core Rules are public and have brought agent transactions into the rulebook at §4.1.24[^s38], but no agent-specific dispute condition or reason code appears in that public edition. Equivalent public operating regulations for Mastercard and Amex were not obtained, so the comparison is asymmetric. The safe statement is "not in Visa's public rules," not "no network has agent-specific dispute rules."
- **No published Mastercard Agentic Token specification.** Only press-release-level description[^s30] exists; unlike TAP, ACP and AP2, no public developer spec or reference implementation was found. That cell of the comparison table stays "closed."
- **Fee rates unresolved.** ACP fees are reported at 4%[^s23] alongside an earlier ~2% statement, and OpenAI's own page could not be retrieved (access blocked). No total-cost-of-ownership comparison was attempted.
- **Reliance on vendor measurement.** DataDome[^s33], Darwinium[^s31], Checkout.com[^s26] and PayPal[^s35] are all stakeholder studies. No independent verification of the same phenomena was obtained.
- **Domain mismatch in the prompt-injection research.** The competition paper cited[^s16] did not measure payment scenarios. Transfer to a payment context is this report's inference and is not empirically established.
- **Thin Korean evidence.** No primary sources on specific Korean card issuer or PSP responses were obtained, and the regulatory account relies on reporting[^s19] that cites a Korea Institute of Finance paper.
- **Platform path not quantified.** No figures were obtained on what share of merchants auto-activated into Shopify Agentic Storefronts[^s39] actually convert through to payment. Exposure eligibility and real transactions are different metrics.
- **Time dependence.** This is a 3 August 2026 snapshot. ACP is Beta, UCP is region-limited early access and expanding, ICC and Adyen Agentic are limited availability, AP2 is immediately post-donation, and the Visa rules cited are the 18 April 2026 edition. Substantial parts should be expected to change within six months.
