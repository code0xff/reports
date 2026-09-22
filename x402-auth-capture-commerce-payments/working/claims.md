# Claims

## 서론
- [x] c01: x402의 기존 스킴(exact, upto, batch-settlement)은 결제가 원자적·최종적이어서 취소·환불이 필요한 커머스에 맞지 않으며, auth-capture는 그 공백을 메우려는 스킴이다.
  - kind: interpretive
  - needs: 스킴 문서 + 논문/README

## Commerce Payments Protocol
- [x] c02: CPP는 "전통적 승인-캡처 결제 흐름을 모방하는 온체인 결제용 퍼미션리스 프로토콜"이며 Coinbase와 Shopify의 공동 작업으로 2025년 6월 Base에 출시됐다.
  - kind: factual
  - needs: README + Shopify/Base 블로그
- [x] c03: CPP의 연산은 authorize, capture, charge, void, reclaim, refund 여섯 개이며, 승인 시 자금이 에스크로로 들어가고 캡처 시 수취인에게 나간다.
  - kind: technical
  - needs: README + 블로그
- [x] c04: 스마트컨트랙트는 "자금이 승인되면 이후 캡처할 수 있도록 보류된다"를 강제한다.
  - kind: technical
  - needs: Base 블로그
- [x] c05: 오퍼레이터는 페이어의 원래 결제 의도를 수정할 수 없고, 에스크로에 자금을 묶어둘 수 없으며, 다른 오퍼레이터의 활동에 영향을 줄 수 없다.
  - kind: technical
  - needs: Base 블로그 + Shopify
- [x] c06: 토큰 수집은 ERC-3009, Permit2, allowance, spend permission 등 복수 방식을 컬렉터 컨트랙트로 지원한다.
  - kind: technical
  - needs: README + 배포 주소
- [x] c07: v1.1.0 배포에는 AuthCaptureEscrow와 네 종류의 컬렉터 컨트랙트가 있고, Spearbit과 Coinbase Protocol Security의 감사 5건을 받았다.
  - kind: factual
  - needs: README + 감사 문서
- [ ] c08: 2026년 2월 말 기준 CPP의 누적 정산 규모는 약 170만 USDC, 약 8,000건, 가맹점 5,700곳 이상으로 보도됐다.
  - kind: factual
  - needs: 보도 2건

## x402 auth-capture 스킴
- [x] c09: auth-capture 스킴은 "Base의 감사받은 Commerce Payments Protocol 위에 구축된, x402에 환불 가능 결제를 추가하는" 것이다.
  - kind: technical
  - needs: README
- [x] c10: 클라이언트는 ERC-3009(기본) 또는 Permit2 페이로드에 서명하며, 그 nonce는 페이어 무관 PaymentInfo 해시다.
  - kind: technical
  - needs: README + Go 패키지 문서
- [x] c11: PaymentInfo는 operator, payer, receiver, token, maxAmount, 수수료 범위(min/maxFeeBps), 세 개의 만료 시각(preApprovalExpiry, authorizationExpiry, refundExpiry), salt를 담는다.
  - kind: technical
  - needs: Go 패키지 문서 + 컨트랙트
- [x] c12: requirements.extra의 필수 필드는 captureAuthorizer, feeRecipient, captureDeadline, refundDeadline, minFeeBps, maxFeeBps, name, version이고, 선택 필드에 assetTransferMethod, authCaptureEscrow, receiverAuthorizer, policy가 있다.
  - kind: technical
  - needs: README
- [x] c13: receiverAuthorizer 또는 policy가 0이 아니면 클라이언트는 무작위 saltNonce와 두 주소에 커밋하는 keccak salt를 만들어 salt 바인딩을 켠다.
  - kind: technical
  - needs: README + Go 문서
- [x] c14: 자금은 merchant에게 직접 가지 않고 captureAuthorizer 역할 아래 에스크로에 머물며, 최종 정산 전에 capture/void/refund가 가능하다.
  - kind: technical
  - needs: README

## 현재 상태
- [x] c15: 2026년 9월 기준 auth-capture는 클라이언트만 출하됐고 서버·페이실리테이터 지원은 "이후 릴리스 예정"이다.
  - kind: factual
  - needs: README + Go 문서
- [ ] c16: auth-capture는 docs.x402.org의 공식 스킴 개요 페이지에 등재돼 있지 않다(exact, upto, batch-settlement만 등재).
  - kind: factual
  - needs: 스킴 문서 + 대조
- [x] c17: 스킴은 TypeScript와 Go SDK 양쪽에 구현돼 있으며 commerce-payments v1.0과 v1.1 배포를 선택할 수 있다.
  - kind: technical
  - needs: Go 문서 + README
- [ ] c18: 지원 네트워크는 Base 메인넷(eip155:8453)과 Base Sepolia(eip155:84532)뿐이다.
  - kind: factual
  - needs: README + constants

## 확장 제안과 인접 작업
- [x] c19: 2026년 8월 6일 이슈 #3065가 "검증 통과 시 캡처, 실패 시 void"하는 검증 게이트 릴리스 정책 프로파일을 제안하고 PR #3066이 뒤따랐으나, 리뷰에서 세 가지 설계 문제가 지적돼 PR은 닫혔다.
  - kind: factual
  - needs: 이슈 + PR
- [ ] c20: ASP 논문(2026-09-02)은 x402의 원자적 모델이 "계량 접근에는 맞지만 커머스에는 실패한다"고 보고, CPP가 표준화한 온체인 승인-캡처 에스크로 위의 응용 프로파일을 제안한다.
  - kind: factual
  - needs: arXiv
- [ ] c21: Stripe의 x402 문서는 `exact` 스킴과 예치 주소·PaymentIntent 기록만 다루며 auth-capture나 에스크로는 언급하지 않는다.
  - kind: factual
  - needs: Stripe 문서 직접 확인

## 분석
- [ ] c22: auth-capture는 원자성을 포기하는 대신 시간(세 개의 만료)과 역할(operator, captureAuthorizer, receiverAuthorizer)을 도입하며, 이는 신뢰 경계를 늘린다.
  - kind: interpretive
  - needs: 문서 종합
- [ ] c23: 클라이언트만 출하된 현 상태에서 실제 결제를 끝내려면 페이실리테이터가 CPP를 직접 호출해야 하므로, 스킴의 상호운용 가치는 아직 실현되지 않았다.
  - kind: interpretive
  - needs: README + 스킴 문서 부재
