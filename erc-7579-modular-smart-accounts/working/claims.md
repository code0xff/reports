# Claims — ERC-7579: Minimal Modular Smart Accounts

Testable, falsifiable claims. Checked off when min sourcing (PROTOCOL §3) is met.

## Introduction
- [x] c01: ERC-7579 defines minimal interfaces that smart accounts and modules must implement so that modules are interoperable/portable across different account implementations.
  - kind: technical
  - needs: ERC-7579 spec text stating the minimal-interoperability goal
- [x] c02: ERC-7579 is designed to complement ERC-4337 (and is compatible with EIP-7702 EOAs), not replace account abstraction.
  - kind: technical
  - needs: spec text / docs linking 7579 to 4337 validation flow and 7702
- [x] c03: ERC-7579 deliberately standardizes only the interface, not the account implementation, to avoid vendor lock-in of modules.
  - kind: interpretive
  - needs: spec rationale + ≥1 implementer statement on minimalism vs lock-in

## Background
- [x] c04: ERC-4337 introduced account abstraction via an EntryPoint contract and UserOperation objects validated by the account's validateUserOp, without consensus changes.
  - kind: technical
  - needs: ERC-4337 spec text
- [x] c05: Before a standard like ERC-7579, modules (e.g., session-key or recovery logic) written for one smart-account implementation were not portable to another.
  - kind: interpretive
  - needs: ≥1 source describing module lock-in / fragmentation motivating the standard

## The standard — interfaces and module taxonomy
- [x] c06: ERC-7579 defines four core module type IDs: validator (type 1), executor (type 2), fallback handler (type 3), and hook (type 4).
  - kind: technical
  - needs: ERC-7579 spec enumerating module type IDs
- [x] c07: The account interface includes installModule / uninstallModule / isModuleInstalled and execute / executeFromExecutor functions, plus accountId() and capability-detection (supportsExecutionMode / supportsModule).
  - kind: technical
  - needs: ERC-7579 spec interface (IERC7579Account)
- [x] c08: Modules must implement onInstall, onUninstall, and isModuleType so the account can manage their lifecycle.
  - kind: technical
  - needs: ERC-7579 spec module interface (IModule)
- [x] c09: ERC-7579 encodes execution behavior in a packed ModeCode supporting single vs batch calls, CALL vs DELEGATECALL, and a revert-vs-try (continue-on-failure) execution type.
  - kind: technical
  - needs: ERC-7579 spec execution-mode encoding
- [x] c10: Validator modules participate in the ERC-4337 flow by validating UserOperations and returning ERC-4337 validation data.
  - kind: technical
  - needs: spec text on validator modules and validateUserOp

## Ecosystem & implementations
- [x] c11: A reference implementation of ERC-7579 exists and was developed by Rhinestone (with co-authors), separate from the prose spec.
  - kind: technical
  - needs: erc7579/erc7579-implementation repo (or rhinestone) primary
- [x] c12: Multiple independent production smart-account implementations support ERC-7579, including Safe (via the Safe7579 adapter), ZeroDev Kernel (v3), and Biconomy Nexus.
  - kind: factual
  - needs: ≥2 primary docs/repos confirming 7579 support across distinct vendors
- [x] c13: An ERC-7579 module ecosystem exists (e.g., SmartSessions session-key module, Rhinestone ModuleKit / Module Registry) enabling reusable modules.
  - kind: technical
  - needs: primary repos/docs for at least the registry/ModuleKit and one module

## ERC-7579 vs ERC-6900
- [x] c14: ERC-6900 is a competing/parallel modular-account standard that is more prescriptive (plugin manifest) than ERC-7579's minimal-interface approach.
  - kind: interpretive
  - needs: ERC-6900 spec + a comparison source contrasting the two philosophies
- [x] c15: ERC-7579 is part of a stack of related ERCs, including ERC-7484 (module/attestation registry) and the ERC-7710/7715 delegation-permissions family.
  - kind: technical
  - needs: ERC-7484 and ERC-7710/7715 primary references + linkage to 7579

## Security considerations & analysis
- [x] c16: Installed modules are highly privileged; a malicious or buggy module (particularly an executor/hook using DELEGATECALL) can compromise the entire account.
  - kind: technical
  - needs: spec security-considerations text and/or audit/research source on module risk
- [x] c17: ERC-7484 (a module registry / attestation standard) is proposed as a mitigation so accounts can check module attestations before/at install time.
  - kind: technical
  - needs: ERC-7484 spec text on registry/attestation purpose
- [x] c18: ERC-7579 implementations (e.g., Safe7579, Kernel, the reference implementation) have undergone third-party security audits.
  - kind: factual
  - needs: ≥1 published audit report or audit reference for a 7579 implementation
