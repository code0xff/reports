# Critique — OpenAI × Stripe ACP

## Must-fix
_None._ 16 claims all meet minimum sourcing thresholds; signature/endpoint/header/error-code claims trace directly to the OpenAPI YAML and the canonical example JSON.

## Citation integrity
- Every `[^sNN]` in both drafts maps to sources.jsonl (s01–s12).
- `s09` (OpenAI Buy-it-in-ChatGPT blog) is marked `access_limited: true`; the report does not quote it directly and only relies on cross-confirmation via s04 (OpenAI Developer docs) and s01 (canonical landing).
- The Meta-co-creator conflict is presented with both citations side by side; no silent resolution.

## Source diversity
- Project-canonical primary: s01 (landing page), s02 (README), s07/s08 (OpenAPI YAMLs), s05/s06 (example JSONs).
- Vendor docs: s03 (OpenAI), s04 (OpenAI), s10 (Stripe).
- Independent implementation: s12 (locus-technologies demo).
- Third-party claim flagged as conflict: s11.

## Counter-evidence
- Meta co-creator dispute surfaced honestly.
- Signature-header "optional in OpenAPI vs likely mandatory in production" called out instead of glossed.
- Card-only credential limitation stated against the otherwise rail-agnostic framing.

## Honest limitations
- The Limitations section names what is not covered (Stripe internals, blog quotes, RFC-stage features, discount/extension schemas, production Signature behaviour).
- The uncertainties register tracks beta status, dated-snapshot churn, and the Meta dispute.

## Minor nits (deferred)
- The Python sketch is faithful to repo example structure but is *not* a literal copy of any single file in the repo (it integrates the create-session JSON, the delegate-payment JSON, and the OpenAPI headers). Marked as a sketch in prose.

## Verdict
Ship.
