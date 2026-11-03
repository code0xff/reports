# Outline — ai-agent-brief-2026-11-04

1. Abstract
2. Introduction — window covered (2026-11-01 through 2026-11-04) and the standing beat
3. What moved
   - mppx's Tempo charge settlement misread a broadcast-retry error as a hard rejection, so a mined payment became a fresh 402 — a production incident at Exa/Mercator, now fixed
   - mppx ships a cluster of security and correctness fixes to its session-payment feature in a 48-hour window
   - x402 closes out two SDK-drift items the bot flagged this week: cross-SDK malformed-payload error codes, and Python's facilitator-hook error isolation
   - x402's TypeScript SDK stops leaving auth-capture balances unsynced after a successful capture, which was breaking refunds
4. Why it matters — the through-line: both protocols are absorbing production feedback (real traffic, real failure modes) rather than just internal review, and the sessions/MPP side is a newer, less-reviewed surface than core x402
5. Signals to watch
6. Limitations — card network/PSP silence continues; no primary dated announcement in window
