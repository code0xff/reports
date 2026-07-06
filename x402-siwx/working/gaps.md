# Gaps — x402-siwx

## Iteration 1–2 (2026-07-06) 이후 상태

### 해소된 갭
- 공식 문서 원문(docs.mdx 770줄) + TS 구현 전 파일(hooks/server/validate/verify/evm/solana/storage/encode) 코드 수준 확보 (s01, s04–s08).
- 표준 계보: CAIP-122(s02), EIP-4361(s03), SIWS(s09), EIP-1271(s11), EIP-6492(s16).
- 생태계: Coinbase 런칭(s12), Cloudflare/x402 Foundation(s13), Linux Foundation 이관(s14).
- 보안 반례: ERC-1271 크로스 계정 리플레이 실사례(s10).
- Reown SIWX와의 구분(s15). 학술: SoK 지갑 인증(s17), ACM 브리징 논문(s18, access-limited).

### 남은 갭 (수용 — Limitations로)
- ACM 3719661 논문은 403으로 원문 미열람(access_limited). 초록 수준 인용만 가능.
- arXiv/Semantic Scholar API 일부 429 → 도메인 한정 웹 검색 폴백.
- SIWX 확장의 실제 프로덕션 채택 사례(어떤 서비스가 SIWX를 켰는지)는 공개 지표 없음 — 확장 자체가 신규(2026).
- Go/Python 구현은 파일 트리로 존재 확인했으나 코드 정독은 TS만 수행.
- c20(SIWE 도메인 검증 부실 실사례)은 ERC-1271 리플레이 사례로 대체 충족 — "도메인" 특정 실사례는 미확보. 드래프트에서 클레임을 서명 리플레이 일반으로 조정.

### 소스 충돌
- SIWS 저장소(s09)는 CAIP-122를 언급하지 않고 EIP-4361만 참조 — x402 문서(s01)는 SIWS를 CAIP-122 우산 아래 서술. → 본문에서 "SIWS는 EIP-4361을 모델로 하며, CAIP-122 관점에서는 solana 네임스페이스 구현으로 취급된다"로 양쪽 반영.
- 인메모리 스토리지 주석: docs(s01)는 "development" 용, storage.ts(s04권역)는 "development and single-instance deployments" — 사소, 본문은 코드 쪽 표현 채택.

### Critique 패스에서 발견·해소 (2026-07-06)
- 반대 증거 누락(must-fix): Halborn x402 보안 분석(s19), GoPlus 감사·402bridge 사고(s20) → 논의 섹션 반영 완료.
- "V2가 extensions 도입" 근거 부족(must-fix) → 서술 완화 완료.
- s12/s14/s18 봇 차단·페이월 → access_limited 플래그.

**판단: must-fix 0건. 퍼블리시 진행.**
