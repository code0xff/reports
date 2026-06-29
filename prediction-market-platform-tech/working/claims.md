# Claims

> All claims checked off in gather iteration 1 (2026-06-29). See gaps.md for conflicts and uncertainties.md for shaky items.

## Introduction
- [x] c01: 예측시장은 사건의 결과에 연동된 계약을 거래하게 하여 시장가격이 그 사건의 발생 확률 추정치로 해석되도록 설계된다.
  - kind: interpretive
  - needs: 예측시장 정의와 가격=확률 해석을 설명하는 학술/1차 자료
- [x] c02: Polymarket은 2024년 미국 대선 기간 동안 수십억 달러 규모의 거래량을 기록한 가장 큰 암호화폐 기반 예측시장이다.
  - kind: factual
  - needs: 거래량 통계를 보도한 독립 매체 2건 이상

## Background — 메커니즘
- [x] c03: 예측시장은 크게 두 가지 시장 조성 방식 — 지정가 주문서(CLOB)와 자동화 마켓메이커(예: LMSR 기반 AMM) — 으로 구현된다.
  - kind: technical
  - needs: 두 방식을 기술하는 1차/기술 문헌
- [x] c04: LMSR(로그 시장 점수 규칙)은 마켓메이커의 최대 손실을 제한하면서 항상 유동성을 제공하는 비용함수 기반 메커니즘이다.
  - kind: technical
  - needs: Hanson의 LMSR 논문 또는 동등한 학술 자료
- [x] c05: 조건부 토큰 프레임워크에서는 담보를 예치하면 각 결과(outcome)에 대응하는 토큰 세트가 발행되고, 정산 시 옳은 결과 토큰만 담보로 상환된다.
  - kind: technical
  - needs: Gnosis CTF 문서 등 1차 기술 자료

## Polymarket 온체인 아키텍처
- [x] c06: Polymarket은 Polygon PoS 체인 위에서 동작한다.
  - kind: technical
  - needs: Polymarket 공식 문서 또는 온체인 컨트랙트 주소
- [x] c07: Polymarket의 결과 토큰은 Gnosis Conditional Token Framework(ERC-1155)를 기반으로 발행된다.
  - kind: technical
  - needs: Polymarket 개발자 문서 / CTF 문서
- [x] c08: Polymarket의 거래는 오프체인 지정가 주문서(CLOB)에서 매칭되고 온체인에서 원자적으로 정산되는 하이브리드 모델을 사용한다.
  - kind: technical
  - needs: Polymarket CLOB 문서 / 운영자(operator) 매칭 설명
- [x] c09: Polymarket의 담보 및 정산 자산은 USDC이다.
  - kind: technical
  - needs: Polymarket 공식 문서
- [x] c10: Polymarket은 사용자 대신 가스를 지불하거나 프록시/스마트 컨트랙트 지갑과 메타 트랜잭션을 사용하여 가스리스 사용자 경험을 제공한다.
  - kind: technical
  - needs: Polymarket 문서 / 프록시 지갑 컨트랙트 설명

## 오라클과 정산
- [x] c11: Polymarket은 시장 결과 확정을 위해 UMA의 Optimistic Oracle을 사용한다.
  - kind: technical
  - needs: UMA/Polymarket 1차 문서
- [x] c12: UMA Optimistic Oracle은 제안된 답에 이의제기가 없으면 그대로 확정하고, 이의가 제기되면 UMA 토큰 보유자의 DVM 투표로 분쟁을 해결한다.
  - kind: technical
  - needs: UMA 공식 문서
- [x] c13: Polymarket에서 오라클 정산을 둘러싼 분쟁/논란 사례가 실제로 발생했다.
  - kind: factual
  - needs: 구체적 사례를 보도한 독립 매체 2건 이상

## 비교 분석
- [x] c14: Kalshi는 CFTC의 규제를 받는 미국 등록 거래소로, 블록체인이 아닌 중앙화된 오프체인 인프라로 운영된다.
  - kind: factual
  - needs: Kalshi/CFTC 1차 자료 + 독립 보도
- [x] c15: Augur는 이더리움 메인넷에서 동작하는 완전 온체인 예측시장으로, REP 토큰 보유자가 결과를 보고/분쟁하는 탈중앙 오라클을 사용한다.
  - kind: technical
  - needs: Augur 백서/문서

## Discussion
- [x] c16: 옵티미스틱 오라클 기반 정산은 결과 해석이 모호한 시장에서 단일 실패 지점 또는 거버넌스 공격 표면이 될 수 있다.
  - kind: interpretive
  - needs: 분석 자료 / 사례 기반 논의
- [x] c17: 오프체인 매칭 + 온체인 정산 하이브리드 모델은 완전 온체인 모델 대비 성능과 사용자 경험을 개선하지만 매칭 단계에서 운영자 신뢰를 도입한다.
  - kind: interpretive
  - needs: 기술 문서 기반 트레이드오프 분석
