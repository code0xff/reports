# Critique — EIP-8004 Validation

## Must-fix
_None._ All 18 claims are sourced; signature claims are pulled directly from the canonical spec markdown and the ChaosChain reference implementation; community-critique claims are pulled from the Magicians thread.

## Citation integrity
- Every `[^sNN]` in draft.md / draft.ko.md maps to an entry in sources.jsonl (s01–s14).
- Single-source claim about the absence of an explicit expiration window is marked `_(unverified — single source)_`.
- zkML maturity claim is marked `_(early signal)_`.
- Adoption counts are marked `_(vendor-stated)_`.
- Re-execution / AVS framing is marked `_(interpretive — independent commentary describes the pattern; the registry itself is agnostic to it)_`.

## Source diversity
- Primary spec sources: s01 (EIP repo on eips.ethereum.org) and s02 (Jan 2026 spec in canonical contracts repo). These can diverge — the EIP-repo version may lag — but for the code-level signatures the canonical contracts repo is the source of truth.
- Reference implementations: s03 (ChaosChain) and s04 (erc-8004/erc-8004-contracts). Independent of each other.
- Community critique: s05 (Magicians thread). Independent of authors.
- Third-party commentary: s07 (ICME, zkML), s08 (Composable Security), s09 (QuillAudits), s10 (Backpack). Multiple independent voices on the economics-out-of-scope point.
- Adoption: s11 (CoinDesk), s12 (BitcoinEthereumNews), s13 (Bankless Times) — three independent press sources for the deployment / counts claim, plus s04 for the technical deployment list.

## Counter-evidence surfaced
- Drafts present both the spengrah composability critique and the Marco-MetaMask defence, and explicitly describe the Jan 2026 update as a *partial* reconciliation — not a full solution.
- Validator-economics-out-of-scope is surfaced from both critics (Composable Security, QuillAudits) and the spec itself.

## Honest limitations
- The Limitations section names what the report does not cover: formal verification, audit findings, non-EVM ports, validator-market economic modelling, agent-side TEE crypto details.
- The uncertainties register tracks vendor-stated metrics, zkML LLM maturity, and the EXPERIMENTAL spec status.

## Minor nits (deferred)
- The exact deployment list (Ethereum, Base, Arbitrum, Polygon, Optimism, BNB Chain) is repeated across s04 / s12 / s13 in slightly different orderings; the draft uses the canonical-repo ordering. Not a must-fix.
- The Korean draft's heading set uses `## 초록` per house style. The "References" heading is omitted (renderer auto-builds from sources.jsonl) per protocol.

## Verdict
Ship.
