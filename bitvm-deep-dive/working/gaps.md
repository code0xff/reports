# Gaps

Status after 2 gather sweeps (whitepapers + project pages + arXiv + independent analyses + news/dissent).

## Under-sourced claims
- None blocking. All 18 claims have ≥1 qualifying source; technical claims rest on primary papers/repo, and the interpretive trust/capital claims carry independent corroboration (Alpen, Decrypt, Whittle).

## Conflicts / divergent numbers (represented, not resolved)
- **Groth16 verifier script size**: estimates range across sources/time — "~3 GB" (early framing), "~1.2 GB" (Alpen), "~1 GB" (BitVM repo README), with 7 GB cited as the original estimate. Draft presents this as a *range that shrank over time*, not a single number. (s04, s06, s07)
- **On-chain tx count for BitVM2 disputes**: described as "three transactions" (project framing) vs a named flow KickOff/Assert/Challenge/Disprove (4 named tx in the optimistic+challenge path). Draft says "a small constant (on the order of three core transactions)". (s03, s07)

## Missing / weak primary sources
- The canonical PDFs (BitVM2 bridge paper s04, BitVM3 paper s10) were not fetched as text (large/again IACR-style PDF risk) — marked `access_limited`, claims cross-sourced from the HTML project page (s03), repo (s06), and secondary explainers (s07, s11). → Limitations.
- The "Considered Unsafe" critique (s12) is cited as a pointer; its substantive quotes are drawn via the independent Decrypt write-up (s08) rather than the Medium body. → acceptable; dissent is represented.

## Open questions (deferred to Limitations / uncertainties)
- Whether any BitVM bridge is in *full* (non-beta) mainnet with material TVL as of 2026-06 — sources confirm testnet (Citrea) and mainnet *beta* (Bitlayer 2025-07), not mature mainnet. 
- Whether BitVMX/BitVM3 have production bridge deployments — not evidenced; treated as research/successor designs.

## Verdict
No must-fix gaps for drafting. Numeric divergences are presented as ranges with attribution; maturity and PDF-access gaps go in Limitations.
