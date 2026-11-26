# Claims

- c01: mppx merged a fix (PR #1353, Nov 24) that rejects signed identity
  requests with HTTP 421 when the server has no trusted-host configuration,
  closing a gap where a relay could reconstruct a request's URL from an
  incoming `Host` header and present it as a signed request for a different
  service.
- c02: mppx `0.22.1` (Nov 25) fixed the CLI's macOS keychain integration so
  the private key is sent over stdin to `security -i` instead of as a
  process argument, closing a local information-disclosure path where any
  other process on the same machine could read the key via `ps`.
- c03: mppx `0.22.1` also added stripping of `Forwarded`, `X-Real-IP`,
  `True-Client-IP`, and `CF-Connecting-IP` from proxied requests, alongside
  the existing `X-Forwarded-*` stripping, closing a path by which a proxy
  leaked a client's real IP to the upstream identity/payment endpoint.
- c04: a Phantom wallet update shipped November 25 (Chrome extension) and
  November 26 (iOS) adds Lighthouse assertion instructions to Solana
  transactions, one of which names the x402 facilitator's fee payer — which
  `@x402/svm` 2.32.0's own anti-fraud check (`assertFeePayerIsolatedFromInstructions`)
  rejects, so Phantom users cannot currently complete `exact` payments on
  Solana through facilitators that enforce this rule, including CDP's
  hosted facilitator.
- c05: Google made Workspace MCP servers and a Workspace CLI generally
  available (Nov 25), moved Workspace's agent-facing API surface off
  existing REST APIs onto these two paths with technical enforcement dated
  February 1, 2027, and introduced Agent Registry-backed identities with
  per-agent OAuth clients, least-privilege scopes, and a protocol-native
  Agent Gateway that verifies agent identity and applies default-deny
  outbound policy for LLM/MCP/A2A traffic. _(vendor-stated)_
- c06: across these three items, security/identity enforcement tightened at
  three different layers of the agent stack in the same week — a payment
  library's host binding, a wallet's own fraud check colliding with a
  protocol's fraud check, and an enterprise platform's OAuth/identity model —
  and in one case (c04) the new failure mode is a side effect of two
  independent security hardenings disagreeing with each other, not of either
  side being insecure alone.
