# Uncertainties

## Vendor-stated and likely-to-shift
- **Aztec mainnet readiness.** Alpha mainnet activated November 2025 with full private-smart-contract execution (s04, s23), but absolute TVL / DAU numbers were not surfaced and the network's own framing ("Alpha") signals that breaking changes and migrations are expected.
- **Privacy Pools adoption.** "$6M volume / 1,500+ users since March 2025" (s08) is real but small relative to transparent DeFi; whether selective-disclosure mixing scales to mass-market is still an open question.
- **Client-side proving feasibility.** The "Noir on a phone via CHONK" claim (s05, s22) is project-stated and represents the canonical 2025–2026 reference, but specific latency / battery / RAM measurements were not surfaced; treat as feasibility demonstration, not a generic SLA.
- **Folding-scheme adoption in privacy products.** Nova/SuperNova/HyperNova (and Ethereum-aligned implementations) remain prover-side research as of 2026; no shipped Ethereum privacy product uses them in production today.

## Regulatory whiplash
- **US.** OFAC's 2022 Tornado Cash designation (s01) was reversed by the Fifth Circuit in November 2024 (s02) and formally delisted by Treasury in March 2025 (s03). The legal precedent is *immutable smart contracts are not "property"* — but the practical sanctions environment for new privacy primitives remains contested.
- **EU.** AML Regulation 2024/1624 (in force July 1, 2027) bans anonymous crypto accounts and anonymity-enhancing coins; the Commission must report on banning mixers and "high-risk" privacy wallets (s18). This is the opposite direction from the US Fifth Circuit's reasoning.
- **Other jurisdictions.** Singapore (MAS), UK (FCA), and US Treasury post-delisting positions are not surveyed in this gather; treat the US/EU contrast as the primary frame, not the global picture.

## Empirical privacy-leak risk
- **Anonymity-set fragility.** s15 (arXiv 2510.09433) shows 5–12% of Tornado Cash withdrawals are linkable through address reuse / transactional linkage alone, with FIFO temporal matching adding 15–22 percentage points. The cryptography did not fail — user behavior leaked. This pattern likely transfers to Aztec / Railgun / Privacy Pools and is not project-specific.

## Gaps acknowledged but not closed
- No public third-party audit of 0xbow Privacy Pools surfaced.
- No formal benchmark of Aztec proof-generation latency on a real consumer phone surfaced.
- No comparable adoption-volume series across Aztec / Railgun / Privacy Pools / Nocturne (sunset) was assembled.
