# Uncertainties — Lean Ethereum

What remains epistemically shaky even though the draft is publishable.

## Vendor-stated / project-hosted

- Every performance figure for leanSig, leanVM and leanMultisig originates from the programme's own repositories and benchmark pages [s02][s13]. Independent write-ups [s16] restate rather than re-measure them.
- The four-pillar framing (consensus / cryptography / governance / craft) is the programme's own self-description [s02]. "Lean Governance" and "Lean Craft" are organisational commitments, not falsifiable protocol properties.
- The claim that hash-based cryptography is "a compelling, unified answer" to both SNARKs and quantum risk is the programme's thesis [s01], not an independently established result.

## Immature primitives

- leanSig is explicitly unaudited and not production-ready [s06].
- leanVM does not yet reach NIST Level 1 (128/64-bit classical/quantum); closing the gap requires either larger hash digests or a different prime field, and the conservative ROM/QROM analysis is still in progress [s13].
- Poseidon/Poseidon2 security is under active, funded attack, and round-reduced instances have in fact fallen to algebraic attacks during the bounty window [s10][s30]. That is the bounty working as designed, but it means the security margin of the deployed parameters is still being priced.
- FRI/STIR/WHIR soundness rests partly on the proximity-gaps conjecture; leanVM reports ~124 bits *provable* under the Johnson bound with higher security only *conjectured* [s13].

## Likely to change

- The fast-finality protocol is unchosen. 3SF is the published academic anchor [s04] but the shipped devnets use 3SF-mini and the next devnet targets Goldfish + RLMD-GHOST [s28][s29]. Any specific finality latency number in the draft should be read as a target, not a specification.
- Slot time is 4 seconds in devnet configuration [s14][s29]; this is a devnet parameter, not a ratified mainnet value.
- Fork scheduling beyond Glamsterdam and Hegotá is placeholder-level [s17][s26]. "~2029" is a planning horizon, and the strawmap is explicitly a *draft* framework [s20].
- The RISC-V vs. leanISA decision for lean execution is open [s01][s27].

## Contested framings

- Urgency: EF's own position is that a CRQC is "not an imminent threat" [s17], and an independent cryptographer argues a CRQC in the 2020s is "highly unlikely" and that signature migration should be deliberate rather than immediate [s18]. Simultaneously, named practitioners argue the 3–4 year plan is *too slow* for quantum readiness [s19]. The draft must show all three positions.
- Bundling: the programme treats a single large fork as a delivery advantage (Lean Governance) [s02], while an independent pattern catalogue names it a top-line risk — "a failure in one component delays the entire upgrade" [s21].
- Privacy: Buterin himself flags that daily validator re-anonymisation could obscure rather than reduce centralisation [s09].
