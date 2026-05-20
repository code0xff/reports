# Simplex and Alpenglow — A Technical Deep Dive into the Next-Generation BFT Consensus and Solana's New Consensus Algorithm

## Abstract

This report unpacks two consensus protocols that sit in the same partially-synchronous BFT family yet end up in different places — **Simplex** (Chan & Pass, 2023)[^s01][^s02][^s03] and **Alpenglow** (Kniep, Sliwinski, and Wattenhofer, 2025)[^s04][^s05][^s14]. Simplex is the academic-side standardisation effort: collapse view-change into immediate iteration rotation, leave only `notarize` and `finalize` votes, and the protocol advertises worst-case 400 ms finality at 80 ms message delay under one-third faulty leaders[^s01]. It is already adopted in Commonware, Tempo, Solana Alpenglow, and Ava Labs[^s01]. Alpenglow is the production side: Anza's replacement for Solana's TowerBFT + Proof-of-History, defined by SIMD-0326 (passed governance on 2 September 2025 with 98.27% in favour[^s11], activated on a community test cluster on 11 May 2026[^s12]). It introduces two components — **Votor** for voting and finalisation, **Rotor** for block dissemination — and targets ~150 ms median finality with an explicit "20 + 20" fault model[^s04][^s05]. This report reads the SIMD-0326 spec, the Anza blog, the simplex.blog landing page, and independent technical analyses (Helius, Alchemy, Sei, 1inch) to trace (a) the distance between an academic standard and its production fork, (b) the 80% fast / 60% slow dual-path design, (c) the BLS12-381-aggregated vote-data compression, and (d) the trade-off in moving from a 33% Byzantine bound to a 20% bound with an extra 20% crash slack.

## 1. Introduction — Why both at once

Academic standards and production consensus often arrive at the same abstraction at different times. Simplex is the TCC 2023 culmination of a long line of academic simplification[^s02][^s03]; Alpenglow is Anza's 19 May 2025 announcement of a production replacement for Solana's 12.8-second TowerBFT finality[^s04][^s10][^s18]. The two sit in the same partially-synchronous family but pick different trade-offs — Simplex chasing simplicity and a general standard slot[^s01]; Alpenglow chasing 100–150 ms finality for the world's busiest L1 _(interpretive)_[^s04][^s05][^s17].

These tracks are not independent. simplex.blog states plainly: "Solana's next-generation consensus (Votor) is based on Simplex with large modifications to support fast-path consensus"[^s01]. Alpenglow's Votor is therefore a direct descendant of Simplex. This report puts the two side by side and follows how the academic spec transforms into the production spec.

## 2. Background — The foundations beneath both

### 2.1 BFT partial synchrony and `f < n/3`

The partial-synchrony model has been the default substrate for BFT-SMR since PBFT — "unknown global stabilization time after which all messages are delivered within a known bound Δ" and `f < n/3` Byzantine tolerance[^s02]. Both Simplex and Alpenglow live inside this model.

### 2.2 PBFT → HotStuff → Tendermint → Simplex

Earlier standard BFT designs accumulated machinery — view-change subroutines, multi-phase voting (prepare / precommit / commit) — to handle leader failures. Simplex makes a different bet: "move to the next view upon receiving a cert in this view," collapsing the view-change into a single rotation, and reach worst-case 400 ms confirmation under one-third faulty leaders[^s01].

### 2.3 TowerBFT + Proof-of-History — the problem Alpenglow targets

SIMD-0326 names three failings of Solana's existing consensus: "(1) consensus finality time of 12.8 seconds … (2) does not have a security proof, which is concerning … (3) bandwidth use, e.g., by … costly gossip traffic"[^s05]. Alpenglow's motivation is summarised in one line — "Lowers actual consensus finality latency below the pre-confirmation latency of TowerBFT"[^s05].

## 3. Simplex — Reading the academic spec

### 3.1 Paper identity

Simplex is the work of Benjamin Y. Chan and Rafael Pass — IACR ePrint 2023/463[^s02], TCC 2023[^s03]. The abstract compresses the contribution: "a new and simple consensus protocol in the partially synchronous setting, tolerating f < n/3 byzantine faults, which is essentially as simple to describe as the simplest known protocols, but it also enjoys an even simpler security proof, while matching and even improving the efficiency of the state-of-the-art"[^s02]. simplex.blog's one-liner: "Simplex is a consensus protocol that is faster than the state-of-the-art (on paper), yet easier to understand"[^s01].

### 3.2 Iteration structure and leader rotation

Simplex progresses by iteration `h`. The leader of iteration `h` is deterministic — `Lₕ = H*(h) mod n` — and every node moves to the next iteration immediately on receiving a certificate; there is no separate view-change subprotocol. The sister report [`commonware-simplex-consensus`](../commonware-simplex-consensus/) traces the iteration rules in line-by-line detail.

