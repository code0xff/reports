# x402 EVM 정산 컨트랙트와 결제 스킴: Permit2 프록시와 배치 정산

## 초록

x402는 HTTP 네이티브 결제 프로토콜로, 리소스 서버가 요청에 HTTP 402로 응답하면 클라이언트가 암호학적으로 서명한 결제 인가를 돌려주고, **퍼실리테이터(facilitator)** 가 가스를 대신 부담하며 그 결과로 발생하는 온체인 정산을 브로드캐스트한다.[^s06][^s08] EVM 체인에서 네이티브 `transferWithAuthorization`을 지원하지 않는 ERC-20 토큰의 정산은 일군의 "Permit2 프록시" 컨트랙트가 담당한다. 본 보고서는 요청에 명시된 네 개의 파일을 고정 커밋 기준(`coinbase/x402` 커밋 `dd927a2`, 2026-04-21)으로 분석한다: `x402BasePermit2Proxy.sol`, `x402ExactPermit2Proxy.sol`, `x402UptoPermit2Proxy.sol`, 그리고 요청된 `x402BatchSettlement.sol`. 첫 번째 발견이 전제를 바로잡는다. **`x402BatchSettlement.sol` 컨트랙트는 존재하지 않는다.** `contracts/evm/src`에는 세 개의 프록시와 `ISignatureTransfer` 인터페이스, 목(mock) 토큰만 들어 있으며, "배치 정산(batch-settlement)"은 오직 *스킴 명세*로만 존재하고 그 레퍼런스 바인딩은 EVM 컨트랙트가 아니라 Cloudflare를 통해 오프체인으로 정산된다.[^s01][^s02][^s03][^s09][^s10] 실재하는 세 컨트랙트는 하나의 설계를 공유한다. 즉 퍼실리테이터가 아니라 프록시가 인가된 Permit2 *스펜더(spender)* 이며, Uniswap Permit2의 "위트니스(witness)" 패턴이 결제 목적지를 지불자의 서명 안에 암호학적으로 결박하여 퍼실리테이터가 브로드캐스트는 하되 자금을 가로채지는 못하게 한다.[^s01][^s06][^s15] `exact` 프록시는 항상 허용된 전액을 전송하고, `upto` 프록시는 인가된 퍼실리테이터가 서명된 최대치 이내에서 임의 금액을 전송하도록 허용하며 호출자 인가를 위해 위트니스에 `facilitator` 필드를 추가한다.[^s02][^s03] 이 컨트랙트들은 수탁(custody)을 하지 않고, 불변(immutable)이며, 재진입 방어가 되어 있고, CREATE2를 통해 모든 EVM 체인에서 동일한 주소로 배포되도록 설계되었다.[^s11]

## 1. 서론

x402는 오랫동안 사용되지 않던 HTTP `402 Payment Required` 상태 코드를 머신이 결제 가능한 웹 리소스의 기반으로 되살린다. 요청마다 결제해야 하는 자율 에이전트의 등장으로 이 활용은 한층 첨예해졌다. 프로토콜의 역할 분담은 스킴 문서 전반에서 일관된다. **클라이언트**가 인가에 서명하고, **리소스 서버**가 청구액을 정하며, **퍼실리테이터**가 인가를 검증하고 정산 트랜잭션을 브로드캐스트하면서 가스를 부담해 지불자 입장에서는 가스리스(gasless)가 된다.[^s06][^s08] 퍼실리테이터는 신뢰받는 수탁자가 아니라 명시적으로 브로드캐스터일 뿐이다. "퍼실리테이터는 금액이나 목적지를 변경할 수 없다. 그들은 트랜잭션 브로드캐스터 역할만 한다."[^s06]

이 보장은 서명된 인가 자체가 수취인과 금액을 명시하는 EIP-3009 `transferWithAuthorization` 지원 토큰(예: USDC)에서는 자명하다. 어려운 경우는 그런 훅이 없는 임의의 ERC-20이다. x402의 해법은 그러한 결제를 **Uniswap Permit2**와, "스펜더" 자리를 차지하는 얇은 x402 자체 프록시를 통해 라우팅하는 것이다.[^s06] 본 요청의 네 파일이 바로 이 장치다(그중 하나는 결국 존재하지 않는 것으로 드러난다). 본 보고서는 고정 커밋에서 컨트랙트 소스를 직접 읽고, 주변 스킴 명세와 Foundry 테스트 스위트를 교차 검증하며, Permit2 메커니즘은 Uniswap 공식 문서로 대조한다.[^s01][^s02][^s03][^s11][^s12][^s13][^s15][^s16]

