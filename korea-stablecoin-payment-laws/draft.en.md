# Korean Laws Affecting Stablecoin Payments: A Detailed Impact Analysis

## Abstract

As of mid-2026, Korea has no single in-force statute that directly governs the issuance and payment use of stablecoins; the rules are scattered across several existing laws and pending legislation.[^s01][^s03][^s04] The **Virtual Asset User Protection Act** (in force July 2024) is a "phase-one" law focused on user protection and unfair-trading rules and does *not* regulate stablecoin issuance.[^s01][^s02] The issuance/circulation framework hinges on the proposed **Digital Asset Basic Act** ("phase two"), whose bills share a common core — Financial Services Commission (FSC) licensing, ≥100% reserves, a ban on paying interest to holders, and regulation of offshore won-denominated coins — but split on the issuer (banks vs. non-banks).[^s03][^s04][^s10] Meanwhile, the *practical* payment reality is shaped by the in-force **Electronic Financial Transactions Act** (e-payment-instrument / PG classification),[^s05][^s06] the **AML/Travel-Rule law** (특금법),[^s05] and the **Foreign Exchange Transactions Act** (external means of payment; illicit FX),[^s06][^s08][^s09] while even if issuance is allowed, **network-separation and banking-commerce-separation** rules risk a "half-measure" regime that limits payment use.[^s07] Disagreement between the FSC and the Bank of Korea over the issuer (a "bank 51% rule") has pushed the government bill past 2025.[^s11][^s13]

## 1. Introduction

Stablecoins are touted for their payment potential, but using them for payments in Korea sits across several legal grey zones. This report focuses not on *issuance per se* but on **the laws that materially affect stablecoin payments and their impact**. It separates (1) currently in-force laws that already apply (Virtual Asset User Protection Act, AML law, Electronic Financial Transactions Act, Foreign Exchange Act) from (2) pending legislation that would build a new issuance/circulation framework (Digital Asset Basic Act), and maps how each bears on issuance, circulation, payment, and cross-border transfer.[^s01][^s03][^s05] Evidence is drawn from 2025–2026 primary statutes, think-tank analyses, legal/accounting commentary, and journalism.

## 2. Background: Korea's two-phase virtual-asset regulation

Korea's virtual-asset regulation was deliberately staged. The starting point was the March 2021 amendment to the **Act on Reporting and Use of Specific Financial Transaction Information** (특금법), which introduced VASP registration and AML measures including the travel rule.[^s05] Next, the **Virtual Asset User Protection Act**, enacted July 2023 and in force on 19 July 2024, is the phase-one statute: it governs protection of user deposits and assets, unfair-trading rules, and the regulator's supervisory/sanction powers.[^s01][^s02]

Crucially, this phase-one law does **not regulate stablecoin issuance**. By a parliamentary supplementary opinion at enactment, comprehensive rules covering stablecoin issuance and circulation were deferred to phase-two legislation (the Digital Asset Basic Act).[^s03][^s05] So today's stablecoin payments are governed not by a "stablecoin-specific law" but by the *partial* application of pre-existing statutes.

## 3. How current law affects stablecoin payments

**Electronic Financial Transactions Act (EFTA).** This is the pivot for payment-instrument regulation. The prevailing reading is that virtual assets (including stablecoins) are hard to treat as an EFTA "electronic payment instrument." However, acting as an intermediary to settle payment for goods/services may qualify as "electronic payment settlement agency" (PG) business.[^s05][^s06] _(A legal interpretation — not fixed by a single statute or settled case law.)_ The Korea Capital Market Institute likewise judges that bringing stablecoins into the regulated payment perimeter would require "amending individual laws such as the Foreign Exchange Transactions Act and its regulations, or the Electronic Financial Transactions Act."[^s06] In short, the current EFTA does *not* clearly capture stablecoin payments, and aligning them with e-money / prepaid-instrument rules remains an open task.

**Foreign Exchange Transactions Act (FETA).** The most sensitive law for cross-border payment/remittance. The government (Ministry of Economy and Finance) is reviewing whether to designate stablecoins such as USDT as an FETA "external means of payment," like the US dollar or yen, and has commissioned research on violations and reform.[^s08][^s09] The driver is capital-flight and regulatory-arbitrage concern: stablecoins reportedly account for over 90% of crypto-based illicit FX ("hwanchigi"), highlighting a regulatory gap.[^s12] _(unverified — single source)_ KCMI warns that "given the nature of coin transactions, many individuals can bypass the FX system and engage in cross-border transfers quickly and easily," urging urgent alignment of FX policy.[^s06]

**AML/Travel-Rule law (특금법).** Stablecoin transactions through VASPs are subject to registration, travel-rule, and AML duties. These apply not to issuance but to *circulation/payment channels* (exchanges, wallet services), directly shaping the compliance cost of stablecoin payment infrastructure.[^s05]

**Virtual Asset User Protection Act.** As noted, it does not govern issuance, but VASPs that handle stablecoins (listing, custody, trading) are subject to its user-protection and unfair-trading rules. So long as a payment stablecoin trades on an exchange, it falls within this law's reach.[^s01][^s02]

## 4. The Digital Asset Basic Act: the issuance/payment framework

