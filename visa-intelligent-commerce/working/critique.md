# Critique

Self-review against PROTOCOL.md §3.

## Citation integrity
- Every section-level claim that landed in draft has at least one `[^sNN]` ref. Technical TAP details (alg, JWKS URL, replay window) cite the Visa specification page directly (s04). The cross-protocol assessment (TAP vs AP2) is annotated with the independent source (s13), not Visa marketing.

## Source diversity
- Primary vendor sources: Visa (corporate, developer, investor), AWS blog, GitHub repos — 12 of 16.
- Independent commentary: Axios (news), Oscilar (industry blog), ALM Corp, Medium analysis — 4 of 16. Oscilar provides the actor-verification framing and the explicit warning that crypto alone is insufficient.

## Counter-evidence
- The "this works at mainstream scale" implication is qualified throughout against "pilot-scale, hundreds of transactions" reality. The TAP-vs-other-protocols framing presents the *complementary* reading (Connect accepts TAP/MPP/ACP/UCP) alongside the *competitive* reading from independent analysis. Not silently resolved.

## Weak reasoning
- The claim "this is the RFC 9421 shape used by Web Bot Auth" relies on Visa's spec page wording and the Medium analysis (s15); Visa's overview page (s03) did not re-quote "RFC 9421" verbatim. Acceptable: the specifications page (s04) describes the structure and the third-party piece names RFC 9421 explicitly.

## Must-fix items
- None.

## Nits (deferred)
- Mastercard Agent Pay comparison intentionally out of scope.
- The Connect product page (s07) does not enumerate the four protocols by name; the protocol list comes from the Visa investor press release (s08), which is also a primary Visa source. Not a citation defect.
