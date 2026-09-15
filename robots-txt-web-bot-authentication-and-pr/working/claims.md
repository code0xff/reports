# Testable claims

## Introduction

- I1 (factual): robots.txt is a crawler requested-behavior protocol, not an access-control mechanism. needs RFC 9309 and an access-control primary source.
- I2 (interpretive): A site needs separate policy, identity, authentication, authorization, and enforcement layers. needs protocol comparison.

## Robots Exclusion Protocol

- R1 (technical): RFC 9309 defines matching rules, error handling, and caching for robots.txt. needs RFC 9309.
- R2 (technical): robots.txt rules are scoped to crawler identifiers and URL paths, so they cannot establish that a requester is the named bot. needs RFC 9309 plus implementation evidence.
- R3 (factual): robots.txt does not protect secrets or prevent a non-compliant client from fetching a URL. needs security/access-control source.

## Bot and agent authentication

- A1 (technical): Web Bot Auth uses HTTP Message Signatures and a public key directory to let a site verify signed automated requests. needs IETF draft and implementation documentation.
- A2 (technical): signed requests can bind identity to request components such as authority and use timestamps or expiry to reduce replay risk. needs primary protocol documentation.
- A3 (interpretive): cryptographic identity improves accountability but does not by itself grant permission to access every resource. needs protocol plus authorization source.

## AI crawler controls

- C1 (factual): major AI providers publish distinct crawler identities or controls for training, search, and user-triggered retrieval. needs official provider docs.
- C2 (factual): provider-specific robots directives are advisory signals whose effect depends on the crawler honoring them. needs official docs and independent evidence.
- C3 (interpretive): separating training, search, and agent traffic produces more useful policy than one blanket AI allow/block rule. needs provider docs and operational analysis.

## Deployment

- D1 (technical): origin enforcement should use authentication and authorization controls such as HTTP auth, tokens, mTLS, WAF rules, or rate limits for actual denial.
- D2 (technical): a practical rollout combines robots.txt for cooperative discovery control with server-side enforcement and logging for protection.
- D3 (interpretive): Web Bot Auth is most useful where operators want to admit identifiable agents selectively, while public anonymous crawling still needs conventional controls.

## Limitations

- L1 (factual): Web Bot Auth is an evolving IETF work item rather than a broadly completed Internet Standard. needs IETF status.
- L2 (interpretive): crawler names, provider policies, and platform support can change faster than standards documents. needs dated official docs.
