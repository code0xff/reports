# 블록체인 기반 데이터 정합성 검증 — 기술적 접근과 제품 지형도

## 초록

본 보고서는 "블록체인이 데이터 정합성(integrity)을 어떻게 검증하는가"라는 질문을 (a) **변조 증거(tamper-evidence)** 와 (b) **데이터 가용성(availability)** 의 두 갈래로 나눠 정리한다. 기술적으로는 일곱 가지 접근이 시장에 나와 있다 — 해시 앵커링[^s01][^s02][^s03], Merkle proof + transparency log[^s06][^s07][^s08], 콘텐츠 주소화[^s13], 증명 기반 분산 스토리지(PoRep / PoSt / SPoRA)[^s13][^s14], 온체인 attestation(EAS / Sigstore Fulcio)[^s11][^s12], 오라클 데이터 피드(Chainlink Proof of Reserve)[^s09][^s10][^s25], 그리고 데이터 가용성 레이어(Celestia / EigenDA)[^s15][^s16][^s21]다. 본 보고서는 각 접근을 1차 사양으로 정리한 뒤, 시장에서 운용 중인 9개 제품 — OpenTimestamps · Guardtime KSI · OriginStamp · Sigstore Rekor · EAS · Chainlink PoR · Filecoin / Arweave · VeChain / IBM Food Trust · Celestia / EigenDA — 의 메커니즘을 같은 형식으로 비교하고, 어느 시나리오에 어느 접근이 적합한지 트레이드오프까지 정리한다.

## 1. 서론 — 데이터 정합성 검증 문제

"데이터 정합성 검증"이라는 표현은 시장에서 두 가지 서로 다른 문제를 가리키는 단어로 쓰인다.

- **변조 증거(tamper-evidence)** — "이 데이터가 시점 T 이후 바뀌지 않았다는 것을 누구나 독립적으로 확인할 수 있다." 노타라이제이션·문서 타임스탬프·소프트웨어 공급망·공급망 추적이 모두 이 자리에 들어간다.
- **데이터 가용성(availability)** — "이 데이터가 네트워크에 실제로 존재하고, 누구나 가져갈 수 있다." Rollup이 자신의 트랜잭션 데이터를 어느 곳에 게시했는지 검증하는 문제가 대표적이다[^s15][^s21].

블록체인이 두 문제 모두에 후보가 되는 이유는 단순하다 — 분산된 노드 다수가 동일한 사본을 들고 있고, 그 사본은 합의 알고리즘으로 동결된다. 이 합의된 상태에 (a) 데이터 해시를 박거나 (b) 데이터 자체를 박으면, 검증자는 별도의 신뢰 기관 없이 정합성을 확인할 수 있다.

다만 *항상* 블록체인이 필요한 것은 아니다. Sigstore는 Rekor를 만들 때 처음에는 블록체인을 검토했지만 transparency log가 더 적합하다고 판단해 Certificate Transparency 가족의 append-only 트리로 전환했다[^s08]. 본 보고서가 일곱 접근을 모두 나란히 놓고 비교하는 이유는 — "정합성"이라는 단어가 같은 자리에서 자주 다른 메커니즘으로 풀린다는 점을 분명히 하기 위함이다 _(interpretive)_.

## 2. 기술적 접근 — 일곱 가지 패턴

### 2.1 해시 앵커링

가장 단순한 패턴이다. 원본 데이터의 SHA-256 해시를 공용 블록체인 트랜잭션 한 자리에 박는다. OpenTimestamps의 한 줄 정의가 가장 명료하다 — "OpenTimestamps aims to be a standard format for blockchain timestamping"[^s01]. 비용은 트랜잭션 하나의 가스/수수료이고, 검증은 동일 해시를 재계산해 트랜잭션을 다시 찾아내면 끝난다.

해시 자체만 박으면 N개의 문서에 N번의 트랜잭션이 필요하다. 다음 패턴이 이 비용을 푼다.

### 2.2 Merkle proof + transparency log

여러 해시를 Merkle 트리로 묶고 **루트만** 한 번 박는다. OpenTimestamps는 "An OpenTimestamps server provides aggregation of multiple document hashes in a Merkle tree data structure and attests only the hash of the Merkle tree root"라고 명시한다[^s02]. 그 루트는 Bitcoin OP_RETURN으로 박힌다 — "The commitment process embeds the 32-byte Merkle root hash into a Bitcoin transaction using an OP_RETURN script output"[^s03]. 결과적으로 10,000 건의 문서가 한 번의 Bitcoin 트랜잭션에 모이고, 각 문서는 자기 leaf에서 루트까지의 **Merkle 경로**(즉 `.ots` 파일)를 들고 다닌다.

