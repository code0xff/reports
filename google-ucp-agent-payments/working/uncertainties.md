# Uncertainties

- UCP-powered checkout is initially US-only and gated on Merchant Center eligibility plus a `native_commerce: true` attribute; international rollout cadence is vendor-stated.
- The "merchant intersects agent + merchant capability profiles at request time" mechanism is described by Shopify Engineering but not yet re-verified against a wire-level example in the spec.
- The codelab's mandate cryptography (SHA-256 mock vs SD-JWT-VC in production) makes the security claims dependent on the SD-JWT-VC profile that the AP2 spec eventually mandates.
- Whether UCP, OpenAI ACP, and Visa TAP will converge or fragment over the next 12 months is genuinely open; current vendor positioning describes them as complementary.
