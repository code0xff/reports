# Critique — agent-payments-smart-account-design

Adversarial pass. Each finding is classified as blocking (must be resolved before publish) or non-blocking (nit, deferable).

## 1. Unsupported claims

- §3 The "10 essential features" list is an editorial synthesis. Every feature is backed by at least one first-tier primary source (EIP / vendor spec). The introduction to §3 explicitly says "this is the report's synthesis." **OK.**
- §3.5 "single EOA driving payments directly is not recommended" — supported by Marino & Juels' position paper [s31]. Tagged appropriately. **OK.**
- §4 "no single infrastructure covers all ten features" — tagged `_(interpretive)_`. **OK.**
- §5.4 — Pimlico ERC-20 Paymaster as canonical pattern, with note that the repo is archived. Surfaced in Limitations as well. **OK.**

## 2. Citation integrity

- `validate-report` passed; every `[^sNN]` resolves to an entry in `sources.jsonl`.
- HEAD-check of six representative URLs (ERC-7710, ERC-7093, arXiv, MetaMask Toolkit, Base Spend Permissions, Circle Paymaster) returned 200/308. The Base Spend Permissions 308 is a normal redirect to https://docs.base.org/.../spend-permissions/ and renders correctly.
- All `accessed` dates are 2026-05-20.

## 3. Reasoning gaps

- §6.2 "two camps absorbing each other rather than one winning" — explicitly tagged `_(interpretive)_`. **OK.**
- §5 Blueprint recommends a specific stack — this is an editorial recommendation, not a discovered fact. The "Time-to-ship vs security-first" subsection in §6.4 surfaces the trade-off and offers an alternative path. **OK.**
- §3.F4 makes the "agent should express outcomes, not asset locations" point. This is partly aspirational; LI.FI's "For Agents" docs surface is cited [s37] but it does not yet prove production usage. **Nit** — acceptable framing; the citation supports "infrastructure exists" not "is widely adopted."

## 4. Missing counter-evidence

- A natural counter: "agents do not need smart accounts; a server-side allowlist on a managed wallet is enough." Marino & Juels' position paper [s31] indirectly addresses this by listing new harm vectors that require contract-side enforcement, but the draft could surface the explicit counter. **Nit.**
- A second counter: "the ten-feature list is too ambitious; an MVP needs three." Out of scope for this report — the report is explicit that it lists requirements, not a minimum viable subset. **Nit.**

## 5. Tone and structure

- Abstract reflects the body. **OK.**
- Limitations honestly reflect `gaps.md` and `uncertainties.md`. **OK.**
- No emoji, no marketing voice. **OK.**
- The feature matrix is dense but readable. **OK.**
- Code snippets are pseudo-code where appropriate and clearly labeled as such. **OK.**

## 6. Blocking vs nit summary

- Blocking findings: 0
- Nits: 2 (deferable: surface "no smart account needed" counter; mark LI.FI-for-agents as infrastructure-not-adoption)
- The report is in `validate-report` passing state and ready for `prepublish-check`.
