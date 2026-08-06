# Critique — pass 1 (adversarial)

Target: `draft.md` (en) and `draft.ko.md` (ko). Both drafts are structurally parallel,
so every fix below applies to both.

## 1. Unsupported claims

Scanned every paragraph for factual assertions lacking a `[^sNN]` ref.

| # | Location | Sentence | Verdict |
|---|---|---|---|
| U1 | §4 `defaults` | "At runtime this is exactly true: … produced a challenge whose decoded request was `{...}` in the execution run for this report." | **OK, but** the evidence is this report's own execution, not a cited source. Not a citation failure — it is first-party experimental evidence — but the draft must say so unambiguously and the artefact must be committed. Artefacts are in `working/verification/`. → **nit**: add an explicit pointer at first use. |
| U2 | §4 `defaults` | The `TS2345` error text and the `{}` diagnosis. | Same category as U1. First-party, reproducible, artefact committed. → **nit** |
| U3 | §5 | All four "what actually happened" outputs. | First-party execution; already labelled "Verification status" above them. → OK |
| U4 | §5 | "`Store.memory()` is one of several built-in stores — `cloudflare`, `redis`, and `upstash` also ship — and only the memory one is unsuitable for production." | The store list is verifiable from the SDK, but **uncited**, and "only the memory one is unsuitable for production" is an unsourced editorial judgement about the other three. → must-fix (M4), **FIXED**: now cites `src/Store.ts` [s37], names all five constructors, and replaces the editorial judgement with the concrete property (memory store is per-process and non-durable). |
| U5 | §6 | "IANA registries are normally created at RFC publication" | General IETF process claim, uncited. → must-fix (M5), **FIXED**: the process generalisation was removed and replaced with the directly observable IANA result [s34] plus the Datatracker record [s31]. |
| U6 | §3 | "Because the method name is just a string in a header and the request body is just an opaque blob, a server and client that agree on a new method can transact over unmodified MPP infrastructure." | Interpretive inference from cited wire-format facts. Acceptable as interpretation but reads as fact. → **nit**: mark as inference. |
| U7 | §7 | "Reading `mppx`'s server dispatch path finds HMAC provenance and binding checks but no credential-consumption store" | Cited to [s10], and it is an argument from absence, already flagged in Limitations. → OK |

## 2. Citation integrity

**Refs resolve.** Every `[^sNN]` in both drafts resolves to `sources.jsonl`; no source is
uncited. Checked programmatically.

**Freshness.** All sources carry `accessed: 2026-08-06`. Zero stale.

**Schema.** All required fields present; all `type` values legal; every non-`access_limited`
source has a `quote`. Zero violations.

**Link liveness (curl, all 32 original URLs).** 29 returned 200. Three returned **403**:
`npmjs.com/package/mppx`, `npmjs.com/package/@stellar/mpp`, `npmjs.com/package/mppx-hedera`.
npmjs.com blocks scripted access even with a browser user-agent. The data quoted was in fact
read from the npm **registry API**, which returns 200. → **must-fix, FIXED**: s20/s25/s27
URLs repointed to `registry.npmjs.org`, which is both live and the endpoint actually read.

**Quote spot-checks (5, not 3).**

- **s03** — fetched `paymentauth.org` HTML and grepped. `payment-method-id = 1*LOWERALPHA`
  and `LOWERALPHA = %x61-7A ; a-z` present **verbatim**. The single-use sentence is present
  verbatim in §11.3 "Replay Protection". ✅ (initial grep missed it only due to a line break)
- **s15** — Cloudflare page contains, verbatim: "MPP is payment-method agnostic. It supports
  stablecoins, cards through Stripe, and custom payment methods. A service can offer more
  than one method." The stored quote was a **paraphrase presented in a quote field**.
  → **must-fix, FIXED**: replaced with the verbatim sentence.
- **s16** — verbatim: "MPP was co-authored by Stripe and Tempo and launched on 18 March 2026."
  ✅ Quote tightened to the exact sentence.
- **s26** — `Method.from({ name: 'stellar', intent: 'charge', ... })` present verbatim. ✅
- **s31** — the stored quote was derived from a page **summariser**, which is weak sourcing for
  a load-bearing claim. → **must-fix, FIXED**: re-verified against the Datatracker **API**
  (`/api/v1/doc/document/?name=draft-ryan-httpauth-payment`): `rev: 01`, `time: 2026-03-18`,
  `expires: 2026-09-19`, `stream: null`, `intended_std_level: null`, `std_level: null`,
  `group: 1027`. Group 1027 resolves to `acronym: none`, `name: "Individual Submissions"`,
  `type: individ`. Every claim in the draft is now backed by structured API data rather than
  by a summariser.

