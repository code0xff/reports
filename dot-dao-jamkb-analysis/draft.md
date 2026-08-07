# DOT DAO and the Need for $JAMKB: Analysis and Rebuttal

## Abstract

On 22 June 2026 Gavin Wood published a personal-opinion post arguing that
Polkadot's JAM transition requires a new, dedicated token — $JAMKB — to
meter JAM's *footprint*: the slice of state every validator must hold in
RAM at all times.[^s01] The proposal is a fixed supply of roughly 21
million tokens, one token per kilobyte held perpetually while occupied,
entirely owned by the DOT DAO at genesis. This report reconstructs the
argument as an explicit premise chain, tests each link against the JAM
Gray Paper's own text, and then states the strongest available rebuttal.

Two findings dominate. First, the mechanism $JAMKB would denominate
already exists in the specification: the Gray Paper defines a per-service
*threshold balance* equal to a base deposit plus a per-item deposit plus a
per-octet deposit, minus a per-service `gratis` offset, with all three
constants explicitly left "to be determined in following
work."[^s03][^s05][^s04] The proposal is therefore not a new mechanism but
a choice of denomination and calibration for an existing one. Second — and
this is the load-bearing objection — the soundness property Wood claims
for a fixed, single-purpose supply is enforced by the *rate*, not by the
supply. Capacity equals supply times bytes-per-token; setting the
per-octet constant against DOT's capped 2.1 billion supply caps footprint
exactly as hard as a bespoke 21-million-token supply does.[^s17][^s18]
Locked or staked DOT makes state *under*-used, never over-used. The
argument that actually distinguishes $JAMKB is about price-signal
fidelity, which is an efficiency claim — weaker, contestable, and not what
the article's language asserts.

Against that, the report finds four parts of Wood's case that survive
scrutiny: choosing a quantity instrument over a price instrument is
well-founded where marginal cost rises vertically at a hard physical cap,
a standard result in the prices-versus-quantities
literature;[^s14][^s15] the instinct to keep price-finding out of the base
layer was vindicated when Web3 Foundation researchers published and then
withdrew a dynamic-pricing design on 3 August 2026, citing
execution-layer incompatibility, arbitrage exploits and a parameter
cold-start problem;[^s10] the multi-use distortion is real even if it is
not disqualifying; and the formal tokenomics literature reports "an
inherent limitation of the single token setting in terms of implementing an
effective blockchain monetary policy", favouring two-token designs — though
for separating fees from stake rather than permits from
governance.[^s25] The report also argues that Wood's purity premise —
that any non-state use of the token subtracts from usable capacity — is
unsatisfiable by *any* tradable token, and so cannot discriminate between
DOT and $JAMKB: it merely relocates the competing use from stakers to
speculators. JAM is not live, no governance decision has been made, and
every pricing argument on every side is pre-deployment reasoning.[^s20]

## Introduction

Polkadot has spent two years preparing to replace its Relay-chain
architecture with JAM, the Join-Accumulate Machine. In June 2026 that
preparation reached the part that tends to generate the most heat: what
happens to the token. Wood's post is short, technical, and framed
carefully as personal opinion rather than roadmap — the Medium standfirst
opens "This post presents personal opinion," and the follow-up adds "a
token is not being offered, sold, or distributed by me."[^s01][^s02] It
nevertheless proposes something structural: a second scarce asset in an
ecosystem that has had exactly one.

The argument deserves to be taken seriously on its own terms, because it
is not a tokenomics pitch. It is a claim about protocol design — that a
specific resource in JAM has a property (hard, physical, shared
inelasticity) which makes denominating it in the ecosystem's general-purpose
token actively harmful. That is a falsifiable engineering claim, and the
JAM specification is public, so it can be checked.

This report does three things. Section 3 establishes what footprint is and
what the Gray Paper already says about paying for it. Section 4 restates
Wood's case as a numbered premise chain so that the links can be tested
individually rather than as a mood. Section 5 sets out the parts of the
argument that hold. Section 6 is the rebuttal: seven lines of attack,
ordered by how much they cost the proposal. Section 7 covers the ecosystem
response, including a Web3 Foundation counter-proposal that was withdrawn
four days before this report's access date. Section 8 states what this
report could not establish.

One framing note. The rebuttal in Section 6 is *this report's argument*,
built from the specification's own text and from comparative evidence in
other production systems. Where a forum participant independently reached
the same conclusion, that is attributed. Where not, the argument stands on
its cited primaries and should be read as analysis, not as reported
consensus.

## Background — footprint as an inelastic resource

JAM separates its storage into two tiers with very different physics. The
bulk sits in what Wood calls the Data Lake, JAM's built-in distributed
data-availability facility. A much smaller quantity is *footprint*: state
that "must be held in RAM by all validator nodes at all times."[^s01] The
distinction Wood draws is not about throughput but about latency class —
not that data "can be recalled fairly quickly when someone on the internet
asks for it" but that access is "not just 'quite fast' but *immediate*",
and that JAM depends on this "not merely for ensuring things 'go fast', but
even to ensure things *are secure*."[^s01]

