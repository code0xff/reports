# Outline — EIP-2612 and how to use it in x402

1. **Abstract**
2. **Introduction** — why gasless token authorizations matter; the approve/transferFrom UX problem; where x402 fits (HTTP 402 machine payments)
3. **Background: EIP-2612 Permit** — mechanics of `permit(owner, spender, value, deadline, v, r, s)`, EIP-712 typed data, `DOMAIN_SEPARATOR`, sequential nonces, relationship to EIP-20 `approve`; comparison with EIP-3009 `transferWithAuthorization`
4. **The x402 protocol** — HTTP 402 flow, `PaymentRequirements` / `X-PAYMENT` header, schemes (`exact`), facilitator role (`/verify`, `/settle`), networks and assets
5. **How x402 uses EIP-2612** — the `exact` scheme's EIP-3009 default for USDC; the permit-based path for arbitrary ERC-20s (permit + transferFrom bundling); who pays gas; replay protection mapping
6. **Implementation walkthrough** — concrete client and server code paths: signing the permit (viem/ethers typed data), constructing the payment payload, facilitator verification and settlement, running a custom facilitator for permit tokens
7. **Security considerations and pitfalls** — front-running of permit, nonce serialization vs parallel payments, deadline handling, phishing/blind-signing risks, tokens without permit support (DAI variant, non-standard permits), griefing
8. **Discussion: design trade-offs and ecosystem state** — EIP-3009 vs EIP-2612 in x402 practice, adoption signals, alternatives (Permit2, session allowances)
9. **Limitations**
10. **References** (generated from sources.jsonl)
