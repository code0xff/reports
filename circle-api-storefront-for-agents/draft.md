# Circle 블로그 분석 — "Turn Your API into a Storefront for Agents" (Agent Stack · Gateway · x402-batching)

## 초록

본 보고서는 2026년 5월 18일자 Circle 블로그 "Turn Your API into a Storefront for Agents"[^s01]를 코드 수준까지 풀어 읽고, 그 위에 얹히는 Circle Agent Stack[^s02][^s03], `@circle-fin/x402-batching` npm 패키지[^s07], 그리고 두 곳의 참조 GitHub 리포(`circlefin/arc-nanopayments`[^s08]와 커뮤니티 샘플 `BlockRunAI/circle-nanopayment-sample`[^s10])를 정리한다. 블로그가 발표한 것은 한 줄로 "임의의 HTTP API를 USDC nanopayment를 받는 storefront로 만들기 위한 코드 한 블록"이다 — Express에 `createGatewayMiddleware({ sellerAddress, facilitatorUrl, networks })`를 끼우고 라우트에 `gateway.require("$0.001")`을 붙이면 끝난다[^s01]. 그 한 줄 뒤에는 x402 HTTP 402 흐름[^s14], Circle Gateway의 오프체인 배치 정산[^s05], Arc Testnet(chain ID 5042002)의 USDC 정산[^s01][^s04]이 차곡차곡 들어 있고, 본 보고서는 이를 (a) 블로그 본문, (b) 서버·클라이언트 코드, (c) 참조 GitHub 리포의 세 갈래로 분해한다.

## 1. 서론 — 무엇을 발표했는가

블로그의 발표는 명료하다: "Gateway uses x402 for the HTTP payment flow. The server responds with 402 Payment Required, the caller retries with a signed payment authorization"[^s01]. 즉 Circle Gateway는 x402 facilitator의 위치를 차지하고, 그 facilitator는 USDC를 nanopayment 단위로 받아 배치로 온체인 정산한다.

블로그 한 줄의 가치는 "내 API에 결제를 어떻게 붙이느냐"를 (예전 같으면 청구 시스템·로그인·KYC를 끌고 와야 했던 문제를) **Express 미들웨어 한 줄로 압축**한다는 데 있다 — 그것이 Circle for Agents의 슬로건과 정확히 같다: "Agents get stuck behind paywalls and authentication, halting workflows. USDC unlocks doors for agents to work uninterrupted"[^s06].

본 보고서는 이 한 줄이 실제로 무엇을 의미하는지 (a) 명세 (b) 코드 (c) 인프라의 세 층으로 분해한다.

## 2. 배경 — Agent Stack과 Gateway의 자리

### 2.1 Circle Agent Stack의 다섯 구성요소

Circle은 2026년 5월 11일 Agent Stack을 공식 출범시켰다[^s16]. 다섯 구성요소는 (1) **Agent Wallets** — USDC와 다른 토큰을 정책 안에서 보관·이체, (2) **Agent Marketplace** — 에이전트가 서비스를 발견하고 결제, (3) **Circle CLI** — `circle wallet` / `circle gateway` / `circle services` 같은 명령으로 모든 동작을 한 진입점에서 처리, (4) **Nanopayments(Circle Gateway)** — x402 호환 USDC 마이크로결제, (5) **Circle Skills** — Claude Code, Cursor, Codex 같은 AI 코딩 어시스턴트에 박히는 베스트 프랙티스 모듈이다[^s02][^s03]. Circle 측 표현은 "chain- and protocol-agnostic open infrastructure designed for the agentic economy"이며, 한 문장으로 "agents can hold and move USDC through Agent Wallets … discover and evaluate services through Agent Marketplace … execute repeatable financial actions through CLI … settle payments using USDC"라고 정리된다[^s02].

### 2.2 Gateway / Nanopayments / x402의 관계

Gateway는 두 가지 역할을 동시에 수행한다.

