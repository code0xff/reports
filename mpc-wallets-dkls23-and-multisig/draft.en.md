# MPC wallets, multisig, and DKLs23

## Abstract

An MPC wallet distributes signing power without exposing the private key as a single object. During signing, a threshold number of parties jointly compute a standard signature, so to the outside world the result still looks like a normal `ECDSA` or `EdDSA` signature, while internally the full key may never be reconstructed in one place.[^s03][^s14] Multisig is different: it enforces owner and threshold policy directly in an on-chain script or smart-account contract. Bitcoin `m-of-n` scripts and EVM smart accounts such as Safe are the canonical examples.[^s10][^s11][^s21] Both approaches reduce single points of failure, but they do so at different layers and expose different things on-chain.[^s09][^s13]

Mathematically, MPC wallets sit on three foundations. First, Shamir secret sharing lets a secret be reconstructed only from threshold-many shares while fewer than threshold shares reveal nothing about it.[^s01] Second, Schnorr-style threshold signatures are comparatively easy to reason about because linearity lets independently computed partial values combine into a standard verification equation; `FROST` is the current two-round standardization of that model.[^s02] Third, `ECDSA` is much harder than Schnorr in the threshold setting because the signature equation includes a nonce inverse and multiplication terms, so practical MPC wallets need custom threshold-ECDSA protocols and additional secure-computation machinery.[^s03][^s04][^s05]

`DKLs23` matters because it pushes threshold ECDSA closer to production reality. The paper presents maliciously secure, dishonest-majority threshold ECDSA in three rounds and uses OT-based vectorized multiplication plus preprocessing to reduce online signing cost.[^s06] But it does not make engineering disappear: public implementations still require authenticated messaging, replay protection, secure storage, and one-time handling of pre-signatures outside the core protocol.[^s17][^s20] The practical conclusion is straightforward: multisig is usually more natural for treasuries, DAOs, and explicit on-chain approval chains, while MPC wallets are more natural when EOA compatibility, consumer UX, embedded wallets, and single-signature cross-chain behavior matter most.[^s10][^s15][^s16][^s21]

## Introduction

`MPC vs multisig` is not a simple "which one is safer" question. Multisig places policy on-chain and makes execution rules visible at the script or contract layer, while MPC wallets keep the policy and coordination off-chain and only reveal a standard final signature to the chain.[^s10][^s11][^s13] Ethereum documents describe an `EOA` as an account controlled by private keys, while Safe documents describe a smart account as an account whose authorization rules are defined by on-chain logic.[^s09][^s21] For builders, the central design question is therefore: **do you want policy to be visible and enforceable on-chain, or do you want distributed control while preserving the standard account surface?**

This report answers that question at three levels. First, it explains the mathematical foundation: secret sharing, threshold signatures, the non-linearity of ECDSA, and why nonce handling is security-critical.[^s01][^s02][^s03] Second, it explains how real MPC wallets work: DKG, multi-round signing sessions, refresh, and the operational layer above the signing protocol.[^s07][^s08][^s14] Third, it explains why DKLs23 matters and when a system should prefer multisig over MPC, or vice versa.[^s06][^s10][^s17]

## 1. Mathematical foundations

### 1.1 Shamir secret sharing

The simplest entry point is `Shamir secret sharing`. Put a secret `s` in the constant term of a polynomial over a finite field,

`f(z) = s + a_1 z + ... + a_(t-1) z^(t-1)`,

and give each participant one point such as `f(1)`, `f(2)`, and so on. Threshold-many points determine the polynomial and therefore recover `f(0)=s`; fewer than threshold points do not reveal the secret.[^s01] That is the property an MPC wallet needs before signing even begins: not merely "copies in different places", but a representation in which sub-threshold leakage is not enough to reconstruct meaningful key material.[^s01]

### 1.2 Threshold signatures are easiest to understand with Schnorr

Schnorr signatures are conceptually clean. With private key `x`, public key `X = xG`, nonce `k`, commitment `R = kG`, challenge `c = H(R, X, m)`, and response `s = k + cx`, verification checks `sG = R + cX`. `FROST` standardizes a threshold version of this idea: the group signing key is Shamir-shared, participants produce signature shares in two rounds, and an aggregator combines them into a standard Schnorr signature.[^s02]

This is why Schnorr-based threshold signing is often used as the didactic starting point. Linearity means the global equation still works after local partial computation. In other words, each participant can keep its secret share private while still contributing to a final signature that verifies exactly like a single-signer signature.[^s02]

