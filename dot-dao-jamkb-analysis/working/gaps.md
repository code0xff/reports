# Gaps — iteration 2 (2026-08-07)

## Iteration 1 (initial sweep)
Closed: article text captured verbatim (s01); follow-up post located (s02);
ecosystem pushback located (s08, s09); Gray Paper threshold-balance
mechanism located in primary source (s03–s06); comparative systems
sourced (s11, s12, s13, s16); DOT supply cap sourced (s17, s18).

## Iteration 2 — status of each claim

| Claim | Status | Sources |
|---|---|---|
| c01 footprint vs Data Lake | met | s01, s07 |
| c02 GP already ties storage to balance threshold | met (primary) | s03, s05, s06, s07 |
| c03 reference hardware fixes RAM budget | **partially met** | s01 only |
| c04 ~20 GB / 21 M is an estimate | met | s01, s04 |
| c05 premise chain | met (interpretive) | s01, s02 |
| c06 stated parameters | met | s01, s02, s23 |
| c07 four objections to variable pricing | met | s01 |
| c08 personal opinion, not enacted | met | s01, s02, s20 |
| c09 locked DOT ⇒ uncertain effective supply | met | s01, s17, s18, s22 |
| c10 repricing conflicts with parallel execution | met | s01, s10 |
| c11 precedent for separating the rent unit | met | s11, s12, s13, s16 |
| c12 rate, not supply, enforces the cap | met (by construction + s03/s05 + s11) | s03, s05, s11, s18 |
| c13 dynamic-rate concession self-undermining | met | s01, s03 |
| c14 slope-zero curve / Weitzman nuance | met | s01, s14, s15 |
| c15 squatting and dead capacity | met | s09, s10 |
| c16 value-capture split, political variable | met | s02, s08 |
| c17 competing-uses premise is design-relative | met | s01, s02, s10, s13 |
| c18 substantive pushback | met | s08, s09 |
| c19 follow-up post | met | s02 |
| c20 metered-flow counter-position | met | s09 |
| c21 third-party framing | met | s19, s20, s23 |

## Remaining gaps

1. **c03 — JAM reference hardware RAM figure not sourced.**
   Searches for a published JAM reference-hardware specification returned
   nothing authoritative; the term "reference hardware" appears in the
   article (s01) but no numeric RAM budget was located in the Gray Paper
   sections retrieved or on the Polkadot Wiki. **Resolution: the ~20 GB
   figure is attributed to Wood only and the hardware premise is stated
   as vendor-stated rather than independently verified.** Carried into
   Limitations.

2. **Weitzman (1974) primary text is paywalled.**
   The Oxford Academic record is abstract-only and the SFU mirror
   returned 403. The comparative-advantage result is therefore cited via
   Williams (2002, NBER w9283), which restates and extends it and is
   fully readable. **Resolution: cite s15 for the restatement and s14 as
   the canonical record, flagged access-limited.** Acceptable.

3. **No independent economic analysis outside the Polkadot ecosystem.**
   Every substantive critique located (s08, s09, s10) is hosted on the
   Polkadot Forum; the Web3 Foundation proposal (s10) is first-party
   research, not independent. Third-party coverage (s19, s20, s23) is
   descriptive rather than analytical. **Resolution: surfaced in
   Limitations; the report's own rebuttal is labelled as this report's
   argument, not as reported consensus.**

4. **"No storage eviction" is evidenced by absence.**
   A grep for `evict|purge|expir|reclaim|delet` across the retrieved Gray
   Paper sections (accounts, definitions, overview, discussion,
   accumulation, pvm_invocations) returned zero matches, corroborating
   OliverTY's claim (s09). This is negative evidence over a subset of the
   specification, not a proof over the whole document. **Resolution:
   stated with that qualification in the draft.**

5. **JAMKB's status in the specification is unresolved.**
   The Gray Paper (s04) defines a single native token and leaves the
   deposit constants "to be determined in following work"; no retrieved
   version names $JAMKB. Whether $JAMKB becomes a Gray Paper change or
   stays a Hub-level wrapper is undecided. **Resolution: Limitations.**

6. **DOT staking ratio not fetched from a first-party endpoint.**
   The StakingRewards analytics page (s22) did not render for automated
   retrieval. The draft therefore says "a substantial share" and cites
   the capped-supply primaries (s17, s18) for the supply figures it does
   assert numerically. **Resolution: no numeric staking ratio is
   asserted in the draft.**

## Iteration 3 — opened by the critique pass (2026-08-07)

The adversarial pass in `critique.md` ran counter-evidence sweeps against
this report's own strongest claims and found three real omissions plus one
unverifiable lead. All are now closed or logged.

7. **R2's NEAR precedent was contested by NEAR itself — CLOSED.**
   NEP issue #415 proposes removing storage staking (s26); NEP discussion
   #185 records the composability friction and oysterpack's "zero incentive
   to clean up storage" objection (s27); and Ref Finance is a production
   instance of deposits never being reclaimed. Added to the draft in both
   directions — it narrows R2 and strengthens R6.

8. **Academic literature on two-token designs was not consulted — CLOSED.**
   Kiayias, Lazos & Penna (2024) report an inherent limitation of
   single-token monetary policy and an advantage for two-token settings
   (s25). Added to §5 as a fourth surviving argument and to R4 as the
   strongest reply available to Wood, with the scoping caveat that their
   split is fee-vs-stake, not permit-vs-governance.

9. **A legal/securities objection class was missing — CLOSED.**
   M_cat13's argument that independent $JAMKB pricing "would legally
   constitute fraud" (s28) is now recorded in §7, attributed and not
   endorsed.

10. **UNRESOLVED LEAD — a DOT-collateralised $JAMKB proposal.**
    A search summary attributed to the Polkadot Forum a DAI-style proposal
    to mint $JAMKB against locked DOT, criticised on the grounds that
    speculative holders would leave RAM "physically available but
    economically locked up". This is directly on point for R1 and R4. The
    post could not be localised on page 1 or page 2 of thread 17912, nor in
    threads 17928 or 17971. **Not cited.** Recorded in the draft's
    Limitations as an unverifiable lead. Anyone resuming this report should
    try forum threads 17910 and 17969, which were retrieved only as
    navigation shells.

## Verdict

Gaps 1–9 are resolved, by evidence or by explicit qualification in the
prose and Limitations. Gap 10 is an acknowledged unverifiable lead, stated
as such in the report rather than hidden. No claim entering the draft is
unsourced. Gather loop closed at iteration 3 of a permitted 6.
