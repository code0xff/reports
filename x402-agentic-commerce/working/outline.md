# Outline — x402-agentic-commerce

배경 리포트: ../x402-auth-capture-commerce-payments (2026-09-22). 이번 리포트는 그 이후의 변화와 에이전트 커머스 관점에 집중한다.

## 초록
## 1. 서론 — "되돌릴 수 없음"을 팔던 프로토콜이 되돌림을 들이다
- 백서(2025)의 "no chargebacks" 판매 문구 vs 커머스의 요구
## 2. 아래층: Commerce Payments Protocol을 직접 돌려 보기
- 에스크로·컬렉터·TokenStore 분리, 운영자 위협 모델(Security.md)
- 감사 6건 확정, forge 테스트 재현, SDK↔온체인 해시 대조
## 3. 위층: auth-capture v1.1 스펙
- paymentFlow(escrow/authorization), captureMode(sync/deferred)
- operatorType: delegated / custom / (예약) policy — 신뢰의 스펙트럼
- 동의(receiverAuthorizer)와 상태 스냅샷 기반 1회성, 수수료 상한, 환불 자금
## 4. 출하 상태: 코드, 배포판, 서비스
- 병합 vs 미배포(npm/Go 태그), 공개 페이실리테이터 /supported
- Coinbase Business 체크아웃: 실제 auth-capture 운영 사례
- Base 온체인 7일 실측
## 5. 에이전트 커머스 지형 안의 x402
- ACP(환불은 PSP), AP2(mandate, x402 확장), x402의 자리
- 수요 논쟁(CoinDesk/Artemis)
## 6. 논의
## 7. 한계
