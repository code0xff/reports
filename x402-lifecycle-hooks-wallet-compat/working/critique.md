# Critique — 2026-09-20

## Citation integrity
- All refs resolve; all 18 sources cited (script).
- A numbering error was caught and fixed before publish: the first draft cited s09/s11/s12/s13 for ERC-6492/ERC-3009/EIP-7702/Permit2, but those ids belong to issue #639/ERC-1271/ERC-3009/EIP-7702. Remapped by context-scoped replacement and re-verified against the id→title map.
- Quotes checked against `quote` fields; the hook return contracts, the matrix rows, both footnotes and the Go allowlist text are verbatim.

## Over-reach checks
- Figure 1's ordering is the docs' described order; the caption says so. The facilitator's internal verify hooks are drawn inside the verify call, which the docs imply but do not diagram.
- "A payment-waiver switch inside the payment system" (§2.3) is the author's characterisation of `grantAccess`; the quoted behaviour is the docs'.
- §3.3's explanation of why a 6492-wrapped signature fails ecrecover is inference from ERC-6492 + Permit2 source, not a docs quote. Marked as reasoning in prose ("배포되지 않은 주소에는 코드가 없으므로…").
- §3.5's spec-vs-implementation reconciliation (ERC-3009 text vs USDC v2.2) is the author's; both sources are quoted.
- The trust-provider proposal is marked single-source and its status "not confirmed".

## Conflicts represented
- ERC-3009 "does not apply to smart contract accounts" vs Circle v2.2 EIP-1271 adoption — both quoted, reconciled explicitly as standard text vs deployed implementation, with the consequence stated (table depends on token).

## Source diversity
- 12 primaries (2 docs pages + markdown source, docs index, V2 post, migration guide, Python CHANGELOG, Go pkg ×2, TS examples, Permit2 source, Circle blog), 4 EIP/ERC specs, 2 GitHub issues. No news or vendor-blog sources were needed.

## Voice
- Body em-dashes: 1 per draft, inside a verbatim docs quote (`spendControls` sentence).
- Repeated openers: none. Section weights: §2 and §3 carry the report; §4 is short because it makes one point.
- No parallel-march closer; §5 ends on the implementer ordering.

## Diagrams
- Two per draft: sequenceDiagram (hook firing points) and flowchart TB (what each page settles). No `;` in any sequence label. Render check after publish.

## Must-fix
- none.

## Nits
- Hook execution semantics remain undocumented upstream; worth an issue against the docs repo rather than a report change.
- A reproduction of the 5×5 matrix against a live facilitator would upgrade §3 from documented to verified.
