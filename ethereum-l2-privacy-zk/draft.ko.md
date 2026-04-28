## 초록

이제 Ethereum 및 L2 프라이버시는 더 이상 "전부 가린다" 가 아니다. 2022년 8월 OFAC의 Tornado Cash 제재 [^s01], 2024년 11월 미 5회 순회법원의 제재 무효 판결 [^s02], 2025년 3월 재무부의 SDN 제거 [^s03] 라는 세 사건을 거치며 살아남은 *프로덕션 디자인 패턴* 은 **선택적 공개(selective disclosure)** 다. 사용자는 *특정 술어* (컴플라이언스 association, 연령, 문서 소유)만 영지식으로 증명하고 나머지는 비공개로 남긴다. 2025–2026년 스택이 그 방향이다. Aztec 은 2025년 11월 Alpha 메인넷을 가동하면서 "프라이빗 스마트 컨트랙트의 완전한 실행 환경을 가진 첫 L2" 가 됐고 [^s04], 그 백엔드는 폰/브라우저에서 증명 가능한 Noir + Barretenberg/CHONK 스택이다 [^s05][^s22]. Railgun 은 Ethereum, BNB Chain, Polygon, Arbitrum 위에 *별도 검증자 셋·브리지 없이* 자산별 shielded 잔고를 온체인 스마트 컨트랙트만으로 제공한다 [^s06]. Buterin · Soleimani · Illum · Nadler · Schär 의 2023년 논문 [^s07] 에 기반한 Privacy Pools 는 2025년 3월 0xbow 가 Ethereum 메인넷에 배포해 첫 몇 주 만에 약 600만 달러 / 1,500명 이상의 사용자를 처리하면서 [^s08][^s20], **association-set 증명** 으로 정직한 예치자를 불법 자금에서 cryptographic 하게 분리한다. 한편 Semaphore [^s10], World ID [^s11], Anon Aadhaar [^s12], ZK-Email [^s13], zkPassport [^s14] 같은 **익명 credential** 들이 사실상 가장 대규모로 사용되는 zk 프라이버시 프리미티브다. 무엇이 실용적으로 배포 가능한지를 좌우하는 세 힘은 (a) 규제 변동성 — 미국(5회 순회 무효 → 재무부 delisting) vs EU(AML Regulation 2024/1624: 2027년 7월부터 익명 계정·익명성 강화 코인 금지) [^s02][^s18], (b) 익명 셋의 취약성 — 실증 연구 기준 Tornado Cash 출금의 5–34% 가 주소 재사용·시간 매칭으로 deposit 과 연결됨 [^s15], (c) 미완성된 프리미티브 파이프라인(folding 스킴은 2026년에도 프로덕션이 아닌 연구 단계). 따라서 2026년 빌더의 실용적 답은 단일 프로젝트가 아니라 *조합* 이다. shielded 결제는 Aztec 또는 Railgun, 컴플라이언스 인지 mixing 은 Privacy Pools, ID 는 Semaphore / World ID / Anon Aadhaar / ZK-Email / zkPassport, 그리고 *private cross-rollup bridging 은 여전히 연구 단계* [^s17][^s19].

## 서론

공개 원장 위에서 프라이버시가 구조적으로 어려운 이유는 공개 원장이 유용한 이유와 같다. 모든 상태 전이가 *지울 수 없고, 재생 가능하며, 색인된* 기록이다. 2020–2022년 스택은 이를 "충분히 큰 mixer 를 만들어 멤버십을 통계적 잡음으로" 처리했다. 2025–2026년 스택은 이를 "사용자가 *공개하고 싶은 속성만* 증명하고 그 외는 노출하지 않게" 처리한다. 이 전환은 *선택* 이 아니라 *강제* 였다.

2022년 8월 OFAC 의 Tornado Cash 지정은 70억 달러 이상의 자금세탁(북한 Lazarus Group 포함) 을 근거로 53개 Ethereum 주소(불변 컨트랙트 약 20개 포함) 를 SDN 리스트에 올렸고 [^s01], 미국인이 컨트랙트와 상호작용하는 것 자체가 제재 사안이 되어 법적 다툼이 끝나기도 전에 *프로덕트로서 죽었다* . 2024년 11월 5회 순회법원은 *Van Loon v. Treasury* 에서 불변 스마트 컨트랙트는 IEEPA 의 "재산" 이 아니며 OFAC 가 권한을 초과했다고 판시했고 [^s02], 2025년 3월 재무부가 공식 delisting 했다 [^s03]. 그 시점에 디자인 공간은 이미 옮겨가 있었다. 살아남은 구성은 "Tornado Cash 2.0" 이 아니라 **자기 자금에 대한 *주장* 을 자금 자체를 공개하지 않고 만들 수 있는 시스템** 이다.

