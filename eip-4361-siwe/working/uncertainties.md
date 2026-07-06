# Uncertainties — eip-4361-siwe

- **채택 규모**: SIWE 로그인 사용량의 공개 정량 지표 부재. "광범위 채택" 서술은 라이브러리 통합·상용 사례 기반의 정성 판단.
- **지갑 UI 준수율**: 스펙의 표시 의무(MUST display scheme/domain/address/statement/resources)를 실제 지갑들이 얼마나 지키는지 실측 데이터 없음. Clear Signing(ERC-7730) 논의는 생태계 전반의 서명 UX 문제를 시사하나 SIWE 특정 준수율은 미상.
- **siwe 라이브러리 감사 부재**: 참조 구현 스스로 "formal security audit 미실시"를 명시(2026-07 기준 README) — 향후 변할 수 있음.
- **학술 문헌**: SIWE 자체를 단독 분석한 피어리뷰 논문은 확인 못함. 인접 문헌(지갑 인증 SoK, OIDC 브리징)으로 보완.
- **Clear Signing과 SIWE의 관계**: ERC-7730은 트랜잭션 서명 UX 중심으로, SIWE 메시지 표시에 직접 적용되는지는 해석 여지.
