# Outline — SPL Token / Token-2022 vs ERC-20

## 1. Abstract / 초록
- One-paragraph summary of what SPL Token, SPL Token-2022, and ERC-20 are, and the core architectural difference (program-owned account model vs per-token contract).

## 2. Introduction / 서론
- Why compare Solana token standards with Ethereum's ERC-20.
- What "token standard" means on each chain and the scope of this report.

## 3. Background: Token models on Solana vs Ethereum / 배경: 두 체인의 토큰 모델
- Solana's account model: programs are stateless; token state lives in Mint and Token (ATA) accounts owned by a single shared Token Program.
- Ethereum's contract model: each ERC-20 token is its own deployed contract holding its own balance ledger.
- Why this difference matters (deployment, fungibility of tooling, composability).

## 4. The SPL Token Program (Tokenkeg) / SPL 토큰 프로그램
- What the original SPL Token program provides: mint, transfer, burn, freeze, delegation, multisig.
- Associated Token Account (ATA) model and rent.
- Interface stability and its ubiquity.

## 5. SPL Token-2022 and Token Extensions / SPL 토큰 2022와 확장 기능
- Token-2022 as a separate program that is a superset of SPL Token.
- Token Extensions: transfer fees, confidential transfers, transfer hooks, interest-bearing, non-transferable, metadata pointer/on-chain metadata, default account state, permanent delegate, CPI guard, etc.
- Backward compatibility and migration considerations.

## 6. ERC-20 and the Ethereum extension model / ERC-20와 이더리움 확장 모델
- ERC-20 core interface (transfer, approve/transferFrom, balanceOf, totalSupply, events).
- Extensions via separate EIPs / contract inheritance: EIP-2612 permit, ERC-777, ERC-1363, ERC-4626, metadata, upgradeable proxies.
- How "extensions" happen at the contract level, not protocol level.

## 7. Comparative analysis / 비교 분석
- Feature-by-feature comparison (fees, approvals/delegation, metadata, freezing, confidential transfers, hooks).
- Security surface and failure modes (approval exploits vs program-level bugs, extension risks).
- Developer & tooling ergonomics, cost, and composability.

## 8. Discussion / 논의
- Trade-offs of shared-program vs per-contract design.
- Adoption status of Token-2022 and where each model is heading.

## 9. Limitations / 한계
- What this report does not cover, unresolved gaps, fast-moving areas.

## 10. References / 참고문헌
- Generated from working/sources.jsonl.
