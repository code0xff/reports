# Critique — spl-token-2022-vs-erc20

Adversarial verification pass. Draft assumed wrong until shown otherwise.

## 1. Unsupported claims
- Swept every paragraph in `draft.md` and `draft.en.md` for factual assertions lacking a `[^s..]` ref.
- All factual/technical assertions carry a citation. The two interpretive claims (systemic-risk trade-off; source of tooling uniformity) are explicitly marked `_(해석)_` / `_(interpretation)_` and still cite tier 2–3 sources (s23, s25, s26).
- The only uncited sentences are framing/transition sentences and the Abstract's thesis restatement, which paraphrase cited body content — acceptable.
- **Verdict: no must-fix.**

## 2. Citation integrity
- Every `[^sNN]` used in both drafts (s01–s28, s30–s36) resolves to an id in `sources.jsonl`. ✔
- `s29` (trust-5 Medium USDC blog) was uncited after c16 was upgraded to s32/s33/s34 → **removed** to avoid a dangling bibliography entry.
- All `accessed` dates = 2026-07-22 (today), within 90 days. ✔
- Sample HEAD checks (curl -L): eip-20, confidential-transfer, uniswap integration-issues, PayPal PYUSD blog → all HTTP 200. ✔
- Quote spot-check (3 random, verbatim grep against live pages):
  - s27 Uniswap "Fee-on-transfer tokens will not function with our router contracts" → OK ✔
  - s13 Solana confidential transfer "token account addresses remain public" → OK ✔
  - s16 EIP-20 "set the allowance first to 0" → OK ✔
- **Verdict: no must-fix.**

## 3. Reasoning gaps
- No causal claims asserted from mere correlation.
- Single-example generalisation: PYUSD was the only named Token-2022 issuer. Draft explicitly qualifies it as "a concrete production case, not evidence of broad market share" and lists the missing market-share data under Limitations. ✔
- No numbers quoted without timeframe (the report is largely qualitative; the one figure — "trillions in value" — is a direct attributed quote from s23, flagged as a technical-writer framing).
- No "most people / everyone / no one" absolutes. Absence claims ("ERC-20 standard has no fee/freeze") are scoped to the EIP-20 canonical text and flagged in Limitations.
- **Verdict: no must-fix.**

## 4. Missing counter-evidence — [MUST-FIX, now resolved]
- Original draft presented Token-2022's protocol-level features largely as advantages, with only a generic "new attack surface" caveat.
- Counter-evidence sweep (web) surfaced concrete dissent: Neodyme's "Don't shoot yourself in the foot with extensions" documents that naive integrations can lose funds, and that integrators must inspect which extensions a mint carries; ecosystem venues (e.g. Orca) restrict certain extensions (PermanentDelegate) and note incompatible combinations (ConfidentialTransfer + TransferHook).
- **Action taken:** added source s36 (Neodyme, technical/trust-3) and rewrote the "Security surface" analysis in both drafts to argue that moving features to the protocol level relocates integration risk rather than removing it, tying it structurally to the ERC-20 fee-on-transfer hazard (s27).
- The Orca TokenBadge / ConfidentialTransfer+TransferHook incompatibility detail could not be captured as a verbatim quote from a stable source, so it is described generally in prose without an over-precise citation, and noted in uncertainties.md.
- **Verdict: resolved. No longer open.**

## 5. Tone and structure
- Abstract faithful to body: yes — it states the shared-program-vs-per-contract thesis the body develops, and does not claim more.
- Limitations honestly mirrors gaps.md / uncertainties.md (no quantitative adoption data, crypto depth, absence-claim caveats, interpretive stances, secondary sourcing).
- No emoji, no marketing voice. Inline-code used for identifiers/addresses only.
- Paragraph length: split the security-surface addition into two paragraphs to keep each ≤ ~6 sentences.
- **Verdict: no must-fix.**

## 6. Must-fix vs nit — summary
- **Must-fix: 1** — missing Token-2022 counter-evidence (§4). **RESOLVED** this pass.
- **Nits (addressed):** removed orphan source s29; kept interpretive labels explicit.
- **Nits (deferred, non-blocking):** could add EIP-3009 as another Ethereum extension example; could quantify Token-2022 adoption share in a future revision.

**No open must-fix items. Cleared for publish.**
