# Critique — Lean Ethereum

Adversarial pass, 2026-08-03. Applies to `draft.md` (ko, primary) and `draft.en.md` (en); both were written from the same claim set, so every finding below applies to both files unless noted.

## 1. Unsupported claims

| Location | Sentence | Verdict |
|---|---|---|
| §1 ¶1 | "이더리움의 컨센서스 계층은 2020년 12월 비콘 체인 출범 이후 …" / "since the Beacon Chain launched in December 2020" | must-fix — RESOLVED. The launch date was asserted without citation. It is uncontroversial, but no source in `sources.jsonl` states it, so the date was removed from both drafts. |
| §3.2 ¶3 | "BLS 서명은 48바이트" / "a BLS signature is 48 bytes" | **must-fix (factual error)** — 48 bytes is the *public key* (G1); the signature is a G2 point at 96 bytes. The source [s16] table was mis-extracted. Corrected and re-cited to a dedicated reference. |
| §4.5 | "`leanSig` 검증은 목표 대비 약 39% 앞서 있다" / "verification is running about 39% ahead of its target" | **must-fix (misreading)** — the roadmap literally reads "39% of target". For a verification-cost metric, being at 39% of target means roughly 2.5× better than target, not "39% ahead". Reworded to the literal figure. |
| §4.5 / §6.1 | "집계 크기는 목표의 234–391%" | **nit** — the site reports two separate configurations: 234% (simple) and 313–391% (efficient). The range as written collapses them. Split. |
| §2.1 | Beam Chain date given as 12 November 2024 | **nit** — [s12] gives 12 November; the newly added [s33] says "Tuesday, November 11" in body text while dating itself 12 November. Softened to "November 2024" with both citations. |
| Abstract, §6.5 | "2026년 8월 현재 메인넷에 반영된 Lean 트랙 변경은 없다" | **nit, resolved** — this is a negative claim, and negatives are hard to source. It is supported inferentially by the Glamsterdam EIP list [s31] and the I\* placement [s26], both cited in place. Kept, with the inferential basis visible in §6.5. |

No other sentence making a factual assertion lacks a `[^s..]` ref. Interpretive sentences in §6.1 and §2.4 are explicitly labelled as interpretive in the prose.

## 2. Citation integrity

- **Ref resolution:** 31 distinct refs in each draft; all resolve to `sources.jsonl`; zero unused sources. No footnote-definition blocks and no manual References heading in either draft (renderer builds the bibliography). ✔
- **`accessed` window:** all 31 records dated 2026-08-03, within 90 days. ✔
- **Schema:** every record has `id`, `url`, `title`, `type`, `trust`, `accessed`; every `type` is in the allowed set; every URL is `https://`. ✔
- **Liveness (curl, all 31 URLs):** 29 × HTTP 200. Two returned 403 to a scripted request:
  - `theblock.co` [s12] — 403. This one is material: the quote recorded for s12 was drawn from a search-result summary, **not** from a successful fetch of the page. **must-fix.** Resolution: s12 set to `access_limited: true` with `quote: null`, retained only as a bibliographic pointer, and the Beam Chain factual load moved to a newly added, directly fetched source [s33].
  - `cryptobriefing.com` [s20] — 403 to curl, but the page *was* fetched successfully earlier in the session and its quote is verbatim from that fetch. Bot-blocking of curl specifically; not a dead link. Nit, no change.
