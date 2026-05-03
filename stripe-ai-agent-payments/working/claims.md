# Claims

## C1. 시장 배경
- C1.1 (factual): 2025~2026년 주요 AI 플랫폼은 대화형 검색/추천에서 구매 실행 기능으로 확장했다. sources: s01, s02, s23, s24, s27.
- C1.2 (interpretive): 에이전트 결제의 핵심 병목은 결제망 자체보다 권한 위임, 분쟁 책임, 판매자 통합 비용이다. sources: s04, s05, s06, s17, s18, s19, s28, s29.
- C1.3 (factual): 결제 네트워크와 핀테크 기업들은 agentic commerce 또는 AI-assisted commerce를 별도 시장 기회로 명명하기 시작했다. sources: s17, s18, s19, s20, s21, s22.

## C2. Stripe 제품 표면
- C2.1 (factual): Stripe는 OpenAI와 Agentic Commerce Protocol 또는 Instant Checkout 관련 결제 인프라를 공동으로 발표했다. sources: s01, s02, s23, s24.
- C2.2 (technical): Stripe의 접근은 판매자가 기존 결제 처리 계정/통합을 활용하면서 agent-originated checkout을 받을 수 있게 설계됐다. sources: s03, s04, s05, s07, s32.
- C2.3 (technical): 결제 정보는 원 카드번호가 아니라 토큰 또는 위임 가능한 결제 자격증명으로 전달되는 구조를 강조한다. sources: s01, s05, s06, s25, s26.
- C2.4 (factual): Stripe는 agent-toolkit/MCP 등 개발자가 LLM 에이전트에서 Stripe API를 호출할 수 있는 도구를 제공한다. sources: s08, s09.
- C2.5 (factual): Bridge, Privy 등 Stripe의 인접 인수·제품은 스테이블코인 정산과 지갑 기반 상거래 옵션을 확장한다. sources: s10, s11, s12, s14, s15, s27.

## C3. 전략
- C3.1 (interpretive): Stripe는 소비자용 AI 에이전트 경쟁자가 아니라 에이전트 상거래의 acceptance and settlement layer가 되려 한다. sources: s03, s04, s07, s12, s27, s31, s32.
- C3.2 (interpretive): OpenAI와의 공동 발표는 Stripe에 초기 분배 채널과 표준 형성력을 준다. sources: s01, s02, s23, s24.
- C3.3 (interpretive): 오픈 프로토콜/오픈소스 메시지는 판매자와 플랫폼의 lock-in 우려를 완화하기 위한 시장 진입 장치다. sources: s01, s03, s05, s25, s26.

## C4. 수익 모델과 방어선
- C4.1 (interpretive): 에이전트 결제는 Stripe의 기존 결제 처리 수익뿐 아니라 Radar, Tax, Connect, Billing 등 부가 제품의 사용 범위를 넓힐 수 있다. sources: s03, s07, s14, s15, s16, s27, s30, s32.
- C4.2 (factual): Stripe는 AI 기업을 핵심 고객군으로 강조해 왔고, AI 기업 성장과 결제 인프라 수요를 연결해 설명했다. sources: s13, s16, s27, s30.
- C4.3 (interpretive): Stripe의 방어선은 모델 성능보다 판매자 네트워크, risk/fraud, 규정 준수, developer tooling에 있다. sources: s06, s08, s09, s13.

## C5. 경쟁
- C5.1 (factual): Visa, Mastercard, PayPal, Google, Coinbase 등도 AI 에이전트 결제 또는 agent-to-merchant protocol을 발표했다. sources: s17, s18, s19, s20, s21, s22.
- C5.2 (interpretive): x402 같은 HTTP-native 결제 프로토콜은 Stripe식 카드/가맹점 중심 접근과 다른 경로를 제시한다. sources: s10, s11, s21, s22.
- C5.3 (interpretive): 경쟁은 단일 결제 수단보다 “어떤 신원·권한·분쟁 표준이 채택되는가”에서 갈릴 가능성이 크다. sources: s17, s18, s19, s22, s28, s29.

## C6. 리스크
- C6.1 (factual): Stripe/OpenAI는 공개 발표에서 거래량 또는 매출 기여도를 구체적으로 공개하지 않았다. sources: s01, s02, s03, s23.
- C6.2 (interpretive): agentic commerce는 소비자 동의, unauthorized purchase, chargeback, merchant liability 리스크를 키운다. sources: s05, s06, s17, s18, s19, s28, s29.
- C6.3 (interpretive): 판매자 채택은 OpenAI 같은 초기 채널의 증분 매출, 통합 난이도, 데이터 소유권 우려에 좌우된다. sources: s02, s24, s25, s26, s27, s31, s32.
