# Gaps — caip-122

## Iteration 1 (2026-07-06) 이후 상태

### 해소된 갭
- CAIP-122 원문 전체 필드 표·프로파일 요구·보안 섹션(s01), eip155/solana 프로파일(s02, s03), CAIP-74 CACAO(s04), CAIP-2(s05), CASA(s07).
- 네임스페이스 커버리지 실측: caip122 프로파일 보유 6개(arweave, eip155, solana, stacks, tezos, xrpl)(s06).
- 구현 경로: Reown AppKit SIWX(s09), x402 SIWX(s10), Ceramic did-session/did:pkh/CACAO(s08).
- EIP-4361 대조용 원문(s11).

### 핵심 분석 포인트 (수집 중 발견)
- **nonce가 CAIP-122에선 Optional, EIP-4361에선 REQUIRED(8+ 영숫자)** — 일반화 과정에서 보안 필드의 규범 강도가 낮아짐. c14/c16의 핵심 증거.
- CAIP-122 보안 섹션은 지갑 도메인 매칭 MUST 하나가 중심으로, EIP-4361의 표시 의무·세션 바인딩·채널 보안 등 세부가 없음(두 원문 대조로 확인).
- CACAO 헤더 t 값이 caip122 또는 eip4361 — 두 표준의 실질적 호환성 증거.

### 남은 갭 (수용)
- CAIP-10 원문은 직접 미페치(CAIP-122 원문의 CAIP-10 세그먼트 서술과 CAIP-2로 대체).
- 학술 문헌에서 CAIP-122를 단독 분석한 논문 미확인 — 신규/니치 표준. Limitations로.
- Ceramic의 CACAO 채택 규모(정량) 미확인 — did-session 기본 1주 세션 등 정성 서술로 대체.

### 소스 충돌
- SIWS(Phantom) 저장소는 CAIP-122 미언급 vs solana 네임스페이스 프로파일은 CAIP-122 준수 명시 — "지갑 주도 표준(SIWS)과 CASA 프로파일이 병렬 존재"로 본문 반영.

**판단: 드래프트 진행 가능.**
