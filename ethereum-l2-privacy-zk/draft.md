## Abstract

Privacy on Ethereum and its L2s is no longer "hide everything." After the August 2022 OFAC sanctions on Tornado Cash [^s01], the November 2024 Fifth Circuit reversal [^s02], and the March 2025 Treasury delisting [^s03], the production design pattern that survived is **selective disclosure**: users prove specific predicates (compliance association, age, document ownership) while keeping the rest private. The 2025–2026 stack reflects that. Aztec activated its Alpha mainnet in November 2025 as the first L2 with a full execution environment for private smart contracts [^s04], built on Noir + the Barretenberg/CHONK proving stack now feasible on phones and browsers [^s05][^s22]. Railgun ships per-asset shielded balances on Ethereum, BNB Chain, Polygon, and Arbitrum as on-chain smart contracts only — no separate validator set, no bridge [^s06]. Privacy Pools — based on the Buterin/Soleimani/Illum/Nadler/Schär 2023 paper [^s07] — went live on Ethereum mainnet in March 2025 via 0xbow with $6 M / 1,500+ users in its first weeks [^s08][^s20], using association-set proofs to dissociate honest depositors from illicit ones. Anonymous credentials — Semaphore [^s10], World ID [^s11], Anon Aadhaar [^s12], ZK-Email [^s13], zkPassport [^s14] — are quietly the highest-volume zk-privacy primitives on Ethereum today. Three forces still shape what is realistically deployable: (a) regulatory whiplash (Fifth Circuit overturning OFAC vs. EU AML Regulation 2024/1624 banning anonymity-enhancing accounts by July 2027) [^s02][^s18]; (b) anonymity-set fragility — empirical studies link 5–34% of Tornado Cash withdrawals to deposits via address-reuse / temporal heuristics [^s15]; and (c) the still-unfinished primitive pipeline (folding schemes are research-grade for privacy products today). For a 2026 builder choosing a stack, the practical answer is therefore composition: Aztec or Railgun for shielded balances, Privacy Pools for compliance-aware mixing, Semaphore / World ID / Anon Aadhaar / ZK-Email / zkPassport for identity, with private cross-rollup bridging acknowledged as still research-grade [^s17][^s19].

## Introduction

Privacy on a public ledger is structurally hard for the same reason public ledgers are useful: every state transition is an indelible, replayable, indexable record. The 2020–2022 stack treated this as "build a mixer big enough that membership becomes statistical noise"; the 2025–2026 stack treats it as "let users prove the property they want disclosed and nothing else." The pivot was forced, not chosen.

