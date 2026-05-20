# Claims — x402 batch-settlement vs MPP session

## Introduction
- [ ] c01: x402와 MPP는 모두 HTTP 402 챌린지-리트라이 사이클 위에 결제 메시지를 얹는다는 같은 토대를 공유하지만, "여러 건의 마이크로결제를 하나의 온체인 정산으로 묶는다"는 문제에 대해 서로 다른 추상(off-chain channel + cumulative voucher vs session escrow + EIP-712 voucher)을 택했다.
  - kind: interpretive
  - needs: 두 표준의 1차 사양 인용
- [ ] c02: 두 표준 모두 단건(`exact`/`charge`) 결제만으로는 AI 에이전트 / API 마이크로결제 시나리오의 지연·가스 비용을 감당하기 어렵다는 문제 의식에서 출발했다.
  - kind: factual
  - needs: 각 표준 motivation 섹션

## Background
- [ ] c03: EIP-712 typed-data signing과 EIP-3009 transferWithAuthorization은 두 표준 모두에서 핵심 서명 프리미티브로 사용된다.
  - kind: technical
  - needs: 양 표준 spec
- [ ] c04: x402는 2025년 9월 x402 Foundation을 통해 거버넌스를 분리했고, MPP는 IETF에 `draft-tempo-session-00` 드래프트로 제출되었다.
  - kind: factual
  - needs: 각 거버넌스 자료

## x402 batch-settlement
- [ ] c05: x402의 `batch-settlement` 스킴은 EVM 한정이고, 단일 온체인 디포짓 → 누적 바우처 교환 → 주기적 batched on-chain operations(claim/settle/refund) 패턴을 정의한다.
  - kind: technical
  - needs: coinbase/x402 batch-settlement spec
- [ ] c06: x402 batch-settlement spec은 머천트(채널 매니저) 측에 최소 3×, 기본 5× 디포짓 멀티플라이어를 권장한다.
  - kind: technical
  - needs: spec 문서
- [ ] c07: x402 V2는 batch-settlement를 정식 스킴으로 명세에 포함하고, claim/settle/refund 동작을 별도 함수로 분리한다.
  - kind: technical
  - needs: V2 release notes 또는 spec
- [ ] c08: x402 batch-settlement는 facilitator에 부담을 두기보다, 채널 매니저(자원 서버 측)가 직접 누적 바우처를 보관·정산하는 모델을 권장한다.
  - kind: technical
  - needs: spec 또는 reference impl

## MPP session
- [ ] c09: MPP `session` intent는 TempoStreamChannel 에스크로 컨트랙트에 사전 디포짓 후, EIP-712 누적 바우처를 오프체인으로 교환하는 단방향 채널을 정의한다.
  - kind: technical
  - needs: mpp.dev / IETF draft
- [ ] c10: MPP session의 모든 바우처는 동일한 채널 ID로 묶이며, 서버는 단일 ecrecover로 마이크로초 지연 안에 검증한다.
  - kind: technical
  - needs: mpp.dev session docs
- [ ] c11: TempoStreamChannel 컨트랙트는 Tempo 메인넷과 Moderato 테스트넷에 배포되어 있다(주소·체인 ID 명시).
  - kind: factual
  - needs: mpp.dev 인프라 페이지

## Comparison
- [ ] c12: x402 batch-settlement는 같은 머천트의 채널을 다중 클라이언트가 동시 사용하는 N×1 시나리오(예: API 서버)를 일차 타깃으로 한다.
  - kind: interpretive
  - needs: 양쪽 사양 비교
- [ ] c13: MPP session은 Tempo 체인의 sub-second finality·결제 메모·수수료 후원 같은 체인 네이티브 능력과 강하게 결합한다.
  - kind: technical
  - needs: Tempo 문서 / mpp.dev
- [ ] c14: 두 표준은 모두 단일 머천트 단방향 채널을 정의하며, MPP는 듀얼 채널(양방향)을 향후 확장으로만 언급한다.
  - kind: technical
  - needs: spec 명시 확인

## Implementation Patterns
- [ ] c15: x402 server-side `paymentMiddleware` (Express)에서 `batch-settlement`로 전환하려면 channel storage(file/Redis), 주기 cadence, deposit policy multiplier 세 가지를 설정해야 한다.
  - kind: technical
  - needs: x402 server docs
- [ ] c16: MPP session SDK는 (1) 401/402 챌린지 수신 (2) 에스크로 컨트랙트 deposit (3) 첫 바우처 서명 (4) 후속 바우처 누적 서명 (5) close-channel의 다섯 단계 흐름을 노출한다.
  - kind: technical
  - needs: mpp SDK README / draft

## Discussion
- [ ] c17: x402 batch-settlement와 MPP session은 모두 머천트 측 서버에 "채널 상태 보관" 책임을 둠으로써 facilitator의 운용 부담을 줄인다.
  - kind: interpretive
  - needs: 양쪽 사양에서 보관 책임 확인
- [ ] c18: 두 표준은 단기적으로 분기지만, 같은 SDK 어댑터 안에서 결합(예: x402 `scheme = mpp-session`)할 수 있다는 의견이 업계에서 제기된다.
  - kind: interpretive
  - needs: 분석가 의견 또는 PR
