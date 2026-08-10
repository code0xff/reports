# How Korea's Credit Information Act Bears on Agent Payments, and How to Work Within It

## Abstract

Before an AI agent can pay on a user's behalf, it must read that user's financial data and form a judgment. In Korea the statute governing that step is not the Electronic Financial Transactions Act but the Act on the Use and Protection of Credit Information (신용정보법). This report reads the statute [in force 2024-08-14, Act No. 20304] and its Enforcement Decree [in force 2026-02-03, Presidential Decree No. 36074] provision by provision and maps them onto agent architectures.

Five findings dominate. First, the Act splits an agent's data-acquisition routes in two. The transmission-request right (Art. 33-2) is the sanctioned route, while holding or controlling the user's access medium in order to "view information in the name of the credit information subject by way of delegation, agency, proxy or any similar method" is expressly prohibited by the Decree (Art. 18-6(3))[^s04][^s08]. That prohibition's language happens to describe the agent pattern exactly. Second, the Act nonetheless already contains an explicit channel for agent action: Art. 39-3(1) provides that the data subject **may have an agent exercise** the transmission request, the automated-evaluation explanation request, consent withdrawal, and access-and-correction rights, and Decree Art. 34-3 requires the delegation to specify "the concrete content, scope and duration of the agency"[^s07][^s10]. That is the statutory form of an agent authorization model. Third, the outsourcing route imports direct statutory duties **including penalties** onto the processor (Art. 17(2)) and **prohibits sub-delegation** (Art. 17(7)), so the ordinary practice of chaining model and tool providers cannot stand without FSC recognition[^s03]. Fourth, any feature that aggregates credit information and shows it to the user cannot avoid a licensing assessment as MyData business (Art. 2(9-2)); operating unlicensed carries up to five years' imprisonment or a KRW 50 million fine (Arts. 4(1), 50(2)1)[^s01][^s02]. The supervisor has already made clear that this test turns on substance rather than paperwork: in 2023 the FSC and FSS replied that even a fintech receiving data from a licensed MyData operator under separate third-party-provision consent "may be unlawful where it has the **form (양태)** of MyData business without a licence"[^s19]. So "our partner holds the licence, therefore we are fine" does not hold. There is also a route already named in the statute: exercising these rights by proxy is an **enumerated ancillary business** of a licensed MyData company (Art. 11-2(6)3, notifiable seven days in advance), and performing it requires internal rules to prevent conflicts of interest (Art. 22-9(2))[^s18]. Fifth, "automated evaluation" is defined as evaluating *a person* (Art. 2(14)), so automatically executing a payment is not itself within it — but where limit-setting or approval functions as a credit judgment, the explanation and objection duties of Art. 36-2 attach[^s01][^s05].

Strategically the most important fact is that the regulation is moving right now. On 16 June 2026 the Financial Services Commission characterised the current consent regime as requiring "individual, prior consent in principle at every processing stage of collection, use, provision and inquiry of personal credit information" and as "the strictest level of regulation in the world" — and gave as its leading example of harm that a financial company wanting to offer "**a service using an AI agent to exercise interest-rate reduction requests and low-rate refinancing on the customer's behalf**" cannot do so because consent must be obtained repeatedly for each inquiry. It announced it will pursue amending legislation[^s12]. The regulator itself is using agents as the case for reform. In the meantime the practical route is the regulatory sandbox: in December 2025 the FSC designated 19 MyData-based interest-rate-reduction proxy services, structured so that "the user consents to proxy application only once, after which the operator files automatically"[^s13][^s15]. The recommended strategy therefore is, near-term, to build the authorization model on Art. 39-3 with a scope- and duration-bounded delegation and enter via the sandbox; medium-term, to align the design with the consent-regime amendment.

This report is research based on published law and public-authority materials. It is not legal advice. Supervisory regulations and notices were not examined, only one agency interpretation was obtained, and no enforcement precedent addressing agents was located; the boundary judgments are this report's own reading.

## Introduction

Most Agent Payments discussion happens at the execution layer: which credential authorises a payment, what limits apply, how to make it auditable. But the first wall you hit when actually launching in Korea sits earlier. To decide "should this payment happen", an agent must read balances, transaction history, limits and credit standing — and the moment that data is personal credit information, the Credit Information Act applies.

