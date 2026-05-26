## Introduction

모듈러 블록체인 패러다임은 단일 체인이 실행·합의·결제·데이터 가용성(Data Availability, 이하 DA)을 모두 담당하는 모놀리식 구조와 달리, 각 기능을 서로 다른 레이어가 분담하도록 설계된다. Celestia 백서는 이 분리를 "consensus가 트랜잭션 순서와 데이터 가용성만 보장하고 실행 검증은 상위 레이어가 담당하도록 분해"하는 것이라고 정의한다[^s03]. 이러한 흐름 속에서 Celestia와 EigenDA는 모두 "범용 DA 레이어"를 표방하지만 출발점은 서로 다르다. Celestia는 TIA로 보안되는 독립 PoS 체인이며[^s01][^s04], EigenDA는 자체 합의 없이 EigenLayer 리스테이킹 ETH로 보안되는 AVS(Actively Validated Service)다[^s05][^s17]. 본 보고서는 두 시스템의 기술 기반과 신뢰 모델, 처리량, 채택 양상을 비교한다.

## Background: 데이터 가용성 문제와 해법

DA 문제의 핵심은 "라이트 노드가 풀노드를 신뢰하지 않고도 블록 데이터가 실제로 게시되었는지" 확인하는 것이다. Al-Bassam, Sonnino, Buterin(2018)은 라이트 클라이언트에게 사기 증명과 확률적 샘플링을 결합하면 "정직한 다수 가정을 제거"할 수 있음을 처음으로 형식화했다[^s08]. 이 결과는 오늘날 Data Availability Sampling(DAS)의 기반이 된다.

DAS는 데이터 블록을 2차원 행렬로 배치한 뒤 Reed-Solomon 부호화로 2k×2k 매트릭스로 확장하고, 라이트 노드들이 무작위 좌표를 표본 추출해 일부 청크가 빠지면 즉시 감지하도록 한다[^s01][^s13]. Reed-Solomon 부호화의 수학적 성질상 충분한 비율의 청크만 확보되어도 원본 복구가 가능하다[^s01].

DAS와는 다른 축으로, KZG 다항식 약속(Kate-Zaverucha-Goldberg, 2010)은 다항식 한 개에 대한 약속과 임의 위치 평가 증명을 모두 "한 개의 군 원소" 크기로 만들 수 있다는 성질을 제공한다[^s09]. EigenDA의 청크 인코딩 정합성 검증, Ethereum 단커샤딩의 blob commitment 등 현대 DA 설계 다수가 이 약속 스킴을 활용한다[^s05][^s10].

## Celestia: 아키텍처와 기술 기반

Celestia는 Cosmos 스택 위에서 동작하는 PoS 체인이다. 합의 엔진은 CometBFT(Tendermint의 후속) 포크인 celestia-core이며, 검증인 집합은 TIA 토큰으로 스테이킹된다[^s16][^s01]. 2023년 10월 31일 메인넷 베타가 출범했고 같은 날 580,000명에게 TIA 에어드롭이 진행되었다[^s04].

데이터 구조 측면에서 Celestia의 정체성은 Namespaced Merkle Tree(NMT)에 있다. NMT는 각 노드가 자식들의 최소/최대 namespace 범위를 함께 해싱하는 변형 머클 트리로, 리프는 `<NsID>||<Message Data>` 형식이며 namespace 순으로 정렬된다[^s19]. 그 결과 한 롤업은 자기 namespace의 데이터만 다운받고도 누락이 없음을 증명할 수 있다[^s01].

블록 단위로 Celestia는 k×k 데이터 사각형을 2k×2k로 erasure-coding하고, Tendermint 블록 헤더가 이 row/column 루트를 커밋한다[^s01]. 라이트 노드는 무작위 좌표 샘플링으로 DA를 직접 검증하며 풀노드 신뢰 가정을 제거한다[^s13][^s11].

Ethereum L2가 Celestia의 DA를 사용하기 위한 다리는 **Blobstream**이다(구 Quantum Gravity Bridge에서 명칭 변경). Blobstream은 Celestia 검증인 집합이 데이터 루트에 서명한 attestation을 EVM 체인의 light-client 컨트랙트에 중계하며, 최신 구현은 SP1 기반 ZK 라이트 클라이언트로 Tendermint 합의와 데이터 커밋먼트를 검증한다[^s02][^s11].

## EigenDA: 아키텍처와 기술 기반

