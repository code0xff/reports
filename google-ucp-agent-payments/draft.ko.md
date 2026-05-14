## 서론

Google의 **Universal Commerce Protocol(UCP)** 은 *에이전트 커머스* — 사람이 아니라 AI 에이전트가 머천트 사이트를 탐색하고 장바구니를 채우고 결제하는 유스케이스 — 를 위한 Apache 2.0 라이선스 개방형 표준이다.[^s01][^s04] UCP는 결제 단계만이 아니라 발견 → 결제 → 주문 관리 → 사후 지원에 이르는 전체 쇼핑 라이프사이클을 다루며, 다섯 개 대형 리테일러(Shopify, Etsy, Wayfair, Target, Walmart)가 공동 개발하고 결제·리테일·테크 30개 이상 조직이 보증한다.[^s01][^s08] 2026년 1월 NRF에서 공식 출시되었고 Google의 자체 "Business Agent" 기능은 2026년 1월 12일부터 라이브 상태다.[^s08][^s10]

본 보고서는 (1) UCP가 AP2/A2A/MCP와 어디서 만나는지, (2) capability·extension·manifest 아키텍처, (3) 결제 핸들러 모델과 결제 레이어로서의 AP2 통합, (4) 에이전트 측 구현 경로(Google ADK + `ap2` + `ucp-sdk`)와 머천트 측 통합(Native vs Embedded Checkout), (5) OpenAI ACP·Visa TAP 같은 인접 프로토콜과의 비교를 다룬다.

## 배경 — UCP가 대체하려는 것

이전의 "에이전트 커머스" 시도는 결제(AP2), 에이전트 간 메시징(A2A), 도구 호출(MCP) 중 한 조각만 표준화하고 나머지는 맞춤 통합에 맡겼다. UCP의 주장은 쇼핑 여정 자체가 프로토콜 표면이라는 것이며, TCP/IP 식 레이어드 표준화를 끌어온 동기와 같은 종류의 단편화가 여기에도 적용된다고 본다.[^s06] Google은 UCP가 인접 표준의 **대체재가 아니라 호환재** 라고 명시한다 — "UCP is fully compatible with protocols such as AP2, A2A, and MCP".[^s01][^s03] 특히 FAQ는 AP2를 UCP **내부의 레이어**로 규정한다: "UCP가 더 넓은 구매 라이프사이클을 오케스트레이션하고, AP2는 UCP 내부의 전문화된 결제 레이어로 사용된다."[^s07]

## 아키텍처 — capability, extension, discovery, transport

UCP는 커머스를 소수의 **capability(능력)** 집합으로 표준화하며 각 capability는 JSON 스키마로 정의된다. 초기 출시 4종은 다음과 같다:[^s04]

- **Checkout** — 장바구니 세션, 동적 가격, 세금 계산.
- **Identity Linking** — OAuth 2.0 기반 계정 연결로 자격증명 공유 없이 에이전트가 인증된 사용자 신원으로 동작.
- **Order** — 주문 라이프사이클 이벤트(상태, 트래킹, 반품)에 대한 웹훅 기반 업데이트.
- **Payment Token Exchange** — PSP·자격증명 제공자 사이의 결제 토큰 교환 프로토콜.

capability는 **extension(확장)** 으로 보강된다 — 예컨대 discount extension은 베이스 checkout에 프로모션 코드를 더하고, fulfillment extension은 배송 옵션을 더한다.[^s02] Shopify Engineering은 extension 모델이 의도적으로 분권화되어 있다고 설명한다: "머천트는 reverse-domain 네이밍으로 중앙 승인 없이 커스텀 extension을 정의"하며 머천트와 에이전트가 각각 capability 프로필을 발행해 머천트가 "요청 시점에 두 프로필의 교집합을 계산"하므로 양측이 공통 지원 기능 집합에서만 동작한다.[^s06]

**Discovery.** 비즈니스는 well-known 경로 `/.well-known/ucp` 에 매니페스트를 게시한다. 각 매니페스트 항목은 서비스 정의(버전·스펙 URL), 사용 가능한 capability(스키마·extension 관계 포함), 그리고 결제 핸들러 구성을 담는다.[^s02] 에이전트는 머천트별 하드코딩 통합 없이 이를 동적으로 해석한다.

