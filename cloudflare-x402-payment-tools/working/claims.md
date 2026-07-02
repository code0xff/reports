# Claims — Cloudflare x402 기반 결제 도구

## Introduction
- [x] c01: Cloudflare는 Agents 문서(`/agents/tools/payments/x402/`) 아래에 x402 결제 통합을 공식 문서화하고 있으며, HTTP 콘텐츠 과금·MCP 도구 과금·Agents SDK 결제·코딩 도구 플러그인 4개 하위 페이지로 구성된다.
  - kind: factual
  - needs: Cloudflare 공식 문서 페이지 + 하위 페이지 실재 확인
- [x] c02: x402는 HTTP 402 Payment Required 상태 코드를 활용해 계정·API 키 없이 HTTP 요청 단위로 스테이블코인 결제를 수행하는 개방형 프로토콜이다.
  - kind: factual
  - needs: x402 스펙/백서(x402.org, Coinbase) + 독립 보도
- [x] c03: Cloudflare는 2025년 9월 x402 지원을 발표하고 Coinbase와 함께 x402 Foundation 설립 의사를 밝혔다.
  - kind: factual
  - needs: Cloudflare 블로그 + 독립 보도(2개 이상)

## Background — x402 프로토콜
- [x] c04: x402 결제 흐름은 클라이언트(지갑 보유)–리소스 서버–facilitator 3자 구조이며, facilitator는 자금을 보관하지 않고 검증·온체인 제출만 담당한다.
  - kind: technical
  - needs: x402 스펙 또는 Cloudflare/Coinbase 공식 문서
- [x] c05: x402에는 exact(고정 금액, 다중 체인 지원)와 upto(최대 금액 승인 후 동적 정산, EVM 한정) 두 가지 결제 스킴이 문서화되어 있다.
  - kind: technical
  - needs: Cloudflare 문서 + x402 스펙 저장소
- [x] c06: Cloudflare 문서 기준 지원 네트워크는 Base, Ethereum, Polygon, Optimism, Arbitrum, Avalanche, Solana, Aptos, Stellar, Sui 등이며 테스트는 base-sepolia를 사용한다.
  - kind: factual
  - needs: Cloudflare 문서 + x402 생태계 문서 교차 확인
- [x] c07: 기본 facilitator 엔드포인트는 `https://x402.org/facilitator`로 Coinbase가 운영하며, 결제 검증(verify)과 정산(settle)을 대행한다.
  - kind: technical
  - needs: Cloudflare 문서 + x402.org/Coinbase 문서

## Cloudflare 도구 상세 — HTTP 콘텐츠 과금
- [x] c08: x402-proxy 템플릿은 임의의 HTTP 백엔드 앞단에 배치되는 Cloudflare Worker로, wrangler.jsonc의 PAY_TO·NETWORK·PROTECTED_PATTERNS 변수로 경로별 가격을 설정한다.
  - kind: technical
  - needs: Cloudflare 문서 + 템플릿 저장소 코드
- [x] c09: 커스텀 통합은 x402-hono 패키지의 paymentMiddleware를 Hono 기반 Worker에 삽입하는 방식이며, 지갑 주소·경로별 가격·facilitator URL 세 요소를 설정한다.
  - kind: technical
  - needs: Cloudflare 문서 + x402-hono 패키지(npm/GitHub)
- [x] c10: x402-proxy는 Cloudflare Bot Management의 bot score 임계값과 연동해 봇 트래픽에만 선별적으로 과금할 수 있다.
  - kind: technical
  - needs: Cloudflare 문서 + 템플릿 코드

## Cloudflare 도구 상세 — MCP 도구 과금
- [x] c11: Agents SDK의 `withX402(server, config)`로 McpServer를 감싸면 `paidTool`이 추가되며, 이는 기존 `tool`의 드롭인 대체로 도구 호출 단위 USD 가격을 지정한다.
  - kind: technical
  - needs: Cloudflare 문서 + cloudflare/agents 저장소 소스 코드
