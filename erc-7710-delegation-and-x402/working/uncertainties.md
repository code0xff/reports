# Uncertainties — ERC-7710 Delegation and x402

Register of what stays epistemically shaky even if the draft ships.

- **The relationship is partly architectural, not shipped.** The strongest honest claim is that
  ERC-7710 (standing scoped delegation) and x402 (per-request HTTP payment) are complementary
  layers that *can* compose; a single standardized "ERC-7710-inside-x402" integration is not
  established as of 2026-06. Treat c14 as a reasoned architectural argument and c15 as a
  negative finding; do not overstate a combined product.
- **Vendor-led on both sides.** ERC-7710 / Delegation Toolkit is Consensys/MetaMask-led;
  x402 is Coinbase-led. "Designed for AI agents" framing comes largely from those vendors.
- **Spec status / churn.** ERC-7710, ERC-7715, and x402 (v2) are all young and moving; the
  MetaMask redeem-delegations docs are marked "experimental". June 2026 snapshot.
- **Caveat-enforcer specifics** (names like erc20Streaming/valueLte) come from MetaMask's
  implementation, not necessarily the ERC-7710 spec text itself — attribute to the toolkit.
