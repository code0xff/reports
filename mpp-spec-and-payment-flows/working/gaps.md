# Gaps

## Sweep 1 — 2026-05-27

All 20 claims have at least the minimum sourcing required by `PROTOCOL.md` §2.3. Protocol-grammar claims (c02–c08) rest on the IETF draft [s01]; intent claims (c09–c12) on mpp.dev intent pages [s05][s06]; method claims (c13–c16) on Stripe docs [s07], Stellar docs [s10], Cloudflare docs [s08], and Tempo docs [s15].

## Residual gaps (surfaced as Limitations / qualifiers)

- **session intent page** at `mpp.dev/intents/session` returned 404 at fetch time; the session flow is reconstructed from mpp.dev/protocol [s04], the Cloudflare summary [s08], the Formo explainer [s09], Stellar's channel guide [s10], and the sister report `mpp-session-mechanism`.
- **mpp-specs methods directory** [s14] could not be enumerated file-by-file under scripted fetch; the method list comes from mpp.dev and Cloudflare docs.
- **Per-method request/payload JSON schemas** (exact field names per method) are not transcribed for every method — only Tempo, Stripe, Stellar are covered in flow detail.
- **draft-payment-intent-charge-00 / paymentauth.org sub-specs** are referenced by URL but not separately fetched.

## Open questions

- Final IANA registration status of the "Payment" scheme.
- Whether the Visa card-based MPP method spec is merged into mpp-specs or maintained separately.
- Production throughput and fee data for live Tempo MPP charge/session flows.
