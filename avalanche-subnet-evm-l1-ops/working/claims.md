# Claims

## 서론
- [x] c01: Avalanche는 2024년 12월 Etna 업그레이드(ACP-77)로 Subnet을 "Avalanche L1"으로 재정의했고, 밸리데이터가 Primary Network에 2,000 AVAX를 스테이킹할 필요가 없어졌다.
  - kind: factual
  - needs: ACP-77 원문 + 독립 보도
- [x] c02: Subnet-EVM은 C-Chain의 coreth를 단순화한 EVM 호환 VM으로, 별도 체인(L1)에 배포하기 위한 것이며, 독립 저장소는 아카이브되고 개발이 AvalancheGo 모노레포로 옮겨갔다.
  - kind: technical
  - needs: GitHub README 또는 문서

## 배경
- [ ] c03: Avalanche Primary Network는 P-Chain, X-Chain, C-Chain으로 구성되며, P-Chain이 밸리데이터 셋과 Subnet/L1 메타데이터를 관리한다.
  - kind: factual
  - needs: 공식 문서 2건
- [ ] c04: Etna 이전 Subnet 밸리데이터는 Primary Network도 검증해야 했으며, 이는 최소 2,000 AVAX 스테이킹과 Primary Network 전체 상태 동기화를 요구했다.
  - kind: factual
  - needs: 구 문서 + ACP-77 배경 절
- [x] c05: ACP-77 이후 L1 밸리데이터는 P-Chain에 "연속 수수료(continuous fee)"를 지불하고, 밸리데이터 셋 변경은 온체인 Validator Manager 컨트랙트가 Warp 메시지로 P-Chain에 전달한다.
  - kind: technical
  - needs: ACP-77 원문, validator-manager 저장소
- [x] c06: L1 밸리데이터의 연속 수수료는 밸리데이터당 월 약 1.33 AVAX(512 nAVAX/s) 규모로 설정되었다(초기 파라미터).
  - kind: factual
  - needs: ACP-77 파라미터 + 문서/보도

## Subnet-EVM 내부
- [x] c07: Subnet-EVM의 genesis JSON은 chainId, feeConfig(gasLimit, targetBlockRate, minBaseFee 등), 그리고 프리컴파일 활성화 설정을 담는다.
  - kind: technical
  - needs: 공식 문서 genesis 절
- [x] c08: Subnet-EVM은 Contract Deployer Allow List, Transaction Allow List, Native Minter, Fee Manager, Reward Manager, Warp Messenger 등 상태 저장 프리컴파일을 제공한다.
  - kind: technical
  - needs: 문서/코드
- [x] c09: 프리컴파일과 파라미터 변경은 upgrade.json을 통한 "network upgrade"로 특정 타임스탬프에 활성화하며, 모든 밸리데이터가 동일한 파일을 적용해야 한다.
  - kind: technical
  - needs: 문서 upgrade 절
- [x] c10: Subnet-EVM은 특정 AvalancheGo 버전 범위와만 호환되며 릴리스 노트에 호환성 표가 명시된다.
  - kind: technical
  - needs: 릴리스/README
- [x] c11: Subnet-EVM은 Warp/ICM을 통해 다른 Avalanche L1 및 C-Chain과 네이티브 메시지를 교환하며, 서명은 밸리데이터 BLS 키 집계로 검증된다.
  - kind: technical
  - needs: ICM 문서 + ACP-30/118 등

## 띄우기
- [x] c12: avalanche-cli는 `blockchain create` → `blockchain deploy`로 로컬/Fuji/메인넷에 L1을 배포하는 공식 도구이다.
  - kind: technical
  - needs: CLI 문서
- [x] c13: 메인넷 L1 생성은 CreateSubnetTx, CreateChainTx, ConvertSubnetToL1Tx 세 P-Chain 트랜잭션과 밸리데이터 등록(RegisterL1ValidatorTx)으로 이루어진다.
  - kind: technical
  - needs: ACP-77, 문서
- [x] c14: Validator Manager는 PoA와 Native/ERC20 토큰 PoS 두 종류를 공식 제공하며, L1 자체 또는 C-Chain에 배포할 수 있다.
  - kind: technical
  - needs: icm-contracts 저장소/문서
