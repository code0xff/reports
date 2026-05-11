# Claims: mpp-session-mechanism

## Introduction
- [x] c01: AI 에이전트의 per-request 마이크로결제 수요와 블록체인의 트랜잭션 처리량 한계 사이의 격차가 MPP Session 설계의 직접적 동기다.
  - kind: interpretive
  - needs: MPP 공식 블로그, IETF 드래프트, mpp.dev 문서 중 1건 이상에서 설계 동기 서술
- [x] c02: MPP는 `charge`(단건 결제)와 `session`(스트리밍 채널) 두 가지 결제 intent를 정의하며, session은 오프체인 바우처로 무제한 마이크로결제를 가능하게 한다.
  - kind: technical
  - needs: mpp.dev 공식 문서 또는 IETF 드래프트
- [x] c03: MPP Session은 IETF 드래프트 draft-tempo-session-00으로 제출되어 표준화 과정에 있다.
  - kind: factual
  - needs: paymentauth.org 또는 datatracker.ietf.org의 드래프트 문서

## Background: HTTP 402 기반 결제와 MPP 프로토콜 개요
- [x] c04: MPP는 HTTP 402 Payment Required 응답과 WWW-Authenticate / Authorization 헤더를 재활용하여 결제 협상을 수행한다.
  - kind: technical
  - needs: mpp.dev 또는 IETF 드래프트
- [x] c05: Tempo 블록체인은 TIP-20 토큰 표준을 사용하며 약 500ms의 트랜잭션 확정성을 제공한다.
  - kind: technical
  - needs: tempo.xyz 공식 문서 또는 MPP 블로그
- [x] c06: Tempo 블록체인은 2D 논스(nonce) 체계와 수수료 후원(fee sponsorship) 메커니즘을 지원한다.
  - kind: technical
  - needs: tempo.xyz 공식 문서 또는 IETF 드래프트

## MPP Session 아키텍처와 설계 원칙
- [x] c07: MPP Session은 `TempoStreamChannel` 에스크로 스마트 컨트랙트를 기반으로 하며, payer가 토큰을 예치하고 서버가 최종 정산을 요청하는 구조다.
  - kind: technical
  - needs: tempo.xyz/blog/mpp-sessions 또는 IETF 드래프트 또는 컨트랙트 소스
- [x] c08: channelId는 payer, payee, token, salt, authorizedSigner, contract, chainId 등 7개 파라미터의 결정론적 해시로 파생된다.
  - kind: technical
  - needs: IETF 드래프트 draft-tempo-session-00 또는 컨트랙트 코드
- [x] c09: 채널 상태는 deposit / settled / closeRequestedAt / finalized 필드로 관리된다.
  - kind: technical
  - needs: 컨트랙트 소스 코드 또는 IETF 드래프트
- [x] c10: suggestedDeposit과 maxDeposit 파라미터를 통해 서버와 클라이언트가 예치금 규모를 협상한다.
  - kind: technical
  - needs: mpp.dev 문서 또는 IETF 드래프트

## 암호학적 바우처 메커니즘 (Voucher System)
- [x] c11: MPP Session 바우처는 EIP-712 타입 데이터 서명을 사용하며, 구조는 `Voucher(bytes32 channelId, uint128 cumulativeAmount)`이다.
  - kind: technical
  - needs: IETF 드래프트 또는 공식 블로그
- [x] c12: 바우처는 누적(cumulative) 의미론을 따르며, 각 바우처는 "지금까지 총 X 이하 인출 가능"을 승인한다. 단조 증가하지 않는 바우처는 서버가 거부한다.
  - kind: technical
  - needs: IETF 드래프트 또는 mpp.dev 문서
- [x] c13: 바우처 검증은 단일 `ecrecover` 호출로 완결되며 RPC 호출이 불필요하여 마이크로초 수준의 지연시간을 달성한다.
  - kind: technical
  - needs: 공식 블로그 또는 IETF 드래프트
- [x] c14: MPP Session은 저-s(low-s) ECDSA 서명 규칙을 강제하여 서명 가단성(malleability) 공격을 방지한다.
  - kind: technical
  - needs: IETF 드래프트 또는 컨트랙트 코드
