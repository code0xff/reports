# A Code-Level Reading of solana-foundation/pay

## Abstract

`pay.sh` is the consumer-facing name of a CLI announced jointly by the
Solana Foundation and Google Cloud on 5 May 2026 [^s29]. It lets local
shell commands and AI agents pay HTTP-`402`-gated APIs in stablecoins
on Solana without API keys [^s01]. This report does not review the
press; it reviews the public source repository at
`github.com/solana-foundation/pay` [^s24].

The repo is a Cargo + pnpm monorepo with **seven Rust crates** (`cli`,
`core`, `keystore`, `mcp`, `pdb`, `types`, `integration`) and a
TypeScript workspace that ships the refreshed `@solana/pay` v1.x URI
library plus a Vite/React Payment Debugger SPA [^s03][^s22][^s20].
Two HTTP `402` payment protocols — **x402** and the Solana
Foundation's **MPP** — are pulled in as git dependencies from the
sister `x402-sdk` and `mpp-sdk` repositories [^s03]; the CLI only
wraps them. A separate `pay-keystore` crate cleanly splits the
biometric `AuthGate` from the platform `SecretStore` and is explicit
that the auth gate is **advisory** — the OS keychain ACL, not the
prompt, is the actual security boundary [^s09]. An MCP server in
`pay-mcp` exposes seven tools to LLM hosts so that "pay claude" or
"pay codex" launches an agent already wired to the local
wallet [^s13][^s23]. The repo is moving fast — eight releases between
3 and 6 May 2026 alone [^s26] — so version-pinned details below should
be read as a 2026-05-08 snapshot.

## 1. Introduction

When Solana and Google Cloud "rolled out" `pay.sh` on 5 May 2026, the
press described it as a way for AI agents to discover and pay for APIs
using stablecoins, without subscriptions or pre-issued
credentials [^s29][^s30][^s31]. The README in the underlying repo
phrases it more narrowly: pay is "the missing payment layer for HTTP"
that "handles x402 and MPP payment challenges with user-authorized
stablecoin signing" [^s01].

The repository hosting that code is `github.com/solana-foundation/pay`,
licensed MIT with `main` as the default branch [^s24]. As of
2026-05-08 the GitHub REST API reports ~1.6k stars, ~550 forks, 29
open issues, and a `pushed_at` of 2026-05-07T01:22:28Z [^s24], with
both `pay-v0.13.0`→`pay-v0.16.0` and `@solana/pay`
`v1.0.0-beta.13`→`v1.0.16` released between 3 and 6 May
2026 [^s26].

The repository's `created_at` is 2021-10-19 [^s24]. That long
backstory is not just metadata: the `typescript/packages/solana-pay`
tree contains the original `@solana/pay` library, the URL-scheme
implementation that powered Solana QR-code commerce well before
`pay.sh`, now refreshed to v1.0 on top of `@solana/kit` v6 [^s21].
The Solana Foundation merged the new CLI engine into that legacy
repo rather than fork; `@solana/pay` now does double duty, both
shipping the URI library on npm and acting as the install vehicle
for the `pay` binary on every supported platform [^s22].

The rest of this report walks the repo bottom-up: topology and build
system, the CLI and its protocol plumbing, local-wallet security, and
the agent / server tooling that surround it.

## 2. Repository Topology & Build System

The top of the repo is intentionally thin: `rust/`, `typescript/`,
`pdb/`, `skills/`, a `Justfile`, a Lua `pay-0.1.1-1.rockspec`
(LuaRocks packaging), `LICENSE` (MIT), `SECURITY.md`, and a
`.github/` with seven workflow files (`ci.yml`, `docker.yml`,
`label-actions.yml`, `npm-publish.yml`, `pull-requests.yml`,
`release-cli.yml`, `report.yml`) [^s01]. The GitHub `/languages`
endpoint reports the byte mix as Rust 1,960,253; TypeScript 316,536;
CSS 30,422; JavaScript 15,643; Just 5,508; Swift 4,853; MDX 3,160;
Lua 1,941; Dockerfile 958; HTML 591 [^s25]. Rust is by far the
heaviest tree; Swift is small but load-bearing — it is the macOS
Touch ID helper.

