# Gaps

- Internal cryptographic details (key rotation cadence, JWKS caching policy, exact alg negotiation rules) are referenced in Visa's spec page but not fully re-quoted here. Treated as vendor-stated where used.
- The exact comparison with Mastercard's Agent Pay / equivalent products is out of scope for this report; mentioned only at the protocol-shape level.
- AWS-reference confirmation tool names (`request_purchase_confirmation`, `confirm_purchase`) come from the AWS blog; we do not have an independent re-verification of those exact tool names from Visa's own docs.
