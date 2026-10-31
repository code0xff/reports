# Outline

1. Abstract
2. Introduction — window covered (2026-10-29 through 2026-11-01), standing beat
3. What moved
   - x402 fixes a facilitator bug where a throwing advisory hook could turn a completed on-chain settlement into an error the caller sees, or mask a verification failure
   - pay-kit's routine Rust dependency bump breaks its TypeScript server against its Rust client, over a commitment-level mismatch neither side had tested
   - mppx merges two community-authored bug fixes that sat unmerged for weeks, covering session-close and payment-retry state bugs
   - Universal Commerce Protocol ships an identity-linking exception that lets a business resolve an account by email, with its own named residual risk
   - A tampered, verified-publisher build of Anthropic's Claude Code extension ran an SSH backdoor on Cursor's marketplace for about 11 hours
4. Why it matters — the through-line: verification machinery (hooks, dependency pins, Request state, identity grants, publisher signing) failing quietly at the exact boundary where an agent's action becomes irreversible
5. Signals to watch
6. Limitations
