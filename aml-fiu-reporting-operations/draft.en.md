# AML and the FIU: Capabilities and Reporting Mechanics for Running a Real Service in Korea

## Abstract

This report translates Korea's anti-money-laundering (AML) regime into the product and organisational requirements that a team actually shipping a financial, payments, or virtual-asset service has to satisfy, working from primary statutes and supervisory documents. Three findings stand out. First, Korean AML duties are not imposed by a single act but by a four-layer stack — the Act on Reporting and Using Specified Financial Transaction Information ("the Act"), its Enforcement Decree, and two KoFIU notices (the Supervision Regulation and the AML Business Regulation) — and most of what a service must actually build sits in the lowest layer, not the statute[^s01][^s02][^s03][^s04]. Second, the Korea Financial Intelligence Unit (KoFIU) is not a law-enforcement body but an analytical agency under the Financial Services Commission, and the inspector a business actually faces is usually a delegated authority such as the Financial Supervisory Service[^s01][^s02]. Third, the operative numbers live in the notices rather than the statute: a suspicious transaction report (STR) is due "without delay" under the Act but "within three business days from the day it is determined to be reportable" under the Supervision Regulation[^s01][^s03], while the KRW 10 million currency-transaction-report (CTR) threshold and the KRW 1 million travel-rule threshold are both set by the Decree[^s02]. From a service perspective the conclusion is that AML is not a compliance module bolted on after launch; it constrains customer identification, retention periods, data-deletion policy, and even the job titles in the org chart. At the same time there is scholarly criticism denying the regime's effectiveness outright[^s33][^s34], and empirical work finding that filing more reports does not causally drive more convictions[^s31] — the duty exists regardless of that debate, but the asymmetry should inform how much is invested where. Two things could not be verified from public sources — KoFIU's current intake and dissemination statistics, and FATF primary documents — and are stated in the Limitations section.

## 1. Introduction

AML/CFT regulation is often filed under "legal", but it directly constrains product decisions: what onboarding must ask, how long those answers may not be deleted, which transactions must be blocked automatically, and which seniority of person must approve which decision. This report reconstructs those constraints in the language of "what has to be built".

The scope centres on Korea's Act (hereafter the Specified Financial Information Act, or SFIA); FATF standards and the US and EU regimes appear only as comparators. Terms are used as follows: **AML** anti-money laundering; **CFT** counter-terrorist financing; **FIU** financial intelligence unit generally; **KoFIU** Korea's FIU; **STR** suspicious transaction report; **CTR** currency (large cash) transaction report; **CDD/EDD** customer due diligence / enhanced due diligence; **VASP** virtual asset service provider; **travel rule** the duty to transmit originator and beneficiary information with a virtual-asset transfer.

One structural fact comes first. The Act defines "financial companies etc." by enumeration, and since the March 2021 amendment that list includes virtual asset service providers — the Act's supplementary provisions apply the registration-disqualification rule "from the first violation committed on or after 25 March 2021", and the registration manual uses the same date[^s01][^s08]. The practical meaning is not merely "exchanges must do AML" but that most of the notice-layer requirements previously applied to banks came down unchanged. The registration manual issued jointly by KoFIU and the FSS accordingly treats "AML internal control framework" as a distinct review item during registration screening[^s08].

## 2. The regulatory framework: from FATF to the SFIA

### 2.1 A four-layer stack

| Layer | Document | What it fixes |
|---|---|---|
| Statute | Specified Financial Information Act | The existence of the duty and the penalties |
| Decree | Enforcement Decree | Monetary thresholds, delegation of supervision |
| Notice ① | Supervision Regulation on Reporting of Specified Financial Transaction Information | Reporting deadlines, forms, submission channels |
| Notice ② | AML/CFT Business Regulation | Internal control, CDD, monitoring procedures |

The statute stops at "shall report"[^s01]. The numbers and procedures you need to build a system live below it. The CTR threshold, for instance, is left by the statute as "an amount prescribed by Presidential Decree within a range of KRW 50 million", and Article 8-2 of the Decree fixes it at KRW 10 million[^s01][^s02]. Likewise the substance of the internal-control framework — the split of roles between the board, the CEO, and the reporting officer; the frequency of independent audit; what a transaction-monitoring framework must contain — sits in the Business Regulation[^s04]. So "I have read the Act" is only the starting point: the first practical implication of this structure is that most implementable requirements are in the notice layer.

### 2.2 How international standards become domestic law

