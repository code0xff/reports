# Claims

c01. x402 PR #3920's expected-amount spend control closes the recipient-substitution
gap (A5) that issue #3866 originally reported, but two independent test labs
(Argus Agent Test Lab, and a reproduction credited to NSPG13) cross-checking
the same head found it still signs in two cases it is supposed to reject: a
concurrent first-call race where two signatures land before either binding is
recorded (A10a/A10b), and a decimal or unknown-asset amount representation
that silently passes the enabled expectation check (A11).

c02. x402 PR #3935 merged on 2026-10-26, fixing the Python SDK bug (issue
#3930) where `register_exact_evm_client` / `register_exact_svm_client`
ignored the caller's `networks` filter for the legacy V1 scheme, letting a
testnet-only client sign a real mainnet payment. Nobody has checked whether
the Go SDK has the same gap.

c03. zod's GHSA-mrhx-c7xc-m3w5 (CVE-2023-54404) has no patched 3.x release,
so every `@x402/core` install reports a high-severity `npm audit` finding
with no fix path until the SDK migrates to zod 4. An independent test
(NovaCorpAI, issue #3914) found that forcing zod 4.6.7 across
`@x402/core`, `@x402/stellar`, `@x402/evm`, `@x402/fetch`, and `@x402/hono`
passes the existing test suite and live testnet/mainnet-adjacent payments
with no API break, because the SDK only uses zod calls unchanged in v4.

c04 (why it matters). Across three unrelated bug classes this window — a
spend-control bypass, a cross-chain signing gap, and a dependency CVE — the
party that surfaced or verified the fix was an outside lab or contributor,
not an x402 Foundation maintainer, continuing the pattern the two prior
editions of this brief identified (2026-10-25, 2026-10-26).

c05 (why it matters). None of the three threads has closed through a
maintainer-authored decision: #3935 merged on a contributor's PR, the A10/A11
findings sit as unreviewed comments on an open issue, and the zod fix is an
offered PR nobody has taken yet. Review capacity, not technical difficulty,
is the common bottleneck.
