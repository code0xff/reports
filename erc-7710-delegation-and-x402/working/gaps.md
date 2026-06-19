# Gaps — ERC-7710 Delegation and x402

## Status after Sweep 1 (harvest + 2 background agents): GATHER COMPLETE

16 sources in working/sources.jsonl. All claims c01–c16 meet PROTOCOL §3 minimum sourcing:
- factual (c05, c16): ≥2 independent ✓
- technical (c01,c03,c04,c06,c07,c08,c09,c10,c11,c13,c14,c15): ≥1 primary ✓
- interpretive (c02, c12): ≥1 ✓

## KEY FINDING — hypothesis corrected
Initial outline assumed the ERC-7710 ↔ x402 link was only architectural/emerging (old c15).
The gather DISPROVED that and the finding was self-verified by re-fetching primary sources:
- The canonical x402 exact-EVM spec (github.com/coinbase/x402, main) lists **ERC-7710 as a
  third authorization method** ("Smart Account Option") alongside EIP-3009 and Permit2; the
  x402 payload carries `delegationManager` / `permissionContext` / `delegator`, and the
  facilitator redeems the delegation during /settle [s12 — verified verbatim].
- MetaMask Smart Accounts Kit v1.5.0 ships a concrete "x402 Payments with Delegations" guide
  [s13 — verified verbatim].
- x402 explicitly states "the process of obtaining a delegation is outside the scope of
  x402" (done via ERC-7715 / wallet / session keys) — so 7710 = standing scoped grant,
  x402 = per-request redemption: they COMPOSE [s12].
Claims c14/c15 were rewritten to match this evidence.

## Remaining thin spots → uncertainties.md / Limitations (accepted)
- c01 rests on the ERC-7710 spec alone (single primary) — correct for a standard's own def.
- Delegated/recurring x402 billing is still being formalized (an x402 issue on "delegated
  billing" surfaced but could not be fetched to confirm status) — note cautiously, do not cite.
- Caveat-enforcer names (valueLte/erc20Streaming/allowedTargets) are MetaMask implementation
  detail, not ERC-7710 spec text — attributed to the toolkit, not the EIP.

## Conflicts / tensions
- "Defined settlement option" (concrete, shipped) vs "obtaining delegation out of scope"
  (so still two layers): present both — they are consistent, not contradictory.
- Both stacks vendor-led (MetaMask/Consensys; Coinbase) — flagged.

No open must-fix gaps. Proceed to draft.