This is the premise everything else rests on, and it is worth being precise
about what makes it different from ordinary blockchain state. Every chain
has a state-growth problem; Ethereum's roadmap treats unbounded growth as a
first-order concern, noting that "storage requirements can only ever
increase, and technological improvements will always have to keep pace with
continual state growth."[^s16] What JAM adds is the requirement that the
whole footprint be resident in memory on every validator simultaneously.
Disk is elastic and cheap; RAM on a specified reference machine is neither.

### What the specification already says

The Gray Paper does not use the word "footprint" as a token name, but it
does specify the accounting. A JAM service account is a tuple that
includes a storage dictionary, preimage dictionaries, a code hash, a
`balance`, and — importantly — a `gratis` storage offset.[^s03] The
specification then defines the service's storage footprint as two dependent
values, `items` and `octets`, and derives a third:

"We may then define a third dependent term `a_minbalance`, the minimum, or *threshold*, balance needed for any given service account in terms of its storage footprint."[^s03]

The equation is a linear deposit schedule:

```
a_minbalance = max(0,  C_basedeposit
                     + C_itemdeposit  · a_items
                     + C_bytedeposit  · a_octets
                     − a_gratis)
```

with `items = 2·|requests| + |storage|` and `octets` summing `34 + |key| +
|value|` per storage entry and `81 + z` per preimage request.[^s03] The
constants carry placeholder values in the specification's index —
`C_basedeposit = 100`, `C_itemdeposit = 10`, `C_bytedeposit = 1` — and the
Overview says plainly of them: "we leave the specific values to be
determined in following work."[^s05][^s04]

Three consequences follow, and they matter for everything downstream.

**The mechanism is a deposit, not a fee.** `minbalance` is a threshold a
service must exceed, checked at the point of mutation: the PVM host-call
definitions return a `FULL` condition when `a_minbalance > a_balance`.[^s06]
Nothing is consumed. This is a stock constraint, and $JAMKB's
"hold one token per kilobyte" is a restatement of it.

**`minbalance` is derived, not stored.** It is explicitly a *dependent*
term computed from `items` and `octets`.[^s03] Changing `C_bytedeposit`
therefore changes every service's threshold at once, with no per-service
write. This will matter in Section 6.

**Administrative override is already in the design.** The `gratis` offset
subtracts directly from a service's threshold, and the Gray Paper gives the
privileged *manager* service the power to "bestow services with storage
deposit credits."[^s03] The base layer already accommodates granting
free capacity outside any market.

There is a fourth point worth recording, because it establishes what the
proposal is actually departing from. Polkadot's own JAM documentation
describes the deposit as DOT-denominated: "Services within JAM have no
predefined limits on the amount of code, data, or state they can
accommodate. Their capabilities are determined by crypto-economic factors;
**the more DOT tokens deposited, the greater capacity for data and
state**."[^s07] The published model before June 2026 was therefore exactly
the arrangement Wood now argues is "extremely suboptimal". $JAMKB is a
reversal of documented design, not a filling-in of a blank.

### Where the numbers come from

The Overview also fixes the ambient scale. Balances are 64-bit, with a
presumed denomination of 10⁹ base units per token, which "implies that
there may never be more than around 18×10⁹ tokens" in JAM.[^s04] Taking the
placeholder `C_bytedeposit = 1` at face value, one octet costs 10⁻⁹ token —
so one token would buy roughly a gigabyte. $JAMKB's proposed rate of one
token per kilobyte is about a million times tighter. That gap is not a
contradiction; it is direct evidence that the constants are placeholders
awaiting calibration, exactly as the text says.

Wood's own sizing runs the other way, from hardware to supply: "the amount
of footprint we'd expect JAM to have in total is around 20GB, then under
this accounting it could perhaps have a fixed amount of 21 million
issued."[^s01] The arithmetic is consistent in binary units — 21 × 10⁶ ×
1024 B ≈ 20.03 GiB — but the 20 GB premise is attributed only to
"reference hardware" being "finite and well-specified", and no published
JAM reference-hardware specification with a RAM figure was located for this
report. The figure is Wood's estimate _(unverified — single source)_, and
because the token count is arithmetic on it, the supply figure inherits its
uncertainty.

For context on the other side of the comparison: DOT's supply is now
capped. Referendum 1710 passed on the Wish For Change track and has been
executed, setting a total supply cap of 2.1 billion DOT with issuance
stepping down by 13.14% of the remaining supply every two years from 14
March 2026; current total supply is approximately 1.6 billion.[^s17][^s18]

## The proposal, anatomized

Wood's case can be set out as five premises and a conclusion. Stating it
this way is not a rhetorical device — the links have very different
evidential status, and collapsing them is what makes the argument look
stronger than it is.