FATF Recommendations are not themselves domestic law, but through mutual evaluation and follow-up they function as the de facto engine of domestic reform _(interpretive)_. Korea became a full FATF member in October 2009[^s17], and its mutual evaluation result was published in April 2020. The Financial Services Commission's release stated that Korea was assessed as "understanding its money-laundering and terrorist-financing risks well overall and producing positive results on the basis of a solid legal and institutional framework", and that it fell into the "enhanced follow-up" category alongside 18 of the 29 countries evaluated by then, including the US, Australia, Canada, Singapore, and China[^s23]. Not a failing grade, but a stronger post-evaluation regime than regular follow-up.

FATF has since moved to a fifth round based on the methodology adopted in 2022, run on a six-year cycle rather than the roughly ten-year cycles of earlier rounds[^s20] _(unverified — single source)_. A shorter cycle with more weight on effectiveness means that having a documented programme matters less than whether it produces outputs _(interpretive)_. For an operator, that is a signal that "the procedure exists on paper" is a weakening defence.

On the travel rule, the widely cited origin is FATF Recommendation 15 (new technologies) and its interpretive note, which bring VASPs into scope and require information transmission; this report could not access the FATF primary text (see Limitations). What can be verified is the domestic implementation: the Decree sets the information-provision trigger at virtual assets worth KRW 1 million or more, and delegates the KRW-conversion basis to a KoFIU notice[^s02][^s03].

### 2.3 What a violation actually costs

Violations do not stop at administrative fines. Conducting virtual-asset business without registration carries up to five years' imprisonment or a fine of up to KRW 50 million; failing to file a change notification carries up to three years or KRW 30 million; filing a false report or disclosing the fact of a report carries up to one year or KRW 10 million[^s01]. A joint-penalty provision extends fines to the legal person[^s01]. On the administrative side there are two tiers of fine: up to KRW 100 million (failure to implement internal-control measures, failure to verify beneficial owners, refusing inspection) and up to KRW 30 million (failure to file STRs/CTRs, failure to verify identity)[^s01].

These are not dormant provisions. Publishing the results of its 2022 inspections of the five KRW-market exchanges, KoFIU cited a case in which "customer B, aged 95 (born 1929), traded mainly in the early hours and split transactions below KRW 990,000 to avoid money-laundering suspicion", faulting the operator for inadequate review, and imposed institutional warnings plus fines of up to KRW 492 million[^s13]. The scale has since risen sharply: Dunamu Inc. was assessed a total of KRW 35.2 billion in fines over roughly 8.6 million violations, preceded in February 2025 by a three-month partial business suspension for transacting with unregistered VASPs[^s14]. Weak AML is not a fine risk; it is a business-suspension risk with criminal provisions attached.

## 3. KoFIU's role and the flow of information

### 3.1 KoFIU is not an investigative agency

Article 3 of the Act establishes KoFIU under the Financial Services Commission and enumerates its functions: organising, analysing, and disseminating reported information; supervising and inspecting the relevant duties of financial companies; cooperating and exchanging information with foreign FIUs; and handling VASP registration[^s01]. It has no investigative powers. Under Article 10, analytical output is provided to the Prosecutor General, the Corruption Investigation Office for High-ranking Officials, the National Tax Service, the Korea Customs Service, the National Election Commission, the FSC, and the National Intelligence Service, and to the Commissioner General of the Police and the Korea Coast Guard; dissemination requires review by an Information Analysis Council, and the record of each dissemination must be kept for five years[^s01].

Two consequences follow for operators. First, the recipient is an intelligence body, not a prosecutor, so report quality is judged by analysability rather than by proof of an offence — which is why the Decree requires both "the reasonable grounds for suspicion" and "the types of related records retained" as report fields[^s02][^s03]. Second, everything after submission is outside the operator's control; what the operator controls is the quality of detection, judgement, and record-keeping.

International cooperation runs through the Egmont Group. Korea's full membership was approved at the June 2002 Monaco Plenary, and KoFIU states that it exchanges information with foreign FIUs over the Egmont Secure Web[^s17].

### 3.2 Two reporting axes: judgement and machinery

**STR** has no monetary threshold. A financial company must report without delay where there are reasonable grounds to suspect that property received in connection with a transaction is illegal property, or that the counterparty is engaged in money laundering or terrorist financing, and must clearly state those grounds[^s01]. Judgement is intrinsic.

