# Critique — hermes-hub-agentic-discovery

Adversarial verification pass, 2026-06-29.

## 1. Unsupported claims
- All factual sentences carry `[^s..]`; interpretive lines marked `_(interpretive)_`; self-reported items `_(vendor-stated/defined)_`; single-source factual marked `_(unverified — single source)_` (the client-side keypair claim, c09).
- No uncited factual assertions on re-read.

## 2. Citation integrity
- 14 refs (s01–s14) used in both drafts; all exist. (s15–s16 added this pass → 16.)
- All `accessed` = 2026-06-29. ✔
- No manual References heading / footnote-def blocks. ✔
- Source diversity: independent corroboration for the ARD layer (Google blog s06, HF s07, SEJ s08, Synscribe s09) and x402 (Coinbase s13, The Block s14). Hermes-Hub-specific facts are project-primary (s01–s04) — disclosed as a limitation. ✔
- Spot-check: s05 (ARD authors/version), s06 ("sits entirely before invocation"), s03 (work-board/HCT) verified verbatim. ✔

## 3. Reasoning gaps
- Capability/repo numbers attributed to source and dated. ✔
- No "everyone/no one" absolutes. ✔
- The maturity judgment is framed interpretive, not asserted as fact. ✔

## 4. Missing counter-evidence — **MUST-FIX (resolved)**
- The draft framed the Nous Research association as "no direct link; likely name overlap / SEO." A counter-evidence sweep showed this is too dismissive: the same author publishes companion repos (`amanning3390/hermes-ard-capabilities` — "Drop-in skill + CLI ... to publish ARD-compliant ai-catalog.json and interact with HermesHub") and a `hermes-workspace` skill that explicitly targets Nous's Hermes Agent (referencing the `outsourc-e/hermes-agent` community fork). So Hermes Hub is a **community project designed to interoperate with** Nous's Hermes Agent via open standards (agentskills.io, ARD) — but **not** an official/endorsed Nous product, and the product itself is reframed as a general ARD work board.
- **Action:** added s15 (hermes-ard-capabilities) and s16 (lobehub hermes-workspace) and rewrote the identity section, c15, abstract, and intro caution to the accurate "community-compatible, not official" framing. Resolved.

## 5. Tone and structure
- Abstract faithful to revised body. ✔
- Limitations mirror gaps.md / uncertainties.md (self-sourcing, identity, version mismatch, MPP, drift). ✔
- No emoji / marketing voice. ✔
- Long paragraphs split. ✔

## 6. Must-fix vs nit
- **Must-fix: 1** (overstated dismissal of Nous relationship) → resolved.
- **Nits: 0** open.
- No open must-fix items. Cleared for publish.