범위 주: EVM의 `exact` 스킴은 EIP-3009와 ERC-7710(스마트 계정 위임) 전송 방식도 정의한다. 이 경로들은 본 분석 대상 네 파일과 무관하며, Permit2 프록시 경로가 *왜* 존재하는지에 대한 맥락으로만 다룬다.[^s06]

## 2. 배경: Permit2와 위트니스 패턴

Permit2는 Uniswap의 독립형 승인/전송 컨트랙트로 단일 정규 주소에 배포되어 있다. 그 *SignatureTransfer* 모듈은 스펜더에 대한 상시 ERC-20 허용량 없이 서명으로 인가된 일회성 토큰 이동을 수행한다. 토큰 소유자가 Permit2를 한 번 승인한 뒤, 전송마다 메시지에 서명하면 Permit2가 이를 검증하고 실행한다.[^s15][^s16] x402에 중요한 두 가지 특성이 있다.

**비순차 논스(unordered nonce).** Permit2는 비단조 비트맵 기반 논스를 쓴다. 논스는 워드 위치와 비트를 인코딩하므로 서명을 순서에 구애받지 않고 사용·무효화할 수 있다.[^s04][^s15] x402의 `upto` 스킴은 단일 사용 보장을 위해 정확히 이것에 의존하며 — "EVM에서는 Permit2의 논스 메커니즘이 이를 강제한다" — 따라서 프록시는 자체 리플레이 기록을 둘 필요가 없다.[^s07]

**위트니스.** x402가 사용하는 함수는 `permitWitnessTransferFrom`으로, 서명 전송에 임의의 호출자 제공 데이터(*위트니스*)와 그 EIP-712 타입을 선언하는 `witnessTypeString`을 더한다. 서명자는 그 추가 데이터에 약정하며, 요청 전송 금액이 서명된 최대치를 초과하면 호출은 리버트된다.[^s04][^s16] Uniswap은 위트니스를 "서명 데이터를 재구성하고 선택적으로 추가 맥락을 검증하는 데 쓰이는 임의의 서명 데이터"로 설명하며, 타입 문자열은 "중첩 구조체의 EIP712 순서를 따라야 하고 TokenPermissions 타입 정의를 포함해야 한다"고 명시한다.[^s15][^s16]

x402는 위트니스를 이용해 핵심 신뢰 문제를 해결한다. 지불자는 **스펜더가 퍼실리테이터가 아니라 x402 프록시**이고 위트니스에 목적지 주소가 담긴 Permit2 메시지에 서명한다. 목적지가 서명된 위트니스 안에 있으므로 트랜잭션을 브로드캐스트하는 퍼실리테이터는 자금의 행선지를 바꿀 수 없다. "서명의 `spender`는 퍼실리테이터가 아니라 x402ExactPermit2Proxy다. 이 프록시는 자금이 `witness.to` 주소로만 전송되도록 강제한다."[^s06] 따라서 프록시의 역할은 좁다. 고정되고 잘 알려진 스펜더가 되어, 지불자가 서명한 그대로 위트니스 해시를 재구성하고, 전부를 Permit2에 넘기는 것이다.

## 3. 결제 스킴: exact, upto, batch-settlement

세 스킴은 가치가 *언제*, *얼마나* 이동하는지에서 갈린다.

**`exact`** 는 리소스 서버가 미리 아는 특정 금액을 전송한다 — 기사 열람 결제, 크레딧 구매, LLM의 툴 호출 결제 등.[^s05] EVM에서는 명세가 매긴 순위대로 세 가지로 구현된다: EIP-3009(권장, 가장 단순, USDC 같은 토큰용), Permit2 + 프록시(임의 ERC-20을 위한 *범용 폴백*), ERC-7710(스마트 계정 위임). 방식이 지정되지 않으면 구현은 EIP-3009을, 그다음 Permit2를 우선한다.[^s06] Permit2 경로만이 `x402ExactPermit2Proxy`를 사용한다.

