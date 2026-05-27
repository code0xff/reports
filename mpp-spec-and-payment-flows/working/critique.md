# Critique — mpp-spec-and-payment-flows

Adversarial pass. Findings classified as blocking (must be resolved before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §2.2–§2.5 header grammar, credential structure, status codes, problem registry — quoted directly from the IETF draft [s01]. **OK.**
- §3.1 charge fields and §3.3 subscription fields — quoted from mpp.dev intent pages [s05][s06]. **OK.**
- §4.3 Stellar Soroban ed25519 channel — quoted from Stellar developer docs [s10]. **OK.**
- §5.1 Stripe mppx code + dual 402 challenge — quoted from Stripe docs [s07]. **OK.**
- §4.1 "sub-100ms / $0.0001" — sourced from the Formo explainer [s09] and flagged in `uncertainties.md` as explainer-stated. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to a sources.jsonl entry; the unused-source diff is empty.
- Eight sampled URLs (IETF draft, mpp-specs, mpp.dev/protocol, charge, subscription, Stripe, Cloudflare, Stellar) all returned `200`.
- All `accessed` dates are 2026-05-27.

## 3. Reasoning gaps

- §3.2 session intent is reconstructed because the mpp.dev/intents/session page was 404 at fetch time; the draft says so in-line and in `gaps.md`. (Note: mpp.dev/intents/subscription *is* reachable and was quoted directly.) **OK.**
- §6.2 intent × method orthogonality is an interpretive framing but grounded in the two-registry design [s04][s07]. **OK.**

## 4. Missing counter-evidence

- A natural counter: "MPP is just x402 with extra ceremony." Addressed in §6.4 by pointing to the sister report's head-to-head. **Nit.**
- A second counter: "the IETF draft is individual-submission, not IETF-endorsed." Could be stated more explicitly. **Nit.**

## 5. Tone and structure

- Abstract reflects the body (scheme grammar, three intents, per-method flows). **OK.**
- Limitations honestly reflect `gaps.md` and `uncertainties.md`. **OK.**
- Header/code blocks are quoted verbatim and clearly labelled. **OK.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 2 (deferable: note individual-submission status of the draft; expand the "MPP vs x402" counter)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
