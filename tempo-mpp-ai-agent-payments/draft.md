# Tempo MPP와 AI Agent 결제: Stripe 시장 적용 전략

## 초록

2026년 5월 3일 기준 Tempo의 MPP(Machine Payments Protocol)는 “AI 에이전트가 돈을 낼 수 있게 하는 블록체인 기능”이 아니라, HTTP 402를 중심으로 에이전트와 서비스가 가격 제시, 결제 권한, 정산 증명, 리소스 전달을 같은 기계-기계 흐름 안에서 처리하도록 만드는 결제 인증 프로토콜이다.[^s01][^s02][^s04] Tempo는 Stripe와 Paradigm이 인큐베이트한 payments-focused Layer 1로, stablecoin-native gas, payment lanes, deterministic settlement, payment metadata 같은 결제 특화 기능을 내세운다.[^s13][^s14][^s15][^s16] MPP는 이 Tempo settlement rail과 Stripe의 PaymentIntents, Shared Payment Tokens(SPT), 카드·Link·BNPL, Dashboard, fraud/refund/reporting 운영 스택을 연결한다.[^s05][^s10][^s11][^s12]

Stripe 시장 적용 관점에서 MPP의 의미는 분명하다. ACP/SPT/Agentic Commerce Suite(ACS)가 ChatGPT, Google AI Mode, Gemini 같은 AI surface 안에서 소비자·판매자 checkout을 가능하게 하는 retail agentic commerce라면, MPP는 API, MCP tool, 데이터, 콘텐츠, 브라우저 세션, compute, LLM token usage 같은 machine-native commerce를 Stripe의 결제 시장으로 끌어오는 프로토콜이다.[^s01][^s08][^s09][^s10][^s22][^s23][^s24] 따라서 MPP는 Stripe가 “AI가 구매 버튼을 누르는 시장”뿐 아니라 “AI가 인터넷 서비스를 호출할 때마다 비용을 지불하는 시장”까지 포괄하려는 확장 전략으로 해석된다.

## 1. Tempo와 MPP의 위치

Tempo는 자체 사이트와 문서에서 결제 규모에 맞춘 Layer 1로 자신을 정의한다. 일반-purpose chain 위에 결제 기능을 얹는 대신 stablecoin payments, payment lanes, stablecoin fee payment, structured memo, deterministic settlement, passkey/smart-account 기반 signing을 기본 설계 요소로 둔다는 설명이다.[^s13][^s14][^s15] GitHub 조직 설명도 Tempo를 stablecoin payments용 blockchain으로 설명하며, TempoTransaction, TIP-20, payment lanes, Reth 기반 EVM compatibility를 차별점으로 든다.[^s16]

MPP는 Tempo와 Stripe가 공동으로 내놓은 machine-to-machine payment 표준이다. Stripe의 2026년 3월 18일 발표는 MPP를 에이전트가 기업과 서로에게 결제할 수 있게 하는 internet-native open standard로 설명했고, Fortune도 같은 날 Tempo mainnet과 MPP가 함께 출시됐다고 보도했다.[^s01][^s18] MPP 공식 사이트는 API request, tool call, content를 HTTP 402 기반으로 과금하는 open protocol이라고 요약한다.[^s02][^s03]

중요한 점은 MPP가 Tempo-only stablecoin protocol로 고정되어 있지 않다는 것이다. Payment HTTP Authentication draft는 핵심 scheme을 payment-method agnostic으로 설계하고, Stripe, Tempo, card, Solana, Stellar, Lightning 등 payment method specification을 별도로 둔다.[^s04][^s06][^s17][^s21] Visa가 카드 기반 MPP spec과 SDK를 공개한 것도 같은 방향의 신호다. Visa는 MPP를 card-based payments로 확장하고 Visa Acceptance Platform에서 지원한다고 밝혔다.[^s17] 즉 MPP의 전략적 형태는 “Tempo settlement를 기본 강점으로 가진 multi-rail payment coordination layer”에 가깝다.

## 2. MPP는 어떻게 작동하는가

MPP의 core flow는 HTTP authentication pattern을 결제로 확장한다. 클라이언트나 에이전트가 리소스를 요청하면 서버는 결제가 필요하다는 HTTP 402와 payment challenge를 반환한다. 클라이언트는 해당 challenge를 충족하는 credential을 만들고, 다시 요청하면서 Authorization: Payment credential을 붙인다. 서버는 결제 또는 권한을 검증한 뒤 리소스와 Payment-Receipt를 반환한다.[^s01][^s04][^s11]

