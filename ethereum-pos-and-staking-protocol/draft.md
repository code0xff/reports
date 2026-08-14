# Ethereum Proof of Stake and the Staking Protocol

## Abstract

Ethereum's proof of stake is two protocols wearing one name. There is a consensus protocol — Gasper, the composition of the LMD-GHOST fork-choice rule with the Casper FFG finality gadget[^s08] — and there is a *staking protocol*: a deposit contract, a validator lifecycle, a queue, a withdrawal system and an incentive schedule. Most explanations cover the first and gesture at the second. This report reads both out of the consensus specification itself, quoting the constants and functions that clients actually implement rather than paraphrasing secondary accounts.

Four things stand out from that reading. First, **finality is cheaper to describe than it looks**: a checkpoint is justified when attestations representing two-thirds of active balance target it, expressed in the spec as `target_balance * 3 >= total_active_balance * 2`, and finalisation is not one rule but four distinct patterns over a justification bitfield[^s01]. Second, **the entire attester slashing surface is two conditions** — a double vote and a surround vote — written in a single predicate[^s01]. That economy is the point: accountable safety requires that misbehaviour be *attributable*, and two conditions are enough to make equivocation provable.

Third, **the staking protocol changed shape more than the consensus protocol did**. Capella introduced 0x01 execution-address withdrawal credentials[^s06]; Electra added 0x02 compounding credentials and raised the effective-balance ceiling from 32 ETH to 2048 ETH while keeping the 32 ETH activation minimum[^s03][^s05]. Electra also redenominated the activation/exit queue from validator *count* to *balance*[^s04][^s05], which is the sort of change that sounds like bookkeeping and is actually a redesign of how capital enters and leaves the validator set. And EIP-7002 answered a question that was never about plumbing: in a delegated arrangement the party holding the withdrawal credentials — the actual owner of the funds — previously "cannot independently choose to exit and begin the withdrawal process"[^s11].

Fourth, **the spec is now visibly shaped by the staking industry rather than only by solo stakers**. EIP-7251's stated motivation is that there were "over 830,000 validators" by October 2023 and that large operators were running thousands of validators for a single pool of stake, paying P2P and aggregation costs for the privilege[^s10]. In 2026 that theory met practice: Lido began migrating over 265,000 legacy 0x01 validators to compounding credentials, a change projected to cut the network validator count by roughly a third _(unverified — industry reporting)_[^s14]. Roughly 39 million ETH, about a third of supply, is staked, with the largest liquid-staking protocol holding around 23% of it _(unverified — industry reporting)_[^s13].

The report deliberately does not issue a verdict on centralisation. It sets out the arithmetic — the thresholds that matter are 1/3, 1/2 and 2/3 — and the mechanisms, and leaves the judgement to the reader.

## Introduction

Proof of work answered one question: which chain has the most accumulated work behind it? That answer is probabilistic and never final. You wait more confirmations and grow more confident, but nothing in the protocol ever declares a block irreversible, and nothing identifies who was responsible if a deep reorganisation occurs.

Proof of stake on Ethereum was built to answer a different question, and to answer it with names attached. Validators put capital at risk, sign messages, and — crucially — can be *proven* to have contradicted themselves. That property, accountable safety, is what makes economic finality possible: not merely "this block is old" but "reverting this block requires at least a third of staked capital to be provably destroyed."

This report covers two layers. The consensus mechanics (§4) are Gasper. The staking protocol (§5–6) is the machinery that decides who may validate, on what terms, how they leave, and what they earn or lose. Execution-layer topics — MEV, proposer-builder separation, blobs — appear only where they bear on staking.

A note on method. Everything structural here is quoted from `ethereum/consensus-specs` on the `master` branch, fetched as raw markdown and YAML. This matters because the specification is the artefact clients implement, and because explainers age badly: several widely-repeated constants have since changed. One immediate example — the slot duration is no longer a seconds-denominated constant in the mainnet config but `SLOT_DURATION_MS: 12000`[^s04].

## Background — the shape of the system

### Slots, epochs, committees

Time is divided into 12-second slots (`SLOT_DURATION_MS: 12000`[^s04]) and 32-slot epochs (`SLOTS_PER_EPOCH: 32`[^s02]) — so an epoch is 6.4 minutes. In each slot one validator is selected to propose a block, and the validator set is partitioned into committees to attest. The preset caps committees at 64 per slot with a target size of 128 validators and a hard maximum of 2048 per committee[^s02].