본 보고서는 프라이버시 분류를 짚고, 2024–2026년 프로덕션 스택을 조사하며, 어떤 zk 프리미티브가 애플리케이션 레이어를 실제로 제약하는지 검토한 뒤, 출하된 zk 응용을 식별하고, 오늘 무엇을 만들거나 사용해야 하는지에 대한 구체 추천으로 마무리한다.

## 위협 모델과 프라이버시 분류

온체인 프라이버시 목표는 셋으로 나누는 것이 유용하다.

1. **결제 필드 비공개** — 송신자, 수신자, 자산 종류, 금액이 체인에 보이지 않는다. shielded UTXO 시스템(Aztec [^s23], Railgun [^s06], Tornado 부류 mixer) 의 목표.
2. **익명 셋 멤버십** — 온체인 산출물은 기술적으로 투명하지만 동등한 충분히 많은 산출물과 섞여, 출금을 특정 입금에 연결하기 통계적으로 어렵게 만든다. Tornado Cash 와 Privacy Pools 가 이 방식 [^s07][^s20].
3. **선택적 술어 공개** — 사용자가 특정 *속성* (이 블랙리스트에 없다, 18세 이상이다, `@example.com` 메일을 받았다, X국 여권을 가졌다)을 증명하되 그 외는 공개하지 않는다. Semaphore, World ID, Anon Aadhaar, ZK-Email, zkPassport 는 술어 공개 시스템 [^s10][^s11][^s12][^s13][^s14].

이들은 상호 배타적이지 않다. Privacy Pools 는 (2)+(3)을 결합한다 — shielded pool 위에 association-set 증명을 얹는다 [^s07][^s20]. 제약 조건은 다르다. shielded 시스템은 상태를 암호화해야 하고, mixing 시스템은 *의미 있는 epoch 동안 의미 있는 수의 동시 예치자* 가 필요하며, 술어 시스템은 *오프체인 권위* (DKIM 키, 여권 CA) 를 신뢰하고 그에 대해 증명해야 한다.

프라이버시 시스템의 익명 셋은 *같은 epoch · 같은 액면* 의 *활성* 사용자 수로 한정되며 누적 예치자 수가 아니다. Tornado Cash 의 실증 문헌은 그 비용을 보여준다. Ethereum, BNB Smart Chain, Polygon 에 걸쳐 출금의 5.1–12.6% 가 주소 재사용 · 트랜잭션 연결 휴리스틱만으로 deposit 에 연결되며, FIFO 시간 매칭 휴리스틱을 추가하면 연결률이 추가로 15–22%p 상승해 누적 약 1/3 까지 올라간다 [^s15]. 암호학이 실패한 게 아니라 *사용자 행동이 누설* 했다. 이 패턴은 Tornado Cash 만의 문제가 아니며, 사용자 규율에 의존하는 모든 익명 셋 디자인에 그대로 옮겨갈 가능성이 높다.

## Ethereum 및 L2 의 기존 프라이버시 솔루션

### Aztec — 프라이버시 우선 zk 롤업

오늘 Ethereum 정렬 시스템 중에서 *프로그래머블 shielded 상태* 를 출하하고 있는 유일한 프로덕션이 Aztec 이다. Ignition Chain 이 2025년 11월 가동되며 네트워크는 Alpha 단계로 진입했고, "프라이빗 스마트 컨트랙트의 완전한 실행 환경을 가진 첫 L2" 라고 공식화됐다 [^s04]. 디자인은 공개 실행과 프라이빗 실행을 분리한다. 프라이빗 실행은 **사용자 디바이스의 PXE(Private eXecution Environment)** 에서 일어나며, 키를 가진 본인만 암호화된 프라이빗 상태를 읽을 수 있다 [^s17][^s23]. 암호 백엔드는 **Barretenberg** 의 **CHONK** (Client-side Highly Optimized ploNK) 세대로, "폰과 브라우저에서 증명하기 위해" 설계됐고 Alpha 증명 파이프라인을 구동한다 [^s05]. 애플리케이션 언어는 **Noir** 이며, Barretenberg / Halo2 / Plonky2 / Groth16 백엔드를 모두 지원하는 proving-system-agnostic 프론트엔드다 [^s05]. **NoirJS** 는 브라우저 클라이언트 사이드에서 ZK 응용을 증명하게 해준다 [^s22].

