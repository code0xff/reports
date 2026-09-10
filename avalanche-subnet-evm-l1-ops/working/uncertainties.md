# Uncertainties

- Fee level. 512 nAVAX/s (≈1.33 AVAX/month) is the *initial minimum*; ACP-77 defines an exponential rate that rises with the number of active L1 validators above the 10,000 target. Any cost figure in the draft is the floor, not a forecast.
- Tooling churn. avalanche-cli is in maintenance mode (Dec 2025), Subnet-EVM moved into the AvalancheGo monorepo, and ACP-224/Helicon will replace the FeeManager precompile and make `gasLimit`/`baseFeeChangeDenominator` obsolete. Command names and genesis fields quoted here are accurate for 2026-09 and are likely to drift.
- Comparison numbers. Fee and finality comparisons (s14) come from a managed-node vendor with a commercial interest in L1s; the framework piece (s15) is an anonymous Substack. Both are marked in prose.
- The "80% connected weight" liveness rule is Ava Labs' operational guidance, not a formal consensus bound; the actual Snowman parameters are tunable.
- Adoption. Institutional L1 announcements (Progmat, KB Kookmin Card) are announcements, and some are migrations-in-progress rather than live chains.
- Subnet → L1 grandfathering: the 12-month transition window for pre-Etna subnets is from a tier-5 source only.