### 1.3 Why threshold ECDSA is harder

ECDSA is different. In simplified form,

`r = x-coordinate(kG)`, `s = k^(-1) (H(m) + xr)`.

The inverse `k^(-1)` and the multiplication terms make the protocol non-linear. That is why the threshold-ECDSA literature is full of custom protocols, secure multiplication, and malicious-consistency checks rather than the cleaner linear aggregation story familiar from Schnorr.[^s03][^s04][^s05] Lindell's 2017 paper showed a practical two-party construction, while the Doerner line extended the idea and emphasized that threshold ECDSA needs specialized protocol design rather than a naive lift of ordinary ECDSA.[^s03][^s04][^s05]

Operationally, this also makes nonce and session handling security-critical. Public implementations explicitly call out pre-signature freshness, secure randomness, message validation, and replay resistance as requirements outside the bare threshold protocol.[^s20]

## 2. How MPC wallets actually work

### 2.1 Distributed key generation instead of splitting an existing key

Production MPC wallets usually prefer `DKG` to "take one existing private key and split it afterwards". Gennaro et al. describe DKG as an essential component of secure threshold cryptosystems.[^s07] In a DKG flow, each participant contributes fresh randomness and commitments, and the final public key plus each party's share emerge from the protocol itself. No participant ever has to see the complete private key.[^s07]

This is an important practical distinction. If a system first creates a singleton key and only later shards it, the key existed in one place at least once. DKG removes that initialization moment.[^s07][^s14] As Dfns puts it, signing requires a threshold of shares to participate in a ceremony, but the key is never reconstructed during the process.[^s14]

### 2.2 Signing is a stateful multi-round protocol

In practice, an MPC signing session is a protocol, not a single API call. A threshold number of parties accept the request, prepare fresh nonces or preprocessed values, exchange protocol messages across one or more rounds, and finally aggregate a standard signature.[^s03][^s06][^s17] The wallet product can hide that complexity from the user, but internally this is a coordinated state machine across devices or services rather than "one private key signed the transaction".[^s14][^s20]

That difference explains why messaging and session infrastructure matter so much. If network authentication, message validation, sequencing, replay defense, or one-time pre-signature handling are weak, the protocol can fail even if the underlying math is sound.[^s20]

### 2.3 Refresh and policy sit above the core signature equation

Long-lived deployments also need `refresh`. Proactive refresh rotates the shares while keeping the public key and threshold unchanged, reducing long-term accumulation risk.[^s08] That allows the same wallet address to survive device replacement, operator rotation, or recovery exercises without changing the public-facing identity.[^s08][^s17]

Meanwhile, device binding, approval policy, email OTP login, social recovery, user authentication, and audit logging all live above the threshold-signing protocol. Coinbase Embedded Wallet and Web3Auth are useful examples: the user sees a smoother consumer experience, while the cryptographic core remains a distributed signing system under the hood.[^s15][^s16] In other words, a wallet is not "the MPC protocol"; it is an operational and UX stack built around that protocol.[^s14][^s15][^s16]

## 3. What DKLs23 changes

### 3.1 The core contribution

`DKLs23`, formally *Threshold ECDSA in Three Rounds*, presents maliciously secure threshold ECDSA with a dishonest majority in three rounds.[^s06] The paper claims UC-style security for standard threshold signing functionality under ideal commitments and two-party multiplication primitives, proposes a simple commit-release-and-complain key-generation path, and introduces a two-round vectorized multiplication protocol based on oblivious transfer for the intermediate representation of signatures.[^s06]

That matters because it attacks the main bottleneck in practical threshold ECDSA: interactive secure computation cost. By reducing communication rounds and improving the online path, DKLs23 moves threshold ECDSA closer to the latency and reliability envelope required by device-plus-server wallet architectures.[^s06][^s19]

### 3.2 Why practitioners care

Rounds are not merely a theoretical metric. Every extra round increases latency, coordination burden, and failure surface in a real wallet system. DKLs23 is therefore valuable precisely because it makes threshold ECDSA look more like a usable wallet primitive rather than a research-only construction.[^s06][^s17] Silence Laboratories' public implementation presents DKG, signing, refresh, quorum change, and migration capabilities on top of a DKLs23-based stack, which shows how the research is already being operationalized.[^s17]

This is especially relevant in consumer and embedded-wallet settings, where a phone, backend service, and recovery share may need to cooperate with minimal delay. Lower online interaction can translate directly into better UX and better availability.[^s15][^s17]

