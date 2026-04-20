# AI Agent용 신원 인증에서 EAS와 DID/VC의 비교 분석

## Abstract

AI agent의 신원 인증을 설계할 때 `EAS(Ethereum Attestation Service)`와 `DID(Decentralized Identifiers)`는 자주 같은 범주의 대안처럼 언급되지만, 실제로는 서로 다른 층위의 기술이다. DID는 주체를 식별하고 DID Document를 통해 검증 키와 서비스 정보를 연결하는 식별자 계층이며, 사람뿐 아니라 조직, 사물, 데이터 모델, 추상 엔터티까지 식별 대상으로 삼는다.[^s01] 반면 EAS는 온체인 또는 오프체인에서 임의의 어테스테이션을 만들 수 있게 하는 범용 어테스테이션 인프라다.[^s05] 따라서 AI agent 신원 문제를 정확히 다루려면 `EAS vs DID`가 아니라, `EAS vs DID/VC stack`으로 비교하는 편이 기술적으로 맞다.[^s01][^s03]

본 리포트의 결론은 다음과 같다. 온체인 EVM 생태계 안에서 역할, 허가, 평판, 멤버십 같은 공개 검증 가능한 주장(claim)을 빠르게 붙이려면 EAS가 단순하고 조합 가능성이 높다.[^s06][^s07] 반대로 에이전트의 지속 식별자, 키 회전, 서비스 발견, 선택적 공개, 상관관계 최소화가 중요하면 DID와 VC 계열이 더 적합하다.[^s01][^s02][^s04] 실무적으로는 DID를 루트 식별자로 두고, EAS를 공개 평판 및 온체인 권한 증명 레이어로 붙이는 하이브리드가 가장 설득력 있다.[^s05][^s07]

## Introduction

AI agent 신원은 단순히 "이 주소가 누구인가"의 문제가 아니다. 최소한 네 가지 층위가 있다. 첫째, **식별(identifier)**: 이 agent를 다른 agent와 구분하는 안정적인 이름이 필요한가. 둘째, **인증(authentication)**: 지금 응답하거나 거래를 서명하는 주체가 정말 그 agent인가. 셋째, **권한(authority)**: 어떤 API, 지갑, 데이터, 실행 권한을 부여받았는가. 넷째, **평판 및 자격(reputation / credential)**: 누가 이 agent를 검증했으며 어떤 역할을 인정했는가. 이 네 층위를 한 기술이 전부 해결한다고 가정하면 설계가 흐려진다.[^s01][^s05]

W3C DID Core는 DID를 URI 기반 식별자로 정의하고, DID subject와 DID document를 연결한다.[^s01] DID Document는 verification methods와 services를 표현할 수 있으므로, 신원 자체와 인증 경로, 서비스 엔드포인트를 함께 기술하는 기반이 된다.[^s01] 반면 EAS는 "무엇을 누구에 대해 증명할 것인가"를 스키마와 어테스테이션으로 표현하는 방향에 가깝다.[^s05][^s06] 따라서 EAS는 신원의 "뼈대"보다는 신원 위에 붙는 주장과 평판의 "오버레이"로 이해하는 편이 더 정확하다.[^s05][^s07]

## EAS가 제공하는 것: 어테스테이션 레이어

EAS의 공식 설명은 매우 명확하다. EAS는 "온체인 또는 오프체인에서 무엇이든 어테스트"하기 위한 인프라 공공재다.[^s05] 이 정의 자체가 EAS를 식별자 표준이 아니라, 범용 증명 인프라로 위치시킨다. 공식 사이트와 `eas-contracts` 저장소 모두 EAS의 코어를 두 개의 스마트 컨트랙트로 설명한다. 하나는 스키마를 등록하는 `SchemaRegistry`, 다른 하나는 그 스키마에 따라 어테스테이션을 발행하는 `EAS` 계약이다.[^s06][^s07] 이 단순성 덕분에 EAS는 온체인 allowlist, 멤버십 증명, 역할 부여, KYC 확인, reputation score, content moderation tag 같은 시나리오에 바로 연결되기 쉽다.[^s07]

