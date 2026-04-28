# Ethereum Attestation Service: in-depth analysis and self-implementation architecture

## 1. Introduction

Attempts to express verifiable claims on a blockchain — statements like "this address passed KYC", "this user attended a particular event", or "this contract has been audited" — have taken many shapes: NFTs, SBTs, DIDs, and Verifiable Credentials among them. **Ethereum Attestation Service (EAS)** is a protocol designed as a **general-purpose attestation layer** that is not tied to any particular identity model or token standard, and it is already deployed on Ethereum mainnet and the major EVM L2s at production scale.[^s01][^s20]

This report has two goals. First, it compiles EAS's protocol design — the contract structure, schemas, on-chain and off-chain attestations, resolvers, and delegated signing — from primary code and documentation. Second, it decomposes the components and operational requirements needed to build an equivalent attestation service in-house, and presents a reference architecture. The scope runs from the protocol through off-chain infrastructure, SDKs, and indexers; legal KYC regulation, the circuit details of ZK attestations, and domain-specific data modelling (finance, supply chain) are out of scope.

## 2. Background

### 2.1 Verifiable Credentials and the three-party model

The W3C Verifiable Credentials (VC) standard defines "tamper-evident credentials whose authorship can be cryptographically verified" and standardises the three-party model of Issuer → Holder → Verifier.[^s15] A Holder can generate a Verifiable Presentation from the VCs they hold and disclose it selectively to a Verifier.[^s15] On-chain attestation systems can be read as an attempt to reproduce this three-party model on the EVM: the Issuer becomes an `attester` address, the Holder becomes a `recipient` address, and the Verifier becomes a contract or off-chain service that queries an attestation UID.

### 2.2 Soulbound Tokens and the Decentralized Society

In a January 2022 essay, Vitalik Buterin borrowed the "soulbound item" metaphor from World of Warcraft to argue that non-transferable tokens are a fit for credentials and reputation: "A soulbound item, once picked up, cannot be transferred or sold to another player."[^s16] The idea was formalised the same year as the **Soulbound Token (SBT)** in "Decentralized Society: Finding Web3's Soul" by Ohlhaver, Weyl, and Buterin, who wrote that "Non-transferable 'soulbound' tokens (SBTs) representing the commitments, credentials, and affiliations of 'Souls' can encode the trust networks of the real economy to establish provenance and reputation."[^s25] On the standards track, **ERC-5192** later extended EIP-721 so that non-transferability could be declared through a minimal interface.[^s17]

### 2.3 SBT vs. attestation — a design-perspective difference

The SBT path extends NFTs and ERC-721 to issue a "token" to a user's wallet, which has the advantage of compatibility with wallet UIs and existing tooling.[^s17] The attestation path, by contrast, **does not issue a token**; it stores signed structured data (schema + payload) or distributes only a signature. The EAS README describes it as a "free and open protocol for on-chain attestations on EVM compatible blockchains" and does not require token issuance.[^s01] This difference produces trade-offs in gas cost, revocation/renewal flow, and privacy (whether an off-chain path is even possible). The Verax blog on Linea goes further and stresses the "registry" perspective, arguing that "Verax is not an EIP, a protocol, or a product, but a shareable primitive" — a framing that suggests EAS sits closer to a registry than to SBTs.[^s18]

## 3. EAS protocol structure — current state

### 3.1 Two core contracts

EAS's on-chain implementation consists of two contracts: **`SchemaRegistry`** and **`EAS`**. The former registers and looks up schemas; the latter creates and revokes attestations that reference those schemas.[^s01][^s06] The core storage struct and registration function of `SchemaRegistry` are as follows.[^s04]

```solidity
struct SchemaRecord {
    bytes32 uid;
    ISchemaResolver resolver;
    bool revocable;
    string schema;
}

function register(
    string calldata schema,
    ISchemaResolver resolver,
    bool revocable
) external returns (bytes32);
```

The `schema` field is a Solidity ABI-like declaration string, for example `address recipient, uint256 score, string country`. The UID is derived deterministically from a hash of the schema content together with the resolver and the revocable flag, so **re-registering the same schema yields the same UID**.[^s04][^s06]

### 3.2 The Attestation struct

The attestation itself is a ten-field struct defined in `Common.sol`.[^s03]

```solidity
struct Attestation {
    bytes32 uid;
    bytes32 schema;
    uint64 time;
    uint64 expirationTime;
    uint64 revocationTime;
    bytes32 refUID;
    address recipient;
    address attester;
    bool revocable;
    bytes data;
}
```

