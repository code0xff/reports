# Outline: MPP Session 동작 메커니즘과 구현 상세 분석

## 1. Abstract (초록)
MPP Session의 핵심 개요, 설계 동기, 바우처 시스템, IETF 표준화 현황 요약.

## 2. Introduction (소개)
- AI 에이전트 대규모 마이크로결제의 요구: per-request 결제와 블록체인 처리량의 충돌
- MPP의 두 결제 모델 비교: `charge`(일회성) vs `session`(스트리밍 채널)
- 연구 범위: 공식 블로그, IETF 드래프트(draft-tempo-session-00), mpp.dev 문서, GitHub SDK

## 3. Background: HTTP 402 기반 결제와 MPP 프로토콜 개요
- HTTP 402 Payment Required 재활용: WWW-Authenticate / Authorization 헤더 흐름
- MPP의 `charge` intent: 단건 결제 흐름
- 결제 채널(Payment Channel) 패턴의 선행 기술 (Lightning Network, State Channels)
- Tempo 블록체인: TIP-20 토큰, ~500ms 확정성, 2D 논스, 수수료 후원

## 4. MPP Session 아키텍처와 설계 원칙
- TempoStreamChannel 에스크로 스마트 컨트랙트 구조
- channelId 결정론적 파생: payer, payee, token, salt, authorizedSigner, contract, chainId
- 채널 상태 모델: deposit / settled / closeRequestedAt / finalized
- "주유소 선결제" 비유: 두 번의 온체인 트랜잭션으로 무제한 오프체인 결제
- suggestedDeposit / maxDeposit 파라미터 협상

## 5. 암호학적 바우처 메커니즘 (Voucher System)
- EIP-712 타입 데이터 서명: 도메인 분리, Voucher(bytes32 channelId, uint128 cumulativeAmount)
- 누적(Cumulative) 의미론: 각 바우처는 "지금까지 총 X 이하 인출 가능" 권한 부여
- 단일 `ecrecover` 호출: 마이크로초 단위 CPU-bound 검증, RPC 호출 없음
- 표준 서명 규칙: 저-s(low-s) 규칙 강제, 가단성(malleability) 공격 방지
- 위임 서명(Authorized Signer): 핫월렛 키로 바우처 서명, 주 자금 분리

## 6. Session 생명주기: Open → Consume → Top-up → Close
- **Open**: 에스크로 컨트랙트에 TIP-20 예치, channelId 확보, 서버의 온체인 확인
- **Consume**: 오프체인 바우처 교환 → 서버: 누적 금액 단조 증가 검증 → 서비스 제공
- **Streaming Pause**: `payment-need-voucher` SSE 이벤트로 잔액 고갈 알림
- **Top-up**: 채널 닫지 않고 추가 예치, 강제 종료 타이머 취소
- **Cooperative Close**: 서버가 `close(channelId, cumulativeAmount, sig)` 호출, 잔액 환급
- **Forced Close**: 서버 무응답 시 15분 유예 → payer `withdraw()` 복구

## 7. 서버 구현 및 보안 고려사항
- 서버 사이드 회계: acceptedCumulative / spent / available 상태 관리
- 충돌 안전성: `spent` 먼저 저장 후 서비스 제공 (선불 선기록 원칙)
- DoS 방어: 바우처 속도 제한(~10/s), 최소 예치금, 논-어드밴싱 바우처 멱등 처리
- 재생 공격(Replay) 방지: channelId 바인딩, 누적 단조성, 온체인 강제
- 충돌 복구: Idempotency-Key 헤더, (challengeId, key) 캐싱
- RFC9457 오류 응답: invalid-signature, insufficient-balance 문제 타입

## 8. 성능 특성, SDK 생태계 및 실제 적용
- 지연 시간: 세션 중 서브-밀리초(오프체인 바우처) vs 단건 결제 ~500ms
- 비용 효율: 온체인 트랜잭션 2회(open + close)로 수천 회 마이크로결제 처리
- SDK: TypeScript(mppx), Python(pympp), Rust(mpp-rs), 프레임워크 미들웨어(Hono, Express, Next.js)
- 실제 사례: LLM 추론 마켓플레이스, 실시간 데이터 피드, IoT 마이크로트랜잭션
- Cloudflare AI Gateway MPP 통합, Privy 위임 지갑 연동

## 9. 한계 및 불확실성 (Limitations)
- IETF 드래프트 단계: 6개월 갱신 없으면 만료, 최종 표준까지 수년 소요 가능
- 위임 서명 키 탈취 시 채널 전체 예치금 손실 위험
- 강제 종료 15분 유예 기간 중 서버 도주(rug) 위험
- Tempo 블록체인 단일 의존성 (현재 세션은 Tempo/EIP-712 기반만)
- 독립 보안 감사 미공개
