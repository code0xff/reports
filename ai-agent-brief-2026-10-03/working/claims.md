# Claims — ai-agent-brief-2026-10-03

- c01: The x402 batch-settlement feature merged on 2026-09-29 shipped with a refund-lookup regression (server-signed channels, post-restart) and a charge-baseline bug (client-signed voucher used instead of onchain `totalClaimed`), both fixed within three days across TypeScript and Go.
- c02: The baseline bug specifically allowed a facilitator to under-enforce the minimum claimable amount after a full refund, idle auto-refund, or server restart — a correctness gap in money-handling logic, not a cosmetic fix.
- c03: Apple will tighten macOS Full Disk Access so that AI agents cannot inherit that permission's current scope without a more explicit, separate user action, citing the growing risk as agent capability increases.
- c04: Apple's change follows, but does not explicitly name, the dispute over whether Meta's Muse agent accessed a user's private messages without permission.
- c05: Mastercard and an independent crypto-audit executive, at a public panel reported by PaymentsDive, identified the absence of a disclosable, cryptographically provable audit trail — not payment rails or protocol choice — as the current blocker to merchant trust in agentic commerce.
- c06: Stripe, Google, the FIDO Alliance, and the three largest US card networks are working toward common technical standards for agent transactions, with no agreed timeline.
- c07 (why it matters): Three independent actions this window — a protocol bug fix, an OS permission change, and a standards panel — all target the same underlying gap: proof of what an agent did and under what authority, at a different point in the transaction lifecycle (during settlement, before action, after the fact).