What makes this Act decisive is that its subjects are not confined to financial institutions. Article 15(1) groups "credit information companies, MyData companies, debt collection companies, credit information concentration agencies **and credit information providers/users**" under the single term "credit information companies, etc."[^s03]. Any operator processing personal credit information can be a duty-bearer regardless of whether it holds a financial licence. And because "processing" is defined to cover collection, generation, linkage, interlocking, recording, storage, retention and **processing/derivation** (Art. 2(13)), an agent reading data as an input to its judgment is processing without exception[^s01].

The scope of this report is the Credit Information Act. The Electronic Financial Transactions Act, the Specialized Credit Finance Business Act and the Personal Information Protection Act are touched only where boundaries meet. The method is straightforward: obtain the statutory text, read it provision by provision, map it onto the components of an agent architecture — data acquisition route, authority delegation, judgment automation, business status — and derive the resulting constraints and the designs that remain available.

One methodological note. The Korean Law Information Center (law.go.kr) loads statutory text asynchronously inside an iframe, so ordinary page retrieval cannot read the articles. This report extracted `lsiSeq` from the iframe `src` of the `법령/<name>` response, called `lsInfoR.do` directly, and stripped tags locally. The search-result URL supplied in the request (`lsSc.do?...query=...`) is a search screen and contains no article text.

## Background: the Act's structure and reach

### What counts as credit information

Article 2(1) defines credit information as "information necessary to judge the credit of a counterparty in financial or other commercial transactions", divided into five categories: (a) information identifying a credit information subject, (b) information for judging transaction content, (c) information for judging creditworthiness, (d) information for judging credit transaction capacity, and (e) other information necessary to judge credit. The structurally important part is the parenthetical attached to (a): identifying information "constitutes credit information **only when combined with** information falling under any of (b) through (e)"[^s01].

That combination requirement has practical consequences. A component that handles only user identifiers may be arguable as not processing credit information; conversely, the instant identifiers and transaction history sit in the same context, the whole becomes personal credit information processing. Where you draw the data boundary determines the regulatory perimeter.

### Who bears the duties

Beyond the wide definition in Art. 15(1), Art. 15(2) provides that "when credit information companies, etc. collect personal credit information, they shall obtain the consent of the credit information subject", with exceptions limited to statutory grounds — the PIPA Art. 15(1)2–7 cases, information publicly disclosed under law, and information the subject has themselves made public[^s03]. Consent is the default from the collection stage onward.

### Licensing

Article 4(1) provides that "no person shall conduct credit information business, MyData business or debt collection business without a licence", and Art. 50(2)1 attaches up to five years' imprisonment or a KRW 50 million fine[^s02]. Of the three, the one that actually bites agent operators is MyData business.

## Provision-by-provision impact analysis

### The two data-acquisition routes

Normatively, there are exactly two ways for an agent to obtain the user's financial data.

**The sanctioned route: the transmission request (Art. 33-2).** An individual credit information subject may require a provider/user to transmit their personal credit information to a specified recipient. The recipients are enumerated: the subject themselves, a MyData company, a credit information provider/user designated by Presidential Decree, a personal credit rating company, and others designated by Decree[^s04]. An arbitrary third party cannot be named as recipient. For an agent operator to receive data directly, it must fall within that enumeration; otherwise it must rely on data transmitted to "the subject themselves" and then handed on by the user.

A recipient of a transmission request must transmit "without delay ... in a form processable by a computer or other information processing device", notwithstanding Art. 32 of this Act and the secrecy provisions of the Real Name Financial Transactions Act Art. 4, the Framework Act on National Taxes Art. 81-13, the Framework Act on Local Taxes Art. 86, and PIPA Art. 18[^s04]. It is a strong right that expressly overrides other statutes' confidentiality rules. In exchange, the request must be made by electronic document or another method securing safety and reliability, specifying the recipient, the information, and whether and how often transmission recurs (para. 5), and it is revocable at any time (para. 7)[^s04].