Aztec 의 위치는 "스케일링용 zk 롤업" (zkSync Era, Linea, Scroll, Starknet)과 분명히 다르다. 대부분의 zk 롤업은 zero-knowledge 속성을 *유효성 증명의 succinctness* 에 사용하며 *데이터를 가리는 데* 사용하지 않는다. 그 상태는 L1 위에서 평문이다 [^s17]. Aztec 은 이 관계를 뒤집는다 — 프라이버시가 주력이고 스케일링은 부산물이다.

### Railgun — 멀티체인 프라이버시 미들웨어

Railgun 은 다른 아키텍처다. 자체 롤업 대신 **Ethereum, BNB Chain, Polygon, Arbitrum 위에서 동작하는 온체인 스마트 컨트랙트 미들웨어** 다 [^s06]. 사용자는 ERC-20 토큰을 *shield* 하여 프라이빗 잔고에 넣고, 그 후 `0zk-to-0zk` 트랜잭션에서 송신자 · 수신자 · 토큰 종류 · 금액이 모두 비공개로 남는다. 공개되는 것은 릴레이어 주소와 도착 스마트 컨트랙트 주소뿐이다 [^s06]. "별도 L2 검증자 셋이나 취약한 브리지 없이 순수 온체인 스마트 컨트랙트 로직만" 이기 때문에 [^s06], Railgun 은 두 큰 위험 카테고리를 회피한다. 대신 체인마다 별도의 shielded pool 을 운영해야 하고, 각 pool 은 자기만의 익명 셋을 가진다.

### Privacy Pools — 컴플라이언스 인지 mixing

Privacy Pools 개념은 2023년 9월 SSRN 논문에서 Vitalik Buterin · Jacob Illum · Matthias Nadler · Fabian Schär · Ameen Soleimani 가 정식화했다 [^s07]. 기술적 핵심은 예치자가 *자신의 입금이 어떤 "association set" — 일반적으로 "알려진 제재 집합에 *속하지 않음*" — 에도 속한다는 영지식 증명을 함께 게시* 하되, 자신의 deposit 이 *어떤 deposit 인지를 노출하지 않는* 것이다. 이로써 사용자는 신뢰된 중앙 블랙리스트가 아니라 *암호학적으로* 불법 예치자와 자신을 분리한다.

Privacy Pools 는 0xbow 가 2025년 3월 Ethereum 메인넷에 출하했으며, 영지식 증명과 함께 deposit 을 스크리닝하고 트랜잭션을 실시간 모니터링하는 **Association Set Provider (ASP)** 를 사용한다 [^s08][^s20]. 보도 기준 첫 몇 주 동안 약 600만 달러 / 1,500명 이상의 사용자를 처리했고, "Ethereum 재단의 Kohaku 이니셔티브의 핵심 일부" 로 자리매김했다 [^s08]. 컨트랙트는 오픈 소스다 [^s24].

### Nocturne — 프라이빗 스마트 어카운트의 빈자리

Vitalik 이 백한 "프라이빗 어카운트" 프로젝트 Nocturne 은 스마트 어카운트와 통합되었으나 **2024년 6월 5일에 사실상 종료** 됐다. 팀은 "작년 초에 만든 프라이버시 프로토콜을 이미 셧다운한 후, 회사를 정리하기로 했다" 고 발표하고 출금 흐름을 self-serve 형식으로 전환했다 [^s09]. 명시적 단일 사유는 공개되지 않았으며, post-Tornado 규제 환경이 배경으로 인용됐다. 그 결과 *프라이빗 스마트 어카운트* 카테고리에 비어 있는 자리가 남았으며 프로덕션 규모로 이를 채운 프로젝트는 아직 없다.

### "ZK rollup" ≠ "privacy zk rollup"

