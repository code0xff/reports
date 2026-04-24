## Introduction
- [ ] c01: MPC wallet의 핵심 차별점은 “여러 서명이 체인 위에 보이는 것”이 아니라 “하나의 공개키/서명 표면을 유지한 채 비밀키 사용 권한을 분산한다”는 데 있다.
  - kind: technical
  - needs: MPC wallet 또는 threshold signature의 정의를 제시하는 1차 문헌, multisig 구조를 정의하는 1차 문헌
- [ ] c02: multisig와 MPC wallet는 모두 단일 실패지점(single point of failure)을 줄이려 하지만, 체인 위에 드러나는 실행 모델과 호환성 측면에서 서로 다른 제약을 가진다.
  - kind: technical
  - needs: multisig smart contract docs/spec, threshold signature 또는 MPC wallet primary source
- [ ] c03: Ethereum/EVM 계열에서 multisig는 주로 스마트컨트랙트 계정 모델로 구현되고, MPC wallet는 보통 EOA와 호환되는 오프체인 threshold signing으로 구현된다.
  - kind: technical
  - needs: Safe 등 multisig 문서, MPC/threshold ECDSA 문서

## 수학적 기초
- [ ] c04: Shamir secret sharing은 threshold 미만의 share만으로는 비밀에 대한 정보를 주지 않으며, threshold 이상 share로만 비밀을 복원할 수 있다.
  - kind: technical
  - needs: secret sharing primary source 또는 표준 암호 문헌
- [ ] c05: Schnorr 계열 threshold signature는 선형성 덕분에 “각 참여자의 부분 계산을 합치면 정상 서명 검증식이 성립한다”는 구조를 갖는다.
  - kind: technical
  - needs: Schnorr/threshold Schnorr primary source
- [ ] c06: ECDSA threshold signing은 Schnorr보다 어렵고, 그 이유는 nonce 역원과 곱셈 항 때문에 비선형 secure computation이 필요하기 때문이다.
  - kind: technical
  - needs: threshold ECDSA primary source
- [ ] c07: MPC wallet의 보안에서 nonce 생성과 일관성 검증은 key share 보호만큼 중요하며, nonce 실패는 개인키 노출로 이어질 수 있다.
  - kind: technical
  - needs: ECDSA/security primary source, threshold signing primary source

## MPC wallet의 작동 원리
- [ ] c08: 실무형 MPC wallet는 “단일 개인키를 나누는” 방식보다 DKG를 통해 애초에 키를 공동 생성하는 방식을 선호한다.
  - kind: technical
  - needs: DKG/threshold keygen primary source, wallet vendor or library docs
- [ ] c09: MPC wallet의 서명 프로토콜은 일반적으로 key shares 외에 signing session마다 새 nonce/ephemeral 값과 다중 round message exchange를 요구한다.
  - kind: technical
  - needs: threshold ECDSA protocol primary source
- [ ] c10: key refresh 또는 proactive refresh는 공개키를 유지한 채 share만 갱신해 장기 운영 리스크를 줄이는 기법으로 쓰인다.
  - kind: technical
  - needs: proactive secret sharing / threshold key refresh primary source
- [ ] c11: 정책 승인, 기기 바인딩, 복구 절차는 MPC 서명 프로토콜 자체와 별개인 상위 운영 계층으로 구현되는 경우가 많다.
  - kind: interpretive
  - needs: wallet architecture docs from multiple vendors or open-source projects

## DKLs23
- [ ] c12: DKLs23는 threshold ECDSA 계열에서 communication round와 online 비용을 줄이는 방향의 실무적 개선안으로 제시되었다.
  - kind: technical
  - needs: DKLs23 paper primary source
- [ ] c13: DKLs23는 OT 기반 도구와 사전계산(preprocessing)을 활용해 온라인 서명 단계의 부담을 줄인다.
  - kind: technical
  - needs: DKLs23 paper primary source