**Transport binding.** 한 capability는 여러 트랜스포트로 노출될 수 있다: 전통적인 **REST API**(OpenAPI 스키마 포함), **JSON-RPC**, AI 에이전트 도구화를 위한 **Model Context Protocol(MCP)**, 그리고 직접 에이전트 간 통신을 위한 **Agent2Agent(A2A)**. 머천트는 자기 플랫폼에 맞는 트랜스포트를 고른다.[^s02][^s03] Google 머천트 가이드는 추가로 **Native Checkout**(AI Mode/Gemini *내부* 에서 체크아웃을 완결하는 깊은 API 통합)과 **Embedded Checkout**(맞춤 흐름이 필요한 머천트를 위한 iframe 핸드오프) 사이의 선택을 정식화한다.[^s03]

## 결제 — 도구(instrument), 핸들러(handler), 그리고 UCP 안의 AP2

UCP의 결제 아키텍처는 보통 뒤섞이는 두 개를 분리한다:[^s02]

- **결제 도구(instrument)** 는 소비자가 가진 것(카드, 지갑 자격증명, BNPL 계정);
- **결제 핸들러(handler)** 는 *제공자 통합* — 도구를 받아서 결제를 완료할 줄 아는 코드 경로.

머천트는 자기가 받는 핸들러를 광고하고, 에이전트가 그중 하나를 선택하며, 각 핸들러는 구성·도구 데이터에 대한 자체 스키마를 발행한다. 스펙의 레퍼런스 핸들러는 **Shop Pay**, **Google Pay**, 테스트용 **mock handler** 이며 **PayPal** 지원은 로드맵에 공표되었다.[^s02][^s09] 결정적으로 FAQ는 머천트가 자기 자산에 Google Pay API를 직접 통합할 필요가 없으며 Google Pay 형식 토큰을 처리할 수 있는 PSP만 있으면 된다고 명시한다.[^s07][^s10]

**UCP 안의 AP2.** Google 코드랩 "Secure Agent Commerce with AP2 and UCP"는 Google ADK로 만든 에이전트가 여러 머천트를 가로질러 영화 티켓을 예약하는 시나리오를 보여주고, AP2가 들어가는 정확한 위치를 노출한다.[^s05] 흐름은 이중 서명 mandate 모델을 쓴다:[^s05]

1. **CartMandate** — 에이전트가 UCP의 `create_checkout`을 호출하면 머천트는 카트 ID, 총액, 머천트 인가 서명("가격 락"), **10분 만료 윈도** 를 담은 **머천트 서명** mandate를 임베드한 세션을 돌려준다.
2. **PaymentMandate** — 에이전트는 CartMandate ID를 참조하고 결제 수단 메타데이터를 담은 **사용자 서명** mandate를 생성한다. 사용자 지출 동의의 역할을 한다.
3. **검증** — 정산 시점에 머천트는 두 서명을 검증한 뒤에야 이행한다. 머천트 서명은 가격이 진정하고 변조되지 않았음을, 사용자 서명은 동의가 있었음을 증명한다. 어느 한쪽이 일방적으로 자금을 움직일 수 없다.

코드랩은 자기가 쓰는 mandate 암호화(SHA-256 해시 + mock 서명)는 튜토리얼 한정이며 프로덕션 AP2 mandate는 **SD-JWT-VC verifiable credential** 로 서명되고 실제 지갑 SDK가 채팅 기반 확인을 대체한다고 명시한다.[^s05]

## 구현 — UCP + AP2 위에서 에이전트 빌드하기

코드랩은 구체적인 에이전트 스택을 박아둔다. 필수 파이썬 패키지는 `google-adk`(에이전트 프레임워크), `google-genai`(Gemini), 데모의 머천트 서버용 `fastapi` + `uvicorn`, 그리고 GitHub에서 가져오는 프로토콜 SDK `ap2`와 `ucp-sdk`다.[^s05] 에이전트 자체는 UCP/AP2 연산 하나씩을 래핑하는 다섯 개 툴을 노출한다:[^s05]