The committee structure is what makes the protocol scale to hundreds of thousands of validators: no validator votes on every slot, and votes are aggregated before they reach the chain.

### The fork schedule

The mainnet config records each fork's activation epoch with a dated comment, which makes it a reliable primary timeline[^s04]:

| Fork | Epoch | Activation |
|---|---|---|
| Altair | 74240 | 2021-10-27 |
| Bellatrix (The Merge) | 144896 | 2022-09-06 |
| Capella (withdrawals) | 194048 | 2023-04-12 |
| Deneb | 269568 | 2024-03-13 |
| Electra (Pectra) | 364032 | 2025-05-07 |
| Fulu (Fusaka) | 411392 | 2025-12-03 |
| Gloas | — | unscheduled |
| Heze | — | unscheduled |

Gloas and Heze have fork versions assigned (`0x07000000`, `0x08000000`) but their activation epochs are set to the maximum uint64 sentinel, meaning not scheduled[^s04].

The two forks that matter most for staking are Capella and Electra. Capella made staked ETH withdrawable at all. Electra rewrote how validators hold balance, how they queue, and who may exit them.

## Consensus mechanics — Gasper

### Two protocols, one chain

Gasper is described by its authors as "an idealized version of the proposed Ethereum 2.0 beacon chain" that "combines Casper FFG, a finality tool, with LMD GHOST, a fork-choice rule," for which they "prove safety, plausible liveness, and probabilistic liveness under different sets of assumptions"[^s08]. Casper itself was introduced earlier as "a proof of stake-based finality system which overlays an existing proof of work blockchain… a partial consensus mechanism"[^s09] — the overlay framing is historical, but the division of labour survived into the merged chain.

The division is worth stating plainly. **LMD-GHOST decides what to build on right now**; it is the liveness half, always producing an answer. **Casper FFG decides what can never be reverted**; it is the safety half, and it deliberately lags. A block is proposed, attested, eventually justified, and eventually finalised — and only the last of those is irreversible in the economic sense.

### Attestations

Each attestation carries three votes: a *head* vote (LMD-GHOST input), and a *source* and *target* checkpoint pair (Casper FFG input). One message serves both protocols, which is why the attestation is the central object in the system and why the slashing rules are stated over `AttestationData`.

### Justification and finalisation

Justification is a supermajority condition on balance, not on validator count. The spec computes it directly:

```python
if previous_epoch_target_balance * 3 >= total_active_balance * 2:
    state.current_justified_checkpoint = Checkpoint(
        epoch=previous_epoch, root=get_block_root(state, previous_epoch)
    )
    state.justification_bits[1] = 0b1
```

with the same test applied to the current epoch[^s01]. Multiplying out rather than dividing avoids rounding — the condition is exactly two-thirds of total active balance.

Finalisation is where most summaries oversimplify. There is no single rule. The spec maintains a four-bit `justification_bits` field and applies four separate patterns[^s01]:

- bits 1–3 justified and the old previous justified checkpoint is 3 epochs back — finalise it (the 2nd using the 4th as source);
- bits 1–2 justified and it is 2 epochs back — finalise it;
- bits 0–2 justified and the old current justified checkpoint is 2 epochs back — finalise it;
- bits 0–1 justified and it is 1 epoch back — finalise it.

The last is the common case: two consecutive justified epochs finalise the earlier one. The others exist because justification can skip epochs under degraded participation, and the protocol should still finalise when the evidence permits. This is why "finality in two epochs" is the typical case rather than a guarantee.

### The two slashing conditions

The entire attester slashing surface fits in one predicate[^s01]:

```python
def is_slashable_attestation_data(data_1: AttestationData, data_2: AttestationData) -> bool:
    """
    Check if ``data_1`` and ``data_2`` are slashable according to Casper FFG rules.
    """
    return (
        # Double vote
        (data_1 != data_2 and data_1.target.epoch == data_2.target.epoch)
        or
        # Surround vote
        (data_1.source.epoch < data_2.source.epoch and data_2.target.epoch < data_1.target.epoch)
    )
```

A **double vote** is two different attestations for the same target epoch — voting twice in one election. A **surround vote** is an attestation whose source-target span strictly contains another's — retroactively contradicting an earlier commitment.

