# Uncertainties

- **EigenDA "100 MB/s" target (V2/Blazar)** is project-stated and benchmarked by the vendor; real-world sustained mainnet throughput may differ. Mark as _(vendor-stated)_ in prose.
- **Celestia "1.33 MB/s live" estimate** derives from 8 MB / 6 s block math reported by competing-vendor analysis (Avail blog); Celestia's own roadmap (Matcha, Fibre) cites much higher future targets but those are roadmap claims.
- **EigenDA security model classification (DAC vs publicly-verifiable chain).** Competing-vendor Avail blog frames EigenDA as a DAC; EigenLabs material frames it as restaking-secured. Presented as disagreement, not silently resolved.
- **EigenDA slashing.** EigenLayer slashing primitive launched April 17, 2025, but adoption is per-AVS opt-in; EigenDA-specific slashing conditions in production are not yet uniformly documented.
- **Bridging assumptions.** Blobstream and EigenDA L1 attestations have different finality and trust profiles; this report summarizes but does not measure them empirically.
