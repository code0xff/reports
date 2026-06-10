# Outline

> Revised 2026-06-10. Earlier revision (2026-06-01) pinned to `coinbase/x402@dd927a2`
> and reported `x402BatchSettlement.sol` as absent. The repo has since moved to
> `x402-foundation/x402`, whose commit `dc656bb` (2026-06-09) ships the batch
> contract + deposit collectors, deployed on Base/Arbitrum/World Chain/Polygon.
> This revision reads the three proxies at `dd927a2` and the batch machinery at `dc656bb`.

1. **Abstract**
   - The four-file scope, the correction that all four contracts now exist, the repo move, and the witness-bound Permit2 spender + capital-backed channel designs.

2. **Introduction**
   - What x402 is, the facilitator/client/resource-server roles, why on-chain settlement is needed for non-EIP-3009 tokens. Repo-move + dual-pin sourcing note.

3. **Background: Permit2 and the witness pattern**
   - Uniswap Permit2 SignatureTransfer, `permitWitnessTransferFrom`, unordered nonces, EIP-712 witness/witnessTypeString. Why x402 needs a proxy as the "spender"; reused by the Permit2 deposit collector.

4. **The payment schemes (exact, upto, batch-settlement)**
   - `exact`: fixed amount. `upto`: max-authorized, actual-at-settlement. `batch-settlement`: now TWO bindings shipped — credit-backed Cloudflare (off-chain) and capital-backed EVM payment channels (x402BatchSettlement). Scheme↔contract mapping now uniform.

5. **Contract code analysis**
   - 5.1 `x402BasePermit2Proxy` — abstract base, `_settle`, `_executePermit`, CREATE2 determinism.
   - 5.2 `x402ExactPermit2Proxy` — Witness{to, validAfter}, exact amount, open caller.
   - 5.3 `x402UptoPermit2Proxy` — Witness{to, facilitator, validAfter}, caller-chosen amount, facilitator access control.
   - 5.4 `x402BatchSettlement` — channelId from immutable config, deposit (collector + balance check), cumulative vouchers, claim/settle split, dual-authorizer signing, refund vs timed withdrawal, refundNonce edge, claim-vs-withdraw liveness race.
   - 5.5 Deposit collectors — IDepositCollector contract, onlyx402BatchSettlement access control, ERC3009 + Permit2 collectors.

6. **Security properties and threat model**
   - Proxies (custody-free) vs batch channel (custodial escrow). Witness destination binding, facilitator binding, no-custody (proxies), cumulative/monotonic voucher replay, distinct EIP-712 type hashes, refundNonce, EIP-1153 transient guard, deposit balance check, liveness-not-safety residual risk, cross-chain CREATE2 determinism.

7. **Discussion**
   - Prediction fulfilled (capital-backed binding now ships). Why a channel contract not a proxy. upto trust asymmetry echoed in batch. Audit status (proxies vendor-stated; batch unknown). Build-determinism + Upto address churn. Five Attacks counter-evidence (and why batch sidesteps I-B). Independent corroboration.

8. **Limitations**
   - Dual-pin basis, no audit report (esp. batch), no live-bytecode verification, tests read not run, mostly first-party + address churn, researcher-stated attack models.

9. **References**
   - Built from sources.jsonl.
