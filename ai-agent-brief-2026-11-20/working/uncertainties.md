# Uncertainties — ai-agent-brief-2026-11-20

- **Stripe's spending-limits and card-creation features** are vendor-stated
  future commitments ("in the coming weeks" / "Next, we'll expand..."), not
  shipped capabilities. Treat any claim about agent spending caps as
  forward-looking, not current state.
- **Visa's 140+ participant count and 175+ issuer figure** are Visa's own
  self-reported numbers from its press release; no independent audit of
  program enrollment exists in the sources gathered. The partner-contributed
  figures (Basis Theory's "300+ merchants," HighRadius's "190+ AI agents") are
  each partner's own self-description, repeated in Visa's release, not
  verified by Visa or a third party.
- **The NETS–Ant International MoU** commits to "explore" four things
  (agent-authorized payments, KYA alignment, EPOS360 integration, ANEXT Bank
  lending) with no pilot date, product, or technical spec disclosed. Whether
  any of this ships, and on what protocol, is open.
- **mppx's `Payment-Authorization` header restriction** reads as a
  client/server library rule in the 0.21.0 release notes, not explicitly as a
  change to the published MPP specification text. Whether the spec itself
  mandates this header name, or the library is just enforcing a stricter
  interpretation of it, was not confirmed against the spec document this
  cycle.
