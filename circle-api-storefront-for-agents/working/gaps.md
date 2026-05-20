# Gaps

## Sweep 1 — 2026-05-20

All 16 claims have at least the minimum sourcing required by `PROTOCOL.md` §2.3. Code-level claims (c06, c09, c10, c11) carry both first-party blog evidence and at least one GitHub README citation.

## Residual gaps (surfaced as Limitations / qualifiers)

- **The `@circle-fin/x402-batching` npm registry page** returned access-limited [s07]; package metadata (version 3.0.4, 0 deps, 8 dependents) is captured via search snippets and the BlockRunAI README [s10]. The semantic content (server/client export, peer dependency on `@x402/core` + `viem`) is consistent across the search result and the README.
- **The `agents.circle.com` setup endpoint** referenced in the blog (`https://agents.circle.com/skills/setup.md`) could not be directly fetched as raw markdown; the draft cites the landing page [s06] rather than that file.
- **The x402 issue #447** could not be fetched directly (404 to scripted access); the existence of the issue is confirmed via search [s11] but the discussion content is not transcribed.
- **`circlefin/arc-nanopayments` README** could not be fetched as raw text [s08]; structure is captured from the repo metadata page only.

## Open questions for follow-up

- Whether `@circle-fin/x402-batching` will be merged upstream into `@x402/core` or remain a Circle-specific batching package.
- Whether the Agent Marketplace listing is purely manual (Google Form) or has a programmatic submission API.
- Whether Circle Gateway will eventually expose the same x402 batch-settlement primitives non-Circle facilitators can implement.
