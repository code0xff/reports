# Uncertainties

These claims survive the gather phase but remain epistemically shaky and should be qualified in the draft.

- **Revocation model (c19).** The published spec relies on JWKS rotation and signature `expires` timestamps; no per-agent revocation message or status endpoint has been published. The interpretive critique is supported by absence in [s01] and the third-party "necessary but not sufficient" framing in [s10]. _Treat as vendor-stated / early-signal._
- **Registry governance.** TAP's `keyid` resolution today points at `https://mcp.visa.com/.well-known/jwks` ([s01]). Visa has committed to align with IETF / OpenID Foundation / EMVCo ([s03]), but no joint-governance arrangement has been published.
- **4,700% bot-traffic figure (c02).** Cited by Visa ([s03]) and attributed to Adobe Data Insights, August 2025. The number is widely repeated but not independently re-validated by a peer-reviewed source. _Mark as vendor-stated when used in prose._
- **Interoperability promises.** Visa lists ACP, MPP, UCP, and x402 compatibility ([s15]); independent comparisons ([s11], [s13]) treat the protocols as complementary stack layers. The interop *implementations* (especially with Coinbase's x402) are still pilot-phase. _Early signal — qualify accordingly._
- **Liability assignment.** No public documentation describes how chargebacks behave when a TAP-signed transaction is disputed. Carried into Limitations.
- **Independent security analysis.** No peer-reviewed cryptographic review of TAP exists at time of writing; the most technical independent coverage ([s10], [s11]) reads protocol-level documents rather than auditing them. _Limitation._
