# Critique — ERC-7710 Smart Contract Delegation and its Relationship with x402

Adversarial verification pass. `draft.md` (en) and `draft.ko.md` (ko) are translations of
the same content; findings apply to both.

## 1. Unsupported claims
- Every paragraph swept; all factual/technical assertions carry `[^s..]`. The scoped-authority
  framing (§1), per-request-unit (§4), and complementarity (§6) are marked `_(interpretive)_`.
- The caveat-enforcer names are explicitly flagged as toolkit implementation detail, not spec.

## 2. Citation integrity
- 16 refs in each draft resolve to ids in sources.jsonl; 0 orphans. ✓
- All 16 sources `accessed: 2026-06-19` (0 days), within 90. ✓
- URL liveness: sampled 5 (eip-7710, eip-7715, MetaMask delegation-framework, x402 exact
  scheme, MetaMask x402-with-delegations 1.5.0) → all HTTP 200. ✓
- Quote spot-check — the two load-bearing relationship sources were re-fetched by the lead
  (not just the sub-agent) and confirmed verbatim:
  - s12 (x402 exact-EVM spec): "3. ERC-7710 … Smart Account Option", the
    delegationManager/permissionContext/delegator payload, and "the process of obtaining a
    delegation is outside the scope of x402" — all verbatim. ✓
  - s13 (MetaMask x402 guide): "signs a delegation that the facilitator redeems during
    settlement", facilitator/amount/time-window scoping, long-lived recurring delegations — verbatim. ✓

## 3. Reasoning gaps
- The central claim (7710 is an x402 settlement option) is not inferred — it is stated in the
  x402 spec itself and corroborated by an independent vendor (MetaMask) implementation.
- No single-example over-generalization; no orphan statistics; no universal quantifiers.
- The "out of scope" clause is used to support *separability*, which the source states directly.

## 4. Counter-evidence / hypothesis correction
- The original outline hypothesized the link was "architectural/emerging, no shipped
  standard" (old c15). The gather **disproved** this; rather than preserve the tidy prior, the
  claims (c14/c15) were rewritten to the evidence: 7710 is a defined x402 option AND the two
  remain separable layers ("obtaining a delegation is outside the scope of x402").
- Balancing facts retained so the finding is not overstated: EIP-3009 remains x402's *default*
  (7710 is the third option)[^s10]; the integration is vendor-versioned (MetaMask 1.5.0)[^s13];
  richer delegated/recurring billing is still being formalized (an x402 issue surfaced but
  could not be fetched, so it is noted, not cited). These are in §6 and Limitations.

## 5. Tone and structure
- Abstract faithful to body, including the corrected headline finding and the compose-as-two-
  layers conclusion. ✓
- Limitations honestly mirrors gaps.md/uncertainties.md (vendor-led, impl-vs-spec, single-
  primary, moving target, unconfirmed recurring-billing). ✓
- No emoji/marketing voice; vendor illustration ("10 USDC/day") tagged as such. ✓
- Paragraphs use bolded sub-leads, each ≤ ~6 sentences. ✓

## 6. Must-fix vs nit
- **No must-fix items.**
- nit (accepted): c01 single-primary (the EIP) — correct for a standard's own definition.
- nit (accepted): the x402↔7710 integration rests on the x402 spec + one vendor guide; broader
  independent implementations not surveyed — noted in Limitations.

## Result
No open must-fix items. `validate-report` passes; both pivotal quotes independently verified.
