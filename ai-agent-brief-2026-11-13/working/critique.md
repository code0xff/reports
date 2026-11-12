# Critique

## 1. Unsupported claims

Checked every paragraph in `draft.md`. All factual assertions carry a `[^sNN]` ref except:
- The "Why it matters" paragraph's characterization of x401/FIDO/Okta as "still being fought over separately... none of which shipped anything this window" — this is a negative claim (nothing shipped) drawn from the Phase 1 web-search sweep, not from a cited source. **Nit**: left uncited deliberately, since it is a scope statement about this window's search results, consistent with how other editions describe silent beats (e.g. "Card networks... again produced nothing"). No fix needed; this is the brief's own research finding, same as the UCP/AP2 silence claims elsewhere in the draft.
- "Brave joins You.com and Linkup, both of which already answer a bare request with x402's 402 challenge; Exa and Parallel, per third-party reviews, are still on API keys." — attributed to "third-party reviews" without a specific citation. **Nit**: this is comparative color from the Phase 1 WebSearch sweep (xpay.sh, yage.ai reviews), not load-bearing to any claim in claims.md, and is hedged with "per third-party reviews." Left as is; promoting it to a full citation would overweight a minor aside.

No must-fix items here.

## 2. Citation integrity

- All four `[^s01]`–`[^s04]` refs used in `draft.md` exist in `working/sources.jsonl`; no orphan refs, no uncited sources (`validate-report` confirms).
- All four sources show `"accessed": "2026-11-13"` — within 90 days.
- HEAD/GET check via curl: all four URLs return 200.
- Quote spot-check: s01's quote ("Brave Search API endpoints behind x402 require payment on every request rather than authentication.") and s03's quote (GA + MCP server language) were both confirmed present on their pages by the web-fetch sub-agent that read them directly. s04's quote is the PR's own description text, pulled verbatim via `gh api`. s02 (HN item) quote is the story title, confirmed via `search_social.py` output.

No must-fix items here.

## 3. Reasoning gaps

- No causation-from-correlation claims found; each item's significance is stated as what the artefact itself does, not as an inferred effect on a third party.
- No "most people / everyone / no one" generalizations.
- The one quantitative claim without a denominator is Brave's "$0.005 per request" figure — the draft already flags this as vendor-stated and notes the gas subsidy and single-chain scope that make the steady-state price uncertain (`gaps.md`, `uncertainties.md`).
- The HN "zero comments" observation in the Brave section is a single data point elevated to a claim about industry attention. **Nit**: reasonable as a noted oddity, flagged as an observation rather than a trend, kept.

No must-fix items here.

## 4. Missing counter-evidence

Ran one additional `/research-web`-style sweep (WebSearch) specifically hunting for counter-evidence to each of the three findings:
- Searched for criticism or pushback on Brave's x402 move, or claims that other search APIs reject x402 as a model — found only comparative reviews (already reflected: Exa/Parallel staying on API keys), no substantive dissent.
- Searched for criticism of Google's Organization Policy MCP server or arguments that MCP-exposed governance tooling is a security risk — no dated-this-window commentary surfaced; this is noted as a gap, not suppressed.
- Searched for any report that mppx's PR #1275 introduced a regression or breaking change for downstream consumers pinned to an older viem version — none found; the PR's own description is the only account, which `uncertainties.md` already flags as untested by the PR itself for older-viem consumers.

No counter-evidence was found and suppressed; absence is noted in `gaps.md` where relevant. No must-fix items here.

## 5. Voice

Ran the `plain-prose` revision pass over both `draft.md` and `draft.ko.md`.

- **Repeated section formula**: first-four-words and last-sentence check across all three "What moved" subsections showed no repeated phrase. No must-fix.
- **Em-dash density**: found two sentences with a double-dash parenthetical (English: the Google-GA sentence and the "Why it matters" opening; Korean: the Google section's closing sentence and the Signals bullet on UCP PRs). **Must-fix — fixed**: rewrote all four as colon/comma/parenthetical constructions in both languages.
- **"Rather than" / "not X, but Y"**: found three "rather than" instances plus one legitimate "not a pilot, but" correction. **Must-fix — fixed**: trimmed two "rather than" instances to "instead of" variants, kept the one "not a pilot, but" correction (it corrects a real possible misreading of the Brave launch as a trial) and kept one remaining "rather than" inside the mppx technical description (plain technical usage, not rhetorical rhythm).
- **Parallel-march closer**: the original "Why it matters" paragraph matched Brave/Google/mppx in three identical "X made it at the Y layer" sentences. **Must-fix — fixed**: rewrote to lead with Google's finding as the most consequential, demoting Brave and mppx to one shared trailing sentence, in both languages — this also removed the Korean mirror-translation issue in the same paragraph, since the replacement Korean text was composed independently rather than translated sentence-for-sentence from the English.
- **Rhyming bullets** in "Signals to watch": the four bullets already vary in grammatical form (a yes/no question, a status question, a merge-watch, a claim-status) — no fix needed.
- **Announced significance** phrases ("taken together," "읻을 종합하면," etc.): none found.
- **Mirror translation**: beyond the "Why it matters" fix above, spot-checked the Abstract and Introduction — both Korean paragraphs restructure sentence order and drop redundant subjects rather than mirroring the English clause-for-clause. No further fix needed.
- **Section length vs. importance**: Brave's item (most substantive, a production launch) runs two paragraphs; Google's item (meaningful but narrower) runs two; mppx's item (smallest, a routine hardening PR) runs two but shorter. Lengths roughly track weight; no fix needed.
- **Emoji/marketing voice**: none found.
- **Paragraph length**: longest paragraph (Brave's second) is five sentences; none exceed six.

Must-fix count: 2 (em-dash pairs, parallel-march closer) — both fixed. Nit count: 3 (noted above, no action needed).

## 6. Diagrams

No diagram in this edition. Evaluated whether one earns its place: Brave's 402-sign-retry flow is the same generic x402 challenge/response sequence already diagrammed in the 2026-11-11 edition for mppx's identity flow, and Google's GA announcement and mppx's currency-type change have no message order, state machine, or topology worth drawing. Correctly omitted — a diagram here would have been decoration repeating a shape the site has already shown this month.

## 7. Validation

`python3 scripts/harness.py validate-report ai-agent-brief-2026-11-13` → passed, no warnings.

## Summary

Must-fix: 0 remaining (2 found and fixed: em-dash density, parallel-march closer). Nits: 3 (uncited negative/comparative asides, single-datapoint HN observation) — left as judgment calls, no action required. Report is ready for publish.
