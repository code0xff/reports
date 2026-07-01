# Claims — ERC-1155 Multi Token Standard

## Introduction
- [x] c01: ERC-1155 is finalized as Ethereum standard EIP-1155, authored by a team led by Witek Radomski (Enjin) and co-authors, and reached "Final" status. — s01, s04
  - kind: factual
- [x] c02: ERC-1155 was motivated by the inefficiency of deploying a separate contract for each token type under ERC-20 and ERC-721, especially in blockchain gaming. — s01, s04, s03
  - kind: interpretive
- [x] c03: A single ERC-1155 contract can represent any combination of fungible, non-fungible, and semi-fungible tokens. — s01, s03
  - kind: technical

## Technical Design & Interface
- [x] c04: The ERC-1155 standard defines a token-type-indexed balance accessed via `balanceOf(account, id)` rather than a per-holder scalar balance. — s01, s05
  - kind: technical
- [x] c05: ERC-1155 defines a metadata URI scheme where clients substitute the hexadecimal token `id` (lowercase, no 0x, zero-padded to 64 chars) for the `{id}` substring in `uri(id)`. — s01
  - kind: technical
- [x] c06: ERC-1155 uses ERC-165 `supportsInterface`; the main interface id is `0xd9b67a26` (receiver `0x4e2312e0`, metadata `0x0e89341c`). — s01
  - kind: technical
- [x] c07: ERC-1155 emits `TransferSingle` for single transfers, `TransferBatch` for batch transfers, `ApprovalForAll` for operator approval, and `URI` for metadata changes. — s01
  - kind: technical

## Core Mechanics
- [x] c08: ERC-1155 transfers multiple token ids/amounts in one transaction via `safeBatchTransferFrom`, reducing overhead versus one transfer per token. — s01, s05
  - kind: technical
- [x] c09: Transfers to contract recipients require `onERC1155Received` / `onERC1155BatchReceived` returning the correct magic value (0xf23a6e61 / 0xbc197c81), else the transfer reverts. — s01, s02, s05
  - kind: technical
- [x] c10: ERC-1155 uses an operator approval model via `setApprovalForAll` (all-or-nothing over every id), with no per-id allowance in the base standard. — s01, s04, s09
  - kind: technical
- [x] c11: The ERC-1155 base standard does not define minting, burning, or total-supply tracking; these come from extensions/implementations (e.g. OZ ERC1155Supply). — s06, s05
  - kind: technical

## Security Considerations
- [x] c12: The receiver-hook callbacks hand control to the recipient during a transfer, creating a reentrancy surface implementations must guard (CEI / reentrancy locks). — s04, s05
  - kind: interpretive
- [x] c13: `setApprovalForAll` grants all-or-nothing control of a user's balance to an operator, a documented phishing/scam risk that has motivated fine-grained approval EIPs. — s08, s10, s09
  - kind: interpretive

## Adoption & Ecosystem
- [x] c14: OpenZeppelin Contracts ships a widely used reference implementation of ERC-1155 with base contract plus extensions. — s02, s06
  - kind: factual
- [x] c15: OpenSea supports ERC-1155 collections and reads per-token metadata via the `uri` method. — s07
  - kind: factual _(single authoritative primary)_

## Discussion — ERC-1155 vs ERC-20 / ERC-721
- [x] c16: ERC-1155 can reduce gas relative to many separate transfers/deployments by batching and sharing one contract. — s01, s05
  - kind: interpretive
- [x] c17: ERC-1155 supports "semi-fungible" tokens — a token id fungible while supply>1 that becomes effectively non-fungible at supply 1. — s03, s01
  - kind: interpretive
- [x] c18: ERC-1155 does not standardize per-id `name`, `symbol`, or `decimals` at the contract level; presentation is via metadata. — s05, s01
  - kind: technical
