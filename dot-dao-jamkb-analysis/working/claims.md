# Claims — DOT DAO and the Need for $JAMKB

## Background — footprint as an inelastic resource

- [ ] c01: JAM distinguishes two storage tiers — a Data Lake for
  availability data and a *footprint* of state that every validator must
  hold in RAM at all times.
  - kind: technical
  - needs: JAM Gray Paper text or official JAM docs defining state /
    footprint vs. availability; Wood's article as the term's introduction.

- [ ] c02: The JAM specification already ties a service's permitted
  storage to a token balance threshold, so the mechanism $JAMKB would
  denominate pre-dates the $JAMKB naming proposal.
  - kind: technical
  - needs: Gray Paper service-account definition showing a
    balance/threshold function over storage items and octets.

- [ ] c03: JAM's reference validator hardware fixes a RAM budget, which is
  what makes footprint capacity inelastic rather than market-elastic.
  - kind: technical
  - needs: published JAM reference hardware spec (RAM figure).

- [ ] c04: The "~20 GB total footprint / ~21 million tokens" figure is
  Wood's estimate in this article, not a constant fixed in the JAM
  specification.
  - kind: factual
  - needs: the article text plus absence of the figure in the Gray Paper
    or a statement that it is indicative.

## The proposal, anatomized

- [ ] c05: Wood's case is a premise chain: footprint is inelastic → the
  access token's supply must be inelastic → any non-state use of that
  token subtracts from usable capacity → DOT has unavoidable non-state
  uses → therefore DOT is disqualified and a dedicated token is needed.
  - kind: interpretive
  - needs: close reading of the article; consistency with his follow-up post.

- [ ] c06: The proposal's stated parameters are: fixed supply of roughly
  21 million, 1 token = 1 KB of footprint held perpetually while occupied,
  100 % DOT DAO ownership at genesis, and a rate that is dynamic (upward
  as RAM cheapens) without requiring a hard fork.
  - kind: factual
  - needs: article text; corroboration from a second write-up.

- [ ] c07: Wood explicitly considers and rejects a variable
  token-to-byte pricing curve, on four grounds: preset curves are
  inevitably suboptimal, incentive-compatible eviction is hard,
  book-keeping burdens the base layer, and parallelisation across
  concurrently mutating services becomes hard or impossible.
  - kind: factual
  - needs: article text.

- [ ] c08: The post is explicitly personal opinion and no Polkadot
  OpenGov referendum has enacted $JAMKB as of 2026-08-07.
  - kind: factual
  - needs: the article's own disclaimer; a governance/referenda check or
    ecosystem reporting confirming no enactment.

## Where the argument holds

- [ ] c09: If footprint were denominated in DOT at a fixed byte-per-DOT
  factor, the share of DOT locked in staking, coretime purchase, and
  governance would make the *effective* state supply uncertain, which is a
  real allocation problem rather than a rhetorical one.
  - kind: interpretive
  - needs: DOT supply/staking-ratio data showing a large locked fraction.

- [ ] c10: Continuous in-protocol repricing of state would conflict with
  JAM's parallel execution model, because per-service state mutation cost
  would become a shared, contended global variable.
  - kind: technical
  - needs: Gray Paper / JAM docs on the refine-accumulate split and
    parallel service execution.

- [ ] c11: Other production systems separate the state-rent unit from the
  freely circulating settlement unit or lock it out of the float — Solana
  rent-exempt deposits, NEAR storage staking, and Internet Computer
  cycles are precedents.
  - kind: factual
  - needs: primary docs for at least two of the three.

## Rebuttal

- [ ] c12: A hard capacity cap is enforced by the *rate* (bytes per unit
  of collateral), not by the token's total supply, so a DOT-denominated
  deposit with a governance-set rate caps footprint exactly as hard as a
  fixed-supply $JAMKB does.
  - kind: interpretive
  - needs: demonstration by construction plus an existing system that
    caps state this way (Solana/NEAR); no counter-argument in the article
    that addresses rate-based caps specifically.

- [ ] c13: Wood's concession that the KB-per-token rate must be dynamic
  reintroduces the governance-set variable factor his objection to DOT
  relies on rejecting, so the fixed-supply argument does not by itself
  distinguish $JAMKB from a rate-adjusted DOT deposit.
  - kind: interpretive
  - needs: the two article passages side by side; check whether the
    follow-up post resolves the tension.

- [ ] c14: A constant 1 KB per token is itself a preset price curve with
  slope zero, so the objection that "any preset price curve will
  inevitably be suboptimal" applies to $JAMKB as well as to the
  alternative it was raised against.
  - kind: interpretive
  - needs: the article's own phrasing; economic reasoning about
    fixed-quantity vs. fixed-price mechanisms.

- [ ] c15: Because $JAMKB is held rather than spent, holding it idle is
  costless to the holder but denies capacity to others, creating a
  squatting and speculative-hoarding incentive that works against the
  market-allocation goal the design is meant to serve.
  - kind: interpretive
  - needs: independent commentary raising the same objection (forum
    metered-flow thread) plus an analogous observed failure in another
    resource-token system.

- [ ] c16: Making DOT DAO the sole issuer of $JAMKB converts capacity
  release into a governance-political variable and creates a
  value-capture split, because a rising $JAMKB price benefits $JAMKB
  holders directly and DOT holders only indirectly.
  - kind: interpretive
  - needs: forum objections on DOT value capture; Wood's own framing that
    the DAO is "the only entity capable of releasing $JAMKB".

- [ ] c17: The claim that non-state uses of the token subtract from usable
  capacity is an artefact of the perpetual-hold design; a metered or
  streaming rent model decouples circulating supply from occupied
  capacity, so the premise is design-relative rather than general.
  - kind: interpretive
  - needs: the metered-flow forum thread; an existing metered
    implementation (Internet Computer cycles / EIP state-rent designs).

## Ecosystem response and unresolved questions

- [ ] c18: The proposal drew substantive public pushback within the
  Polkadot ecosystem concentrated on distribution, pricing, and DOT value
  capture.
  - kind: factual
  - needs: the Polkadot Forum thread(s).

- [ ] c19: Wood published a follow-up post after the initial proposal that
  responds to the objections raised.
  - kind: factual
  - needs: the follow-up post itself.

- [ ] c20: At least one independent participant argues footprint should be
  a metered flow rather than a perpetual holding.
  - kind: factual
  - needs: the "perpetual holding or metered flow" forum thread.

- [ ] c21: Third-party coverage frames $JAMKB as not competing with DOT
  and DOT as remaining the governance token, which is consistent with
  Wood's stated intent but does not settle the value-capture objection.
  - kind: interpretive
  - needs: at least two independent write-ups.
