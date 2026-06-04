# Outline

1. **초록 (Abstract)** — L402는 HTTP 402+macaroon+라이트닝 인보이스를 결합한 라이트닝-네이티브 결제·인증 프로토콜이며, 프로토콜 자체는 비트코인/라이트닝 전용이지만 Fewsats 등 애그리게이터 계층이 USD 표시 "offer"로 카드·온체인(USDC) 등을 병행 지원한다는 점.

2. **서론 (Introduction)** — L402(구 LSAT)의 등장 배경(2020, Lightning Labs), 본 보고서의 5개 질문(플로우/라이브러리/라이트닝 활용/타 체인/카드).

3. **결제 플로우 (Payment flow)** — 4단계(요청→402 챌린지→인보이스 결제→재요청), WWW-Authenticate 헤더, Authorization: L402 macaroon:preimage, macaroon-payment_hash 바인딩, 스테이트리스 검증.

4. **참고 라이브러리 (Reference libraries)** — 서버/프록시(Aperture, Boltwall, LSAT-middleware, Rust l402_middleware), 클라이언트(lsat-js, l402-ts, gol402, Fewsats/l402-python), 에이전트 도구(LangChainBitcoin, n8n, MCP).

5. **라이트닝 생태계 활용 (Lightning ecosystem usage)** — Lightning Loop가 Aperture로 L402 사용, Fewsats/Sherlock·Amazon MCP, AI 에이전트 결제, blip-0026 표준화 시도.

6. **타 프로토콜·비라이트닝 결제 접근 (Cross-rail support)** — 프로토콜 L402는 라이트닝 전용(blip-0026), 체인-애그노스틱 영역은 x402(USDC on Base/Solana)가 담당; Fewsats가 L402 offer를 일반화해 credit_card(Stripe checkout)+lightning, 별도 x402(USDC/Base) 플로우를 병행.

7. **논의 (Discussion)** — 프로토콜 수준 vs 애그리게이터 수준의 분리, L402 vs x402 트레이드오프(BTC 변동성·ms 정산 vs USDC·온체인 확정), 멀티-레일 혼재 현실.

8. **한계 (Limitations)** — 빠른 변동, 1차 일부 404/스냅샷 차이, Fewsats offer 스키마 버전차, 동료심사 부재.

9. **참고문헌 (References)** — sources.jsonl 기반.
