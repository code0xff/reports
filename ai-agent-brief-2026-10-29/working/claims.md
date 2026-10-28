# Claims

c01. x402-foundation/x402 PR #3983 (merged 2026-10-28) migrates every TypeScript package from zod 3 to zod ^4.6.6, the first release line that fixes GHSA-mrhx-c7xc-m3w5 (unbounded-array memory exhaustion); companion PRs #3982 (Python) and #3984 (Go) raise dependency floors for the same class of published advisories the same day.

c02. As of this edition, `@coinbase/cdp-sdk` is still on 1.60.0 (released 2026-10-22, before the x402 fix landed) and still declares `zod ^3.25.76`, so sellers using the CDP facilitator remain exposed to GHSA-mrhx-c7xc-m3w5 even though the vulnerability is now patched in x402's own packages — the fix moved one hop up the chain, not all the way up it.

c03. x402's automated SDK-drift bot opened issue #4025 on 2026-10-28 flagging two more cross-SDK inconsistencies (SVM transaction-version configuration, ATA simulation diagnostics), both caused by Go-only changes — continuing, not resolving, the capability-drift pattern this brief has tracked since 2026-10-26.

c04. House Oversight Committee Chairman James Comer sent a four-page letter to Delaware Governor Matt Meyer on 2026-10-26 demanding records on the state's proposed Artificial Intelligence Company (AIC) entity, warning the structure could shield AI companies' human backers from liability for harm the AI-managed company causes, with a November 9 response deadline.

c05. The AIC proposal itself — a sandboxed legal entity whose day-to-day affairs are run by an AI agent rather than a person — was announced in a July 2026 Fortune op-ed by Delaware Secretary of State Charuni Patibanda-Sanchez and Norm Ai CEO John Nay; Comer's letter is the first federal response on record, raised three months after the proposal became public and ahead of the January 2027 state legislative session.

c06. wevm/mppx issue #1113 (opened 2026-10-27) shows the TypeScript MPP client throws `No Payment schemes found.` and aborts — instead of falling through to x402 — whenever a 402 response's `WWW-Authenticate` header carries a non-Payment challenge, breaking the documented mpp → x402 → mcp fallback order.

c07. The same defect class was already open and unfixed in Solana Foundation's pay-kit (`SessionFetch`, issue #358, opened 2026-10-06; fix PR #359 still unmerged three weeks later as of this edition), so both reference implementations of the Machine Payments Protocol share the bug rather than one copying it from the other.

c08. (why it matters) Three unrelated layers of the agent-infrastructure stack — a payment SDK's dependency chain, a legal-liability framework for autonomous companies, and a payment protocol's own fallback negotiation — each have a documented fix or guardrail that does not actually reach the point where it is needed: the patch stops one hop short, the committee doubts the guardrail holds under scrutiny, and the fallback chain the spec promises doesn't execute in either shipping client.
