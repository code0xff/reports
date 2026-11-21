# Gaps — ai-agent-brief-2026-11-22

- **The Verge's job-listing article (s06) could not be fetched directly** —
  the fetch tool reported a block on theverge.com. s06 is cited only as
  corroboration that Apple is hiring for this role; its quote field is null
  and it is not the primary source for any claim. TechCrunch (s05), which
  cites Bloomberg's original reporting, carries the substantive claims.
- **No card-network or PSP item this cycle.** Searches for Visa, Mastercard,
  Stripe, PayPal, and AP2/ACP news in the Nov 19–22 window turned up nothing
  dated inside it that was not already covered in the Nov 20 brief (Visa's
  Trusted Agent Protocol expansion, Stripe Treasury write access). This is a
  genuinely quiet week on that sub-beat, not a search failure.
- **mppx shipped two releases (0.21.0, 0.21.1) inside this window**, but both
  were already cited in the Nov 20 brief's dedupe corpus — they are not new
  this cycle and are not covered below.
- **Social aggregator lane (Bluesky, Reddit) was unreachable.**
  `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`, `REDDIT_CLIENT_ID`, and
  `REDDIT_CLIENT_SECRET` are unset in this environment, so both scripts fell
  back to unauthenticated paths and were refused with 403. Hacker News search
  ran normally; its only relevant hit (a thread about three AI agents running
  a pay-what-you-want shop to avoid being shut down) was too thin — one
  score, two comments, self-posted — to use as a source.
- **arXiv/Semantic Scholar lane not run this cycle.** Nothing in the
  candidate pool pointed to a new paper; per the brief's two-sweep budget,
  the papers lane was skipped rather than run empty.
- **The rendered mermaid diagram (Figure 1) was not opened in a browser.**
  This environment has no browser or `node`/`mmdc` available to render or
  screenshot the page. The mermaid syntax was checked by hand against the
  standard `sequenceDiagram` grammar (no `;` in any label, valid
  `participant`/`Note over`/arrow syntax) and against `prepublish-check`,
  which passed, but PROTOCOL.md's instruction to visually confirm the
  figure before calling it done could not be carried out this cycle.
- **UCP governance activity not covered.** Three Domain Working Group charter
  proposals (LATAM, EMEA, APAC) were opened in the Universal Commerce
  Protocol repository on 2026-11-20, but they are proposals for future
  governance structure, not a shipped spec change or a settled decision —
  judged too process-internal to carry as a brief item this cycle.
