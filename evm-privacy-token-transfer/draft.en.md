# EVM Privacy Token Transfer Methods and Practical Implementation Guide

## Abstract

EVM-based blockchains, including Ethereum, expose all addresses, balances, and transaction histories by design — failing to meet legitimate privacy requirements for enterprise payments, OTC trades, and personal financial privacy. This analysis compares four practically viable technical approaches as of 2026 — ① ERC-5564/6538 stealth addresses, ② Railgun ZK shield pools, ③ Aztec Network ZK L2, and ④ Zama FHEVM/ERC-7984 — alongside the historical reference points of Tornado Cash and Privacy Pools. For full-privacy production services requiring compliance, **Railgun with Private Proofs of Innocence** is the most mature choice. For cases requiring only recipient anonymity, **ERC-5564 stealth addresses** offer the lowest implementation complexity. Aztec holds significant promise for programmable privacy but was placed on hold after a critical vulnerability discovery in March 2026, while Zama FHE is suitable for institutional OTC but faces barriers from coprocessor dependencies and high gas costs for general services.

---

## 1. Introduction

### 1.1 The Problem with Ethereum Transparency

EVM-based blockchains expose all account addresses, balances, and transaction histories to public view[^s14]. This transparency provides auditability and trust but creates practical problems: business payment amounts are visible to competitors, trading history can be analyzed by adversaries, and individuals lose financial privacy. Information that is routinely protected in traditional finance is publicly exposed by default on the blockchain[^s15].

### 1.2 The Regulatory Dilemma: The Tornado Cash Case

OFAC sanctioned Tornado Cash in August 2022, applying the novel legal theory that immutable smart contracts constitute "property" under IEEPA[^s07]. This created legal uncertainty for the entire privacy technology development community. However, in November 2024, the U.S. Fifth Circuit Court of Appeals held that Tornado Cash's immutable smart contracts lack "ownership, control, and exclusivity" and cannot be sanctioned as property. The Treasury formally lifted the sanctions on March 21, 2025[^s07]. This ruling established a legal precedent distinguishing smart contract code from service operation.

### 1.3 Scope

This report covers privacy token transfer methods that are deployed or near-deployment on EVM mainnet and EVM-compatible L2s. Purely off-chain solutions (Zcash, Monero) and non-EVM privacy chains (Secret Network, Penumbra) are out of scope. We analyze each technology's cryptographic foundations, compliance design, developer ecosystem, and current production readiness.

---

## 2. Background: Privacy Threat Model and Cryptographic Foundations

### 2.1 Three Dimensions of Privacy Goals

EVM privacy technologies target different objectives[^s14][^s15]:

- **Sender anonymity**: hiding who sent the tokens
- **Recipient anonymity**: hiding who received the tokens
- **Amount confidentiality**: hiding how much was transferred

No single technology achieves all three perfectly; the appropriate level must be chosen based on the use case.

### 2.2 Core Cryptographic Tools

**zk-SNARK (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge)** allows a prover to demonstrate knowledge of information without revealing it. Railgun and Aztec use this as their core primitive[^s03][^s05]. **ECDH (Elliptic Curve Diffie-Hellman)** allows two parties to create a shared secret over a public channel — the foundation of ERC-5564 stealth addresses[^s01]. **Fully Homomorphic Encryption (FHE)** enables computation on encrypted data without decryption, enabling Zama FHEVM to manage confidential on-chain balances[^s04].

---

## 3. Technical Approaches: Classification and Mechanisms

### 3.1 Stealth Addresses (ERC-5564 / ERC-6538)

Stealth addresses target **recipient anonymity**. The sender uses SECP256k1 ECDH with the recipient's stealth meta-address to generate a one-time stealth address, then sends tokens to it[^s01]. The recipient scans the blockchain using their viewing key to identify incoming transactions, then accesses funds using their spending key.

ERC-5564's **view tag** — a 1-byte hint — reduces the computational work of scanning by approximately 6× by allowing non-matching announcements to be dismissed early[^s01]. ERC-6538 defines an on-chain stealth meta-address registry[^s02]. The announcement contract is deployed as a singleton at `0x55649E01B5Df198D18D95b5cc5051630cfD45564`[^s01].

**Key limitation**: Stealth addresses do not provide sender anonymity or amount confidentiality. The recipient also faces a gas bootstrapping problem — stealth addresses start with no ETH for gas fees — which ERC-4337 account abstraction Paymaster mechanisms are being explored to address[^s12].

### 3.2 ZK Shield Pools — Railgun

Railgun is a zk-SNARK-based shield pool providing **sender, recipient, and amount privacy**. Shielding ERC-20 tokens into the Railgun contract moves them to the 0zk address system, after which all transactions are processed via off-chain ZK proofs. It is deployed on Ethereum, Polygon, Arbitrum, and BNB Chain[^s03].

