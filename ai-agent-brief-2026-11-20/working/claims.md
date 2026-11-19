# Claims — ai-agent-brief-2026-11-20

c01. Stripe's November 19 Treasury update moves agent money-movement from a
read-only integration to a write-capable one gated by default human approval,
not merely an extension of the October 21 launch's scope.

c02. Visa's November 2026 Agentic Ready expansion is a deliberate pivot from
testing with issuers (the April 2026 expansion) to testing with the
acceptance side — merchants, PSPs, acquirers — which is the half of the
transaction Visa cannot certify unilaterally.

c03. Visa's own release ties Trusted Agent Protocol adoption to specific
acceptance-side partners (J.P. Morgan Payments, Airwallex) for the first time
in this expansion, rather than describing TAP only as a network-side
framework.

c04. The NETS–Ant International MoU is a framework-exploration agreement, not
a live pilot or shipped product — the distinction matters because coverage of
agent-payment deals routinely blurs "signed an MoU" with "launched."

c05. mppx 0.21.0's required `replay.authority` and strict
`Payment-Authorization` header matching are protective hardening against
payment replay and header-spoofing failure modes specific to agent-driven
payment flows, not routine dependency bumps.

c06. Why it matters: money-movement capability (Stripe, Visa acceptance
scale) is now outpacing the identity/trust layer (TAP's partner list, KYA
frameworks still at MoU stage, MPP's library-level credential-header fix)
that is supposed to make that movement safe to automate.

c07. _(early signal)_ The repeated appearance of exploratory MoUs (NETS/Ant)
alongside already-shipping money-movement features (Stripe, Visa) suggests
regional payment rails are a beat behind the card networks and PSPs on
agent-payment infrastructure, not that agent payments are universally mature.
