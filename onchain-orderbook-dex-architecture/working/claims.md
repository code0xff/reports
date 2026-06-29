# Claims

> All claims checked off in gather iteration 1 (2026-06-29). See gaps.md for conflicts and uncertainties.md for shaky items.

## Introduction
- [x] c01: 중앙지정가주문서(CLOB)는 매수·매도 지정가 주문을 가격-시간 우선순위로 매칭하는 방식으로, 본드 곡선으로 가격을 결정하는 AMM과 구조적으로 다르다.
  - kind: technical
  - needs: CLOB와 AMM 메커니즘을 기술하는 1차/기술 문헌
- [x] c02: 완전 온체인 오더북은 주문 생성·취소·매칭을 모두 온체인에서 수행하므로, 오프체인 매칭 후 온체인 정산만 하는 하이브리드와 구분된다.
  - kind: technical
  - needs: 두 모델을 구분 기술하는 자료

## Background — 왜 어려운가
- [x] c03: 이더리움 L1은 낮은 처리량과 높은 가스비로 인해 빈번한 주문 생성·취소를 요구하는 오더북 운영에 비용이 매우 크다.
  - kind: technical
  - needs: 이더리움 처리량/가스 한계와 오더북 부적합성을 설명하는 자료
- [x] c04: 오더북 거래소는 거래 순서 결정 권한 때문에 프론트러닝·MEV 및 공정 순서(fair ordering) 문제에 노출된다.
  - kind: technical
  - needs: MEV/순서조작과 오더북의 관계 문헌

## 기술 아키텍처 분류
- [x] c05: 초기 온체인 오더북 DEX(0x, 초기 dYdX)는 오프체인에서 주문을 매칭하고 온체인에서 정산하는 하이브리드 모델을 사용했다.
  - kind: technical
  - needs: 0x/dYdX 1차 문서
- [x] c06: dYdX는 StarkEx 기반 ZK-롤업(L2)에서 운영되다가 v4에서 Cosmos SDK 기반 독립 앱체인으로 전환했으며, 그 핵심 동기는 완전 탈중앙화된 오프체인 오더북과 자체 검증자 네트워크 확보였다.
  - kind: factual
  - needs: dYdX v4 공식 발표/문서 + 독립 보도
- [x] c07: dYdX v4에서는 주문 매칭이 검증자(validator)의 오프체인 인메모리 오더북에서 이뤄지고 체결된 거래만 블록에 기록된다.
  - kind: technical
  - needs: dYdX v4 아키텍처 문서
- [x] c08: Solana의 Serum/OpenBook은 온체인 중앙한도주문서를 구현했으며, Solana의 병렬 실행과 저비용·고속 블록이 이를 가능하게 했다.
  - kind: technical
  - needs: Serum/OpenBook 문서 + Solana 기술 자료

## 사례 심층 분석
- [x] c09: Injective는 체인 프로토콜 수준에 오더북 모듈을 내장하고, 블록 내 주문을 한 가격으로 체결하는 빈도 배치 경매(frequent batch auction)로 프론트러닝/MEV를 완화한다.
  - kind: technical
  - needs: Injective 공식 문서/백서
- [x] c10: Hyperliquid는 완전 온체인 중앙한도주문서를 자체 L1(HyperBFT 합의, HyperCore)에서 운영하며 초당 수십만 건 규모의 주문 처리를 목표/주장한다.
  - kind: technical
  - needs: Hyperliquid 공식 문서 (수치는 벤더 주장으로 표기)
- [x] c11: Sei는 체인에 내장된 오더북 매칭과 병렬 실행을 결합한 거래 특화 L1으로 설계되었다.
  - kind: technical
  - needs: Sei 백서/문서

## 기술별 강점·단점 비교
- [x] c12: 오프체인 매칭 하이브리드는 성능과 지연에서 유리하지만 매칭 단계에서 운영자/시퀀서 신뢰와 검열 가능성을 도입한다.
  - kind: interpretive
  - needs: 기술 문서 기반 트레이드오프 분석
- [x] c13: 앱특화 체인/롤업은 주권과 성능 맞춤화를 얻는 대신 다른 디파이와의 컴포저빌리티(유동성 공유)와 보안 공유를 일부 희생한다.
  - kind: interpretive
  - needs: 앱체인 vs 통합체인 논의 자료
- [x] c14: 완전 온체인 오더북은 검증가능성과 무신뢰성에서 가장 강하지만, 동일 성능을 내려면 고도로 특화된 인프라(고성능 L1 또는 전용 합의)가 필요하다.
  - kind: interpretive
  - needs: 사례 비교 기반 분석

## Discussion
- [x] c15: 2023~2025년 온체인 파생상품 거래에서 Hyperliquid가 빠르게 지배적 점유율을 차지하며 완전 온체인 오더북 모델의 상업적 성립 가능성을 입증했다.
  - kind: factual
  - needs: 시장 점유율/거래량 보도 2건 이상
