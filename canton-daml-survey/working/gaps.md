# Gaps — Canton and Daml

After one gather sweep (2026-04-23).

## Under-sourced claims
- None. Every claim c01–c22 has at least one primary or independent source. Interpretive claims (c18, c19, c20, c21, c22) are supported by at least one vendor source plus at least one independent interpretation or news source.

## Sources that conflict
- **Canton Network whitepapers (s05, s06)** are authoritative but access-limited (binary PDFs not decoded by the fetcher). Their key claims are corroborated by vendor blog posts (s04, s07) and docs (s08). If a precise quantitative number from those PDFs is ever needed, re-fetch and extract directly.
- **Super Validator reward split** is quoted as 35 / 50 / 15 in some third-party writeups and as 20 / 62 / 18 in the Digital Asset docs (s08). We cite only the s08 figures with an "evolving" qualifier to avoid importing the third-party framing silently.

## Sections without a primary source
- None. Architecture section leans on primary docs (s04, s21, s08). Academic coverage is thin (only s35), which is itself a finding and is flagged in c21.

## Open questions surfaced during reading
- Are Canton's specific performance numbers (TPS, finality latency, fee cost) reproducible by an independent benchmark? Not answered today and logged as a limitation.
- What is the exact license of every Canton Enterprise sub-component (PQS, Shell, DA Utilities, Canton Node Operator)? The enterprise docs describe scope but not per-component license. Not needed for current claims; logged for future deep-dive.
- How will Canton Coin behave across governance votes and fee-market changes after mid-2029? Tokenomics documents (s08) flag the transition but give no concrete post-2029 plan; treated as open and flagged in c22.

## Decision
Proceed to draft. Remaining unknowns are epistemic (future behaviour, independent benchmarks), not evidence gaps; they will be surfaced honestly in the Limitations section.
