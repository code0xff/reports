# Critique — bitvm-deep-dive

Adversarial pass. Verdict: **0 must-fix; 2 nits.** Ready to publish.

## 1. Unsupported claims
- Swept both `draft.md` (ko) and `draft.en.md`. Every factual/technical sentence carries a `[^s..]` ref or is structural framing.
- Numeric ranges (Groth16 script size; tx count) are explicitly hedged in prose with a parenthetical and multi-source cites — not asserted as single facts. OK.
- The Taproot "activated in 2021" date is stated as well-known background without a dedicated cite — common-knowledge, but flagged as **nit** (could add a source).

## 2. Citation integrity
- All refs in both drafts ∈ {s01..s13}; every id exists in `sources.jsonl`. Grep diff clean.
- All 13 `accessed` = 2026-06-01 (within 90 days).
- URL liveness: 12/13 return HTTP 200 on curl -L. s12 (Medium "Considered Unsafe") returns 403 to curl — Medium bot-blocks automated agents; the page is live in browsers. It is marked `access_limited: true` with `quote: null`, and its thesis is independently carried by Decrypt (s08). **Nit**, not a dead link.
- Quote spot-check: s01 ("merely verified… limited to the two-party setting"), s05 ("does not require the creation of Merkle trees…"), s03 ("anyone can act as verifier… only burn them"), s08 (Whittle/Wall quotes), s07 (1.2 GB) all match the fetched extractions. s04/s10/s12 carry `quote:null` under `access_limited` per schema. OK.

## 3. Reasoning gaps
- No causation-from-correlation. The "verify don't compute" and trust-model claims are definitional/technical, sourced to primaries.
- No unqualified universals. "Nearly every source frames this as trust-minimized" is hedged and backed by ≥2 independent sources (s08, s09).
- Numbers always carry context (units, source, time-trend). The 1000× / 2.5 kvB / $5 figures are attributed to a secondary explainer (s11) and flagged as such; the canonical BitVM3 paper (s10) is access-limited — acceptable, disclosed in Limitations.

## 4. Missing counter-evidence
- Counter-evidence is central, not bolted on: §6 carries the capital-formation critique (Whittle, s08/s12), the liveness/DoS concern (s08), the Eric Wall skepticism (s08), and the independent capital-overhead analysis (Alpen, s07) — *and* the proponent rebuttal (Edan Yago, s08). Both sides of "trust-minimized vs unsafe" are represented with attribution.
- The opposite of the critique (proponents' mitigation argument) is included, so the section is not one-sided in either direction. No must-fix.

## 5. Tone and structure
- Abstract faithful to body: it leads with the verify-don't-compute paradigm, the four-generation arc, the 1-of-n model, and the trust-minimized-not-trustless tension — all developed in §3–§6. Korean abstract heading is `## 초록`; English is `## Abstract`. OK.
- Limitations honestly mirrors gaps.md/uncertainties.md (fast-moving, moving numbers, vendor/preprint sourcing, PDF access, maturity). OK.
- No emoji, no marketing voice. Hedges (_early signal_, parenthetical range note) are deliberate epistemic markers per protocol.
- Paragraph length: §6 of the Korean draft has one ~7-sentence paragraph (the capital critique). Coherent single argument with inline cites — **nit**, could split.

## 6. Must-fix vs nit
- **must-fix:** none.
- **nit (1):** Taproot 2021 date uncited (common knowledge).
- **nit (2):** s12 Medium 403s to automated fetch (browser-live; access_limited + corroborated by s08).

No open must-fix. Proceed to validate → publish.
