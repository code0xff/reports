# Outline

1. **Abstract**
   - One-paragraph summary of the four-file scope, the correction that batch-settlement has no on-chain contract, and the core "witness-bound Permit2 spender" design.

2. **Introduction**
   - What x402 is (HTTP 402 payment protocol), the facilitator/client/resource-server roles, and why an on-chain settlement contract is needed for non-EIP-3009 tokens. Scope and source basis (commit-pinned code read).

3. **Background: Permit2 and the witness pattern**
   - Uniswap Permit2 SignatureTransfer, `permitWitnessTransferFrom`, unordered nonces, EIP-712 witness/witnessTypeString, canonical Permit2 address. Why x402 needs a proxy as the "spender".

4. **The payment schemes (exact, upto, batch-settlement)**
   - `exact`: fixed amount, EIP-3009 preferred / Permit2 fallback / ERC-7710. `upto`: max-authorized, server settles actual, phase-dependent amount. `batch-settlement`: deferred off-chain/Cloudflare settlement — a scheme spec, not an EVM contract. The scheme↔contract mapping.

5. **Contract code analysis**
   - 5.1 `x402BasePermit2Proxy` — abstract base: immutable PERMIT2, `_settle`, `_executePermit`, validation errors, EIP-2612 try/catch events, CREATE2 determinism rationale.
   - 5.2 `x402ExactPermit2Proxy` — Witness{to, validAfter}, always transfers `permit.permitted.amount`, settle / settleWithPermit.
   - 5.3 `x402UptoPermit2Proxy` — Witness{to, facilitator, validAfter}, caller-chosen `amount <= permitted`, facilitator access control, AmountExceedsPermitted.
   - 5.4 The "missing" x402BatchSettlement.sol — what actually exists.

6. **Security properties and threat model**
   - Destination binding via witness, facilitator binding (upto only), no custody, reentrancy guard, EIP-2612 non-reverting design, 2612 value==permitted check, single-use via Permit2 nonce, deterministic cross-chain address, residual trust assumptions.

7. **Discussion**
   - Design trade-offs (exact vs upto witness shape), upto's client-trust risk, dependency inheritance from Permit2, deterministic-build/initCode caveat (Exact pre-built hex, legacy Base Sepolia upto), independent corroboration.

8. **Limitations**
   - Single-repo primary basis, no third-party audit report read, unverified live deployment bytecode, fast-moving spec.

9. **References**
   - Built from sources.jsonl.
