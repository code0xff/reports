# Claims — x402 Bazaar

## Introduction
- [ ] c01: x402 Bazaar는 x402 결제 흐름이 푼 "결제" 문제 위에 남은 "서비스 디스커버리" 문제를 푸는 디스커버리 레이어로, 2025년 9월 10일 Coinbase가 발표했다.
  - kind: factual
  - needs: Coinbase 발표 + Yahoo 보도

## Background
- [ ] c02: Bazaar는 CDP Facilitator가 정산한 x402 엔드포인트를 인덱싱하며, semantic description·payment metadata·on-chain trust signal을 함께 저장한다.
  - kind: technical
  - needs: CDP docs
- [ ] c03: Coinbase 호스팅 facilitator는 USDC on Base에 대해 facilitator fee를 부과하지 않는다고 명시한다.
  - kind: factual
  - needs: Yahoo 보도 + Coinbase docs

## Architecture
- [ ] c04: Bazaar는 별도 등록 단계가 없으며, CDP Facilitator가 해당 엔드포인트의 결제를 처음 정산(settle)할 때 카탈로그에 등재한다.
  - kind: technical
  - needs: CDP docs
- [ ] c05: 서비스가 인덱싱되려면 (a) bazaarResourceServerExtension 등록 (b) 라우트에 declareDiscoveryExtension 부착 (c) settlement payload에 paymentPayload.resource 포함 (d) 최소 1회 성공 정산이 필요하다.
  - kind: technical
  - needs: CDP docs
- [ ] c06: resource 스키마는 resource(URL), type, x402Version, accepts(payment requirements 배열), lastUpdated, metadata(description + input/output schema)를 포함한다.
  - kind: technical
  - needs: CDP docs
- [ ] c07: search의 quality ranking은 retrieval relevance(full-text + semantic hybrid)와 service quality(30일 distinct buyer, 거래량, recency, metadata 완성도)를 혼합하며, quality metric은 6시간 주기로 재계산된다.
  - kind: technical
  - needs: CDP docs
- [ ] c08: 30일간 활동이 없는 resource는 카탈로그에서 제외되지만, 호출 이력이 없는 신규 resource는 이 필터에서 면제된다.
  - kind: technical
  - needs: CDP docs

## Discovery API & MCP
- [ ] c09: catalog 엔드포인트는 GET /platform/v2/x402/discovery/resources이며 limit(기본 100, 최대 1000)과 offset 페이지네이션을 지원한다.
  - kind: technical
  - needs: CDP docs
- [ ] c10: semantic search 엔드포인트는 GET /platform/v2/x402/discovery/search이며 query(최대 400자) + network/asset/scheme/payTo/maxUsdPrice/extensions 필터를 받고 최대 20개를 반환한다.
  - kind: technical
  - needs: CDP docs
- [ ] c11: merchant 조회 엔드포인트는 GET /platform/v2/x402/discovery/merchant?payTo=<address>로 특정 지갑에 결제되는 resource를 찾는다.
  - kind: technical
  - needs: CDP docs
- [ ] c12: MCP 서버 엔드포인트는 GET /platform/v2/x402/discovery/mcp이고, search_resources(시맨틱 검색)와 proxy_tool_call(발견한 resource 호출) 두 도구를 노출한다.
  - kind: technical
  - needs: CDP docs
- [ ] c13: @x402/mcp 클라이언트는 표준 MCP 클라이언트를 감싸 결제 payload 생성과 402 retry를 자동 처리하므로 에이전트가 지갑·서명을 직접 다루지 않는다.
  - kind: technical
  - needs: CDP docs

## Code Analysis
- [ ] c14: Bazaar 디스커버리 확장은 @x402/extensions/bazaar 패키지로 제공되며, declareDiscoveryExtension은 input/inputSchema/output 예시를 라우트의 extensions에 부착한다.
  - kind: technical
  - needs: x402-foundation repo + bazaar.ts
- [ ] c15: x402-express의 paymentMiddleware는 라우트 config에 discoverable:true와 inputSchema를 두어 해당 라우트를 Bazaar에 노출한다.
  - kind: technical
  - needs: HeimLabs 튜토리얼
- [ ] c16: 구매 측 스크립트는 listCatalog로 카탈로그를 가져온 뒤 wrapFetchWithPayment(x402-fetch)로 402 자동 결제 retry를 수행한다.
  - kind: technical
  - needs: HeimLabs 튜토리얼

## Discussion
- [ ] c17: Bazaar의 trust signal(on-chain 거래 활동)은 전통적 SEO/리뷰를 대체하는 에이전트용 서비스 랭킹 기제다.
  - kind: interpretive
  - needs: Coinbase 발표 + CDP docs
- [ ] c18: Bazaar는 CDP Facilitator를 인덱싱 주체로 두기 때문에 중앙 facilitator 의존성이 생기지만, x402 표준 자체는 facilitator-agnostic이다.
  - kind: interpretive
  - needs: CDP docs + x402 spec
