# Uncertainties — Five Attacks on x402 Agentic Payment Protocol

These are claims that may shift even after publication, or that rest on
vendor-stated or single-source evidence.

- The Attack I-A revert-grant probabilities (RGP₀ ≈ 5.18 %) are based on
  a controlled Hardhat reorg injector plus an analytic Bernoulli model;
  the authors themselves note that public-testnet reorgs cannot be
  injected and that the values should be treated as model-based
  estimates rather than live-network frequencies (§4.2, §6.2). _(treat
  as bounded sensitivity analysis, not a frequency estimate)_
- The Attack IV selection-rate numbers depend on (i) three specific
  LLMs at temperature 0.1 (MiniMax-M2.7, GPT-5.3, Sonnet 4.5), (ii) a
  particular catalog mediated by x402scout, and (iii) the authors' own
  retrieval implementation. They are likely to shift with different
  agent loops, retrievers, or registries. _(early signal, single-team
  evaluation)_
- The vulnerability counts in the SDK audit (Table 5) reflect the SDK
  versions audited in the paper. The Coinbase reference TypeScript stack
  and the third-party Python and Rust SDKs may have shipped fixes after
  HackerOne disclosure but before this report.  _(vendor-stated /
  point-in-time)_
- The ecosystem-size figures (13,000 servers in §1, 13,760 endpoints
  across 420 domains in §4.5) come from the paper's own crawl and
  registry snapshot. We have not independently re-crawled the discovery
  layer.  _(vendor-stated)_
- The mapping of attacks to mitigations (Table 6) is the authors'
  proposal; whether the suggested defenses (especially
  `Witness.facilitator` enforcement and pre-grant `pay_id ×
  resource_id` claiming) become deployed standard practice in x402 is
  still open. _(early signal)_
- The paper's responsible-disclosure tickets at HackerOne are private,
  so we cannot independently verify the technical scope or remediation
  status of the disclosed issues. _(access-limited, single source)_