### 3.3 Two votes (`notarize` + `finalize`) and dummy-block skip

Simplex's safety rests on two vote types and a dummy-block skip pattern. If an iteration cannot reach consensus, the node casts a vote for a dummy block, which both skips the slot and serves as proof that "no decision occurred in the previous view"[^s01]. That collapse is what lets the paper claim an "even simpler security proof"[^s02].

### 3.4 Published benchmarks

simplex.blog publishes a worst-case table (80 ms message delay, one-third faulty leaders)[^s01]:

| Protocol | Worst-case finality |
|---|---|
| **Simplex** | 400 ms |
| Algorand Agreement | 480 ms |
| Tendermint (chained) | 1,840 ms |
| HotStuff | 2,480 ms |

This is an author-published table — this report records that fact in `uncertainties.md`.

### 3.5 Adoption

simplex.blog names four active implementations: **Commonware, Tempo, Solana Alpenglow, Ava Labs**[^s01]. The Rust Commonware implementation (the `simplex` module of the `commonware-consensus` crate) is reviewed at code level in the sister report [`commonware-simplex-consensus`](../commonware-simplex-consensus/).

## 4. Alpenglow — Solana's new consensus

### 4.1 Authors, announcement, governance

Alpenglow's authors are **Quentin Kniep, Kobi Sliwinski, and Roger Wattenhofer**[^s04][^s14]. Wattenhofer leads the Disco distributed-systems group at ETH Zurich; Kniep and Sliwinski are his former PhD students. Anza announced Alpenglow on 19 May 2025[^s04][^s10][^s18]. SIMD-0326's governance vote closed on 2 September 2025 with 98.27% in favour, 1.05% opposed, 0.69% abstaining, and roughly 52% of staked tokens participating[^s11]. On 11 May 2026 Anza activated Alpenglow on a community-validator test cluster[^s12].

### 4.2 Votor — fast (80%) / slow (60%) dual path

Votor replaces TowerBFT as the voting and finalisation component. Two paths run in parallel.

- **Fast path (80%)** — "If the proposed block receives ≥80% of stake approval in the first voting round, the block is immediately finalized and a Fast-Finalization Certificate is produced"[^s06]. SIMD-0326 specifies that ≥80% NOTARIZE votes in Round 1 yield a fast-finalization certificate[^s05].
- **Slow path (60%)** — when first-round support sits between 60% and 80%, a second round begins. "ALPENGLOW … slow path runs a second round if 60–80% approve in round one, and if 60%+ approve again, the block is confirmed at approximately 150 milliseconds"[^s06]. SIMD-0326's wording: a "slow-finalization certificate and a notarization certificate" must arrive together[^s05].

The two paths run **in parallel; whichever finalises first wins** — 1inch summarises: "Votor can finalize a block in a single round if at least 80% of the total stake participates"[^s09]. Anza's headline: "Alpenglow will shatter both these latency bounds. We expect that Alpenglow can achieve actual finality in about 150 ms (median)"[^s04].

### 4.3 Five certificate types

SIMD-0326 tracks consensus state with five distinct certificates[^s05]:

| Certificate | Threshold | Role |
|---|---|---|
| Notarization | 60% | standard Round-1 pass |
| Skip | 60% | skip the slot |
| Finalization | 60% | Round-2 confirmation |
| Fast-Finalization | 80% | immediate Round-1 confirmation |
| Notar-Fallback | 60% | Round-1 fallback |

The finalisation rule is compressed into two cases: "Create or receive a fast-finalization certificate" or "Create or receive a slow-finalization certificate and a notarization certificate"[^s05]. Indirect finalisation: "Whenever a block b in slot s is finalized directly, all previous slots that were undecided are decided indirectly"[^s05].

### 4.4 Rotor — single relay + single erasure-coded shred

Rotor replaces Solana's existing **Turbine** data-dissemination protocol. Turbine used a multi-layer relay tree and sent separate data and recovery shreds. Rotor flattens the tree to a single relay layer and merges the shreds — "Rotor transmits only a single erasure-coded version of each shred, eliminating the need to send separate data and recovery shreds as Turbine does"[^s06]. 1inch describes the same flow more abstractly: "Rotor distributes block data using erasure coding — a technique that divides information into fragments and shares them among validators"[^s09]. Bandwidth is allocated stake-weighted so larger validators carry proportionally more[^s09]. Alchemy reports that 1,500 shreds take ~18 ms over a 1 Gb/s link[^s07] _(unverified — single source)_.

### 4.5 BLS12-381 aggregation and vote-data compression

