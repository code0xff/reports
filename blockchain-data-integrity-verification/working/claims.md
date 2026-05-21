# Claims

## Introduction
- [ ] c01: 블록체인 기반 데이터 정합성 검증은 (a) 변조 증거(tamper-evidence)와 (b) 데이터 가용성(availability)의 서로 다른 두 문제를 함께 다룬다.
  - kind: interpretive
  - needs: DA 문헌 + 노타라이제이션 문헌

## 기술적 접근
- [ ] c02: OpenTimestamps는 다수의 해시를 Merkle 트리로 묶고 그 루트만 Bitcoin OP_RETURN으로 앵커링하여, 한 번의 트랜잭션으로 수만 건의 timestamp를 동시에 생성한다.
  - kind: technical
  - needs: opentimestamps.org + 외부 분석
- [ ] c03: Sigstore의 Rekor는 처음에는 블록체인을 검토했지만 transparency log가 더 적합하다고 판단해 Certificate Transparency 가족의 append-only 트리로 전환했다.
  - kind: factual
  - needs: Sigstore 문서
- [ ] c04: Filecoin은 Proof-of-Replication(PoRep)과 Proof-of-Spacetime(PoSt)으로 저장 노드가 데이터를 실제 보관 중임을 정기적으로 증명한다.
  - kind: technical
  - needs: Filecoin docs
- [ ] c05: Arweave는 Succinct Proof of Random Access(SPoRA) 합의로 마이너가 임의의 과거 데이터를 즉시 접근할 수 있음을 증명해야 보상을 받는다.
  - kind: technical
  - needs: Arweave 문서
- [ ] c06: Celestia는 erasure-coded data availability sampling을 사용해 누구나 가벼운 검증으로 데이터 가용성을 확인할 수 있게 한다.
  - kind: technical
  - needs: Celestia docs
- [ ] c07: EigenDA는 publicly verifiable한 데이터 가용성 대신 KZG 다항식 증명 + DAC(데이터 가용성 위원회) 모델을 채택한다.
  - kind: technical
  - needs: EigenDA / Avail 비교

## Product Landscape
- [ ] c08: Guardtime KSI는 2007년 에스토니아 설립 이후 e-Residency, Land Register, e-Business Register 등의 인프라에서 사용되어 왔다.
  - kind: factual
  - needs: Guardtime 자료 + EU 자료
- [ ] c09: OriginStamp는 2013년 이후 6,000만 건 이상의 timestamp 증명을 생성했다고 자체 공개한다.
  - kind: factual
  - needs: OriginStamp
- [ ] c10: Chainlink Proof of Reserve는 stablecoin · 토큰화 자산 · wrapped 자산의 reserve를 정기적으로 온체인에 게시하며, threshold/deviation/heartbeat 트리거로 업데이트한다.
  - kind: technical
  - needs: Chainlink 자료
- [ ] c11: Ethereum Attestation Service는 두 개의 스마트 컨트랙트(스키마 레지스트리 + attestation)로 EIP-712 서명 기반 attestation을 on/off-chain 모두 지원한다.
  - kind: technical
  - needs: EAS docs
- [ ] c12: VeChain ToolChain과 IBM Food Trust는 공급망 정합성 검증을 위해 IoT/RFID + 블록체인 결합 아키텍처를 사용한다.
  - kind: factual
  - needs: VeChain / IBM 자료
- [ ] c13: Sigstore Rekor는 Apache-2.0 라이선스로, 소프트웨어 supply chain 메타데이터를 append-only ledger에 기록한다.
  - kind: factual
  - needs: Rekor README

## Discussion
- [ ] c14: 블록체인 기반 데이터 정합성은 "원본 데이터 자체"를 보장하지 않고 "해시·메타데이터의 변조 증거"만 보장하기 때문에, 원본의 진실성은 별도 검증 경로가 필요하다.
  - kind: interpretive
  - needs: Sigstore / OpenTimestamps 자료
- [ ] c15: Sigstore가 블록체인 대신 transparency log를 택한 사례는 "모든 정합성 검증에 블록체인이 필요한 것은 아니다"라는 반론의 1차 근거가 된다.
  - kind: interpretive
  - needs: Sigstore 자료
