# Uncertainties

- Brave's x402 pricing and chain support are both stated as transitional: USDC-on-Base only "for now," gas subsidized "for a limited time." The $0.005/request figure may not hold once the subsidy ends. _(vendor-stated)_
- Whether Google's natural-language custom-constraint authoring (via Gemini) is generally available or still a preview capability is not stated in the source post — only the MCP server itself is explicitly called GA.
- mppx PR #1275 depends on an unreleased-at-merge-time viem version bump (2.57.19) for `ResolvedToken.chainId`; whether this currency-unification change ships cleanly to consumers pinned to an older viem is untested by the PR's own description, which only runs the full test suite against the new viem version.
- The United Airlines / A2UI / mppx-identity items from the past two editions are not revisited here; this edition's "why it matters" reading treats this window's three items as a separate, later data point in the same trend, not a continuation of those specific stories.
