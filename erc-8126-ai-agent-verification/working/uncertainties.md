# Uncertainties — ERC-8126

Things that remain epistemically shaky even though the draft is publishable.

- **Exact live status.** Front-matter says Final; we could not independently
  confirm the rendered eips.ethereum.org status string in-tool. "Final"
  reached in ~5 months from creation is fast for an ERC and partly driven by
  a single editor deferring open items to "post-Final erratum." Treat the
  Final label as front-matter-stated, not as a signal of broad consensus.
- **Vendor-stated framing.** erc8126.ai / erc8196.ai are marketing sites by
  the authors (@cybercentry, @virtuals_io / Virtuals Protocol). Claims about
  the standard's importance and the "three-tier framework" are author-stated,
  not neutral-third-party-validated. Mark vendor-stated in prose.
- **Adoption is unproven.** There is real ecosystem demand for agent trust
  (ERC-8004 + x402), but concrete production adoption of ERC-8126 specifically
  (live verification providers, agents carrying ERC-8126 scores) was not
  evidenced. Treat adoption claims as outlook/opinion, not fact.
- **Soundness of arithmetic-mean risk scoring.** The averaging critique is a
  reasoned interpretation; the spec permits it and the community debated
  weighting. No formal analysis either way was found.
- **ZK/PDV implementation reality.** PDV is specified conceptually; whether
  shipping providers use audited circuits / proper trusted setup is unverified.
- **"Verified ≠ safe."** Even the spec concedes scores are point-in-time and
  do not bind future agent behavior — a structural epistemic limit, not a bug.