**CTR** excludes judgement by design. Where cash of KRW 10 million or more is deposited or withdrawn in one business day under one person's name at one institution, the identity, time, and amount are reported automatically and electronically[^s02][^s06]. The statute sets a 30-day deadline and excludes transactions with other financial institutions and with the state and local governments[^s01]. The threshold began at KRW 50 million in 2006 and was lowered to 30 million in 2008, 20 million in 2010, and 10 million in July 2019[^s06]. That history is a trap in practice: older secondary sources and English translations still show KRW 20 million, so the threshold must be checked against the current Decree.

Where there are reasonable grounds to suspect that amounts are being split to evade the CTR threshold, that too must be reported, judged by the number of counterparties, transaction counts, number of branches used, and the period involved[^s01][^s03]. Structuring detection is therefore where CTR's mechanical character overlaps with STR's judgemental one.

CTR data may be relayed through designated intermediaries: the Korea Federation of Banks, the Korea Financial Investment Association, and the Korea Federation of Savings Banks[^s01].

### 3.3 Intake volume versus processing capacity

The STR volumes KoFIU publishes are 703,356 (2016), 519,908 (2017), 972,320 (2018), 926,947 (2019), and 732,536 (2020)[^s07] — on the order of 0.5–1 million a year. A more recent report states that 1.33 million STRs were received in 2025 and that only 44,680 of them (3.4%) underwent detailed review[^s09] _(unverified — single source)_. Those absolute figures are not cross-verified. What is confirmed by official material is that supervisors are pressing on content rather than count: the FSC and KoFIU call for "substantiated grounds and timely information provision on emerging financial-crime typologies", award recognition to high-quality filers, and hold semi-annual roundtables with industry associations[^s30].

For an operator the asymmetry cuts both ways. Defensive over-reporting lowers exposure to the non-filing fine of up to KRW 30 million[^s01], but filing volume does not convert into outcomes. A panel study of EU countries finds a sub-linear correlation between STR counts and money-laundering convictions, yet reports that under fixed effects controlling for time trends "the relationship disappears … This suggests that the relationship is spurious rather than causal"[^s31]. Under-reporting, conversely, exposes the firm directly to sanction[^s01]. Since the regulation does not resolve the tension, the evidence favours defending on "how the grounds for the judgement were recorded" rather than "how many reports were filed" _(interpretive)_.

### 3.4 Your inspector may not be KoFIU

Article 15 vests supervision and inspection in the Commissioner of KoFIU but, in paragraph 6, permits delegation to the Governor of the Bank of Korea, the Governor of the FSS, or others prescribed by Decree[^s01]. The Decree allocates this by sector: banks including the Korea Development Bank, Export-Import Bank, and Industrial Bank of Korea go to the FSS; postal savings to the Minister of Science and ICT; community credit cooperatives to the Minister of the Interior and Safety; money changers to the Commissioner of Customs[^s02]. VASP registration screening is likewise delegated to the FSS, so KoFIU receives the filing, the FSS screens the requirements and reports back, and KoFIU issues the acceptance decision[^s02][^s08].

The implication is direct: inspection readiness must be built to the standard of the delegated authority for your sector, not to a single KoFIU counter — and the risk-management-level assessment results are shared by KoFIU with the delegated authority and used in setting inspection plans, intensity, and frequency[^s04].

## 4. Capabilities a real service needs

This section translates the regulation into "what to build and whom to appoint".

### 4.1 Governance: seniority is a requirement

Article 5 of the Act mandates the appointment of a person responsible for reporting, the establishment of an internal reporting line, the preparation and operation of procedures and business guidelines, and employee training[^s01]. The Business Regulation goes much further. The reporting officer is both the filer of STRs/CTRs and the overall owner of CDD execution, and the role covers preparing detailed guidelines, specifying per-employee roles and responsibilities in job descriptions, running the know-your-employee programme, owning record retention, and periodically inspecting the internal-control framework and reporting identified weaknesses to the CEO[^s04].

The amendment notified on 12 November 2024 and effective 13 May 2025 raised this to a seniority requirement[^s29]. For banks the reporting officer must be appointed from among inside directors or executive officers, for large financial companies from at least one grade below the compliance officer, and enacting, amending, or repealing the AML business guidelines requires a board resolution[^s12][^s29]. The experience requirement (at least two years of AML-related experience) carries a 30-month grace period and applies from 13 May 2027[^s12][^s29]. This item is therefore not satisfied by "assigning one person": where the role sits on the org chart, and what the board minutes record, are the requirements.

