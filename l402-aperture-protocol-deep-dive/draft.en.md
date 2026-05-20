# The L402 Protocol and Aperture — A Deep Dive into Lightning Labs' Lightning-Native HTTP 402 Payment Standard

## Abstract

This report unpacks the **L402** protocol — first published by Lightning Labs in March 2020 under the name **LSAT** (Lightning Service Authentication Tokens)[^s03] and later renamed to reference the HTTP 402 status code it operationalises[^s01][^s04][^s05] — at the level of its primary specification. L402 combines (a) HTTP 402 Payment Required, (b) **macaroons** as bearer tokens, and (c) **Lightning Network** payments to perform stateless payment-and-authentication verification, without any database lookup[^s04][^s05][^s07]. On top of it sits **Aperture**, Lightning Labs' Go reference implementation — MIT-licensed, v0.5.0 as of 25 March 2026 on pkg.go.dev, and running in production for Lightning Loop[^s02][^s10]. The report quotes both GitHub READMEs (`lightninglabs/L402`, `lightninglabs/aperture`), the protocol specification, `sample-conf.yaml`, `aperture.go`, and the 2020 and 2026 Lightning Engineering blog posts[^s03][^s08][^s09] to lay out (i) how L402 works, (ii) how Aperture implements that abstraction, and (iii) how it compares to later standards like x402 and MPP.

## 1. Introduction — Why L402 is back in the spotlight

L402 is not a 2026 standard — it was already shipped in 2020. Lightning Labs CTO Olaoluwa Osuntokun framed the original LSAT launch on 30 March 2020: "By leveraging L402s, a service or business is able to offer a new tier of paid APIs that sits between free and subscription: metered, with no login, email or passwords required!"[^s03]. After six relatively quiet years, the agent-payments push of 2025–2026 has put it back on stage.

Lightning Labs' own 11 March 2026 post puts the shift plainly: "Agents can read documentation, write code, orchestrate multi-step workflows, and call APIs across the web. They cannot, by and large, pay for things"[^s08]. L402 was always designed for *clients that are not humans* — one HTTP round-trip that resolves both payment and authentication — which is exactly the requirement of agent commerce[^s06][^s08].

Independent coverage echoes the framing — "L402 lets a client pay for online resources in one automated step"[^s18]. The rest of this report breaks that down into (a) the protocol, (b) the reference proxy Aperture, (c) the comparison.

## 2. Background — Standards stack

### 2.1 HTTP 402 and three competing standards

HTTP 402 "Payment Required" has been "reserved for future use" since RFC 7231. Three standards now compete for that slot in 2025–2026: L402 (Lightning + macaroons)[^s01], x402 (EVM + EIP-712 / EIP-3009)[^s17], and MPP (multi-rail intents)[^s16]. ln.bot's comparison nails the chronology: L402 was first, "Lightning Labs publishing the spec in 2020 under the name LSAT, later renamed to reference the status code it activates"[^s16].

### 2.2 Lightning Network and BOLT 11 invoices

The payment layer of L402 is the Lightning Network. The merchant issues a BOLT 11 invoice; the client pays and receives the `preimage` (`r`, 32 bytes). The hash relationship `sha256(r) == payment_hash` is the *cryptographic proof* of payment[^s04][^s05]. That one line is the heart of L402 — anyone with the preimage can verify the payment without consulting any database.

### 2.3 Macaroons — HMAC chain + caveats

L402's token is not a generic OAuth Bearer token but a **macaroon**. Lightning Engineering's macaroon doc summarises: "Macaroons can be attenuated by the user with their own restrictions. This allows to delegate permissions and functions in a safe way"[^s07]. Macaroons are signed by an HMAC chain; each link can add a "caveat" that further restricts authority. Caveats are one-directional — successive caveats can only *narrow* authority, never widen it[^s05][^s07]. That asymmetry is what lets a parent agent attach "up to $100 USDC, within 24 hours" caveats to its own macaroon before handing it to a child agent.

## 3. The L402 protocol specification

### 3.1 Challenge / response

The protocol headers fit in two lines[^s05]:

```text
WWW-Authenticate: L402 macaroon="<base64>", invoice="<bolt11>"
Authorization:    L402 <base64(macaroon)>:<hex(preimage)>
```

