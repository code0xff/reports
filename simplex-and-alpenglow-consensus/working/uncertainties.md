# Uncertainties

- **"150 ms median finality"** [s04] and **"100 ms fast-path"** [s17] are simulator/whitepaper figures; production mainnet measurements are not yet available.
- **"Vote fees ~1 SOL/day" / "Validator minimum stake from 4,850 SOL to 450 SOL"** [s07] are Alchemy's projections; the underlying economics depend on inflation and stake distribution.
- **Sei's "weaker protection against purely adversarial attacks"** framing [s08] is partly editorial — it argues that the 20% Byzantine bound is materially tighter than the 33% bound but does not dispute the 20+20 model.
- **Simplex's benchmark table (400 / 480 / 1840 / 2480 ms)** on simplex.blog [s01] is presented as worst-case at 80 ms message delay; the protocols compared are HotStuff, Tendermint chained, and Algorand Agreement — readers should treat the table as a vendor-published benchmark of the Simplex authors.
- **Mainnet activation timeline** moved several times across coverage [s10][s11][s12]; the most recent confirmed milestone is the May 11, 2026 community test cluster activation.