이 구조는 “결제 페이지로 redirect”하는 모델과 다르다. 결제 요구사항이 API response, HTTP header, JSON-RPC/MCP `_meta` 같은 machine-readable 위치에 들어가므로 에이전트가 중간 UI 없이 판단하고 실행할 수 있다.[^s04][^s08] MCP transport draft는 `tools/call`, `resources/read`, `prompts/get` 같은 작업이 payment challenge를 반환할 수 있고, 성공 응답에는 receipt metadata를 포함해야 한다고 정의한다.[^s08] MPP는 그래서 MCP tool monetization과 자연스럽게 맞물린다.

Stripe 구현에서 결제 method는 크게 두 축이다. 첫째, crypto path에서는 Stripe가 crypto PaymentIntent와 deposit address를 만들고, Tempo 네트워크의 stablecoin 입금을 감지·capture한다.[^s11][^s12] 둘째, SPT path에서는 클라이언트가 Stripe SPT를 만들고 서버가 그 token으로 PaymentIntent를 생성한다. 이 경우 카드는 물론 Link 같은 wallet, Stripe가 지원하는 다른 결제수단을 같은 MPP 흐름에 얹을 수 있다.[^s05][^s11][^s12]

Tempo method는 one-time charge와 session을 나눈다. Tempo charge draft는 amount, TIP-20 currency address, recipient, memo, split 같은 필드를 정의한다.[^s06] Tempo session draft는 on-chain escrow와 off-chain voucher를 사용해 고빈도, 저비용 streaming payment channel을 만든다. charge가 전체 금액을 upfront로 요구한다면, session은 LLM token streaming처럼 사용량이 발생할 때마다 incrementally 지불하는 모델을 겨냥한다.[^s07] Stripe Sessions 2026에서 소개된 streaming payments도 Metronome의 usage tracking과 Tempo stablecoin micropayments를 결합해 token 사용 순간마다 정산한다는 방향으로 발표됐다.[^s22]

## 3. AI Agent 결제에서 MPP가 풀려는 문제

AI 에이전트가 유용한 작업을 하려면 유료 API, 데이터, browser infrastructure, 모델 호출, compute, SaaS action을 계속 호출해야 한다. 기존 방식에서는 agent가 각 서비스마다 계정을 만들고, billing portal에서 카드 정보를 입력하고, API key를 받아 저장하고, 사용량을 관리해야 한다. Stripe는 바로 이 단계들이 human intervention을 요구해 agent가 current financial system을 쓰기 어렵다고 설명한다.[^s01] Stripe machine payments 문서도 에이전트가 API calls나 services 같은 resources에 programmatically pay할 수 있어야 한다고 설명한다.[^s10]

MPP의 제품 시장은 그래서 consumer checkout보다 agent-to-service commerce에 더 가깝다. Quicknode는 MPP를 blockchain endpoint에 대한 pay-per-request access로 제공하며, account, API key, subscription 없이 wallet을 가진 앱이나 에이전트가 RPC 호출을 할 수 있다고 설명한다.[^s19] Privy는 server wallet이 signing layer를 맡고 mppx가 402 payment flow를 자동 처리한다고 문서화했다.[^s20] Stellar도 MPP를 AI agents and APIs를 위한 programmatic per-request payments over HTTP로 설명하며 charge와 session intent를 지원한다.[^s21]

이 시장에서 핵심 primitive는 checkout button이 아니라 budget, authorization, usage metering, receipt, refund, reconciliation이다. PaymentAuth draft는 challenge binding, replay protection, idempotency, concurrent request handling, amount verification 같은 보안 요소를 포함한다.[^s04] Stripe charge draft도 SPT single-use, amount verification, HTTPS requirement, idempotency key를 다룬다.[^s05] 이는 MPP가 단순한 결제 rail이 아니라 “agent가 지불했음을 어떻게 증명하고, 같은 payment를 재사용하지 못하게 하며, 실패와 재시도를 어떻게 처리할 것인가”를 표준화하려 한다는 뜻이다.

## 4. Stripe의 AI Agent 결제 시장에 MPP를 어떻게 적용하려 하는가

