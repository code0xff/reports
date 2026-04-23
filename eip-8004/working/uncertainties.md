# Uncertainties — ERC-8004

Things to flag as still-shaky even after publishing.

- **Adoption numbers are tracker-reported, not protocol-native.** The 45k+ agent count cited at s07 and s08 comes from 8004 Scan, an ecosystem explorer, not from the Ethereum Foundation or an on-chain oracle. Any number should be treated as an upper-bound snapshot — the standard has no built-in identity uniqueness guarantee, so registrations may include duplicates or Sybil-issued identities.
- **Validator economics are not specified by the ERC.** The registry only defines hooks; collateral, rewards, and slashing depend entirely on higher-layer protocols (EigenLayer AVSs, bespoke validation DAOs). Any analysis of "the security of ERC-8004" is really an analysis of "the security of whatever validation stack was composed on top of ERC-8004."
- **Reference-contract audit status is unclear.** The `erc-8004/erc-8004-contracts` repo is CC0 and published but we did not locate a public audit report in this sweep. Production builders should verify audit status before large-value deployment.
- **zkML and TEE integrations are promising but early.** JOLT-Atlas (s14) and similar stacks can prove small-model inference today; proving large LLMs remains latency- or cost-prohibitive. TEE attestations are working but inherit hardware-vendor trust.
- **Reputation aggregation is monopolisation-sensitive.** The Ethereum Magicians critique (s06) that a single aggregated score can entrench dominant agents applies particularly to high-value domains; indexers and marketplaces should surface multiple context-specific vectors rather than one score.
- **Privacy of off-chain registration/feedback files is application-specific.** ERC-8004 only pins hashes; how registration files are hosted (plain HTTPS, Filecoin, IPFS), and how feedback files handle PII, is each builder's responsibility.
