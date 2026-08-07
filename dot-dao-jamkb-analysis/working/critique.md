# Critique — dot-dao-jamkb-analysis

Adversarial pass, 2026-08-07. Posture: assume the draft is wrong.

## 1. Unsupported claims

Scanned every paragraph of `draft.md` for factual assertions lacking a
`[^sNN]` ref.

| # | Location | Finding | Class | Disposition |
|---|---|---|---|---|
| 1.1 | §3, "Disk is elastic and cheap; RAM on a specified reference machine is neither." | Asserted without citation, and the reference-machine RAM figure is precisely what could not be sourced (gaps.md #1). | **nit** | Kept: it is a general statement about hardware economics, not a JAM-specific claim, and the JAM-specific version is already flagged `_(unverified — single source)_` two paragraphs later. |
| 1.2 | §6 R1, the `max_footprint = S × r` derivation and the "≈ 10 bytes per DOT" figure | Arithmetic, not a sourced fact. | **nit** | Kept: the inputs (2.1 B cap[^s17][^s18], 20 GiB[^s01]) are cited and the derivation is shown inline so a reader can check it. |
| 1.3 | §6 R4, "a staker at least purchases network security with the locked capital while a speculator purchases nothing" | Normative economic assertion, uncited. | **nit** | Hedged in text with "arguably". Acceptable. |
| 1.4 | §7, "the debate is better than the proposal's critics on social media suggested" | Editorial judgement about social media, which this report did not systematically survey. | **must-fix — RESOLVED** | **Fixed** — removed the social-media comparison. |
| 1.5 | §5, "a substantial share of that locked in staking" | Was uncited on first pass. | **must-fix — RESOLVED** | **Fixed** — now cites s22, and no numeric ratio is asserted (per gaps.md #6). |

Two further omissions found by mechanical check and fixed before this pass:
`s07` (Polkadot Wiki) and `s22` were in `sources.jsonl` but uncited. `s07`
was in fact the single most load-bearing uncited item — Polkadot's own JAM
documentation states capacity scales with **DOT** deposits — and is now
cited in §3 and §6 R2.

## 2. Citation integrity

All checks scripted; results:

- **Ref existence:** 22 → 28 distinct refs used across `draft.md` and
  `draft.ko.md`; every ref resolves to an id in `sources.jsonl`. No
  orphan refs, no unused sources. **Pass.**
- **Schema:** all sources carry `id`, `url`, `title`, `type`, `trust`,
  `accessed`; every `type` is in the allowed set; every source either has
  a non-null `quote` or `access_limited: true`. **Pass.**
- **Recency:** every `accessed` is 2026-08-07, i.e. 0 days old. **Pass.**
- **Footnote-definition blocks:** none present in either draft (protocol
  §3 Draft forbids them). **Pass.**
- **Manual References heading:** none in either draft. **Pass.**
- **Link liveness:** `curl -sL` over all URLs. 200 for 25 of 28. Three
  return 403 to a scripted client: the two Medium articles (s01, s02) and
  the Oxford Academic record (s14). All three were successfully retrieved
  earlier via the agent's web-fetch tool, and s14 is already flagged
  `access_limited`. This is bot-blocking, not link rot. **Pass with
  note.**
- **Quote spot-check (3 sources):**
  - `s03` — verified against the LaTeX source retrieved from
    `raw.githubusercontent.com`; the `minbalance` equation and the
    "third dependent term" sentence match the file exactly.
  - `s05` — verified; `C_itemdeposit = 10`, `C_bytedeposit = 1`,
    `C_basedeposit = 100` appear verbatim in `definitions.tex`.
  - `s11` — verified; "1E19 yoctoNEAR per byte, or 100kb per NEAR token"
    and the validator-yield sentence appear in the NEAR docs page.
  **Pass.**

One integrity concern raised and resolved: the `s21` quote paraphrases a
version table rather than quoting a sentence. Left as-is, because the
underlying claim in the draft is already marked
`_(unverified — single source)_` and the quote field honestly describes
what the page contains.

## 3. Reasoning gaps

| # | Finding | Class | Disposition |
|---|---|---|---|
| 3.1 | **Generalisation from a single example.** R2 originally leaned on NEAR as if it were a clean endorsement of denominating state in a multi-use token. It is not: NEAR's own core contributors have proposed removing storage staking, and its production experience shows exactly the non-release failure R6 attributes to $JAMKB. | **must-fix — RESOLVED** | **Fixed** — see §4.1 below. R2 now carries the counter-evidence and its conclusion is narrowed. |
| 3.2 | **Causation vs. correlation.** §5 originally read as though the Web3 Foundation withdrawal *proved* Wood's fourth objection. The withdrawal is strong evidence about one design, by two authors, for stated reasons — not a proof that all flow designs fail. | **must-fix — RESOLVED** | **Fixed** — §5 now says "substantially correct about flow-based designs" and R3 notes the withdrawal is "consistent with this reading" rather than confirming it. Verified wording present. |
| 3.3 | **Absolute claim.** R4's "A fixed-supply, permissionlessly-owned, market-priced asset will be held for expected price appreciation" is a universal. | **nit** | Retained. It is an economic near-tautology for a tradable asset with a market price, and Wood's own follow-up concedes speculation will occur[^s02]. |
| 3.4 | **Number without denominator.** §3 states DOT total supply ≈ 1.6 B against a 2.1 B cap — both figures given, denominator present. R1's "10 bytes per DOT" shows its inputs. **No instance found.** | — | Pass. |
| 3.5 | **"No one" / "everyone" claims.** One instance: §7's "the cheap middle option ... has not been worked up by anyone." This is a claim about the absence of evidence from a bounded search. | **must-fix — RESOLVED** | **Fixed** — reworded to "was not located in this report's search". |
| 3.6 | **Load-bearing negative evidence.** R6's "no eviction" rests on a term-search over six of thirty-one Gray Paper section files. | **nit** | Already qualified in R6 and in Limitations. Adequate. |
| 3.7 | **Self-serving framing risk.** The report constructs the premise chain P1–P5 itself; a reader could object that the chain is a straw man. | **nit** | Mitigated: every premise is a direct quotation or close paraphrase with a ref, and §5 argues *for* Wood on three counts. Acceptable. |

## 4. Missing counter-evidence

Targeted sweeps were run against the report's own three strongest claims.
Three genuine gaps surfaced. All are **must-fix — RESOLVED**.

### 4.1 R2's NEAR precedent is contested by NEAR itself — **must-fix — RESOLVED**

R2 cited NEAR as a production system doing what Wood calls disqualified.
That is true but incomplete, and the omission flattered the report's own
argument.

- NEP issue #415 (ilblackdragon, 2022-10-13) proposes **removing** storage
  staking for base account information, arguing that "growth of usage (and
  especially NEAR locked in various DeFi protocols or usage as a medium of
  exchange) benefits the protocol's economics way more than locking
  NEAR", and that developers either build cumbersome storage models users
  dislike or absorb the cost themselves.[^s26]
- NEP discussion #185 (bowenwang1996, 2021-04-01) records that
  transactions cannot attach storage deposits directly, forcing contracts
  to manage storage and complicating multi-contract promise failures;
  oysterpack's objection is blunt: "Burning NEAR for storage allocation
  provides zero incentive to clean up storage."[^s27]
- Production evidence of the non-release failure: Ref Finance requires
  users to deposit for storage and, per the same discussion thread,
  storage was not released back in practice.[^s26][^s27]

This weakens R2 as originally stated and *strengthens* R6. Both directions
have been written into the draft. **Fixed.**

### 4.2 Academic literature favours two-token designs and was not consulted — **must-fix — RESOLVED**

A papers-lane sweep found Kiayias, Lazos and Penna, "Single-token vs
Two-token Blockchain Tokenomics" (2024), which reports "an inherent
limitation of the single token setting in terms of implementing an
effective blockchain monetary policy" and a concrete advantage for the
two-token setting.[^s25] This is tier-1 counter-evidence to the report's
sceptical framing and was absent.

Important scoping caveat, now stated in the draft: their two-token setting
separates a fee token from a stake token for monetary-policy purposes, not
a resource-access permit from a governance token, so the support for
$JAMKB is analogical rather than direct. **Fixed** — added to §5 as a
fourth surviving argument and cited in R4 as the strongest reply available
to Wood.

### 4.3 A securities/legal objection was missing — **must-fix — RESOLVED**

Page 2 of the main forum thread contains an objection of a different kind:
M_cat13 (2026-06-30) argues "JAMKB should not have an independent pricing
mechanism, which would legally constitute fraud", recommending the Agile
Coretime model instead.[^s28] The report covered economic and technical
objections but not this class. **Fixed** — one sentence added to §7,
attributed and not endorsed, since this report makes no legal assessment.

### 4.4 Not fixed — recorded as a gap instead

A search summary attributed to the Polkadot Forum a proposal to mint
$JAMKB by locking DOT (DAI-like), with the criticism that speculators
holding $JAMKB without using state would leave "RAM physically available
but economically locked up". This is directly on point for R1 and R4, but
the specific post could not be localised on either retrieved page of the
thread, so it is **not cited**. Logged in `gaps.md` as an unresolved
lead. Its substance is in any case already represented in R4 via the Web3
Foundation's "deadweight" formulation.[^s10]

## 5. Tone and structure

- **Abstract faithful to body?** Not fully, after the §4 revisions — it
  claimed three surviving arguments where the body now has four, and did
  not mention the academic two-token result. **must-fix → Fixed.**
- **Limitations honest against `gaps.md`?** Yes for gaps 1–6; the new
  §4.4 lead and the NEAR-contestation finding needed adding.
  **must-fix → Fixed** in both `gaps.md` and the Limitations section.
- **Emoji / marketing voice:** scripted scan for emoji and for
  "revolutionary / game-changer / seamless / cutting-edge / unlock the /
  leverage the" — clean in both drafts. **Pass.**
- **Hedging:** one instance of pre-emptive self-deprecation in §2
  ("mood") retained deliberately as description of the failure mode, not
  as hedging about the report's own claims.
- **Paragraphs over ~6 sentences:** one in `draft.md` (§2, the
  section-roadmap paragraph, 7 sentences) — **nit**, it is a list in prose
  form and splitting it would read worse. Korean sentence counting is
  unreliable against the `다.` heuristic; the flagged Korean paragraphs
  correspond to English paragraphs that pass, and Korean sentences carry
  more clauses per period. Spot-read confirms no runaway paragraphs.
  **nit, no action.**
- **Structure:** mandatory sections present — Abstract, Introduction,
  Limitations; References is renderer-generated per protocol §3.

## 6. Must-fix vs nit

**Must-fix (8, all resolved):**

1. 1.4 — uncited editorial claim about social-media critics → removed.
2. 1.5 — uncited staking-lock claim → cited s22.
3. (pre-pass) `s07` uncited despite being the strongest single datum →
   cited in §3 and R2.
4. 3.1 — R2 generalised from a single, contested example → counter-evidence
   added, conclusion narrowed.
5. 3.2 — withdrawal treated as proof rather than evidence → wording
   corrected.
6. 3.5 — "has not been worked up by anyone" → bounded to this report's
   search.
7. 4.1 — NEAR counter-evidence missing → added (s26, s27).
8. 4.2 — academic two-token result missing → added (s25).
9. 4.3 — legal/securities objection class missing → added (s28).
10. 5 — Abstract and Limitations no longer faithful after the above →
    both updated.

(Ten items; numbered 8 above by original count before items 3 and 10 were
split out during revision.)

**Nits (6, accepted):** 1.1, 1.2, 1.3, 3.3, 3.6, 3.7, plus the long-paragraph
and `s21` quote-form observations.

**Open must-fix: none.** Report is clear to publish under protocol §3
Critique.
