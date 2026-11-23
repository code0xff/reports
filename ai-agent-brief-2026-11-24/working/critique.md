# Critique

## 1. Unsupported claims

No uncited factual sentences found. Every paragraph in "What moved" closes
its claims with `[^sNN]`. The Abstract and "Why it matters" synthesize
already-cited claims from the body and carry no new uncited facts. **No
issue.**

## 2. Citation integrity

- All 8 `[^s01]`–`[^s08]` refs used in `draft.md` and `draft.ko.md` exist in
  `working/sources.jsonl`; no orphan refs either direction.
- All 8 sources have `accessed: "2026-11-24"` — today, well within 90 days.
- `curl -L` HEAD/GET checks on 5 of 8 URLs (one per distinct domain) all
  returned 200. No dead links.
- Spot-check of quotes against the fetching subagents' verbatim extraction:
  s01 (wg-domain-discovery#18), s04 (alpha.2 release notes), and s07
  (semantic governance post) quotes match what was fetched. **No issue.**

## 3. Reasoning gaps

- No causation-from-correlation claims found.
- No single-example generalizations.
- All percentages in the Google item carry both a denominator (929 attacks,
  six runs, AgentDojo v1.2.2) and a timeframe (Nov 23 post). The
  wg-domain-discovery#18 adoption numbers (255/2,176, 67 hosts) carry a
  source catalog and are already flagged single-source in the running
  disclaimer.
- No "everyone/no one" generalizations. **No issue.**

## 4. Missing counter-evidence

- The Google item already includes Google's own counter-evidence (the NIST
  CAISI adaptive-attack numbers against a fixed benchmark) — this is the
  draft doing its own job correctly, not a gap.
- The Claude Ship item already includes the auto-merge risk warning from
  Anthropic's own docs.
- The x402 item already flags the wg-identity#51 conflict of interest.
- A direct web search for card-network/PSP agent-commerce news in the window
  (run during drafting) found nothing in Visa, Stripe, or PayPal newsrooms,
  and an unreadable Mastercard newsroom page — already reflected in
  Limitations. **No must-fix counter-evidence gap found.**

## 5. Voice

**Must-fix — em-dash density (English).** Four paragraphs/sentences exceed
the one-per-paragraph budget or stack two dashes in one sentence:
- Lines 40–54 (the wg-domain-discovery#18 paragraph): three em-dashes.
- Lines 56–67: two em-dashes, one of them a double-dash parenthetical
  ("there — adopt, defer, or reject — is this story's next checkpoint").
- Lines 107–116 (Claude Ship intro paragraph): two em-dashes.
- Lines 130–140 (Google item): two sentences each with a paired em-dash
  parenthetical.
→ Fixed by converting most to periods/commas, keeping at most one per
paragraph.

**Must-fix — "rather than" overused (English).** Four instances
(disagreement/resolution; extends/walks back; benchmark/description;
unconfirmed/verified) where the skill caps this construction at one per
document. Kept the strongest (Google item: outside benchmark vs. Google's
own description, the actual news) and rewrote the other three as plain
assertions.

**Must-fix — "이 아니라" overused (Korean).** Same pattern, four instances.
Kept one (the Google item, mirroring the English fix) and rewrote the rest.

**Nit — grammar.** "its docs warn that combining GitHub auto-merge with a
policy that doesn't require a human sign-off "a change can merge without
anyone acting."" is missing a verb before the quote. Fixed by adding "means."

**No repeated section-formula tell found** — each "What moved" subsection
opens differently and closes differently; no colon-label repeated across
items.

**No parallel-march closer** — "Why it matters" states one through-line
(who controls the fix) rather than restating all four items in matched
one-liners.

**Bullets vary grammatically already** in "Signals to watch" (a what-question,
a whether-clause, two noun phrases) — no rhyme to fix.

**Mirror-translation check** — read `draft.ko.md` against `draft.md`
side by side. Sentence boundaries and ordering differ in most paragraphs
(e.g., the Claude Ship and Google paragraphs restructure clause order rather
than transliterating); this reads as written Korean, not machine-mirrored
English. **No issue.**

**No emoji or marketing voice. No paragraph over 6 sentences** (longest is 5,
lines 40–54). **Section lengths track importance**: the x402 item (most
complex, with a diagram) is longest; the OpenAI item (one release, one
compatibility note) is shortest.

## 6. Diagrams

One mermaid flowchart, in the x402 "What moved" subsection, showing the two
proposals' routing through the Identity WG to the Nov 25 TSC meeting. This
section describes a real delegation chain (Discovery WG → Identity WG → TSC)
that is genuinely hard to hold in prose across two separate issue threads —
the diagram earns its place. Caption cites exactly what the arrows assert
(routing, not resolution) and is sourced to s01/s02/s03. Present in both
languages with translated node labels and edge labels. Rendered page checked
below after fixes (Section 7).

No other section describes a message order, state machine, or topology that
would benefit from a diagram — flagged as considered, not a gap.

## 7. Must-fix vs. nit summary

- Must-fix: 3 (em-dash density in English; "rather than" overuse in English;
  "이 아니라" overuse in Korean)
- Nit: 1 (missing verb before a quoted sentence)

All must-fix items have been applied to `draft.md` and `draft.ko.md` in this
pass. Re-running this lane after the edit to confirm.