같은 구조가 소프트웨어 공급망에서는 **transparency log**라는 이름으로 운영된다. Sigstore의 Rekor가 그 대표 — "Rekor is an append-only (sometimes called 'immutable') data log that stores signed metadata about a software artifact"[^s07]. 흥미롭게도 Rekor는 블록체인을 거치지 않는다 — "When first developing Rekor, blockchain was attempted but determined to be less optimal technology. Instead, Rekor is based on transparency log technology similar to Certificate Transparency logs used for digital certificates"[^s08]. 즉 같은 Merkle 트리 추상이 블록체인을 거치든 거치지 않든 동일하게 동작한다는 점이 핵심이다.

### 2.3 콘텐츠 주소화 (CIDs / IPFS)

데이터의 식별자 자체를 **데이터의 해시**로 정의하는 패턴이다. IPFS의 CID, Git의 SHA, Sigstore의 OCI 이미지 digest가 같은 가족이다. 식별자만 알면 다른 신뢰 기관 없이 받은 데이터를 즉시 검증할 수 있다 — "Decentralized storage solutions like IPFS, Filecoin and Arweave"[^s13]가 모두 이 추상을 공유한다. 블록체인 측에서는 이 CID를 다시 앵커링하거나 attestation에 첨부해 영속성을 더한다.

### 2.4 증명 기반 분산 스토리지 — Filecoin PoRep / PoSt, Arweave SPoRA

콘텐츠 주소화만으로는 "그 노드가 지금 그 데이터를 실제 보관 중인지"를 보장하지 못한다. Filecoin은 두 종류의 증명을 정기적으로 요구한다 — "Filecoin ensures data storage through Proof-of-Replication (PoRep) and Proof-of-Spacetime"[^s13]. PoRep는 "물리적으로 고유한 사본을 만들었다"는 증명이고, PoSt는 "시간이 지나도 그 사본을 계속 보관 중"이라는 증명이다.

Arweave는 다른 길을 택한다 — "Arweave uses a unique consensus mechanism called Succinct Proof of Random Access (SPoRA)"[^s14]. 마이너는 임의의 과거 데이터에 즉시 접근할 수 있어야 보상을 받고, 결과적으로 영구 저장을 유도한다.

### 2.5 Attestation / signed credentials

데이터에 대한 **누군가의 서명된 주장**을 온체인에 기록한다. Ethereum Attestation Service(EAS)의 한 줄 정의 — "EAS runs on two simple smart contracts: one for registering attestation Schemas and another for attesting with them"[^s11]. 스키마는 attestation의 형식을 강제하고, 실제 attestation은 그 스키마에 맞춰 EIP-712 서명으로 발행된다 — "Schemas are essential because they ensure that attestations are consistent, readable, and verifiable"[^s12]. EAS는 on-chain과 off-chain 두 모드를 모두 지원하므로, 비공개·민감 데이터는 해시만 박고 원본은 off-chain에 둘 수 있다[^s24] _(access-limited)_.

이 패턴은 자매 보고서 [`ethereum-attestation-service`](../ethereum-attestation-service/)에 더 상세히 다뤄져 있다.

### 2.6 오라클 데이터 피드

블록체인 *밖* 데이터를 정기적으로 가져와 *안*에서 검증할 수 있도록 만든다. Chainlink Proof of Reserve가 가장 대표적 — "Chainlink Proof of Reserve provides automated, tamper-proof reserve monitoring — powering stablecoins, tokenized assets, and DeFi protocols"[^s09]. 다중 오라클 노드가 (a) 온체인 지갑 잔액 (b) 자체 호스트 API (c) 제3자 attestation 보고서를 가져와 합의로 묶어 온체인에 게시한다[^s25]. 업데이트는 deviation 임계치 또는 heartbeat 주기로 트리거된다 — "PoR feeds can trigger updates based on deviation thresholds or heartbeat intervals"[^s10].

### 2.7 데이터 가용성 레이어 (Celestia · EigenDA)

