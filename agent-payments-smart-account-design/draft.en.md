# Smart Accounts for AI Agent Payments — Required Features and an Implementation Blueprint

## Abstract

This report walks across the primary specs and shipping products of the AI-agent payments stack to extract a checklist of capabilities that an agent-payments smart account has to expose, and then proposes a single implementation blueprint that combines them. Card networks (Visa TAP[^s01][^s02], Mastercard Agent Pay[^s03]), model providers (OpenAI + Stripe ACP[^s04][^s05]), cloud (Google AP2[^s06][^s07]), and on-chain payment standards (x402[^s08][^s09], MPP[^s11][^s12]) all converge on the same problem; the smart-account infrastructure above them (Safe[^s19], ZeroDev[^s20][^s38], Biconomy[^s22], Privy[^s23][^s24], Crossmint[^s25], Coinbase AgentKit + Spend Permissions[^s26][^s27][^s28]) increasingly converges on the same answer. From that union we extract **ten essential features**, map them onto six provider stacks, then assemble a blueprint that uses **ERC-7579 + EIP-7702 + SmartSessions + ERC-4337 Paymaster + AP2 mandate carry** as the core, with step-by-step code citations from the underlying repositories and EIPs.

## 1. Introduction — What we are solving

The scenario "an AI agent runs my checkout while I sleep" has been accepted by virtually every first-tier payments actor since 2024 — Visa shipped the Trusted Agent Protocol in October 2025[^s01], Mastercard launched Agent Pay[^s03], OpenAI shipped ChatGPT Instant Checkout on top of Stripe ACP[^s04][^s05], Google published AP2[^s06], and Coinbase shipped x402 plus AgentKit[^s08][^s26]. In every case, the **subject of the payment is the agent, not the human**.

The unit primitive of legacy payments — "EOA + one key + one signature" — has structural holes here. There is no standard slot for delegating to an agent, no representation for "this merchant, this cap, this expiry" without a fresh user signature each time, and no mechanism to bound the loss when prompt injection convinces the agent to do the wrong thing. Both academia and industry reach exactly the same conclusion[^s31][^s32][^s33].

Smart accounts are the toolbox that fills those holes. But the toolbox is large and growing fast, so the question of "which pieces do I pick" has itself become the problem. This report works it through along six axes: (a) the threat model that tells us what is missing, (b) the feature checklist that closes it, (c) the provider-by-provider mapping of who fills what, (d) the blueprint that says which standard to pick as the core and which modules to plug in, (e) the actual code flow at SDK and contract level, and (f) the trade-offs between time-to-ship, security, and multi-rail support.

## 2. Background — Reading the field

### 2.1 Card networks

Visa TAP layers three signed chunks — Agent Intent, Consumer Recognition, Payment Information — on top of card-network messages via RFC 9421 HTTP Message Signatures, with each signature "specific to the merchant and purpose, and are time bound, cannot be replayed or relayed"[^s02]. Mastercard Agent Pay solves the same problem with "Agentic Tokens" on top of card-network tokenization[^s03].

### 2.2 Model providers

OpenAI + Stripe ACP introduces the Shared Payment Token (SPT) — "Stripe issues a Shared Payment Token (SPT), a new payment primitive that lets applications like ChatGPT initiate a payment without exposing the buyer's payment credentials"[^s04]. The spec is co-maintained by OpenAI and Stripe as founding maintainers under Apache-2.0[^s05].

### 2.3 Cloud providers

Google AP2 stitches three Mandates (Intent / Cart / Payment) into a non-repudiable chain through Verifiable Credentials[^s06][^s07]. AP2 deliberately separates the protocol from the message carrier — it can ride on A2A or MCP[^s06].

### 2.4 On-chain payment standards