The Rust side is a workspace declared in `rust/Cargo.toml` with
`members = ["crates/*"]`, `default-members = ["crates/cli"]`,
`resolver = "2"`, and a workspace package version `0.16.0` on the
2024 edition [^s03]. The seven member crates are `cli`, `core`,
`integration`, `keystore`, `mcp`, `pdb`, and `types`. Internal crate
edges flow from `cli` → `core` (which itself splits into `client/`
and `server/`) → `types`/`keystore`, with `mcp` and `pdb` as
peers [^s03][^s12].

The TypeScript side is a pnpm workspace whose root `package.json` is
just `{ "private": true, "packageManager": "pnpm@10.29.2" }` [^s22].
The single published package is `@solana/pay` v1.0.16, declared in
`typescript/packages/solana-pay/core/package.json`. That manifest
exposes `bin: { "pay": "./run.cjs" }` and ships a postinstall
machinery (`install.cjs`, `platform.cjs`) along with a
`supportedPlatforms` table mapping every Tier-1 target — macOS
(`aarch64-apple-darwin`, `x86_64-apple-darwin`), Linux gnu/musl, and
`x86_64-pc-windows-msvc` — to a published GitHub release artifact
(`pay-<triple>.tar.gz` or `pay-<triple>.zip`) [^s22]. So
`npm install -g @solana/pay` is effectively a "fetch the prebuilt
Rust binary for your platform from the GitHub release" command
dressed up as a JS package — the JS library and the CLI binary share
a name on purpose.

Build orchestration is via [`just`][s02]. The root `Justfile` has
modules `mod rs 'rust/Justfile'` and `mod ts 'typescript/Justfile'`
and several top-level recipes [^s02]. The interesting one is `just
install pay`: it first builds the Vite/React Payment Debugger
(`cd pdb && pnpm install --frozen-lockfile && pnpm build`), then
either installs from the standard cargo path or delegates to a
crate-local `cargo cli-install`, so the resulting binary embeds the
debugger assets [^s02]. CI hooks into `just lint`, `just test`, and
`just build`; the `lint` recipe pairs `pnpm --filter @solana/pay lint`
with `cargo clippy --workspace --all-targets -- -D warnings` [^s02].

[s02]: https://github.com/solana-foundation/pay/blob/main/Justfile

## 3. CLI & Payment Protocol Engine

### 3.1 Command surface

The `pay` binary is the `crates/cli` crate; its `main.rs` parses
arguments with `clap` derive macros and pulls the long-form help text
from `pay_core::instructions::INSTRUCTIONS`, a markdown blob shared
with the help command [^s04]. The global flag set (excerpt) is:

- `--sandbox` / `-s` — force `network=localnet` and route to the
  hosted Surfpool RPC at `https://402.surfnet.dev:8899`, with
  ephemeral wallets auto-funded on first use [^s04].
- `--mainnet` — force the wallet bound to `mainnet` in
  `~/.config/pay/accounts.yml`, regardless of what the challenge
  advertises [^s04].
- `--local` — same as `--sandbox` but route to a localhost Surfpool.
- `--account <name>` — pick a specific named account.
- `--debugger` — start the embedded Payment Debugger proxy on port
  1402 and route every MCP `curl` through it [^s04].
- `--yolo-upto <AMOUNT>` — hidden flag that auto-satisfies `402`
  challenges up to a stablecoin cap [^s04].
- `--no-dna` — non-interactive, machine-readable output mode [^s04].

