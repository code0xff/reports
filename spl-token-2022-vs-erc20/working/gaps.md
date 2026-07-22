# Gaps

## Iteration 1 → Iteration 2 (resolved)

### Previously under-sourced — now closed
- [x] c16 (freeze/blacklist): Added a technical FiatToken design doc (s32), the Spark research writeup explicitly stating blacklist is not a standard ERC-20 feature (s33), and an explicit SPL freeze-authority primary quote (s34). No longer resting on a single trust-5 blog.
- [x] c07 (Token-2022 program id): Confirmed the literal program id `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` via Solana Explorer (s35), corroborating the "deployed to a different address" doc statement (s09).

## Conflicting sources
- None. All sources agree on the architectural picture; the only nuances are framing (systemic-risk interpretation) and cryptographic-primitive naming for confidential transfers — both handled in uncertainties.md and qualified in the draft.

## Sections missing a primary source
- None. Every section's core claims cite at least one tier 1–2 primary source; interpretive claims (c03, c17) cite tier 2–3.

## Open questions (deferred, non-blocking)
- EIP-3009 (transferWithAuthorization, used by USDC) could be mentioned as another Ethereum extension example, but c14 already establishes the extension-by-new-contract pattern. Optional, not a gap.

**Status: gap list empty. Proceeding to draft.**
