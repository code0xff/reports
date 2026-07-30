# Google AP2 v0.2 — Protocol Surface, Processing Flow, and What the Reference Code Actually Enforces

## Abstract

AP2 (Agent Payments Protocol) v0.2 is a security layer for agent-initiated
payments: it does not move money and does not describe a catalog, it produces
tamper-evident evidence that a human authorized a specific purchase. This report
reads the v0.2 specification against the reference implementation at commit
`e1ea56d` and reports where the two agree and where they do not.

Three findings are worth stating up front. First, the protocol's centre of
gravity is not the mandate objects but the *delegation chain* they travel on: a
`~~`-joined chain of SD-JWTs in which each hop is signed by the key the previous
hop endorsed in `cnf`, and where "human-present" versus "human-not-present" is
not a field anywhere in the data model but a property of the chain's shape.
Second, the linkage that makes AP2 work — `PaymentMandate.transaction_id` equals
`CheckoutMandate.checkout_hash` equals the hash of `checkout_jwt` — is
implemented in the SDK as *opt-in verifier parameters that default to `None`*,
and the merchant sample, the one role the specification twice obliges to perform
that check, never passes them. Third, the reference Trusted Surface — a role the
spec says MUST be non-agentic — is a TypeScript class whose biometric check is
`return true` and whose signing is an LLM-invoked tool.

Alongside these, we document a normative contradiction inside AP2's own docs
about Checkout JWT signature algorithms, a constraint evaluator that reads an
empty allow-list as a wildcard, and two shipped SDK tests that fail at HEAD
because intermediate chain hops never validate `aud`/`nonce`. On the crypto
rail, we trace the cross-domain binding that joins the SD-JWT world to the EVM
world: the EIP-3009 `TransferWithAuthorization` nonce is set to
`keccak256(mandate chain)`. The conclusion is not that AP2 is unsound — the
design is coherent and the threat model unusually honest — but that the
reference code is a protocol demonstration, not a conformance reference, and the
gap between the two is currently wide enough to matter to anyone building
against it.

## 1. Introduction

### 1.1 What AP2 claims to be, in its own words

AP2's self-description is narrow and unusually precise about its own
boundaries. The specification opens by placing the protocol *inside* something
larger: "AP2 operates as a security feature within a Commerce Protocol. The
exact details of the Commerce Protocol (e.g., catalog APIs, checkout updates,
and specific APIs for communication between the different roles) are outside the
scope of AP2. AP2 is designed explicitly to be compatible with the Universal
Commerce Protocol (UCP) and integrates seamlessly."[^s01]

That boundary is real and reciprocated. UCP defines a matching capability
extension, `dev.ucp.shopping.ap2_mandate`, which extends the base
`dev.ucp.shopping.checkout` capability; once negotiated, "the session is
Security Locked", businesses "MUST embed their signature in the checkout
response body under `ap2.merchant_authorization`", and "The business MUST NOT
accept a `complete_checkout` request that lacks `ap2.checkout_mandate`."[^s36]
The coupling is also visible in the AP2 source tree, which vendors the UCP
`Checkout` type verbatim, annotated "UCP Checkout object
(dev.ucp.shopping.checkout 2026-04-08). The merchant field is an AP2 extension
for mandate binding."[^s43] AP2 is therefore best read as one layer of a stack,
not a standalone commerce protocol.

The problem AP2 exists to solve is stated in its threat model rather than its
marketing: "Given the current state of agent security, AP2 assumes that
preventing prompt injection attacks is infeasible. Therefore, all LLMs and
Agents MUST be considered potential attackers and are explicitly included in the
threat model."[^s06] Everything structural in AP2 follows from that sentence. If
the agent is an attacker, then a payment authorization cannot be a claim the
agent makes; it must be an artifact the agent cannot forge and cannot detach
from the transaction it was issued for.

### 1.2 Version and governance state as of 2026-07

