# Claims

c01. United Airlines announced on 2026-11-11 that it is restricting unauthorized third-party AI agents from booking flights, checking in, and making account/MileagePlus changes on its platforms and through travel agencies/aggregators that access its inventory, citing credential-exposure and unintended-transaction risk — moving the carrier from passive exposure to active agent-access control.

c02. United's restriction targets check-in specifically because federal rules require in-person verification of checked luggage contents, a constraint an agent cannot satisfy — this is a regulatory, not just commercial, reason for the carve-out.

c03. Google's A2UI reached a 1.0 stable release on 2026-11-11, adding bidirectional function calls, accessibility support, and SDKs/renderers for TypeScript, Dart, Python, React, Angular, Lit, Flutter, and SwiftUI — moving the protocol from release-candidate to production-ready for the renderers that are at 1.0 (Jetpack Compose remains at 0.9.1).

c04. A2UI's security model constrains an agent to a client-maintained catalog of pre-trusted UI components rather than letting it send arbitrary executable code — this is the protocol's load-bearing safety claim, not an incidental detail.

c05. mppx PR #1274 (merged 2026-11-11) fixed a bug where a rejected subscription credential could mutate shared dispatch state, letting a later request select an overlapping offer without going through that offer's identity policy — an identity-check bypass in the payment/identity stack the last two briefs have covered, not a cosmetic fix.

c06. Taken together, this window's items show agent-facing systems drawing access boundaries from both directions: who is allowed to act as an agent at all (United's authorization line) and what an admitted agent can actually do once inside (A2UI's component allowlist, mppx's dispatch-isolation fix).
