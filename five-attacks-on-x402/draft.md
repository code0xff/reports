# Five Attacks on x402 Agentic Payment Protocol

## Abstract

The x402 payment protocol revives HTTP's long-dormant `402 Payment
Required` status code as a per-request handshake for agentic
micropayments, coupling a synchronous web grant decision with
asynchronous on-chain settlement. Li, Wang, and Wang argue in a May
2026 preprint that this coupling creates a distinct cross-layer attack
surface, and they characterize five concrete attacks across four
classes: revert-grant under optimistic execution (I-A), unauthorized
settlement preemption (I-B), HTTP-layer replay without idempotency
(II), proxy-level header confusion and cache leakage (III), and
adversarial server selection on Bazaar-style discovery layers
(IV).[^s01] All five are demonstrated on a reproducible testbed
spanning Hardhat/Anvil, Base Sepolia, and four live x402 endpoints,
and the authors audit three SDK families and propose six mitigations.
The paper's headline observation is that x402's exposure is not a
collection of independent SDK bugs but a structural mismatch: HTTP is
synchronous and irrevocable, while blockchain settlement is
asynchronous and only probabilistically final, and no x402 SDK they
audited closes that gap by default.[^s01]

## 1. Introduction

x402 is Coinbase's proposal that HTTP's 402 status code carries an
embedded payment handshake, so APIs, agents, and content servers can
charge per request without accounts or sessions.[^s03][^s05] The
protocol entered public release in May 2025;[^s05] by the December
2025 V2 announcement the foundation reported more than 100 million
payments processed across APIs, apps, and AI agents,[^s06] and a
Cloudflare/Coinbase-led x402 Foundation launched on September 23,
2025 to govern its evolution.[^s07] The standard ships reference SDKs
in TypeScript, Python, and Go, and is meant to abstract on-chain
settlement behind an off-chain *facilitator* that exposes `/verify`
and `/settle` endpoints.[^s03] Coinbase's hosted facilitator handles
ERC-20 transfers on Base, Polygon, Arbitrum, World, and Solana, with
USDC/EURC settled through EIP-3009 `transferWithAuthorization` and
arbitrary ERC-20 tokens via Permit2.[^s04]

The simplicity of the handshake hides a cross-layer trust gap. HTTP is
synchronous: a request either succeeds or fails within milliseconds.
The blockchain layer offers only probabilistic finality. x402 bridges
these layers through the facilitator, whose correctness is neither
enforced by the protocol nor verifiable by the client.[^s01] The
paper under review — *Five Attacks on x402 Agentic Payment Protocol*
by Li, Wang, and Wang (arXiv 2605.11781) — is, to our knowledge, the
first formal security treatment of that gap, and is concurrent with a
broader systematization of agent-to-agent payments that lists x402 as
a representative design.[^s14]

This report walks through the paper's threat model, the five attacks,
their empirical evaluation, the cross-SDK audit, and the proposed
mitigations, with each technical claim cited back to the primary
preprint and corroborated against the standards and tools it builds
on.

## 2. Background and system model

A canonical x402 exchange has three phases.[^s01] In the
*request-and-quote* phase, the client issues an ordinary HTTP request
and the server replies with `402 Payment Required` plus a
*PaymentRequirements* object that quotes amount, token, chain id, and
receiver. In the *payment presentation* phase, the client constructs
a signed *PaymentPayload* — carrying `payment_id`, payer address,
amount, chain id, nonce, timestamp, and signature — and resends the
request with that payload in an `X-PAYMENT` header. In the
*verification, settlement, and grant* phase, the server calls the
facilitator's `/verify`, then `/settle`; the facilitator submits the
on-chain transaction; once settlement is reported, the server returns
the protected resource together with an `X-PAYMENT-RESPONSE`
header.[^s01][^s03]

The settlement transaction itself rides on existing Ethereum
standards. For USDC and EURC the facilitator calls EIP-3009's
`transferWithAuthorization(from, to, value, validAfter, validBefore,
nonce, v, r, s)`, which authorises a token transfer from
the explicit `from` address using the attached signature and tracks
per-authorizer nonces in
`mapping(address => mapping(bytes32 => bool))`.[^s08] For arbitrary
ERC-20 tokens the facilitator routes through Uniswap's Permit2, whose
signed messages designate a spender but do not natively bind
`msg.sender` to that spender — third parties can submit a valid
Permit2 signature on behalf of the owner.[^s11] Both flows sit on top
of EIP-712 typed structured-data signing.[^s09] EIP-3009 itself ships
with an explicit warning: "It is possible for an attacker watching
the transaction pool to extract the transfer authorization and
front-run the `transferWithAuthorization` call,"[^s08] and the
standard recommends `receiveWithAuthorization` precisely because it
adds the caller check that the unbound variant omits.[^s08]

Li, Wang, and Wang model an x402 system as
`S = (C, R, F, B, N, T, λ)` — clients, resource servers, facilitators,
blockchain, network, time, and security parameter — and abstract four
security properties from this model: *authorization soundness* (the
server never grants without an eventually final settlement),
*payment–service correspondence* (every settled payment maps to
exactly one grant), *replay resistance* (a payload is usable at most
once), and *facilitator k-atomicity* (the facilitator never reports
finality before `k` confirmations).[^s01] Theorems 6–9 of the paper
formalize when these properties hold or fail; Corollary 10 derives a
confirmation-depth recommendation we return to in §6.[^s01] In
short, the security definitions tie each later attack to a precise
violation event rather than to a softer "vulnerability" label.

## 3. The five attacks

### 3.1 Attack I-A — Revert-grant under optimistic execution

x402 deployments may run an *optimistic* policy in which the resource
server grants access as soon as the facilitator returns a positive
verification — for example, on mempool visibility or shallow
inclusion — instead of waiting for `k` confirmations. Attack I-A
exploits the gap between that grant moment and durable on-chain
finality. The attacker need not corrupt cryptography: a network or
chain-side adversary that delays the verification path, replaces the
settlement via RBF, or induces a bounded reorganization can remove
the payment from the canonical chain after the resource has already
been delivered.[^s01] The failure event is captured formally as
`E_revert = {g | ¬∃ tx_pp : Final(tx_pp, k) at t_g ∨ tx_pp later absent
from the canonical chain}`,[^s01] and Theorem 7 lower-bounds the
revert-grant probability `RGP_k ≥ p_reorg · Pr[T_inc + k·T_b > Δ]`
where `Δ = T_verify + δ` is the grant time and `δ` is adversarial
delay on the `R→F` path.[^s01] The pattern is the HTTP analogue of
"0-conf acceptance": once the response is on the wire, the server
cannot claw the resource back, even though the chain still can.

### 3.2 Attack I-B — Unauthorized settlement preemption

Attack I-B inverts the failure direction: the payment settles, but
the server never serves. The adversary is anyone who reads the
`X-PAYMENT` header before the honest facilitator gets to use it — a
TLS-terminating proxy, a logging middleware, an API gateway, or a
Byzantine resource server. With the embedded authorization in hand,
the attacker races the facilitator and submits the settlement first
from an attacker-controlled account; once the nonce is consumed, the
honest facilitator's later submission fails, and the server returns
`402` even though the payer has been charged.[^s01] The paper
demonstrates the same caller-unbound pattern on two settlement paths
on Base Sepolia: an EIP-3009 trace in which an unrelated address
submits `transferWithAuthorization` and consumes the nonce while the
endpoint later returns HTTP 402, and a Permit2 proof of concept
against `x402ExactPermit2Proxy` where an unrelated EOA calls
`settle()` with the observed Permit2 signature and the legitimate
submission reverts.[^s01]

The root cause is straightforward. EIP-3009 documents the
front-running risk explicitly,[^s08] and Permit2 signatures designate
a spender rather than a submitter, so any observer with the signed
message can broadcast the transaction.[^s11] The audit confirms the
deployment-side consequence: in the audited Permit2 contracts,
`x402ExactPermit2Proxy` omits the caller restriction in `settle()`,
while only `x402UptoPermit2Proxy` carries a `Witness` field that
binds the facilitator and enforces it on entry.[^s01]

### 3.3 Attack II — Replay / idempotency across the HTTP–chain boundary

x402 carries a bearer-style payment capability in `X-PAYMENT`. If the
server does not atomically claim `(pay_id, resource_id)` before
releasing a response, the same capability can be replayed across
retries, concurrent workers, or semantically equivalent encodings,
and each replay produces another HTTP grant — even though the chain
will only accept one settlement.[^s01] The duplicate-grant event is
`E_dup = {pay_id | GrantCount(pay_id, E) > IntendedPayments(pay_id,
E)}`, and Theorem 8 makes the protective rule precise: with a
pre-grant claim plus a freshness window narrower than the claim
TTL, `Pr[E_replay] = 0`; without it, replaying `n` times yields `n`
grants with probability one.[^s01]

The local matrix bears this out — without `pay_id` deduplication,
DGR = `n` across the audited testbed and across the Python and Rust
SDKs in optimistic mode; only the Rust SDK in pessimistic mode (which
settles synchronously before responding) drops DGR back to 1.[^s01]
A live Base Sepolia endpoint amplified the effect: a barrier-released
batch of 1,000 concurrent replays of one payment header produced 248
HTTP grants from a single on-chain settlement.[^s01] The on-chain
nonce is enforced, but it protects only the contract; it tells the
resource server nothing about whether a prior HTTP grant has
already happened for the same logical payment.[^s01]

### 3.4 Attack III — HTTP / proxy-level confusion

x402 places spendable payment material inside ordinary HTTP
infrastructure, which means proxies, CDNs, caches, and gateways
inherit the payment boundary. The paper validates two manifestations.
*D1: header rewriting* depends on the proxy stack: in the authors'
setup, `nginx` and Caddy do not rewrite `X-PAYMENT` in 2,000
requests, but a custom MitM proxy injects a duplicate `X-PAYMENT` in
100 % of 1,000 requests and the Node/Express stack consistently
exposes the last value — establishing parser ambiguity but not an
end-to-end bypass.[^s01]

*D2: cache leakage* is the cleaner exploit. With `nginx` `proxy_cache`
enabled and no `Cache-Control` protection, 1,000 out of 1,000 unpaid
requests are served the cached paid response; when the origin emits
`Cache-Control: no-store, private`, 0 out of 1,000 leak.[^s01] One
of the four live endpoints in the audit returned publicly cacheable
paid responses, allowing unpaid clients to retrieve cached content
during the CDN cache window.[^s01] The audited SDKs do not
automatically add `no-store` or `private` to payment-gated responses,
leaving cache safety to application or CDN configuration.[^s01]

### 3.5 Attack IV — Server-selection attacks on Bazaar-style discovery

The fifth attack runs upstream of the payment protocol. Bazaar-style
discovery layers — for which x402scout is a public example, listing
hundreds of trust-scored x402-enabled services on Base mainnet[^s13]
— compress a catalog into a shortlist that an LLM agent then ranks.
The paper shows that an attacker who controls listings can bias that
shortlist in two cheap ways: *E1* rewrites names, descriptions, and
prompts on a single attacker server so that the LLM treats it as more
relevant, and *E2* registers `r` Sybil aliases per category so that
adversarial entries occupy more of the shortlist.[^s01]

The empirical results across 2,160 discovery decisions are striking.
A single crafted listing wins selection in 71.8 % of E1 trials on
MiniMax-M2.7, 69.4 % on GPT-5.3, and 68.8 % on Sonnet 4.5 — the
similar pattern across models suggests the effect tracks the
discovery setup rather than any single model.[^s01] _(early signal,
single-team evaluation)_ Five Sybils raise aggregate selection from
27.5 % at `r=1` to 60.2 % at `r=5`, with the document-generation
category reaching 93.3 %.[^s01] An April 2026 live-registry snapshot
of 13,760 endpoints across 420 domains, with the top nine domains
accounting for 87.8 % of registrations, suggests that real ecosystems
are already concentrated enough for one or two players to dominate
the shortlist.[^s01] _(unverified — single source)_ The harm is not
just bad service selection: once the agent picks the wrong server,
the payment flow follows that choice, so attacks IV → I/II can chain
into direct economic loss.[^s01]

## 4. Evaluation and cross-implementation audit

The empirical scope is meaningful: more than 25,000 payment requests
across 48 configurations on Hardhat/Anvil and Base Sepolia, validated
against four live x402 endpoints, plus 2,160 LLM-driven discovery
decisions; rate metrics carry 95 % Wilson confidence intervals at
`z = 1.96`.[^s01] The reorg injector snapshots a local Hardhat chain,
mines a branch containing the settlement transaction, and reverts
with probability `p_reorg`, supplemented by an analytic Bernoulli
model for larger sweeps; Base Sepolia is used for timing sanity and
live preemption traces but cannot estimate revert probabilities
because public-testnet reorgs cannot be injected.[^s01]

The headline numbers tie back to the four attack classes. RGP₀
climbs to 4.70 % under `p_reorg = 0.05` and `δ = 200` ms in the
fixed `T_b = 2` s sweep and to 5.18 % at `δ = 400` ms, while a
Byzantine facilitator reaches the 100 % upper bound; increasing `k`
collapses RGP_k to the CI floor but stretches the grant-to-finality
gap `T_gf` from 1.6 s to 25.1 s, sharpening the security–latency
tradeoff.[^s01] _(controlled estimate, not a live-network frequency)_
DGR rises with replay count `n`, hitting 248 HTTP grants against
a single live settlement on Endpoint-2.[^s01] Cache leakage hits
100 % on `nginx` without `Cache-Control` and 0 % once `no-store,
private` is in place.[^s01] Attack IV's selection-rate matrix is
summarized above.

The cross-implementation audit covers the Coinbase reference
TypeScript SDK (SDK-A), a third-party Python integration (SDK-B), and
a third-party Rust middleware (SDK-C), plus the four live endpoints,
across six properties: `k`-confirmation gating, timestamp-window
enforcement, `pay_id` idempotency, `resource_id` binding,
settle-before-grant ordering, and `Cache-Control` hygiene.[^s01]
Only timestamp windows are universally enforced; `resource_id`
binding and `Cache-Control` are missing from every audited SDK; only
SDK-A consistently settles before granting, and even SDK-A does not
wait long enough for reorg resistance; SDK-B's streaming path
flushes the paid response before `settle_payment` runs, so settlement
failures are silently dropped; and SDK-C only avoids duplicate grants
in pessimistic mode, where it settles synchronously before
responding.[^s01] _(point-in-time audit; vendors may have shipped
fixes after responsible disclosure)_

The authors privately reported their findings to Coinbase via
HackerOne under reports `#3679163`, `#3679179`, and `#3679220`,
covering x402 permit settlement, Bazaar discovery registration, and
resource-identifier binding.[^s01] _(access-limited — HackerOne
reports are not public)_

