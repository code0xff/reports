# Uncertainties

- The Phantom/x402 bug report (s03) is from the operator of one checkout page
  and CDP's hosted facilitator specifically; it is not yet established whether
  every x402 Solana facilitator enforces `assertFeePayerIsolatedFromInstructions`
  the same way, so the practical blast radius (one facilitator vs. most of
  them) is unconfirmed.
- Google's Workspace/Cloud agent-identity announcement bundles shipped
  features (Workspace MCP servers GA, the CLI, Agent Registry identities) with
  "coming soon" features (time-limited approvals, per-file access
  restrictions, user-facing revocation) in the same post; this brief reports
  only the former as shipped. The February 1, 2027 enforcement date and the
  April 1, 2027 quota-billing date are Google's own stated dates, not
  independently confirmed, and could slip.
- mppx's three identity/security fixes this week (host-spoofing, keychain key
  exposure, proxy IP leakage) read as routine hardening rather than a response
  to any disclosed incident or exploit in the wild; no CVE or advisory was
  found accompanying any of the three, so whether they were prompted by an
  internal audit, a report, or active abuse is unknown.
