# Claims

c01. Sierra and Meta published the Personal Agent Protocol (PAP) on October 6, 2026, an open standard for how personal AI agents authenticate and act on a user's behalf when dealing with a business, with Genesys, Instinct, Rocket, Shopify, Stripe, and Walmart named as industry partners.

c02. PAP's v0.1 design uses OAuth-based sessions with a guest tier (no sign-in, e.g. stock checks) and a signed-in tier where the customer chooses read-only or write access, and it explicitly defers payments, push notifications, and finer-grained permissions to future versions rather than shipping them in v0.1.

c03. Stripe and Shopify are already members of Visa's rival Trusted Agent Protocol, so PAP enters a field of agent-merchant protocols that already overlaps on membership rather than starting from a clean slate.

c04. A GitHub default policy — in evaluate mode now, enforced starting November 2, 2026 — will block `pull_request_target`-triggered workflows on affected public repositories unless an explicit Actions policy is configured, per GitHub's own documentation.

c05. x402-foundation/x402's only `pull_request_target` workflow, `labeler.yml`, runs both automatic PR labeling and `check-verified-commits`, the job that enforces the repo's documented "all commits must be signed" rule; if the event is blocked on November 2 without reconfiguration, that enforcement stops running with no visible failure on the affected pull requests.

c06. This is a single contributor's bug report (opened October 8, filed by a non-maintainer, zero comments as of this writing) describing a policy change that is independently documented by GitHub, not a maintainer-confirmed incident or a fix already in progress.

c07. Cloudflare's Managed Defense published, on October 7, 2026, a beta agentic-triage pipeline that replaced an earlier single-agent prototype after that prototype produced claims the underlying evidence did not support.

c08. The replacement architecture moves evidence collection and scope enforcement into deterministic code ahead of any model call, then runs four narrow specialist agents in parallel under a coordinator before a synthesis step, specifically to stop detections from being treated as proof and to stop a failed lookup from being indistinguishable from a confirmed absence.
