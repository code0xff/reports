# Cloudflare x402 기반 결제 도구

## 초록

Cloudflare는 개발자 문서 `/agents/tools/payments/x402/` 트리 아래에 x402 프로토콜 기반 에이전트 결제 도구를 공식 문서화하고 있다. 본 보고서는 해당 문서와 공개 코드 저장소, 독립 보도를 교차 검증하여 Cloudflare가 제공하는 x402 도구 전체를 목록화하고 분석한다. Cloudflare의 x402 툴킷은 판매자 측 과금 도구(x402-proxy Worker 템플릿, x402-hono 미들웨어, MCP 서버용 `withX402`/`paidTool`)와 구매자 측 지불 도구(Agents SDK의 `withX402Client`, OpenCode 플러그인, Claude Code 훅)를 모두 포괄하는 양면 구조다. 여기에 2025년 9월 Coinbase와의 x402 Foundation 공동 설립 발표, 자체 스테이블코인 NET Dollar, 2026년 7월 발표된 Monetization Gateway가 더해져, x402는 Cloudflare의 에이전트 경제 전략의 결제 계층으로 자리잡고 있다. 다만 기본 facilitator의 Coinbase 의존, 에이전트에 개인키를 위임하는 보안 모델, 밈코인 주도로 부풀려진 초기 채택 지표는 문서화된 한계로 남아 있다.

## 1. 서론

AI 에이전트가 웹에서 자율적으로 자원을 소비하려면 계정 생성·API 키 발급·구독 계약이라는 인간 중심 결제 관문이 병목이 된다. x402는 HTTP 표준에 예약만 되어 있던 `402 Payment Required` 상태 코드를 되살려, 계정이나 세션 토큰 없이 요청 단위로 스테이블코인을 지불하는 개방형 프로토콜이다[^s01][^s15]. Cloudflare는 2025년 9월 23일 x402 지원을 발표하면서 Coinbase와 함께 x402 Foundation 설립 의사를 밝혔고[^s06][^s09], 이후 Agents SDK와 개발자 문서에 x402 통합을 단계적으로 확장해 왔다.

본 보고서는 사용자가 지정한 Cloudflare 공식 문서 경로(`developers.cloudflare.com/agents/tools/payments/x402/`)를 1차 소스로 삼아, 그 아래 문서화된 네 가지 도구 묶음 — HTTP 콘텐츠 과금, MCP 도구 과금, Agents SDK 결제, 코딩 도구 플러그인 — 을 상세히 기술한다[^s01]. 각 도구는 GitHub의 실제 소스 코드(cloudflare/agents, cloudflare/templates, x402-foundation/x402)와 npm 레지스트리 메타데이터로 실재를 검증했다[^s12][^s14][^s16].

## 2. 배경: x402 프로토콜

x402의 결제 흐름은 3자 구조다. 클라이언트는 암호화폐 지갑만 있으면 되고 "관리할 계정, 자격증명, 세션 토큰이 없다"[^s01]. 서버(판매자)는 보호된 자원에 대한 요청에 402 응답과 결제 요구사항을 반환하고, 클라이언트가 서명된 결제 페이로드를 첨부해 재시도하면 검증 후 자원을 전달한다[^s01][^s15]. 검증(verify)과 온체인 정산(settle)은 facilitator라는 제3자 서비스에 위임할 수 있는데, Cloudflare 문서가 안내하는 기본 facilitator는 Coinbase가 운영하는 `https://x402.org/facilitator`이며 자금을 보관하지 않고 검증과 블록체인 제출만 수행한다[^s01][^s19].

