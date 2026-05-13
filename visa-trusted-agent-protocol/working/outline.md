# Outline — VISA Trusted Agent Protocol (TAP)

1. **Abstract**
   - One paragraph summary of what TAP is, why Visa shipped it, and the technical primitives it leans on.

2. **Introduction**
   - Why agentic commerce needs a new trust layer.
   - The 4,700% surge in AI-driven bot traffic and merchants' "block-everything" reflex.
   - Where TAP sits relative to Visa Intelligent Commerce, ACP, MPP, x402, and EMV/3DS.

3. **Background: from card-on-file to agent-on-file**
   - Card-not-present authentication history (3-D Secure, EMV tokenization, network tokens).
   - Why HTTP-level proofs became the chosen substrate (RFC 9421 HTTP Message Signatures, "Web Bot Auth").
   - Visa Intelligent Commerce as the umbrella program and the role of Trusted Agent Registry.

4. **Protocol architecture**
   - Three building blocks: **Agent Intent**, **Consumer Recognition**, **Payment Information**.
   - HTTP-layer mechanics: `Signature-Input` / `Signature` headers, the `tag` of `agent-browser-auth` vs `agent-payer-auth`, 8-minute validity window, nonce-based replay protection.
   - Public key distribution via `https://mcp.visa.com/.well-known/jwks` (JWKS) and the `keyid`/`alg` discovery flow.
   - JSON body objects: `agenticConsumer` (with idToken + contextualData) and `agenticPaymentContainer` (paymentCredentialsHash, encrypted payload, cardMetadata, browsingIOU for HTTP 402).
   - Supported cryptographic primitives: Ed25519, PS256, ES256.

5. **Transaction lifecycle**
   - Browsing path (product detail page) vs payment path (checkout).
   - Step-by-step: agent signs request → merchant fetches JWK → verifies signature → inspects `agenticConsumer` → unpacks `agenticPaymentContainer` → authorizes via existing rails (network token, 3DS-equivalent risk score).
   - How TAP relates to HTTP 402 Payment Required and the `browsingIOU` object.
   - Settlement still rides Visa's existing authorization / clearing / settlement pipes; TAP only adds an agent-and-consumer-identity envelope.

6. **Ecosystem and adoption**
   - Co-development with Cloudflare; standards alignment with IETF, OpenID Foundation, EMVCo.
   - Pilot partners: Aldar, AWS, Diddo, Highnote, Mesh, Payabli, Sumvin; Skyfire, Nekuda, PayOS, Ramp; banks (DBS, HSBC SG, OCBC, UOB, Standard Chartered, Bank of China SG).
   - Interoperability promises with ACP (OpenAI/Stripe), MPP (Mastercard), UCP, and x402 (Coinbase).
   - "Agentic Ready" program and Intelligent Commerce Connect as the merchant-side on-ramp.

7. **Analysis: trust model and limits**
   - What TAP authenticates and what it does not (it authenticates an agent runtime + a consumer hint; it does not authorize a payment by itself).
   - Comparison with classical 3DS step-up flows and with delegated mandate models (e.g., ACP signed mandates, x402 on-chain settlement).
   - Open questions on revocation, registry governance, liability assignment, and merchant-side fraud signals.

8. **Limitations**
   - Specification still labelled in-development; minimal independent security analysis.
   - No published interoperability conformance suite at time of writing.
   - Most public detail is vendor-stated.

9. **References** (rendered from sources.jsonl)
