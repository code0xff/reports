# Critique — high-performance-ethereum-l2

## 1. Unsupported claims
- **"Pectra (2025) doubled block capacity"** in §Background — supported indirectly by s02 ("Pectra upgrade doubled block capacity, gas-cap will continue to increase until 2026"). ✓
- **"L1 enforces that cap regardless of L2 demand"** in §DA throughput — implied by s04/s05 (PeerDAS scales the cap, BPO forks ratchet it staged) but not directly quoted. **Nit** — phrasing is consistent with the cited material.
- **"7-day exit window is now a competitive disadvantage, not just a UX wart"** in §Recommended — interpretive synthesis grounded in s07 (Stage 1 status) and s19 (zk hard-finality 10-20 min). ✓ Marked interpretive in spirit.

## 2. Citation integrity
- All `[^sNN]` refs in `draft.md` and `draft.ko.md` map to entries in `sources.jsonl` (s01–s26). ✓ — 26 cited / 26 defined.
- All `accessed` dates are `2026-04-25`. ✓
- URLs sampled — `eips.ethereum.org/EIPS/eip-4844` (s03), `blog.ethereum.org/2025/11/06/fusaka-mainnet-announcement` (s04), `vitalik.eth.limo/general/2022/08/04/zkevm.html` (s08), `docs.zksync.io/zksync-protocol/rollup/finality` (s19), `taiko.mirror.xyz/...` (s20) — all returned valid content during gather. ✓
- Quotes captured directly from successful fetches. ✓

## 3. Reasoning gaps
- **"Real-time proving makes Type-1 a credible 2027 target"** — interpretive. Grounded in s09 ("multiple teams have demonstrated real-time proof generation faster than Ethereum's 12-second block times" + "16 min → 16 s, 45× cost reduction"). The 2027 framing is the report's interpretation; acceptable as interpretive synthesis. **Nit.**
- **"Single-threaded geth-fork sequencer = lose two orders of magnitude"** — s13 (100–200 mgas/s) vs parallel-EVM numbers (s10/s11/s12/s14/s15) supports the order-of-magnitude framing. Cross-project comparison caveats are honestly surfaced in §Limitations.
- **No "everyone / no one" generalisations** identified.
- **Numbers always carry conditions** — Celestia ratio is timestamped to 2025/Eclipse, MegaETH 35k TPS to 7-day stress test, Reth to commodity hardware sync, etc.

## 4. Missing counter-evidence
- **The "L1 has scaled, L2-by-default is over" framing** is itself a counter-narrative to the rollup-centric pitch and is included via s02. ✓
- **The "optimistic still wins on cost"** counterview is acknowledged ("optimistic remains a viable second-best — cheaper to ship") even though the recommendation favors zk.
- **Astria shutdown** counterweights the shared-sequencer pitch ✓.
- **No paper directly disputing parallel-EVM safety** was found in this gather; future audits and adversarial benchmarks are an open question. Surfaced in §Limitations.

## 5. Tone and structure
- Abstract faithful to body. ✓
- Limitations section reflects `gaps.md` and `uncertainties.md`. ✓
- "Visa-grade throughput" in §Introduction is rhetorical but not load-bearing. **Nit.**
- Paragraphs mostly within 6 sentences; bulleted recommendation reads cleanly. ✓
- "Wicked Fast" / marketing voice not present. ✓

## 6. Must-fix vs nit
- **Must-fix: 0**
- **Nits: 3** — rhetorical "Visa-grade", "Type-1 a credible 2027 target" interpretation flag, generic "L1 enforces that cap" phrasing. All deferred — not blocking publish.

Action: re-validate, re-render, prepublish-check; await approval.