There is an important limit on what can be transmitted. Article 33-2(2)3 requires that the information "not be credit information separately generated or **derived** by the provider/user on the basis of personal credit information"[^s04]. Source data can be pulled; a bank's derived indicators or internal scores cannot. An agent cannot free-ride on judgments the bank has already computed and must hold its own decision logic.

**The prohibited route: access-medium-based viewing.** Article 22-9(3) provides that a MyData company shall not collect information to be delivered to the subject by "using or retaining, in the manner prescribed by Presidential Decree", either of two means: first, the **access medium** under Art. 2(10) of the Electronic Financial Transactions Act, and second, identity-verification means such as presenting an identification document or using telephone or a website[^s06].

The Decree defines the prohibited "manner", and its wording is decisive. Decree Art. 18-6(3) defines it as "viewing information **in the name of the credit information subject by way of delegation, agency, proxy or any similar method**" through any of: "(1) retaining the access means directly; (2) securing authority to access the individual's access means; (3) securing de facto control, use rights or access rights over the access means"[^s08].

That is effectively a definition of the agent pattern. Storing a user's credentials or securing access rights in order to log in as the user and read screens — commonly called scraping — is named as prohibited. The weight of the prohibition becomes clearer once you see what an access medium is. EFTA Art. 2(10) defines it as a means or information used "**to give transaction instructions** in electronic financial transactions, or to secure the authenticity and accuracy of the user and the transaction content"[^s11]. The authority to read data and the authority to instruct a payment sit in the same medium. An agent in a position to execute a payment is also in a position of control over an access medium.

A distinction is needed here, and this is where overstatement must be resisted. On its face Art. 22-9(3) regulates MyData companies. Contemporary reporting when the ban was introduced led with exactly that point — "only MyData is banned from scraping" — and explained the rationale as scraping being "contrary to the original purpose, that a MyData operator must guarantee the customer's right to request transmission of credit information", noting that fintechs other than MyData operators faced no restriction on collecting information by scraping[^s20]. This provision alone therefore cannot support the claim that credential-based access by any agent is prohibited.

The accurate statement is this. Where licensed, Art. 22-9(3) blocks access-medium-based collection[^s06]. Where unlicensed, whether that provision applies directly is uncertain, but conducting aggregation-and-provision as a business independently violates Art. 4(1)[^s02]. The constraint therefore closes where **the agent has the substance of MyData business**; for services without it, the operative constraints are the EFTA rules on access media and the financial institution's terms rather than the Credit Information Act. This distinction synthesises the statutory text with contemporaneous reporting and is this report's own reading; no explicit supervisory statement resolving it was located.

The practical conclusion nonetheless changes little. An agent that also executes payments will likely end up presenting a consolidated view of the user's holdings, and at that point it approaches the substance of MyData business. As the next section shows, the supervisor has already ruled on that "substance" question once.

### The agency route — a channel the Act already opens

Read only the prohibitions and agents appear to have no path. But the same Act contains an explicit one.

Article 39-3(1) provides that "a credit information subject **may have an agent** exercise the following rights (hereinafter 'requests for access, etc.') in accordance with the methods and procedures prescribed by Presidential Decree, such as in writing", and enumerates: the Art. 33-2(1) transmission request; the Art. 36 notification request; the Art. 36-2(1) explanation request and the acts under Art. 36-2(2); the Art. 37 consent withdrawal and do-not-contact request; the Art. 38 access and correction claims; the Art. 38-2 notification request; the Art. 39 free access; and the Art. 39-2 delivery or access[^s07].

So both the transmission right that powers MyData and the automated-evaluation explanation and objection rights are expressly delegable. An agent exercising these on the user's behalf is doing something the Act contemplates.

The form of delegation is set by Decree Art. 34-3: "delegating the power of agency, using a means capable of securing safety and reliability such as writing, an electronic document, a website, an **application or messenger**, **including the concrete content, scope and duration of the agency**"[^s10]. Three things stand out. Messenger is expressly allowed, so delegation through a conversational interface is not excluded as a matter of form. The delegation must include **content, scope and duration** — the law is requiring what agent authorization models call scoping and expiry. And "a means capable of securing safety and reliability" is technology-neutral, leaving implementation latitude.

