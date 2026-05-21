# Blockchain-Based Data Integrity Verification — Technical Approaches and the Product Landscape

## Abstract

This report opens up the question "how does blockchain verify data integrity?" into two distinct sub-questions — (a) **tamper-evidence** (no one changed this since time T) and (b) **availability** (this data actually exists on the network and is retrievable). Seven technical approaches are in market: hash anchoring[^s01][^s02][^s03], Merkle proofs + transparency logs[^s06][^s07][^s08], content addressing[^s13], proof-based decentralised storage (PoRep / PoSt / SPoRA)[^s13][^s14], on-chain attestation (EAS / Sigstore Fulcio)[^s11][^s12], oracle data feeds (Chainlink Proof of Reserve)[^s09][^s10][^s25], and data-availability layers (Celestia / EigenDA)[^s15][^s16][^s21]. The report walks each approach down to primary sources and then runs nine shipping products — OpenTimestamps · Guardtime KSI · OriginStamp · Sigstore Rekor · EAS · Chainlink PoR · Filecoin / Arweave · VeChain / IBM Food Trust · Celestia / EigenDA — through the same comparison frame, surfacing where blockchain genuinely adds value and where (Sigstore Rekor being the canonical example) plain transparency logs are explicitly preferred.

## 1. Introduction — The two integrity questions

The phrase "data integrity verification" is used in industry to point at two distinct problems.

- **Tamper-evidence** — "anyone can independently verify that this data has not changed since time T." Notarisation, document timestamping, software-supply-chain attestations, and physical-supply-chain provenance all sit here.
- **Availability** — "this data actually exists on the network and can be retrieved by anyone." The canonical example is a rollup proving it has published all the transaction data it claims to have[^s15][^s21].

Blockchain becomes a candidate for both because many distributed nodes hold an identical copy and that copy is frozen by a consensus algorithm. Anchor either (a) a hash of the data or (b) the data itself into the consensus state, and a verifier can confirm integrity without trusting any one party.

The honest caveat is that blockchain is not *always* the right tool. Sigstore evaluated blockchain when designing Rekor and chose an append-only transparency log family instead[^s08]. This report keeps the seven approaches side by side because the word "integrity" hides several different mechanisms _(interpretive)_.

## 2. Technical approaches — seven patterns

### 2.1 Hash anchoring

The simplest pattern: post a SHA-256 hash of the data into a single transaction on a public chain. OpenTimestamps states the goal plainly — "OpenTimestamps aims to be a standard format for blockchain timestamping"[^s01]. The marginal cost is one transaction's fee; verification recomputes the hash and re-finds the transaction.

Anchoring per-document does not scale, so the next pattern fixes that.

### 2.2 Merkle proofs + transparency logs

Combine many hashes into a Merkle tree and post only the root. OpenTimestamps' wording: "An OpenTimestamps server provides aggregation of multiple document hashes in a Merkle tree data structure and attests only the hash of the Merkle tree root"[^s02], and the root lands in Bitcoin via "The commitment process embeds the 32-byte Merkle root hash into a Bitcoin transaction using an OP_RETURN script output"[^s03]. Each document then carries its Merkle path (the `.ots` file) from its leaf up to the rooted-on-chain hash.

The same abstraction is called a **transparency log** in software supply-chain land. Sigstore's Rekor is the canonical example — "Rekor is an append-only (sometimes called 'immutable') data log that stores signed metadata about a software artifact"[^s07]. Notably Rekor does *not* anchor in a blockchain: "When first developing Rekor, blockchain was attempted but determined to be less optimal technology. Instead, Rekor is based on transparency log technology similar to Certificate Transparency logs used for digital certificates"[^s08]. The Merkle abstraction works either way.

### 2.3 Content addressing (CIDs / IPFS)

Define the identifier of a piece of data as the **hash of the data itself**. IPFS CIDs, Git SHAs, and Sigstore OCI digests all share this primitive — "Decentralized storage solutions like IPFS, Filecoin and Arweave"[^s13]. Given an identifier, anyone can verify the bytes they received with no extra trust. Blockchains often anchor the CID or attach it to an attestation.

