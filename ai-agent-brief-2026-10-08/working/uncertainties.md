# Uncertainties

- Whether the fail-open gate-hook bug (#3689) was ever exploited in production is unknown; the issue and fix describe a design flaw, not an observed incident.
- The card-network-binding proposal (PR #3707) is a draft with five explicitly unresolved questions; it may be merged largely as written, revised substantially in review, or stall — the PR itself says this is cut down from an earlier, broader draft, so narrowing is already underway.
- Google's Developer Knowledge API MCP server is described as "public preview," which is vendor-stated; no third party has yet assessed reliability, coverage, or how it compares to existing documentation-retrieval tools.
- Whether the MCP Toolbox Java SDK's new credential-handling and parameter-pruning features meaningfully close the trust-boundary gap described in the 2026-10-05 Ars Technica piece, or address an unrelated class of problem, is not established by either source — the timing is suggestive, not confirmed causation.