- **Quote spot-checks (3 sources re-fetched):**
  - [s02] `leanroadmap.org` — re-fetch confirms "39% of target", "234% of target", "313 - 391% of target", pubkey "8 elements for root; 5 for randomiser", formal verification "40%", and the devnet table with pq-devnet-4 = Active / pq-devnet-5 = Planned. ✔ (One caveat: the site's absolute numbers render client-side and came back as "~0" placeholders. The draft cites only the percentages and the devnet table from this source, never an absolute μs/sec/KiB figure. Verified compliant.)
  - [s16] LambdaClass — the ~2.5–3 kB signature figure, 8-element pubkey, 8-year lifetime, ~100 KB aggregate, and the "the 'aggregate signature' is the SNARK proof" framing all check out. The BLS row does not; see §1.
  - [s25] Minimmit arXiv — abstract confirms the `5f+1 ≤ n` assumption verbatim and confirms neither Ethereum nor lean consensus is mentioned. ✔

## 3. Reasoning gaps

- **Causation vs. correlation** — §6.1 argues the bottleneck has moved to the proof system. This is presented as an interpretive judgement with three enumerated pieces of evidence and is labelled as such in both drafts. No change.
- **Generalisation from one example** — §4.2's claim that devnet 5 is further along than the roadmap page indicates rests on one client team's blog [s28]. The draft attributes it to "한 클라이언트 팀 / a client team" rather than stating it as programme-wide fact. Acceptable; **nit**: make the single-team basis explicit rather than implicit.
- **Numbers without denominator or timeframe** — the "39% of target" and "234–391% of target" figures had no stated target baseline, and the baseline is not published in readable form. **nit**: state explicitly that the absolute targets are not published, so only the ratios are citable.
- **"most / everyone / no one"** — one instance: §5.1's "대다수 엔지니어링 로드맵 / most engineering roadmaps place cryptographic relevance in the early-to-mid 2030s". This is a direct paraphrase of [s03]'s own wording, attributed to that source rather than asserted by the report. Acceptable as attributed speech; **nit** to make the attribution unmistakable.

## 4. Missing counter-evidence

Two targeted counter-sweeps were run. Both found material the draft did not represent.

**4.1 Named dissent against the consensus-layer rewrite — must-fix.** The draft's §6.3 sourced the bundling objection only to a pattern catalogue [s21] and a secondary analysis [s26]. In fact the objection was voiced by named Ethereum figures at the moment Beam Chain was announced, and the criticism ran in two opposite directions at once [s33]:
- Ethereum core developer Péter Szilágyi: "we should be [wary] of introducing too many changes at once that impact everything across the board."
- Ethereum builder Martin Köppelmann, arguing the opposite — that it was insufficiently ambitious: "The big new feature is… a big refactoring. Sorry @DrakeFJustin, but [in my opinion] Ethereum needs to be more ambitious."
- EigenLayer principal engineer Bowen Li on the timeline: "My eyes HURT when seeing anything Ethereum present[s] takes 5 [years] to ship."
- Delphi Digital founding partner José Maria Macedo called the proposal disappointing.

This materially strengthens §6.3 and §6.4, and shows the too-slow / too-much-at-once split is not new to 2026. Added to both drafts.

**4.2 The alternative-scheme argument was entirely absent — must-fix.** The draft treated hash-based signatures as the only post-quantum option on the table. It is not: NIST has standardised lattice-based signatures that are *far smaller* than XMSS. A peer-surveyed comparison gives Falcon-512 at 666 bytes and ML-DSA-44 (Dilithium) at 2,420 bytes, against SPHINCS+ at 7,856 bytes, and notes hash-based security "relies solely on the preimage and collision resistance of cryptographic hash functions", the most conservative class of assumptions; Falcon's NTRU assumption is "less extensively analyzed than MLWE" [s34]. So the programme is making a real trade — conservative assumptions and SNARK-friendliness in exchange for signature size that a lattice scheme would not incur. The draft asserted the size penalty as if unavoidable. A subsection was added stating the alternative and the counter-consideration (validators sign once per slot, so a *synchronized* scheme suffices and full statelessness is not required [s34][s07]).

Both items were written into `gaps.md` before revision.

**4.3 Counter-sweep that found nothing new.** A search for the position that the quantum threat is overstated surfaced only material already represented by [s18] (a16z / Thaler) and [s17] (ethereum.org's own "not an imminent threat"). No unrepresented dissent found. No change.

## 5. Tone and structure

- **Abstract fidelity** — the abstract asserts the aggregate proof is "constant size on the order of 200 KB". The body's own numbers are 122–327 KiB [s13] and a measured ~200 KB [s28], and §4.5 says aggregate size is the item *over* target. Calling it plainly "constant size" in the abstract overstates settledness. **nit**: qualify. Otherwise the abstract tracks the body, including the negative findings.
- **Limitations vs. gaps.md** — §7 covers every open item in `gaps.md`: absent Lean Data / Lean Execution primary sources, unretrievable strawmap, project-hosted benchmarks, unsettled parameters, undecided protocols, single-source items, and standing conflicts. The two new must-fix items from §4 do not add limitations (they add represented counter-evidence, which is the opposite). ✔
- **Emoji / marketing voice** — none in either draft. The roadmap source itself contains a "🎉" in the benchmark cell; it is not reproduced. ✔
- **Hedging** — acceptable: the hedges present are evidential (`_(vendor-stated)_`, `_(unverified — single source)_`) and required by the protocol, not stylistic.
- **Paragraph length** — one offender: §3.2's Poseidon paragraph runs to roughly eight sentences. **nit**: split at the cryptanalysis results.

## 6. Must-fix vs nit

**must-fix (6):**
1. BLS signature size stated as 48 bytes — factual error, corrected to 96 bytes (pubkey 48) with a dedicated reference [s32].
2. "39% ahead of target" — misreading of "39% of target"; reworded.
3. Beacon Chain launch date asserted without a source; date removed.
4. [s12] quote was taken from a search summary rather than a fetched page; record demoted to `access_limited` with `quote: null` and its factual load moved to [s33].
5. Named contemporaneous dissent on the CL rewrite was missing from §6.3/§6.4; added [s33].
6. The lattice-based alternative to hash-based signatures was entirely unrepresented; new subsection §6.2 added [s34].

**nits (7):** aggregate-size configurations collapsed into one range; Beam Chain day-of-month conflict; single-client basis for the devnet-5 observation made explicit; note that absolute benchmark targets are unpublished; tighten attribution of "most engineering roadmaps"; qualify "constant size" in the abstract; split the over-long Poseidon paragraph.

All six must-fix items were applied to `draft.md` and `draft.en.md`, and all seven nits were also applied since each was a one-line change. Re-verification after revision: refs resolve, no new uncited assertions, `validate-report` passes.
