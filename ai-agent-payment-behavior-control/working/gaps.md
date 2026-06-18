# Gaps — Behavior Control Techniques for AI Agent Payments

## Status after Sweep 1 (harvest + 4 background gather agents): GATHER COMPLETE

50 sources in working/sources.jsonl. All claims c01–c20 meet PROTOCOL §3 minimum sourcing:
- factual (c04, c09): ≥2 independent ✓
- interpretive (c01,c02,c10,c13,c15,c18,c19,c20): ≥1 ✓
- technical (c03,c05,c06,c07,c08,c11,c12,c14,c16,c17): ≥1 primary ✓

### Remaining thin spots → moved to uncertainties.md / Limitations (accepted, not blocking)
- c20 (control-location differences) rests on a single explicit source (s31) plus
  synthesis across card/on-chain/model-stack primaries; mark interpretive.
- c10 (on-chain harder to bypass than off-chain) is interpretive; the strongest
  paper (Acharya, s49) is access_limited (PDF), so it is cited as a landing-page
  lead and the claim is carried by Alqithami (s48) + vendor module docs.
- c15/c16/c18 each have 2 sources — adequate but lean; surfaced in uncertainties.

### Conflicts to surface in the draft (not silently resolved)
- x402 marketed as secure standard (s23–s25) vs Five Attacks on x402 paper (s36):
  present both.
- Vendor security claims (Visa "cannot be replayed or relayed" s08; AP2
  "tamper-proof"/"non-repudiable" s02/s06; Mastercard tokenization s09) vs
  red-team evidence that agent behavior is subvertible by prompts (s39, s40) and
  that prompt injection has no fool-proof defense (s41): present as the central
  tension (enforcement strength spectrum).

No open must-fix gaps. Proceed to draft.
