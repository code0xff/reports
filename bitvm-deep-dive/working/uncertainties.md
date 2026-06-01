# Uncertainties

Epistemic register — publishable but shaky / likely to shift.

1. **Fast-moving target.** BitVM went from BitVM1 (2023) → BitVM2 (2024) → BitVMX (2024) → BitVM3 (2025) in under two years. Any "current state" claim (script sizes, tx counts, deployment status) may be stale within months. Numbers are time-stamped to mid-2026 sources.

2. **Script-size numbers are moving and source-dependent.** The Groth16-in-Script size has been quoted at 7 GB → ~3 GB → ~1.2 GB → ~1 GB as optimization progressed. Treat the specific figure as approximate and trending down, not fixed. (s04, s06, s07)

3. **Vendor/preprint-heavy evidence.** Much of the strongest technical detail is project-hosted (bitvm.org), preprint (arXiv, IACR), or vendor-blog (Bitlayer, Alpen). Peer review is limited. The BitVMX arXiv paper and the dissent (Decrypt journalism, Whittle critique) are the most independent anchors.

4. **"Trust-minimized, not trustless" is contested framing.** Proponents and critics agree on the 1-of-n setup honesty assumption but disagree on whether the residual liveness/capital dependence is acceptable in practice. This report presents both sides rather than ruling.

5. **Deployment maturity.** Confirmed: Citrea Clementine testnet (2025) and Bitlayer mainnet *beta* (2025-07). Not established: a mature, high-TVL, fully-audited mainnet BitVM bridge as of 2026-06. Claims about production readiness are deliberately hedged.

6. **PDF access.** BitVM2 bridge paper (s04) and BitVM3 paper (s10) were not read as full text; their claims are corroborated via HTML project pages, the repo, and secondary explainers. Fine details of those papers are therefore second-hand.