The full flow is four steps:

1. **Client requests a protected resource.**
2. **Server responds 402** with `WWW-Authenticate` carrying the macaroon and a BOLT 11 invoice[^s05].
3. **Client pays the Lightning invoice** and obtains the preimage `r`.
4. **Client retries** with `Authorization: L402 <base64(macaroon)>:<hex(preimage)>` and gets the resource[^s05].

### 3.2 Token format and payment-hash binding

The decisive detail is that **the macaroon's identifier commits to the invoice's `payment_hash` H**[^s05]. The specification spells it out: "The macaroon's identifier commits to the payment hash H of the Lightning invoice. This commitment enables in-band payment verification: the server can confirm a client has paid using only the macaroon and preimage, with no additional state or backend lookup"[^s05]. Verification then reduces to: (1) extract H from the macaroon, (2) compute `sha256(r)` from the incoming preimage and compare to H, (3) verify the macaroon's HMAC chain and that all caveats pass — all stateless[^s04][^s05][^s07].

### 3.3 402 vs 401

The spec separates the two status codes deliberately: "402 Payment Required: Used exclusively for initial challenges when no credential exists. 401 Unauthorized: Returned when credentials are present but invalid, tampered, or verification fails"[^s05]. The rule is explicit: "Once a client presents a credential (valid or not), the server MUST respond with 401 if verification fails, not 402"[^s05]. The split makes "I have no credential and need to pay" and "my credential is broken" two different states for the client to react to.

### 3.4 Caveats and delegation

A macaroon caveat can encode any condition — service access, capabilities, expiry, volume — as long as it only narrows authority: "Caveats can encode service access, capabilities, expiration, volume limits, and other constraints. Each successive caveat can only narrow the macaroon's authority, never widen it"[^s05]. Lightning Labs' canonical example: "Loop could issue a Macaroon to an exchange, which could apply further restrictions before handing it to the end users"[^s07].

### 3.5 gRPC adaptation

gRPC always returns HTTP/2 200, so L402 specifies a separate adaptation: "For gRPC, servers return HTTP 200 but encode the L402 challenge in trailing headers (`grpc-status: 402`) since gRPC requires 200 responses"[^s05]. The token format itself is the same across REST and gRPC.

### 3.6 BLIP-0026 standards tracking

L402 has a pull request open at `lightning/blips` as **BLIP-0026** (Bitcoin Lightning Improvement Proposal)[^s15], placing it on the Lightning standards track and not merely as a vendor spec. As of this writing, formal IANA HTTP-authentication-scheme registration is not confirmed.

## 4. Aperture — Lightning Labs' reverse proxy

### 4.1 Overview

Aperture is the reference implementation merchants run to accept L402. The README's one-liner: "An HTTP 402 reverse proxy that supports proxying requests for gRPC (HTTP/2) and REST (HTTP/1 and HTTP/2) backends using the L402 Protocol Standard"[^s02]. MIT licensed; v0.5.0 published 25 March 2026[^s10]. It runs in production for Lightning Loop: "Aperture is a Lightning HTTP 402 (L402) reverse proxy … used in production by Lightning Loop for non-custodial on/off ramps on the Lightning Network"[^s10].

### 4.2 Package structure

pkg.go.dev lists seven Aperture packages[^s10]:

| Package | Purpose |
|---|---|
| `auth` | L402 token and macaroon authentication |
| `proxy` | HTTP/2 and gRPC backend routing |
| `mint` | Token minting and invoice generation |
| `l402` | L402 protocol implementation |
| `admin` | Admin API and management endpoints |
| `aperturedb` | Database backends (SQLite, Postgres, etcd) |
| `challenger` | Payment challenge generation |

The core service struct is `Aperture`; the lifecycle methods are three[^s10][^s12]:

```go
func NewAperture(cfg *Config) *Aperture
func (a *Aperture) Start(errChan chan error, shutdown <-chan struct{}) error
func (a *Aperture) Stop() error
```

`UpdateServices(services []*proxy.Service) error` lets the service list change at runtime[^s10]. `Start` brings up Prometheus metrics, the DB connection (etcd / Postgres / SQLite), TLS, gRPC / REST servers, and HTTP listeners in order; `Stop` brings down challenger, admin server, proxy, DB, HTTP server in the reverse order[^s12].

