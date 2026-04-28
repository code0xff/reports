# Uncertainties — x402 Protocol Report

## Epistemically shaky claims (publishable but flagged)

### Transaction volume metrics (c21)
- **Status**: Vendor-stated and ecosystem-stated; not independently audited
- **Issue**: Multiple sources cite different figures for the same period. The 119M Base transaction figure (Sherlock) conflicts with the 75M total figure (CryptoSlate, Dec 2025). The $600M annualized figure appears in both MEXC News and Sherlock but is derived from annualizing short-term peaks.
- **Issue 2**: The 92% daily volume collapse (Dec 2025 → Feb 2026) suggests the earlier peak metrics were heavily inflated by speculative activity.
- **Mitigation**: Present multiple figures with dates; qualify with vendor-stated or early-signal markers where appropriate.

### Ecosystem partner commitments (c23)
- **Status**: Partnership announcements, not verified integrations
- **Issue**: AWS, Stripe, Google, Visa are listed as "supporting" x402 on the ecosystem page, but depth of integration varies. Cloudflare and Coinbase have clearly integrated; others may be softer commitments.
- **Mitigation**: Use language like "announced support for" rather than "have integrated."

### Sign-in-with-x (SIWx) (c13)
- **Status**: Vendor-stated, not yet shipped
- **Issue**: SIWx is described as "coming soon" in the V2 launch article and CDP docs. No public specification or implementation exists as of April 2026.
- **Mitigation**: Clearly mark as a planned feature, not a shipped one.

### Deferred payment scheme (c11)
- **Status**: Proposed, in development
- **Issue**: Described as a Cloudflare proposal being worked on with "an existing community builder." Not part of the current spec and has no published implementation.
- **Mitigation**: Mark as proposed in draft.

### x402 Foundation governance structure (c20)
- **Status**: Announced, details pending
- **Issue**: The Cloudflare blog states "Stay tuned for more announcements on the specifics of the structure very soon." No formal governance document has been published as of April 2026.
- **Mitigation**: Note that foundation structure details remain unpublished.

### ERC-7710 smart account support (c08)
- **Status**: Spec-defined but implementation maturity unclear
- **Issue**: ERC-7710 delegation is listed as a supported asset transfer method in the scheme spec, but no public data on adoption or compatibility with deployed smart accounts is available.
- **Mitigation**: Present as specification-level support; implementation maturity unknown.
