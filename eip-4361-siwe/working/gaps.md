# Gaps — eip-4361-siwe

## Iteration 1 (2026-07-06) 이후 상태

### 해소된 갭
- 스펙 원문 세부(ABNF, MUST/SHOULD, 검증 절차, 보안 섹션) 확보(s01).
- 표준화 이력: login.xyz(s02) + Spruce 블로그(s03) + Cointelegraph(s04)로 EF/ENS RFP → Spruce 선정 교차 확인.
- 참조 구현(s05)·siwe-oidc(s06)·RainbowKit 통합(s10)·Monerium 규제권 채택(s09).
- 보안: ERC-1271 리플레이 실사례(s07), 블라인드 서명→Clear Signing(s11), 프라이버시 연결성(s08).
- 파생 표준: CAIP-122(s12), SIWS(s13), x402 SIWX(s14). 패스키 결합: Base docs(s18)+EIP-6492(s17).
- 학술: ACM 브리징(s15, access-limited), SoK 지갑 인증(s16).

### 남은 갭 (수용)
- ACM 논문 원문 403 → 초록 수준 인용 (Limitations).
- SIWE 채택의 정량 지표(로그인 수 등)는 공개 통계 없음 → 정성적 채택 신호(라이브러리 통합, 상용 사례)로 대체.
- siwe TS 라이브러리 "보안 감사 미실시" 자인(s05)은 리스크로 본문 반영.

### 소스 충돌
- 없음(현재까지). 스펙 원문과 2차 소스 서술 일치.

**판단: 드래프트 진행 가능.**
