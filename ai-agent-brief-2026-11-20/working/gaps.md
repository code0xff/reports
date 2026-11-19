# Gaps — ai-agent-brief-2026-11-20

- **Visa's own release copy, not just the mirror.** `s04` was read from the
  Business Wire/Investing News Network mirror, not Visa's own newsroom page.
  The content and numbers match the correction notice's own account of what
  changed from the November 17 version, so the figures are trustworthy, but
  citing Visa's own newsroom URL directly was not attempted this cycle.
- **No NETS or Ant International press release.** `s06` is a trade-press
  rewrite; the article links only unlabeled short URLs, and neither company's
  newsroom was searched directly for a primary version of the MoU text.
- **Stripe's agent spend-limit feature is not yet live.** Both `s01` and `s02`
  describe spending limits and card creation as "coming weeks" / "next,"
  future tense — not shipped as of this brief.
- **Social aggregator lane (Bluesky, Reddit) was unreachable.** `BLUESKY_HANDLE`,
  `BLUESKY_APP_PASSWORD`, `REDDIT_CLIENT_ID`, and `REDDIT_CLIENT_SECRET` are
  set in the environment but resolve to empty strings, so both scripts fell
  back to their unauthenticated paths and were refused with 403. Hacker News
  search ran normally and returned no agent-payments-relevant threads in the
  window. This is a real lane failure, not an expected limitation — the
  credentials exist but are not populated.
- **arXiv/Semantic Scholar lane not run this cycle.** Nothing in the window's
  candidate pool pointed to a new paper; per the brief's two-sweep budget,
  the papers lane was skipped rather than run empty.
