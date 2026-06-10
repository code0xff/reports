# x402 EVM 정산 컨트랙트와 결제 스킴: Permit2 프록시와 배치 정산

## 초록

x402는 HTTP 네이티브 결제 프로토콜로, 리소스 서버가 요청에 HTTP 402로 응답하면 클라이언트가 암호학적으로 서명한 결제 인가를 돌려주고, **퍼실리테이터(facilitator)** 가 가스를 대신 부담하며 그 결과로 발생하는 온체인 정산을 브로드캐스트한다.[^s06][^s08] EVM 체인에서 네이티브 `transferWithAuthorization`을 지원하지 않는 ERC-20 토큰의 정산은 일군의 x402 자체 컨트랙트가 담당한다. 본 보고서는 요청에 명시된 네 개의 파일 — `x402BasePermit2Proxy.sol`, `x402ExactPermit2Proxy.sol`, `x402UptoPermit2Proxy.sol`, `x402BatchSettlement.sol` — 을 분석하며, 본 보고서의 이전 개정판이 내린 한 결론을 바로잡는다. **네 컨트랙트가 모두 이제 존재한다.** `coinbase/x402` 커밋 `dd927a2`(2026-04-21)에 고정한 초기 분석은 세 개의 Permit2 프록시만 발견하고 `x402BatchSettlement.sol`은 부재한다고 보고했다. 그 이후 정규 저장소가 `x402-foundation/x402`로 이전되었고(coinbase/x402는 이제 `dd927a2`에 멈춘 development fork다), foundation 트리의 커밋 `dc656bb`(2026-06-09)는 실재하는 `x402BatchSettlement.sol` — **상태 비저장(stateless) 단방향 결제 채널** 컨트랙트 — 과 `ERC3009DepositCollector`, `Permit2DepositCollector`를 출시하며, 셋 모두 Base·Arbitrum·World Chain·Polygon 메인넷의 정규 CREATE2 주소에 배포되어 있다.[^s18][^s19][^s22][^s25] 세 Permit2 프록시는 하나의 설계를 공유한다. 즉 퍼실리테이터가 아니라 프록시가 인가된 Permit2 *스펜더(spender)* 이며, Uniswap Permit2의 "위트니스(witness)" 패턴이 결제 목적지를 지불자의 서명 안에 암호학적으로 결박하여 퍼실리테이터가 브로드캐스트는 하되 자금을 가로채지는 못하게 한다.[^s01][^s06][^s15] `exact` 프록시는 항상 허용된 전액을 전송하고, `upto` 프록시는 인가된 퍼실리테이터가 서명된 최대치 이내에서 임의 금액을 전송하도록 허용하며 호출자 인가를 위해 위트니스에 `facilitator` 필드를 추가한다.[^s02][^s03] `x402BatchSettlement`는 **자본 담보(capital-backed)** 배치 정산 바인딩을 구현한다. 클라이언트가 온체인 에스크로 채널에 한 번 입금하고 오프체인 *누적 바우처(cumulative voucher)* 에 서명하면, 서버가 이를 온체인에서 일괄 청구하고 정산된 자금을 한 번의 전송으로 일괄 인출한다.[^s19][^s22] Permit2 프록시는 수탁을 하지 않고 불변이며, 배치 컨트랙트는 채널별 회계와 시한부 인출(timed-withdrawal) 탈출구 아래 에스크로 입금을 수탁한다. 모두 CREATE2를 통해 모든 EVM 체인에서 동일한 주소로 배포되도록 설계되었다.[^s11][^s19][^s25]

## 1. 서론

x402는 오랫동안 사용되지 않던 HTTP `402 Payment Required` 상태 코드를 머신이 결제 가능한 웹 리소스의 기반으로 되살린다. 요청마다 결제해야 하는 자율 에이전트의 등장으로 이 활용은 한층 첨예해졌다. 프로토콜의 역할 분담은 스킴 문서 전반에서 일관된다. **클라이언트**가 인가에 서명하고, **리소스 서버**가 청구액을 정하며, **퍼실리테이터**가 인가를 검증하고 정산 트랜잭션을 브로드캐스트하면서 가스를 부담해 지불자 입장에서는 가스리스(gasless)가 된다.[^s06][^s08] 퍼실리테이터는 신뢰받는 수탁자가 아니라 명시적으로 브로드캐스터일 뿐이다. "퍼실리테이터는 금액이나 목적지를 변경할 수 없다. 그들은 트랜잭션 브로드캐스터 역할만 한다."[^s06]

이 보장은 서명된 인가 자체가 수취인과 금액을 명시하는 EIP-3009 `transferWithAuthorization` 지원 토큰(예: USDC)에서는 자명하다. 어려운 경우는 그런 훅이 없는 임의의 ERC-20이다. x402의 해법은 그러한 결제를 **Uniswap Permit2**와, "스펜더" 자리를 차지하는 얇은 x402 자체 프록시를 통해 라우팅하는 것이다.[^s06] 본 요청의 네 파일이 바로 이 장치다 — 세 개의 Permit2 프록시와 배치 정산 컨트랙트.

