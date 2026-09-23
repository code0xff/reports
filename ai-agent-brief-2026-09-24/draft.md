## Abstract

Google's Antigravity SDK can now run an agent loop entirely against a local model, ChatGPT's mobile app gained voice-driven agent tasks, and Rabbit relaunched its agent as software that runs without the R1 device. Nothing on the payments or identity side of the beat cleared the bar today, so this is a short brief about where agents run and whose keys they use.

## Introduction

This edition of the `ai-agent-brief` series covers **2026-09-21 through 2026-09-24** (72 hours). The standing beat is agent frameworks and developer tooling, agent payment rails and protocols, the card networks' and PSPs' agent products, agent identity, and the standards bodies behind them. The [previous brief](../ai-agent-brief-2026-09-23/) dealt with Meta's Muse being blocked by Amazon and the x402 path-matching fix; none of that moved again. Three new items survived the fourteen-day URL dedupe and event grouping.

## What moved

### Antigravity SDK gets local models

On 2026-09-23 Google added local model support to the Antigravity SDK, its toolkit for building coding agents[^s01]. The first optimized target is Gemma 4 26B A4B running through LiteRT, and the SDK also accepts any OpenAI-compatible server, which covers Ollama, LM Studio and vLLM. Google's demo had 97.2% of tokens (3,322 of them) generated locally, and the pitch is agent workflows with "no API costs or rate limits" and code that never leaves the machine[^s01]. The hardware bar is more than 24GB of VRAM or unified memory, which rules out most laptops. Hybrid setups that mix a local model with a cloud one are supported _(vendor-stated)_.

This is the item with the most practical consequence for a developer. An agent that runs offline has no metered API to attach a payment protocol to, so it sits outside the pay-per-call world that x402 and MPP assume.

### ChatGPT mobile gets the Work tab and voice tasks

OpenAI brought agentic features to the ChatGPT mobile app on 2026-09-23[^s02]. Plus and Pro subscribers get a Work tab where voice commands can draft documents and emails, summarize Slack messages, build websites and presentations, and use a cloud browser. Tasks can start on the phone and resume on desktop, and free and Go users get plugins and connected apps _(unverified — single source)_. TechCrunch ties it to the July GPT-Live launch.

### Rabbit ships OS3 as software

Rabbit made OS3 generally available on 2026-09-22 for Windows, Mac and Linux, reachable through a browser, Telegram, iMessage/RCS/SMS or the R1[^s03]. One account links up to five devices, the agent keeps a running memory of instructions and can work in the background, and users bring their own API keys or local models, so Rabbit is not charging a subscription for the agent itself _(unverified — single source)_. The coverage flags the familiar risk for any agent that drives desktop software: permissions, logins, and pages that change layout under it[^s03]. The announcement gives few details on how OS3 is permissioned, and that matters more here than for a chat app, because OS3 can touch local files.

## Why it matters

Two of the three launches leave the choice of model in the user's hands, and all three run agents somewhere the vendor does not meter each call. That is a different picture from the site's earlier reports on agent commerce, which assume an agent calls a paid endpoint on someone else's server. If local and bring-your-own-key agents become common, more agent activity happens with no merchant, no card network and no facilitator in the loop, and the identity question shifts to what the agent is allowed to do on the machine it runs on.

## Signals to watch

- Independent testing of Antigravity's local mode on real repositories, since the only figure so far is Google's own demo.
- How OS3 handles permissions before it ships anything to non-enthusiasts.
- Whether a payments or identity announcement returns tomorrow; today's silence there is one data point, not a trend.

## Limitations

No payments-protocol, card-network or agent-identity news cleared the window, and the Bluesky and Reddit lanes were unavailable (see `working/gaps.md`). Two of the three items rest on a single article. Cloudflare's Worker Previews launch (2026-09-22) was left out because its connection to agents rests on a customer quote.