- [ ] c15: 공식 권장 노드 사양은 8코어 CPU, 16GB RAM, 1TB SSD 이상이다.
  - kind: factual
  - needs: 문서 + 2번째 출처
- [x] c16: L1 밸리데이터는 최소 잔액을 P-Chain에 예치해야 하며, 잔액이 소진되면 비활성화된다.
  - kind: technical
  - needs: ACP-77, 문서

## 운영
- [x] c17: L1 노드 운영자는 AvalancheGo와 VM 바이너리를 함께 업그레이드해야 하고, 네트워크 업그레이드는 L1 밸리데이터 전체가 조율해야 한다.
  - kind: technical
  - needs: 문서
- [x] c18: ICM 메시지 전달에는 오프체인 릴레이어(icm-relayer)가 필요하며 이는 L1 운영자가 직접 띄우거나 서드파티에 맡긴다.
  - kind: technical
  - needs: 릴레이어 저장소/문서
- [x] c19: Ava Labs 문서는 L1 운영 시 모니터링(Prometheus/Grafana)과 밸리데이터 업타임 관리를 권고한다.
  - kind: technical
  - needs: 문서
- [x] c20: L1 밸리데이터가 총 스테이크 가중치의 일정 비율 미만이면 체인이 멈추며, 이는 롤업의 시퀀서 장애와 다른 실패 모드다.
  - kind: interpretive
  - needs: 합의 문서 + 비교 자료
- [x] c21: AvaCloud, Zeeve, Nodies 등 매니지드 L1 서비스가 존재하며 운영 부담을 대신한다.
  - kind: factual
  - needs: 벤더 페이지 + 독립 보도

## 비교
- [x] c22: 롤업(OP Stack, Arbitrum Orbit)은 L1 이더리움에 상태/데이터를 게시해 보안을 상속하지만, Avalanche L1은 자체 밸리데이터 셋이 보안을 결정한다.
  - kind: interpretive
  - needs: 롤업 문서 + Avalanche 문서
- [x] c23: 롤업은 통상 단일 시퀀서 중앙화 문제와 7일 출금 지연(optimistic) 또는 증명 비용(zk)을 가지며, Avalanche L1은 이런 지연이 없는 대신 자체 검증자 보안 예산이 필요하다.
  - kind: interpretive
  - needs: L2BEAT/공식 문서
- [x] c24: Cosmos SDK 앱체인 역시 주권 밸리데이터 셋을 갖지만, IBC/Tendermint 기반이며 EVM은 선택적이다. Avalanche L1과의 차이는 합의(Snowman), 공유 플랫폼(P-Chain), 네이티브 상호운용성(ICM)에 있다.
  - kind: interpretive
  - needs: Cosmos 문서 + 비교 자료
- [x] c25: Avalanche L1의 비용 구조는 밸리데이터당 고정 연속 수수료 + 노드 인프라이며, 롤업은 L1 데이터 게시 비용(블롭)에 비례한다.
  - kind: interpretive
  - needs: ACP-77, EIP-4844/L2 비용 자료
- [x] c26: 실제 채택 사례로 게임/기관용 L1(예: Dexalot, Beam, DeFi Kingdoms, 기관용 Evergreen)이 존재하며, 일부는 Etna 이후 L1로 전환했다.
  - kind: factual
  - needs: 2건 이상 보도/공식

## 장단점과 선택 기준
- [x] c27: L1을 택할 근거는 커스텀 가스 토큰·권한형 접근·독자적 수수료 정책·예측 가능한 처리량이며, 롤업을 택할 근거는 이더리움 보안·유동성 상속과 낮은 초기 검증자 확보 부담이다.
  - kind: interpretive
  - needs: 양쪽 문서 + 독립 분석
- [x] c28: Avalanche L1의 알려진 약점은 밸리데이터 셋 부트스트랩 부담, 이더리움 유동성과의 단절, 그리고 Ava Labs 도구 의존이다.
  - kind: interpretive
  - needs: 독립 분석/비판
