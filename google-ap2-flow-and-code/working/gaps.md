# Gaps

Status after gather iteration 1 (deep code pass + web/GitHub lanes).
Iteration ceiling per the protocol: 6.

## Resolved during gather

- c11 was **falsified** — no human-present/not-present flag exists in the
  Payment Mandate. Replaced with the accurate structural finding. Not a gap;
  a corrected claim.
- c04, c19, c22, c27 were **materially revised** rather than dropped. Each
  revised statement is fully sourced. See `claims.md` for the exact wording
  that enters the draft.
- c26 resolved as a *qualified negative*: no official conformance suite, one
  independent cross-verified vector set. Negative evidence is documented
  (repo, FIDO write-up, FAQ all silent) rather than asserted.
- Spec-vs-code deltas (c23) reached four independently confirmed instances,
  two of them also filed by third parties (#298, #308), so this is not a
  single-observer finding.

## Conflicts to present, not resolve

1. **ECDSA vs Ed25519 for the Checkout JWT.** `specification.md` forbids
   deterministic signatures; `security_and_privacy_considerations.md` permits
   them given sufficient in-payload entropy. Issue #268 argues the S&P framing
   is the correct one. The draft must show both normative passages and the
   third-party objection, and must not pick a winner.
2. **Mandate taxonomy in third-party writing.** Independent explainers still
   describe AP2 as Intent/Cart/Payment and as "JSON-LD"; v0.2 is
   Checkout/Payment as SD-JWT-VCs. Attribute both, and say which is current.
3. **`vct` suffix in the SDK README.** The SDK README's model table lists
   `mandate.payment.open` / `mandate.checkout.open` without the `.1` suffix
   that the spec declares mandatory and the generated models enforce. Minor
   documentation drift; report as such, not as a protocol ambiguity.

## Remaining gaps — carried into Limitations

- **G1. No production deployment evidence.** Every behavioural claim about the
  processing flow is grounded in the spec plus reference code. Nothing found
  describes AP2 v0.2 running at card-network volume, and no vendor has
  published a v0.2 conformance report. Cannot be closed by more searching;
  belongs in Limitations.
- **G2. Card-rail flow is less exercised than the x402 rail.** The v0.2
  flagship `run.sh` defaults to `FLOW=x402`; the card MCP roles exist but the
  human-present card scenario is served by the older v0.1-shaped role servers.
  The report should not present card-flow code with the same confidence as the
  x402 path.
- **G3. Trusted Surface production shape is unspecified in code.** The spec
  describes OpenID4VP + Digital Credentials API delegation, and the Android DPC
  sample exercises a credential path, but no shipped sample demonstrates a
  *non-agentic* Trusted Surface signing with a user-held key. What a compliant
  Trusted Surface looks like in practice is therefore not evidenced.
- **G4. `Delegate SD-JWT` is a moving individual draft.** The chain format
  depends on `draft-gco-oauth-delegate-sd-jwt-00`, an individual draft, and the
  SDK documents its own deviations from it. Stability of the wire format is
  unverifiable today.
- **G5. Go/Android samples not re-read line by line.** Confirmed to be v0.1 in
  data model and A2A binding from their type definitions and READMEs; not
  audited to the depth of the Python v0.2 path. Claims about them are limited
  to the model generation they use.
- **G6. Dispute-time verification is untested.** The five-step dispute
  procedure has no corresponding code path or test in the repo. Stated as a
  spec-only capability.

No open **must-fix** blockers for drafting. G1–G6 go into the Limitations
section explicitly, per Phase 4's instruction that a stated gap is acceptable
and a hidden one is not.
