# Outline — ERC-7579: Minimal Modular Smart Accounts

Topic: a detailed technical study of ERC-7579, the standard that defines minimal
interfaces for modular smart accounts and modules so that modules are portable
across account implementations. Covers motivation, the interface set, the module
taxonomy, the ecosystem, the ERC-6900 comparison, security, and limitations.

## 1. Abstract
- Scope and key findings. (Write last, after the body.)

## 2. Introduction — what ERC-7579 is and why it exists
- ERC-4337 account abstraction left account internals unstandardized → module lock-in.
- ERC-7579 goal: minimal interfaces for accounts + modules so modules are interoperable.
- Relationship to ERC-4337 (validation flow) and EIP-7702 (EOAs gaining code).

## 3. Background — account abstraction and the modularity problem
- ERC-4337 EntryPoint / UserOperation / validateUserOp recap.
- Why "minimal": standardize the interface, not the implementation.
- Prior/parallel art: ERC-6900 (modular account, plugins), Safe modules.

## 4. The standard — interfaces and module taxonomy
- 4.1 Module type IDs: validator(1), executor(2), fallback(3), hook(4) (+ later types).
- 4.2 Account interface: execute / executeFromExecutor, installModule / uninstallModule / isModuleInstalled, accountId, supportsExecutionMode / supportsModule.
- 4.3 Module interface: onInstall / onUninstall / isModuleType / IModule.
- 4.4 Execution modes: CALL/DELEGATECALL, single/batch, try/revert (packed ModeCode).
- 4.5 Validation flow with ERC-4337 (validator modules return validation data).

## 5. Ecosystem & implementations
- Reference implementation (erc7579/erc7579-implementation by Rhinestone et al.).
- Safe7579 adapter (Safe + Rhinestone), ZeroDev Kernel v3, Biconomy Nexus, others.
- Module ecosystem: SmartSessions, Rhinestone ModuleKit / Module Registry, ownable/webauthn validators.
- Tooling and the ERC-7579 "module" marketplace idea.

## 6. ERC-7579 vs ERC-6900 (and related ERCs)
- Design philosophy: minimal interface vs more prescriptive plugin manifest.
- Related ERCs in the stack: ERC-7484 (registry), ERC-7710/7715 (delegation/permissions), ERC-7702.
- Convergence/competition narrative; what the ecosystem actually adopted.

## 7. Security considerations & analysis
- Module trust: a malicious/ buggy module (esp. via DELEGATECALL executor/hook) can compromise the account.
- Registry/attestation (ERC-7484) as mitigation; install-time vetting.
- Audits and known caveats; hook ordering, uninstall edge cases.
- Independent/academic perspective on modular-account risk.

## 8. Limitations
- Fast-moving spec (Final vs Draft status, late-added module types), vendor-led ecosystem, snapshot date.

## 9. References — auto-generated from sources.jsonl
