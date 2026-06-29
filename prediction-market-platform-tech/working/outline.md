# Outline — 예측시장 플랫폼의 기술적 기반

## 1. Abstract / 초록
- 예측시장 플랫폼이 무엇이며, 그 기술 스택의 핵심 구성요소를 1문단 요약.

## 2. Introduction / 서론
- 예측시장의 정의와 "정보 집계 메커니즘"으로서의 역할.
- 왜 기술적 기반이 중요한가: 온체인 vs 오프체인, 정산 신뢰 문제.
- 보고서 범위: Polymarket을 중심으로 Kalshi/Augur 비교.

## 3. Background — 예측시장 메커니즘 / 시장 미시구조
- 예측시장이 확률을 가격으로 표현하는 원리.
- 시장 형성 방식: 오더북(CLOB) vs 자동화 마켓메이커(AMM/LMSR).
- 조건부 토큰(conditional tokens)과 정산 페이오프 구조.

## 4. Polymarket 온체인 아키텍처 (핵심 기술 분석)
- 실행 레이어: Polygon PoS.
- Gnosis/Conditional Token Framework (CTF) — ERC-1155 결과 토큰.
- 하이브리드 거래 모델: 오프체인 오더북 + 온체인 정산 (CLOB / Exchange 컨트랙트, 0x 스타일).
- 담보 자산: USDC.
- 가스리스/메타 트랜잭션, 프록시 지갑.

## 5. 오라클과 시장 정산 (Resolution)
- UMA Optimistic Oracle를 통한 결과 확정.
- 분쟁/이의제기(dispute) 흐름과 보안 가정.
- 정산 실패·논란 사례.

## 6. 비교 분석 — 다른 플랫폼의 기술 모델
- Kalshi: 규제된 중앙화 거래소(CFTC), 오프체인.
- Augur: 완전 온체인, REP 토큰 기반 오라클.
- 기술적 트레이드오프: 탈중앙화 vs 성능/규제.

## 7. Discussion — 기술적 트레이드오프와 신뢰 모델
- 오라클이 단일 실패 지점인가.
- 확장성, MEV, 프론트러닝, 유동성.
- 규제와 탈중앙화의 긴장.

## 8. Limitations / 한계
- 비공개 인프라, 빠르게 변하는 스택, 오라클 거버넌스 불확실성.

## 9. References / 참고문헌
- sources.jsonl에서 자동 생성.