### 4.3 `sample-conf.yaml` — LND auth + backend choice

Aperture reads `~/.aperture/aperture.yaml`; `sample-conf.yaml` is the template[^s11]. The key blocks:

```yaml
listenaddr: localhost:8081
debuglevel: debug
basedir: /path/to/.aperture
insecure: false
autocert: false

authenticator:
  network: simnet
  lnd:
    host: localhost:10009
    tlspath: /path/to/lnd/tls.cert
    macdir: /path/to/lnd/data/chain/bitcoin/simnet

database:
  backend: sqlite   # or postgres / etcd
  sqlite:
    dbfile: /path/to/.aperture/aperture.db

services:
  - name: example
    hostregexp: ^example\.com$
    pathregexp: ^/api/.*$
    address: backend.local:8080
    protocol: https
    authwhitelistpaths: [...]
    auth: L402
    capabilities: "add,subtract"
    pricing: { ... }
```

Multiple services can be registered, each routed by `hostregexp` / `pathregexp`, with its own capability list (the caveats baked into the macaroon), pricing rules (fixed / dynamic / tier), and rate-limit rules[^s11]. Tor, the hashmail server for Lightning Node Connect, and Prometheus metrics are optional[^s11].

### 4.4 LND wiring and invoice issuance

`authenticator.lnd` is the integration point. Aperture connects to lnd with macaroon + TLS authentication and (a) issues a BOLT 11 invoice for every challenge, (b) polls or subscribes to invoice updates to receive the preimage[^s02][^s20]. The merchant has to operate lnd themselves — in exchange they get no external facilitator dependency[^s04][^s20].

### 4.5 Admin API · dashboard · CLI · MCP

A rich optional surface area:

- **gRPC / REST admin API** — 10 RPCs for registering / updating services, querying transactions, token stats, revenue monitoring. "Services persist to the database and survive restarts" and "changes take effect immediately"[^s02].
- **Dashboard build tag** — `dashboard` build tag compiles in an embedded Next.js dashboard[^s02].
- **`aperturecli`** — a separate CLI binary. It embeds an MCP server so Claude Code / Codex can drive it directly[^s02].

### 4.6 Rate limiting

Token-bucket rate limiting is a first-class feature — "path-based rules" with per-client isolation, so different routes can carry different limits via regex[^s02]. When the bucket is empty, REST gets `HTTP 429 + Retry-After`, gRPC gets `ResourceExhausted`[^s02].

## 5. Code and SDK ecosystem

### 5.1 Client-side libraries

Client SDKs for L402 have largely come out of Tierion.

- **`Tierion/lsat-js`** — JavaScript utility library: "A javascript library for working with LSATs (Lightning Service Authentication Tokens)"[^s13]. Handles macaroon (de)serialisation, preimage attachment / verification, and caveat addition at SDK level.
- **`Tierion/boltwall`** — Node.js + TypeScript middleware: "Bitcoin Lightning paywall and authentication using LSATs. Built with LND, Nodejs, and Typescript"[^s14]. Effectively the Node-side analog of Aperture as a paywall middleware.

