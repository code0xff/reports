# Critique — x402-batch-vs-mpp-session

Adversarial pass; each finding is classified as blocking (must be resolved before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §3.1 "batch-settlement announced 13 May 2026" — cited [s07][s08]. Both are Cointelegraph-family. Vendor-amplified but consistent. **OK.**
- §3.3 "channelId = EIP712Hash(ChannelConfig) under x402 Batch Settlement domain" — pulled directly from canonical EVM binding [s04]. **OK.**
- §3.4 deposit collector contract addresses — quoted verbatim from [s04]. **OK.** Single primary source, but it is the canonical binding spec; no qualifier needed.
- §4.2 "server tracks only the highest commitment" — quoted from Stellar guide [s15] which is a first-party Stellar Developer Foundation source. **OK.**
- §4.5 mpp-rs advisory — cited [s31]; this report is explicit that the defect is in the SDK, not in the protocol. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to an entry in `sources.jsonl`.
- 11 sampled URLs (x402-foundation repo, docs.x402.org, mpp.dev, mpp-specs, IETF draft, Stellar guide, Tempo docs, mpp.dev guide, mppx repo, Cointelegraph, Cloudflare blog) all returned `200`.
- All `accessed` dates are 2026-05-20.

## 3. Reasoning gaps

- §5 "x402 batch-settlement = one-merchant-many-users vs MPP session = one-user-one-merchant" — argued from the spec's settlement primitives (`(receiver, token)` sweep vs. "highest commitment" closure). This is an interpretive call about traffic shape, explicitly marked `_(interpretive)_`. **OK.**
- §6.4 — the cross-chain comparison says "EVM uses EIP-712 + ecrecover instead of ed25519." Spec-supported on both sides. **OK.**
- §7.1 "fit by scenario" — explicitly tagged `(interpretive)`. **OK.**

## 4. Missing counter-evidence

- A natural counter: "channel-based payments are a 2018-era abstraction and L2 + native batching makes both standards unnecessary." Not surfaced in the draft. **Nit** — out of scope for a head-to-head; can be a follow-up report.
- A second counter: "Lightning Network channels already solved this in 2018." Not surfaced. **Nit.**

## 5. Tone and structure

- Abstract reflects the body. **OK.**
- Limitations honestly reflect `gaps.md`. **OK.**
- No emoji or marketing voice. **OK.**
- Code snippets are short enough to read. **OK.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 2 (deferable: surface "channels are obsolete" counter; mention Lightning)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
