# Outline — x402 auth-capture와 Base Commerce Payments

1. 초록
2. 서론 — 왜 "승인-캡처"인가: x402의 원자적 결제 모델이 커머스에서 깨지는 지점, 두 저장소의 관계(x402 스킴 ← CPP 에스크로)
3. Commerce Payments Protocol — 출범(Coinbase·Shopify, 2025-06), 여섯 연산(authorize/capture/charge/void/reclaim/refund), 에스크로 보증, 오퍼레이터가 할 수 없는 세 가지, 토큰 컬렉터, 수수료, 감사와 배포 주소, 실사용 규모
4. x402 auth-capture 스킴 — PaymentInfo 구조와 세 개의 만료 시각, 페이어 무관 해시를 nonce로 쓰는 바인딩, ERC-3009/Permit2 페이로드, extra 필드, salt 바인딩, 지원 네트워크
5. 현재 상태 — 클라이언트만 출하되고 서버·페이실리테이터는 미출하, 공식 스킴 문서 미등재, Go/TS SDK 병행, v1.0/v1.1 배포 선택
6. 확장 제안과 인접 작업 — 검증 게이트 릴리스 정책(이슈 #3065/PR #3066), ASP 논문, x402r, Stripe·AWS의 환불 경로
7. 분석 — 신뢰 모델(누가 무엇을 할 수 있나), 원자성을 포기해 얻는 것과 잃는 것, 에이전트 커머스에서 이 스킴이 여는 것, 미해결
8. 한계
9. 참고문헌(자동)
