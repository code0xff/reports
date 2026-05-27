# Critique — x402-bazaar

Adversarial pass. Findings classified as blocking (must be resolved before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §3 settlement-triggered auto-indexing + four conditions — quoted directly from CDP docs [s01]. **OK.**
- §3.2/§3.3 resource schema and quality-ranking signals — from CDP docs [s01]. **OK.**
- §4 the four discovery endpoints + MCP tools — from CDP docs [s01]. **OK.**
- §5.1 declareDiscoveryExtension code — from the bazaar.ts example [s05]; §5.2/§5.3 from the HeimLabs tutorial [s04]. **OK.**
- §2.1 "no facilitator fee for USDC on Base" — sourced from Yahoo [s03], flagged in `uncertainties.md` as a vendor claim. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to a sources.jsonl entry; unused-source diff is empty.
- HEAD-check: CDP docs, x402 extensions dir, coinbase/x402 all 200; Yahoo returned 429 (rate-limited anti-bot, not a dead link — the URL is valid and was successfully fetched earlier in this session).
- All `accessed` dates are 2026-05-27.

## 3. Reasoning gaps

- §6.2 "auto-indexing double edge" is interpretive but grounded in the documented exemption of newly indexed resources from the 30-day filter [s01]. **OK.**
- §6.3 central facilitator dependency contrasts the CDP-hosted Bazaar with the facilitator-agnostic x402 spec [s01][s09] — fairly framed. **OK.**

## 4. Missing counter-evidence

- A natural counter: "the Bazaar centralises discovery under Coinbase, undermining x402's neutrality." Surfaced in §6.3. **OK.**
- A second counter: "auto-indexing invites spam." Surfaced in §6.2. **OK.**

## 5. Tone and structure

- Abstract reflects the body (auto-indexing, schema, four endpoints, MCP, code). **OK.**
- Limitations honestly reflect `gaps.md` and `uncertainties.md`. **OK.**
- Endpoint paths and code blocks quoted verbatim. **OK.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 0 of note (both natural counters are already surfaced)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
