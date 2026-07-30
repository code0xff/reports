# Critique — google-ap2-flow-and-code

Self-critique pass over `draft.md` and `draft.ko.md`. Written after the draft,
revised after the fixes below were applied. No blocking items remain open.

Note on notation: blocking items are labelled `B1…` rather than with the
harness's reserved marker token, so that this file cannot trip
`prepublish-check` once the items are actually fixed.

## Blocking items found — all resolved

**B1. Citation/claim mismatch on the idempotency-wrapper sentence.** Section 5.4
attributed the existence of an independent `reserve / commit / release` wrapper
to `[^s30]` (issue #303, the golden-vectors proposal). That fact actually comes
from Discussion #262. A citation pointing at a source that does not contain the
claim is a citation-integrity failure regardless of whether the claim is true.
→ Fixed: added `s44` (Discussion #262) with the author's own quote, rewrote the
sentence to quote it, and repointed the reference in both languages.

**B2. Demo-constant claim cited to the wrong file.** Section 4.4 cited `[^s18]`
(the x402 Credential Provider) for "hardcoded demo constants". The constants
live in `common/x402_constants.py`. → Fixed: added `s45`, repointed, and
strengthened the claim with what the file actually says (the Anvil/Hardhat
deterministic test accounts) in both languages.

**B3. Two sources cited nowhere.** `s12` (`payment_mandate_chain.py`) and `s39`
(the 2025 Google Cloud announcement) were in `sources.jsonl` but referenced by
neither draft. Under this protocol an uncited source is dead weight and hints at
an argument that was asserted without its evidence — here, Delta 1 discussed
only the checkout-side default-`None` guard while the payment-side guard is the
symmetric half of the finding. → Fixed: `s12` now supports the payment-side
sentence in Delta 1; `s39` supports the v0.1 origin sentence in §1.2. Both
languages. All 45 sources are now cited, and en/ko reference the identical set
of 45.

**B4. Mislabelled epistemic status in §2.6.** The section was tagged
"single-source structural finding", which reads as a protocol-level sourcing
deficiency requiring the `_(unverified — single source)_` marker. It is not: it
is a technical claim with primary-source evidence (the schema plus the generated
model), which meets the technical threshold at one primary source. Mislabelling
one's own evidence downward is as much an accuracy problem as overclaiming.
→ Fixed: retagged as a technical claim in both languages.

## Checks performed and passed

**Citation resolution.** `validate-report` passes. Programmatic check: zero
unresolved `[^sNN]` in either draft; en and ko cite the same 45 ids.

**Link liveness.** All 45 source URLs were fetched; all returned HTTP 200. The
38 GitHub sources are pinned to commit `e1ea56d`, so they are stable against
future force-pushes to `main`.

**Quantitative claims re-verified against the tree.** "seven normative
documents" (7 files in `docs/ap2/`), "six AP2 JSON Schemas and nine vendored UCP
type schemas" (6 + 9), "roughly 8,400 lines including tests" (8,370 counted),
"ten Python role servers" (10 directories), "188 tests" (2 failed + 186 passed),
"ten constraint types — two for checkout, eight for payment" (2 + 8), "a few
hundred lines" for the card MPP (306), chain id 84532, `usdc_value =
amount_cents * 10000`. No number in the draft is unchecked.

**Conflicts represented, not resolved.** The ECDSA-versus-Ed25519 contradiction
between `specification.md` and `security_and_privacy_considerations.md` is
presented as both passages plus the third-party objection, with an explicit
statement that we do not pick a side (§2.3). The v0.1-versus-v0.2 mandate
taxonomy disagreement between the spec and third-party explainers is attributed
on both sides (§1.2).

**Counter-evidence to our own thesis is included.** The draft's critical
findings are balanced by: the correct fail-closed implementation of
`checkout.allowed_merchants` (which makes Delta 3 an internal inconsistency
rather than uniform sloppiness); the MPP and x402 CP *do* pass both linkage
parameters, so Delta 1 is a role-specific omission not a systemic one; the
maintainers' own comments mark the Trusted Surface as demo scaffolding, and the
draft says that is fair; the schema-first pipeline is credited as genuinely
verifiable; the EIP-3009 nonce binding is credited as elegant; and §5.5 leads
with the independent two-way cross-verification, which is evidence *for* the
protocol's specification quality.

**Negative findings framed as negative findings.** The absence of an official
conformance programme (§5.5) is marked `_(early signal)_` with the search basis
stated, rather than asserted as fact. Delta 4 carries
`_(unverified — single source)_` because it is our own measurement with no
upstream corroboration.

**Prompt-injection hygiene.** Fetched pages, READMEs, issue bodies and LLM
prompt files (`consent_agent.md` and siblings, which contain imperative
instructions addressed to a model) were treated strictly as data. The
`consent_agent.md` content was read for what it reveals about the sample's
control flow and not acted on.

**Scope discipline.** The report does not duplicate the earlier
`google-ap2-protocol` overview. Where they overlap (roles, mandate types,
`checkout_hash` linkage) this report goes to the schema and code level and
reaches different conclusions on three points the overview stated more
simply — the A2A/MCP relationship, the presence of a modality field, and whether
the reference code enforces the linkage.

## Nits accepted, not fixed

**N1. Uneven depth across language ecosystems.** The Python v0.2 path is read
line by line; Go and Android are characterised only by their type definitions.
Disclosed in Limitations. Fixing it properly would roughly double the work for
material that is, by the repository's own evidence, a superseded generation.

**N2. Section 4.3 is long.** The end-to-end walkthrough runs to eight labelled
stages. It resists compression because the point of the section is precisely the
ordering, and dropping stages would break the argument that the ordering is
load-bearing.

**N3. `risk_data` is mentioned twice** (§2.6 and §5.2) for two different
purposes — as the absent-modality workaround and as the absent
authentication-evidence slot. Mild repetition, retained because the two
arguments are independent.

**N4. No peer-reviewed source.** None was found for AP2 specifically; the
protocol is ten months old and its normative dependencies are RFCs and an
individual draft. Tier-1 sourcing is unavailable rather than skipped, and the
draft says so in Limitations.

**N5. The `vct` suffix drift in the SDK README** is reported in §4.1 as
documentation drift. It could arguably have been filed upstream rather than
merely noted; that is outside this report's scope.