- [x] c12: 무결제 호출 시 서버는 402와 결제 요구사항을 반환하고, 클라이언트가 결제 증빙을 첨부해 재시도하면 결과를 반환한다. 무료·유료 도구를 한 서버에 혼합할 수 있다.
  - kind: technical
  - needs: Cloudflare 문서 + 예제 코드(examples/x402-mcp)

## Cloudflare 도구 상세 — Agents SDK 결제(구매자 측)
- [x] c13: `withX402Client`는 MCP 클라이언트를 감싸 402 응답 시 자동 결제를 수행하며, viem의 privateKeyToAccount로 만든 지갑 계정과 네트워크를 설정한다.
  - kind: technical
  - needs: Cloudflare 문서 + agents 패키지 소스
- [x] c14: callTool의 첫 인자로 결제 승인 콜백(onPaymentRequired)을 전달해 human-in-the-loop 승인을 구현하고, null이면 에이전트가 자동 결제한다.
  - kind: technical
  - needs: Cloudflare 문서 + 소스 코드
- [x] c15: 개인키는 .dev.vars 또는 wrangler secret으로 관리하도록 안내되며, Durable Objects 기반 Agent 클래스 초기화 시 계정을 생성한다.
  - kind: technical
  - needs: Cloudflare 문서

## Cloudflare 도구 상세 — 코딩 도구 플러그인
- [x] c16: OpenCode용 x402 플러그인은 @x402/fetch·@x402/evm·viem을 사용해 webfetch가 402를 반환할 때 결제 후 재요청하는 커스텀 도구를 등록한다.
  - kind: technical
  - needs: Cloudflare 문서 + @x402/fetch 패키지 확인
- [x] c17: Claude Code용 통합은 PostToolUse 훅(WebFetch matcher)으로 402 응답을 감지해 결제 후 additionalContext로 결과를 주입하는 스크립트 방식이다.
  - kind: technical
  - needs: Cloudflare 문서
- [x] c18: 두 플러그인 모두 X402_PRIVATE_KEY 환경 변수로 지갑을 구성하며, 결제 전 인간 승인 흐름은 개발자가 직접 구현해야 하는 placeholder로 남아 있다.
  - kind: interpretive
  - needs: Cloudflare 문서 코드 스니펫

## Analysis
- [x] c19: Cloudflare의 x402 도구는 판매자 측(과금: proxy, hono, paidTool)과 구매자 측(지불: withX402Client, 코딩 플러그인)을 모두 커버하는 양면 툴킷이다.
  - kind: interpretive
  - needs: 문서 전체 구조 분석
- [x] c20: cloudflare/agents 저장소에 agents/x402 모듈과 x402-mcp 예제가 실제로 존재하고 npm agents 패키지로 배포된다.
  - kind: technical
  - needs: GitHub 저장소 + npm 레지스트리
- [x] c21: x402 npm 생태계(x402-hono, @x402/fetch, @x402/evm)는 Coinbase가 주도하는 coinbase/x402 모노레포에서 배포되며, Cloudflare는 이를 소비하는 형태다.
  - kind: technical
  - needs: npm 메타데이터 + coinbase/x402 저장소
- [x] c22: Cloudflare는 x402와 별도로 자체 결제 실험(pay per crawl, NET Dollar 스테이블코인 발표)을 진행 중이며, x402 지원은 그 전략의 일부다.
  - kind: interpretive
  - needs: Cloudflare 발표 + 독립 보도

## Discussion
- [x] c23: x402는 Google AP2의 결제 레일 중 하나로 편입되는 등 타 에이전트 결제 표준과 경쟁·보완 관계에 있다.
  - kind: interpretive
  - needs: AP2 발표 자료 + 독립 분석
- [x] c24: x402 채택은 초기 단계로, 거래량·실사용 지표는 급증했으나 절대 규모는 작고 스팸/투기 토큰 비중 등 한계가 지적된다.
  - kind: interpretive
  - needs: 온체인 데이터 보도 + 비판적 분석 소스
- [x] c25: facilitator 중앙화(Coinbase CDP 의존)와 결제 보안(개인키를 에이전트에 위임)은 문서화된 주요 리스크다.
  - kind: interpretive
  - needs: 독립 분석/보안 리뷰 + 기존 x402 보고서(five-attacks-on-x402)
