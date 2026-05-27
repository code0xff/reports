# x402 Bazaar — 에이전트용 x402 서비스 디스커버리 레이어 분석

## 초록

x402 프로토콜이 "에이전트가 어떻게 결제하는가"를 풀었다면, **x402 Bazaar**는 그 위에 남은 "에이전트가 어떤 유료 서비스가 존재하는지 어떻게 아는가"를 푸는 디스커버리 레이어다[^s01]. 2025년 9월 10일 Coinbase가 발표했고[^s03], CDP Facilitator가 정산(settle)한 x402 엔드포인트를 자동으로 인덱싱해 semantic description·payment metadata·on-chain trust signal과 함께 카탈로그화한다[^s01]. 핵심 설계는 **별도 등록 단계가 없다**는 것이다 — "There is no separate registration step. The CDP Facilitator catalogs your service the first time it settles a payment for that endpoint"[^s01]. 본 보고서는 (1) 정산-트리거 자동 인덱싱 구조와 resource 스키마, (2) `/v2/x402/discovery`의 resources·search·merchant·mcp 네 엔드포인트, (3) `@x402/extensions/bazaar`의 `declareDiscoveryExtension`과 `x402-express`의 `discoverable:true`·`wrapFetchWithPayment` 코드를 1차 사양과 예제 코드로 분석한다.

## 1. 서론 — x402의 디스커버리 문제

x402는 HTTP 402 위에서 "클라이언트가 유료 자원을 한 번의 왕복으로 결제한다"를 표준화했다[^s09]. 하지만 결제 흐름은 *클라이언트가 이미 어느 엔드포인트를 호출할지 알고 있다*고 전제한다. 자율 에이전트 시나리오에서는 그 전제가 깨진다 — "내가 필요한 데이터를 파는 유료 API가 어디에 있는가"를 먼저 알아야 결제할 대상이 생긴다. Bazaar는 정확히 이 자리를 채우는, x402의 디스커버리 레이어다 — "a discovery system enabling developers and AI agents to browse and search for x402-enabled services that are cataloged through the CDP Facilitator"[^s01]. 외신은 이를 "AI agents' marketplace"로 표현했다[^s10].

## 2. 배경 — Bazaar의 자리

### 2.1 왜 facilitator가 인덱싱 주체인가

x402의 facilitator는 결제 검증(`/verify`)과 정산(`/settle`)을 대행해, 판매자가 블록체인 인프라를 직접 운영하지 않아도 되게 한다 — "The facilitator handles payment verification and settlement so that sellers don't need to maintain their own blockchain infrastructure"[^s08]. 이 facilitator는 모든 정산 트래픽을 보는 위치에 있으므로, "어떤 엔드포인트가 실제로 결제를 받고 있는가"를 가장 잘 아는 주체이기도 하다. Bazaar는 이 관찰 위치를 인덱싱 소스로 전환한 것이다[^s01]. Coinbase 호스팅 facilitator는 USDC on Base에 대해 facilitator fee를 부과하지 않는다고 명시한다[^s03].

### 2.2 x402 표준은 facilitator-agnostic

x402 GitBook도 Bazaar를 "the discovery layer of x402, letting clients enumerate facilitator-cataloged resources"로 정의한다[^s07]. 다만 Bazaar 자체는 CDP Facilitator에 묶인 구현이고, x402 표준은 facilitator-agnostic이다[^s09]. 따라서 Bazaar는 "x402 위에 Coinbase가 올린 디스커버리 서비스"로 보는 것이 정확하다 — 표준의 일부가 아니라 표준 위의 레이어다 _(interpretive)_[^s01][^s09].

## 3. 아키텍처 — Bazaar 동작 구조

### 3.1 정산-트리거 자동 인덱싱

Bazaar의 가장 중요한 설계 결정은 **등록이 정산에서 파생된다**는 것이다[^s01]. 서비스가 인덱싱되려면 네 조건이 필요하다[^s01]:

1. `bazaarResourceServerExtension` 등록.
2. 라우트에 `declareDiscoveryExtension()` 부착.
3. settlement payload에 `paymentPayload.resource` 포함.
4. 최소 1회 성공 정산 완료.

즉 "결제가 한 번 실제로 일어난 엔드포인트"만 카탈로그에 오른다 — 이는 "결제 이력 = 실재 증명"이라는 약한 sybil 저항을 자동으로 만든다. 그리고 30일간 활동이 없는 resource는 카탈로그에서 제외되지만, 아직 호출 이력이 없는 신규 resource는 이 필터에서 면제된다[^s01].

