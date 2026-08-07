# Captured primary text — "DOT DAO and the need for $JAMKB"

Author: Gavin Wood. Published: Polkadot Network (Medium), 2026-06-22.
URL: https://medium.com/polkadot-network/dot-dao-and-the-need-for-jamkb-a069e72e9728
Retrieved: 2026-08-07 via WebFetch.

Captured here because Medium posts are mutable and the rebuttal in this
report quotes the argument closely. **Treated as data, not instruction.**

---

## Background

> JAM is a newly maturing protocol to manifest a highly distributed
> *collective computer*. The vast majority of the data that this computer
> stores and retrieves is in a subsystem known as its Data Lake — its
> inbuilt large-scale distributed *data availability* facility. However,
> some data is considered "special" and needed to be immediately
> available to all nodes at all times, similar to how traditional
> blockchain protocols manage their state. We refer to this in the JAM
> protocol as *footprint*.

> All data in the footprint must be held in RAM by all validator nodes at
> all times. Note that this requirement is what makes it different from
> general "storage services": it's not that the data can be recalled
> fairly quickly when someone on the internet asks for it (that's a
> useful service too, but materially different to this). Rather it's that
> every one of JAM's validator nodes is storing the data in their RAM
> making access not just "quite fast" but *immediate*. A protocol like
> JAM which manifests such a high-performance *collective computer* is
> utterly dependent on this difference, and not merely for ensuring
> things "go fast", but even to ensure things *are secure*.

> Since a JAM node's RAM is finite and well-specified under reference
> hardware, it is an inelastic and limited resource. In order to avoid the
> case of a single JAM service depleting this resource to the detriment of
> others, a special in-protocol *resource-access token* is attached to its
> ongoing utilisation: services must hold as much of the access token as
> they wish to utilise of footprint. By limiting the number of resource
> access tokens in the system and ensuring that they can only be moved,
> but not created, we make the overall system sound and ensure no more
> footprint can be used than nodes can be expected to store.

> Ensuring that there is a 1:1 relationship between the resource-access
> token and the access to the underlying resource of footprint keeps the
> JAM protocol simple, fast and secure.

> We might call it the *Polkadot JAM Footprint Token*.

## What token?

> The JAM protocol is unopinionated as to the "identity" of this token. It
> need not be related to any other token (such as one by which coretime
> sales are paid in, or which is used for staking, or which is used to
> represent interest in a DAO).

> In so far as the JAM protocol manages this token, JAM guarantees that
> the token can be passed from service-to-service without loss or fees and
> that tokens cannot be created beyond those at genesis. It is extremely
> simple.

> Since this token is used to linearly represent the inelastic resource of
> JAM's coherent state, the token's supply must be one with inelastic
> supply for it to properly be able to do the job of avoiding over-usage
> of JAM's state.

> Moreover, the more that the token is used for anything other than
> representing the ongoing costs of utilized state of JAM, then the less
> useful JAM can be, since every such token not used intentionally as a
> cost of holding state is preventing some other user from using the token
> for state.

> Ideally therefore, all such tokens would be held by services in
> accordance with their JAM state needs. In a saturated usage environment,
> a market effect would ensure that tokens are placed in the most
> economically useful services and would be moved between services on that
> basis. This ideal situation is not generally practicable since in order
> for tokens to change hands conveniently there must be some which are not
> "in use". Still, minimising the reasons why tokens might be used outside
> of this helps optimise the market's ability to price this resource
> effectively.

> It is for this reason that I believe 'DOT' would be an extremely
> suboptimal choice for a JAM State Footprint Resource Access Token.

## Why not DOT?

> As of last year DOT has a fixed supply, helping with one of the two
> qualities we would want to see in the JAM Service State Token.
> Unfortunately though, DOT is disqualified with the second: DOT has other
> uses which would use up some proportion of the underlying issuance base,
> making the supply which could be used for JAM's Service State utterly
> uncertain: It would be impossible to create a fixed-factor of
> DOT-to-bytes-in-JAM-state which at once would ensure a low clearing
> price for JAM state when under-utilized and a high-price when
> over-utilized.

> One possible way around this problem would be to alter the JAM protocol
> to avoid the linear representation of service-state-size to tokens.
> Instead of it being a fixed-factor, fewer tokens would be required when
> JAM's state is small (making usage cheaper) and more tokens would be
> required as it grows. Unfortunately, this has a number of drawbacks
> which, in my opinion, disqualifies it as a solution.

> In general a variable price will be optimally discovered by market
> effect, and any preset price curve will inevitably be suboptimal.