Rollup이 자신의 트랜잭션 데이터를 어디에 게시했는지 *경량 클라이언트*가 검증할 수 있게 만든다. Celestia는 erasure-coding + DAS로 푼다 — "Celestia uses data availability sampling (DAS), a decentralized network that provides DA and allows anyone to efficiently verify via DAS"[^s15][^s21]. EigenDA는 다른 방향이다 — "EigenDA utilizes Reed Solomon encoding that is cryptographically verified by KZG polynomial opening proofs"[^s16]. 단, EigenDA는 publicly verifiable DAS 대신 위원회(DAC) 모델을 채택한다 — 즉 한쪽은 누구나 검증, 다른 쪽은 위원회의 정직성 가정에 의존한다는 차이가 있다[^s16] _(Avail의 정리 — 경쟁사 frame임을 본 보고서가 명시)_.

## 3. 제품 지형도 — 9개 실 운용 제품

### 3.1 OpenTimestamps — Bitcoin 앵커링의 표준

Peter Todd가 시작한 OpenTimestamps[^s01]는 calendar 서버에 해시를 보내면 그 서버가 Merkle 트리에 묶어 Bitcoin OP_RETURN으로 박는다[^s02][^s03]. 검증자는 `.ots` 파일과 Bitcoin 노드만 있으면 누구도 거치지 않고 검증할 수 있다. 비용 모델은 calendar 서버가 한 번의 Bitcoin 트랜잭션 비용을 부담하고, 사용자에게는 무료다[^s01].

### 3.2 Guardtime KSI — Estonia 정부 인프라

Guardtime은 2007년 Tallinn에서 설립된 회사다. KSI(Keyless Signature Infrastructure)는 "Proof-of-Existence artifacts for digital records at large scale"이라고 자기를 소개한다[^s22]. 핵심 아이디어는 동일하다 — "Single hashes from different records in the system are combined together based on when they are created … and form a tree-shaped data encryption structure"[^s04]. 에스토니아는 2012년부터 e-Justice, Land Register, e-Business Register, State Gazette를 포함한 e-services에 이 인프라를 도입했다고 EU 포털에서 명시한다 — "The Estonian Ministry of Justice has been using blockchain technology solutions for better auditability and integrity purposes since 2012"[^s05]. 네덜란드 정부도 같은 KSI를 integrity assurance용으로 도입했다고 Guardtime 자신이 발표했다[^s23] _(vendor-stated)_.

### 3.3 OriginStamp — 다중 체인 SaaS

OriginStamp는 2013년 시작된 SaaS형 timestamping 서비스다. 핵심 흐름은 OpenTimestamps와 유사하다 — "A SHA-256 hash is calculated locally in your browser. The file itself never leaves your device, only the hash is transmitted"[^s19]. 차이는 다중 체인(Bitcoin, Ethereum, Polygon 등)에 동시 앵커링한다는 것과, 사용자에게 GDPR 친화 인증서를 제공한다는 것이다. 자체 공개로는 — "Over 60 million proofs created since 2013"[^s20] _(vendor-stated)_.

### 3.4 Sigstore Rekor — 소프트웨어 공급망 transparency log

Rekor는 소프트웨어 산출물의 서명 메타데이터를 append-only ledger에 기록한다 — "Rekor's goals are to provide an immutable tamper resistant ledger of metadata generated within a software projects supply chain"[^s06]. 라이선스 Apache-2.0[^s06]. 이미 OCI 이미지, npm, PyPI, Helm 차트 같은 패키지 ecosystem이 Sigstore + Rekor 위에서 서명·검증된다. Rekor는 명시적으로 블록체인을 *쓰지 않는* 길을 택했다[^s08] — 본 보고서가 "블록체인이 데이터 정합성에 항상 필요한 것은 아니다"의 가장 강한 1차 근거로 든다.

### 3.5 Ethereum Attestation Service — 온체인 attestation의 사실상 표준

EAS는 두 컨트랙트(Schema Registry + Attestation)로 attestation을 다룬다[^s11]. 스키마는 attestation의 형식을 명시적으로 정의하고 — "Schemas are essential because they ensure that attestations are consistent, readable, and verifiable"[^s12] — EIP-712 서명을 통해 on/off-chain 모두에서 사용 가능하다[^s24]. 자매 보고서 [`ethereum-attestation-service`](../ethereum-attestation-service/)에 코드 수준 상세가 정리되어 있다.

### 3.6 Chainlink Proof of Reserve — 오프체인 reserve의 온체인 게시

