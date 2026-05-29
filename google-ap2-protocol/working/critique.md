# Critique — Google AP2

## Must-fix
_None._ All 18 claims sourced; code-level claims cite the spec and SDK files directly.

## Citation integrity
- All `[^sNN]` refs map to sources.jsonl (s01–s13).
- Mastercard / Verifiable Intent FIDO co-development single-source claim is marked unverified in the English draft.
- v0.1 vs v0.2 disagreement presented as observation, not resolution.

## Source diversity
- Primary (Google-controlled): s01,s02,s03,s04,s05,s06,s07,s08,s09.
- Independent commentary: s10 (Vellum), s11 (Eco), s12 (NoHacks), s13 (Medium).
- Technical claims anchored to canonical sources s01/s04/s05, not commentary.

## Counter-evidence surfaced
- v0.1 and v0.2 dual shipping in repo is not silently resolved.
- "Agent itself is a potential attacker" framing taken verbatim from spec and used to derive design implications.

## Honest limitations
- Limitations section names what is not covered.
- Uncertainties register flags vendor-stated metrics, mid-flight spec, missing dispute procedure.

## Minor nits (deferred)
- Example code is condensed sketch faithful to imports / ADK usage / ECDSA-P256, not a verbatim copy; reader must wire MandateClient.sign(...) to their SDK install.

## Verdict
Ship.
