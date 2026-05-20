# Claims — Simplex & Alpenglow

## Introduction
- [ ] c01: Simplex(Chan·Pass 2023, TCC)와 Alpenglow(Anza 2025)는 모두 "부분 동기성 + 회전 리더" 패밀리에 속하지만, Simplex는 학계 일반 표준을 노리고 Alpenglow는 Solana 특화 production 합의를 목표로 한다.
  - kind: interpretive
  - needs: 양쪽 1차 자료

## Background
- [ ] c02: BFT 부분 동기성 모델은 PBFT 이후 f < n/3 Byzantine 허용량을 표준으로 삼아 왔다.
  - kind: technical
  - needs: 표준 BFT 자료
- [ ] c03: Solana 기존 TowerBFT는 finality가 약 12.8초이며 공식 보안 증명이 없다는 점이 Alpenglow 동기 부여로 명시되어 있다.
  - kind: factual
  - needs: SIMD-0326

## Simplex
- [ ] c04: Simplex 논문은 2023년 ePrint 2023/463로 공개되어 TCC 2023에 게재되었다.
  - kind: factual
  - needs: 논문 메타데이터
- [ ] c05: Simplex의 핵심 단순화는 "두 vote(`notarize`+`finalize`) + dummy-block skip + 리더 즉시 회전"으로 view-change 절차를 제거하는 것이다.
  - kind: technical
  - needs: Chan/Pass 논문 + commonware 보고서
- [ ] c06: simplex.blog가 공표한 벤치마크는 80ms 메시지 지연, 1/3 결함 리더 조건에서 Simplex 400ms · HotStuff 2480ms · Tendermint(체인드) 1840ms이다.
  - kind: factual
  - needs: simplex.blog
- [ ] c07: Simplex는 Commonware, Tempo, Solana Alpenglow, Ava Labs에서 구현되고 있다는 점을 simplex.blog에 명시하고 있다.
  - kind: factual
  - needs: simplex.blog

## Alpenglow
- [ ] c08: Alpenglow 저자는 Quentin Kniep, Kobi Sliwinski, Roger Wattenhofer(ETH Zurich/Anza)이며, 2025년 5월 19일 Anza가 발표했다.
  - kind: factual
  - needs: Anza 블로그
- [ ] c09: Alpenglow는 두 컴포넌트 Votor(투표·확정)와 Rotor(데이터 전파)로 구성되며, TowerBFT와 Proof-of-History를 동시에 대체한다.
  - kind: technical
  - needs: Anza 블로그 + SIMD-0326
- [ ] c10: Votor는 80% 스테이크가 1라운드 안에 동의하면 즉시 fast-finalization, 60%~80%이면 2라운드 slow path로 확정하는 dual-path 알고리즘이다.
  - kind: technical
  - needs: Anza 블로그 + SIMD-0326
- [ ] c11: SIMD-0326은 5종 인증서(notarization 60%, skip 60%, finalization 60%, fast-finalization 80%, notar-fallback 60%)를 정의한다.
  - kind: technical
  - needs: SIMD-0326
- [ ] c12: Rotor는 Turbine의 다층 트리를 단일 릴레이 계층으로 치환하고, 데이터·복구 shred를 분리하지 않은 단일 erasure-coded shred를 사용한다.
  - kind: technical
  - needs: SIMD-0326 + Helius/Alchemy 분석
- [ ] c13: Alpenglow는 BLS12-381 집계 서명을 사용해 슬롯당 약 500KB 수준의 vote 데이터를 약 1000바이트 인증서 헤더로 압축한다.
  - kind: technical
  - needs: Alchemy + SIMD-0326
- [ ] c14: Alpenglow는 "20+20" 보안 모델을 채택하여, 20% 비잔틴 + 20% 비응답 결함을 합쳐 40% 결함 허용량을 목표로 한다.
  - kind: technical
  - needs: SIMD-0326 + Anza 블로그
- [ ] c15: Alpenglow는 SHA-256 해시와 BLS12-381 서명으로 128-bit 보안 수준을 명시한다.
  - kind: technical
  - needs: SIMD-0326
- [ ] c16: Alpenglow는 상위 2,000개 검증자만 허용하고, 매일 약 0.8 SOL의 Validator Admission Ticket(VAT)을 소각한다.
  - kind: factual
  - needs: SIMD-0326
- [ ] c17: SIMD-0326은 2025년 9월 2일 종료된 거버넌스 투표에서 98.27% 찬성으로 통과되었고, 2026년 5월 11일 Anza가 커뮤니티 테스트 클러스터에서 활성화했다.
  - kind: factual
  - needs: 뉴스 보도
- [ ] c18: Alpenglow는 약 150ms 중앙값 finality(때로 100ms)를 목표로 하며, TowerBFT의 12.8초 대비 두 자릿수 배의 개선을 광고한다.
  - kind: factual
  - needs: Anza 블로그 + Helius

## Code-level
- [ ] c19: SIMD-0326은 "블록 *b*가 슬롯 *s*에서 직접 finalize되면 이전 슬롯의 미결 결정이 간접적으로 함께 finalize된다"는 indirect finalization 규칙을 정의한다.
  - kind: technical
  - needs: SIMD-0326
- [ ] c20: Solana의 Votor는 Simplex 위에 fast-path 등 다수의 수정을 더해 운용되는 형태로 명시되어 있다.
  - kind: factual
  - needs: simplex.blog
- [ ] c21: Commonware의 Simplex 구현(Rust, commonware-consensus 크레이트의 `simplex` 모듈)은 Simplex의 학계 알고리즘을 액터 기반(Batcher/Voter/Resolver/Application)으로 재배치한다.
  - kind: technical
  - needs: 자매 보고서 commonware-simplex-consensus

## Comparison
- [ ] c22: Alpenglow의 40% 결함 허용량(20% 비잔틴+20% 비응답)은 전통적 BFT의 33% 비잔틴 허용량보다 비잔틴 측은 좁고 통합 허용량 측은 넓다는 트레이드오프를 만든다.
  - kind: interpretive
  - needs: Sei 분석 + SIMD-0326
- [ ] c23: Alpenglow는 vote 데이터를 BLS 집계로 압축하고 PoH/gossip 기반 투표를 제거함으로써 검증자 운영 비용을 20–50%까지 낮춘다고 분석된다.
  - kind: interpretive
  - needs: Alchemy 분석

## Discussion
- [ ] c24: Sei의 분석은 Alpenglow가 "혼합 결함 시나리오에는 우수하지만 순수 adversarial 공격에는 더 취약하다"고 정리한다.
  - kind: interpretive
  - needs: Sei 블로그
- [ ] c25: Alpenglow의 2,000 검증자 한도와 지리적 비대칭성은 탈중앙성 측면에서 새로운 압력을 만든다는 우려가 외부 분석에서 제기된다.
  - kind: interpretive
  - needs: Sei + Alchemy
