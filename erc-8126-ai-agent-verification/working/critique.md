# Critique — ERC-8126 (adversarial pass)

## 1. Unsupported claims
- Walked every paragraph of `draft.md` / `draft.en.md`. Every factual
  assertion carries a `[^s..]` ref. Interpretive judgments in §비판적 분석
  and §논의 are explicitly marked `_(interpretive)_` or framed as the
  author's view, which is acceptable under PROTOCOL §Draft.
- One borderline: "ERC-8004가 2026년 1월 메인넷에 배포되었다" rests on a
  single secondary source (s10). → must-fix (RESOLVED): added single-source marker.

## 2. Citation integrity
- All footnote refs in both drafts (s01–s10) exist in `sources.jsonl`. ✓
- `s11` (Medium analysis) is defined but **not referenced** in either draft
  → would render as an orphan bibliography entry. → **nit→fix**: cite it
  once (independent demand-signal context) or drop it. Decision: cite once.
- All `accessed` dates = 2026-06-08 (within 90 days). ✓
- Link liveness: curl -L on all 8 distinct cited URLs returned **HTTP 200**
  (eips ×2, ethereum-magicians, erc8126.ai, erc8196.ai, arxiv, quicknode,
  chainup). No dead links. ✓
- Quote spot-check: s02 ("Final" + requires "155,191,712,721,3009,8004"),
  s03 (@lejuho WAV / @opwizardx fragmentation / Draft→Last Call timeline),
  s06 ("isn't finished yet" / "a design space") — all trace back to the
  fetched page content. ✓

## 3. Reasoning gaps
- No causation-from-correlation errors found; the averaging critique is
  presented as reasoned interpretation, not empirical causation.
- No "most people / everyone / no one" overgeneralizations.
- Numbers (0–100, five tiers, ~5 months) all carry timeframe/context.
- The "arithmetic mean hides worst axis" claim is a logical property of the
  mean, not an empirical generalization from one example — acceptable, and
  marked interpretive.

## 4. Missing counter-evidence
- Ran an additional sweep targeting endorsement/adoption/positive signal for
  ERC-8126. Result: **no independent endorsement, audit, or production
  adoption surfaced.** The only "positive" framing comes from the authors'
  own channels (project sites; a @cybercentry X post that itself calls the
  proposal "Draft as of February 10, 2026"). This corroborates — rather than
  contradicts — the draft's "vendor-shaped" and "adoption-unproven" findings.
- The author's own Feb-2026 "Draft" framing reinforces the represented
  status conflict; the draft already presents Final-vs-Draft honestly.
- Conclusion: no unrepresented counter-evidence. Not a must-fix.

## 5. Tone and structure
- Abstract is faithful to the body (five mechanisms, PDV/ZKP, mean
  aggregation, four structural weaknesses, vendor-shaped verdict). ✓
- Limitations section reflects `gaps.md` (early draft, scarce independent
  analysis, no audit, adoption unproven, status caveat). ✓
- No emoji, no marketing voice. The draft includes a balanced "what it gets
  right" section, so the critical stance is not one-sided. ✓
- No paragraph exceeds ~6 sentences except the Abstract, which is
  intentionally dense per house style. ✓

## 6. Must-fix vs nit — disposition
- must-fix #1 (RESOLVED): mark the single-source mainnet-launch claim
  `_(unverified — single source)_` in both drafts. → FIXED.
- **nit (fixed)**: cite orphan source s11 once in both drafts. → FIXED.
- Remaining: none.

**Counts: 1 must-fix, 1 nit — both resolved in revision below.**