Two properties deserve emphasis. First, these conditions are *objective*: any observer with both messages can verify the violation without knowing network conditions, timing, or intent. That is what makes the safety accountable — a validator who equivocates leaves a portable proof. Second, they are *minimal*: no rule punishes being wrong, only contradicting yourself. Voting for a block that loses is free. This is deliberate, because a protocol that punished being on the wrong side of a fork would punish honest validators during network partitions.

### The inactivity leak

Safety and liveness trade off, and Gasper resolves the trade in favour of safety: if two-thirds cannot agree, nothing finalises, and the chain can stall indefinitely. The inactivity leak is the escape hatch. It triggers on a simple condition[^s01]:

```python
def is_in_inactivity_leak(state: BeaconState) -> bool:
    return get_finality_delay(state) > MIN_EPOCHS_TO_INACTIVITY_PENALTY
```

with `MIN_EPOCHS_TO_INACTIVITY_PENALTY: 4`[^s02]. Once finality has been delayed more than four epochs, validators failing to attest correctly begin to bleed balance. The leak drains non-participants until the participating set again constitutes two-thirds of the *remaining* active balance, at which point finality resumes.

The design intent is worth naming: the protocol does not try to keep everyone online. It ensures that a chain which loses a third or more of its validators eventually finalises again by shrinking the denominator — at the cost of those absent validators' stake. Altair retuned the severity, moving `INACTIVITY_PENALTY_QUOTIENT` from 2²⁶ to `INACTIVITY_PENALTY_QUOTIENT_ALTAIR: 50331648`[^s02][^s07].

## The staking protocol — deposit contract and validator lifecycle

### Entry is one-way

The spec is blunt about how one becomes a validator: it "is to make a one-way ETH transaction to a deposit contract"[^s01]. The mainnet deposit contract sits at `0x00000000219ab540356cBB839Cbe05303d7705Fa`[^s04]. Deposits accumulate in a Merkle tree, and the consensus layer accepts a deposit by verifying a Merkle proof against that tree — the spec carries `DepositProof` as a `Vector[Bytes32, DEPOSIT_CONTRACT_TREE_DEPTH + 1]`[^s01].

One detail matters for anyone building staking infrastructure: the consensus layer verifies "the deposit signature (proof of possession) which is not checked by the deposit contract"[^s01]. The contract accepts money it cannot fully validate; the beacon chain does the cryptographic checking afterwards. A malformed deposit can therefore be accepted on the execution side and rejected on the consensus side.

The minimum deposit is 1 ETH (`MIN_DEPOSIT_AMOUNT: 1000000000` Gwei) but the minimum to *activate* is 32 ETH[^s02][^s03].

### Withdrawal credentials: three prefixes, three eras

A validator's withdrawal credentials are 32 bytes whose first byte is a version prefix, and the history of that byte is the history of Ethereum staking.

**0x00 — BLS credentials.** The original form. Withdrawals were not implemented, so the credential merely committed to a BLS key.

**0x01 — execution address.** Capella introduced an "operation to change from `BLS_WITHDRAWAL_PREFIX` to `ETH1_ADDRESS_WITHDRAWAL_PREFIX` versioned withdrawal credentials to enable withdrawals"[^s06]. The credential now names an execution-layer address, and the protocol sweeps funds to it automatically.

**0x02 — compounding.** Electra added `COMPOUNDING_WITHDRAWAL_PREFIX` as `Bytes1('0x02')`[^s05]. This is the credential that unlocks the raised balance ceiling.

The ceiling is selected by credential type, not by choice[^s05]:

```python
def get_max_effective_balance(validator: Validator) -> Gwei:
    if has_compounding_withdrawal_credential(validator):
        return MAX_EFFECTIVE_BALANCE_ELECTRA
    else:
        return MIN_ACTIVATION_BALANCE
```

`MIN_ACTIVATION_BALANCE` is 32 ETH and `MAX_EFFECTIVE_BALANCE_ELECTRA` is 2048 ETH[^s03]. So a 0x01 validator is capped at 32 ETH of *effective* balance — anything above is swept out as a partial withdrawal — while a 0x02 validator accrues up to 2048 ETH and compounds.

### Why the ceiling was raised