**`upto`** 는 *최대치*를 인가하고 정산 시점에 리소스 소비량으로 결정되는 *실제* 금액을 정산한다 — 토큰당 과금 LLM 출력, 종량 대역폭, 동적 컴퓨트.[^s07] 구조상 Permit2 전용이다. EIP-3009은 "서명 시점에 정확한 금액을 요구하므로 `upto` 스킴에서는 지원되지 않는다."[^s08] `upto`의 두 가지 성질을 떼어 볼 만하다:

- *위상 의존적 `amount`.* 동일한 `PaymentRequirements.amount` 필드가 검증 시점에는 **최대치**를, 정산 시점에는 **실제 정산 금액**을 뜻한다. 정산 금액은 인가된 최대치 이하여야 하고 **0일 수도 있다**(사용되지 않은 인가는 온체인 트랜잭션 없이 그대로 만료).[^s07][^s08]
- *퍼실리테이터 결박.* 서버가 자기 주소를 알리면 클라이언트는 그것을 `witness.facilitator`에 넣어야 하며, 이는 "인가를 특정 퍼실리테이터에 결박하여 다른 당사자에 의한 무단 정산을 방지한다."[^s08]

**`batch-settlement`** 는 범주가 다르다. "커밋먼트가 수락되고 접근이 즉시 허용되며, 금융 정산은 네트워크 바인딩이 정의하는 절차를 통해 나중에 일어난다."[^s09] `exact`/`upto`와 달리 정산은 "전송을 실행하는 대신 [커밋먼트를] 저장"하고 트랜잭션 해시 대신 커밋먼트 식별자를 반환하며, 가치는 바인딩의 상환(redemption) 절차를 통해 나중에 움직인다.[^s09] 명세는 두 신뢰 모델을 정의한다 — *자본 담보(capital-backed)*(에스크로, 결제 채널, 위임된 지갑 인가)와 *신용 담보(credit-backed)*(네트워크 중개자가 청구 신원을 근거로 인수).[^s09] 유일하게 출시된 바인딩 `cloudflare:402`는 신용 담보형으로, HTTP Message Signatures(RFC 9421)로 커밋먼트를 인증하고 접근을 즉시 허용하며 Cloudflare가 **Merchant of Record**로서 서명 에이전트의 신원에 청구하고 주기적으로 오프체인 정산한다.[^s10]

이것이 스킴→컨트랙트 매핑이 비대칭인 이유다. `exact`와 `upto`는 각각 온체인 프록시에 대응하지만, `batch-settlement`는 오프체인(또는 네트워크 정의) 인프라에 대응하며 고정 커밋 기준으로 EVM 컨트랙트를 전혀 출시하지 않는다.

## 4. 컨트랙트 코드 분석

### 4.1 `x402BasePermit2Proxy` — 공유 베이스

`x402BasePermit2Proxy`는 OpenZeppelin의 `ReentrancyGuard`를 상속한 `abstract contract`다. Permit2 주소를 생성자에서 한 번 설정되는 `immutable`로 저장하며 영주소면 `InvalidPermit2Address`로 리버트한다. NatSpec은 이 불변성이 의도적이라고 설명한다 — "배포 후 초기화 경합을 제거"하고, 모든 체인에서 동일한 정규 Permit2 인자를 사용하면 "initCode가 동일하게 유지되어 CREATE2 주소 결정성이 보존된다."[^s01]

베이스는 자식들이 조합하는 두 내부 헬퍼를 제공한다:

- **`_settle(...)`** 는 공통 검증과 실제 Permit2 호출을 수행한다. `settlementAmount == 0`(`InvalidAmount`), `owner == address(0)`(`InvalidOwner`), `to == address(0)`(`InvalidDestination`), `block.timestamp < validAfter`(`PaymentTooEarly`)면 리버트한다. 이어 `SignatureTransferDetails{to, requestedAmount: settlementAmount}`를 만들어 `PERMIT2.permitWitnessTransferFrom(permit, transferDetails, owner, witnessHash, witnessTypeString, signature)`를 호출한다. 중요한 점은 `witnessHash`와 `witnessTypeString`을 **자식**이 계산한다는 것 — 베이스는 위트니스 형태에 무관하다.[^s01] 상한 시간은 여기서 재검사하지 않고 Permit2의 `deadline`에 위임한다(테스트 주석: "validBefore는 제거됨 - 상한 시간은 Permit2의 deadline으로 강제").[^s12]

