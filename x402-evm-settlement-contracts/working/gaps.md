# Gaps

Status after gather iteration 1 (commit-pinned code read + Uniswap Permit2 docs).

## Under-sourced claims
- None blocking. All 23 claims have at least one primary source; the technical/code claims are grounded directly in the contract source at a pinned commit (s01–s04, s11–s14). Independent corroboration for the Permit2 mechanism comes from Uniswap docs/source (s15, s16).

## Conflicts
- Upto canonical address casing differs trivially between sources: README (s11) writes `0x4020a4f3b7b90CCA423b9FabCC0CE57c6c240002`; upto EVM spec (s08) writes `0x4020A4f3b7b90ccA423B9fabCC0CE57C6C240002`. Same address, different checksum capitalization in prose — noted, not a substantive conflict. The spec's exact-scheme example payload (s06) uses a different illustrative spender (`0x402085...20001` in annex vs `0x4020A4f3...0002` in the upto example), consistent with each scheme having its own proxy.

## Missing primary sources
- No third-party security audit report was located or read. The exact spec (s06) states the proxy is "audited" and references a post-audit change (removal of `extra` from the Witness), but the audit document itself was not retrieved. → Recorded in Limitations and uncertainties.
- Live on-chain bytecode at the canonical addresses was not independently verified against the repo source (no RPC/Basescan read performed). → Limitations.

## Open questions (resolved or deferred)
- "Where is x402BatchSettlement.sol?" → RESOLVED: it does not exist. contracts/evm/src contains only the three proxies + interface + mock; batch-settlement is a scheme spec (s09, s10). This correction is a headline finding, not a gap.
- Does the upto proxy enforce single-use itself? → No; replay protection is delegated to Permit2 nonces (s07, s15). Stated in draft.

## Counter-evidence (added gather iteration 2)
- RESOLVED: The "Five Attacks on x402" preprint (s17) provides dissenting analysis. Attack I-B (settlement preemption: "the settlement path does not bind the facilitator identity to authorization") and Attack II (replay/idempotency at the HTTP-chain boundary) are now represented in draft §4.2, §6 and claim c24. This corrected an over-strong "no caller restriction is safe" framing for the exact proxy and surfaced that the upto facilitator binding is the mitigation for I-B.

## Verdict
No must-fix gaps remain. The counter-evidence sweep surfaced one must-fix (now resolved). Remaining items are honest limitations (no audit report read, no live-bytecode verification, researcher-stated attack models) and are in the Limitations/Discussion sections.
