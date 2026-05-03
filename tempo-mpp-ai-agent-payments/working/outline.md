# Tempo MPP와 AI Agent 결제 — outline

## 1. 초록
- 핵심 결론: MPP는 Tempo의 stablecoin settlement와 Stripe의 merchant/payment rails를 연결해 agent-to-service 결제를 HTTP-native flow로 표준화하려는 시도다.
- Stripe 적용 관점: ACP/SPT/ACS가 소비자·판매자 commerce에 가깝다면, MPP는 API, MCP tool, compute, data, recurring/streaming usage 같은 machine-native 결제 표면을 Stripe 시장으로 끌어오는 장치다.

## 2. Tempo와 MPP의 배경
- Tempo: Stripe/Paradigm이 인큐베이트한 payments-focused L1.
- MPP: Tempo와 Stripe가 공동 저술한 Machine Payments Protocol.
- 출시 타이밍: Tempo mainnet 및 Stripe MPP 발표, Visa card extension 등.

## 3. MPP의 작동 모델
- HTTP-addressable endpoint가 payment request를 반환하고 agent가 authorize한 뒤 resource가 delivered 되는 흐름.
- stablecoin, card, wallet, BNPL 등 multi-rail 구조.
- PaymentIntents, SPT, x402, Tempo stablecoin rail과의 관계.
- sessions, recurring, streaming, reconciliation 같은 lifecycle primitive.

## 4. AI Agent 결제에서 해결하려는 문제
- API key/onboarding/payment UI 없이 agent가 paid API/tool/content/compute를 사용할 수 있게 함.
- MCP tool and service discovery, command-line commerce, usage-based billing.
- budget, authorization, fraud, refunds, reporting, tax/accounting.

## 5. Stripe AI Agent 결제 시장 적용
- ACP/SPT/ACS는 agentic retail commerce; MPP는 machine-to-machine and agent-to-service commerce.
- Stripe의 기존 PaymentIntents/Dashboard/merchant balance에 붙여 adoption friction을 낮춤.
- Tempo는 low-cost stablecoin settlement rail; Stripe는 fiat/card/BNPL/risk/compliance abstraction.

## 6. 경쟁 및 표준 관계
- x402, Google AP2/UCP, Visa Intelligent Commerce/Trusted Agent Protocol, Mastercard Agent Pay, PayPal/OpenAI와 비교.
- MPP의 차별점: multi-method, lifecycle-aware, Stripe merchant rails, Tempo settlement.
- 표준 분열과 상호운용성 리스크.

## 7. 리스크와 열린 질문
- 실제 사용량과 merchant adoption 공개 부족.
- agent authorization, spending-loop, prompt injection, replay/context binding.
- stablecoin regulation, custody/wallet UX, network neutrality.
- Tempo 의존성과 Stripe 중심성.

## 8. 결론
- MPP는 Stripe의 agentic commerce 전략을 retail checkout에서 machine-native commerce로 확장한다.
- 승부는 표준 자체보다 “agent payment lifecycle을 Stripe 운영 시스템 안에서 처리할 수 있는가”에 있다.
