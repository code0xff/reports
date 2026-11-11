## Abstract

United Airlines told third-party AI agents to stay out of its booking flow[^s01][^s02][^s03]. Google shipped the first stable release of A2UI, the protocol that lets an agent draw a user interface instead of describing one in text[^s04]. And mppx, the payment-and-identity stack this brief has followed for two weeks, closed a bug where a rejected credential could leak into shared state and let a later request skip its identity check[^s05]. None of the three talked to each other, but the pattern is the same: an agent now has to clear a specific gate to act, render, or pay, where a few months ago the gate often wasn't there.

## Introduction

This edition covers **2026-11-09 through 2026-11-12**. Background on the payment-rail landscape lives in the site's [agent commerce protocol comparison](../agent-commerce-protocol/); mppx's session design is covered in [Machine Payments Protocol: spec and payment flows](../mpp-spec-and-payment-flows/). The previous edition, 2026-11-11, covered mppx's identity-attestation buildout (email OTP, a generic attestation module, Link, Persona KYC), OpenAI's Business Agents inside ChatGPT, and Adobe's MCP server for Creative Cloud. Card networks, AP2, and UCP again produced nothing dated this window.

## What moved

### United Airlines locks third-party AI agents out of booking, check-in, and account changes

United announced on 2026-11-11 that it is restricting access on its own platforms, and indirectly through travel agencies and aggregators, to stop "unauthorized, third-party personal AI agents or assistants" from acting on a traveler's behalf[^s01]. The policy covers booking reservations, checking in for a flight, and changes that touch MileagePlus miles or account settings. United's stated reasons are concrete rather than categorical: handing an agent a password can expose sensitive account information, an agent acting without full context can produce an unintended purchase or account change, and check-in specifically runs into a federal requirement that a passenger verify the contents of checked luggage in person — something no agent can do for them[^s01]. Fares booked directly with United will still be visible through intermediaries like Kayak, Hopper, and Google Flights; what's closed is an agent completing the transaction itself[^s01]. The story carried on Hacker News' front page with 199 points and over 200 comments the same day[^s03].

What United did not do is name which agents it is restricting, or explain what makes a third-party agent "authorized" instead of blocked. That line — who gets let in — is exactly the question eBay, Amazon, and Target have each answered differently over the past year, and United's announcement does not say where it will land.

### Google ships A2UI 1.0

A2UI moved from release candidate to a stable 1.0 on 2026-11-11, adding bidirectional function calls, accessibility support, and new SDKs and renderers across TypeScript, Dart, Python, React, Angular, Lit, Flutter, and SwiftUI[^s04]. The protocol streams a sequence of JSON messages describing a UI from an agent to a client, over A2A, AG-UI, or MCP as the transport. Its security model is the detail worth keeping: a client maintains its own catalog of trusted UI components, and an agent can only ask to render something already in that catalog — it never sends executable code[^s04]. That constraint is why A2UI can claim to be safe to point at an untrusted agent at all.

Not every piece of the ecosystem is at 1.0 together. Jetpack Compose support stays at 0.9.1 with "1.0 coming soon," and Gemini's own integration runs on 0.9.1 today[^s04]. The spec is stable; the rollout across Google's own products is still catching up to it.

### mppx fixes an identity-check bypass in subscription dispatch

Pull request #1274, merged into mppx on 2026-11-11, fixes a bug the maintainers describe plainly: a rejected subscription credential could change shared dispatch state, and a later request could then select an overlapping payment offer without going through that offer's identity policy[^s05]. The fix keeps each request's resolved dispatch data local instead of shared, and now rejects a composition where a checked offer and an unchecked offer could overlap, failing it at construction instead of at request time. It's a one-line description of a real problem: identity checks that get skipped are identity checks that don't exist, and this is the same mppx stack that spent the last two weeks building out attestations, Link verification, and Persona KYC specifically so that a paid request would carry proof of who is asking.

## Why it matters

Three systems, no coordination, drew a boundary around what an agent is allowed to be or do this window. United decides at the front door: act on a traveler's behalf, or don't. A2UI decides at the rendering layer, handing an agent a fixed catalog of components instead of a blank canvas. mppx decides inside its own request pipeline, where a skipped identity check is now a bug instead of a silent gap. None of this is a protocol launch in the x402/AP2/UCP sense. It's three existing systems treating an agent as a routine kind of requester that now has to clear a specific gate, not an edge case nobody designed for.

## Signals to watch

- Does United publish, or get asked for, criteria for what makes a third-party agent "authorized"? Compare against eBay's approved-partner list and Amazon's blanket-block-plus-lawsuit approach.
- A2UI's own ecosystem catching up to 1.0: Jetpack Compose's stable release, and whether Gemini moves off 0.9.1.
- Whether PR #1274's bug had ever been exploited in a live mppx deployment, or was caught before reaching production — unaddressed in the PR itself.
- Card networks and PSPs stayed silent on dated announcements for a second straight window; Mastercard's "rest of U.S. issuers in November" Agent Pay rollout, mentioned on an October earnings call, would be the next thing to check for a dated confirmation.

## Limitations

United's own newsroom announcement timed out on every fetch attempt this run. The policy language in this brief comes from CBS News' quoted excerpts, not a direct read of United's page, and no second newsroom-grade outlet was checked against it. An Ars Technica story about a Grok Build coding-agent data leak surfaced in the feeds lane dated 2026-11-10, but the site refused every fetch attempt, and other reporting on the same headline strongly suggests it is follow-up coverage of a July 2026 incident, not new news; it is left out to avoid misdating it. A Google blog post on an ADK/LangChain CLI extension system turned out, on inspection, to be dated 2026-10-21 — outside this window — and is excluded for the same reason. AP2 and UCP's repositories again produced no behavior-changing activity, and a canonical GitHub repository for UCP could not be resolved through this harness's GitHub search.