x402 and MPP put different abstractions on the same HTTP 402. x402 partitions by **scheme** (`exact` / `upto` / `batch-settlement`)[^s08][^s09]; MPP partitions by **intent** (`charge` / `session` / `stream`)[^s11][^s12]. The x402 `batch-settlement` EVM binding defines channelId, ChannelConfig, cumulative voucher, and the claim/settle/refund split[^s10]. Governance is split: x402 Foundation (Apache-2.0)[^s09] and IETF `draft-ryan-httpauth-payment-01` from Tempo Labs + Stripe[^s12].

### 2.5 Smart-account infrastructure

Above those rails sit three families: (a) the contract camp — Safe[^s19], ZeroDev Kernel[^s20], Biconomy Nexus[^s22]; (b) the full-stack SaaS — Privy[^s23][^s24], Crossmint[^s25], Coinbase CDP / Spend Permissions[^s27][^s28][^s36]; and (c) the adapter SDKs — Coinbase AgentKit[^s26], MetaMask Delegation Toolkit[^s17][^s18]. The three families are converging on the same abstractions (signer / policy / action etc.)[^s21][^s38][^s39], but they differ on key model, SDK texture, and multi-chain reach _(interpretive)_.

## 3. Required features — Ten essentials derived from the threat model

The ten items below are this report's synthesis of the union of primary sources. None of them is "nice to have" — each is a first-tier safety net without which the scenario does not run safely.

### F1. Delegation and session keys (scope / cap / expiry)

The agent cannot demand a master-key signature on every payment. Pre-signed permissions that say "this key may call this function on this merchant, up to this cap, until this expiry" are essential. SmartSessions, the canonical ERC-7579 module from Rhinestone and Biconomy, is the standards candidate — "SmartSession is an advanced module for ERC-7579 compatible smart accounts, enabling granular control over session keys"[^s21]. ZeroDev generalises the same idea as Permissions: a single permission can compose up to 254 policies with one signer[^s38][^s39]. MetaMask's Delegation Toolkit walks an explicit AI-agent example through ERC-7710 / 7715, requesting and approving "10 USDC per day to buy ETH for 30 days" as a single scoped permission[^s18].

### F2. Policy engine — merchant allowlists / categories / daily caps

For policies to compose inside the permission object, policy expression must be first-class. SmartSessions splits policy into three classes (UserOp validation, action-specific, ERC-1271 signature)[^s21]; Privy splits it into five (transfer limit, contract allowlist, recipient, time, action-specific) — "Policies are critical as they define the boundaries within which your agents can operate"[^s23]. Coinbase Spend Permissions encode the same abstraction as a single EIP-712 object with nine fields (account, spender, token, allowance, period, start, end, salt, extraData)[^s28].

### F3. Gas abstraction + paymaster (USDC gas)

Operations are simpler when the agent never has to hold ETH. The ERC-4337 Paymaster is "a special smart contract under the ERC-4337 specification that user operations are able to delegate the responsibility of gas fee payments to" — Pimlico's open-source ERC-20 Paymaster shows the standard pattern (oracle-priced max-fee taken at validation, refunded after)[^s30]. Circle Paymaster delivers the same abstraction as SaaS across Arbitrum, Avalanche, Base, Ethereum, OP Mainnet, Polygon, and Unichain[^s29], and the product supports both ERC-4337 smart contract accounts and EIP-7702 EOAs[^s29].

### F4. Multi-chain / multi-asset routing (intents + bridges)

The agent should express outcomes, not asset locations. x402 `batch-settlement` accepts arbitrary EVM ERC-20s[^s10], and LI.FI's 2026 "For Agents" tab plus Intents Stack aggregates 27 bridges, 31 DEXes, and 58 chains behind one API[^s37].

### F5. Key model — EOA+contract / SSS+TEE / dual-key+TEE