The repository's `CHANGELOG.md` records exactly two releases: `0.1.0
(2025-09-16)` and `0.2.0 (2026-04-28)`.[^s23] The first was announced through
Google Cloud as a protocol for letting agents pay on a user's behalf;[^s39] the
second changed the mandate model outright. On the same day as the v0.2 tag,
Google announced the donation of AP2 to the FIDO Alliance, describing the new
version as introducing "critical features for autonomous transactions, including
'Human Not Present' payments. This capability enables AI agents to securely
execute transactions independently — such as purchasing limited-run tickets
immediately upon sale — based on user pre-authorization."[^s33] Trade press
covered the donation alongside Mastercard's parallel contribution.[^s35] FIDO
describes the two contributions as complementary layers: "AP2 standardizes how
consent and delegation are defined and communicated, while VI standardizes how
that consent is represented and verified as evidence", motivated by the concern
that "Without coordination, protocols will inevitably diverge in how they
represent consent and constraints."[^s34] The repository FAQ confirms the split:
"The core specification work will continue in FIDO", while the spec text and
SDK remain published in the GitHub repository.[^s26]

Two things about versioning matter for anyone reading AP2 material today.

The v0.2 specification defines **two** mandate types, Checkout and Payment, and
never mentions an IntentMandate.[^s01] But the repository is
mixed-generation: v0.1 Pydantic models still ship, and the Go sample still keys
A2A data parts as `ap2.mandates.CartMandate`, `ap2.mandates.IntentMandate`,
`ap2.mandates.PaymentMandate`.[^s41] Third-party explainers have not caught up
either — a widely cited comparison still describes AP2's core as "a tamper-proof,
cryptographically signed (ECDSA) JSON-LD object" with "Intent Mandates … Cart
Mandates … and Payment Mandates".[^s37] Both the JSON-LD framing and the
three-mandate taxonomy describe v0.1, not the current spec, where mandates are
SD-JWT-VCs. Readers encountering AP2 through secondary sources are therefore
likely to be reading about a superseded model.

### 1.3 Method

Every behavioural statement in this report is anchored to one of two things:
normative text in `docs/ap2/*.md`, or source code. Code evidence is pinned to
`google-agentic-commerce/AP2` at commit
`e1ea56db72a6385bce3e5c1112b3a56ce60acb43` (2026-04-29) — the tip of `main` at
the time of writing, one commit tree above tag `v0.2.0`. The repository was
cloned locally and read directly rather than through rendered documentation,
because several of the findings below are precisely about divergence between the
two. Where a claim rests on a measurement rather than a reading, the command is
given so it can be repeated.

The reading covered: all seven normative documents; the six AP2 JSON Schemas and
nine vendored UCP type schemas; the Python SDK (`code/sdk/python/ap2`, roughly
8,400 lines including tests); the ten Python role servers under
`code/samples/python/src/roles`; the browser client; and the type definitions of
the Go and Android samples. The GitHub issue tracker was swept for independent
corroboration, which turned out to be substantial.

## 2. Protocol Surface and Data Model

### 2.1 Five roles, and the one that is normatively constrained

AP2 defines five roles — Shopping Agent (SA), Credential Provider (CP),
Merchant (M), Merchant Payment Processor (MPP), and Trusted Surface (TS) — and
notes that "it is possible for a single entity to play multiple (or even all) of
the roles."[^s01]

The interesting part is not the list but the agentic/non-agentic axis layered on
top of it. A role is agentic when "Communication to or from the Role is handled
by a non-deterministic LLM"; non-agentic when communication "is handled using
deterministic code that verifies the authenticity and correctness" *and* "no
processing done by the role is delegated to an LLM."[^s01] Merchant, MPP and CP
MAY be either. The Shopping Agent "is expected to be agentic." And exactly one
role has a hard constraint: "The following role MUST be non-agentic: Trusted
Surface."[^s01]

The spec then draws the consequence explicitly: "When communication happens
between two non-agentic Roles, standard web security is sufficient to ensure
integrity. However, when either role is agentic, then the Agent itself is a
potential attacker. As such, additional tamper-evident mechanisms are
needed."[^s01] A further sentence generalizes the requirement beyond the TS:
"When this document refers to validation or processing for a particular role, it
MUST happen in deterministic code regardless of whether the role is agentic or
not."[^s01] Section 5.1 returns to what the reference implementation does with
this.

### 2.2 Open and closed mandates: the actual primitive

The literature on AP2 tends to present "the mandate" as the primitive. Reading
the code, that is the wrong unit. The primitive is a *chain*, and mandates are
its payloads.

A mandate exists in one of two states.[^s02] A **closed** mandate is "bound to a
particular transaction with a Verifier to authorize the agent to perform an
action. This is achieved by the Agent generating a Key Binding JWT
(Proof-of-Possession) using the key endorsed in the open Mandate's `cnf`
claim." An **open** mandate "has not yet been bound to a particular transaction.
It instead has a set of constraints on the valid content for the closed Mandate,
as well as being bound to a particular Agent who is allowed to use the
Mandate."[^s02]

Four `vct` values cover the cross-product, each carrying a numeric schema
version suffix, and "Implementations MUST match the exact `vct` string,
including the version suffix":[^s01]

| State | Checkout | Payment |
| --- | --- | --- |
| open | `mandate.checkout.open.1` | `mandate.payment.open.1` |
| closed | `mandate.checkout.1` | `mandate.payment.1` |

The mandate content itself is thin. A closed Checkout Mandate requires only
`vct`, `checkout_jwt`, `checkout_hash`; a closed Payment Mandate requires
`vct`, `transaction_id`, `payee`, `payment_amount`, `payment_instrument`, with
`pisp`, `execution_date`, `risk_data`, `iat` and `exp` optional.[^s08] Amounts
are integer minor units per ISO 4217 — `27999` for USD 279.99 — which removes a
whole class of float-rounding disputes from the wire format.[^s08]

Selective disclosure is annotated at the schema level, not chosen at runtime.
Exactly five fields across the model carry disclosure annotations:
`checkout_jwt` on `CheckoutMandate` is an
`x-selectively-disclosable-field`, and `allowed` on `AllowedPayees`,
`allowed` on `AllowedPaymentInstruments`, `allowed_merchants` on
`AllowedMerchants`, and `acceptable_items` on `LineItemRequirements` are
`x-selectively-disclosable-array`s.[^s09] The array annotations are what let an
agent reveal only the one merchant and one SKU relevant to the transaction while
the rest of the user's authorized set stays behind hashes — the privacy
mechanism the spec requires: "To ensure user privacy, Shopping Agents MUST
present only the disclosures from the open Mandates needed in the evaluation of
the closed Mandates."[^s01]

### 2.3 The linkage, and why the signature algorithm rule exists

Two hashes hold an AP2 transaction together.

`checkout_hash` is "the base64url-encoded hash of the value of `checkout_jwt`",
with the algorithm required to match the SD-JWT's `_sd_alg`, defaulting to
`sha-256`.[^s03] `PaymentMandate.transaction_id` is defined identically as the
"base64url-encoded hash of the checkout_jwt field value".[^s08] They are the
same value, which is what makes a Payment Mandate non-transferable to a
different Checkout: "The Payment Mandate MUST contain a reference to its
associated Checkout. This is via `transaction_id` for closed Payment Mandates
and the `mandate.payment.reference` constraint for open ones."[^s06]

That construction has a subtle prerequisite. If the Checkout JWT were
deterministic given its contents, an attacker who could guess the cart could
recompute the hash and learn what the user bought. The spec's remedy is to
require entropy from the signature: "To prevent rainbow table attacks, the
Checkout JWT MUST be signed using a digital signature scheme (e.g., ECDSA) and
not a deterministic signature (e.g., Ed25519)."[^s01]

**The two normative documents disagree about this.** The Security and Privacy
document frames the same property in terms of entropy rather than algorithm
class: "The `checkout_hash` makes use of the entropy already included in the JWT
signature to prevent guessing the Checkout contents. If a signing algorithm
(e.g. deterministic signature scheme such as `Ed25519`) is used that does not
include this then a salt of sufficient entropy MUST be present in the
Checkout."[^s06] One document forbids Ed25519; the other permits it with a salt.
An open issue filed 2026-05-26 documents the practical cost — integrators
composing AP2 with Web Bot Auth, whose deployed convention is Ed25519, are
forced to maintain two keypairs for one role — and argues for the second
framing: "The two normative passages are at odds. The S&P document's
entropy-based formulation is the more accurate articulation of the underlying
security property: what defeats rainbow-table inversion of `checkout_hash` is
unpredictable JWT bytes per session."[^s27] No maintainer response was visible
at the time of writing. We present both passages and do not resolve the
conflict.

### 2.4 Delegation models: who vouches for the consent

AP2 inherits its authorization machinery from a separable Agent Authorization
framework, which defines two ways a verifier can come to trust that a mandate
reflects real human consent.[^s02]

Under **User Credential**, an Issuer external to the agent is trusted to
guarantee the Trusted Surface. It is a three-party model — Issuer, Trusted
Surface as holder, Agent — with the benefit that "a single User Credential
[can] delegate Mandates to many different Agents, without the Verifier needing
to have an explicit trust relationship with each Agent."[^s02] The wire
mechanism is OpenID4VP's `transaction_data`: the agent constructs an
authorization request whose `transaction_data` array carries a base64url-encoded
object with `type: "delegate"`, a required `format`, and a `delegate_payload`
array holding the mandate contents as JSON, with the `delegate_payload`
required to be included in the key binding.[^s02] The non-normative example in
the spec pairs it with a `com.emvco.dpc` Digital Payment Credential and a
`payment_card` UI-data object carrying the exact confirmation table the user
sees. The Android sample exercises this path.[^s42]

Under **Trusted Agent Provider**, the Agent Provider is trusted directly by
verifiers, which "allows for a simpler trust model, but requires Verifiers to
establish trust with every Agent Provider."[^s02] The critical obligation here is
key isolation: "The Agent Provider MUST ensure that the Agent is not able to
access the Agent Provider signing key, or use it without the Trusted
Surface."[^s02] Section 5.1 shows that the reference sample implements this
model and violates precisely that sentence.

### 2.5 Schemas are the machine-checkable subset, and it is a proper subset

_(interpretive)_ The JSON Schemas are strictly weaker than the prose spec, in
ways that matter for anyone hoping schema validation implies conformance.

`transaction_id` and `checkout_hash` are declared as plain `"type": "string"`
with the hash relationship stated only in the `description` — JSON Schema cannot
express "this string equals the hash of that other string".[^s08] The
ECDSA-not-Ed25519 rule appears in no schema.[^s08] `acceptable_items` is
selectively disclosable but not required to be non-empty, and Section 5.1 shows
what the evaluator then does with an empty list.[^s22] An independent
comparison, surveying the three competing agentic-commerce stacks, characterizes
AP2's schema coverage plainly as "Partial schemas".[^s38]

The upshot is that the schemas define the shape of a mandate and nothing about
its integrity. Every integrity property in AP2 lives in prose and must be
implemented by hand.

### 2.6 There is no "human present" field

_(technical claim, verified directly against the schemas and generated models)_
A natural expectation is that a signed Payment Mandate
records which modality produced it, since the modality is exactly what a
risk engine or a dispute adjudicator would want to know. It does not.

The complete property set of `payment_mandate.json` is `vct`, `transaction_id`,
`payee`, `pisp`, `payment_amount`, `payment_instrument`, `execution_date`,
`risk_data`, `iat`, `exp`.[^s08] The generated Pydantic model matches field for
field.[^s10] A repository-wide search finds no presence, modality or
human-present flag in any AP2 schema or SDK model.

The modality is instead encoded *structurally*, and the spec says so: "Verifiers
of Mandates *always* receive a closed Payment and Checkout Mandate, regardless
of the mode. The difference is only in how the verification of the Mandate is
performed. In the Direct case, the signature on the closed Mandates is validated
as coming from a User directly… In the Autonomous case, the closed Mandates are
signed by an Agent key. Trust in this key is provided by open Mandates that are
signed by the User."[^s01] Human-present means a one-hop chain signed by a user
key; human-not-present means a two-hop chain whose leaf is agent-signed beneath
a user-signed open mandate. A verifier reads the modality off the chain's depth
and the identity of the signing keys, not off a claim. `risk_data` — "a map of
relevant risk signals collected by the trusted surface at time of mandate
creation" — is the only slot where a Trusted Surface could record how it
authenticated the user, and it is an untyped `object`.[^s08]

## 3. End-to-End Processing Flows

The flow document is explicit that its contents are illustrative: "All flows
below are non-normative examples."[^s05] The normative content lives in the
Verification section of the specification. Both are used below; where a step is
merely illustrative it is marked as such.

### 3.1 Human-Present (Direct): the message order and why it is that order

The flow splits into a shopping phase and a payment phase.[^s05]

**Shopping.** The user initiates; the Shopping Agent talks to the Merchant and
assembles a cart; then "The Shopping Agent goes to Checkout. The Merchant
creates a signed Checkout and requires an appropriate mandate to continue"; the
SA fetches instrument options from the Credential Provider and selects
one.[^s05]

That third step is the load-bearing one. The merchant signs the checkout
*before* the user is asked to authorize anything, which means the artifact the
user's key later covers is a merchant-committed price, not a price the agent
reported. Given a threat model in which the agent is an attacker,[^s06] any
other order would leave the user signing the agent's word.

**Payment.** The SA constructs Payment and Checkout Mandate content and requests
approval via a Trusted Surface. The TS "renders the Mandate Content and obtains
user authentication (e.g., biometric) and consent", then "uses `user_sk` to sign
and create the Payment Mandate and Checkout Mandate", with the note that "The
`checkout_jwt` hash is used to permanently link the Mandates."[^s05] The mandates
come back to the SA, which forwards the Payment Mandate to the Credential
Provider; the CP verifies it and returns a payment token, possibly after sharing
the mandate with the payment network to obtain "a scoped purchase
credential."[^s05] The SA hands token plus Checkout Mandate to the Merchant,
which "verifies the integrity and content of the Checkout Mandate against the
current cart state, then initiates the payment with the token and `checkout_jwt`
hash." The MPP "verifies the included Payment Mandate in the token and the
binding with the `checkout_jwt` hash." Finally the MPP-signed Payment Receipt
goes to SA, CP and Network, and the Merchant-signed Checkout Receipt goes to the
SA.[^s05]

Note the token-release rule that shapes this ordering: "The Payment
Credential/Token MUST ONLY be released to the Merchant upon the receipt and
verification of a final Payment Mandate. This binds the token to the specific
transaction."[^s06] The token is downstream of mandate verification by
construction, not by convention.

The normative verification duties per role are short enough to state in full.
The Merchant MUST process the Checkout Mandate per the chain rules, "Verify that
the hash of the Checkout JWT sent for approval matches the value included for
the `checkout_hash` claim", and if open Checkout Mandates are included, "verify
that the closed Checkout conforms to all of the Constraints by evaluating each
Constraint."[^s01] The CP and Network MUST verify the Payment Mandate per the
chain rules and check constraints. The MPP "MUST verify the Payment Credential
is appropriately scoped to the Checkout. One way this can be done is by
providing the Closed Payment Mandate inside the Payment Credential."[^s01] On
any failure the role MUST return a receipt JWT carrying the error.[^s01]

### 3.2 Human-Not-Present (Autonomous): pre-signed constraints and who evaluates them

The autonomous flow splits the shopping phase in two.[^s05]

In phase 1a the user is present, but only to authorize *bounds*: the SA
"assembles the appropriate `open` Mandate Contents for the shopping session",
the TS renders and obtains consent, and signs open Checkout and open Payment
Mandates. Two bindings are established at this point — "The hash of the open
Checkout Mandate is included in the open Payment Mandate to permanently link
them" and "The `agent_pk` is included as a confirmation claim to
sender-constrain the Mandate usage."[^s05] The specification makes the `cnf`
claim mandatory here and adds a lifetime recommendation: open mandates "MUST
include the agent's public key as a `cnf` claim… It is RECOMMENDED to set the
`exp` claim for these Mandates to the smallest value that will allow the
Shopping Agent to complete the assigned task."[^s01] The user then leaves.

In phase 1b the agent shops alone and obtains a merchant-signed Checkout. In
phase 2 it selects applicable open mandates, "constructs the Payment and
Checkout Mandate Contents and signs both closed Mandates using the `agent_sk`",
where "The `sd_hash` property of the `kb-sd-jwt` is used to bind the closed
mandate to the open one."[^s05] It presents *both* open and closed mandates to
the CP and then to the Merchant. The Merchant "verifies the integrity and
content of the closed Checkout Mandate against the current cart state, and
verifies that the constraints in the open Checkout Mandate have been met", then
initiates payment with token, `checkout_jwt` hash, and open Checkout Mandate
hash.[^s05]

The constraint evaluation is therefore performed by the *verifiers* — Merchant
for checkout constraints, CP/Network for payment constraints — not by the
Shopping Agent.[^s01] That is the whole point: a compromised agent evaluating
its own constraints would be no constraint at all. The reference Shopping Agent
does additionally self-check, via a `check_constraints_against_mandate` tool,
but that is a convenience to avoid presenting mandates that will be rejected,
not the authority.[^s19]

Two anti-abuse rules bound the autonomous case. Against double-spend: "Shopping
Agents MUST NOT present any subsequent open Payment or Checkout Mandates
without receiving a rejection receipt from the previous one. This is to prevent
an Agent approving multiple different Checkouts using the same open
Mandate."[^s01] The security document adds that the receipts enforcing this
"MUST be integrity protected from the Shopping Agent's LLM", and that verifiers
"MAY reject multiple overlapping Mandates, or invalidate previously issued
payment tokens."[^s06] Against a stuck autonomous flow, there is a graceful
downgrade: "A Human Not Present flow can be turned into a Human Present flow by
the Merchant (or Credential Provider) returning an `unresolved_constraint`
error and bringing the User back into the loop to approve the closed
Mandates."[^s05] Four error codes are defined protocol-wide —
`invalid_credential`, `unresolved_constraint`, `invalid_mandate`,
`mandates_not_supported` — the first and third terminal, the second and fourth
explicit fallback signals.[^s02]

### 3.3 The constraint vocabulary

Ten constraint types ship in v0.2 — two for checkout, eight for payment — each
with a `type` identifier and a specified evaluation algorithm.[^s03][^s04]

| Constraint | Type | Evaluation, in brief |
| --- | --- | --- |
| Allowed merchants | `checkout.allowed_merchants` | Merchant must appear in revealed `allowed`; "If they are not present, or if the `allowed` contains no revealed elements, the constraint is invalid"[^s03] |
| Line items | `checkout.line_items` | Bipartite matching between requirement slots and cart SKUs[^s03] |
| Agent recurrence | `payment.agent_recurrence` | Time separation meets `frequency`; occurrences within `max_occurrences`[^s04] |
| Allowed payees | `payment.allowed_payees` | `payee` present in `allowed`[^s04] |
| Allowed instruments | `payment.allowed_payment_instruments` | `payment_instrument` present in `allowed`[^s04] |
| Allowed PISPs | `payment.allowed_pisps` | Facilitating PISP present in `allowed`[^s04] |
| Amount range | `payment.amount_range` | `payment_amount` within min/max, currency must match[^s04] |
| Budget | `payment.budget` | Requested amount plus prior closed-mandate amounts at or below `max`[^s04] |
| Reference | `payment.reference` | Checkout Mandate's delegate chain must contain an open Checkout Mandate with matching hash[^s04] |
| Execution date | `payment.execution_date` | `execution_date` within `not_before`/`not_after`[^s04] |

The line-items constraint is the only one with a non-trivial algorithm, and the
spec specifies it as a max-flow problem: nodes per requirement slot with source
edges of capacity equal to quantity, nodes per cart SKU with sink edges of
capacity equal to cart quantity, infinite-capacity edges where a SKU appears in
that slot's revealed `acceptable_items`, and "The constraint is met if the
maximal flow equals the total constraint `items` quantity and the total checkout
`items` quantity."[^s03] Two properties are worth noting: an item matches "if its
ID is present in the *revealed* `acceptable_items`", so withholding a disclosure
narrows the authorization, and "No `items` entry or item in the Checkout may be
used more than once."[^s03] Section 5.1 shows the implementation diverging from
both readings.

Extensibility is deliberately gated. To define a new constraint one MUST specify
"A uniquely defined `type`. A Schema, including which fields are selectively
disclosable. The evaluation algorithm."[^s01] And the chain processing rules
close the loop: "Any unknown Constraints MUST be treated as failing
evaluation."[^s02] Fail-closed, by specification.

### 3.4 Receipts and dispute reconstruction

Every verification produces a signed receipt whose shape is fixed: `iss` (the
verifier), `result` of `success` or `error`, and `reference`, "a String value
that is the base64url-encoded hash of the received Mandate. When receiving a
chain of Mandates, it is a hash over the final SD-JWT in the chain. It is
calculated in the same manner as `sd_hash`."[^s02] On success the agent "stores
the open Mandate-closed Mandate-Mandate Receipt tuple" and "reduces the scope of
the open mandate based on the receipt, often preventing future presentations
entirely."[^s02]

Those tuples are the dispute artifact. AP2 specifies a five-step verification
for dispute time: verify the Checkout Mandate per the Merchant rules;
independently recompute the hash of `checkout_jwt`; check that the Checkout
Receipt `reference` matches the hash of the closed Checkout Mandate; verify the
Payment Mandate using the `checkout_hash` from the Checkout Mandate; and check
the Payment Receipt reference likewise.[^s01] Only then "the information
contained in the Checkout Mandate and Payment Mandate is able to be used as
evidence as to what the user, and each role saw."[^s01] Retention obligations
follow from the hashes: "For dispute resolution this will mean storing the
SD-JWTs, along with their disclosures, for the Mandates in their compact
serialization."[^s07]

_(interpretive)_ This is the clearest statement of AP2's design thesis. The
mandates are not primarily transport-time authorization tokens — those expire in
minutes — they are durable evidence, and the protocol's value proposition is
that the evidence survives the transaction. The spec is candid that the
machinery to exploit this does not exist yet, noting that automated retrieval of
the Checkout Mandate "would provide substantial utility to the ecosystem" but is
out of scope, and that it "would be done by using the Payment Mandate
`transaction_id` as the key to request it."[^s01]

### 3.5 Transport bindings

Mandates are compact serialized strings, so they are indifferent to their
envelope. Two bindings exist in the repository.

The **A2A binding** is a declared extension:
`EXTENSION_URI = "https://github.com/google-agentic-commerce/ap2/v1"`, published
in role agent cards as `{"uri": …, "description": "Supports the Agent Payments
Protocol.", "required": true}`, with mandates travelling as DataParts keyed
`ap2.mandates.CheckoutMandateSdJwt` and `ap2.mandates.PaymentMandateSdJwt`, and
receipts as `ap2.PaymentReceipt`.[^s40] The same URI appears in the Go
sample.[^s41] Two observations: the URI is still `/v1` at protocol version 0.2,
and the v0.1-era Go keys (`ap2.mandates.CartMandate`) sit alongside the v0.2
Python keys, so the DataPart vocabulary is version-dependent even though the URI
is not.[^s41]

The **MCP binding** is not documented as a binding at all; it is simply how the
v0.2 flagship sample wires roles together, with each role server launched as an
MCP stdio subprocess and mandates passed as tool arguments.[^s19] An independent
comparison describes AP2 as "built around A2A transport with MCP access via
Google Agent Builder",[^s38] which understates what shipped: in the v0.2 sample
A2A and MCP are *layered* — A2A faces the user, MCP faces the roles — rather
than offered as alternative bindings for the same hop.

## 4. Code-Level Walkthrough of the Reference Implementation

### 4.1 Repository topology and the schema-first pipeline

The tree separates protocol runtime from demonstration cleanly:

```
docs/ap2/                      7 normative documents
code/sdk/schemas/ap2/          6 AP2 JSON Schemas + 7 shared types
code/sdk/schemas/ucp/types/    9 vendored UCP types
code/sdk/python/ap2/sdk/       SD-JWT runtime + AP2 facade
code/sdk/python/ap2/models/    v0.1 Pydantic models (legacy)
code/sdk/python/ap2/tests/     188 tests
code/samples/python/src/roles/ 10 role servers (v0.1 A2A + v0.2 MCP)
code/samples/go/               v0.1 A2A agents
code/samples/android/          v0.1 Android + DPC scenario
code/web-client/               React client incl. "Trusted Surface"
```

v0.2 is schema-first, and this is verifiable rather than asserted. Every file
under `ap2/sdk/generated/` opens with a provenance header — `# generated by
datamodel-codegen: # filename: payment_mandate.json # timestamp:
2026-04-28T00:39:38+00:00`[^s10] — and the SDK README lists `generated/` as
"Pydantic models emitted from the JSON schemas."[^s09] The prose documentation
is generated from the same source: `checkout_mandate.md` and
`payment_mandate.md` contain `schema_fields('checkout_mandate', 'ap2',
show_sd=True)` macro calls rather than hand-written field tables.[^s03][^s04]
Schema, model, and doc therefore cannot drift on field *shape*. They can and do
drift on everything else — the SDK README's own model table writes the `vct`
values as `mandate.payment.open` and `mandate.checkout.open`, dropping the `.1`
suffix that the spec declares mandatory and the generated `Literal` types
enforce.[^s09]

### 4.2 The delegation chain: wire format and verification

The SDK is layered, with the generic SD-JWT machinery under `sdjwt/` and the
AP2-specific facade above it: `sd_jwt.py` for the issuer-signed root
(RFC 9901 section 4), `kb_sd_jwt.py` for key-binding hops, `chain.py` for
walking a chain, `mandate.py` for the `MandateClient` create/present/verify
facade.[^s09]

The wire format is a `~~`-joined chain of arbitrary depth:[^s09]

```
<root_SD-JWT>~<disc…>~~<KB-SD-JWT+KB_1>~<disc…>~~…~~<closed_KB-SD-JWT>~<disc…>~
```

The root SD-JWT is issued by the root of trust and carries `cnf` so the next hop
can sign on top. Intermediate hops use `typ=kb+sd-jwt+kb`, are each signed by
the previous hop's `cnf.jwk`, and carry their own `cnf`. The leaf uses
`typ=kb+sd-jwt`, carries the closed mandate, and must not carry `cnf`.[^s09]
The trust story is compact: "Verifier trusts only the root issuer key. Every hop
is validated by the preceding hop's `cnf.jwk`; the closed mandate's `sd_hash`
binds to the entire preceding chain; the receipt's `reference = sha256(closed
leaf JWT)` binds the post-settlement receipt to the authorized mandate."[^s09]

One design choice deserves attention because it is a privacy control expressed
as an API parameter. Each hop binds to its predecessor with *either* `sd_hash`,
which covers the preceding JWT **and** its disclosures, or `issuer_jwt_hash`,
which covers only the JWT. Selecting `sd_hash` "locks in the exact disclosures
the current hop forwards. Next delegate cannot further redact them"; selecting
`issuer_jwt_hash` "lets the next delegate drop disclosures from the preceding
SD-JWT without breaking chain integrity."[^s09] The default is `sd_hash`. So the
decision about whether a downstream party is permitted to minimize further is
made by an upstream signer, via `MandateClient.present(..., hash_mode=…)`.

The SDK also documents a deliberate deviation from the draft it implements:
"**No dSD-JWT+KB shape.** AP2 always terminates with a `typ=kb+sd-jwt`
KB-SD-JWT whose payload carries `aud`/`nonce`/`sd_hash` by spec (a KB-SD-JWT IS
a KB-JWT). The alternative outer `+KB` shape with a separate trailing plain
KB-JWT is not emitted and not accepted."[^s09]

Verification walks the chain, splits on `~~`, verifies token 0 against the
issuer key, dispatches KB hops to `kb_sd_jwt.verify`, checks `sd_hash` or
`issuer_jwt_hash` per hop, and "The final token additionally enforces
`expected_aud` / `expected_nonce` when provided."[^s09] That last clause is
literal, and Section 5.1 shows what it costs.

### 4.3 A full transaction in code: the Human-Not-Present x402 path

This is the one v0.2 scenario that is both runnable and current, so it is worth
following end to end.

**Startup.** `run.sh` binds four ports — Shopping Agent 8080, merchant trigger
8081, x402 PSP trigger 8084, web client 5173 — exports `FLOW=x402`, and defaults
`BROADCAST_ON_CHAIN` to `FALSE`.[^s24]

**Agent topology.** The Shopping Agent is three ADK agents in a handoff chain:
`consent_agent` then `monitoring_agent` then `purchase_agent`, rooted at
`consent_agent`.[^s19] Each gets its own `McpToolset` — a documented workaround
for a stdio connection conflict when instances are shared — constructed as
`McpToolset(connection_params=StdioConnectionParams(server_params=
StdioServerParameters(command=sys.executable, args=[server_path.name],
cwd=str(server_path.parent), env=env), timeout=60.0), tool_filter=…)`.[^s19] The
`FLOW` variable selects which role servers to launch:
`x402_credentials_provider_mcp` and `x402_psp_mcp`, or the card-flow
equivalents.[^s19] The default model is `gemini-3.1-flash-lite-preview`,
overridable via `AGENT_MODEL`.[^s19] The `purchase_agent` is given the MPP
toolset with an explicit filter excluding `initiate_payment`, so the agent
cannot call the payment initiation tool directly.[^s19]

**Mandate issuance.** `assemble_and_sign_mandates` builds an
`OpenCheckoutMandate` with `checkout.line_items` and
`checkout.allowed_merchants` constraints and an `OpenPaymentMandate` with
`payment.amount_range` (min 0, max the user's cap in cents),
`payment.allowed_payees`, `payment.reference`, and — when the payment method is
x402 — `payment.allowed_payment_instruments`.[^s20] Both carry
`cnf = {"jwk": agent_pub}`. Both are signed by the agent-provider key via
`MandateClient.create`, and the ordering matters: the open Checkout Mandate is
signed first, its `sd_hash` computed, and that hash placed in the open Payment
Mandate's `PaymentReference.conditional_transaction_id`, realizing the
"hash of the open Checkout Mandate is included in the open Payment Mandate"
rule from the flow document.[^s20][^s05] Keys are ECDSA P-256:
`ec.generate_private_key(ec.SECP256R1())`, generated on first use and persisted
to `.temp-db`.[^s20] Mandates are persisted as `open_chk_*.sdjwt` and
`open_pay_*.sdjwt` and referred to thereafter by id.[^s20]

**Checkout.** The merchant's `create_checkout` evaluates the open checkout
constraints via `check_checkout_constraints`, builds a UCP-shaped `Checkout`
object, appends an `accepted_payment_methods` entry of type `x402` naming
wallet, network `base-sepolia` and facilitator, signs it as an ES256 JWT, and
returns `{checkout_jwt, checkout_jwt_hash, open_checkout_hash}` where
`checkout_jwt_hash = compute_sha256_b64url(checkout_jwt)`.[^s15]

**Closing the mandates.** The agent calls `create_checkout_presentation` and
`create_payment_presentation`, which use `MandateClient.present` with the agent
key to append a terminal hop carrying the closed mandate — `checkout_hash` set
to the merchant's hash, `transaction_id` set to the same value.[^s20]

**Credential release.** The x402 Credential Provider verifies the payment chain,
then derives the on-chain authorization *from the verified mandate*:
`amount_cents = chain.closed_mandate.payment_amount.amount`,
`usdc_value = amount_cents * 10000`, and critically
`nonce = Web3.keccak(text=mandate_chain)`.[^s18] It signs an EIP-712
`TransferWithAuthorization` message with the user's wallet key and returns a
bundle containing the mandate id, the payment nonce, and the
`eip_3009_payload`.[^s18]

**Settlement.** The x402 PSP's `settle_payment` runs four steps.[^s17] Step 0
verifies the SD-JWT chain and its constraints. Step 1 is the cross-domain
binding: `expected_nonce = Web3.keccak(text=mandate_chain_str)` compared against
`eip_payload["authorization"]["nonce"]`, rejecting with `binding_failed` on
mismatch. Step 2 recovers the signer via EIP-712 `ecrecover` against the USDC
domain on chain 84532 (Base Sepolia) and requires it to equal
`authorization.from`. Step 3 checks the destination address equals the expected
merchant wallet. Step 4 either broadcasts a real
`transferWithAuthorization` transaction when `BROADCAST_ON_CHAIN` is true, or —
by default — mints a fake hash: `tx_hash = "0x" +
Web3.keccak(text=str(time.time())).hex()`.[^s17]

That step-1 construction is the most interesting single line in the repository.
Because the EIP-712 signature covers both `value` and `nonce`, and the nonce
*is* the hash of the mandate chain, a single ECDSA signature over the EVM
authorization simultaneously commits to the AP2 authorization that justified it.
The two cryptographic worlds are joined without either needing to understand
the other's format. It also means the on-chain nonce is single-use per mandate
chain, which is a replay control obtained for free.

The card flow diverges only at the end: the merchant calls the MPP's
`initiate_payment` over HTTP, and the MPP verifies the payment chain with both
linkage parameters supplied — `chain.verify(expected_transaction_id=
checkout_jwt_hash, expected_open_checkout_hash=open_checkout_hash)` — then signs
a real `PaymentReceipt` JWT and forwards it to the Credential Provider.[^s16]

### 4.4 What the samples stub

The FAQ is upfront: "These samples mock actual payment service providers so you
can explore with no dependencies."[^s26] Concretely: settlement is a synthetic
hash unless a broadcast flag and a facilitator private key are supplied;[^s17]
the user's wallet key, merchant address, facilitator address and USDC contract
are hardcoded constants, and the file says what they are — "Standard local
development key (Anvil/Hardhat Account 0)", the well-known deterministic test
accounts;[^s45] all state — token store, inventory, mandates, signing keys —
lives in JSON and PEM files under `.temp-db`;[^s15][^s20] and the x402 PSP
returns a plain dict receipt rather than the signed Payment Receipt JWT the spec
requires of an MPP, in contrast to the card-flow MPP which does sign
one.[^s17][^s16][^s01] The broadcast path also has a type confusion worth
noting: the facilitator signing key falls back to
`DEFAULT_FACILITATOR_ADDRESS` when `FACILITATOR_PRIVATE_KEY` is unset, i.e. an
address is substituted for a private key.[^s17][^s45]

Third-party review confirms this is demonstration-grade in ordering as well as
in dependencies. An issue filed 2026-07-30 reports that
"`merchant_agent_mcp.complete_checkout` records the payment token as consumed
and allocates an order before it calls the PSP, and does not restore that state
when the call fails", noting the same ordering in the card path.[^s29] The code
matches the report: `token_data['used'] = True` is written and persisted before
the PSP is contacted, and the failure branch returns an error without
compensation.[^s15]

## 5. Analysis and Discussion

### 5.1 Spec-versus-code: four confirmed deltas

_(interpretive; each instance individually sourced)_ The reference
implementation does not enforce several requirements the specification states
normatively. This matters because the project describes the samples and SDK as
"a state-of-the-art implementation of the AP2 specification",[^s26] which
invites integrators to read the code as authoritative.

**Delta 1 — the merchant's `checkout_hash` check is absent.** The obligation is
stated twice. In the specification's Merchant verification rules: "Verify that
the hash of the Checkout JWT sent for approval matches the value included for
the `checkout_hash` claim."[^s01] And in the security document, as the mitigation
for using "a closed Checkout Mandate with a different checkout session":
"Merchant MUST verify that `checkout_hash` matches the hash of the latest
`checkout_jwt`."[^s06]

The SDK exposes the check, but as an optional parameter:
`CheckoutMandateChain.verify(expected_checkout_hash: str | None = None,
checkout_jwt: str | None = None)`, whose comparison is guarded by
`if (expected_checkout_hash is not None and expected_checkout_hash !=
self.closed_mandate.checkout_hash)`.[^s11] The payment side is built the same
way — `PaymentMandateChain.verify(expected_transaction_id=None,
expected_open_checkout_hash=None, …)`, each comparison guarded on the argument
being non-`None`.[^s12] Omit the argument and the check
vanishes silently. The merchant sample calls
`chain.verify(checkout_jwt=chain.closed_mandate.checkout_jwt)` — no
`expected_checkout_hash`.[^s15] A repository-wide search finds no caller passing
that parameter outside the SDK's own tests.

Two further properties compound it. The `checkout_jwt` fed to the verifier is
taken from inside the mandate being verified, so the check is self-consistent by
construction rather than a comparison against what the merchant issued. And
`extract_parsed_checkout_object` splits the JWT, base64url-decodes part 1, and
validates it against the `Checkout` model — without verifying the signature the
merchant itself placed on it.[^s11] The downstream MPP *does* bind
`transaction_id` to the merchant-computed hash,[^s16] so the linkage is
enforced somewhere in the card path; but it is not enforced at the role the spec
names, and in the x402 path the PSP accepts a `checkout_jwt_hash` parameter and
never uses it.[^s17] We describe the omission against the normative MUST; we do
not claim a working exploit — see Limitations.

**Delta 2 — the Trusted Surface is agentic.** The spec: "The following role MUST
be non-agentic: Trusted Surface", plus "When this document refers to validation
or processing for a particular role, it MUST happen in deterministic code", plus
the Trusted Agent Provider obligation that "The Agent Provider MUST ensure that
the Agent is not able to access the Agent Provider signing key, or use it
without the Trusted Surface."[^s01][^s02]

The reference Trusted Surface is nine lines:[^s21]

```ts
// Trusted Surface: presentation only. Assemble and sign run via agent tool
// (assemble_and_sign_mandates_tool).
export class TrustedSurface {
  /** Simulate biometric auth (stub).
   *  Replace with WebAuthn / platform authenticator in production. */
  async requestBiometricAuth(): Promise<boolean> {
    return true;
  }
}
```

Signing happens in `assemble_and_sign_mandates_tool`, an ADK tool registered on
the `consent_agent` and therefore invoked by the LLM, using an
"agent-provider" key that the same process generates and stores in
`.temp-db` next to the agent's own key.[^s20][^s19] The docstring is candid that
this key "represents the user's root signing key provided by the agent platform
(e.g., Google/Apple wallet or Gemini)."[^s20] So in the sample the agent can both
reach the signing key and use it without a Trusted Surface — the exact condition
the framework forbids. The comments make clear this is understood as demo
scaffolding, which is fair; the point is that no shipped sample demonstrates a
compliant Trusted Surface, so the most security-critical role in AP2 has no
reference realization.

**Delta 3 — line-item constraint semantics invert.** The doc says an item
matches "if its ID is present in the revealed `acceptable_items`", and that the
constraint is met when maximal flow equals the constraint quantity.[^s03] The
implementation computes `req_is_wildcard: list[bool] = [not
req.acceptable_items for req in requirements]`, so an empty or fully-undisclosed
list becomes a wildcard accepting any SKU, and a shipped test named
`test_line_items_wildcard_requirement` asserts exactly that, additionally
passing with cart quantity 5 against a requirement quantity of 10 — quantity as
a cap, not a requirement.[^s22]

This was filed independently on 2026-07-14: "An empty acceptable_items list is
treated as a wildcard, and quantity is interpreted only as a capacity limit
instead of a required quantity", with the observation that it is
"reachable through selective disclosure: the SDK documents that
`claims_to_disclose={}` reveals nothing."[^s28] The route matters — an agent
choosing to disclose nothing would, under this evaluator, widen its own
authorization rather than narrow it. Note the contrast with
`checkout.allowed_merchants`, where the spec's fail-closed reading ("if the
`allowed` contains no revealed elements, the constraint is invalid")[^s03] *is*
implemented correctly, since a membership test over an empty list is false. The
inconsistency is within the implementation, not just against the doc.

**Delta 4 — two shipped tests fail at HEAD.** Running the suite the repository
documents, at commit `e1ea56d`:

```
$ uv run python -m pytest code/sdk/python/ap2/tests/ -q
2 failed, 186 passed in 1.57s
FAILED .../kb_sd_jwt_intermediate_tests.py::test_verify_rejects_aud_mismatch
FAILED .../kb_sd_jwt_intermediate_tests.py::test_verify_rejects_nonce_mismatch
```

Both tests assert that an intermediate hop with a mismatched `aud` or `nonce`
raises.[^s14] The implementation gates that check on the hop being terminal:
`common.verify_binding(payload, prev_token)` runs unconditionally, but
`common.verify_expected_claims(...)` sits inside `if typ in TYP_TERMINAL`.[^s13]
The chain walker reinforces the behaviour by passing `expected_aud=expected_aud
if is_last else None`, and the SDK README describes it as intended — "enforcing
`expected_aud` / `expected_nonce` on the terminal hop when provided."[^s09] So
the docstring on `kb_sd_jwt.verify` ("If `expected_aud` / `expected_nonce` are
provided, they match") and the two tests encode an intent the code does not
implement. Practical consequence: an intermediate hop's audience and nonce are
never validated by the chain verifier, so the transaction-binding claims of
intermediate hops carry no enforced meaning. _(unverified — single source: this
is our own reproducible measurement, with no corroborating upstream issue
found.)_

Prior art suggests this is a pattern rather than an accident of v0.2. An issue
filed 2026-01-27 against the v0.1 tree made the same structural complaint: "The
AP2 codebase has several critical inconsistencies between the specification
documents and the actual code implementation regarding mandate signing and
security mechanisms."[^s31]

### 5.2 What the mandate chain actually makes non-repudiable

_(interpretive)_ Stripped to essentials, a verified AP2 chain establishes: that
a key trusted by the verifier signed a set of constraints; that the agent key
endorsed in that signature produced the closed mandate; that the closed mandate
satisfies the constraints; and that the closed mandate names a specific
`checkout_jwt` by hash. That is a strong and genuinely useful property, and it
is achieved without the verifier needing a trust relationship with the agent.

It is also bounded in three ways worth naming.

It says nothing about whether a human was actually present or actually
consented. The chain proves a key signed; the mapping from "key signed" to
"human intended" is entirely the Trusted Surface's job, and the Trusted Surface
is precisely the component with no reference implementation (Delta 2) and no
structured place to record how it authenticated the user, since `risk_data` is
an untyped object.[^s08]

The Credential Provider retains substantial residual trust. It is "the source
of Payment Credentials", responsible for "verifying that this Agent is
authorized to access this Payment Credential, and scoping the Payment Credential
appropriately".[^s01] In the x402 sample it is the party holding the user's
wallet key, deriving the transferred value from the mandate, and signing the
EIP-712 authorization.[^s18] The mandate chain constrains what the agent may
*ask* for; nothing in it constrains what the CP does with the key it holds. AP2
moves trust off the LLM, not out of the system.

And the modality asymmetry is real. In the human-present case a verifier checks
one user signature. In the human-not-present case it checks a chain whose leaf
was produced by software, and its confidence rests entirely on constraint
evaluation. Delta 3 is therefore not a peripheral bug: constraint evaluation is
the *only* thing standing between an autonomous agent and an unintended
purchase, and the spec says as much — "Even if the LLM fails to make the optimal
choice, constraint enforcement during closed Mandate verification ensures that
the worst-case financial and logical impacts are strictly bounded."[^s06]

### 5.3 Where AP2 sits among ACP, UCP and x402

_(interpretive; comparison sources are practitioner-grade)_ The three
agentic-commerce stacks differ in what artifact they treat as central. ACP, from
OpenAI and Stripe, centres a scoped credential — "SharedPaymentTokens —
single-use, time-bound, amount-restricted tokens".[^s37] UCP centres request
integrity, using HTTP Message Signatures per RFC 9421.[^s38] AP2 centres
portable evidence: the mandate "travels with each transaction; verification is
against the issuer's public key."[^s38]

These are complements more than competitors, and the same comparison says so
crisply: "A signed mandate strictly subsumes 'this agent may spend USD X with
merchant Y'; ACP and UCP could accept mandates without giving up their own
auth."[^s38] UCP has already done it, via the `dev.ucp.shopping.ap2_mandate`
extension.[^s36] The clean framing is that AP2 answers *who authorized this and
to what limits*, ACP answers *how does the agent pay without seeing the
credential*, and UCP answers *how do agent and merchant talk about a cart*.
AP2's own summary, per the same independent source, is that it "is a framework,
not a payment rail — it defines how agents get permission to pay, not how the
money moves."[^s37]

x402 is the case where the composition claim needs care. AP2's FAQ frames the
relationship aspirationally: it points at the separate `a2a-x402` repository as
"an implementation of A2A in conjunction with the x402 standard" and says "We
will be aligning this closely with AP2 over time."[^s26] The v0.2 code did not
take that route. The runnable x402 sample implements EIP-3009 directly in a
bespoke MCP PSP role, binding the domains via the keccak hash of the mandate
chain as the authorization nonce.[^s17][^s18] Meanwhile the human-present x402
scenario README still says "The AP2 compatible x402 extension is coming soon.
The current x402 extension will be enhanced to ensure the creation of all key
mandates outlined in AP2", still refers to `IntentMandate`, and ships no run
script.[^s25] So AP2 and x402 do compose today — but through sample-specific
glue, not through the advertised A2A extension.

### 5.4 What an implementer actually has to build

_(interpretive)_ Reading the role responsibilities against the SDK, the work
divides unevenly.

For a **Merchant**, most of the lift is existing commerce plumbing plus two new
things: signing a Checkout JWT with a probabilistic scheme, and verifying a
mandate chain including constraint evaluation and — per Delta 1 — the hash check
the sample omits. The spec explicitly permits outsourcing the second: a Merchant
may delegate verification to a technology provider, "such as the MPP", in which
case "the delegate follows the verification rules for that role instead."[^s01]

For an **MPP**, the work is receiving the token, verifying the Payment Mandate
inside it, and issuing a signed Payment Receipt.[^s07] The reference card MPP
shows this is a few hundred lines given the SDK.[^s16]

For a **Credential Provider**, the new burden is mandate verification before
credential release, and the token-release rule that binds the two.[^s06]

For a **Shopping Agent**, the list is longest and the least supported by the
SDK: mandate selection from storage, key binding, disclosure minimization,
double-spend prevention, and receipt management.[^s07] Three of these are
*stateful* runtime concerns that no amount of cryptography addresses. The
community has already noticed: an independent library wraps an AP2 payment in a
`reserve / commit / release` lifecycle on the grounds that "That's a
runtime-state problem — idempotency, concurrency, consume-once — not a
cryptographic one", keying its idempotency token "on [the `open_mandate_hash`]
(not on `transaction_id`)" precisely so that multiple checkouts spawned from one
open mandate share a bucket.[^s44]

The **Trusted Surface** is the component with the highest security requirement
and the least reference support: a non-agentic UI that renders mandate content,
authenticates the user, and signs — with the spec pointing at OpenID4VP and the
Digital Credentials API,[^s02] and no shipped sample demonstrating it.[^s21]

### 5.5 Conformance and interoperability

Nothing in the repository, the FIDO write-up,[^s34] or the FAQ[^s26] describes a
conformance test suite, a set of official test vectors, or a certification path
for AP2 v0.2. The 188-test SDK suite tests the reference implementation against
itself — and, as Delta 4 shows, does not currently pass.

The gap is visible in the community's behaviour. Two open proposals exist
specifically because no official vectors do: one covering `open_mandate_hash`
derivation and JCS canonicalization, and one covering the chain layer above it —
"disclosure hashing, `_sd`/`sd_hash` linkage, hop composition on the `~~` wire,
and nested `merchant_authorization` binding" — pinned to
`draft-gco-oauth-delegate-sd-jwt-00`, RFC 9901, RFC 8785, RFC 7515 and this
repository at `e1ea56d`.[^s30] That second proposal also contains the strongest
interoperability evidence found anywhere in this research: "Two-way
cross-verified: an independently written verifier (built from the RFCs, no
shared code with this repo) accepts reference-minted chains byte-for-byte, and
the reference verifier accepts chains minted by the independent implementation,
including constraint and schema checks."[^s30]

That is a real signal, and it cuts in AP2's favour: the *cryptographic* layer is
apparently specified precisely enough to reimplement from the RFCs. It is also
explicitly unofficial — the hosting project describes itself as an "honest,
kill-rate-validated conformance checker … Free & open source. Unofficial"[^s32]
— and unadopted. The state of AP2 interoperability today is therefore: one
credible independent cross-check of the chain format, no official programme, and
a reference implementation whose own test suite is red. _(early signal — the
absence of an official programme is a negative finding from searching the repo,
the FIDO material and the open web; it cannot be proven exhaustively.)_

## 6. Limitations

**No production evidence.** Every behavioural claim here derives from
specification text or reference code. No source found describes AP2 v0.2
operating at card-network volume, and no vendor has published a v0.2 conformance
or interoperability report. Statements about how AP2 behaves in production are
absent from this report because the evidence is absent.

**Point-in-time code reading.** All code findings are pinned to `e1ea56d`
(2026-04-29). The chain format tracks
`draft-gco-oauth-delegate-sd-jwt-00`, an individual draft rather than a
working-group document, and the SDK already documents deviating from it.[^s09]
Byte-level claims may not survive the next revision.

**Delta 4 is a single-observer measurement.** The two failing tests were
reproduced locally with the command shown; no corresponding upstream issue was
found, so this is not corroborated by maintainers or third parties. It is
reported as a reproducible measurement, not an accepted defect.

**Delta 1's exploitability is not established.** The omission of the merchant's
`checkout_hash` verification is certain from the code.[^s11][^s15] Whether it is
exploitable in the sample as shipped depends on whether an attacker can
substitute a `checkout_jwt` that still satisfies the constraint evaluator and
the downstream MPP check, which does bind `transaction_id`.[^s16] We assert the
divergence from the normative MUST and nothing more.

**The x402 `from`-address question is unresolved.** The PSP verifies that the
EIP-712 signature recovers to `authorization.from` but nothing observed binds
`from` to a wallet identified in the Payment Mandate's
`payment_instrument`.[^s17] Whether the upstream
`allowed_payment_instruments` constraint closes this was not established to
certainty, so it is raised as a question rather than a finding.

**Card rail less exercised than crypto rail.** The v0.2 sample defaults to
`FLOW=x402`;[^s24] the card MCP roles exist but the human-present card scenario
is still served by v0.1-shaped role servers.[^s25] Card-path statements rest on
less runnable code than x402-path statements.

**Go and Android samples read shallowly.** Both were confirmed to be v0.1 in
data model and A2A binding from their type definitions and
READMEs;[^s41][^s42] neither was audited to the depth of the Python v0.2 path.
Claims about them are limited to which model generation they use.

**Dispute-time verification is spec-only.** The five-step dispute procedure has
no corresponding code path or test in the repository.[^s01] Its practical
viability, and whether card networks will accept mandate tuples as evidence, are
assertions about future scheme rules rather than technical properties.

**Trusted Surface conformance is unevidenced.** Because no sample implements a
compliant Trusted Surface, this report cannot say what one looks like in
practice — only what the spec requires of it and what the sample does
instead.[^s01][^s21]

**Vendor-stated claims not independently confirmed.** Payment-rail agnosticism
and framework neutrality are the project's own claims.[^s26] The only rails
demonstrated in runnable v0.2 code are a mocked card processor and USDC on Base
Sepolia;[^s17] the only reference agent is ADK-based with a hard
`google-adk==1.28.0` dependency.[^s19] No third-party-framework implementation
was found to corroborate neutrality.

**Source concentration.** 38 of 45 sources resolve to `github.com`, which looks
like a single-origin evidence base but is not quite one: those split into
vendor-authored artefacts (the spec, schemas and code) and third-party-authored
issues and discussions filed against them. The genuinely independent
non-GitHub material — FIDO, Google's own blog, one trade outlet, UCP, two
comparison sites — is thin, and no peer-reviewed source on AP2 was found. A
reader should treat the protocol-mechanics sections as well evidenced and the
ecosystem-positioning sections as lightly evidenced.

**Comparison sources are practitioner-grade.** The ACP/UCP/AP2 contrasts draw on
vendor-adjacent technical writing, and at least one of those sources
misdescribes AP2 mandates as JSON-LD and uses the superseded v0.1 mandate
names.[^s37] They are used for the structural comparison only, never as an
authority on AP2's own mechanics.