EigenDA는 자체 합의 체인이 아니라 EigenLayer 위에서 동작하는 AVS다. ETH 리스테이커가 EigenDA 오퍼레이터로 등록되어 DA 노드를 운영하며, 보안은 "동일한 스테이크를 여러 애플리케이션에 재활용"하는 EigenLayer의 공유 보안 모델에서 나온다[^s05][^s17]. 2024년 4월 9일 EigenLayer Stage 2와 함께 EigenDA가 Ethereum 메인넷에 출시되었다[^s06].

데이터 흐름은 다음과 같이 정리된다[^s05][^s10][^s12]:

1. 롤업 시퀀서가 blob을 **Disperser**에 업로드한다.
2. Disperser는 Reed-Solomon erasure coding으로 blob을 다수의 청크로 분할하고 — V2/Blazar에서는 한 blob을 8,192 chunk(8x redundancy)로 확장하며 1,024 chunk만 있어도 복원 가능 — 각 청크에 대한 KZG commitment와 multi-reveal proof를 생성한다.
3. 청크가 EigenDA 오퍼레이터에게 분산되고, 오퍼레이터는 KZG 약속에 대해 청크가 올바른지 검증한 뒤 BLS 서명을 반환한다.
4. 집계된 BLS 서명은 Data Availability Certificate(DA-Cert)로 만들어져 Ethereum L1 컨트랙트에 게시되며, 롤업은 이 인증서를 자기 컨트랙트에서 검증한다.

즉 EigenDA는 자체 합의를 갖지 않고 "Ethereum 결제 레이어가 attestation을 받아들이는가"로 DA 보장을 마무리한다[^s12][^s17]. 라이트 노드 DAS 대신 retrieval-based 모델을 채택하며 — 사용자는 필요한 청크를 직접 가져오고, 충분한 청크가 살아 있다는 사실은 attestation으로 보증된다[^s07] _(interpretive)_.

V2(코드명 Blazar)에서는 컨트롤 플레인과 데이터 플레인을 분리해 100 MB/s 처리량을 목표로 한다 _(vendor-stated)_[^s10]. EigenLayer 슬래싱 프리미티브는 2025년 4월 17일 메인넷에 활성화되었으며, "오퍼레이터의 스테이크는 AVS와 합의한 commitment를 충족하지 못하면 소각될 수 있다"는 형태로 작동한다[^s18].

## Comparative Analysis

**신뢰 모델.** Celestia는 자체 검증인 집합 — TIA를 스테이킹한 PoS validator — 의 정직성을 1차 보안 가정으로 삼는다[^s01][^s11]. EigenDA는 자체 검증인 집합이 없으며 Ethereum L1에 attestation을 올리는 EigenLayer 리스테이커 집합에 의존한다[^s12][^s17]. 두 모델은 보안 자본의 출처가 다르다 — TIA 시가총액 vs Ethereum 리스테이킹 ETH — 는 점에서 구조적으로 비교된다 _(interpretive)_[^s05][^s07].

**검증 가능성.** Celestia는 라이트 클라이언트가 DAS로 직접 가용성을 검증할 수 있다는 점을 시스템의 핵심 신뢰 가정 축소 장치로 든다[^s01][^s13]. 반면 경쟁 벤더 분석(Avail)은 EigenDA를 "DAC(Data Availability Committee)에 가까운 모델"로 분류하며, 사용자는 "위원회 구성원이 데이터를 보관하기로 동의했다는 사실만 확인할 수 있다"고 본다[^s07]. EigenLabs는 같은 시스템을 ETH 보안을 재활용하는 탈중앙 서비스로 기술한다[^s05][^s17]. 두 관점은 충돌하므로 본 보고서에서도 그대로 병기한다.

**처리량.** Celestia는 메인넷 출시 시점에 2 MB 블록으로 시작했고 이후 8 MB로 확장되었으며, 6초 블록 타임 기준 약 1.33 MB/s 수준으로 보고된다[^s04][^s07]. EigenDA V2(Blazar)는 100 MB/s를 목표 처리량으로 광고한다 _(vendor-stated)_[^s10]. 두 수치는 측정 방법과 보안 가정이 다른 시스템의 광고치이므로 단순 비교는 신중해야 한다 _(interpretive)_.

