# Uncertainties

- 1Password's agent-login feature names six supported agents but does not specify what, if anything, bounds an agent's actions once a login succeeds — whether the brokered credential is scoped to a single action or persists for the session is unclear from the announcement alone.
- Agent Compute Engine is described as entering preview "in the coming months" with no firm date; the architecture (microVM isolation, SPIFFE identity, Titanium offload) is vendor-described and unverified by outside security researchers.
- Project Chrysalis is explicitly a research reference architecture, not a shipping product — its defense-in-depth stack and 1.8-second figure should not be read as describing production Gemini Enterprise behavior today.
- Stripe's "machine-readable consumer intent" framing is Stripe's own synthesis of multiple Money20/20 panels; whether Amex's and Stripe's competing proposals converge on a shared spec, or splinter into incompatible issuer-side and merchant-side formats, is unresolved and worth tracking.
