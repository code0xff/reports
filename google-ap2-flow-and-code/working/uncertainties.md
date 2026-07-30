# Uncertainties

What remains epistemically shaky even though the draft is publishable.
`gaps.md` is about missing evidence; this file is about evidence that exists
but should not be leaned on hard.

## Likely to change

- **U1. Wire format tracks a moving individual draft.** The `~~`-joined
  delegation chain implements `draft-gco-oauth-delegate-sd-jwt-00` — an
  individual draft by a single author, not a working-group document — and the
  SDK explicitly documents deviating from it ("No dSD-JWT+KB shape"). Any
  byte-level statement in this report is pinned to commit `e1ea56d` and may
  not survive the next revision.
- **U2. Governance transition is mid-flight.** The spec is published in a
  Google-owned GitHub repository while normative work is moving into FIDO
  working groups. Where the authoritative text lives six months from now is
  not determinable from current evidence.
- **U3. The `vct` suffix is a forward-compatibility promise, not a track
  record.** `mandate.payment.1` implies a `.2` will one day exist. There is no
  evidence yet of how implementations handle a suffix bump, because there has
  not been one.
- **U4. Mixed-generation repository.** v0.1 Python models, v0.1 Go, and v0.1
  Android coexist with the v0.2 Python path. Which of these get migrated, and
  when, is unknown; readers cloning the repo later may find a different mix.

## Vendor-stated, not independently verified

- **U5. Payment-rail agnosticism.** "AP2 is agnostic to the particular payment
  instrument used" is the vendor's design claim. The only rails demonstrated in
  runnable v0.2 code are a mocked card processor and USDC on Base Sepolia. Real
  bank-transfer or PISP paths are schema entries, not exercised code.
- **U6. Framework neutrality.** The FAQ asserts any framework can implement
  AP2. The only reference agent is ADK-based, and the flagship sample depends
  on `google-adk==1.28.0` plus a Gemini API key. No third-party-framework
  implementation was found to corroborate the claim.
- **U7. Dispute-resolution utility.** That the retained mandate/receipt tuple
  will actually be accepted as evidence by card networks is an assertion about
  future scheme rules, not a technical property. The spec itself puts retention
  and retrieval out of scope.

## Weakly evidenced or single-observer

- **U8. The two failing SDK tests.** Measured locally at `e1ea56d`
  (`2 failed, 186 passed`) and traceable to a single `if typ in TYP_TERMINAL`
  guard. No corresponding upstream issue was found, so this is a
  single-observer finding — reproducible, but not yet corroborated by the
  maintainers. Report it as a measurement with the command shown, not as an
  accepted defect.
- **U9. Exploitability of the missing merchant `checkout_hash` check.** The
  omission in the sample is certain. Whether it is *exploitable* in the sample
  as shipped depends on whether an attacker can substitute a `checkout_jwt`
  that still satisfies the constraint evaluator and the downstream MPP check
  (which does bind `transaction_id`). This report describes the omission
  against the normative MUST; it does not claim a working exploit.
- **U10. `from`-address binding on the x402 rail.** The PSP verifies that the
  EIP-712 signature recovers to `authorization.from`, but nothing observed
  binds `from` to a wallet named in the Payment Mandate's
  `payment_instrument`. Whether this is a real gap or covered by the
  `allowed_payment_instruments` constraint upstream was not established to
  certainty; stated cautiously.
- **U11. Third-party comparison tables.** The ACP/UCP/AP2 comparisons used are
  practitioner marketing-adjacent content, and at least one misdescribes AP2
  mandates as JSON-LD. Used only for the structural contrast, never as an
  authority on AP2's own mechanics.
