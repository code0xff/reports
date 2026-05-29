# Uncertainties

- **Spec is mid-flight.** AP2 is at v0.2 (April 2026) and has just been donated to FIDO Alliance; field names and the `vct` versioning suffix may change. Implementations MUST match the exact `vct` string, so any shift forces a code change.
- **v0.1 and v0.2 both ship in the repo.** Pydantic v0.1 models (Intent/Cart/Payment) are still used by the original `shopping_agent`; v0.2 schemas drive `shopping_agent_v2`. Independent writeups disagree on which model to describe; the report shows both.
- **Adoption beyond the launch press release is vendor-stated.** "60+ partners" comes from Google's announcement and press writeups; we did not independently verify each partner's production integration.
- **Dispute / chargeback flow is conceptual, not normative.** The spec says Mandates "can be used as evidence at the time of dispute" but the dispute-side procedure is not normatively specified.
- **Verifiable Intent is co-developed with Mastercard and donated to FIDO.** FIDO governance has only just begun, so the final form may differ from the AP2-repo-shipped version.