**Private Proofs of Innocence (Private POI)** is Railgun's compliance layer. Using data from five list providers (Elliptic, ScamSniffer, PureFi, SlowMist, Chainalysis Sanctions Oracle), a recursive zk-SNARK proof is automatically generated at shield time demonstrating that the tokens do not appear on known bad-actor lists[^s03]. This proof demonstrates legitimacy without revealing any 0zk address details or transaction history, enabling privacy and compliance to coexist[^s13].

### 3.3 ZK L2 Privacy — Aztec Network

Aztec is a ZK rollup L2 offering **programmable privacy**. Its ZK² architecture combines individual transaction proofs with rollup proofs, and developers write private smart contracts in the Noir language. It supports three privacy pillars: data (private transactions), identity (anonymous accounts), and compute (private contract execution)[^s05].

However, after the November 2025 Ignition chain launch, a critical vulnerability affecting the entire proving system was discovered on March 17, 2026[^s05][^s10]. Exploitation could enable theft of user funds, and a patch is planned for the July 2026 v5 release. The official guidance is to "not deposit more value than you are willing to lose."

### 3.4 FHE-Based — Zama FHEVM / ERC-7984

ERC-7984 can be thought of as "confidential ERC-20." Contracts store encrypted handles rather than plaintext balances, and an off-chain FHE coprocessor network performs the actual encrypted computations. A gateway coordinates between coprocessors and the chain; a threshold KMS manages distributed decryption[^s04].

In March 2026, GSR and Zama completed the first confidential institutional OTC trade on Ethereum using this system, executed between fully KYC-compliant counterparties[^s11]. OpenZeppelin-audited contracts are deployed on Mainnet[^s04].

---

## 4. Implementations in Detail

### 4.1 Railgun

Railgun is among the most mature production-ready EVM privacy infrastructures available today. Private POI provides compliance-friendly privacy for institutional DeFi users[^s13], and multi-chain deployment enables direct integration with the Ethereum DeFi ecosystem (Uniswap, Aave, etc.). An Unshield-Only Standby Period of one hour after shielding prevents rapid address hopping[^s03].

However, its compliance record carries significant controversy. In January 2023, the FBI publicly attributed Railgun use to the Lazarus Group (North Korea) for laundering approximately $60M in ETH stolen in the June 2022 Harmony Horizon Bridge exploit[^s17]. Railgun denied the allegation, asserting its POI system blocks sanctioned addresses. However, ChainArgos research found that POI-related code only appeared in Railgun's public repository in November 2023 — months after the DPRK flows occurred[^s16]. The POI system was therefore not operational at the time of the incident. Service developers must weigh this history and conduct their own risk assessment before adopting Railgun.

### 4.2 Aztec Network

Aztec is not suitable for production deployment as of May 2026 following the March 2026 critical vulnerability discovery[^s05][^s10]. Alpha throughput is limited to 1 TPS _(vendor-stated)_. The security posture should be reassessed after the v5 patch in July 2026.

### 4.3 Zama FHEVM / ERC-7984

FHE operations incur higher gas costs than standard ERC-20 transfers; Zama reports a recent 100× improvement but targets an additional 100× optimization _(vendor-stated)_[^s04]. The OpenZeppelin Wizard for confidential token generation is still "coming soon"[^s04]. The selective disclosure capability — sharing decryption access with designated auditors or regulators — is a strong differentiator for regulated financial services[^s04].

### 4.4 ERC-5564 / ScopeLift SDK

ScopeLift's `@scopelift/stealth-address-sdk` v1.0.0-beta.5 (April 30, 2026) implements ERC-5564 and ERC-6538 in TypeScript, providing stealth address generation, private key computation, and announcement scanning[^s06]. Only SECP256k1 (Scheme ID 1) is currently supported, and the library remains in beta.

### 4.5 Tornado Cash → Privacy Pools

Tornado Cash's frontend and ecosystem effectively shut down after the 2022 OFAC sanctions. Sanctions were lifted March 21, 2025[^s07], but developer prosecutions (Roman Semenov) remain ongoing as separate proceedings. The successor model, **Privacy Pools**, was launched on Ethereum mainnet by the 0xbow team on March 31, 2025[^s08], with Vitalik Buterin — co-author of the 2023 research paper the protocol is based on — publicly supporting the project[^s09]. Association Set Providers (ASPs) enabling ZK compliance proofs are the key differentiator from Tornado Cash[^s09]. The protocol recorded $6M in transaction volume and 1,500+ users by November 2025[^s08].

---

## 5. Regulatory and Compliance Environment

### 5.1 Significance of the Tornado Cash Ruling

The Fifth Circuit's _Van Loon v. Treasury_ ruling established that immutable smart contracts are not sanctionable property[^s07]. It suggests that concerns about publishing smart contract code creating sanctions risk were overstated, and provides a legal foundation distinguishing service operators from tool developers.

### 5.2 Privacy Pools: A New Compliance Design Paradigm

Vitalik Buterin and co-authors argued in 2023 that privacy and regulatory compliance need not be mutually exclusive[^s09]. In the Privacy Pools model, users can demonstrate via ZK proof that their funds did not originate from illicit sources — without revealing their full transaction graph. This contrasts with Tornado Cash's "black-box anonymity," providing auditors with verifiable minimum-disclosure attestations[^s08][^s09].

