# Claims — Google AP2: Protocol, Flow, and Code

Legend: `[x]` sourcing threshold met · `[!]` **falsified or materially revised**
by the evidence (kept visible on purpose — the revised statement is what enters
the draft).
Thresholds (PROTOCOL.md §3): factual ≥2 independent, interpretive ≥1 (marked),
technical ≥1 primary.

Code evidence is pinned to `google-agentic-commerce/AP2` @
`e1ea56db72a6385bce3e5c1112b3a56ce60acb43` (2026-04-29), the tip of `main` at
the time of writing, one commit tree above tag `v0.2.0` (2026-04-28).

## Introduction

- [x] c01: AP2 v0.2 is the current published specification revision, and v0.1's
  three-mandate model (Intent/Cart/Payment) is superseded rather than merely
  extended by v0.2's two-mandate model (Checkout/Payment). [s01,s23,s33,s37]
  - kind: factual
  - result: **met, with a caveat that belongs in the draft.** The v0.2 spec
    defines exactly two mandate types and never mentions IntentMandate [s01];
    CHANGELOG dates 0.1.0 to 2025-09-16 and 0.2.0 to 2026-04-28 [s23]. But the
    v0.1 model *code* still ships: `ap2/models/mandate.py`, the Go sample
    (`IntentMandateDataKey`, `CartMandateDataKey`) [s41], and the Android
    sample are all still v0.1. Third-party explainers likewise still describe
    AP2 as Intent/Cart/Payment [s37]. So the *spec* superseded v0.1; the
    *repository* is mixed-generation.

- [x] c02: AP2 governance moved to the FIDO Alliance, and the AP2 GitHub
  repository still remains the location where the normative spec and reference
  code are published after that move. [s33,s34,s35,s26]
  - kind: factual
  - result: met. Google announced the donation on 2026-04-28 alongside v0.2
    [s33]; FIDO frames AP2 and Mastercard's Verifiable Intent as complementary
    layers [s34]; the repo FAQ states "The core specification work will
    continue in FIDO" while the spec and SDK remain in the repo [s26].

- [x] c03: AP2 explicitly excludes catalog/product discovery and checkout
  transport from its own scope, delegating those to a separate commerce
  protocol layer. [s01,s36,s43]
  - kind: technical
  - result: met, from both sides. AP2 declares itself "a security feature
    within a Commerce Protocol" [s01]; UCP defines the reciprocal
    `dev.ucp.shopping.ap2_mandate` capability extension [s36]; the AP2 schema
    tree vendors the UCP `Checkout` type verbatim [s43].

- [!] c04: AP2 is transport-agnostic in the sense that the same mandate objects
  are carried unchanged over both A2A and MCP bindings, with only the envelope
  differing. [s19,s40,s15,s38]
  - kind: technical
  - result: **revised.** True in substance but the shape is different from what
    the claim assumed. Mandates are opaque compact `~~`-joined SD-JWT strings,
    so they are genuinely envelope-independent. But v0.2 did not ship "an A2A
    variant and an MCP variant" of the same flow: the A2A binding carries
    mandates as DataParts keyed `ap2.mandates.CheckoutMandateSdJwt` /
    `…PaymentMandateSdJwt` [s40], while the v0.2 flagship sample fronts the
    Shopping Agent with A2A and reaches every other role over **MCP stdio
    subprocesses** [s19]. A2A and MCP are layered in one flow, not offered as
    alternatives.

## Protocol Surface and Data Model

- [x] c05: AP2 v0.2 defines exactly five roles, and the Trusted Surface is
  normatively required to be non-agentic. [s01,s21]
  - kind: technical
  - result: met. "The following role MUST be non-agentic: Trusted Surface" and
    "When this document refers to validation or processing for a particular
    role, it MUST happen in deterministic code regardless of whether the role
    is agentic or not" [s01]. See c23 for what the sample does instead.

- [x] c06: Mandates are carried as SD-JWT-VCs, typed by a `vct` claim, so a
  verifier can distinguish a Checkout Mandate from a Payment Mandate without
  parsing the payload body. [s01,s03,s04,s08]
  - kind: technical
  - result: met. Four `vct` values, each with a numeric schema-version suffix:
    `mandate.checkout.1`, `mandate.checkout.open.1`, `mandate.payment.1`,
    `mandate.payment.open.1`; "Implementations MUST match the exact `vct`
    string, including the version suffix" [s01,s03,s04].

- [x] c07: The Payment Mandate's `transaction_id` is defined to equal the
  Checkout Mandate's `checkout_hash`, which is a base64url-encoded hash over
  the merchant-signed Checkout JWT. [s01,s03,s08]
  - kind: technical
  - result: met. Both schema field descriptions define the same hash of
    `checkout_jwt` [s08]; the hash algorithm must equal the SD-JWT's `_sd_alg`
    (default `sha-256`) [s03].