`refUID` enables chaining by referencing another attestation (for example, "B issues a recommendation based on A's credential"). `data` is a byte string `abi.encode`-ed against the types declared in the schema; off-chain indexers decode this data together with the schema string and expose it via GraphQL.[^s14]

### 3.3 On-chain vs. off-chain attestation

EAS officially supports two deployment modes.

- **On-chain**: call `EAS.attest()` to store state. Gas is required, but the record is permanent and can be queried directly from contracts.
- **Off-chain**: produce a type-aware EIP-712 signature and deliver it through off-chain media (database, IPFS, Arweave, or a link URL). If needed, only the UID can be timestamped on-chain.[^s06][^s23]

The EAS SDK encapsulates off-chain signing as `getOffchain()` + `signOffchainAttestation()`.[^s23]

```ts
const offchain = await eas.getOffchain();
const offchainAttestation = await offchain.signOffchainAttestation(
  {
    recipient: '0xFD50...2165',
    expirationTime: NO_EXPIRATION,
    time: BigInt(Math.floor(Date.now() / 1000)),
    revocable: true,
    schema: '0xb16f...c995',
    refUID: '0x000...000',
    data: encodedData,
  },
  signer,
);
```

The signature's domain separator includes `name`, `version`, `chainId`, and `verifyingContract(EAS)` to prevent cross-chain and cross-version replay.[^s23] Verification is carried out by `verifyOffchainAttestationSignature`.[^s23]

### 3.4 Delegated attestation

Delegated attestation separates the signer (attester) from the transaction sender (sponsor). The official tutorial defines it as: "Delegated Attestations enable an entity to sign an attestation while allowing another entity to cover the transaction fee."[^s13] The on-chain `attester` field is still recorded as the signer's address.[^s13] The standard path requires an **increasing nonce** per the EIP-712 spec, but proxy contracts also support "out of order" acceptance and a signature expiration time.[^s22] This is particularly useful for bulk-issuance patterns where a KYC issuer does not want to burden thousands of users with gas costs.[^s22]

### 3.5 Schema resolver — the hook mechanism

`SchemaResolver` is a hook contract that executes at the moment of attestation issuance or revocation, and is bound to a schema at registration time.[^s05] The abstract base exposes entry points such as the following.[^s05]

```solidity
function attest(Attestation calldata a) external payable onlyEAS returns (bool);
function multiAttest(Attestation[] calldata a, uint256[] calldata v) ...;
function revoke(Attestation calldata a) external payable onlyEAS returns (bool);
function multiRevoke(Attestation[] calldata a, uint256[] calldata v) ...;
function isPayable() public pure virtual returns (bool);
```

The `onlyEAS` modifier restricts callers to the EAS contract, enforcing separation of authority.[^s05] This lets arbitrary logic be bound to a schema: fee collection, whitelist checks, token distribution, external oracle calls, and so on.[^s05][^s06]

### 3.6 Deployment status

The EAS contracts are deployed on Ethereum mainnet (`EAS 0xA120...Ce587`, `SchemaRegistry 0xA7b3...7BDF`) and on many EVM chains including Optimism, Base, Arbitrum, Polygon, Scroll, zkSync, and Celo.[^s02] Notably, Optimism includes EAS as an **OP Stack predeploy**, labelled "Introduced: Bedrock; Proxied: yes", with addresses fixed to `0x4200...0021` (EAS) / `0x4200...0020` (SchemaRegistry) on both OP Mainnet and OP Sepolia.[^s07][^s08] The public indexer `easscan.org` offers per-chain GraphQL endpoints such as `https://base.easscan.org/graphql`.[^s14] The official EAS FAQ notes that the contracts have undergone a third-party Spearbit audit and that attestations themselves are immutable, and that revocation is a state transition rather than a delete: "EAS contracts have undergone a thorough audit by Spearbit… It does not delete the attestation."[^s28]

## 4. Ecosystem and use cases

### 4.1 Coinbase Verifications

In November 2023 Coinbase released "Coinbase Verifications" on the Base chain, built on EAS.[^s11] The initial schemas were **Verified Account** (boolean, always `true`) and **Verified Country** (ISO 3166-1 alpha-2 string); the **Verified Coinbase One** membership schema was added later.[^s09][^s27] On Base mainnet, the issuer (the Coinbase Attester) is `0x3574...d7EE`, and the Verified Account schema UID is `0xf8b0...0de9`.[^s10] This design — "issuer = Coinbase, user = recipient, schema = pre-registered, data = boolean/string" — is the shallowest EAS pattern, and it is a representative example of the privacy/utility trade-off: sensitive KYC information itself is not stored, only **the fact of passing** is recorded on-chain.[^s09][^s27]