### 2.4 Proof-based decentralised storage — Filecoin PoRep / PoSt, Arweave SPoRA

Content addressing alone does not show that any one node is *currently storing* the data. Filecoin requires two recurring proofs — "Filecoin ensures data storage through Proof-of-Replication (PoRep) and Proof-of-Spacetime"[^s13]. PoRep proves a unique copy was created; PoSt proves the copy is still kept over time.

Arweave takes a different route: "Arweave uses a unique consensus mechanism called Succinct Proof of Random Access (SPoRA)"[^s14]. Miners must be able to access arbitrary historical data to claim a reward, which incentivises permanent storage.

### 2.5 Attestations and signed credentials

Record a **signed assertion about data** on chain. The Ethereum Attestation Service (EAS) compresses the design to two contracts — "EAS runs on two simple smart contracts: one for registering attestation Schemas and another for attesting with them"[^s11]. Schemas define the attestation format — "Schemas are essential because they ensure that attestations are consistent, readable, and verifiable"[^s12] — and the attestation itself is an EIP-712 signature. EAS supports both on-chain and off-chain modes, so sensitive data can stay off-chain while only the hash is anchored[^s24] _(access-limited)_.

This pattern is the focus of the sister report [`ethereum-attestation-service`](../ethereum-attestation-service/).

### 2.6 Oracle data feeds

Bring data from *outside* the chain *into* the chain in a way smart contracts can verify. Chainlink Proof of Reserve is the canonical example — "Chainlink Proof of Reserve provides automated, tamper-proof reserve monitoring — powering stablecoins, tokenized assets, and DeFi protocols"[^s09]. N oracle nodes pull reserve data (on-chain wallet balances, self-hosted APIs, third-party attestation reports), aggregate by consensus, and post to chain[^s25]. Updates are triggered by deviation thresholds or heartbeat intervals — "PoR feeds can trigger updates based on deviation thresholds or heartbeat intervals"[^s10].

### 2.7 Data-availability layers (Celestia · EigenDA)

Let a *light client* verify that a rollup actually published its transaction data. Celestia uses erasure-coding + DAS — "Celestia uses data availability sampling (DAS), a decentralized network that provides DA and allows anyone to efficiently verify via DAS"[^s15][^s21]. EigenDA takes a different route: "EigenDA utilizes Reed Solomon encoding that is cryptographically verified by KZG polynomial opening proofs"[^s16]. Unlike Celestia's publicly-verifiable DAS, EigenDA relies on a Data Availability Committee (DAC) trust assumption — Avail's comparison frames this as the security trade-off[^s16] _(framing comes from a Celestia/Avail-sympathetic source; this report flags that explicitly)_.

## 3. Product landscape — nine shipping products

### 3.1 OpenTimestamps — the Bitcoin-anchoring standard

Peter Todd's OpenTimestamps[^s01] sends hashes to a calendar server that Merkle-batches them and anchors them via Bitcoin OP_RETURN[^s02][^s03]. Verification needs only the `.ots` file and a Bitcoin node — no trusted third party. The calendar server pays the single transaction fee; the user pays nothing[^s01].

### 3.2 Guardtime KSI — Estonia's national integrity layer

Guardtime (Tallinn, 2007) built the Keyless Signature Infrastructure (KSI) to provide "Proof-of-Existence artifacts for digital records at large scale"[^s22]. The internal mechanism is the same Merkle-tree pattern — "Single hashes from different records in the system are combined together based on when they are created … and form a tree-shaped data encryption structure"[^s04]. Estonia has run KSI in its e-Justice, Land Register, e-Business Register, and State Gazette since 2012 — "The Estonian Ministry of Justice has been using blockchain technology solutions for better auditability and integrity purposes since 2012"[^s05]. Guardtime separately announces a Dutch government deployment for integrity assurance[^s23] _(vendor-stated)_.

### 3.3 OriginStamp — multi-chain timestamping SaaS