Stripe가 이미 구축한 AI agent 결제 표면은 두 갈래였다. 첫째, OpenAI와의 ACP/Instant Checkout, Agentic Commerce Suite, Stripe agentic commerce docs는 AI 앱 안에서 판매자가 검색·추천·구매 완료까지 받을 수 있게 하는 retail commerce 표면이다.[^s23][^s24][^s25] 둘째, Link wallet for agents와 SPT는 사용자의 결제수단을 에이전트에게 직접 노출하지 않고 특정 task나 merchant에 제한된 권한으로 위임하는 credential layer다.[^s05][^s11][^s22]

MPP는 여기에 세 번째 표면을 붙인다. AI agent가 사람이 사는 상품이 아니라 API call, tool call, web access, LLM inference, compute, data, digital content를 구매할 때 Stripe가 payment processor, merchant operations, stablecoin settlement abstraction으로 들어가는 것이다.[^s01][^s10][^s19][^s21] Stripe의 MPP 문서는 businesses가 MPP를 쓰면 transaction이 Stripe API와 Dashboard에 일반 결제처럼 나타나고, 기존 balance, payout schedule, tax calculation, fraud protection, reporting, accounting integrations, refunds를 그대로 쓸 수 있다고 설명한다.[^s01][^s10][^s11] 이것이 Stripe의 핵심 적용 전략이다. 프로토콜은 machine-native로 열어두되, 판매자 운영은 Stripe stack 안으로 흡수한다.

Tempo는 이 전략의 settlement substrate다. Stripe 문서는 Tempo, Solana, Stripe card networks 등을 machine payments의 지원 network/protocol로 나열하지만, MPP의 Tempo path는 0.01 USDC 같은 low-dollar-value charge와 on-chain settlement에 맞춰져 있다.[^s10][^s11] Tempo의 payment lanes, stablecoin gas, memo, deterministic settlement, smart-account 기능은 sub-cent 또는 high-frequency agent payment가 기존 card economics와 맞지 않을 때 필요한 rail을 제공한다.[^s13][^s15] 동시에 Visa card MPP spec은 agent payment가 stablecoin-only로 남지 않고 card network까지 확장될 수 있음을 보여준다.[^s17]

Sessions 2026의 streaming payments 발표는 MPP 적용 방향을 가장 잘 보여준다. Stripe는 AI products가 token을 너무 빠르고 작은 단위로 소비해 기존 결제 시스템으로는 token 사용 순간마다 징수하기 어렵다고 설명한 뒤, Metronome tracking과 Tempo stablecoin micropayments를 결합한 streaming payments를 발표했다.[^s22] 이는 Stripe가 agent payments를 “상품 구매 checkout”이 아니라 “usage 발생과 payment 발생을 거의 같은 시간축에 놓는 AI-native billing primitive”로 보고 있다는 뜻이다.

## 5. 경쟁 구도: MPP, x402, AP2, network tokens

MPP의 가장 가까운 비교 대상은 x402다. Coinbase docs와 x402 Foundation은 x402를 HTTP 402를 되살린 internet-native payment protocol로 설명하며, API services, AI agents, paywalls, microservices를 주요 use case로 둔다.[^s26][^s27] x402의 강점은 permissionless onchain settlement, facilitator model, 낮은 developer friction이다.[^s26][^s27] 반면 MPP는 Payment Auth scheme, multiple payment method specs, MCP transport, discovery, Stripe SPT, Tempo session 같은 더 넓은 lifecycle machinery를 가져가려 한다.[^s03][^s04][^s07][^s08][^s09]

Google AP2는 MPP와 해결 지점이 다르다. AP2는 agent가 사용자 대신 결제할 때 authorization, authenticity, accountability를 cryptographic mandates로 증명하는 데 초점을 둔다.[^s28] 이는 retail/commerce intent 증명에 강한 접근이다. 반대로 MPP는 agent가 paid resource를 요청할 때 payment challenge와 credential/receipt를 교환하는 machine-to-service execution에 강하다.[^s04][^s08] 장기적으로는 AP2가 “누가 무엇을 허가했는가”를, MPP/x402가 “HTTP-level paid access를 어떻게 실행하는가”를 담당하는 식의 상호보완 가능성이 있다.

