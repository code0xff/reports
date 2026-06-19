# Critique — ERC-7579: Minimal Modular Smart Accounts

Adversarial verification pass. `draft.md` (en) and `draft.ko.md` (ko) are translations
of the same content; findings apply to both.

## 1. Unsupported claims
- Every paragraph swept for uncited factual/technical assertions; all carry `[^s..]`.
- Interpretive/synthesis sentences (minimal-vs-prescriptive framing, 6900/7579 adoption,
  "trust decision comparable to upgrading the account") are marked `_(interpretive)_` or
  attributed. No universal ("everyone/no one") claims.

## 2. Citation integrity
- All `[^s..]` refs in both drafts (26 each) resolve to ids in `sources.jsonl`; 0 orphans. ✓
- All 26 sources `accessed: 2026-06-19` (0 days), within 90. ✓
- URL liveness: sampled 6 (eip-7579, eip-6900, eip-7484, erc7579-implementation,
  rhinestonewtf/safe7579, OZ account-modules) → all HTTP 200. ✓
- Quote spot-check (re-fetched eip-7579): module type IDs (1/2/3/4), execution-mode bytes
  (CallType 0x00/0x01/0xfe/0xff, ExecType 0x00/0x01), and the "untrusted hooks → denial of
  service" security sentence all confirmed verbatim. ✓

## 3. Reasoning gaps
- Causation: the "no portability before a shared interface" motivation is framed as the
  standard's stated rationale, not an empirical measurement.
- No orphan numbers: only spec constants (type IDs, mode bytes), "14 audited modules", and
  "~3x spec length" — each attributed to a source.
- "Most widely used" (Kernel) flagged as vendor/third-party-stated, not asserted as fact.

## 4. Missing counter-evidence
- Counter-sweep run. Independent/technical material shows ERC-6900's prescriptiveness is a
  deliberate safety/storage-isolation trade-off (per-module storage namespacing, stricter
  validation sub-types), not merely overhead — and that the minimal approach pushes storage
  safety onto implementers.
- The draft had presented ERC-6900 mostly via its costs ("3x length", "restricting").
  **Balance fix applied** (§5, both drafts): added a sentence framing 6900's prescriptiveness
  as intended built-in safety vs 7579's flexibility-for-implementer-responsibility trade-off
  [^s16][^s17][^s01]. Classified as a nit (source-balance), now resolved.

## 5. Tone and structure
- Abstract faithful to body (motivation, interface set, taxonomy, modes, validation flow,
  ecosystem, 6900 contrast, sibling ERCs, security). ✓
- Limitations honestly mirrors gaps.md/uncertainties.md: single-primary (self-describing
  spec), vendor/author-led framing, snapshot churn, conditional security. ✓
- No emoji/marketing voice; vendor superlatives quoted and tagged. ✓
- Paragraph lengths controlled via bolded sub-leads (each ≤ ~6 sentences). ✓

## 6. Must-fix vs nit
- **No must-fix items.**
- nit (resolved): ERC-6900 presented one-sidedly → balancing sentence added (§5).
- nit (accepted): c03/c06/c07/c08/c09/c16 rest on the spec itself (single primary) — correct
  for a standard describing its own interfaces; noted in Limitations.
- nit (accepted): "minimal/unified" framing is author/vendor-led — flagged in uncertainties.

## Result
No open must-fix items. `validate-report` passes after revision.
