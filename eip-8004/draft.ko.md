# EIP-8004 — 이더리움의 신뢰 없이 상호작용하는 에이전트 표준

## 초록

ERC-8004는 기존 에이전트 통신 프로토콜(Google의 Agent-to-Agent, Anthropic의 Model Context Protocol)과 에이전트 결제 레일(Coinbase의 x402, Google의 AP2) 위에 **신뢰 계층(trust layer)** 을 추가하는 이더리움 표준이다. 이전에 관계가 없던 자율 에이전트들이 서로를 발견하고 누구를 신뢰할지 판단할 수 있도록 해준다 [^s01][^s05][^s11][^s12]. 이를 위해 세 개의 최소화된 온체인 레지스트리 — **Identity**(오프체인 JSON 등록 파일을 가리키는 ERC-721 기반 핸들), **Reputation**(사전 승인·철회 가능하며 무결성 커밋이 붙는 피드백), **Validation**(신뢰 모델에 무관한 후킹(hooks)을 제공해 임의 스마트 컨트랙트가 호출 가능) — 가 정의된다 [^s01][^s13]. EIP 초안은 2025-08-13에 제출되었고, 이더리움 메인넷에는 2026-01-29에 런칭되었으며, 생태계 트래커 기준 첫 달에 45,000개 이상의 에이전트가 EVM 체인 전반에 등록되었다 [^s01][^s07][^s08]. 본 조사는 스펙, 개발자 표면(등록 방법·신뢰 모델 선택), 빌더 표면(참조 컨트랙트·다중 체인 배포·밸리데이터 운영), 그리고 독립 리뷰어와 Ethereum Magicians 토론이 반복적으로 지적한 한계를 다룬다 [^s06][^s13][^s15].

## 1. 서론

에이전트 간 상호작용은 이미 *어떻게 통신할지* 에 대한 작동하는 표준 두 가지 — Google의 A2A(에이전트 메시징)와 Anthropic의 MCP(도구/컨텍스트 접근) — 와 서로 수렴 중인 결제 프로토콜 둘(Coinbase의 x402와 Google의 AP2)을 갖추고 있다 [^s11][^s12]. 그러나 ERC-8004 초안이 동기 섹션에서 지적하듯, *상대가 누구인지* 와 *그들을 신뢰해야 하는지* 를 판별하는 표준은 비어 있었다 [^s01]. ERC-8004는 어느 EVM 체인에든 배포할 수 있는 세 개의 가벼운 레지스트리 컨트랙트로 그 빈 자리를 메운다. 에이전트는 검증 가능한 식별자를 게시하고, 클라이언트는 피드백을 게시하며, 밸리데이터는 검증 결과를 게시한다 — 모두 중앙 중개자 없이 이루어진다 [^s01][^s02].

제안은 Ethereum Magicians 포럼에서 다섯 달간의 공개 토론을 거쳐 2026년 1월 29일 메인넷에 도달했다 [^s06][^s07][^s10]. 한 달 만에 생태계 탐색기 **8004 Scan** 은 레지스트리를 호스팅하는 EVM 체인들에 등록된 에이전트가 45,000개 이상이라고 보고했다 [^s07][^s08]. 이 수치는 프로토콜 자체가 산출한 값이 아니라 트래커 보고 수치이므로, 본 초안은 이를 엄밀한 카운트가 아닌 채택 신호로 다룬다.

본 조사는 Canton/Daml 보고서와 동일한 **빌더/개발자** 이음매를 명시적으로 따른다. 에이전트를 작성하는 개발자는 등록 JSON 스키마, 사용 가능한 신뢰 모델, 평판 피드백 API에 관심이 있다. 레지스트리·밸리데이터·에이전트 마켓플레이스를 운영하는 빌더는 참조 컨트랙트, 다중 체인 배포, ERC-8004가 의도적으로 상위 계층에 위임하는 밸리데이터 경제, 그리고 보안 고려사항에 관심이 있다 [^s09][^s13][^s14][^s15].

## 2. 배경 — 저자, 타임라인, 생태계

