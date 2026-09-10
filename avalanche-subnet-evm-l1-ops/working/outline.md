# Outline — Avalanche Subnet-EVM: 띄우기, 운영, L2·독립 체인과의 비교

1. 초록 / Abstract
2. 서론 — 질문의 범위: Subnet-EVM이 무엇이고, 왜 2024년 말 이후 "Avalanche L1"이라는 이름으로 바뀌었는가
3. 배경 — Avalanche 아키텍처: Primary Network(P/X/C), Subnet, VM 모델, ACP-77(Etna) 이후의 L1 밸리데이터 모델
4. Subnet-EVM 내부 — coreth와의 관계, genesis 설정, 상태 저장 프리컴파일(allow-list, fee manager, native minter, reward manager, warp), 업그레이드 메커니즘
5. 띄우기 — avalanche-cli로 로컬 → Fuji → 메인넷, Validator Manager 컨트랙트(PoA/PoS), ConvertSubnetToL1Tx, 밸리데이터 등록, 필요한 자원과 비용
6. 운영 — 노드 운영(스테이킹·업타임·연속 수수료), 버전 업그레이드·네트워크 업그레이드 조율, 릴레이어와 ICM(Teleporter), 모니터링, 흔한 장애
7. 비교 — 롤업(OP Stack/Arbitrum Orbit 등 L2)과 독립 체인(Cosmos SDK, Polygon CDK 등)과의 구조적 차이: 보안 모델, 결제·데이터 가용성, 상호운용성, 밸리데이터 셋, 비용 구조
8. 장단점과 선택 기준 — 어떤 프로젝트가 L1을 택해야 하고 어떤 프로젝트가 롤업을 택해야 하는가
9. 한계 / Limitations
10. 참고문헌 (renderer 자동 생성)
