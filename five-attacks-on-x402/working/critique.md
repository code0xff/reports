# Critique — Five Attacks on x402 Agentic Payment Protocol

Adversarial pass over `draft.md` and `draft.ko.md` against `sources.jsonl`.
The harness validation (`python3 scripts/harness.py validate-report
five-attacks-on-x402`) passes; the work below is the qualitative read.

## 1. Unsupported claims
- Every factual assertion in the English draft carries an `[^s..]`
  citation. Hedge phrases (`_(controlled estimate)_`, `_(early signal —
  single-team evaluation)_`, `_(point-in-time audit)_`, `_(access-
  limited — HackerOne reports are not public)_`, `_(unverified —
  single source)_`) are placed where the supporting source is a single
  preprint or a vendor-stated metric.
- Same status for the Korean draft: same paragraphs, same citations,
  same hedges (translated). No new factual content that lacks support.
- **Status:** no must-fix items in this section.

## 2. Citation integrity
- All 14 footnote refs (`s01`–`s14`, except `s02` which is intentionally
  unused as the broad landing-page anchor) resolve to entries in
  `sources.jsonl`.
- Every source's `accessed` date is `2026-05-14`, i.e. inside the 90-day
  freshness window.
- `curl -L` returns HTTP 200 for all 14 source URLs (verified
  2026-05-14 via the verification lane).
- Spot-checked verbatim quotes:
  - `s08` quote on EIP-3009 ("It is possible for an attacker watching
    the transaction pool to extract the transfer authorization…") —
    present on `eips.ethereum.org/EIPS/eip-3009`.
  - `s11` quote on Permit2 ("Owners can sign messages to transfer
    tokens directly to signed spenders.") — present on the Uniswap
    Permit2 README.
  - `s06` quote on V2 metrics ("Since its May 2025 launch, x402 has
    processed over 100M payments…") — present on the V2 launch post.
- **Status:** no must-fix items in this section.

## 3. Reasoning gaps
- One **nit** (now fixed): the EIP-3009 paragraph in §2 originally
  described `transferWithAuthorization` as authorising a transfer
  "from a signature-derived address." That is slightly imprecise — the
  `from` argument is explicit in the call and the contract verifies
  the signature against it. Rewritten to: "authorises a token transfer
  from the explicit `from` address using the attached signature."
- The Attack IV per-model selection rates (71.8 % / 69.4 % / 68.8 %)
  are reported with the explicit caveat that they reflect three
  specific LLMs at temperature 0.1 over a particular catalog. The
  draft already labels this `_(early signal — single-team evaluation)_`
  and surfaces the same caveat in §7 Limitations and in
  `uncertainties.md`.
- The 100 % cache-leak figure is given with its denominator
  ("1,000 out of 1,000 unpaid requests") and its condition (nginx
  `proxy_cache` enabled with no `Cache-Control`), so it is not a
  bare percentage.
- No "most/everyone/no one" universal claims in either draft.
- **Status:** one nit, applied during this pass; no must-fix.

## 4. Missing counter-evidence
- Sweep for rebuttal or remediation:
  - The x402 V2 launch post (s06, 2025-12-11) lists separation of
    client/server/facilitator/SDK roles and a more modular platform,
    but does not mention security improvements or replay protection,
    so V2 is not a published counter to the paper's threat model.
  - Cloudflare's x402 Foundation post (s07, 2025-09-23) is a launch
    note that does not address replay, idempotency, or facilitator
    binding either.
  - No CVE, advisory, or Coinbase blog post rebutting the five
    attacks was found on a 2026-05-14 sweep. The preprint is 2 days
    old, so this is expected; the HackerOne reports are private.
- The relevant *adjacent* literature is already cited and discussed
  in §6: the SoK on blockchain agent-to-agent payments (s14) and
  ERC-8004 (s10) cover discovery and trust but treat payment as
  orthogonal — that nuance is already in the draft.
- **Status:** no must-fix; no counter-evidence is being hidden, only
  the absence of public rebuttal noted above.

## 5. Tone and structure
- Abstract reflects the body: it names the four classes / five attacks
  and the headline interpretation ("structural mismatch", "no x402 SDK
  closes that gap by default"), both of which are repeated and
  supported in §3 and §4.
- Limitations section in §7 mirrors `uncertainties.md` and the
  remaining items in `gaps.md` (reorg model, audit coverage, scope of
  Attack IV variants, fully malicious R / collusion as future work).
- No emoji, no marketing voice, no first-person plural. Hedge phrases
  are placed where they reflect the underlying evidence.
- Paragraph lengths: the longest paragraph (§3.5 Attack IV) is 7
  sentences; broken into two logical halves around the empirical
  results.
- **Status:** no must-fix.

## 6. Must-fix vs nit
| Finding | Severity | Status |
| --- | --- | --- |
| EIP-3009 "signature-derived address" imprecision | nit | fixed |

**Summary: 0 must-fix, 1 nit (applied during this pass).** The report is
clear for publish under the protocol's must-fix gate.