The subcommand tree, derived from `crates/cli/src/commands/`,
includes `setup`, `whoami`, `topup`, `account` (`new`, `list`,
`destroy`, `import`, `export`, `default`), `curl`, `wget`, `fetch`,
`http`, `send`, `claude`, `codex`, `mcp`, `server` (`start`, `demo`,
`scaffold`), `skills` (`search`, `install`, `list`, `remove`,
`update`, `endpoints`, `provider`), and `catalog` (`build`, `check`,
`probe`, `scaffold`, `verdict`) [^s04]. The `mcp` subcommand is
special-cased in `main.rs`: it builds its own multi-thread Tokio
runtime and immediately blocks on `pay_mcp::run_server`, exiting
without going through the rest of the CLI plumbing [^s04].

### 3.2 Sandbox bring-up

`crates/core/src/client/sandbox.rs` is what `--sandbox` actually does.
It generates a 64-byte ed25519 keypair with `OsRng`, writes it as a
JSON array to a `tempfile::NamedTempFile`, and then funds the freshly
minted account on the hosted Surfpool localnet using two cheatcode
RPC methods: `surfnet_setAccount` for 100 SOL and
`surfnet_setTokenAccount` for 1000 USDC, against the canonical USDC
mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` [^s05]. The temp
file is held in the returned `SandboxKeypair` struct so the Rust
runtime keeps it alive for the rest of the process. The hosted
Surfpool sandbox at `402.surfnet.dev` accepts these cheatcodes from
arbitrary fresh keypairs in this flow, which is what makes the
zero-config sandbox bring-up possible — the CLI never has to ask the
user for funds.

### 3.3 The two `402` protocols

The CLI does not implement either x402 or MPP itself. The workspace
manifest at `rust/Cargo.toml` pulls them as **git dependencies**
from sister Solana Foundation repos [^s03]:

```toml
solana-mpp = { git = "https://github.com/solana-foundation/mpp-sdk", branch = "main",
                default-features = false, features = ["client", "server"] }
solana-x402 = { git = "https://github.com/solana-foundation/x402-sdk", branch = "main",
                package = "solana-x402", default-features = false, features = ["client"] }