Independent audit is a separate requirement. The Business Regulation requires a department independent of the AML function to review and assess the adequacy and effectiveness of that function, performed by the auditor or audit committee at least once a year by on-site audit, with results reported to the board and the scope, content, violations, and follow-up recorded[^s04]. On the text of the regulation, an arrangement in which the AML lead audits their own function does not satisfy this requirement _(interpretive)_.

### 4.2 Customer due diligence is not a one-off

Article 5-2 requires verification of customer identity and beneficial ownership on account opening and on one-off transactions above a prescribed amount, and additionally the purpose of the transaction and the source of funds where there is a risk of money laundering[^s01]. Thresholds are set per transaction type in the Decree: KRW 1 million equivalent for virtual-asset transactions, KRW 1 million for wire transfers, KRW 3 million for casino chip transactions, and KRW 10 million for other financial transactions[^s02][^s07].

What matters for design is continuity. The Business Regulation requires ongoing CDD for as long as the relationship persists, additional information for customers assessed as high risk, and — for customers identified as foreign politically exposed persons — senior-management approval plus reasonable measures to establish the source of wealth and funds[^s04]. Risk assessment runs on three axes — country risk, customer risk, and product/service risk — and the results must feed the level of CDD applied[^s04].

Refusal rules belong in code as well. Where CDD cannot be completed because the customer refuses to provide identifying information, the transaction must be refused — and the STR duty still applies separately[^s04]. Further, where performing the CDD procedure itself would reasonably risk tipping off the customer, the procedure must be halted and an STR filed[^s04]. Reporting triggers can therefore fire on the onboarding-failure path, so a design that discards failed-onboarding events from logs is risky _(interpretive)_.

### 4.3 Monitoring: the regulation demands a framework and gives you no thresholds

The Business Regulation requires an ongoing transaction-monitoring framework covering monitoring methods, analysis and reporting of review results, and retention procedures for analytical records[^s04]. Identification procedures it lists include comparing a customer's transaction history against their own or a peer group's profile, comparing against typologies derived from past laundering cases, scoring laundering risk, and analysing patterns by linking customer, account, and transaction data[^s04]. Its examples of abnormal transactions are amounts or volumes that are excessively large, deposit turnover excessively high relative to balance, and activity departing from the normal pattern of the account[^s04].

Notably, the regulation supplies no thresholds. What counts as "excessively large" must be defined by the operator from its own risk assessment. This is not flexibility but a transfer of the burden of proof: in an inspection you must defend not "we matched the prescribed threshold" but "why this threshold is reasonable for our risk profile" _(interpretive)_.

This is where false positives become cost. The widely repeated figure is that "95%… is the estimated percentage of alerts generated by traditional AML systems that turn out to be false positives"[^s16] _(vendor-stated — the piece is authored by an executive at an AML vendor)_. The figure carries no denominator (institution, period, scenario), and practitioners have attacked it directly: one argues that claims of 95–98% amount to "a lot of axiomatic statements", and that high false positive rates "are not caused by the current rules-based technologies; rather, they're caused by inexperienced AML enthusiasts or overwhelmed AML experts applying rules that are too simple against data that is mis-labeled, incomplete, or simply wrong" while erring toward over-alerting for fear of supervisory criticism[^s32].

The two positions differ in diagnosis but converge in practice. The academic literature supports the direction: work on AML in mobile transactions notes that "the growing complexity and unpredictability of transaction patterns across these networks contribute to a higher incidence of false positives"[^s25]. Alert triage headcount therefore outweighs system licensing as a cost line, and the filing deadline (§5.1) cannot be met without a defined SLA on the alert queue _(interpretive)_. But if the critique in s32 is right, much of that cost is recoverable through rule tuning and data quality rather than by replacing the vendor.

### 4.4 Retention: data you are not allowed to delete

Article 5-4 requires retention, for five years from the end of the transaction relationship, of STR/CTR-related records (identity verification records, the underlying transaction records, and the record of the grounds for suspicion), CDD records, and originator/beneficiary information for wire transfers[^s01]. The Business Regulation restates this, requiring internal and external reports and related records to be kept for at least five years, and expressly includes monitoring analysis records[^s04]. The Supervision Regulation specifies the categories down to copies of identity documents, application forms, agreements and slips, and the reporting officer's review record of why a case was judged reportable[^s03].

