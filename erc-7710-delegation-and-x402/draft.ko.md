# ERC-7710 스마트 컨트랙트 위임과 x402와의 관계

## 초록

ERC-7710은 스마트 컨트랙트가 다른 컨트랙트나 EOA에 온체인 능력을 위임하게 하는 이더리움 표준으로, 위임받은 자(delegate)가 권한 증명(proof of authority)과 함께 `redeemDelegations`를 호출하는 `DelegationManager`를 중심으로 한다[^s01]. 본 보고서는 ERC-7710을 기술적으로 상세히 다룬다 — delegator/delegate/manager 역할, `redeemDelegations` 흐름, caveat enforcer 스코핑, 위임 체인(재위임)[^s01][^s04][^s05][^s06] — 그리고 HTTP-402 에이전트 결제 프로토콜 **x402**와의 관계를 검토한다. 핵심 발견은 둘이 단지 인접해 있다는 통념을 바로잡는다: x402의 정준 exact-EVM 스킴은 EIP-3009·Permit2와 나란히 **ERC-7710을 명시적인 세 번째 인가 옵션**("Smart Account Option")으로 열거하며, 이 모드에서 x402 결제 페이로드는 `delegationManager`/`permissionContext`/`delegator`를 담고 facilitator가 `/settle` 중에 구매자의 위임을 redeem한다[^s12]. MetaMask의 Smart Accounts Kit은 바로 이를 구현한 "x402 Payments with Delegations" 가이드를 제공한다[^s13]. 결정적으로 x402는 "위임을 획득하는 과정은 x402의 범위 밖"이라고 선언한다[^s12] — 따라서 둘은 깔끔하게 **조합된다**: ERC-7710(및 ERC-7715)이 *상시적·범위 제한된* 권한을 공급하고, x402가 *요청 단위로* 그것을 redeem한다. 본 분석은 빠르게 변하는 벤더 주도 표준에 대한 2026년 6월 스냅샷이다.

## 1. 서론 — ERC-7710이란 무엇이며 에이전트에 왜 중요한가

에이전트·dapp UX의 반복되는 문제는, 사용자의 키나 계정 전권을 넘기지 않으면서 소프트웨어에 온체인에서 사용자를 대신해 행동할 *일부* 권한을 부여하는 방법이다. ERC-7710은 이를 표준 수준에서 답한다: "스마트 컨트랙트가 다른 스마트 컨트랙트나 EOA에 능력을 위임하는 표준적 방법을 도입"하며, "위임 컨트랙트(delegator)는 원하는 행동을 실행하도록 `DelegationManager` 컨트랙트가 delegator를 호출하는 것을 인가할 수 있어야 한다"[^s01].

AI 에이전트에게 이것은 바로 빠져 있던 프리미티브 — *범위 제한된 권한* — 다. MetaMask는 에이전트 사용 사례를 직접 든다: "ERC-7710으로 제한된 실행 권한을 부여해 AI 에이전트가 당신을 대신해 거래하게 하고, ERC-7715가 그 권한을 지갑에서 쉽게 승인하게 한다"며, "에이전트는 거래마다 승인받지 않고도 하루 10 USDC까지 ETH 구매에 쓸 권한을 받을 수 있다"는 예를 든다[^s07]. 위임은 "전적으로 오프체인에서 안전하게" 공유되는 능력이며, 온체인 `DelegationManager`가 이를 검증·실행한다[^s03] _(interpretive: 키 없는 범위 권한 프레이밍)_.

## 2. 배경 — 계정 추상화, ERC-7715, 레퍼런스 구현

ERC-7710은 계정 추상화 세계를 위해 설계되었다. 스펙은 "ERC-4337과 호환되나 구현이 ERC-4337을 필수로 하지는 않는다"고 하며 "EIP-1271, EIP-7579를 요구한다"[^s01] — 즉 모듈러 스마트 계정과 표준 컨트랙트 서명 인터페이스를 전제한다. 그 레퍼런스 계보는 **MetaMask Delegation Framework**다: "DeleGator 스마트 계정은 위임 기능을 구현한 4337 호환 스마트 계정"이며 "Delegation Manager가 위임의 검증·실행 로직을 포함한다"[^s03].

ERC-7710에는 *요청* 측을 담당하는 형제 표준 **ERC-7715**가 있다. ERC-7715는 "DApp이 사용자를 대신해 트랜잭션을 실행할 권한을 지갑에 요청하기 위한 새 JSON-RPC 메서드 `wallet_requestExecutionPermissions`를 정의"한다[^s02]. 둘은 설계상 맞물린다 — ERC-7715의 "권한 응답 데이터는 … ERC-7710에 명시된 인터페이스를 사용해 redeem 가능"하며, redeem은 "`permissions.context`로 설정한 `_permissionContexts` 파라미터로 `redeemDelegation` 함수를 호출"한다[^s02]. 요컨대 7715는 앱이 범위 권한을 *요청*하는 방법이고, 7710은 그 권한을 나중에 *행사*하는 방법이다.

## 3. ERC-7710 상세 — 위임 모델