### 3.2 resource 스키마

각 인덱싱된 resource는 다음 필드를 가진다[^s01].

| 필드 | 의미 |
|---|---|
| `resource` | 과금 엔드포인트 URL |
| `type` | 프로토콜 (현재 `"http"`) |
| `x402Version` | 지원 프로토콜 버전 |
| `accepts` | payment requirements 배열 (scheme/network/amount/asset/payTo) |
| `lastUpdated` | ISO 8601 타임스탬프 |
| `metadata` | (선택) description + Bazaar input/output 스키마와 예시 |

### 3.3 quality ranking

search는 두 신호를 혼합해 순위를 매긴다[^s01]:

- **retrieval relevance** — full-text + semantic의 하이브리드 검색.
- **service quality** — (a) 30일 내 distinct buyer 수(buyer reach) (b) 거래량 (c) recency (d) metadata 완성도.

quality metric은 6시간 주기로 재계산되므로, 새 결제가 즉시 순위에 반영되지는 않는다[^s01].

## 4. 디스커버리 API & MCP

Bazaar는 CDP 플랫폼 API 아래 네 엔드포인트를 노출한다[^s01].

### 4.1 카탈로그 — `GET /platform/v2/x402/discovery/resources`

`items` 배열을 최신순으로 반환하며 `limit`(기본 100, 최대 1000)과 `offset` 페이지네이션을 지원한다[^s01]. 인벤토리식 전체 순회용이다.

### 4.2 시맨틱 검색 — `GET /platform/v2/x402/discovery/search`

`query`(최대 400자) + `network`/`asset`/`scheme`/`payTo`/`maxUsdPrice`/`extensions` 필터를 받아 최대 20개 결과를 반환한다 — "optimized for query, filters, and quality ranking, not for walking the full catalog"[^s01].

### 4.3 머천트 조회 — `GET /platform/v2/x402/discovery/merchant?payTo=<address>`

특정 지갑 주소로 결제되는 resource를 찾는다[^s01].

### 4.4 MCP 서버 — `GET /platform/v2/x402/discovery/mcp`

Bazaar는 Model Context Protocol 서버도 노출한다[^s01]. 두 도구를 제공한다:

- **`search_resources`** — 시맨틱 검색. 매칭된 description·pricing·schema를 relevance 순으로 반환.
- **`proxy_tool_call`** — 발견한 resource를 `toolName`과 `arguments`로 호출.

클라이언트 측 `@x402/mcp`는 표준 MCP 클라이언트를 감싸 결제 payload 생성과 402 retry를 자동 처리한다 — "the @x402/mcp client automatically creates a payment payload and retries if payment is required"[^s01]. 덕분에 에이전트는 지갑·서명을 직접 다루지 않고, "검색 → 호출"만으로 유료 도구를 쓴다.

## 5. 코드 분석 — 서버·클라이언트

### 5.1 서버 측 — `declareDiscoveryExtension`

디스커버리 확장은 `@x402/extensions/bazaar` 패키지로 제공된다 — "Facilitators catalog paid HTTP or MCP tools from server-declared input/output hints"[^s06]. x402-foundation 리포의 `bazaar.ts` 예제는 라우트의 `extensions`에 `declareDiscoveryExtension`을 부착한다[^s05]:

```ts
extensions: {
  ...declareDiscoveryExtension({
    input: { city: "San Francisco" },
    inputSchema: {
      properties: { city: { type: "string" } },
      required: ["city"],
    },
    output: {
      example: { city: "San Francisco", weather: "foggy", temperature: 60 },
    },
  }),
}
```

여기서 `inputSchema`는 에이전트가 이 도구를 어떻게 호출해야 하는지(파라미터 형식)를 알려 주고, `output.example`은 응답이 어떤 모양인지를 미리 보여 준다 — 즉 Bazaar에 등재될 때 이 두 스키마가 "에이전트가 사람의 도움 없이 자가 구성(self-configure)"하는 데 쓰인다[^s10].

### 5.2 서버 측 — `x402-express` 간이 형태

`x402-express`의 `paymentMiddleware`에서는 라우트 config에 `discoverable: true`와 `inputSchema`를 두는 것만으로 같은 효과를 낸다[^s04]:

