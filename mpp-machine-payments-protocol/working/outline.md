# Outline — MPP (Machine Payments Protocol) 상세 분석

1. **Abstract / 초록**
   - One-paragraph summary of what MPP is, who built it, and the report's scope.

2. **Introduction — 배경과 동기**
   - The machine-to-machine payment gap; why human checkout flows fail for agents.
   - Scope: this report analyzes the live docs under `mpp.dev/protocol` and corroborates with the IETF draft, the spec repo, and independent adopters.

3. **Background — HTTP 402와 "Payment" 인증 스킴**
   - HTTP 402 Payment Required as the substrate.
   - The `Payment` HTTP authentication scheme (`draft-ryan-httpauth-payment-01`), authors, IETF status.
   - Co-development by Tempo and Stripe; licensing; relationship to Payment Authentication / paymentauth.org.

4. **Core protocol — Challenge · Credential · Receipt**
   - The 402 handshake and `WWW-Authenticate: Payment` challenge fields.
   - Challenge structure, cryptographic `id` binding, base64url JCS encoding.
   - Credential structure (challenge echo, source, payload), single-use/replay rules.
   - Receipt structure and the optional `Payment-Receipt` header.
   - Transports: HTTP headers, MCP/JSON-RPC (`-32042`, `_meta`), WebSocket (in-band vouchers).

5. **Intents & payment methods — 결제 패턴과 레일**
   - charge (one-time), session (metered/escrow+vouchers), subscription (recurring).
   - Payment-method matrix: Tempo, EVM, Stripe, Card, Lightning, Solana, Stellar, Monad, RedotPay, Custom.
   - Tempo as the canonical rail: TIP-20, ~500ms finality, feePayer gas sponsorship, EIP-712 vouchers.

6. **Advanced capabilities — discovery · identity · refunds · security**
   - Discovery via OpenAPI 3.1 (`x-payment-info`, `x-service-info`).
   - Identity via zero-amount `proof` credentials and `source`-based access control.
   - Refunds (out-of-protocol for charge; automatic unclaimed-deposit return for sessions).
   - Security: `MPP_SECRET_KEY` threat model, challenge binding/`digest`, replay stores, secret handling.

7. **Analysis — x402 대비 포지셔닝, 성숙도, 채택**
   - MPP vs x402 (payment-based sessions vs SIWx auth; x402 compatibility).
   - Adoption signals (Stripe, Cloudflare, Parallel) vs honest maturity caveats (volume, IETF standing).

8. **Limitations**
   - What this report could not verify or what remains immature.

9. **References**
