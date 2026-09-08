# Claims

c01. Meta's Muse, launched 2026-09-08, executes checkout through Link by Stripe using a one-time-use virtual card rather than the user's real card details, and gates purchases and other sensitive actions on explicit user approval mediated by a separate "Sentinel" agent.

c02. Google's Threat Intelligence Group documented a 2026-Q2 incident in which a financially motivated threat actor used a multi-agent framework to plan, build, and execute a mass credential-harvesting campaign — compromising thousands of third-party credentials — in under six hours with no manual intervention.

c03. GTIG's report frames this as tactical automation of existing tools rather than fully autonomous exploitation: it has not observed an end-to-end autonomous pipeline for zero-day discovery and exploitation against real-world targets.

c04. Stripe and Tempo's Machine Payments Protocol merged a spec addition (PR #346, 2026-09-08) registering XRPL as a payment method, with both a single-transaction "charge" mode and an off-ledger "session" payment-channel mode.

c05. A formal-verification paper (arXiv 2609.00060, submitted 2026-08-30) modeled x402, MPP, ACP, and AP2 in Tamarin and found 40 previously undocumented consistency gaps across 86 verification cases, concluding that delegated authorization is not consistently enforced across actors and protocol stages in any of the four protocols studied.

c06. Taken together, this week's items sit on the same fault line as prior weeks: an approval boundary that works when a human is in the loop (Muse) and fails when nothing is checking it in real time (GTIG's six-hour attack), while the protocols meant to formalize that boundary still have undocumented gaps (the Tamarin paper).
