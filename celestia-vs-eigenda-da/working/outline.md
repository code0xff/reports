# Outline — Celestia vs EigenDA as Data Availability Layers

1. **Abstract** — 핵심 결론과 두 시스템의 위치 요약.
2. **Introduction** — 모듈러 블록체인 시대 DA 레이어의 등장 배경, 본 보고서의 범위와 비교 기준.
3. **Background: Data Availability 문제와 해결 방식** — DA 문제 정의, Data Availability Sampling(DAS), Reed-Solomon 인코딩, KZG 약속, DA 위원회 등 기초 개념.
4. **Celestia: 아키텍처와 기술 기반** — Tendermint/CometBFT 합의, 2D Reed-Solomon + Namespaced Merkle Tree(NMT), DAS 라이트 노드, Blobstream(EVM bridge), 처리량/수수료 모델.
5. **EigenDA: 아키텍처와 기술 기반** — EigenLayer 리스테이킹 기반 보안, KZG 다항식 약속과 chunk dispersal, BLS attestation, batcher/disperser/retriever 구조, throughput 목표.
6. **Comparative Analysis** — 신뢰 모델, DAS vs Custody/Attestation, 처리량/수수료, 데이터 보존 기간, 통합 방식, 거버넌스/탈중앙화 수준, 보안 가정의 차이.
7. **Discussion: Adoption, Trade-offs, and Risks** — 실제 채택 사례, 슬래싱·리스테이킹 리스크, 합의/네트워크 의존성, 비용 경쟁 동학.
8. **Limitations** — 본 비교의 한계, 빠르게 변하는 사양과 벤더 자료 비중에 대한 인지.
9. **References** — 인용 목록(자동 렌더링).
