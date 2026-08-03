# Gaps — Lean Ethereum

Iteration 4 (2026-08-03, post-critique). 34 sources collected.

## Opened and closed by the critique pass

Two counter-evidence gaps were found by the Phase 6 adversarial sweep and closed in the same pass:

1. **Named contemporaneous dissent on the CL rewrite was unrepresented.** The bundling objection was sourced only to a pattern catalogue [s21] and a secondary analysis [s26], when in fact it was voiced at the Beam Chain announcement by Péter Szilágyi, alongside opposite-direction criticism from Martin Köppelmann, Bowen Li, and José Maria Macedo [s33]. Added to §6.4 of both drafts. **Closed.**
2. **The lattice-based alternative was entirely absent.** The draft treated hash-based signatures as the only post-quantum option; NIST-standardised Falcon (666 B) and ML-DSA (2,420 B) are materially smaller than `leanSig` (~2.5–3 kB) [s34][s16]. New §6.2 states the alternative and the three reasons the programme chose hash-based anyway. **Closed.**

Also corrected: BLS signature size was stated as 48 bytes (it is the public key that is 48 bytes; the G2 signature is 96 bytes) [s32]; the roadmap's "39% of target" verification figure had been misread as "39% ahead of target"; [s12] was demoted to `access_limited` because its quote came from a search summary rather than a fetched page.

## Resolved after iteration 3

- c01–c03, c05–c12, c14–c22, c24, c25 all have sourcing at or above the §2.3 threshold.
- The term's origin is settled: Justin Drake, EF blog, 2025-07-31 [s01]; press attributing "Lean Ethereum" to Buterin in July 2026 [s26][s27] is describing his roadmap presentation and *The Extremely Lean Chain* [s09], not the coinage.
- Concrete signature/aggregation numbers obtained from a primary repo [s13] and an independent technical write-up [s16].

## Conflicts to represent in the draft (not to resolve silently)

1. **L2 throughput target.** EF primary text says "1 teragas/sec on L2" [s01]. Independent readings differ: OAK reads it as ~1 GB/s ≈ 10M TPS [s26]; The Block's 2025 report and Crypto Briefing's 2026 report state 1 million TPS [s20]. Draft must give the primary figure and note press divergence.
2. **Which fast-finality protocol lean consensus will actually use.** `leanroadmap.org` foregrounds 3SF [s02] and the 3SF paper is the academic anchor [s04]; the 2026 plan lists Live-Simplex / Live-Minimmit / ARFG as *candidates* still being chosen; the deployed devnets use LMD-GHOST + 3SF-mini [s29] and devnet 6 targets Goldfish + RLMD-GHOST + a trailing finality gadget [s28]. OAK states ~8s finality "via Minimmit" [s26] — this is ahead of any primary confirmation. The Minimmit paper itself never mentions Ethereum or lean consensus [s25].
3. **Devnet state vs. roadmap plan.** `leanroadmap.org` as fetched lists pq-devnet-4 as a March 2026 target and pq-devnet-5 as merely planned [s02], but a client team reports devnet 5 implemented with interop running by 16 June 2026 [s28]. The roadmap snapshot is behind the client-side reality.
4. **Fault-tolerance threshold.** OAK reports a drop from ~33% to 17% [s26]; the Minimmit paper's own bound is n ≥ 5f+1, i.e. f < 20% [s25]. These are close but not identical, and the 17% figure has no primary source.
5. **Poseidon2's status.** OAK claims recent cryptanalyses "prompted a shift" away from depending on Poseidon2 [s26]. No primary source confirms a decision to move off Poseidon2; leanSpec still ships Poseidon subspecs [s05] and the 2026 plan still names Poseidon2 [s08]. Present as an unconfirmed single-source reading.

## Remaining gaps — carried into Limitations

- **The seven strawmap forks are not individually named in any source available here.** Glamsterdam and Hegotá are named [s26][s27][s31]; beyond that only letter placeholders (I\*, L\*, and ethereum.org's "milestones I, J, L, M") appear [s17][s26]. The strawmap document itself was not publicly retrievable.
- **No primary Lean Data specification.** The pillar is described in one sentence in the EF post [s01] and elaborated only by secondary analysis [s26]. There is no `leanData` repository or spec equivalent to leanSpec/leanSig/leanVM in the evidence collected.
- **No EF-authored Lean Execution design document.** The ethresear.ch post under that title is community-authored [s11]; `leanISA` is named only in press [s27]. RISC-V remains "possibly" in the primary text [s01].
- **leanSig's exact production parameters are unsettled.** The repo is explicitly unaudited and not for production [s06]; leanVM states NIST Level 1 security "remains in progress" and may require larger digests or a different prime [s13]. Published byte sizes (~2.5–3 kB) come from a third-party write-up [s16], not a primary parameter table.
- **Formal-verification progress is only percentage-reported.** `leanroadmap.org` gives a 40% figure for the FRI/STIR/WHIR Lean 4 effort [s02]; no verified-theorem artefact was located.
- **No independent quantitative audit of the aggregation benchmarks.** All aggregation figures trace to project-hosted benchmarks [s02][s13] or a write-up derived from them [s16].
- **The EF budget-cut figure (40%, 54 positions) rests on a single secondary source [s26].**

Iteration ceiling: 3 of 6 used. The remaining gaps are structural (unpublished strawmap, unwritten specs) rather than searchable, so further iterations would not close them; they move to Limitations per Phase 4.
