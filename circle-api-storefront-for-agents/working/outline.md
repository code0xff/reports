# Outline — Circle "API → Storefront for Agents" 분석

## 1. Abstract / 초록
- 블로그가 발표한 것의 한 줄 요약.
- 본 분석이 다루는 범위: 블로그 본문 + 참조 코드 두 갈래.

## 2. Introduction — 무엇을 발표했고 왜 중요한가
- Circle Agent Stack의 한 자리에 Gateway + x402 + USDC nanopayments가 어떻게 들어가는지.
- "API를 에이전트용 스토어프론트로" 라는 슬로건의 실체.

## 3. Background — Agent Stack과 Gateway의 자리
- 3.1 Circle Agent Stack 다섯 구성요소 복기.
- 3.2 Gateway / Nanopayments / x402의 관계.
- 3.3 Arc Testnet과 chain ID 5042002.

## 4. Architecture — 4단계 결제 흐름
- 4.1 Server: 402 발행과 x402 검증.
- 4.2 Client: 서명된 결제 인증과 retry.
- 4.3 Gateway: facilitator로서 검증·정산 기록.
- 4.4 Settle / Withdraw: Seller Wallet → Payout Wallet 인출.

## 5. Code Analysis — @circle-fin/x402-batching와 참조 GitHub
- 5.1 npm 패키지 `@circle-fin/x402-batching` 구조.
- 5.2 `createGatewayMiddleware` 사용법과 옵션.
- 5.3 클라이언트 측: `circle services pay` CLI와 `@circle-fin/agent-stack` SDK.
- 5.4 참조 GitHub 리포 정리 (circlefin/...).
- 5.5 x402 표준과의 매핑.

## 6. Comparison — Circle의 위치
- Coinbase x402 facilitator와의 차이.
- MPP `session` 인텐트와의 차이.
- x402 batch-settlement 표준과의 정합성.

## 7. Discussion — 머천트 측 설계 포인트
- USDC nanopayments(가격 단위 $0.000001)의 운영적 의미.
- Arc / EVM·Solana 멀티체인 전개.
- 에이전트 마켓플레이스의 SEO 역할(서비스 디스커버리).

## 8. Limitations
- 베타 단계·접근 제한 부분.

## 9. References — 자동 생성.
