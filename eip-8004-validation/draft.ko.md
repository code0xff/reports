# EIP-8004 Validation — 신뢰 없는 에이전트의 코드 레벨 검증

## 서론

EIP-8004(ERC-8004, "Trustless Agents")은 서로 다른 조직의 에이전트가 사전 신뢰 없이도 온체인에서 서로를 발견하고 거래할 수 있게 하려는 이더리움 표준이다 [^s01]. 표준은 체인별 싱글톤 형태의 세 개의 레지스트리 — Identity·Reputation·Validation — 으로 구성된다 [^s01][^s02]. 이 보고서는 그중에서 **Validation Registry** 만을 좁게 다룬다. Solidity 수준에서 정확히 무엇이 있고, 개발자가 검증 흐름을 어떻게 연결하며, 이 표준이 어떤 "검증"을 *제공하고 제공하지 않는지* 를 코드 레벨로 살펴본다.

설계자들은 Validation Registry를 "방법 비종속(method-agnostic)"으로 의도했다. 스테이크 기반 재실행(stake-secured re-execution), zkML 증명, TEE 오라클 모두 합법적인 검증자(validator)로 명시되어 있고, 레지스트리는 단지 *요청과 응답을 기록하는 hook* 만 제공한다 [^s01]. 온체인 코드는 응답값이 재실행 결과인지, ZK 증명 검증 결과인지, TEE 원격 증명(remote attestation)의 다이제스트인지를 알지 못한다. 이것이 설계상의 의도다 [^s02][^s08].

## 배경 — 세 개의 레지스트리

Identity Registry는 ERC-721 컨트랙트다. 각 에이전트가 하나의 토큰이며 `tokenId`가 그 에이전트의 `agentId`이고, `tokenURI`(스펙에서는 `agentURI`)는 에이전트의 서비스 목록을 담은 JSON 등록 파일을 가리킨다 [^s02]. 전역 주소체계는 `agentRegistry = "{namespace}:{chainId}:{identityRegistry}"`, 예: `eip155:1:0x742...` 이다 [^s02]. Reputation Registry는 `agentId`에 연결된 피드백 신호를 보관하고, Validation Registry는 검증자의 판정을 보관한다 — 이 보고서의 초점이다.

세 레지스트리는 독립적인 컨트랙트이며 체인당 싱글톤으로 배포된다. 표준은 명시적으로 신뢰 모델을 "플러그러블·계층적, 위험 노출에 비례하는 보안"으로 묘사하며, "피자 주문 같은 저위험 작업부터 의료 진단 같은 고위험 작업까지" 적용 가능하다고 한다 [^s01]. 통합 개발자는 필요한 조합만 사용한다. 발견만 필요하면 Validation은 무시해도 되고, 재실행 기반 증거가 필요하면 그것을 읽으면 된다.

## Validation Registry — 코드 레벨

현재 스펙(2026년 1월 업데이트, ChaosChain 참조 구현 기준)은 두 개의 쓰기 진입점과 네 개의 읽기 접근자를 노출한다 [^s02][^s03].

**요청.** 에이전트(또는 운영자)는 다음을 호출한다.

```solidity
function validationRequest(
    address validatorAddress,
    uint256 agentId,
    string  calldata requestURI,
    bytes32 requestHash
) external;
```

이 함수는 `agentId` 의 소유자 또는 승인된 운영자(operator)만 호출할 수 있어야 한다. 참조 구현은 이를 Identity Registry의 ERC-721 소유권/`isApprovedForAll`/`getApproved` 상태와 대조하여 강제한다 [^s02][^s03]. `requestURI`는 검증자가 필요로 하는 오프체인 페이로드(입력, 출력 등)를 가리키고, `requestHash`는 이 페이로드에 대한 keccak-256 커밋먼트이자 요청의 식별자이다 [^s02]. 참조 구현은 스펙에 없는 안전 검사도 추가한다 — `validatorAddress == agentOwner` 이면 거부("Self-validation not allowed"), 이미 존재하는 `requestHash`도 거부한다 [^s03].

성공 시 다음 이벤트가 발생한다.

```solidity
event ValidationRequest(
    address indexed validatorAddress,
    uint256 indexed agentId,
    string requestURI,
    bytes32 indexed requestHash
);
```

