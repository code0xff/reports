# Claims

c01. Brave's Search API now serves the LLM Context endpoint behind the x402 protocol, accepting a per-request USDC payment on Base in place of an API key, with web/news/image/video/local endpoints announced as following at the same rate.

c02. Brave's x402 rollout is launch-stated but partial: only Base and USDC are live, other chains and stablecoins are described as "incoming soon," and gas on Base is subsidized only "for a limited time" — so the economics of the launch price are not the steady-state economics. _(vendor-stated)_

c03. Google Cloud's Organization Policy MCP server reaching general availability moves agent-governance tooling from a human-driven console/API workflow to one autonomous agents and pipelines can call directly (list constraints, read effective policy, create constraints) — a change in who the caller is, not what the policy engine does.

c04. Google's natural-language custom constraints (via Gemini) are advertised against agent-specific examples — requiring agent-identity on Agent Runtime, requiring an approved Agent Gateway — but the feature governs how agents are deployed and configured, not what a running agent is permitted to do at the moment it acts; runtime, per-call authorization is not what this ships.

c05. mppx's PR #1275 unifies how every currency-accepting surface in the library (Tempo client, Tempo server, x402 assets, EVM server methods) resolves a currency, so a viem `Token`/`ResolvedToken` and a raw address are now interchangeable inputs with decimals read from the token rather than assumed — removing a class of silent decimal-scale bugs when a client passes a token from another chain.

c06. This is mppx's third consecutive window of shipped changes this brief has tracked (identity attestations on 11-08–11-10, an identity-check bypass fix on 11-11, currency unification on 11-12) — the pattern across all three is incremental hardening of an existing payment stack, not a new protocol capability.
