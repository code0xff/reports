# Uncertainties

- **Throughput numbers are vendor-stated.** Hyperliquid's "200k orders/sec" and Injective's "25,000 TPS" come from project docs (s03, s04); no independent benchmark was located. Treat as design targets / self-reported capacity, not audited peak. _(vendor-stated)_
- **Hyperliquid dominance is a moving target.** Share swung from ~80% to ~10% to ~44% within ~12 months as incentive-driven rivals (Aster) appeared and faded (s13, s14). The "completely dominant" framing is time-sensitive. _(moving)_
- **Sei's identity shifted.** The "trading L1 with a native orderbook" description fits v1; v2 reframed Sei as a general parallel-EVM chain and the native dex/orderbook module is no longer the centerpiece (s09). Claims about Sei's orderbook should be read as historical design intent. _(moving / partly historical)_
- **"Fully on-chain" is a spectrum.** dYdX v4 keeps the orderbook in validator memory (off-chain to consensus) yet is widely called "decentralized"; Hyperliquid puts the book in consensus state. The label "on-chain orderbook" covers materially different trust models (s01, s03). _(definitional)_
- **Closed/under-audited internals.** Matching-engine code paths (HyperCore, x/clob memclob) are described in docs but not independently audited within this report's sources. _(vendor-stated)_
