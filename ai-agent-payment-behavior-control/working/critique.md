# Critique — Behavior Control Techniques for AI Agent Payments

Adversarial verification pass. Both `draft.md` (ko) and `draft.en.md` (en) audited;
they are translations of the same content, so findings apply to both.

## 1. Unsupported claims
- Swept every paragraph for factual assertions lacking `[^s..]`. All factual/technical
  assertions carry a citation. Synthesis/interpretive sentences (enforcement-strength
  spectrum, control-location differences, on-chain key-compromise caveat) are explicitly
  marked `_(interpretive)_` per PROTOCOL §Draft.
- The control-dimension taxonomy in §1 is a synthesis; it is backed by s10/s29/s33 and
  framed as "synthesizing the documentation," not as a single canonical standard. OK.

## 2. Citation integrity
- Every `[^s..]` ref in both drafts resolves to an id in `sources.jsonl` (now incl. s07/s22/s51). ✓
- All 51 sources have `accessed: 2026-06-18` (0 days old, within 90). ✓
- URL liveness: sampled 6 representative URLs (EIP-3009, OWASP LLM01, Stripe Issuing,
  OpenAI Agents SDK, arXiv 2507.08249, smartsessions GitHub) → all HTTP 200. ✓
- Quote spot-check (3 sources re-fetched):
  - s41 OWASP LLM01 — "fool-proof methods of prevention" + HITL recommendation: verbatim match. ✓
  - s42 OpenAI Agents SDK — "the agent never executes, preventing token consumption and tool execution": verbatim match. ✓
  - s51 Crossmint comparison — "broader card-based implementations are still maturing" / "need elements of all four": verbatim match. ✓
- s49 (Acharya) is `access_limited:true, quote:null` and is cited only as a landing-page
  lead, with prose explicitly withholding direct quotation. ✓

## 3. Reasoning gaps
- Causation vs correlation: the Grok $150k case (s40) is presented as one illustrative
  case, attributed ("analysis concluded"), not as proof of frequency. OK.
- Single-example generalization: avoided — Grok + AP2 red-team (s39) + OWASP (s41)
  jointly support the "guardrails are bypassable" claim, not one case alone.
- Numbers: only $150k (with case context) and protocol versions appear; no orphan stats.
- No "most people / everyone / no one" universal claims.

## 4. Missing counter-evidence (the one real risk)
- Counter-sweep run via web search. Found independent material that (a) app-logic
  spending limits are bypassable unless enforced at infrastructure level, and (b) AP2/x402
  etc. are immature, with card-based implementations "still maturing" and no single
  protocol covering all scenarios.
- (a) **reinforces** the draft's on-chain-vs-off-chain enforcement thesis — added an
  explicit off-chain-engine caveat in §4 (Privy s22) noting app-logic limits are bypassable.
- (b) was under-represented — **was must-fix**, now FIXED: added maturity/adoption
  counter-evidence to §7 trade-offs and §8 Limitations citing s51.
- The x402 "secure standard" vs "Five Attacks on x402" tension is already presented in §3.

## 5. Tone and structure
- Abstract faithful to body: lists the four layers, the three conclusions, and the
  snapshot caveat — all present in the body. ✓
- Limitations honestly mirrors `gaps.md`/`uncertainties.md` (vendor-stated marks, single-source
  spots, on-chain caveat, guardrail-efficacy uncertainty, and now adoption immaturity). ✓
- No emoji, no marketing voice. Vendor marketing phrasing is quoted and explicitly tagged
  `_(vendor-stated)_`. ✓
- Paragraph length: layered sections use bolded sub-lead paragraphs, each ≤ ~6 sentences. ✓

## 6. Must-fix vs nit
- **must-fix (1): missing adoption/maturity counter-evidence** → FIXED (s51 added to §7 + §8).
- nit: s07 (Visa newsroom) and s22 (Privy) were uncited orphans → resolved (now cited in §3/§4).
- nit: c20 (control-location) rests on synthesis + s31/s51 — acceptable, marked interpretive.
- nit: c10 strongest paper (s49) access-limited — acceptable, carried by s48 + vendor docs.

## Result
No open must-fix items. Remaining items are accepted nits recorded in
`uncertainties.md`. `validate-report` re-run after revision: passes.
