# Claims — ai-agent-brief-2026-11-22

- c01: An independent measurement study of live x402 payments on Base
  mainnet (25,011 paid calls to 1,036 sellers between 2026-10-29 and
  2026-11-21) found a 6.3% buyer-facing failure rate (non-delivery after
  settlement, or overcharge against the seller's own listed price), close to
  the 6.6% rate the same team measured in a frozen October study — i.e. the
  failure rate is a stable floor, not a one-off measurement artifact.
- c02: The same study found a reproducible double-settlement path: sending
  one purchase intent twice (fresh signatures) produced two settlements at
  5 of 10 tested sellers, and retrying after a dropped connection — the
  behavior of an ordinary client, not an attacker — produced a second
  settlement at 5 of 10 sellers as well. x402 has no protocol-level
  idempotency key, so this is a gap in the spec, not a bug in one seller's
  implementation.
- c03: Google Cloud's Semantic Governance Policies (Preview) moves agent
  tool-call authorization from a fixed permission list to an LLM judge that
  evaluates each proposed call against plain-language rules and the user's
  stated intent, at a policy enforcement point (currently Agent Gateway) —
  i.e. the authorization decision is now itself a probabilistic model call,
  which Google's own docs flag by recommending dry-run mode before
  enforcement.
- c04: Google Cloud's Agent Anomaly Detection, previously scoped to agents
  running on Google Cloud, now ingests OpenTelemetry traces from agents
  running on other clouds or on-premises (Private Preview, ADK for Python
  2.12.0+ only) — narrowing, not closing, the blind spot where an agent's
  bad behavior is invisible to the platform that is supposed to catch it.
- c05: Apple is reportedly building its own in-house AI agent capable of
  operating apps, the browser, and code, while separately preparing macOS
  27.3 to require "very explicit user action" before a third-party AI agent
  gets full-system access — i.e. Apple is simultaneously building the thing
  it is restricting other companies' agents from doing unsupervised.
- c06 (why it matters): three unrelated actors — an independent researcher,
  a cloud platform vendor, and an OS vendor — each shipped trust/verification
  tooling or findings this week, and none of the three addresses what the
  other two found: Google's anomaly detection would not have caught x402's
  idempotency gap (it is a protocol-level flaw, not an anomalous agent
  action), and neither Google tool constrains what Apple's own in-house agent
  will be allowed to do on a user's Mac.