- [x] c08: The spec requires the Checkout JWT to be signed with a probabilistic
  signature scheme (e.g. ECDSA) and forbids deterministic schemes (e.g.
  Ed25519), on the stated grounds of preventing precomputation attacks against
  the linking hash. [s01,s06,s27]
  - kind: technical
  - result: met — **and the two normative documents conflict.** The spec says
    the Checkout JWT "MUST be signed using a digital signature scheme (e.g.,
    ECDSA) and not a deterministic signature (e.g., Ed25519)" [s01], while the
    Security & Privacy document permits a deterministic scheme provided "a salt
    of sufficient entropy MUST be present in the Checkout" [s06]. Open issue
    #268 documents the contradiction and its cost for Web Bot Auth integrators
    [s27]. Both sides must be shown, not resolved.

- [x] c09: AP2 defines at least two distinct agent-authorization/delegation
  models, and the choice changes which party attests that the agent was
  authorized. [s02,s42]
  - kind: technical
  - result: met. User Credential (a three-party model where an external Issuer
    is trusted to guarantee the Trusted Surface, realized over OpenID4VP
    `transaction_data`) versus Trusted Agent Provider (the Agent Provider is
    trusted directly, no pre-issued credential) [s02]. The Android sample
    exercises the credential path via Digital Payment Credentials [s42].

- [x] c10: The published JSON Schemas are a strictly weaker constraint than the
  prose spec — at least one normative requirement stated in prose is not
  machine-checkable from the schemas alone. [s08,s22,s27,s28,s38]
  - kind: interpretive
  - result: met, with several instances. `transaction_id` and `checkout_hash`
    are plain `"type": "string"` with no relationship to `checkout_jwt`
    expressible in JSON Schema [s08]; nothing in the schemas encodes the
    ECDSA-not-Ed25519 rule [s08 vs s01]; `acceptable_items` is not required to
    be non-empty, which the evaluator then reads as a wildcard [s22,s28]. An
    independent comparison describes AP2's schema coverage as "partial" [s38].

- [!] c11: A Payment Mandate carries a machine-readable indicator of whether
  the transaction was human-present or human-not-present. [s08,s10,s01]
  - kind: technical
  - result: **falsified.** No such field exists. `payment_mandate.json`
    requires only `vct`, `transaction_id`, `payee`, `payment_amount`,
    `payment_instrument`, with optional `pisp`, `execution_date`, `risk_data`,
    `iat`, `exp` [s08], and the generated model matches exactly [s10]. A
    repo-wide search finds no modality/presence flag. The modality is instead
    *structural*: "Verifiers of Mandates *always* receive a closed Payment and
    Checkout Mandate, regardless of the mode. The difference is only in how the
    verification of the Mandate is performed" [s01] — human-present means the
    closed mandate is user-signed with no open mandate above it;
    human-not-present means it is agent-signed under a user-signed open
    mandate. Revised claim for the draft: *modality is inferred from the shape
    of the delegation chain, not read from a field.*

## End-to-End Processing Flows

- [x] c12: In the Human-Present flow the merchant signs the checkout artefact
  *before* the user authorizes payment, so the user's signature commits to a
  merchant-fixed price rather than an agent-reported price. [s05,s01,s15]
  - kind: technical
  - result: met. Shopping phase step 3: "The Merchant creates a signed Checkout
    and requires an appropriate mandate to continue"; only then does payment
    phase step 1 build mandate content for the Trusted Surface [s05]. The
    merchant sample signs `checkout_jwt` with its own ES256 key inside
    `create_checkout` [s15].

- [x] c13: In the Human-Not-Present flow the user signs a mandate containing
  constraints ahead of time and the constraint check at execution time is
  performed by a party other than the Shopping Agent. [s01,s05,s16,s18]
  - kind: technical
  - result: met. The Merchant must "verify that the closed Checkout conforms to
    all of the Constraints" and the Credential Provider / Network must verify
    the closed Payment Mandate against open-mandate constraints [s01]. In code
    both the CP and the MPP call `chain.verify(...)` [s16,s18]. The Shopping
    Agent *additionally* self-checks via
    `check_constraints_against_mandate`, which is convenience, not the
    authority.

- [x] c14: In the x402 crypto-rail variant the interactive step-up
  (OTP/challenge) present in the card flow is absent, and settlement occurs via
  an on-chain payment rather than a card authorization. [s24,s17,s18]
  - kind: technical
  - result: met. The sample README states the flow "typically skips manual
    steps like OTP challenges" [s24]; settlement is an EIP-3009
    `transferWithAuthorization` against USDC on Base Sepolia [s17], authorized
    by a signature the Credential Provider produces from the verified mandate
    [s18]. The card-flow MPP is the component that implements OTP.