## 5. Proposed mitigations

The paper proposes six mitigations and maps each to one or more
attacks.[^s01]

- **M1 — Canonical typed encoding with freshness.** Payment payloads
  should use one canonical EIP-712-typed structure[^s09] over at
  least `pay_id`, `resource_id`, facilitator, amount, token,
  `chain_id`, and expiry; servers and facilitators reject malformed
  encodings, expired timestamps, duplicate `pay_id` values, and
  out-of-window nonces before settlement.[^s01]
- **M2 — Facilitator-bound settlement.** On Permit2 paths the
  `Witness` must include a `facilitator` field and `settle()` must
  enforce `msg.sender == witness.facilitator`; on EIP-3009 paths the
  facilitator should route through a wrapper that performs the same
  check before calling `transferWithAuthorization`.[^s01] This closes
  the preemption window from Attack I-B and is consistent with the
  EIP-3009 standard's own recommendation to prefer `receiveWith-
  Authorization` for contract-mediated flows because it adds a
  payee-as-caller check.[^s08]
- **M3 — Single-use grants and resource binding.** The server treats
  `X-PAYMENT` as a single-use capability and atomically claims the
  `(pay_id, resource_id)` pair before releasing any protected
  response, rejecting duplicate claims within a bounded TTL.[^s01]
- **M4 — Two-phase settlement.** Low-latency deployments should use
  reserve-then-settle (or wait for `k` confirmations on higher-value
  resources), so operators choose the residual revert-grant exposure
  explicitly rather than inheriting it from the facilitator.[^s01]
- **M5 — Cache and header hygiene.** Payment-gated responses must
  carry `Cache-Control: no-store` or `private` and bypass shared
  caches where possible.[^s01]
- **M6 — Agent-selection defenses.** Discovery layers should validate
  metadata, reject prompt-injection-like listing claims, apply Sybil-
  resistant registration or reputation weighting, and diversify
  ranking so that no single provider dominates the
  shortlist.[^s01]

## 6. Discussion

The security–latency tradeoff is sharp. Under the paper's controlled
reorg model and fixed `T_b = 2` s, median `T_gf` grows from 6.0 s at
`k = 3` to 25.1 s at `k = 12`, while RGP_k stays at the CI floor; in
the overnight `T_b = 12` s sweep, the corresponding `T_gf` values
reach 34.3 s, 71.5 s, and 144.5 s for `k = 3, 6, 12`.[^s01]
Corollary 10 derives the recommendation deployments should choose
between: under exponential finality decay `ε_chain(k) ≈ e^{-α k}`,
`k ≥ 3` keeps the target failure probability below `10^{-2}` for
resources under $1, and `k ≥ 12` keeps it below `10^{-4}` for
resources over $10 on Base.[^s01] _(model-derived guidance, not a
direct live-network measurement)_

Compatibility with emerging Ethereum standards is partial. EIP-712
typed signing already underlies EIP-3009 and so naturally fits the
M1 canonical-encoding proposal.[^s09][^s08] EIP-8004 ("Trustless
Agents") supplies an on-chain registry and reputation/validation
layer for agent discovery — directly relevant to Attack IV — but its
own specification explicitly notes that "payments are orthogonal to
this protocol and not covered here," so EIP-8004 is best read as a
complementary trust-and-discovery surface rather than a payment
standard.[^s10] The Agent2Agent (A2A) protocol, now stewarded by the
Linux Foundation, focuses on cross-framework agent interoperability
and is one of the agent ecosystems the paper expects x402 to
underpin;[^s12] the concurrent SoK on blockchain agent-to-agent
payments classifies x402 as a representative design and frames the
same security boundary across discovery, authorization, execution,
and accounting that the paper attacks.[^s14]

The deeper interpretive point is that x402's exposure is structural
rather than incidental: an HTTP grant decision is synchronous and
irrevocable, while on-chain settlement is asynchronous and only
probabilistically final, so any single-step verify-and-grant flow
inherits the gap between the two.[^s01] The mitigations are exactly
the steps that make that gap explicit — pin the resource into the
signature (M1, M3), pin the submitter into the contract (M2), pick
the residual reorg exposure deliberately (M4), seal the
payment-gated response from shared infrastructure (M5), and harden
the discovery surface that picks the server in the first place
(M6).

## 7. Limitations

Three limitations bound the strength of the paper's claims.[^s01]
First, the revert-grant probabilities come from a controlled
Hardhat reorg injector and an analytic Bernoulli model, not from
observed public-network reorgs; the authors explicitly mark these as
controlled estimates rather than live-network frequencies. _(model
sensitivity analysis, not a frequency estimate)_ Second, the
implementation coverage is wide but not exhaustive: three SDK
families, four live endpoints, and three LLMs at temperature 0.1,
mediated by a particular x402scout-based catalog — consistent with a
real effect but not enough to claim that all agent loops, ranking
pipelines, or registries behave the same way. _(early signal,
single-team evaluation)_ Third, several adversaries and Attack IV
variants are out of scope: fully malicious resource servers `A_R`,
colluding `R/F` pairs, and variants E3 (price/latency
manipulation), E4 (latency/availability cues), and E5 (facilitator
affiliation) are flagged as future work. Hardening x402 against fully
malicious resource servers would likely require client-visible
settlement receipts or independent on-chain verification, rather
than facilitator trust alone.[^s01]
