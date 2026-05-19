# Critique — smart-account-providers-deep-dive

Adversarial pass. Each finding is classified as blocking (must be resolved before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §3.2 "ZeroDev = first audited account for ERC-7579" — explicitly cited [s08] and tagged `_(vendor-stated)_` in the prose. **OK.**
- §3.5 "Crossmint MiCA CASP authorisation" — single-vendor source [s35], surfaced honestly with `_(vendor-stated)_`. **OK.**
- §3.6 "Coinbase Agentic Wallets = first wallet infrastructure designed for AI agents" — [s32], `_(vendor-stated)_`. **OK.**
- §5.6 "SpendPermissionManager skips ERC-4337 EntryPoint" — primary [s23] confirms the design choice. **OK.**
- §6.2 "all six converge on signer/policy/action" — explicitly tagged `_(interpretive)_`. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to an entry in `sources.jsonl`.
- A spot HEAD-check of 12 representative URLs (Safe / Privy / Crossmint / Coinbase / GitHub repos) returned 200.
- All `accessed` dates are 2026-05-19 — well within the 90-day window.

## 3. Reasoning gaps

- The feature matrix in §4 marks "EIP-7702 — —" for Privy and Crossmint. That is honest absence (not contradiction): the WalletProvider model and Crossmint's smart-contract model do not need 7702 specifically. Note added in prose. **OK.**
- §6.3 carefully avoids saying that one custody model is better than another. **OK.**

## 4. Missing counter-evidence

- A natural counter: "ERC-6900 is a better modular standard than 7579." The draft handles this in §2.2 by citing the secondary comparison [s29] noting which camps adopted which standard, without ranking them.
- Another counter: "Smart accounts are overrated for agents — a plain EOA with a server-side allowlist is enough." Not surfaced. **Nit** (acceptable; the report's scope is the six providers, not whether smart accounts are needed at all).

## 5. Tone and structure

- Abstract reflects the body: six providers, six axes, code-level patterns. **OK.**
- Limitations section honestly reflects `gaps.md`. **OK.**
- No emoji, no marketing voice. **OK.**
- Some paragraphs in §3.2 and §3.6 are dense; readable but could be tightened. **Nit.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 2 (deferable: surface a "smart accounts unnecessary?" counter; tighten dense paragraphs)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
