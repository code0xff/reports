# Critique — ethereum-pos-and-staking-protocol

Adversarial pass, 2026-08-14. Posture: assume the draft misquotes the spec.

Because this report's authority rests on quoting `consensus-specs` directly,
the critique prioritised (a) verifying that quoted mechanisms actually work
as described, (b) checking that the *live* constant was used rather than the
genesis one, and (c) source diversity.

## 1. Unsupported claims

| # | Location | Finding | Class | Disposition |
|---|---|---|---|---|
| 1.1 | §4, "an epoch is 6.4 minutes" | Arithmetic (32 × 12s), not a quoted constant. | **nit** | Inputs are both cited (`SLOTS_PER_EPOCH`[^s02], `SLOT_DURATION_MS`[^s04]) and the derivation is trivial. Kept. |
| 1.2 | §6, "per-validator yield falls as total stake rises" | Stated without showing the formula. | **nit** | Verified in spec: base reward divides by `integer_squareroot(total_balance)`[^s01]. Claim is correct; the report does not compute an APR and says so. |
| 1.3 | §7, "the ranking inverts the popularity ordering" | Asserts that centralised/pooled staking is more popular than solo, without a citation for popularity. | **nit** | Supported indirectly by the concentration figures[^s13]. Weak but not load-bearing; left as a framing sentence. |
| 1.4 | §5, "roughly 27 hours each" for 256-epoch delays | Arithmetic (256 × 32 × 12s ≈ 27.3h). | **nit** | Inputs cited. Kept. |

## 2. Citation integrity

- **Ref existence**: 15 refs across both drafts, all resolving; no orphans,
  no unused sources. **Pass.**
- **Schema**: all 15 carry required fields, allowed `type`, non-null
  `quote`; all `accessed` 2026-08-14. **Pass.**
- **Footnote-definition blocks / manual References**: none. **Pass.**
- **Blockquotes**: one was present in the English draft (the EIP-7002
  motivation quote) and was converted to an inline quotation, because the
  active minimal renderer escapes `>` rather than rendering it. Now 0 in
  both. **Fixed.**
- **Quote provenance**: s01–s07 and s15 were fetched as raw files from
  `raw.githubusercontent.com` and quoted from the local copies, so the
  constants and function bodies are character-exact. s08–s12 are quoted
  from their published pages.
- **Branch correctness**: an early attempt used the `dev` branch and 404'd;
  the repo's default branch is `master`. All spec URLs point at `master`.

## 3. Reasoning gaps — three real errors found

This is where the pass earned its keep. Three spec claims were checked
against the source and **three were wrong**.

### 3.1 Correlation-penalty timing — **must-fix — RESOLVED**
The draft said the correlated penalty is applied "at the end of the ~36-day
window." It is not. `process_slashings` applies it when
`epoch + EPOCHS_PER_SLASHINGS_VECTOR // 2 == validator.withdrawable_epoch`[^s01]
— the **midpoint**, ~18.2 days after slashing, while withdrawability sits at
~36.4 days. Corrected in both drafts, with the actual code quoted.

### 3.2 Slashing quotient history omitted Bellatrix — **must-fix — RESOLVED**
The draft gave the sequence as 128 (genesis) → 64 (Altair) → 4096 (Electra)
and computed the pre-Electra loss on a 32 ETH validator as 0.5 ETH. It
skipped Bellatrix, which set `MIN_SLASHING_PENALTY_QUOTIENT_BELLATRIX: 32`[^s15].
The live pre-Electra value was therefore 1/32, i.e. **1 ETH, not 0.5 ETH**,
and the Electra change is a 128-fold reduction rather than 64-fold.
The Bellatrix preset was not fetched in the first gather sweep — a coverage
gap, not a reading error. Source s15 added; both drafts corrected.

### 3.3 Wrong proportional-slashing multiplier — **must-fix — RESOLVED**
The draft cited `PROPORTIONAL_SLASHING_MULTIPLIER` via the phase0 and Altair
presets (1 and 2). But Electra's `process_slashings` uses
`PROPORTIONAL_SLASHING_MULTIPLIER_BELLATRIX`[^s05], which is **3**[^s15].
The report was citing constants that are not the ones in force. Corrected,
with the full 1 → 2 → 3 history and the note that Electra still uses the
Bellatrix constant.

### 3.4 Claims that survived verification
- Justification threshold and the four finalisation rules — verified
  verbatim against `weigh_justification_and_finalization`[^s01].
- The two and only two attester slashing conditions — verified[^s01].
- Base reward inversely proportional to √(total balance) — verified via
  `integer_squareroot` in the reward path[^s01].
- Balance-denominated churn in Electra — verified[^s05].
- Credential-selected effective-balance ceiling — verified[^s05].
- Inactivity leak trigger at >4 epochs of finality delay — verified[^s01][^s02].

## 4. Missing counter-evidence

### 4.1 No PoS attack literature — **accepted gap, disclosed**
The report cites Gasper's proven properties[^s08] without the literature on
reorg and balancing attacks against LMD-GHOST. This is a real omission for
a security assessment. The draft does **not** claim the protocol is
attack-free and states the gap explicitly in Limitations. Accepted rather
than fixed, because closing it properly would require a separate gather
cycle; flagged so a reader is not misled.

### 4.2 Statistics are tier-4 — **disclosed, not fixable within scope**
The staking figures come from industry trackers[^s13][^s14], not a
chain-derived primary. Every such figure carries an in-line
`_(unverified — industry reporting)_` marker and a Limitations entry, and
the 628k validator figure is labelled a projection rather than an outcome.

### 4.3 Deliberate non-verdict on centralisation
A reader might expect the report to conclude whether ~23% concentration is
dangerous. It declines, giving the protocol thresholds (1/3, 1/2, 2/3)
instead. This is defensible: the answer turns on whether an operator set
counts as one actor, a governance question not investigated here. Recorded
in `uncertainties.md`.

## 5. Tone and structure

- **Abstract faithful to body?** After the §3 corrections the abstract was
  re-read; it makes no claim about slashing magnitudes or correlation
  timing, so no update was required. **Pass.**
- **Limitations honest against `gaps.md`?** Yes — all seven accepted gaps
  appear. **Pass.**
- **Marketing tone / emoji**: none. **Pass.**
- **Renderer compatibility**: code fences and tables are supported by the
  minimal renderer; blockquotes are not and are now absent. **Pass.**
- **Korean draft parity**: all three corrections were mirrored; both drafts
  carry 15 refs with identical source sets. **Pass.**

## 6. must-fix vs nit

**must-fix (3, all resolved):**
1. 3.1 — correlation penalty applied at midpoint, not end of window.
2. 3.2 — Bellatrix slashing quotient omitted; pre-Electra figure wrong.
3. 3.3 — cited the wrong proportional-slashing multiplier.

**nit (4, accepted):** 1.1, 1.2, 1.3, 1.4.

**Open must-fix: none.** Clear to publish under PROTOCOL.md §3 Critique.