- [x] c15: 위임 서명(Authorized Signer) 메커니즘을 통해 핫월렛 키로 바우처에 서명하고 주 자금 보관 키와 분리할 수 있다.
  - kind: technical
  - needs: IETF 드래프트 또는 공식 블로그

## Session 생명주기: Open → Consume → Top-up → Close
- [x] c16: 채널 Open은 payer가 에스크로 컨트랙트에 TIP-20 토큰을 예치하는 온체인 트랜잭션이며, 서버는 온체인 확인 후 서비스를 시작한다.
  - kind: technical
  - needs: IETF 드래프트 또는 mpp.dev 문서
- [x] c17: Consume 단계에서 클라이언트는 오프체인 바우처를 HTTP Authorization 헤더로 전송하고, 서버는 누적 금액의 단조 증가를 검증한 후 서비스를 제공한다.
  - kind: technical
  - needs: IETF 드래프트 또는 mpp.dev 문서
- [x] c18: SSE(Server-Sent Events) 스트리밍 중 잔액이 소진될 경우 서버는 `payment-need-voucher` 이벤트를 전송하여 클라이언트의 추가 바우처를 요청한다.
  - kind: technical
  - needs: IETF 드래프트 또는 mpp.dev 스트리밍 가이드
- [x] c19: Top-up은 채널을 닫지 않고 추가 예치를 통해 강제 종료 타이머를 취소할 수 있다.
  - kind: technical
  - needs: IETF 드래프트 또는 공식 블로그
- [x] c20: Cooperative Close는 서버가 `close(channelId, cumulativeAmount, sig)` 함수를 호출하여 잔액을 payer에게 환급하는 온체인 트랜잭션이다.
  - kind: technical
  - needs: IETF 드래프트 또는 컨트랙트 코드
- [x] c21: Forced Close(강제 종료)는 서버가 무응답일 때 payer가 15분 유예 기간 후 `withdraw()` 함수로 자금을 복구할 수 있는 메커니즘이다.
  - kind: technical
  - needs: IETF 드래프트 또는 공식 블로그

## 서버 구현 및 보안 고려사항
- [x] c22: 서버는 `acceptedCumulative`, `spent`, `available` 상태를 관리하며, 충돌 안전성을 위해 서비스 제공 전에 `spent`를 먼저 저장한다.
  - kind: technical
  - needs: IETF 드래프트 또는 mpp.dev 서버 구현 가이드
- [x] c23: DoS 방어를 위해 바우처 처리 속도를 ~10/s로 제한하고 최소 예치금 요건을 설정하며, 단조 증가하지 않는 바우처를 멱등(idempotent) 처리한다.
  - kind: technical
  - needs: IETF 드래프트 또는 mpp.dev 보안 가이드
- [x] c24: 재생 공격(Replay Attack) 방지는 channelId 바인딩, 누적 단조성, 온체인 강제로 구현된다.
  - kind: technical
  - needs: IETF 드래프트
- [x] c25: MPP는 RFC9457 Problem Details 형식으로 오류를 반환하며, `invalid-signature`와 `insufficient-balance` 문제 타입을 정의한다.
  - kind: technical
  - needs: IETF 드래프트 또는 mpp.dev API 문서

## 성능 특성, SDK 생태계 및 실제 적용
- [x] c26: MPP Session은 세션 중 서브-밀리초(오프체인 바우처) 지연시간을 달성하며, 단건 charge 결제의 ~500ms와 대조적이다.
  - kind: technical
  - needs: 공식 블로그 또는 IETF 드래프트 또는 벤치마크 자료
- [x] c27: MPP Session은 온체인 트랜잭션 2회(open + close)로 수천 건의 마이크로결제를 처리할 수 있어 비용 효율이 높다.
  - kind: technical
  - needs: 공식 블로그 또는 mpp.dev 문서
- [x] c28: MPP SDK 생태계는 TypeScript(mppx), Python(pympp), Rust(mpp-rs)를 포함하며, Hono, Express, Next.js 등 프레임워크 미들웨어도 제공된다.
  - kind: technical
  - needs: mpp.dev 문서 또는 GitHub 저장소
- [x] c29: Cloudflare AI Gateway는 MPP를 통합하여 에이전트 결제를 지원한다.
  - kind: factual
  - needs: Cloudflare 공식 문서 또는 발표
