# Outline: Bitcoin Taproot and Taproot Assets

## 1. Abstract
Summary of findings on Taproot (BIP 340/341/342) and the Taproot Assets protocol.

## 2. Introduction
Background on Bitcoin's scripting evolution; why Taproot matters; scope of this report.

## 3. Background: Bitcoin Script and Prior Upgrades
P2PK → P2PKH → P2SH → SegWit history; Schnorr signatures vs ECDSA; MAST concept.

## 4. Taproot: BIP 340, 341, and 342
- BIP 340: Schnorr signatures
- BIP 341: Taproot output structure (Pay-to-Taproot, Tapscript commitment)
- BIP 342: Tapscript opcodes
- Activation via Speedy Trial (BIP 9) in November 2021

## 5. Taproot Assets Protocol
- Origin as Taro (Lightning Labs, 2022) → renamed Taproot Assets
- Asset issuance on Bitcoin mainnet using Taproot outputs
- Merkle tree asset universe, sparse Merkle tree proofs
- Lightning Network integration for asset transfers
- Client-side validation model

## 6. Technical Architecture and Cryptographic Foundations
- Pedersen-style commitments, sparse Merkle trees, Pay-to-Taproot embedding
- Proof sizes and verification complexity
- Comparison with RGB and Ordinals/BRC-20 approaches

## 7. Ecosystem Status and Adoption
- Lightning Labs mainnet alpha launch (October 2023)
- Wallet and exchange integrations
- USD-denominated stablecoins on Taproot Assets
- Developer tooling: tapd daemon, LND integration

## 8. Limitations and Open Questions
- Client-side validation trade-offs vs on-chain verification
- Scalability of asset universe discovery
- Regulatory and custodial concerns for tokenized assets
- Protocol maturity and audit status

## 9. References
Auto-generated from sources.jsonl.
