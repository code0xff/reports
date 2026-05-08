# Outline — pay.sh GitHub Code Analysis

Target: a code-level reading of `solana-foundation/pay`, the repository behind
the `pay.sh` CLI launched in May 2026 by the Solana Foundation and Google
Cloud. The audience is engineers who want to understand what is actually in
the repo (workspaces, crates, protocols, security boundaries) rather than the
marketing surface.

## 1. Abstract

What pay.sh is, what is in the GitHub repo, and the central claim of the
report: pay.sh is a multi-language workspace (Rust + TypeScript) that ships a
local CLI, an MCP server for AI agents, an axum-based merchant gateway, an
embedded payment debugger UI, and a refreshed Solana Pay TypeScript library —
unified around two HTTP 402 payment protocols (x402 and the Solana
Foundation's MPP / Solana Charge draft) backed by OS-level keystores.

## 2. Introduction

- One-paragraph definition of pay.sh and why the launch attracted attention
  (Solana × Google Cloud announcement, "stablecoin payments for AI agents").
- Why it lives in `solana-foundation/pay` even though that repo originally
  hosted the older Solana Pay URL-scheme library.
- Headline numbers from the public repo (stars, license, primary languages,
  release cadence in May 2026).
- Scope of this report: README → workspace layout → CLI internals →
  protocol layer → keystore → MCP/agent integration → server tooling →
  limitations.

## 3. Repository Topology & Build System

- Top-level layout: `rust/`, `typescript/`, `pdb/`, `skills/`, plus a Lua
  rockspec, a Justfile, `.github/`, and packaging metadata.
- Cargo workspace: `crates/cli`, `core`, `keystore`, `mcp`, `pdb`, `types`,
  `integration`.
- pnpm/TypeScript workspace: `@solana/pay` v1.x package + the `pdb`
  Vite/React SPA.
- Build orchestration via `just`: `install pay` builds the React PDB UI,
  embeds it into the Rust binary via `crates/pdb`, then `cargo
  cli-install`s the `pay` binary. CI hooks into `just lint`, `just test`,
  `just build`.
- Distribution: prebuilt binaries via Homebrew, npm (`@solana/pay` exposes
  the `pay` binary through a postinstall shim), and `winget`.

## 4. CLI & Payment Protocol Engine

- `crates/cli/src/main.rs`: clap-based command tree (`setup`, `whoami`,
  `account`, `curl`, `wget`, `fetch`, `http`, `send`, `topup`, `claude`,
  `codex`, `mcp`, `server`, `skills`, `catalog`).
- Network selection flags (`--sandbox`, `--mainnet`, `--local`, `--dev`,
  `--account`) and the hidden `--yolo-upto` cap; sandbox routes to
  `https://402.surfnet.dev:8899` and uses `surfnet_setAccount` /
  `surfnet_setTokenAccount` cheatcodes to fund a fresh ephemeral wallet
  with 100 SOL and 1000 USDC on first use.
- `pay_core::client`: per-protocol modules (`x402.rs`, `mpp.rs`,
  `session.rs`, `runner.rs`) that detect a 402, prepare the credential,
  and retry the request.
- Protocols supported in code:
  - **x402** via `solana-x402` crate — `X-PAYMENT` / `X-PAYMENT-RESPONSE`
    headers, SIWX (Sign-In With X) extension, mainnet/testnet/devnet.
  - **MPP** via `solana-mpp` crate — `WWW-Authenticate: Payment` and
    `Authorization: Payment` headers, sessions over Fiber channels for
    high-frequency vouchered calls.
- The `solana-mpp` and `solana-x402` deps are pulled directly from
  `solana-foundation/mpp-sdk` and `solana-foundation/x402-sdk` git
  branches — the protocol layer is centralised in those sister repos.

## 5. Local Wallet Security & Keystore

- `crates/keystore/src/lib.rs` separates two concerns: an `AuthGate`
  (Touch ID, Windows Hello, polkit, 1Password CLI, NoAuth) and a
  `SecretStore` (Apple Keychain, Windows Credential Manager,
  GNOME/Secret-Service, 1Password vault, in-memory).
- macOS implementation (`macos/mod.rs` + `helper.swift`): a Swift binary
  is compiled at `cargo build` time with `swiftc -O`, codesigned ad-hoc
  against an empty entitlements plist, embedded via `include_bytes!`,
  cached at `~/.cache/pay/pay.sh`, and re-verified before every
  invocation. If `swiftc` is missing at build time the binary falls back
  to compiling the helper at first run.
- The library notes explicitly that the auth gate is **advisory** —
  in-process code can still call the underlying store. The OS keychain
  ACL is the real security boundary.
- Linux installation requires copying a polkit policy
  (`rust/config/polkit/sh.pay.unlock-keypair.policy`).
- `AuthIntent::authorize_payment_details` constructs the prompt copy
  (amount, reason, operator) so the user sees a meaningful Touch ID
  prompt rather than a generic one.

## 6. AI Agent Integration & Server Tooling

- `crates/mcp/src/lib.rs` boots an MCP stdio server using the `rmcp`
  crate; tools are registered via `#[tool_router]` macros in
  `crates/mcp/src/server.rs`.
- Exposed MCP tools: `curl`, `search_catalog`, `list_catalog`,
  `get_catalog_entry`, `get_balance`, `topup`, `create_skill`.
- `skills/pay/SKILL.md` is the agent-facing manifest that ships in the
  CLI; it tells assistants to prefer Pay-owned tools over ad-hoc web
  scraping.
- `pay claude` / `pay codex` subcommands launch the host LLM CLI with
  the MCP server pre-injected.
- `crates/core/src/server` is an axum-based merchant gateway:
  `payment.rs` middleware, `metering.rs` for token/character/duration
  pricing, `accounting.rs` for cumulative usage counters, `proxy.rs`
  for upstream forwarding (with HMAC and OAuth helper modes).
- `pdb/` is a Vite + React 19 SPA that visualises 402 challenge-response
  flows as sequence diagrams; `crates/pdb` embeds the built assets via
  `include_dir` so the binary serves them at `127.0.0.1:1402`.
- The TypeScript `@solana/pay` v1.0 package (built with tsup, tested
  with Vitest) is the refreshed Solana Pay URI library on
  `@solana/kit` v6 — separate from the new payment-CLI engine but
  shipped from the same monorepo.

## 7. Limitations

- The repo only opens a window onto the runtime — RPC endpoints,
  facilitator services, and the live `pay.sh` web property are out of
  scope.
- `solana-mpp` / `solana-x402` are external git deps; their internal
  structure is referenced but not deeply audited here.
- The repo uses inconsistent expansions of the "MPP" acronym across
  README files; we record the conflict but cannot resolve it without
  Solana Foundation guidance.
- This is a snapshot at HEAD around 2026-05-07; the project is moving
  fast (multiple releases per week in May 2026) and details may shift.

## 8. References

Drawn from the cloned repository, the GitHub REST API, and reputable
news write-ups. Tier-1 sources are the repo files themselves; tier-3
news pieces are used only to anchor the launch context.
