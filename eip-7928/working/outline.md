# Outline — eip-7928
기준 2026-10-19. 사용자가 준 링크(eips.ethereum.org/EIPS/eip-7928)의 현재 본문(Last Call, 마감 11-01)을 1차 자료로.
관련: `glamsterdam` 리포트(포크 전체), 이 리포트는 BAL 한 건을 깊게.
1. 초록
2. 무엇을 왜 — 동기, 2930과의 차이, 네 가지 효과
3. 자료구조와 커밋 — 헤더 해시, 블록 본문 밖, RLP 구조, 인덱스, 정렬·유일성, 크기 상한
4. 무엇을 기록하나 — 포함 범위, 가스 사전 검증, 변경 유형별 의미, 엣지 케이스
5. 운반과 보관 — Engine API, CL ProgressiveList, 보존 기간과 EIP-8061
6. 실측 — Sepolia 40블록 검증, 크기 비교, 명세 의사코드 결함
7. 논쟁과 반대 증거 — 크기 우려와 대안들, BNB 벤치마크, World Chain, 가짜 읽기 공격
8. Limitations