Where the key lives is half the threat model. Privy splits the key 2-of-2 with Shamir Secret Sharing across an Enclave share and an Auth share, reconstituting them only inside a TEE — "Keys are only stored as encrypted shares distributed across separate security boundaries"[^s24]. Crossmint co-owns the contract with an Owner Key (held by the user) and an Agent Key (lives inside a TEE) — "Each agent gets a smart contract wallet with two keys: An Owner Key that stays with the owner and an Agent Key that lives in a Trusted Execution Environment (TEE)"[^s25]. The ERC-4337 + EIP-7702 model keeps the EOA on the user's device or passkey while the contract code runs on top[^s13][^s14]. A single EOA driving payments directly is not recommended — Marino & Juels phrase the risk plainly: "doing so … could lead to formidable new vectors of AI harm"[^s31].

### F6. Identity / consumer protection (Mandate / Trusted Agent)

On the card-network side, "is this payment really an agent the user pre-authorised" must be carried in the card-network message. Visa TAP's three signed chunks[^s02] and AP2's three Mandate objects[^s06][^s07] are the card-rail and cloud variants of the same primitive. The smart account must be able to accept these objects at the HTTP layer and route them into the policy engine (F2).

### F7. Auditability — permanent logs and call context

Every payment must be auditable after the fact. On-chain, every UserOperation is permanently recorded as an EntryPoint event[^s13]. SPTs are "programmatically controlled, permissioned, and logged"[^s04]; AP2's three-Mandate chain is explicitly designed to build a "non-repudiable audit trail"[^s06]. The first-tier safety net is therefore to store (a) on-chain UserOperation events, (b) the AP2 Mandate chain, and (c) ACP receipts in one timeline _(interpretive)_[^s06][^s13].

### F8. Refund / dispute / recovery (timed withdraw / dispute / social recovery)

Long-running operation needs (a) the user able to recover the account if a key is lost and (b) funds reclaimable if the agent goes off the rails. ERC-7093 defines the standard interface for social recovery — "A standard interface for social recovery of smart contract accounts"[^s34]. x402 `batch-settlement` ships a timed-withdraw escape hatch (15 min – 30 day grace period) — if the server fails to claim, the user can reclaim the full balance[^s10]. Crossmint's Owner Key is the same idea in dual-key form[^s25].

### F9. Micropayment channels (x402 batch-settlement / MPP session)

Single-shot on-chain payment cannot carry LLM-token billing or machine-to-machine API calls. x402 `batch-settlement` solves this with single deposit + cumulative EIP-712 voucher + periodic batched claim/settle/refund[^s10]; MPP `session` solves it with unidirectional channel + cumulative commitment + close-on-highest[^s11][^s12][^s35]. The two are the same abstraction but with different traffic shape (merchant×N vs. user×1) and different governance / multi-chain texture — so the right answer is scenario-dependent.

### F10. LLM safety guards — coherence and prompt-injection defence

Contract-side guards alone are not enough. When the LLM is misled, the policy engine becomes the last line that caps the loss; but before that, (a) the cart the agent sees must itself be a signed object (AP2 Cart Mandate does exactly this[^s06][^s07]), and (b) the policy engine must be enforced **outside** the LLM. Whispers of Wealth reaches "simple adversarial prompts can reliably subvert agent behavior"[^s32]; the Grok / Bankr incident showed "The failure point was intent parsing, not reentrancy"[^s33]. Marino & Juels' threat-model paper organises both as a new category of AI harm worth technical work[^s31].

## 4. Cross-comparison — Who covers what

