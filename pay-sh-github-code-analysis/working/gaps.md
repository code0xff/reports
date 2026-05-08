# Gaps — pay.sh GitHub Code Analysis

After the first gather pass every claim in `claims.md` has at least one
primary source from the cloned repository or the GitHub REST API, plus
independent news coverage where the protocol calls for it.

Open items intentionally deferred to the report's Limitations section
rather than reopened as gaps:

- The internals of `solana-foundation/mpp-sdk` and `solana-foundation/x402-sdk`
  are referenced via the workspace dependency declaration but not audited
  here. Their canonical IETF-style spec is the `paymentauth.org` draft
  (`s28`), which we cite for the protocol naming question.
- The hosted `pay.sh` web property and the `https://402.surfnet.dev`
  RPC backend are out of scope; we only describe how the CLI talks to
  them (see `s05`).
- We did not run the binary, exchange real funds, or verify
  Touch ID / Windows Hello / GNOME Keyring prompts at runtime; all
  security claims are based on reading the source.

No `must-fix` gaps remain.
