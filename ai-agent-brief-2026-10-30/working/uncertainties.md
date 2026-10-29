# Uncertainties

- Whether pay-kit PR #359 is functionally equivalent to mppx's PR #1133 fix, or whether it takes a different approach to the same symptom, is not verified here — both are read from their PR descriptions, not from a side-by-side behavioral test against the same server.
- The "24 new known_failing cross cells" figure in pay-kit PR #404 is vendor-stated (the PR author's own accounting in the PR body), not independently re-counted against the SDK's test matrix.
- Whether the x402 TypeScript fix (PR #4051) has shipped in a published npm release, versus merged to main only, is not confirmed — no corresponding version-bump PR or release tag was checked for this specific change in this pass.
- No independent (non-GitHub) source corroborates any of this window's three items; all three are drawn from the project's own PRs, issues, and release notes, which is primary but single-source for intent and effect, not for real-world impact.