Visa와 Mastercard는 agent payment를 기존 네트워크 신뢰와 tokenization의 확장으로 본다. Visa는 MPP card spec을 통해 tokenized card credentials를 MPP-compatible workflow 안에 넣으려 하고, Mastercard Agent Pay는 agentic tokens와 tokenization capabilities를 강조한다.[^s17][^s29] PayPal도 OpenAI Instant Checkout에서 wallet과 merchant base를 연결하겠다고 밝혔다.[^s30] 이 경쟁은 단일 프로토콜 승자보다 “어떤 프로토콜이 어떤 rail과 risk model을 조합할 수 있는가”의 경쟁이 될 가능성이 크다.

## 6. 리스크와 열린 질문

첫 번째 리스크는 시장 성과 데이터 부족이다. Fortune은 MPP와 Tempo mainnet launch를 보도했지만, 공개적으로 검증 가능한 MPP transaction volume, payment failure rate, fraud/dispute rate, merchant ROI는 아직 제한적이다.[^s18] Quicknode도 MPP access를 alpha로 표시한다.[^s19] IMF 역시 agentic payments를 early experimentation으로 다루며 definitive conclusion을 피한다.[^s33] 따라서 “MPP가 이미 agent payment 표준이 됐다”는 주장은 현재 근거보다 앞선다.

두 번째 리스크는 보안과 권한 위임이다. Autonomous LLM agent commerce에 대한 SoK 논문은 MPP를 포함한 agent payment protocol들이 새로운 attack surface를 만든다고 지적한다.[^s31] AP2 runtime verification 논문도 replay와 context binding failure가 실제 agent runtime에서 문제가 될 수 있다고 설명한다.[^s32] MPP draft들이 challenge binding, replay protection, TLS, credential confidentiality, confused deputy를 다루는 이유도 여기에 있다.[^s04][^s08]

세 번째 리스크는 wallet/custody friction이다. Stablecoin path의 장점은 low-cost, high-frequency settlement지만, agent에게 wallet, signing key, funding, policy, spending limit를 부여해야 한다. Privy 같은 wallet infrastructure는 이 friction을 줄이려 하지만, agent spending loop나 잘못된 자동 호출이 실제 비용을 태우는 문제는 남는다.[^s20][^s31] Stripe SPT path는 카드·Link 등 기존 결제수단을 쓸 수 있게 하지만, SPT 발급과 사용자 승인 정책이 너무 자주 개입하면 agent-native UX가 약해질 수 있다.[^s05][^s11]

네 번째 리스크는 중립성이다. MPP는 open draft와 여러 payment method를 갖지만, Tempo와 Stripe가 공동 설계한 표준이고 Stripe PaymentIntents와 Dashboard를 adoption path로 삼는다.[^s01][^s04][^s05] 이는 Stripe 고객에게는 adoption friction을 낮추지만, 비Stripe PSP나 비Tempo chain 입장에서는 표준 중립성에 대한 질문을 남긴다. Stellar의 MPP support, Visa card extension, x402와의 경쟁은 이 질문을 완화하거나 더 키울 수 있다.[^s17][^s21][^s26][^s27]

## 7. 결론

Tempo MPP는 Stripe의 AI agent payment 전략을 retail checkout에서 machine-native commerce로 확장하는 핵심 조각이다. ACP, ACS, SPT가 “AI 앱 안에서 사람이 맡긴 구매를 완료”하는 흐름에 가깝다면, MPP는 “에이전트가 인터넷 서비스를 호출하며 비용을 지불”하는 흐름에 가깝다.[^s01][^s10][^s23][^s24] 이 차이는 중요하다. 전자는 seller catalog, cart, fulfillment, consumer approval이 중심이고, 후자는 API access, tool invocation, usage metering, streaming settlement, receipt/reconciliation이 중심이다.[^s08][^s09][^s19][^s22]

Stripe가 MPP를 시장에 적용하려는 방식은 세 단계로 보인다. 첫째, HTTP 402/Payment Auth/MCP transport로 agent payment의 wire protocol을 표준화한다.[^s04][^s08] 둘째, Tempo를 stablecoin settlement rail로 사용해 sub-cent, high-frequency, streaming AI usage를 처리한다.[^s07][^s13][^s22] 셋째, PaymentIntents, SPT, Link, card networks, Dashboard, fraud/tax/refund/reporting을 통해 이 machine-native payment를 기존 Stripe merchant operations 안으로 가져온다.[^s05][^s10][^s11][^s17] 성공한다면 MPP는 Stripe가 AI agent 결제 시장에서 “checkout provider”를 넘어 “agent economy의 paid-access and settlement operating layer”가 되는 경로가 된다.
