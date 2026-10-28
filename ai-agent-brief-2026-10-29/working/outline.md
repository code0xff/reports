# Outline

1. Abstract
2. Introduction — window covered (2026-10-26 through 2026-10-29) and the standing beat
3. What moved
   - x402 Foundation merges the zod-4 fix for GHSA-mrhx-c7xc-m3w5 across all three SDKs, but the dependency chain's most common entry point, `@coinbase/cdp-sdk`, still ships the vulnerable range
   - US House Oversight Committee opens a records probe into Delaware's AI-run-company (AIC) proposal, citing liability-shield and regulatory-capture concerns
   - A protocol-fallback bug shared by both reference MPP clients (wevm/mppx and Solana's pay-kit) breaks the mpp → x402 negotiation chain the Machine Payments Protocol depends on
4. Why it matters — through-line: standards and fixes exist on paper (a merged patch, a protocol's documented fallback chain, a sandboxed legal entity with guardrails) but each one breaks down at the next layer — a downstream dependency, an unmerged PR, a committee that doubts the guardrails hold
5. Signals to watch
6. Limitations