**출처와 저장소 이전에 관한 주.** 본 보고서의 이전 개정판은 이 컨트랙트들을 `coinbase/x402@dd927a2`(2026-04-21)에서 읽고, 그 커밋 기준으로 정확하게도 `x402BatchSettlement.sol`이 존재하지 않는다고 보고했다 — 당시 배치 정산은 신용 담보형 Cloudflare 바인딩만 가진 스킴 명세로만 출시되어 있었다. 그 이후 프로젝트가 이전되었다. coinbase/x402의 README 자체가 "x402 저장소를 x402 Foundation 저장소 아래로 이전했다… [coinbase/x402는] 이제 development fork다"라고 밝히며, 그 fork의 `main`은 `dd927a2`에 멈춰 있다.[^s18] 정규 트리는 이제 `x402-foundation/x402`이며, 그 커밋 `dc656bb`(2026-06-09)가 배치 정산 컨트랙트, 두 개의 입금 콜렉터, 전용 EVM 스킴 바인딩, 테스트, 배포를 추가한다.[^s19][^s22][^s25] 따라서 본 보고서는 세 Permit2 프록시를 원래의 `dd927a2` 핀에서(코드는 실질적으로 변경되지 않았다), 배치 정산 장치를 `x402-foundation/x402@dc656bb`에서 읽으며, Permit2 메커니즘은 Uniswap 공식 문서로 대조한다.[^s01][^s02][^s03][^s11][^s12][^s13][^s15][^s16][^s19][^s22][^s24] 두 핀 사이에서 정규 주소가 바뀐 경우는 명시적으로 표시한다(§6).

범위 주: EVM의 `exact` 스킴은 EIP-3009와 ERC-7710(스마트 계정 위임) 전송 방식도 정의한다. 이 경로들은 본 분석 대상 컨트랙트와 무관하며, Permit2 프록시 경로가 *왜* 존재하는지에 대한 맥락으로만 다룬다.[^s06]

## 2. 배경: Permit2와 위트니스 패턴

Permit2는 Uniswap의 독립형 승인/전송 컨트랙트로 단일 정규 주소에 배포되어 있다. 그 *SignatureTransfer* 모듈은 스펜더에 대한 상시 ERC-20 허용량 없이 서명으로 인가된 일회성 토큰 이동을 수행한다. 토큰 소유자가 Permit2를 한 번 승인한 뒤, 전송마다 메시지에 서명하면 Permit2가 이를 검증하고 실행한다.[^s15][^s16] x402에 중요한 두 가지 특성이 있다.

**비순차 논스(unordered nonce).** Permit2는 비단조 비트맵 기반 논스를 쓴다. 논스는 워드 위치와 비트를 인코딩하므로 서명을 순서에 구애받지 않고 사용·무효화할 수 있다.[^s04][^s15] x402의 `upto` 스킴은 단일 사용 보장을 위해 정확히 이것에 의존하며 — "EVM에서는 Permit2의 논스 메커니즘이 이를 강제한다" — 따라서 프록시는 자체 리플레이 기록을 둘 필요가 없다.[^s07]

**위트니스.** x402가 사용하는 함수는 `permitWitnessTransferFrom`으로, 서명 전송에 임의의 호출자 제공 데이터(*위트니스*)와 그 EIP-712 타입을 선언하는 `witnessTypeString`을 더한다. 서명자는 그 추가 데이터에 약정하며, 요청 전송 금액이 서명된 최대치를 초과하면 호출은 리버트된다.[^s04][^s16] Uniswap은 위트니스를 "서명 데이터를 재구성하고 선택적으로 추가 맥락을 검증하는 데 쓰이는 임의의 서명 데이터"로 설명하며, 타입 문자열은 "중첩 구조체의 EIP712 순서를 따라야 하고 TokenPermissions 타입 정의를 포함해야 한다"고 명시한다.[^s15][^s16]

x402는 위트니스를 이용해 핵심 신뢰 문제를 해결한다. 지불자는 **스펜더가 퍼실리테이터가 아니라 x402 프록시**이고 위트니스에 목적지 주소가 담긴 Permit2 메시지에 서명한다. 목적지가 서명된 위트니스 안에 있으므로 트랜잭션을 브로드캐스트하는 퍼실리테이터는 자금의 행선지를 바꿀 수 없다. "서명의 `spender`는 퍼실리테이터가 아니라 x402ExactPermit2Proxy다. 이 프록시는 자금이 `witness.to` 주소로만 전송되도록 강제한다."[^s06] 따라서 프록시의 역할은 좁다. 고정되고 잘 알려진 스펜더가 되어, 지불자가 서명한 그대로 위트니스 해시를 재구성하고, 전부를 Permit2에 넘기는 것이다. 배치 정산 컨트랙트는 입금 경로에서 동일한 위트니스 결박 Permit2 전송을 재사용한다(§4.5).[^s21]

## 3. 결제 스킴: exact, upto, batch-settlement

세 스킴은 가치가 *언제*, *얼마나* 이동하는지에서 갈린다.