- **`_executePermit(...)`** 는 완전 가스리스 EIP-2612 흐름을 지원한다. 먼저 EIP-2612 `value`가 Permit2 허용 금액과 같기를 요구하며 아니면 `Permit2612AmountMismatch`로 리버트한다 — 지불자가 Permit2에 부여하는 승인과 Permit2가 이동 가능하다고 통보받는 금액 사이의 불일치를 방지한다.[^s01] 이어 `IERC20Permit(token).permit(owner, address(PERMIT2), ...)`을 `try/catch` 안에서 호출하여 `Error(string)`, `Panic(uint256)`, 원시 `bytes`를 잡아 리버트 대신 `EIP2612PermitFailedWith{Reason,Panic,Data}`를 발행한다. 설계 근거는 명시적이다. "승인이 이미 존재하거나 토큰이 EIP-2612를 지원하지 않을 수 있으므로 실제 permit 호출은 실패 시 리버트하지 않는다."[^s01] Foundry 테스트가 양면을 모두 확인한다 — permit이 리버트해도 정산은 성공하며(`test_settleWithPermit_succeedsWhenPermitFails`), 각 리버트 유형마다 대응하는 실패 이벤트가 발행된다.[^s12]

베이스는 또한 `EIP2612Permit` 구조체(value, deadline, r, s, v)와 `Settled`/`SettledWithPermit` 이벤트를 정의한다.[^s01]

### 4.2 `x402ExactPermit2Proxy` — 고정 금액 전송

exact 프록시는 얇은 구체 자식이다. 위트니스는 `Witness{address to; uint256 validAfter}`이고 타입 문자열은 `"Witness witness)TokenPermissions(address token,uint256 amount)Witness(address to,uint256 validAfter)"`이다.[^s02] `settle(permit, owner, witness, signature)`는 `witnessHash = keccak256(abi.encode(WITNESS_TYPEHASH, witness.to, witness.validAfter))`를 계산하고, 정산 금액을 **`permit.permitted.amount`** 로 고정해 `_settle`을 호출한다 — 즉 항상 허용된 전액을 전송하며 이는 "EIP-3009의 `transferWithAuthorization` 동작과 유사"하다.[^s02] 테스트 `test_settle_transfersExactPermittedAmount`와 테스트 하네스의 단출한 `Witness{to, validAfter}` 생성자가 정확 금액 동작과 facilitator 필드의 부재를 모두 확인한다.[^s13] `settleWithPermit(...)`은 먼저 `_executePermit`으로 EIP-2612 승인을 제출하는 점만 다르다. 두 함수 모두 `nonReentrant`다.[^s02]

특기할 점은 exact 프록시가 **호출자 제한을 두지 않는다**는 것이다. 유효한 `settle`은 누구나 브로드캐스트할 수 있다. 이는 *자금 탈취*에 대해서는 안전하다 — 목적지와 금액이 서명으로 고정되어 임의 호출자가 결제를 재지정하거나 부풀릴 수 없다. 그러나 정산 *선점(preemption)* 에는 안전하지 않다. 서명된 인가를 가진 누구나 제출할 수 있으므로, 공격자가 정당한 퍼실리테이터를 프런트런하여 Permit2 논스를 소진할 수 있으며, 독립적 보안 연구는 이를 구조적 결함으로 규정한다("정산 경로가 퍼실리테이터 신원을 인가에 결박하지 않는다").[^s17] `upto` 프록시의 `facilitator` 필드가 바로 이 부류의 공격에 대한 완화책이며(§4.3, §5), exact 프록시에는 대응물이 없어 선점 가능하다. _(이는 설계 공백에 대한 독립 연구자의 프레이밍으로, §6에서 더 다룬다.)_

### 4.3 `x402UptoPermit2Proxy` — 가변 금액 전송

upto 프록시는 구조는 비슷하되 가변성과 접근 제어를 더한다. 위트니스는 `Witness{address to; address facilitator; uint256 validAfter}`이고 타입 문자열은 `"...Witness(address to,address facilitator,uint256 validAfter)"`이다.[^s03] `settle`은 호출자 제공 **`amount`** 를 추가로 받고 정산 전 두 가드를 강제한다:

```solidity
if (amount > permit.permitted.amount) revert AmountExceedsPermitted();
if (msg.sender != witness.facilitator) revert UnauthorizedFacilitator();
```

