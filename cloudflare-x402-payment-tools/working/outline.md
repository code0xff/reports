# Outline — Cloudflare x402 기반 결제 도구

1. Abstract (초록)
2. Introduction — 에이전트 결제 문제와 Cloudflare의 x402 문서 트리 개요
3. Background — x402 프로토콜: HTTP 402, exact/upto 스킴, facilitator 모델, 지원 네트워크
4. Cloudflare가 제공하는 x402 도구 상세
   4.1 HTTP 콘텐츠 과금 — x402-proxy 템플릿, x402-hono 미들웨어, Bot Management 연동
   4.2 MCP 도구 과금 — McpAgent + withX402 + paidTool
   4.3 Agents SDK에서 결제 — withX402Client, viem 지갑, human-in-the-loop 콜백
   4.4 코딩 도구 플러그인 — OpenCode 플러그인, Claude Code PostToolUse 훅
5. Analysis — 판매자/구매자 양면 아키텍처, facilitator 의존성, Coinbase 생태계와의 관계, 코드 저장소 검증
6. Discussion — 경쟁/보완 표준(AP2, ACP) 대비 위치, Cloudflare의 전략(pay-per-crawl, NET Dollar과의 연결), 채택 신호와 리스크
7. Limitations
8. References