| 툴 | 프로토콜 액션 | 목적 |
|------|------------------|---------|
| `discover_theaters` | UCP discovery | `/.well-known/ucp`를 조회해 각 머천트의 capability를 읽음 |
| `search_movies` | UCP MCP call | 여러 머천트에 걸친 JSON-RPC 카탈로그 검색 |
| `get_movie_detail` | UCP MCP call | 선택한 머천트로부터 상세 상영시간 조회 |
| `create_checkout` | UCP MCP call | 체크아웃 세션 개시, CartMandate 수령 |
| `complete_purchase` | AP2 flow | PaymentMandate 생성·서명·두 mandate 제출 |

구매 단계는 `require_confirmation=True`로 래핑되어, mandate 서명·제출 전에 명시적 사용자 확인 UI를 띄우고 에이전트를 일시정지시킨다.[^s05] 프로덕션에서는 UCP discovery가 하드코딩된 localhost URL이 아니라 레지스트리를 통해 해석되고, 머천트는 라이브 MCP 엔드포인트를 호스팅하며, mandate 서명은 SD-JWT-VC로 바뀌고, 공식 지갑 SDK가 사용자 동의를 매개한다.[^s05]

**머천트 측 통합.** 머천트는 두 가지 통합 경로가 있다.[^s03] **Native Checkout** 은 UCP/AP2를 직접 호출해 AI Mode 또는 Gemini *내부* 에서 체크아웃을 끝낸다 — 에이전트 경험을 극대화하며 Google이 전체 에이전트 기능을 위해 권장하는 경로다. **Embedded Checkout** 은 머천트가 통제하는 iframe으로 사용자를 라우팅하며 특수 브랜딩이나 복잡한 흐름이 필요한 머천트에게 제공된다. 출시 시점 적격성은 세 가지를 요구한다: 최신 피드를 갖춘 Merchant Center 계정, 적격 상품에 `native_commerce: true` 속성, 그리고 Google Pay 토큰을 처리할 수 있는 PSP.[^s07][^s10] UCP-powered checkout은 초기에 미국 한정이다.[^s10] 두 경로 모두에서 머천트는 **Merchant of Record** 로 남아 고객 데이터·비즈니스 규칙·직접 스토어프론트 관계를 유지한다.[^s01][^s03]

## 채택 현황과 비교

UCP의 후원 폭은 이것이 Google 사내 프로토콜이 아니라 산업 레벨 레이어를 노린다는 신호다: 30개 이상 후원자가 결제 측에는 **Stripe, PayPal, Mastercard, Visa, Klarna, Adyen** 을, 리테일 측에는 **Best Buy, Macy's, The Home Depot, Flipkart, Zalando, Kroger, Sephora, Ulta** 같은 주요 사업자를 포함한다.[^s01][^s08] Business Agent 롤아웃은 2026년 1월 12일에 라이브가 되었고 Lowe's, Michael's, Reebok이 Google Search에서 브랜디드 채팅을 처음 사용한 리테일러로 거론된다.[^s08]

**OpenAI ACP와의 비교.** OpenAI의 Agentic Commerce Protocol은 "체크아웃 중심"이다. UCP는 사후 지원·로열티·반품을 포함해 라이프사이클을 더 넓게 커버하지만 Google의 표면(Search AI Mode, Gemini App, Google Shopping) 안에서 먼저 출시되었다.[^s09][^s10] ACP는 인터페이스 비종속으로 포지셔닝된다. Checkout.com의 분석은 두 가지를 보완 관계로 본다 — ACP는 AI 어시스턴트 내부에서 새로운 수요를 잡고, UCP는 이미 Google 발견 표면에서 활동 중인 고-의도 쇼퍼를 전환한다 — 그리고 머천트들에게 "둘 다 지원할 준비를 하라"고 명시적으로 권장한다.[^s09]

**Visa Trusted Agent Protocol과의 비교.** TAP와 UCP는 다른 문제를 푼다. TAP는 머천트가 "이게 정당한 에이전트인가"를 네트워크 엣지에서 답할 수 있도록 HTTP 요청 헤더에서 *에이전트 행위자* 를 암호학적으로 인증한다. UCP는 그 에이전트가 인식된 *이후* 에이전트가 대화하는 머천트 인터페이스를 표준화하고, AP2는 그 안에서 동의·가격 mandate를 운반한다. 둘은 직교하며, Visa 자체 Intelligent Commerce Connect는 UCP를 수용 가능한 프로토콜 중 하나로 명시한다.[^s09]