That proxy exercise is institutionally permitted is confirmed in two further places. One is the structure of the prohibitions: Decree Art. 18-6(1)3 prohibits a MyData company from "**coercing or unduly inducing** the exercise by proxy of the rights under Art. 39-3(1)"[^s08]. Prohibiting coercion and undue inducement presupposes that proxy exercise itself is allowed.

The other is more decisive. Article 11-2(6) enumerates the ancillary businesses of a MyData company, and item 3 is "**the business of exercising by proxy the rights under each subparagraph of Art. 39-3(1)**"[^s18]. An agent exercising transmission, explanation and correction/deletion rights for a user is therefore not merely permitted civil-law agency; it is **a business line expressly enumerated as a statutory ancillary business of a licensed MyData company**. Ancillary businesses must be notified to the FSC at least seven days before commencement (Art. 11-2(1))[^s18].

A condition attaches. Article 22-9(2) requires a MyData company performing this ancillary business (Art. 11-2(6)3) and the concurrent businesses under Art. 11(6) to establish "**internal control rules to prevent conflicts of interest** that may arise between the individual credit information subject and the MyData company"[^s18]. That requirement weighs especially heavily on agents. A design in which the agent exercises rights for the user while also having an incentive to steer them toward its own or affiliated products is precisely the conflict this provision targets. Where agency and distribution sit in the same entity, documenting internal controls is not optional.

The same provision carries a constraint that bears directly on agent authority management. Article 18-6(1)10 prohibits "changing the content of a transmission request without the individual's consent, or requesting personal credit information **beyond the scope** the subject requested"[^s08]. An agent widening its own authority mid-run — scope creep — is normatively blocked.

### Outsourcing and the sub-delegation ban

A second structure is for the agent operator to become a financial institution's processor. Article 17(1) permits credit information companies, etc. to outsource credit information processing, applying PIPA Arts. 26(1)–(3) *mutatis mutandis* to the outsourcing of personal credit information processing[^s03].

This route carries three weights. First, Art. 17(2) applies to the processor's handling of the outsourced work the provisions on safety protection (Arts. 19–21), conduct rules (Arts. 22-4 to 22-7, 22-9), prohibitions (Art. 40), damages (Arts. 43, 43-2) and supervision, orders and investigation (Arts. 45, 45-2, 45-3) — "**including the penal and administrative fine provisions for those articles**"[^s03]. The processor bears statutory duties and sanctions directly, not merely contractual ones. Second, Art. 17(4) requires encrypting information capable of identifying a specific subject when providing personal credit information for outsourcing, and Art. 17(5) mandates training the processor and reflecting safe-processing terms in the contract[^s03].

Third, and most consequential architecturally, Art. 17(7) provides that "the processor **shall not re-delegate** the outsourced work to a third party", with the sole exception of "cases recognised by the Financial Services Commission within a scope that does not impede the protection and safe processing of credit information"[^s03]. A modern agent stack is normally split across layers — orchestrator, model inference provider, tool and plugin providers, vector store. The moment each touches personal credit information the arrangement becomes re-delegation, which does not stand without FSC recognition. The practical implication is clear: to take the outsourcing route you must fold the blast radius of personal credit information into a single operator, and a design that pipes personal credit information straight to an external model API meets the sub-delegation problem head-on.

### The licensing boundary — is it MyData business?

Article 2(9-2) defines MyData business as "the business of **integrating** credit information ... in the manner prescribed by Presidential Decree, in order to support the credit management of an individual credit information subject, and **providing it to that credit information subject**"[^s01].

The two axes of the definition are **integration** and **provision to that subject**. An agent service with a screen that gathers personal credit information from several institutions and shows it to the user therefore sits squarely near this definition and cannot avoid a licensing assessment. Operating unlicensed is criminally sanctioned under Art. 50(2)1[^s02].

Conversely, whether a design that never displays the integrated data to the user and uses it only for payment-execution judgments falls outside the definition cannot be settled from the text alone. This report argues only that the assessment is unavoidable; it does not conclude that such a design falls outside.

