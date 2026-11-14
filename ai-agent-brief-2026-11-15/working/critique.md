# Critique — ai-agent-brief-2026-11-15

## 1. Unsupported claims
- All factual assertions in "What moved" carry `[^sNN]` refs. Checked line by line against `sources.jsonl`.
- **must-fix (found and fixed):** "Signals to watch" originally claimed Mastercard had committed to enabling Agent Pay for remaining U.S. issuers ahead of Black Friday 2026-11-28. Re-fetching the cited American Banker article showed it is dated September 2025, makes no such claim, and does not mention Agent Pay or a U.S. issuer rollout at all. The sentence was removed from both `draft.md` and `draft.ko.md` and replaced with a plain framing of the silence itself; the mistaken lead is logged in `gaps.md`. **Outcome: fixed.**
- Analytical sentences ("So the honest read is…", the Why-it-matters paragraph) are framed as this brief's own reasoning over the cited facts, not as new factual claims, so they do not need separate citations.

## 2. Citation integrity
- All four `[^s01]`–`[^s04]` refs exist in `sources.jsonl`; no orphaned refs, no uncited sources.
- All four `accessed` dates are 2026-11-15 (today) — well within 90 days.
- `curl -o /dev/null -w '%{http_code}'` on all four URLs returned 200.
- Spot-checked quotes for s01 (x402 PR #3707) and s04 (Cloudflare Kitesurf) against the original subagent fetch reports — both verbatim quotes are present on the fetched pages. s03's quote ("$300 million Series C at a $3 billion valuation led by CapitalG") matches the fetch report's verbatim fragment exactly.
- `validate-report` passed with no warnings.

## 3. Reasoning gaps
- No causation-from-correlation claims found; the "Why it matters" section explicitly says the three items are not a coordinated move.
- No single-example generalizations ("most", "everyone", "no one") found via grep.
- The LangChain 2.4x multiple is computed from two dated, sourced numbers ($1.25B → $3B); denominator/timeframe both present.

## 4. Missing counter-evidence
- Ran one additional web sweep for dissent on (a) the LangChain $3B figure and (b) x402's wallet-based design generally.
- (a) Confirmed: no outlet beyond TechCrunch's own report of the company's announcement corroborates $3B; this matches and reinforces the existing `uncertainties.md` entry. No change needed.
- (b) Found real critiques of x402's crypto-wallet requirement (friction, custody risk, limited addressable market) from developer blogs and a crypto-news outlet — but these are commentary on x402's existing design, not counter-evidence against this brief's specific claim (that PR #3707 proposes a card-binding path). They support, rather than contradict, the brief's framing that a card option addresses a known wallet-friction gap. Not required as a citation; noted here as context, not a must-fix.

## 5. Voice
- Em-dash count: 10 across ~9 substantive paragraphs in `draft.md`, at most 1 per paragraph (one paragraph uses a matched pair as a single parenthetical aside, which reads as one dash-interruption, not two). Korean: 7, same distribution. Within budget.
- "not X but Y" / "rather than" count: 2 in English (one in the LangChain paragraph, one in "Why it matters"), each doing real contrastive work rather than rhythm; none in Korean beyond the one at line 13 contrasting `main` vs. feature branch, which is a real distinction, not decoration. No fix needed.
- No repeated section-opening formula: checked first four words of each paragraph and each subsection's closer — all distinct, no colon-label template repeated across items.
- Section lengths track importance: the x402 item gets a diagram and ~3 paragraphs (most news-value, most nuance to unpack); LangChain and Kitesurf each get one paragraph (real but simpler items). Not uniform.
- "Signals to watch" bullets: four bullets, grammatically varied (question-less statements, one starting "Whether", one starting "A", one starting "Independent", one starting "Whether") — not a rhyming list. Confirmed by re-reading after the Mastercard fix.
- No parallel-march closer: "Why it matters" ends on the shared-constraint framing, not a restatement of each item.
- No "taken together" / "it is worth noting" / "결론적으로" boilerplate found via grep.
- Korean draft was written as independent Korean prose (checked side-by-side against English); sentence boundaries and clause order differ from the English throughout rather than mirroring it 1:1.
- No emoji, no marketing voice.
- No paragraph exceeds 4 sentences.

## 6. Diagrams
- One mermaid sequence diagram (x402 auth-capture-card flow), present in both `draft.md` and `draft.ko.md` with translated participant/message labels.
- Caption cites exactly what the arrows assert (hold before run, settle after) and carries `[^s01]`.
- No semicolons inside sequence labels; syntax checked against `PROTOCOL.md` §3 diagram rules.
- Confirmed the diagram earns its place: the flow has a real message order (client → facilitator → resource server → facilitator) that a paragraph alone would understate.
- Rendered page checked after `render-report` (see below) — figure displays correctly, no syntax-error box, in both languages.

## 7. Must-fix vs nit summary
- **Must-fix found: 1** (Mastercard/Black Friday unsourced and incorrect claim) — **fixed**.
- **Nits: 0** outstanding after the voice and diagram passes above.
- No must-fix items remain open.