**`exact`** 는 리소스 서버가 미리 아는 특정 금액을 전송한다 — 기사 열람 결제, 크레딧 구매, LLM의 툴 호출 결제 등.[^s05] EVM에서는 명세가 매긴 순위대로 세 가지로 구현된다: EIP-3009(권장, 가장 단순, USDC 같은 토큰용), Permit2 + 프록시(임의 ERC-20을 위한 *범용 폴백*), ERC-7710(스마트 계정 위임). 방식이 지정되지 않으면 구현은 EIP-3009을, 그다음 Permit2를 우선한다.[^s06] Permit2 경로만이 `x402ExactPermit2Proxy`를 사용한다.

**`upto`** 는 *최대치*를 인가하고 정산 시점에 리소스 소비량으로 결정되는 *실제* 금액을 정산한다 — 토큰당 과금 LLM 출력, 종량 대역폭, 동적 컴퓨트.[^s07] 구조상 Permit2 전용이다. EIP-3009은 "서명 시점에 정확한 금액을 요구하므로 `upto` 스킴에서는 지원되지 않는다."[^s08] `upto`의 두 가지 성질을 떼어 볼 만하다:

- *위상 의존적 `amount`.* 동일한 `PaymentRequirements.amount` 필드가 검증 시점에는 **최대치**를, 정산 시점에는 **실제 정산 금액**을 뜻한다. 정산 금액은 인가된 최대치 이하여야 하고 **0일 수도 있다**(사용되지 않은 인가는 온체인 트랜잭션 없이 그대로 만료).[^s07][^s08]
- *퍼실리테이터 결박.* 서버가 자기 주소를 알리면 클라이언트는 그것을 `witness.facilitator`에 넣어야 하며, 이는 "인가를 특정 퍼실리테이터에 결박하여 다른 당사자에 의한 무단 정산을 방지한다."[^s08]

**`batch-settlement`** 는 범주가 다르다. "커밋먼트가 수락되고 접근이 즉시 허용되며, 금융 정산은 네트워크 바인딩이 정의하는 절차를 통해 나중에 일어난다."[^s09] `exact`/`upto`와 달리 동기적 정산 단계는 "전송을 실행하는 대신 [커밋먼트를] 저장"하고 트랜잭션 해시 대신 커밋먼트 식별자를 반환하며, 가치는 바인딩의 상환(redemption) 절차를 통해 나중에 움직인다.[^s09] 명세는 두 신뢰 모델을 정의하며, **이제 둘 다 출시되었다**:

- *신용 담보(credit-backed)* — `cloudflare:402` 바인딩은 HTTP Message Signatures(RFC 9421)로 커밋먼트를 인증하고 접근을 즉시 허용하며 Cloudflare가 **Merchant of Record**로서 서명 에이전트의 신원에 청구하고 주기적으로 오프체인 정산한다. EVM 컨트랙트가 필요 없다.[^s10]
- *자본 담보(capital-backed)* — **EVM 바인딩**은 "고처리량·저비용 결제를 위한 상태 비저장 단방향 결제 채널"을 사용한다. "클라이언트가 온체인 채널에 한 번 입금하고 요청마다 오프체인 누적 바우처에 서명하면, 서버는 빠른 서명 검증으로 바우처를 확인하고 이를 주기적으로 온체인에서 일괄 청구한다." 이 바인딩은 `x402BatchSettlement` 컨트랙트가 구현한다.[^s22]

따라서 이전 개정판에서 비대칭이던 스킴→컨트랙트 매핑은 이제 균일해졌다. `exact` → `x402ExactPermit2Proxy`, `upto` → `x402UptoPermit2Proxy`, `batch-settlement` → `x402BatchSettlement`(자본 담보 EVM 바인딩) 또는 오프체인 인프라(신용 담보 Cloudflare 바인딩).[^s06][^s08][^s19][^s22]

## 4. 컨트랙트 코드 분석

### 4.1 `x402BasePermit2Proxy` — 공유 프록시 베이스

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

### 4.4 `x402BatchSettlement` — 결제 채널 컨트랙트

네 번째 파일은 foundation 트리에 실재하며, 프록시와는 다른 종류의 컨트랙트다. 즉 수탁형·상태 저장형 **상태 비저장 단방향 결제 채널**이다(명세의 표현 "stateless"는 *오프체인 상태가 없다*는 뜻으로, 컨트랙트는 채널 슬롯을 할당하는 대신 채널 식별자를 불변 config에서 도출하고 최소한의 채널별 회계만 유지한다).[^s19][^s22] 이 컨트랙트는 `EIP712`, OpenZeppelin의 `Multicall`, 그리고 `ReentrancyGuardTransient`(EIP-1153 트랜지언트 스토리지 재진입 가드)를 상속하며, NatSpec은 "해당 opcode가 지원되는 체인에만 배포해야 한다"고 경고한다.[^s19][^s22] 구현하는 경제 모델은 자본 담보 배치 정산 바인딩이다. 한 번 입금하고, 오프체인 서명으로 요청마다 결제하며, 온체인에서 일괄 정산한다.[^s22]

