# Uncertainties

- DoorDash's "several hundred orders" is a CEO's rounded, informal figure from an earnings call, not an audited metric — it is directionally informative but not a precise count, and DoorDash has an incentive to frame agentic volume as small while it negotiates terms with agent builders.
- The two open automated-review findings on mppx PR #1138 (nonce the client never saw; a verifier that might accept a proof without checking the nonce) are project-reported, not independently verified as exploitable. It is unclear whether either is a real vulnerability in a shipped verifier or a theoretical implementer footgun that correct verifiers already avoid.
- pay-kit's dependency on an unmerged x402 branch (c04) is normal practice for active cross-repo co-development, not necessarily a defect — but it means pay-kit's current behavior for v1 transactions traces to a commit that could still change before x402 merges it to main.
- Whether mppx's tempo validity-floor fix (#1131 + #1137) is actually complete is unconfirmed: both PRs explicitly leave "retry challenges skip the issuance floor" out of scope as a known, unaddressed gap.
