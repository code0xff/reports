## Abstract
Bitcoin’s Lightning Network (LN) is a Layer-2 payment network that keeps Bitcoin L1 as the settlement and dispute anchor while moving most payment state updates off-chain.[^s01][^s02] Its technical core is defined by channel state management (BOLT #2), commitment/HTLC transaction formats (BOLT #3), onion routing (BOLT #4), invoice encoding (BOLT #11), and newer Offers (BOLT #12).[^s03][^s04][^s05][^s06][^s07] For AI-agent payments, LN’s practical leverage comes from interface layers like L402 (HTTP 402 payments), Nostr Wallet Connect (NIP-47) delegation, and LNURL UX standards.[^s10][^s11][^s12][^s13][^s14]

## 1) Architectural Goal
LN is designed to process high-frequency, low-value payments off-chain while preserving Bitcoin-backed final settlement when channels are closed or disputed.[^s01][^s02]

## 2) Core Protocol Mechanics
Channels are opened on-chain and then updated off-chain through commitment state transitions.[^s03][^s04] HTLCs enforce conditional atomic transfers across hops, while onion routing limits information exposure per intermediary.[^s04][^s05]

BOLT11 remains the dominant invoice format in production, and BOLT12 Offers aim to improve reusable payment request flows beyond one-shot invoices.[^s06][^s07]

## 3) Operational Layer
In production, payment success depends heavily on liquidity distribution, node uptime, and fee policy rather than protocol compliance alone.[^s16][^s17] Watchtowers add protection for offline periods and channel breach monitoring.[^s09]

## 4) Feature Evolution
AMP allows splitting payments across multiple paths, improving effective success for larger amounts.[^s08] BOLT12 improves request UX and protocol flexibility.[^s07] Splicing/PTLC-related progress is meaningful but still uneven across implementations and deployment contexts. _(early signal)_ [^s02][^s07]

## 5) AI-Agent Payment Interfaces
Three patterns are most relevant:
1. LNURL for URL-oriented payment UX patterns.[^s13]
2. NIP-47 (NWC) for delegated remote-wallet control.[^s14][^s15]
3. L402 for machine-payable API access via HTTP 402 + invoice + macaroon semantics.[^s10][^s11][^s12]

For agentic systems, L402 is especially useful because payment can be embedded directly into API access control and execution flow. _(vendor-stated)_ [^s10][^s11]

## 6) Recommended Control Plane for Agents
Practical controls:
- Scoped spending permissions (amount, counterparty/domain, TTL).
- Invoice integrity checks (amount, expiry, request binding).
- Idempotency and replay protection for retries.
- Audit traceability that links requests, tokens/macaroons, and payment proofs.

These controls are critical when combining wallet delegation (NIP-47) with machine-paid API access (L402). _(inference)_ [^s10][^s14][^s15]

## 7) Risks and Constraints
Research continues to show concentration pressure around major routing nodes and reliability variance under partial information routing.[^s17][^s18] Channel lifecycle costs can rise when on-chain fees spike.[^s03][^s04] For agent payments, standards are advancing quickly, but interoperability and operational assurance are still maturing. _(early signal)_ [^s10][^s13][^s14]
