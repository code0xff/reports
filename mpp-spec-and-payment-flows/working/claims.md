# Claims — MPP Spec and Payment Flows

## Introduction
- [ ] c01: MPP는 HTTP 402 위에 challenge → credential → receipt의 3단계 흐름을 정의하는, payment-method agnostic한 기계-기계 결제 프로토콜이다.
  - kind: technical
  - needs: mpp.dev + IETF draft

## The Payment HTTP Authentication Scheme
- [ ] c02: MPP의 기반 표준은 IETF draft-ryan-httpauth-payment-01이며 저자는 Tempo Labs(Brendan Ryan, Jake Moxey, Tom Meagher)와 Stripe(Jeff Weinstein, Steve Kaliski)다.
  - kind: factual
  - needs: IETF draft
- [ ] c03: WWW-Authenticate: Payment 챌린지는 id, realm, method, intent, request(JCS-serialized base64url JSON) 필수 파라미터와 expires, digest, description, opaque 선택 파라미터를 가진다.
  - kind: technical
  - needs: IETF draft
- [ ] c04: Authorization: Payment credential은 challenge, source(선택, DID), payload(method-specific proof) 세 필드를 base64url JSON으로 담는다.
  - kind: technical
  - needs: IETF draft
- [ ] c05: 성공(2xx) 응답에만 Payment-Receipt 헤더(status/method/timestamp/reference)가 발급된다.
  - kind: technical
  - needs: IETF draft
- [ ] c06: MPP는 402(결제 장벽), 401(결제와 무관한 인증 실패), 403(결제 성공 but 정책상 거부)을 명확히 구분하고, 실패는 RFC 9457 Problem Details로 반환한다.
  - kind: technical
  - needs: IETF draft + mpp.dev
- [ ] c07: intent와 method는 각각 별도 레지스트리로 관리되며, method spec은 식별자·request schema·payload schema·verification procedure를 정의해야 한다.
  - kind: technical
  - needs: IETF draft + mpp.dev/protocol
- [ ] c08: 스펙은 TLS 1.2 이상을 강제하고, credential을 로그·에러·분석에 남기는 것을 금지한다.
  - kind: technical
  - needs: IETF draft

## Intents
- [ ] c09: charge intent는 amount, currency 필수 + description/expires/externalId/recipient 선택 필드를 가지며, methodDetails로 method별 필드를 확장한다.
  - kind: technical
  - needs: mpp.dev/intents/charge
- [ ] c10: session intent는 에스크로 디포짓 + 오프체인 누적 voucher 교환 + 종료 시 단일 정산의 스트리밍 채널이다.
  - kind: technical
  - needs: mpp.dev + formo
- [ ] c11: subscription intent는 amount, currency, periodCount, periodUnit(day/week/month)을 받아 한 번의 권한으로 주기당 최대 1회 과금하고 subscriptionId를 receipt에 담는다.
  - kind: technical
  - needs: mpp.dev/intents/subscription
- [ ] c12: subscription의 subscriptionId만으로는 접근이 허용되지 않으며, 서버는 세션/계정 컨텍스트를 추가로 적용해야 한다.
  - kind: technical
  - needs: mpp.dev/intents/subscription

## Payment Methods
- [ ] c13: MPP가 등록·지원하는 결제 방식은 Tempo(스테이블코인), Stripe(SPT/card/wallet), Lightning, Solana, Stellar(SEP-41), Monad, RedotPay, Card, Custom을 포함한다.
  - kind: factual
  - needs: mpp.dev + Cloudflare docs
- [ ] c14: Stripe method는 crypto(Tempo on-chain)와 fiat(SPT) 두 갈래로 나뉘며, fiat는 Shared Payment Token으로 카드/지갑을 지원한다.
  - kind: technical
  - needs: Stripe docs
- [ ] c15: Stellar session method는 Soroban 컨트랙트에 ed25519 commitment 키로 디포짓 후, 오프체인 누적 commitment를 Keypair.verify()로 검증하고 종료 시 단일 트랜잭션으로 정산한다.
  - kind: technical
  - needs: Stellar docs
- [ ] c16: Tempo session method는 EIP-712 누적 voucher를 ecrecover로 검증하여 RPC 없이 sub-100ms 검증을 달성한다.
  - kind: technical
  - needs: formo + 자매 보고서

## Per-flow walkthroughs
- [ ] c17: Stripe MPP 서버는 mppx의 Mppx.create + Mppx.compose로 tempo.charge와 stripe.charge를 동시에 등록해, 하나의 402 응답에 두 개의 WWW-Authenticate: Payment 줄을 실어 보낼 수 있다.
  - kind: technical
  - needs: Stripe docs 코드
- [ ] c18: Stripe MPP는 2026-03-04.preview API 버전을 요구하고, mainnet 전환은 testnet 플래그 제거 + 라이브 profile_ networkId로 이루어진다.
  - kind: technical
  - needs: Stripe docs

## Discussion
- [ ] c19: MPP는 payment-method agnostic core(IETF draft) + method-specific extension(별도 spec)의 2계층 구조로 설계되어, Visa 같은 제3자가 카드 기반 method spec을 독립적으로 추가할 수 있다.
  - kind: interpretive
  - needs: IETF draft + mpp-specs repo
- [ ] c20: MPP는 TypeScript(mppx), Python(pympp), Rust(mpp-rs) SDK와 Hono/Express/Next.js/Elysia 미들웨어를 제공한다.
  - kind: factual
  - needs: Cloudflare docs
