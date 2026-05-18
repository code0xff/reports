# Critique

Self-review against PROTOCOL.md §3.

## Citation integrity
- Every claim in draft has at least one `[^sNN]` ref. Architectural claims for Aztec cite the Aztec blog (s01) plus Bankless (s03). Miden architectural claims cite Obscura (s06) and HackMD (s07), with the Polygon blog (s09) and miden.xyz (s08) as additional anchors. Railgun citations include Railgun's own piece (s10) and an independent 2026 comparison (s11, s12).

## Source diversity
- Primary (s01, s02, s08, s09, s10) plus technical (s07) plus news (s05, s14) plus blog (s03, s04, s06, s11, s12, s13). No peer-reviewed sources; this is industry infrastructure and the literature is still mostly project-hosted and industry analyst-hosted.

## Counter-evidence
- Aztec is presented alongside the publicly disclosed March 2026 proving-system vulnerability and the conditional nature of current security guarantees.
- The Railgun vs Aztec framing presents both Railgun's compliance angle (PPOI) and Aztec's deeper integration; not silently resolved.

## Weak reasoning
- "EVM's transparent state makes privacy essentially impossible without compromising security" is a strong opinion sourced to a single piece (s03); used as Aztec's *positioning argument*, not as universal truth. Marked as a sourced rationale.

## Must-fix items
- None.

## Nits (deferred)
- We did not get a Miden v2 or v3 official whitepaper extracted directly; HackMD and Obscura suffice for the report's scope.