- [x] c15: The retained mandate set is positioned as dispute evidence, not
  merely transport-time authorization. [s01,s07,s39]
  - kind: interpretive
  - result: met. The spec has a dedicated Dispute Evidence section and a
    five-step dispute verification procedure ending "the information contained
    in the Checkout Mandate and Payment Mandate is able to be used as evidence
    as to what the user, and each role saw" [s01]; retention guidance requires
    storing compact SD-JWTs with disclosures [s07].

- [x] c16: AP2's A2A binding is realized as a declared A2A extension identified
  by a URI, so an agent card can advertise AP2 support. [s40,s41]
  - kind: technical
  - result: met. `EXTENSION_URI = "https://github.com/google-agentic-commerce/
    ap2/v1"`, declared in role agent cards as
    `{"uri": …, "description": "Supports the Agent Payments Protocol.",
    "required": true}` [s40], in both the Python and Go samples [s41]. Worth
    noting in the draft: the URI is still `/v1` at protocol v0.2, and the
    v0.2 flagship sample's own agent card declares no extensions at all [s19].

## Code-Level Walkthrough

- [x] c17: The reference repository ships mandate models generated from the
  published JSON Schemas, so the schemas are the single source of truth in
  v0.2. [s10,s09,s08]
  - kind: technical
  - result: met. Every file under `ap2/sdk/generated/` carries a
    `datamodel-codegen` header naming its source schema and a
    2026-04-28 timestamp [s10]; the SDK README lists `generated/` as "Pydantic
    models emitted from the JSON schemas" [s09]; the prose docs render field
    tables from the same schemas via a `schema_fields(...)` macro [s03,s04].

- [x] c18: The reference SDK signs mandates using ECDSA over NIST P-256
  (SECP256R1), visible in code. [s20,s09]
  - kind: technical
  - result: met. `ec.generate_private_key(ec.SECP256R1())` for both the
    agent-provider and agent keys [s20]; ES256 headers throughout [s09,s15].

- [!] c19: The repository ships runnable multi-role samples in which each AP2
  role is a separate process/server rather than an in-process function call.
  [s19,s24,s41,s42]
  - kind: technical
  - result: **revised.** Each role *is* a separate OS process, but not a
    separate network service in the v0.2 sample. `run.sh` binds only four
    ports (agent 8080, merchant trigger 8081, x402 PSP trigger 8084, web
    client 5173) [s24]; the merchant, credential-provider and PSP roles are
    launched by ADK as **MCP stdio subprocesses** of the Shopping Agent, with
    `command=sys.executable, args=[server_path.name]` [s19]. The v0.1 Go and
    Android samples do use HTTP-served A2A agents on distinct ports
    [s41,s42].

- [x] c20: The reference samples implement payment handling against mock state
  rather than a real payment rail. [s26,s17,s15,s29]
  - kind: technical
  - result: met. "These samples mock actual payment service providers so you
    can explore with no dependencies" [s26]; the x402 PSP mints a fake
    `tx_hash = "0x" + keccak(str(time.time()))` unless `BROADCAST_ON_CHAIN`
    is explicitly enabled [s17]; state lives in JSON files under
    `.temp-db` [s15]. Issue #308 shows the token store is mutated to `used`
    before settlement is confirmed and never rolled back on PSP failure [s29].

- [x] c21: The Python samples are built on Google ADK, coupling the reference
  agent implementation to one framework even though the protocol is
  framework-neutral. [s19,s26]
  - kind: technical
  - result: met. `google-adk==1.28.0` is a hard dependency and the sample is
    three `google.adk.agents.Agent` instances with `McpToolset`s [s19], while
    the FAQ asserts "Any agent, on any framework (like LangGraph, AG2 or
    CrewAI), or on any runtime, is capable of implementing AP2" [s26].

- [!] c22: Verification in the reference implementation checks the
  Checkout↔Payment mandate linkage, not merely each JWT's signature.
  [s11,s12,s15,s16,s18]
  - kind: technical
  - result: **revised — true at some roles, absent at the one the spec names.**
    The linkage checks exist but are *opt-in parameters defaulting to `None`*:
    `CheckoutMandateChain.verify(expected_checkout_hash=None, …)` and
    `PaymentMandateChain.verify(expected_transaction_id=None,
    expected_open_checkout_hash=None, …)` silently skip the comparison when
    not passed [s11,s12]. The card MPP passes both [s16] and the x402
    Credential Provider passes both [s18]; the **merchant** calls
    `chain.verify(checkout_jwt=chain.closed_mandate.checkout_jwt)` and never
    passes `expected_checkout_hash` [s15]. It also takes `checkout_jwt` from
    inside the mandate it is validating and decodes it without verifying its
    own signature over it [s11,s15].