### 4.2 Gitcoin Passport

Gitcoin Passport is a "Stamp"-based Sybil-resistance system that as of 2024 supports on-chain minting across multiple chains: "Gitcoin Passport creates a Stamp and score attestation, and mints them onchain to EAS and other attestation registries, depending on which network users choose."[^s12] EAS is therefore one **downstream sink** for Passport data; because scores and stamps are volatile, the documentation explicitly warns that "on-chain values are point-in-time snapshots".[^s12]

### 4.3 Optimism and public-goods voting

Optimism implemented its own AttestationStation in 2022 and used it, among other things, to select Retro Public Goods Funding (RetroPGF) citizens; in May 2023 it announced it would adopt EAS.[^s21] After the Bedrock upgrade, EAS was included as an **OP Stack predeploy**, and the OP documentation states that EAS is available at the same predeploy address on OP Mainnet and OP Sepolia (inheritance across derived OP Stack chains depends on each chain's configuration).[^s07][^s08] _(Primary sources documenting the technical specification of the original AttestationStation contract and the migration to EAS could not be obtained in this research; the report only presents the broad arc that "Optimism operated a predecessor AttestationStation and later converged on EAS" — unverified — single source.)_

### 4.4 Ecosystem scale

The official EAS ecosystem page highlights "420k+ unique attestors" and lists major integrations such as Optimism, Coinbase Verifications, Gitcoin Passport, Guild, Icebreaker, KarmaHQ, Scroll Canvas, Arbitrum Arcade, and Ceramic.[^s20] Looking at Ethereum mainnet alone, `easscan.org` at the time of access displays a total of **13,730 attestations / 372 schemas / 781 unique attesters**, suggesting a clear gap between ecosystem-wide figures and mainnet activity (a substantial portion is presumably distributed across L2s, though a quantitative per-chain breakdown is out of scope).[^s26] The two numbers do not contradict one another; they simply reflect **different scopes** (per-chain vs. ecosystem-wide).[^s20][^s26]

### 4.5 Competitors and complements

- **Verax (Linea, Consensys)** — stresses its shared-registry character, defining itself as "Verax is not an Ethereum Improvement Proposal (EIP), or a protocol, or a product, but rather a simple primitive". Its design goals are similar to EAS, but it leans more heavily on **module-centric hooks** and on **interoperation with other standards**.[^s18]
- **Sign Protocol (formerly EthSign)** — describes itself as an "omni-chain attestation protocol" and defines schema and attestation primitives similarly to EAS, while placing contract signing (EthSign) and private/ZK attestations higher up in its product line-up.[^s19][^s24] No official comparison table with EAS was identified; this report treats the two products as stacking different feature sets on top of a shared "schema + attestation" primitive.[^s19][^s24]

## 5. Analysis — EAS as a design

We summarise EAS's design choices from three angles.

**1) A minimal on-chain core, a thick off-chain indexer.** The on-chain surface of EAS comprises just three contracts: `SchemaRegistry`, `EAS`, and `SchemaResolver`. Most application semantics — score computation, stamp aggregation, profile construction — are delegated to off-chain indexers and SDKs.[^s14][^s23] This lowers the standardisation burden but makes real user-experience quality dependent on indexer quality.

**2) Deterministic schema UIDs and composability.** Because schema UIDs are derived deterministically, the same definition deployed on different chains preserves **identity at the UID level**.[^s04] The `refUID` field is the foundation for building citation graphs between attestations; the EAS ecosystem page reports uses in reputation and badge infrastructure, with Scroll Canvas reinterpreting "NFT badges as attestations" and KarmaHQ positioned as "Reputation & Governance".[^s20]

**3) Extensibility via delegation and resolvers.** Delegated attestations remove the per-user gas burden for enterprise issuers (KYC providers, game servers), and resolvers inject fees, condition checks, and external hooks on a per-schema basis. However, if a resolver calls an external contract or oracle, **re-entrancy and authorisation** become the central risks.[^s05][^s13]

The sum of these three choices converges on a positioning as a **neutral layer** that does not force any particular identity model, which aligns with Verax's explicit design goal of being a "shared primitive".[^s18]

## 6. Self-implementation architecture

Assuming an organisation that wants to implement an attestation service functionally equivalent to EAS, we propose a minimum feature set and a reference architecture.

### 6.1 Feature decomposition

A minimum implementation divides into the following nine modules.[^s01][^s04][^s05][^s13][^s14][^s23]