- **P1.** Footprint is an inelastic, physically bounded resource, because every validator must hold all of it in RAM under a specified reference machine.[^s01]
- **P2.** Therefore the protocol must attach a resource-access token to footprint utilisation, limited in number and movable but not creatable, so that "no more footprint can be used than nodes can be expected to store."[^s01]
- **P3.** The token's supply must be inelastic, *and* the token must have no material use other than representing occupied state — because "the more that the token is used for anything other than representing the ongoing costs of utilized state of JAM, then the less useful JAM can be."[^s01]
- **P4.** DOT satisfies the inelasticity half (it now has a fixed supply) but fails the second half: DOT's staking, coretime and governance uses make "the supply which could be used for JAM's Service State utterly uncertain", so that a fixed DOT-to-bytes factor cannot simultaneously deliver a low clearing price when under-utilised and a high one when over-utilised.[^s01]
- **P5.** The obvious escape — a variable token-to-byte rate that gets cheaper when state is empty and dearer as it fills — is worse, on four grounds: any preset price curve is inevitably suboptimal; incentive-compatible eviction of low-value data is hard to combine with cost transparency; the book-keeping "would introduce complexity exactly where it is unwanted: in the base layer protocol"; and "parallelisation would be hard or impossible as multiple services alter storage at the same time."[^s01]
- **C.** Therefore JAM needs a new, totally specialised state-footprint access token, and Polkadot should introduce $JAMKB.[^s01]

### The design

$JAMKB as specified in the post: a fixed supply of approximately 21
million; one token holds one kilobyte of footprint "for as long as it is
held"; moving a token out of a service requires the corresponding kilobyte
to be cleared first; and the entire supply is owned by the DOT DAO at
genesis, initially sitting on Polkadot's pre-deployed Parachains
Service.[^s01] The rate is not permanently fixed: "Should RAM become
cheaper in time... the fixed rate would probably need to increase, and thus
will be dynamic in nature and not require a hard-fork to alter."[^s01]

The governance asks are three, plus a suggestion: create a 1:1
representation of $JAMKB on Polkadot Hub; decide on bringing "a substantial
portion" into permissionless private ownership, one example being to
"drip-feed into an on-chain exchange"; ensure logic exists to extract the
token from the Hub-and-parachains service into other JAM services; and
consider granting core developers free JAM usage via "resource-access token
grants or loans."[^s01]

The stated motivation for release is revenue, not ideology. Wood observes
that "by restricting Polkadot JAM's coretime sales only to be used by
parachains, it limits the utility of the one material revenue stream for
DOT DAO" — novel coretime demand requires novel services, and services
require $JAMKB in developers' hands.[^s01] He also asserts that "we already
see demonstrations of JAM out-classing parachains with its coretime usage",
without naming them _(unverified — single source)_.[^s01]

### The follow-up

Five days later Wood published a companion post, "DOT DAOism under JAM: An
Island Story", framing the DAO as a sovereign island that owns land (state)
and a power plant (coretime), with $JAMKB functioning "like carbon credits"
governing how much development the finite geography can host.[^s02] Its
thirteen-question Q&A is where several of the sharpest details sit. Asked
whether $JAMKB would be sold for DOT or dotUSD, he answers: "That is not
for me to define... the most obvious option to me would be dotUSD."[^s02]
Asked whether DOT-denominated sales would make more sense, he argues
against creating direct DOT demand, prioritising market accessibility over
volatility. Asked what prevents $JAMKB becoming primarily speculative, he
suggests short-term speculation could benefit the DAO, with gifts and loans
to developers ensuring genuine utility. Asked who sets the release
schedule: "DOT DAO is in control."[^s02] Value return to DOT holders is
described as discretionary treasury policy — monthly DOT returns, buybacks,
validator funding, ecosystem spending, "all of the above."[^s02] He also
dismisses single-token preference as "a cryptocurrency mind-virus",
comparing DOT and $JAMKB to oil and gold as goods needing separate pricing
mechanisms.[^s02]

## Where the argument holds

Three parts of the case are stronger than the ensuing debate has given them
credit for, and one of them has since acquired direct empirical support.

**The instrument choice is well-founded, though not for the stated
reason.** Wood's throwaway line that "in general a variable price will be
optimally discovered by market effect, and any preset price curve will
inevitably be suboptimal" is not the correct argument, and Section 6
returns to why. But the *conclusion* — use a quantity instrument, let the
market find the price — is exactly what standard mechanism design
recommends here. Weitzman's 1974 result established the comparative
advantage of price versus quantity instruments under asymmetric
information as a function of the curvature of the benefit and cost
functions.[^s14] Williams' restatement makes the informational premise
explicit: "Asymmetric information is an essential part of this comparison;
without it, price, quantity, and tradable quantity instruments yield
identical outcomes."[^s15] Footprint is the textbook case favouring
quantities: the marginal social cost of exceeding validator RAM is not a
gradient but a cliff, so a quantity cap dominates a price signal that
might under-shoot and permit overshoot. Williams goes further, showing
that "fixed quantities may be more efficient than tradable quantities if
the regulated goods are not perfect substitutes."[^s15] A tradable,
fixed-supply footprint permit is a defensible instrument. _(interpretive)_