## Analysis and Discussion

- [x] c23: There is at least one normative requirement in the AP2 spec that the
  reference implementation does not enforce.
  [s01,s06,s11,s13,s14,s15,s20,s21,s22,s27,s28,s29,s31]
  - kind: interpretive
  - result: met, with four independent instances.
    1. **Merchant `checkout_hash` check.** Required twice — "Verify that the
       hash of the Checkout JWT sent for approval matches the value included
       for the `checkout_hash` claim" [s01] and "Merchant MUST verify that
       `checkout_hash` matches the hash of the latest `checkout_jwt`" [s06] —
       and never performed by the merchant sample [s15].
    2. **Non-agentic Trusted Surface.** Required by [s01]; the reference
       Trusted Surface is `presentation only` with
       `async requestBiometricAuth() { return true; }` [s21], and the actual
       signing is an ADK tool the LLM calls, using a key generated next to the
       agent [s20].
    3. **Line-item constraint semantics.** The doc matches items only against
       *revealed* `acceptable_items` and requires maximal flow to equal the
       constraint quantity [s03]; the evaluator treats an empty list as a
       wildcard (`req_is_wildcard = not req.acceptable_items`) and quantity as
       a cap, with a shipped test asserting that behaviour [s22]. Filed
       independently as #298 [s28].
    4. **Two shipped SDK tests fail at HEAD.** Verified locally at `e1ea56d`:
       `uv run python -m pytest code/sdk/python/ap2/tests/ -q` →
       `2 failed, 186 passed`. Both failures are
       `test_verify_rejects_aud_mismatch` and
       `test_verify_rejects_nonce_mismatch` in
       `kb_sd_jwt_intermediate_tests.py` [s14], because `kb_sd_jwt.verify`
       gates `verify_expected_claims` on `if typ in TYP_TERMINAL` [s13], so
       intermediate hops never validate `aud`/`nonce`.
    Prior art: #150 raised the same class of gap in the v0.1 tree [s31].

- [x] c24: AP2's design places residual trust in the Credential Provider.
  [s01,s07,s18,s26]
  - kind: interpretive
  - result: met. The CP is "the source of Payment Credentials", responsible for
    "scoping the Payment Credential appropriately" [s01], and in the x402
    sample it is the party that signs the EIP-3009 authorization with the
    user's wallet key and derives the transferred value from the mandate
    [s18]. The mandate chain constrains *what the agent may ask for*; it does
    not constrain what the CP does with the key it holds.

- [x] c25: AP2 and competing designs (OpenAI/Stripe ACP, Google UCP) take
  structurally different approaches on the same transaction — AP2 centres
  user-signed portable evidence, ACP a merchant/PSP-scoped token.
  [s37,s38,s36,s26]
  - kind: interpretive
  - result: met. ACP's artifact is a Stripe "SharedPaymentToken — single-use,
    time-bound, amount-restricted" while AP2's is a signed mandate that
    "travels with each transaction; verification is against the issuer's
    public key" [s37,s38]. The layers compose rather than compete: "A signed
    mandate strictly subsumes 'this agent may spend $X with merchant Y'; ACP
    and UCP could accept mandates without giving up their own auth" [s38], and
    UCP does exactly that via `dev.ucp.shopping.ap2_mandate` [s36].

- [x] c26: As of 2026-07 there is no publicly documented *official* conformance
  test suite or certification programme for AP2 v0.2 — but an independent
  cross-implementation vector effort exists. [s30,s32,s34,s26]
  - kind: factual
  - result: met with an important refinement. Nothing in the repo, the FIDO
    write-up [s34] or the FAQ [s26] describes a conformance suite or
    certification path. Two open community proposals (#265, #303) exist
    precisely because none does, and #303 reports two-way cross-verification
    between the reference implementation and an independently written verifier
    [s30], hosted in an explicitly "Unofficial" checker [s32]. So: no official
    programme, but a real — if unadopted — independent interop signal.

- [!] c27: AP2 composes with rather than replaces x402: the crypto path is
  realized as an A2A x402 extension invoked from inside an AP2 flow.
  [s17,s18,s24,s25]
  - kind: technical
  - result: **revised.** The composition claim holds; the mechanism does not.
    The v0.2 x402 sample does *not* route through the `a2a-x402` A2A
    extension — it implements EIP-3009 directly in a bespoke MCP PSP role,
    binding the two worlds by setting the `TransferWithAuthorization` nonce to
    `keccak256(mandate chain string)` [s17,s18]. The `a2a-x402` package
    remains only a dependency of the older v0.1 samples, and the
    human-present/x402 README still says "The AP2 compatible x402 extension is
    coming soon" and ships no `run.sh` [s25].
