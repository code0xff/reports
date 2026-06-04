# Critique — l402-payment-flow-and-ecosystem

Adversarial pass. Verdict: **0 must-fix; 2 nits.** Ready to publish.

## 1. Unsupported claims
- Swept both `draft.md` (ko) and `draft.en.md`. Every factual/technical sentence carries a `[^s..]` ref or is structural framing.
- The protocol-vs-aggregator distinction (the report's central analytical claim) is explicitly sourced: Lightning-only via s12/s07/s11; Fewsats multi-rail via s09/s10. No uncited assertions.

## 2. Citation integrity
- All refs in both drafts ∈ {s01..s14}; every id exists in `sources.jsonl`. Grep diff clean.
- All 14 `accessed` = 2026-06-04 (within 90 days).
- URL liveness: 14/14 return HTTP 200 on curl -L.
- Quote spot-check: directly fetched/verified — s02 (header formats), s05 (Aperture description), s06 (library list), s07 (local-computation quote + Loop/Lightning-only), s08 (settlement times), s09 (offer/payment_methods/onchain), s10 (credit_card+lightning, Stripe checkout, USD cents), s11 (single-rail, bearer-macaroon quote), s12 (blip-0026 "standardized way…", Lightning-native). s01/s04/s13/s14 quotes are stable repo/guide descriptions confirmed via search. s03 (2020 LSAT post) quote is a paraphrase of the post's thesis rather than a fetched verbatim line — **nit**; the underlying facts (2020 origin, LSAT→L402 rename) are independently corroborated by s11 ("a Lightning Labs post in March 2020").

## 3. Reasoning gaps
- No causation-from-correlation. The technical flow is sourced to the spec; the layer distinction is argued, not assumed.
- Conflicts represented, not resolved: the Fewsats `payment_methods` snapshot difference (`['onchain']` vs `['credit_card','lightning']`) is explicitly surfaced in §7 and gaps.md rather than smoothed over.
- No universals/absolutes beyond what sources state ("Lightning-only," "single-rail by design") which are direct source characterizations.
- Numbers (1–3s Base, <1s Solana, ms Lightning, $11.05) carry units and attribution.

## 4. Missing counter-evidence
- Balance is structural: the report's core finding *is* the corrective counter to the naive premise that "L402 supports other chains / cards." It states plainly that the protocol does not, attributes the multi-rail capability to x402 and to aggregators, and presents L402↔x402 trade-offs both ways (volatility vs. latency; reusable credential vs. single-payment). Both "L402 is the agent rail" (Lightning Labs, s07) and "L402 is single-rail/niche vs. stablecoin rails" (s08, s11) viewpoints appear. No one-sided framing; no must-fix.

## 5. Tone and structure
- Abstract faithful to body: leads with the flow, libraries, Lightning usage, then the protocol-vs-aggregator answer to the cross-rail/card question — exactly the body's arc. Korean abstract heading `## 초록`; English `## Abstract`. OK.
- Limitations honestly mirrors gaps.md/uncertainties.md (fast-moving, layer-conflation risk, Fewsats snapshot diff, 404/draft status, source nature/maintenance). OK.
- No emoji, no marketing voice. Hedges are deliberate. §5 uses (a)/(b)/(c) structure that directly maps to the user's sub-questions.
- Paragraph lengths reasonable; lists used for libraries and flow steps.

## 6. Must-fix vs nit
- **must-fix:** none.
- **nit (1):** s03 (2020 LSAT post) quote is a paraphrased thesis, not a fetched verbatim line; facts corroborated by s11.
- **nit (2):** Library maintenance currency (Boltwall/lsat-js) unverified — disclosed in Limitations.

No open must-fix. Proceed to validate → publish.