EIP-7251's motivation is explicitly about validator-set size, not about staker convenience: "As of October 3, 2023, there are currently over 830,000 validators participating in the consensus layer"[^s10]. Large operators were forced to run thousands of validators for a single economic position, and every one of those validators generated P2P messages and signatures to aggregate. The EIP frames the benefit both ways — "large validators can consolidate to run fewer validators and thus fewer beacon nodes" while "small validators [benefit] from compounding rewards and the ability to stake in more flexible increments"[^s10].

Consolidation is a protocol operation, not a withdraw-and-redeposit cycle: it "permits multiple validator indices to be combined through the protocol" without passing through the exit and activation queues, rate-limited by a fee mechanism with `MAX_CONSOLIDATION_REQUESTS_PER_PAYLOAD: 2`[^s10][^s03].

### The queue, redenominated

Entry and exit are rate-limited so the validator set cannot change faster than the protocol can safely absorb. Originally the limit was counted in validators: `MIN_PER_EPOCH_CHURN_LIMIT: 4`[^s04]. Once a validator can hold anywhere between 32 and 2048 ETH, counting validators stops measuring anything meaningful — so Electra redenominated churn in ETH[^s05]:

```python
def get_balance_churn_limit(state: BeaconState) -> Gwei:
    churn = max(
        MIN_PER_EPOCH_CHURN_LIMIT_ELECTRA, get_total_active_balance(state) // CHURN_LIMIT_QUOTIENT
    )
    return churn - churn % EFFECTIVE_BALANCE_INCREMENT
```

with `MIN_PER_EPOCH_CHURN_LIMIT_ELECTRA` set to 128 ETH per epoch and `MAX_PER_EPOCH_ACTIVATION_EXIT_CHURN_LIMIT` to 256 ETH[^s04]. The queue is now a capital throughput limit rather than a headcount limit — which is the correct unit, since what the protocol must protect is the rate at which economic weight enters or leaves.

### Exit, delay, withdrawal

A validator cannot exit immediately. It must have been active for `SHARD_COMMITTEE_PERIOD: 256` epochs before requesting a voluntary exit, and after exiting must wait `MIN_VALIDATOR_WITHDRAWABILITY_DELAY: 256` epochs — roughly 27 hours each — before funds become withdrawable[^s04]. The delay exists so that misbehaviour discovered after the fact still has stake to slash.

### Who is allowed to exit — EIP-7002

The most consequential staking change is not about capital efficiency but about authority. A validator has two keys: an active signing key that performs duties, and withdrawal credentials that own the funds. Before EIP-7002 only the *signing* key could initiate an exit. The EIP states the problem exactly:

"In any non-standard custody relationship (i.e., the active key is a separate entity from the withdrawal credentials), the ultimate owner of the funds – the possessor of the withdrawal credentials – cannot independently choose to exit and begin the withdrawal process."[^s11]

That is the entire delegated-staking industry. A pool contract holds the withdrawal credentials; an operator holds the signing keys. If the operator vanished, went rogue, or lost the keys, the funds were stuck — the owner could not force the exit.

EIP-7002 adds a predeploy at `0x00000961Ef480Eb55e80D19ad83579A64c007002` that lets the holder of 0x01 credentials trigger a withdrawal or exit from the execution layer, with requests appended to the execution block and processed by the consensus layer[^s11]. Rate limits are tight — `MAX_WITHDRAWAL_REQUESTS_PER_PAYLOAD: 16`[^s03].

This converts a trust assumption into a protocol guarantee. Pooled staking previously required believing the operator would exit when asked; now the contract can compel it.

## Incentives — rewards, penalties, slashing

### Effective balance and hysteresis

Rewards scale with *effective balance*, a quantised version of the real balance moving in 1 ETH steps (`EFFECTIVE_BALANCE_INCREMENT: 1000000000` Gwei)[^s02]. Quantisation avoids recomputing rewards for every wei of drift. To stop the effective balance oscillating around a boundary, the spec applies hysteresis: `HYSTERESIS_QUOTIENT: 4`, with a downward multiplier of 1 and an upward multiplier of 5[^s02] — balance must fall a quarter-ETH below or rise 1.25 ETH above a boundary before the step moves.

### Rewards

