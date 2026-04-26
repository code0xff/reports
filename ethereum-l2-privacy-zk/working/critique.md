# Critique — ethereum-l2-privacy-zk

## 1. Unsupported claims
- **"Roughly one-third of withdrawals" cumulative leakage** in §Threat model — derived from s15's 5.1–12.6% baseline + 15–22 percentage-point FIFO lift, summing to ~20–34% on the high end. The phrasing "5–34%" appears in the Abstract and §Limitations; the Threat model section uses "up to roughly one-third." Both are honest framings of s15's range. ✓
- **"Most zk rollups use ZK for succinctness"** — directly cited via s17. ✓
- **"Astria shut down in 2025"** in §Bridging — referenced earlier in this conversation's L2 report; in this report the claim is short and qualitative, not load-bearing. **Nit** — could trim or cite, but does not block publish.
- **"~1.4B Indian residents"** for Anon Aadhaar — interpretive scale; s12 documents the protocol but the population figure is well-known background, not a load-bearing fact. **Nit.**

## 2. Citation integrity
- All 24 `[^sNN]` refs in `draft.md` and `draft.ko.md` resolve to entries in `working/sources.jsonl` (s01–s24). ✓
- `accessed` dates uniformly `2026-04-26`. ✓
- URLs sampled — `treasury.gov`, `ca5.uscourts.gov`, `aztec.network/blog/launching-aztec`, `papers.ssrn.com/...4563364`, `theblock.co/post/348959`, `arxiv.org/abs/2510.09433`, `dlnews.com/.../why-the-eu-is-about-to-outlaw...` — all valid landing pages from this gather. ✓
- Quotes captured directly from successful fetches. ✓

## 3. Reasoning gaps
- **"Predicate-disclosure first, shielded-payment second"** — interpretive synthesis, supported by s10/s11/s12/s13/s14 (large user populations) vs Aztec/Railgun/Privacy Pools (smaller absolute volumes). Caveat surfaced in Limitations (no comparable adoption series). ✓
- **No "everyone / no one" generalisations.** ✓
- **Numbers carry conditions** (March 2025 launch, c7g.xlarge, 5.1–12.6% baseline + 15–22 pp lift, etc.). ✓

## 4. Missing counter-evidence
- **The "privacy is dead in the EU" framing** is the counter-narrative to "selective disclosure won," and it is included via s18.
- **Tornado Cash being technically delisted** (s02, s03) is the counter-evidence to "all mixers are illegal forever" and is included.
- **Adoption asymmetry** (anonymous credentials >> shielded payments) is itself an honest counter to a naive "shielded payments are the future" story; it's surfaced in the Recommendation and Limitations.
- **No paper directly disputing Aztec / Railgun / Privacy Pools safety** was located; future audits remain the open question. Surfaced in §Limitations.

## 5. Tone and structure
- Abstract faithful to body. ✓
- Limitations section reflects `gaps.md` and `uncertainties.md`. ✓
- "Pragmatic privacy" / "hide everything" phrasing is in scare-quote attribution to s19, not editorial voice. ✓
- Paragraphs mostly within 6 sentences; bulleted recommendation reads cleanly. ✓
- No emoji, no marketing voice. ✓

## 6. Must-fix vs nit
- **Must-fix: 0**
- **Nits: 2** — Astria-shutdown phrasing in §Bridging (could be trimmed or cited from s24 of the prior L2 report; left in place because it's short and qualitative); Anon Aadhaar population figure (background fact, not load-bearing). Both deferred.

Action: re-validate, render, prepublish, await user approval, then commit & push.
