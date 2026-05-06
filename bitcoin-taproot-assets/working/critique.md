# Critique: bitcoin-taproot-assets

## 1. Unsupported Claims

| Location | Claim | Verdict |
|---|---|---|
| Background §, para 1 | "Pay-to-Script-Hash (P2SH, BIP 16) in 2012 enabled…" — no citation | nit |
| Background §, para 1 | "Satoshi Nakamoto disabled several opcodes early… to prevent denial-of-service vulnerabilities" — no citation | nit |
| BIP 340 §, para 3 | Tagged hashes formula described without citation | nit |
| BIP 341 §, last sentence | "P2TR addresses use Bech32m encoding (BIP 350) and begin with bc1p… totaling 62 characters" — no citation | nit |
| RGB §, para 1 | "a concept from Peter Todd" (single-use seals) — no citation | nit |
| RGB §, para 2 | "Taproot Assets is also architecturally tighter with the Lightning Network stack (LND), while RGB is designed to be more general-purpose" — interpretive, no citation | nit |
| Ordinals § | "BRC-20 tokens are an experimental standard… token state is stored entirely on-chain in witness data" — no citation | nit |

## 2. Citation Integrity

- All footnote refs in draft.md are within the range s01–s22. ✓
- s24 dangling reference: **FIXED** (removed in two locations). ✓
- s08 and s12 point to the same URL (atlas21.com/rgb-vs-taproot-assets-protocols-compared/) with different quotes. Acceptable — different quotes serving different claims. ✓
- URL liveness spot-check (3 sources):
  - bitcoincore.org/en/releases/0.21.1/ → 200 ✓
  - bitcoinops.org/en/topics/schnorr-signatures/ → 200 ✓
  - lightning.engineering/posts/2023-10-18-taproot-assets-v0.3/ → 200 ✓
- Quote accuracy: not independently verified for all 22 sources; quotes were extracted during fetch in the same session. Acceptable for this research cycle.

## 3. Reasoning Gaps

- **"represents the most significant protocol change since SegWit"** (Abstract): interpretive superlative presented without qualifier. Should add _(interpretive)_ or softened language. — nit
- **"USDT — the world's largest stablecoin by market cap"** (Tether §): USDT market cap rank was accurate in 2024 but research date is May 2026; should hedge with "as of 2025". — nit
- **Taproot Assets activation on Lightning Network** (§ Lightning Integration): The claim "first multi-asset Lightning protocol to become operational on Bitcoin's mainnet" comes solely from Lightning Labs. No independent source confirms or disputes this. Should be marked _(vendor-stated)_. — nit
- **Proof scalability**: "quasi-exponential growth problem" is already marked _(early signal)_ ✓

## 4. Missing Counter-Evidence

**Finding:** A technical review (Boosty Labs) identifies three substantive criticisms of Taproot Assets not currently represented in the draft:
1. **Setup complexity**: Users must run a Bitcoin full node + LND + tapd daemon — significantly more infrastructure than alternatives like BRC-20.
2. **Proof loss risk beyond Universe servers**: Local machine failure without backup leads to permanent asset loss.
3. **Limited DeFi expressiveness**: No fully expressive smart contract platform; limits DeFi use-cases compared to Ethereum L2s.

These criticisms are legitimate and should be represented in the Limitations section. The proof-loss point is partially covered (§ Client-Side Validation Trade-offs) but the setup complexity and DeFi expressiveness limitations are absent.

**Classification: must-fix** — the Limitations section must represent known counter-evidence, not only first-party acknowledged constraints.

## 5. Tone and Structure

- Abstract: Does not mention Tether USDT integration, which is a major concrete outcome. Should add one sentence. — nit
- "The most significant adoption signal came on January 30, 2025" — mild editorial judgment, acceptable if kept as presented (it is the only named partnership of that scale). ✓
- No emoji or marketing voice found. ✓
- No paragraph > 6 sentences that cannot be justified by content. ✓
- Limitations section honestly covers gaps.md items. ✓

## 6. Summary

| Category | must-fix | nit |
|---|---|---|
| Unsupported claims | 0 | 7 |
| Citation integrity | 0 (fixed) | 0 |
| Reasoning gaps | 0 | 3 |
| Missing counter-evidence | **1** | 0 |
| Tone/structure | 0 | 2 |
| **Total** | **1** | **12** |

## Action items

### Must-fix
- [x] Add setup-complexity and DeFi-limitation criticisms to Limitations § — DONE

### Nits (defer or fix in pass)
- Add [^s03] to tagged hashes paragraph
- Add [^s01] to P2TR address format sentence
- Soften "most significant protocol change since SegWit" → add _(interpretive)_
- Hedge USDT stablecoin rank: "as of 2024–2025"
- Mark Lightning Labs' "first multi-asset Lightning" claim as _(vendor-stated)_
- Add source for single-use seals Peter Todd attribution or remove attribution
- Add source or mark interpretive for RGB vs Taproot LND coupling claim
- Add source for BRC-20 on-chain storage claim
- Add one sentence about Tether USDT in Abstract
