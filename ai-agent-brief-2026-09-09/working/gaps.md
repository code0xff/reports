# Gaps

- **Social lane not actually configured on this run.** `BLUESKY_HANDLE`,
  `BLUESKY_APP_PASSWORD`, `REDDIT_CLIENT_ID`, and `REDDIT_CLIENT_SECRET` are
  present in the environment but exported as empty strings, so
  `search_social.py` fell back to its "not configured" message for both
  lanes. This run's brief was told every lane should be reachable here, so
  this is recorded as a real gap, not an expected limitation — whatever
  provisions these credentials for the LaunchAgent run did not populate them
  this time.
- **MPP's XRPL addition (s05) has no independent press coverage yet.** It is
  a merged spec PR with no news-lane corroboration found in this sweep;
  treated as `_(vendor-stated)_`-equivalent single-sourcing in the draft.
  Worth checking next brief for Ripple's or Tempo's own announcement, and for
  any of the SDK repos (mpp-rs, pympp, mpp-go) shipping XRPL client support.
- **NPCI's Unified Agent Protocol still has not had its reported unveiling.**
  Flagged pending in the 2026-09-05 brief; the Global Fintech Fest in Mumbai
  (2026-09-08 through 09-11) is underway as of this brief, and every source
  found this sweep still uses "expected to unveil" / "has not formally
  confirmed" language. Carry forward again.
- **OpenAI's promised misalignment-disclosure framework has no published
  text yet** — the company said "in upcoming weeks" as of 2026-09-05/06,
  which falls just before this brief's window. No in-window update found.
- **Figure 1's mermaid diagram was not visually confirmed in a browser.**
  This machine has no Node runtime or browser (no `node`, no working
  `npx @mermaid-js/mermaid-cli`, nothing headless), so `render-report`'s
  output and `prepublish-check`'s mechanical trap scan are the only checks
  that ran. The syntax was also checked by hand against
  `sequenceDiagram` grammar and looks correct, but PROTOCOL.md's own
  warning is exactly this case: a malformed diagram publishes and fails
  only in the reader's browser. Worth an actual browser check next time
  this machine's environment changes, or from a session that has one.
