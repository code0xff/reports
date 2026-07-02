# Critique — eip-2612-in-x402 (adversarial pass, 2026-07-02)

## 1. Unsupported claims
- **[must-fix] "USDC and EURC … cover the dominant share of actual x402 volume"** (Discussion). s20 supports that the hosted facilitator settles USDC/EURC via EIP-3009; no source quantifies their share of volume. → Weaken to what s20 supports.
- **[must-fix] "EIP-3009 remains a Draft ERC implemented natively by few tokens"** (Discussion). "Few tokens" is asserted without a source. → Reword to the supported facts: Draft status (s02), USDC production implementation (s11).
- **[must-fix] "client issue trackers document the v1→v2 migration pain" and "(t402, x402-rs, radius)"** (Ecosystem/Adoption). The radius-cli issue and the x402-rs project are referenced but were not in sources.jsonl (only t402 was, as s09). → Added s27 (radiustechsystems/radius-cli#16) and s28 (x402-rs/x402-rs) and re-cited.
- **[nit] "permit is ubiquitous in post-2020 ERC-20s"** — overgeneralization; sources say "many modern ERC-20 tokens" (s17) and OpenZeppelin ships it as a building block (s15). → Match source strength.
- **[nit] "SDK surface (TypeScript, Go, Python, Java, Rust community ports)"** — TS/Go/Python supported by s17; Rust now supported by s28; Java dropped (repo dir exists but no source line). → Recited.
- **[nit] "probing for a real implementation (e.g., checking nonces/DOMAIN_SEPARATOR and simulating)"** — the parenthetical is our inference, not spec text (s05 only mandates the check + simulation). → Mark as inference.
- **[nit] "one of the more consequential systems"** (Introduction) — editorializing. → "among the most visible".

## 2. Citation integrity
- All 26 `[^sNN]` refs in both drafts resolve to sources.jsonl; no unused sources; no footnote-definition blocks. OK
- All `accessed` dates are 2026-07-02 (today). OK
- URL check: 24/26 return 200. s13 and s22 (medium.com) return 403 to curl HEAD — Medium bot-blocking; both pages were successfully fetched and quoted via WebFetch earlier this session. Not dead links. OK
- Quote spot-check (5 sources against locally fetched files): s01, s02, s04, s17, s18 quotes all present verbatim. OK

## 3. Reasoning gaps
- Numbers have denominators/timeframes: 60% (15.2M/25.4M approvals, to 2021-07), $690k/300 victims (by 2023-05), $55M (2024-01), 731k→57k daily tx (2025-12→2026-02). OK
- Adoption conflict (BlockEden vs InfoQ) is presented with attribution, not resolved. OK
- "EIP-2612's sequential-nonce constraint only binds during onboarding" — follows deductively from s04/s16 architecture; kept as interpretive synthesis with citations.

## 4. Missing counter-evidence
- Ran a targeted sweep for implementations that settle x402 payments *directly* via permit+transferFrom (which would contradict the "EIP-2612 is only the on-ramp" thesis). Result: corroboration instead — Coinbase's ERC-20 launch page and third-party writeups (SKALE) describe the same permit→Permit2 sponsorship design; no direct-permit payment scheme found. No new gap.
- Negative adoption evidence (92% daily-tx decline) is already represented (s21).

## 5. Tone and structure
- Abstract matches body (checked section-by-section). OK
- Limitations reflects gaps.md items 1–3 and uncertainties.md. OK
- No emoji/marketing voice. Paragraphs at most ~6 sentences. OK

## 6. Classification
- must-fix: 3 (all resolved in revision of 2026-07-02, both languages)
- nit: 4 (all applied in the same revision)
- open must-fix: **0**
