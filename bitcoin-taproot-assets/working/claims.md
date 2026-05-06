# Claims: Bitcoin Taproot and Taproot Assets

## Introduction
- [ ] c01: Bitcoin's scripting language has evolved through multiple soft-fork upgrades since 2012 to improve privacy, efficiency, and programmability.
  - kind: factual
  - needs: BIP timeline references, activation block heights
- [ ] c02: The Taproot upgrade (activated November 2021) is the most significant Bitcoin protocol change since SegWit in 2017.
  - kind: interpretive
  - needs: developer commentary, upgrade comparison references

## Background: Bitcoin Script and Prior Upgrades
- [ ] c03: Schnorr signatures are mathematically simpler and more efficient than ECDSA, enabling key aggregation (MuSig) and linear signature properties.
  - kind: technical
  - needs: BIP 340 spec, cryptography papers
- [ ] c04: MAST (Merklized Abstract Syntax Trees) allows Bitcoin scripts to hide unused script branches, improving privacy and reducing on-chain data.
  - kind: technical
  - needs: BIP 114/BIP 116 references, BIP 341 spec
- [ ] c05: SegWit (activated August 2017) fixed transaction malleability and enabled payment channels, laying the groundwork for the Lightning Network.
  - kind: factual
  - needs: BIP 141, activation block reference

## Taproot: BIP 340, 341, and 342
- [ ] c06: BIP 340 specifies 64-byte Schnorr signatures over secp256k1, replacing 71-73 byte DER-encoded ECDSA signatures, reducing witness data size.
  - kind: technical
  - needs: BIP 340 specification
- [ ] c07: BIP 341 defines Pay-to-Taproot (P2TR) outputs where the scriptPubKey commits to both an internal key and a Merkle root of script spending paths.
  - kind: technical
  - needs: BIP 341 specification
- [ ] c08: Taproot was activated on Bitcoin mainnet at block height 709,632 in November 2021 via the Speedy Trial soft-fork activation mechanism.
  - kind: factual
  - needs: block explorer confirmation, BIP 9 activation reference
- [ ] c09: BIP 342 introduces new Tapscript opcodes (OP_CHECKSIGADD) enabling efficient multi-signature constructions without the overhead of OP_CHECKMULTISIG.
  - kind: technical
  - needs: BIP 342 spec
- [ ] c10: Taproot transactions that spend via the key path are indistinguishable from single-key P2TR spends, improving privacy for complex smart contracts.
  - kind: technical
  - needs: BIP 341 analysis, privacy research

## Taproot Assets Protocol
- [ ] c11: Taproot Assets (formerly Taro) was proposed by Lightning Labs in April 2022 and the mainnet alpha was released in October 2023.
  - kind: factual
  - needs: Lightning Labs announcement, GitHub release
- [ ] c12: Taproot Assets embeds asset metadata commitments inside Taproot outputs using a sparse Merkle sum tree, without requiring changes to Bitcoin's consensus rules.
  - kind: technical
  - needs: Taproot Assets spec/BIP draft, Lightning Labs technical writeup
- [ ] c13: The protocol uses client-side validation, meaning asset state transitions are verified by recipients rather than all Bitcoin nodes.
  - kind: technical
  - needs: Taproot Assets spec, comparison with on-chain validation
- [ ] c14: Taproot Assets can be transferred over the Lightning Network using a modified HTLC structure that carries asset proofs alongside satoshi routing.
  - kind: technical
  - needs: LND/tapd documentation, technical blog posts

## Technical Architecture and Cryptographic Foundations
- [ ] c15: Taproot Assets uses a sparse Merkle sum tree (MS-SMT) to commit to asset balances, allowing efficient inclusion and exclusion proofs.
  - kind: technical
  - needs: Taproot Assets BIP (bip-tap-*), GitHub implementation
- [ ] c16: Unlike Ordinals/BRC-20 which embed data in witness fields, Taproot Assets uses Tapscript leaves to commit asset data with cryptographic proofs.
  - kind: technical
  - needs: comparison analysis, technical documentation
- [ ] c17: RGB protocol is an alternative to Taproot Assets also using client-side validation, but with a different commitment scheme based on single-use seals.
  - kind: technical
  - needs: RGB specification, comparison documentation
- [ ] c18: Taproot Assets proof files can grow with the asset's transaction history, posing scalability challenges for long-lived assets.
  - kind: technical
  - needs: protocol documentation, developer commentary

## Ecosystem Status and Adoption
- [ ] c19: Lightning Labs released the tapd mainnet alpha in October 2023, enabling asset issuance and transfer on Bitcoin mainnet.
  - kind: factual
  - needs: official announcement, GitHub release tag
- [ ] c20: Stablecoins (USD-denominated) have been issued on the Taproot Assets protocol, with Lightning Labs and partners enabling dollar transfers over Lightning.
  - kind: factual
  - needs: announcements, exchange/wallet partner statements
- [ ] c21: The Taproot Assets protocol has a formal BIP specification process, with BIPs submitted to the Bitcoin Improvement Proposals repository.
  - kind: factual
  - needs: BIP repository reference
- [ ] c22: Developer tooling for Taproot Assets includes the tapd daemon and integration with LND, with a Go-based SDK for asset operations.
  - kind: technical
  - needs: GitHub repository, documentation

## Limitations and Open Questions
- [ ] c23: Client-side validation means asset history proofs are not stored on-chain, creating risks of proof loss and requiring robust off-chain data availability.
  - kind: technical
  - needs: protocol docs, developer discussion
- [ ] c24: The Taproot Assets asset universe discovery mechanism requires connecting to asset-specific universe servers, introducing centralization concerns.
  - kind: interpretive
  - needs: protocol documentation, developer commentary
- [ ] c25: As of 2024-2025, the Taproot Assets protocol has not undergone a comprehensive independent security audit of the full specification.
  - kind: factual
  - needs: audit reports, security disclosures
