# Critique

Self-review against PROTOCOL.md §3.

## Citation integrity
- Every section-level claim landing in draft has at least one `[^sNN]` ref. Technical UCP architecture claims cite Google's own developers blog, the GitHub spec repo, and the Shopify Engineering write-up. AP2 mandate flow citations stay on the codelab (s05); we have flagged that the AP2 spec itself was not directly read.

## Source diversity
- 8 of 12 sources are primary (ucp.dev, Google developers blog, Google merchant docs, Google codelab, Google FAQ, Google blog, GitHub spec, Shopify Engineering). 4 are independent commentary (Checkout.com, ALM Corp, MetaRouter, Merchant Center Help). Peer-reviewed sources do not exist yet for this very recent (Jan 2026) launch.

## Counter-evidence
- The ACP-vs-UCP framing is presented as complementary, not winner-take-all (s09's explicit "prepare to support both"). TAP comparison is cross-referenced from our prior Visa report; presented as orthogonal not competing.

## Weak reasoning
- The "capability intersection at request time" claim relies on a single source (Shopify Engineering). Marked single-source where used in prose; not a must-fix because Shopify is a co-developer and primary in that sense.

## Must-fix items
- None.

## Nits (deferred)
- We do not have a fully independent reproduction of the codelab's mandate fields; quotes are from Google's own codelab walkthrough.