**The supervisor has already ruled on this boundary once, and the ruling bears directly on agent design.** In an interpretation issued on 29 June 2023, the FSC and FSS were asked about a MyData operator lawfully collecting personal credit information, obtaining separate third-party-provision consent, passing it to a fintech, and that fintech using it to present asset-holding details. The reply: separately from the third-party consent, "where it has the **form (양태)** of MyData business without holding a licence, there may be grounds of illegality", citing Arts. 2(9-2), 4 and 50(2)[^s19].

Two things follow. First, the test is **substance, not paperwork** — properly obtained user consent does not cure an unlicensed-business problem. Second, **the receiving side is exposed too.** Even where data arrives by a lawful route from a licensed MyData operator, a recipient that takes on the form of aggregation-and-provision bears its own unlicensed-operation problem. The structure most commonly assumed in agent ecosystems — a licensed partner supplies data and the agent operator builds the service on top — sits directly in the path of this interpretation. The premise "our partner holds the licence, so we are fine" does not survive it.

### Automated evaluation — what is actually regulated

This is where the most common misconception sits. Article 2(14) defines automated evaluation as "the act of **evaluating an individual credit information subject** by processing personal credit information and other information solely by a computer or other information processing device, without an employee of the credit information company, etc. participating in the evaluation work"[^s01].

What is regulated is the act of evaluating a person. An agent automatically executing a payment on the user's instruction is not an evaluation of a person and, on the natural reading of the text, is not captured. Payment automation and automated evaluation are not the same thing.

There is nonetheless reason not to relax. Article 36-2(1)1 lists as the relevant occasions both personal credit rating (item a) and "the determination of whether to establish and maintain, and of the content of, financial transactions prescribed by Presidential Decree" (item b)[^s05]. The Decree in turn defines the "acts prescribed by Presidential Decree" under item (c) as "the determination of whether to offer or accept a contract concerning a transaction"[^s09]. If an agent or the operator behind it computes a payment limit from the user's credit standing, or automatically decides whether to approve a particular transaction, that goes beyond automating execution and can function as automated evaluation determining the content of a financial transaction.

What follows if it does? Under Art. 36-2(1)2 the operator must explain the result, the **main criteria**, and an **outline of the base information** used; under para. 2 the subject may submit information they consider favourable, or demand correction or deletion of the base information and recomputation of the result[^s05]. The Decree specifies how to explain and includes a practically important relaxation: when explaining the outline of base information, "information that the financial company, etc. has itself derived or inferred from the base information **may be excluded**"[^s09]. Internal derived features and inferred values need not be disclosed. Requests may also be refused where, among other cases, the subject exercises the rights "three or more times repeatedly for the same financial transaction without justifiable grounds"[^s09].

Placing Art. 33-2(2)3 next to this exception reveals a consistent asymmetry: **derived and processed information is neither transmittable on request nor subject to the explanation duty.** The structure lets whoever holds the data protect their own decision logic. For agent operators this cuts both ways — they cannot pull a bank's score, but their own model's internal derivations may be protected on the same logic.

### The consent regime — the structural bottleneck

If the constraints so far are provision-level, the real bottleneck is the architecture of consent itself. Article 15(2) requires consent for collection, Art. 32 requires separate consent for third-party provision, and consent is required at each processing stage[^s03]. An agent is inherently repetitive and always-on: it watches conditions, then queries, judges and executes when the moment arrives. A regime demanding prior, individual consent at every processing stage and an always-on agent are structurally in conflict.

That diagnosis is not this report's inference but the supervisor's official position, addressed next.

## The size of the sanction risk

Design decisions require knowing what a violation costs.

**Administrative fines (과징금).** Article 42-2(1) allows a fine of "up to 3/100 of total revenue" for the enumerated violations, which include losing, having stolen, leaking, altering or damaging personal credit information in breach of Art. 19(1) (capped at KRW 5 billion in that case), providing to a third party without consent, using in breach of Art. 33(1), re-identifying pseudonymised information for profit or improper purposes, and disclosing or using personal secrets outside business purposes in breach of Art. 42(1). Where revenue cannot be computed, up to KRW 20 billion applies[^s02]. A revenue-based fine can threaten the survival even of a startup.