| # | Module | Main responsibilities |
|---|--------|-----------------------|
| M1 | Schema Registry (on-chain) | Schema registration and lookup, deterministic UIDs, resolver binding |
| M2 | Attestation Core (on-chain) | Attestation issuance and revocation, UID generation, event emission |
| M3 | Schema Resolver (optional) | Issuance/revocation hooks, fee collection, external verification |
| M4 | Off-chain Signer / Verifier | EIP-712 type definitions, domain separation, signing and verification |
| M5 | Delegated Attestation | Delegated signing, nonces, proxy, expiration time |
| M6 | Indexer | Chain event ingest, ABI-based data decoding |
| M7 | Query API | GraphQL/REST, queries over schemas, attestations, and graphs |
| M8 | Off-chain Storage (optional) | Off-chain payload storage (IPFS / Arweave / dedicated DB) |
| M9 | SDK | Language bindings (TypeScript, Go, …), signature utilities, encoders |

M1, M2, M4, M6, and M7 are the **minimum feature set**; for ecosystem-level utility, M5 and M9 are effectively required as well. M3 and M8 are added when the use case demands them.[^s05][^s12]

### 6.2 Reference architecture (system diagram)

```
                  ┌───────────────────────────────┐
                  │          Applications         │
                  │  (dApp, Wallet, Backend, BI)  │
                  └──────────────┬────────────────┘
                                 │ (SDK: TS/Go)
                                 ▼
          ┌──────────────────────────────────────────┐
          │                 SDK (M9)                 │
          │  signOffchain / attest / attestDelegated │
          │   encodeData / verifySignature / query   │
          └───────┬──────────────────────┬───────────┘
                  │                      │
     EIP-712 sign │                      │ HTTPS/GraphQL
                  │                      │
                  ▼                      ▼
      ┌─────────────────────┐   ┌─────────────────────┐
      │  Offchain Storage   │   │      Indexer        │
      │  (IPFS/Arweave/DB)  │   │   + Query API       │
      │         (M8)        │   │      (M6, M7)       │
      └─────────┬───────────┘   └─────────▲───────────┘
                │                         │ logs/traces
                │ optional UID timestamp  │
                ▼                         │
      ┌────────────────────────────────────────────────┐
      │                  L1 / L2 Chain                 │
      │                                                │
      │  ┌────────────────┐   ┌─────────────────────┐  │
      │  │ SchemaRegistry │   │        EAS          │  │
      │  │     (M1)       │◀──│  attest/revoke      │  │
      │  └────────┬───────┘   │  delegated variants │  │
      │           │           │       (M2, M5)      │  │
      │           ▼           └──────────┬──────────┘  │
      │  ┌─────────────────┐             │             │
      │  │ SchemaResolver  │◀────────────┘             │
      │  │     (M3)        │   onAttest / onRevoke     │
      │  └─────────────────┘                           │
      └────────────────────────────────────────────────┘
```

Data-flow summary:

1. The application uses the SDK to `abi.encode` a payload and produce an EIP-712 signature (M9).[^s23]
2. Depending on the issuance mode the flow branches: (a) call `attest()` directly, (b) produce only a delegated signature and let a sponsor call `attestByDelegation()`, or (c) for fully off-chain attestations, simply store the signature.[^s13][^s23]
3. The on-chain path consults `SchemaRegistry` for the resolver and executes the `onAttest` hook (M1, M3).[^s05]
4. The indexer (M6) collects `Attested` / `Revoked` events, decodes them against the schema definition, and stores them.[^s14]
5. The query API (M7) exposes GraphQL externally. Off-chain attestations can be merged into the same index based on a storage (M8) URI after hash and signature verification.[^s14][^s23]

### 6.3 Key design decisions

**Contract layer**
- **Deterministic UID**: derive the schema UID as `keccak256(schema || resolver || revocable)` to guarantee idempotent re-registration.[^s04]
- **Resolver isolation**: enforce the Checks-Effects-Interactions pattern on every external-calling resolver, and use `onlyEAS` to block direct calls.[^s05]
- **Revocation**: `revocable=false` attestations are permanently immutable; `revocable=true` attestations can be revoked only by the issuer. Delegated revocation via a proxy reuses the same signature scheme.[^s13][^s22]

**Off-chain layer**
- **EIP-712 domain**: fix the separator as `{name: "MYEAS", version: "1", chainId, verifyingContract}`. On chain- or contract-redeployment, bump `version` to prevent replay.[^s23]
- **Storage choice**: select among IPFS (content-addressed and distributed), Arweave (permanent), and an internal database (access control and deletability) based on the use case. Because EAS provides a privacy-friendly pattern in which off-chain attestations can be embedded in a URL fragment, the recommendation for PII payloads is to put only a hash on-chain and deliver the body to authorised parties alone.[^s06]
- **Indexer**: a The Graph subgraph or an in-house indexer (for example PostgreSQL with a Rust/TS worker). The EAS team operates independent GraphQL endpoints per chain (`{chain}.easscan.org/graphql`).[^s14]