| Feature | Safe (+7579) | ZeroDev Kernel | Biconomy Nexus | Privy | Crossmint | Coinbase AgentKit / CDP |
|---|---|---|---|---|---|---|
| F1 Session / delegation | Safe7579 + SmartSessions[^s19][^s21] | Composable Permissions[^s20][^s38][^s39] | Nexus + SmartSessions[^s21][^s22] | Policy SaaS[^s23] | Owner / Agent Key[^s25] | Spend Permissions[^s27][^s28][^s36] |
| F2 Policy engine | Externalised to modules[^s19] | N policies + 1 signer[^s38][^s39] | Three policy classes[^s21] | Five policy types[^s23] | Merchant allowlist + cap[^s25] | EIP-712 nine-field permission[^s28] |
| F3 Paymaster | External 4337 infra | Kernel + 4337 Paymaster[^s20] | Nexus Paymaster[^s22] | Embedded gas sponsorship[^s23] | Card + USDC concurrently[^s25] | CDP Smart Wallet gas[^s36] |
| F4 Multi-chain / routing | Safe is multi-chain | 15+ EVM[^s20] | EVM-leaning[^s22] | "any chain"[^s23] | 40+ chains[^s25] | EVM + Solana, x402[^s26] |
| F5 Key model | Multisig contract | EOA + contract | EOA + contract | SSS + TEE[^s24] | Dual-key + TEE[^s25] | Delegated per WalletProvider[^s26] |
| F6 Mandate / TAP | External adapter | External adapter | External adapter | External adapter | Visa Intelligent Platform direct[^s25] | x402 + AP2 adapters[^s26] |
| F7 Audit / log | EntryPoint events | EntryPoint events | EntryPoint events | SaaS audit log[^s23] | Audit log[^s25] | EntryPoint + SDK log[^s27] |
| F8 Refund / recovery | ERC-7093 module option[^s34] | Module option[^s20] | Module option[^s22] | TEE recovery[^s24] | Owner Key reclaim[^s25] | Spend revoke[^s27] |
| F9 Micropayment channel | External adapter | External adapter | External adapter | External SDK | External adapter | x402 native[^s26] |
| F10 LLM guards | External (AP2 / Cart) | External | External | External | External | External |

The core observation is that **no single infrastructure covers all ten features by itself** _(interpretive)_[^s15]. Real-world products end up combining (a) a core account (Safe / ZeroDev / Biconomy / CDP), (b) a policy module (SmartSessions / Permissions / Spend Permissions), (c) gas sponsorship (Pimlico / Circle / CDP), (d) a payment adapter (x402 / MPP / Stripe ACP), and (e) Mandate carry (AP2 / TAP) as adapters.

## 5. Implementation blueprint — How to build it

This section assembles the ten features into a single reference implementation, stepwise.

### 5.1 Core — ERC-7579 modular account + EIP-7702 option

The core account is **ERC-7579 modular** with an optional EIP-7702 delegation path.

- ERC-7579 defines four module types (validator, executor, fallback, hook) and the standard ABI `installModule(uint256 moduleTypeId, address module, bytes initData)`[^s15].
- Adding EIP-7702 delegation lets an existing EOA temporarily inherit the same contract code at its own address, so users can migrate without changing addresses[^s14].

Concrete core choices: (a) **maximum self-control** → Safe + Safe7579 Adapter[^s19]; (b) **modularity + gas efficiency** → ZeroDev Kernel[^s20] or Biconomy Nexus[^s22].

### 5.2 Permission module — SmartSessions or a custom PolicyValidator

Session keys go into the ERC-7579 validator slot (`moduleTypeId = 1`) as a module[^s15][^s21]. The standard installation pattern (excerpted from ERC-7579) is:

```solidity
function installModule(
    uint256 moduleTypeId, // 1 = validator
    address module,       // SmartSessionValidator address
    bytes calldata initData // encoded session policy
) external;
```

The installation itself is sent as a UserOperation, which the EntryPoint authenticates with the master key[^s13]. Every subsequent UserOperation routes through the session-key validator, which (1) verifies the session-key signature, (2) checks the calldata against the encoded scope, and (3) enforces the cap and expiry[^s21][^s38].

Borrowing ZeroDev's Permissions data model, the permission object looks like[^s38][^s39]:

```text
Permission = {
  signer:   { type: "ECDSA" | "WebAuthn" | "Multisig", ... },
  policies: [
    { type: "callPolicy", allowedContracts: [...] },
    { type: "gasPolicy", maxGas: ... },
    { type: "signaturePolicy", ... },
    ... (up to ~254 policies)
  ],
  action:   { selector: 0x..., executeFn: ... },
}
```