```

Inside the `pay-core` crate, `client/x402.rs` and `client/mpp.rs` are
deliberately small adapters. The x402 module re-exports
`PAYMENT_REQUIRED_HEADER`, `X402_V1_PAYMENT_REQUIRED_HEADER`, the v1
and v2 payment-header builders, and the SIWX (Sign-In With X)
extension types from `solana_x402::client::exact` and
`solana_x402::siwx`, with helpers to parse a challenge, build retry
headers, and choose between Solana mainnet, devnet, and testnet
[^s06]. The MPP module re-exports `solana_mpp::PaymentChallenge` and
re-implements `parse`, `parse_all`, `parse_headers`, and a
`build_credential` function that decodes the on-the-wire
`ChargeRequest`, formats a human-readable amount, builds the prompt
context, and returns `(authorization_header, Option<ResolvedEphemeral>)`
where the optional field signals "we just generated a fresh
ephemeral wallet for this network — render the user-facing
notice" [^s07]. Network selection inside MPP is documented in code
as a fixed waterfall: explicit `network_override` → challenge
`method_details.network` → `mainnet` [^s07].

The `client/runner.rs` module enumerates every outcome the wrapper
must handle as a `RunOutcome` enum: `MppChallenge` (with
alternatives), `SessionChallenge`, `X402Challenge`,
`X402SignInChallenge`, `UnknownPaymentRequired`, and a
`verification_failed` body branch that gets its own variant [^s07].

### 3.4 Sessions over Fiber channels

`client/session.rs` adds a third payment shape. Its module docstring
is the clearest description: "A session keeps a pre-funded on-chain
Fiber channel open across many API calls. Each call consumes a small
voucher increment instead of a full on-chain transaction, making
high-frequency AI workloads cheap." [^s08] The lifecycle is spelled
out: server returns 402 with `intent="session"`, client opens a
Fiber channel on-chain, calls `SessionHandle::new()`, sends an
`open_header()` on the first request, exchanges per-call voucher
headers, then `close_header()` triggers on-chain settlement [^s08].
`SessionHandle` is `Clone + Send + Sync`, intended to be reused
across in-flight requests to the same server [^s08].

### 3.5 What MPP stands for — a naming conflict

The repository disagrees with itself on what MPP means. The
top-level README expands it as **"Machine Payments Protocol"**
[^s01]. The Payment Debugger README (`pdb/README.md`) expands it as
**"Monetized Payment Protocol"** [^s19]. The actual IETF-style draft
linked from the README — `paymentauth.org/draft-solana-charge-00.html`
— uses neither name; it titles the spec **"Solana Charge Intent for
HTTP Payment Authentication"** and defines the headers
`WWW-Authenticate: Payment`, `Authorization: Payment`, and
`Payment-Receipt` [^s28]. The `-00` suffix is significant: this is
an Internet-Draft, not an adopted standard; it has not been through
any standards-body review and lists an expiration date six months
out [^s28]. The launch press picks "Machine Payments Protocol"
without commenting on the inconsistency [^s29]. We surface the
conflict rather than resolve it; the underlying on-chain semantics
are the same regardless of the acronym expansion.

## 4. Local Wallet Security & Keystore

The `pay-keystore` crate is the part most worth reading carefully. Its
crate doc opens by separating two concerns and explicitly naming the
threat model [^s09]:

> Separates two concerns:
> - **AuthGate** — how the user proves identity (Touch ID, Windows
>   Hello, polkit, none)
> - **SecretStore** — where encrypted bytes live (Keychain,
>   Credential Manager, 1Password, memory)

A `Keystore` struct composes one `Box<dyn AuthGate>` and one
`Box<dyn SecretStore>` plus an `auth_on_write` flag, with constructors
`Keystore::in_memory()`, `Keystore::onepassword(account)`, and
`Keystore::onepassword_with_vault(...)` covering common
combinations [^s09]. `SecretStore` is a small four-method trait —
`store`, `load`, `exists`, `delete` — backed by an `InMemoryStore`,
the platform stores in `linux/`, `macos/`, `windows/`, and
1Password-CLI-driven implementations [^s09].

The library is unusually candid about the limits of biometric
prompts. Quoting the security note verbatim [^s09]:

> The auth gate is an **advisory** layer — callers can construct a
> `Keystore` with `NoAuth` paired with any platform store. The real
> security boundary is the OS credential store itself (Keychain ACLs,
> DPAPI, Secret Service encryption). The auth gate provides UX-level
> protection (biometric prompts) but does not prevent programmatic
> access by code running in the same process.

That is consistent with how Touch ID actually works on macOS — the
prompt gates a single keychain operation, not the process — but it
is rare to see it stated so plainly in a payment tool's docstring.

### 4.1 macOS: a Swift helper compiled into the Rust binary

`crates/keystore/src/macos/mod.rs` is the most distinctive file in
the crate. It uses Rust's `include_str!` and `include_bytes!` to
embed both the **Swift source** of the helper (`helper.swift`) and a
**pre-compiled signed Swift binary** at `OUT_DIR/pay-helper` [^s10].
The build script at `crates/keystore/build.rs` runs `swiftc -O` over
`helper.swift` at compile time, then `codesign -s - -f --entitlements
<empty plist>` to apply an ad-hoc signature; if either step fails the
build script writes an empty marker so `include_bytes!` still
compiles, and the runtime falls back to compiling the helper on
first use [^s11].

At runtime the macOS backend writes the embedded helper to
`~/.cache/pay/pay.sh` (a deliberately attention-grabbing path) and
checks before each invocation that the cache file's bytes match
the trusted embedded copy and that the file has private metadata —
otherwise it is replaced atomically or rebuilt from
source [^s10]. Conceptually the helper is a tiny privileged surface
that owns Keychain access; the Rust process talks to it over stdin
with text commands like `authenticate`, `read`, `exists`,
`delete` [^s10].

### 4.2 Linux: polkit policy

On Linux the secret store is GNOME / Secret Service via the
`secret-service` crate [^s34], but unlocking it requires a polkit
dance. The repo ships a policy file at
`rust/config/polkit/sh.pay.unlock-keypair.policy` whose vendor is
"Solana Foundation" and whose action `sh.pay.authorize-payment`
declares `auth_self` for `allow_any`, `allow_inactive`, and
`allow_active`, meaning the user's own credentials (password or
fingerprint) are required, not admin/root [^s32]. The same file
also defines a graduated set of `sh.pay.authorize-payment-up-to-usd-*`
actions (covering `$0.0001`, `$0.001`, `$0.005`, `$0.01`, `$0.05`,
`$0.10`, `$0.50`, …) so that the per-call prompt copy can match the
spend tier without changing the underlying auth requirement [^s32].
The README's troubleshooting section explicitly asks Linux users to
copy that file into `/usr/share/polkit-1/actions/`; without it
`pay topup` and `pay curl` fail with "auth failed" [^s01].

### 4.3 Windows and 1Password

The Windows backend in `crates/keystore/src/windows/` depends on
the `windows` crate at version `0.58` with the
`Win32_Security_Credentials` and `Security_Credentials_UI`
features [^s34], i.e. Windows Hello
through the standard Credential Manager / Credentials UI APIs. A
1Password backend is exposed as `OnePasswordAuth` /
`OnePasswordStore`, which shells out to the `op` CLI and runs an
explicit `signout`/`signin` cycle on every authentication so the
biometric prompt comes from the 1Password app, not the OS [^s09].

## 5. AI Agent Integration & Server Tooling

### 5.1 The MCP server

`crates/mcp` wraps the `rmcp` crate to publish the `pay` capability
to LLM hosts. `pay-mcp/src/lib.rs` opens a stdio transport
(`rmcp::transport::stdio`), serves a single
`PayMcp` handler, and waits forever; tracing is configured to log
to stderr in JSON-friendly form so that hosts like Claude Code or
Codex can capture it [^s12]. `crates/mcp/src/server.rs` is a thin
dispatch layer: `#[tool_router]` and `#[tool(...)]` macros register
seven tools — `curl`, `search_catalog`, `list_catalog`,
`get_catalog_entry`, `get_balance`, `topup`, `create_skill` —
each with a verbose human-readable description meant to steer LLM
behaviour [^s13]. The `curl` description, for example, tells the
agent that the active Pay account "only needs supported stablecoins
such as USDC, USDT, PYUSD, CASH, or USDG; it does not need SOL for
network fees", because "server-side fee payers handle transaction
fees and setup costs" [^s13].