**Keeping price-finding out of the base layer was vindicated within six
weeks.** On 29 June 2026, Web3 Foundation researchers Jonas Gehrlein and
Kremena Valkanova published a detailed dynamic-pricing design for $JAMKB:
a convex occupancy curve `P(u) = P_min / (1 − u)^k`, a flow factor
`F(g) = min(exp(β·g), F_max)` responding to allocation velocity, and a
global decay accumulator incremented once per block so that recoverable
deposit fractions followed `R(t) = D₀·(0.1 + 0.9·exp(−(A(t) − A(t₀))))`
with a guaranteed 10% floor.[^s10] This is a serious attempt at exactly the
alternative Wood dismissed. On 3 August 2026 the authors withdrew it,
citing five failure modes: unpredictable reclamation timing; execution-layer
incompatibility, because "allowing the underlying JAM protocol layer to
asynchronously purge state primitives breaks this assumption, forcing
contract toolchains, static analyzers, and developer frameworks to
implement defensive fallbacks"; unresolved delegation architecture; two
concrete arbitrage exploits (sub-allocation arbitrage and decay-resetting
arbitrage); and a parameter cold-start problem, since "because JAMKB is not
yet operational, baseline empirical demand data does not exist."[^s10]
Their conclusion: "A viable JAMKB allocation mechanism demands a much
deeper handling of cost predictability, state-lifecycle guarantees, and
execution model compatibility than our design allowed for."[^s10] Wood's
fourth objection in P5 — complexity in the wrong layer — was substantially
correct about flow-based designs.

**The multi-use distortion is real, even if it is not disqualifying.** With
DOT capped at 2.1 billion and roughly 1.6 billion issued, and with a
substantial share of that locked in staking,[^s22] a fixed byte-per-DOT factor
would have to be calibrated against total supply for safety while the
realised clearing price sat far below the calibration point for as long as
most DOT stayed staked.[^s17][^s18] The state price would then be a joint
function of staking yield, coretime demand and state demand, and reading
scarcity off it would be genuinely hard. That is a real cost.

**The formal literature leans toward two tokens.** Kiayias, Lazos and
Penna study long-run equilibria in proof-of-stake tokenomics and report
"an inherent limitation of the single token setting in terms of
implementing an effective blockchain monetary policy", finding that the
two-token setting can implement the target mechanism "effectively and
provide good equilibria."[^s25] This is the strongest external support
available for Wood's direction, and it should be weighted with care: their
two tokens separate a *fee* token from a *stake* token for monetary-policy
purposes, not a resource-access permit from a governance token. The support
is therefore analogical rather than direct — but it does mean that "one
token is better than two" cannot be assumed, and Wood's dismissal of that
assumption as "a cryptocurrency mind-virus"[^s02] has a defensible formal
counterpart.

**Precedent exists for separating the resource unit.** The Internet
Computer is the cleanest example: canister resources are paid in *cycles*,
a unit pegged to a fiat basket at "1 trillion cycles = 1 XDR" rather than
to the ICP token price, with storage charged continuously per GiB per
second and reserved cycles held "non-transferable."[^s13] Separating the
metering unit from the governance-and-value token is a live design in
production.

## Rebuttal — seven lines of attack

The seven objections below are ordered by how much they cost the proposal.
The first is decisive against the argument as stated; the last three are
serious but admit reasonable replies.

### R1. The soundness claim does not discriminate between DOT and $JAMKB

This is the central defect. Wood's P2 makes a safety claim: limiting token
count and forbidding creation means "we make the overall system sound and
ensure no more footprint can be used than nodes can be expected to
store."[^s01] But maximum footprint is a product, not a supply:

```
max_footprint  =  S  ×  r
    S = token supply usable as deposit
    r = bytes per token  ( = 1 / C_bytedeposit )
```

Soundness requires `S × r ≤ C`, where `C` is the RAM budget. This is
satisfiable for *any* fixed `S` by choosing `r` accordingly. DOT's supply
is now hard-capped at 2.1 billion.[^s17][^s18] Take Wood's own 20 GiB
budget: setting `r ≈ 10 bytes per DOT` — equivalently about 100 DOT per
kilobyte — means that even if every DOT in existence were simultaneously
deposited as state collateral, total footprint could not exceed the budget.
The soundness property holds identically.

Now consider what DOT's competing uses actually do to that bound. Staked,
bonded and treasury-held DOT is DOT *not* posted as state collateral, so it
pushes realised footprint *below* `C`. Competing uses cause
**under**-utilisation. They cannot cause over-utilisation, because the cap
binds against total supply, not against float. Wood's P4 says these uses
make the available supply "utterly uncertain" — true, but uncertainty in
the *downward* direction is not a soundness problem. It is a price-signal
problem.

The article's own sentences sit three paragraphs apart and do different
work: "we make the overall system sound" is a safety claim, while
"impossible to create a fixed-factor of DOT-to-bytes... which at once would
ensure a low clearing price... and a high-price when over-utilized" is an
efficiency claim about price discovery. Only the second is actually
argued, and only the second is at issue. The conflation matters because
safety claims are near-unanswerable in protocol design while efficiency
claims invite exactly the cost-benefit argument the proposal never has.
Notably the conflation propagated: the Web3 Foundation proposal repeats
that "the fixed supply gives the protocol a clean soundness
guarantee."[^s10] A rate-based cap gives the same guarantee.

