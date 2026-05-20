# Outline — Simplex & Alpenglow Deep Dive

## 1. Abstract / 초록
- Simplex(2023)와 Alpenglow(2025)의 한 줄 위치 정리.

## 2. Introduction — 왜 두 프로토콜이 같이 다뤄지는가
- Simplex가 학계 표준이 되어 가는 흐름.
- Solana가 TowerBFT + PoH를 버리고 Alpenglow를 채택한 맥락.

## 3. Background — 두 프로토콜을 받쳐 주는 토대
- 3.1 BFT 합의의 부분 동기성 모델과 f < n/3.
- 3.2 PBFT → HotStuff → Tendermint → Simplex 흐름.
- 3.3 Solana TowerBFT + PoH의 한계.

## 4. Simplex — 학계 표준화 분석
- 4.1 논문 정체성과 저자.
- 4.2 iteration 구조와 leader 회전.
- 4.3 notarize / finalize 이중 투표.
- 4.4 dummy block / skip.
- 4.5 벤치마크 수치(400ms vs HotStuff 2480ms).
- 4.6 구현체 생태계(Commonware, Tempo, Ava Labs, Solana Votor).

## 5. Alpenglow — Solana의 새 합의 알고리즘
- 5.1 저자·발표·거버넌스 (Kniep / Sliwinski / Wattenhofer; SIMD-0326).
- 5.2 Votor — fast(80%) / slow(60%) 두 경로와 5종 인증서.
- 5.3 Rotor — Turbine 트리를 대체한 단일 릴레이.
- 5.4 BLS12-381 집계 서명과 온체인 vote 데이터 축소.
- 5.5 20+20 보안 모델과 SHA-256 + BLS12-381 128-bit.
- 5.6 검증자 경제와 VAT.
- 5.7 테스트넷·메인넷 일정.

## 6. Code-level Analysis — 사양에서 코드까지
- 6.1 SIMD-0326의 5종 인증서 정의.
- 6.2 fast / slow 경로 의사 코드.
- 6.3 Commonware Simplex 구현과의 매핑.
- 6.4 Rotor 단일 릴레이의 erasure coding 흐름.

## 7. Comparison — Simplex vs Alpenglow vs TowerBFT
- 핵심 축 비교 표.

## 8. Discussion — 트레이드오프와 검토 포인트
- 33%→20%로 축소된 비잔틴 허용량.
- 지리적 비대칭 / 2000 검증자 한도 / VAT 경제.

## 9. Limitations — 본 분석의 한계.

## 10. References — auto-generated.
