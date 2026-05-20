# Gaps

## Sweep 1 — 2026-05-20

All 25 claims have at least the minimum sourcing per `PROTOCOL.md` §2.3. Algorithmic claims (c05, c09–c15, c19) carry SIMD-0326 plus at least one independent technical analysis (Helius / Alchemy / Sei / 1inch).

## Residual gaps (surfaced as Limitations / qualifiers)

- **Alpenglow white paper v1.1 PDF** at `anza.xyz/alpenglow-1-1` returned a header-only fetch [s14]; section-level quoting of Theorem statements is not done here. Quantitative claims rely on SIMD-0326 [s05] and the Anza blog [s04].
- **Alpenglow presentation slides** [s15] cited by URL only; raw fetch returned access-limited content.
- **Simplex paper PDF on ePrint** [s02] hit a 403 under scripted fetch; algorithmic quotes are cross-checked against simplex.blog [s01], the Cornell slides [s16], and the sister report `commonware-simplex-consensus`.
- **Solana Votor source code** has not yet been opened in a public repo at the time of this writing (Anza is still gating implementations); claims about Votor implementation lean on SIMD-0326 [s05] and on Solana mainnet test cluster reporting [s12].

## Open questions for follow-up

- Final mainnet activation date for Alpenglow.
- Concrete production benchmark numbers (median finality, throughput) measured on Solana mainnet, not testnet simulation.
- Whether the 2,000 validator cap will be raised after the initial rollout.
