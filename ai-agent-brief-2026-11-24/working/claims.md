# Claims

c01. The x402 Discovery WG did not decide whether seller-identity/payout-address
     binding is in or out of scope for v1; on its Nov 16 call it instead agreed
     to push the question to the Identity WG, opening issue #18 on Nov 22 to
     track it — meaning the DNS-based payout-proof proposal from issue #17
     (covered in the Nov 23 brief) has moved, not been answered.

c02. The DNS-anchored payout-proof idea from wg-domain-discovery#17 is now
     tracked as wg-identity#52, and the Discovery WG's own fallback ask is
     narrower than a DNS record: treat recipient addresses as unverified claims
     plus an optional proof hint, leaving the stronger DNS binding for the
     Identity WG to decide.

c03. The x402 TSC's Nov 25 meeting agenda includes a request (tsc#21, filed
     Nov 22) to adopt a single contributor's pinned test-vector package as the
     Foundation's first conformance tests for Identity WG evidence records —
     a sign the Identity WG's queue (now at least two open proposals: #51 and
     the #17/#52 payout-proof line) is growing faster than the TSC is clearing
     it.

c04. OpenAI's Agents SDK v1.0.0-alpha.2 (Nov 23) extends the Codex-as-provider
     integration added one day earlier in alpha.1 with session/approval
     recovery across worker restarts, but makes the upgrade one-directional:
     alpha.2's RunState schema (1.24) cannot be read by alpha.1, so pending
     native-Codex approvals must be drained before upgrading.

c05. Anthropic's Claude Ship (Nov 23) packages three agents — a now-GA Code
     Review, and two beta agents, PR Steward (auto-fixes CI failures and
     review feedback) and Claude Approvals (policy-driven auto-approval) — and
     explicitly recommends running Claude Approvals in observe-only mode
     first, with GitHub branch protection as the actual merge gate.

c06. Google's semantic governance policies, evaluated on the third-party
     AgentDojo v1.2.2 benchmark (Nov 23 post), cut the attack success rate
     from 48.7% to 0.9% (a 98.2% reduction) across six runs, at a cost of 2.6
     points of benign-task utility — the first outside-benchmark numbers
     Google has published for a feature it previously announced only in
     general terms.

c07. Card networks and PSPs (Visa, Mastercard, Stripe, PayPal) produced no new
     agent-commerce announcement in the Nov 21–24 window, the third
     consecutive brief cycle without one.
