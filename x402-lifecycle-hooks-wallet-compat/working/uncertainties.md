# Uncertainties

- The wallet matrix is the docs' own claim about the SDK's behaviour, not an independent test. No third party has published a reproduction.
- "Pre-verification mirrors on-chain checking" is an invariant the implementation targets (Python 2.14.0); it holds only where the facilitator's simulation matches the specific token contract's verification path.
- ERC-3009's text says it "does not apply to smart contract accounts"; USDC v2.2 added EIP-1271 acceptance. So type B/C support in the matrix depends on the deployed token implementation, not on the scheme alone. The docs do not spell this dependency out.
- Type E (strict 7702 delegate) is listed as unsupported across every path. Whether a future wrapped-signature mode in x402 would fix it is not addressed anywhere fetched.
- The counterfactual + batch-deposit workaround (payerAuthorizer as a controlled EOA) shifts who authorises the voucher; its trust implications are not discussed in the docs.
- Hook-based extensions (trust scoring) would let a third-party service veto settlement. No governance or disclosure requirement for such hooks appears in the docs.
