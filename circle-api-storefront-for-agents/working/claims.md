# Claims — Circle "API → Storefront for Agents"

## Introduction
- [ ] c01: 2026년 5월 18일자 Circle 블로그 "Turn Your API into a Storefront for Agents"는 Circle Agent Stack 안에서 Gateway + x402 흐름으로 API를 USDC로 과금할 수 있다는 사용 사례를 1차 자료로 발표했다.
  - kind: factual
  - needs: 블로그 본문

## Background
- [ ] c02: Circle Agent Stack은 Agent Wallets, Agent Marketplace, Circle CLI, Nanopayments(Circle Gateway), Circle Skills의 5개 구성요소로 정의된다.
  - kind: factual
  - needs: Circle Agent Stack 발표 페이지
- [ ] c03: Gateway는 x402 facilitator 역할을 하며, Arc Testnet(chain ID 5042002)에서 USDC nanopayments를 처리한다.
  - kind: technical
  - needs: 블로그 + Gateway docs
- [ ] c04: Circle Nanopayments는 가격 단위 $0.000001까지 다룰 수 있는 gas-free USDC 전송 프로토콜이다.
  - kind: technical
  - needs: Circle Agent Stack 발표

## Architecture
- [ ] c05: 블로그가 정의하는 결제 흐름은 (1) 에이전트가 보호 자원 요청 → (2) 402 응답에 결제 요구사항 포함 → (3) 에이전트가 서명된 결제 인증으로 재시도 → (4) Gateway가 검증·정산 후 Seller Gateway Balance에 기록 → (5) Seller가 Payout Wallet으로 인출 의 5단계다.
  - kind: technical
  - needs: 블로그 본문
- [ ] c06: 서버 측 통합은 Express 미들웨어 `createGatewayMiddleware`로 한 줄 추가 형태로 라우트별 가격을 선언한다.
  - kind: technical
  - needs: 블로그 코드 예시
- [ ] c07: 클라이언트 측 CLI 명령은 `circle wallet create/list`, `circle gateway deposit/balance/withdraw`, `circle services pay`로 구성된다.
  - kind: technical
  - needs: 블로그 CLI 인용

## Code Analysis
- [ ] c08: 서버 미들웨어는 npm 패키지 `@circle-fin/x402-batching/server`의 `createGatewayMiddleware`를 import한다.
  - kind: technical
  - needs: 블로그 코드 + npm 페이지
- [ ] c09: `createGatewayMiddleware` 설정은 `sellerAddress`, `facilitatorUrl`(`https://gateway-api-testnet.circle.com`), `networks`(`["eip155:5042002"]`) 세 필드를 갖는다.
  - kind: technical
  - needs: 블로그 코드 인용
- [ ] c10: `gateway.require("$0.001")`처럼 USD 가격을 문자열로 받는다.
  - kind: technical
  - needs: 블로그 코드 인용
- [ ] c11: Circle은 관련 코드/예제를 circlefin 조직 또는 별도 코드 리포에서 호스팅한다.
  - kind: factual
  - needs: GitHub circlefin 조직 페이지

## Comparison
- [ ] c12: Circle Gateway는 Coinbase가 호스팅하는 x402 facilitator와 동일한 표준(`/verify` + `/settle` REST 엔드포인트)을 따른다.
  - kind: technical
  - needs: x402 docs + 블로그
- [ ] c13: Circle의 `@circle-fin/x402-batching`는 이름에서 보이듯 x402의 batch-settlement 스킴을 채택한다.
  - kind: technical
  - needs: 블로그 + npm 패키지 메타
- [ ] c14: MPP `session` 인텐트와는 채널 구조가 다르며, Circle은 x402 표준 진영에 합쳐지는 위치다.
  - kind: interpretive
  - needs: 블로그 + 자매 보고서

## Discussion
- [ ] c15: 에이전트 마켓플레이스(`https://marketplace.circle.com` 등)는 SEO를 대체하는 서비스 디스커버리 역할을 한다.
  - kind: interpretive
  - needs: Circle 블로그 / 마켓플레이스 페이지
- [ ] c16: Circle Wallets와 Agent Stack은 Circle Technology Services, LLC(CTS)가 소프트웨어 제공자로서 운영하며, 규제 받는 금융·자문 서비스가 아니라는 점이 블로그에 명시되어 있다.
  - kind: factual
  - needs: 블로그 disclaimer