- **x402 facilitator** — `/verify` + `/settle` REST 엔드포인트로 결제 페이로드를 검증·정산한다[^s14][^s15]. Coinbase가 운영하는 x402 facilitator와 동일한 인터페이스를 갖되, **체인 추상화된 USDC** 자산 모델을 따른다 — Circle 측 표현은 "Gateway already provides chain-abstracted USDC across supported blockchains"이고[^s05], TronWeekly의 정리도 같은 결론에 도달한다: "Gateway pairs with x402 to settle USDC micropayments at scale for autonomous AI agents"[^s17].
- **Nanopayments 배치 정산** — Gateway는 결제를 매 요청마다 온체인에 보내지 않는다. "Gateway's new batching feature will enable deferred settlement by bundling transactions offchain and settling them onchain"[^s05]. Circle Gateway가 "수천에서 수십만 건의 트랜잭션을 오프체인에서 묶고 단일 온체인 정산으로 보낸다"는 패턴은 [`circlefin/arc-nanopayments`](https://github.com/circlefin/arc-nanopayments)의 README에도 동일하게 적혀 있다 — "Circle Gateway batches many signed offchain authorizations into a single onchain settlement, enabling economically viable sub-cent payments"[^s08].

### 2.3 Arc Testnet과 chain ID 5042002

블로그의 코드 예시는 `networks: ["eip155:5042002"]`로 Arc Testnet에 바인딩한다[^s01]. Arc 자체는 Circle이 개발 중인 "Economic OS for the internet"이라는 자체 체인으로[^s12], 스테이블코인 결제에 최적화된 환경을 제공한다는 포지셔닝이다 — Circle 블로그의 표현은 "a stablecoin-native settlement environment, eliminating gas token volatility concerns"[^s04]. facilitator 엔드포인트는 `https://gateway-api-testnet.circle.com`이고, 테스트넷 USDC를 받는 faucet은 `https://faucet.circle.com/`이다[^s01].

## 3. 아키텍처 — 5단계 결제 흐름

블로그가 정의하는 흐름은 다음 5단계다[^s01]:

1. **에이전트가 보호 자원 요청** — 일반 HTTP POST `http://localhost:3000/research/company-brief`.
2. **서버가 402 응답** — `createGatewayMiddleware`가 자동으로 `PAYMENT-REQUIRED` 헤더에 (scheme, network, token, payTo, amount) 메타데이터를 실어 반환한다.
3. **에이전트가 서명된 결제 인증으로 재시도** — 클라이언트 SDK(`@circle-fin/x402-batching/client`)가 Gateway 잔액을 확인하고 EIP-3009 `transferWithAuthorization`을 GatewayWallet 컨트랙트 앞으로 서명한 뒤 `PAYMENT-SIGNATURE` 헤더에 실어 재요청한다[^s10][^s18].
4. **Gateway가 검증·정산 후 Seller Gateway Balance에 기록** — Gateway가 facilitator로서 즉시 검증해 응답을 통과시키고, 실제 USDC 이체는 배치 정산까지 지연된다[^s04][^s05]. 결제는 Seller Wallet의 Gateway Balance에 누적된다.
5. **Seller가 Payout Wallet으로 인출** — `circle gateway withdraw --amount ... --recipient $PAYOUT_WALLET_ADDRESS` 한 줄이면 누적 잔액이 Payout Wallet으로 옮겨진다[^s01].

이 5단계가 블로그의 정체성이다. 머천트는 결제 인프라(키 관리·온체인 트랜잭션·노드·gas)를 직접 운영하지 않고, **Circle Gateway가 facilitator로 그 자리에 들어가 있다는 점**이 핵심이다.

## 4. 코드 분석 — `@circle-fin/x402-batching` 톺아보기

### 4.1 npm 패키지 형태

블로그가 import하는 패키지는 `@circle-fin/x402-batching`이다[^s01]. npm 페이지에 따르면 v3.0.4, 0 dependency, 8 dependent라는 단순한 구조이며, "gas-free micropayments via Circle Gateway using the open x402 protocol, with payments signed off-chain and settled in batches by Circle Gateway"라고 정체성을 요약한다[^s07]. 패키지는 두 진입점을 노출한다 — `@circle-fin/x402-batching/server`(머천트 측)와 `@circle-fin/x402-batching/client`(에이전트 측)[^s07][^s10]. 필수 peer dependency는 `@x402/core`와 `viem`이고, EVM 전용 스킴을 쓸 때 `@x402/evm`이 추가된다[^s07].

### 4.2 서버 측 — `createGatewayMiddleware`

블로그의 Express 예시를 통째로 인용하면[^s01]:

```typescript
import express from "express";
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";
import { formatUnits } from "viem";

type PaidRequest = express.Request & {
  payment?: {
    payer: string;
    amount: string;
    network: string;
    transaction?: string;
  };
};

const app = express();
app.use(express.json());

const gateway = createGatewayMiddleware({
  sellerAddress: process.env.SELLER_WALLET_ADDRESS!,
  facilitatorUrl: "https://gateway-api-testnet.circle.com",
  networks: ["eip155:5042002"], // Arc Testnet
});

app.post(
  "/research/company-brief",
  gateway.require("$0.001"),
  (req: PaidRequest, res) => {
    const payment = req.payment;
    const paidAmount = payment?.amount
      ? `${formatUnits(BigInt(payment.amount), 6)} USDC`
      : "$0.001";

    res.json({
      company: "ExampleCo",
      brief: "ExampleCo is expanding into agent-accessible data products...",
      paid: {
        amount: paidAmount,
        payer: payment?.payer,
        network: payment?.network,
        transaction: payment?.transaction,
      },
    });
  },
);
```

요점은 세 가지다.

- `createGatewayMiddleware` 옵션은 **`sellerAddress` / `facilitatorUrl` / `networks`** 세 필드만 받는다[^s01].
- 라우트별 가격은 `gateway.require("$0.001")`처럼 **USD 문자열**로 지정한다. 6 decimals USDC 변환은 미들웨어가 처리하고, 핸들러는 `formatUnits(BigInt(amount), 6)`로 다시 USDC 표시로 되돌릴 수 있다[^s01].
- 결제 메타데이터는 `req.payment`에 `{ payer, amount, network, transaction? }` 형태로 주입된다 — 핸들러가 이를 사용해 응답을 풍부하게 만들 수 있다[^s01].

Next.js App Router 환경에서는 같은 미들웨어가 `withGateway()` 형태의 라우트 래퍼로 노출된다 — "`export const GET = withGateway(handler, "$0.001", "/api/premium/quote")`"[^s04]. `circlefin/arc-nanopayments` 리포는 Next.js + Supabase 위에서 이 패턴을 종합적으로 보여 준다[^s08].

### 4.3 클라이언트 측 — `GatewayClient` + `circle services pay`

같은 패키지의 `/client` 진입점은 SDK 형태로 노출된다. `BlockRunAI/circle-nanopayment-sample`의 README는 다음과 같이 정리한다 — "client (`src/client.ts`) leverages `GatewayClient` from `@circle-fin/x402-batching` to check Gateway balance, call the API with automatic 402 flow handling, sign EIP-3009 authorizations against the GatewayWallet contract, and receive paid responses"[^s10].

블로그는 같은 흐름을 **CLI 한 줄로 압축한 `circle services pay`** 명령으로 보여 준다[^s01]:

```bash
circle services pay \
  http://localhost:3000/research/company-brief \
  --address "$AGENT_WALLET_ADDRESS" \
  --chain ARC-TESTNET \
  -X POST \
  --max-amount 0.001 \
  --output json
```

CLI는 (a) 첫 GET/POST으로 402를 받고, (b) `gateway-api-testnet.circle.com`에서 잔액을 확인한 뒤, (c) `GatewayWallet` 컨트랙트 앞으로 EIP-3009 서명을 만들고, (d) `PAYMENT-SIGNATURE` 헤더와 함께 재요청해 응답을 받는다 — 즉 SDK가 하는 일과 같은 일을 셸 한 줄로 한다.

### 4.4 CLI — `circle wallet` / `circle gateway` / `circle services`

블로그는 전체 셋업 흐름을 다음 명령들로 보여 준다[^s01]:

```bash
which circle || npm install -g @circle-fin/cli
circle skill install --tool codex
circle wallet status --type agent
circle wallet login <YOUR_EMAIL> --testnet

circle wallet list --type agent --chain ARC-TESTNET
circle wallet create --output json

circle wallet balance --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET
circle wallet fund --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET
circle gateway deposit --amount 10 --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET --method direct
circle gateway balance --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET

circle services pay <URL> --address "$AGENT_WALLET_ADDRESS" --chain ARC-TESTNET ...

circle gateway withdraw --amount 0.001 --address "$SELLER_WALLET_ADDRESS" \
  --chain ARC-TESTNET --recipient "$PAYOUT_WALLET_ADDRESS" --output json
```

CLI 한 줄짜리 흐름이 다섯 단계 결제 흐름 전체와 1:1로 매핑된다. `circle wallet` 명령군은 키 인프라 관련, `circle gateway`는 정산 잔액 관리, `circle services`는 실제 결제 트리거, `circle skill install`은 Claude Code / Cursor / Codex 같은 코딩 어시스턴트에 Circle Skills를 박는 역할이다[^s09].

### 4.5 참조 GitHub 리포 정리

이 흐름을 실제 코드로 보고 싶다면 다음 두 리포가 1차 참고 자료다.

- **`circlefin/arc-nanopayments`** — Circle 공식 reference implementation, Apache-2.0, TypeScript 96.6%. 구조는 (a) Next.js App Router(`/app`)로 paywalled 라우트 노출 (b) Supabase로 결제 영속화 (c) LangChain + Deep Agents 기반 buyer agent(`agent.mts`) (d) 셀러 대시보드로 실시간 결제 모니터링이다[^s08]. 라우트는 `$0.0003 – $0.03` 사이의 가격대를 시연한다.
- **`BlockRunAI/circle-nanopayment-sample`** — 커뮤니티 샘플, TypeScript Express + 자율 에이전트 클라이언트. 서버는 `GET /risk-profile`을 `$0.01`로 게이트하고, 클라이언트는 402 → EIP-3009 서명 → 재요청까지 자동화한다[^s10]. npm 스크립트는 `npm run setup` / `server` / `client` / `deposit` / `balance`로 5단계 흐름을 그대로 따라간다[^s10].

추가로 다음 두 리포가 코드 베이스를 받쳐 준다.

- **`circlefin/skills`** — Apache-2.0. "Best-practice guidance for USDC payments, crosschain transfers, wallets, and smart contracts, plus Circle's MCP server for real-time SDK and documentation context"라고 자기 소개를 한다[^s09]. 13개의 코어 스킬이 Claude Code, Cursor, Vercel Skills CLI, Codex, Windsurf에서 동작한다[^s09]. 블로그가 `circle skill install --tool codex`로 설치하는 것이 바로 이 리포의 스킬 모듈이다[^s01][^s09].
- **`circlefin/arc-node`** — Rust로 작성된 Arc 체인 노드 자체[^s12]. 스마트 계정·정산 흐름의 정합성을 직접 검증하려면 이 리포가 출발점이다.

오픈 표준 측에서는 `coinbase/x402`(현재는 `x402-foundation/x402`로 미러)와 그 ecosystem에 issue #447 "x402 x Circle Gateway"가 공개되어 있어 Circle 측 통합이 표준 측에서도 추적되고 있음을 보여 준다[^s11][^s13][^s14].

### 4.6 x402 표준과의 매핑

Circle의 구현이 어떻게 x402 표준에 들어맞는지 정리하면 다음과 같다.

- **x402 스킴** — `@circle-fin/x402-batching`은 이름이 시사하듯 x402의 `batch-settlement` 스킴 진영에 속한다[^s07][^s14]. EVM 바인딩에 따른 channelId/ChannelConfig·누적 바우처·claim/settle/refund 흐름의 구체적 디테일은 본 보고서의 자매 보고서 [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/)에 정리되어 있다.
- **facilitator 역할** — Gateway는 `/verify` 즉시 검증 + `/settle` 지연 배치 정산의 두 동작을 모두 수행한다[^s14][^s15]. 이 점에서 Coinbase의 facilitator가 즉시 정산을 기본으로 한 것과 다른 결을 갖는다.
- **EIP-3009 결합** — 클라이언트가 서명하는 것은 본질적으로 EIP-3009 `transferWithAuthorization`이다 — 이는 x402의 EVM exact 스킴이 사용하는 것과 같은 프리미티브다[^s18][^s14]. Circle Gateway는 그 서명을 즉시 검증하고 배치로 묶어 GatewayWallet 컨트랙트 앞에서 한 번에 정산한다[^s10].

## 5. 비교 — Circle의 위치

### 5.1 Coinbase facilitator와의 차이

x402 표준은 어느 한 facilitator도 표준의 일부로 못박지 않는다. Coinbase Developer Platform이 호스팅하는 facilitator는 Base, Polygon, Arbitrum, World Chain, Solana 위에서 ERC-20 결제를 처리하지만[^s14], **Circle Gateway는 자체 체인(Arc)을 1차 정산 환경으로 두고, USDC를 chain-abstracted 자산으로 운영한다는 점**이 가장 큰 차이다[^s05]. 결제 단가를 $0.000001까지 끌어내릴 수 있다는 nanopayments 주장은 Circle 측의 자체 위치 설정이다[^s04].

### 5.2 MPP `session` 인텐트와의 차이

본 보고서의 자매 보고서 [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/)이 보여 주듯, x402 batch-settlement는 "머천트 1 × 사용자 N"의 트래픽을, MPP `session`은 "사용자 1 × 머천트 1"의 트래픽을 1차 시나리오로 삼는다. Circle은 x402 batch-settlement 진영에 합쳐지는 위치이고[^s07][^s14], MPP `session`과 직접 경쟁한다기보다는 다른 트래픽 패턴을 푼다 _(interpretive)_.

### 5.3 표준 인터페이스 합치도

Circle은 자기 facilitator를 만들면서도 x402 표준 인터페이스(402 응답 + `PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE` 헤더 + `/verify` + `/settle`)를 그대로 따른다[^s01][^s14]. 따라서 같은 클라이언트 SDK는 다른 facilitator(예: Coinbase 호스팅)로 똑같이 동작해야 한다 — 이것이 "표준을 채택하면서 자기 정산 인프라를 차별점으로 두는" Circle의 전략이다 _(interpretive)_.

## 6. 논의 — 머천트 측 설계 포인트

### 6.1 가격 단위 $0.000001의 운영적 의미

블로그 코드는 `gateway.require("$0.001")`로 시작하지만, `circlefin/arc-nanopayments`는 $0.0003 – $0.03 사이의 라우트들을 동시에 노출한다[^s08]. 이 가격대는 "LLM 호출 한 번", "데이터 조회 한 건"이 결제 단위가 되는 영역이다 — 즉 머천트가 자기 API를 **사람 단위 구독이 아닌 호출 단위 결제로 재구성**해야 한다는 뜻이다. Circle Nanopayments의 자체 한계 값($0.000001)은 그 재구성의 하한선을 정의한다[^s04].

### 6.2 Arc / EVM / Solana 멀티체인 전개

블로그의 코드는 Arc Testnet 한 체인만 보여 주지만, Agent Stack 자체는 "chain- and protocol-agnostic open infrastructure"로 설계되었다[^s02]. Gateway의 chain-abstracted USDC 모델은 같은 사용자가 다른 체인의 USDC 잔액을 같은 Gateway Balance로 받는 시나리오를 가능하게 한다[^s05]. 향후 EVM·Solana 양쪽으로 확장될 가능성이 본 보고서가 검증한 자료 안에서도 명시되어 있다[^s05].

### 6.3 Agent Marketplace의 SEO 역할

블로그는 머천트가 자기 API를 노출하는 채널로 Agent Marketplace를 명시한다. agents.circle.com이 보여 주는 카탈로그는 Meeting Prep · Quant Analysis · Research · Domain Search · Social Analytics · Crypto Analysis 같은 종류별 가격대($0.022–$0.301)로 노출되어 있고[^s06], 이 카탈로그는 사실상 "에이전트 시대의 검색 엔진"이라는 분석가 의견과 정합한다 _(interpretive)_[^s06]. 단, 본 보고서 시점에는 등재 자체가 Google Form 기반이라는 점이 본 보고서의 uncertainties에 그대로 기록되어 있다[^s01].

### 6.4 머천트가 결정해야 하는 5가지

본 보고서가 정리한 머천트 측 의사결정 포인트는 다음과 같다.

1. **가격 단위** — `$0.001` / `$0.0003` / `$0.03` 같은 단위 중 어느 것을 채택할지. (가격이 낮을수록 배치 효율은 높지만, 호출당 마진은 작다.)
2. **체인 선택** — Arc Testnet에 묶을지, 향후 다른 체인으로 열어 둘지.
3. **Payout Wallet 모델** — 자체 EOA에 인출할지, MPC 지갑에 인출할지, 또 다른 SaaS에 인출할지.
4. **Agent Marketplace 등재 여부** — 자체 마케팅 채널이 강하면 등재가 옵션이고, 약하면 거의 필수다.
5. **dispute / refund 정책** — Circle 측 표준은 dispute 절차를 별도 규정하지 않으므로[^s14], 머천트가 자체 정책으로 결정해야 한다.

## 7. 한계

- 본 보고서는 2026년 5월 20일 시점의 블로그·docs·npm·GitHub 메타데이터를 기준으로 한다. Arc Mainnet 출시·체인 ID 확정·Gateway production facilitator 출시는 본 보고서 범위에 포함되지 않는다.
- `@circle-fin/x402-batching` npm 페이지는 scripted fetch에서 access-limited이며, 패키지 메타데이터(버전 3.0.4, 0 deps, 8 dependents)는 검색 결과와 `BlockRunAI` 샘플 README에 의존한다[^s07][^s10].
- `circlefin/arc-nanopayments`의 README raw 텍스트가 직접 받아지지 않아, 코드 인용은 리포 메타데이터 페이지의 요약에 의존했다[^s08]. 실제 라이브 운영을 위해서는 리포의 최신 커밋을 직접 확인해야 한다.
- x402 issue #447의 토론 본문은 본 보고서에서 직접 인용하지 않았으며, 이슈의 존재만 확인되었다[^s11].
- Arc Testnet 체인 ID(`5042002`)와 GatewayWallet 컨트랙트 주소 같은 정량 식별자는 블로그 코드 인용 위주이며, 별도 체인 레지스트리로 교차 확인하지 않았다.
- Circle Wallets와 Agent Stack은 Circle Technology Services, LLC(CTS)가 소프트웨어 제공자로서 운영하며, 규제 받는 금융·자문 서비스가 아니라는 점이 블로그 disclaimer에 명시되어 있다[^s01]. 본 보고서는 이 disclaimer를 보존한다.