**채널 식별자.** 채널은 전적으로 불변 `ChannelConfig{payer, payerAuthorizer, receiver, receiverAuthorizer, token, withdrawDelay, salt}`로 정의되며, `channelId = getChannelId(config) = _hashTypedDataV4(keccak256(abi.encode(CHANNEL_CONFIG_TYPEHASH, config)))`이다. EIP-712 해시가 config를 이 컨트랙트의 `chainId`와 주소에 결박하므로 "다른 체인이나 다른 배포에서는 동일한 config가 다른 id를 생성하여 교차 체인 채널 상태 충돌을 방지한다."[^s19] `createChannel` 호출은 없다. 채널은 첫 입금 시 암묵적으로 생성된다.[^s22]

**입금.** `deposit(config, amount, collector, collectorData)`는 config를 검증하고(영주소 아닌 `payer`/`receiver`/`receiverAuthorizer`/`token`, `MIN_WITHDRAW_DELAY = 15분` … `MAX_WITHDRAW_DELAY = 30일` 범위의 `withdrawDelay`), `ch.balance += amount`로 가산한 뒤, 플러그형 `IDepositCollector.collect(...)`를 호출해 토큰을 끌어온다. 그 풀(pull)을 잔액 검사로 감싼다 — `balAfter != balBefore + amount`면 `DepositCollectionFailed`로 리버트 — 이는 fee-on-transfer 부족분과 조용한 실패 풀을 방어한다.[^s19][^s23] 첫 입금은 `ChannelCreated`를 발행하며, 구현자 노트는 채널이 비워졌다 재충전되면 같은 `channelId`가 `ChannelCreated`를 두 번 이상 발행할 수 있으니 인덱서는 `ChannelClosed`와 짝지어야 한다고 경고한다.[^s23]

**청구와 정산 — 배칭을 저렴하게 만드는 2단계.** 수신자 측은 요청마다 토큰을 끌어오지 않는다. 대신 지불자가 *누적* 바우처(`Voucher{channel, maxClaimableAmount}`)에 서명하면, 수신자가 `claim(VoucherClaim[])` 또는 릴레이 친화적 `claimWithSignature(VoucherClaim[], authorizerSignature)`를 제출한다. 회계는 `_processVoucherClaim`에 있다. `vc.totalClaimed <= ch.totalClaimed`인 항목은 무시하고("이미 적용된 옛 바우처를 재생하면 no-op"), 서명된 `maxClaimableAmount`를 넘으면 `ClaimExceedsCeiling`, 에스크로를 넘으면 `ClaimExceedsBalance`로 리버트한 뒤, 지불자 서명을 검증하고 `ch.totalClaimed`와 수신자별 집계 `receivers[receiver][token].totalClaimed`를 전진시킨다.[^s19] 핵심은 **청구가 토큰을 전혀 이동시키지 않는다**는 것 — 회계만 갱신한다. 가치는 별도의 permissionless `settle(receiver, token)` 호출에서 움직이며, 그 `(receiver, token)` 쌍의 `totalClaimed - totalSettled`를 한 번의 ERC-20 전송으로 보내고 `totalSettled = totalClaimed`로 설정한다.[^s19] 이것이 명세가 광고하는 가스 절감의 구조적 원천이다. "단일 청구 트랜잭션이 여러 채널을 한꺼번에 처리하며 온체인 회계만 갱신하고, 청구된 자금은 이후 별도의 settle 연산이 여러 청구를 한 번의 토큰 전송으로 일괄 처리해 수신자에게 전송한다."[^s22]

**누적 단조성이 결제별 논스를 대체한다.** 각 바우처가 오직 증가하기만 하는 누적 상한을 지니므로, "낮은 상한의 옛 바우처는 자연히 대체되며" "누적 모델이 논스를 불필요하게 만든다."[^s22] 따라서 바우처의 리플레이 방어는 논스 비트맵이 아니라 구조적이다. 컨트랙트는 그저 `totalClaimed`의 감소를 거부한다.[^s19]

**이중 인가자(dual-authorizer) 서명.** `_processVoucherClaim`은 지불자의 바우처 서명을 두 방식 중 하나로 검사한다. `payerAuthorizer != address(0)`면 `payerAuthorizer`와 같아야 하는 단순 ECDSA recover를 수행한다(위임된 EOA 서명 키, RPC 불필요). `payerAuthorizer == address(0)`면 `SignatureChecker.isValidSignatureNow`로 `payer`에 대해 검증하며, 이는 온체인 호출 비용을 치르고 EIP-1271 스마트 컨트랙트 지갑을 지원한다.[^s19][^s22] `receiverAuthorizer`는 청구/환불 측에서 대칭적 역할을 하며 영주소가 아니어야 한다.[^s23]

**두 가지 출구: 협조적 환불과 시한부 인출.** 미청구 에스크로는 두 방식으로 채널을 떠날 수 있다. *협조적 환불*(수신자 측의 `refund`, 또는 `receiverAuthorizer`의 EIP-712 `Refund(channelId, nonce, amount)`를 실은 릴레이 친화적 `refundWithSignature`)은 `balance - totalClaimed`까지를 지불자에게 즉시 돌려준다. *시한부 인출*은 지불자의 일방적 탈출구다. `initiateWithdraw(config, amount)`가 창을 열고, `withdrawDelay` 경과 후 `finalizeWithdraw(config)`가 지급하되 그 시점에 남은 미청구 에스크로로 금액을 상한한다. 명세는 15분~30일 범위를 서버가 "클라이언트 자금을 무기한 가두는 것을 막으면서 서버에게 미결 바우처를 청구할 공정한 창을 주는" 장치로 설명한다.[^s19][^s22]

