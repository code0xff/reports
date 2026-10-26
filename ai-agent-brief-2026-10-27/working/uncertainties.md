# Uncertainties

- The A10a/A10b and A11 findings rest on one lab's (Argus Agent Test Lab)
  fixtures plus a second, unsigned reproduction credited to a GitHub user
  (NSPG13) inside the same comment thread. Neither is an x402-foundation
  artefact, and the brief could not independently re-run either rig; treat
  the two boundaries as corroborated by two sources but not foundation-
  confirmed. _(unverified — not foundation-confirmed)_
- NovaCorpAI's zod-4.6.7 migration test is vendor/contributor-stated: it
  reports passing test suites and live testnet/mainnet-adjacent payments, but
  no one else has reproduced it, and it has not been turned into a PR against
  the SDK. _(vendor-stated)_
- smartflowproai's on-chain overcharge-exposure tracker (cited in prior
  editions, not re-cited here) measures market-wide averages, not
  per-seller incidence, and both of its reported counts are stated as lower
  bounds by the tracker's own author — it does not bear on this window's new
  A10/A11 findings but is the same thread's running context.
- Whether PR #3920 (with or without the disputed `33dc20d` commit) ships as
  the SDK's default spend-control path, or stays opt-in, is undecided; the
  PR's own author argues broader recipient allow-listing is a server-side
  concern, not something the client SDK should own. _(early signal)_
