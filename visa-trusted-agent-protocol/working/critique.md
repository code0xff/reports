# Critique — visa-trusted-agent-protocol

Adversarial pass on `draft.md` (English). Korean draft mirrors English and inherits the same fixes.

## 1. Unsupported claims

- §2 ¶1: "Card-not-present authentication has, for two decades, leaned on 3-D Secure, EMV tokenization, and network tokens to defang stolen-PAN attacks." — encyclopedic background, no cite. **Nit.** Acceptable as setup prose; not a load-bearing factual assertion in the report.
- §2 ¶1: "Agentic commerce breaks that assumption" — interpretive framing, not a factual claim. **Nit.**
- §4 ¶1 step list: each step is supported by `[^s01]` or `[^s07]`. The seven-validation-check breakdown that Cloudflare publishes (`blog.cloudflare.com/secure-agentic-commerce`) confirms step 4 in particular and should be cited as the independent corroboration. _must-fix → resolved_ — add the Cloudflare follow-up as a source and cite it in §4 step 4 to satisfy independent corroboration of a technical claim.

## 2. Citation integrity

- All `[^sNN]` refs from `[^s01]` through `[^s15]` exist in `sources.jsonl`. ✅
- `s16` (OpenAI ACP) is **listed in sources.jsonl but unused** in the draft. _must-fix → resolved_ — either cite it (preferred) where ACP is introduced or drop it.
- All `accessed` dates are `2026-05-13` (today). ✅
- URL HEAD/GET sweep:
  - 8/8 sample URLs return `200` over `curl -L`, *except* `mastercard.com/...agentic-commerce-framework.html` which returns `403` to scripted fetches — a known fetch-failure mode for Mastercard's CDN, **not** a dead link. The canonical URL is correct; quote was captured before the fetch hardening. **Accepted** — keep the cite and note in `uncertainties.md`.
- Spot-check of quoted text:
  - `s01` quote present in the live page (Visa Developer Specs). ✅
  - `s07` quote present in the Cloudflare blog. ✅
  - `s11` quote present in Crossmint Learn. ✅

## 3. Reasoning gaps

- §1: "4,700% surge" cited and explicitly flagged `_(vendor-stated)_`. ✅ no further action.
- §3.3: "structurally identical to the Web Bot Auth proposal's key-directory model" — generalisation from one analogy. Soft language ("structurally identical") is justified by the cited [^s07][^s08]. **Nit** — leave.
- §5 ¶2: "100+ ecosystem partners and 30+ sandbox participants" cited to [^s04] and qualified by `_(vendor-stated)_` in the same paragraph. ✅
- §6.2 ¶2: "Visa emphasising 'seamless credential transmission' and Mastercard emphasising 'pre-transaction agent authentication and scale'" — that's Digital Commerce 360's framing, attributed to [^s09]. ✅
- §6.3 revocation bullet: leans on absence in spec + single critic. Already marked `_(interpretive — single independent source)_`. ✅
- No "most people" / "everyone" / "no one" sentences in the draft. ✅

## 4. Missing counter-evidence

Counter-evidence sweep surfaced two pieces worth integrating:

- **Cloudflare follow-up** (`blog.cloudflare.com/secure-agentic-commerce/`) — an independent (post-co-development) breakdown of the seven validation checks a TAP-compliant validator must perform, and a quote acknowledging that the protocols "will continue to evolve." _must-fix → resolved_ — add as `s17`, cite in §4 (transaction lifecycle) and §7 (Limitations).
- **Visa/Mastercard privacy posture** — independent reporting (`finextra.com/blogposting/31107/...`) frames Mastercard's Verifiable Intent as using "selective disclosure commitments inside a single credential chain" whereas TAP "uses obfuscation and payment partitioning" with merchant-side mapping tables. The Finextra URL returns `403` to scripted fetches; the same observation is captured in the web search snippet for the Boboev piece. **Nit** — represent the dissent in §6.3 (Honest gaps) as a privacy-architecture critique with an attribution that the underlying primary source could not be retrieved (so the claim is qualified rather than stronger-asserted).

## 5. Tone and structure

- Abstract is faithful to the body and lists the three TAP building blocks. ✅
- Limitations section honestly mirrors `gaps.md` / `uncertainties.md` (in-development status, no peer-reviewed security review, no conformance suite, pilot adoption is vendor-stated). ✅
- No emojis, no marketing voice. ✅
- Longest paragraph audit: §4 ¶1 (the six-step lifecycle) is a numbered list, not a prose paragraph. §3.4 and §3.5 use bullet lists. The longest prose paragraph is §6.1, at five sentences — within budget. ✅

## 6. Must-fix vs nit

**Resolved blockers (3):**
1. Added Cloudflare follow-up as `s17` and cited in §4 (lifecycle) and §7 (Limitations).
2. Cited `s16` (OpenAI/Stripe ACP) in §1 ¶2 so no source sits in `sources.jsonl` unused.
3. Added a one-sentence privacy-posture nuance to §6.3 noting the obfuscation-vs-selective-disclosure framing from the Mastercard-vs-Visa comparison; flagged that the underlying piece could not be fetched.

**Nits (3, deferred):**
- Soft cite for "two decades" of CNP auth history — leave; encyclopedic.
- "Structurally identical" analogy in §3.3 — soft language is OK.
- Reasoning around revocation absence — already flagged interpretive.

After applying the three blocker fixes the draft is clear of must-fix items; remaining nits are deferred.

### Summary

- **3 must-fix** identified → applied in revision pass below.
- **3 nits** deferred.
