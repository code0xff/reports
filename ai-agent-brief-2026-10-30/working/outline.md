# Outline

1. Abstract
2. Introduction — window 2026-10-27 through 2026-10-30, standing beat
3. What moved
   - mppx fixes the MPP fallback bug this brief flagged on 2026-10-29; pay-kit's side of the same bug is still unmerged three weeks later
   - x402 ports its Python JSON type-confusion guard to the TypeScript SDK, closing one cross-SDK drift gap it has tracked since October
   - pay-kit's Python and TypeScript SDKs reach full conformance on version-1 transactions, which widens — not narrows — the gap with the Go, PHP, and Ruby verifiers that can't decode what the newly-conformant SDKs now build
4. Why it matters — fixing drift in one place keeps surfacing it in another; "fixed" is a per-dependency state, not a protocol-wide one
5. Signals to watch
6. Limitations