The object is signed EIP-712 by the master key and passed in at install time.

### 5.3 Payment adapter layer — x402 + MPP, both exposed

The server should never assume a single payment standard. The blueprint puts a single middleware that accepts both x402 schemes and MPP intents in parallel.

```typescript
// pseudo-code — server side
app.use(
  paymentAdapter({
    routes: {
      "GET /llm/stream": [
        // x402 batch-settlement
        { scheme: "batch-settlement", network: "eip155:8453", token: USDC, payTo },
        // MPP session
        { intent: "session", method: "tempo", currency: PATH_USD, recipient },
      ],
    },
    facilitator: { url: "https://x402.org/facilitator" },
    channelStore: new RedisChannelStore(),
    depositMultiplier: 5n, // 3× minimum, 5× default
  }),
);
```

The verification path to `x402.org/facilitator` and the `tempo.session()` / `session.sse()` client flow are spelled out in the sister report [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/).

### 5.4 Gas sponsorship — Paymaster paths

For ERC-4337 SCA paths, route through an ERC-4337 Paymaster. Two operating modes are recommended:

- **USDC gas** — Circle Paymaster or Pimlico ERC-20 Paymaster: runs on top of `claimWithSignature` / `transferWithAuthorization`, with an oracle pricing the token[^s29][^s30].
- **Merchant sponsorship** — the facilitator (or the merchant-side channel manager) sponsors gas. The x402 docs phrase it as "deposits, batched settlements and refunds are all sponsored by the transaction's facilitator"[^s10].

For EOA-only paths (no 7702), provide gasless deposit via EIP-3009 `receiveWithAuthorization` (EIP-3009-compliant tokens) or Permit2 (any ERC-20). x402 `batch-settlement` standardises both through canonical collector contracts[^s10].

### 5.5 Identity / Mandate carry — AP2 + TAP header adapters

Above the payment adapter, add a second adapter that absorbs card-network and cloud-side authentication objects:

- **AP2 Mandate adapter** — accept Intent / Cart / Payment Mandate from HTTP headers or A2A / MCP messages and hand them to the policy engine[^s06][^s07].
- **Visa TAP adapter** — verify Agent Intent / Consumer Recognition / Payment Information under RFC 9421 HTTP Message Signatures, preserving the card-network dispute model[^s02].

Both adapters should surface the same shape to the policy engine, so the engine only has to answer "does this payment match what the user pre-authorised?"

### 5.6 Policy engine data model — signer / policy / action

The unified data model for F1 + F2:

```text
SignedPermission = EIP712({
  signer:   PublicKey | DelegationAuthority,
  policies: Policy[],  // caps, allowlists, time windows, categories, ...
  action:   { contract: address, selector: bytes4 },
  expiry:   timestamp,
  nonce:    uint256,
})
```

ERC-7710 and ERC-7715 phrase the same abstraction differently — ERC-7710 introduces "a standard way for smart contracts to delegate capabilities to other smart contracts or Externally Owned Accounts (EOAs)"[^s16], while ERC-7715 covers "dapp-to-wallet permission requests with upfront user approval"[^s18]. MetaMask Delegation Toolkit ships both behind one SDK — "Let AI agents trade on your behalf by assigning limited execution permissions via ERC-7710"[^s18].

Base Spend Permissions expresses the same primitive at the contract level — nine EIP-712 fields (account, spender, token, allowance, period, start, end, salt, extraData) define the permission[^s28], and the `SpendPermissionManager` is the only contract authorised to move user funds inside that scope[^s27].

### 5.7 Audit log / notifications / user console

(a) On-chain: persist every UserOperation as an EntryPoint event and surface them in time order[^s13]. (b) Mandate: preserve the AP2 Intent / Cart / Payment chain end-to-end[^s06]. (c) Card: store Stripe receipts and SPT usage in the same log[^s04]. The user reads a single timeline that answers "which agent / for what intent / under what permission / for how much."

