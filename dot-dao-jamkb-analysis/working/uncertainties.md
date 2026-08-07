# Uncertainties register

Things that remain epistemically shaky even though the draft is
publishable. Distinct from `gaps.md`, which tracks what was still missing
before drafting.

## Vendor-stated, not independently verified

- **The ~20 GB footprint budget.** Asserted by Wood (s01) as following
  from "reference hardware". No published JAM reference-hardware
  specification with a RAM figure was located. The 21 million token count
  is arithmetic on that estimate (21 × 10⁶ × 1024 B ≈ 20.0 GiB), so if the
  RAM premise moves, the supply figure moves with it.
- **"JAM out-classing parachains" in coretime usage.** Wood cites
  demonstrations (s01) without naming them; no independent benchmark was
  located.
- **The claim that $JAMKB "does not prejudice" DOT's other functions**
  (s01) is the author's assessment of his own proposal, and is the exact
  point contested on the forum (s08).

## Structurally undecided

- **Denomination of $JAMKB sales.** Wood's own preference is dotUSD
  rather than DOT (s02), which is in tension with the DOT value-capture
  argument several forum participants made (s08). Nothing is settled.
- **Retention share.** How much footprint the DAO keeps versus sells is
  explicitly deferred to governance (s02, s09). Every downstream economic
  conclusion depends on this unset number.
- **Rate-adjustment mechanism.** Wood says the KB-per-token rate "will be
  dynamic in nature and not require a hard-fork to alter" (s01) but names
  no mechanism, no cadence, and no authority. Whether this is a governance
  call, an oracle, or a schedule is unknown.
- **Whether $JAMKB requires a Gray Paper change at all.** The
  specification defines one native token and leaves deposit constants
  open (s04, s05); nothing retrieved names $JAMKB.

## Likely to move

- **The dynamic-pricing design space is actively unstable.** The Web3
  Foundation's own decaying-deposit proposal was published 2026-06-29 and
  **withdrawn 2026-08-03** — four days before this report's access date —
  on five stated grounds including execution-layer incompatibility and a
  parameter cold-start problem (s10). Any conclusion about the viability
  of dynamic alternatives should be treated as provisional.
- **JAM is not live.** No mainnet deployment as of the most recent
  retrieved review (s20), so no empirical footprint-demand data exists.
  All pricing arguments on every side are pre-deployment reasoning.
- **Governance has not spoken.** No OpenGov referendum on $JAMKB was
  located. Community sentiment in June–July 2026 is not a decision.

## This report's own exposure

- The rebuttal in §6 is **this report's argument**, constructed from
  primary specification text and comparative-system evidence. Where a
  forum participant independently reached the same conclusion it is
  attributed; where not, the argument stands on the cited primaries and
  should be read as analysis rather than as reported consensus.
- The claim that changing `C_bytedeposit` is cheap rests on the Gray
  Paper making `minbalance` a *dependent* term recomputed from
  `items`/`octets` (s03) rather than a stored per-service value. That
  reading is well supported by the equation and by the host-call checks
  (s06) but has not been confirmed against a working implementation.
- All economic reasoning about squatting and hoarding is theoretical.
  No JAMKB market exists to measure.
