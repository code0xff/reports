# Critique

## 1. Unsupported claims

Checked every paragraph in `draft.md` against its citations. No factual sentence was found without a `[^sNN]` ref covering it; the one borderline case — "Nobody has yet answered the substance of Comer's concern" — is a negative claim supported by the fact that both s06 and s07 report only an acknowledgment-of-receipt, not a substantive reply. No change needed.

## 2. Citation integrity

- All 11 `[^sNN]` refs in `draft.md` resolve to an entry in `working/sources.jsonl` (s01–s11); no orphan refs, no uncited sources.
- All sources have `accessed: 2026-10-29` (today), well within 90 days.
- Spot-checked 3 quotes directly against the primary artefact:
  - s04 (`@coinbase/cdp-sdk` npm registry): fetched `registry.npmjs.org/@coinbase/cdp-sdk/1.60.0` directly — `dependencies.zod` is exactly `^3.25.76` as quoted. **Verified.**
  - s06 (Comer letter PDF): downloaded the PDF and extracted text without relying on a summarizer. The quoted sentence — "could be used to protect powerful AI companies and their investors from responsibility for reckless harmful actions, while also protecting non-transparent forces seeking anticompetitive regulatory capture behind state AI initiatives" — appears verbatim, and the letter is dated October 26, 2026 as cited. **Verified.**
  - s09 (wevm/mppx issue #1113): quote matches the issue body fetched via `gh api` during research. **Verified.**
- `curl` against all 11 cited URLs: 10 of 11 returned 200 (GitHub ×7, oversight.house.gov, arstechnica, fortune.com). `https://www.npmjs.com/package/@coinbase/cdp-sdk` (s04) returned 403 to a scripted request — npmjs.com's HTML package pages block non-browser user agents; this is a bot-block, not a dead link. The underlying claim was independently verified against the JSON registry API (`registry.npmjs.org/@coinbase/cdp-sdk/1.60.0`), which returns 200 and confirms `dependencies.zod: "^3.25.76"` exactly as quoted.

## 3. Reasoning gaps

- The "why it matters" paragraph draws a through-line across three unrelated stories (a legal proposal, a dependency patch, a protocol bug). This is framing, not causation — no claim that one caused another, and the paragraph is written as an observed pattern, not an inferred mechanism. No fix needed.
- No single-example generalization found: each of the three items is scoped to the specific entities named (Delaware, x402, mppx/pay-kit), not extrapolated to "AI agents" or "the industry" broadly.
- No unsourced "most/everyone/no one" claims in the body. "No item in this window traced back to an X or LinkedIn post" (Limitations) is a scoped negative about this week's three items specifically, not a general claim, and is accurate per the research log.

## 4. Missing counter-evidence

- For the Delaware item: searched for Delaware's or Norm Ai's rebuttal to Comer's letter. None exists yet — the governor's office has only acknowledged receipt (cited in s07). This is noted in `gaps.md` as the natural follow-up, not suppressed.
- For the x402/cdp-sdk item: searched GitHub and npm for any in-progress zod-4 migration in `@coinbase/cdp-sdk`. None found. Noted as an uncertainty rather than asserted as a permanent gap, since Coinbase could pick it up without a tracked issue existing yet.
- For the MPP item: checked whether mppx or pay-kit maintainers disputed the bug reports. No pushback found in either issue thread; pay-kit's own fix PR (#359) confirms the maintainers agree it's a bug. No counter-evidence to represent.

## 5. Voice

Ran the plain-prose mechanical checks via grep, in both languages:

- **Em-dash density** — initial draft had 19 em-dashes in `draft.md`, with 5 sentences carrying two each. Rewrote all five to commas, parentheses, or colons. Final count: 4 em-dashes across 4 separate paragraphs, none doubled. Korean draft had 2 doubled sentences; both split into parenthetical form. **Fixed (must-fix).**
- **"rather than" / "instead of" density** — initial draft had 5 occurrences (4 "rather than", 1 "instead of") against the skill's "once per document" ceiling. Rewrote 4 of the 5 as plain assertions; kept the one in the "@coinbase/cdp-sdk" paragraph ("continuing the capability-drift pattern rather than resolving it"), which corrects a real misreading (a drift-bot filing looks like progress; it is not). Korean draft had none to begin with. **Fixed (must-fix).**
- **Repeated section formula** — checked the first four words and last sentence of every subsection; no repeated opener or closer phrase found across the three "What moved" items. Each ends differently: a closing observation (Delaware), a sentence about the drift bot (x402), a sentence about what the shared bug reveals (MPP). No colon-label template found anywhere ("why it matters:" does not appear per-item).
- **Rhyming bullets** — "Signals to watch" originally had two of three bullets opening with "Whether". Rewrote the second to a plain statement ("`@coinbase/cdp-sdk`'s zod-4 migration: ..."), mirrored in Korean. **Fixed (must-fix).**
- **Parallel-march closer** — "Why it matters" does not restate the three items in matched one-liners; it states the one thing they add up to (a guardrail that stops short of where it's needed) and stops. No fix needed.
- **Announced significance** — grepped for "taken together", "read together", "it is worth noting", "이를 종합하면", "결론적으로", "즉": zero hits. No fix needed.
- **Mirror translation** — read both drafts side by side. The Korean restructures sentence boundaries and clause order throughout (e.g., the abstract's three-sentence English becomes four Korean sentences with different groupings; the MPP section's two-sentence English bug description becomes three Korean sentences). It is not a 1:1 mirror.
- **Paragraph length** — longest paragraph (Delaware item's second paragraph) is 5 sentences; none exceed 6.
- **Section length tracks importance** — Delaware item runs two paragraphs (the most significant single development, including a diagram-worthy chain but no diagram since the facts are sequential narrative, not a message order); x402 item runs two paragraphs plus a diagram; MPP item runs two paragraphs. Roughly even, which is honest here — all three are comparable in weight this edition, unlike days with one dominant story.
- No emoji, no marketing voice, found in either draft.

## 6. Diagrams

- One mermaid diagram, in the x402/cdp-sdk section, showing the dependency-chain sequence (seller → cdp-sdk → facilitator → npm audit) that leaves the zod fix one hop short of where sellers actually run. Caption cites exactly what the arrows assert. Present in both `draft.md` and `draft.ko.md` with translated participant labels and note text.
- Checked whether the Delaware or MPP items warrant a diagram: Delaware is a single linear sequence (letter sent → review pending) without enough structure to justify a diagram — a sentence suffices. MPP's fallback chain (mpp → x402 → mcp) is stated inline as a short labelled sequence; it's three words long and a diagram would be decoration for something already compact in prose. Neither added.
- Ran `render-report`; confirmed the output HTML carries the diagram as `<pre class="mermaid">` with the mermaid.js ESM module loaded from CDN, and checked the diagram source itself for the known failure mode (a `;` inside a sequence label) — none present. No browser was available in this run to confirm the client-side render pixel-for-pixel; the syntax and script wiring are the parts checked here.

## 7. Must-fix vs nit summary

- **Must-fix (3), all resolved:** em-dash density/doubling, "rather than"/"instead of" overuse, rhyming "Signals to watch" bullets.
- **Nits (0).**

No must-fix items remain open. `python3 scripts/harness.py validate-report ai-agent-brief-2026-10-29` passes after the revision.
