# Gaps

## Under-sourced claims
(none — all 31 claims meet the minimum source threshold; see claims.md)

## Conflicting sources (RESOLVED — all three are now explicitly represented in both drafts with attribution)
1. **DAI as an "EIP-2612 token"** — x402 docs (s17) list DAI among "common EIP-2612 tokens", while the EIP-2612 spec itself (s01) documents that mainnet `dai.sol` implements a *non-conforming* earlier variant (`bool allowed`, `expiry` instead of `deadline`). Draft must present both and note that "has a permit function" ≠ EIP-2612 conformant.
2. **Adoption statistics** — BlockEden (s21) reports ~119M Base + 35M Solana transactions and ~$600M annualized volume as of March 2026, alongside a 92% decline in daily transactions Dec 2025→Feb 2026; InfoQ (s19) reports "over 100 million payment flows" as of Jan 2026. Figures differ in scope and date; draft presents both with attribution.
3. **Permit value semantics** — the eip2612GasSponsoring spec example (s05) shows `amount` "Typically MaxUint" for the Permit2 approval, while the Go client (s18) signs `permittedAmount` equal to the exact payment amount and states the proxy enforces `permit2612.value == permittedAmount`. Spec and SDK disagree; draft flags this as in-flux.

## Notes
- c16/c17/c23 were originally phrased around a hypothesized permit→transferFrom settlement; the actual mechanism in x402 v2 is permit→Permit2 (`x402ExactPermit2Proxy.settleWithPermit`). Draft follows the primary sources (s04, s05, s17, s18).
- Academic coverage of x402 itself is very fresh: two 2026 arXiv preprints (s24, s25); both are preprints, not peer-reviewed — noted in uncertainties.