The August 2022 OFAC designation of Tornado Cash, alleging more than $7 B in laundered funds (including by North Korea's Lazarus Group), added 53 Ethereum addresses including ~20 immutable smart contracts to the SDN list [^s01]. That made interacting with the contracts a sanctions matter for U.S. persons and effectively killed Tornado Cash as a product even before the legal questions resolved. In November 2024 the U.S. Fifth Circuit reversed in *Van Loon v. Treasury*, holding that immutable smart contracts are not "property" under IEEPA and that OFAC had exceeded its statutory authority [^s02]; in March 2025 Treasury formally delisted [^s03]. By then the design space had already moved on — the surviving constructions are not "Tornado Cash 2.0" but **systems that bake in a way to make claims about your funds without disclosing them**.

This report walks through the privacy taxonomy, surveys the 2024–2026 production stack, examines which zk primitives actually constrain the application layer, identifies the practical zk applications that have shipped, and ends with a concrete recommendation for what to build (or use) today.

## Threat model and privacy taxonomy

A useful frame distinguishes three privacy goals on chain:

1. **Confidentiality of payment fields** — sender, receiver, asset type, and amount are not visible on chain. This is what shielded UTXO systems (Aztec [^s23], Railgun [^s06], Tornado-class mixers) target.
2. **Anonymity-set membership** — the on-chain artifact is technically transparent, but is mixed with a large enough set of equivalent artifacts that linking a withdrawal to a specific deposit is statistically hard. Tornado Cash and Privacy Pools work this way [^s07][^s20].
3. **Selective predicate disclosure** — the user proves a specific *property* (you are not in this blacklist; you are over 18; this email came from `@example.com`; you own a passport from country X) without revealing anything else. Semaphore, World ID, Anon Aadhaar, ZK-Email, and zkPassport are predicate-disclosure systems [^s10][^s11][^s12][^s13][^s14].

These goals are not mutually exclusive — Privacy Pools combines (2) with (3) by adding an association-set proof on top of a shielded pool [^s07][^s20] — but they impose different constraints. Shielded systems must encrypt state; mixing systems must run a meaningful epoch with a meaningful number of co-depositors; predicate systems must trust some off-chain authority (a DKIM key, a passport CA) and prove against it.

A privacy system's anonymity set is bounded by the number of *active* users in the same epoch and the same denomination, not the cumulative depositor count. The empirical Tornado Cash literature shows the cost of getting that wrong: across Ethereum, BNB Smart Chain and Polygon, 5.1–12.6% of withdrawals are linkable to their originating deposits via address-reuse and transactional-linkage heuristics alone, and adding a FIFO temporal-matching heuristic lifts the linkage rate by a further 15–22 percentage points — a cumulative leakage of up to roughly one-third of withdrawals [^s15]. The cryptography did not fail; user behavior leaked. This pattern is not specific to Tornado Cash and likely transfers to any anonymity-set design that depends on user discipline.

## Existing privacy solutions on Ethereum and L2

### Aztec — the privacy-first zk rollup

Aztec is the only Ethereum-aligned production system that ships *programmable* shielded state today. Its Ignition Chain went live in November 2025, with the network entering Alpha as "the first Layer 2 with a full execution environment for private smart contracts" [^s04]. The design separates public and private execution: private execution runs in a **Private eXecution Environment (PXE) on the user's device**, and only the user holding the keys can read the encrypted private state [^s17][^s23]. The cryptographic backend is **Barretenberg**, currently in its **CHONK** (Client-side Highly Optimized ploNK) generation, "purpose-built for proving on phones and browsers" and powering the Alpha proving pipeline [^s05]. The application language is **Noir**, a proving-system-agnostic frontend that supports Barretenberg, Halo2, Plonky2, and Groth16 [^s05]; **NoirJS** lets developers ship privacy-preserving ZK applications that prove client-side in the browser [^s22].

Aztec is positioned distinctly from "scaling zk rollups" (zkSync Era, Linea, Scroll, Starknet). Most zk rollups use the zero-knowledge property for *succinctness* of the validity proof, not to hide application data — their state remains transparent on L1 [^s17]. Aztec inverts this: privacy is the primary product, scaling is a side effect.

### Railgun — privacy middleware on multiple chains

Railgun is a different architecture: instead of being its own rollup, it is **on-chain smart-contract middleware** that runs on Ethereum, BNB Chain, Polygon, and Arbitrum [^s06]. Users *shield* ERC-20 tokens into a private balance and then transact with `0zk-to-0zk` operations in which sender, recipient, token type, and amount remain private; only the relayer and the destination smart-contract address are publicly visible [^s06]. Because it is "just on-chain smart-contract logic, achieving privacy without the need for a separate L2 validator set or a vulnerable bridge" [^s06], Railgun avoids two major risk categories — but it pays the cost of running per-chain shielded pools, each with its own anonymity set.

### Privacy Pools — compliance-aware mixing

The Privacy Pools concept was formalized in a September 2023 SSRN paper co-authored by Vitalik Buterin, Jacob Illum, Matthias Nadler, Fabian Schär, and Ameen Soleimani [^s07]. The technical core is to let a depositor *attach a zero-knowledge proof that membership in the deposit pool is also membership in some "association set" satisfying a property* — typically "this is not in a known sanctioned subset" — without revealing which deposit is the user's. The user thereby separates herself from illicit depositors *cryptographically*, not by trusting a centralized blacklist.

Privacy Pools shipped on Ethereum mainnet in March 2025, deployed by 0xbow, using zero-knowledge proofs combined with an **Association Set Provider (ASP)** that screens deposits and monitors transactions in real time [^s08][^s20]. As reported, the protocol processed roughly $6 M in transaction volume across more than 1,500 users in its early weeks, and it is described as "a keystone part of the Ethereum Foundation's Kohaku initiative" [^s08]. The contracts are open source [^s24].

### Nocturne — the gap left in private smart accounts

Nocturne, a Vitalik-backed "private account" project that integrated with smart accounts, **wound down on June 5, 2024**, with the team "shutting down the privacy protocol we built earlier last year" and converting withdrawal flows to a self-serve format [^s09]. The team did not publicly state a single reason; the post-Tornado regulatory environment was the cited backdrop [^s09]. Its closure left a gap in the "private smart account" niche that no project has yet filled at production scale.

### Why "privacy zk rollup" ≠ "zk rollup"

The term "ZK rollup" is misleading for privacy purposes. zkSync, Linea, Scroll, Starknet and Polygon zkEVM use zero-knowledge proofs to validate state transitions to L1 — but the underlying state and transactions are **plaintext on L1** [^s17]. They are validity rollups; the "ZK" is succinctness. Aztec's hybrid public-private model (encrypt user-side state, validate via SNARK) is a strict subset of the zk-rollup design space, not the default [^s17][^s23].

## The zk primitive layer that matters

For privacy products, the proving system choice constrains the application:

- **Groth16** — circuit-specific trusted setup, smallest proofs (~192 bytes), ~3 ms verification. Used widely in fixed-circuit privacy contracts (per-asset shielded transfers, anonymous-credential gadgets) where the circuit doesn't change [^s16].
- **PLONK / Halo2 / Plonky2 / Plonky3** — universal trusted setup (or transparent in some constructions), reusable across circuits, the right choice when an application's circuit can change. Aztec runs a PLONK family backend (Barretenberg / CHONK) [^s05]; Scroll uses a Halo2-based system [^s17].
- **STARKs** — transparent setup, post-quantum-friendly. Dominant for general-purpose execution proving (Starknet, Stwo, zkVMs) but largely absent from production *Ethereum privacy* projects today [^s16].
- **Hash function choice matters in proving cost.** Poseidon / Poseidon2 dominate ZK-friendly hash performance under Groth16; SHA-256 proving is faster under Groth16 than under PLONK frameworks [^s16]. ZK-friendly hashes are why Tornado-style Merkle membership proofs are tractable client-side.
- **Folding schemes (Nova / SuperNova / HyperNova)** are an active prover-side research direction that could, in principle, support proving long-running computations (e.g. a whole DeFi session) — but no production Ethereum privacy product uses them as its default proof system as of 2026. Treat them as a 2027+ frontier item _(forward-looking)_.

The most important 2024–2026 shift on this layer is **client-side proving feasibility**. Aztec's CHONK generation is designed for phones and browsers, NoirJS demonstrates a working browser proving pipeline [^s05][^s22], and the Aztec Alpha network's proof generation runs on consumer devices [^s05]. This collapses the historical assumption that user privacy required either a centralized prover or expensive hardware.

## Practical zk applications today

### Anonymous credentials and proof-of-personhood

The highest-volume practical zk-privacy primitives on Ethereum are **anonymous credentials**, not payments. Semaphore — by Privacy & Scaling Explorations (PSE) — provides "a generic, open-source privacy layer for Ethereum applications based on zk-SNARKs" that lets users prove group membership without revealing identity, with double-signaling prevention [^s10]. World ID layers Semaphore plus a Semaphore Merkle Tree Batcher (SMTB) for efficient set updates and uses orb-attested biometric uniqueness as the underlying credential [^s11][^s21]. Anon Aadhaar lets ~1.4 B Indian residents prove ownership of an Aadhaar ID with selective disclosure [^s12]. ZK-Email proves a valid DKIM signature exists on an email without revealing its contents [^s13]. zkPassport uses ICAO-standard ePassport chips for ZK-authenticated identity from passports of more than 100 countries [^s14].

These are the parts of the privacy stack that have actually shipped to large user populations.

### Shielded payments and DeFi

Aztec and Railgun are the production answers. Aztec gives you programmable shielded smart contracts on its own L2 [^s04][^s23]; Railgun gives you per-chain shielded balances embedded as smart contracts on existing L1/L2s [^s06]. Adoption of either is materially smaller than transparent DeFi today; the dominant friction is the shield/unshield gas cost and the per-asset anonymity-set sizing problem (and the regulatory environment), not the cryptography.

### Compliance-aware mixing

Privacy Pools is the pragmatic 2025 answer, separating "association-set proofs" (your deposit belongs to a set with property P, e.g. honest origin) from any need to reveal which deposit is yours [^s07][^s20]. Mainnet adoption is small but real — $6 M / 1,500+ users in its first weeks [^s08].

### Bridging and cross-rollup messaging

Private cross-rollup bridging — moving shielded value from one rollup's privacy domain to another — is **not a solved production problem in 2026**. The shared-sequencer / based-sequencer infrastructure that would simplify it (Espresso, Taiko-style based rollups) is itself early; Astria, a leading shared-sequencer effort, shut down in 2025. We surface this as a deliberate gap in the recommendation below.

### "Pragmatic privacy" as the dominant product framing

Industry coverage of the 2025–2026 cycle frames it explicitly: "From Aztec to Zcash, 2025 was the year *pragmatic privacy* took root" — a deliberate move away from absolutist hide-everything designs toward selective-disclosure constructions (Privacy Pools' association-set proofs, Aztec's PXE, Railgun's per-asset shielded balances) that ship under uncertain regulatory regimes [^s19].

## Recommendations: what's actually deployable today

For a 2026 builder choosing a stack against the goal "ship privacy that holds up under current regulatory and adversarial conditions," here is a defensible composition:

1. **Shielded payments → Aztec (greenfield) or Railgun (drop-in middleware).** Pick Aztec when you can write your application against its private smart-contract environment and want client-side proving from day one [^s04][^s05][^s23]. Pick Railgun when you need to bring privacy to *existing* L1 / L2 contracts on Ethereum, BNB, Polygon, or Arbitrum without a separate validator set [^s06].
2. **Compliance-aware mixing → Privacy Pools.** Use this when the design must accommodate regulators or institutional users who need to prove non-membership in a sanctioned association set [^s07][^s08][^s20][^s24]. Treat the ASP curator as a trust assumption you accept consciously.
3. **Identity / sybil resistance / KYC compression → Semaphore, World ID, Anon Aadhaar, ZK-Email, zkPassport.** Use the one whose underlying authority matches your user base. Semaphore is the generic zk-credential primitive [^s10]; World ID brings biometric uniqueness [^s11]; Anon Aadhaar covers Indian residents [^s12]; ZK-Email gives you DKIM-anchored organisational claims [^s13]; zkPassport gives you ICAO-anchored nationality / age [^s14].
4. **Proving stack → PLONK family for evolving circuits, Groth16 for fixed ones.** Aztec / Noir's PLONK family is the right default if circuits will change; Groth16's smaller proofs are correct for stable, small circuits [^s05][^s16].
5. **Client-side proving by default.** The Aztec / NoirJS / Barretenberg-CHONK trajectory makes proving on phones and browsers a 2026 reality, not an aspiration [^s05][^s22]. Designs that route private inputs to an off-device prover should be treated as worse-than-necessary on privacy grounds.
6. **Do not assume zk-rollup ≠ privacy.** A "ZK rollup" by default does not give you payment privacy. If you need privacy on an L2, you either build on a privacy-first rollup (Aztec) or layer privacy middleware (Railgun) on top of a generic rollup [^s17].
7. **Treat private cross-rollup bridging as research-grade.** As of 2026, no production-grade answer exists; defer or use shielded balances per chain.

For a *user* the practically deployable stack today is (a) Privacy Pools or Railgun for shielded balances on L1 / L2; (b) World ID, Anon Aadhaar, or zkPassport for identity-attached actions; (c) ZK-Email for off-chain attestations. "Fully private DeFi" remains aspirational for a general user [^s06][^s08][^s11][^s12][^s13].

## Limitations and open problems

- **Regulatory whiplash.** The U.S. Fifth Circuit ruling that immutable smart contracts are not "property" [^s02], and the March 2025 OFAC delisting [^s03], do not extend to non-immutable mixers and do not bind future administrations or other agencies. EU AML Regulation 2024/1624 — adopted May 2024, in force July 1, 2027 — bans anonymous crypto accounts and anonymity-enhancing coins, and tasks the Commission with reporting on whether to ban "high-risk" privacy wallets and mixers [^s18]. A privacy product shipped today may legally operate in one jurisdiction and not another by 2027.
- **Anonymity-set fragility is a user-behavior problem, not a cryptography problem.** Even with valid SNARKs, address reuse, relayer mistakes and timing patterns can re-link 5–34% of withdrawals in Tornado-style systems [^s15]. Privacy products that rely on user discipline must assume some fraction of users will leak.
- **Production audit gaps.** No public third-party audit of Privacy Pools' on-chain contracts surfaced in this gather; Aztec Alpha is by its own framing an alpha. Treat newer constructions accordingly.
- **Adoption asymmetry.** Anonymous-credential primitives (Semaphore / World ID / Anon Aadhaar / ZK-Email / zkPassport) have shipped to materially larger user populations than shielded-payment systems (Aztec / Railgun / Privacy Pools); the "privacy on Ethereum" story in 2026 is *predicate-disclosure first, shielded-payment second*.
- **Folding schemes and recursive proof aggregation** are research-grade for Ethereum privacy products today; we expect 2027+ deployments but no production pointer exists in 2026 _(forward-looking)_.
- **Private cross-rollup bridging** has no production-grade answer in 2026; explicitly acknowledged as a gap in the recommendation.
- **Quantitative adoption series.** We did not assemble a single comparable adoption-volume timeseries across Aztec / Railgun / Privacy Pools / Tornado Cash / Nocturne (sunset). Per-project numbers are cited where available; cross-project comparison should be treated as qualitative.
