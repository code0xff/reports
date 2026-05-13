# Claims

## Introduction
- [ ] c01: Visa announced the Trusted Agent Protocol on October 14, 2025 as an "ecosystem-led framework for AI commerce".
  - kind: factual
  - needs: dated Visa press release or investor news page
- [ ] c02: AI-driven traffic to U.S. retail sites grew approximately 4,700% in the year preceding the launch, motivating a verifiable-agent layer rather than blanket bot blocking.
  - kind: factual
  - needs: Visa source citing the figure and at least one independent recap
- [ ] c03: TAP is positioned as one of several interoperable agentic-commerce protocols (ACP, MPP, UCP, x402) rather than as a replacement for EMV 3-D Secure.
  - kind: interpretive
  - needs: Visa statement plus at least one third-party analysis

## Background
- [ ] c04: TAP is built on top of RFC 9421 "HTTP Message Signatures" and is aligned with the Web Bot Auth proposal.
  - kind: technical
  - needs: Visa specification page; secondary write-up confirming alignment
- [ ] c05: Visa publishes the agent public keys at the well-known JWKS endpoint `https://mcp.visa.com/.well-known/jwks` so merchants can resolve `keyid` values from signature headers.
  - kind: technical
  - needs: Visa specification page

## Protocol architecture
- [ ] c06: TAP defines three logical building blocks — Agent Intent, Consumer Recognition, Payment Information — that map to specific HTTP headers and JSON request body objects.
  - kind: technical
  - needs: Visa specification page
- [ ] c07: Agent requests carry `Signature-Input` and `Signature` HTTP headers whose `tag` parameter is either `agent-browser-auth` (browsing) or `agent-payer-auth` (checkout), with a maximum 8-minute validity window between `created` and `expires`.
  - kind: technical
  - needs: Visa specification page (quoting parameter names verbatim)
- [ ] c08: TAP supports Ed25519, PS256, and ES256 signing algorithms over `@authority`, `@path`, `created`, `expires`, `keyid`, `alg`, `nonce`, and `tag` covered components.
  - kind: technical
  - needs: Visa specification page
- [ ] c09: The Consumer Recognition object `agenticConsumer` carries a Visa-issued, JWS-signed `idToken` whose claims include `iss`, `sub`, `aud`, `exp`, `iat`, plus obfuscated `phone_number`, `email`, and corresponding `_mask` fields, alongside `contextualData` (device, IP, country, postal code).
  - kind: technical
  - needs: Visa specification page
- [ ] c10: The Payment Information object `agenticPaymentContainer` can carry a `paymentCredentialsHash`, an encrypted `payload` containing the network token and shipping/billing data, `cardMetadata` (lastFour, paymentAccountReference, card art), and a `browsingIOU` object scoped to HTTP 402 flows.
  - kind: technical
  - needs: Visa specification page

## Transaction lifecycle
- [ ] c11: Merchants verify a TAP request by checking signature timestamp bounds, rejecting duplicate nonces within an 8-minute window, retrieving the public key via `GET https://mcp.visa.com/.well-known/jwks?keyID={id}`, and reconstructing the RFC 9421 signature base string before verification.
  - kind: technical
  - needs: Visa specification page
- [ ] c12: TAP does not replace network authorization or 3-D Secure; an authorized TAP request still hits the issuer through Visa's existing auth/clearing/settlement rails.
  - kind: interpretive
  - needs: Visa overview page or third-party analysis
- [ ] c13: TAP's HTTP 402 `browsingIOU` payload carries an `invoiceId`, `amount`, CAID/AID, `sequenceCounter`, `kid`, `alg`, and `signature`, letting a merchant counter-sign a price quote that the agent can present back at payment time.
  - kind: technical
  - needs: Visa specification page

## Ecosystem and adoption
- [ ] c14: TAP was co-developed with Cloudflare and Visa is committed to aligning the spec with IETF, OpenID Foundation, and EMVCo.
  - kind: factual
  - needs: Visa press release plus an independent recap
- [ ] c15: Visa's Intelligent Commerce Connect explicitly accepts payments initiated via Trusted Agent Protocol, Machine Payments Protocol (MPP), Agentic Commerce Protocol (ACP), and Universal Commerce Protocol (UCP).
  - kind: factual
  - needs: Visa product page or press release
- [ ] c16: Pilot deployments include partners such as AWS, Aldar, Diddo, Highnote, Mesh, Payabli, and Sumvin, with bank participation spanning DBS, OCBC, UOB, HSBC Singapore, Standard Chartered, and Bank of China Singapore.
  - kind: factual
  - needs: Visa newsroom plus independent reporting
- [ ] c17: Visa has stated it is collaborating with Coinbase to align TAP with the x402 on-chain settlement protocol.
  - kind: factual
  - needs: Visa source plus a Coinbase/independent source

## Analysis
- [ ] c18: TAP authenticates the agent runtime and surfaces a consumer-identity hint, but does not by itself issue a payment authorization — final authorization is delegated to the issuer over existing card rails.
  - kind: interpretive
  - needs: Visa specification (delineation of scope) plus independent commentary
- [ ] c19: Key rotation in TAP relies on the JWKS endpoint and the `expires` timestamp of the signature, without an explicit per-agent revocation message, which leaves some operational ambiguity for merchants reacting in real time to a compromise.
  - kind: interpretive
  - needs: Visa specification gap + independent commentary
- [ ] c20: Compared with ACP and x402, TAP focuses on web-message integrity rather than on signed payment mandates or settlement, which makes it complementary rather than competitive with those protocols.
  - kind: interpretive
  - needs: at least one third-party analysis comparing TAP to ACP and x402
