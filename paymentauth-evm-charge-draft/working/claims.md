# Claims

## 서론 (Introduction)
- [x] c01: draft-evm-charge-00 "EVM Charge Intent for HTTP Payment Authentication"은 2026년 6월 3일자 인터넷 드래프트로, Brett DiNovi(MegaETH Labs)·Conner Swenberg(Coinbase)·Kyle Scott(Monad Foundation)가 저자다.
  - kind: factual
  - needs: 문서 메타데이터. (s01)
- [x] c02: 이 드래프트는 체인마다 별도 결제 메서드를 만들지 않고, 제어 흐름·데이터 구조·검증 로직이 동일하다는 이유로 EVM 호환 체인을 단일 'evm' 메서드로 통합한다.
  - kind: technical
  - needs: 문서 Design Rationale 인용. (s01)

## 상위 프레임워크 (Background)
- [x] c03: paymentauth.org는 Tempo의 Machine Payments Protocol(MPP) 스펙 모음을 호스팅하며, 베이스인 "Payment" HTTP 인증 스킴(draft-httpauth-payment)과 Discovery·MCP 전송·각 결제수단(Card/EVM/Solana 등) 드래프트를 포함한다.
  - kind: factual
  - needs: paymentauth.org 인덱스 + 베이스 드래프트. (s02, s03)
- [x] c04: 베이스 "Payment" 인증 스킴은 HTTP 402 위에서 동작하며 결제수단 불가지(agnostic) 설계로, 결제 method·intent를 별도 스펙·IANA 레지스트리로 등록해 코어 변경 없이 확장한다.
  - kind: technical
  - needs: draft-httpauth-payment 인용. (s03)
- [x] c05: MPP는 charge intent(일회성 거래)와 session intent(에스크로 후 서명 바우처 스트리밍)를 구분하며, evm-charge는 그중 charge intent의 EVM 바인딩이다.
  - kind: technical
  - needs: MPP 설명 + 드래프트 IANA 등록. (s05, s01)

## Charge 플로우와 헤더 (Charge flow)
- [x] c06: charge 플로우는 6단계로, 서버가 402와 함께 `WWW-Authenticate: Payment` 챌린지(id·realm·method·intent·request·expires)를 보내고, 클라이언트가 base64url 크리덴셜을 `Authorization: Payment`로 제출하면 서버가 검증·정산 후 `Payment-Receipt` 헤더와 200을 반환한다.
  - kind: technical
  - needs: 드래프트 헤더/플로우 + 베이스 스킴 파라미터. (s01, s03)
- [x] c07: 챌린지의 request에는 amount(base units)·currency(ERC-20 주소)·recipient·methodDetails(chainId(EIP-155)·credentialTypes·splits) 등이 담긴다.
  - kind: technical
  - needs: 드래프트 Request Schema. (s01)

## 크리덴셜 타입 (Credential types)
- [x] c08: 드래프트는 네 가지 크리덴셜 타입을 정의한다: permit2(권장), authorization(EIP-3009 토큰 전용), transaction, hash.
  - kind: technical
  - needs: 드래프트 Credential Schema. (s01)
- [x] c09: permit2와 authorization 타입에서는 서버가 가스를 부담하고(클라이언트는 오프체인 서명만), transaction·hash 타입에서는 클라이언트가 가스를 부담한다.
  - kind: technical
  - needs: 드래프트 가스 스폰서십 모델. (s01)
- [x] c10: 분할 결제(splits)는 permit2의 batch 전송으로 원자적으로 지원되며, hash 타입은 splits를 지원하지 않는다.
  - kind: technical
  - needs: 드래프트 splits/Settlement. (s01)

## 검증·정산·재생방지 (Verification/Settlement/Replay)
- [x] c11: permit2 정산에서 단건은 `Permit2.permitWitnessTransferFrom()`, 분할은 `permitBatchWitnessTransferFrom()`으로 호출되며 모든 전송이 원자적이다("all succeed or all revert").
  - kind: technical
  - needs: 드래프트 Settlement(Permit2). (s01)
- [x] c12: 챌린지 바인딩으로 동일 파라미터라도 서명이 다른 챌린지에 재사용될 수 없다 — permit2는 witness.challengeHash, EIP-3009는 nonce=keccak256(challenge.id||challenge.realm)로 구현한다.
  - kind: technical
  - needs: 드래프트 Security/Challenge Binding 인용. (s01)
- [x] c13: 재생방지는 타입별로 다르게 — permit2/authorization은 온체인 nonce 소비, transaction은 chainId+nonce, hash는 해시 중복 추적으로 처리한다.
  - kind: technical
  - needs: 드래프트 Replay Protection. (s01)

## 보안과 x402 관계 (Security & x402)
- [x] c14: 드래프트는 가스 스폰서십(서버 가스 부담) 시 실패 트랜잭션을 통한 DoS 위험을 지적하고 eth_call 사전 시뮬레이션을 완화책으로 권고한다.
  - kind: technical
  - needs: 드래프트 Security Considerations. (s01)
- [x] c15: MPP는 charge 레이어에서 x402와 하위 호환(backward-compatible)이라고 독립 해설이 평가하며, evm-charge의 permit2/EIP-3009 크리덴셜은 x402의 EVM 결제 방식과 같은 계열이다.
  - kind: interpretive
  - needs: 독립 MPP 해설 + 저자에 x402 저자 포함. (s05, s01)
- [x] c16: MPP/Tempo에는 중앙화 리스크 비판이 있다 — Tempo는 출범 시 중앙화된 검증자 집합을 가진 VC 투자 L1이며 Stripe 의존이 게이트키핑 우려를 낳는다.
  - kind: interpretive
  - needs: 독립 해설 비판. (s05, s06)
