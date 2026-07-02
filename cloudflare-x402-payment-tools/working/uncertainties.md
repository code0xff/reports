# Uncertainties

- **Monetization Gateway의 facilitator 구조**: Cloudflare가 엣지에서 "payment verification and enforcement"를 수행한다고 밝혔으나(s07), 이것이 Cloudflare 자체 facilitator 운영을 의미하는지, 기존 x402.org facilitator 위임인지 문서상 불명확. 제품은 아직 waitlist 단계 — vendor-stated.
- **Monetization Gateway 자체가 2026-07-01 발표된 신제품**: 세부 스펙(지원 토큰 "Open USD" 포함)이 변경될 가능성 높음.
- **deferred 결제 스킴**: 2025-09 발표(s06) 시점 "제안" 단계였고, x402-foundation 모노레포에는 batch-settlement 스킴이 문서화됨(s15). deferred가 표준 스킴으로 병합됐는지 여부는 미확인 — 발표 당시 표현까지만 인용.
- **채택 지표의 질**: Chainalysis(s10)조차 "sustainable adoption인지 다른 사용자 코호트인지 불확실"이라고 유보. Q4 2025 급증은 PING 밈코인 주도.
- **문서 경로 이동**: 검색 결과에 `agents/agentic-payments/x402/` 경로도 나타남 — Cloudflare 문서 트리가 최근 재편된 것으로 보이며 `agents/tools/payments/x402/`가 현재 canonical.
- **x402-hono(v1.x) vs @x402/hono(v2.x)**: Cloudflare 문서는 x402-hono를 안내하지만 모노레포에는 @x402/* v2 계열이 존재. 버전 전환기의 문서 지연 가능성.
