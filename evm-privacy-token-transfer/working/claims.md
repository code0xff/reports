# Claims: evm-privacy-token-transfer

## Introduction
- [x] c01: Ethereum의 모든 계정 주소, 잔액, 트랜잭션 내역은 기본적으로 공개되어 누구나 조회할 수 있다.
  - kind: factual
  - needs: Ethereum 공식 문서 또는 EVM 설계 문서
- [x] c02: OFAC는 2022년 8월 Tornado Cash를 제재했고, 미국 제5순회법원은 2024년 11월 불변 스마트 컨트랙트에 대한 제재가 법적 권한을 초과했다고 판결했으며, 재무부는 2025년 4월 제재를 해제했다.
  - kind: factual
  - needs: Venable LLP 또는 Mayer Brown 법률 분석, OFAC 공식 발표
- [x] c03: 프라이버시 토큰 전송에 대한 합법적 사용 사례로는 기업 간 결제, OTC 거래, 개인정보 보호가 있으며, 이는 규제 기관도 인정하는 범주다.
  - kind: interpretive
  - needs: 규제 기관 가이던스 또는 학술 문헌

## 배경: 프라이버시 위협 모델과 암호학 기초
- [x] c04: EVM 프라이버시의 목표는 발신자 익명성, 수신자 익명성, 금액 기밀성 세 가지로 구분되며, 각 기술은 이 중 일부만을 달성한다.
  - kind: technical
  - needs: 학술 문헌 또는 프로토콜 설계 문서
- [x] c05: zk-SNARK는 증명자가 특정 정보를 공개하지 않고 해당 정보를 알고 있음을 검증자에게 증명할 수 있는 암호학 기법으로, Railgun과 Aztec에서 핵심으로 사용된다.
  - kind: technical
  - needs: zk-SNARK 설명 문서 또는 Groth16/PLONK 논문
- [x] c06: 완전동형암호(FHE)는 암호화된 데이터에 대해 복호화 없이 연산을 수행할 수 있는 기법으로, Zama FHEVM의 핵심 기술이다.
  - kind: technical
  - needs: Zama 공식 문서 또는 FHE 학술 논문

## 기술 접근법별 분류 및 메커니즘
- [x] c07: ERC-5564 스텔스 주소는 SECP256k1 타원곡선 ECDH를 사용하여 발신자가 수신자의 스텔스 메타주소로부터 일회성 주소를 생성하고, 수신자만이 뷰잉 키로 해당 주소를 식별할 수 있다.
  - kind: technical
  - needs: ERC-5564 공식 EIP 문서
- [x] c08: ERC-5564의 뷰 태그(view tag)는 1바이트로 구성되어 수신자가 자신에게 온 트랜잭션을 스캔할 때 계산량을 약 6배 줄여준다.
  - kind: technical
  - needs: ERC-5564 EIP 문서
- [x] c09: ERC-6538은 스텔스 메타주소 레지스트리 컨트랙트를 정의하며, 사용자가 자신의 스텔스 메타주소를 온체인에 등록할 수 있게 한다.
  - kind: technical
  - needs: ERC-6538 EIP 문서
- [x] c10: Railgun은 zk-SNARK 기반 쉴드 풀을 Ethereum, Polygon, Arbitrum, BNB Chain에 배포하여 ERC-20 토큰의 프라이버시 전송을 가능하게 한다.
  - kind: technical
  - needs: Railgun 공식 문서 또는 컨트랙트 코드
- [x] c11: Railgun의 Private Proofs of Innocence는 Elliptic, ScamSniffer, PureFi, SlowMist, Chainalysis Sanctions Oracle 5개 리스트 제공자의 데이터를 사용하여 토큰이 악성 리스트에 없음을 재귀 zk 증명으로 검증한다.
  - kind: technical
  - needs: Railgun 공식 Private POI 문서
- [x] c12: Aztec Network는 프라이빗 스마트 컨트랙트를 지원하는 ZK L2로, Noir 언어로 개발하며 계정, 트랜잭션, 컨트랙트 실행 모두를 암호화할 수 있다.
  - kind: technical
  - needs: Aztec 공식 문서 또는 블로그
- [x] c13: Zama FHEVM의 ERC-7984는 온체인 컨트랙트가 암호화된 핸들(handle)을 저장하고, 오프체인 코프로세서 네트워크가 FHE 연산을 수행한 뒤 결과를 게이트웨이를 통해 체인에 기록하는 구조다.
  - kind: technical
  - needs: Zama 공식 문서 또는 ERC-7984 Ethereum Magicians 스레드