**응답.** 요청에 지정된 `validatorAddress` 만 응답할 수 있다.

```solidity
function validationResponse(
    bytes32 requestHash,
    uint8   response,
    string  calldata responseURI,
    bytes32 responseHash,
    string  calldata tag
) external;
```

`response`는 `uint8` 0–100 범위로, 이진(0=실패, 100=통과) 또는 스펙트럼 형 등급으로 해석된다 [^s02]. `responseURI`·`responseHash`·`tag`는 선택적이며, `tag`는 `"soft-final"`·`"hard-final"` 같은 단계적(progressive) 상태를 표현하는 데 쓰인다 [^s02]. 중요한 점은 동일한 `requestHash`에 대해 `validationResponse`를 **여러 번** 호출할 수 있다는 것이다. 이것이 progressive 상태 전이의 메커니즘이다 [^s02][^s03]. 또한 스펙·참조 구현 모두 명시적인 **만료(expiration) 기간을 두지 않는다**. 요청은 계속 열려 있고 재응답이 가능하며, 마감이 필요한 통합자는 상위 프로토콜에서 직접 부과해야 한다 _(unverified — single source: 정식 스펙과 참조 구현 자체가 1차 소스이며, 만료 부재에 대한 외부 해설은 발견되지 않았다)_.

**읽기.** 1월 2026 업데이트는 이전에 커뮤니티에서 요구되었던 온체인 읽기 접근자를 추가했다 [^s02][^s03][^s05].

```solidity
function getValidationStatus(bytes32 requestHash) external view returns (
    address validatorAddress,
    uint256 agentId,
    uint8 response,
    bytes32 responseHash,
    string memory tag,
    uint256 lastUpdate
);

function getSummary(uint256 agentId, address[] calldata validatorAddresses, string calldata tag)
    external view returns (uint64 count, uint8 averageResponse);

function getAgentValidations(uint256 agentId)
    external view returns (bytes32[] memory requestHashes);

function getValidatorRequests(address validatorAddress)
    external view returns (bytes32[] memory requestHashes);
```

이는 Ethereum Magicians에서 제기된 비판에 대한 부분적 응답이다. spengrah는 "현재 표준에는 임의의 스마트 컨트랙트가 validation 응답을 읽을 방법이 없다"고 지적했고 `getValidationResponse()` 접근자를 제안했다 [^s05]. Marco-MetaMask는 가스 효율을 이유로 표면적을 가볍게 유지한 것은 의도적이며 "단일 피드백이나 validation 하나로 신뢰를 결정하지 않을 것 — 사람들은 항상 항목들을 집계한다"고 답변했다 [^s05]. 1월 2026 업데이트는 일종의 절충이다. 컨트랙트가 개별 상태와 온체인 평균을 *읽을 수는* 있게 됐지만, 스펙은 여전히 실질적인 집계는 오프체인에서 일어날 것이라 안내하며, 참조 구현 코드 주석은 "인기 있는 에이전트에 대해 필터 없이 `getSummary`를 호출하면 가스 한도를 초과할 수 있다"고 명시한다 [^s03].

Validation Registry 컨트랙트는 `(requestHash → Request)`, `(requestHash → Response)` 매핑과 `agentId` · `validatorAddress` 별 역인덱스를 유지한다 [^s03]. 상태는 구조적으로 append-only — 참조 구현에 삭제 경로가 없고, 스펙의 보안 절에는 "온체인 포인터와 해시는 삭제될 수 없으며, 감사 추적의 무결성을 보장한다"고 적혀 있다 [^s02].

## 레지스트리에 꽂히는 검증 방식들

`validationResponse(...)` 호출 한 번을 *실질적인 신뢰* 로 바꾸는 것은, 검증자가 *누구이고* 호출 전에 *무엇을 했는가* 다. 스펙은 명시적으로 "검증자 스마트 컨트랙트는 예를 들어 스테이크 기반 추론 재실행, zkML 검증기, 또는 TEE 오라클을 사용하여 요청을 검증하거나 거부할 수 있다"고 하며, "검증에 관련된 인센티브와 슬래싱은 특정 검증 프로토콜이 관리하며 본 레지스트리의 범위를 벗어난다"고 못박는다 [^s02].