ERC-8004의 공동 저자는 **Marco De Rossi**(MetaMask), **Davide Crapis**(Ethereum Foundation, dAI 팀을 이끈다), **Jordan Ellis**(Google), **Erik Reppel**(Coinbase)이다 [^s01][^s05]. 저자 구성은 의도적이다 — 이 표준은 A2A(Google) 위에, x402(Coinbase) 위에, 기존 이더리움 NFT/도구 스택(MetaMask) 위에, 그리고 Ethereum Foundation의 탈중앙 AI 의제 아래에 위치해야 하기 때문이다 [^s05].

EIP는 2025-08-13에 제출되었고 다음날 Ethereum Magicians에 공개 토론 글이 올라왔다 [^s01][^s06]. 2025년 10월 공식 발표를 거쳐 2026-01-29 이더리움 메인넷에 롤아웃되었다. 이더리움 공식 채널은 "ERC-8004는 AI 에이전트들이 조직 경계를 넘어 상호작용하도록 하여 신뢰도가 어디에나 따라오게 한다"고 밝혔다 [^s07][^s10]. 약 3개월의 테스트넷 단계에서 10,000개 이상의 에이전트가 등록되었고 20,000건 이상의 피드백이 교환되었다 [^s08].

이 표준의 상위 스택 내 위치는 경쟁이 아니라 **보완** 이다. **A2A** 는 에이전트 간 메시지 전송을 담당하고, **MCP** 는 도구/컨텍스트 프로토콜, **x402**/**AP2** 는 결제 레일이며, ERC-8004는 이 모든 채널의 반대편 당사자가 주장하는 자신과 실제로 일치하는지를 판단하는 신뢰·정체성 계층이다 [^s01][^s11][^s12]. 초기 채택자 목록 — 식별자 해석의 ENS, 암호경제적 밸리데이터 스테이킹의 EigenLayer, 온체인 신호 인덱싱의 The Graph, L2 실행의 Taiko, 검증·평판 태그에 연결되는 데이터/리스크 신호의 RedStone·Credora — 이 그런 프레이밍을 반영한다 [^s08][^s18]. BNB Chain은 2026년 초 자사의 메인넷과 테스트넷에 레지스트리를 배포하여 스스로를 "저수수료·빠른 실행이 필요한 에이전트 시스템의 초기 허브"로 포지셔닝했다 [^s16].

## 3. 스펙 — 세 가지 레지스트리

ERC-8004는 EVM 체인당 한 번씩 배포 가능한 세 레지스트리 컨트랙트를 정의한다 [^s01][^s02]. 레지스트리는 의도적으로 작다. 논거 섹션은 온체인 합성 가능성(composability)이 풍부한 온체인 애플리케이션 로직이 아니라 **공통 스키마와 이벤트 발행** 에서 오도록 설계했다고 명시한다 [^s01].

### 3.1 Identity Registry

Identity Registry는 **ERC-721 + URIStorage** 확장으로 구현된다 [^s01][^s04]. 각 에이전트는 고유한 `agentId`(tokenId)를 발급받고, 그 `tokenURI`는 오프체인 **에이전트 등록 파일(agent registration file)** — 이름, 설명, 지원 엔드포인트(A2A, MCP, web, ENS, DID, email), 통제 지갑 주소, `supportedTrust` 모델을 선언하는 구조화된 JSON 문서 — 를 가리킨다 [^s01]. 핸들이 ERC-721 NFT이므로, 모든 에이전트가 기존 이더리움 지갑·마켓플레이스·인덱서 도구와 즉시 호환된다 [^s04]. 초안의 핵심 함수는 다음과 같다.

```solidity
register(string agentURI, MetadataEntry[] calldata metadata) returns (uint256 agentId)
setAgentURI(uint256 agentId, string calldata newURI)
setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes calldata signature)
getMetadata(uint256 agentId, string metadataKey) returns (bytes memory)
```
(출처: EIP-8004 스펙) [^s01]

표준은 선택적 도메인 바인딩 헬퍼를 추가한다. 에이전트는 `/.well-known/agent-registration.json` 을 호스팅하여 HTTPS 엔드포인트 도메인을 자신이 통제함을 증명할 *수* 있다 [^s01]. 이는 명시적으로 선택 사항이다 — Ethereum Magicians의 비판자(pcarranzav)는 도메인 바인딩을 의무화하면 한 도메인 아래 여러 에이전트 호스팅이 불가능해진다고 지적했고, 저자들은 이를 비의무적 긍정(affirmation)으로 유지했다 [^s06].

### 3.2 Reputation Registry

Reputation Registry는 **클라이언트가 에이전트에 대한 피드백을 게시하는** 곳이다 [^s01][^s13]. 데이터 모델은 의도적으로 스키마가 가볍다. 피드백 한 건은 `(int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)` 로 구성된다 [^s01][^s13]. 고정 소수점 스코어와 `valueDecimals` 조합은 부동소수점 없이 0–100 같은 경계 값을 온체인에서 집계할 수 있게 해주고, 태그는 애플리케이션 개발자에게 맡겨져 있으며, URI는 오프체인 JSON(로그, 아티팩트, 영수증)을 가리키고 KECCAK-256 해시가 이를 커밋해 사후 교체가 불가능하도록 만든다 [^s13].

핵심 함수:

```solidity
giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)
revokeFeedback(uint256 agentId, uint64 feedbackIndex)
appendResponse(uint256 agentId, address clientAddress, uint64 feedbackIndex, string responseURI, bytes32 responseHash)
getSummary(uint256 agentId, address[] calldata clientAddresses, string tag1, string tag2) returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)
```
(출처: EIP-8004 스펙) [^s01]

이 표면의 두 가지 설계 선택은 하중(load-bearing)이며 공개적으로 논쟁되었다. 첫째, 피드백은 **사전 승인(pre-authorised)** 된다. 서버 에이전트가 피드백을 게시할 수 있는 클라이언트를 먼저 지정한다. Composable Security 리뷰는 이를 두고 "스팸은 줄지만 다수의 신원은 여전히 존재할 수 있다"고 평했다 [^s13]. 둘째, 집계는 명시적으로 *읽기 측* 연산이다. `getSummary` 또는 오프체인 인덱서(The Graph)가 수행하며 레지스트리 자체의 속성이 아니다. 단일 점수 독점 우려에 대한 저자들의 대답은 "한 건의 피드백이나 검증이 신뢰 결정을 좌우하지 않는다. 사람들은 항상 항목을 집계한다"는 것이었다 [^s06].

### 3.3 Validation Registry

Validation Registry는 **신뢰 모델에 무관(trust-model-agnostic)** 하다 [^s01][^s02][^s04]. **밸리데이터 주소(validator address)** 를 키로 하는 요청·응답 후킹만 정의하고, 해당 밸리데이터가 재실행을 하든 zkML 증명을 확인하든 TEE 어테스테이션을 검증하든 EigenLayer 기반 암호경제 프로토콜을 돌리든 레지스트리는 관여하지 않는다 — 요청, 응답(0–100 점수, 0=실패, 100=통과), 근거 URI와 해시만 기록한다 [^s01][^s04][^s14]. 핵심 함수:

```solidity
validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash)
validationResponse(bytes32 requestHash, uint8 response, string responseURI, bytes32 responseHash, string tag)
getValidationStatus(bytes32 requestHash) returns (address validatorAddress, uint256 agentId, uint8 response, bytes32 responseHash, string tag, uint256 lastUpdate)
getSummary(uint256 agentId, address[] calldata validatorAddresses, string tag) returns (uint64 count, uint8 averageResponse)
```
(출처: EIP-8004 스펙) [^s01]

이 계층화가 ERC-8004의 핵심 설계 베팅이다. 온체인 풋프린트를 최소로 유지하고, 검증 프로토콜이 레지스트리 위에서 합성되며, 인덱서와 클라이언트 애플리케이션이 필요에 따라 신호를 집계한다. 트레이드오프는 보안과 직접 관련된 여러 결정 — 누가 밸리데이터가 될 수 있는가, 얼마를 스테이킹해야 하는가, 부정행위는 어떻게 처벌되는가 — 가 ERC의 **스코프 밖** 에 놓인다는 점이다. 이 부분은 상위 프로토콜이 공급해야 한다 [^s13][^s15].

## 4. 개발자 관점 — ERC-8004 에이전트 작성과 통합

개발자 입장에서 ERC-8004의 표면은 작고 친숙하다. 전형적인 워크플로우는 다음과 같다.

1. **에이전트 작성**. 원하는 프레임워크로 작성하고, 이더리움 트랜잭션에 서명할 수 있고 하나 이상의 엔드포인트(일반 웹 HTTPS, 에이전트 간 A2A, 도구/컨텍스트 접근 MCP)를 노출하도록 만든다 [^s01][^s11].
2. **등록 JSON 작성**. 이름, 설명, 이미지, `services[]`(`{type, url}`), `supportedTrust[]`, 선택적 식별 증명(`ens`, `did`, `agent-registration.json`) [^s01][^s02][^s04].
3. **등록 파일 호스팅**. 최소 구성은 일반 HTTPS, 검열 저항이 필요하면 IPFS / Filecoin / Arweave [^s02]. 해시를 고정(pin)하면 NFT의 tokenURI가 이를 가리킨다.
4. **정체성 민팅**. 원하는 체인에서 `register(agentURI, metadata)` 호출. 참조 컨트랙트는 이더리움 메인넷, Base, Arbitrum, Optimism, Polygon, BNB Chain, Scroll 등 30개 이상의 EVM 체인에 배포되어 있다 [^s09][^s16]. 레지스트리는 체인당 싱글턴(singleton)이므로 해당 체인의 모든 에이전트가 동일한 레지스트리 주소를 공유한다 [^s01][^s09].
5. **신뢰 모델 선택 및 `supportedTrust` 선언**. ERC는 조합 가능한 네 가지 주요 모델을 인정한다 [^s01][^s05][^s14].
   - **Reputation** — Reputation Registry로 피드백 수신. 가장 저렴하고 저가치 상호작용에 적합. 고가치에서는 Sybil에 취약 [^s01][^s13].
   - **Stake-secured re-execution** — 밸리데이터(보통 EigenLayer AVS)가 결정론적 하위 실행을 재실행하고 올바름에 스테이킹 [^s04][^s14].
   - **zkML** — 에이전트(또는 증명 서비스)가 ML 추론의 올바른 실행에 대한 제로지식 증명을 생성하고, 밸리데이터는 온체인 검증자. 소형 모델은 실용 가능, 대형 LLM은 여전히 분 단위 [^s14].
   - **TEE attestation** — 에이전트가 신뢰 실행 환경에서 동작하고 하드웨어 어테스테이션을 제출. zkML보다 쉽지만 하드웨어 벤더와 사이드 채널 자세(posture)에 대한 신뢰를 상속한다 [^s04][^s14].
6. **결제와 전송은 별도 통합**. ERC-8004는 결제나 메시징 프로토콜이 아니라 신뢰 계층이다. A2A(메시징), MCP(도구 접근), x402 / AP2(결제)와 함께 조합한다 [^s01][^s11][^s12]. 이들을 등록 파일의 `services[]` 에 기재해 클라이언트가 자동으로 발견할 수 있게 한다.

클라이언트 쪽에서 ERC-8004 신호를 읽는 개발자는 보통 두 경로를 합친다. 온체인에서는 경계 집계 점수를 위한 `getSummary` 호출, 오프체인에서는 항목별 상세·태그 필터링·피드백 체인 순회를 위한 서브그래프/인덱서(The Graph) [^s01][^s08][^s13]. 저자들이 선호하는 트레이드오프는 유용한 신뢰 결정이 주로 오프체인 집계 신호 위에서 일어난다는 것이다 — 온체인 합성은 의도적으로 2차 경로다 [^s06].

## 5. 빌더 관점 — 레지스트리·밸리데이터·에이전트 마켓플레이스 운영

단일 에이전트가 아니라 인프라를 운영하는 빌더 입장에서, ERC-8004는 매우 좁은 인터페이스를 정의하고 주변 스택이 대부분의 일을 하리라고 전제한다.

### 5.1 참조 컨트랙트

주 구현체는 GitHub의 `erc-8004/erc-8004-contracts` 에 **CC0 / Public Domain** 라이선스로 있다 [^s09]. 컨트랙트는 업그레이드 가능형(IdentityRegistryUpgradeable, ReputationRegistryUpgradeable, ValidationRegistryUpgradeable)이며 Hardhat으로 개발·테스트되고, 8004 팀이 즉시 쓸 수 있도록 30개 이상의 EVM 네트워크에 배포해 두었다 [^s09]. CC0 선택은 설계 의도와 맞아떨어진다 — 컨트랙트는 널리 포크·재배포·임베딩될 것으로 기대되며, 퍼블릭 도메인 라이선스가 파생 저작물에 대한 모호함을 제거한다 [^s09].

### 5.2 다중 체인 토폴로지

ERC-8004는 체인당 싱글턴이므로, 네이티브 에이전트 정체성을 원하는 호스트 체인은 자체 인스턴스를 운영한다 [^s01][^s09]. **BNB Chain** 은 자사 메인넷과 테스트넷 양쪽에 레지스트리를 배포하고 스스로를 "저수수료·빠른 실행이 필요한 에이전트 시스템의 초기 허브"로 규정했다 [^s16]. **Scroll·Base·Arbitrum·Optimism·Polygon** 등 L2들도 레지스트리를 호스팅하며, 생태계 해설은 이들을 에이전트 생태계 간 이식성(portability)의 수단으로 묘사한다 [^s09][^s16]. 체인 간 정체성 재사용 — 한 에이전트가 여러 레지스트리에서 발견되는 — 은 ERC가 명시하지 않으며, 실무에서는 오프체인 도구가 등록을 미러링해야 한다. 표준 자체는 항목 식별을 위한 namespace-chainId-address 튜플만 제공한다 [^s01][^s16].

### 5.3 밸리데이터 경제(의도적 스코프 밖)

ERC-8004는 밸리데이터 인센티브를 정의하지 않는다. Composable Security 리뷰는 분명하다 — "경제적 설계 — 담보·보상·페널티 — 는 명세되지 않았다" [^s13]. 실무에서 밸리데이터 경제는 Validation Registry 위의 프로토콜에서 온다. 재실행에 스테이킹을 건 **EigenLayer AVS**, 증명 생성·검증의 **zkML 서비스**, 어테스티드 실행의 **TEE 오라클 네트워크**, 큐레이션된 리뷰어 집합을 가진 맞춤형 **reputation DAO** 등이 그것이다 [^s13][^s14][^s15]. 이것이 ERC를 작게 유지하지만, 프로덕션 빌더가 ERC-8004를 선택한다는 것은 사실상 *ERC-8004 + 특정 검증 스택* 을 선택한다는 뜻이다. 보안 속성은 후자에도 같은 비중으로 달려 있다 [^s15].

### 5.4 생태계 통합

핵심 레지스트리를 넘어서, ERC-8004 생태계는 일련의 통합 업체들로 형성되었다 [^s08][^s18]. ENS는 사람이 읽기 좋은 정체성 해석, EigenLayer는 밸리데이터 슬래싱을 위한 암호경제 기반, The Graph는 Reputation·Validation 레지스트리용 서브그래프 인덱싱, Taiko는 EVM 동등 L2 배포 대상을 제공한다. RedStone과 Credora는 2026년 2월 ERC-8004 밸리데이터와 평판 태그에 연결되는 데이터 피드·리스크 인텔리전스 통합을 DeFi 에이전트 대상으로 출하한다고 공개했다 [^s18]. Coinbase의 x402는 **Agentic.market** 을 출시했는데, 스테이블코인으로 에이전트를 발견하고 거래할 수 있는 마켓플레이스로, 표준이 유일 ID 프리미티브가 아닌 단계에서도 ERC-8004 정체성의 자연스러운 소비자다 [^s12].

### 5.5 채택 신호

메인넷 이후 약 한 달 만에 **8004 Scan** 탐색기는 다중 체인 풋프린트 전반에 45,000개 이상의 에이전트가 등록되었다고 보고했다 [^s07][^s08]. BNB Chain 보도는 별도로 작성 시점 기준 이더리움 기반 배포에 24,000개 이상의 정체성이 추적된다고 전했다 [^s16]. 이들은 프로토콜 네이티브 지표가 아니라 트래커 보고 수치이며, 표준이 온체인 유일성 보장을 제공하지 않고 Sybil 등록이 총계를 부풀리기 때문에 엄밀한 에이전트 수가 아니라 상한(upper-bound) 채택 신호로 다뤄야 한다 _(해석적 판단)_ [^s08][^s13][^s16].

## 6. 한계와 남은 질문

**정체성 계층에서 Sybil 내성이 약하다.** Identity Registry는 무허가 민팅이다. 누구든 임의 개수의 에이전트를 등록할 수 있다 [^s01]. Reputation Registry의 사전 승인 피드백은 *한 에이전트의* 피드백 로그 내부 스팸을 줄이지만, 공격자가 1만 개의 에이전트 정체성을 세우고 연결된 클라이언트-에이전트 쌍으로 서로 긍정 리뷰를 주고받은 뒤 진짜 상대와 상호작용하는 시나리오를 막지 못한다 [^s13][^s15].

**밸리데이터 경제는 스코프 밖이다.** ERC 자체는 스테이킹·슬래싱·보상 스케줄을 정의하지 않는다 [^s13][^s15]. 따라서 구체 배포는 모두 자신이 합성한 AVS / zkML / TEE 스택의 보안 자세를 상속한다. ERC-8004에 관한 보안 주장은 레지스트리 단독이 아니라 합성된 시스템에 대한 주장으로 다뤄야 한다 [^s15].

**역량 검증은 간접적이다.** 등록은 에이전트가 어떤 신뢰 모델을 지원한다고 *말했다* 는 것을 증명할 뿐이며, 실제로 광고한 작업을 *수행* 한다는 것을 증명하지는 않는다 [^s13][^s15]. 검증은 밸리데이터가 존재하고 신뢰받는 한에서만 보완이 되고, 그렇지 않다면 클라이언트는 평판에 의존하게 되어 Sybil 한계가 다시 드러난다.

**검증 결과의 온체인 가독성은 부분적이다.** Ethereum Magicians 코멘터 spengrah는 "현재 표준에서 임의 스마트 컨트랙트가 validation response 결과를 읽을 방법이 보이지 않는다"고 지적했다 — 레지스트리는 이벤트를 발생시키고 getter를 노출하지만, 다른 프로토콜 로직이 타이트하게 바인딩할 수 있도록 검증 결과를 1급 시민으로 만들지는 않는다 [^s06]. 저자들의 답변은 검증이 의도적으로 *집행(enforcement) 계층* 이 아니라 *신호 계층* 이라는 것이었다 [^s06].

**집계는 독점화 위험을 키운다.** Ethereum Magicians 코멘터 daniel-ospina는 단일 점수 기반 평판이 "독점적 행동을 촉진한다"고 경고하며 모듈화된 맥락 의존 신뢰 벡터를 주장했다 [^s06]. 표준은 피드백 항목당 복수 태그와 쿼리 시 필터링을 지원하지만, 기본 집계 경로 — 평균 요약형 — 는 마켓플레이스의 자연스러운 귀인점이며 한 숫자로 순위 매길 유인은 남는다 [^s06].

**참조 컨트랙트 감사 상태는 본 조사에서 확인되지 않았다.** `erc-8004/erc-8004-contracts` 는 공개되어 있고 CC0이며 업그레이드 가능형, 다중 체인 배포 상태다 [^s09]. 제3자 공개 감사 보고서는 본 조사에서 확인하지 못했다. 고가치 배포를 운영하는 빌더는 사용 전 독립적으로 감사 상태를 확인해야 한다.

**동료심사 분석은 아직 없다.** 본 조사에 쓰인 모든 자료는 EIP 본문, 토론 포럼 게시글, 업계 해설, 벤더 블로그, 혹은 주류 암호화폐 뉴스 중 하나다 [^s01][^s06][^s13][^s14][^s15]. 작성 시점 기준 ERC-8004 신뢰 모델에 대한 피어리뷰 논문은 찾지 못했다. 메인넷 이후 3개월밖에 되지 않은 표준으로서는 일반적이지만 실질적인 인식론적 한계이며, `uncertainties.md` 에 기록되어 있다.

## 7. 참고문헌

자료는 `working/sources.jsonl` 에 있으며 아래에는 `id` 로 참조한다.

[^s01]: Marco De Rossi, Davide Crapis, Jordan Ellis, Erik Reppel, *ERC-8004: Trustless Agents* (EIP 초안, 2025-08-13). https://eips.ethereum.org/EIPS/eip-8004
[^s02]: BuildBear Labs, *ERC-8004: Trustless Agents with Reputation, Validation & Identity*. https://www.buildbear.io/blog/erc-8004
[^s03]: CCN, *What Is ERC-8004? Inside Ethereum's Proposed Standard for Trustless AI Agents*. https://www.ccn.com/education/crypto/erc-8004-ai-agents-on-chain-ethereum-how-works-risks-explained/
[^s04]: Backpack Learn, *ERC-8004 Explained: Ethereum's AI Agent Standard Guide 2025*. https://learn.backpack.exchange/articles/erc-8004-explained
[^s05]: CoinDesk, *Ethereum's ERC-8004 aims to put identity and trust behind AI agents* (2026-01-28). https://www.coindesk.com/markets/2026/01/28/ethereum-s-erc-8004-aims-to-put-identity-and-trust-behind-ai-agents
[^s06]: Ethereum Magicians, *ERC-8004: Trustless Agents* (토론 스레드). https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098
[^s07]: crypto.news, *Ethereum gears up for ERC-8004 rollout on mainnet this week*. https://crypto.news/ethereum-erc-8004-ai-agents-mainnet-launch-2026/
[^s08]: BitcoinEthereumNews, *ERC-8004 Mainnet Launch: What This Agent Protocol Actually Does*. https://bitcoinethereumnews.com/tech/erc-8004-mainnet-launch-what-this-agent-protocol-actually-does/
[^s09]: *erc-8004/erc-8004-contracts* (GitHub). https://github.com/erc-8004/erc-8004-contracts
[^s10]: Yahoo Tech, *ERC-8004 'Agents' Standard Nears Mainnet as Ethereum Teases Rollout*. https://tech.yahoo.com/ai/articles/erc-8004-agents-standard-nears-094213453.html
[^s11]: Google Cloud, *Announcing Agent Payments Protocol (AP2)*. https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol
[^s12]: Coinbase Developer Platform, *Welcome to x402*. https://docs.cdp.coinbase.com/x402/welcome
[^s13]: Composable Security, *ERC-8004: a practical explainer for trustless agents*. https://composable-security.com/blog/erc-8004-a-practical-explainer-for-trustless-agents/
[^s14]: Wyatt Benno (ICME), *Trustless Agents — with zkML*. https://blog.icme.io/trustless-agents-with-zkml/
[^s15]: QuillAudits, *ERC-8004: Infrastructure for Autonomous AI Agents*. https://www.quillaudits.com/blog/smart-contract/erc-8004
[^s16]: Bankless Times, *BNB Chain Backs ERC-8004 for On-chain AI Identities* (2026-02-04). https://www.banklesstimes.com/articles/2026/02/04/bnb-chain-backs-erc-8004-for-on-chain-ai-identities/
[^s17]: *awesome-erc8004* (GitHub). https://github.com/sudeepb02/awesome-erc8004
[^s18]: RedStone, *ERC-8004 Gives AI Agents Identity. RedStone and Credora Power Them with Data and Risk Intelligence* (2026-02-12). https://blog.redstone.finance/2026/02/12/erc-8004-gives-ai-agents-identity-redstone-and-credora-power-them-with-data-and-risk-intelligence/
