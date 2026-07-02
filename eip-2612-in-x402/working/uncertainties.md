# Uncertainties

- **x402 v2 spec is in flux.** The `eip2612GasSponsoring` extension and the Permit2 asset-transfer method are recent additions (2026); field names, the canonical `x402ExactPermit2Proxy` address (`0x402085c248EeA27D92E8b30b2C58ed07f9E20001`), and permit `value` semantics (MaxUint vs exact amount) differ between spec text and SDK code and may change. _(early signal)_
- **Adoption numbers are vendor-adjacent.** Transaction/volume figures come from ecosystem blogs and news (BlockEden, InfoQ, Cloudflare); no independent audited measurement exists. The Dec 2025→Feb 2026 daily-transaction decline suggests early figures included experimental/incentivized traffic. _(vendor-stated)_
- **ERC-3009 remains status "Draft"** in the ethereum/ERCs repo despite production use in USDC since 2020; its normative text could still change.
- **Security papers are preprints.** "Five Attacks on x402" (s24) and "Hardening x402" (s25) are 2026 arXiv preprints, not yet peer-reviewed.
- **Phantom-permit claim rests on the discoverer's own writeup** (Dedaub, s14); the incident is corroborated by contemporaneous news but the technical detail is single-origin.
- **DAI's EIP-2612 status is deployment-dependent** — mainnet DAI uses the non-standard variant; bridged/newer deployments may differ. The draft states the mainnet situation only.