**다항식 약속의 활용.** 두 시스템 모두 KZG 계열 약속을 사용하지만 활용 위치가 다르다. Celestia는 2D RS 인코딩과 NMT 위에서 DAS와 (필요 시) fraud-proof 기반 무결성 보강을 두는 반면, EigenDA는 KZG commitment를 코어 dispersal 경로의 정합성 증명으로 사용한다[^s09][^s05][^s10].

**브리지/통합.** Celestia는 EVM 측에 Blobstream(현재는 SP1 ZK 라이트 클라이언트 기반)으로 attestation을 올린다[^s02][^s11]. EigenDA는 별도 브리지 없이 DA-Cert를 직접 Ethereum L1 컨트랙트에 게시한다[^s12].

## Discussion: 채택, 트레이드오프, 리스크

채택 면에서 Celestia는 출시 첫 해부터 Manta Pacific 등 다수의 EVM L2를 흡수했다[^s14] _(unverified — single source)_. EigenDA는 EigenLayer 생태계 내 AVS로서, 그리고 Manta 같은 다중 DA 통합 사례에서 사용된다[^s07]. 두 시스템 모두 Arbitrum Orbit·OP Stack·Polygon CDK 등 주요 롤업 프레임워크와 통합되어 있다는 보도가 있으나 정확한 활성 통합 수는 자료마다 차이가 있다[^s07].

리스크 측면에서 Celestia는 PoS 검증인 집합 자체의 안전성·생동성에 의존한다. 독립 검토(L2BEAT)는 검증인 슈퍼다수(2/3 이상)가 부정직하게 행동하고 라이트 노드들이 reconstruction에 실패할 때, 또는 Blobstream 컨트랙트가 무지연 악의 업그레이드를 거칠 때 가용성 보장이 깨질 수 있다고 지적한다[^s11].

EigenDA는 EigenLayer 일반 리스크를 상속한다. EigenLayer 슬래싱은 2025년 4월에야 메인넷에 활성화되었고, AVS별 opt-in 모델이므로 EigenDA의 슬래싱 조건과 실효성은 시간이 지나며 결정되는 과정에 있다[^s18]. 또한 현재 Disperser는 EigenLabs가 호스팅하는 단일 서비스이며, 분산 dispersal과 슬래싱 강화가 본격 가동될 때 비로소 광고된 보안 모델이 완전히 성립한다 _(early signal)_[^s05][^s10].

## Limitations

- 본 보고서가 다룬 처리량과 비용 수치는 발표 시점 자료에 기반하며, 두 시스템 모두 빠르게 변화 중이다(예: Celestia Matcha/Fibre 로드맵, EigenDA V2/Blazar 출시). 일부 수치는 본 보고서 작성 이후 변경될 가능성이 높다[^s10][^s07].
- EigenDA의 슬래싱 활성화 시점과 EigenDA-특정 슬래싱 조건은 본 보고서 작성 시점에 일부만 공개되어 있다[^s18].
- Manta Pacific의 Celestia 채택 보도(`s14`)는 본문 접근이 제한되어 본문 인용 없이 제목 단위 검증만 가능했다. 추가 1차 자료 확보가 권장된다.
- 본 보고서의 비교에는 다른 DA 후보(Avail, NEAR DA, EIP-4844 blob 등)는 의도적으로 포함하지 않았다.

## Abstract

Celestia와 EigenDA는 모두 "범용 DA 레이어"를 표방하지만 구조적 출발점이 다르다. Celestia는 CometBFT 합의·2D Reed-Solomon erasure coding·NMT·라이트 노드 DAS를 일관되게 묶은 독립 PoS 체인이며, EigenDA는 자체 합의 없이 EigenLayer 리스테이킹 ETH로 보안되는 AVS로서 KZG 약속과 BLS attestation을 통해 Ethereum L1에 DA-Cert를 게시한다. 본 보고서는 (1) DA 문제 정의와 DAS·Reed-Solomon·KZG의 이론적 기반, (2) Celestia의 합의·데이터 구조·Blobstream 브리지, (3) EigenDA의 Disperser·Operator·attestation 파이프라인을 정리한 뒤, 신뢰 모델·검증 가능성·처리량·다항식 약속 활용·브리지 방식 등 다섯 축에서 두 시스템을 비교하고, 채택·슬래싱·운영 리스크를 논의한다. 핵심 결론은 두 시스템의 우열이 아니라 "신뢰 가정과 자본 출처의 차이가 곧 설계의 차이"라는 점이다.