This collides head-on with data minimisation. Article 21(1) of the Personal Information Protection Act requires destruction without delay once personal data becomes unnecessary, with an exception where "retention is required under other statutes"[^s22]. The five-year SFIA retention is thus justified as an exception — but paragraph 3 of the same article requires data retained under that exception to be stored and managed separately from other personal data[^s22]. The data-model conclusion is unambiguous: "delete all personal data on account closure" cannot be implemented, and AML-retained data needs a separate store with a five-year timer and controlled access _(interpretive)_.

### 4.5 Additional requirements for VASPs

VASPs carry a registration regime on top of the above. Article 7 requires filing with KoFIU and lists grounds for refusal: absence of ISMS certification; conducting financial transactions without a real-name verified deposit-and-withdrawal account (exempt for providers with no exchange between virtual assets and money); financial-law violations by the representative or officers; and less than five years since a prior registration was revoked[^s01]. A real-name account is defined as one permitting transactions only between the VASP's account and its customers' accounts at the same financial institution[^s01].

The procedure runs as follows: the applicant files with KoFIU; KoFIU refers screening to the FSS; the FSS reviews documents and refusal grounds and reports back; KoFIU notifies and publishes the acceptance decision[^s08]. KoFIU expects to notify within three months of receipt (45 days for change filings), excluding time taken for requested supplementation[^s08]. Filings are submitted through the government document-exchange service Document 24[^s08]. Registration is valid for three years from acceptance, and renewal must be filed at least 45 days before expiry[^s08]. Attachments include the articles of incorporation, business registration certificate, corporate registry extract and minutes, the list of wallet addresses used, the real-name account issuance certificate and contract, and the issuing institution's own ML/TF risk assessment of the VASP including per-item scoring detail[^s08].

One further condition deserves attention: renewal is available only for activities actually carried on as a business — even if an activity is on the existing registration, it cannot be renewed if the operator is not conducting it as a business at renewal time[^s08]. A "register broadly now, expand later" strategy narrows at renewal.

For the travel rule, the Decree requires information provision where virtual assets worth KRW 1 million or more are transferred to another VASP, and the Supervision Regulation fixes the conversion basis as the value displayed by the VASP at the time of trade execution or at the time the transfer is requested or received[^s02][^s03]. The problem is that the transmission channel was never standardised. Domestically, Upbit adopted VerifyVASP while Bithumb, Coinone, and Korbit adopted CODE, with the result that "Bithumb, Coinone, Korbit and Upbit cannot send or receive virtual assets with each other"[^s18]. Interoperability between the two solutions slipped from 25 March 2022 to 25 April 2022[^s19]. It is a domestic case of the interoperability gap that appears when regulation mandates information provision but leaves the transport protocol to the market _(interpretive; single case)_.

### 4.6 What can be outsourced, and what cannot

Much of the AML stack can be bought or delegated — watchlist screening, rule engines, case-management tooling, travel-rule messaging. But the Business Regulation states that where CDD is performed by a third party, "the ultimate responsibility rests with the financial company concerned"[^s04]. The filing duty likewise attaches to the named reporting officer and does not move by contract[^s01][^s04].

No Korean supervisory guidance specific to partnership or BaaS structures was found in public sources. The available comparator is US practice: interagency guidance states that "the use of third parties does not diminish or remove banking organizations' responsibilities to ensure that activities are performed in a safe and sound manner", and commentators note that partnership agreements frequently assign the programme's principal compliance responsibilities to the fintech even though "a fintech meeting its own obligations does not satisfy the bank's more stringent BSA requirements"[^s24]. Applying this to Korea is an inference from the structural similarity to Article 54 of the Business Regulation, not a stated supervisory position _(interpretive; inferred from foreign material)_.

The practical conclusion: a partnership structure lowers the licensing burden but pushes AML control requirements down to the service by contract, calibrated to the partner institution's obligations rather than the service's own. "No licence, therefore light AML" does not hold.

## 5. Reporting mechanics: channel, format, timeline

### 5.1 Deadlines: statute versus notice

The STR deadline must be read on two levels. The statute says only "without delay"[^s01]. Article 3 of the Supervision Regulation, however, requires filing "within three business days from the day it is determined to be a reportable transaction", after the reporting officer has comprehensively reviewed what they identified themselves or what employees reported, together with related records[^s03]. The clock therefore starts not at the transaction date or the alert timestamp but at the **reporting officer's determination**, and three business days from that point is the hard deadline.

