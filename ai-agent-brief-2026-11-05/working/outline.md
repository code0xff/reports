# Outline

## Abstract
One-paragraph summary of the five items: Uber/DoorDash's own Q3 agent-order
numbers, Cloudflare's new agent visibility/control surface, x402's fail-open
gate-hook security fix, an x402 XRPL spend-cap bug, and three more mppx
session-payment fixes.

## Introduction
Window covered (2026-11-02 through 2026-11-05) and the standing beat. Link
back to the previous edition (2026-11-04) and to relevant long-form reports.

## What moved
1. Uber and DoorDash's own numbers show AI-agent order volume is still
   negligible, straight from Q3 earnings.
2. Cloudflare ships per-agent visibility and control for "personal agents"
   acting on a user's behalf.
3. x402's resource-server gate hooks move from fail-open to fail-closed.
4. x402 fixes an XRPL spend-cap bypass for whole-dollar prices.
5. mppx ships three more session-payment fixes, including an origin/policy
   boundary bug.

## Why it matters
The through-line: this window's items split into "how little agents are
actually transacting today" (item 1) versus "how much infrastructure is being
built for when they do" (items 2-5) — and two of the infrastructure fixes
(3, 5) are the second and third fail-open/boundary bugs disclosed on these
two codebases in the trailing week, not the first.

## Signals to watch
- Whether Uber's or DoorDash's agent-order volume moves in the next quarter's
  disclosures, or stays flat.
- Whether x402's #3689 class of fail-open gate bugs recurs elsewhere in the
  hook chain (advisory phases still fail open by design).
- Whether Cloudflare's per-agent policy granularity becomes something other
  bot-management vendors match.

## Limitations
Card-network/PSP primary announcements, AP2, and UCP: check for activity
before finalizing.