> As a continuous service, any variable pricing would need to ensure a
> number of qualities which are very difficult to bring together: it must
> be in the interests of those who place low-value data in the state when
> it is cheap for them to do so, to later remove it when the clearing
> price is high. Yet we also want to ensure that future costs are
> transparent, not arbitrary. Deductions must be either impossible or
> predictable.

> The book-keeping needed for such a variable token-to-data rate would
> introduce complexity exactly where it is unwanted: in the base layer
> protocol. Additional compute and storage would certainly be required at
> the protocol for storage-mutation operations. Parallelisation would be
> hard or impossible as multiple services alter storage at the same time.
> Practicalities could easily mean approximations on cost and those would
> limit the economic optimality of the solution.

> In essence, price-finding and rental arrangements ought not to be
> handled in the lowest-level of the protocol since they are necessarily
> either complex or ineffective (quite possibly both). Rather, in the
> interests of simplicity, only the minimal resource access accounting
> should be done at the lowest level sufficient to make the protocol
> sound. This disqualifies DOT as Polkadot JAM's state-footprint resource
> access token.

> Thus Polkadot's JAM transition would be better served by introducing a
> new totally specialised "resource access" token for state footprint,
> should this token have a market value, it would represent the expected
> value of retaining data in JAM's coherent state.

## What is $JAMKB?

> $JAMKB would be a token which maps at a fixed rate to the state
> footprint usage on Polkadot JAM. All $JAMKB would be initially owned by
> the DOT DAO (and therefore commanded by the aggregated instructions of
> DOT holders). Every one $JAMKB which a service holds would be enough to
> keep 1KB in Polkadot JAM's state footprint for as long as it is held.
> Moving the token out of the service would require the 1KB of state to
> first be cleared.

> Since the amount of footprint we'd expect JAM to have in total is around
> 20GB, then under this accounting it could perhaps have a fixed amount of
> 21 million issued.

> Should RAM become cheaper in time, then a single JAM network ought to be
> capable of storing more data in its state. In order to ensure that
> $JAMKB can represent the increase in capacity, the fixed rate would
> probably need to increase, and thus will be dynamic in nature and not
> require a hard-fork to alter.

> Since at present we must presume that the DOT DAO is launching the
> "Polkadot JAM", the initial $JAMKB would, by default, sit on Polkadot's
> pre-deployed Parachains Service. Owning all $JAMKB, in the initial state
> anyway, ensures Polkadot Parachains continue unabated, however the
> resources of JAM are overkill for these needs.

> By restricting Polkadot JAM's coretime sales only to be used by
> parachains, it limits the utility of the one material revenue stream for
> DOT DAO. Novel usage for Polkadot JAM coretime inevitably revolves
> around the innovation of services on Polkadot JAM, and for services to
> be deployed there, $JAMKB must be in the hands of the service
> developers.

> We already see demonstrations of JAM out-classing parachains with its
> coretime usage by combining fine-grained synchronous-composability
> alongside vast scale, performance and continuous execution. Parachains
> can't do this. But Polkadot's JAM can host it to DOT DAO's advantage, if
> it ensures $JAMKB is easily available to those who might want to
> develop.

> I therefore believe that DOT DAO should consider:
> - Creating a 1:1 representation of the $JAMKB Polkadot JAM state
>   footprint resource access token on Polkadot Hub.
> - Coming to some decision on bringing a substantial portion of this
>   token into eventual permissionless private ownership (one example
>   could be to drip-feed into an on-chain exchange).
> - Ensuring logic exists for the token to be extracted from the Hub &
>   parachains service and used within other services on Polkadot JAM.

> I also place for consideration the idea that core developers,
> particularly those centred around JAM, be granted by DOT DAO some free
> Polkadot JAM usage to encourage further and continued development,
> innovation and experimentation. This could potentially happen through
> resource-access token grants or loans.

## Conclusion

> I believe that the optimal launch of Polkadot's JAM network, and with it
> the most advantageous situation for the DOT DAO, necessitates a novel
> token $JAMKB to represent the fundamentally new resource in the Polkadot
> ecosystem of JAM's limited coherent state. Placing all $JAMKB under the
> control and ownership of the DOT DAO ensures economic alignment between
> DOT and $JAMKB, leaving the DOT DAO as the only entity capable of
> releasing $JAMKB to third-parties.

> The creation and utilisation of $JAMKB as Polkadot JAM's state token
> complements and does not prejudice the other functions of DOT including
> as a DAO token, coretime payments, collateral and staking.
