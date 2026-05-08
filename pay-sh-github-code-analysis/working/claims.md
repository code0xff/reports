# Claims — pay.sh GitHub Code Analysis

## Introduction
- [x] c01: pay.sh is the CLI front-end of a project jointly launched by the Solana Foundation and Google Cloud in May 2026, allowing AI agents and CLI tools to pay for HTTP 402-gated APIs in stablecoins.
  - kind: factual
  - needs: launch-day announcement coverage from at least two independent outlets plus the project README.
- [x] c02: The source code for the pay.sh CLI lives in the public repository `github.com/solana-foundation/pay` under an MIT licence.
  - kind: factual
  - needs: GitHub API metadata (license, default branch, full_name).
- [x] c03: As of 2026-05-07, the repository has on the order of 1.6k stars, 550 forks, and active multi-release-per-week activity.
  - kind: factual
  - needs: GitHub API stargazers_count, forks_count, releases endpoint.
- [x] c04: The repository was originally created in 2021 to host the older Solana Pay URL-scheme library, and the new pay.sh CLI was added on top of that history rather than in a fresh repo.
  - kind: interpretive
  - needs: GitHub API created_at + the `typescript/packages/solana-pay` directory containing the original `@solana/pay` v1 package.

## Repository Topology & Build System
- [x] c05: The repository is a polyglot workspace whose primary languages, by byte count reported by GitHub, are Rust (~1.96 MB) and TypeScript (~316 KB), with smaller amounts of CSS, JavaScript, Just, Swift, MDX, Lua, Dockerfile, and HTML.
  - kind: factual
  - needs: GitHub `/languages` API endpoint.
- [x] c06: The Rust portion is a Cargo workspace with seven member crates: `cli`, `core`, `integration`, `keystore`, `mcp`, `pdb`, `types`, defaulting to the `cli` crate.
  - kind: technical
  - needs: `rust/Cargo.toml` workspace declaration.
- [x] c07: The TypeScript portion is a pnpm workspace whose only published package is `@solana/pay` (currently v1.0.16) which exposes the `pay` CLI as an npm-installable binary via a postinstall artifact map.
  - kind: technical
  - needs: `typescript/package.json` + `typescript/packages/solana-pay/core/package.json`.
- [x] c08: Top-level orchestration is done with a `just` recipe that builds the React `pdb` UI first, sets `PAY_PDB_DIST`, then runs `cargo cli-install` so the binary embeds the debugger assets.
  - kind: technical
  - needs: top-level `Justfile` content.

## CLI & Payment Protocol Engine
- [x] c09: The `pay` CLI is a clap-derived binary defined in `crates/cli/src/main.rs` with global flags including `--sandbox`, `--mainnet`, `--local`, `--account`, `--debugger`, and a hidden `--yolo-upto` stablecoin cap.
  - kind: technical
  - needs: `crates/cli/src/main.rs`.
- [x] c10: When `--sandbox` is set, the CLI forces network=localnet, points RPC at `https://402.surfnet.dev:8899`, generates a fresh ed25519 keypair, and uses `surfnet_setAccount` and `surfnet_setTokenAccount` cheatcodes to fund it with 100 SOL and 1000 USDC.
  - kind: technical
  - needs: `crates/cli/src/main.rs` doc comment + `crates/core/src/client/sandbox.rs`.
- [x] c11: The CLI client logic supports two HTTP 402 payment protocols, x402 and MPP, by depending on the `solana-foundation/x402-sdk` and `solana-foundation/mpp-sdk` external git repositories.
  - kind: technical
  - needs: `rust/Cargo.toml` `[workspace.dependencies]` for `solana-x402` and `solana-mpp`.
- [x] c12: The MPP client also supports a "session" intent that opens a Solana Fiber-style payment channel and exchanges per-call vouchers instead of one transaction per request.
  - kind: technical
  - needs: `crates/core/src/client/session.rs`.
- [x] c13: The README expands MPP as "Machine Payments Protocol", but the embedded Payment Debugger README expands the same acronym as "Monetized Payment Protocol", and the underlying IETF-style draft at paymentauth.org titles the spec "Solana Charge Intent for HTTP Payment Authentication" — there is no single canonical name in the repo.
  - kind: factual
  - needs: README.md, pdb/README.md, paymentauth.org draft text. Conflict must be surfaced.

## Local Wallet Security & Keystore
- [x] c14: `pay-keystore` separates an `AuthGate` (biometric / password / NoAuth) from a `SecretStore` (Apple Keychain, Windows Credential Manager, Linux Secret Service, 1Password CLI, in-memory) and composes them via a `Keystore` struct.
  - kind: technical
  - needs: `crates/keystore/src/lib.rs`.
- [x] c15: The macOS backend ships a Swift helper (`helper.swift`) that is compiled with `swiftc -O` and ad-hoc codesigned against an empty entitlements plist at `cargo build` time, embedded in the Rust binary, and cached at `~/.cache/pay/pay.sh`, with the cache re-verified before every invocation.
  - kind: technical
  - needs: `crates/keystore/src/macos/mod.rs` + `helper.swift` + `crates/keystore/build.rs`.
- [x] c16: The keystore module documents that the auth-gate layer is "advisory" — code running in the same process can still hit the underlying store; the OS keychain ACL is described as the real security boundary.
  - kind: technical
  - needs: `crates/keystore/src/lib.rs` "Security note" docstring.
- [x] c17: On Linux, `pay` requires the operator to copy a polkit policy file (`rust/config/polkit/sh.pay.unlock-keypair.policy`) into `/usr/share/polkit-1/actions/` so GNOME-Keyring unlocks can prompt for the user's password or fingerprint.
  - kind: technical
  - needs: README troubleshooting section + the polkit file in the repo.

## AI Agent Integration & Server Tooling
- [x] c18: `crates/mcp` runs a stdio MCP server (built on the `rmcp` crate) that registers seven tools — `curl`, `search_catalog`, `list_catalog`, `get_catalog_entry`, `get_balance`, `topup`, `create_skill`.
  - kind: technical
  - needs: `crates/mcp/src/server.rs` + `crates/mcp/src/tools/*`.
- [x] c19: The CLI ships an Anthropic-style "skill" file at `skills/pay/SKILL.md` that instructs MCP-aware agents to call `search_catalog` for actionable tasks and `list_catalog` for capability questions, and explicitly warns them not to "answer no" from memory.
  - kind: technical
  - needs: `skills/pay/SKILL.md` content.
- [x] c20: `crates/core/src/server` implements an axum-based merchant gateway with payment middleware, metering by token/character/duration/body-size, in-memory cumulative accounting, and an upstream proxy that supports HMAC- and access-token-based outbound auth.
  - kind: technical
  - needs: `crates/core/src/server/{payment,metering,accounting,proxy}.rs`.
- [x] c21: The Payment Debugger UI in `pdb/` is a Vite + React 19 SPA that uses Server-Sent Events (`/__debugger/logs/stream`) to render 402 flows; the same code is built into the Rust binary via the `pay-pdb` crate using `include_dir`, so `pay server start --debugger` serves the SPA locally.
  - kind: technical
  - needs: `pdb/README.md` + `pdb/package.json` + `crates/pdb/Cargo.toml`.
- [x] c22: The `@solana/pay` v1.0 TypeScript package is a refreshed Solana Pay URI library built on `@solana/kit` v6, distinct from the pay.sh CLI engine but shipped from the same monorepo and re-using the npm name to gate `pay` binary distribution.
  - kind: technical
  - needs: `typescript/packages/solana-pay/core/README.md` + `package.json`.
