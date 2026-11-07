# Uncertainties

- Stripe's "free through 2027-01-31" pricing window and the "300+ tables" figure for the Reports API come only from Stripe's own post; no independent usage data exists yet on adoption or on what the metered pricing will look like after the free period ends.
- Google's Agent Distraction figures (6% unprompted-detour rate, the step/token/wait-time deltas) are internal to Google's own agent fleet and codebase; they may not generalize to other organizations' codebases, comment conventions, or agent harnesses. Google reports statistical significance but has not published the regression's full specification.
- mppx's Zone-balance payments (PR #1216) ship with unit and integration tests but the PR body notes the Zone test project does not yet run in CI — a `verify.yml` change is still needed. Whether this lands in a tagged release or sees any real-world use is not yet known.
- Whether Stripe's agent-data-access feature is a step toward Stripe's broader Agentic Commerce Protocol work, or a separate merchant-tooling track, is not stated in the post and is not yet corroborated by other Stripe material.
