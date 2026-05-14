# Gaps — Agent Commerce Protocol (ACP)

Status: closed. Every claim is supported by at least one source from
trust tiers 1–4, and key technical claims (4 phases, escrow, evaluator,
USDC, contract addresses, ERC-8183) are corroborated either by primary
Virtuals docs / GitHub or by an independent industry write-up.

## Resolved
- c01 / c02 / c12: ACP's canonical definition and Butler's role are
  anchored against the Virtuals whitepaper export (s01) and the
  independent RockawayX public-beta write-up (s07).
- c04 / c05 / c06: The four-phase model and the Buyer→Client / Seller→
  Provider rename are confirmed by both the whitepaper export and the
  changelog (s01, s02).
- c07: ACP v2 contract addresses on Base Mainnet are taken from the
  April 2026 v2 changelog (s02).
- c08: USDC standardization is from the Butler onboarding page (s03)
  and reinforced by the broader whitepaper export (s01).
- c09 / c16: Memo→Hook architectural shift and ERC-8183 compliance are
  cross-referenced between the changelog (s02) and the Ethereum
  Magicians thread (s06).
- c10 / c11: SDK languages and the ACP × x402 configuration are read
  directly from the Node.js (s04) and Python (s05) SDK READMEs.
- c13 / c14 / c15: Real-service ecosystem and Revenue Network claims
  draw on Backpack (s08), DataWallet (s09), Gate Learn (s10), and
  OpenAIToolsHub (s11), plus the whitepaper export.
- c17: Adoption count of "2,000+ agents in 18 months" is from the v2
  changelog (s02) and surfaced with an explicit hedge in the draft.
- c18: Dune dashboard URL (s12) and the whitepaper metrics page are
  cited; live numbers were not extractable in this sweep, so the report
  cites the dashboard as the live source rather than copying a stale
  figure.
- c19 / c20: x402 (s13), A2A (s14), and ERC-8004 (s15) provide the
  contrast points; the evaluator-capture risk is the report's own
  interpretive contribution and is marked as such.

## Accepted limitations (deferred to Limitations section)
- Live on-chain volume figures from the Dune dashboard (s12) could not
  be scraped through WebFetch; the report cites the dashboard as the
  authoritative live source rather than freezing a snapshot.
- The exact public-beta launch date for ACP appears as "July 3" in
  RockawayX (s07); the year is treated cautiously and only stated as
  "mid-2025" in the draft to avoid pinning a date the source itself
  cannot fully disambiguate.
- ERC-8183's standardization status (Draft / Review / Final) is not
  explicit in the forum thread, so the draft says "opened for community
  discussion" rather than asserting a formal status.
- No independent academic security analysis of ACP exists at the time
  of writing.