The law that will actually define the future of stablecoin payments is the **Digital Asset Basic Act** (phase two). The pending bills (compared across five proposals including Rep. Min Byeong-deok's) share these features:[^s03][^s04][^s10]

- **FSC licensing**: only an FSC-licensed entity may issue domestic stablecoins. Some bills adopt an offshore (Hong Kong-style) approach that "includes won-denominated stablecoins issued abroad" within the licensing scope.[^s03]
- **≥100% reserves**: every bill except Rep. Min's requires holding ≥100% in cash-equivalent assets (won, foreign currency, etc.).[^s03]
- **No interest to holders**: paying interest is prohibited to prevent de-facto deposit substitution.[^s03][^s10]
- **Capital threshold**: debated from KRW 500 million (some early bills) up to KRW 5 billion (~USD 3.5 million).[^s04][^s10]

The bills diverge on the issuer. The non-bank proposals (e.g., Reps. Ahn Do-geol / Kim Eun-hye / Kim Hyun-jeong) treat the stablecoin as a digital asset issuable by private entities meeting capital/collateral requirements under FSC supervision; the bank proposal (Rep. Park Sung-hun) treats it as quasi-currency, restricting issuance to FSC-designated banks with Bank of Korea / MOEF oversight and external-remittance tracking.[^s04]

## 5. Institutional conflict and barriers to payment use

**FSC vs. Bank of Korea.** The biggest dispute is the issuer. Citing financial stability, the Bank of Korea argues for a **bank 51% rule** — allowing issuance only by consortia in which banks hold ≥51% — plus a unanimous-consent council, while the FSC wants the equity structure to be flexible by business model.[^s13][^s04] The BOK is conservative because a stablecoin could effectively become a means of payment and a deposit substitute, touching monetary sovereignty and payment-system stability; it has actively pushed a CBDC as the alternative.[^s03][^s13] This turf conflict is not new — the two agencies clashed over oversight of big-tech payments during the 2020 EFTA amendment.[^s03]

**Network-separation and banking-commerce separation.** Even if issuance is allowed, payment use may be blocked. If the strict network-separation duty applied to financial firms applies as-is, then "given that stablecoins inherently require connection to external blockchain networks, maintaining the current rules could make actual service implementation difficult."[^s07] And a conservative reading of banking-commerce separation means "financial firms' entry into the virtual-asset market is structurally restricted," making it hard for banks/brokerages to hold stablecoin operators as subsidiaries.[^s07] The result could be a "half-measure" regime where allowing issuance does not translate into payment adoption.[^s07]

**Legislative delay.** Because of these disagreements, submission of the government bill institutionalizing the won stablecoin slipped past 2025.[^s11] The ruling party aims to merge the government and member bills and pass them in the first half of 2026 by persuading the BOK, but issues like the bank 51% rule remain.[^s13]

## 6. Synthesis of impact

From a *payments* standpoint, the laws' impact can be summarized:

| Law / rule | Status | Impact on payments |
| --- | --- | --- |
| AML/Travel-Rule law (특금법) | In force (2021–) | VASP registration, travel rule, AML — sets compliance cost of circulation/payment channels[^s05] |
| Virtual Asset User Protection Act | In force (2024.7) | Issuance not covered, but user-protection/unfair-trading rules apply to VASPs handling stablecoins[^s01][^s02] |
| Electronic Financial Transactions Act | In force | Stablecoin's status as "e-payment instrument" unclear; settlement agency may be PG — a key variable for payment business structure[^s05][^s06] |
| Foreign Exchange Transactions Act | Under review | If designated an external means of payment, directly regulates cross-border payment/remittance to curb illicit FX[^s06][^s08][^s09] |
| Digital Asset Basic Act (pending) | Not finalized | Issuance licensing, 100% reserves, interest ban, issuer decision — determines whether a payment coin *exists at all*[^s03][^s04] |
| Network/banking-commerce separation | In force (interpretation) | Restricts financial-firm participation and service implementation — hinders payment adoption even if issuance is allowed[^s07] |

In short, the real constraint on payment adoption is not a single "is issuance allowed?" switch (the Digital Asset Basic Act) but the simultaneous need to resolve **payment-business classification under the EFTA, cross-border regulation under the FETA, and the operational barriers of network/banking-commerce separation**. If issuance alone is permitted while the rest is not coherently aligned, payment use will remain limited.[^s06][^s07]

## 7. Limitations

- **Unfinalized, fast-moving legislation.** The Digital Asset Basic Act is unpassed as of 2026-06, and issuer/capital/reserve details may change; the government bill is delayed, so "current state" claims may be stale within months.[^s11][^s13]
- **Unresolved issuer question.** Non-bank (FSC) vs. bank 51% rule (BOK) is an ongoing negotiation; this report presents both sides without ruling.[^s04][^s13]
- **Interpretive / under-review items.** EFTA PG classification (prevailing interpretation) and FETA external-means-of-payment designation (under review) are not settled statute/practice.[^s05][^s06][^s08]
- **Single-source statistic.** The claim that >90% of illicit FX uses stablecoins rests on a single report (s12).[^s12]
- **Source skew.** Aside from the primary statute (Virtual Asset User Protection Act), much of the evidence is Korean-language journalism, commentary, and think-tank work; the text of each Digital Asset Basic Act bill was substituted with comparative analyses and reporting. Subordinate regulation (enforcement decrees, supervisory rules) is unsettled and not covered.[^s01][^s03][^s14]
