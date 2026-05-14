# Gaps — Five Attacks on x402 Agentic Payment Protocol

Status: closed. All claims have at least one acceptable source from the
trust tiers, and key technical claims (EIP-3009 caller binding, Permit2
spender semantics, x402 facilitator role, May 2025 release, Bazaar
discovery) are corroborated by independent primary sources beyond the
preprint itself.

## Resolved
- c01, c04: x402's specification and Coinbase release timing are now
  anchored against the coinbase/x402 GitHub README (s03), the CDP docs
  (s04), and PYMNTS coverage of the May 2025 debut (s05), in addition
  to the preprint.
- c05: EIP-3009 `transferWithAuthorization` (s08), EIP-712 typed
  signing (s09), and Permit2 (s11) provide direct primary references
  for the settlement-path description.
- c08, c14: EIP-3009 documents the front-running risk and recommends
  `receiveWithAuthorization` for caller-bound flows (s08); Permit2
  designates a spender but not a submitter (s11). Both corroborate the
  paper's Attack I-B mechanism beyond the preprint alone.
- c11: x402scout (s13) provides an external anchor for the Bazaar-style
  discovery layer the paper attacks.

## Remaining (accepted)
- The HackerOne reports cited in c18 (#3679163, #3679179, #3679220)
  remain private. Reporting them carries the explicit caveat that the
  technical scope and remediation status cannot be independently
  verified.
- Some quantitative claims (RGP₀ figures, DGR live trace, Attack IV
  selection rates) rest on a single source: the preprint itself. These
  are marked in `uncertainties.md` and qualified inline in the draft
  with `_(controlled estimate)_`, `_(early signal — single-team
  evaluation)_`, and similar tags rather than presented as established
  field measurements.