Rewards derive from `BASE_REWARD_FACTOR: 64`[^s02], scaled by effective balance and inversely by the square root of total stake — so per-validator yield falls as total stake rises. Validators earn for correct source, target and head votes, for proposing blocks (`PROPOSER_REWARD_QUOTIENT: 8`[^s02]), and for sync-committee duty (`SYNC_COMMITTEE_SIZE: 512` validators rotating every `EPOCHS_PER_SYNC_COMMITTEE_PERIOD: 256` epochs[^s07]).

This report does not compute an APR; the reward function was not extracted term by term (see Limitations).

### Penalties are not slashing

Conflating these is the most common error in staking discussions, and the spec keeps them structurally distinct.

**Penalties** apply to omission. Miss an attestation and you forgo the reward and pay a symmetric penalty. The magnitudes are small and roughly cancel: a validator online most of the time earns approximately what perfect participation would yield, minus its downtime. Ethereum.org states the practical consequence — going offline incurs penalties, but slashing is separately described as "larger penalties and ejection"[^s12].

**Slashing** applies to provable contradiction. It is not a bigger penalty; it is a different event, and it triggers three things at once[^s05]:

```python
validator.slashed = True
validator.withdrawable_epoch = max(
    validator.withdrawable_epoch, Epoch(epoch + EPOCHS_PER_SLASHINGS_VECTOR)
)
state.slashings[epoch % EPOCHS_PER_SLASHINGS_VECTOR] += validator.effective_balance
slashing_penalty = validator.effective_balance // MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA
```

The validator is marked, forcibly exited, and its withdrawability pushed out by `EPOCHS_PER_SLASHINGS_VECTOR: 8192` epochs — about 36 days at 12-second slots[^s02][^s04]. An immediate penalty is taken. And critically, the validator's effective balance is *recorded in a slashings vector*.

### The correlation penalty

That vector is the heart of the design. The spec applies a second penalty in `process_slashings`, and the timing is precise — it fires when `epoch + EPOCHS_PER_SLASHINGS_VECTOR // 2 == validator.withdrawable_epoch`[^s01], i.e. at the **midpoint** of the window, roughly 18 days after the slashing, not at the end. The penalty is proportional to *how much total stake was slashed in the same window*:

```python
adjusted_total_slashing_balance = min(
    sum(state.slashings) * PROPORTIONAL_SLASHING_MULTIPLIER, total_balance
)
penalty_numerator = validator.effective_balance // increment * adjusted_total_slashing_balance
penalty = penalty_numerator // total_balance * increment
```

The live multiplier is not the genesis value. Phase 0 set `PROPORTIONAL_SLASHING_MULTIPLIER: 1` and the spec notes it was "set to `1` at initial mainnet"[^s02]; Altair raised it to 2[^s07]; Bellatrix set `PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX: 3`[^s15], and Electra's `process_slashings` still uses the Bellatrix constant[^s05]. So the correlated penalty today is scaled by 3.

The consequence is that slashing is superlinear in correlation. One validator equivocating alone loses a small fraction. A third of the network equivocating together — the scenario that could actually break finality — approaches total loss for every participant. The protocol is close to indifferent about isolated faults, which are usually bugs or misconfiguration, and maximally hostile to coordinated ones, which are attacks. This is what "economic finality" purchases: reverting a finalised checkpoint requires a third of stake to equivocate, and the correlation penalty ensures that a third of stake equivocating destroys itself.

### Electra softened the immediate penalty

The initial slashing quotient has moved three times, tightening steadily before reversing: `MIN_SLASHING_PENALTY_QUOTIENT: 128` at genesis[^s02], 64 in Altair[^s07], `MIN_SLASHING_PENALTY_QUOTIENT_BELLATRIX: 32` from Bellatrix onward[^s15], then relaxed to `MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA: 4096` in Electra[^s03]. At the pre-Electra value of 1/32 a 32 ETH validator lost 1 ETH immediately; at 1/4096 it loses about 0.0078 ETH — a 128-fold reduction in the immediate cost.

