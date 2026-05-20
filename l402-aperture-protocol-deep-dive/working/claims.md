# Claims — L402 & Aperture

## Introduction
- [ ] c01: L402는 2020년 3월 Lightning Labs가 LSAT(Lightning Service Authentication Tokens)이라는 이름으로 발표한 뒤 HTTP 402 상태 코드를 직접 참조하는 이름으로 개명되었다.
  - kind: factual
  - needs: 2020 LSAT 공지 + L402 docs

## Background
- [ ] c02: L402는 (1) HTTP 402 Payment Required, (2) macaroons, (3) Lightning Network 세 컴포넌트를 결합한다.
  - kind: technical
  - needs: L402 spec + Lightning Engineering docs
- [ ] c03: Macaroons는 HMAC 체인 기반 bearer 토큰으로, attenuation(범위 축소)과 위임(delegation)을 지원한다.
  - kind: technical
  - needs: Lightning Engineering Macaroons 페이지
- [ ] c04: Lightning Network 결제는 BOLT 11 invoice로 표현되고, preimage(`r`)로 sha256(r) = payment_hash 관계가 검증된다.
  - kind: technical
  - needs: L402 spec + BOLT 11 reference

## L402 Protocol Spec
- [ ] c05: L402 챌린지는 `WWW-Authenticate: L402 macaroon="<base64>", invoice="<bolt11>"` 형식의 HTTP 헤더로 전달된다.
  - kind: technical
  - needs: L402 spec
- [ ] c06: L402 응답은 `Authorization: L402 <base64(macaroon)>:<hex(preimage)>` 형식이다.
  - kind: technical
  - needs: L402 spec
- [ ] c07: 토큰 검증은 (a) macaroon의 payment hash가 sha256(preimage)와 일치하는지 (b) macaroon HMAC 체인이 유효한지 (c) 카비엇이 통과하는지로 구성되며, 데이터베이스 조회 없이 stateless로 수행된다.
  - kind: technical
  - needs: L402 spec
- [ ] c08: 표준은 첫 챌린지에 한해 402를, 자격증명이 잘못된 후속 요청에는 401을 반환할 것을 강제한다.
  - kind: technical
  - needs: L402 spec
- [ ] c09: gRPC 환경에서는 HTTP 200으로 응답하고 `grpc-status: 402` 같은 trailing 헤더에 챌린지를 실어 보낸다.
  - kind: technical
  - needs: L402 spec
- [ ] c10: L402는 Lightning BLIP-0026로 lightning/blips 리포에 제안되어 표준 트래킹되고 있다.
  - kind: factual
  - needs: blips PR #26

## Aperture
- [ ] c11: Aperture는 MIT 라이선스 Go 구현체이며, 2026년 3월 25일 기준 v0.5.0이 pkg.go.dev에 게시되어 있다.
  - kind: factual
  - needs: pkg.go.dev
- [ ] c12: Aperture는 lnd에 직접 연결되어 invoice 발행과 결제 검증을 수행하며, etcd/Postgres/SQLite 세 백엔드를 지원한다.
  - kind: technical
  - needs: README + sample-conf.yaml
- [ ] c13: Aperture는 production에서 Lightning Loop가 사용해 왔다.
  - kind: factual
  - needs: 2020 LSAT 공지 + pkg.go.dev
- [ ] c14: Aperture의 패키지 구조는 `auth` / `proxy` / `mint` / `l402` / `challenger` / `admin` / `aperturedb`로 분리되어 있다.
  - kind: technical
  - needs: pkg.go.dev
- [ ] c15: Aperture는 token bucket 알고리즘 기반 rate limiting을 path/regex 단위로 노출하며, REST는 HTTP 429 + Retry-After, gRPC는 ResourceExhausted를 반환한다.
  - kind: technical
  - needs: README
- [ ] c16: Aperture는 옵션으로 dashboard 빌드 태그와 `aperturecli`(MCP 서버 포함)를 제공한다.
  - kind: technical
  - needs: README

## Code & SDK Ecosystem
- [ ] c17: 클라이언트 측 SDK로 Tierion의 `lsat-js`(JavaScript)와 `boltwall`(Node.js) 등이 존재한다.
  - kind: factual
  - needs: Tierion repos
- [ ] c18: 2026년 2월 Lightning Labs는 Lightning Agent Tools 패키지로 lnget · aperture skill · macaroon bakery 등 7개 스킬을 공개했다.
  - kind: factual
  - needs: 2026-02-11 블로그
- [ ] c19: Lightning Agent Tools는 Claude Code, OpenAI Codex 같은 에이전트 프레임워크와 통합되며 npx / ClawHub 경로로 배포된다.
  - kind: factual
  - needs: 2026-02-11 블로그

## Comparison
- [ ] c20: L402와 x402는 같은 HTTP 402 자리를 노리지만, L402는 Bitcoin Lightning 위에서 macaroon 토큰을 쓰고 x402는 EVM(주로 USDC) 위에서 EIP-712 서명을 쓴다.
  - kind: factual
  - needs: 양 표준 docs / ln.bot 비교 글
- [ ] c21: L402는 stateless 검증이라 facilitator/RPC 외부 의존성이 없는 반면, x402는 facilitator의 검증/정산을 통해 동작한다.
  - kind: technical
  - needs: ln.bot + L402 spec
- [ ] c22: L402는 Lightning 라우팅 수수료가 1 sat(=수 cent 미만) 수준이어서 1 sat 단위 마이크로결제가 경제적으로 성립한다.
  - kind: factual
  - needs: ln.bot 비교 글

## Discussion
- [ ] c23: L402는 USD pegged 가격이 필요한 비즈니스에는 부적합하다는 트레이드오프가 명시되어 있다.
  - kind: interpretive
  - needs: ln.bot 비교 글
- [ ] c24: L402가 stateless 검증·검열 저항 · 마이크로결제 단가에서 우위를 가지는 시나리오는 AI agent commerce와 비-EVM 환경이다.
  - kind: interpretive
  - needs: 2026-03-11 블로그
