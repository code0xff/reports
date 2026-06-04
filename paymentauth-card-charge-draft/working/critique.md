# Critique — paymentauth-card-charge-draft

Adversarial pass. Verdict: **0 must-fix; 2 nits.** Ready to publish.

## 1. Unsupported claims
- Swept both `draft.md` (ko) and `draft.en.md`. Every factual/technical sentence carries a `[^s..]` ref or is structural framing.
- The one interpretive item (c17, evm-charge vs card-charge contrast) is attributed to the two drafts + multi-rail commentary (s07/s08) and flagged as interpretation. Good.

## 2. Citation integrity
- All eight sources s01–s08 are cited in both drafts; ids in sources.jsonl identical. No orphan source, no dangling ref.
- All 8 `accessed` = 2026-06-04 (within 90 days).
- URL liveness: 6/8 return HTTP 200. Two return 403 — **s05 (Visa Investor Relations)** and **s08 (Finextra)** — both well-known bot-blockers that serve the pages to browsers; per the fetch-failure conventions these are not dead links. Their load-bearing facts are cross-sourced to 200-verified sources: TAP definition via s04 (Visa Developer, 200) and the MPP/multi-rail framing via s07 (Formo, 200) and s02 (mpp.dev, 200). So no claim rests solely on a 403 source.
- Quote spot-check: s01 normative quotes (RSA 2048/RSA-OAEP-256; "only encrypted network tokens travel…"; MUST NOT parse encryptedPayload; once-per-challenge + idempotency key; 200 immediately after authorization; TLS 1.2+) are from the faithful fetch of the target draft. s02 (mpp.dev card), s03 (EMVCo SRC), s04 (Visa TAP), s06 (Boston Fed PAR/tokenization) verified from fetches/search. s05/s08 quotes reflect search-surfaced content from those publishers.

## 3. Reasoning gaps
- No causation-from-correlation. The tokenization basis is grounded in independent EMVCo/Boston Fed sources, not inferred from the draft alone.
- Conflicts/distinctions surfaced, not smoothed: the `card` vs `stripe` method distinction is explicitly flagged in §2, gaps.md, uncertainties.md; the Informational (not Standards Track) status and the single-author Visa COI are foregrounded.
- Numbers carry context (RSA 2048, AES-256-GCM, "4999"=$49.99, ISO 4217). No orphan figures.

## 4. Missing counter-evidence
- The report does not boost the draft uncritically: it states the spec leaves 3DS/SCA and refunds unspecified, flags Informational/v00/unadopted status, raises the Visa single-author conflict of interest, and notes PSP-agnosticism vs Visa-centric examples. The independent EMVCo/Boston Fed sources validate the tokenization claims rather than echoing the vendor. Adversarial balance is present; no must-fix.

## 5. Tone and structure
- Abstract faithful to body: leads with what the doc is (MPP card binding, Visa author, Informational), the network-token/JWE mechanism, settlement, and the evm-charge contrast + Visa ecosystem — matching the body. Korean abstract heading `## 초록`; English `## Abstract`. OK.
- Limitations honestly mirrors gaps.md/uncertainties.md (v00/Informational, single-document, 3DS/refunds unspecified, card/stripe distinction, COI). OK.
- No emoji/marketing voice. Hedges are deliberate. Lists used for schema fields and norms.

## 6. Must-fix vs nit
- **must-fix:** none.
- **nit (1):** s05 (Visa IR) and s08 (Finextra) bot-block automated fetches (403, browser-live); load-bearing facts cross-sourced to s04/s07/s02.
- **nit (2):** Single-document dependence on the schema details, inherent to a document-analysis task; mitigated by external corroboration of the tokenization model and by status/COI disclosure.

No open must-fix. Proceed to validate → publish.
