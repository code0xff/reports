# Uncertainties — solana-stripe-pay-sh

## Vendor-stated / early-signal claims

- **pay.sh provider count**: The 72–75+ figure comes from pay.sh's own website and launch press. Registry is open to GitHub PR submissions, so counts drift. Any specific number should be treated as "as of launch."
- **x402 transaction volume**: The 165 million transactions / 480,000+ agents figure originates from Coinbase's Agentic Market press materials, not an independent audit. _(vendor-stated)_
- **Solana's 65% share of x402 volume**: Sourced from Linux Foundation announcement and banklesstimes.com, both quoting Solana Foundation. No independent verification. _(vendor-stated)_
- **400 ms finality / $0.00025 fee**: Consistent with known Solana network parameters but not independently benchmarked in this context. _(vendor-stated)_

## Structurally immature / likely to change

- **MPP IETF standardization**: Submitted as draft-httpauth-payment-00 on March 30, 2026. IETF drafts expire after six months if not updated. Long-term governance uncertain. _(early signal)_
- **x402 Foundation governance**: Launched April 2, 2026 — less than six weeks before this report. Governance processes still being established. _(early signal)_
- **pay.sh market adoption**: Newly launched as of May 2026. Real-world adoption metrics not yet publicly available. _(early signal)_
- **Stripe's direct Solana integration**: Stripe appears as MPP co-author and x402 Foundation member, but Stripe's MPP product is limited to US businesses (excluding NY and TX). _(early signal)_

## Epistemic limitations

- No independent security audit of solana-foundation/pay or solana-foundation/mpp-sdk is publicly available.
- Solana Foundation's revenue model from pay.sh is not disclosed publicly.
- Comparative performance data (latency, throughput) between pay.sh + x402 vs. MPP vs. traditional API keys is not available from any independent source.