**역할.** 스펙은 셋을 정의한다: "Delegator는 위임을 생성할 수 있는 스마트 컨트랙트다. Delegation Manager는 위임 권한을 검증하고 Delegator에게 행동 실행을 호출하는 스마트 컨트랙트다. delegate는 위임을 redeem할 권한을 가진 스마트 컨트랙트·스마트 계정·EOA다"[^s01].

**Redeem.** 권한은 단일 진입점으로 행사된다: "delegate가 위임을 redeem하려 할 때, Delegation Manager의 `redeemDelegations` 함수를 호출하고 실행하려는 행동과 권한 증명(즉 위임)을 전달한다"[^s01]. 프레임워크의 매니저는 `redeemDelegations(bytes[] _permissionContexts, ModeCode[] _modes, bytes[] _executionCallDatas)`를 노출하며 "각 위임이 이전 위임이나 루트 위임으로부터 실행에 충분한 권한을 갖는지 보장한다"[^s04].

**Caveat와 enforcer.** 가공되지 않은 위임은 무제한적으로 강력하므로, ERC-7710 위임은 *caveat*로 제한된다: "Caveat는 위임에 제약과 규칙을 추가하는 데 쓰이며 … Caveat Enforcer 컨트랙트가 관리한다"[^s03]. MetaMask 툴킷은 흔한 패턴을 위한 enforcer를 제공한다 — 예: `valueLte` enforcer(`bigint` 상한을 받는 `ValueLteEnforcer.sol`)와 `allowedTargets` enforcer(허용 대상 주소 목록을 받는 `AllowedTargetsEnforcer.sol`)[^s05] _(이 enforcer 이름들은 ERC-7710 스펙 텍스트가 아니라 툴킷 구현 세부사항)_.

**위임 체인(재위임).** 구별되는 특징은 권한을 감쇠시켜 넘길 수 있다는 점이다: "재위임(Redelegation)은 … delegate가 루트 delegator로부터 동일하거나 축소된 수준의 권한을 넘기는 위임 체인을 만들게 한다"며, "Alice가 Bob에게 자신을 대신해 10 USDC를 쓸 권한을 주면, Bob은 다시 Carol에게 Alice를 대신해 최대 5 USDC를 쓸 권한을 줄 수 있다"[^s06]. 체인은 "부모 위임의 해시 또는 상수 `ROOT_AUTHORITY`를 담는" `authority` 필드로 추적되며[^s06], redeem 시 "위임은 leaf에서 root 순으로 정렬되고 배열의 마지막 위임이 루트 권한을 가져야 한다"[^s04].

## 4. x402 상세 — 위임과 관련된 부분

x402는 HTTP 네이티브 결제 프로토콜이다. 결제가 필요하면 "서버가 `402 Payment Required`와 결제 지침으로 응답하고, 구매자가 결제 페이로드를 준비·제출하며, 서버가 자체적으로 또는 x402 facilitator의 /verify·/settle 엔드포인트를 활용해 결제를 검증·정산한다"[^s08]. facilitator의 `/verify`는 "클라이언트의 결제 페이로드가 서버가 선언한 결제 요건을 충족하는지 확인"하고, `/settle`은 "결제를 블록체인에 제출하고 … 확정을 기다린다"[^s09]. 머신 클라이언트를 위해 명시적으로 설계되어 "AI 에이전트가 매끄럽게 사용할 수 있는 머신-투-머신 결제 네이티브 지원"을 내세운다[^s08][^s15].

EVM에서 x402의 기본 인가는 상시 권한이 아니라 *결제 단위 서명 인가*다. "exact" 스킴은 "토큰 네이티브 `transferWithAuthorization`(USDC에 흔하며 기본값)"을 쓰고, 그 외에는 "Uniswap Permit2와 x402 exact 프록시를 써서 EIP-3009 미지원 ERC-20도 지원"한다[^s10][^s14][^s16]. "upto" 스킴은 요청 단위 형태를 유지하되 상한을 허용한다: "구매자가 최대값에 대해 한 번 서명하고 서버가 그 이하의 최종 금액을 고르며", 서명 시점에 정산액을 모르므로 Permit2를 쓴다[^s11]. 두 경우 모두 인가 단위는 단일 요청의 결제다 _(interpretive)_.

## 5. ERC-7710과 x402의 관계

**단지 인접한 것이 아니라, x402가 ERC-7710을 정산 옵션으로 지명한다.** 정준 x402 exact-EVM 사양은 세 가지 인가 방법을 열거하며, 그 세 번째가 "ERC-7710 | 위임을 지원하는 스마트 계정 | Smart Account Option(ERC-7710 호환 계정에서 결제)"이다. 이는 "ERC-7710 스마트 컨트랙트 위임을 사용해 해당 표준을 지원하는 계정으로부터의 전송을 인가"하며 "`ERC7710Manager` 인터페이스를 구현한 `DelegationManager` 컨트랙트가 네트워크에 배포되어 있어야 한다"고 요구한다[^s12]. 이 모드에서 x402 결제 페이로드는 `delegationManager`·`permissionContext`·`delegator` 필드를 담으며[^s12], MetaMask의 출시 가이드에 따르면 "구매자의 스마트 계정이 facilitator가 자신을 대신해 토큰을 전송하도록 인가하는 위임을 생성하고, 구매자는 직접적인 토큰 승인을 서명하지 않으며, 대신 facilitator가 정산 중 redeem하는 위임을 서명한다"[^s13].