### R2. A production system already does the thing being called disqualified

NEAR Protocol denominates state in its native, multi-use token. Its docs
are explicit on all three points at issue: the rate is "1E19 yoctoNEAR per
byte, or 100kb per NEAR token"; the mechanism is a deposit, not a fee, so
"you can remove data to unstake some tokens"; and the overlap with
validation staking that Wood treats as disqualifying is described as a
*benefit* — "Storage-staked tokens are unavailable for other uses, such as
validation staking. This increases the yield that validators will
receive."[^s11] Structurally, "100 KB per NEAR" and "1 KB per $JAMKB" are
the same mechanism with different constants and different denominations.
One of them is in production on a multi-purpose token.

Solana is the second data point, and it answers Wood's rate-adjustment
problem too. Accounts holding "a minimum balance equivalent to 2 years of
rent payments are exempt", at "a rate specified in genesis, in lamports per
byte-year", and the two-year window is chosen because "hardware cost drops
by 50% in price every 2 years."[^s12] Solana handles "should RAM become
cheaper in time" by indexing the deposit to hardware depreciation, inside a
multi-use token, without a second asset.

And the third data point is Polkadot's own documentation, quoted in Section
3: JAM service capacity was published as scaling with DOT deposits.[^s07]
Whatever else is true, a DOT-denominated state deposit cannot be
architecturally impossible in JAM, because it is what JAM was documented to
do.

Two fairness points cut against this, and the second is serious enough that
R2's conclusion has to be narrowed.

First, neither analogy is exact, and the difference favours Wood: neither
NEAR nor Solana requires its entire state to be RAM-resident on every
validator, so neither faces a constraint as hard as JAM's. That weakens the
analogy's force on the physics, though not on the economics, which is where
P4 lives.

Second — and this is the stronger objection — NEAR's model is contested by
NEAR's own core contributors, and its production record shows the failure
mode this report attributes to $JAMKB in R6. A 2022 NEP issue proposes
*removing* storage staking for base account information, arguing that
"growth of usage (and especially NEAR locked in various DeFi protocols or
usage as a medium of exchange) benefits the protocol's economics way more
than locking NEAR", and that developers either build storage models users
dislike or absorb the cost themselves.[^s26] An earlier design discussion
records that transactions cannot attach storage deposits directly, so
contracts must manage storage, complicating multi-contract promise
failures; oysterpack's objection there is blunt — "Burning NEAR for storage
allocation provides zero incentive to clean up storage."[^s27] And the
non-release problem is observed, not theorised: users of Ref Finance
deposited for storage and did not reclaim it.[^s26][^s27]

So the honest conclusion is narrower than "NEAR proves Wood wrong."
Denominating a capped state deposit in a multi-use native token is
*feasible* — it runs in production, and Polkadot's own documentation
described JAM as doing it[^s07] — which is enough to defeat P4 as an
impossibility claim. But the lived experience of that design is mixed
enough that NEAR cannot be cited as an endorsement, and the same idle-capacity
pathology appears there as R6 predicts for $JAMKB. The precedent
establishes possibility, not desirability.

### R3. The variable-rate objection conflates two different designs, and the cheap one is the one Wood needs

P5 rejects "a variable token-to-data rate" on grounds of base-layer
book-keeping, per-mutation compute and storage cost, and impossible
parallelisation.[^s01] Two pages later, $JAMKB's own rate "will be dynamic
in nature and not require a hard-fork to alter."[^s01] Taken literally
these are the same object, and the proposal cannot both reject variable
rates and adopt one.

The resolution is that they are *not* the same object, and the distinction
Wood does not draw is the one that decides the case:

- A **variable rate** is a stock reprice. `C_bytedeposit` changes; every
  service's threshold follows automatically, because `minbalance` is a
  *dependent* term recomputed from `items` and `octets` rather than a
  stored per-service field.[^s03] One constant changes. No per-service
  write. No contention between concurrently mutating services, because
  nothing is being deducted.
- A **metered flow** is a recurring charge. Balances must actually be
  debited, which touches every service's stored balance, requires a
  depletion trigger, and serialises around a global cost accumulator.

All four of P5's objections — book-keeping, storage-mutation cost,
parallelisation, cost approximation — land on the flow design. None of them
land on the variable-rate design, which is nearly free in JAM precisely
because of how the Gray Paper factors `minbalance`. The Web3 Foundation
withdrawal is consistent with this reading: its five failure modes are all
flow-side (reclamation timing, asynchronous state purging, decay-reset
arbitrage), not reprice-side.[^s10]

This matters because the variable-rate design is exactly the DOT-denominated
alternative R1 describes. Governance sets `C_bytedeposit` against the capped
DOT supply; the cap holds by construction; the rate is adjustable as RAM
cheapens, at O(1) protocol cost, with no new asset. Wood's own dynamic-rate
concession concedes the mechanism. Having conceded it, P5 no longer rules
out the alternative it was raised against.

