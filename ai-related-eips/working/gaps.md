# Gaps — sweep 1

## Resolved this sweep
- c01 cluster framing (s16, s18, s19, s20)
- c02 ERC-8004 keystone + mainnet (s01, s02, s17)
- c03 ERC-7857 spec + 0G framing (s03, s04)
- c04 ERC-8183 (s10)
- c05 EIP-8141 frame transaction (s11, s12)
- c07 ERC-8211 mention (s18)
- c08 ERC-8126 status + authors + creation date (s05, s07, s08)
- c09 ERC-8126 dependencies (s05)
- c10 ERC-8126 five verification categories + 0–100 risk score + tiers (s05, s06)
- c11 ERC-8126 ZKP / PDV privacy preservation (s05, s06)
- c12 ERC-8126 optional on-chain interface (`AgentVerified` event + `getLatestRiskScore` view) (s06)
- c13 ERC-8126 QCV / AES-256-GCM (s06)
- c14 ERC-8126 ↔ ERC-8004 Validation Registry integration (s05, s06)
- c15 Sybil mitigation via ERC-8004 minting costs (s06)
- c16 TypeScript / Viem reference implementation, no deployed addresses (s06)
- c17 layered stack synthesis (s01, s03, s05, s10, s11, s14, s18)
- c18 "AI EIP" definitional drift (s18, s19, s20)
- c19 mostly-draft state (s19)

## Conflicts noted
- ERC-8126 is referenced as **"AI Agent Registration and Verification"** in the Magicians thread (s07, s09) and on X (s08), but the canonical EIPs page title is **"AI Agent Verification"** alone (s05). The draft will use the canonical title and footnote the alternate.
- ERC-8126 is described as "primarily an off-chain standard for verification providers" but it does define an *optional* on-chain registry interface (s06). Both facts are presented in the draft to avoid implying a contradiction.

## Outstanding (Limitations material)
- No deployed mainnet contract addresses for ERC-8126; reference implementation in TypeScript/Viem only (s06). Production maturity bounded.
- No third-party security audit of ERC-8126 surfaced.
- Long-horizon adoption numbers ("130,000 ERC-8004 agents projected by 2026") are forward-looking projections and excluded from the draft.

Sweep count: 1 of 6 used. Stopping; remaining gaps are Limitations material.