Cloudflare 문서는 두 가지 결제 스킴을 기술한다. `exact`는 고정 금액 — 통상 EVM 체인의 ERC-20 USDC — 을 판매자 주소로 이전하며 EVM, Solana, Aptos, Stellar, Hedera, Sui를 지원한다[^s01][^s15]. `upto`는 최대 금액을 승인한 뒤 실제 사용량만큼 동적으로 정산하며 EVM에 한정된다[^s01][^s15]. 표준 모노레포에는 이 둘에 더해 에스크로와 오프체인 바우처로 소액 결제를 묶어 온체인 정산하는 `batch-settlement` 스킴(EVM)도 문서화되어 있다[^s15]. Cloudflare 문서 기준 지원 네트워크는 Base, Ethereum, Polygon, Optimism, Arbitrum, Avalanche, Solana, Aptos, Stellar, Sui 등이고, 테스트는 `base-sepolia` 테스트넷과 Circle faucet의 테스트 USDC를 사용한다[^s01][^s03]. 표준 자체는 x402-foundation 조직의 모노레포에서 관리되며, 스펙 v1/v2와 다국어 SDK(@x402/core, @x402/evm, @x402/fetch, @x402/hono, @x402/mcp 등)가 여기서 배포된다[^s15].

## 3. Cloudflare가 제공하는 x402 도구

Cloudflare 문서 트리는 네 개의 하위 페이지로 구성된다: HTTP 콘텐츠 과금, MCP 도구 호출 과금, Agents SDK에서의 지불, 코딩 도구 플러그인[^s01].

### 3.1 HTTP 콘텐츠 과금 — x402-proxy 템플릿과 x402-hono

판매자 측 첫 번째 도구는 **x402-proxy 템플릿**으로, "임의의 HTTP 백엔드 앞단에 배치되는 Cloudflare Worker"다[^s02]. `wrangler.jsonc`에서 수취 지갑 주소(`PAY_TO`), 네트워크(`NETWORK`, 테스트는 base-sepolia, 프로덕션은 base), 보호 경로와 가격(`PROTECTED_PATTERNS`, 예: `/api/premium/*`에 $0.10)을 선언하면 보호 경로 요청에 402와 결제 지시가 반환되고, 결제 후 프록시가 검증을 거쳐 오리진으로 요청을 전달한다[^s02]. 실제 템플릿은 cloudflare/templates 저장소의 `x402-proxy-template` 디렉터리에 존재하며, x402 결제와 무상태 쿠키(JWT) 인증을 결합한 투명 프록시로 구현되어 있다[^s14].

더 세밀한 제어가 필요하면 **x402-hono** 패키지의 `paymentMiddleware`를 Hono 기반 Worker에 직접 삽입한다. 미들웨어는 지갑 주소, 경로별 가격 설정, facilitator 엔드포인트 세 요소를 받는다[^s02]. x402-hono는 x402-foundation/x402 모노레포에서 배포되는 npm 패키지로, 템플릿 소스(`src/auth.ts`)에서도 동일한 import가 확인된다[^s14][^s16].

주목할 만한 고급 기능은 **Bot Management 연동**이다. `bot_score_threshold` 설정으로 인간 사용자와 자동화 크롤러를 구분해 봇 트래픽에만 선별 과금할 수 있으며[^s02], 템플릿에는 Google, Microsoft, OpenAI, Anthropic, Perplexity, Meta 등 AI 운영사의 봇 식별자 레지스트리가 포함되어 있다[^s14]. 이는 Cloudflare의 pay-per-crawl(AI 크롤러 과금) 전략과 직접 연결되는 지점이다[^s06].

### 3.2 MCP 도구 과금 — withX402와 paidTool

MCP(Model Context Protocol) 서버 운영자를 위한 도구는 Agents SDK의 `agents/x402` 모듈이다. `withX402(new McpServer({...}), X402_CONFIG)`로 서버를 감싸면 `paidTool` 메서드가 추가되는데, 문서는 이를 "기존 `tool`의 드롭인 대체(drop-in replacement)"로 설명한다[^s03][^s13]. `X402Config`는 네트워크(base/base-sepolia), 수취 지갑 주소, facilitator URL 세 필드를 받고, `paidTool`은 도구 이름·설명·USD 가격·입력 스키마·핸들러를 받아 호출 단위 과금을 선언한다(예: 제곱 계산 도구에 $0.01)[^s03].

