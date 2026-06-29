# Critique — prediction-market-platform-tech

Adversarial verification pass, 2026-06-29.

## 1. Unsupported claims
- Every paragraph in `draft.md` / `draft.en.md` carries `[^s..]` citations on its factual sentences. Interpretive sentences are marked `_(interpretive)_`.
- The "~98.5% resolved without escalation" figure was single-source (s19, a blog). **Action:** added academic support (s21, Wen/Zhou/Huang 2026) for the qualitative claim ("most queries resolved efficiently... only the small fraction of disputed cases invoke voting"); kept the exact 98.5% number marked single-source. **nit → fixed.**

## 2. Citation integrity
- All 20 (now 21) refs used in both drafts exist in `sources.jsonl`. ✔
- All `accessed` dates = 2026-06-29 (within 90 days). ✔
- No manual `## References` heading; no `[^s..]:` footnote-definition blocks. ✔ (renderer builds bibliography from sources.jsonl)
- URL liveness (curl -L): 200 on docs.polymarket.com (×4), arxiv, uma.xyz, dlnews, fortnow LMSR PDF, ar5iv Augur, Wikipedia, CoinDesk, Decrypt, Fortune, rocknblock (×2). 403/429 on The Defiant (×2), The Block, readthedocs, kalshi.com — these are bot/rate-limit responses on known-live sites whose content was successfully fetched during gather; not dead links. ✔
- Quote spot-check (3): s01, s02, s05 quotes verified verbatim against WebFetch of the live pages. ✔

## 3. Reasoning gaps
- Volume figures: every number now carries a timeframe and a denominator/comparison (headline vs exchange-equivalent vs wash-trading share). ✔
- No "most people / everyone / no one" absolute generalisations remain. The one quantified majority claim ("more than half of UMA votes from top 10 wallets") is attributed to a specific investigation (s17). ✔
- Causation vs correlation: the operator-trust and oracle-capture arguments are flagged `_(interpretive)_`, not asserted as proven. ✔

## 4. Missing counter-evidence — **MUST-FIX (now resolved)**
- The draft presented the oracle controversy (s15/s16/s17) but did **not** represent the defense/counter-framing. Counter-evidence sweep found:
  - UMA/Polymarket's stated rationale that the disputed outcome lacked a "consensus of credible reporting" (already in draft via s15).
  - Academic framing (s21): the optimistic design is a deliberate efficiency trade-off ("assume honesty first"), and the root cause of contentious resolutions is **natural-language ambiguity in question phrasing**, not necessarily fraud.
- **Action:** added s21 and a counter-framing paragraph to the Discussion in both drafts so the dispute is presented as a contested design trade-off, not a settled failure. Resolved.

## 5. Tone and structure
- Abstract faithful to body (lists the same 5 components and the same two contested items). ✔
- Limitations section mirrors `gaps.md` / `uncertainties.md`. ✔
- No emoji / marketing voice. ✔
- Paragraphs split where they ran long (oracle section, discussion). ✔

## 6. Must-fix vs nit
- **Must-fix: 1** (missing counter-evidence on oracle) → resolved.
- **Nits: 1** (single-source 98.5% figure) → mitigated.
- No open must-fix items. Cleared for publish.