The design implication is significant. No deadline is prescribed for the stages before determination (detection → first-line analysis → escalation), so the operator must define an internal SLA. Conversely, stretching those stages indefinitely conflicts with the statutory "without delay". Practically, the target interval from alert to determination should be fixed in internal rules with the rationale recorded _(interpretive)_.

CTR contrasts. The statute gives an explicit 30-day deadline, and because filing is automatic and judgement-free, deadline management reduces to batch scheduling[^s01][^s06].

The comparison across jurisdictions is instructive. The US requires a bank to file a SAR "no later than 30 calendar days after the date of initial detection", and where no suspect has been identified, "in no case shall reporting be delayed more than 60 calendar days after the date of initial detection"[^s10]. Korea measures three business days from determination; the US measures 30 days from detection. Both the start event and the length differ, so a multi-jurisdiction service needs per-jurisdiction timers rather than one SLA.

### 5.2 Channel and form

STRs use the Supervision Regulation's Form 1 (Form 1-1 for casino operators), and the submission method is, as a rule, "online reporting in the manner prescribed by the Commissioner of KoFIU"[^s03]. Attachments that cannot be digitised may be submitted physically or by post, and KoFIU must notify the reporting officer of receipt by email or similar means[^s03]. KoFIU's public guidance describes this as reporting "online, or by document or removable storage medium, with urgent cases reported first by telephone or fax and supplemented afterwards"[^s05]. For urgent filings the institution must confirm that the recipient is a KoFIU official, record the official's name, filing date, and content, and subsequently re-file on the prescribed form[^s03].

The report fields come from the Decree: the reporting institution's name and location; the date and place of the reportable transaction; the counterparty; the content of the transaction; the reasonable grounds for suspicion; and, as prescribed by KoFIU, the types of related records retained[^s02][^s03]. CTRs are filed on Form 2 online, by document, or by electronic medium[^s02][^s03].

After receipt there is a correction loop: KoFIU officials may require correction of formal defects, may correct minor defects ex officio after confirming the content, and the institution required to correct must verify the requesting official's identity and record and retain the exchange[^s03]. Submission is thus a round trip, not a fire-and-forget event.

KoFIU operates a separate reporting system (report.fiu.go.kr), but the public page exposes only its name; account provisioning and file schemas are not published, and access appears limited to institutions whose registration has been accepted (see Limitations). Separately, an institution that appoints or dismisses a reporting officer must register that fact through KoFIU's website using Form 3[^s03]. The order that follows from the regulation is: appoint the reporting officer → register on the website → use the reporting channel _(interpretive)_.

### 5.3 The internal/external double reporting line

The Business Regulation splits reporting into internal and external legs: internally from branches and units to the reporting officer, externally from the reporting officer to the Commissioner of KoFIU[^s04]. For the internal leg it offers three reference patterns: a branch employee drafts the report to a responsible officer who reviews and escalates; a branch employee drafts and escalates directly to the reporting officer; or a branch employee escalates the fact without drafting a report[^s04].

One control matters especially: the person reviewing whether to report, or the reporting officer, may not be the drafter of the report (with an exception for small institutions)[^s04]. This should be read as a requirement on the system's permission model rather than only on the org chart — the account that creates a case and the account that approves it must be distinct _(interpretive)_.

### 5.4 The pipeline

Combining the provisions, the reporting pipeline takes this shape.

1. **Detection** — the monitoring framework identifies abnormal transactions or patterns[^s04].
2. **First-line analysis** — a designated analyst reviews suspected cases using past transactions, credit information, and other data, updating any customer information confirmed along the way[^s04].
3. **Determination** — if judged suspicious, it is reported to the Commissioner of KoFIU. The determining authority is the reporting officer, and the determination date starts the three-business-day clock[^s03][^s04].
4. **Submission** — filed online on the prescribed form[^s03][^s05].
5. **Acknowledgement and correction** — receipt notification is received; correction requests are handled and the exchange recorded[^s03].
6. **Post-filing** — the analysis is captured as structured data, and related records are retained for at least five years[^s04].

Email and spreadsheets are a poor fit. Drafter/approver separation[^s04], recorded rationale for the judgement[^s03], five-year retention[^s01][^s04], and retention of the correction trail[^s03] together presuppose a case-management system with an audit trail _(interpretive)_.

### 5.5 Tipping-off and safe harbour

