# Resume — eip-8130-and-eip-8141 (2026-09-15)

## What these are
- **EIP-8130 Keystore Accounts** — Chris Hunter (Coinbase, @chunter-cb), Draft,
  Core, created 2025-10-14. New EIP-2718 tx type + onchain Keystore holding
  per-account "actors" bound to "authenticator" contracts. Tx *declares* its
  authenticator so nodes filter on identity instead of simulating wallet code.
  Two adoption profiles (L1 normative/permissive vs L2 configurable/canonical-only).
  No EVM changes.
- **EIP-8141 Frame Transaction** — Vitalik Buterin, lightclient, Felix Lange,
  Yoav Weiss, Alex Forshtat, Dror Tirosh, Shahaf Nacson, Derek Chiang,
  Toni Wahrstätter, Stavros Vlachakis. Draft, Core, created 2026-01-29.
  Decomposes a tx into ≤64 *frames* (modes DEFAULT/VERIFY/SENDER) that validate,
  approve gas payment via a new `APPROVE` (0xaa) instruction, then execute.

## Raw specs cached
`/private/tmp/.../scratchpad/eips/eip-8130.md` (134847 B),
`eip-8141.md` (107259 B) from raw.githubusercontent.com/ethereum/EIPs/master.

## The governance story (the spine of §7)
- 2026-03-26/27 ACD: EIP-8141 gets **CFI** for Hegotá.
- 2026-08-27 ACDE: upgraded **CFI → SFI** (Scheduled for Inclusion) for Hegotá.
  Headliner decision deferred to the Hegotá scoping deadline, before Devcon 8.
- ~2026-09 (reported 09-14): **Base/Ethereum collaboration broke down.**
  Base advances 8130 (vibenet devnet, OP Stack, claims up to 63% gas reduction
  on some transfers); L1 advances 8141. Derek Chiang (Ethlabs/ZeroDev) — who is
  also a listed 8141 author — framed it as different chains, different needs.

## Key analytical finding
8130's Motivation attacks designs that make nodes "simulate arbitrary EVM" and
need "reputation systems". 8141 answers exactly that with a bounded
**validation prefix** (MAX_VERIFY_GAS 100_000) and rules "inspired by ERC-7562
but removes staking and reputation entirely". So the reputation half of 8130's
critique is pre-empted; the simulation/tracing half is not. NOTE 8130 predates
8141 (Oct 2025 vs Jan 2026) so it cannot have been aimed at it.

## Neither thread compares them
EIP-8130 and RIP-7560 are **not mentioned** in the 8141 magicians thread;
8141/Frame/RIP-7560 are **not mentioned** in the 8130 thread. The comparison in
this report is the report's own construction, not a reported debate. Say so.

## Next
outline → claims → add-source (use CLI, not hand-edit) → plain-prose skill →
draft.md (ko) + draft.en.md, with mermaid for both validation flows → verify →
publish. Renderer: builtin (yaml+markdown MISSING; 80 reports already rendered
that way — do NOT install, it would change the whole site).