**둘은 명시적 설계상 두 층으로 조합된다.** x402는 위임 단계를 의도적으로 흡수하지 않는다: "위임을 획득하는 과정은 x402의 범위 밖"이다[^s12]. 그 상시 권한은 ERC-7710/7715 층이 공급한다 — ERC-7715가 정의하는 동일한 `redeemDelegation`/`permissionContext` 핸드셰이크다[^s02]. 결과적으로 역할이 명확히 나뉜다: **ERC-7710은 상시적·범위 제한·취소 가능한 능력을 제공하고, x402는 그것을 redeem하는 요청 단위 HTTP 결제를 제공한다.** MetaMask는 상시 권한의 이점을 구체화한다: 구매자는 "위임 스코프로 특정 facilitator 주소·금액·시간창에 위임을 제한"할 수 있고, "요청마다 재서명하지 않고도 반복 결제를 허용하는 장수명(long lived) 위임을 만들" 수 있다[^s13].

**왜 중요한가.** x402의 네이티브 결제 단위 모델(EIP-3009/Permit2 서명, 요청당 인가 1건)[^s10][^s11]과 달리, ERC-7710 옵션은 결제 단위 서명만으로는 표현할 수 없는 것을 더한다: 매 요청마다 새 사용자 서명 없이 에이전트가 여러 x402 요청에 걸쳐 인출할 수 있는, caveat로 제한된 지속적 예산 — 그리고 위임 프레임워크의 온체인 강제와 재위임/취소 기제다[^s05][^s06][^s13].

## 6. 분석 및 논의

**상호 보완적 강점.** 두 표준은 에이전트 결제의 서로 다른 절반을 푼다. x402는 계정 없이 어떤 머신 클라이언트든 쓸 수 있는 HTTP 네이티브·네트워크 불문의 challenge/settle 흐름을 제공한다[^s08][^s15]. ERC-7710은 *권한 모델* — 사용자가 한 번 부여하고 에이전트가 재사용하는, 범위 제한·감쇠 가능·온체인 강제 위임 — 을 제공한다[^s01][^s06]. x402의 ERC-7710 옵션이 둘이 만나는 이음새이며, x402의 "범위 밖" 조항이 둘을 얽히지 않고 분리 가능하게 유지한다[^s12].

**강제 방식 비교.** x402의 EIP-3009/Permit2 경로에서는 스코프가 단일 서명에 묶인다(수령자·금액이 서명 시점에 고정)[^s10]. ERC-7710 경로에서는 스코프가 redeem 시점에 평가되는 caveat enforcer 컨트랙트에 있으며, 여러 결제에 걸친 상시 한도·허용 대상·시간창을 표현할 수 있다[^s05][^s13] — 더 넓은 강제 표면이되, 배포된 `DelegationManager`와 ERC-7710 가능 스마트 계정을 요구하는 비용이 따른다[^s12].

**성숙도와 단서.** 두 스택 모두 젊고 벤더 주도다 — ERC-7710/7715와 Delegation Toolkit은 MetaMask/Consensys, x402는 Coinbase — 이며 MetaMask의 x402-위임 가이드는 특정(1.5.0) 릴리스에 맞춰져 있다[^s13]. "에이전트가 하루 10 USDC 지출" 프레이밍은 벤더 예시이지 독립 채택 지표가 아니다[^s07]. 조합은 오늘날 실재하고 명세화되어 있으나, 더 풍부한 위임형/반복 x402 청구의 표준화는 아직 정착 중이다.

## 7. 한계 (Limitations)

- **양측 모두 벤더 주도.** ERC-7710/7715와 레퍼런스 Delegation Framework는 MetaMask/Consensys 주도, x402는 Coinbase 주도다. "에이전트용 설계" 표현은 주로 이 벤더들에게서 나온다[^s07][^s08].
- **구현 세부 vs 스펙.** caveat enforcer 세부(`valueLte`·`erc20Streaming`·`allowedTargets`)는 ERC-7710 스펙 텍스트가 아니라 MetaMask 툴킷에서 나오며, 그에 맞게 툴킷에 귀속했다[^s05].
- **단일-1차 지점.** 핵심 ERC-7710 정의는 EIP 자체에 기댄다(표준으로서는 적절하나 단일-1차)[^s01]. x402↔7710 통합은 x402 스펙과 MetaMask 가이드로 입증된다[^s12][^s13]; 더 넓은 독립 구현은 본 보고서에서 조사하지 않았다.
- **움직이는 표적.** ERC-7710·ERC-7715·x402(v2)는 활발히 진화 중이고 MetaMask redeem-delegations 문서는 experimental로 표시되어 있다. 본 분석은 2026년 6월 스냅샷이다. 위임형/반복 x402 청구의 표준화는 진행 중으로 보였으나 독립 확인이 불가해 인용하지 않았다.
