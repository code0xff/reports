# Critique — ai-agent-brief-2026-11-20

## 1. Unsupported claims

Every factual sentence in each "What moved" item carries a `[^sNN]` citation.
The "Why it matters" section is interpretive synthesis across the four cited
items rather than new factual assertion, which is the expected shape for
that section per the outline. No unsupported claims found. **No must-fix.**

## 2. Citation integrity

- All 8 `[^sNN]` refs in `draft.md` and `draft.ko.md` correspond to `s01`–`s08`
  in `working/sources.jsonl`; no orphan refs, no uncited sources.
- All 8 sources have `accessed: 2026-11-20` (today) — well within 90 days.
- HTTP spot-check on 4 of 8 URLs (one per item group): `stripe.com/blog/...`
  → 200, `fintechnews.sg/...` → 301 (redirect, not dead), `github.com/wevm/
  mppx/releases/...` → 200, `investingnews.com/...` → 200. No dead links.
- Quotes for `s01`, `s04`, `s06`, `s07` were extracted directly from the live
  pages via WebFetch during drafting (not copied from a summary field), so
  quote-to-page fidelity is high confidence. No discrepancy found.
- `python3 scripts/harness.py validate-report ai-agent-brief-2026-11-20` → ok,
  no warnings. **No must-fix.**

## 3. Reasoning gaps

- No causation-from-correlation claims found; each item's significance is
  stated as "Visa cannot certify this half unilaterally" or similar
  structural reasoning tied to the cited facts, not inferred causation.
- No single-example generalization: each "What moved" item is scoped to the
  specific company/release named, not extrapolated to "the industry" or
  "most agents."
- Visa's "140+ participants" and "175+ issuers across 45 markets" are given
  with explicit timeframes (November 19 release; April 2026 expansion) and
  are flagged in the body and Limitations as Visa's self-reported, unaudited
  figures. No bare numbers without context.
- No "everyone / no one / most people" claims present. **No must-fix.**

## 4. Missing counter-evidence

Ran one additional web sweep searching for skepticism or failure reports on
Visa Agentic Ready, Stripe Treasury-for-agents, and Trusted Agent Protocol
adoption claims. Found: independent coverage (FinTech Global, Yahoo Finance)
corroborates rather than disputes the vendor claims for Stripe and Visa — no
counter-evidence surfaced that contradicts the specific facts cited (dates,
participant lists, capability descriptions). The draft already carries the
appropriate hedge for each vendor-stated figure (Visa's self-reported counts,
partner self-descriptions, NETS/Ant's "will explore" framing marked
`_(vendor-stated)_`). No dissenting view was found and omitted. **No
must-fix.**

## 5. Voice

Ran the plain-prose revision pass against both `draft.md` and `draft.ko.md`.

- **Repeated section formula:** checked first four words of each paragraph
  and last sentence of each subsection — no repeated phrase found across
  items (each "What moved" paragraph opens with a distinct bolded claim, not
  a template label). **Fixed during drafting, no must-fix remaining.**
- **Em-dash density:** initial draft had two paragraphs and two sentences
  with 2 em-dashes each (English: abstract, Visa item, NETS item, "why it
  matters"; Korean: same four spots). All were rewritten to one-or-fewer per
  paragraph, none with two in one sentence, verified by `grep -n '—'` against
  both files after revision. **Fixed, no must-fix remaining.**
- **"not X, but Y" / "rather than" / "~이 아니라":** initial draft had 5
  English and 7 Korean occurrences. Reduced to 2 English (one real
  misreading-correction on the credentials-present-but-empty point, one on
  Stripe's approval-default framing) and kept only clearly non-decorative
  Korean instances (one idiomatic "뿐 아니라," one technical contrast, one
  misreading-correction mirroring the English). **Fixed, no must-fix
  remaining.**
- **Rhyming bullets:** "Signals to watch" originally opened all four bullets
  with "Whether." Rewritten to vary grammatical form (a question, a noun
  phrase, a noun phrase, a subordinate clause). Korean bullets were already
  varied. **Fixed, no must-fix remaining.**
- **Parallel-march closer:** "Why it matters" does not restate each item in
  turn; it groups them into two camps (money-movement vs. trust-layer) and
  makes one argument. No closer restates the four items individually. **No
  must-fix.**
- **Announced significance:** no instances of "taken together," "read
  together," "it is worth noting," "이를 종합하면," "결론적으로," or "즉"
  found via grep. **No must-fix.**
- **Mirror translation:** compared draft.md and draft.ko.md side by side.
  Sentence boundaries, clause order, and rhetorical structure differ between
  languages (e.g., the Korean "why it matters" paragraph restructures the
  TAP-adoption point into two sentences where English uses one with a
  parenthetical; the Korean item headers use different syntax than a literal
  translation of the English bolded headers would). Read as native Korean,
  not a mirror. **No must-fix.**
- Section lengths track importance: Stripe and Visa items run longer
  (higher-confidence, more consequential), NETS/Ant is explicitly shorter
  (least concrete), mppx is medium (technical, narrower audience). No emoji,
  no marketing language. No paragraph exceeds 6 sentences.

## 6. Diagrams

No diagram in this brief. All four items are flat announcements/releases with
no message order, state machine, delegation chain, or topology to draw — a
diagram here would be decorative. Confirmed as a deliberate omission, not an
oversight. **No must-fix, no nit.**

## 7. Summary

**Must-fix: 0. Nits: 0.** All voice issues found during the initial
self-review pass (em-dash density, rather-than/아니라 overuse, rhyming
bullets) were fixed in `draft.md` and `draft.ko.md` before this critique was
finalized, rather than left open as findings. Citation integrity, reasoning,
and counter-evidence checks found nothing to fix. Report is ready for
`publish`.
