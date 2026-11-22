# Critique

## 1. Unsupported claims

Checked every paragraph in `draft.md` against its `[^s..]` refs. All factual
assertions trace to s01–s04. The two editorial-judgment paragraphs ("Why it
matters", the Limitations section) make no new factual claims beyond what the
cited paragraphs already established — no fix needed.

## 2. Citation integrity

- All four `[^sNN]` refs in `draft.md` and `draft.ko.md` exist in
  `working/sources.jsonl` (s01–s04). No orphan refs.
- All four sources have `accessed: 2026-11-23` — within the window.
- `curl -L` HEAD/GET on all four URLs returned `200`. No dead links.
- Spot-checked quotes for s01 and s03 against the subagent fetch transcripts
  used to write the draft; both match the page text closely enough to be a
  fair paraphrase/quote. s02 and s04 quotes likewise trace to the fetch
  reports. Not independently re-fetched a second time in this pass — see
  §4.

No issues. **No must-fix.**

## 3. Reasoning gaps

- The scan numbers (11-ish of ~90 proofs invalid, 79 hosts misusing the
  signature field, 253 routes rotating payTo in 30 days) are quoted with a
  denominator and a timeframe in the draft, but the denominator and the scan
  methodology itself come from an issue (`#18`) this brief did not fetch
  directly — flagged already in `gaps.md` and in the draft's own
  `_(unverified — single source)_` marker. Kept as a **nit**, since the
  draft already discloses the limitation inline rather than stating the
  numbers as settled fact.
- No causation-from-correlation issues: the draft is careful to say the
  253-route rotation "can't tell the two apart" (normal rotation vs. the
  exploit pattern) rather than asserting one.
- No "everyone/no one" generalizations beyond "no one from the x402
  Foundation has responded," which is a verifiable, falsifiable claim about
  a specific thread as of a specific fetch time, not a sweeping
  generalization.

**No must-fix.**

## 4. Missing counter-evidence

Ran one additional web sweep for dissenting views on the payout-proof
proposal (is DNS TXT binding itself contested as a security mechanism for
payments?) and on whether anyone argues the OpenAI/Google changes are
cosmetic rather than substantive. Found no counter-evidence in-window: no
one has publicly pushed back on the `_x402-payto` proposal (consistent with
"no response yet" already in the draft), and no independent commentary on
the OpenAI or Google releases surfaced beyond the vendor release notes
themselves. This absence is already reflected in the draft's hedges
(`_(unverified — single source)_`, `_(vendor-stated)_`) and in
`working/gaps.md`. **No must-fix** — there is nothing to add because
nothing exists yet to add.

## 5. Voice

Ran the plain-prose revision pass.

- **Repeated section formula:** first-four-words check on every paragraph in
  both languages found no repeated openers. **Pass.**
- **Em-dash density (must-fix, now fixed):** `draft.md` originally had 17
  em-dashes across ~12 paragraphs, including two paragraphs with 3–5 dashes
  each and one sentence carrying two. Rewrote the `_x402-payto` paragraph
  (dropped from 5 dashes to 1) and the Codex paragraph (dropped the
  double-dash appositive to a parenthetical, one dash removed from the
  second sentence). `draft.ko.md` had a matching 2-dash sentence fixed the
  same way. Re-checked after edit: remaining dashes are at most one per
  paragraph. **Fixed.**
- **"Not X, but Y":** one `rather than` in the whole document (Introduction,
  "worth watching rather than just noting") — at the one-per-document limit,
  and it is doing real work (correcting an assumption that a quiet cycle is
  routine). Left as is.
- **Rhyming bullets (must-fix, now fixed):** all four "Signals to watch"
  bullets originally opened with "Whether." Rewrote to vary grammar (a
  question, a noun phrase, a statement, a noun phrase with a parenthetical).
  Mirrored the fix in `draft.ko.md`'s "지켜볼 신호" bullets, which had the
  same issue (all four opening with "~는지"-style constructions in a row).
  **Fixed.**
- **Parallel-march closer:** "Why it matters" does not restate each item in
  matched one-liners — it makes one comparative point (response-time gap
  between vendor-controlled and ecosystem-dependent fixes) and stops.
  **Pass.**
- **Announced significance:** no "taken together" / "it is worth noting" /
  "결론적으로" filler found via grep. **Pass.**
- **Mirror translation:** read both drafts side by side. The Korean
  reorders clauses, drops redundant subjects, and uses native sentence-final
  forms (e.g., "~셈이다", "~로 남아 있다") rather than mirroring English
  sentence breaks one-for-one. Citations landed on the same claims in both
  languages after the dash/bullet fixes were mirrored. **Pass.**

Structure:
- Abstract is faithful to the body — all three items and their relative
  weight (x402 item gets the most space, matching its length in the body)
  are represented.
- Limitations section matches `gaps.md` (card-network silence, single-source
  scan numbers, unauthenticated GitHub fetches) point for point.
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences (longest is the x402 scan-results
  paragraph at 5 sentences).
- Section lengths track importance: the x402 item gets two body paragraphs
  plus a diagram; OpenAI and Google each get one paragraph. This is honest
  — the x402 story has the most new information and the most uncertainty to
  unpack.

## 6. Diagrams

One `mermaid` block, in the x402 section of both languages. It earns its
place: the finding is specifically about a message-order gap (manifest and
402 share one failure domain; a DNS lookup would not), which is harder to
state crisply in prose than to show. Caption cites exactly what the arrows
assert, with both citing `[^s01][^s02]`. Both languages carry it with
translated participant/note/message labels.

**Caught on first `publish` run, fixed:** both language versions had a `;`
inside the `DNS-->>Agent` message label (`"v=x402payto1; a=A; s=signature"`),
which `prepublish-check` flagged as unparseable in a sequence-diagram label.
Changed the separator to `,` in both `draft.md` and `draft.ko.md`. Re-ran
`publish` after the fix and visually confirmed the diagram renders as a
figure, not a syntax-error box, in the built HTML for both `index.html` and
`ko/index.html`.

**Caught by reading the rendered HTML directly (not by `prepublish-check`,
which doesn't catch this), fixed:** the paragraph introducing the
`_x402-payto` DNS record shared a paragraph with the trailing
`_(unverified — single source...)_` hedge marker in both languages. The
builtin renderer's inline-emphasis regex is paragraph-scoped and matches
underscores positionally, not by HTML structure: the leading underscore of
`` `_x402-payto` `` (inside a code span) became the *opening* delimiter the
regex latched onto, and because the marker's own opening underscore was
preceded by a space (disqualifying it as a valid closing delimiter), the
match skipped past it and closed on the marker's *own* closing underscore
instead — wrapping everything in between, including the code span's closing
tag, in a single mis-scoped `<em>`. Rendered output showed `<code><em>
x402-payto</code>, ... directly)</em>`: invalid tag nesting and roughly two
sentences wrongly italicized. Fixed by splitting the hedge marker into its
own paragraph (a blank line before it) in both `draft.md` and
`draft.ko.md`, so the renderer's per-paragraph `inline()` call never sees
the two underscore pairs in the same pass. Verified by grepping the
rendered `<p>` tags afterward: the code span and the hedge marker each
render correctly and independently in both languages. This was fixed at
must-fix severity; `validate-report`/`prepublish-check` do not catch it
mechanically — the
only way to catch it was reading the rendered HTML, per the CLAUDE.md rule
to open the rendered page before calling a diagram (or, as here, any
markdown-adjacent construct) done. Same risk applies to any future draft
combining a leading-underscore inline-code identifier with a `_(...)_`
hedge marker in one paragraph; worth a standing habit, not just this fix.

No other section describes a message order, state machine, delegation
chain, or topology distinct enough to warrant a second diagram — the
OpenAI/Codex and Google/ADK items are point-release changelog items, not
process descriptions. **No nit to raise here.**

## 7. Summary

- **Must-fix found:** 2 (em-dash density in two paragraphs; rhyming
  "Whether…" bullets in Signals to watch). Both fixed in this pass, in both
  languages.
- **Nits:** 1 (scan-number provenance one hop removed from this brief's own
  fetches — already disclosed inline and in `gaps.md`, no further action
  needed).
- **Must-fix open after revision: 0.**
