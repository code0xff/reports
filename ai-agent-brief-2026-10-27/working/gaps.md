# Gaps

- No x402-foundation maintainer has commented on, reviewed, or merged a fix
  for the A10a/A10b race or A11 decimal-bypass findings (issue #3866). A
  third-party commit (hash `33dc20d`, credited to a contributor account
  "Boundra") is reported to address both, but neither test lab has re-run it,
  so there is no independent verification it actually closes the gap.
- Nobody has checked whether the Go SDK has the same V1-network-filter gap
  that PR #3935 fixed in the Python SDK. The TypeScript SDK already had the
  filtering logic; Go's status is unknown.
- No PR exists yet to bump zod to 4.x in `@x402/core` / `@x402/evm`.
  NovaCorpAI offered to open one; as of this window, nobody has.
- AP2 and UCP both show active cross-protocol interop work this window
  (UCP PRs #995–#997 on "AP2 completion-time authorization equivalence")
  but it did not reach three independent events on its own and was left out
  of this edition to keep the item count honest; worth checking next window.
- X and LinkedIn: no company or individual post surfaced as the originating
  source for anything in this window; all three items trace to GitHub
  issues/PRs directly.
