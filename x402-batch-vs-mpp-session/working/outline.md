# Outline — x402 batch-settlement vs MPP session

## 1. Abstract / 초록
- 두 표준이 풀려는 같은 문제(에이전트·머신용 마이크로결제의 온체인 지연), 다른 답.
- 본 비교가 가져가는 6개 축.

## 2. Introduction — 두 표준이 같이 풀려는 문제
- 단건 온체인 결제(`exact`, `transferWithAuthorization`)의 한계: 지연 + 가스 + 1-of-N 정산.
- 채널/세션 추상이 등장한 이유.
- x402와 MPP가 어떻게 갈라졌는가.

## 3. Background — 공통 토대
- 3.1 HTTP 402 + 헤더 / 챌린지-리트라이 사이클.
- 3.2 EIP-712 / EIP-3009 / Permit2 같은 서명 프리미티브.
- 3.3 x402와 MPP의 거버넌스(x402 Foundation, IETF draft).

## 4. x402 batch-settlement 심층 분석
- 4.1 스킴 정의 (`batch-settlement` on EVM)와 V2 spec.
- 4.2 세 가지 배치 동작: claim / settle / refund.
- 4.3 에스크로/디포짓 정책(3× 최소, 5× 기본).
- 4.4 누적 바우처 구조와 상태 머신.
- 4.5 facilitator·channel manager의 책임.

## 5. MPP session 심층 분석
- 5.1 MPP `session` intent와 `TempoStreamChannel` 에스크로.
- 5.2 EIP-712 누적 바우처 구조.
- 5.3 채널 생명주기: open / settle vouchers / close / dispute.
- 5.4 server-side accounting / off-chain validation.

## 6. 비교 — 6개 축
- 결제 단위 / 신뢰 모델 / 다체인성 / 거버넌스 / 정산 트리거 / 분쟁 및 환불.

## 7. Implementation Patterns — 코드 레벨 톺아보기
- 7.1 x402 server-side `paymentMiddleware` + batch-settlement 옵션.
- 7.2 channel manager의 claim/settle/refund 콜 예시.
- 7.3 MPP session client/server SDK 코드 흐름.
- 7.4 TempoStreamChannel 컨트랙트 호출 시퀀스.

## 8. Discussion — 설계 트레이드오프와 어느 표준을 언제 쓰는가
- 단일 머천트 vs N×M 가맹점.
- 가스/스루풋/지연/UX.
- 표준 단편화와 어댑터 합쳐짐 가능성.

## 9. Limitations
- 코드 인용은 메인 브랜치 README/spec 기반.
- IETF draft / spec이 빠르게 변동 중.

## 10. References — 자동 생성.
