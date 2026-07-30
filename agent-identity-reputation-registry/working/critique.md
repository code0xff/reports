# Critique — agent-identity-reputation-registry

Adversarial pass per `/research-verify`. Two rounds: findings below, then the
revisions applied. Every blocking item raised was fixed; see the tally in §6.

## 1. Unsupported claims

Scanned both drafts for factual assertions without a `[^sNN]` ref.

- **must-fix (fixed).** "신규 도메인 등록 시 AI 크롤러 허용 여부를 사전에 묻는" /
  "asking every newly registered domain up front" — this detail came from a
  search-result summary of a Nieman Lab article that could not be fetched.
  Removed; the paragraph now quotes Cloudflare's own announcement instead.
- **nit (accepted).** The framing sentences that open each section ("웹 인프라
  계층의 접근은 요청 자체에 서명을 붙이는 것이다") are structural summaries of
  cited material immediately following, not new assertions. Left as is.
- No other uncited factual sentence found. The four-layer taxonomy is
  explicitly presented as this report's own organising device, not as a claim
  about the field.

## 2. Citation integrity

- Every `[^sNN]` in both drafts resolves to an id in `sources.jsonl`; 40 refs,
  40 sources, zero orphans and zero dangling refs (checked programmatically).
- All `accessed` dates are 2026-07-30, within 90 days.
- HTTP check on all 40 URLs: 38 return 200. Two return 403 to `curl`
  (`developer.salesforce.com`, and the Nieman Lab URL that has since been
  replaced). The Salesforce page was successfully read through the agent's
  web-fetch path, so it is live and bot-blocked rather than dead.
- **must-fix (fixed).** Quote provenance. Four sources originally carried
  quotes taken from search-result summaries rather than from the page:
  - `s12` (TechCrunch) — re-fetched and the quote confirmed verbatim on page.
  - `s11` (Nieman Lab) — page returns 403 to direct fetch. **Replaced** with
    Cloudflare's own "Content Independence Day" post, whose quote was
    verified on page. Higher trust tier as well (news → primary).
  - `s25` (NBC News) and `s26` (Tom's Hardware) — both 403 to direct fetch.
    Set to `access_limited: true` with `quote: null`, and the prose now
    states that their figure could not be checked against the page.
  - New `s40` (Cloudflare Radar 2025 Year in Review) added as the verified
    primary anchor for the traffic-composition claim.
- Spot-check of three quotes against the fetched pages: `s05` (ERC-8004
  security considerations), `s20` (67 / 628 / 19 figures), `s21` (JCS
  canonicalization) — all present as quoted.

## 3. Reasoning gaps

- **must-fix (fixed).** The traffic paragraph originally cited two outlets for
  one number without noting that both restate a single measurement system.
  Now stated explicitly, and the load-bearing figure was moved to the primary
  Cloudflare measurement.
- **must-fix (fixed).** "Identity is a precondition for reputation" was
  asserted as if structural. The Comparative Analysis now names the
  counter-case — TraceRank keys reputation to wallet addresses rather than
  registered identities (`s19`) — and concludes it is the ordering most
  designs chose, not a logical necessity.
- **nit (accepted).** ERC-8004 registration counts are given without a
  denominator for the whole agent population, because no such denominator
  exists. The draft says the circulating totals are mutually inconsistent
  rather than picking one.
- No causal claim rests on correlation alone. The one causal-sounding
  statement — registration being cheap and reputation expensive explaining the
  67/628/19 split — is presented as a structural reading of the measured
  concentration figures, which are cited.
- No "most people" / "everyone" / "no one" generalisations. The strongest
  universal is "no single protocol specifies all four layers," which is
  supported by walking each spec's scope with a citation per spec.

## 4. Missing counter-evidence

Targeted search for the opposite of each major finding:

- Against "reputation layer is thin": searched for adoption dashboards and
  higher registration totals. Found only tier-5 crypto-content figures
  (45,000+/24,500/98,000), which are named in the draft as inconsistent and
  not admitted as sources. The peer-reviewed measurement stands unopposed by
  anything of comparable quality.
- Against "platforms gatekeep ahead of standards": the counter-argument that
  the signature layer is the broader gate by traffic coverage is now written
  into the Comparative Analysis rather than left out.
- Against "the three layers do not interoperate": ERC-8004's registration
  file referencing A2A/MCP/DID/ENS endpoints (`s05`) and AIMS composing
  SPIFFE/WIMSE/OAuth (`s36`) are the strongest bridging evidence and are both
  cited; the draft distinguishes shared primitives from interoperability
  rather than asserting total isolation.
- Against Google's marketplace validation claim: the product documentation
  (`s33`) does not corroborate the blog's four-step evaluation (`s32`). Both
  are cited and the discrepancy is stated, not resolved.
- **nit (deferred).** No dissenting view was found on whether A2A Agent Card
  signing is actually deployed, because no data exists either way. Recorded
  in Limitations.

## 5. Tone and structure

- Abstract written after the body and checked against the sections. It leads
  with the four-layer split, names the concrete measurement (67/628 of
  10,000), and ends on the two findings the body actually argues.
- Limitations reflects `gaps.md` item for item, including the unresolved c20,
  the source-independence weaknesses, the Korean-source failure, and the
  no-hands-on-testing caveat.
- No emoji. No marketing voice. Vendor claims carry explicit
  `_(vendor-stated)_` markers (Okta's "first-class identities", EAS's agent
  use cases).
- No paragraph exceeds seven sentences (checked programmatically).

## 6. Must-fix vs nit — final tally

- must-fix: 4 raised, 4 fixed (one unsupported detail, one quote-provenance
  cluster, two reasoning gaps).
- nit: 4 raised, 3 accepted as-is with reasons, 1 deferred into Limitations.
- Open must-fix: **0**.