AI agent 관점에서 특히 중요한 부분은 EAS가 온체인뿐 아니라 오프체인과 위임(delegation) 모델도 제공한다는 점이다. EAS SDK 예제는 `signOffchainAttestation()`을 통해 서명된 오프체인 어테스테이션 객체를 만들 수 있음을 보여주고, 이 객체는 UID, 서명, 어테스테이션 데이터를 포함한다.[^s09] 동시에 `attestByDelegation`을 통해 별도의 전송자나 relayer가 가스비를 부담하면서도 원래 attester의 의사를 반영한 위임 어테스테이션을 제출할 수 있다.[^s08] 이는 agent runner, sponsor, relayer가 분리된 구조에서 실용적이다. 다만 이러한 기능이 곧바로 "표준 신원 계층"을 의미하지는 않는다. EAS는 여전히 "누가 무엇을 주장했는가"를 다루는 쪽에 더 가깝다.[^s05][^s08]

## DID와 VC가 제공하는 것: 식별자와 휴대 가능한 자격증명

DID Core는 DID가 사람, 조직, 사물, 데이터 모델, 추상 엔터티를 포함한 임의의 subject를 지칭할 수 있다고 설명한다.[^s01] 이 점은 AI agent에 특히 유리하다. agent는 인간 사용자와 달리 지갑, 서비스, 모델 런타임, 자동화된 실행 권한을 동시에 가질 수 있는데, DID는 이를 "비인간 주체"까지 포함하는 식별자 모델로 수용한다.[^s01] 또한 DID Document는 verification methods와 services를 표현할 수 있어, 어떤 키가 인증용인지, 어떤 엔드포인트가 해당 agent의 상호작용 경로인지 구조화할 수 있다.[^s01]

DID Core는 verification relationship을 분리해 둔 것도 중요하다. 예를 들어 `authentication`은 로그인이나 소유 증명에, `capabilityInvocation`은 특정 자원이나 API를 호출할 권한 행사에 쓰일 수 있다.[^s01] 이 분리는 agent 신원 설계에서 "내가 누구인가"와 "무엇을 호출할 수 있는가"를 구분하게 해 준다. 즉 DID는 단순 공개키 바인딩을 넘어, 에이전트가 어떤 키로 어떤 행위를 정당화할 수 있는지 설명하는 신원 프레임에 가깝다.[^s01]

다만 DID만으로는 제3자 발급 자격증명까지 충분히 설명되지 않는다. 여기서 VC 2.0이 추가된다. VC 2.0은 선택적 공개와 영지식증명 기반 presentation 가능성을 명시적으로 수용한다.[^s03] 또 장기 식별자가 상관관계 위험을 만들 수 있다는 점을 별도로 다루며, holder가 상관관계를 유발하는 식별자를 선택적으로 공개할 수 있는 자격증명을 선호해야 한다고 권고한다.[^s04] DID Core 역시 pairwise DID를 통해 관계별 가명화를 권장한다.[^s02] 즉 DID/VC 계열은 프라이버시와 상관관계 최소화를 아키텍처 수준에서 논의한다.[^s02][^s04]

## AI Agent 관점의 비교: 인증, 권한, 평판, 프라이버시

AI agent 신원을 `식별, 인증, 권한, 평판`의 네 축으로 나누면 두 접근의 성격 차이가 또렷해진다. **식별과 인증** 측면에서는 DID가 더 근본적이다. DID는 주체를 URI로 식별하고, DID Document를 통해 검증 키와 서비스 정보를 연결한다.[^s01] 또한 relationship별 DID 사용과 검증 메서드 분리를 통해 키 회전과 상관관계 최소화 전략을 설계하기 쉽다.[^s02] 반대로 EAS는 특정 subject에 대해 역할, 속성, 소속, 허가 상태를 덧붙이는 데 강하지만, 그 자체로 범용 식별자 체계를 제공하지는 않는다.[^s05][^s07]

**권한과 평판** 측면에서는 EAS가 특히 실용적이다. 어떤 agent가 "이 DAO의 승인된 실행자다", "KYC를 통과했다", "특정 모델 제공자로 검증됐다", "이 정책 집합에 접근 가능하다"와 같은 진술을 스키마화해 온체인에서 바로 소비할 수 있기 때문이다.[^s06][^s07] 스마트 컨트랙트가 이를 직접 읽고 게이팅 로직을 구성하기 쉽다는 점이 강점이다.[^s07] 따라서 EVM 기반 agent marketplace나 onchain service marketplace처럼 컨트랙트 수준의 composability가 중요한 환경에서는 EAS가 구현 난이도와 통합 속도 면에서 우위가 있다.[^s06][^s07]

