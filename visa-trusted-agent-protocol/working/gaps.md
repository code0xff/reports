# Gaps

## After sweep 1 (2026-05-13)

### Under-sourced claims
- All claims c01–c20 currently have at least one primary or independent secondary source. None blocked.
- c19 (revocation operational ambiguity) — supported only by absence in the spec plus Oscilar's general "necessary but not sufficient" critique. Acceptable as an interpretive claim; flagged in `uncertainties.md`.

### Conflicting evidence
- Press-release language sometimes spells "Web Both Auth" where the underlying standard is **Web Bot Auth** (RFC 9421-based). Treat the Visa investor page as a typo and cite the Cloudflare blog [s07] + IETF draft [s08] for the canonical name.
- Reporting on launch date diverges: Visa's October 14, 2025 press release [s03] is the canonical TAP announcement; some retrospectives (e.g., RisingWave) describe an earlier "May 2025" Intelligent Commerce framing that *included* TAP. These are not in conflict — Intelligent Commerce (May 2025) is the umbrella; TAP (Oct 14, 2025) is the published spec. Documented in the draft.

### Missing primary sources
- No primary statement on TAP's revocation message, key lifecycle TTL, or merchant-side abuse signalling. Hold as a Limitation.
- No published independent security / cryptographic analysis (peer-reviewed) at time of writing.

### Open questions accepted into Limitations
- Liability assignment when a TAP-signed agent transaction is later disputed (chargeback path).
- Whether the Visa Trusted Agent Registry is operated by Visa alone or jointly with EMVCo / OpenID Foundation in the medium term.
- Conformance/interoperability test suite (announced co-development with Cloudflare, but no test corpus is published yet).

**Gate:** Gather loop closed after one sweep — all claims sourced, residual unknowns are accepted as Limitations and uncertainties.