The spec attributes the change to EIP-7251 rather than to leniency — the note reads "modified to change how the slashing penalty and proposer/whistleblower rewards are calculated in accordance with EIP7251"[^s05]. With validators now holding up to 2048 ETH, a fixed fraction that was proportionate at 32 ETH would be punishing at 2048 ETH for what may be an operator error. The correlation penalty, which is the part that actually deters attacks, was not weakened. Reading the change as "slashing got safer for attackers" would therefore be wrong; reading it as "the immediate cost of an honest mistake fell sharply" is right. _(This reading is this report's; the spec states only the EIP-7251 attribution.)_

## The staking ecosystem and its concentration

### Four routes, four trust assumptions

Ethereum.org presents four ways to stake and does not pretend they are equivalent[^s12]. **Home staking** is "most impactful" — full control, full rewards, and full exposure: "Your ETH is at stake." **Staking as a service** keeps the 32 ETH but hands over signing keys, carrying "the same risks as solo staking plus counter-party risk of service provider." **Pooled staking** drops the minimum — "some projects require as little as 0.01 ETH" — in exchange for counter-party and execution risk. **Centralised exchanges** are ranked "least impactful" and described as creating "a large centralized target and point of failure, making the network more vulnerable to attack or bugs."

The ranking is by *network* impact, not user convenience, and it inverts the popularity ordering.

### Where the stake actually sits

Approximately 39 million ETH is staked — around 32% of a 121.7 million ETH supply — and the largest liquid-staking protocol, Lido, accounts for roughly 8.86 million ETH, about 22.7% of the staked total _(unverified — industry reporting)_[^s13].

The thresholds that matter are protocol thresholds. One third of stake can prevent finality (since justification needs two-thirds). One half matters for fork-choice dominance. Two thirds can finalise arbitrarily. A ~23% share is below all three, but the relevant question is whether a protocol's operator set should be counted as one actor or many — a question about governance and correlated failure, not about arithmetic. This report reports the numbers and does not issue a verdict.

### MaxEB in practice: the 2026 consolidation

EIP-7251 was justified by an abstract argument about validator-set size. In 2026 that argument became a migration. Lido's DAO approved Curated Module v2 in late July 2026 and began moving stake out of "over 265,000" legacy 0x01 validators into compounding units. The projected effect: compounding validators' share of secured stake rising from roughly 32% to about 52%, and the network validator count falling by roughly a third, "from around 880,000 to near 628,000" _(unverified — industry reporting)_[^s14].

If that projection holds it is the largest single change to the validator set since the Merge, and it is worth being precise about what it does and does not do. It reduces *message and aggregation load*, which is what EIP-7251 targeted[^s10]. It does not reduce the amount of stake under one protocol's control — the same ETH is simply held in fewer, larger validators. Validator count and decentralisation were never the same measurement, and this migration makes the gap between them visible.

## Limitations

- **Deposit contract source not read.** The address is confirmed from the config[^s04] and consensus-side verification from the spec[^s01], but the contract's own source was not retrieved. Statements here concern its interface and consensus-side treatment, not its implementation.
- **Casper FFG paper body not read.** Only the abstract was retrievable[^s09]. The slashing conditions and accountable-safety reasoning are cited from the implemented specification[^s01] — the more load-bearing artefact — with the paper cited for the concept only. The report does not quote the paper's formal theorems.
- **No reward arithmetic.** Base reward, per-component attestation weights and exact proposer shares were not extracted function by function. The report describes reward *structure* and quotes constants[^s02][^s07] but computes no APR, and readers should not infer yields from it.
- **Staking statistics are tier-4.** The ~39M ETH staked, ~23% Lido share, and the 880k→628k projection come from industry trackers and reporting[^s13][^s14], not from chain-derived primaries such as beaconcha.in or a Dune query. They are marked in-line and should be treated as approximate and fast-moving. The 628k figure is a projection, not an outcome.
- **Specification currency.** Everything is quoted from `master`, which is the current development state, not a mainnet snapshot; the latest tagged release at the time of writing was v1.7.0-alpha.13 (2026-07-31). Constants for activated forks (through Fulu) are live; Gloas and Heze are not scheduled[^s04] and nothing tagged to them is asserted as active.
- **Fulu contents not analysed.** Fusaka's activation on 2025-12-03 is confirmed from the config[^s04], but its specification changes were not read and the report does not characterise what it changed.
- **No PoS attack literature.** Work on reorg and balancing attacks against LMD-GHOST was not gathered. The report states the properties Gasper's authors prove[^s08] and does not claim the protocol is attack-free; a security assessment would require that literature.
- **Concentration deliberately unjudged.** The report gives distribution figures and protocol thresholds but issues no verdict on whether current concentration is dangerous, because that depends on whether an operator set counts as one actor — a governance question this report did not investigate.
