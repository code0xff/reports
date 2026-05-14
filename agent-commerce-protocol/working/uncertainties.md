# Uncertainties — Agent Commerce Protocol (ACP)

These claims are most likely to drift or that rest on vendor-stated or
single-source evidence.

- The "2,000+ agents in 18 months" figure (April 2026 v2 changelog) is
  Virtuals' own count and has not been independently audited.
  _(vendor-stated)_
- The "$1M/month" Revenue Network distribution at Consensus Hong Kong
  (February 2026) is described by industry write-ups in summary form;
  the precise mechanics — whether the cap is per-agent or aggregate —
  are not nailed down.  _(early signal)_
- ERC-8183 is an open community draft on Ethereum Magicians (March 4,
  2026). The thread does not mark a formal Draft/Review/Final status,
  and the standard could change materially before any "Final" listing.
  _(early signal)_
- ACP v1 vs v2 production share is unclear: the v1 SDK
  (`@virtuals-protocol/acp-node`) "continues supporting fixed-price
  jobs" per the changelog, so an unknown fraction of jobs may still
  flow through v1 contracts. The on-chain volume figures we cite
  therefore mix both protocols. _(point-in-time)_
- The ACP × x402 integration is read from a configuration constant in
  the Python SDK (`BASE_MAINNET_ACP_X402_CONFIG_V2`); the SDK README
  does not yet document the integration in narrative form, so the
  exact semantics may evolve.  _(early signal)_
- The Aixbt $500M-cap figure (OpenAIToolsHub) is a market-cap high
  rather than an ACP-specific volume, and is included to anchor the
  scale of Virtuals' agent economy rather than ACP throughput
  specifically. _(adjacent metric)_