이어 `facilitator`를 위트니스 해시에 포함하고(`keccak256(abi.encode(WITNESS_TYPEHASH, witness.to, witness.facilitator, witness.validAfter))`) 호출자의 `amount`로 `_settle`을 호출한다.[^s03] 따라서 퍼실리테이터는 정산 시점에 최종 금액을 고르되 지불자가 서명한 두 한계 안에서만 가능하다. 허용 최대치를 초과할 수 없고(Permit2 자체도 독립적으로 강제[^s04]), 지불자가 `facilitator`로 지정한 바로 그 주소만 호출할 수 있다. 테스트 스위트가 이 모두를 검증한다. 부분 금액 성공(`test_settle_allowsPartialAmount`, `testFuzz_settle_partialAmountsSucceed`), 초과 금액 리버트(`testFuzz_settle_amountNeverExceedsPermitted`), 지정 퍼실리테이터가 아닌 공격자의 `UnauthorizedFacilitator` 리버트.[^s12] `settleWithPermit`은 같은 두 가드에 EIP-2612 단계를 더한다.[^s03]

`facilitator` 필드가 `exact`와의 핵심 설계 차이다. upto 퍼실리테이터는 금액 재량을 가지므로, 프로토콜은 그 재량을 행사할 *수 있는 자*를 서명된 단일 주소로 제한한다 — exact 프록시는 필요도 없고 갖지도 않는 제한이다.[^s02][^s03][^s08]

### 4.4 "존재하지 않는" `x402BatchSettlement.sol`

네 번째로 요청된 파일 `x402BatchSettlement.sol`은 고정 커밋의 `contracts/evm/src`에 **존재하지 않는다**. 디렉터리에는 정확히 `x402BasePermit2Proxy.sol`, `x402ExactPermit2Proxy.sol`, `x402UptoPermit2Proxy.sol`, `interfaces/ISignatureTransfer.sol`, `mocks/MockGenericERC20.sol`가 들어 있다.[^s01][^s02][^s03] "배치 정산"은 실재하지만 `specs/schemes/batch-settlement/` 아래 두 개의 Markdown 명세 — 추상 스킴과 `cloudflare:402` 바인딩 — 로 존재하며, 둘 다 EVM 컨트랙트를 참조하지 않는다.[^s09][^s10] 이는 내부적으로 일관된다. 이 스킴의 전제 자체가 가치가 *동기적 요청 경로 밖에서 나중에* 움직인다는 것이므로, 신용 담보형 Cloudflare 바인딩은 온체인 정산 컨트랙트가 필요 없고 대신 RFC 9421 HTTP Message Signatures와 오프체인 청구를 쓴다.[^s09][^s10] 향후 *자본 담보형* 바인딩(에스크로 또는 결제 채널)은 EVM 컨트랙트를 도입할 수 있으나 현재 출시된 것은 없다.

## 5. 보안 성질과 위협 모델

컨트랙트와 README의 보안 절을 함께 읽으면 간결한 위협 모델이 나온다.[^s01][^s02][^s03][^s11]

- **목적지 무결성.** 위트니스가 `to`를 지불자 서명에 결박하므로 악의적이거나 탈취된 퍼실리테이터도 자금을 재지정할 수 없다. README는 위트니스 패턴이 "payTo 주소를 강제한다"고 하고, 명세는 이를 프록시의 핵심 목적으로 꼽는다.[^s06][^s11]
- **호출자 무결성(upto 한정).** `facilitator` 필드와 `msg.sender != witness.facilitator` 검사가 제3자가 타인의 upto 인가를 임의 금액으로 정산하는 것을 막는다.[^s03][^s08]
- **무수탁.** 토큰은 Permit2를 통해 `owner`에서 `witness.to`로 직접 이동하며 프록시는 잔액을 갖지 않는다. README는 "컨트랙트는 토큰을 보유하지 않는다"고 단언하고, `test_settle_proxyNeverHoldsTokens`가 정산 후 프록시 잔액이 0임을 확인한다.[^s11][^s12]
- **불변성과 재진입.** "업그레이드 메커니즘 없음, 소유자 없음, 관리자 함수 없음"; 모든 외부 settle 함수가 `nonReentrant`이고, 악성 재진입 목 Permit2로 구동되는 `test_settle_blocksReentrancy`가 가드 작동을 확인한다.[^s11][^s12]
- **리플레이/단일 사용.** 프록시가 아니라 Permit2의 비순차 논스가 제공한다. 각 인가는 최대 한 번만 정산된다.[^s07][^s15]
- **금액 안전, 이중으로.** upto 프록시가 `amount <= permit.permitted.amount`를 검사하고, Permit2의 `permitWitnessTransferFrom`도 요청 금액이 서명 허용치를 넘으면 독립적으로 리버트한다 — 심층 방어.[^s03][^s04][^s16]
- **시간 한계.** 하한 `validAfter`는 `_settle`에서 강제(`PaymentTooEarly`), 상한은 Permit2의 `deadline`.[^s01][^s12]
- **EIP-2612 견고성.** 비리버트 try/catch 덕에 중복·기존·미지원 permit이 유효한 정산을 망가뜨리지 못하고, `value == permittedAmount` 사전 검사가 과소·과대 범위 승인을 막는다.[^s01][^s12]
- **교차 체인 결정성.** 프록시는 Arachnid의 CREATE2 디플로이어로 모든 EVM 체인에서 동일 주소를 노린다. 이는 바이트 동일 initCode를 요구하며, `foundry.toml`이 `cbor_metadata = false`와 `bytecode_hash = "none"`을 설정해 컴파일러가 환경 의존적 IPFS 메타데이터 해시를 덧붙여 주소 결정성을 깨뜨리지 않게 한다.[^s01][^s11][^s14]