The actual `curl` implementation in
`crates/mcp/src/tools/curl.rs` is conventional Rust: a `Params`
struct with a `BodyParam` that accepts either a string or a JSON
value (auto-serialized with a default `Content-Type: application/
json`), a `prepare_headers` helper that injects `Accept` and
`Content-Type` only when the user hasn't supplied them, a blocking
`do_paid_fetch` that runs on `tokio::task::spawn_blocking`, and a
content-type-aware response router that base64-encodes images,
spills binary blobs to a tempfile, and decodes UTF-8 leniently for
text [^s14]. The MCP transport is JSON-RPC over stdio, which is why
binary bodies cannot just be inlined.

### 5.2 The skill manifest

`skills/pay/SKILL.md` is an Anthropic-style skill descriptor that
ships in the binary; it is what `pay claude` injects so the model
knows when to reach for Pay [^s23]. Its frontmatter spells out
TRIGGERS (`x402, MPP, HTTP 402, "pay for X"`, …) and a strong
instruction:

> Start with `search_catalog()` for actionable task and
> `list_catalog()` for feasibility questions; never answer "no" from
> memory. A microcents API call is cheaper and more reliable than
> spending many agent steps/tokens on ad-hoc web search and
> scraping. [^s23]

The body adds policy: "Use Pay for deliberate, user-directed API
calls, not autonomous browsing or speculative provider exploration"
and "Make the smallest useful request first" [^s23]. Read alongside
the MCP curl tool description, the manifest is essentially Solana's
attempt to encode an *agent etiquette* for paid HTTP — refusing to
let an LLM substitute its own opinions about whether Pay can do
something for the catalog of providers it actually has.

