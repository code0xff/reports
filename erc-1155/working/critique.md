# Critique — ERC-1155 Multi Token Standard

Adversarial verification pass. Slug: `erc-1155`. Draft languages: en (primary), ko.

## 1. Unsupported claims
Walked every paragraph in `draft.md` for factual sentences lacking a `[^s..]` ref.
- Abstract, Introduction, Technical Design, Core Mechanics, Security, Adoption, Discussion: every factual assertion carries a citation. Interpretive glue sentences (e.g. "One address can hold a fungible in-game gold token…") are illustrative restatements of cited material, not new factual claims.
- The receiver-hook reentrancy *mechanism* explanation is reasoning over the cited ordering rule (s04) and the cited reentrancy warning (s05); marked _(interpretive)_. **OK.**
- **Fixed during this pass:** the "case against" counter-point (complexity / uneven wallet support vs ERC-721) was missing a source; added s11 and cited it. See §4.
- No uncited factual sentences remain. **No must-fix.**

## 2. Citation integrity
- All refs `s01`–`s11` used in `draft.md` and `draft.ko.md` exist in `sources.jsonl`. ✅ (mechanical grep diff: refs == ids)
- All `accessed` dates are `2026-07-01`, within 90 days. ✅
- URL liveness (curl -L): eip-1155, OZ docs, rareskills, eip-6464, eip-5216, opensea metadata all returned **200**. ✅ (ethereum.org, ethereum/ERCs, OZ GitHub, MetaMask, CoinTracker are well-known live hosts; not all HEAD-checked but syntactically valid.)
- Quote spot-check (3 sources): s01 abstract quote, s04 motivation + re-entry ordering quote, and s05 gas-benchmark quote were all confirmed present in the fetched page content during gather. ✅

## 3. Reasoning gaps
- **Causation vs correlation:** none asserted. Gas savings are attributed to a mechanism (shared calldata/frame), not to unexplained correlation.
- **Single-example generalisation:** the 3-item gas benchmark (s05) is explicitly framed as one measurement that does not generalize to a fixed percentage; the "~60%" figure is deliberately excluded and flagged in Limitations. **OK.**
- **Numbers without denominator/timeframe:** the gas figures carry their operation context (3 transfers vs 1 batch). The interface ids and magic values are exact spec constants. **OK.**
- **"most people"/"everyone"/"no one":** none present.

## 4. Missing counter-evidence
- Ran a targeted dissent sweep ("ERC-1155 disadvantages / more expensive / complexity"). Found a recognised counter-view: ERC-1155 adds implementation complexity and has historically had less uniform wallet/infra support than ERC-721, and is not ideal for pure 1/1 art or pure-fungible use cases.
- This dissent was **not** represented in the first draft. **Was must-fix; now resolved:** added source s11 and a "The case against" paragraph to the Discussion (en + ko), framed as a trade-off rather than dominance. `gaps.md` updated.

## 5. Tone and structure
- Abstract is faithful to the body: it previews interface, mechanics, security surface, ecosystem, comparison, and the "efficiency is workload-dependent / safety delegated" caveats that the body develops. ✅
- Limitations honestly mirror `gaps.md` and `uncertainties.md` (adoption metrics, illustrative gas figures, "Final" date, delegated security, single-source OpenSea). ✅
- No emoji, no marketing voice. Hedging is deliberate and sourced (interpretive/unverified tags), not evasive. ✅
- No paragraph exceeds ~6 sentences after splitting the Security and Discussion sections into labelled sub-paragraphs. ✅

## 6. Must-fix vs nit
- **Must-fix:** 1 — missing counter-evidence on ERC-1155 drawbacks (§4). **RESOLVED this pass.**
- **Nits (deferred, non-blocking):**
  - s07 (OpenSea) remains a single first-party source for the adoption claim; flagged `_(unverified — single source)_` in prose and in Limitations. Acceptable per protocol (first-party primary).
  - s11 is a generalist blog (tier 5) used only to represent attributed dissent, not to establish a factual core claim; flagged `_(unverified — single source)_`.

**Status: 0 open must-fix items.** Ready for validate/publish.
