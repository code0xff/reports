# Uncertainties

- **Uber's agent-order numbers are vendor-stated**, from the company's own
  earnings call, with no independent instrumentation. They are also a
  snapshot of one week (the week of Halloween) that Uber itself called its
  busiest; a different week could read differently in either direction.
- **Whether x402's fail-open gate-hook class (#3689/#3702) is now fully
  closed.** The fix covers `beforeVerify` and `beforeSettle`; advisory phases
  (`after*`, `on*Failure`, enrichment hooks) still fail open by design,
  per PR #3702's own description — that is stated intent, not a residual bug,
  but it means a hook-chain audit elsewhere in the same codebase could still
  find a case where "fails open" is the wrong default.
- **Cloudflare's Account Abuse Protection per-agent visibility is in early
  access**, per the post itself, so its production behavior and accuracy at
  scale are not yet demonstrated.
- **mppx's #1168 (session origin/policy boundary fix) has no external
  incident report behind it**, unlike #1164 from the prior edition (which
  cited Mercator's production numbers). It reads as proactive hardening
  rather than a response to an observed exploit, but mppx's own PR does not
  say which.