OriginStamp (since 2013) is a SaaS variant of OpenTimestamps. The flow is — "A SHA-256 hash is calculated locally in your browser. The file itself never leaves your device, only the hash is transmitted"[^s19]. The distinguishing piece is multi-chain anchoring (Bitcoin, Ethereum, Polygon) and GDPR-friendly certificates. OriginStamp claims — "Over 60 million proofs created since 2013"[^s20] _(vendor-stated)_.

### 3.4 Sigstore Rekor — software-supply-chain transparency log

Rekor records signed metadata about software artefacts in an append-only ledger — "Rekor's goals are to provide an immutable tamper resistant ledger of metadata generated within a software projects supply chain"[^s06]. Apache-2.0 licensed. The OCI image, npm, PyPI, and Helm ecosystems already sign and verify through Sigstore + Rekor. As discussed in §2.2, Rekor explicitly chose *not* to use a blockchain[^s08] — the canonical example of "Merkle log without consensus."

### 3.5 Ethereum Attestation Service — the de-facto on-chain attestation standard

EAS uses two contracts (Schema Registry + Attestation)[^s11]. Schemas enforce attestation shape — "Schemas are essential because they ensure that attestations are consistent, readable, and verifiable"[^s12] — and attestations are EIP-712-signed and work in both on-chain and off-chain modes[^s24]. The sister report [`ethereum-attestation-service`](../ethereum-attestation-service/) covers the contract-level mechanics.

### 3.6 Chainlink Proof of Reserve — off-chain reserves published on-chain

Stablecoins (USDC, USDT, TUSD, USDO), tokenised treasuries, wrapped BTC, ETPs, metals — many sit on Chainlink PoR[^s09]. The mechanism is — N oracle nodes collect reserve data (bank attestations, cold-wallet balances, custodian APIs), aggregate by consensus, and post to chain[^s25]. Updates fire on deviation/heartbeat triggers[^s10]; stablecoin contracts can wire those feeds into mint-pause / circuit-breaker logic[^s09].

### 3.7 Filecoin · Arweave — proof-based decentralised storage

Filecoin requires both "physically a unique copy" and "still stored over time" — PoRep + PoSt[^s13]. Arweave aims at permanent storage with a one-time payment and uses SPoRA to require that miners can access arbitrary historical data[^s14]. Both build on content addressing (CIDs) and layer proofs on top.

### 3.8 VeChain · IBM Food Trust — physical-supply-chain integrity

Bringing the physical world into a tamper-evidence record is hard. VeChain pairs IoT + RFID + blockchain — "Walmart China collaborated with VeChain … to enhance food tracking, traceability, and safety through the supply chain in 2019"[^s18]. IBM Food Trust frames the same problem as "permissioned, immutable and shared record of food provenance" — "Food Trust provides supply chain visibility and efficiency, provenance for better understanding product quality"[^s17]. Walmart, Carrefour, and Nestlé are documented participants.

### 3.9 Celestia · EigenDA — DA layers for the rollup era

Celestia: erasure-coded DAS so anyone can verify with light-client cost that data is genuinely published[^s15][^s21]. EigenDA: KZG-proved Reed-Solomon encoding + DAC for higher raw throughput at the cost of an honest-committee assumption[^s16]. Two trade-offs occupying the same slot in different ways.

## 4. Pattern × Product Matrix

| Pattern | OpenTimestamps | KSI | OriginStamp | Rekor | EAS | Chainlink PoR | Filecoin/Arweave | VeChain/Food Trust | Celestia/EigenDA |
|---|---|---|---|---|---|---|---|---|---|
| Hash anchoring | ✓[^s01] | ✓[^s22] | ✓[^s19] | ✗ (log)[^s08] | △ on-chain mode[^s11] | △ off-chain feed[^s10] | CID[^s13] | hash batch[^s17] | DA root[^s15] |
| Merkle proofs | ✓[^s02] | ✓[^s04] | ✓[^s19] | ✓[^s07] | ✓ off-chain[^s11] | — | ✓[^s13] | — | ✓[^s21] |
| Transparency log | △ | ✓ | △ | ✓[^s07] | — | — | — | — | — |
| Attestation | — | — | — | ✓ artifact[^s06] | ✓[^s11] | ✓ via DON consensus[^s25] | — | — | — |
| Storage proof | — | — | — | — | — | — | ✓ PoRep/PoSt[^s13] / SPoRA[^s14] | — | — |
| Oracle feed | — | — | — | — | — | ✓[^s09] | — | △ IoT gateway[^s18] | — |
| DA sampling | — | — | — | — | — | — | — | — | ✓ Celestia[^s15] / ✗ EigenDA[^s16] |