### 5.8 LLM safety guards — Signed cart + external policy enforcement

The last safety net has two layers.

1. **Signed cart** — what the user sees must be what the LLM pays for. AP2 Cart Mandate gives exactly that guarantee[^s06][^s07]; ACP's SPT being "scoped to a specific merchant and cart total" enforces the same property[^s04].
2. **External policy enforcement** — the contract-side policy engine is the last line outside the LLM. Whispers of Wealth and the Grok incident both say the same thing — when the agent is misled, the contract-side policy is the boundary that caps the loss[^s32][^s33]. Marino & Juels' threat taxonomy makes this a new category of AI harm worth technical work[^s31].

## 6. Discussion — Trade-offs and priorities

### 6.1 Unidirectional channel vs. one-shot payment

(interpretive) "One agent camped on one endpoint, token-billed" fits MPP `session`[^s11][^s35]; "many agents on the same endpoint paying the same fee" fits x402 `batch-settlement`[^s10]. One-shot (`exact` / `charge`) is sufficient as a fallback for both. The blueprint recommends a payment-adapter layer that accepts all three abstractions.

### 6.2 Full-stack SaaS vs. modular contracts

Full-stack SaaS (Privy, Crossmint, Coinbase CDP) wins on time-to-ship; modular contracts (Safe, ZeroDev, Biconomy) win on module freedom and lock-in avoidance — the sister report [`smart-account-providers-deep-dive`](../smart-account-providers-deep-dive/) reaches the same conclusion. Coinbase AgentKit accepting `PrivyWalletProvider` and `ZeroDevWalletProvider` as first-class providers[^s26], and MetaMask Delegation Toolkit standardising ERC-7710 / 7715 as adapters[^s17][^s18], are signs of the two camps absorbing each other rather than one winning _(interpretive)_.

### 6.3 Card-network vs. on-chain (dispute asymmetry)

Card networks keep dispute / chargeback / KYC inside their existing perimeter[^s01][^s02][^s03]. On-chain rails have no standardised dispute path for "the user signed a permission that was then misused." AP2 leaning on Verifiable Credentials and FIDO[^s06], and ERC-7093 standardising social recovery[^s34], are partial fillers for that asymmetry.

### 6.4 Time-to-ship vs. security-first

For shipping fast, the Coinbase AgentKit + CDP Smart Wallet + Spend Permissions stack is the shortest path[^s26][^s27][^s36]. For security-first, the ERC-7579 Safe + SmartSessions + Circle Paymaster + ERC-7093 social-recovery stack is safer — the same modules verify identically across multiple accounts[^s15][^s19][^s21]. This blueprint treats the security-first path as the default and the SaaS path as a staged migration option.

## 7. Limitations

- This report reflects primary specs and SDK docs as of 20 May 2026. The standards are moving fast (especially ERC-7710 / 7715 / 7093, EIP-7702, the ERC-7579 module ecosystem, x402 V2 follow-on schemes), so specific field / function names may drift after specific version cut-overs.
- The ten-feature list is this report's synthesis. Each item has primary-source backing, but the list itself is not a published standard.
- The six-provider comparison matrix reads first-party docs and GitHub READMEs. Apples-to-apples production benchmarks (gas after paymaster, claim cadence latency, throughput) are out of scope.
- The LLM-safety guard (F10) depends heavily on external pieces. The combination of Cart Mandate, SPT, and external policy enforcement is recommended, but no mechanism today provably blocks prompt injection[^s31][^s32].
- Coinbase Spend Permissions' deliberate avoidance of ERC-4337 EntryPoint[^s27] is an intentional security choice but it costs portability across other 7579 accounts; the blueprint absorbs that with an adapter layer.
- The Pimlico ERC-20 Paymaster repo was archived on 6 November 2025 in favour of `singleton-paymaster`[^s30]; the code citation in this report is for the canonical pattern, not the live deployment recommendation.
