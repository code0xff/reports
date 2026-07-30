# Gaps — after gather sweeps 1–5

Sweeps run: 5 of the 6 permitted. 39 sources in `sources.jsonl`.

## Resolved during gathering

- c01, c02, c05, c07, c08, c11, c12, c13, c14, c15, c16, c17, c18, c19,
  c21, c22, c24, c25, c26, c27, c29, c30 — met the minimum sourcing bar.
- c23 was the highest-risk claim and is now backed by a peer-reviewable
  measurement study of 10,000 ERC-8004 agents (s20) plus a tier-4
  independent report (s22).

## Still open at the ceiling — carried into Limitations

1. **c20 — on-chain attestation infrastructure as an agent-reputation carrier
   is only vendor-stated.** The EAS documentation asserts that agent actions
   and AI evaluations are attested through it (s27), and ERC-8126 permits
   posting attestations to the ERC-8004 Validation Registry (s39), but no
   independent measurement of attestation volume specifically for agents was
   found. The claim is stated in the draft with an explicit
   `_(vendor-stated)_` qualifier and no volume figure.
2. **c06 — Cloudflare's signed-agent deployment is sourced only to
   Cloudflare.** Both the blog (s02) and the developer docs (s23) are
   first-party. The IETF working group charter (s38) confirms the
   standardisation track but not deployment scale. No independent
   measurement of how many origins actually enforce Web Bot Auth was found.
3. **c03 — the mid-2026 traffic-crossover figure could not be verified on
   page.** NBC News (s25) and Tom's Hardware (s26) both restate Cloudflare
   Radar measurements, and both return 403 to scripted access, so their
   wording was never checked against the page; both are now marked
   `access_limited` with `quote: null`. The claim's load-bearing evidence was
   moved to Cloudflare's own December 2025 Radar measurement (s40, verified
   verbatim), and the 57.4%/42.6% crossover is marked unverified in prose.
   The Nieman Lab citation originally used for the default-blocking claim was
   likewise unfetchable and was replaced by Cloudflare's own announcement
   (s11, verified verbatim).
4. **No adoption metric exists for A2A Agent Card signing.** The
   specification defines JWS signing (s21), but no source was found
   quantifying how many published Agent Cards actually carry a signature.
5. **Korean-language sources were not usable.** The Korean-language sweep
   returned only vendor marketing pages (didit.me), which sit at tier 5 and
   were discarded. The report therefore rests on English-language sources.

## Conflicts to represent, not resolve

1. **ERC-8004 registered-agent totals disagree across sources.**
   - Forbes (s22, tier 4): "10,000+ agents and 20,000+ feedback entries"
     during roughly three months on *testnet*, with mainnet registries
     deployed 2026-01-29.
   - The measurement paper (s20, tier 1) analyses a dataset of 10,000
     ERC-8004 agents on Ethereum and finds only 628 with any feedback.
   - Circulating secondary figures found in search results (45,000+ in the
     first month, ~24,500 in March, ~98,000 by late July 2026) come from
     tier-5 crypto-content sites and were **not** admitted as sources. The
     draft cites only s20 and s22 and says explicitly that aggregate totals
     in circulation are inconsistent.
2. **Google's partner-agent validation claim appears in the blog but not the
   docs.** The Google Cloud blog states every featured agent passes a
   "strict four-step evaluation" (s32); the Agent Gallery documentation
   (s33) describes marketplace agents only as requiring administrator
   approval and says nothing about Google-side validation. Both are cited
   and the discrepancy is stated.
3. **Web Bot Auth document lineage.** The architecture Internet-Draft read
   for this report (s01) is version 05, published 2026-03-02 and expired
   2026-09-03, marked as replaced by a successor. Meanwhile the IETF
   `webbotauth` working group is active with an approved charter (s38).
   The draft describes the mechanism from s01 and the institutional status
   from s38 rather than treating either as the whole picture.

## Sections where a primary source was reached

- Identity/authentication: s01, s02, s06, s09, s10, s14, s23, s36, s38 — yes.
- Discovery/registries/marketplaces: s03, s04, s13, s21, s24, s29, s30, s32, s33 — yes.
- Reputation/verification: s05, s27, s39 primary; s17, s19, s20, s28 papers — yes.
- Comparative analysis rests on papers (s07, s28, s34) plus the primary
  specs it compares — acceptable, and the analysis is marked interpretive.
