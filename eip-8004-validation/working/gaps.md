# Gaps

All 18 claims meet the minimum sourcing threshold (factual ≥2 independent, interpretive ≥1, technical ≥1 primary).

Resolved during gather:
- Initial outline assumed agentValidatorId/agentServerId roles (older EIP-8004 draft). Spec text and ChaosChain Jan-2026 reference impl confirm the current signatures use `validatorAddress` + `agentId` (ERC-721 tokenId). Claims c05/c06 corrected.
- Initial claim c07 assumed an explicit expiration window. Spec and reference impl confirm there is none in the Jan 2026 update; instead `validationResponse` is callable multiple times. Claim c07 rewritten.
- Initial claim c08 stated responses are unreadable on-chain. The Jan 2026 update adds `getValidationStatus`, `getSummary`, `getAgentValidations`, `getValidatorRequests`. Claim rewritten to reflect partial fix.

No remaining must-fix gaps. Items that are still epistemically shaky are tracked in `uncertainties.md`.