### 3.3 What DKLs23 does not solve

At the same time, DKLs23 does not eliminate the engineering problem. The low-level implementation documentation explicitly says critical pieces are still the integrator's responsibility: message serialization and validation, replay protection, signed broadcast messages, P2P encryption, secure randomness, key-share protection, pre-signature storage with one-time-use guarantees, and authorization/authentication layers.[^s20] So "uses DKLs23" does not automatically imply a complete, production-safe wallet design.[^s17][^s20]

That is the right way to interpret the paper. DKLs23 is a meaningful protocol improvement, not the end of the architecture discussion. Builders still need to decide how parties communicate, who coordinates signing, how offline clients recover, how often refresh runs, and where audit trails live.[^s17][^s20]

## 4. MPC wallets vs multisig

The core difference is whether policy lives **on-chain** or **inside the off-chain signing protocol**. Bitcoin's developer guide describes multisig scripts as `m-of-n` constructions.[^s11] Safe's documentation describes smart accounts that store owners and a threshold and execute once enough approvals are collected on-chain.[^s10][^s21] By contrast, BitGo and Dfns describe MPC wallets as distributed signing ceremonies that output a single standard signature.[^s13][^s14]

First, multisig is stronger on **on-chain enforceability and auditability**. Owner sets, thresholds, transaction execution, and sometimes modules or guards are represented directly in contract or script state.[^s10][^s21] That makes multisig a natural fit for treasuries, governance, and any environment where explicit, chain-visible approval is a feature rather than a cost.

Second, MPC wallets can be stronger on **compatibility and surface preservation**. Ethereum distinguishes EOAs from smart accounts.[^s09][^s21] Because MPC can keep the standard `ECDSA`/`EdDSA` signing surface, it is often easier to preserve EOA-like behavior across wallets, apps, and chains.[^s13][^s16] This is particularly valuable when a system wants consumer-facing simplicity or needs compatibility with services built around the assumption of ordinary account behavior.[^s15][^s16]

Third, **asset-model differences matter**. Bitcoin and other UTXO systems have a natural multisig tradition, while account-based systems such as Ethereum tend to push multisig into smart-account logic and leave MPC as an off-chain distributed-signing option.[^s11][^s18][^s21]

Fourth, **the risk surface changes**. Multisig takes on contract, module, upgrade, and guard risk.[^s21] MPC wallets take on more complex off-chain protocol, networking, session, and implementation risk.[^s06][^s20] Neither side wins in the abstract; the better choice depends on which failure modes a team can actually manage.

## 5. When to choose which

`Multisig` is usually the more natural choice for DAO treasuries, protocol-controlled funds, foundations, and other settings that benefit from explicit on-chain approval policy.[^s10][^s21] If the system wants chain-native evidence of who approved what, and if smart-account execution is acceptable, multisig is often the cleaner answer.[^s10][^s11]

`MPC wallets` are usually the more natural choice when the system wants EOA compatibility, single-signature chain interaction, multi-chain consistency, or consumer-friendly embedded-wallet onboarding.[^s09][^s13][^s15][^s16] That is why embedded-wallet vendors emphasize MPC: it lets users avoid raw seed-phrase handling while preserving a standard account experience.[^s15]

For institutional custody, the answer is usually more architectural than ideological. The decisive questions are where approval policy lives, how refresh and backup are handled, how audits are preserved, and how the wallet integrates with authentication or HSM-like controls.[^s14][^s16][^s20] In practice, hybrid designs are often sensible: MPC at the key-management layer, combined with separate policy and control layers above it.[^s14][^s17][^s21]

## Limitations

First, many operational claims in this space still come from vendor documentation. BitGo, Dfns, Coinbase, Web3Auth, Safe, and Silence Laboratories are all useful sources, but independent verification of performance and UX claims remains limited.[^s10][^s12][^s13][^s14][^s15][^s16][^s17]

Second, the mathematics of DKLs23 is publicly reviewable, but the full operational details of commercial MPC wallet deployments are often not.[^s06][^s17][^s20] A product label such as "DKLs23-based" is therefore not enough to infer end-to-end security quality.

Third, this report focuses mainly on `ECDSA` wallets in the Bitcoin/EVM context. `BLS`, `MPC + TEE` hybrids, the broader ERC-4337 smart-account ecosystem, and closed-source operational controls deserve separate study.[^s11][^s16][^s21]
