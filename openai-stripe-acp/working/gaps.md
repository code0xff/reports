# Gaps

All 16 claims meet the minimum sourcing threshold (factual ≥2 independent, interpretive ≥1, technical ≥1 primary).

Resolved during gather:
- Allowance and `vt_…` token shape sourced both from the OpenAI Developers spec page and from the canonical example JSON, plus the OpenAPI YAML.
- Header set (Signature/Timestamp/Idempotency-Key/API-Version) sourced from the OpenAPI parameters section.
- Two-spec composition (Agentic Checkout + Delegated Payment) sourced from the OpenAPI files directly.

Outstanding:
- The OpenAI launch blog post (s09) returned HTTP 403 to WebFetch; marked `access_limited: true` and corroborated only via search-result snippets. The fact that ChatGPT Instant Checkout uses ACP is independently confirmed in OpenAI Developer docs (s04), so the claim itself is not under-sourced.
- A real conflict on whether Meta is a co-creator. Stripe docs / search summaries say "Stripe, OpenAI, and Meta"; the canonical README and agenticcommerce.dev list only OpenAI and Stripe. Surfaced as conflict in the report (Discussion section).
