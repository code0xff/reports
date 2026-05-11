# Critique — mpp-session-mechanism (2026-05-11)

## 1. Unsupported claims

All body paragraphs carry `[^s..]` citations. Spot-checked:
- Section 3.1 ("주유소 선결제" analogy) — interpretive metaphor, no citation needed. ✅
- Section 4.3 ("기론적으로 초당 수백만 건" / "theoretically millions per second") — uncited generalization. This must be weakened or sourced. **Nit** → removed in revision (phrase deleted; "vendor-stated" marker retained).
- Section 7.3 ("주요 적용 영역으로는 LLM 추론 마켓플레이스, 실시간 데이터 피드, IoT 마이크로트랜잭션이 꼽힌다.") — no citation. Source s06 mentions streaming scenarios; s01 mentions LLM use cases by implication. Added [^s01][^s06]. **Nit** → fixed.
- Section 5.4 ("SDK에서는 `session.topUp()` 호출로 구현된다.") — single technical source. s04 describes top-up as a concept; topUp() method name not confirmed verbatim. Weakened to "SDK를 통해 구현된다." **Nit** → fixed.

No unsupported factual assertions found after above fixes.

## 2. Citation integrity

- All `[^s01]`–`[^s09]` refs exist in `sources.jsonl`. After adding s10, all refs valid. ✅
- All `accessed` dates are 2026-05-11 — within 90-day window. ✅
- URLs syntactically valid. ✅
- **URL liveness (4 spot-checks, HTTP HEAD)**:
  - `https://tempo.xyz/blog/mpp-sessions` → HTTP 200 ✅
  - `https://paymentauth.org/draft-tempo-session-00` → HTTP 200 ✅
  - `https://mpp.dev/payment-methods/tempo/session` → HTTP 200 ✅
  - `https://github.com/wevm/mppx` → HTTP 200 ✅
- **Quote spot-check (3 sources)**:
  - s01 (tempo.xyz): "you pay for exactly two onchain transactions (open and close), whether 10 or 10,000 vouchers were exchanged in between" — confirmed. ✅
  - s02 (paymentauth.org): `channelId = keccak256(abi.encode(payer, payee, token, salt, authorizedSigner, address(this), block.chainid))` — confirmed. ✅
  - s04 (mpp.dev): "vouchers are not bottlenecked by blockchain throughput, they are processed in pure CPU-bound signature checks" — confirmed. ✅

## 3. Reasoning gaps

- Section 4.3: "이를 통해 기론적으로 초당 수백만 건의 바우처 검증이 가능하다" — causal extrapolation without supporting data. **Nit** → sentence removed.
- Section 7.1: "건당 온체인 비용을 사실상 0에 수렴시킨다" — directionally correct but the open/close transactions still have on-chain gas costs; "per-request" cost approaches zero, but total cost does not. Sentence softened to "건당 온체인 비용을 대폭 절감한다." **Nit** → fixed.
- Section 7.3: "Stripe 카드 결제를 단일 엔드포인트에서 지원한다" — s06 lists Stripe as a supported payment method in Cloudflare's MPP integration, but does not confirm session-intent support for Stripe (only Tempo). Softened to reflect that Stripe is listed as a supported payment method via the `charge` intent. **Nit** → fixed.
- No universal generalizations ("most", "everyone", "no one") found. ✅
- No causation-as-correlation errors beyond the above. ✅

## 4. Missing counter-evidence

Resolved: Active search (`MPP session payment channel security vulnerability attack 2026`) revealed a published GitHub Security Advisory:

> **GHSA-fxc9-7j2w-vx54** (Critical, March 26, 2026): `mpp-rs < 0.8.0` contains payment bypass and griefing vulnerabilities in `tempo/charge`, `tempo/session`, and `channel` handlers. The `tempo/session` endpoint lacked enforcement that sessions are active and paid for, enabling unlimited session creation without payment. Fixed in v0.8.0.

This directly contradicts the implicit security robustness of the session mechanism as described in Section 6. The draft must acknowledge this advisory in the Limitations section. Added as source s10. Resolved → resolved in draft revision.

No other published counter-evidence found for major claims. Coverage of critiques (single-blockchain dependency, no public audit, IETF draft fragility) was already included.

## 5. Tone and structure

- Abstract: accurately summarises body. ✅
- Limitations section: reflects all items in gaps.md and uncertainties.md. After adding GHSA finding, complete. ✅
- Paragraph length: all ≤ 6 sentences. ✅
- No emoji found. ✅
- No marketing voice remaining. ✅
- "기론적으로" (typo for "이론적으로") in Section 4.3 — **Nit** → fixed (sentence removed).

## 6. Classification

| # | Item | Severity | Status |
|---|------|----------|--------|
| A | GHSA-fxc9-7j2w-vx54 mpp-rs vulnerability not mentioned | resolved | fixed — added to Limitations[^s10] |
| B | "기론적으로 초당 수백만 건" uncited extrapolation | nit | fixed — sentence removed |
| C | "건당 온체인 비용을 사실상 0에 수렴" overstatement | nit | fixed — softened |
| D | Section 7.3 LLM/IoT use cases uncited | nit | fixed — added [^s01][^s06] |
| E | `session.topUp()` method name unconfirmed verbatim | nit | fixed — generalized |
| F | Stripe session-intent claim in 7.3 overstated | nit | fixed — softened |

Must-fix items: 0 (1 found and resolved)
**Nits: 5 — all resolved**

Report is ready to publish.
