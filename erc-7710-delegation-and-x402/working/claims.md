# Claims — ERC-7710 Smart Contract Delegation and its Relationship with x402

Testable, falsifiable claims. Checked off when min sourcing (PROTOCOL §3) is met.

## Introduction
- [x] c01: ERC-7710 defines a standard way for smart contracts to delegate capabilities to other smart contracts or EOAs.
  - kind: technical
  - needs: ERC-7710 spec text
- [x] c02: ERC-7710 lets a user grant an agent/dapp scoped on-chain authority without transferring the user's keys or full account control.
  - kind: interpretive
  - needs: spec/docs framing delegation as scoped authority; MetaMask docs on AI-agent permissions

## Background
- [x] c03: ERC-7710 is designed to work with account-abstraction smart accounts (ERC-4337 / ERC-7579) and EIP-7702 EOAs.
  - kind: technical
  - needs: spec/docs linking 7710 to 4337/7579/7702
- [x] c04: ERC-7715 is a sibling standard that defines a JSON-RPC method (wallet_requestExecutionPermissions) for dapps to request permissions, and it pairs with ERC-7710 for redemption.
  - kind: technical
  - needs: ERC-7715 spec + a source pairing 7715 (request) with 7710 (redeem)
- [x] c05: The MetaMask Delegation Toolkit (DeleGator / Smart Accounts Kit) is the primary reference implementation lineage of ERC-7710.
  - kind: factual
  - needs: MetaMask docs/repo describing the toolkit as implementing ERC-7710

## ERC-7710 in detail
- [x] c06: ERC-7710 defines three roles — delegator (grants authority), delegate (receives it), and a DelegationManager contract that the delegator authorizes to execute the action.
  - kind: technical
  - needs: ERC-7710 spec text on DelegationManager + delegator/delegate
- [x] c07: A delegate redeems a delegation by calling redeemDelegations on the Delegation Manager, passing the action to execute and a proof of authority.
  - kind: technical
  - needs: ERC-7710 spec / MetaMask redeem-delegations docs
- [x] c08: ERC-7710 delegations can be scoped/restricted by caveats enforced by caveat enforcer contracts (e.g., spending limit, allowed target, token streaming).
  - kind: technical
  - needs: MetaMask delegation-scopes / caveat-enforcer docs (erc20Streaming, valueLte, etc.)
- [x] c09: ERC-7710 supports delegation chains (re-delegation), where a delegate can further delegate a subset of authority.
  - kind: technical
  - needs: spec/docs on redelegation / delegation chains

## x402 in detail
- [x] c10: x402 is an HTTP-native payment protocol built on the HTTP 402 status code, in which a server challenges a request and the client pays via a signed payment payload that a facilitator settles on-chain.
  - kind: technical
  - needs: x402 spec/docs on the 402 challenge → payment → settle flow
- [x] c11: x402 on EVM settles payments via signed authorizations using EIP-3009 (and/or Permit2), i.e., a per-payment signed authorization rather than a standing on-chain delegation.
  - kind: technical
  - needs: x402 docs naming EIP-3009/Permit2 + describing per-payment authorization
- [x] c12: x402's native authorization unit is a single payment authorization per request (with optional session/upto schemes), not a persistent capability grant.
  - kind: interpretive
  - needs: x402 scheme docs (exact/upto) showing per-request authorization model

## Relationship between ERC-7710 and x402
- [x] c13: ERC-7710 and x402 operate at different layers: ERC-7710 is a standing, scoped on-chain capability delegation, whereas x402 is a per-request HTTP payment settlement protocol.
  - kind: interpretive
  - needs: comparison grounded in both primary specs
- [x] c14: ERC-7710 and x402 are complementary rather than competing: the x402 exact-EVM scheme explicitly lists ERC-7710 ("Smart Account Option") as a third authorization method alongside EIP-3009 and Permit2.
  - kind: technical
  - needs: x402 exact-EVM spec listing ERC-7710 as a settlement option
- [x] c15: In the x402 ERC-7710 option, the buyer's smart account signs a delegation that the facilitator redeems (via redeemDelegations) during /settle, while the act of obtaining the delegation is explicitly outside x402's scope (e.g., via ERC-7715, wallet interaction, or session keys) — so the two compose as a standing scoped grant plus per-request redemption.
  - kind: technical
  - needs: x402 spec payload fields (delegationManager/permissionContext/delegator) + "obtaining a delegation is outside the scope of x402" + MetaMask x402-with-delegations guide
- [x] c16: Both ERC-7710 (via MetaMask Delegation Toolkit) and x402 are explicitly positioned for AI-agent use cases.
  - kind: factual
  - needs: MetaMask docs (agents via 7710) + x402 docs (agentic payments)
