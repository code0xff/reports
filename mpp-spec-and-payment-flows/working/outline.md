# Outline — MPP Spec and Payment Flows

## 1. Abstract / 초록
## 2. Introduction — MPP가 표준화하는 것
- HTTP 402 위의 challenge/credential/receipt 모델.
## 3. The "Payment" HTTP Authentication Scheme (draft)
- 3.1 저자·거버넌스·라이선스.
- 3.2 WWW-Authenticate: Payment 그래머 (id/realm/method/intent/request/expires/digest/opaque).
- 3.3 Authorization: Payment credential 구조 (challenge/source/payload).
- 3.4 Payment-Receipt 헤더.
- 3.5 상태 코드(402/401/403)와 problem 레지스트리.
- 3.6 intent / method 레지스트리.
## 4. Intents — 결제 패턴
- 4.1 charge (단건).
- 4.2 session (스트리밍 채널).
- 4.3 subscription (정기 결제).
## 5. Payment Methods — 결제 방식
- 5.1 Tempo (stablecoin, on-chain / session escrow).
- 5.2 Stripe (SPT, card/wallet/fiat).
- 5.3 Stellar (SEP-41, Soroban ed25519 channel).
- 5.4 Solana / Lightning / Card / Monad / RedotPay.
## 6. Per-flow walkthroughs — 헤더 단위 추적
- 6.1 charge × tempo.
- 6.2 charge × stripe (멀티 method 동시 제시).
- 6.3 session × tempo / Stellar.
## 7. Discussion — 설계 관찰
- payment-method agnostic core + method extension.
- SDK 생태계 (mppx / pympp / mpp-rs).
## 8. Limitations.
## 9. References — auto-generated.