용어가 오해를 부른다. zkSync, Linea, Scroll, Starknet, Polygon zkEVM 은 영지식 증명을 *L1 으로의 상태 전이 유효성 검증* 에 사용하지만, 그 *기반 상태와 트랜잭션은 L1 위에서 평문* 이다 [^s17]. 이들은 validity rollup 이며, "ZK" 는 succinctness 다. Aztec 의 hybrid public-private 모델(사용자 측에서 상태 암호화, SNARK 로 검증)은 zk-rollup 디자인 공간의 *부분 집합* 이며 디폴트가 아니다 [^s17][^s23].

## 중요한 zk 프리미티브 레이어

프라이버시 제품에서 증명 시스템 선택은 애플리케이션을 제약한다.

- **Groth16** — 회로별 trusted setup, 가장 작은 증명(~192 바이트), ~3 ms 검증. 회로가 바뀌지 않는 고정 회로 프라이버시 컨트랙트(자산별 shielded transfer, 익명 credential gadget)에 널리 쓰인다 [^s16].
- **PLONK / Halo2 / Plonky2 / Plonky3** — 보편 trusted setup(또는 일부 transparent), 회로 간 재사용 가능. 회로가 바뀔 수 있는 응용에 적합. Aztec 은 PLONK 계열 백엔드(Barretenberg / CHONK)를 사용 [^s05]; Scroll 은 Halo2 기반 시스템 [^s17].
- **STARK** — transparent setup, post-quantum 친화적. 일반 실행 증명(Starknet, Stwo, zkVM)에서 우세하나 *Ethereum 프라이버시 프로젝트* 에서는 2026년 시점 거의 사용되지 않는다 [^s16].
- **해시 함수 선택이 증명 비용에 직결된다.** Poseidon / Poseidon2 가 ZK-friendly 해시 성능에서 Groth16 하 우세를 보이며, SHA-256 증명은 PLONK 프레임워크 보다 Groth16 프레임워크 (rapidsnark / gnark / Arkworks) 에서 더 빠르다 [^s16]. ZK-friendly 해시는 Tornado-스타일 Merkle 멤버십 증명을 클라이언트 사이드에서 가능하게 만든다.
- **Folding 스킴 (Nova / SuperNova / HyperNova)** 은 prover 측 활발한 연구 방향이며, 원리적으로 장기 실행 계산(예: 한 DeFi 세션 전체)을 증명할 수 있게 해줄 수 있다. 그러나 *2026년 시점 어떤 프로덕션 Ethereum 프라이버시 제품도 이를 디폴트 증명 시스템으로 사용하지 않는다* . 2027년+ 프런티어로 취급해야 한다 _(forward-looking)_.

이 레이어의 가장 중요한 2024–2026년 변화는 **클라이언트 사이드 증명 가능성** 이다. Aztec 의 CHONK 세대는 폰/브라우저 증명을 위해 설계됐고, NoirJS 는 동작하는 브라우저 증명 파이프라인을 시연하며 [^s05][^s22], Aztec Alpha 의 증명은 소비자 디바이스에서 동작한다 [^s05]. "사용자 프라이버시는 중앙 prover 또는 비싼 하드웨어를 필요로 한다" 라는 역사적 전제가 무너졌다.

## 오늘 실용적인 zk 응용

### 익명 credential 과 proof-of-personhood

Ethereum 위 *가장 대용량으로 실용 사용되는* zk 프라이버시 프리미티브는 결제가 아니라 **익명 credential** 이다. PSE 의 Semaphore 는 "zk-SNARK 기반 Ethereum 응용을 위한 보편적 오픈소스 프라이버시 레이어" 로, 그룹 멤버십 증명과 double-signaling 방지 메커니즘을 제공한다 [^s10]. World ID 는 Semaphore + Semaphore Merkle Tree Batcher (SMTB) 로 효율적 셋 업데이트를 구현하고, orb 인증 생체 유일성을 underlying credential 로 쓴다 [^s11][^s21]. Anon Aadhaar 는 약 14억 인도 거주자가 Aadhaar ID 를 선택적 공개로 증명할 수 있게 해준다 [^s12]. ZK-Email 은 이메일 본문을 노출하지 않고 DKIM 서명의 유효 존재를 증명한다 [^s13]. zkPassport 는 ICAO 표준 ePassport 칩을 활용해 100여 개국 여권 기반 ZK 인증을 제공한다 [^s14].