### 5.3 The merchant gateway

The same `pay` binary can run on the *server* side of a 402
exchange. `pay server start --debugger spec.yml` reads a YAML API
spec, attaches the payment middleware, and serves an axum app.
`crates/core/src/server/payment.rs` is where the 402 happens:
without a payment header it returns `WWW-Authenticate` MPP
challenges, with one it verifies via `solana-mpp` and forwards
upstream [^s15]. The middleware also handles HTML payment-link
flows behind a CSP that allows only inline scripts/styles, and
short-circuits a `__402/`-prefixed namespace for the debugger
endpoints [^s15].

`metering.rs` is the pricing engine. A `RequestProperties` struct
captures everything the server might charge by — `input_tokens`,
`input_characters`, `context_length`, `body_size`, `duration_seconds`,
`batch_size`, `image_pixels` — and the price of a request is a
`ResolvedPrice` with multiple `ResolvedDimension`s, each having a
`direction`, a `unit`, a `scale`, and a `price_usd` [^s16]. Endpoints
match by an exact-then-pattern lookup that handles `{param}`-style
path parameters, with a separate `find_endpoint_by_path` used for
browser payment links that send GET to a POST endpoint [^s16].

`accounting.rs` is the cumulative-usage layer. `AccountingKey`
combines an API name, an endpoint path pattern, a billing period
("2026-03"), and a scope that is either `pool` for pooled
accounting or a wallet pubkey for per-agent accounting [^s17]. The
trait is just three methods (`get_usage`, `increment`,
`reset_period`) backed by an `InMemoryStore`; cumulative counters
are kept in a `Mutex<HashMap>` and survive only the process
lifetime [^s17].

`proxy.rs` is the upstream forwarder. It strips hop-by-hop headers
and any payment headers (`authorization`, `payment-signature`,
`payment-required`), and resolves the upstream from
`ApiSpec.routing` [^s18]. The interesting surface is its outbound
auth menu: explicit imports include `AccessTokenFetchConfig`,
`AccessTokenInjectConfig`, and `AccessTokenResponseConfig` for OAuth-
style flows, plus a generic HMAC signing apparatus
(`HmacAlgorithm`, `HmacCanonicalConfig`, `HmacDigestAlgorithm`,
`HmacEncoding`, `HmacQueryStyle`, `HmacSignatureConfig`,
`HmacStringEncoding`, `HmacTargetType`, `HmacTimestampFormat`,
`HmacPrepareBinding`, `HmacPrepareValue`) [^s18]. That breadth
suggests the gateway is meant to front not just OpenAI-style bearer
APIs but signed AWS- or Alibaba-Cloud-style endpoints — consistent
with the catalog claims in the launch press [^s31].

### 5.4 The Payment Debugger UI

The `pdb/` directory is a Vite + React 19 SPA: `pdb/package.json`
declares `react@^19.1.0`, `@solana/kit@^6.5.0`, `@solana/mpp@^0.5.1`,
`mppx@^0.5.8`, `x402@^1.1.0`, and `x402-express@^1.1.0` as
dependencies, with an Express API in `api/index.ts` mounted via
`tsx` [^s20]. The `pdb/README.md` describes the architecture as a
backend with payment-gated demo endpoints, an embedded x402
facilitator, and a correlation engine that groups raw HTTP
requests into payment flows streamed over Server-Sent Events;
the front-end lists flows with a protocol badge and renders an
expanded sequence diagram and event log [^s19].