A related observation: the developer-grant ask needs no new token either.
The Gray Paper already gives the manager service power to bestow "storage
deposit credits", implemented as the per-service `gratis` offset that
subtracts directly from the threshold.[^s03][^s06] Free capacity for core
developers is a `gratis` grant, available under any denomination.

### R4. The purity premise is unsatisfiable by any tradable token, so it cannot discriminate

P3 requires that the token have no material use other than representing
occupied state: "the more that the token is used for anything other than
representing the ongoing costs of utilized state of JAM, then the less
useful JAM can be, since every such token not used intentionally as a cost
of holding state is preventing some other user from using the token for
state."[^s01]

Wood simultaneously requires the token to be tradable — otherwise the
market cannot reallocate capacity to its highest-value use, which is the
whole justification — and he concedes the tension himself: the ideal in
which all tokens sit in services "is not generally practicable since in
order for tokens to change hands conveniently there must be some which are
not 'in use'."[^s01] The proposal then goes further and asks for
$JAMKB to be drip-fed into an on-chain exchange and brought into
"permissionless private ownership."[^s01]

A fixed-supply, permissionlessly-owned, market-priced asset will be held
for expected price appreciation. That is, by P3's own definition, a use
other than representing occupied state, and every such token withheld from
services is "preventing some other user from using the token for state."
$JAMKB fails P3. It does not eliminate the competing-use problem; it
relocates it from stakers to speculators — arguably to worse holders, since
a staker at least purchases network security with the locked capital while
a speculator purchases nothing.

Wood's follow-up does not deny this so much as absorb it, suggesting
speculation "could, in the short-term, be advantageous" to the DAO and
proposing gifts and loans to get tokens into builders' hands
anyway.[^s02] The Web3 Foundation researchers state the failure mode
without hedging: "every unit of JAMKB that drifts out of productive use is
footprint capacity sitting idle, deadweight that no one can build
on."[^s10]

A premise that no tradable token can satisfy cannot ground a choice
between two tradable tokens. And note the shape of the consistent
alternative: the Internet Computer gets purity by making the metering unit
*non-transferable* and continuously charged rather than by making it a
separate tradable coin.[^s13] Purity and tradability are the trade-off;
$JAMKB takes tradability and claims purity.

The strongest reply available to Wood does not defend P3 but abandons it.
It is that separating the units is worth doing for reasons independent of
purity — because a single token cannot serve every monetary function well,
which is what the formal tokenomics literature reports.[^s25] That is a
better argument than the one in the article, and this report does not
dispute it. It is simply not P3, and it does not license P4's conclusion
that a rate-adjusted DOT deposit is disqualified.

### R5. "Any preset price curve is suboptimal" applies to a constant too

Wood writes that "in general a variable price will be optimally discovered
by market effect, and any preset price curve will inevitably be
suboptimal."[^s01] A fixed rate of one kilobyte per token is a preset
price curve — one with slope zero. As a general principle the sentence
condemns $JAMKB along with the alternative it was aimed at.

The reply available to Wood is that the two mechanisms fix different
things: $JAMKB presets *quantity* and lets price float, while the rejected
alternative presets *price* and lets quantity float. That reply is correct
and it is the argument he should have made — it is Weitzman's
framing.[^s14][^s15] But it is not the argument in the text, and it does
not survive intact either, because $JAMKB's rate is conceded to be
dynamic.[^s01] A governance-adjusted kilobyte-per-token rate is a preset
schedule of *both* quantity and, indirectly, capacity. The rhetorical move
is inconsistent even where the underlying instrument choice is defensible.

### R6. Perpetual holding plus no eviction means usable supply only ever shrinks

$JAMKB is held, not spent, and holding it idle costs the holder nothing
while denying capacity to everyone else. Combined with the specification's
treatment of state, this has a permanent consequence. A search for
`evict`, `purge`, `expir`, `reclaim` and `delet` across the retrieved Gray
Paper sections — Service Accounts, Definitions, Overview, Discussion,
Accumulation and PVM Invocations — returned no matches, corroborating the
claim made on the forum by OliverTY that "the Gray Paper does not allow for
any flow mechanism since there is no storage eviction."[^s09][^s03][^s24]
This is negative evidence over a subset of the document rather than a proof
over the whole of it, but it is consistent with the design: `minbalance` is
checked synchronously at mutation and there is no background sweep.[^s06]

The consequence, put by batbayar on the forum: "A lost-key or dead-service
token keeps its 1KB of footprint budget reserved forever, and no market
corrects it."[^s09] Under a fixed supply with no eviction, *usable* supply
is monotonically non-increasing over the network's lifetime. Every
abandoned service, lost key and failed experiment permanently retires a
slice of the 20 GiB.

This is the one objection with direct empirical support, and it comes from
the system R2 cites. NEAR's refundable storage deposit gives holders a
positive incentive to release capacity, and they still did not: users of
Ref Finance deposited for storage and did not reclaim it.[^s26][^s27]
oysterpack's generalisation — that the design "provides zero incentive to
clean up storage"[^s27] — applies with more force to $JAMKB, where release
requires clearing state first and where an appreciating token gives holders
a positive reason *not* to release. If a refundable deposit in a live
system does not get reclaimed, a perpetual permit with option value will
not either.