### 5.3 Compliance Design Principles for Developers

Key principles for service developers:
1. Separate the compliance layer from the cryptographic core from the outset (Railgun's POI model).
2. Design selective disclosure mechanisms accessible to regulators (ERC-7984's designated auditor model).
3. Clearly separate immutable contracts from the frontend service layer to minimize the regulatory contact surface.

---

## 6. Practical Implementation Guide: Choosing by Use Case

### 6.1 Selection Framework

| Criterion | Stealth Addresses (ERC-5564) | Railgun | Aztec | Zama FHE/ERC-7984 |
|---|---|---|---|---|
| Privacy scope | Recipient only | Sender + Recipient + Amount | Sender + Recipient + Amount + Contract | Amount + Balance (on-chain encrypted) |
| Compliance | None | Private POI ✅ | Incomplete | Selective disclosure ✅ |
| Dev complexity | Low | Medium | High (Noir language) | High (coprocessor infra) |
| Production ready | ✅ (beta SDK) | ✅ mature | ❌ vulnerability (patch Jul 2026) | ⚠️ mature for institutions |
| Supported chains | All EVM | ETH, Polygon, Arbitrum, BNB | L2 only | Mainnet (FHE infra required) |
| Gas cost | Low | Medium | Medium | High (vs. standard ERC-20) |

### 6.2 Recipient Anonymity Only: ERC-5564 Stealth Addresses

When concealing the recipient's identity is sufficient (e.g., B2B payments where payer amounts are acceptable), ERC-5564 is the most pragmatic choice. Full compatibility with existing EVM infrastructure and rapid integration via ScopeLift SDK (`npm install @scopelift/stealth-address-sdk`) make it accessible[^s06]. The gas bootstrapping problem can be addressed with ERC-4337 Paymaster gas sponsorship[^s12]. Note that sender address and transfer amount remain visible.

### 6.3 DeFi Integration + Full Privacy: Railgun

When integrating with DeFi protocols while hiding sender, recipient, and amount, and with compliance requirements, Railgun is among the most mature choices available in 2026[^s03][^s13]. Private POI enables institutional-grade compliance, and multi-chain deployment allows direct connection to existing Ethereum DeFi protocols. However, the 2023 FBI Lazarus Group allegation and the pre-POI adoption history warrant a self-conducted risk assessment before production use[^s16][^s17].

### 6.4 Programmable Privacy Applications: Aztec (On Hold)

For complex private smart contracts — private voting, sealed auctions, confidential DeFi — Aztec is the only realistic candidate[^s05]. However, **production deployment is not recommended** following the March 2026 critical vulnerability[^s05][^s10]. Reassess after the July 2026 v5 patch and at least 3 months of stable operation.

### 6.5 Institutional Confidential Financial Services: Zama FHEVM / ERC-7984

For KYC-compliant institutional-to-institutional confidential payments and private RWA tokenization, ERC-7984 is the appropriate choice[^s04][^s11]. Selective disclosure capabilities allow providing minimum necessary information to regulators, and OpenZeppelin-audited contracts are available. However, high gas costs and coprocessor infrastructure dependency create barriers for smaller-scale services.

---

## 7. Limitations

**Unresolved Aztec Vulnerability**: The March 2026 proving system vulnerability is scheduled for a v5 fix in July 2026[^s05]. The official guidance — "do not deposit more than you are willing to lose" — signals a limited security ceiling during the Alpha phase. New vulnerabilities may emerge after the patch.

**FHE Coprocessor Centralization Risk**: The degree of decentralization of Zama FHEVM's coprocessor network has not been independently verified beyond Zama's own claims[^s04]. A coprocessor network failure could disrupt service.

**Regulatory Environment Uncertainty**: The Tornado Cash sanctions lift (March 2025) is a positive precedent, but regulatory direction in non-U.S. jurisdictions remains uncertain[^s07]. Privacy protocol operators (service layer) may face different legal risks than tool developers.

**Stealth Address UX Gap**: The problem of recipients obtaining gas fees for stealth addresses remains unresolved[^s12]. ERC-4337 integration is in the research stage with no production standard.

**ERC-7984 Draft Status**: ERC-7984 remains in Draft status; final adoption is not guaranteed. The OpenZeppelin Wizard for confidential token generation is still "coming soon"[^s04].

**Absence of Independent Security Audits**: A current independent security audit of Railgun contracts has not been publicly confirmed. Protocol TVL and adoption figures rely on third-party sources rather than official dashboards.

**Railgun Compliance History**: The FBI's January 2023 allegation attributing Lazarus Group (DPRK) use of Railgun for laundering $60M in ETH, and the ChainArgos finding that POI code was absent from the public repository at the time of those flows[^s16][^s17], remain unresolved by independent audit. Railgun disputes the allegation. Developers should treat this as an open risk factor.
