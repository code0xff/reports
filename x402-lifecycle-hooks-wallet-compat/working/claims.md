# Claims

## 서론
- [x] c01: x402 V2는 "라이프사이클 훅"을 명시적 기능으로 도입했고, 공식 문서는 이를 Advanced Concepts 아래 Lifecycle Hooks와 Wallet Compatibility 두 페이지로 문서화한다.
  - kind: factual
  - needs: V2 발표 + llms.txt 색인

## Lifecycle Hooks
- [x] c02: x402ResourceServer는 onBeforeVerify, onAfterVerify, onVerifyFailure, onBeforeSettle, onAfterSettle, onSettleFailure, onVerifiedPaymentCanceled 일곱 훅을 제공하며 before 훅은 {abort}/{skip}, failure 훅은 {recovered}를 반환할 수 있다.
  - kind: technical
  - needs: 공식 문서
- [x] c03: settle 훅은 phase 컨텍스트(before-handler, after-handler, cancel)를 받으며, onVerifiedPaymentCanceled는 검증됐지만 정산되지 않은 결제(핸들러 예외 등)에 발동한다.
  - kind: technical
  - needs: 공식 문서 + 예제
- [x] c04: HTTP 서버에는 onProtectedRequest(grantAccess로 결제 우회, abort로 403), 클라이언트에는 onBeforePaymentCreation/onAfterPaymentCreation/onPaymentCreationFailure/onPaymentResponse, HTTP 클라이언트에는 onPaymentRequired가 있다.
  - kind: technical
  - needs: 공식 문서
- [x] c05: 페이실리테이터 훅은 서버 훅과 같은 여섯 개를 미러링하며, 문서가 드는 용도는 bazaar 카탈로그 채우기, 컴플라이언스, 메트릭이다.
  - kind: technical
  - needs: 공식 문서
- [x] c06: 문서는 지출 한도에 훅 대신 클라이언트 설정의 spendControls를 쓰라고 권하며, 이는 훅보다 먼저 실행된다.
  - kind: technical
  - needs: 공식 문서
- [x] c07: MCP 클라이언트/서버 래퍼에도 별도 훅(onPaymentRequired/onBeforePayment/onAfterPayment; onBeforeExecution/onAfterExecution/onAfterSettlement)이 있다.
  - kind: technical
  - needs: 공식 문서
- [ ] c08: 커뮤니티는 onBeforeSettle 훅으로 행동 기반 신뢰 점수 확장을 제안했다(이슈 #2299).
  - kind: factual
  - needs: GitHub 이슈 + 2번째 출처
- [x] c09: Python SDK는 2.16.0(2026-07-17)에서 after-verify 훅의 abort와 정리(after_verify_aborted)를 추가했고, TS·Go도 체이닝을 지원한다.
  - kind: technical
  - needs: CHANGELOG + pkg.go.dev

## Wallet Compatibility
- [x] c10: 문서는 지갑을 A(EOA), B(배포된 ERC-4337), C(반사실적 ERC-6492), D(7702 관대 위임), E(7702 엄격 위임) 다섯 유형으로, 스킴 경로를 exact EIP-3009, exact Permit2, upto Permit2, batch deposit ERC-3009, batch deposit Permit2 다섯으로 나눈 매트릭스를 제시한다.
  - kind: technical
  - needs: 공식 문서
- [x] c11: A·B·D는 모든 경로를 지원하고, C는 EIP-3009 경로(exact, batch deposit)만 지원하며, E는 어떤 경로도 지원하지 않는다.
  - kind: technical
  - needs: 공식 문서
- [x] c12: C가 Permit2 경로를 못 쓰는 이유는 Permit2의 permitWitnessTransferFrom이 정산 시 payer의 isValidSignature를 호출하는데 Permit2 경로는 지갑을 먼저 배포하지 않기 때문이다.
  - kind: technical
  - needs: 공식 문서 + Permit2 소스
- [x] c13: E가 실패하는 이유는 x402가 signTypedData로 만든 원시 65바이트 ECDSA를 엄격 위임 컨트랙트가 거부하기 때문이다.
  - kind: technical
  - needs: 공식 문서 + ERC-7702
- [x] c14: 반사실적 지갑 정산은 eip6492AllowedFactories 허용목록에 팩토리가 있을 때만 배포하며, 기본값은 "공격자가 제어하는 트랜잭션 주입"을 막기 위해 차단이다.
  - kind: technical
  - needs: 공식 문서 + CHANGELOG
- [x] c15: 2026-06-26 Python SDK 2.14.0은 "verify를 통과한 결제는 settle에서도 성공한다"는 불변식을 목표로 사전 검증이 온체인 서명 검사를 미러링하게 바꿨다.
  - kind: factual
  - needs: CHANGELOG + 2번째 출처

## 기반 표준
- [x] c16: EIP-1271은 컨트랙트가 isValidSignature로 서명을 검증하게 하고, EIP-6492는 아직 배포되지 않은 컨트랙트의 서명을 32바이트 매직 접미사와 universal validator로 검증하게 한다.
  - kind: technical
  - needs: EIP 원문 2건
- [x] c17: EIP-3009 transferWithAuthorization은 원래 EOA ECDSA용이었고, Circle FiatToken v2.2에서 EIP-1271 컨트랙트 서명 지원이 추가됐다.
  - kind: technical
  - needs: EIP-3009 + Circle 저장소
- [x] c18: ERC-7702는 EOA에 코드를 위임하며, 위임 대상 컨트랙트가 EIP-1271 검증 방식을 정하므로 같은 EOA라도 위임체에 따라 x402 호환성이 갈린다.
  - kind: technical
  - needs: EIP-7702 + 공식 문서
- [x] c19: ERC-4337 스마트월렛의 x402 사용 요청은 2025년 GitHub 이슈(#639)로 제기됐고, 당시에는 EIP-3009가 EOA 서명을 요구한다는 것이 장애로 지목됐다.
  - kind: factual
  - needs: 이슈 + 보도/블로그

## 분석
- [x] c20: 훅은 결제 흐름을 바꾸는 권한(abort/skip/recovered/grantAccess)을 서버·페이실리테이터 코드에 주므로, 훅 등록 지점이 새로운 신뢰 경계다.
  - kind: interpretive
  - needs: 문서 종합
- [x] c21: 팩토리 allowlist는 반사실적 배포를 "정산 트랜잭션 안에서 임의 코드를 실행하는" 통로로 만들지 않기 위한 유일한 게이트다.
  - kind: interpretive
  - needs: 문서 + CHANGELOG
