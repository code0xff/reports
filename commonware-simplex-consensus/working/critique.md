# Critique — commonware-simplex-consensus

## 1. Unsupported claims
- **PBFT and HotStuff attribution.** Draft mentions "PBFT (Castro & Liskov 1999)" and "HotStuff (Yin et al. 2019, the basis of LibraBFT/DiemBFT)" without citations. These are background-of-the-field references rather than load-bearing claims. **Nit** — leave as textbook attributions.
- **"Three-phase pipeline" for HotStuff.** Background phrasing in §SimpleX algorithm; HotStuff lore. **Nit.**
- **"Until enough dummy votes accumulate, the iteration is 'skipped'."** Word "skipped" is paraphrase. **Nit** — wording is consistent with s04/s07 semantics.

## 2. Citation integrity
- All `[^sNN]` refs in `draft.md` and `draft.ko.md` resolve to entries in `working/sources.jsonl` (s01–s13, s15–s18). ✓
- `s14` (Discussion #240) is defined but not cited inline. **Nit** — kept as background context.
- `accessed` dates are all `2026-04-25`, well within 90 days. ✓
- URLs sampled — `eprint.iacr.org/2023/463`, `simplex.blog/protocol`, `docs.rs/.../simplex/index.html`, `eprint.iacr.org/2023/1916` — all returned valid content during gather. ✓
- Quotes match content captured during fetch. ✓

## 3. Reasoning gaps
- "No independent peer-reviewed empirical comparison ... was located." Qualified absence claim, surfaced in Limitations. ✓
- "~6Δ vs ~3Δ per faulty leader" attributed to s17. ✓
- No "everyone / no one" generalisations. ✓
- Numbers always carry conditions (faulty fraction, RTT, AWS instance type). ✓

## 4. Missing counter-evidence
Targeted sweep returned one class-wide critique applicable to Simplex: a Byzantine leader can choose final transaction ordering inside its iteration. This is a leader-based-BFT class limitation, implicitly mitigated by VRF-based leader selection in the threshold variant. **Resolved (was must-fix)** — explicitly add to Limitations of both drafts.

No paper directly disputing Simplex's safety/liveness was located. Shoup (s16) extends rather than contradicts.

## 5. Tone and structure
- Abstract faithful to body. ✓
- Limitations reflects `gaps.md` and `uncertainties.md`. ✓
- "Wicked Fast Block Times" kept as a direct quote with attribution. ✓
- Paragraphs within 6 sentences; bulleted actors section reads cleanly. ✓

## 6. Must-fix vs nit
- **Must-fix (1):** Add explicit mention of leader transaction-ordering manipulation as a class-wide BFT limitation in Limitations of both drafts.
- **Nits (3):** PBFT/HotStuff background citations, "skipped" wording, unused s14 — accepted as deferred.

Action: apply the must-fix; re-run validation.