잔여 신뢰 가정: 통합자는 Permit2와 프록시의 정확성을 상속하며, `upto` 지불자는 서버가 공정히 청구하리라 신뢰한다(§6).

## 6. 논의

**왜 프록시가 하나가 아니라 둘인가.** 위트니스 형태가 다르고(`{to, validAfter}` 대 `{to, facilitator, validAfter}`), 이는 EIP-712 타입 해시와 따라서 서명 도메인을 바꾼다. 검증과 Permit2 배관을 추상 베이스에서 공유하면서 위트니스는 각 자식이 소유하게 한 것은 깔끔한 분리다. 베이스가 위트니스 레이아웃을 가정하지 않으므로 새 스킴을 정산 코어를 건드리지 않고 또 하나의 자식으로 추가할 수 있다.[^s01][^s02][^s03]

**`upto`의 신뢰 비대칭.** `upto`는 신뢰 보장을 유연성과 의도적으로 맞바꾼다. 컨트랙트는 서버가 서명된 최대치를 넘거나 다른 수취인에게 지불할 수 없음을 보장하지만, 최대치 *이내*에서 서버의 청구는 재량이다. 명세는 솔직하다. 클라이언트는 "전액이 청구될 위험을 감수"하며 "악성 서버는 실제 사용량과 무관하게 `amount`까지 청구할 수 있다." _(이는 명세 자체가 명시한 위험 프레이밍이며 악용된 버그가 아니다.)_[^s07] 빠듯한 최대치 설정이 클라이언트의 유일한 온체인 보호책이다.

**의존성 상속.** exact-EVM 명세는 "통합자는 [Permit2와 프록시의] 보안 성질과 향후 발견될 취약점을 상속한다"고 분명히 밝히고, 코드 주석은 현재 위트니스를 *감사 후(post-audit)* 형태로 표시한다("post-audit: extra removed from Witness").[^s06] 즉 감사가 이루어져 설계가 바뀌었으나 감사 보고서 자체는 본 리뷰에서 확보되지 않았다. 따라서 *코드 동작*은 소스로 검증되지만 감사 *결과*는 벤더 진술이다. _(vendor-stated)_[^s06]

**빌드 결정성 주의.** 교차 체인 주소 동일성은 취약하다. README는 **Exact** 프록시가 메타데이터 수정 이전에 배포되어 원래 주소를 재현하려 *사전 빌드된* `exact-proxy-initcode.hex`를 출시하는 반면, **Upto**는 메타데이터를 끈 채 소스에서 컴파일됨을 문서화한다.[^s11] 나아가 *다른* 주소에 다른(CBOR 메타데이터) 바이트코드를 가진 **레거시 Base Sepolia Upto** 배포를 표시하며, 이는 정규 `0x4020a4f3…0002`로 대체되었다.[^s11] 정규 주소는 `0x402085c248EeA27D92E8b30b2C58ed07f9E20001`(Exact)과 `0x4020a4f3b7b90CCA423b9FabCC0CE57c6c240002`(Upto)다. _(출처마다 Upto 주소의 체크섬 대소문자 표기가 다르지만 동일한 주소다.)_[^s08][^s11]

