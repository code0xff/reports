# Uncertainties

- Agent Profiles' launch timing is vendor-stated as "within about a month" of the Oct. 21 announcement, with no firm date; treat any specific November date circulating in secondary coverage as speculation until Walmart confirms it.
- Walmart's own announcement text uses "model text protocol" where it clearly means Model Context Protocol — likely an editing error in Walmart's post rather than a different standard, but there is no independent confirmation of which protocol version or transport the Agent Gateway actually speaks.
- Whether Walmart's approval/spending-limit controls are enforced server-side (so an agent cannot bypass them) or are a policy Walmart trusts agents to honor is not stated in either Walmart's post or TechCrunch's coverage.
- Cloudflare's ~100,000-storefront figure for WebMCP is Cloudflare's own count of Commerce.com-platform sites with the edge script active by default, not a count of storefronts actually receiving agent traffic through it yet.
- Google's Extension System is explicitly marked experimental; the YAML schema and CLI surface it exposes may change before a stable release, so code written against it today may not carry forward.
