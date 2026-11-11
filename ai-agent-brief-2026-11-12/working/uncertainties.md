# Uncertainties

- United's policy language, as quoted by CBS News, targets "unauthorized, third-party" agents — it does not specify how United defines "authorized" or what verification an agent/aggregator must pass to be let in. Whether this is a blanket ban or a permission gate (similar to eBay's or Target's approved-partner lists) is not resolved by the sources this harness could read.
- A2UI's "1.0 stable" claim applies unevenly across its own renderer ecosystem: Jetpack Compose is still at 0.9.1 and Gemini itself supports 0.9.1 today per the announcement post, so "1.0 shipped" is true of the spec and some SDKs but not yet of every first-party integration.
- mppx PR #1274 is a single-source (GitHub PR body) claim with no independent security write-up; it is the maintainers' own description of the bug and fix, not a verified third-party audit. _(vendor-stated)_
- Whether PR #1274's bug was ever exploited in a deployed mppx integration, or was caught in review/testing before reaching production use, is not stated in the PR.