**Criminal penalties.** Article 50(1) sets up to ten years' imprisonment or a KRW 100 million fine for breach of Art. 42(1) or (3) — disclosure or use outside business purposes — the heaviest penalty among the personal-credit-information provisions. Article 50(2) sets up to five years or KRW 50 million for unlicensed operation (Art. 4(1)), for breach of Art. 32(1)/(2) in providing information **and for those who receive or use it knowing the circumstances**, and for use in breach of Art. 33[^s02]. That the recipient is also exposed means criminal risk attaches to the receiving side of an agent ecosystem too.

**The processor's direct liability.** Because of the Art. 17(2) application discussed above, an agent operator that enters via an outsourcing contract cannot shelter behind the outsourcer's liability. With the penal and administrative fine provisions applied as well, it becomes a direct addressee of supervision and sanctions[^s03].

## Working within the regulation

### The regulation is moving now

Before setting strategy, fix the moment. On 16 June 2026 the FSC convened the kick-off meeting of a legal advisory group to overhaul the personal credit information consent regime, characterising the current system as requiring "individual, prior consent in principle at every processing stage of collection, use, provision and inquiry of personal credit information" and as "the strictest level of regulation in the world"[^s12].

What deserves attention is the example it chose. The FSC stated that even where a financial company wants to introduce "**a service using an AI agent to exercise, on the customer's behalf, interest-rate reduction requests and low-rate refinancing**", it is difficult because "consent must be obtained repeatedly each time an inquiry is made", and that it "will pursue legislation to amend the Credit Information Act while working out the consent-regime overhaul"[^s12]. The supervisor is expressly using AI agents as the case for reform, which means agent payments have moved inside the perimeter of regulatory reform rather than sitting in an unregulated grey zone.

Two further movements point the same way. One is the regulatory sandbox. On 22 December 2025 the FSC newly designated 19 "MyData-based interest-rate reduction request proxy services" as innovative financial services (Shinhan, Kookmin, Woori, Hana, IBK, NH, SC First Bank, KakaoBank, Toss Bank, Busan, Gwangju, Jeonbuk and Gyeongnam banks). The structure is precisely agentic: "the user consents to proxy application only once, after which, even without applying directly, the MyData operator automatically files an interest-rate reduction request whenever it judges a reduction to be possible." Service was to begin for bank retail loans from Q1 2026[^s13]. In June 2026 a comparable NH service was additionally designated[^s15]. The other is MyData for sole proprietors: the FSC has envisaged, unlike existing MyData, a "**financial agent (My AI Agent)**" function that "exercises rights under financial law on behalf of the sole proprietor according to the data subject's instructions and delivers the results", stating it would "finalise the introduction plan during the second half of 2025 and then formally introduce the system in 2026 through amendments to the Credit Information Act and related legislation" _(single source — law firm analysis)_[^s14].

### Near-term: build on Art. 39-3 and enter via the sandbox

Within the current law the most defensible structure is to position the agent as an **Art. 39-3 agent (대리인)**. Four reasons: it is the only proxy channel the Act expressly permits; the delegable rights include both the transmission right and the automated-evaluation rights; the delegation form the Decree requires maps directly onto an agent authorization model; and, above all, that proxy exercise is **already enumerated as a statutory ancillary business** of a MyData company (Art. 11-2(6)3)[^s18].

The last ground effectively fixes the entry route. To conduct proxy exercise as a business, the form that fits the text is a licensed MyData entity notifying it as an ancillary business. Where own licensing is impractical, partnering with a licensed operator is the alternative — but partnership alone is insufficient given the 2023 interpretation: the agent operator must draw its feature boundary so that it does not itself take on the form of aggregation-and-provision[^s19].

The design requirements follow straight from Decree Art. 34-3[^s10].

- **Content**: enumerate which rights are delegated. Specify the transmission request, the explanation request, and correction/deletion demands individually rather than as a bundle.
- **Scope**: specify which information at which institutions. Because Decree Art. 18-6(1)10 prohibits requesting beyond the scope the subject requested, scope must be treated as a constant that cannot widen at runtime[^s08].
- **Duration**: set an expiry. An indefinite delegation does not meet the formal requirement.
- **Means**: writing, electronic document, website, application or messenger — conversational delegation is not excluded.