- [ ] c14: DKLs23가 곧바로 “모든 MPC wallet가 반드시 채택해야 하는 최종형”을 뜻하지는 않으며, 구현 복잡도·보안 가정·배포 환경에 따라 다른 threshold ECDSA 계열과의 비교가 필요하다.
  - kind: interpretive
  - needs: DKLs23 paper, 구현체 docs, 비교 논의 source
- [ ] c15: 실무 문맥에서 DKLs23의 의미는 EOA 호환 threshold ECDSA를 더 낮은 지연과 더 현실적인 모바일/서버 분산 모델에 가깝게 만든 데 있다.
  - kind: interpretive
  - needs: DKLs23 paper plus implementation/adoption discussion

## MPC wallet vs multisig
- [ ] c16: multisig는 온체인 정책 집행과 감사 가능성이 강점인 반면, MPC wallet는 단일 서명 표면 때문에 프라이버시·체인 호환성·가스 효율에서 강점을 가질 수 있다.
  - kind: technical
  - needs: multisig smart contract docs, threshold signing or wallet docs, independent comparison
- [ ] c17: UTXO 기반 자산과 account-based 자산의 서명·계정 모델 차이 때문에 multisig와 MPC의 호환성 및 운영 비용 구조는 동일하지 않다.
  - kind: factual
  - needs: Bitcoin/Ethereum account or transaction model docs, multisig support docs, MPC wallet docs
- [ ] c18: MPC wallet는 온체인에서 직접 threshold policy를 강제하지 않기 때문에, 정책 집행과 감사 로그를 별도 시스템에 의존하는 경우가 많다.
  - kind: technical
  - needs: architecture docs or primary sources on MPC wallet operation
- [ ] c19: multisig는 컨트랙트 취약점이나 업그레이드 리스크를 떠안지만, MPC wallet는 복잡한 오프체인 암호 프로토콜과 구현 리스크를 떠안는다.
  - kind: technical
  - needs: multisig contract docs/audits, threshold protocol docs/audits or literature

## 언제 무엇을 선택해야 하는가
- [ ] c20: DAO treasury, 프로토콜 운영 금고, 명시적 승인 체인이 중요한 기관 지갑에는 multisig가 더 자연스러운 선택인 경우가 많다.
  - kind: interpretive
  - needs: governance/treasury docs, multisig docs, architecture discussions
- [ ] c21: 사용자가 일반 EOA처럼 지갑을 써야 하거나, 여러 체인에서 동일한 서명 표면을 유지해야 하거나, 컨트랙트 계정을 피해야 하는 경우에는 MPC wallet가 유리한 경우가 많다.
  - kind: interpretive
  - needs: MPC wallet docs, account model docs across chains
- [ ] c22: embedded wallet나 consumer wallet에서는 MPC가 seed phrase 노출을 줄이면서도 self-custody에 가까운 UX를 제공하는 수단으로 채택된다.
  - kind: factual
  - needs: wallet vendor primary docs plus independent coverage
- [ ] c23: custody 또는 institutional settings에서는 “MPC냐 multisig냐”보다 승인 정책, HSM 연동, 백업, 복구, 감사 흐름을 어떤 계층에 두는지가 실제 설계 품질을 좌우한다.
  - kind: interpretive
  - needs: institutional wallet architecture docs, security guidance

## Limitations
- [ ] c24: MPC wallet 관련 공개 자료의 상당 부분은 벤더 문서이므로, 성능/보안/UX에 관한 주장 중 일부는 독립 검증이 제한적이다.
  - kind: factual
  - needs: source inventory showing vendor concentration
- [ ] c25: DKLs23 및 threshold ECDSA의 수학은 공개 논문으로 검토 가능하지만, 실제 상용 wallet 구현의 세부 프로토콜과 운영 보안은 완전히 공개되지 않는 경우가 많다.
  - kind: factual
  - needs: papers plus vendor/open-source implementation visibility comparison
