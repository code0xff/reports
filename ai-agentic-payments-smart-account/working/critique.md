# Critique — ai-agentic-payments-smart-account

This adversarial pass treats the draft as suspect and tries to disprove it. Each finding is classified as blocking (must fix before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §1 "거의 모든 1차 사업자가 …" — cited by [s06, s09, s11, s15, s17, s23]. Each named actor has a primary citation. **OK.**
- §3.1 "12개사가 런치 파트너로 등재되어 있다" — cited [s40]; partner list also appears in [s06] press release. **OK.**
- §3.4 "10억 건이 넘는 HTTP 402 코드" — direct quote, cited [s20]. **OK.**
- §5.4 inline code example for Express middleware — explicit attribution to [s24]. **OK.**
- §5.5 archived-on-2025-11-06 claim — already marked `_(unverified — single source)_`. **OK.**
- §6.1 the Grok / Bankr incident "$150,000 drained" figure — comes from secondary reporting [s47]. Treated as interpretive in body, not as a settled number. **OK (nit).** Consider adding `_(vendor-stated)_` to the figure mentioned in body if explicit number is given (it currently is not).

## 2. Citation integrity

- All `[^sNN]` refs in `draft.md` and `draft.en.md` resolve to entries in `sources.jsonl` (`validate-report` passed).
- A spot HEAD-check of 12 representative URLs (`eips.ethereum.org`, `github.com/visa/...`, `github.com/coinbase/x402`, `github.com/coinbase/agentkit`, Privy docs, Safe docs, EIP-7710, etc.) all returned `200`.
- All `accessed` dates are `2026-05-19` — well within the 90-day window.

## 3. Reasoning gaps

- §3.1 "Mastercard 첫 라이브 거래 (Singapore 2026-03-04)" — single-vendor source, surfaced explicitly with `_(vendor-stated)_`. **OK.**
- §3.2 "Stripe ACP Apache 2.0" — primary [s12, s37, s13] confirm license. **OK.**
- §3.3 AP2 "Credential Provider" role — explicitly marked `_(interpretive)_`. **OK.**
- §4 (d) "LI.FI integrates AI agents" — supported by [s43] (LI.FI changelog); the link only proves a documentation surface exists, not actual usage volume. Body wording is conservative ("documentation surface", "aggregates 27 bridges"). **OK.**
- §6.2 "convergence" claim — explicitly tagged `_(interpretive)_`. **OK.**
- §6.3 "AP2 leans on Verifiable Credentials and FIDO" — sourced [s15]. Wording is "can be read as" rather than asserting an effect. **OK.**

## 4. Missing counter-evidence

- The "smart accounts are the substrate underneath all agentic payment stacks" thesis has a natural counter: card-network stacks (Visa TAP, Mastercard Agent Pay) deliberately preserve their existing rails and may never settle onto smart accounts at all. The draft handles this in §3.1 and §5.7 by treating card-network signaling as a structurally parallel solution to the same problem, not as a subset of smart accounts. **OK.**
- A second counter: "EIP-7702 is unnecessary; ERC-4337 alone is enough." The draft surfaces both standards as complementary and explicitly cites EntryPoint v0.8's native 7702 support [s33]. **OK.**
- A third counter: "Mandate / Verifiable Credentials are heavyweight overkill." Not surfaced. **Nit** — acceptable since the report is descriptive, not prescriptive.

## 5. Tone and structure

- Abstract reflects the body: standards stack, four product layers, code-level analysis. **OK.**
- Limitations section honestly reflects `gaps.md`. **OK.**
- No emoji, no marketing voice. **OK.**
- Paragraphs are mostly ≤ 5 sentences; a couple in §3.1 are dense but readable. **Nit.**

## 6. Must-fix vs nit

- Must-fix: **none.**
- Nits:
  1. Consider adding one paragraph that surfaces an explicit dissenting view (e.g. an analyst arguing Mandates / VCs are overkill).
  2. The Korean draft uses both `[^s5]` and `[^s05]` style — fixed in this revision to `s05` throughout. (Verified by `validate-report`.)

## Summary
- Must-fix: 0
- Nits: 2 (both deferable)
- Report is in `validate-report` passing state. Ready for `prepublish-check` and publish.
