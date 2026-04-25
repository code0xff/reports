# Gaps — final pass

## Sweep 1 → Sweep 2 resolution
- **c03** (phase-count comparison): resolved by s17 (decentralizedthoughts independent comparison: Tendermint 6Δ view-change vs. Simplex 3Δ) plus s03 (simplex.blog comparative numbers). Marked interpretive.
- **c13** (measured benchmarks): resolved by s18 (Alto: 200ms block time / 300ms finality after buffered-signature optimization on c7g.xlarge AWS). Still flagged vendor-stated and workload-specific in uncertainties.md.
- **c14** (independent peer-reviewed analysis): partially resolved — s16 (Shoup, DISC 2024 "Sing a Song of Simplex" / DispersedSimplex) is an independent peer-reviewed paper that **builds on** SimpleX, not a head-to-head empirical benchmark of Commonware's implementation. Adjust c14 wording in draft: independent academic engagement exists; independent measured comparison of Commonware's implementation does not.
- **c15** (leader-DoS limitation): partially resolved — s06 explicitly notes "leader timeout to trigger early view transitions for unresponsive leaders" and s17 frames the core innovation as letting Simplex "waste less time" on faulty leaders. The exact phrase "leader DoS" was not located, so the claim should be reworded as "deterministic per-iteration leader requires a timeout-based skip mechanism" rather than "DoS".

## Conflicts retained for the draft
- `threshold_simplex` standalone vs. integrated scheme (see uncertainties.md). Will present both honestly with date attribution.
- Theoretical (~300/~450ms) vs measured (~200/~300ms after optimization) latencies — both will be cited with their conditions.

## Remaining gaps accepted as Limitations
- No independent peer-reviewed empirical benchmark of Commonware's specific Rust implementation (vs. paper or vs. competitors) has been located. This is acknowledged in the report's Limitations section.
- No public third-party security audit of the `simplex` crate was located. Same.

Sweep count: 2 of 6 allowed. Stopping further gather; remaining evidence is sufficient for the draft.
