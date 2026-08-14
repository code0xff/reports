# Claims — Ethereum PoS and the Staking Protocol

## Background
- [ ] c01: Ethereum's beacon chain divides time into 12-second slots and
  32-slot epochs, and the mainnet config now expresses slot duration as
  `SLOT_DURATION_MS: 12000` rather than a seconds-denominated constant.
  - kind: technical
  - needs: consensus-specs config + phase0 preset
- [ ] c02: Mainnet has executed six consensus forks after genesis —
  Altair, Bellatrix, Capella, Deneb, Electra, Fulu — with Electra
  activating 2025-05-07 and Fulu 2025-12-03.
  - kind: factual
  - needs: configs/mainnet.yaml fork epochs with dated comments
- [ ] c03: Two further forks (Gloas, Heze) exist in the specification with
  fork versions assigned but no activation epoch set.
  - kind: technical
  - needs: configs/mainnet.yaml

## Consensus mechanics
- [ ] c04: Gasper is the composition of Casper FFG (finality) with
  LMD-GHOST (fork choice), and its authors prove safety, plausible
  liveness and probabilistic liveness.
  - kind: technical
  - needs: Gasper paper abstract
- [ ] c05: A checkpoint is justified when attestations representing at
  least two-thirds of total active balance target it, and the spec
  implements this as `target_balance * 3 >= total_active_balance * 2`.
  - kind: technical
  - needs: phase0 spec `weigh_justification_and_finalization`
- [ ] c06: The spec defines exactly two slashable offences for attesters —
  a double vote (two distinct attestations with the same target epoch) and
  a surround vote — and both are expressed in one predicate.
  - kind: technical
  - needs: phase0 spec `is_slashable_attestation_data`
- [ ] c07: Finalisation follows four distinct rules over the justification
  bitfield rather than a single condition.
  - kind: technical
  - needs: phase0 spec
- [ ] c08: When finality stalls beyond `MIN_EPOCHS_TO_INACTIVITY_PENALTY`
  (4 epochs), the chain enters an inactivity leak.
  - kind: technical
  - needs: phase0 spec + preset

## Staking protocol
- [ ] c09: Becoming a validator requires a one-way ETH transfer to a
  deposit contract at 0x00000000219ab540356cBB839Cbe05303d7705Fa, and the
  consensus layer verifies a Merkle proof against that contract's tree.
  - kind: technical
  - needs: configs/mainnet.yaml + phase0 spec
- [ ] c10: Withdrawal credentials come in three versioned prefixes — 0x00
  (BLS), 0x01 (execution address), 0x02 (compounding) — with 0x01
  introduced in Capella and 0x02 in Electra.
  - kind: technical
  - needs: capella + electra specs
- [ ] c11: `MIN_ACTIVATION_BALANCE` remains 32 ETH while
  `MAX_EFFECTIVE_BALANCE_ELECTRA` is 2048 ETH, and which ceiling applies
  depends on whether the validator has compounding credentials.
  - kind: technical
  - needs: electra preset + `get_max_effective_balance`
- [ ] c12: Electra replaced validator-count-based churn with
  balance-based churn, so the queue is now denominated in ETH per epoch.
  - kind: technical
  - needs: configs/mainnet.yaml + electra `get_balance_churn_limit`
- [ ] c13: EIP-7002 exists because in delegated staking the party holding
  the withdrawal credentials could not previously force an exit, which the
  EIP itself frames as the owner of the funds being unable to exit.
  - kind: technical
  - needs: EIP-7002 motivation text
- [ ] c14: EIP-7251's stated motivation is validator-set size — it cites
  over 830,000 validators as of October 2023 and the resulting P2P and
  aggregation overhead.
  - kind: factual
  - needs: EIP-7251 motivation text

## Incentives
- [ ] c15: The initial slashing penalty is proportional to effective
  balance divided by a quotient, and Electra raised that quotient to 4096,
  making the immediate penalty far smaller than under Altair's 64.
  - kind: technical
  - needs: presets (phase0/altair/electra) + electra `slash_validator`
- [ ] c16: A slashed validator's withdrawable epoch is pushed out by
  `EPOCHS_PER_SLASHINGS_VECTOR` (8192 epochs), and its effective balance
  is recorded in a slashings vector used for a later correlated penalty.
  - kind: technical
  - needs: electra/phase0 `slash_validator`
- [ ] c17: Being offline and being slashed are different failure classes
  with different magnitudes, not two points on one scale.
  - kind: interpretive
  - needs: spec penalty structure + ethereum.org risk framing

## Ecosystem
- [ ] c18: Ethereum.org presents four staking routes and explicitly ranks
  centralised exchanges as the least impactful, describing them as a
  centralised point of failure.
  - kind: factual
  - needs: ethereum.org staking page
- [ ] c19: Roughly 39 million ETH — about a third of supply — is staked,
  and the largest single liquid-staking protocol holds roughly 23% of it.
  - kind: factual
  - needs: at least two independent statistics sources
- [ ] c20: In 2026 Lido began migrating hundreds of thousands of legacy
  0x01 validators to compounding credentials, which is projected to cut
  the network validator count by roughly a third.
  - kind: factual
  - needs: reporting on Lido Curated Module v2