## 주요 구현체 상세 분석
- [x] c14: ScopeLift의 stealth-address-sdk(v1.0.0-beta.5, 2026-04-30)는 ERC-5564와 ERC-6538을 구현한 TypeScript SDK로 스텔스 주소 생성, 개인 키 계산, 어나운스먼트 검증 기능을 제공한다.
  - kind: technical
  - needs: ScopeLift GitHub 저장소
- [x] c15: Aztec Network는 2025년 11월 Ignition 체인을 출시했고, 2026년 3월 Alpha 단계에서 증명 시스템 전체에 영향을 미치는 치명적 취약점이 발견되어 2026년 7월 v5 패치가 예정되어 있다.
  - kind: factual
  - needs: The Block 또는 Aztec 공식 발표
- [x] c16: 2026년 3월 GSR과 Zama는 Zama FHE 프로토콜을 사용하여 Ethereum 위에서 최초의 기관 간 기밀 OTC 거래를 KYC 완료 상태로 완결했다.
  - kind: factual
  - needs: BlockEden.xyz 또는 GSR/Zama 공식 발표
- [x] c17: Privacy Pools는 Vitalik Buterin 등이 2023년 제안한 컴플라이언스 친화적 믹서로, 사용자가 자신의 자금이 악성 소스에서 오지 않았음을 ZK 증명으로 제시할 수 있다. 0xbow 팀이 이를 Ethereum 메인넷에 실제 배포했다.
  - kind: factual
  - needs: SSRN 논문 또는 The Defiant 기사

## 규제 및 컴플라이언스 환경
- [x] c18: Tornado Cash OFAC 제재(2022)의 핵심 법적 쟁점은 불변 스마트 컨트랙트가 IEEPA 하의 "재산(property)"에 해당하는지 여부였으며, 미국 제5순회법원은 이를 부정했다.
  - kind: factual
  - needs: 5th Circuit 판결문 또는 Mayer Brown 법률 분석
- [x] c19: Railgun의 Private POI 컴플라이언스 레이어는 사용자의 0zk 주소 상세 정보를 공개하지 않으면서 토큰이 알려진 악성 목록에 없음만을 증명하여 프라이버시와 컴플라이언스를 양립시킨다.
  - kind: technical
  - needs: Railgun 공식 문서
- [x] c20: ERC-7984 기반 Zama FHE 시스템은 임계값 KMS(Key Management System)를 통해 단일 주체가 복호화를 수행할 수 없도록 분산화하며, 지정된 감사자나 규제기관에게만 선택적 공개가 가능하다.
  - kind: technical
  - needs: Zama 공식 문서

## 실용적 구현 가이드
- [x] c21: 수신자 익명성만을 목표로 하는 경우 ERC-5564 스텔스 주소가 가장 낮은 구현 복잡도와 기존 EVM 인프라 호환성을 제공하는 현실적 선택지다.
  - kind: interpretive
  - needs: ERC-5564 구현 가이드 및 SDK 문서
- [x] c22: DeFi 프로토콜과 통합하면서 완전한 발신자·수신자·금액 프라이버시가 필요한 경우, Private POI 컴플라이언스 레이어를 갖춘 Railgun이 2026년 현재 가장 성숙한 선택지다.
  - kind: interpretive
  - needs: Railgun 기술 문서 및 생태계 현황
- [x] c23: Aztec Network는 프로그래머블 프라이버시 애플리케이션에 이상적이지만 2026년 3월 치명적 취약점 발견으로 프로덕션 배포에는 적합하지 않으며 2026년 7월 v5 이후 재검토가 필요하다.
  - kind: interpretive
  - needs: Aztec 공식 발표 및 취약점 리포트
- [x] c24: Zama FHEVM/ERC-7984는 기관 대상 기밀 금융 서비스에 적합하나, 코프로세서 네트워크 의존성, 표준 ERC-20 대비 높은 가스 비용, OpenZeppelin 위자드 미완성 등으로 일반 서비스 개발에는 아직 장벽이 있다.
  - kind: interpretive
  - needs: Zama 공식 문서 및 ERC-7984 Ethereum Magicians 토론
- [x] c25: 스텔스 주소의 주요 UX 문제는 수신자가 스텔스 주소에서 트랜잭션을 전송할 가스비(ETH)가 없다는 점으로, 별도의 가스 스폰서십 메커니즘이 필요하다.
  - kind: technical
  - needs: ERC-5564 구현 가이드 또는 Umbra 프로토콜 문서
