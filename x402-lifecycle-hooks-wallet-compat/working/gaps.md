# Gaps (after sweep 3 of 6)

- c08 (trust-provider extension): single source, the GitHub issue itself (s08). No maintainer response or merge is visible; PR #2300 was not fetched. Draft presents it as an open proposal, marked single-source.
- Hook execution semantics: the docs page does not state whether multiple hooks on the same event run in registration order, what happens if a hook throws, or how two hooks' return values compose. Asked for explicitly and the page does not answer. Recorded in Limitations — this is the single most operationally important gap.
- TypeScript @x402/core CHANGELOG entry for when hooks landed was not located; only the Go docs and examples confirm the surface. Version dating for hooks relies on the Python CHANGELOG (2.16.0) and the V2 launch post.
- Circle v2.2 upgrade doc (github doc/v2.2_upgrade.md) has no EIP-1271 text; the blog (s18) carries it. The claim that EIP-3009 now accepts contract signatures rests on Circle's own announcement plus ERC-3009's own statement that it "does not apply to smart contract accounts" — the two are reconciled in the draft as spec-vs-implementation.
- Facilitator-by-facilitator support (which hosted facilitators set eip6492AllowedFactories) was not obtainable; CDP docs describe network support, not factory allowlists.
- Whether onVerifiedPaymentCanceled exists in all three SDKs is confirmed for TS (docs) and Go (WithOnVerifiedPaymentCanceledHook); Python not confirmed.
