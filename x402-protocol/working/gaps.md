# Gaps — x402 Protocol Report

## Pass 1 (2026-04-28)

### Under-sourced claims

- **c01** (HTTP 402 reserved but undefined in RFC 7231): No direct RFC 7231 primary source found. All coverage is secondary (protocol whitepapers and explainers cite this as historical background). Accepted as widely-acknowledged background fact; treated as limitation.

- **c21** (transaction volume metrics): Sources are inconsistent across time periods and methodologies:
  - CryptoSlate (Dec 2025): 75M transactions, $24M settled
  - Sherlock (early 2026): 119M Base transactions, $600M annualized
  - Solana Foundation: 35M+ Solana transactions, $10M+
  - MEXC News: $600M annualized (aggregate)
  - ainvest.com: 92% daily volume collapse from Dec 2025 to Feb 2026 (Dec avg 731K/day → Feb 57K/day)
  The divergence reflects different time windows and methodologies. Draft will present the range with qualifications rather than a single figure.

### Conflicting evidence

- **Transaction volume vs. protocol utility**: BlockEden and CryptoSlate both note that "x402"-branded memecoins inflate on-chain metrics. The 92% collapse in daily volume (Dec 2025 → Feb 2026) suggests speculative activity drove early peaks. Genuine protocol usage is difficult to isolate independently. Both sides presented in Limitations section.

### Missing primary sources

- **RFC 7231 (HTTP 402 origin)**: Not fetched; IETF paywall not applicable but URL was not tried. Low priority — widely cited background fact.
- **Coinbase original launch post (May 6, 2025)**: coinbase.com returned 403. Launch date confirmed via multiple secondary sources (CryptoSlate, Sherlock, search snippets).
- **Coinbase ERC-20 support announcement**: coinbase.com returned 403. Features confirmed via FAQ and network-support docs.
- **Formal x402 specification file (specs/x402-specification.md)**: Returned 404 on both coinbase/x402 and x402-foundation/x402 repos. Content covered by scheme spec, CDP docs, and V2 launch article.

### Open questions resolved

- ROADMAP.md content: confirmed as placeholder "(update coming soon)" — cited as c25.
- Permit2 proxy address: confirmed as 0x402085c248EeA27D92E8b30b2C58ed07f9E20001 from scheme spec.
- September 2025 Foundation launch: confirmed by Cloudflare blog and Sherlock.

### Remaining gaps after pass 1

1. **c01**: No RFC primary source. Accept as limitation; background claim supportable from secondary sources.
2. **c21**: Metric inconsistency across sources. Will present range and note data quality issues.

**Verdict**: All other claims are minimally sourced. Gap list is acceptable for draft — open items are logged in Limitations section.