The fact of a report may not be disclosed. Article 4(6) prohibits anyone at a financial company from disclosing, to anyone including the counterparty, that a report is intended or has been made; the only exceptions are internal disclosure within the same institution for AML/CFT purposes, and reporting to a foreign FIU under that jurisdiction's law[^s01]. Breach carries up to one year's imprisonment or a KRW 10 million fine[^s01]. In product terms this puts customer-support scripts, account-restriction notices, and in-app messages all in scope: telling a user "your account was restricted following a money-laundering report" touches a criminal provision _(interpretive)_.

In the other direction there is a safe harbour. A reporting institution and its staff bear no liability in damages toward the counterparty or related parties except where the false report was made intentionally or through gross negligence, and the Business Regulation confirms that this means civil liability is excluded[^s01][^s04]. Good-faith reporting is protected; the structure is deliberately asymmetric against non-reporting.

The US takes the same shape: SAR rules prohibit a bank and its personnel from disclosing a SAR or any information that would reveal its existence[^s10]. Tipping-off prohibition is a cross-jurisdiction constant.

## 6. Analysis and discussion

### 6.1 Three available paths

**(a) Register directly.** A VASP must obtain ISMS certification and a real-name deposit-and-withdrawal account and file with KoFIU[^s01]. On this path the requirements presuppose one another rather than running in sequence: the issuing institution performs its own ML/TF risk assessment of the VASP and that document forms part of the filing[^s08], so the applicant's AML maturity must already clear a bank's assessment for the filing to stand. The requirements are interdependent rather than sequential.

**(b) Partner.** Partnering with a licensed institution reduces the registration burden but, as §4.6 showed, pushes AML control requirements down by contract[^s24]. In substance you must satisfy your partner's supervisory standard, so the level of requirement does not fall — its source shifts from regulation to contract.

**(c) Design out of scope.** In virtual assets this path genuinely exists. The registration manual lists as potentially out of scope: merely providing a venue for posting buy/sell offers; merely providing advice or technology about transactions; providing key-storage software without independent control over private keys; and manufacturing hardware wallets such as cold wallets[^s08]. Its summary of the FATF test — conducting the activity as a business, on behalf of a customer, actively facilitating virtual-asset activity — points the same way[^s08]. But the manual itself warns that the answer "may differ depending on the individual business form"[^s08], so this path is simultaneously a design choice and a legal judgement, and it can be reversed after the fact.

### 6.2 The limit on automation is liability, not technology

There is no shortage of reports that ML-based monitoring reduces false positives. The literature, however, notes that adoption is not purely technical: empirical work on transaction monitoring concludes that "xAI requirements depend on the liable party in the TM process which changes depending on augmentation or automation"[^s15].

Read against the Korean rules, that becomes concrete. Because the Business Regulation vests the reporting decision in the reporting officer and requires the rationale to be recorded[^s03][^s04], a model may generate alerts, but if no human can articulate why this transaction was judged reportable, the requirement is unmet. The practical result is that explainable rule-based scenarios remain the source of stated grounds while ML is deployed alongside for prioritisation and noise suppression _(interpretive)_. The literature likewise frames its practical architecture as a hybrid that "integrat[es] machine learning techniques, codifying AML red flags" under a least-privilege principle[^s25].

### 6.3 What the international comparison means for design

Three jurisdictions diverge in ways that force architectural branches.

- **Start event and length**: Korea, determination date + 3 business days[^s03]; US, initial detection + 30 days (up to 60 if no suspect identified)[^s10]. The timer's start event itself differs, so case state machines must be separated per jurisdiction.
- **Uniformity of rules**: the EU has moved to a Regulation — AMLR (EU) 2024/1624 — reducing member-state discretion[^s26], with its main provisions applying from 10 July 2027[^s27]. The Commission likewise dates the package's application to 2027[^s11]. Services targeting the EU therefore gain room to reduce per-member-state branching.
- **Layers of supervision**: in Korea, KoFIU writes the rules while inspection is carried out by sector-delegated authorities[^s01][^s02]; in the EU, the new AMLA is designed as a central authority coordinating national authorities[^s11].

### 6.4 The counter-argument: does this regime work?

Everything above rests on the premise that the requirement exists, so it must be built. There is scholarly criticism denying that premise, and it belongs here. In a 2020 article in *Policy Design and Practice*, Pol characterised AML as the world's least effective policy experiment[^s33] _(the article itself is access-limited; quantitative figures rely on secondary summary)_. A secondary summary reports the study's headline figure as "the overall impact of AML policy intervention on criminal finances is less than 0.1 percent – that is, absolutely negligible"[^s34]. The EU panel study cited in §3.3 points the same way, finding no evidence that rising STR volumes causally drive convictions[^s31].