**환불 논스의 날카로운 모서리.** 두 환불 경로는 `_executeRefund`를 공유하며, 이는 상한 적용 **이전에** `refundNonce[channelId]`를 먼저 증가시킨다 — "`amount > 0`이지만 사용 가능한 미청구 에스크로가 0일 때(전송 없음, `Refunded` 이벤트 없음)에도 포함." 따라서 직접 `refund`는 논스를 전진시켜 이전 논스에 결박된 사전 서명 `refundWithSignature` 다이제스트를 무효화한다. 구현자 노트는 이를 명시적으로 표시한다. "'no-op'이 '논스 불변'을 뜻한다고 가정하지 말라"며 통합자는 서명 전에 라이브 `refundNonce`를 읽어야 한다.[^s19][^s23] (`amount == 0`은 논스를 올리지 않고 `ZeroRefund`로 리버트하는 유일한 경로다.)[^s19]

**컨트랙트가 온체인에서 해결하지 않는 라이브니스 경합.** `finalizeWithdraw`와 `claim`은 독립 진입점으로 둘 다 라이브 `balance`와 `totalClaimed`를 읽으며, 서명되었으나 아직 청구되지 않은 바우처에 대한 **온체인 예약이 없다**. 지불자의 `finalizeWithdraw`가 수신자의 `claim`보다 먼저 처리되면 에스크로가 줄어 이후 `claim`이 `ClaimExceedsBalance`로 리버트할 수 있다 — 수신자가 벌었으나 미청구한 가치가 소실된다.[^s19][^s23] 이는 통합자 정책으로 떠넘긴 의도적 설계다. 일찍 청구하고, 견고한 릴레이를 쓰고, 고액 채널은 하한보다 충분히 높은 `withdrawDelay`를 고른다. Foundry 스위트가 의도된 동작을 인코딩한다 — `test_finalizeWithdraw_capsIfClaimedDuringDelay`와 공격 경로 테스트 `test_initiateWithdraw_attackBypass_blocked` — 그리고 fork 테스트는 완전한 Permit2 입금→청구→정산 라이프사이클을 돌리고 변조된 위트니스가 리버트함을 단언한다.[^s23][^s24]

### 4.5 입금 콜렉터

`x402BatchSettlement`는 토큰을 에스크로로 끌어오는 방식을 하드코딩하지 않고, `collect(payer, token, amount, channelId, collectorData)` 단일 메서드를 가진 플러그형 `IDepositCollector`에 위임한다. 이 메서드는 "토큰을 반드시 `msg.sender`(호출하는 `x402BatchSettlement`)로 전송해야 한다."[^s20] 추상 `DepositCollector` 베이스는 각 콜렉터를 하나의 정산 배포에 고정하고 `collect`를 `onlyx402BatchSettlement`로 게이팅하여 "오직 `x402BatchSettlement`만 `collect`를 호출할 수 있게 하여 프런트러닝과 사용자 자금 탈취를 완화한다" — 이 가드가 없으면 공격자가 콜렉터를 직접 호출해 피해자의 사전 서명 인가를 의도치 않은 목적지로 끌어갈 수 있다.[^s20] 두 레퍼런스 콜렉터가 출시된다:

- **`ERC3009DepositCollector`** 는 USDC 같은 토큰의 가스리스 풀을 위해 ERC-3009 `receiveWithAuthorization`을 쓴다. ERC-3009은 `msg.sender == to`를 요구하므로 토큰이 콜렉터에 도착한 뒤 정산 컨트랙트로 전달되며, 인가 논스는 채널에 `keccak256(abi.encode(channelId, salt))`로 결박된다.[^s21]
- **`Permit2DepositCollector`** 는 프록시와 동일한 Permit2 위트니스 장치(§2)를 재사용한다. `DepositWitness{bytes32 channelId}`로 `permitWitnessTransferFrom`을 호출해 입금을 채널에 결박하고, 토큰을 지불자에서 정산 컨트랙트로 직접 이동하며, 베이스 프록시에서 본 것과 동일한 선택적·비리버트 EIP-2612 `permit` 단계(`value == amount` 사전 검사 포함)를 제공한다.[^s21]

`x402BatchSettlement.deposit`의 입금 후 잔액 검사(§4.4)는 정산 컨트랙트가 콜렉터의 말이 아니라 토큰 수령을 신뢰함을 뜻한다 — 미달 전송을 하는 콜렉터는 입금 전체를 리버트시킨다.[^s19][^s23]

## 5. 보안 성질과 위협 모델

컨트랙트와 그 문서를 함께 읽으면 간결한 위협 모델이 나온다. Permit2 프록시와 배치 정산 컨트랙트는 형태가 다르므로 — 프록시는 수탁 없는 통과형, 채널 컨트랙트는 에스크로 수탁형 — 성질을 따로 나열한다.

**Permit2 프록시(`exact`, `upto`).**[^s01][^s02][^s03][^s11]

