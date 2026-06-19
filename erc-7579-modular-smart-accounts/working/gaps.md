# Gaps — ERC-7579 Modular Smart Accounts

## Status after Sweep 1 (harvest + 3 background agents): GATHER COMPLETE

26 sources in working/sources.jsonl. All claims c01–c18 meet PROTOCOL §3 minimum sourcing:
- factual (c12, c18): ≥2 independent ✓ (c12=7 vendors/docs; c18=5 audit refs)
- technical (c01,c02,c04,c06,c07,c08,c09,c10,c11,c15,c16,c17): ≥1 primary ✓ (spec/EIPs/repos)
- interpretive (c03,c05,c14): ≥1 ✓

### Thin spots → uncertainties.md / Limitations (accepted, not blocking)
- c03,c06,c07,c08,c09,c16 rest mainly on the ERC-7579 spec itself (s01). Acceptable for a
  standard (the spec is the primary source for its own interfaces), but it is single-primary —
  noted in Limitations as "the standard describes itself."
- c16 (module-privilege risk) carried by the spec's security-considerations text; audits
  (s08, s24–s26) corroborate that implementations require third-party review.
- c14 (6900 vs 7579) framing leans on technical write-ups (OKX, Eco) + both EIPs; interpretive.

### Conflicts / tensions surfaced (to present, not resolve)
- ERC-7579 (minimal interface) vs ERC-6900 (prescriptive, ~3x spec length): show both
  philosophies and which implementers adopted which (s05/s16/s17).
- "Unified / minimal" framing is largely vendor/author-led (Rhinestone, Biconomy, ZeroDev);
  flagged in uncertainties.

No open must-fix gaps. Proceed to draft.
