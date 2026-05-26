# Claims

## Introduction
- [ ] c01: 모듈러 블록체인 패러다임에서 데이터 가용성(DA)은 실행/합의/결제로부터 분리 가능한 독립적인 레이어로 다뤄진다.
  - kind: interpretive
  - needs: Celestia/EigenLayer/Ethereum 문헌에서 modular DA 정의 인용
- [ ] c02: Celestia와 EigenDA는 모두 "범용 DA 레이어"를 표방하지만, Celestia는 독립 PoS 체인, EigenDA는 Ethereum 리스테이킹 기반 서비스로 출발점이 다르다.
  - kind: factual
  - needs: 양사 공식 docs + 독립 분석

## Background
- [ ] c03: Data Availability Sampling(DAS)는 라이트 노드가 무작위 샘플링으로 전체 데이터의 가용성을 높은 확률로 검증할 수 있게 한다.
  - kind: technical
  - needs: Al-Bassam et al. DAS 논문 또는 Celestia/Ethereum DAS spec
- [ ] c04: 2D Reed-Solomon 인코딩은 일정 비율 이상의 데이터를 가지면 전체 복구가 가능한 수학적 특성을 제공한다.
  - kind: technical
  - needs: Celestia 또는 Ethereum 데이터 가용성 인코딩 명세
- [ ] c05: KZG 다항식 약속은 작은 크기의 commitment로 데이터 chunk를 효율적으로 증명할 수 있다.
  - kind: technical
  - needs: KZG 원논문 또는 EigenDA whitepaper

## Celestia
- [ ] c06: Celestia는 Tendermint/CometBFT 기반 PoS 합의를 사용하며 별도 토큰 TIA로 보안된다.
  - kind: factual
  - needs: Celestia docs 또는 GitHub
- [ ] c07: Celestia는 데이터를 네임스페이스로 분리한 NMT(Namespaced Merkle Tree)에 저장한다.
  - kind: technical
  - needs: Celestia spec / paper
- [ ] c08: Celestia 라이트 노드는 DAS를 직접 수행하여 풀노드 신뢰 없이 DA를 검증할 수 있다.
  - kind: technical
  - needs: Celestia docs
- [ ] c09: Celestia의 Blobstream(구 Quantum Gravity Bridge)은 EVM 체인에 DA attestation을 게시한다.
  - kind: technical
  - needs: Celestia / Blobstream docs

## EigenDA
- [ ] c10: EigenDA는 EigenLayer 리스테이킹으로 보안되며 ETH 리스테이커들이 DA 노드를 운영한다.
  - kind: factual
  - needs: EigenDA whitepaper / docs
- [ ] c11: EigenDA는 데이터를 KZG로 약속한 뒤 chunk로 분산 저장하고, DA 노드가 BLS 서명으로 attestation을 제공한다.
  - kind: technical
  - needs: EigenDA whitepaper
- [ ] c12: EigenDA는 자체 합의를 갖지 않고 Ethereum L1에 attestation 증명을 올린다.
  - kind: technical
  - needs: EigenDA docs/whitepaper
- [ ] c13: EigenDA는 라이트 노드 DAS 대신 dispersal-based(고객 retrieval) 보안 모델을 채택한다.
  - kind: interpretive
  - needs: EigenDA whitepaper or independent analysis

## Comparative Analysis
- [ ] c14: Celestia의 신뢰 가정은 독립 검증자 집합에 의존하고, EigenDA는 Ethereum 리스테이커 집합에 의존한다.
  - kind: interpretive
  - needs: 양사 docs + 독립 분석
- [ ] c15: EigenDA의 발표 목표 처리량은 Celestia의 발표 처리량보다 상위 수준으로 광고된다.
  - kind: factual
  - needs: 양사 공식 수치 + 독립 측정/비교
- [ ] c16: 두 시스템 모두 다항식 약속을 사용하지만 활용 위치가 다르다(Celestia: 데이터 정확성·fraud-proof 보강, EigenDA: 핵심 dispersal commitment).
  - kind: technical
  - needs: 양사 spec
- [ ] c17: Celestia의 DAS는 라이트 클라이언트 단에서 신뢰 가정을 더 작게 하지만, EigenDA는 ETH 보안 재활용으로 자본 규모를 키운다.
  - kind: interpretive
  - needs: 양사 docs + 독립 코멘트

## Discussion
- [ ] c18: 다수 Ethereum L2/롤업이 Celestia 또는 EigenDA를 실제 DA 백엔드로 채택해 운영하거나 통합 중이다.
  - kind: factual
  - needs: 채택 사례 보도자료/기술문서
- [ ] c19: EigenDA의 슬래싱은 EigenLayer 슬래싱 메커니즘에 종속되어 EigenLayer 일반 리스크를 상속한다.
  - kind: technical
  - needs: EigenLayer docs / 독립 분석
- [ ] c20: Celestia 메인넷은 2023년 10월 31일에 출시되었고 EigenDA 메인넷은 2024년 4월에 출시되었다.
  - kind: factual
  - needs: 양사 출시 발표 보도

## Limitations
- [ ] c21: 두 시스템 모두 빠르게 변화 중이며 일부 수치/사양은 본 보고서 작성 시점 이후 바뀔 수 있다.
  - kind: interpretive
  - needs: 양사 changelog/릴리즈 노트
