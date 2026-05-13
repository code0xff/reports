# Uncertainties

- Production deployment metrics for VIC are still pilot-scale; "hundreds of transactions" is the largest verifiable number to date.
- "Mainstream adoption by 2026 holiday season" is a vendor projection, not a verified outcome.
- The full list of protocols Intelligent Commerce Connect supports (TAP, MPP, ACP, UCP) is Visa-stated; not all of the named protocols have equally mature open specifications.
- TAP's well-known JWKS endpoint URL is documented today but is subject to operational change; integrators must treat the URL as a configuration parameter, not a hard-coded constant.
- The "agent-bound token" claim depends on enforcement at VisaNet during authorization; the network's per-agent control surface is described in product copy but the precise authorization-time rule set is not enumerated publicly.