The clean observation: **no shipping product uses only one pattern**. EAS combines attestation with hash anchoring (on-chain) or Merkle proofs (off-chain)[^s11][^s12]. Chainlink PoR is an oracle feed whose inner aggregation step is itself an attestation pattern[^s25]. Each row in the table is a *primitive*; each product is a *composition* _(interpretive)_.

## 5. Discussion — Trade-offs

### 5.1 Tamper-evidence vs ground truth

Hash anchoring, transparency logs, and attestations all prove "the data did not change." They do not prove "the data is true." OriginStamp's own framing — "tamper-proof digital proof" — is honest about that[^s19]. Ground-truth verification still needs separate trust paths (KYC, audit, dispute) for every product in this report _(interpretive)_.

### 5.2 Is blockchain actually required? — the Sigstore answer

Sigstore explicitly chose *no* — "blockchain was attempted but determined to be less optimal technology"[^s08]. Append-only Merkle logs are sufficient; consensus overhead is unjustified for the problem of "anyone can later check that this signed metadata existed." Rekor runs at scale today without any blockchain[^s06], which is the single strongest piece of evidence in this survey that "blockchain for integrity" is not a one-size-fits-all answer.

### 5.3 Public verifiability vs private data

Public verifiability requires the data (or at least its hash) to be public. Many industrial scenarios need privacy. The market answers in three layers — (a) anchor only the hash and keep the original off-chain, (b) keep the attestation off-chain and anchor only its hash, (c) prove via ZK proof that the data satisfies some property without revealing the data itself. EAS's on/off-chain dual mode[^s11] is the canonical (a)/(b); Chainlink PoR with bank attestations is a (b) variant where the trusted issuer holds the original[^s25].

### 5.4 DA layers solve a different problem

Of the seven approaches here, DA (Celestia, EigenDA) is about *availability*, not *tamper-evidence*. The transparency-log pattern proves "this did not change"; DA proves "this exists" — that a rollup actually published its transaction data so anyone can later reconstruct state[^s15][^s21]. The word "integrity" smears these two together in market conversation; keeping them apart matters _(interpretive)_.

### 5.5 Cost · Latency · Trust models

- **Bitcoin OP_RETURN anchoring (OpenTimestamps):** ~10 min confirmation, near-zero marginal cost via Merkle batching[^s01][^s03].
- **L2 / EAS anchoring:** seconds, gas per anchor.
- **Transparency log (Rekor):** instant verification, no chain[^s08] — operationally simpler.
- **Storage proofs (Filecoin / Arweave):** cost scales with storage price, but also buys *durability* beyond tamper-evidence[^s13][^s14].
- **Oracle feeds (Chainlink PoR):** N-oracle consensus cost, configurable update cadence[^s10].

## 6. Limitations

- This report reflects primary sources and external analyses as of 21 May 2026. Filecoin PoSt parameters (window cadence, fault recovery), Arweave SPoRA economics, and EigenDA committee size / slashing rules are out of scope.
- EAS contract-level internals are deferred to the sister report [`ethereum-attestation-service`](../ethereum-attestation-service/).
- Vendor-stated numbers (e.g. OriginStamp's "60M+ proofs since 2013") are flagged in `uncertainties.md`[^s20] and not independently audited.
- The EigenDA critique is sourced from Avail's comparison piece[^s16]; this is a competitor's framing and is labelled as such in the body.
- The two senses of "integrity" (tamper-evidence vs availability) are this report's editorial framing. No single industry definition is canonical.
- ZK-proof-based data integrity (e.g. zk-MIPS, Pinocchio, zkRollup state proofs) is not covered as a separate section here; that family deserves its own report.