Vote messages are aggregated using BLS12-381 signatures. SIMD-0326 states "the desired security level of 128-bits is achieved" with SHA-256 + BLS12-381[^s05]. Alchemy quantifies the effect: "Validators exchange votes as lightweight UDP messages using BLS signature aggregation, with only the aggregated certificate (~1,000 bytes) recorded on-chain—replacing ~500KB of current vote data"[^s07]. So roughly 500 KB of per-slot vote traffic collapses into a single ~1 KB certificate header — the concrete instantiation of SIMD-0326's "decreases bandwidth use, e.g., by eliminating costly gossip traffic"[^s05].

### 4.6 The 20+20 security model

Alpenglow trades the classic 33% Byzantine bound for a **20+20** model. SIMD-0326's framing: "a distinctive 20+20 security model" with "40% crash failure resilience" trading off 33% Byzantine security[^s05]. Anza's framing: "The distinctive '20+20' resilience allows the protocol to operate effectively even under harsh network conditions, tolerating up to 20% adversarial stake and an additional 20% non-responsive stake"[^s04].

The Byzantine bound therefore drops to 20%, but a separate 20% crash budget yields a 40% combined fault tolerance. On a single Byzantine axis this is tighter than 33%; on the combined axis it is looser than 33%. That trade-off is the most visible design decision in Alpenglow.

### 4.7 Validator economics and the VAT

SIMD-0326 caps the validator set: "only admits the 2,000 highest staked validators"[^s05]. Each validator must burn a Validator Admission Ticket (VAT) — "initially about 0.8 SOL per day"[^s05]. In return, vote-transaction fees disappear — formerly about 1 SOL/day per validator[^s07]. Alchemy estimates the minimum-profitable stake falls from ~4,850 SOL to ~450 SOL and that overall operating cost drops 20–50%[^s07].

### 4.8 Timeline

- **2025-05-19** — Anza announces Alpenglow[^s04][^s10][^s18].
- **2025-09-02** — SIMD-0326 governance vote closes, 98.27% in favour[^s11].
- **2026-05-11** — Anza activates Alpenglow on a community-validator test cluster[^s12].
- **Late 2026** — target mainnet rollout per Anza's announced schedule[^s12]. (Governance discussion is hosted on the Solana Developer Forums[^s13]; Wattenhofer's own X post pointed to the v1.1 white paper and the public presentation slides[^s19].)

## 5. Code-level analysis — From spec to code

### 5.1 The five-certificate definitions (SIMD-0326)

The thresholds are captured by SIMD-0326 as[^s05]:

```text
Notarization     := { stake-weighted sum of NOTARIZE votes ≥ 60% }
Skip             := { stake-weighted sum of SKIP votes      ≥ 60% }
Finalization     := { stake-weighted sum of FINALIZE votes  ≥ 60% }
Fast-Finalization:= { stake-weighted sum of NOTARIZE votes  ≥ 80% }
Notar-Fallback   := { stake-weighted sum of NOTAR-FALLBACK votes ≥ 60% }
```

Each certificate is a single BLS12-381-aggregated object of roughly 1 KB[^s05][^s07].

### 5.2 Fast / slow path pseudocode

The finalisation rules of SIMD-0326 reduce to[^s05][^s06]:

```text
on each slot s, in parallel:
    fast_path:
        if NOTARIZE votes for block b ≥ 80% of stake within Round 1 timeout:
            emit FastFinalizationCertificate(b)
            finalize(b)  // ~100ms
    slow_path:
        if NOTARIZE votes for b ∈ [60%, 80%) within Round 1:
            broadcast(FINALIZE_or_FALLBACK vote)
            if FINALIZE votes for b ≥ 60% within Round 2 timeout:
                if NotarizationCertificate(b) exists:
                    emit FinalizationCertificate(b)
                    finalize(b)  // ~150ms
        else if SKIP votes ≥ 60%:
            skip(s)
```

When a block finalises, the **indirect-finalisation** rule applies — every undecided earlier slot finalises along with it[^s05].

### 5.3 Mapping to Commonware Simplex

Commonware's Rust Simplex implementation (the `simplex` module of the `commonware-consensus` crate) rewires the academic protocol into actors (Batcher / Voter / Resolver / Application); the sister report [`commonware-simplex-consensus`](../commonware-simplex-consensus/) documents that mapping. Alpenglow's Votor sits on top of the same abstraction with production-side modifications — fast-path 80%, five-certificate split, BLS aggregation, the 20+20 model[^s01].

### 5.4 The Rotor erasure-coding flow

Rotor's data flow per slot (summarised from SIMD-0326 + Alchemy / Helius)[^s05][^s06][^s07]:

```text
on block proposal at slot s:
    1. proposer encodes block into N erasure-coded shreds
    2. proposer broadcasts shreds to a stake-weighted relay set R
    3. each relay r ∈ R forwards its shreds to ALL validators
    4. validators decode the block once they have (k of N) shreds
```

The single relay layer (R) replaces Turbine's multi-layer tree, and the measurement on a 1 Gb/s link is "1,500 shreds takes approximately 18 milliseconds"[^s07] _(unverified — single source)_.

