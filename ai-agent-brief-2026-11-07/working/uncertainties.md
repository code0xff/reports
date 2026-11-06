# Uncertainties

- AIB's "hundreds of agents, dozens of MCP servers" production-scale claim and the "v0.1" version label come only from the submitter's own Show HN text; Zalando's README confirms production use in general terms ("several of their MCP servers") but does not repeat the specific counts. Treat the counts as vendor-stated.
- The HackerNoon author (Alejandro Saucedo) is a Zalando employee writing about his own company's tooling, so his piece corroborates Zalando's own claims rather than independently verifying them. The HN post carries the same limitation — the submitter works on the project.
- Whether AIB sees adoption outside Zalando is unknown this early; a 19-point, 3-comment Show HN thread with no maintainer follow-up is a weak early signal either way.
- mppx's settlement-recovery primitives (PR #1199) and storage backends (#1182, #1187) are mppx's own description of its own code; no third party has yet used them in production as far as this sweep found, so "expose primitives integrators can use" is a capability claim, not yet a usage claim.
