# Analyzing draft-card-charge-00: The Card Network Charge Intent for MPP

## Abstract

`draft-card-charge-00`, "Card Network Charge Intent for HTTP Payment Authentication," is an **Informational** Internet-Draft authored by J. Brans (Visa), dated 2026-06-03 (expiring 2026-12-05).[^s01] It defines how the `card` payment method implements the `charge` intent within Tempo and Stripe's **Machine Payments Protocol (MPP)**, operating on top of the base "Payment" HTTP authentication scheme (the 402 challenge-response).[^s01][^s02] Its core design is **network tokenization that never exposes raw PAN data**: the server puts an RSA public key in the challenge, the client enabler encrypts a card-network token as a **JWE (RSA-OAEP-256 key wrapping + AES-256-GCM)** and submits it, and "only encrypted network tokens travel in the credential; the client never has access to decrypted token material."[^s01] The payload carries token data plus **EMV SRC dynamic data (a one-time cryptogram)** — grounded in the **EMVCo network-tokenization** model that replaces the PAN with a token and protects each transaction with a one-time cryptogram.[^s01][^s03][^s06] Settlement is performed by a **Server Enabler (PSP/TSP)** holding the private key, which decrypts the JWE and authorizes through existing card rails, returning 200 "immediately after authorization approval, even though final fund settlement is pending."[^s01] This shares the same 402 scheme and charge intent as evm-charge but runs over *traditional card rails* rather than on-chain signatures/settlement.[^s01][^s07] The document references Visa's **Trusted Agent Protocol (TAP)** and **Intelligent Commerce** for identity assurance and token provenance, but does not normatively define 3-D Secure/SCA or refunds.[^s01][^s04][^s05]

## 1. Introduction

This report's task is to read and analyze `https://paymentauth.org/draft-card-charge-00.txt`. Metadata: title "Card Network Charge Intent for HTTP Payment Authentication," author J. Brans (Visa), status Internet-Draft (Informational), dated 2026-06-03, expiring 2026-12-05.[^s01] The problem it solves: let an AI agent make a one-time payment over *existing card rails* without exposing the raw card number (PAN) to the client or server.[^s01][^s02] Following the prior analyses of the base scheme (`draft-httpauth-payment`) and the EVM method (`draft-evm-charge`), this report reads MPP's **card (fiat) method binding**. Evidence is the target draft (primary) plus MPP's card doc, EMVCo/Visa primary sources, and independent commentary.[^s01][^s02][^s03][^s04][^s07]

## 2. Place in the parent framework

The `card` method is a **payment-method binding** registered in MPP's method/intent registry, operating on the base "Payment" scheme's 402 challenge-response.[^s01] MPP's own documentation says "the Card method enables payments using **encrypted, single-use network payment tokens and dynamic data** provided by a card network … payment tokens, such as those provided by Visa Intelligent Commerce, settle through existing card infrastructure, and the client and server can each use independent payment providers."[^s02]

A distinction matters: MPP has both this `card` method (network-token approach, this Visa draft) and a separate `stripe` method (Stripe processor). Both can handle cards but are distinct method identifiers.[^s02][^s07] This report is scoped to the *network-token approach* this draft defines.

## 3. Request schema and the card charge flow

In the 402 `WWW-Authenticate: Payment` challenge, the server's `request` carries: `amount` (smallest currency unit, e.g. "4999" = $49.99), `currency` (ISO 4217 lowercase, e.g. "usd"), `methodDetails.acceptedNetworks` (visa, mastercard, amex, discover), `methodDetails.merchantName` (display), and an RSA public key for token encryption (`encryptionJwk` or `jwksUri`+`kid`).[^s01] Here "the key MUST be RSA with a minimum length of 2048 bits" and the algorithm must be "RSA-OAEP-256."[^s01]

The flow is: (1) the server sends the challenge including its public key, (2) the client enabler encrypts a network token (obtained from a Token Service Provider) under that key, (3) submits it as the `Authorization: Payment` credential, and (4) the server-side Enabler decrypts and authorizes.[^s01]

## 4. The network-token credential

The credential's `encryptedPayload` is a **JWE compact serialization** using **RSA-OAEP-256 key wrapping + AES-256-GCM** content encryption (confidentiality plus integrity via the GCM auth tag).[^s01] The decrypted plaintext JSON carries token data (`token.paymentToken`, token expiry month/year, `eci`) and dynamic data (`dynamicData.dynamicDataValue` = one-time cryptogram, `dynamicDataType` per EMV SRC spec, expiry), while network name, `panLastFour`, and expiry are **display-only** metadata.[^s01]