이들이 실제로 *대규모 사용자 집단에 출하된* 프라이버시 스택의 일부다.

### Shielded 결제와 DeFi

Aztec 과 Railgun 이 프로덕션 답이다. Aztec 은 자체 L2 위 프로그래머블 shielded 스마트 컨트랙트를 제공하며 [^s04][^s23], Railgun 은 기존 L1/L2 에 임베드된 자산별 shielded 잔고를 제공한다 [^s06]. 채택 규모는 투명 DeFi 보다 훨씬 작으며, 가장 큰 마찰은 shield/unshield 가스 비용과 자산별 익명 셋 사이즈, 그리고 규제 환경이지 *암호학이 아니다* .

### 컴플라이언스 인지 mixing

Privacy Pools 가 2025년의 실용적 답이다. "association-set 증명" (해당 deposit 이 속성 P 를 만족하는 셋에 속함, 예: 정직 출처)과 "어떤 deposit 이 본인 것인지 노출 여부" 를 분리한다 [^s07][^s20]. 메인넷 채택은 작지만 실재한다 — 첫 몇 주에 600만 달러 / 1,500명 이상 [^s08].

### 브리징과 cross-rollup 메시지

shielded 가치를 한 롤업 프라이버시 도메인에서 다른 롤업으로 옮기는 *프라이빗 cross-rollup bridging* 은 **2026년 시점 프로덕션으로 풀린 문제가 아니다** . 이를 단순화할 shared-sequencer / based-sequencer 인프라(Espresso, Taiko 식 based 롤업) 자체가 초기이며, 한때 선두였던 Astria 는 2025년에 셧다운됐다. 아래 추천에서 *명시적 갭* 으로 표면화한다.

### "실용 프라이버시(pragmatic privacy)" 가 된 제품 프레이밍

업계 보도는 2025–2026년 사이클을 명시적으로 이렇게 프레이밍한다. "Aztec 부터 Zcash 까지 2025년은 *실용 프라이버시(pragmatic privacy)* 가 뿌리내린 해였다" — 절대주의적 "전부 가린다" 디자인에서 의도적으로 멀어져, 불확실 규제 체제 아래에서 출하 가능한 선택적 공개 구성(Privacy Pools 의 association-set 증명, Aztec 의 PXE, Railgun 의 자산별 shielded 잔고)으로 이동했다 [^s19].

## 추천: 오늘 실제 배포 가능한 것

"현재 규제 · 적대적 조건 아래에서 *살아남는* 프라이버시를 출하한다" 는 목표를 가진 2026년 빌더에게 방어 가능한 조합은 다음과 같다.

1. **Shielded 결제 → Aztec(그린필드) 또는 Railgun(드롭인 미들웨어).** 새로 응용을 그 프라이빗 스마트 컨트랙트 환경에 맞춰 쓸 수 있고 클라이언트 사이드 증명을 처음부터 원하면 Aztec [^s04][^s05][^s23]. *기존* L1 / L2 컨트랙트(Ethereum, BNB, Polygon, Arbitrum)에 별도 검증자 셋 없이 프라이버시를 얹어야 하면 Railgun [^s06].
2. **컴플라이언스 인지 mixing → Privacy Pools.** 디자인이 규제자 또는 기관 사용자의 *제재 association set 비멤버십 증명* 요구를 받아들여야 한다면 사용 [^s07][^s08][^s20][^s24]. ASP 큐레이터를 *의식적으로 받아들이는 신뢰 가정* 으로 처리.
3. **ID / 시빌 저항 / KYC 압축 → Semaphore, World ID, Anon Aadhaar, ZK-Email, zkPassport.** 사용자 집단의 *기반 권위* 와 일치하는 것을 선택. 보편 zk-credential 프리미티브는 Semaphore [^s10]; 생체 유일성은 World ID [^s11]; 인도 거주자는 Anon Aadhaar [^s12]; DKIM 앵커드 조직 주장은 ZK-Email [^s13]; ICAO 앵커드 국적 / 연령은 zkPassport [^s14].
4. **증명 스택 → 회로가 바뀌면 PLONK 계열, 고정이면 Groth16.** Aztec / Noir 의 PLONK 계열이 진화하는 회로의 디폴트; Groth16 의 더 작은 증명은 안정적 · 작은 회로에 옳다 [^s05][^s16].
5. **클라이언트 사이드 증명을 디폴트로.** Aztec / NoirJS / Barretenberg-CHONK 궤적은 폰/브라우저 증명을 *2026년의 현실* 로 만든다 [^s05][^s22]. 프라이빗 입력을 디바이스 외부 prover 로 라우팅하는 디자인은 *불필요하게 약한* 프라이버시로 취급해야 한다.
6. **"zk-rollup 이면 프라이버시" 라고 가정하지 말 것.** "ZK rollup" 은 디폴트로 결제 프라이버시를 주지 않는다. L2 위 프라이버시가 필요하면 *프라이버시 우선 롤업(Aztec)에 빌드* 하거나 *제네릭 롤업 위에 프라이버시 미들웨어(Railgun)를 얹어야 한다* [^s17].
7. **프라이빗 cross-rollup bridging 은 연구 단계로 취급.** 2026년 기준 프로덕션 답이 없다. 미루거나 체인별 shielded 잔고로 대체.

