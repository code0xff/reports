# Uncertainties

Epistemic register — things that are publishable but remain shaky or could shift.

1. **Audit status is vendor-stated.** The spec (s06) calls the proxy "audited, battle-tested" and references a "post-audit" change to the Witness type, but no audit report was read. Treat the audit claim as vendor-stated; the *code-level* behavior described in this report is verified directly from source, the *audit outcome* is not.

2. **Live deployment ≠ verified.** Canonical addresses (s11) are taken from the repo. We did not read the deployed bytecode on Base or any chain, so "deploys to the same address on all chains via CREATE2" is verified as *intent and configuration* (foundry.toml + CREATE2 deployer + NatSpec), not as an observed on-chain fact for every chain.

3. **Fast-moving spec.** x402 is an actively developed, vendor-led protocol. The pinned commit is `dd927a2` (2026-04-21). Witness struct shapes, scheme names, and canonical addresses may change. The legacy Base Sepolia upto deployment (different bytecode, CBOR metadata) already shows the address scheme has churned once (s11).

4. **`upto` trust model.** That a malicious server "could charge up to amount regardless of actual usage" is the spec's own stated security consideration (s07) and an interpretive risk framing, not an exploited vulnerability.

5. **ERC-7710 / EIP-3009 paths are out of code scope.** The exact scheme supports EIP-3009 and ERC-7710 transfer methods that do not touch these four files; this report covers them only as context for *why* the Permit2 proxy path exists.

6. **Batch-settlement contract absence is point-in-time.** True at the pinned commit; a future on-chain batch-settlement binding could add an EVM contract. The report states the absence as of `dd927a2`.