The key norm is data isolation: network tokens are provisioned by a TSP, and "only encrypted network tokens travel in the credential; the client never has access to decrypted token material," and "clients and servers MUST NOT parse the `encryptedPayload` field."[^s01] The underlying **EMVCo network tokenization** model "replaces the sensitive PAN with a non-sensitive surrogate value (an EMV Payment Token)" and protects "each transaction with a one-time-use cryptogram," with EMV SRC adding "transaction-unique dynamic data such as cryptograms."[^s03][^s06]

## 5. Verification and settlement

**Verification.** The server base64url-decodes and parses the credential, then confirms `challenge.id` matches an outstanding challenge, the challenge has not expired, `method` equals 'card', and `payload.network` is in `acceptedNetworks`. Challenge IDs SHOULD be HMAC-bound to their parameters (amount, currency, networks, merchant, realm, expiry, kid), and "each credential MUST be usable only once per challenge," with the server using "`challenge.id` as an idempotency key when forwarding."[^s01]

**Settlement.** A **Server Enabler (PSP/TSP) holding the private key** corresponding to the challenge's public key decrypts the JWE and submits an authorization to the card network using the decrypted network token. On approval it returns 200 with a `Payment-Receipt` (challengeId, method, status, reference, timestamp, externalId), and "servers SHOULD return 200 immediately after authorization approval, even though final fund settlement is pending" — i.e., the card *authorization/capture* split.[^s01] The architecture is PSP-agnostic; Visa cites its own token services only as examples while allowing any TSP/PSP.[^s01]

## 6. Security, PCI, and ecosystem comparison

**Security/PCI.** "All MPP exchanges MUST occur over TLS 1.2 or higher (TLS 1.3 recommended)." The token payload is JWE-encrypted so only the private-key-holding Server Enabler can decrypt, and the client never accesses decrypted tokens.[^s01] Billing address, cardholder name, and **PAR (Payment Account Reference)** travel as plaintext within the credential (protected by TLS); "servers and intermediaries SHOULD NOT log billing data, cardholderFullName, or paymentAccountReference in plaintext," and "SHOULD NOT use PAR for cross-merchant tracking beyond the server's own business relationship."[^s01] The spec does not mandate PCI-DSS explicitly but stresses that encrypted network tokens and TLS reduce PCI scope by preventing server-side access to raw PAN.[^s01] That PAR is a persistent identifier introduced in EMV Spec Bulletin 167 aligns with external primary sources.[^s06]

**Ecosystem.** The document references Visa **Trusted Agent Protocol (TAP)** signature headers for added identity assurance and **Visa Intelligent Commerce** as a token source.[^s01] TAP is an open framework Visa introduced with 10+ partners in October 2025 that "cryptographically verifies that an AI agent is legitimate and truly acting on a user's behalf" using "signed HTTP messages to transmit an agent's intent, verified user identity, and payment details."[^s04][^s05] Visa Intelligent Commerce Connect accepts payments initiated via TAP, MPP, and ACP.[^s05]

**Contrast with evm-charge.** Both share the same 402 Payment scheme and charge intent, but where evm-charge uses Permit2/EIP-3009 **on-chain signatures and on-chain settlement**, card-charge uses **existing card-network authorization and settlement** — MPP's multi-rail design placing blockchain and card side by side on one challenge-response skeleton.[^s01][^s07][^s08] However, 3-D Secure/SCA and refunds are not normatively defined here; reversibility is left to card-network chargeback rules.[^s01]

## 7. Limitations

- **v00, Informational, unadopted.** A first edition dated 2026-06-03 with Informational status (unlike the base scheme's Standards Track intent); fields/procedures may change, and "the document specifies" ≠ "standardized/safe/adopted."[^s01]
- **Single-document dependence.** The detailed schema rests on that document (s01) as the sole primary source; tokenization basis (EMVCo/Boston Fed), the card method (MPP), and Visa context are cross-checked externally, but the schema itself is single-document.[^s01]
- **3DS/SCA and refunds unspecified.** The draft only notes the cryptogram may satisfy authentication depending on the network, and does not normatively define 3DS/SCA or refunds; actual SCA compliance depends on implementation/jurisdiction.[^s01]
- **'card' vs 'stripe' distinction.** MPP also has a separate 'stripe' method, so a generic "MPP card payment" claim can conflate the two; this report is scoped to the network-token approach.[^s02][^s07]
- **Single author / conflict of interest.** The sole author is from Visa, and the referenced token source and identity assurance are Visa products. The spec claims PSP-agnosticism, but examples/references are Visa-centric — an independence caveat.[^s01][^s04]
