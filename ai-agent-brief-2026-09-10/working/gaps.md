# Gaps

- **Social lane (Bluesky, Reddit) still not usable on this machine.** `BLUESKY_HANDLE`,
  `BLUESKY_APP_PASSWORD`, `REDDIT_CLIENT_ID`, and `REDDIT_CLIENT_SECRET` are present in
  the environment but exported as empty strings, same as the 2026-09-09 run.
  `search_social.py`'s Bluesky path now fails differently than yesterday — a 403 from
  the public appview rather than a "not configured" message — but the root cause is
  the same missing credentials. This is a real, unaddressed gap on this environment,
  not an expected limitation; whatever is supposed to populate these credentials for
  the LaunchAgent run has not populated them across two consecutive days.
- **Mastercard's own press release for Agent Connect could not be fetched.**
  `mastercard.com/us/en/news-and-trends/press.html` and guessed release URLs under
  it returned HTTP 403 to WebFetch, the same class of failure PROTOCOL.md notes for
  IACR/Springer. The announcement is corroborated by name, date, and direct
  executive quote (Jorn Lambert) across crypto.news, PYMNTS, and several other trade
  outlets, so it is not treated as unverified, but the primary artifact itself is
  cited by URL only through secondary coverage.
- **No official NPCI page for AiNxt, AtOM, or the NVIDIA collaboration was found.**
  `npci.org.in`'s press-release index did not surface a matching release in search,
  and a direct NPCI blog/press URL could not be located. Sourced instead to three
  independent India-market outlets (Inc42, NewsBytes, Business Today), all dated
  2026-09-09 and consistent with each other on the platform names and mechanics.
- **NPCI's "Unified Agent Protocol" remains unconfirmed for a third consecutive
  brief.** Global Fintech Fest 2026 runs through 2026-09-11, so the window for an
  announcement has not closed; carried forward again with the added datapoint that
  NPCI used the same event to ship two adjacent agentic-AI platforms without
  mentioning UAP by name in any outlet's day-of coverage found this sweep.
- **Cymphony's $30M figure vs. $25M Series A figure**: outlets report both a
  "$30 million" total raise and a "$25 million Series A" in the same breath; the
  reconciliation (Series A of $25M plus a previously undisclosed Sequoia seed,
  summing to $30M total funding to date) is stated by TechCrunch and SiliconANGLE
  consistently, so this is recorded here for transparency rather than as an
  unresolved conflict.
- **Figure 1's mermaid diagrams were not visually confirmed in a browser.**
  This machine still has no Node runtime (`node`, `npx @mermaid-js/mermaid-cli`
  all fail with "node not found") and no headless browser, the same limitation
  recorded in the 2026-09-09 brief's gaps. `render-report` produced the
  `pre.mermaid` blocks and the client-side mermaid.run() loader without error,
  and the syntax was checked by hand against `graph LR` / `subgraph` grammar
  (matched brackets, no semicolons in labels, consistent node IDs across the
  before/after pair), but PROTOCOL.md's standing warning still applies: a
  malformed diagram renders, publishes, and fails only in the reader's
  browser. Worth an actual browser check once this machine gets a Node
  runtime, or from a session that already has one.
