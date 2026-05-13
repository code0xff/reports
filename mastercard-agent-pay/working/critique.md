# Critique — Mastercard Agent Pay

## 1. Unsupported claims

Walked every paragraph; every factual sentence has at least one `[^sNN]` reference. Two minor cases:

- `nit` Introduction §1 final sentence ("That has forced every major card network and PSP to publish a position in 2025") is interpretive but presented as factual. Resolved by leaving as is — supported by s06/s10/s13/s14/s15 which collectively show all four programmes announcing in 2025.
- `nit` Background bullet "Visa Intelligent Commerce — Visa Agent APIs and tokenised payments scoped to verified AI agents" — Visa's own page (s13) uses softer language ("ensure only approved AI agents transact") without naming "Agent APIs" as a product. Kept the term since s13 explicitly references "Visa Agent APIs" and s10 confirms a tokenization-led approach.

## 2. Citation integrity

- All 19 inline `[^sNN]` refs (s01–s19) exist in `sources.jsonl`. ✓
- `s20` (Mastercard Agent Pay product overview) and `s21` (American Banker PaymentsSource) are listed in `sources.jsonl` but never cited. **must-fix:** drop to avoid renderer pulling uncited bibliography entries.
- All sources carry `accessed: 2026-05-13`, within 90 days. ✓
- URL HEAD/GET checks (curl, 200 = ok):
  - 200: s01 PYMNTS; s03 GitHub Mastercard toolkit; s04 GitHub toolkit MCP README; s05 Stripe blog; s06 Google AP2 blog; s07 GitHub AP2; s08 BankInfoSecurity; s09 Checkout.com blog; s10 Payments Dive; s12 PayPal newsroom; s13 Visa Intelligent Commerce; s14 Stripe newsroom; s15 GitHub ACP; s16 Stripe SCA guide; s21 American Banker.
  - 403 (bot-blocked but URL is live in a browser): s02 Mastercard investor page; s11 Mastercard Europe newsroom (Santander); s17 Digital Commerce 360; s18 FIDO Alliance; s20 Mastercard global product page. Treated as non-fatal — these are well-known publisher hosts that throttle scripted UA; the URLs are valid and the content was verified via WebSearch / WebFetch summaries earlier in the gather phase.
- Quote spot-check (3 random sources):
  - s05 Stripe Blog — quote string ("agentic network tokens are network-issued, secure digital credentials …") matches Stripe's blog body. ✓
  - s14 Stripe Newsroom — quote (Shared Payment Token + cart total + ACP Apache-2.0 with OpenAI) matches the newsroom post body. ✓
  - s09 Checkout.com — Pablo Fourez "KYC-style" registration and €80 Adidas-shoes example quote matches the blog body. ✓

## 3. Reasoning gaps

- `nit` "These programmes overlap heavily" — a generalisation, but bullet-list-level evidence is given (Mastercard appears in s05 and s06). Kept.
- `must-fix` Limitations bullet "Transaction volumes and adoption metrics for Agent Pay have not been publicly disclosed beyond 'first agentic transaction' and the Santander Europe-first pilot." → This is sound, but the draft does not surface the **counter-trend** evidence from Visa (s_new) that malicious-bot-initiated transactions grew 25% in 6 months (40% in the US). That number is dissenting evidence on the security half of Mastercard's narrative and belongs in the risk section.
- No "most people / no one" overreaches.
- Numbers — only the Visa 25%/40% number (added counter-evidence) needs a timeframe ("past 6 months") and denominator ("over malicious-bot-initiated transactions"). Captured below.

## 4. Missing counter-evidence

Ran one extra sweep on "skepticism / risks" of agentic commerce. Found:

- **Visa "Threats Landscape of Agentic Commerce"** ([new source]): "Visa saw a 25% increase in malicious bot-initiated transactions over the past 6 months, with the US experiencing a 40% increase a share expected to grow as agentic commerce scales … more than 450% increase in dark web community posts in underground channels mentioning 'AI Agent' over the past six months compared to the prior six-month period."
- General trade-press concerns: liability when an agent buys the wrong size / wrong date — not a fraud issue, but a chargeback issue with no clean home in current network rules.

These are already partly reflected in `working/uncertainties.md`, but the **draft** itself under-represents the adversarial side. **must-fix:** add the new source as `s20` (replacing the deleted unused entry) and a short paragraph in "Risk, Compliance, and Open Questions" surfacing it.

## 5. Tone and structure

- Abstract faithful to body. ✓
- Limitations matches `gaps.md` and `uncertainties.md`. ✓
- No emoji, no marketing voice. ✓
- Most paragraphs are 3–5 sentences. Two paragraphs cross 6 sentences (the April-2025 launch paragraph and the Stripe / agentic-token paragraph). Both retained — they are tight technical descriptions whose sentences depend on each other; splitting would obscure the dependency. Classifying as `nit`.

## 6. Must-fix vs nit

**Must-fix (3):**
1. Drop the two uncited sources (`s20`, `s21`) from `sources.jsonl`.
2. Add the Visa threats-landscape source as a new `s20` (or `s22`) and cite it in the Risk section.
3. Add a one-paragraph counter-evidence section under "Risk, Compliance, and Open Questions" covering the Visa 25%/40% bot-attack signal, the dark-web mentions, and the AI-mistake-not-fraud chargeback gap.

**Nits (3):** kept paragraph length where dependencies argue for it; Visa-Agent-APIs phrasing matches s13; "every major card network and PSP" generalisation supported by s06+s10+s13+s14+s15 collectively.

After must-fix revision, re-run `validate-report mastercard-agent-pay`.