**프라이버시와 상호운용성**에서는 DID/VC 계열이 우세하다. DID Core는 pairwise DID 사용을 통해 관계별 가명화를 권고하고, VC 2.0은 상관관계를 유발하는 장기 식별자와 서명 메커니즘의 위험을 별도로 다룬다.[^s02][^s04] 또한 VC 2.0은 영지식증명과 선택적 공개를 정식 데이터 모델 안에 수용한다.[^s03] EAS도 오프체인 어테스테이션을 제공하지만, 그 중심 설계는 어디까지나 스키마와 어테스테이션을 공개적으로 조합 가능한 형태로 두는 데 있다.[^s05][^s09] 따라서 민감한 속성을 최소 공개해야 하거나, 체인과 지갑을 넘나드는 검증 가능성이 중요할수록 DID/VC 쪽이 적합하다.[^s03][^s04]

결국 `EAS vs DID`를 단일 승자 모델로 보는 것은 부정확하다. EAS는 주로 **claims / attestations / reputation** 레이어이고, DID/VC는 **identifier / authentication / portable credentials** 레이어다.[^s01][^s05] 이 차이를 무시하면 EAS에 식별자 역할을 과도하게 기대하거나, 반대로 DID에 온체인 reputation registry 역할을 과도하게 기대하게 된다. 둘의 강점이 다른 만큼, 설계 목표에 맞춰 조합하는 편이 현실적이다.[^s05][^s07]

## 권장 아키텍처: EAS-only, DID/VC, Hybrid

가장 단순한 선택지는 **EAS-only**다. 에이전트의 실제 지갑 주소나 스마트월렛 주소를 주체로 삼고, 역할, 권한, 평판, 검증 결과를 모두 EAS 어테스테이션으로 표현한다. 이 접근은 EVM 안에서 매우 직관적이고, 온체인 게이팅과 합성이 쉽다.[^s06][^s07] 그러나 주소 회전, 멀티체인 이식성, 서비스 엔드포인트 발견, 관계별 가명화 같은 문제를 체계적으로 다루기 어렵다. 따라서 공개 reputation이나 allowlist 중심 시스템에는 적합하지만, 범용 agent identity backbone으로는 한계가 있다.[^s02][^s05]

두 번째는 **DID/VC 중심**이다. 에이전트마다 DID를 부여하고 DID Document에 인증 키, assertion 키, capability invocation 키, 서비스 엔드포인트를 연결한다.[^s01] 제3자 검증 결과는 VC 형태로 발급하고, 필요 시 선택적 공개 또는 ZK presentation을 사용한다.[^s03][^s04] 이 방식은 프라이버시와 상호운용성이 뛰어나지만, 온체인 앱에서 직접 소비하기에는 구현 복잡도와 UX 부담이 커질 수 있다.[^s03]

세 번째이자 가장 현실적인 선택지는 **Hybrid**다. DID를 agent의 루트 식별자로 사용하고, 상호운용 가능한 자격증명은 VC로, EVM 안에서 즉시 읽혀야 하는 역할·허가·평판 정보는 EAS로 표출한다. 예를 들어 "이 agent는 특정 조직이 관리하는 DID subject"라는 장기 식별자는 DID로 유지하되, "이 agent는 현재 특정 프로토콜의 approved executor" 같은 상태성 정보는 EAS로 표현하는 방식이다.[^s01][^s05][^s07] 이 구조는 DID/VC의 식별·프라이버시 강점과 EAS의 온체인 composability를 동시에 취한다는 점에서 AI agent 시스템에 가장 적합하다.[^s03][^s06]

## Limitations

본 리포트는 DID method별 차이, OpenID4VP 같은 verifier 프로토콜, DIDComm 또는 구체적 wallet UX를 비교하지 않았다. 따라서 "어떤 DID method를 선택해야 하는가", "모바일 월렛이 없는 server-side agent에 presentation flow를 어떻게 붙일 것인가" 같은 질문에는 추가 설계가 필요하다. 또한 EAS의 private data, Merkle-based selective disclosure, 각 체인별 배포 차이도 별도 심화 주제로 남는다. 이 때문에 본 리포트의 결론은 기술 계층과 아키텍처 적합성 수준의 비교로 이해해야 한다.[^s05]

## References

본 리포트의 핵심 근거는 W3C DID Core, W3C VC Data Model 2.0, EAS 공식 사이트, EAS contracts 저장소, EAS SDK README다.[^s01][^s03][^s05][^s07][^s08]