**스테이크 기반 재실행.** 검증자(보통 운영자 집합; 외부 해설에서는 EigenLayer 같은 리스테이킹 계층으로 담보된 AVS 구조로 묘사된다)가 `requestURI`를 읽어 에이전트 작업을 재실행하고 0–100 점수를 `validationResponse`로 기록한다 [^s01][^s08][^s12] _(interpretive — 패턴은 외부 해설이 묘사하며, 레지스트리 자체는 이에 무관하다)_. 경제적 보장은 전부 레지스트리 바깥에 있다. 레지스트리는 판정만 보관한다.

**zkML.** JOLT-Atlas에 대한 ICME 블로그 글은 흐름을 이렇게 묘사한다 — "에이전트가 ML 추론을 실행하고, JOLT-Atlas가 실행에 대한 ZK 증명을 생성하며, dataHash가 증명과 검증 파라미터에 대한 커밋먼트가 되고, 검증자 컨트랙트가 증명을 온체인에서 검증한 뒤 `ValidationResponse`가 검증 결과를 기록한다" [^s07]. 코드 관점에서 검증자는 zkSNARK 검증기(`verifyProof(...)`)를 핵심 로직으로 가진 컨트랙트이며 `msg.sender == request.validatorAddress` 게이트로 보호된다. 같은 글은 솔직하게 — 작은 모델은 오늘 실용적이지만 큰 LLM 은 "여전히 분 단위" 증명 시간이 든다고 적는다 [^s07] _(early signal)_.

**TEE 원격 증명.** Phala의 `erc-8004-tee-agent`는 `TEERegistry` 확장을 추가하여 각 `agentId`별로 `(teeArch, codeMeasurement, pubkey, codeConfigUri, verifier)` 튜플을 키로 등록한다 [^s06]. `addKey`는 verifier가 화이트리스트에 있어야만 진행되며, verifier는 "TEE 원격 증명이 유효한지, codeMeasurement가 증명의 public input과 일치하는지, pubkey가 증명의 public input과 일치하는지"를 검증해야 한다 [^s06]. TEE Registry는 Validation Registry를 대체하지 않는다. 별개의 형제로서, Validation Registry는 작업별 판정을 기록하고 TEE Registry는 그 결과를 만들어낸 *코드의 측정값* 에 에이전트 신원을 묶는다.

## 엔드투엔드 개발자 워크플로

2026년 1월 컨트랙트에 대한 최소 통합 흐름은 다음과 같다 [^s02][^s03][^s14].

1. **신원 발급.** 체인별 `IdentityRegistry` 싱글톤을 배포(또는 조회)하고, `agentURI`가 등록 파일(A2A·MCP·OASF 엔드포인트, ENS, 지갑 주소 등의 services 목록)을 가리키는 에이전트 NFT를 민팅한다 [^s02].
2. **검증자 선택.** 자신의 신뢰 모델을 구현하는 컨트랙트 주소(재실행 AVS, zkML 검증기, TEE 인증 오라클 등)를 고른다. 레지스트리는 검증자를 열거하지 않는다 — 발견은 등록 파일이나 오프체인 에이전트 생태계를 통해 일어난다 [^s01][^s14].
3. **작업 커밋.** `requestHash = keccak256(payload)`를 계산한다. `payload`에는 검증자가 필요로 하는 모든 것(입력, 출력, 중간 상태)이 포함된다. 페이로드를 `requestURI`(IPFS·HTTPS 등)에 업로드한다.
4. **요청.** 에이전트 소유자/운영자로서 `validationRequest(validatorAddress, agentId, requestURI, requestHash)`를 호출한다 [^s02][^s03].
5. **검증자 응답.** 검증자는 `requestURI`에서 페이로드를 받아 자기 방식대로 검증한 뒤 등록된 주소로 `validationResponse(requestHash, response, responseURI, responseHash, tag)`를 호출한다 [^s02][^s03].
6. **소비.** 오프체인 컨슈머는 `ValidationResponse` 이벤트를 구독하고, 온체인 컴포저는 `getValidationStatus(requestHash)` 또는 `getSummary(agentId, validators, tag)`를 호출한다. 참조 구현은 인기 있는 에이전트에 대해서는 validator·tag로 필터링하라고 명시적으로 권고한다 — 필터 없는 `getSummary`는 가스 한도를 초과할 수 있다 [^s03].

