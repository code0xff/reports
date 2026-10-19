## Abstract

A security researcher scanning for exposed control panels found a hacker running Cairn, an open-source "general-purpose problem-solving engine,"[^s03] against live production sites: three clusters, over 1,100 attack projects in the largest one, and an average per-task success rate of roughly 10%[^s01]. Reuters separately named the victims the researcher's own writeup would not: Deere, SharkNinja, and Cummins, each confirming a breach in some form[^s02]. Microsoft used the same week to tell its enterprise customers not to trust any model provider's safety assurances, including its own partners', and shipped Guardian Agents, a product built on that distrust[^s04]. And OpenCode, an open-source coding agent, disclosed that attackers had drained API keys from 1.4% of its Console users, running up charges exceeding $1,000 on some accounts before OpenAI, Anthropic, and Google could lock the leaked keys down[^s05]. Three stories, one layer: what happens when the thing deciding what an agent may touch is a password, a provider's own promise, or nothing at all.

## Introduction

This edition covers **2026-10-17 through 2026-10-20**. Background on the payment-rail side of this beat lives in the site's [agent commerce protocol comparison](../agent-commerce-protocol/) and [x402 protocol deep dive](../x402-protocol/). Nothing from any of the named payment protocols moved enough to count as news this window: x402 kept opening and closing minor documentation and extension PRs with no merge of substance[^s07], AP2's repository has had no commit since April 29[^s06], and Visa's Trusted Agent Protocol repo has shown no activity since October 2025. That leaves the same layer the last several editions have tracked — not settlement, but who an agent is and what it is allowed to reach — as this window's actual news.

## What moved

### A hacker ran an open-source agent-hacking tool against Deere, SharkNinja, and Cummins

NorForge's Snorre Fagerland started scanning for exposed Cairn panels after Gambit Security's September report that a criminal campaign had recovered an attacker's staging server stocked with AI attack harnesses[^s01]. He found more than 20. Three stood out as likely malicious: a 14-panel, Chinese-language cluster that alone logged over 1,100 attack projects against mostly US, Japanese, and Australian e-commerce and payment targets; a 10-panel English-language cluster aimed at merchant payment services and gray-market sites with an apparent African base; and a single low-confidence panel mixing small storefronts with large US platforms. Average cost per task, including failures, NorForge put at "around $5," with projects running over 1,000 intents potentially topping $100 — figures the post itself calls considerably uncertain. Successful intrusions in the biggest cluster took a little under 23 hours and surfaced hundreds of credentials, 11% of them verified live by Trufflehog.

NorForge's own post names no victim and withholds every panel address, saying only that it is working with Reuters on notification. Reuters filled that gap: Deere, SharkNinja, and Cummins were each hit[^s02] _(unverified — single source)_. Deere says it found no sign sensitive data was taken; SharkNinja says only a standalone product-support site was affected; Cummins says it is still investigating an attack on a third-party vendor's site. None of the three is a small operation, which is the point NorForge's sector-only language obscured — Cairn's author says the tool "was not designed for hacking attacks," and the campaign's existence depended entirely on panels an operator left reachable from Shodan.

### Microsoft stops asking enterprises to trust its AI partners

Microsoft's security chief, Hayete Gallot, wrote that "frontier models cannot be trusted regardless of origin" and shipped Guardian Agents, a monitoring layer built into the agent-detection and access-control push the company calls Project Perception[^s04]. CEO Satya Nadella had made the same case days earlier in his own post: enterprises should not accept a model provider's safety assurances as sufficient, because a provider's promises don't transfer its customers' responsibility for what an agent does on their behalf. Defender can now flag up to 60 agent types employees bring into the workplace, including Claude Code, Codex, and OpenClaw, and Microsoft is an inaugural backer of Nvidia's Open Agent Safety Platform, a hardware-level containment layer with over 100 member companies — OpenAI conspicuously not among them.

TechCrunch's own framing is the one worth keeping: Microsoft is both right and self-interested. Separating who builds a model from who watches it is the same logic that puts financial auditors outside the companies they audit, and it's also exactly the pitch for the security products Microsoft is selling instead of leaving enterprises to trust OpenAI or Anthropic directly.

### OpenCode's leaked API keys turned into real money

OpenCode, the open-source coding agent competing with Claude Code and Cursor, told users that attackers had broken into an older part of its Console platform and pulled API keys belonging to 1.4% of its users[^s05]. The company calls it "a large-scale distillation attack" _(vendor-stated)_ — stolen keys used to generate the high-volume model output that distillation requires, useful to anyone shut out of restricted US models. Outside observers aren't convinced the framing is earned; what's undisputed is that developers started seeing charges on their OpenAI, Anthropic, and Google accounts, some over $1,000, before the keys could be revoked.

Co-founder Dax Raad said attackers had been probing the system for 48 hours straight, and that commercial AI models helped investigate for a while before their own safety filters refused to keep analyzing the malicious code. OpenCode eventually got into OpenAI's Daybreak Blue program, meant for vetted users doing defensive security work with fewer refusals. That same refusal pattern is the one Hugging Face hit in July, when it wrote that its providers' guardrails "cannot distinguish an incident responder from an attacker" — a complaint made again, three months later, by a different company investigating a different breach.

## Why it matters

None of this touched a payment rail. Cairn is what an agent framework does once someone points it at infrastructure with no access control watching. OpenCode's breach needed nothing that sophisticated: a single leaked key was enough to spend real money with no human anywhere in the loop, inside a company's own product. Microsoft's bet is that enterprises will now pay someone other than the model provider to do that watching. x402 and AP2's signed mandates, receipt schemes, and authorization flows all assume the layer underneath them already works. This window, it failed in three unrelated places at once.

## Signals to watch

- A breach total for the Cairn campaign, or confirmation of which models the operator actually ran — NorForge's post gives neither.
- More named victims beyond Deere, SharkNinja, and Cummins.
- Whether OpenAI or Anthropic join Guardian Agents or the Nvidia Open Agent Safety Platform, closing the gap TechCrunch flagged.
- How attackers actually reached OpenCode's Console systems, and whether the distillation-attack framing survives outside scrutiny.
- Any commit at all from AP2 or Trusted Agent Protocol, both now well past five months of silence.

## Limitations

The Deere/SharkNinja/Cummins attribution rests on Reuters' reporting, read here through a Slashdot mirror of the wire copy and a secondary write-up, because this harness's web-fetch tooling could not reach reuters.com or theverge.com directly — no independent outlet's own reporting was available to cross-check the three names. NorForge's cost and success-rate figures are the firm's own estimates, flagged in its post as considerably uncertain, and should not be read as exact. The Chinese-language attribution for one cluster describes the language of the panel's instructions, not a confirmed nationality. OpenCode's "distillation attack" characterization is the company's own and is contested by outside commentary cited in reporting. Feeds, web search, and GitHub were all reachable this window; the papers lane was not run, since nothing scouted pointed to a new academic result on this beat.