## 3. Reasoning gaps

| # | Issue | Verdict |
|---|---|---|
| R1 | §4/§7 generalise the `defaults` type quirk from **one SDK at one version**. | Already hedged in prose ("single implementation, single version"). → OK |
| R2 | §6 "Rust SDK is not symmetric" generalises from two trait definitions. | Already hedged inline and in Limitations. → OK |
| R3 | §6 adoption table lists four artefacts and the draft does **not** claim they represent volume. | Explicitly disclaimed. → OK |
| R4 | Absolute quantifiers. Searched both drafts for "everyone / no one / most people / all implementers / always". Found: "Every third-party method examined for this report uses a bare lowercase word" — correctly scoped by "examined for this report". Found: "nothing today prevents two implementers from both shipping `name: 'bank'`" — a strong universal. | → **nit**: it is defensible given the IANA finding, but should be scoped to "no registry or tooling checked here". |
| R5 | "the engineering cost of a new rail is modest, and the correctness burden is not" (Abstract) | An evaluative summary judgement generalised from one implementation. → **nit**: keep, but it must be visibly the report's conclusion rather than a sourced fact. It already reads that way. |
| R6 | Numbers without denominator/timeframe. Checked: version numbers, dates, and the balance figures (1000 → 850 → 700) all carry units and context. | → OK |
| R7 | Causation vs correlation. No causal claims are made from correlational evidence; the mechanism claims are all read from source code. | → OK |

## 4. Missing counter-evidence — **the significant finding of this pass**

Ran a targeted sweep against each headline claim.

### C1 — "The documentation lags the SDK" — **the draft is WRONG as written. MUST-FIX.**

I attempted to falsify this by looking for a docs page covering `validate`/`broadcast`.
It exists. `mpp.dev/llms.txt` lists `/sdk/typescript/core/Method.toServer`,
`/sdk/typescript/server/Mppx.validateCredential`, and
`/sdk/typescript/server/Mppx.broadcastCredential`. The `Method.toServer` API reference
documents `broadcast`, `canOffer`, `defaults`, `request`, `respond`, `transport`, `validate`,
and marks `verify` deprecated with the verbatim text "Legacy combined validation and
settlement function. Use `validate` and `broadcast` for new methods."[s33]

So the blanket statement "the documentation lags the SDK" is false. The **API reference is
current**; only the **narrative custom-method guide** at `/payment-methods/custom` — the page
a new implementer lands on first — still teaches `verify` alone. That is a narrower and more
accurate finding, and it must replace the current framing in the Abstract, §4, and Limitations
in **both** drafts.

→ **must-fix.** Also add s33 and s36.

### C2 — "No operating registry" — survived, and is now **better** sourced.

I tried to find evidence that the registry exists. It does not. The IANA HTTP Authentication
Scheme Registry lists 16 schemes (Basic, Bearer, Concealed, Digest, DPoP, GNAP, HOBA, Mutual,
Negotiate, OAuth, PrivateToken, SCRAM-SHA-1, SCRAM-SHA-256, vapid) and **"Payment" is not
among them**; the page references no "HTTP Payment Methods" registry.[s34] This is
*independent* corroboration from IANA rather than an inference from the draft's own text.
→ **nit** (strengthen the citation), not a defect.

### C3 — "Replay is the method's job" — survived.

Searched the SDK server path again for any consumption store and found none beyond HMAC
provenance and route binding.[s10] Corroborated by first-party execution and by Stellar
requiring its own atomic store.[s32] Additionally, the `Method.toServer` reference supplies a
*stronger* version of the point that the draft is missing: "Revalidate any external or
on-chain state before the terminal operation, because a previous `validate` result is
advisory."[s33] → **must-fix (additive)**: the draft should carry this caveat; a method that
trusts its own `validate` result inside `broadcast` has a TOCTOU gap.

### C4 — Authorship attribution — improved.

The draft presented co-authorship as reported only by a third-party explainer. The Stripe
launch post states it directly: "an open standard, internet-native way for agents to pay—
co-authored by Tempo and Stripe", published 2026-03-18.[s35] The attribution is no longer
contested in the way the draft implies. → **must-fix (minor)**: the Limitations paragraph
overstates the disagreement; `mpp.dev/overview` merely omits authorship rather than
contradicting it.

### C5 — Hook table completeness.