도구 생태계는 두 저장소를 중심으로 모인다. `erc-8004/erc-8004-contracts`는 정식 CC0 라이선스 레지스트리로 UUPS 업그레이드형 변형(`IdentityRegistryUpgradeable.sol`, `ReputationRegistryUpgradeable.sol`, `ValidationRegistryUpgradeable.sol`)을 포함한다 [^s04]. `ChaosChain/trustless-agents-erc-ri`는 1월 2026 참조 구현이며 대부분의 서드파티 SDK가 이를 대상으로 한다 — `create-8004-agent`, `erc-8004-js`, `erc-8004-py`, Agent0 SDK(JS·Python), chaoschain-sdk 등이 있고, Agent0은 멀티체인 인덱싱용 subgraph도 운영한다 [^s03][^s14].

2026년 초 기준, ERC-8004 컨트랙트는 이더리움 메인넷·Base·Arbitrum·Polygon·Optimism·BNB Chain 에 배포되어 있다. BNB Chain은 명시적으로 "낮은 수수료와 빠른 실행이 필요한 에이전트 시스템의 초기 허브" 로 자기 자신을 포지셔닝했다 [^s04][^s12][^s13]. 보고된 등록 수 — 첫 한 달 동안 프로토콜 전체 4만 5천 이상, 이더리움 계열 배포 약 2만 4천 — 은 생태계 트래커(8004 Scan)에서 나온 수치이고 독립 온체인 감사 결과가 아니므로 방향성 신호로만 받아들여야 한다 _(vendor-stated)_ [^s12][^s13].

## 분석과 한계

**컴포저빌리티는 부분 해결, 완전 해결은 아니다.** 1월 2026 의 읽기 접근자 `getValidationStatus` / `getSummary` 는 "임의 컨트랙트가 validation 결과를 볼 수 없다"는 spengrah의 비판에 직접 응답한다 [^s03][^s05]. 그러나 스펙은 진지한 집계를 여전히 오프체인으로 미룬다. `getSummary`의 코드 주석 자체가 "오프체인 소비용으로 설계됐고 필터 없이 호출하면 위험하다"고 적는다 [^s03]. 온체인 컴포저는 레지스트리를 *공증된 로그* 로 다루어야지 *오라클* 로 다루면 안 된다.

**검증자 경제는 범위 밖이다.** QuillAudits와 Composable Security 둘 다 "ERC-8004은 검증자에 대한 경제적 인센티브를 명시하지 않으며, 보안은 상위 프로토콜의 구성에 의존한다"고 지적한다 [^s08][^s09]. 스펙도 동일하게 — "검증에 관련된 인센티브와 슬래싱은 특정 검증 프로토콜이 관리하며 본 레지스트리의 범위 밖이다" [^s02]. 스테이크가 0인 검증자가 100점을 부여해도 그 자체로는 아무 의미가 없다.

**자기 검증은 컨트랙트가 막지만, 검증자 품질은 아무도 안 막는다.** 참조 컨트랙트는 `validatorAddress == agentOwner` 또는 호출자가 자신을 검증자로 지정한 경우를 거부한다 [^s03]. 그 이상은 없다. "검증자"로의 등록은 사실상 무허가다 — 레지스트리는 어떤 주소든 받아준다. 신뢰는 EIP-8004 바깥(스테이크·인증·소셜·감사)에서 오는 수밖에 없다 [^s09].

**단일 집계 점수의 위험.** Daniel-Ospina는 Magicians에서 단일 점수 집계가 독점적·편향적 평판으로 이어질 수 있음을 지적했다 [^s05]. 1월 2026 업데이트는 `getSummary`를 validator·tag로 필터할 수 있게 해 부분 완화했지만 위험을 제거하지는 않는다. `getSummary(agentId, [], "")`로 무필터 평균만 읽는 통합자는 지배적 검증자들의 편향을 그대로 떠안는다.