Combine this with the items Art. 33-2 requires a transmission request to specify (recipient, information, whether and how often transmission recurs) and its revocability[^s04], and what has to be built is clear: **a delegation object with explicit scope and duration, revocable by the user at any time, that cannot widen itself.** This is the same shape as the scoped-token, limit and expiry designs generally discussed for agent payments; under Korean law it is not a choice but a requirement.

The anti-patterns are correspondingly specific.

- **Storing user credentials.** Retaining or controlling an access medium to view data in the user's name matches exactly the manner Decree Art. 18-6(3) describes as prohibited[^s08]. However convenient, it cannot be a sanctioned route.
- **Runtime authority expansion.** An agent widening its own scope because it judges this necessary conflicts with Decree Art. 18-6(1)10[^s08].
- **Unrestricted forwarding of personal credit information to external models.** Under an outsourcing structure this hits the Art. 17(7) sub-delegation ban[^s03]; outside one, it becomes an Art. 32 third-party-provision consent problem.
- **Offering an aggregated view without a licence.** Read Art. 2(9-2) together with Arts. 4(1) and 50(2)1[^s01][^s02].

And because the present consent regime structurally conflicts with always-on operation, the realistic entry route for a commercial service is **innovative financial service designation**. What the 19 designations show is that the supervisor is willing to approve a "one-time proxy consent plus subsequent automatic execution" structure as a special exception[^s13]. An application is therefore better designed to follow that precedent: delegated rights narrowly specified, the initial consent made explicit, the criteria for automatic execution documented, and results notified to the user.

### Medium-term: align the design with the amendment

With a consent-regime overhaul announced, two preparations are rational.

First, **leave room to redesign the unit of consent.** Consent-handling logic hard-coded to today's individual, prior consent will be rework when the regime changes. Treating consent as a first-class object in the data model, with unit, scope and duration parameterised, absorbs the change.

Second, **secure explainability in advance.** For judgments that may qualify as automated evaluation — limit computation, approval decisions — design logging so that the result, main criteria and outline of base information required by Art. 36-2 can be produced[^s05]. Because the Decree permits excluding self-derived and inferred information from the explanation[^s09], it pays to separate from the outset what is disclosable base information and what is internal derivation.

Third, if the "financial agent" concept in sole-proprietor MyData is realised, a new institutional status for agents will exist[^s14]. As this is unconfirmed, making the current design depend on that premise is risky.

### Design checklist

| Layer | Requirement under the Credit Information Act | Basis |
|---|---|---|
| Data acquisition | Use the transmission-request route only; no retention or control of access media | Art. 33-2; Art. 22-9(3); Decree Art. 18-6(3) |
| Recipient eligibility | Transmission recipients limited to the statutory enumeration | Art. 33-2(1) |
| Derived data | Bank-computed scores are not transmittable → own decision logic required | Art. 33-2(2)3 |
| Authority delegation | Delegate agency specifying content, scope and duration; revocable | Art. 39-3; Decree Art. 34-3; Art. 33-2(7) |
| Authority immutability | No runtime scope expansion | Decree Art. 18-6(1)10 |
| Architecture | Sub-delegation banned when outsourcing → converge PCI handling into one entity | Art. 17(7) |
| Business status | Aggregation-and-provision features trigger a licensing assessment; the test is substance, not paperwork | Arts. 2(9-2), 4(1), 50(2)1; interpretation[^s19] |
| Productising agency | Notify proxy exercise as a MyData ancillary business (7 days ahead) + conflict-of-interest internal rules | Arts. 11-2(1),(6)3; 22-9(2)[^s18] |
| Automated judgment | Prepare explanation and objection handling for automated limit/approval decisions | Art. 36-2; Decree |
| Security and records | Encrypt identifying information; train processors; reflect terms in contract | Art. 17(4), (5) |
| Entry route | Consider innovative-financial-service designation for always-on services | designation precedent[^s13] |

## Regulatory direction and what remains uncertain

Separating the settled from the unsettled.