- **목적지 무결성.** 위트니스가 `to`를 지불자 서명에 결박하므로 악의적이거나 탈취된 퍼실리테이터도 자금을 재지정할 수 없다. README는 위트니스 패턴이 "payTo 주소를 강제한다"고 하고, 명세는 이를 프록시의 핵심 목적으로 꼽는다.[^s06][^s11]
- **호출자 무결성(upto 한정).** `facilitator` 필드와 `msg.sender != witness.facilitator` 검사가 제3자가 타인의 upto 인가를 임의 금액으로 정산하는 것을 막는다.[^s03][^s08]
- **무수탁.** 토큰은 Permit2를 통해 `owner`에서 `witness.to`로 직접 이동하며 프록시는 잔액을 갖지 않는다. README는 "컨트랙트는 토큰을 보유하지 않는다"고 단언하고, `test_settle_proxyNeverHoldsTokens`가 정산 후 프록시 잔액이 0임을 확인한다.[^s11][^s12]
- **불변성과 재진입.** "업그레이드 메커니즘 없음, 소유자 없음, 관리자 함수 없음"; 모든 외부 settle 함수가 `nonReentrant`이고, 악성 재진입 목 Permit2로 구동되는 `test_settle_blocksReentrancy`가 가드 작동을 확인한다.[^s11][^s12]
- **리플레이/단일 사용.** 프록시가 아니라 Permit2의 비순차 논스가 제공한다. 각 인가는 최대 한 번만 정산된다.[^s07][^s15]
- **금액 안전, 이중으로.** upto 프록시가 `amount <= permit.permitted.amount`를 검사하고, Permit2의 `permitWitnessTransferFrom`도 요청 금액이 서명 허용치를 넘으면 독립적으로 리버트한다 — 심층 방어.[^s03][^s04][^s16]
- **시간 한계.** 하한 `validAfter`는 `_settle`에서 강제(`PaymentTooEarly`), 상한은 Permit2의 `deadline`.[^s01][^s12]

**배치 정산 채널(`x402BatchSettlement`).**[^s19][^s22][^s23]

- **상한 있는 수탁.** 프록시와 달리 컨트랙트는 에스크로 입금을 보유하지만, 각 채널의 자금은 `channelId`로 격리되고 수신자별 정산 집계는 청구된 금액만 지급한다. `test_crossChannel_isolation`이 한 채널이 다른 채널 잔액을 끌어올 수 없음을 확인한다.[^s19][^s24]
- **논스 없는 바우처 리플레이 방어.** 누적 `totalClaimed`는 단조이며, 더 낮은 옛 바우처는 조용한 no-op다. `Voucher`, `Refund`, `ClaimBatch`의 서로 다른 EIP-712 타입 해시가 한 연산의 서명을 다른 연산으로 재생할 수 없게 한다.[^s19][^s22]
- **서명 환불 리플레이 방어.** 채널별 `refundNonce`가 `_executeRefund` 안에서 금액 상한 이전에 전진하여 각 `refundWithSignature`를 단일 사용으로 결박한다 — §4.4에서 설명한 교차 경로 무효화 모서리를 대가로.[^s19][^s23]
- **트랜지언트 재진입 가드.** `ReentrancyGuardTransient`(EIP-1153)가 상태 변경 진입점마다 가드하며, 그 대가로 트랜지언트 스토리지가 존재하는 곳에만 안전하게 배포할 수 있다.[^s19][^s22]
- **입금 무결성.** `collect` 후 잔액 델타 검사가 fee-on-transfer·리베이싱 부족분을 거부하고, `onlyx402BatchSettlement` 콜렉터 가드가 콜렉터 직접 호출을 차단한다.[^s19][^s20][^s23]
- **잔여 위험은 안전성이 아니라 라이브니스.** 인출-대-청구 경합(§4.4)은 탈취를 야기할 수 없으나 — 지불자는 `balance - totalClaimed`를 넘겨 인출할 수 없다 — 협조적이지만 늦은 수신자가 미청구 가치를 소실하게 할 수 있다. 인출 지연 하한과 통합자 조기 청구 지침이 완화책이지 온체인 잠금이 아니다.[^s22][^s23]

**교차 체인 결정성(모든 컨트랙트).** 프록시는 Arachnid의 CREATE2 디플로이어로 모든 EVM 체인에서 동일 주소를 노린다. 이는 바이트 동일 initCode를 요구하며, `foundry.toml`이 `cbor_metadata = false`와 `bytecode_hash = "none"`을 설정해 컴파일러가 환경 의존적 IPFS 메타데이터 해시를 덧붙여 주소 결정성을 깨뜨리지 않게 한다.[^s01][^s11][^s14] 배치 정산 스택도 같은 방식을 따르며, 두 입금 콜렉터가 생성자에서 정산 주소를 받으므로 그 initCode(와 채굴된 vanity 솔트)는 정산 컨트랙트 주소에 의존한다.[^s25]

잔여 신뢰 가정: 통합자는 Permit2와 프록시의 정확성을 상속하며, `upto` 지불자는 서버가 공정히 청구하리라 신뢰하고, 배치 정산 지불자는 서버가 서명된 `maxClaimableAmount`까지 청구할 수 있음을 받아들이고 미청구 바우처에 대한 라이브니스 위험을 감수한다(§6).