**스펙은 아직 움직이는 중이다.** 정식 저장소의 `ERC8004SPEC.md`와 ChaosChain 참조 모두 명시적 경고를 단다 — "이 절은 여전히 TEE 커뮤니티와 활발한 업데이트 중이다. 2026 하반기에 추가 변경을 예상하라. 실험적(EXPERIMENTAL)으로 다루라." [^s03][^s04]. 여기 표기된 함수 시그니처는 작성 시점 기준 정확하지만 변할 수 있다.

## 논의

2026년의 EIP-8004은 쉬운 부분(Identity)과 중간 부분(Reputation)을 가져갔고, 어려운 부분(Validation)을 반복 개선 중인 인프라 표준의 모양을 갖추고 있다. 현재의 Validation Registry는 의도적으로 얇은 *공증* 레이어다 — *누가 어떤 작업에 대해 무엇이라 말했는지* 만 기록하고, 흥미로운 모든 질문(유효한 증명이 무엇인지, 누가 비용을 지불하는지, 누가 신호를 집계하는지)은 상위 프로토콜에 떠넘긴다. 이 미니멀리즘이 빠른 멀티체인 배포의 원인이자 [^s04][^s12][^s13], 동시에 핵심 비판의 원인이다 — `response == 100` 을 신뢰로 받아들이는 개발자는 실망할 것이다. 레지스트리는 검증자를 보증하지 않기 때문이다.

EAS(Ethereum Attestation Service)나 AVS 매개 신뢰 계층 같은 오프체인 인증 스택과 비교하면, EIP-8004은 더 좁은 자리에 있다 — 일반 인증 프레임워크가 아니라, *에이전트 발견 + 작업별 판정 기록* 표면에 특화되어 있다. 이 표준의 트랙션은 에이전트 결제 프로토콜(x402, AP2) 과의 공동 포지셔닝에서 온다 — Validation 은 결제 레일이 읽을 수 있는 형태로 "이 에이전트가 내가 결제한 일을 정말로 했는가" 에 답한다 [^s11].

## 한계

이 보고서가 다루지 않는 것: (1) 레지스트리 컨트랙트의 형식 검증 또는 상세 감사 결과, (2) 비-EVM 포팅(TRON SDK는 존재 [^s14] 하지만 검증되지 않음), (3) Reputation Registry 의 피드백 의미론(Validation 이해에 필요한 범위 외), (4) TEE 원격 증명을 특정 추론에 묶는 에이전트 측 암호학(Phala 측 이슈), (5) 검증자 시장의 경제 모델링. 일부 — 특히 zkML 처리량 수치와 채택 통계 — 는 본 보고서가 표시는 했지만 독립 검증하지 않은 벤더 발표 수치다.

## 초록

EIP-8004 의 Validation Registry 는 에이전트 작업에 대한 판정을 기록하는 온체인 공증 표면이다. 코드 레벨에서는 두 개의 쓰기 함수 — 에이전트 소유자가 호출하는 `validationRequest(validatorAddress, agentId, requestURI, requestHash)` 와 지정된 검증자가 호출하는 `validationResponse(requestHash, response, responseURI, responseHash, tag)` — 와 1월 2026 업데이트에서 추가된 네 개의 읽기 접근자로 구성되어, 다른 컨트랙트가 개별 상태와 필터링된 요약을 읽을 수 있다. 표준은 방법 비종속이다. 재실행 AVS, zkML 검증기(예: JOLT-Atlas), TEE 오라클(예: Phala TEERegistry 확장) 모두 0–100 의 `uint8` 점수를 기록하는 방식으로 연결된다. 레지스트리는 검증자 경제나 신뢰 그 자체를 의도적으로 명시하지 않으며 — 그것은 상위 프로토콜에 있다 — 이것이 2026년 초 이더리움·Base·Arbitrum·Polygon·Optimism·BNB Chain 으로의 빠른 배포가 가능했던 이유이자, "레지스트리가 100을 말한다"가 "결과가 검증됐다"와 같지 않은 이유다. 통합 개발자는 경제적 보장이 있는 검증자를 선택하고, ERC-721 Identity Registry 로 신원을 발급하고, keccak-256 해시로 작업을 커밋하고, Validation Registry 를 오라클이 아닌 감사 가능한 로그로 다루어야 한다.