*사용자* 입장에서 오늘 실제 배포 가능한 스택은 (a) L1 / L2 shielded 잔고로 Privacy Pools 또는 Railgun, (b) ID 결합 행동에 World ID / Anon Aadhaar / zkPassport, (c) 오프체인 attestation 에 ZK-Email. *완전 프라이빗 DeFi* 는 일반 사용자에게 여전히 열망 단계다 [^s06][^s08][^s11][^s12][^s13].

## 한계와 미해결 문제

- **규제 변동성.** 미국 5회 순회법원의 "불변 스마트 컨트랙트는 재산이 아니다" 판결 [^s02] 과 2025년 3월 OFAC delisting [^s03] 은 *불변이 아닌* mixer 를 다루지 않으며, 미래 행정부 또는 다른 부처를 구속하지도 않는다. EU AML Regulation 2024/1624 — 2024년 5월 채택, 2027년 7월 1일 발효 — 는 익명 암호자산 계정과 익명성 강화 코인을 *금지* 하고, "고위험" 프라이버시 지갑과 mixer 를 금지할지에 대한 위원회 보고를 의무화한다 [^s18]. 오늘 출하한 프라이버시 제품이 2027년에는 한 관할에선 합법, 다른 관할에선 불법일 수 있다.
- **익명 셋의 취약성은 사용자 행동 문제이지 암호학 문제가 아니다.** 유효한 SNARK 가 있어도 주소 재사용, 릴레이어 실수, 시간 패턴이 Tornado 부류 시스템에서 출금의 5–34% 를 재연결할 수 있다 [^s15]. 사용자 규율에 의존하는 프라이버시 제품은 *일정 비율은 누설된다* 고 가정해야 한다.
- **프로덕션 감사 갭.** Privacy Pools 온체인 컨트랙트의 공개된 제3자 감사는 이번 리서치에서 발견되지 않았으며, Aztec Alpha 는 자기 프레이밍상 알파다. 신생 구성은 그에 맞게 취급할 것.
- **채택 비대칭.** 익명 credential 프리미티브(Semaphore / World ID / Anon Aadhaar / ZK-Email / zkPassport)는 shielded 결제 시스템(Aztec / Railgun / Privacy Pools)보다 *훨씬 큰* 사용자 집단에 출하됐다. 2026년 "Ethereum 프라이버시" 의 실제 스토리는 *술어 공개가 먼저, shielded 결제가 그 다음* 이다.
- **Folding 스킴과 재귀 증명 집계** 는 2026년 Ethereum 프라이버시 제품에 대해 연구 단계다. 2027년+ 배포가 예상되지만 2026년 프로덕션 포인터는 없다 _(forward-looking)_.
- **프라이빗 cross-rollup bridging** 에는 2026년 프로덕션 답이 없으며, 추천에서 갭으로 명시했다.
- **정량적 채택 시계열.** Aztec / Railgun / Privacy Pools / Tornado Cash / Nocturne(종료) 전반의 비교 가능한 채택-볼륨 시계열을 본 리서치에서 조립하지 못했다. 프로젝트별 수치는 가능한 한 인용했으나, 프로젝트 간 비교는 정성적으로 취급해야 한다.