## 6. 논의

**코드베이스가 실현한 예측.** 본 보고서의 이전 개정판은 배치 정산이 EVM 컨트랙트를 출시하지 않았음을 관찰하며 단서를 달았다. "향후 *자본 담보형* 바인딩(에스크로 또는 결제 채널)은 EVM 컨트랙트를 도입할 수 있으나 현재 출시된 것은 없다." 바로 그것이 도착했다. foundation 트리의 `scheme_batch_settlement_evm.md`는 명시적으로 "상태 비저장 단방향 결제 채널을 사용하는 **자본 담보** 네트워크 바인딩"이며 `x402BatchSettlement`가 구현한다 — 에스크로 더하기 결제 채널, 그 단서가 짚은 바로 두 메커니즘이다.[^s22] 교훈은 정확성이 아니라 신선도에 관한 것이다. 부재는 `dd927a2`에서 사실이었고, 단서가 옳았으며, 빠르게 움직이는 벤더 프로토콜이 약 7주 만에 그 공백을 메웠다.

**왜 또 하나의 프록시가 아니라 채널 컨트랙트인가.** 세 `exact`/`upto` 설계는 전적으로 동기적 요청 경로 위에 산다. 서명 하나, 온체인 전송 하나, 무수탁. 배치 정산은 정반대 영역 — 한 상대방을 향한 수많은 소액 요청 — 을 최적화하며, 여기서는 요청별 온체인 전송이 비경제적이다. 채널 컨트랙트는 수탁을 떠안고 인출/청구 라이브니스 표면을 도입하는 대가로 가스를 요청 전반에 분산한다(오프체인 바우처, 일괄 청구, 한 번에 쓸어 담는 settle). 이는 무수탁 프록시와는 진정으로 다른 보안 모델이며, 그래서 프로토콜은 이를 네 번째 프록시 자식이 아니라 별도 컨트랙트로 유지했다.[^s19][^s22]

**`upto`의 신뢰 비대칭, 배치에서 반복.** `upto`는 신뢰 보장을 유연성과 의도적으로 맞바꾼다. 컨트랙트는 서버가 서명된 최대치를 넘거나 다른 수취인에게 지불할 수 없음을 보장하지만, 최대치 *이내*에서 서버의 청구는 재량이고 클라이언트는 "전액이 청구될 위험을 감수"한다.[^s07] 배치 정산은 채널 규모에서 동일한 형태를 물려받는다 — 명세는 "클라이언트는 서명된 `maxClaimableAmount`까지 위험을 감수하며, 수신자 인가자가 그 한계 안에서 실제 `totalClaimed`를 온체인으로 결정한다. 초과 청구는 프로토콜 위반이 아니라 신뢰 위반"이라고 밝힌다. _(명세 자체가 명시한 위험 프레이밍이며 악용된 버그가 아니다.)_[^s22]

**의존성 상속과 감사 상태.** exact-EVM 명세는 통합자가 "[Permit2와 프록시의] 보안 성질과 향후 발견될 취약점을 상속한다"고 분명히 밝히고, 코드 주석은 프록시 위트니스를 *감사 후(post-audit)* 형태로 표시한다("post-audit: extra removed from Witness").[^s06] 즉 감사가 이루어져 프록시 설계가 바뀌었으나 감사 보고서 자체는 본 리뷰에서 확보되지 않았고, **더 새로운 배치 정산 컨트랙트에 대해서는 감사 문서를 전혀 찾지 못했다** — 프록시와 달리 수탁을 하는 컨트랙트인데도. 따라서 프록시의 감사 *결과*는 벤더 진술이고, 배치 컨트랙트의 감사 상태는 본 리뷰가 읽은 출처로는 단순히 미상이다. _(vendor-stated / 미상)_[^s06]

**빌드 결정성과 주소 변동.** 교차 체인 주소 동일성은 취약하며, 표면이 움직였다. 이전 개정판은 정규 Upto 프록시를 `0x4020a4f3b7b90CCA423b9FabCC0CE57c6c240002`(`dd927a2` README 기준)로 기록했으나, foundation README는 이제 정규 Upto 프록시를 *다른* 주소인 `0x402015c795ecb48A360bDC6e35a2EaEb313a0002`로 표기한다 — 출시된 컨트랙트의 결정적 주소조차 재채굴되어 대체될 수 있다는 직접 증거다.[^s11][^s25] 현재 정규 주소는 다음과 같다. Exact `0x402085c248EeA27D92E8b30b2C58ed07f9E20001`(불변), Upto `0x402015c795ecb48A360bDC6e35a2EaEb313a0002`(`dd927a2` 이후 변경), 그리고 배치 정산 스택 `0x4020074e9dF2ce1deE5A9C1b5c3f541D02a10003`(정산), `0x4020806089470a89826cB9fB1f4059150b550004`(ERC3009 콜렉터), `0x4020425FAf3B746C082C2f942b4E5159887B0005`(Permit2 콜렉터)로, Base·Arbitrum·World Chain·Polygon 메인넷에 배포된 것으로 보고된다.[^s25] 이 주소들의 라이브 바이트코드는 읽지 않았다(§7).

