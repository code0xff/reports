# Critique

## 1. Unsupported claims
Checked paragraph by paragraph. All factual assertions in "What moved" carry `[^sNN]` refs. The "Why it matters" section's synthesis sentences are explicitly framed as reading across the cited items, not new factual claims, and do not require separate citations. No changes needed.

## 2. Citation integrity
- All six `[^s01]`–`[^s06]` refs used in `draft.md` and `draft.ko.md` exist in `sources.jsonl`. `validate-report` confirms no dangling or orphan refs.
- All six sources have `accessed: 2026-10-01`, well within 90 days.
- All six URLs returned HTTP 200 on a `curl -L` check.
- Spot-checked quotes for s01, s02, s04 against the WebFetch extractions used to write them; all three match verbatim. No fabricated quotes found.

## 3. Reasoning gaps
- No causation-from-correlation issues found; each item's "why it matters" framing is explicitly hedged (e.g., "says more about direction than scale," "groups two separate engineering efforts under a shared theme, not a single product decision" in `uncertainties.md`).
- The Cloudflare 38x-style vendor number is absent from this brief (not reused from the prior brief), so no repeat of that unverified-number issue.
- No "most people"/"everyone" generalizations found.

## 4. Missing counter-evidence
Ran one additional web sweep on "x402 criticism" and "AI agent payment skepticism." Found a material finding not yet reflected in the draft: American Banker reported September 18, 2026 that daily x402 payment volume fell 95%, from roughly $800,000/day in January to about $40,000/day in September, which two industry analysts attribute largely to wash trading and spoofed bot activity in the earlier figures. This directly bears on how to read Cloudflare's September 30 Monetization Gateway launch, which runs on the same protocol. **Must-fix, applied**: added a paragraph to the Cloudflare section (both languages) citing this trend and its attributed cause, and added it to `gaps.md` as an open question about how much of either the historical peak or the new beta activity is organic. DoorDash's missing protocol detail was already flagged as a gap rather than glossed over.

## 5. Voice
- **Repeated section formula:** none found. Each "What moved" item opens differently (a framing fact, an announcement lead, a funding lead, a two-item lead) and none use a colon-label sentence pattern.
- **Em-dash density:** initial draft had 3–4 em-dashes in several paragraphs (EN) and a 4-dash paragraph in KO. **Must-fix, fixed**: rewrote to commas/periods/parentheses. EN now has 1 em-dash total (in a Signals bullet), KO has 0.
- **"not X, but Y" / rather than:** three "rather than" instances in EN, each correcting a distinct real assumption (Cloudflare's design choice, durable-execution category framing, MCP-as-integration-layer framing), not decorative rhythm. Left as nits, not rewritten.
- **Rhyming bullets:** Signals to watch varies grammatical form (two "Whether," one noun-phrase, one "Any"). KO bullets vary similarly. No fix needed.
- **Parallel-march closer:** "Why it matters" does not restate each item in matched one-liners; it states one throughline. No fix needed.
- **Announced significance:** no "taken together," "it's worth noting," "즉," "결론적으로" found.
- **Mirror translation:** KO was drafted independently with different sentence boundaries, different paragraph breaks in places (e.g., the Restate section), and Korean-native constructions (본용언/보조용언 structure, dropped subjects). Not a sentence-for-sentence mirror.

**Must-fix found and fixed in this section:** 1 (em-dash density, EN + KO). **Nits:** 1 ("rather than" repetition, left as-is since each instance is non-decorative).

## 6. Diagrams
One mermaid sequence diagram (Cloudflare 402 payment flow) in both `draft.md` and `draft.ko.md`, with translated participant labels and a caption that states what the arrows assert (the round-trip completes before the origin sees the request). This is the only item in the brief with a clear message-order shape; DoorDash, Restate, and Google Cloud are announcements without a sequence/state-machine worth diagramming, so no diagram was added for them — correctly, per the "skip when nothing has a shape" rule.

## 7. Structure
- Abstract is faithful to the body; all four items and the fifth-straight-quiet-protocols point are represented.
- Limitations section matches `gaps.md` (DoorDash sourcing, Cloudflare vendor-stated claims, MPP CI-only activity, X/LinkedIn not read, papers lane dates unconfirmed).
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences after revision.
- Section lengths track importance: Cloudflare gets two paragraphs plus a diagram, the other three items get one paragraph each, matching how much each one actually moved the beat.

## Must-fix count: 0 open (2 found and fixed during this pass: em-dash density; missing x402 volume-decline counter-evidence on the Cloudflare item)
## Nit count: 1 (repeated "rather than," judged non-decorative, left as-is)