The draft's hook table (from SDK type definitions) is a **superset** of the reference page's
list: `authorize`, `preflight`, `stableBinding`, `alias`, `extensions`, `html` appear in the
types but not on the reference page.[s02][s33] → **nit**: say the table is derived from the
type definitions and note that several entries are undocumented on the reference page.

## 5. Tone and structure

- **Abstract faithful to body?** Mostly — except the "documentation lags" claim (C1), which
  the Abstract states more strongly than the body can now support. → covered by C1 must-fix.
- **Limitations vs `gaps.md`?** Faithful. Every accepted gap (G5 Rust parity, G6 no
  peer-reviewed sources, G7 unmeasured adoption) and every conflict appears. After C1/C4 the
  "documentation lags" and "authorship" entries need rewording.
- **Emoji / marketing voice?** None found in either draft.
- **Hedging?** Hedges are present but are load-bearing (`_(single implementation…)_`,
  `_(Characterised from the trait definitions…)_`) rather than evasive. Keep.
- **Paragraphs > ~6 sentences?** Checked. The longest are §7 "The SDK's half of the boundary"
  bullets, which are already broken into labelled blocks. → OK
- **Korean draft parity.** `draft.ko.md` is a faithful translation with identical citation
  keys and identical structure; all fixes must be mirrored.

## 6. Must-fix vs nit

**Must-fix (6)**

1. **M1 (C1)** — Rewrite "the documentation lags the SDK" → "the *narrative guide* lags; the
   *API reference* is current and marks `verify` deprecated". Abstract, §4, Limitations, both
   languages. Add s33, s36.
2. **M2 (C3)** — Add the "a previous `validate` result is advisory — revalidate before the
   terminal operation" caveat to §5 and §7, both languages. [s33]
3. **M3 (C4)** — Soften the authorship-disagreement paragraph in Limitations; cite the Stripe
   launch post directly. [s35] Both languages.
4. **M4 (U4)** — Cite the built-in store list and drop the unsourced "only the memory one is
   unsuitable for production" judgement.
5. **M5 (U5)** — Remove or reframe "IANA registries are normally created at RFC publication";
   replace with the directly observable IANA fact. [s34]
6. **M6 (citation integrity)** — npm URLs repointed to `registry.npmjs.org`; s15/s16/s31
   quotes replaced with verified verbatim/API text. **Already applied to `sources.jsonl`.**

**Nits (5)**

7. N1 (U1/U2) — Add an explicit "artefacts in `working/verification/`" pointer at first use of
   first-party experimental evidence.
8. N2 (U6) — Mark the "unmodified infrastructure" sentence as an inference.
9. N3 (R4) — Scope the `name: 'bank'` collision claim to "no registry or tooling observed here".
10. N4 (C2) — Add the IANA negative result as independent corroboration. [s34]
11. N5 (C5) — Note the hook table is derived from type definitions and exceeds the reference page.

---

## Pass 2 — after revision

All six must-fix items applied to `draft.md` and `draft.ko.md`; all five nits also applied
(they were cheap). Re-checks:

Re-ran the mechanical and structural checks against the revised drafts:

- Citation refs resolve in both drafts; 37/37 sources cited, zero dangling refs. ✅
- No source older than 90 days; schema and `type` values legal. ✅
- All 37 URLs return 200 under curl (npm entries now hit `registry.npmjs.org`). ✅
- No manual `## References` section and no `[^sNN]:` footnote-definition blocks in either
  draft — the renderer owns the bibliography, per `PROTOCOL.md`. ✅
- Abstract now matches the body on the docs-lag finding; the phrase "documentation lags the
  SDK" appears zero times in either draft. ✅
- Limitations matches `gaps.md` after the C1/C4 rewording. ✅
- Zero emoji; zero unscoped absolute quantifiers (`everyone` / `no one` / `most people`); zero
  paragraphs over six sentences. ✅
- Language parity: both drafts have the same eight `##` headings at the same line offsets. ✅
- `python3 scripts/harness.py validate-report mpp-custom-method-extension` → passed. ✅

**Open must-fix: 0.** Cleared for publish.

### What this pass changed about the report's conclusions

The counter-evidence sweep overturned one headline finding rather than confirming it. The
draft had claimed the project's documentation was behind its SDK; the API reference is in
fact current, and only the narrative guide lags. That is a smaller claim, and the report is
more accurate for having failed to defend the larger one. Two further claims were upgraded
from single-source inference to independent corroboration (the IANA negative result, the
Datatracker API), one uncited process assertion was removed, and one substantive
implementation caveat that the draft had missed — that a `validate` result is advisory by
the time `broadcast` runs — was added to both the implementation and security sections.
