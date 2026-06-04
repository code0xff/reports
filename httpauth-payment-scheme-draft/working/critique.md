# Critique — httpauth-payment-scheme-draft

Adversarial pass. Verdict: **0 must-fix; 2 nits.** Ready to publish.

## 1. Unsupported claims
- Swept both `draft.md` (ko) and `draft.en.md`. Every factual/technical sentence carries a `[^s..]` ref or is structural framing.
- The two interpretive items — "402-for-failed-credentials differs from 401" (c04) and "x402 backward-compat" (c17) — are attributed to independent commentary (s06) and flagged in prose _(외부 평가 / external assessment)_. Good.

## 2. Citation integrity
- After revision, all eight sources s01–s08 are cited in both drafts (s08 attached to the ecosystem mention in §6). Refs used = {s01..s08}; ids in sources.jsonl identical. No orphan source, no dangling ref.
- All 8 `accessed` = 2026-06-04 (within 90 days).
- URL liveness: 8/8 return HTTP 200 on curl -L (including the target .txt and the IETF datatracker).
- Quote spot-check: s01 normative quotes (MUST return 402 on failed validation; TLS 1.2 REQUIRE; single-use proof; no side effects before payment) are from the faithful fetch of the target draft. s02 abstract ("This document defines the 'Payment' HTTP authentication scheme…") and standing ("not endorsed by the IETF… no formal standing") are verified from the datatracker fetch. s05/s06 quotes verified from their fetches. s03/s04/s07/s08 quotes reflect fetched/searched repo/doc content.

## 3. Reasoning gaps
- No causation-from-correlation. The standing claim is a direct datatracker quote, not inference.
- Conflicts surfaced, not resolved: the version/date/naming divergence (`draft-ryan-httpauth-payment-01`, 2026-03-17 vs `draft-httpauth-payment-00`, 2026-06-03) is presented as an explicit metadata conflict in §6, gaps.md, and uncertainties.md — and the "Standards Track intent vs unadopted/no-standing" tension is foregrounded rather than smoothed.
- Conflict-of-interest (Tempo/Stripe authorship) is raised as an independence caveat, correctly framed as not-a-defect.

## 4. Missing counter-evidence
- The natural counter to "this is a standard" is the IETF standing reality, which is the report's headline corrective (§6, Abstract): individual draft, not endorsed, no formal standing. The independent x402-vs-MPP comparison (s06) and the COI note add adversarial balance. The report does not boost the draft uncritically; it repeatedly separates "the document specifies X" from "X is standardized/safe/adopted." No must-fix.

## 5. Tone and structure
- Abstract faithful to body: leads with what the doc is (MPP core, 402 semantics), the mechanics, the registry, the security model, then the standing/ecosystem reality — matching the body. Korean abstract heading `## 초록`; English `## Abstract`. OK.
- Limitations honestly mirrors gaps.md/uncertainties.md (v00/unadopted, version mismatch, single-document dependence, external assessments, COI). OK.
- No emoji/marketing voice. Hedges are deliberate epistemic markers. Lists used for challenge params and security norms.

## 6. Must-fix vs nit
- **must-fix:** none.
- **nit (1):** Single-document dependence is inherent to a document-analysis task; mitigated by foregrounding standing reality and framing content claims as "the document specifies."
- **nit (2):** Whether the site `draft-httpauth-payment` and IETF `draft-ryan-httpauth-payment` are byte-identical is not definitively reconciled; disclosed as a conflict rather than asserted.

No open must-fix. Proceed to validate → publish.