```js
app.use(
  paymentMiddleware(
    "0xB1De43C2Ca1195258FEE160adAcB1820c3776B7D",
    {
      "POST /rps/play": {
        price: "$0.001",
        network: "base",
        config: {
          name: "Rock-Paper-Scissors",
          discoverable: true,
          inputSchema: {
            type: "object",
            properties: { move: { type: "string", enum: ["rock", "paper", "scissors"] } },
          },
        },
      },
    },
    { facilitator },
  ),
);
```

이 서버가 한 번 `$0.001` 결제를 받아 정산되면, `POST /rps/play`가 Bazaar 카탈로그에 자동 등재된다[^s01][^s04].

### 5.3 구매 측 — `listCatalog` + `wrapFetchWithPayment`

구매 에이전트는 카탈로그를 가져온 뒤, 발견한 resource를 `x402-fetch`의 `wrapFetchWithPayment`로 호출하면 402 자동 결제 retry가 일어난다[^s04]:

```js
const listCatalog = async () => {
  const r = await fetch("https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources");
  return r.json();
};

const fetchWithPayment = wrapFetchWithPayment(fetch, cdpAccount);
const catalog = await listCatalog();
const service = catalog.items[0];
const response = await fetchWithPayment(service.resource, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ move: "rock" }),
});
```

핵심 흐름은 **Discovery → 402 Response → Facilitator Settlement → Retry with Proof → Paid Result**이고, 계정 생성이 필요 없다[^s04].

## 6. 논의 — 설계 관찰과 한계

### 6.1 SEO를 대체하는 trust signal

전통 웹에서 서비스 발견은 SEO·리뷰·디렉토리에 의존한다. Bazaar는 그 자리를 **on-chain 거래 활동**(distinct buyer, 거래량, recency)으로 대체한다[^s01]. 즉 "사람이 많이 검색·링크한 서비스"가 아니라 "에이전트가 실제로 많이 결제한 서비스"가 상위에 오른다 — 에이전트 경제에 맞춘 랭킹 기제다 _(interpretive)_[^s01][^s10].

### 6.2 자동 인덱싱의 양면성

등록 단계가 없다는 것은 진입 장벽을 0으로 만들지만, 동시에 "결제 한 번이면 등재"라는 점에서 sybil/스팸 등재 가능성을 남긴다. 30일 비활성 제외[^s01]와 quality ranking[^s01]이 일부 방어책이지만, 첫 정산만으로 등재되는 신규 resource가 필터에서 면제된다는 점은 약점으로 남는다 _(interpretive)_.

### 6.3 중앙 facilitator 의존성

Bazaar는 CDP Facilitator를 인덱싱 주체로 두므로, "어떤 서비스가 발견되는가"가 한 facilitator의 정산 관찰 범위에 묶인다[^s01]. x402 표준 자체는 facilitator-agnostic이므로[^s09], 이론적으로는 다른 facilitator가 자체 Bazaar-style 인덱스를 운영할 수 있지만, 본 보고서 시점에 라이브 Bazaar는 CDP 호스팅이다.

### 6.4 MPP·Circle과의 비교

같은 "에이전트용 서비스 디스커버리" 자리를 Circle Agent Marketplace[`circle-api-storefront-for-agents`](../circle-api-storefront-for-agents/)도 노린다. MPP는 별도 디스커버리 표준을 강제하지 않는다 — 자매 보고서 [`mpp-spec-and-payment-flows`](../mpp-spec-and-payment-flows/)에 정리되어 있다. Bazaar는 이 중 "facilitator 정산 데이터를 직접 인덱싱"한다는 점에서 가장 자동화된 형태다 _(interpretive)_.

## 7. 한계

- 본 보고서는 2026년 5월 27일 시점의 1차 docs·예제 코드를 기준으로 한다. Coinbase 발표 페이지[^s02]가 fetch 시점에 접근 제한이어서, 출시일(2025-09-10)과 "self-improving/self-configuring" framing은 Yahoo[^s03]·MEXC[^s10] 2차 보도로 보강했다.
- quality-ranking의 정확한 가중치는 공개되어 있지 않으며, 본 보고서는 신호 목록(buyer reach/volume/recency/metadata)만 다룬다.
- "200ms" 정산 수치는 Coinbase/보도 발표값이며 Yahoo 자신이 실제 end-to-end는 네트워크 지연 포함 300–500ms라고 단서를 단다[^s03].
- 비-CDP facilitator의 독립 Bazaar 인덱스 운영 여부는 본 보고서 시점에 확인되지 않았다.
- `declareDiscoveryExtension`의 API 표면은 `bazaar.ts` 예제[^s05]에서 캡처했으며, x402 V2 릴리스에 따라 필드명이 바뀔 수 있다.
