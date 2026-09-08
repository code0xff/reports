# Uncertainties

- **Muse's "human approval" boundary is described only by Meta so far.** Meta
  has opened a public bug bounty (up to $130,000 for a working prompt
  injection) and says it has begun sharing the design and source with
  external auditors, but as of launch day no outside review has actually
  been published — the bounty is an invitation, not yet a result. The
  architecture is credible and specific, but it remains Meta's own account
  of Meta's own control; mark as `_(vendor-stated)_` wherever the draft
  leans on it for a safety claim rather than a capability claim.
- **GTIG attributes the six-hour attack to "a financially motivated threat
  actor" without naming it**, and the report is Google's own telemetry from
  Mandiant investigations and platform defenses — there is no second
  vantage point on the same intrusion. The scale (thousands of credentials)
  and timeframe (under six hours) should be read as Google's count, not a
  cross-verified one. GTIG's attribution methodology in earlier AI-threat
  reports has drawn published skepticism (independent researcher critique of
  a May 2026 GTIG report argued its "AI-assisted" classification rested on
  code style and formatting rather than a demonstrated capability gap). That
  critique targets a different report, not this one, but it is a reason to
  read "AI-enabled" attribution from this source with some caution rather
  than as a settled fact.
- **The Tamarin paper's 40 "previously undocumented" findings have not been
  triaged by severity in this brief.** The abstract distinguishes
  reproduced/calibration cases (46) from new ones (40) and says 10 of the
  x402 findings were validated against real implementations, but which of
  the 40 are exploitable in production versus purely formal-model artifacts
  is not something this brief's sweep confirmed independently.
- **MPP's XRPL merge is a spec text change, not a shipped integration.**
  Whether any wallet, agent framework, or merchant actually uses the new
  `xrpl` method yet is unknown; the PR itself notes the draft text was
  written with AI assistance per the repo's contribution policy, which is
  disclosed but unverified beyond the PR body's own statement.