This one has a real reply, and it deserves stating. OliverTY's counter is
that permanence is a feature: "Your ERC20 contract will still be there in
10 years. It's a guarantee without which it would be useless," and
legitimate long-dormant services — dead-man switches, escrows — must not be
swept.[^s09] Ethereum's history supports him: state rent was rejected there
substantially because "the possibility of losing an NFT or a balance for
not paying a periodic fee contradicts fundamental user expectations", and
even state expiry keeps inactive state recoverable, since "inactive state is
**not deleted**, it is just stored separately."[^s16] So this is a genuine
design trade-off rather than a knockdown. The objection is narrower: the
proposal presents perpetual holding as costless, and it is not.

### R7. Value capture is mediated by discretion, and capacity release becomes a governance variable

Wood's conclusion asserts that DAO ownership "ensures economic alignment
between DOT and $JAMKB, leaving the DOT DAO as the only entity capable of
releasing $JAMKB to third-parties."[^s01] Two features of the design
weaken that alignment.

First, sole issuance makes capacity release a political variable. The
quantity of footprint available to builders at any moment is whatever
governance has most recently voted to release — "DOT DAO is in
control"[^s02] — which is administrative allocation of the aggregate, with
market allocation operating only on the released fraction. The market
efficiency argument applies to the tail, not the dog. And the retention
share, on which every downstream conclusion depends, is explicitly
deferred; the forum thread's synthesis identifies five independent
arguments all converging on DAO retention and then notes the unanswered
question, "How much footprint does the DAO actually retain?"[^s09]

Second, Wood's own preference is that $JAMKB be sold for dotUSD rather than
DOT, arguing against creating direct DOT demand in favour of market
accessibility.[^s02] Under that choice, JAM state demand generates *no*
direct DOT bid. Value reaches DOT holders only through discretionary
treasury policy — "monthly DOT returns", buybacks, ecosystem funding, "all
of the above."[^s02] "Economic alignment" then means the DAO holds an
appreciating asset and may choose to pass some of the proceeds along. That
is a weaker claim than the conclusion states, and it is precisely what
forum participants objected to: D0tSama noted that "for that to matter
economically, the path from JAM usage back to DOT needs to be clear", and
Megadot put the sharp version — "No value capture, no real demand—just
dilution."[^s08]

## Ecosystem response and unresolved questions

The proposal generated substantive public debate within days.

The main thread, opened 22 June, ran to two pages and concentrated on
distribution, pricing and DOT value capture.[^s08] The positions were
diverse rather than uniformly hostile. rvalle argued DOT holders had already
funded JAM's development and that "there should be a direct and
unquestionable positive economic impact to each DOT holder", proposing 1:1
issuance to holders. ultracoconut proposed deposit-backed minting to
eliminate speculation. Abdulbee pushed back on that from the market side,
observing that a flat deposit destroys the allocation signal — "when the lot
is 99% full, minting still costs the same" — and that "a rising price...
makes the lowest-value occupant clear out so the slot goes to better use."
9God proposed DOT-only auctions parallel to coretime, splitting proceeds
between burn and treasury. thewhiterabbitM raised process rather than
mechanism, objecting that "the direction, the design, and in practice the
outcome of the votes all revolve around a small circle of people."[^s08] The
thread also surfaced the specification objection this report examines in
Section 3: a reference, via an embedded post from Wei Tang, to the Gray
Paper defining a single native token, and hence to $JAMKB sitting awkwardly
with the specification as written.[^s08] A second page of the thread adds an
objection of a different class: M_cat13 argued on 30 June that "JAMKB should
not have an independent pricing mechanism, which would legally constitute
fraud", recommending the Agile Coretime model instead.[^s28] This report
records that objection without endorsing it and makes no legal assessment.

A second thread, opened 25 June, isolated the structural question: should
footprint be a perpetual holding or a metered flow?[^s09] batbayar's case
for flow — "Pin the price (a small recurring rent) and let occupancy float"
— rests on the two failure modes in R6 plus a value-capture argument that "a
DOT-denominated flow keeps a standing DOT charge for state, tied to the
level of usage and recurring for as long as the network runs", whereas
permanent holdings capture value only during growth and fade at maturity.
Kingston007 later synthesised this as a leasehold-versus-freehold choice —
"Keep the land. Lease the use. Distribute the rent" — and identified five
independent lines of argument converging on DAO retention.[^s09] OliverTY
supplied the strongest technical objection to flow, the absence of storage
eviction, and the strongest normative one, permanence as a
guarantee.[^s09]

Wood's follow-up on 27 June engaged the value-capture and speculation
questions directly, while deferring every distribution mechanism to
governance with a repeated "That is not for me to define."[^s02] That
posture is defensible for a personal-opinion post; it also means the
proposal's most contested parameters remain unset.