무결제 호출 시 서버는 402와 결제 요구사항을 반환하고, 클라이언트가 x402로 결제한 뒤 증빙을 첨부해 재시도하면 결과를 반환한다. 무료 `tool`과 유료 `paidTool`을 한 서버에 혼합할 수 있다[^s03]. 완전한 동작 예제는 cloudflare/agents 저장소의 `examples/x402-mcp`에 공개되어 있으며[^s03][^s13], 같은 저장소의 `examples/x402`는 MCP 래퍼 없이 `@x402/*` 라이브러리로 HTTP 엔드포인트를 직접 과금하는 대조 예제다[^s13].

### 3.3 Agents SDK에서 지불 — withX402Client

구매자 측 도구는 `withX402Client`다. Durable Objects 기반 Agent 클래스 안에서 MCP 클라이언트를 감싸면 402 응답을 만났을 때 결제를 자동 처리한다[^s04]. 지갑은 viem의 `privateKeyToAccount(this.env.MY_PRIVATE_KEY)`로 구성하며, 개인키는 로컬에서는 `.dev.vars`, 프로덕션에서는 `wrangler secret put`으로 관리하도록 안내된다[^s04]. 실제 구현은 cloudflare/agents의 `packages/agents/src/mcp/x402.ts`에 있으며, `confirmationCallback?: (payment: PaymentRequirements[]) => Promise<boolean>` 시그니처가 확인된다[^s12].

결제 승인은 human-in-the-loop 패턴이다. `callTool`의 첫 번째 인자로 승인 콜백을 전달하는데, 문서는 "null로 설정하면 에이전트가 자동으로 지불한다"고 명시한다[^s04]. 개발자는 `onPaymentRequired(paymentRequirements)`를 구현해 불리언 프로미스를 반환하는 승인 워크플로를 정의할 수 있다[^s04][^s12].

### 3.4 코딩 도구 플러그인 — OpenCode와 Claude Code

마지막 페이지는 AI 코딩 도구가 유료 리소스를 만났을 때 결제하는 플러그인을 다룬다. **OpenCode 플러그인**은 `.opencode/plugins/x402-payment.ts`에 `@x402/fetch`, `@x402/evm`, viem 세 패키지로 커스텀 도구를 등록하며, 도구 설명은 "webfetch가 402를 반환할 때 x402 결제로 URL을 가져오라"고 되어 있다[^s05]. **Claude Code 통합**은 `.claude/scripts/handle-x402.mjs` 스크립트를 `.claude/settings.json`의 PostToolUse 훅(WebFetch matcher)에 등록하는 방식으로, 402 응답을 감지하면 결제 후 재시도하고 결과를 `additionalContext`로 주입한다[^s05].

두 방식 모두 `X402_PRIVATE_KEY` 환경 변수로 지갑을 구성한다. 흥미로운 점은 결제 전 승인 로직이 문서 코드에 `// Your human-in-the-loop confirmation flow...`라는 placeholder 주석으로만 남아 있어, 지출 통제의 실질 구현이 개발자 몫으로 넘겨져 있다는 것이다[^s05].

## 4. 분석

### 4.1 양면 툴킷 구조

Cloudflare의 x402 도구를 역할 축으로 정리하면 판매자 측(수익화)과 구매자 측(지불)의 양면 구조가 드러난다. 판매자 측은 x402-proxy 템플릿과 x402-hono(HTTP 자원), `withX402`/`paidTool`(MCP 도구)이고, 구매자 측은 `withX402Client`(에이전트)와 OpenCode/Claude Code 플러그인(코딩 도구)이다[^s01][^s02][^s03][^s04][^s05]. 하나의 벤더 문서 트리가 결제의 수요·공급 양쪽 SDK를 모두 제공하는 것은, 에이전트 간 상거래(M2M)의 폐루프를 자사 플랫폼(Workers, Durable Objects, Bot Management) 위에서 완성하려는 설계로 읽힌다 _(해석)_.

