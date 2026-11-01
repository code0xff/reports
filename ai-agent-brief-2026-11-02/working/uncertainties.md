# Uncertainties — AI agent brief, 2026-11-02

- #4079 and #4081 are both GitHub issue reports from third-party contributors, not maintainer-confirmed bugs — each includes a concrete repro and file/line citations, but neither has a maintainer response, a linked PR, or a changelog entry as of this writing. Treat the underlying defects as credible but not yet validated by the project itself.
- #4079's practical impact depends on how many SIWX storage implementations actually exist outside the reference ones; if the extension has few production users, the "silently broken anti-replay check" is real but low-blast-radius today.
- #3916's "matching batch-settlement and the EIP-2612 path" framing is the PR author's own characterization of correctness; no independent security review of the fix was found in this window.
- No independent, non-GitHub source corroborates any of the three main items — this entire edition rests on one repository's own issue tracker and pull-request history.
