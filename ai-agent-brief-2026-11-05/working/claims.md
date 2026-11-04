# Claims

c01. Uber's CFO disclosed on the 2026-11-04 Q3 earnings call that only four
rides were ordered through an AI agent during the week of Halloween
(late October 2026), Uber's busiest week, against roughly 320 million total
trips and Eats orders that week.

c02. Uber disclosed that only about 500 Uber Eats orders in that same week
were placed by an AI agent.

c03. Uber CEO Dara Khosrowshahi said on the same call that agent-order
traction is "very, very early and very limited" but that Uber expects it to
be a net positive for demand, and that it is in conversations with every
major AI assistant maker.

c04. Cloudflare shipped (2026-11-04) per-user, per-agent visibility into
which "personal agent" (an AI assistant acting on a user's behalf, e.g. a
browser copilot) is making requests to a site, surfaced in Security
Analytics, Top statistics, and Account Abuse Protection (the last currently
in early access).

c05. Cloudflare's update lets a site set a different access policy — Allow,
Block on ad-monetized pages, or Block — per supported personal agent, rather
than one blanket Agents policy, and lets fraud teams mitigate a single
compromised account's hashed user ID without blocking the agent for every
other user.

c06. x402's resource-server gate hooks (beforeVerify, beforeSettle) failed
open before PR #3702 (merged 2026-11-04): a hook that threw instead of
returning a result was logged and ignored, and the payment proceeded to
verify and settle as if the hook had passed.

c07. PR #3702 made both gate hooks fail closed on a throw, rejecting the
payment with a dedicated error reason; PR #4133 (also 2026-11-04) renamed
that reason from a generic extension-hook code to phase-specific codes
because non-extension hooks use the same gate; PR #4132 updated the
lifecycle-hooks documentation to match. Advisory hook phases (after*,
on*Failure) still fail open by design.

c08. The underlying bug (issue #3689) was reported on 2026-10-04 and stayed
open for a month before the fix landed.

c09. x402's XRPL payment scheme enforced a client's spend cap correctly only
for fractional prices; a whole-dollar price such as $100 on an asset with
XRPL's default issued-currency scale bypassed a $1 cap, because the code
treated the ledger's scaled value as if it were already in atomic units.
Fixed in PR #4110 (merged 2026-11-04).

c10. mppx merged three more session-payment fixes on 2026-11-04: PR #1167
(Tempo access-key close-authorization signatures were wrapped in a keychain
envelope that TIP-1034 rejects, so closing a session paid with an access-key
account failed), PR #1168 (automatic payment paths could sign relayed
session challenges or reuse a channel across origins without verifying
origin ownership, and nested adapters could silently drop approval/payer
policy), and PR #1172 (a prepaid SSE item that failed after its charge
settled was not credited back, with no merchant-facing reconciliation path
for cases a local credit can't safely reverse).

c11. (why it matters) mppx's #1168 and x402's #3702/#4110 bring the trailing
week's count of disclosed fail-open or policy-boundary payment bugs on these
two codebases to at least four (also #1155, #1156 from the prior edition),
suggesting these are recurring categories on both codebases rather than
one-off incidents.