**SDK layer**
- Payload-encoding utilities (schema string → ABI type vector → `encodeAbiParameters`).
- Signing utilities (EIP-712 `domain`, `types`, `message` builders).
- Query utilities (a GraphQL wrapper and a type-safe result parser).
- Verification utilities (signature recovery, chain-state lookup, revocation checks).[^s23]

### 6.4 Security and operations checklist

The following items are the minimum inspection points for an in-house implementation.[^s05][^s13][^s22][^s23]

- Fix the four fields of the EIP-712 domain separator (name, version, chainId, verifyingContract) to prevent chain- and contract-level replay.
- Nonce strategy: choose between the default incrementing nonce and the proxy variant (with expiration time) based on the user scenario.
- Prevent re-entrancy in resolvers (`ReentrancyGuard`) and cap external-call gas.
- Guard invariants on the `values` array and residual-ether refund logic for bulk issuance (`multiAttest`).
- Handle indexer reorgs: reflect events only after block finality, and account for sequencer issues on L2s.
- Synchronise off-chain signature timing (signature `time` vs. verification clock skew).
- Schema upgrade policy: because existing schemas are immutable, handle **schema versioning** through an external convention (for example, `v1`, `v2` suffixes).

### 6.5 Phased implementation roadmap (proposed)

1. **MVP** — M1 + M2 + a minimum M9 (TS SDK), with the off-chain indexer starting as a The Graph subgraph.
2. **Production readiness** — M5 (delegated signing), complete M4, and a web explorer (an M7 UI).
3. **Enterprise** — an M3 resolver library (fees, ACL, callbacks) and private attestations (M8 + key exchange).
4. **Interoperability** — cross-indexing with Verax and EAS, participation in a shared schema catalogue.[^s18]

This roadmap follows the order in which EAS itself extended its functionality and the demand order observed in adoption cases such as Gitcoin and Coinbase.[^s09][^s12][^s13]

## 7. Limitations

This report could not adequately cover the following topics.

- **The technical specification of Optimism's AttestationStation and the migration process to EAS**: we could not secure primary sources and relied on indirect citation of CoinDesk reporting and the official OP documentation.[^s07][^s21]
- **A quantitative comparison of off-chain storage trade-offs (IPFS vs. Arweave vs. RDB)**: without benchmark and cost data, we could only offer qualitative description.
- **ZK / private attestations**: although we noted that the EAS SDK supports Merkle-tree-based private data,[^s23] analysis of the circuit design or privacy attack surface was excluded.
- **Economic evaluation**: modelling per-attestation gas cost, indexer operational cost, and off-chain storage cost requires a separate study.
- **Regulation and law**: the legal interface with KYC/AML, personal information (GDPR, Korea's PIPA, and similar), and VC standard alignment is out of scope.

Meaningful future extensions include (1) a **quantitative usage comparison** of EAS, Verax, and Sign Protocol; (2) **real-time indexer quality measurement** (latency, accuracy); and (3) an **audit-issue catalogue** for a self-implementation MVP.

## Abstract

Ethereum Attestation Service (EAS) is a public-good protocol that enables schema-based, verifiable claims — attestations — to be issued, looked up, and revoked on EVM-compatible chains.[^s01] This report compiles the two core contracts (`SchemaRegistry`, `EAS`), the `Attestation` struct, the on-chain and off-chain issuance paths, EIP-712-based delegated signing, and the resolver hook, drawing on primary source code and official documentation.[^s03][^s04][^s05][^s13][^s22][^s23] It then reviews Coinbase Verifications, Gitcoin Passport, Optimism RetroPGF, and the OP Stack predeploy integration to confirm that EAS already functions as an ecosystem-scale attestation layer,[^s07][^s09][^s12][^s20] and summarises the design differences with alternatives such as Verax and Sign Protocol.[^s18][^s19][^s24] Finally it defines the nine modules needed to implement an equivalent service in-house — schema registry, attestation core, resolver, off-chain signing and verification, delegation, indexer, query API, off-chain storage, and SDK — and presents a reference system architecture, a phased implementation roadmap, and a security and operations checklist covering EIP-712 domain separation, resolver re-entrancy, and schema version management. The report concludes that EAS's choice to design the attestation service as a **neutral layer** not bound to any identity model delivers high composability and extensibility, while off-chain indexer quality and resolver security are the decisive points for an in-house implementation.