What this means for an operator is not "don't bother". The statutory duties and penalties exist independently of the effectiveness debate[^s01], and sanctions are actually enforced[^s13][^s14]. The implication is about allocation: if the bottleneck on effectiveness is the quality of information and its downstream use rather than the count of filings, then investing in the recorded quality of judgements and in data consistency serves both the regulatory purpose and supervisory expectation better than investing in alert volume _(interpretive)_. That is the same direction as the false-positive debate in §4.3[^s32].

### 6.5 Regulation in motion

Korean virtual-asset regulation is at the second-stage legislation phase (a Digital Asset Basic Act) following the 2024 Virtual Asset User Protection Act, with issuance, circulation, disclosure, and stablecoin regulation under discussion[^s21]. The principal dispute is reported to be a difference between the Bank of Korea and the FSC over stablecoin issuance structure[^s28]. There is no basis for expecting AML requirements to shrink in that process _(interpretive)_ — the enumerated list of "financial companies etc." has expanded each time a new business type entered the regulated perimeter, and the 2021 inclusion of VASPs is the precedent[^s01][^s08].

There is also a confirmed tightening already on the calendar: the reporting officer's experience requirement applies from 13 May 2027[^s12]. A team designing its organisation now is better served by preparing for the 2027 standard than the 2026 one _(interpretive)_.

## 7. Limitations

This report is built from public sources only, and the following could not be verified.

**FATF primary documents.** fatf-gafi.org returns 403 to scripted access, so Recommendation 15 and its interpretive note, the ratings table of Korea's 2020 mutual evaluation report, and the fifth-round methodology could not be cited directly. The international origin of the travel rule was substituted with the domestic implementing provisions[^s02][^s03] and the registration manual's summary[^s08]; the evaluation outcome with the FSC release[^s23]; the fifth-round transition with industry secondary material[^s20]. Accordingly this report makes no claim about the distribution of technical-compliance or effectiveness (Immediate Outcome) ratings.

**Gaps in KoFIU intake and dissemination statistics.** The STR volumes on KoFIU's public pages cover only 2016–2020[^s07]. Annual CTR volumes and the number of cases disseminated to law enforcement could not be obtained from a citable public primary source (the annual-report index page loads only via script and could not be retrieved). The 2025 figures of 1.33 million filings and 3.4% detailed review rest on a single secondary source[^s09] and are not cross-verified. Section 3.3 should be read as an order-of-magnitude judgement only.

**Reporting-system specifications are not public.** The Supervision Regulation prescribes online filing[^s03], but KoFIU's reporting system publishes no account-provisioning procedure, file schema, or error-handling contract. The pipeline in §5.4 is a logical construction derived from the regulations and may differ from the actual screens and interfaces.

**No normative benchmark for monitoring thresholds.** The Business Regulation requires only that a monitoring framework and procedures exist, without prescribing thresholds[^s04], and supervisory inspection manuals are not published. This report therefore offers no answer to "how tight is tight enough", and §4.3 is confined to the structural observation that the burden of proof sits with the operator.

**No domestic guidance on partnership structures.** Section 4.6 and §6.1(b) are inferences from US supervisory practice[^s24] and the ultimate-responsibility principle in the Business Regulation[^s04]; they do not rest on any published Korean supervisory position on AML responsibility allocation in partnership or BaaS structures.

**Confidence interval on the false-positive figure.** The ~95% cited in §4.3 comes from a comment piece by an AML vendor executive[^s16]; it has no denominator and varies widely by institution, scenario, and tuning level. A practitioner critique of the figure is cited alongside it[^s32], but no public dataset was obtained that would settle which position is empirically correct. The academic literature supports only the direction — that false positives are a structural problem[^s25].

**Limited access to the effectiveness critique's primary text.** The Pol article cited in §6.4 could not be read directly because the publisher page returns 403 to scripted access[^s33]. The "less than 0.1 percent" figure rests on a secondary summary[^s34], and the article's measurement method and base year were not verified. That section should be read only as notice that a counter-argument exists.

**Time risk.** The transition window for the Business Regulation amendment (May 2025 – May 2027)[^s12][^s29] and the second-stage legislation debate[^s21][^s28] are both in motion; these sections state the position as of August 2026.