### 4.2 생태계 내 위치: 소비자이자 공동 설계자

npm 메타데이터 기준 x402-hono, @x402/fetch, @x402/evm은 Coinbase 소속 개발자(x402 창시자 Erik Reppel 포함)가 유지·배포하고, 저장소는 x402-foundation/x402 모노레포를 가리킨다[^s16]. 즉 Cloudflare는 프로토콜 계층 패키지의 소비자다. 동시에 GitHub API 기준 coinbase/x402가 x402-foundation/x402의 포크로 전환된 것이 확인되는데[^s15][^s16], 이는 2025년 9월 발표된 재단 이관 — "인터넷 핵심 프로토콜은 독립 거버넌스로 움직여야 한다"는 Cloudflare CEO Matthew Prince의 발언[^s09] — 이 코드 거버넌스 수준에서 실행됐음을 보여준다. Cloudflare 자체 기여로는 암호학적 핸드셰이크와 정산을 분리해 배치 처리와 전통 결제 수단을 수용하는 deferred 결제 스킴 제안이 있으며, 이는 pay-per-crawl 베타의 일 단위 합산 청구에 통합될 예정이라고 발표됐다[^s06].

### 4.3 문서 트리 밖의 연장선: Monetization Gateway와 NET Dollar

x402 문서 트리는 Cloudflare 결제 전략의 일부다. 2025년 9월 25일 Cloudflare는 에이전트 웹을 위한 달러 담보 스테이블코인 **NET Dollar**를 발표하면서 AP2와 x402 표준 기여를 함께 언급했고[^s11], 2026년 7월 1일에는 **Monetization Gateway**를 공개했다. 이 게이트웨이는 "Cloudflare가 보호하는 모든 자산 — 웹 페이지, 데이터셋, API, MCP 도구 — 에 과금"할 수 있게 하고 결제는 x402로 정산되며, 출시 시점에는 Open USD와 USDC 등 스테이블코인만 지원하고 대기자 명단 단계다[^s07]. 독립 보도는 결제 검증이 오리진 도달 전 엣지에서 수행된다는 점과, Amazon Bedrock AgentCore(Base 체인 x402 USDC) 등 경쟁 구도를 함께 전한다[^s08]. pay-per-crawl이 AI 크롤러 과금이라는 단일 시나리오였다면, Monetization Gateway는 이를 범용 자원 수익화로 확장한 것이다[^s07].

## 5. 논의

### 5.1 표준 경쟁 속의 x402

x402는 고립된 표준이 아니다. Google의 Agent Payments Protocol(AP2)은 카드·계좌이체 등 전통 레일과 함께 "x402 확장을 통한 스테이블코인·암호화폐"를 지원한다고 명시하며, Google은 Coinbase·Ethereum Foundation 등과 A2A x402 확장을 별도 저장소로 공개했다[^s17][^s18]. 즉 x402는 AP2와 경쟁하는 동시에 그 암호화폐 결제 레일로 편입되는 보완 관계다. Cloudflare가 NET Dollar 발표에서 AP2와 x402를 나란히 언급한 것도 같은 맥락이다[^s11].

### 5.2 채택 신호와 그 한계

온체인 데이터는 급성장과 거품을 동시에 보여준다. Chainalysis에 따르면 Base 체인의 x402 거래는 2025년 중반 사실상 0에서 2026년 1분기까지 누적 1억 건을 돌파했으나, 2025년 4분기 급증분의 상당 부분은 "1 USDC를 내면 토큰을 민팅해 주는" 밈코인 PING이 주도했고(첫 달에만 15만 건 이상), 이후 투기 활동이 식으며 성장세가 완만해졌다[^s10]. 같은 분석은 1달러 이상 거래 비중이 49%에서 95%로 늘어난 점, 테스터→결제자 전환율 4배 개선 등을 실사용 신호로 제시하면서도 "지속 가능한 채택인지 다른 사용자 코호트인지는 지켜봐야 한다"고 유보한다[^s10].

