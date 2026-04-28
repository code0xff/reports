# Critique — ai-related-eips (EIP-8126 deep dive edition)

## 1. Unsupported claims
- **"Industry coverage routinely groups protocol-layer changes, identity primitives, and explicitly-AI ERCs under a single 'AI EIP cluster' framing"** — supported via s18, s19, s20. ✓
- **"Mean of applicable categories"** for risk score — directly cited from s05. ✓
- **`AgentVerified` event signature and `getLatestRiskScore` view function** — directly cited from s06 with verbatim Solidity. ✓
- **"trust the verification provider" assumption with ZK mitigation** — interpretive synthesis, grounded in s05/s06 (PDV / ZK proofs / "use multiple independent providers" mitigation). **Nit** — wording is appropriately cautious.

## 2. Citation integrity
- All 20 `[^sNN]` refs in `draft.md` and `draft.ko.md` resolve to entries in `working/sources.jsonl`. ✓ (20 / 20 / 20)
- All `accessed` dates `2026-04-26`. ✓
- URLs sampled — `eips.ethereum.org/EIPS/eip-8004`, `eips.ethereum.org/EIPS/eip-7857`, `eips.ethereum.org/EIPS/eip-8126`, `eips.ethereum.org/EIPS/eip-8141`, `ethereum-magicians.org/.../erc-8126-...`, `erc8126.ai/`, `eip.tools/eip/8128`, `datatracker.ietf.org/.../rfc9421` — valid landing pages from this gather. ✓

## 3. Reasoning gaps
- **"Taking the mean softens a real single-category red flag"** — interpretive design observation, grounded in s05's mean-based scoring. ✓ Marked as interpretive in spirit.
- **"Verification-provider economics are unspecified"** — directly grounded in s06's "Attack Vectors" wording that delegates Sybil cost to ERC-8004 minting cost. ✓
- **No "everyone / no one" generalisations.** ✓
- **Numbers carry conditions** — dates (2026-01-15, 2026-01-29, 2026-02-10, 2026-02-25), required dependencies, risk tier ranges. ✓

## 4. Missing counter-evidence
- **The "ERC-8126 is the verification answer"** thesis is itself counterweighted by the explicit acknowledgment that it is Draft, has no production deployment, and has no audited contracts (Limitations).
- **"AI EIP" framing** is contested in the report itself — EIP-8128 is shown to be identity infrastructure rather than an AI EIP, and EIP-8141 is shown to be protocol infra not AI infra.
- **No paper directly disputing ERC-8126 design** was located; future audits remain open.

## 5. Tone and structure
- Abstract faithful to body. ✓
- Limitations section reflects `gaps.md` and `uncertainties.md`. ✓
- "Honest rationale" / "unstated assumption" framing kept neutral. ✓
- Solidity code block renders cleanly. ✓
- Paragraphs mostly within 6 sentences. ✓
- No emoji, no marketing voice. ✓

## 6. Must-fix vs nit
- **Must-fix: 0**
- **Nits: 2** — (a) "trust the verification provider with ZK mitigation" framing in §Privacy could be marked more explicitly interpretive; (b) the design observation about mean-scoring softening single-category red flags is the report's editorial reading. Both deferred.

Action: render, prepublish, commit & push.