USDC, USDT, WBTC, 토큰화 자산, ETP, 금속 reserve 등 다양한 자산이 이 인프라 위에 올라가 있다[^s09]. 메커니즘 — 오라클 노드 N개가 reserve 데이터(은행 attestation, 콜드월릿 잔액, custodian API 등)를 수집해 합의로 묶고 deviation/heartbeat 트리거에 따라 온체인에 게시[^s10][^s25]. 결과적으로 stablecoin 컨트랙트는 reserve 상황에 따라 자동으로 minting을 일시 정지하거나 circuit breaker를 발동할 수 있다[^s09].

### 3.7 Filecoin · Arweave — 증명 기반 분산 스토리지

Filecoin은 "물리적으로 고유한 사본 + 시간 경과에도 보관" 두 증명을 요구한다 — PoRep + PoSt[^s13]. Arweave는 영구 저장을 1회 결제 모델로 노린다 — SPoRA로 "임의의 과거 데이터에 접근할 수 있어야 한다"는 조건을 합의에 박는다[^s14]. 두 시스템 모두 콘텐츠 주소화(CID) 추상을 기본으로 깔고, 그 위에 증명 시스템을 얹는다.

### 3.8 VeChain · IBM Food Trust — 공급망 정합성

공급망 정합성은 "물리 세계의 데이터를 어떻게 정합성 있게 가져오느냐"의 문제다. VeChain은 IoT 센서 + RFID + 블록체인의 결합 — "Walmart China collaborated with VeChain … to enhance food tracking, traceability, and safety through the supply chain in 2019"[^s18]. IBM Food Trust는 같은 추상을 "permissioned, immutable and shared record of food provenance"로 정리하며, Walmart·Carrefour·Nestlé 등이 참여한다 — "Food Trust provides supply chain visibility and efficiency, provenance for better understanding product quality"[^s17].

### 3.9 Celestia · EigenDA — Rollup 시대의 DA layer

Celestia는 erasure-coded DAS — 누구나 lightweight 검증으로 데이터가 실제 publish되었는지를 검증한다[^s15][^s21]. EigenDA는 KZG 다항식 증명 + DAC — 위원회 신뢰 가정 위에 더 높은 raw throughput을 얻는다[^s16]. 두 시스템은 같은 자리(Rollup 데이터 가용성)에 다른 트레이드오프로 들어와 있다.

## 4. 패턴 × 제품 매트릭스

| 패턴 | OpenTimestamps | KSI | OriginStamp | Rekor | EAS | Chainlink PoR | Filecoin/Arweave | VeChain/Food Trust | Celestia/EigenDA |
|---|---|---|---|---|---|---|---|---|---|
| 해시 앵커링 | ✓[^s01] | ✓[^s22] | ✓[^s19] | ✗ (logs)[^s08] | △ on-chain mode[^s11] | △ off-chain feed[^s10] | CID[^s13] | hash batch[^s17] | DA root[^s15] |
| Merkle proof | ✓[^s02] | ✓[^s04] | ✓[^s19] | ✓[^s07] | ✓ off-chain[^s11] | — | ✓[^s13] | — | ✓[^s21] |
| Transparency log | △ | ✓ | △ | ✓[^s07] | — | — | — | — | — |
| Attestation | — | — | — | ✓ artifact[^s06] | ✓[^s11] | ✓ DON 합의[^s25] | — | — | — |
| Storage proof | — | — | — | — | — | — | ✓ PoRep/PoSt[^s13] / SPoRA[^s14] | — | — |
| Oracle feed | — | — | — | — | — | ✓[^s09] | — | △ IoT 게이트웨이[^s18] | — |
| DA sampling | — | — | — | — | — | — | — | — | ✓ Celestia[^s15] / ✗ EigenDA[^s16] |

핵심 관찰은 단순하다 — **어느 한 제품도 한 가지 패턴만 쓰지 않는다**. 예컨대 EAS는 attestation 자체가 핵심이지만, on-chain mode일 때는 해시를 박고 off-chain mode일 때는 Merkle proof를 발급한다[^s11][^s12]. Chainlink PoR는 오라클 피드지만, 그 안에서 N개 노드의 attestation을 모은다는 점에서 attestation 패턴도 같이 쓴다[^s25] _(interpretive)_.

## 5. 논의 — 트레이드오프

### 5.1 변조 증거 vs 원본 진실성

