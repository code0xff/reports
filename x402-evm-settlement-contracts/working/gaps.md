# Gaps

Status after revision 2026-06-10 (repo move + batch-settlement contract now shipped).

## What changed this revision
- The headline finding of the prior revision ("no `x402BatchSettlement.sol`") is now **stale**: the
  canonical repo moved to `x402-foundation/x402` and commit `dc656bb` (2026-06-09) ships the contract,
  two deposit collectors, a capital-backed EVM scheme binding, tests, and live deployments. Re-pinned
  the batch material to `dc656bb`; kept the three proxies at `dd927a2` (unchanged in substance).
- Added s18–s25 (repo move, batch contract, collectors, EVM binding spec, implementer doc, batch tests,
  foundation README addresses). Added claims c25–c31; inverted c09→c25 framing.

## Under-sourced claims
- None blocking. Every claim has ≥1 primary source. Batch-contract claims (c25–c30) are grounded in the
  contract source (s19), the EVM binding spec (s22), the implementer doc (s23), and the test names (s24).
  Permit2 mechanism corroborated independently by Uniswap (s15, s16). Repo move sourced from coinbase's
  own README (s18).

## Conflicts
- Upto canonical address differs **between commits**, not just in casing: `0x4020a4f3…0002` (dd927a2 README,
  s11) vs `0x402015c7…0002` (foundation README, s25). This is a real change (re-mined address), now reported
  explicitly in §6 and c23 as evidence of surface churn — not a sourcing conflict to resolve.
- The word "stateless" in the contract/spec refers to *no off-chain state* (channel identity derived from
  immutable config), while the contract clearly keeps on-chain channel accounting. Disambiguated in §4.4.

## Missing primary sources
- No third-party security audit located for the proxies OR the new custodial batch contract. The batch
  contract takes custody, so this is a more material gap than for the custody-free proxies. → Limitations + uncertainties.
- Live on-chain bytecode at the canonical addresses (proxies + batch stack on Base/Arbitrum/World Chain/
  Polygon) not independently verified against source (no RPC/explorer read). → Limitations.
- Batch Foundry tests were read for the behavior they encode, not executed. → Limitations.

## Open questions (resolved or deferred)
- "Where is x402BatchSettlement.sol?" → RESOLVED: it exists in `x402-foundation/x402@dc656bb` at
  `contracts/evm/src/x402BatchSettlement.sol`; the prior "absent" finding was correct only at the old
  `coinbase/x402@dd927a2` pin, before the repo move. (s18, s19)
- Does batch-settlement have an on-chain settlement contract? → RESOLVED: yes for the capital-backed EVM
  binding (x402BatchSettlement); no for the credit-backed Cloudflare binding (still off-chain). (s22, s10)

## Counter-evidence
- The "Five Attacks on x402" preprint (s17) remains represented. Its Attack I-B (exact preemption) is
  woven into §4.2/§6; this revision adds the observation that the batch claim path sidesteps the same
  vector (receiver-restricted, no Permit2 nonce, cumulative no-op replay). Attack II (HTTP replay) noted
  as out of contract scope.

## Verdict
No must-fix gaps remain. Remaining items are honest limitations (no audit report — now more pointed given
the custodial batch contract; no live-bytecode verification; tests read not run; researcher-stated attack
models; address churn) and are in Limitations/Discussion.
