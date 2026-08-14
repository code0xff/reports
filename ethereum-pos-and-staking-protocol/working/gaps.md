# Gaps — Ethereum PoS and the Staking Protocol

## Iteration 1 (2026-08-14)

### Closed
- All consensus mechanics from primary spec source. The consensus-specs
  repo is plain markdown/YAML on `master`, so constants and functions were
  quoted verbatim rather than paraphrased from explainers (s01–s07).
  Note: the default branch is `master`, not `dev`; `dev` 404s.
- Fork schedule with dated comments straight from the config (s04):
  Altair 2021-10-27 → Fulu 2025-12-03, plus Gloas/Heze unscheduled.
- Design rationale from the two canonical papers (s08, s09).
- The two Electra staking EIPs, both Final, with motivation text (s10, s11).
- Staking-route taxonomy and stated risks from ethereum.org (s12).
- Current distribution and the 2026 consolidation wave (s13, s14).

### Remaining gaps (accepted → Limitations)
1. **Deposit contract source not read.** The address is confirmed from the
   config (s04) and the consensus-side verification is in the spec (s01),
   but the Solidity/Vyper source of the contract itself was not retrieved.
   Claims about the contract are therefore about its *interface and
   consensus-side treatment*, not its implementation.
2. **Casper FFG paper body not read.** Only the abstract was retrievable
   (s09). The slashing conditions and accountable-safety argument are
   therefore cited from the **implemented spec** (s01), which is the more
   load-bearing artefact anyway, with the paper cited only for the concept.
3. **Reward arithmetic not derived end to end.** Base reward, per-component
   attestation weights and the exact proposer share were not extracted
   function by function. The report describes the reward *structure* and
   the constants (s02, s07) but does not compute an APR.
4. **Staking statistics rest on tier-4 sources.** The ~39M ETH staked,
   ~23% Lido share and the 880k→628k validator projection come from
   industry trackers and reporting (s13, s14), not from a chain-derived
   primary such as beaconcha.in or a Dune query. Figures are attributed
   in-line and treated as approximate.
5. **Fulu (Fusaka) contents not analysed.** The fork is confirmed as
   activated 2025-12-03 (s04) but its specification changes were not read;
   the report does not characterise what Fusaka changed.
6. **Gloas/Heze contents not analysed.** Fork versions exist with no
   activation epoch; the report says only that, and does not speculate.
7. **No independent critique of PoS security.** Literature on attacks
   (e.g. reorg/balancing attacks against LMD-GHOST) was not gathered.
   The report does not claim Gasper is attack-free; it reports the proven
   properties as stated by the authors (s08).

### Source conflicts
- None material. The validator-count figures (s13's implied ~880k vs s14's
  explicit 880k→628k projection) are consistent.

**Verdict: gaps 1–7 all carried to Limitations. Proceed to draft.**

## Iteration 2 (2026-08-14) — critique pass

### Closed (three spec errors found by verification)
8. **Correlation-penalty timing was wrong.** `process_slashings` fires at
   `EPOCHS_PER_SLASHINGS_VECTOR // 2` (~18.2 days), not at the end of the
   ~36.4-day window. Corrected with the code quoted.
9. **Bellatrix preset had not been fetched.** It sets
   `MIN_SLASHING_PENALTY_QUOTIENT_BELLATRIX: 32`, so the pre-Electra
   immediate penalty on a 32 ETH validator was 1 ETH, not the 0.5 ETH the
   draft computed from Altair's 64. Source s15 added.
10. **Wrong slashing multiplier cited.** Electra's `process_slashings` uses
    `PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX` (= 3), not the phase0 (1)
    or Altair (2) constants the draft cited. Corrected.

Root cause for all three: the first sweep fetched phase0, altair, capella
and electra presets but skipped bellatrix, and read `slash_validator`
without reading `process_slashings`. Lesson recorded — for fork-layered
specs, fetch every preset in the chain, not only the endpoints.

### Still open (accepted → Limitations)
Gaps 1–7 unchanged: deposit contract source, Casper FFG body, reward
arithmetic, tier-4 statistics, Fulu contents, Gloas/Heze contents, PoS
attack literature.

**Verdict: must-fix 0. Publishable.**
