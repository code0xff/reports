# Claims — x402-agentic-commerce

## 1. 서론
- [x] c01: x402 백서는 즉시·비가역 정산과 차지백 부재를 장점으로 내세웠다.
  - kind: factual
  - needs: 백서 원문
- [x] c02: auth-capture 일반 스펙은 void·refund·reclaim으로 결제를 되돌릴 수 있게 하며 exact와의 차이를 표로 명시한다.
  - kind: factual
  - needs: scheme_auth_capture.md

## 2. 아래층
- [x] c03: CPP는 감사 6건(Coinbase ProtoSec 3, Spearbit 3)을 받았고 마지막은 v1.1.0의 2026-07-22 감사다.
  - kind: factual
  - needs: README 감사 표, 저장소 audits/ 파일
- [x] c04: 운영자는 자금을 훔칠 수 없으나 검열·조기 void·최대 수수료 흡수는 가능하다(설계 문서 자인).
  - kind: factual
  - needs: docs/Security.md
- [x] c05: 에스크로 자금은 운영자별 TokenStore로 분리된다.
  - kind: technical
  - needs: Security.md, TokenStore.sol
- [x] c06: v1.1.0 테스트 스위트는 로컬에서 통과한다(포크 테스트 포함).
  - kind: technical
  - needs: forge test 실행 로그
- [x] c07: SDK의 signatureNonce는 온체인 escrow.getHash(payer=0)과 같은 값이다.
  - kind: technical
  - needs: Go SDK 계산 vs 라이브 eth_call

## 3. 위층 v1.1
- [x] c08: v1.1은 paymentFlow(escrow/authorization)와 captureMode(sync/deferred)를 도입하고 autoCapture를 제거했다.
  - kind: factual
  - needs: EVM 바인딩 스펙, changeset
- [x] c09: delegated 운영자에서 서버 보호는 페이실리테이터 검증뿐이며 스펙이 이를 "trust, not proof"로 명시한다.
  - kind: technical
  - needs: EVM 스펙
- [x] c10: capture/refund 서명은 nonce 대신 (capturable, refundable) 잔액 스냅샷으로 1회성을 얻는다.
  - kind: technical
  - needs: EVM 스펙 Single-use
- [x] c11: policy 운영자 유형은 예약만 됐고 감사·배포된 코드가 아니다.
  - kind: factual
  - needs: EVM 스펙 부록
- [x] c12: 페이실리테이터가 delegated 환불을 중계하면 자기 자금이 출처가 되므로 스펙은 별도 자금 계약 없이는 거부를 요구한다.
  - kind: technical
  - needs: EVM 스펙 Refund funding

## 4. 출하 상태
- [x] c13: 서버·페이실리테이터 SDK는 2026-10월 초 저장소에 병합됐지만 10-23 기준 어떤 릴리스 태그에도 없다.
  - kind: factual
  - needs: git log, git tag --contains, npm tarball
- [x] c14: 공식 문서 스킴 개요는 이제 auth-capture를 네 번째 스킴으로 싣는다.
  - kind: factual
  - needs: docs.x402.org/schemes/overview, sdk-features
- [x] c15: 공개 페이실리테이터 3곳은 auth-capture를 광고하지 않는다.
  - kind: factual
  - needs: /supported 직접 조회
- [x] c16: Coinbase Business 체크아웃은 auth-capture를 광고하고 Coinbase가 수 초 내 캡처하며 환불은 가맹점 잔액에서 나간다.
  - kind: factual
  - needs: CDP 문서 2건, 보도
- [x] c17: Base의 CPP 에스크로 최근 7일 이벤트 구성(authorize/charge/capture/void/refund/reclaim)과 운영자 집중도.
  - kind: factual
  - needs: 온체인 집계

## 5. 지형
- [x] c18: ACP는 환불·차지백을 가맹점과 PSP에 남긴다.
  - kind: factual
  - needs: OpenAI Delegated Payment Spec, Stripe ACP 문서
- [x] c19: AP2는 mandate로 권한을 표현하고 x402를 결제 수단 예시로 다룬다. A2A x402 확장은 v0.1이다.
  - kind: factual
  - needs: ap2-protocol.org, a2a-x402 저장소
- [x] c20: x402 실수요는 작고 상당 부분이 인위적이라는 분석이 있다.
  - kind: factual
  - needs: CoinDesk(Artemis) — 단일 출처 표시
