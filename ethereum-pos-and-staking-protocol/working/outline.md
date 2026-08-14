# Outline — Ethereum Proof of Stake and the Staking Protocol

Primary: English. Alternate: Korean.

Method: read the consensus-specs source directly (raw markdown + YAML presets
from the `master` branch) rather than secondary explainers, so every constant
and rule is quoted from the artefact that clients actually implement. Layer
the academic papers (Casper FFG, Gasper) for the design rationale and the
EIPs for why things changed.

## 1. Abstract  (written last)

## 2. Introduction
- What "proof of stake" had to replace and what it had to add (finality,
  accountable safety) that PoW never had.
- Scope: consensus mechanics + the staking protocol proper (deposit
  contract, validator lifecycle, incentives). Execution-layer topics
  (MEV, PBS, blobs) touched only where they bear on staking.
- Method note: specs-first.

## 3. Background — the shape of the system
- Beacon chain, slots and epochs, committees, the validator as a unit.
- Fork schedule from genesis to the present, with dates from the config.
- Why the design is two protocols in one: a fork-choice rule and a
  finality gadget.

## 4. Consensus mechanics — Gasper
- LMD-GHOST as fork choice; Casper FFG as finality gadget.
- Attestations: source, target, head.
- Justification and finalisation: the 2/3 balance supermajority and the
  four finalisation rules, quoted from the spec.
- The two slashing conditions (double vote, surround vote) — why exactly
  two, and what "accountable safety" buys.
- Inactivity leak: what happens when finality stalls.

## 5. The staking protocol — deposit contract and validator lifecycle
- The one-way deposit contract and its Merkle tree.
- Withdrawal credentials 0x00 / 0x01 / 0x02 and what each enables.
- Activation queue, churn (and its Electra redefinition from validator
  count to balance), exit, withdrawability delay.
- Withdrawals: partial vs full, the sweep.
- EIP-7002: who is allowed to exit a validator, and why that is a trust
  question rather than a plumbing question.

## 6. Incentives — rewards, penalties, slashing
- Base reward, effective balance, hysteresis.
- Attestation rewards by component; proposer and sync-committee rewards.
- Penalties vs slashing: the distinction that matters.
- The correlation penalty and why slashing is designed to punish
  coordinated failure far more than isolated failure.
- How Electra changed slashing severity, and what that implies.

## 7. The staking ecosystem and its concentration
- Four ways to stake and the trust each one buys.
- Current distribution: total staked, validator count, largest operator.
- MaxEB in practice: the 2026 consolidation wave.
- The centralisation question stated precisely rather than rhetorically.

## 8. Limitations

## References  (renderer-generated)
