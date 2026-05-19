# Gaps

## Sweep 1 — initial collection (2026-05-19)

- All 30 claims now have at least the minimum sourcing required by `PROTOCOL.md` §2.3.
- Code-level claims (c23–c28) have at least one primary GitHub source per claim, plus secondary docs.

## Residual gaps (acceptable, to be surfaced in Limitations)

- **AP2 Payment Mandate definition is partially inferred.** The Google Cloud announcement only enumerates Intent + Cart mandates; the third (Payment Mandate) is documented in third-party write-ups [s39] and the GitHub samples [s16], not in the announcement itself. Acceptable for now.
- **ZeroDev permissions deep-dive pages were not directly fetched.** We rely on the GitHub README [s26], the session-keys page [s34] (access-limited summary) and the public SmartSession repo [s28]. Code-level claims about signer/policy/action use the SmartSession primary source.
- **Mastercard Agent Pay primary page was 403 to scripted fetch.** We use the secondary Mastercard product page [s09] plus the PYMNTS report [s10] to cite the same facts.
- **Coinbase x402 launch page returned 403.** We cite the GitHub repo [s17], the official docs [s19], and the Cloudflare partner post [s20] instead.
- **EIP-7715 normative reference.** Our citation for ERC-7715 leans on the MetaMask docs [s5, s41] rather than the EIP page directly; this is acceptable because MetaMask co-authored the EIP, but the report should note this.
- **Stripe ACP launch page returned 403.** We rely on the OpenAI page [s32] (also access-limited), Stripe blog [s12], Digital Commerce 360 [s14], and the ACP GitHub [s13] and the agenticcommerce.dev site [s37].

## Open structural notes
- The exact x402 facilitator TS file path moved between releases; we cite the spec doc [s18] which is canonical.
- We do not have a peer-reviewed paper on Smart Accounts themselves; the standards (EIPs) are treated as primary sources, which the trust hierarchy permits.
