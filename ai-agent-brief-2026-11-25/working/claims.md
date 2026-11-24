# Claims

c01. Google's Nov 25 post moves Workspace agent access from REST-API tokens to
a mandatory MCP-server/CLI path, with the REST route contractually barred by
Feb 1, 2027 and usage-quota billing starting Apr 1, 2027 — a dated enforcement
timeline, not just a policy statement.

c02. Google Cloud's Agent Identity model (via Agent Registry) eliminates
shared or long-lived credentials for agents, replacing them with dedicated
OAuth client IDs that are rejected by Workspace MCP servers if presented by a
non-agent client.

c03. mppx 0.22.0 is the first release to let a single Solana payment route
accept both an x402 `exact` requirement and a native MPP `solana/charge`
challenge, settled through the same x402 facilitator acting as fee payer —
making x402 and MPP interoperable at the transport layer rather than
competing standards on separate routes.

c04. OpenAI's Agents SDK v0.26.0 (the stable 0.x line, distinct from the
v1.0.0-alpha line covered in the previous two briefs) tightens its Docker
sandbox by rejecting privileged containers and added capabilities, and bounds
TAR-path-validation and CPU-limit checks per component — a security hardening
step shipped without the alpha line's compatibility breaks.

c05. Shirudo, released open source by OpenAI and Cisco on Nov 23, uses Codex
to generate eBPF "shields" that block an exploited code path without
restarting the service, but ships with only one controlled demonstration
(Java4Shell against Elasticsearch) and no published performance or
false-positive data.

c06. Across today's items, every platform owner (Google, OpenAI/Cisco)
shipped a change inside infrastructure it controls end to end, while the one
cross-foundation governance question (x402's payout-address proof and
conformance-test adoption) remained unresolved for a fourth consecutive brief
cycle, with the Nov 25 TSC meeting not yet reflected in the tracked issues as
of this fetch.