해시 앵커링·transparency log·attestation은 모두 "데이터가 변하지 않았다"는 변조 증거만 만든다. **데이터 자체가 사실이라는 보장은 별개의 문제**다. OriginStamp 측 표현이 그래서 — 해시를 박는 것이 "tamper-proof" 증명이지 *truth*의 증명은 아니다 — 곧 원본의 진실성 검증은 별도 신뢰 경로(KYC, 감사, dispute 등)가 필요하다는 점은 모든 timestamping 제품의 공통 한계다 _(interpretive)_.

### 5.2 블록체인이 꼭 필요한가 — Sigstore의 결단

Sigstore는 명시적으로 "blockchain was attempted but determined to be less optimal technology"를 택했다[^s08]. Append-only Merkle 트리만으로 충분하고, 합의 비용이 들어가는 블록체인은 과잉이라는 판단이다. 본 보고서가 "블록체인이 데이터 정합성에 항상 필요한 것은 아니다"의 가장 강한 1차 근거다 — Rekor 자체가 매일 수십만 건의 서명 메타데이터를 처리하면서도 블록체인 없이 운영된다.

### 5.3 공공 검증 vs 비공개 데이터

공공 검증을 위해선 데이터(또는 적어도 해시)가 공개되어야 하지만, 산업 시나리오 다수는 비공개를 요구한다. 이 자리에서 (a) 해시만 박고 원본은 off-chain (b) attestation을 off-chain에 두고 hash만 anchor (c) ZK proof로 "데이터가 어떤 조건을 만족한다"만 증명하는 세 가지 패턴이 사용된다. EAS의 on/off-chain 이중 모드[^s11]가 (a)·(b)의 표준 패턴이고, Chainlink PoR의 reserve 합의[^s25]는 신뢰 기관(은행·custodian)이 원본을 가지고 N개 오라클이 합쳐서 publish하는 (b) 변형이다.

### 5.4 DA layer는 다른 문제다

본 보고서가 다룬 일곱 패턴 중 DA(Celestia, EigenDA)는 *정합성*보다는 *가용성*에 가깝다. 변조 증거(transparency log/attestation)는 "데이터가 안 바뀌었다"를 보장하지만, DA는 "데이터가 *존재한다*"를 보장한다 — Rollup이 자기 트랜잭션을 publish했는지를 lightweight client가 검증할 수 있게 한다[^s15][^s21]. 같은 단어("정합성") 안에 두 문제가 섞여 있다는 점이 시장에서 자주 혼동되는 지점이다 _(interpretive)_.

### 5.5 비용·지연·신뢰 모델

- Bitcoin OP_RETURN 앵커링(OpenTimestamps): block confirmation ~10분, 거의 0에 가까운 한계 비용(Merkle batching)[^s01][^s03].
- L2/EAS 앵커링: 초 단위 confirmation, 라우트당 가스.
- Transparency log(Rekor): 즉시 검증, 블록체인 없음 → 운영 단순화[^s08].
- Storage proof(Filecoin/Arweave): 비용은 저장 가격에 비례, 정합성 외에 *영속성* 까지 보장[^s13][^s14].
- Oracle feed(Chainlink PoR): N 오라클 합의 비용, 갱신 주기 조절 가능[^s10].

## 6. 한계

- 본 보고서는 2026년 5월 21일 시점의 1차 자료와 외부 분석을 기준으로 한다. Filecoin PoSt 파라미터(window cadence, fault recovery), Arweave SPoRA의 경제 모델, EigenDA의 committee 크기·slashing은 본 보고서 범위 밖이다.
- EAS의 internal mechanics는 자매 보고서 [`ethereum-attestation-service`](../ethereum-attestation-service/)를 참조한다.
- OriginStamp의 "6,000만 건" 같은 vendor-stated 수치는 독립 감사를 거치지 않았다 — `uncertainties.md`에 명시[^s20].
- EigenDA에 대한 비판적 framing은 Avail의 비교 글에서 인용했다[^s16] — 경쟁사 시점임을 본문에서 명시한다.
- "데이터 정합성"의 두 의미(tamper-evidence vs availability)는 본 보고서의 합성 정의에 가깝고, 단일 표준 정의가 존재하지 않는다 — 그 점도 본 보고서의 한계다 _(interpretive)_.
- 본 보고서는 ZK proof 기반 데이터 정합성(예: ZK-MIPS, Pinocchio, zkRollup state proof)을 별도 섹션으로 다루지 않는다 — 그 영역은 자매 보고서 라인업의 별도 주제다.
