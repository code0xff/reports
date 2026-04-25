# Uncertainties

## Vendor-stated and possibly evolving claims
- **Theoretical block-time / finality numbers** (`~300ms` / `~450ms` from s09) are theoretical projections derived from "2 network hops × 150ms RTT" and not measured. The measured numbers from Alto in s18 (`200ms` / `300ms` after buffered-signature optimization) are real but specific to one workload (a "wicked fast minimal blockchain") on c7g.xlarge AWS instances; they are not a generic SimpleX benchmark.
- **Production readiness**: the crate is labeled ALPHA on crates.io (s15) and the Commonware stability matrix (s11) defines ALPHA as "breaking changes expected, no migration path". Statements about Commonware SimpleX in production should be qualified as "not yet recommended for production use" by the maintainers themselves.
- **Threshold-Simplex dialect**: the standalone `consensus::threshold_simplex` module described in s10 (Sept 2024) appears, as of crate v2026.4.0 (s05), to have been folded into `simplex` as a pluggable scheme (`bls12381_threshold`). Any reference to a separate dialect should be qualified by date.

## Independent-corroboration gaps
- We have **one independent peer-reviewed paper** building on SimpleX (Shoup 2024, s16) and **one independent technical write-up** comparing it to Tendermint (decentralizedthoughts, s17). There is no independent peer-reviewed empirical benchmark of Commonware's specific implementation.
- No public, third-party security audit of the Commonware `simplex` crate was located. Security claims rely on (a) the academic protocol's correctness proofs (s01) and (b) Commonware's deterministic-simulation coverage (s09 cites ">90% coverage").

## Likely-to-shift facts
- Adoption claims (Solana Alpenglow / Votor variant of Simplex, Tempo, Ava Labs Go implementation, listed in s03/s12) are deployment plans, not yet shipped to production mainnets; status may have changed by publication time. Solana Alpenglow's mainnet activation was projected for "late 2026" as of mid-2025 reporting (s13).