## 6. Comparison — Simplex vs Alpenglow vs TowerBFT

| Axis | Simplex | Alpenglow | TowerBFT (existing) |
|---|---|---|---|
| Fault model | `f < n/3` Byzantine (partial synchrony)[^s02] | 20% Byzantine + 20% crash (20+20)[^s04][^s05] | 33% Byzantine + Proof-of-History[^s05] |
| Voting | notarize + finalize, two votes[^s01] | 80% fast / 60% slow dual-path with five certificates[^s05] | Multi-stage stake-based TowerBFT[^s05] |
| Worst-case finality | 400 ms at 80 ms message delay[^s01] | 100–150 ms median[^s04][^s17] | 12.8 s[^s05] |
| Data dissemination | Implementation-dependent | Rotor: single relay + single erasure shred[^s06] | Turbine: multi-layer relay tree[^s06] |
| Signatures / aggregation | Implementation-dependent (e.g. BLS12-381 threshold) | BLS12-381 aggregation, 128-bit security[^s05] | Ed25519 per vote[^s05] |
| Governance | Academic (Chan & Pass, TCC 2023)[^s02][^s03] | Anza + SIMD-0326 (98.27% approval)[^s11] | Solana Labs / Anza operated |
| Adoption | Commonware / Tempo / Ava Labs / Solana Votor[^s01] | Activated on test cluster 2026-05-11[^s12] | Solana mainnet today |
| Security proof | Simplified safety + liveness proof[^s02] | Whitepaper provides safety + liveness proofs[^s05] | None published[^s05] |

Sei summarises the trade-off: "Alpenglow performs better than traditional BFT when dealing with mixed failure scenarios … but offers weaker protection against purely adversarial attacks"[^s08]. The 33%-vs-(20%/40%) trade-off is the central design call _(interpretive)_.

## 7. Discussion

### 7.1 What it means to drop the Byzantine bound to 20%

Alpenglow's 20% Byzantine threshold is materially tighter than 33% on a single-axis adversarial scenario[^s08]. SIMD-0326 acknowledges this directly: in exchange the protocol gets fast finality and operational simplifications[^s05]. Sei's phrasing: "While this provides a combined 40% fault tolerance that exceeds traditional BFT systems' 33% limit, the trade-offs are nuanced"[^s08].

### 7.2 The 2,000-validator cap and geographic asymmetry

SIMD-0326's 2,000-validator cap[^s05] is a deliberate decision to bound BLS aggregation cost and to make vote-data compression predictable, but Sei raises an additional concern: "Geographic performance variations mean validators in remote locations may struggle to participate in fast-path consensus"[^s08]. Validators in low-RTT regions are likelier to land in the fast-path 80% quorum, which creates new decentralisation pressure _(interpretive)_[^s08].

### 7.3 VAT economics and operating cost

The economics move in two directions at once: vote fees vanish (savings) while a VAT must be burned (cost). Alchemy projects the minimum-profitable stake falls from ~4,850 SOL to ~450 SOL, and overall operating cost drops 20–50%[^s07]. The direction widens validator diversity, but whether 0.8 SOL/day per validator burnt indefinitely is sustainable is a question for further work _(interpretive)_.

### 7.4 The Simplex–Alpenglow relationship

simplex.blog spells the relationship out: "Solana's next-generation consensus (Votor) is based on Simplex with large modifications to support fast-path consensus"[^s01]. Alpenglow sits in the Simplex family but adopts (a) fast-path 80%, (b) five separated certificates, (c) BLS aggregation, (d) the 20+20 model on top. The span between (a)–(d) is the distance between an academic standard and a production fork _(interpretive)_.

## 8. Limitations

- **The Alpenglow whitepaper v1.1 PDF**[^s14] returned only header-level content under scripted fetch; theorem statements are not quoted here. Quantitative claims rest on SIMD-0326[^s05], the Anza blog[^s04], and independent technical analyses (Helius / Alchemy / Sei / 1inch).
- **Wattenhofer's presentation slides**[^s15] are cited by URL only; the slides themselves were not extracted.
- **The Simplex paper PDF on IACR ePrint**[^s02] returned 403 on scripted fetch. Algorithmic quotes are cross-referenced via simplex.blog[^s01], the Cornell talk slides[^s16], and the sister report `commonware-simplex-consensus`.
- **Votor's production source code** is not yet in a public repository at the time of writing; code-level claims rest on the SIMD-0326 specification[^s05] and external analyses[^s06][^s07].
- **The simplex.blog benchmark table**[^s01] is published by the Simplex authors; independent measurements are out of scope.
- **Mainnet activation timing** has shifted across coverage; this report treats the 11 May 2026 test-cluster activation[^s12] as the most recent confirmed milestone and does not assert a specific mainnet date beyond it.
