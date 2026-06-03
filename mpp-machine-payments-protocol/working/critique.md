# Critique — MPP (Machine Payments Protocol)

Self-critique pass over `draft.md` / `draft.en.md` against `sources.jsonl` and `claims.md`.

## Method
- Walked every footnote ref `[^sNN]` in both drafts and confirmed it resolves to a source in `sources.jsonl`.
- Checked each substantive factual/quantitative claim for ≥2 independent sources, interpretive claims for ≥1 marked source, technical claims for ≥1 primary source (PROTOCOL §3).
- Looked for silently-resolved conflicts, single-source claims not marked, and vendor-only assertions not qualified.

## Citation integrity
- Footnote refs used in drafts: s01–s24. All resolve. No ref points to a missing id. s23 (Parallel) is cited once as an adoption signal — acceptable.
- No manual `## References` / `## 참고문헌` section and no `[^sNN]:` definition blocks in either draft (renderer builds bibliography from sources.jsonl). ✔ PROTOCOL §3 Draft rules.
- Abstract headings: `## 초록` (ko) and `## Abstract` (en). ✔ house style.

## Claim-by-claim support
- c01 (402 standardization): s01 + s17 + independent s18/s21. ✔ multi-source.
- c03 (Tempo+Stripe co-dev): s17 + s18 + s19 + s24. ✔ strong.
- c04/c05 (IETF draft, authors, no standing, expiry, license): s20 + s19. ✔ primary.
- c07–c11 (challenge/credential/receipt mechanics): primary s02–s06. ✔ technical primary.
- c12 (transports incl. -32042, _meta): primary s06–s08. ✔.
- c15 (session EIP-712/ecrecover/sub-100ms): primary support is indirect (s08/s16); specific mechanism from s22 (blog, trust 3). Marked _(독립 해설 기반 / independent explainer)_ in prose. ✔ honestly qualified.
- c17 (only Tempo/Lightning/Stellar advertise session): single source s11, marked _(unverified — single source)_. ✔.
- c23 (vs x402, payment vs auth): interpretive, sources s21 + s22, marked _(interpretive)_. ✔.
- c24 (volume ~31,100 tx/$3,730): single source s22, self-flagged unverified; marked _(unverified — single source)_ + "미검증/2주 경과". ✔.

## Conflicts
- No direct source conflicts surfaced. The main tension — vendor optimism vs. low real volume — is presented explicitly in the Analysis and Limitations sections rather than resolved silently. ✔ PROTOCOL §3.

## Source diversity / independence
- Primary docs (mpp.dev) dominate the mechanics — appropriate for a technical protocol analysis, but flagged in Uncertainties as vendor-led.
- Independence is provided by: IETF datatracker (s20), GitHub spec (s19), Cloudflare (s21), Parallel (s23), formo (s22), Zuplo (s24). The draft explicitly notes most "external" sources are integrators/commentators, not neutral bodies. ✔ honest.

## Weaknesses / nits (non-blocking)
- N1: `feePayer` "fee service endpoint / Handler.feePayer" detail from s16 was simplified to "feePayer 계정 지정"; acceptable abstraction, no overclaim.
- N2: Stellar "session/channel" and Lightning "session" support is asserted from the methods overview (s11) only; flagged single-source already.
- N3: IETF draft expiry stated as 2026-09-19 (datatracker) consistently in both drafts; uncertainties.md aligned to the same date.

## Must-fix
- None. All single-source and vendor-stated claims are marked; interpretive claims are labeled; conflicts/uncertainties are surfaced in Analysis + Limitations + uncertainties.md.

## Verdict
Ship-ready. No must-fix items. Nits N1–N3 are acceptable for publication.
