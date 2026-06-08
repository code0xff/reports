# Gaps — ERC-8126

## Iteration 2 (current)

### Resolved this pass
- Status of ERC-8126 clarified (with a represented conflict — see below).
- ERC-8004 status/date confirmed (Draft, 2025-08-13).
- Authorship/independence confirmed: @cybercentry + @virtuals_io; part of a
  self-published three-standard suite (ERC-8004/8126/8196) with dedicated
  marketing sites (erc8126.ai, erc8196.ai).
- Independent community critique obtained from the Ethereum Magicians thread
  (fragmentation, WAV-only-reachability, simple-average-vs-weighted scoring).

### Conflicts to represent (not resolve silently)
1. **Status of ERC-8126.** ethereum/ERCs `master` front-matter and the
   project site (erc8126.ai) both say **Final**; general search summaries
   from earlier in the cycle said **Draft**; the Magicians thread describes a
   trajectory Draft (2026-02-10) → Last Call (late May) → Final. The
   eips.ethereum.org status field was not cleanly retrievable in our fetch
   (the ERC-8004 page rendered "⚠️ Draft" fine, the ERC-8126 page did not
   surface a status string). → Present as Final per canonical front-matter,
   reached unusually fast, with the data-quality caveat noted.
2. **Title.** "AI Agent Verification" (final) vs "AI Agent Registration and
   Verification" (forum / early). Explained by removal of the standalone
   Agent Registry (~March 2026), making ERC-8004 a hard dependency.
3. **Four vs five verification types.** One forum summary lists four (ETV,
   SCV, WAV, WV, dropping MCV). Canonical spec lists five; MCV (media) is
   only "applicable" when the agent has media, which also matters for the
   arithmetic-mean aggregation.

### Still thin / acceptable as limitations
- **Independent, ERC-8126-specific deep analysis is scarce.** Most secondary
  coverage is about ERC-8004; ERC-8126 commentary is mostly the forum thread
  and the authors' own sites. This is itself evidence for c20 and will be
  surfaced in Limitations rather than hidden.
- **No independent security audit** of the reference implementation found.
- c15 (arithmetic-mean masks critical sub-scores) rests on interpretation +
  the community's own "simple-average vs weighted" debate; acceptable for an
  interpretive claim, flagged as such.

### Decision
Coverage is sufficient across all 20 claims (every claim meets its minimum
sourcing tier). Stop gathering at iteration 2; move the remaining thin items
into Limitations and Uncertainties. Gather ceiling (6) not reached.
