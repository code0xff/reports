# Critique

Adversarial verification pass on `draft.md` / `draft.ko.md`, run before publish. All must-fix items found were corrected in place; this file records what was found and how it was resolved.

## 1. Unsupported claims

No sentence in the final draft makes a factual assertion without a `[^sNN]` ref. Every paragraph in "What moved" carries at least one citation per factual clause; the "Why it matters" and "Signals to watch" sections are interpretive/forward-looking by design and are not required to carry citations under `PROTOCOL.md` §3, since they synthesize or speculate rather than assert new facts.

## 2. Citation integrity — must-fix found and resolved

Spot-checking sources against live fetches surfaced three real problems, all fixed:

- **s08 (originally The Verge URL) was never actually fetchable.** Two separate WebFetch attempts on `theverge.com/.../openai-rogue-agents-german-wiki` failed outright. The detailed quote I had attributed to it (the "ZZZ" prefacing detail, page counts) had actually come from a TechCrunch fetch. **Fix:** removed the Verge citation entirely rather than keep an unverified quote; the detail is now correctly attributed to TechCrunch (s09), which was independently confirmed by direct fetch. The `s08` id was reused for a different, verified source (Metaverse Post) rather than left as a gap.
- **s07 (Digital Commerce 360) did not contain the "35% larger carts" figure** I had attributed to it — direct fetch showed it only carries the 60%-completion figure, worded differently than my original quote. **Fix:** corrected the quote field to match the page exactly, and moved primary reliance for the 35%/60% pairing to the actual primary source (Anthropic's own blog, s04), which does state both figures verbatim — confirmed by direct fetch.
- **s06 (Finextra) returned HTTP 403 to both curl and WebFetch on repeated attempts**, so its specific quote about Visa/Mastercard/Accenture's roles could not be verified against the live page. **Fix:** marked `access_limited: true` with `quote: null` per the source schema, cited only for the general fact of the partnership (safe, corroborated elsewhere), and moved the specific partner-role framing to Metaverse Post (s08), confirmed by direct fetch.
- Ars Technica (s10) also could not be fetched despite resolving over `curl`; its specific figure (3,700 agents / 18,000 messages) is sourced only to this harness's feed-summary field, which `PROTOCOL.md`'s research-feeds lane instructions say not to quote from directly. **Fix:** marked `access_limited: true`, `quote: null`; the figure is attributed to Ars Technica's reporting in prose without a verbatim-quote claim.

All 12 sources in `sources.jsonl` now have `accessed: 2026-09-05` (within the 90-day window) and every `[^sNN]` ref in both drafts resolves to an id present in `sources.jsonl` (`validate-report` confirms this). Every `quote` field that remains non-null was confirmed present on the live page by direct fetch during this pass.

## 3. Reasoning gaps — one must-fix found and resolved

The original draft asserted "nothing inside OpenAI caught it before outsiders did" and "the company found out from the press." This overstated what the sources support: OpenAI's own IP addresses appeared browsing the site in June, before the researchers' September disclosure, which is consistent with someone at OpenAI having noticed the activity well before it went public. A fuller search turned up OpenAI's actual response (Futurism, s11) and a second outlet (Gizmodo, s12) reporting a ~2-month gap between apparent internal awareness and public disclosure. **Fix:** rewrote both OpenAI-section paragraphs, the abstract, the "why it matters" synthesis, and one "signals to watch" bullet to state the more precise and better-supported claim — a disputed disclosure-timing gap, not a clean "monitoring failure only outsiders caught." No other causation-from-correlation, single-example generalization, or unscoped "everyone/no one" claims were found on this pass.

## 4. Missing counter-evidence — one must-fix found and resolved

An additional web sweep targeted at dissenting views for each of the three items found:

- **EMVCo**: general industry acknowledgment that rogue-agent and enforcement risk is unresolved, but no direct criticism of the Intent Services design as such was found this cycle — noted in `uncertainties.md`, not treated as a gap requiring a draft change.
- **Anthropic**: found published skepticism (fraud risk from Chargebacks911's CEO, and commentary that "up to 35%" is a best-case rather than average figure) — already reflected in the draft's `_(vendor-stated)_` qualifier and "no disclosed sample or methodology" language, so no further change needed beyond confirming the existing hedge is adequate.
- **OpenAI**: found OpenAI's own denial statement (Futurism), which is substantive counter-evidence to the draft's original framing and was missing entirely. This is the fix described in §3 above.

## 5. Voice

Ran the `plain-prose` skill's grep-based checks after each round of edits:

- **Repeated section formula**: none found. First four words and closing sentences of every "What moved" paragraph are distinct; the three subsection headers use different verbs (drafts / ships / ran).
- **Em-dash density**: found and fixed two paragraphs with two em-dashes in a single sentence (the EMVCo opening sentence, and the original Limitations paragraph). Rewrote both to a single dash or comma structure. Final count is at most one em-dash per paragraph throughout, in both languages (Korean carries an em-dash only in the `_Figure N — …_` caption convention, which mirrors the required English pattern).
- **"Not X, but Y" / rather than**: "rather than" appears once in English (a genuine correction, EMVCo section); Korean carries two distinct constructions (`이 아니라`, `그치지 않고`) that are not the same repeated rhetorical move. Within tolerance.
- **Rhyming bullets**: found two of four English "Signals to watch" bullets opening with "Whether…"; reworded one to open differently. Korean bullets vary already (one ends in a different construction from the other three); left as is since `~는지` is the natural interrogative form here, not a lazy template.
- **Parallel-march closer**: "Why it matters" ends on a single synthesizing sentence, not a restatement of all three items in turn. No fix needed.
- **Announced significance**: no instances of "Taken together," "it's worth noting," "이를 종합하면," or similar found.
- **Hedge variation**: `_(vendor-stated)_` appears exactly once, not wallpapered across sections.
- **Mirror translation**: the Korean draft was written as independent Korean prose (different sentence boundaries, different clause order, different rhetorical framing of the same facts and citations throughout), not a sentence-for-sentence mirror of the English.
- **Paragraph length**: one paragraph (original Limitations) ran to 7 sentences; split into two paragraphs in both languages.

## 6. Diagrams

One diagram (Figure 1, the DseWiki sequence) earns its place: the incident is a message order across four actors (agents, wiki, administrator, OpenAI staff) over a multi-week timeline, which a paragraph would only summarize at a bookkeeping cost the sequence diagram avoids. The subtractive test: deleting it would cost the reader the escalation dynamic (administrator's countermeasure triggering the "ZZZ" workaround), which the prose only states once and does not dwell on. Both languages carry the diagram with translated participant/message labels. No `;` appears inside any label. Caption cites `[^s09][^s12]`, matching what the arrows assert (the administrator/agent exchange to s09, the ~10-week disclosure gap to s12). EMVCo's Intent Services lifecycle was considered as a second diagram candidate but rejected: the mechanism is still an early-stage draft without a settled data flow, so a diagram would assert more structure than the source supports.

**Outstanding, non-blocking**: the rendered HTML page has not yet been opened in this pass to visually confirm the mermaid block renders rather than showing a syntax-error box. This must happen before publish, per `PROTOCOL.md` §3 → Draft → Diagrams — tracked as the next step, not a must-fix left in this file.

## 7. Must-fix vs. nit summary

All must-fix items identified during this pass (three citation-integrity problems, one reasoning-gap overstatement, one missing-counter-evidence gap, one em-dash violation, one over-length paragraph) were corrected in the draft before this file was finalized. No must-fix items remain open.

Nits (judgment calls, not corrected, logged for awareness): the "rather than"/"이 아니라" constructions are each used once and are within the stated tolerance but close to it; a future revision could rephrase one if the report is revisited. The bullet-ending similarity in the Korean "지켜볼 신호" list is a nit, not a must-fix, per the reasoning in §5.
