# Uncertainties — what stays epistemically shaky even at publish time

`gaps.md` lists what was missing. This file lists what remains unstable even
though the draft is publishable.

## Standards that can still change under us

- **ERC-8004 is still `Draft`** in the EIP process (s05), and Forbes notes
  "the spec is still moving" (s22). Function signatures quoted in the draft
  (`giveFeedback`, `validationRequest`, `getSummary`) may change.
- **Web Bot Auth**: the architecture draft read here (s01) is expired and
  marked replaced; the working group is chartered and active (s38). Header
  names and the key-directory path (`/.well-known/http-message-signatures-directory`,
  s23) are the most likely things to move.
- **AIMS / draft-klrc-aiagent-auth-02** is an individual Internet-Draft
  expiring 2026-12-03, explicitly not IETF-endorsed (s36).
- **Cross-App Access / ID-JAG** is an active IETF draft, not an RFC (s14).
- **MCP Registry** is still a preview with no data-durability guarantee (s04)
  and an API freeze at v0.1 (s30); GA has not shipped.
- **Visa TAP specification carries no version number or publication date** in
  the page fetched (s09). Any statement about "the current TAP spec" is
  therefore unpinned.
- The MCP authorization revision cited (s06) is `2025-06-18`. A newer
  revision may exist; the draft names the revision explicitly rather than
  saying "MCP requires".

## Numbers to distrust

- All agent-population figures. The only measurement with a stated
  methodology is s20 (10,000-agent dataset, 628 with feedback, top-10 wallets
  holding 51.40%). Everything else in circulation is promotional.
- CSA survey percentages (s35) — 18% confidence, 84% audit doubt, 88%
  incident rate — are self-reported security-leader survey responses with no
  published sampling frame available to this report.
- The 7,851% year-over-year "agentic traffic" growth figure surfaced in
  search results is attributed to a vendor benchmark report that was not
  fetched; it is deliberately **not** used in the draft.
- The traffic-share split (57.4%/42.6%) derives from a single measurement
  system (Cloudflare Radar) even though two outlets report it (s25, s26).

## Interpretations that could reasonably be argued the other way

- **"Marketplaces are the de facto trust gatekeeper."** Supported by
  marketplace review requirements (s13, s24, s32) and the enterprise-readiness
  gap (s35), but this is a reading of the evidence, not a measured
  market-share claim. Someone could argue the web-signature layer is the
  broader gate because it sits in front of far more traffic.
- **"Identity is a precondition for reputation."** Grounded in s28 and s34,
  but reputation systems keyed to payment graphs (s19) partly sidestep
  registered identity by using wallet addresses as the identifier.
- **"Partial convergence on shared primitives."** RFC 9421, OAuth 2.1, JWS,
  and well-known URIs recur across specs (s01, s06, s09, s21, s23, s30), but
  shared primitives are not the same thing as interoperability, and s34/s07
  argue the planes remain disconnected.

## What this report does not cover

- Payment-protocol mechanics (x402, AP2, L402) beyond their discovery
  surfaces. Existing reports in this site cover those.
- Jurisdiction-specific regulation of agent identity (EU AI Act, Korean
  law). No sources were gathered for this and no claims are made.
- Any hands-on testing. Nothing in this report was verified by running code
  or fetching live agent cards; every technical claim rests on specification
  text or a cited measurement.
