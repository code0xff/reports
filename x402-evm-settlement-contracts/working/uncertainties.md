# Uncertainties

Epistemic register — things that are publishable but remain shaky or could shift.
Revised 2026-06-10.

1. **Audit status is vendor-stated (proxies) / unknown (batch).** The spec (s06) calls the proxy
   "audited" and references a post-audit Witness change, but no audit report was read. For the newer,
   **custodial** `x402BatchSettlement` contract no audit document was located at all. Code-level behavior
   is verified from source; audit outcomes are not. The custodial batch contract carries more residual
   risk from this gap than the custody-free proxies.

2. **Live deployment ≠ verified.** Canonical addresses (s11, s25) and "Deployed" status across Base,
   Arbitrum, World Chain, and Polygon are taken from the repo/README. We did not read deployed bytecode on
   any chain, so "deploys to the same address on all chains via CREATE2" is verified as *intent +
   configuration + the project's deployment table*, not as an observed on-chain fact.

3. **Tests read, not executed.** The batch contract's Foundry unit/fork/gas tests (s24) are cited for the
   behavior they encode (e.g. `test_finalizeWithdraw_capsIfClaimedDuringDelay`,
   `test_initiateWithdraw_attackBypass_blocked`, the fork lifecycle). They were read as source, not run.

4. **Fast-moving spec, and the surface already moved.** x402 is an actively developed, vendor-led
   protocol that relocated repos (coinbase/x402 → x402-foundation/x402) between the two pins, and the
   canonical **Upto proxy address changed** (`0x4020a4f3…` → `0x402015c7…`). Witness shapes, scheme names,
   channel parameters, and addresses may change again after `dc656bb` (2026-06-09).

5. **`upto` / batch trust model.** That a malicious server "could charge up to amount regardless of actual
   usage" (s07) and that batch clients "bear risk up to the signed maxClaimableAmount" (s22) are the specs'
   own stated security considerations and interpretive risk framings, not exploited vulnerabilities.

6. **Batch liveness race is design-acknowledged, not contract-solved.** The claim-vs-finalizeWithdraw race
   that can forfeit unclaimed value (s19, s23) is mitigated only by integrator policy (claim early, longer
   withdrawDelay, resilient relays), not by an on-chain reservation. Whether real deployments choose safe
   `withdrawDelay` values is outside what the source can tell us.

7. **ERC-7710 / EIP-3009 exact paths are out of code scope.** The exact scheme supports transfer methods
   that do not touch the contracts under study; covered only as context.
