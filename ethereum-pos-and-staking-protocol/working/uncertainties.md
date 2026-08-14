# Uncertainties — Ethereum PoS and the Staking Protocol

`gaps.md` is what was missing before drafting; this is what stays shaky
even though the draft ships.

## Specs-first has a cost as well as a benefit
- Quoting `master` means quoting the **current development state** of the
  specification, not necessarily what is running on mainnet today.
  Constants for activated forks (through Fulu) are live; anything tagged
  Gloas/Heze is not. The report flags unscheduled forks explicitly, but a
  reader should not assume every line quoted is mainnet-active.
- The latest tagged release at time of writing was v1.7.0-alpha.13
  (2026-07-31), i.e. the repo is mid-cycle.

## Interpretive, not established
- **"Penalties and slashing are different failure classes."** This is the
  report's framing of the spec's structure, not a quoted claim. It follows
  from the magnitudes and the correlation mechanism but is an argument.
- **Reading Electra's slashing-quotient change as a deliberate softening.**
  The quotient moved 128 → 64 (Altair) → 4096 (Electra). The spec notes
  the change is "in accordance with EIP7251" — i.e. driven by the fact
  that a validator may now hold up to 2048 ETH — rather than by an intent
  to be lenient. The report presents the mechanical fact and this reading
  separately.
- **The centralisation assessment.** Concentration figures are reported;
  whether ~23% in one protocol constitutes a safety problem depends on
  thresholds (1/3 for finality delay, 1/2, 2/3) and on whether a protocol's
  operator set is treated as one actor. The report states the arithmetic
  and declines to issue a verdict.

## Moving fast
- The Lido consolidation was approved in late July 2026 and is in
  progress; the 880k→628k figure is a projection, not an outcome.
- Staking-share figures move continuously.
- Gloas and Heze are unscheduled today and could activate at any time.
