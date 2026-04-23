# Claims — Canton and Daml

Falsifiable statements the draft must defend. Abstract and References do not need claims.

## Introduction
- [x] c01: Canton is a privacy-preserving blockchain protocol created by Digital Asset whose smart contracts are written in the Daml programming language. — s01, s21, s35
- [x] c02: The Canton Network mainnet launched in 2024 and positions itself as a network of interoperable application chains for regulated financial assets. — s01, s02
- [x] c03: Governance of the public Canton Network is handled through the Global Synchronizer Foundation hosted under Linux Foundation Decentralized Trust, not by Digital Asset alone. — s03, s28, s36

## Background — Origins, Licensing, and Ecosystem
- [x] c04: Daml was created and open-sourced by Digital Asset around 2019, and Canton emerged later as the synchronization protocol that connects Daml-speaking participant nodes. — s19, s20, s21
- [x] c05: Daml smart contracts are in production use at regulated venues including Deutsche Börse D7, HKEX Synapse, Broadridge DLR, and Goldman Sachs GS DAP. — s11, s12, s13, s14, s15, s16, s17, s18
- [x] c06: The Daml SDK and Canton components ship under a mix of open-source and commercial / source-available licenses rather than being fully permissively open-source. — s20, s21, s31

## Architecture and Privacy Model
- [x] c07: Canton implements a need-to-know / sub-transaction privacy model in which each participant node sees only the parts of a transaction that its stakeholders are authorised to see. — s04, s05
- [x] c08: A Canton synchronizer provides BFT-ordered, final message sequencing to a set of participant nodes, and a given deployment can contain multiple synchronizers with contracts moving between them. — s05, s21, s33
- [x] c09: The Global Synchronizer is a decentralised BFT synchronizer run by multiple independent Super Validators and serves as the default synchronizer for public Canton Network traffic. — s03, s08, s28, s30
- [x] c10: Canton Coin (CC) is a utility token used to pay for traffic and features on the Global Synchronizer and to reward Super Validators and application validators. — s06, s07, s08

## Developer Perspective — Writing Daml on Canton
- [x] c11: Daml is a purely functional, Haskell-derived DSL whose core unit is a "template" with named "choices" controlled by explicitly listed parties; authorisation is enforced at the language level rather than via runtime asserts. — s22, s35
- [x] c12: The Daml SDK exposes both a gRPC Ledger API and a JSON Ledger API and provides code generators for at least TypeScript and Java clients. — s23, s24
- [x] c13: Daml Finance is a first-party open library that provides reusable templates for instruments, accounts, settlement, and lifecycling. — s09, s10
- [x] c14: Developer workflow revolves around the `daml` assistant CLI for sandbox, Daml Script tests, triggers, and DAR packaging deployed to a Canton participant node. — s25, s26
- [x] c15: Daml supports a smart-contract upgrade mechanism that lets templates evolve between DAML-LF package versions without requiring manual migration of every existing contract. — s27

## Builder Perspective — Deploying, Running, and Joining the Canton Network
- [x] c16: A builder can deploy Canton in at least three distinct topologies: fully private (single-operator Canton), consortium (multi-party shared synchronizer), and joining the public Canton Network via a participant node. — s31, s37, s30
- [x] c17: Running a Super Validator on the Canton Network requires onboarding through the Global Synchronizer Foundation and provides CC-denominated rewards in exchange for operating a BFT sequencer/mediator node. — s03, s08, s30
- [x] c18: The Canton Network targets interoperability both across Canton application chains and with external chains, but cross-chain interop is still an emerging capability rather than a fully mature production feature. — s33, s34
- [x] c19: Canton Enterprise and related managed services are a material commercial revenue line for Digital Asset, so a builder's production cost story depends on a single vendor for some production-grade features. — s31, s32
- [x] c20: Published production references (D7, HKEX Synapse, Broadridge DLR, GS DAP) show Canton/Daml has moved beyond pilots in capital-markets workflows, though most such deployments remain operator-run rather than joined to the public Canton Network. — s11, s13, s15, s17, s18, s38

## Limitations and Open Questions
- [x] c21: External peer-reviewed performance and security analysis of Canton is sparse compared to public EVM chains; most quantitative numbers (TPS, latency, cost) originate from Digital Asset or consortium partners. — s35 (sole peer-reviewed artefact) contrasted with s07, s08, s17
- [x] c22: Canton Coin tokenomics, Super Validator incentives, and feature-fee markets are still early and subject to governance changes. — s07, s08
