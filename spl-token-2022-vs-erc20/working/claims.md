# Claims

_All claims below are checked off — each meets the minimum sourcing in PROTOCOL.md §3. See working/sources.jsonl for the id→claim mapping._


## Background: Token models on Solana vs Ethereum
- [ ] c01: On Solana, token logic lives in a single shared on-chain program while per-token state (supply, balances) lives in separate Mint and Token accounts, whereas on Ethereum each ERC-20 token is an independently deployed contract holding its own balance mapping.
  - kind: technical
  - needs: Solana Token Program docs describing Mint/Token account separation; ERC-20 spec / OpenZeppelin implementation showing per-contract balance mapping.
- [ ] c02: Creating a new SPL token does not require deploying new program bytecode — it only requires initializing a Mint account under the existing Token Program — while creating an ERC-20 token requires deploying a new contract to the EVM.
  - kind: technical
  - needs: Solana docs on InitializeMint under the shared program; Ethereum docs showing ERC-20 deployment as a contract.
- [ ] c03: The shared-program model means a single audited program governs all SPL tokens, so a bug in that program would affect all tokens, whereas ERC-20 bugs are isolated per contract implementation.
  - kind: interpretive
  - needs: A source discussing the systemic-risk / shared-code trade-off of Solana's model.

## The SPL Token Program (Tokenkeg)
- [ ] c04: The original SPL Token program is deployed at the address TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA on Solana mainnet.
  - kind: factual
  - needs: Two independent sources stating the program id (docs + explorer/repo).
- [ ] c05: The SPL Token program supports minting, transferring, burning, freezing/thawing accounts, delegation (approve), and multisig authorities.
  - kind: technical
  - needs: SPL Token program docs / instruction reference.
- [ ] c06: An Associated Token Account (ATA) is a program-derived account that deterministically holds a specific owner's balance of a specific mint, and token accounts require a rent deposit of SOL.
  - kind: technical
  - needs: Solana ATA docs and rent docs.

## SPL Token-2022 and Token Extensions
- [ ] c07: Token-2022 is a separate on-chain program (distinct program id, TokenzQd...) that is a superset of the original SPL Token program and is instruction-for-instruction backward compatible for the original feature set.
  - kind: technical
  - needs: Solana Token-2022 docs stating separate program id and superset relationship.
- [ ] c08: Token-2022 introduces "Token Extensions" including transfer fees, confidential transfers, transfer hooks, interest-bearing tokens, non-transferable (soulbound) tokens, default account state, permanent delegate, CPI guard, and on-chain metadata / metadata pointer.
  - kind: technical
  - needs: Solana Token Extensions docs enumerating the extensions.
- [ ] c09: Tokens minted under the original SPL Token program are not automatically upgraded to Token-2022; the two programs are used side by side and a token's program ownership is fixed at mint creation.
  - kind: technical
  - needs: Docs / discussion stating no automatic migration and per-mint program assignment.
- [ ] c10: Transfer hooks in Token-2022 let a mint author require custom program logic to execute on every transfer, which can implement allowlists/blocklists or royalties.
  - kind: technical
  - needs: Transfer hook extension docs.
- [ ] c11: Confidential transfers in Token-2022 use zero-knowledge / homomorphic-encryption techniques to hide transfer amounts (not sender/receiver identities) on-chain.
  - kind: technical
  - needs: Confidential transfer docs describing what is hidden.

## ERC-20 and the Ethereum extension model
- [ ] c12: The ERC-20 standard (EIP-20) defines a core interface of totalSupply, balanceOf, transfer, transferFrom, approve, allowance, plus Transfer and Approval events.
  - kind: factual
  - needs: EIP-20 specification.
- [ ] c13: ERC-20 uses an approve/transferFrom allowance pattern for delegated spending, which has known UX/security issues (e.g., the approval race condition and unlimited-approval phishing risk) addressed by patterns like increaseAllowance and EIP-2612 permit.
  - kind: technical
  - needs: EIP-20 notes on approve race; EIP-2612 spec; a security writeup on unlimited approvals.
- [ ] c14: Advanced token behavior on Ethereum (gasless approvals, transfer callbacks, vaults) is added through additional standards such as EIP-2612 (permit), ERC-1363 (transferAndCall), ERC-777, and ERC-4626 (tokenized vaults), implemented by inheriting/deploying new contract code rather than by a protocol-level program upgrade.
  - kind: technical
  - needs: EIP-2612, ERC-1363, ERC-777, ERC-4626 specs.

## Comparative analysis
- [ ] c15: Native protocol-level transfer fees are available in Token-2022 (transfer fee extension) but are not part of the ERC-20 standard; "fee-on-transfer" ERC-20 tokens implement fees in custom contract code, which is known to break integrations that assume received amount equals sent amount.
  - kind: technical
  - needs: Token-2022 transfer fee docs; ERC-20 fee-on-transfer integration-hazard writeup.
- [ ] c16: Both Solana token programs support freezing accounts via a freeze authority, while ERC-20 has no standard freeze/blacklist mechanism — freezing on Ethereum tokens (e.g., USDC/USDT) is implemented as non-standard custom contract logic.
  - kind: technical
  - needs: SPL freeze authority docs; USDC/USDT blacklist contract source or writeup.
- [ ] c17: On Solana, wallets/tooling can interact with any SPL or Token-2022 token through one program interface, whereas on Ethereum each token contract is a separate deployment though conforming to the same ABI.
  - kind: interpretive
  - needs: Source on tooling uniformity in Solana vs per-contract Ethereum.

## Discussion
- [ ] c18: Token-2022 (Token Extensions) has been adopted by real issuers, including PayPal's PYUSD and issuers using confidential/transfer-fee features, indicating production use beyond experimentation.
  - kind: factual
  - needs: Two sources confirming a named issuer using Token-2022 (e.g., PYUSD on Solana).
