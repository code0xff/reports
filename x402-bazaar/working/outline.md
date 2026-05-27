# Outline — x402 Bazaar

## 1. Abstract / 초록
## 2. Introduction — x402의 디스커버리 문제
- 결제는 풀렸지만 "에이전트가 어떤 유료 서비스가 있는지 어떻게 아는가"는 미해결.
## 3. Background — Bazaar의 자리
- x402 challenge/settle 흐름 복기.
- CDP Facilitator가 인덱싱 주체가 되는 이유.
## 4. Architecture — Bazaar 동작 구조
- 4.1 정산-트리거 자동 인덱싱(no registration).
- 4.2 resource 스키마.
- 4.3 quality ranking(retrieval + service quality).
- 4.4 30일 비활성 제외 규칙.
## 5. Discovery API & MCP
- 5.1 GET /v2/x402/discovery/resources (catalog).
- 5.2 GET /v2/x402/discovery/search (semantic).
- 5.3 GET /v2/x402/discovery/merchant.
- 5.4 MCP 서버 + @x402/mcp (search_resources / proxy_tool_call).
## 6. Code Analysis — 서버·클라이언트
- 6.1 declareDiscoveryExtension / bazaarResourceServerExtension.
- 6.2 paymentMiddleware discoverable:true + inputSchema/outputSchema.
- 6.3 buyer: listCatalog + wrapFetchWithPayment.
## 7. Discussion — 설계 관찰과 한계
- SEO를 대체하는 트러스트 신호.
- 중앙 facilitator 의존성.
## 8. Limitations.
## 9. References — auto-generated.
