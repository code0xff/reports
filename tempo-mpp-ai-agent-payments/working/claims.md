# Claims

## C1. Tempo and MPP facts
- C1.1 (factual): Tempo is a payments-focused Layer 1 incubated by Paradigm and Stripe and positioned for stablecoin payments and machine payments. sources: s13, s14, s15, s16, s18.
- C1.2 (factual): MPP was announced by Stripe and Tempo in March 2026 as an open, internet-native machine-to-machine payment standard. sources: s01, s02, s03, s04, s18.
- C1.3 (factual): Visa released a card-based MPP spec/SDK as a design partner, extending MPP beyond stablecoins. sources: s17, s18.

## C2. MPP technical model
- C2.1 (technical): MPP uses an HTTP-native request/payment-request/authorization/delivery flow for APIs, MCP tools, content, and HTTP endpoints. sources: s01, s02, s03, s04, s08, s09, s11.
- C2.2 (technical): Stripe's implementation lets businesses accept MPP payments through PaymentIntents and settle funds into existing Stripe balances. sources: s01, s05, s10, s11, s12.
- C2.3 (technical): MPP is multi-rail: stablecoins/Tempo, cards, wallets, and BNPL can be represented under the same protocol shape through Stripe/SPT and partner extensions. sources: s03, s05, s06, s11, s12, s17, s21.
- C2.4 (technical): MPP aims to support lifecycle primitives beyond one-shot payment, including recurring or streaming usage and reconciliation. sources: s03, s07, s22.

## C3. AI agent payment problem
- C3.1 (interpretive): The main AI-agent payments problem is not checkout UX but autonomous authorization, usage metering, budget control, and settlement for services agents invoke. sources: s01, s17, s31, s33.
- C3.2 (interpretive): MPP is most relevant to agent-to-service commerce: paid APIs, data, compute, tool calls, content, and per-request/usage-based billing. sources: s02, s03, s10, s19, s20, s21.
- C3.3 (interpretive): MPP pairs naturally with MCP/service discovery because agents need machine-readable paid tool invocation. sources: s03, s08, s09.

## C4. Stripe market application
- C4.1 (interpretive): MPP extends Stripe's prior AI-agent payment surface from retail agentic checkout (ACP/SPT/ACS) into machine-native commerce. sources: s01, s10, s11, s22, s23, s24, s25.
- C4.2 (interpretive): Stripe can use MPP to keep agent payments inside its existing merchant operations stack: fraud, tax, reporting, refunds, accounting, payouts. sources: s01, s05, s10, s11, s12, s23, s25.
- C4.3 (interpretive): Tempo gives Stripe a stablecoin settlement substrate for sub-cent and high-frequency agent payments while Stripe abstracts fiat/card/BNPL access. sources: s07, s11, s13, s14, s15, s16, s17, s20.
- C4.4 (interpretive): MPP creates a path for Stripe to monetize API/tool ecosystems and AI infrastructure usage, not only consumer purchases. sources: s01, s19, s21, s22.

## C5. Competition
- C5.1 (factual): x402, AP2/UCP, Visa Intelligent Commerce, Mastercard Agent Pay, and PayPal/OpenAI are active competing/complementary agent-payment efforts. sources: s17, s26, s27, s28, s29, s30.
- C5.2 (interpretive): MPP's differentiator versus x402 is broader lifecycle/multi-method integration; x402 is more minimalist HTTP 402 settlement. sources: s03, s07, s26, s27.
- C5.3 (interpretive): Visa's card extension implies MPP can become a coordination layer across incumbent networks and stablecoin rails rather than a Tempo-only protocol. sources: s17, s18, s21.

## C6. Risks
- C6.1 (factual): Public evidence on live MPP transaction volume, failure rates, fraud/dispute rates, and production merchant economics remains limited. sources: s18, s19, s33.
- C6.2 (interpretive): Agent spending loops, unauthorized actions, replay/context-binding failures, and prompt injection remain key security risks for MPP-like systems. sources: s04, s05, s08, s17, s28, s31, s32.
- C6.3 (interpretive): MPP adoption can be slowed by standard fragmentation, developer wallet/custody friction, and concern over Stripe/Tempo neutrality. sources: s13, s15, s17, s20, s26, s27, s28, s29, s33.