더 비판적인 시각도 있다. CoinDesk가 2026년 3월 전한 Artemis 분석에 따르면 x402의 일일 결제 규모는 약 2만 8천 달러, 일일 거래 약 13만 1천 건, 평균 결제액 0.20달러 수준에 그치고 관측 활동의 약 절반이 자전거래성 인위적 활동으로 추정되어, 약 70억 달러로 평가되는 생태계 밸류에이션과 대비된다 — "에이전트 결제 붐은 아직 대부분 신기루"라는 평가다[^s21]. x402 창시자 Erik Reppel조차 "팀들이 테스트에서 프로덕션으로 이동하면 이 비율은 자연히 낮아질 것"이라고 인정했고, 기사는 "x402가 겨냥하는 판매자가 아직 드물다"고 지적한다[^s21]. Cloudflare의 Monetization Gateway 같은 판매자 측 도구는 정확히 이 공급 부족을 겨냥한 것으로 볼 수 있다 _(해석)_.

### 5.3 리스크: facilitator 집중과 키 위임

보안 관점의 한계도 문서화되어 있다. 보안 감사 기업 Halborn은 facilitator가 검증·정산을 중앙에서 처리하는 구조적 집중 위험을 지적하며 복수 facilitator 또는 직접 온체인 검증을 권고하고, 에이전트에는 지출 한도·수취인 허용목록·고액 거래 인간 승인을 요구한다[^s19]. 학술 연구도 같은 방향이다. arXiv에 공개된 "Five Attacks on x402"는 동기식 HTTP 승인과 비동기 블록체인 정산의 결합이 "기존 웹·온체인 결제에 없던 교차 계층 공격 표면"을 만든다는 것을 Base Sepolia와 실제 엔드포인트에서 재현 가능한 다섯 가지 공격으로 입증했다[^s20]. Cloudflare 도구의 설계 — `withX402Client`의 승인 콜백을 null로 두면 자동 결제, 코딩 플러그인의 승인 흐름 placeholder — 는 이런 통제의 구현 책임이 최종 개발자에게 있음을 보여준다[^s04][^s05].

## 6. 한계

본 보고서의 한계는 다음과 같다. 첫째, Monetization Gateway는 조사 시점 기준 발표 하루 뒤의 waitlist 단계 제품으로, 지원 토큰("Open USD" 포함)과 facilitator 구조 등 세부가 벤더 발표에만 의존하며 변경될 수 있다 _(vendor-stated)_[^s07]. Cloudflare가 엣지에서 수행한다는 "결제 검증·집행"이 자체 facilitator 운영을 의미하는지도 문서상 불명확하다. 둘째, Cloudflare가 제안한 deferred 스킴이 x402 표준 스킴으로 병합 완료됐는지는 확인하지 못했다 — 모노레포에는 유사한 batch-settlement 스킴이 문서화되어 있으나 동일성은 검증되지 않았다[^s06][^s15]. 셋째, 채택 지표의 정량 데이터는 Chainalysis(누적 거래)와 CoinDesk가 인용한 Artemis 분석(일일 규모·인위적 활동 비중)에 의존하며, 두 소스의 측정 방법론 차이로 직접 비교는 어렵다. 2026년 일일 거래량의 정점 대비 하락 폭(-92% 등)을 다룬 일부 기사는 본문 추출에 실패해 인용하지 못했다. 넷째, Cloudflare 문서는 x402-hono(v1.x)를 안내하지만 표준 모노레포에는 @x402/hono(v2.x) 계열이 병존해, 버전 전환기의 문서 지연 가능성이 있다[^s15][^s16]. 다섯째, 조사 과정에서 Cloudflare 문서 경로가 `agents/agentic-payments/x402/`로도 노출되는 것이 관찰되어 문서 트리 재편 중일 수 있다.