구현자 관점에서 실용적 결론은 다음과 같다: *에이전트* 는 Google ADK + `ap2` + `ucp-sdk` 위에 빌드하고, discovery는 `/.well-known/ucp`로 라우팅하고, PaymentMandate가 서명되기 전에 `require_confirmation` 게이트를 띄우고, 이행 전에 서버 측에서 두 mandate를 모두 검증한다.[^s05][^s07] *머천트* 는 Merchant Center 위에 빌드하고, 받는 핸들러를 광고하고(최소한 Google Pay 토큰을 처리하는 PSP), 원하는 에이전트 표면 규모에 따라 Native vs Embedded를 선택한다.[^s03][^s10]

## 한계

- AP2는 본 보고서에서 Google UCP 코드랩의 시연을 통해 기술되었다. AP2 스펙 저장소 자체는 직접 조회되지 않았으므로 SD-JWT-VC 프로파일 세부(claims set, key binding)는 간접 요약이다.
- UCP는 2026년 1월에 출시되었고 초기 가용성은 미국 한정이다. 글로벌 롤아웃 일정과 GA 시점 모든 결제 핸들러의 전체 목록은 벤더 카피이며 독립 검증되지 않았다.
- Shopify Engineering이 기술한 "요청 시점 capability 프로필 교집합" 메커니즘은 스펙의 와이어 레벨 예시로 교차 검증되지 않았다. 공동 개발자라는 점에서 1차이지만 단일 출처다.
- 독립 비교 분석(Checkout.com, ALM Corp, MetaRouter)은 산업 분석이며 동료 심사 작업이 아니다. 이 표준이 너무 최신이라 동료 심사 자료는 아직 존재하지 않는다.

## 초록

Google의 Universal Commerce Protocol(UCP)은 Shopify·Etsy·Wayfair·Target·Walmart와 공동 개발하여 2026년 1월 NRF에서 출시된 Apache 2.0 개방형 표준이며, 결제 단계만이 아니라 발견·체크아웃·주문 관리·사후 지원에 이르는 *에이전트 커머스 라이프사이클 전체* 를 표준화한다. 아키텍처적으로 네 가지 capability(Checkout, Identity Linking, Order, Payment Token Exchange), 분권화된 reverse-domain 네이밍 기반 extension, `/.well-known/ucp` discovery 매니페스트, 그리고 다중 트랜스포트 바인딩(REST, JSON-RPC, MCP, A2A)을 출시한다. 결제 측에서는 *instrument* 와 *handler* 를 분리하고, Google의 Agent Payments Protocol(AP2)을 UCP에 결합되는 전문화된 결제 레이어로 다룬다. AP2의 이중 서명 흐름은 머천트가 체크아웃 시점에 서명된 CartMandate(가격 락, 10분 만료)를 발급하고, 사용자가 이를 참조하는 PaymentMandate에 서명하며, 이행 전에 두 서명이 모두 검증된다 — 프로덕션 배포는 SD-JWT-VC verifiable credential을 사용한다. 구체적 에이전트 빌드는 Google ADK + `ap2` + `ucp-sdk`를 사용하고, 다섯 개 UCP/AP2 툴(`discover_theaters`, `search_movies`, `get_movie_detail`, `create_checkout`, `complete_purchase`)을 노출하며, 구매 단계를 `require_confirmation=True`로 래핑해 명시적 사용자 동의를 강제한다. 머천트는 Native Checkout(Google AI 표면 내부 깊은 API 통합) 또는 Embedded Checkout(iframe 핸드오프)으로 통합하고, 출시 시점에 Merchant Center의 `native_commerce: true` 속성과 Google Pay 토큰 처리 PSP를 갖춰야 하며 전 과정 동안 Merchant of Record 지위를 유지한다. UCP는 Stripe·PayPal·Mastercard·Visa·Klarna·Adyen 등 30개 이상 조직과 주요 리테일러 다수가 보증하며, OpenAI ACP(체크아웃 중심, 인터페이스 비종속)와 Visa Trusted Agent Protocol(HTTP 엣지의 행위자 검증)과는 경쟁이 아닌 보완 관계로 자리매김된다.
