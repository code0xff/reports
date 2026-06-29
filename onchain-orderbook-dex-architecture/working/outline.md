# Outline — 온체인 오더북 거래소의 기술 구조

## 1. Abstract / 초록
- 온체인 오더북 거래소가 무엇이고, 어떤 기술적 돌파로 가능해졌는지, 접근법별 강·약점 요약.

## 2. Introduction / 서론
- CLOB(중앙지정가주문서) vs AMM의 차이와 왜 오더북이 어려운가.
- "온체인 오더북"의 정의 범위(완전 온체인 매칭 vs 하이브리드).
- 보고서 범위와 분류 기준.

## 3. Background — 왜 온체인 오더북이 어려운가
- 오더북 운영의 핵심 비용: 주문 생성/취소의 빈도, 매칭 연산, 상태 저장.
- 이더리움 L1의 처리량/지연/가스 한계.
- 프론트러닝/MEV와 공정 순서(fair ordering) 문제.

## 4. 기술 아키텍처 분류 (핵심 분석)
- (A) 오프체인 매칭 + 온체인 정산 하이브리드 (0x, 초기 dYdX/StarkEx).
- (B) 앱특화 체인/롤업: dYdX v4(Cosmos appchain), zk-rollup(Loopring).
- (C) 고성능 통합 L1의 온체인 CLOB: Solana(Serum/OpenBook), Injective, Sei.
- (D) 거래소 특화 신규 L1: Hyperliquid(HyperBFT/HyperCore).

## 5. 사례 심층 분석 (기술별 차별점)
- dYdX: StarkEx 롤업 → v4 독립 체인 전환과 그 이유.
- Serum/OpenBook: Solana 중앙한도주문서, 병렬실행.
- Injective: 체인 내장 오더북 모듈, 배치 경매(FBA)로 MEV 완화.
- Hyperliquid: 완전 온체인 오더북 + 자체 합의, 성능 수치.

## 6. 기술별 강점·단점 비교
- 탈중앙화/검증가능성 vs 성능/지연.
- 컴포저빌리티(유동성 공유) vs 주권(앱체인).
- MEV/공정성, 운영자 신뢰, 유동성 부트스트랩.

## 7. Discussion — 트레이드오프와 수렴 방향
- "오프체인 매칭은 불가피한가" 논쟁.
- 앱체인화 추세 vs 통합 L1 회귀.

## 8. Limitations / 한계
- 비공개 매칭 엔진, 빠르게 변하는 벤치마크, 벤더 자체 보고 수치.

## 9. References / 참고문헌
- sources.jsonl에서 자동 생성.
