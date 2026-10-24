# Uncertainties — ai-agent-brief-2026-10-25

- The mainnet price-drift measurement (32,605 settlements, 1,126 at ≥10x median) is a single third party's self-reported methodology, explicitly caveated by its own author as a ceiling rather than evidence of exploitation; it has not been replicated and should be read as a scale indicator, not a confirmed exploit count. _(unverified — single source)_
- PR #3920's "expected-amount control" design is still being actively revised mid-review (two substantive gaps found and patched within the window); the version that eventually merges, if any, may differ materially from what is described here. _(early signal)_
- Issue #3930's claim that the Python/Go V1 registration helpers mis-scope networks is the reporter's own reading of the SDK source, not yet confirmed by a maintainer or reproduced by a third party. _(vendor-stated is not the right tag here — it is reporter-stated, unconfirmed)_
- Whether any of the three open PRs (#3920, #3910, #3925) merge as written, get redesigned, or stall is unknown; none has a maintainer-assigned reviewer or milestone visible in the thread as of 2026-10-24T22:15Z.
