# Critique — ai-agent-brief-2026-10-09

## 1. Unsupported claims
None found. Every factual sentence in "What moved" carries an `[^sNN]` ref (several consecutive sentences sharing one trailing citation where they describe the same source, consistent with prior briefs' practice). "Why it matters" and section-closing analytical sentences are interpretation built on already-cited facts, not new factual claims, so they carry no separate citation — consistent with protocol norms.

## 2. Citation integrity
- All six `[^s01]`–`[^s06]` refs used in `draft.md` exist in `working/sources.jsonl`; no orphaned refs, no uncited sources.
- All six sources show `accessed: 2026-10-09` — within range.
- HTTP check (curl -L, 15s timeout) on all six URLs: all returned `200`.
- Spot-checked quotes against three sources (s01 Sierra, s05 x402 issue #3745, s06 Cloudflare) via direct fetch during drafting; each `quote` field is drawn verbatim or near-verbatim from the fetched page content. No mismatches.
- `validate-report` passed clean, no warnings.

## 3. Reasoning gaps — must-fix found and resolved
- **Found:** "the fact that its own backers already sit inside a rival standard suggests nobody expects one answer to win cleanly" overgeneralized from two companies' (Stripe, Shopify) membership overlap to a claim about what "nobody" expects. **Fixed**: reworded to "its own backers already sitting inside a rival standard is a weak vote of confidence that any one answer wins cleanly" — removes the absolute claim, keeps the inference proportional to the evidence (two named companies, not an industry-wide survey).
- Causation check: the x402 item correctly frames the Nov 2 consequence as a documented mechanical fact (GitHub's own policy) applied to x402's specific workflow by inference, and the draft already flags that inference as the issue filer's, not an independently confirmed fact — no further fix needed.
- Cloudflare item: no causal overreach; the draft describes what Cloudflare itself says caused the rebuild, attributed to Cloudflare.
- No unsupported "most/everyone/no one" claims remain after the fix above.

## 4. Missing counter-evidence
Ran a follow-up web search specifically for dissent or skepticism on PAP (searched for criticism of "Personal Agent Protocol" adoption likelihood and for any claim that the OAuth-tier design has known weaknesses). Found no published counter-take beyond The Next Web's own skepticism (EU SCA gap, lack of European partners), which is already represented in the draft and in `gaps.md`. No counter-evidence found disputing the Cloudflare or x402-policy items; both are mechanical/procedural claims (a GitHub policy date, an architecture description) rather than contested assertions. Not must-fix.

## 5. Voice
Ran the plain-prose revision pass against both `draft.md` and `draft.ko.md`.

- **Repeated section formula:** first-four-words and closing-sentence check across all three "What moved" subsections — no repeated template found.
- **Em-dash density:** found three paragraphs with 2 em-dashes each on first pass (Abstract para, PAP design para, GitHub policy para). **Fixed** — rewrote to one or zero em-dashes per paragraph; re-checked after edits, now compliant.
- **"Read together" opener:** found at the start of "Why it matters" — exactly the "announced significance" filler the skill flags. **Fixed** — removed, paragraph now opens with the substantive claim.
- **Stacked not-X-but-Y:** found two adjacent instances in the PAP jurisdiction paragraph ("not two camps... it is the same handful" followed immediately by "about jurisdiction, not competition"). **Fixed** — kept the first (it corrects a real misreading: overlap looks like rivalry but isn't), rewrote the second as a plain assertion ("raises a sharper problem than competition").
- **Rhyming bullets:** "Signals to watch" had three of four bullets opening with "Whether". **Fixed** — rewrote one bullet as a statement-first construction for grammatical variety.
- **Mirror translation:** read `draft.ko.md` against `draft.md` side by side. Korean does not mirror English sentence-for-sentence; paragraph breaks align but sentence counts and clause order differ naturally (e.g., the PAP OAuth paragraph restructures clause order rather than transliterating). Updated Korean to match the three English fixes above with independently-worded Korean, not re-translation.
- **Section lengths:** track importance correctly — PAP gets three paragraphs (the most consequential, least-settled item), the GitHub policy item gets two (short because the claim itself is simple), Cloudflare gets two. Not uniform; judgment visible.
- **Emoji/marketing voice:** none found.
- **Paragraph length:** longest paragraph is 4 sentences; none exceeds the 6-sentence threshold.

All voice findings above were must-fix (mechanical) and have been applied to both `draft.md` and `draft.ko.md`.

## 6. Diagrams
None of this edition's three items describes a message order, state machine, delegation chain, or topology complex enough to earn a diagram. PAP's guest/signed-in OAuth tiers are a single binary state transition, fully explained in one sentence; drawing it would be decoration, not clarification. No diagram added — consistent with "skip it on a brief where nothing has a shape worth drawing."

## 7. Must-fix vs nit summary
- Must-fix found: 6 (1 reasoning-gap overgeneralization, 3 em-dash density violations, 1 announced-significance opener, 1 stacked not-X-Y, 1 rhyming-bullet set — some overlapping the same edit). All resolved in this pass.
- Nits: none outstanding.
- **No must-fix items remain open.** Ready for publish.