**반대 증거: 정산 선점과 리플레이.** 독립 프리프린트 *Five Attacks on x402*는 더 넓은 x402 정산 모델이 이 컨트랙트들과 직결되는 구조적 약점을 가진다고 주장한다.[^s17] 그 Attack I-B(무단 정산 선점)는 "정산 경로가 퍼실리테이터 신원을 인가에 결박하지 않는다"고 관찰한다. EIP-3009과 *exact* Permit2 경로에서는 서명된 인가를 관측한 누구나 전송을 제출하여 정당한 퍼실리테이터와 경쟁하고 논스를 소진해 정직한 정산을 나중에 실패시킬 수 있다.[^s17] 이것이 공격자가 자금을 훔치게 하지는 않으나 — 위트니스가 여전히 목적지를 고정한다 — 그리핑을 가능케 하고 퍼실리테이터의 배타적 정산 기대를 깨뜨린다. `upto` 프록시의 `msg.sender == witness.facilitator` 검사가 바로 이 논문이 빠졌다고 지적하는 결박이므로, `upto`는 I-B에 대해 강화되어 있고 `exact`는 그렇지 않다. 따라서 본 보고서는 exact 프록시의 개방형 호출자를 무조건적 안전 성질이 아니라 의도적이되 논쟁적인 절충으로 다룬다. 논문의 Attack II(리플레이/멱등성)는 이 컨트랙트 밖의 HTTP 계층 문제다. Permit2 논스가 "한 번의 정산"을 강제하지만, "서버가 서비스 제공 전에 (pay_id, resource_id)를 원자적으로 청구하지 않는 한 리플레이는 직접적인 결제-서비스 실패가 된다"는 것이 웹 경계에서의 문제다.[^s17] 이들은 확인된 온체인 코드 익스플로잇이 아니라 연구자가 제시한 공격 모델이지만, 실재하는 반대 분석으로서 위의 보안 서사를 한정한다. _(독립 프리프린트)_

**독립적 교차 검증.** 프록시가 의존하는 Permit2 메커니즘 — 위트니스 결박 서명 전송, 비순차 논스, 초과 금액 리버트 — 은 x402 프로젝트와 독립적으로 Uniswap 공식 개발자 문서와 인터페이스 소스에 동일하게 기술되어 있어, 본 분석에서 x402 자체 서술이 아니라 Permit2 동작에 기대는 부분의 신뢰도를 높인다.[^s15][^s16]

## 7. 한계

본 분석은 주로 단일 저장소를 한 고정 커밋(`coinbase/x402@dd927a2`)에서 읽은 것에 기댄다. 구체적 한계:

- **감사 보고서 부재.** 프록시는 감사받았다고 기술되고 감사 후 변경이 언급되지만, 감사 문서는 확보·열람되지 않았다. 감사 결론은 프로젝트의 진술을 따른 것이다.[^s06]
- **라이브 바이트코드 미검증.** 정규 주소와 결정적 배포 서사는 저장소와 설정에서 온 것으로, RPC/익스플로러로 Base 등 체인의 배포 바이트코드를 읽지 않았다. 따라서 교차 체인 동일성은 *의도와 설정*으로 검증된 것이지 관측된 온체인 사실이 아니다.[^s11][^s14]
- **대부분 1차(자체) 출처.** Uniswap Permit2 문서(독립)를 제외하면 스킴·컨트랙트 주장은 1차 출처다. x402는 벤더 주도의 빠르게 움직이는 프로토콜이며, 위트니스 형태·스킴 이름·주소는 이 커밋 이후 바뀔 수 있다. 이미 대체된 레거시 Upto 배포가 표면이 한 번 변동했다는 증거다.[^s11]
- **시점 의존적 부재.** "`x402BatchSettlement.sol` 없음"은 `dd927a2` 기준의 사실이며, 향후 자본 담보형 배치 정산 바인딩이 EVM 컨트랙트를 추가할 수 있다.[^s09]
- **공격 모델은 연구자 진술.** §6의 선점·리플레이 약점은 프리프린트의 위협 분석(s17)에서 온 것이지 이 특정 컨트랙트에 대해 재현된 온체인 익스플로잇이 아니다. 확정된 취약점이 아니라 검토해야 할 설계 비판으로 읽어야 한다.[^s17]