The most consequential development is the newest. The Web3 Foundation
dynamic-pricing proposal of 29 June was withdrawn on 3 August 2026 — four
days before this report's access date — by its own authors, on five stated
grounds.[^s10] Read alongside Wood's P5, it constitutes the ecosystem's own
evidence that base-layer dynamic pricing of footprint is harder than it
looks. Read alongside R1 and R3, it leaves the field in an awkward
position: the strongest worked alternative has been withdrawn, the fixed
$JAMKB design has unanswered distribution and dead-capacity problems, and
the cheap middle option — a governance-adjusted per-octet rate on the
existing capped token — was not located in this report's search of the
forum, the specification or third-party coverage.

Governance status is straightforwardly early. JAM is not live on mainnet;
Web3 Foundation is running a 10 million DOT prize pool for independent
implementations; and the honest external framing is that "JAM should be
viewed as an ambitious upgrade path, not a finished product" _(unverified —
single source)_.[^s20] The Gray Paper's published release history runs from
v0.2.1 in June 2024 to v0.7.0 in June 2025 _(unverified — single
source)_.[^s21] No OpenGov referendum enacting $JAMKB was located. Third-party
coverage is descriptive rather than analytical: Totestek's June write-up is
broadly supportive while flagging that this is "the most ambitious protocol
migration in blockchain history" and that "parachains have built businesses
around the current architecture",[^s19] and the Polkadot Cloud blog's
framing — that a dedicated non-speculative metering unit is what is
proposed, not a coin to trade against DOT — could not be retrieved in full
for verification.[^s23]

## Limitations

**The RAM premise is vendor-stated.** No published JAM reference-hardware
specification with a numeric RAM budget was located. The ~20 GB footprint
figure and hence the 21 million supply figure rest on Wood's estimate
alone.[^s01] If the hardware premise moves, the supply figure moves with
it, and several of this report's numeric illustrations move with them.

**Weitzman's primary text was not readable.** The Oxford Academic record is
abstract-only and a university mirror returned 403, so the
comparative-advantage result is cited through Williams' restatement and
extension.[^s14][^s15] The report does not reproduce Weitzman's condition
in its original form.

**All substantive critique of $JAMKB is ecosystem-internal.** Every worked
objection located — the two forum threads and the Web3 Foundation proposal
— is hosted on the Polkadot Forum, and the Web3 Foundation contribution is
first-party research rather than independent analysis.[^s08][^s09][^s10]
No independent academic or industry economic analysis of $JAMKB itself was
found; the academic source this report does use[^s25] addresses two-token
tokenomics in general, not $JAMKB. Section 6's rebuttal is accordingly this
report's own argument built from primary specification text, not a summary
of external consensus.

**A relevant lead could not be verified.** A search summary attributed to
the Polkadot Forum a proposal to mint $JAMKB against locked DOT in the
manner of a collateralised stablecoin, together with the criticism that
speculative holders would leave RAM "physically available but economically
locked up". That is directly on point for R1 and R4, but the post could not
be localised on either retrieved page of the thread, so it is not cited and
its existence should not be assumed. Its substance is represented in R4 via
the Web3 Foundation's own "deadweight" formulation.[^s10]

**The comparative evidence is mixed, not one-directional.** R2's precedent
argument is weakened by NEAR's own core contributors proposing to remove
storage staking[^s26][^s27] and strengthened, on the R6 side, by the same
sources. Readers should treat NEAR as evidence that the design is feasible
and awkward, not that it is good.

**The "no eviction" finding is negative evidence.** It rests on a
term-search across six retrieved Gray Paper sections, not an exhaustive
reading of the specification, and it corroborates a forum claim rather than
citing a positive statement in the document.[^s09][^s24]

**The variable-rate cost argument is unvalidated against an
implementation.** R3's claim that changing `C_bytedeposit` is O(1) rests on
reading `minbalance` as a dependent term recomputed from `items` and
`octets`.[^s03] That reading is well supported by the equation and by the
host-call checks[^s06] but was not confirmed against any of the running
JAM implementations.

**$JAMKB's specification status is undecided.** The Gray Paper defines a
single native token and leaves the deposit constants open;[^s04][^s05] no
retrieved version names $JAMKB. Whether $JAMKB would require a
specification change or exist as a Hub-level wrapper over the existing
threshold-balance mechanism is unresolved, and that choice affects several
arguments on both sides.

**No empirical data exists.** JAM has no mainnet deployment, so there is no
footprint-demand history, no observed clearing price, and no measured
abandonment rate.[^s20] Every pricing argument in this report and in the
sources it cites — Wood's, the forum's, Web3 Foundation's and this
report's own — is pre-deployment reasoning. The Web3 Foundation authors
named this problem explicitly as their fifth withdrawal ground.[^s10]

**Governance has not spoken.** Community sentiment in June and July 2026 is
not a decision, and no referendum on $JAMKB was located. The retention
share, the sale denomination, the release schedule and the rate-adjustment
authority are all explicitly deferred.[^s02][^s09] Conclusions about the
proposal's economic consequences are conditional on parameters nobody has
set.
