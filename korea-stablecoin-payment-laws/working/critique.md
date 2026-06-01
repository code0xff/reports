# Critique — korea-stablecoin-payment-laws

Adversarial pass. Verdict: **0 must-fix; 2 nits.** Ready to publish.

## 1. Unsupported claims
- Swept both `draft.md` (ko) and `draft.en.md`. Every factual/technical sentence carries a `[^s..]` ref or is structural framing.
- The interpretive EFTA-PG-classification sentence is explicitly flagged as interpretation _(법적 해석 …)_ and the single-source FX statistic is flagged _(unverified — single source)_, per protocol.
- The "2020 EFTA amendment turf clash" historical aside rests on a single source (s03); it is background colour, not load-bearing — **nit** (could add a second source).

## 2. Citation integrity
- All refs in both drafts ∈ {s01..s14}; every id exists in `sources.jsonl`. Grep diff clean.
- All 14 `accessed` = 2026-06-01 (within 90 days).
- URL liveness: 13/14 return HTTP 200 on curl -L. s14 (MOJ 논단 PDF) returns 307 to its download handler — it is marked `access_limited: true` with `quote: null`, so this is expected, not a dead link.
- Quote spot-check: directly fetched and verified — s03 (5개 법안 인가/100% 준비금), s04 (비은행/은행안, 부처 관할 다툼), s06 (KCMI 대외지급수단/개별법 개정), s07 (망분리/금산분리), s10 (Korea Times two quotes), s13 (은행 51% 룰/만장일치 협의체). s01 is the statute's Article 1 purpose (standard). s05 verified (1단계/2단계 lines). s08/s09/s11/s12 are news whose quotes are reported-fact summaries — **nit**: not all four were fetched verbatim, but each fact they support is cross-sourced to a fetched source (FETA via s06; delay via s13; the 90% stat is explicitly single-source-flagged).

## 3. Reasoning gaps
- No causation-from-correlation. The capital-flight argument is attributed (s06, s12), not asserted as proven.
- Numbers carry context: capital threshold given as a *range* (KRW 0.5B–5B) with the bill-dependent caveat; the 90% FX stat is flagged single-source.
- No "everyone/no one" universals. "Prevailing interpretation" for EFTA is hedged, not absolute.
- Conflicts presented, not resolved: FSC vs BOK issuer, bank vs non-bank, flexible equity vs 51% rule — all shown with both sides.

## 4. Missing counter-evidence
- Balance check: the report carries both the skeptical view (BOK conservatism, "half-measure" network/banking-separation barrier, capital-flight risk) *and* the constructive view (the law as a "rule book" reducing regulatory uncertainty, s10; FSC's flexibility argument; non-bank innovation case). Both the "stablecoin payments are over-constrained" and "the framework will enable them" positions are represented. No one-sided framing; no must-fix.

## 5. Tone and structure
- Abstract faithful to body: leads with "no single in-force law," the phase-1/phase-2 split, the four current laws, and the institutional-conflict/half-measure tension — all developed in §2–§6. Korean abstract heading `## 초록`; English `## Abstract`. OK.
- Limitations honestly mirrors gaps.md/uncertainties.md (unfinalized law, unresolved issuer, interpretive/under-review items, single-source stat, source skew). OK.
- No emoji, no marketing voice. Hedges are deliberate epistemic markers. Impact-synthesis table renders as GFM (minimal renderer supports tables).
- Paragraph length OK; §3 is split by law into digestible blocks.

## 6. Must-fix vs nit
- **must-fix:** none.
- **nit (1):** 2020 EFTA turf-clash aside is single-source background (s03).
- **nit (2):** s08/s09/s11/s12 news quotes are reported-fact summaries, not all fetched verbatim; underlying facts are cross-sourced and the one single-source stat is flagged.

No open must-fix. Proceed to validate → publish.
