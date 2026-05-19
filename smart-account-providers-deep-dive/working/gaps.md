# Gaps

## Sweep 1 — 2026-05-19

All 28 claims have at least the minimum sourcing from `PROTOCOL.md` §2.3. Code-level claims (c24–c26) carry at least one primary GitHub source.

## Residual gaps (surfaced as Limitations / qualifiers in the draft)

- **ZeroDev permissions docs pages on `docs.zerodev.app` are JS-heavy** and the WebFetch sometimes only returns the landing template. The detailed signer/policy/action language is captured via a 4th-party glossary [s34] and the Kernel v3 launch announcement [s08]. Acceptable; the architecture is described identically in both.
- **Biconomy SmartSessions docs URL returned 404/403** for some routes; SmartSessions itself is covered by the canonical ERC-7579 community repo [s12] and the Biconomy ERC-7579 blog post [s28].
- **Crossmint MiCA CASP authorization** appears in the agent-wallet-comparison summary but not on the wallet-infrastructure product page; surfaced honestly in the draft as `_(vendor-stated)_`.
- **Privy SSS exact share count and recovery path** are described in [s30] (Privy blog) and [s15] (security architecture docs). Acceptable — both are first-party.
- **Coinbase Agentic Wallets launch date** is referenced from [s32] (the launch page was 403 to scripted fetch); we use the title and content excerpt only, and explicitly mark the date as not independently verified.

## Open questions for follow-up reports

- Exact post-archive replacement for Pimlico ERC-20 Paymaster (`singleton-paymaster`) deployment matrix.
- Whether ERC-6900 vs ERC-7579 module ecosystems will remain bifurcated through 2026.
- Whether Coinbase Smart Wallet's avoidance of EntryPoint for Spend Permissions is a transient or permanent architectural decision.
