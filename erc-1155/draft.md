## Abstract

ERC-1155 is Ethereum's "Multi Token Standard": a single deployed contract that can manage any combination of fungible, non-fungible, and semi-fungible tokens, each addressed by a numeric `id`.[^s01] Finalized as EIP-1155 and authored by a team led by Witek Radomski of Enjin,[^s01][^s04] it was motivated by the inefficiency of deploying a separate contract for every token type under ERC-20 and ERC-721 — a pain point acute in blockchain gaming.[^s04][^s03] Its signature features are `id`-indexed balances, batch transfers that amortize gas across many tokens, mandatory safe-transfer receiver hooks, and a compact `{id}`-templated metadata scheme.[^s01] This report walks through the standard's interface and mechanics, its security surface (receiver-hook reentrancy and all-or-nothing operator approvals), and its ecosystem standing (OpenZeppelin's reference implementation, OpenSea support), then contrasts it with ERC-20 and ERC-721. The efficiency gains are real but workload-dependent, and much of the safety and semantics are delegated to implementers rather than fixed by the standard itself.

## Introduction

ERC-1155 is a finalized Ethereum standard (EIP-1155, Standards Track: ERC, status "Final") created in 2018 by Witek Radomski, Andrew Cooke, Philippe Castonguay, James Therien, Eric Binet, and Ronan Sandford, with the initial work driven by the Enjin team.[^s01][^s04] The motivation is stated plainly in the specification: "Tokens standards like ERC-20 and ERC-721 require a separate contract to be deployed for each token type or collection."[^s04] For a blockchain game issuing thousands of item types, that model means thousands of contract deployments and thousands of separate approvals — expensive and unwieldy.[^s03]

ERC-1155's answer is a single contract that "may include any combination of fungible tokens, non-fungible tokens or other configurations."[^s01] One address can hold a fungible in-game gold token, a set of unique swords, and event tickets simultaneously, each distinguished only by its `id`. OpenZeppelin summarizes the design goal as "a fungibility-agnostic and gas-efficient token contract" that "uses a single smart contract to represent multiple tokens at once."[^s02]

## Technical Design & Interface

The central departure from earlier standards is that balances are indexed by token `id`. Where ERC-20's `balanceOf` takes only an address and ERC-721's returns a whole-collection count, ERC-1155's `balanceOf(address _owner, uint256 _id)` "retrieves the token balance of a specific token ID for a particular account address."[^s05] A companion `balanceOfBatch` returns many balances in one call.[^s01]

The required interface is compact:[^s01]

```solidity
function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;
function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data) external;
function balanceOf(address _owner, uint256 _id) external view returns (uint256);
function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external view returns (uint256[] memory);
function setApprovalForAll(address _operator, bool _approved) external;
function isApprovedForAll(address _owner, address _operator) external view returns (bool);
```

Four events make transfers and approvals observable: `TransferSingle`, `TransferBatch`, `ApprovalForAll`, and a `URI` event signalling a metadata change for a given `id`.[^s01] Contracts advertise conformance through ERC-165: the main ERC-1155 interface identifier is `0xd9b67a26`, the receiver interface is `0x4e2312e0`, and the optional metadata-URI extension is `0x0e89341c`.[^s01]

Metadata uses a template rather than per-token storage. A contract's `uri(id)` may contain the substring `{id}`, and the spec requires that "if the string `{id}` exists in any URI, clients MUST replace this with the actual token ID in hexadecimal form" — lowercase `[0-9a-f]`, no `0x` prefix, zero-padded to 64 characters.[^s01] Thus `https://token-cdn-domain/{id}.json` resolves, for token ID 314592, to a URL ending in `...0004cce0.json`.[^s01] This lets one URI serve an entire collection.

## Core Mechanics

**Batch operations.** The defining capability is `safeBatchTransferFrom`, which moves arrays of `_ids` and `_values` in a single transaction instead of one call per token.[^s01] Because the calldata, function frame, and signature verification are shared across the whole batch, per-token overhead falls. An independent benchmark measured `safeBatchTransferFrom` at 132,437 gas versus 189,861 gas for three separate `safeTransferFrom` calls — a saving that grows with batch size.[^s05]

**Safe-transfer receiver hooks.** When tokens are sent to a contract, that contract must acknowledge receipt or the transfer reverts, preventing tokens from being stranded. On a single transfer the recipient must implement `onERC1155Received` and return the magic value `0xf23a6e61`; on a batch it must implement `onERC1155BatchReceived` and return `0xbc197c81`; "if a contract returns any other value or reverts, the transfer MUST be reverted."[^s01] OpenZeppelin's implementation reverts with `ERC1155InvalidReceiver` when a recipient contract has not registered ERC-1155 awareness, which "prevents tokens from being locked forever."[^s02]

**Approvals.** ERC-1155 has no per-id allowance. Instead `setApprovalForAll` lets an owner "enable or disable approval for a third party ('operator') to manage all of the caller's tokens."[^s04] This is all-or-nothing over every `id` in the contract — convenient for marketplaces, but coarse (see Security Considerations). The gap was pronounced enough that a later proposal, ERC-5216, standardizes per-`id` allowances "complementing the all-or-nothing setApprovalForAll operator model of the base standard."[^s09]

**Minting, burning, supply.** The base standard is deliberately minimal: it does not define minting, burning, or total-supply tracking. OpenZeppelin exposes internal functions such as `_mint` for implementers to expose as they prefer, and ships `ERC1155Supply` as the extension that "adds totalSupply tracking, which is not included in the base implementation," alongside `ERC1155Burnable`, `ERC1155Pausable`, and `ERC1155URIStorage`.[^s06][^s05]

## Security Considerations

The EIP-1155 document does not carry a dedicated "Security Considerations" section, but the design has two well-understood risk surfaces.

**Receiver-hook reentrancy.** Because a transfer to a contract calls back into that contract before returning, a malicious or reentrant recipient can attempt to re-enter the token contract mid-transfer. The specification anticipates this and mandates ordering: "to make sure event order is correct in the case of valid re-entry (e.g. if a receiver contract forwards tokens on receipt) state balance and events balance MUST match before calling an external contract."[^s04] Independent technical writing warns that ERC-1155 contracts are "susceptible to re-entrancy attacks" when unsafe mint or transfer logic is added, and recommends "the checks-effects-interactions pattern and/or implementing reentrancy locks."[^s05] The base standard defines the ordering rule; robust protection is the implementer's responsibility. _(interpretive)_

**All-or-nothing operator approval.** `setApprovalForAll` grants an operator control over a user's entire balance in that contract. MetaMask notes such an approval "gives access to every NFT in that collection" and advises "revoking approvals after use."[^s10] The standards community regards this breadth as a security liability: ERC-6464 states that `setApprovalForAll` "affords the approved address control over all assets and creates an unnecessarily broad security risk that has already been exploited in a multitude of phishing attacks."[^s08] The base ERC-1155 model offers no finer granularity; ERC-5216 exists specifically to add per-`id` allowances on top.[^s09] _(interpretive)_

## Adoption & Ecosystem

ERC-1155 is well supported by mainstream tooling. OpenZeppelin Contracts ships an audited reference implementation — the base `ERC1155` contract plus `IERC1155`, `IERC1155Receiver`, and the extensions noted above — which is the de facto starting point for new deployments.[^s02][^s06] On the marketplace side, OpenSea reads ERC-1155 collections directly: "for OpenSea to pull metadata for ERC721 and ERC1155 assets, your contract will need to return a URI … OpenSea uses the tokenURI method in ERC721 and the uri method in ERC1155."[^s07] _(unverified — single source)_ OpenSea also supports on-chain metadata via base64-encoded JSON returned from `uri`, and metadata refreshes signalled through events.[^s07]

## Discussion — ERC-1155 vs ERC-20 / ERC-721

ERC-1155 is best understood as a generalization that subsumes the earlier standards' jobs. ethereum.org notes it "can do the same functions as an ERC-20 and ERC-721 token, and even both at the same time."[^s03]

**Fungibility is a matter of supply, not type.** To create a fungible set you mint many units under one `id`; to create a non-fungible you mint exactly one — "when the supply is just one, the token is essentially a non-fungible token."[^s03][^s05] This yields the "semi-fungible" pattern: a token can be interchangeable while many identical units exist and become effectively unique once supply collapses to one (the event-ticket example — identical before the show, a distinct stub after).[^s03] Importantly, "semi-fungible" is a usage pattern over the `id`/supply model, not a distinct on-chain type defined by the EIP. _(interpretive)_

**Efficiency.** Relative to deploying one ERC-721 contract per item type and transferring them one at a time, ERC-1155 shares a single contract's deployment and storage and batches transfers, lowering cost.[^s01][^s05] The magnitude is workload-dependent — larger batches save proportionally more, and a single transfer saves little — so ERC-1155 is not universally "cheaper," only cheaper at scale. _(interpretive)_

**What it gives up.** ERC-1155 does not standardize a per-`id` `name`, `symbol`, or `decimals` at the contract level the way ERC-20 does for its single token; RareSkills notes "there is no decimals with which to interpret fungible token quantities," and per-token presentation is pushed entirely into metadata.[^s05][^s01] Applications that expect ERC-20's introspective fields must layer them on themselves.

**The case against.** ERC-1155 is not a universal upgrade. Generalist commentary argues it "can be more complex to implement and manage than simpler token standards" and "may not be as widely supported by wallets, exchanges, and other infrastructure as ERC-721."[^s11] _(unverified — single source)_ For a single 1-of-1 artwork, or for a purely fungible asset, the narrower ERC-721 or ERC-20 can be simpler and more broadly compatible. The choice is therefore a trade-off — ERC-1155's flexibility and batch efficiency against added implementation complexity and uneven downstream support — not a strict dominance. _(interpretive)_

## Limitations

- **No independent adoption metrics.** Support by OpenSea (s07) and OpenZeppelin (s02, s06) is confirmed from first-party sources, but this report does not quantify on-chain deployment counts or overall ecosystem penetration, which would require indexer/analytics data not gathered here.
- **Gas figures are illustrative.** The only reproducible benchmark cited is a 3-item batch (s05). Frequently repeated "~60% savings" figures could not be traced to a primary benchmark and are deliberately excluded; treat all savings claims as workload-dependent.
- **"Final" date not independently timestamped.** The report asserts only the "Final" status shown in the EIP header (s01), not the commonly cited June 2019 finalization date.
- **Security is delegated.** The standard fixes the balance/event ordering rule (s04) but leaves reentrancy protection and approval hygiene to implementers and users; conclusions about safety are therefore about the base design, not any specific deployment.
- **Single-source ecosystem claim.** OpenSea support rests on OpenSea's own documentation (s07), a first-party but single source.