(There is no single canonical Go client SDK called `lsat-go` as of this writing; most Go clients import Aperture's own `l402` package directly _(unverified — single source)_.)

### 5.2 Lightning Agent Tools (announced 11 Feb 2026)

On 11 February 2026 Lightning Labs released "Lightning Agent Tools," a seven-skill package[^s09][^s19]. The announcement summarises: "The new Lightning agent tools repo ships with seven composable skills covering the full agent commerce stack: running a Lightning node, isolating private keys with a remote signer, baking scoped credentials, paying for L402-gated APIs, hosting paid endpoints, querying node state via MCP"[^s09]. The seven skills are (1) running an LN node, (2) remote signer for key isolation, (3) scoped credential baking, (4) **`lnget`** — auto-paying CLI client for L402-gated APIs, (5) **`aperture` skill** — hosting paid endpoints, (6) node-state queries via MCP, (7) buyer / seller workflow orchestration[^s09]. Distribution is via Claude Code · Codex · npx · ClawHub[^s09].

### 5.3 Standards tracking

L402 has BLIP-0026 open at `lightning/blips` PR #26[^s15]. That places it on the Lightning standards track, not in vendor-spec territory.

## 6. Comparison — L402 vs x402 vs MPP

| Axis | L402 | x402 | MPP |
|---|---|---|---|
| Payment asset | BTC / Lightning sats[^s01][^s16] | USDC and other EVM ERC-20[^s17] | USDC / cards / SPTs etc.[^s16] |
| Token | macaroon + preimage[^s05] | EIP-712 / EIP-3009 signatures | EIP-712 voucher / card tokens |
| Settlement model | Immediate Lightning + stateless verify[^s04] | Facilitator `/verify` + `/settle`[^s17] | Channel + cumulative commitment[^s16] |
| Launch | 2020 as LSAT[^s03], renamed to L402[^s16] | 2025[^s17] | 2025–2026[^s16] |
| Price unit | 1 sat (sub-cent)[^s16] | gas + token ≈ 1¢ to tens of cents[^s16] | sub-cent to dollars |
| Governance | Lightning Labs + BLIP-0026[^s15] | x402 Foundation (Coinbase + Cloudflare)[^s17] | IETF draft (Tempo + Stripe) |
| Censorship resistance | Bitcoin PoW consensus[^s16] | EVM chain + Circle USDC issuer[^s16] | Operator-dependent |
| Price stability | Exposed to BTC volatility[^s16] | USD-pegged[^s16] | Varies |

ln.bot's comparison reaches the same conclusion: L402 has "stateless cryptographic verification requiring no external dependencies," whereas x402 depends on "facilitators or chain queries that introduce latency and operational complexity"[^s16]. On censorship resistance, L402 sits on Bitcoin where "nobody can freeze your sats, censor your payment, or unilaterally shut down the network," while x402 relies on the USDC issuer (Circle) and Base's sequencer (Coinbase)[^s16].

The comparison is not "one is better." The sister report [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/) shows how x402 batch-settlement and MPP `session` split by traffic shape on top of the same problem; L402 is the Bitcoin-native standard that *predates* both.

## 7. Discussion — When to pick L402

(interpretive) The judgement that this report's evidence supports:

- **AI agent commerce and 1-sat micropayments** — Lightning routing fees in the 1-sat (sub-cent) range make "less than one cent per call" economically viable[^s16]. Other standards require additional channel / batching infrastructure to reach the same floor; L402 hits it with single-shot payments.
- **Non-EVM environments / Bitcoin-native operators** — Merchants already running Bitcoin infrastructure (lnd), or those who want to avoid EVM dependency, fit L402 naturally.
- **Stateless-verification-critical environments** — When external facilitators, RPC providers, or chain indexers are off the table, L402's `(macaroon, preimage)` pair is the simplest possible verification primitive[^s04].
- **Where L402 is the wrong fit** — USD-pegged price tables, dispute / chargeback flows for consumer payments, or business logic that requires receiving EVM tokens as the settlement asset — for those, x402 / MPP / ACP are better fits _(interpretive)_[^s16].
- **The pragmatic answer** is for agents to support multiple standards through an adapter layer — the sister report [`agent-payments-smart-account-design`](../agent-payments-smart-account-design/) recommends exactly that. L402 fills the Bitcoin-native slot in that adapter set.

## 8. Limitations

- This report reflects primary specs, docs, GitHub, and blog posts as of 20 May 2026. The body of `lightning/blips` PR #26 (BLIP-0026) was not quoted; only its existence was confirmed[^s15].
- The L402 specification file moved between `specification.md` and `protocol-specification.md` at different times; this report cites the latter[^s05].
- For client SDKs, beyond `lsat-js` (JavaScript) and `boltwall` (Node.js), no canonical multi-language library was identified within the scope of this report.
- Aperture's `aperture.go` code citations are based on master branch reading; the v0.5.0 release may have moved relative to master since.
- The L402-vs-x402 framing on USD price stability and censorship resistance is sourced from ln.bot's comparison[^s16]; that source is sympathetic to Lightning, and the report's uncertainties file reflects this.
- A complete inventory of Aperture-in-production deployments beyond Lightning Loop is out of scope here.
