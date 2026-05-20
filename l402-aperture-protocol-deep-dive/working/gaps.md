# Gaps

## Sweep 1 — 2026-05-20

All 24 claims have at least the minimum sourcing required by `PROTOCOL.md` §2.3. Code-level claims about Aperture (c11–c16) carry primary GitHub citations plus the pkg.go.dev exported API.

## Residual gaps (surfaced as Limitations / qualifiers)

- **The L402 specification file location** moved between `specification.md` and `protocol-specification.md` between fetches; the report cites the latter path [s05] but the older URL is referenced in some external materials.
- **`lsat-go` library** was searched for but no canonical repo surfaced; only `lsat-js` (JavaScript) and `boltwall` (Node.js) are documented Tierion implementations [s13][s14].
- **Lightning Loop production usage** is documented in pkg.go.dev and the 2020 announcement but is not separately tied to a "Loop uses Aperture" architecture page in this report.
- **The lightning/blips PR #26** was confirmed by search [s15] but the body of the BLIP-0026 file is not directly quoted; the report mentions only its existence as a standards-track signal.

## Open questions for follow-up

- Whether L402 will be formally registered with IANA as an HTTP authentication scheme.
- Whether the macaroon caveat vocabulary will be standardised across L402 implementations.
- Whether non-EVM x402 schemes (e.g. TON, Stellar) will erode L402's Bitcoin-only advantage.