**반대 증거: 정산 선점과 리플레이.** 독립 프리프린트 *Five Attacks on x402*는 더 넓은 x402 정산 모델이 이 컨트랙트들과 직결되는 구조적 약점을 가진다고 주장한다.[^s17] 그 Attack I-B(무단 정산 선점)는 "정산 경로가 퍼실리테이터 신원을 인가에 결박하지 않는다"고 관찰한다. EIP-3009과 *exact* Permit2 경로에서는 서명된 인가를 관측한 누구나 전송을 제출하여 정당한 퍼실리테이터와 경쟁하고 논스를 소진해 정직한 정산을 나중에 실패시킬 수 있다.[^s17] 이것이 공격자가 자금을 훔치게 하지는 않으나 — 위트니스가 여전히 목적지를 고정한다 — 그리핑을 가능케 하고 퍼실리테이터의 배타적 정산 기대를 깨뜨린다. `upto` 프록시의 `msg.sender == witness.facilitator` 검사가 바로 이 논문이 빠졌다고 지적하는 결박이므로, `upto`는 I-B에 강화되어 있고 `exact`는 그렇지 않다. 주목할 점은 **배치 정산 채널은 이 부류의 공격을 다른 방식으로 비껴간다**는 것이다. 바우처에는 소진할 Permit2 논스가 없고, 청구는 수신자 측으로 제한되며(`claim`은 `msg.sender ∈ {receiver, receiverAuthorizer}`를, `claimWithSignature`는 `receiverAuthorizer` 서명을 요구), 누적 모델이 재생된 청구를 no-op로 만든다 — 그래서 개방형 `exact` 호출자를 때리는 선점 벡터는 청구 경로에 대응물이 없다. 논문의 Attack II(리플레이/멱등성)는 이들 모든 컨트랙트 밖의 HTTP 계층 문제로 남는다. 이들은 확인된 온체인 코드 익스플로잇이 아니라 연구자가 제시한 공격 모델이지만, 실재하는 반대 분석으로서 위의 보안 서사를 한정한다. _(독립 프리프린트)_

**독립적 교차 검증.** 프록시와 Permit2 입금 콜렉터가 의존하는 Permit2 메커니즘 — 위트니스 결박 서명 전송, 비순차 논스, 초과 금액 리버트 — 은 x402 프로젝트와 독립적으로 Uniswap 공식 개발자 문서와 인터페이스 소스에 동일하게 기술되어 있어, 본 분석에서 x402 자체 서술이 아니라 Permit2 동작에 기대는 부분의 신뢰도를 높인다.[^s15][^s16]

## 7. 한계

본 분석은 두 고정 커밋에서 저장소를 읽은 것에 기댄다. 세 Permit2 프록시는 `coinbase/x402@dd927a2`(2026-04-21, 현재는 development fork)에서, 배치 정산 장치는 `x402-foundation/x402@dc656bb`(2026-06-09)에서 읽었다. 구체적 한계:

- **감사 보고서 부재.** 프록시는 감사받았다고 기술되고 감사 후 변경이 언급되지만 감사 문서는 확보·열람되지 않았다. 더 새롭고 수탁형인 `x402BatchSettlement` 컨트랙트에 대해서는 감사를 전혀 찾지 못했다. 감사 결론은 프로젝트의 진술을 따른 것이고, 배치 컨트랙트의 감사 상태는 본 리뷰가 읽은 출처로는 미상이다.[^s06]
- **라이브 바이트코드 미검증.** 정규 주소와 결정적 배포 서사는 저장소와 README에서 온 것으로, Base·Arbitrum·World Chain·Polygon의 배포 바이트코드를 RPC/익스플로러로 읽지 않았다. 따라서 교차 체인 동일성과 "배포됨" 상태는 *의도와 설정 더하기 프로젝트의 배포 표*로 검증된 것이지 관측된 온체인 사실이 아니다.[^s11][^s14][^s25]
- **테스트는 읽었으되 실행하지 않음.** 배치 컨트랙트의 Foundry 단위·fork·gas 테스트는 그것이 인코딩하는 동작(`test_finalizeWithdraw_capsIfClaimedDuringDelay`, `test_initiateWithdraw_attackBypass_blocked`, fork 라이프사이클)을 인용하지만, 본 리뷰에서는 소스로 읽었을 뿐 실행하지 않았다.[^s24]
- **대부분 1차(자체) 출처.** Uniswap Permit2 문서(독립)와 *Five Attacks* 프리프린트(독립·반대)를 제외하면 스킴·컨트랙트 주장은 1차 출처다. x402는 벤더 주도의 빠르게 움직이는 프로토콜이며, Upto 프록시의 정규 주소가 이미 두 핀 사이에 바뀌었으므로 위트니스 형태·스킴 이름·주소는 `dc656bb` 이후 또 바뀔 수 있다.[^s25]
- **공격 모델은 연구자 진술.** §6의 선점·리플레이 약점은 프리프린트의 위협 분석(s17)에서 온 것이지 이 특정 컨트랙트에 대해 재현된 온체인 익스플로잇이 아니다. 확정된 취약점이 아니라 검토해야 할 설계 비판으로 읽어야 한다.[^s17]
