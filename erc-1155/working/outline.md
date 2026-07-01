# Outline — ERC-1155 Multi Token Standard

1. **Abstract** — One-paragraph summary of what ERC-1155 is, why it exists, and the key findings of the report.
2. **Introduction** — The problem ERC-1155 solves: per-token-type contract proliferation under ERC-20/ERC-721, gaming/marketplace motivation, standardization history (EIP-1155, Enjin authorship, Final status).
3. **Technical Design & Interface** — The single-contract multi-token model; the standard's required functions and events; `id`-based accounting; the metadata URI scheme with `{id}` substitution.
4. **Core Mechanics** — Batch operations (`safeBatchTransferFrom`, `balanceOfBatch`), safe-transfer receiver hooks (`onERC1155Received` / `onERC1155BatchReceived`), approval model (`setApprovalForAll`), and supply/mint/burn patterns.
5. **Security Considerations** — Receiver-hook reentrancy surface, approval-for-all risk, the EIP's own security notes, and known implementation pitfalls.
6. **Adoption & Ecosystem** — Reference implementations (OpenZeppelin), wallet/marketplace support (OpenSea), real-world usage, and standing in the EIP process.
7. **Discussion — ERC-1155 vs ERC-20 / ERC-721** — Gas/efficiency trade-offs, fungible vs non-fungible vs semi-fungible, when each standard is appropriate, and extensions (ERC-1155 Supply, metadata).
8. **Limitations** — Gaps in evidence, contested claims, and what remains uncertain.
9. **References** — Generated from sources.jsonl.
