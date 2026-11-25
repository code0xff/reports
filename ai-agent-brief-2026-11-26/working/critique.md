# Critique

## 1. Unsupported claims

Checked every sentence in `draft.md` against `[^sNN]` coverage. All factual
assertions about the three items trace to s01-s04. The "Why it matters"
section and "Signals to watch" are framing/analysis, not new factual claims,
and are not citation-bearing by design (per PROTOCOL.md, synthesis doesn't
need its own footnote beyond the facts it's built from). No must-fix found.

## 2. Citation integrity

- All four `[^sNN]` refs (s01-s04) exist in `sources.jsonl`. Confirmed via
  `validate-report`, which passed clean.
- All four sources have `accessed: 2026-11-26` (today), well within 90 days.
- Spot-checked URLs: all four returned HTTP 200 when fetched during
  gathering (Cloudflare blog post, two GitHub issue/PR pages, one GitHub PR).
- Quote spot-check: s01's quote ("Starting today, Search for Agents is
  available to all customers... all it needs is the relevant information
  from your site...") was confirmed present on the page during the original
  fetch. s02's quote ("a competent caller got the method wrong four times in
  five attempts") was confirmed present in the GitHub issue body. s03's quote
  was confirmed present in the PR body. No must-fix.

## 3. Reasoning gaps

- The "Why it matters" section draws a generalization (single-vendor stacks
  ship, multi-party standards lag) from exactly three data points in one
  week. This is flagged explicitly in the prose as a pattern "that spans
  several prior briefs" rather than asserted from this week alone — the
  through-line is cumulative across the standing brief's run, not a
  single-example overreach. Nit, not must-fix: the claim is appropriately
  scoped ("a pattern... gets sharper," not "proves").
- No causation-as-correlation issues found: the draft does not claim the
  Bazaar audit caused anything, or that Cloudflare's launch was timed in
  response to anything.
- Numbers all carry denominators and timeframes (10,000 of 87,419 rows; 190
  of 200 probed; dated to specific days). No must-fix.
- No "everyone"/"no one" claims found.

## 4. Missing counter-evidence

- Ran one additional web sweep for counter-evidence on the Bazaar audit
  finding (searching for a Coinbase or Foundation response, or a dissenting
  reading of the data). None found as of this writing; this absence is
  already disclosed in `working/uncertainties.md` and in the draft's own
  single-source caveat. Not a must-fix — the gap is the honest state of the
  story, not an omission.
- No counter-evidence search needed for the Cloudflare launch (a vendor
  announcing its own shipped feature) or the x402 merge (a merged PR is a
  fact, not a claim with a counter-reading).

## 5. Voice

Ran the plain-prose mechanical checks via grep:

- **Repeated section formula**: checked first four words of each paragraph
  and each subsection's closing sentence. No repeated template found across
  the three "What moved" items — each closes differently (vendor-stated
  caveat, single-source caveat, a comparison to the next item). **No
  must-fix.**
- **Em-dash density**: found 13 in the original draft, several doubled
  within one sentence (abstract, Bazaar paragraph, limitations). **Must-fix,
  applied**: rewrote to 3 em-dashes total, one per paragraph, none doubled
  in a single sentence. Re-checked with `grep -n '—' draft.md` after the
  fix — confirmed.
- **"rather than" / "not X but Y"**: found 2 occurrences. **Must-fix,
  applied**: kept the one in "Why it matters" (a genuine distinction between
  a gap previously seen between two protocols vs. now inside one), rewrote
  the other (abstract) as a plain assertion.
- **Rhyming bullets**: all four "Signals to watch" bullets opened with
  "Whether..." — a filled-slot template. **Must-fix, applied**: varied to a
  question, a noun-phrase-plus-colon, a conditional, and a conditional, so no
  two bullets share an opening form. Same fix mirrored in the Korean
  "지켜볼 신호" list, which had the same `~는지` ending on all four bullets.
- **Parallel-march closer**: "Why it matters" does not restate the three
  items in matched one-liners; it states the one pattern they add up to.
  Limitations section lists what was dropped/unresolved, which is its job,
  not a restatement of what moved. No must-fix.
- **Announced significance**: grepped for "taken together," "read together,"
  "it is worth noting," "결론적으로," "이를 종합하면" — zero hits. No
  must-fix.
- **Mirror translation**: read draft.ko.md against draft.md side by side.
  Sentence boundaries and clause order differ in most paragraphs (e.g. the
  Korean "왜 중요한가" section reorders which comparison comes first); this
  reads as independently composed Korean rather than a transliteration. No
  must-fix.
- **Stray character**: found and fixed a typo in draft.ko.md ("설명文" with
  a stray Chinese character instead of "설명문"). Fixed.
- **Leftover footnote artifact**: an earlier draft pass left a `[^g01]`
  footnote reference and definition pointing at a non-source (the gaps file
  itself). Removed from both drafts; `working/gaps.md` is now referenced
  only in plain prose, matching the pattern in the November 25 brief.
  **Must-fix, applied.**
- **Manual footnote-definition blocks**: `validate-report` initially failed
  because both drafts carried trailing `[^sNN]: <url>` definition blocks,
  which the harness generates automatically from `sources.jsonl` and
  rejects as manual duplicates. **Must-fix, applied**: removed both blocks;
  `validate-report` now passes clean.

## 6. Diagrams

None of the three items describes a message order, state machine,
delegation chain, or topology with enough shape to justify a diagram — one
GA feature announcement, one data-quality audit with percentages, one
SDK-level payment-splitting change. A diagram here would be decoration.
Confirmed no diagram is needed; none added. No nit.

## 7. Must-fix vs nit summary

- Must-fix found: 5 (em-dash density, rather-than overuse, rhyming bullets,
  leftover footnote artifact, manual footnote-definition blocks). All 5
  applied.
- Nits found: 1 (the cumulative-pattern generalization in "Why it matters,"
  judged adequately scoped and left as-is).
- Must-fix remaining after revision: **0**.

`validate-report` passes clean after the revision.
