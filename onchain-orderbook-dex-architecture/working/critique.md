# Critique — onchain-orderbook-dex-architecture

Adversarial verification pass, 2026-06-29.

## 1. Unsupported claims
- All factual sentences in both drafts carry `[^s..]` refs; interpretive sentences marked `_(interpretive)_`; vendor numbers marked `_(vendor-stated)_`.
- No uncited factual assertions found on re-read.

## 2. Citation integrity
- 15 refs (s01–s15) used in both drafts; all exist in `sources.jsonl`. ✔ (s16–s17 added during this pass, now 17.)
- All `accessed` = 2026-06-29 (within 90 days). ✔
- No manual `## References` heading; no `[^s..]:` footnote-definition blocks. ✔
- Source diversity: 2 tier-1 papers (s10, s11), multiple tier-2 primary docs (dYdX, Hyperliquid, Injective, Sei, 0x), tier-3 technical (Consensys, Conduit, DeepWiki), tier-4 news. Good spread. ✔
- Quote spot-check: s01 (dYdX in-memory orderbook), s03 (HyperCore 200k/s), s07 (0x off-chain relay) verified verbatim against fetched pages. ✔

## 3. Reasoning gaps
- Throughput figures attributed and marked vendor-stated, not asserted as benchmarks. ✔
- Market-share numbers given as a time-stamped range, not a single figure; the Aster swing is shown. ✔
- No "everyone/no one" absolutes. The one "no one can secretly reorder" line is a property quote about consensus-state ordering, scoped to Hyperliquid's design[^s03]. ✔

## 4. Missing counter-evidence — **MUST-FIX (resolved)**
- The draft quoted Hyperliquid's docs claiming "full decentralization" and presented verifiability as its strength, **without** the well-documented counter-evidence that Hyperliquid's decentralization is contested: ~24–30 validators, heavy Foundation stake control, closed-source single binary, Foundation power to jail validators / force upgrades, and the March 2025 JELLY manual delisting; Singapore MAS added it to its Investor Alert List (June 2026).
- **Action:** added s16 (CryptoBriefing) and s17 (BeInCrypto / Kyle Samani + MAS) and inserted a counter-evidence paragraph into section (D) and the Discussion, so the "fully on-chain = trustless" claim is qualified by its real-world governance centralization. Resolved.

## 5. Tone and structure
- Abstract faithful to body (same four families + contested-share caveat). ✔
- Limitations mirror gaps.md / uncertainties.md, now also referencing the decentralization dispute. ✔
- No emoji / marketing voice. ✔
- Long paragraphs split. ✔

## 6. Must-fix vs nit
- **Must-fix: 1** (Hyperliquid decentralization counter-evidence) → resolved.
- **Nits: 0** open.
- No open must-fix items. Cleared for publish.
