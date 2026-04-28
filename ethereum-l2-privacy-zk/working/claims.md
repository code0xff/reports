# Claims — Ethereum and L2 privacy

## Introduction
- [ ] c01: The August 2022 OFAC sanctions on Tornado Cash were the watershed event for Ethereum privacy: they removed the dominant general-purpose mixer and forced the next generation of designs to reason about compliance from day one.
  - kind: factual
  - needs: OFAC press release / Treasury action; major outlet coverage.
- [ ] c02: As of 2026, "practical" privacy on Ethereum and L2 is no longer "hide everything" — the production design pattern is *selective disclosure*: users opt to prove specific predicates (KYC tier, age, blacklist exclusion) while keeping the rest private.
  - kind: interpretive
  - needs: Privacy-Pools / Worldcoin / Anon Aadhaar / zkPassport documentation showing the predicate-proof framing.

## Threat model and privacy taxonomy
- [ ] c03: A useful taxonomy of on-chain privacy distinguishes (a) sender / receiver / amount / call-data confidentiality, from (b) anonymity-set-based "mixing" of otherwise-transparent transactions, and (c) shielded-state systems where the contract itself never reveals plaintext to the chain.
  - kind: interpretive
  - needs: Aztec / Vitalik-style taxonomy posts.
- [ ] c04: A privacy system's anonymity set is bounded by the number of *active* users in the same epoch and the same denomination/asset, not the cumulative depositor count — small or empty pools provide no real privacy.
  - kind: technical
  - needs: published anonymity-set analysis (Tornado Cash empirical studies, Privacy Pools analysis).

## Existing privacy solutions on Ethereum and L2 (current state)
- [ ] c05: Aztec Network is the only Ethereum-aligned production privacy system that ships *programmable* shielded state today, with a privacy-first zk rollup based on the Noir language and the Barretenberg PLONK-style proving stack; mainnet activation occurred in 2025.
  - kind: factual
  - needs: Aztec docs / launch announcements; Noir / Barretenberg repos.
- [ ] c06: Railgun provides per-asset shielded balances on Ethereum L1 and several L2s using a SNARK-based shield/unshield flow, while *Tornado Cash itself* has been frozen / partially restored only via court-ordered re-listing of certain smart-contract addresses but remains effectively dead as a product.
  - kind: factual
  - needs: Railgun docs; reporting on the 2024 ruling on Tornado Cash; OFAC delisting actions.
- [ ] c07: Privacy Pools — proposed in a 2023 paper co-authored by Buterin, Buterin's father Dmitry, Ameen Soleimani, Jacob Illum, and Matthias Nadler — separate "association set proofs" (showing your deposit belongs to an honest subset) from "exclusion set proofs" (showing it is not in a sanctioned subset), and shipped a 2024–2025 production deployment.
  - kind: factual
  - needs: original "Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium" paper; project-side launch announcement.
- [ ] c08: Nocturne — the Ethereum-native privacy account that integrated with smart accounts — was sunset by its team in 2024, leaving a gap in the "private smart account" niche that other projects have not yet filled at production scale.
  - kind: factual
  - needs: Nocturne post-mortem / sunset blog; commentary.

## The zk primitive layer that matters
- [ ] c09: Production privacy projects on Ethereum predominantly use SNARK constructions with KZG-style universal trusted setups (PLONK family, Halo2) or pairing-based Groth16 per-circuit setups; STARKs are dominant for general-purpose execution proving but largely absent from on-Ethereum *privacy* projects today.
  - kind: technical
  - needs: project documentation (Aztec/Barretenberg, Railgun, Privacy Pools) confirming SNARK choice.
- [ ] c10: Client-side proving for privacy is now demonstrably tractable on consumer hardware: Aztec's Barretenberg / Noir stack and the public claim that Aztec proofs can be generated on a phone are the canonical 2025–2026 references; STARK-class proving for private payments has not yet matched that latency on consumer hardware.
  - kind: technical
  - needs: Aztec documentation, Noir blog posts, Mobile Prover demos.
- [ ] c11: Folding schemes (Nova / SuperNova / HyperNova) and recursive SNARKs are the path to long-running computation proofs (e.g. proving an entire DeFi session) on the prover side, but are not yet the production proof system of any on-Ethereum privacy project.
  - kind: interpretive
  - needs: a Nova-family review / paper, plus a project status check.

## Practical zk applications today
- [ ] c12: Anonymous credentials — Semaphore, World ID, Anon Aadhaar, ZK-Email, zkPassport — are the *highest-volume practical* zk privacy primitives on Ethereum today, used to prove personhood / age / nationality without revealing the underlying document.
  - kind: factual
  - needs: each project's docs and reporting on adoption volume.
- [ ] c13: Shielded *payments* on Ethereum (Aztec, Railgun) are deployed but at adoption volumes orders of magnitude below transparent DeFi; the dominant friction is the shield/unshield gas cost and the small per-asset anonymity set, not cryptography.
  - kind: interpretive
  - needs: on-chain volume comparisons; project-side commentary on UX bottlenecks.
- [ ] c14: ZK-rollups *as a category* do not provide payment privacy by default — they prove validity of plaintext state transitions; "privacy zk rollups" (Aztec) are a distinct, smaller subset of the zk-rollup design space.
  - kind: technical
  - needs: zkSync / Linea / Scroll / Aztec documentation contrasting validity vs. privacy goals.
- [ ] c15: ZK-Email and similar "prove a property of an existing Web2 artifact" primitives are emerging as a practical bridge between off-chain identity and on-chain privacy: they let users prove things like "I received an email from this domain" in a zero-knowledge proof without revealing email contents.
  - kind: factual
  - needs: ZK-Email / DKIM-proof project documentation.

## Recommendations: what's actually deployable today
- [ ] c16: For a 2026 builder choosing a stack: shielded payments → Aztec or Railgun; compliance-aware mixing → Privacy Pools or a Privacy-Pools-style construction on top of Railgun; anonymous identity / sybil resistance → Semaphore or World ID; private bridging → still research-grade, no production-ready answer.
  - kind: interpretive
  - needs: synthesis from c05–c15, plus at least one independent commentary (a16z / Variant / Galaxy / Paradigm).
- [ ] c17: For a *user*, the practically deployable privacy stack today is (a) Privacy Pools or Railgun for shielded balances on L1 / L2, (b) World ID / Anon Aadhaar / zkPassport for identity, and (c) ZK-Email for off-chain attestations; "fully private DeFi" remains aspirational for general users.
  - kind: interpretive
  - needs: project docs + adoption commentary.

## Limitations and open problems
- [ ] c18: The single largest unresolved risk for Ethereum privacy is *regulatory*: the post-Tornado sanctions environment has not produced a stable rule about which on-chain privacy primitives are legal to deploy, and several jurisdictions have produced conflicting signals (US Tornado Cash ruling vs EU MiCA vs Singapore MAS).
  - kind: interpretive
  - needs: at least two regulatory references on opposite sides.
- [ ] c19: Production privacy systems consistently report that the most fragile technical layer is the *anonymity set*, not the cryptography: empirical studies of Tornado Cash demonstrated that user-side mistakes (relayer choice, deposit/withdraw timing, address-reuse) routinely de-anonymize otherwise-private transactions.
  - kind: factual
  - needs: empirical de-anonymisation studies on Tornado Cash.