**Settled**: the current text of the Act and Decree (the basis of the analysis above); the December 2025 designation of 19 innovative financial services and its structure[^s13]; and the FSC's June 2026 launch of the consent-regime overhaul with AI agents cited as the problem case[^s12].

**Unsettled**: the text of the amendment. The FSC has announced it will pursue legislation but no draft has been published[^s12]. How the individual, prior consent principle is relaxed could reorder the priorities above. Whether and how far the sole-proprietor MyData financial agent is introduced is also undetermined[^s14]. And innovative-financial-service designation is a time-limited exception, so whether it is later codified is case-specific.

**To be read with care**: in December 2025 the FSC published its direction for revising the financial-sector AI guidelines, citing under the reliability principle "securing the explainability of AI to stakeholders" and under the legality principle that firms should "identify in advance the applicable laws such as the AI Framework Act, the Financial Consumer Protection Act, the Credit Information Act and PIPA, and reflect them in business procedures"[^s16]. No part of that material was found to regulate in detail the relationship between AI agents or automated evaluation and the Credit Information Act, so it is not used here to infer any specific direction for agent regulation.

The direction of MyData supervision is nonetheless informative. In 2021 the FSC amended the supervisory regulation to ban sign-ups conditioned on excessive economic benefits above the ordinary level (KRW 30,000), to mandate functional-suitability and security-vulnerability checks, and to allow smaller operators to use a relay institution instead of building their own API systems[^s17]. The axis is stronger consumer protection with lower entry burden, and the same axis may well be applied to agent services.

## Limitations

- **Nature of this document**: research based on published law and public-authority materials, not legal advice. Service design and launch decisions require supervisory confirmation and legal review.
- **Supervisory regulations and notices not examined**: the Act and Decree delegate many items to "what the Financial Services Commission determines and publishes" (Decree Arts. 18-6(1)11, (3)4, (7)5, (8), (11), among others), and the Credit Information Business Supervisory Regulation and related notices were not consulted. In particular the notified scope of "similar methods" for access means is unverified, so the outer edge of the prohibition may be wider than described here.
- **Only one agency interpretation obtained**: the single supervisory interpretation secured here is the reply of 29 June 2023 on a fintech receiving MyData-sourced data[^s19]. It establishes that Art. 2(9-2) is assessed by substance, but it does not address agent structures as such. No no-action letter or sanction case addressing agents was located. Judgments such as the range covered by the Art. 39-3 agency structure, whether Art. 22-9(3) reaches unlicensed operators, and the status of an execution-only design are therefore **this report's analysis based on statutory text**, not a settled supervisory position.
- **The scraping ban is narrower than a loose reading suggests**: Art. 22-9(3) regulates MyData companies on its face, and contemporaneous reporting described it as a ban confined to MyData operators[^s20]. The structure this report describes — that the constraint closes from both directions where the substance of MyData business is present — synthesises the text, that reporting and the 2023 interpretation, and is not a conclusion about services lacking that substance. For those, the EFTA access-medium rules and institutions' terms of service operate separately.
- **No draft amendment**: the 2026 amendment push is confirmed but no article text exists, so the medium-term strategy stays at the level of direction.
- **Snapshot and version skew**: the Act is cited as [in force 2024-08-14, Act No. 20304] and the Decree as [in force 2026-02-03, Presidential Decree No. 36074]. The current versions served by the Ministry of Government Legislation were used, but whether the Act was amended after 2024-08-14 was not separately checked against the revision-history page. All citations are a 2026-08-10 snapshot.
- **Sandbox exception details unverified**: the specific special provisions of the 19 designations — which rules were excluded or relaxed — were not confirmed against the designation documents and are cited only at press-release level. No generalisation of the form "the same structure will be designated" is possible.
- **Single-source item**: the "financial agent (My AI Agent)" phrasing and the 2026 amendment timetable rest on a law firm analysis (trust 4); no FSC primary press release was identified. Marked in the text.
- **Adjacent statutes out of scope**: the Electronic Financial Transactions Act (access-medium management and the ban on transfer or lending, electronic financial business registration), the Specialized Credit Finance Business Act, PIPA and the AML statute are touched only at boundaries. The full regulatory picture for agent payments depends on all of them together, so compliance cannot be concluded from this report alone.
