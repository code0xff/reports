# Critique — ERC-8004

Self-critique pass. Categories: must-fix (blocks publish), should-fix, nit.

## Must-fix
- None identified. Every footnote in `draft.md` and `draft.ko.md` resolves to a source; every claim in `claims.md` is cited; interpretive claims are tagged in prose.

## Should-fix (deferred, logged for transparency)
- **Some explainer sources (s02, s04, s13, s15) are technical industry blogs, not peer-reviewed work.** They are used where they corroborate the EIP text (s01) or the Ethereum Magicians discussion (s06). The draft flags this explicitly in §6: no peer-reviewed analysis exists yet.
- **Adoption number (45,000+) relies on 8004 Scan via two news outlets (s07, s08).** The draft treats it as tracker-reported signal rather than protocol-native count. A future revision could link directly to 8004 Scan if that tracker's stats page is stable.
- **We did not locate a public audit report for the reference contracts.** The draft calls this out in §6 under Limitations.

## Counter-evidence / conflicts surfaced
- BNB Chain coverage (s16) mentions "24,000 Ethereum-based identities" while cross-chain coverage (s07, s08) cites "45,000+ across chains." The draft reconciles this in §5.5 and `gaps.md` by distinguishing chain scope.
- The monopolistic-aggregation critique from Ethereum Magicians (s06) conflicts with the authors' preferred framing that on-chain aggregation is a convenience, not the authoritative trust decision. The draft presents both sides in §3.2 and §6.

## Style and structure
- Section 3 uses code blocks for interface signatures to keep the specification grounded in the actual ERC text; format is consistent across English and Korean drafts.
- Section 6 is long on purpose because the limits of this ERC are genuinely where builders will make or break real deployments.

## Decision
No must-fix items. Draft is publish-ready; proceeding to commit and push.
