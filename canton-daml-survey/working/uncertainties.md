# Uncertainties — Canton and Daml

Things the draft should flag as still-shaky even after publication.

- **Performance numbers are vendor-stated.** TPS, latency, and cost figures for Canton come from Digital Asset / Canton Network material and from the blogs of consortium operators (Broadridge DLR dollar-volume numbers are independently press-released but are not blockchain throughput numbers — they are repo-trade volume). No peer-reviewed benchmark of the Canton protocol exists (s35 is about the language, not the protocol's measured performance).
- **Sub-transaction privacy guarantees.** The cryptographic construction is described in the Canton whitepaper (s05) but the whitepaper is vendor-authored; no independent formal audit public at time of writing.
- **Canton Coin market.** CC has a short price history, public circulation only started mid-2024 (s02), and the reward split is scheduled to change (s08). Any number should be treated as a snapshot.
- **"Production" wording.** Deployments such as GS DAP, D7, HKEX Synapse and Broadridge DLR are real and in production (s11, s13, s15, s17, s18, s38), but most of them run on operator-controlled Canton instances, not on the public Canton Network with the Global Synchronizer — those are separate claims.
- **Governance centralisation risk.** The Global Synchronizer Foundation is Linux-Foundation-backed (s03), but Digital Asset is also a founding member and the primary code author (s28). Independent-of-vendor governance is a goal rather than a proven equilibrium yet.
- **Licensing posture.** Core protocol (s20, s21) and Splice (s28, s29) are Apache-2.0. Canton Enterprise (s31) and other DA Utilities modules are commercial and access-gated. Any builder economic model depends on which boundary the deployment sits on.
- **Interop maturity.** Atomic cross-domain transfer inside Canton is described as production-ready (s33). Bridges to external chains (e.g. Ethereum) are described as narrow-use, and at least one partnership (Circle USDCx) is recent; this is an emerging capability rather than a proven default.