The **embedded mode** is the part that touches the Rust side:
"the frontend and backend are also compiled into the `pay` Rust
binary (`crates/pdb`). Run `pay --sandbox server start --debugger
spec.yml` to get the debugger alongside any gateway proxy" [^s19].
`crates/pdb`'s `Cargo.toml` describes the crate as "Embedded Payment
Debugger UI + backend for `pay server`" and depends on
`include_dir = "0.7.4"`, which is what makes the prebuilt Vite
assets shippable inside the binary [^s33]. Release builds also publish a
`pay-pdb-dist-<version>.tar.gz` artifact that packagers like Homebrew
can unpack and point to via `PAY_PDB_DIST=...` so `cargo build` does
not need pnpm at all [^s19]. A public-hosted version of the debugger
is also available at `https://debugger.pay.sh` [^s01].

### 5.5 The TypeScript `@solana/pay` package

The `@solana/pay` v1.0 package is the *other* thing in the repo, and
it deserves a short note. Its core README opens "`@solana/pay` is a
JavaScript library for facilitating commerce on Solana by using a
token transfer URL scheme" and explicitly flags "v1.0 — This version
is built on `@solana/kit` v6. If you're migrating from v0.2 (which
used `@solana/web3.js`), see the Migration Guide" [^s21]. The package
exposes `createMerchantClient` and a wallet client; its peer
dependencies pull `@solana/kit` v6, `@solana-program/system`,
`@solana-program/token`, `@solana-program/token-2022`, and
`@solana-program/memo`, and it ships TS test files for `encodeURL`,
`parseURL`, `createTransfer`, `validateTransfer`, `findReference`,
`watchReference`, and `fetchTransaction` [^s22]. This is the
descendant of the original 2021 Solana Pay spec at
`typescript/packages/solana-pay/spec/SPEC.md`, refreshed for the
modern Kit-based stack — and it is unrelated, technically, to the
402 / x402 / MPP work in the Rust crates. The two share a repo (and
the npm package name acts as the install vehicle for the binary on
every Tier-1 platform [^s22]) but the URI-scheme library is
Solana-Pay-the-original-thing, while `pay.sh` is Solana-Pay-the-CLI.

## 6. Limitations

A few sources of uncertainty in this report:

- **Out-of-repo runtime.** The hosted `https://402.surfnet.dev`
  RPC, `https://debugger.pay.sh`, and the `pay.sh` web property are
  visible only as URL constants in the repo. Their behaviour is
  inferred from comments and is not separately audited [^s05][^s01].
- **Unread protocol SDKs.** `solana-mpp` and `solana-x402` come from
  the sister `mpp-sdk` and `x402-sdk` repositories [^s03]. The
  protocol shape we describe is what the wrappers in `pay-core`
  expose, plus the IETF-style draft at paymentauth.org [^s28]; the
  SDK source itself was not read end-to-end here.
- **Naming conflict on "MPP".** The README, the PDB README, and the
  underlying draft each give the protocol a different long
  name [^s01][^s19][^s28]. We surface the disagreement; we do not
  claim which is canonical.
- **Solana Charge is a draft.** The `paymentauth.org` document is
  `draft-solana-charge-00`, an Internet-Draft authored by Solana
  Foundation employees with a six-month expiry [^s28]. It has not
  been through external standards-body review.
- **Velocity.** Eight `pay-vX.Y.Z` and `ts-pay-vX.Y.Z` releases were
  cut between 3 and 6 May 2026 [^s26]; the workspace version pinned
  at `0.16.0` [^s03] could move within days. All exact identifiers
  here reflect commit `e72cddda` (2026-05-07) [^s27].
- **Reading vs running.** No part of this report exercised the
  binary, exchanged real funds, or verified Touch ID / Windows Hello
  / GNOME Keyring prompts at runtime. Statements about user-facing
  behaviour are inferences from docstrings, not measurements.
- **Vendor-led ecosystem.** Provider counts ("75+ APIs",
  "50+ community providers") are vendor-stated and come from launch
  coverage [^s29][^s31]; the repo ships a small skill catalog and a
  pointer to `solana-foundation/pay-skills`, not a frozen list.
