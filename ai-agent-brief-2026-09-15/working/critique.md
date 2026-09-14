# Critique

## 1. Unsupported claims

Reviewed every paragraph in `draft.md`. All factual assertions carry `[^sNN]` citations. Two sentences are interpretive rather than factual and are labeled as such rather than cited: the closing sentence of "Microsoft answers Amodei..." ("The two are not the same thing, and the gap between them is the rest of this brief") and the "Why it matters" section, which is explicitly framed as analysis built on the cited items above it, not a new factual claim.

No must-fix here.

## 2. Citation integrity

- All 8 `[^sNN]` refs used in `draft.md` and `draft.ko.md` (s01–s08) exist in `sources.jsonl`; no orphaned refs, no uncited sources.
- All 8 sources have `accessed: 2026-09-15` — well within 90 days.
- URL spot-check via `curl`: `foxnews.com` and `theregister.com` returned HTTP 200. `microsoft.ai` returned 403 and `businesswire.com` returned a connection failure under `curl`, but both were successfully fetched and read via `WebFetch` during gathering (bot-blocking on the `curl` user agent, not a dead link). Not a must-fix; noting for the record.
- Quote spot-check (3 of 8, chosen at random: s01, s04, s07): all three quotes in `sources.jsonl` match the fetched page content verbatim (Microsoft's "People matter more than AI..." line, Huang's "You're right. We're not going to let that happen, sir," and Mehrotra's "Meeting notes are one of the clearest..." line).

No must-fix here.

## 3. Reasoning gaps (found and fixed during this pass)

- **Fixed.** The original draft said Trump rejected Amodei's proposal "hours later" than the Huang/Trump exchange, and separately said the White House "said no within hours of Microsoft's announcement." Neither precise interval is confirmed by the sources — all three events (Microsoft's post, the Huang call, Trump's Truth Social rejection) are dated 2026-09-14 but no source gives a same-day sequence. Rewrote both instances to say "the same day" and removed the implication that Trump's rejection was aimed at Microsoft specifically (it targets Amodei's original proposal; neither Trump nor Sacks has commented on Microsoft's Code of Conduct). Applied to both `draft.md` and `draft.ko.md`.
- **Fixed.** The Figure 1 caption originally said the diagram shows events "in the order they were made," which overclaims intra-day sequencing between Microsoft's announcement and the Huang/Trump exchange (both 09-14, order unconfirmed). Softened the caption and added a note-over-day framing.
- No single-example generalizations, no unquantified "most/everyone/no one" claims found.

## 4. Missing counter-evidence

- The "agreement is fracturing" reading in "Why it matters" already carries its own counter-evidence: The Register's regulatory-capture argument (s06) is a dissenting view on Amodei's proposal itself, and is represented in the "What moved" section, not just in the analysis.
- Ran one additional web sweep for a dissenting view on the Superhuman/Fathom deal (privacy or consolidation concerns). Found none — coverage is uniformly descriptive (TechCrunch, Yahoo, Business Wire, trade mirrors), consistent with a routine acquisition rather than a contested claim. Not flagged as a gap; there is nothing to represent.

## 5. Voice

Ran the `plain-prose` revision pass, in English and Korean separately, before this critique closed.

- **Repeated section formula:** none found. Each "What moved" item opens differently (a direct fact statement, "The agreement cracked in public...", "Superhuman acquired Fathom..."), and there is no repeated colon-label or closing formula across items.
- **Em-dash density:** English — 6 em-dashes across 9 body paragraphs, none more than one per paragraph. Korean — 4, same distribution. Within the one-per-paragraph budget.
- **"Not X, but Y" / `rather than` / `이 아니라`:** Found and fixed. English had two `rather than` instances (acceptable, no single-sentence doubling). Korean originally had three `이 아니라` instances and three `즉` fillers. **Must-fix, applied:** rewrote two of the three `이 아니라` occurrences as plain assertions (kept only the abstract's "not more capability but more context" contrast, which mirrors the one legitimate English instance), and removed all three `즉` connectors, including the "Why it matters" closer, which had been using `즉 ... 뜻이다` as an announced-significance formula.
- **Rhyming bullets:** "Signals to watch" originally had three of four bullets starting with "Whether." **Fixed:** varied to a question, a "What," a noun-phrase statement, and a gerund-led statement, matching the Korean equivalents.
- **Parallel-march closer:** "Why it matters" does not restate each item in turn; it ends on the throughline (capability and governance running on independent clocks), not a list recap. No fix needed.
- **Announced significance:** no "Taken together," "it is worth noting," "결론적으로," or "이를 종합하면" found in either draft.
- **Mirror translation:** Korean draft was written as independent prose, not a sentence-for-sentence mirror — paragraph and sentence boundaries differ from the English in several places (e.g., the Microsoft section combines/splits sentences differently in each language), and idiom choices (e.g., "간극이 이번 브리프의 나머지 부분이다") are native constructions rather than transliterations.

All voice findings above were must-fix and have been applied. None remain open.

## 6. Diagrams

One diagram, in "Trump, Huang, and the White House tell Amodei no" — a message-order sequence across three days of public statements. It earns its place: the prose would otherwise need a paragraph of pure bookkeeping to establish who said what to whom and roughly when, which the diagram hands over at a glance.

- Both languages carry the diagram with fully translated participant aliases, note text, and message labels (`White House` / `백악관`, etc.).
- No `;` appears inside any message or note label in either block (checked via `grep`).
- Each block opens with a valid diagram-type keyword (`sequenceDiagram`) as its first non-blank line.
- The caption cites `[^s04][^s05]`, matching the two sources the diagram's content rests on, and was revised (see §3) to avoid overclaiming intra-day order.
- **Environment limitation, not a must-fix:** this machine has no Node.js/browser tooling available to actually execute the mermaid runtime and confirm a rendered figure rather than a syntax-error box (`node` is not installed, and installing a new toolchain is out of scope for a routine unattended brief). I ran the harness's own `check_mermaid_blocks` logic manually against both blocks (via `render-report`, which embeds the mermaid runtime script into the page) and did a manual syntax review against mermaid's sequence-diagram grammar; both blocks pass the harness's mechanical checks and look syntactically valid by inspection, but the one verification the protocol actually asks for — opening the rendered page in a browser — could not be performed here. Recorded in `gaps.md`.

No other section describes a shape (state machine, delegation chain, topology) that would benefit from a second diagram.

## 7. Structure

- Abstract is faithful to the body: all three items and the fracturing-agreement throughline it names are developed in "What moved" and "Why it matters," with nothing in the Abstract that isn't cited below.
- Limitations honestly reflects `gaps.md`: the credential-present-but-empty Bluesky/Reddit failure, the arXiv/Semantic Scholar failures, the draft-not-final status of the Code of Conduct, and the sourcing basis for the political reactions are all named in both places.
- No emoji, no marketing voice.
- No paragraph exceeds 6 sentences (checked programmatically).
- Section lengths track importance: the Microsoft item and the political-pushback item (the two halves of this brief's actual news) run two paragraphs and a paragraph-plus-diagram respectively; the Superhuman item, which is a smaller story, runs one paragraph.

## Must-fix / nit count

- Must-fix found this pass: 5 (timing overclaim x2 locations, Korean `이 아니라`/`즉` density, rhyming bullets). All 5 fixed.
- Nits: 1 (mermaid rendering could not be visually confirmed in-browser due to missing tooling on this machine; mitigated via manual syntax review and the harness's automated block check).
- Must-fix open at time of publish: **0**.
