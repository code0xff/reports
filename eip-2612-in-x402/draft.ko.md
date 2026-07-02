# EIP-2612 Permit과 x402에서의 활용

## 초록

EIP-2612는 토큰 보유자가 온체인 `approve` 트랜잭션 대신 오프체인 EIP-712 메시지 서명으로 허용량(allowance)을 부여할 수 있게 하는 `permit` 함수를 ERC-20에 추가하며, 이로써 지불자가 체인의 네이티브 가스 자산을 보유할 필요가 없어진다[^s01]. x402는 Coinbase가 시작하고 현재 Cloudflare와 공동 설립한 산업 재단이 관리하는 오픈 결제 프로토콜로, HTTP 402 "Payment Required" 상태 코드를 되살려 AI 에이전트를 포함한 클라이언트가 API 키나 구독 대신 서명된 스테이블코인 승인으로 HTTP 리소스 비용을 지불하게 한다[^s10][^s20]. 본 보고서는 이 둘이 어떻게 결합되는지를 검토한다. EVM 네트워크에서 x402의 `exact` 스킴은 세 가지 자산 전송 방식 중 하나로 결제를 정산한다: EIP-3009 `transferWithAuthorization`(권장 경로, USDC 사용), Permit2 서명 전송(모든 ERC-20을 위한 범용 폴백), 스마트 계정용 ERC-7710 위임이다[^s04]. EIP-2612는 `eip2612GasSponsoring` 확장을 통해 등장한다: `permit`을 구현한 토큰의 경우 클라이언트가 표준 Permit2 컨트랙트를 승인하는 EIP-2612 permit에 서명하고, 퍼실리테이터가 정산 시 `x402ExactPermit2Proxy.settleWithPermit`을 통해 이를 원자적으로 제출하므로, 지불자는 일회성 Permit2 승인 단계에서도 가스를 전혀 쓰지 않는다[^s05][^s17]. 우리는 프로토콜 명세와 SDK 소스로부터 전체 메커니즘을 재구성하고, 클라이언트·서버·퍼실리테이터 코드 경로를 따라가며, permit 프런트러닝, 피싱 자산 탈취 사건, 팬텀 함수 위험, 그리고 x402에 대한 초기 학술 연구가 기록한 크로스 레이어 공격 등 보안 속성을 분석한다[^s14][^s13][^s24]. 결론적으로 x402에서 EIP-2612의 역할은 의도적으로 좁지만 전략적으로 중요하다: 결제 프리미티브 자체가 아니라, x402의 "네이티브 토큰 제로" 사용자 경험을 EIP-3009 스테이블코인에서 롱테일 ERC-20 자산으로 확장하는 가스리스 온램프이다.

## 서론

`approve`와 `transferFrom`의 상호작용은 ERC-20이 성공한 이유 중 하나로 꼽힌다. 토큰이 다른 컨트랙트 안에서 애플리케이션별 조건으로 사용될 수 있게 해주기 때문이다. 그러나 이 설계에는 구조적 비용이 있다. `approve`가 `msg.sender` 기준으로 정의되어 있어 사용자가 ERC-20으로 하는 첫 행동은 반드시 자신의 계정에서 보내는 온체인 트랜잭션이어야 하고, 이는 곧 가스용 네이티브 자산 보유를 의미한다 — 사용자가 원하는 것이 토큰 그 자체로 누군가에게 지불하는 것뿐일 때조차 그렇다[^s01].

EIP-2612는 정확히 이 마찰을 없애기 위해 작성되었고, x402는 서명 기반 토큰 승인 위에 구축된 시스템 중 가장 가시적인 축에 속한다. x402는 기계가 읽을 수 있는 결제 요구사항을 담은 HTTP 402 응답을 반환하는 "인터넷 네이티브 결제" 오픈 표준으로, 클라이언트는 서명된 결제 페이로드로 응답하고 *퍼실리테이터(facilitator)* 서비스가 이를 검증하고 온체인에서 정산한다[^s12][^s10]. Coinbase가 프로토콜을 출시한 뒤 Cloudflare와 공동 설립한 재단으로 이관했으며, Cloudflare는 자사 네트워크의 사이트들이 이미 봇과 크롤러에게 매일 10억 건 이상의 HTTP 402 응답 코드를 내보내고 있다고 보고하면서 이를 표준화된 결제 핸드셰이크에 대한 잠재 수요로 제시한다[^s10][^s20].

이 프로토콜의 핵심 사용자 경험 약속은 지불자가 메시지에 서명은 하되 트랜잭션은 결코 제출하지 않는다는 것이다. 정산 가스는 정산을 브로드캐스트하는 쪽 — 실제로는 퍼실리테이터 — 이 부담한다[^s04][^s20]. 이 약속이 실현 가능한 것은 승인과 실행을 분리하는 토큰 수준 표준, 즉 EIP-3009의 `transferWithAuthorization`과 EIP-2612의 `permit` 덕분이다[^s04][^s12]. 각 표준이 x402 설계에서 정확히 어디에 위치하는지 — 그리고 프로토콜이 왜 둘을 다르게 취급하는지 — 를 이해하는 것이 본 보고서의 주제다.

분석은 세 가지 질문으로 구성된다. 첫째, EIP-2612는 정확히 무엇을 명세하며 EIP-3009와 어떻게 다른가(배경 절). 둘째, x402는 결제 흐름을 어떻게 구조화하며 EIP-2612는 어디에 꽂히는가(x402 프로토콜 절, x402에서의 EIP-2612 활용 절). 셋째, 구현자는 실제로 무엇을 해야 하고 무엇이 잘못될 수 있는가(구현 워크스루 절, 보안 고려사항 절).

## 배경: EIP-2612 Permit

### 명세

EIP-2612(상태: Final)는 준수 토큰이 ERC-20에 더해 세 함수를 구현할 것을 요구한다[^s01]:

```solidity
function permit(address owner, address spender, uint value,
                uint deadline, uint8 v, bytes32 r, bytes32 s) external
function nonces(address owner) external view returns (uint)
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

`permit(owner, spender, value, deadline, v, r, s)` 호출은 `allowance[owner][spender]`를 `value`로 설정하고 `nonces[owner]`를 1 증가시키며 `Approval` 이벤트를 발생시킨다 — 단, 현재 블록 시각이 `deadline` 이하이고, `owner`가 제로 주소가 아니며, 제공된 논스가 `nonces[owner]`와 같고, `(v, r, s)`가 토큰의 `DOMAIN_SEPARATOR`에 바인딩된 EIP-712 타입 구조체 `Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)`에 대한 `owner`의 유효한 secp256k1 서명일 때에만 그렇다[^s01]. 도메인 구분자는 EIP-712의 타입 구조화 데이터 방식에 따라 토큰의 이름, 버전, 체인 ID, 컨트랙트 주소를 커밋한다[^s01][^s03]. 결정적으로, 명세는 `permit`이 어디에서도 `msg.sender`를 참조하지 않음을 명시한다: 서명된 permit은 *누구든* 제출할 수 있으며, 이것이 릴레이어 — x402에서는 퍼실리테이터 — 가 가스를 대신 낼 수 있는 이유다[^s01].

결제 관점에서 두 가지 구조적 속성이 중요하다. 첫째, permit 논스는 순차적이다: `permit`이 성공할 때마다 소유자의 논스가 정확히 1씩 증가하므로 서명 재사용은 막히지만, 한 소유자의 미확정 permit 여러 건은 반드시 순서대로 처리되어야 한다[^s01][^s15]. 둘째, `permit`은 허용량만 기록한다. 자금 이동에는 여전히 `transferFrom`이 필요하며, 이는 스펜더가 제출하고 비용을 부담할 수 있다. Circle의 USDC 문서는 이 흐름을 "릴레이어가 permit(...)을 USDC 컨트랙트에 제출하면 approve와 똑같이 허용량이 기록된다"라고 설명한다[^s01][^s11].

### EIP-3009: 대조되는 설계

EIP-3009(`transferWithAuthorization` / `receiveWithAuthorization`, 상태: Draft)는 같은 가스리스 문제를 다른 트레이드오프로 푼다. 명세의 동기 절은 두 가지 주요 차이를 직접 밝힌다: EIP-2612는 순차 논스를 쓰지만 EIP-3009는 무작위 32바이트 논스를 쓰고, EIP-2612는 ERC-20 허용량 패턴에 의존하지만 EIP-3009는 전송 자체를 승인한다[^s02]. 무작위·무순서 논스는 사용자가 순서 위험 없이 얼마든지 많은 승인에 동시 서명할 수 있게 하고, 전송 범위 승인은 지속적 허용량을 아예 만들지 않는다. Circle은 이를 "허용량이 생성되지 않는다. 서명된 승인은 릴레이어가 시간 창 안에서 토큰을 한 번 이동시키게 해준다"라고 요약한다[^s02][^s11]. 또한 EIP-3009는 EIP-2612의 단일 `deadline` 대신 양방향 유효 창(`validAfter`, `validBefore`)을 사용한다[^s02].

USDC는 두 표준을 동시에 구현한다 — 컨트랙트가 `permit`(EIP-712 도메인 이름 "USDC", 버전 "2")과 `transferWithAuthorization`을 모두 노출한다[^s11]. x402 문서 역시 USDC를 일반적인 EIP-2612 토큰으로 꼽는다[^s17].

적합성에 관한 주의 하나: EIP-2612 명세 자체가 메인넷 `dai.sol`에 배포된 `permit`은 표준보다 앞서며 표준에 부합하지 않는다고 기록한다 — DAI 변형은 `value` 대신 `bool allowed`를 받고 데드라인을 `expiry`라 부르는데, 이는 서명되는 메시지 자체를 바꾼다[^s01]. 그럼에도 x402 문서는 DAI를 "일반적인 EIP-2612 토큰"으로 나열한다[^s17]. 메인넷 DAI에 대해 두 출처는 충돌한다. 통합자는 "permit 함수가 있다"와 "EIP-2612에 부합한다"를 별개의 술어로 취급하고 토큰 배포본별로 실제 타입 데이터 레이아웃을 검증해야 한다[^s01][^s17].

## x402 프로토콜

### 흐름과 구성요소

x402는 세 구성요소 — 클라이언트(흔히 AI 에이전트), 리소스 서버, 퍼실리테이터 — 간의 요청–응답 결제 핸드셰이크를 정의한다[^s06][^s10]. 표준 5단계 흐름은 다음과 같다: 클라이언트가 리소스를 요청하고; 서버가 기계가 읽을 수 있는 결제 요구사항과 함께 `402 Payment Required`로 응답하고; 클라이언트가 서명된 결제 승인과 함께 재시도하고; 퍼실리테이터가 온체인에서 검증·정산하고; 서버가 정산 확인 헤더와 함께 리소스를 반환한다[^s10][^s06].

와이어 포맷은 프로토콜 버전 간에 바뀌었다. v1에서는 402 응답이 JSON 본문을 싣는데, `accepts` 배열이 `PaymentRequirements`(스킴, 네트워크, `maxAmountRequired`, 자산, `payTo`, 그리고 토큰의 EIP-712 도메인 `name`과 `version`을 담는 `extra` 필드)를 나열하고, 클라이언트는 base64로 인코딩된 서명 페이로드를 `X-PAYMENT` 헤더에 담아 재시도한다[^s07]. v2에서는 표준 와이어 위치가 base64 인코딩된 `PAYMENT-REQUIRED` 응답 헤더와 `PAYMENT-SIGNATURE` 요청 헤더이고, 금액은 `amount`로 표현되며, 네트워크는 `eip155:8453` 같은 CAIP-2 식별자를 쓴다[^s06][^s20].

퍼실리테이터는 세 개의 표준화된 HTTP 엔드포인트 — `POST /verify`, `POST /settle`, `GET /supported` — 를 노출하여 리소스 서버가 모든 블록체인 상호작용을 위임할 수 있게 한다[^s06]. Coinbase는 호스팅 퍼실리테이터(무료 티어 후 건당 과금)를 운영하며 Base, Polygon, Arbitrum, World, Solana에서 "EIP-3009(USDC, EURC) 또는 Permit2(모든 ERC-20)를 통해" ERC-20 결제를 처리한다[^s20]. 프로토콜 자체는 수수료를 받지 않는다[^s12].

### EVM의 `exact` 스킴

최초이자 지배적인 스킴은 지불자가 특정 금액을 승인하는 `exact`다. v1과 v2 핵심 명세 모두 EVM의 `exact`를 EIP-3009 중심으로 정의한다: "exact 스킴은 EIP-3009(Transfer with Authorization)를 사용하여 특정 금액의 ERC-20 토큰을 안전하고 가스 없이 전송한다"이며, 승인마다 고유한 32바이트 논스가 토큰 컨트랙트 수준에서 강제된다[^s07][^s06]. v2 페이로드는 EIP-3009 승인 튜플 — `from`, `to`, `value`, `validAfter`, `validBefore`, `nonce` — 과 65바이트 서명을 실어 온체인 호출을 그대로 반영한다[^s04][^s06].

v2 `exact` EVM 스킴은 이를 세 가지 *자산 전송 방식*으로 일반화한다[^s04]:

| 방식 | 용도 | x402 자체 권고 |
|---|---|---|
| **EIP-3009** | 네이티브 `transferWithAuthorization` 보유 토큰(예: USDC) | "권장(가장 단순, 진정한 가스리스)" |
| **Permit2** | EIP-3009 미보유 토큰; 프록시 + Permit2 | "범용 폴백(모든 ERC-20에서 동작)" |
| **ERC-7710** | 위임을 지원하는 스마트 계정 | 스마트 계정 옵션 |

세 방식 모두에서 "퍼실리테이터는 금액이나 목적지를 수정할 수 없다. 그들은 트랜잭션 브로드캐스터 역할만 한다" — 그리고 가스는 지불자가 아니라 퍼실리테이터가 낸다[^s04]. 서버의 `extra.assetTransferMethod` 필드가 없으면 클라이언트는 EIP-3009를 기본값으로 삼는다[^s04].

또한 계량형 사용을 위한 `upto` 스킴(클라이언트가 최대치에 서명하고 서버가 실제 금액을 정산)이 있으며, 이는 Permit2 전송 방식만을 사용한다[^s08].

## x402에서의 EIP-2612 활용

### 결제 레일이 아니라 가스리스 온램프

흔한 오해는 x402가 결제 토큰에 `permit()`을 호출한 뒤 `transferFrom()`을 호출해 결제를 정산한다는 것이다. 명세가 기술하는 아키텍처는 다르다. EIP-3009이 없는 토큰의 경우 x402는 결제를 **Permit2** — 서명 기반 전송을 모든 ERC-20으로 확장하는 Uniswap의 표준 승인 컨트랙트 — 를 통해 라우팅한다: "EIP-2612를 지원하지 않는 토큰을 포함해 어떤 ERC20 토큰이든 이제 permit 스타일 승인을 쓸 수 있다"이며, 논스는 무순서·비단조다[^s16][^s04]. 클라이언트는 Permit2 `permitWitnessTransferFrom` 메시지에 서명하는데, 그 *witness*는 수취인 주소와 `validAfter` 타임스탬프를 바인딩하고, `spender`는 감사를 거친 소형 프록시 `x402ExactPermit2Proxy`다. 이 프록시는 지원되는 모든 체인에서 동일한 CREATE2 주소(`0x402085c248EeA27D92E8b30b2C58ed07f9E20001`)로 배포되며, 자금이 witness에 명시된 `to` 주소로만 이동하도록 강제하므로 퍼실리테이터가 이를 탈취할 수 없다[^s04].

다만 Permit2에는 부트스트랩 문제가 있다: 토큰 보유자가 먼저 Permit2 컨트랙트에 ERC-20 허용량을 부여해야 하는데, 전통적으로 이는 온체인 `approve` 한 건 — 즉 가스 — 을 요구한다[^s04]. 스킴 명세는 세 가지 옵션을 제시한다: (A) 사용자가 직접 가스를 내고 표준 `approve(Permit2)` 트랜잭션을 보내거나, (B) 퍼실리테이터가 배치 트랜잭션으로 ERC-20 승인을 후원하거나(`erc20ApprovalGasSponsoring`), (C) **EIP-2612 경로**: "토큰이 EIP-2612를 지원하면 사용자가 Permit2를 승인하는 permit에 서명"하고 퍼실리테이터가 `x402ExactPermit2Proxy.settleWithPermit()`을 호출한다[^s04].

이것이 `eip2612GasSponsoring` 확장으로 공식화된, x402에서 EIP-2612의 정확한 역할이다: "클라이언트가 Permit2 컨트랙트를 승인하는 오프체인 permit에 서명하고, 퍼실리테이터가 정산 중에 x402ExactPermit2Proxy.settleWithPermit을 통해 이를 원자적으로 제출한다." 따라서 일회성 승인 단계조차 지불자에게 가스 비용이 들지 않는다[^s17][^s05]. 서버는 402 응답의 `extensions` 객체에서 이 확장을 광고하고; 클라이언트는 Permit2 허용량 부족을 감지하면 permit 필드(`from`, `asset`, `spender` = 표준 Permit2, `amount`, `nonce`, `deadline`, 65바이트 `signature`)를 결제 페이로드의 `extensions.eip2612GasSponsoring.info`에 포함한다[^s05][^s17].

### 정산: 하나의 원자적 트랜잭션

프록시의 `settleWithPermit`은 단일 트랜잭션에서 두 단계를 실행한다: 먼저 EIP-2612 permit을 토큰에 제출하고 — `IERC20Permit(token).permit(owner, address(PERMIT2), value, deadline, v, r, s)` — 그다음 표준 Permit2 정산인 `permitWitnessTransferFrom`을 실행해 witness에 명시된 수취인에게 결제를 전송한다[^s04]. 정산 전 퍼실리테이터의 검증 의무도 명세되어 있다: 자산이 실제로 `IERC20Permit`을 구현하는지 확인하고, permit 서명이 지불자로 복원되며 기대되는 스펜더(표준 Permit2 컨트랙트)를 지정하는지 확인하고, `settleWithPermit`을 끝까지 시뮬레이션한다[^s05]. 원자성 덕분에 "permit은 반영됐는데 전송이 실패하면?"이라는 질문의 답은 단순히 정산 트랜잭션 전체의 되돌림(revert)이다 — 임의 방식의 permit-후-transferFrom 릴레이보다 의미 있게 단순해진다[^s05][^s17].

따라서 permit 토큰에 대한 x402 결제의 분업은 이렇다: **EIP-2612는 Permit2를 한 번 승인하고, Permit2는 매번 특정 전송을 승인한다.** 첫 정산이 permit을 소비하고 허용량을 설치한 후에는 후속 결제에 Permit2 서명만 필요하며, 이는 EIP-2612의 순차 논스와 달리 무순서 논스를 사용하므로 동시 진행 중인 결제를 허용한다[^s16][^s02]. 결국 EIP-2612의 순차 논스 제약은 온보딩 중에만 구속력을 갖고 정상 상태의 결제 트래픽에는 미치지 않는다 — EIP-2612의 주된 동시성 약점을 무력화하면서 주된 강점, 즉 현대 ERC-20에서의 거의 보편적인 가용성을 활용하는 아키텍처적 선택이다[^s02][^s16][^s04].

명세와 SDK 간 불일치 하나는 짚어둘 만하다. 확장 명세의 예시는 permit `amount`를 "일반적으로 MaxUint" — Permit2에 대한 무제한 허용량 — 로 보여주는 반면[^s05], Go SDK는 해당 결제의 Permit2 `permitted.amount`와 정확히 같은 값의 permit에 서명하며 "프록시 컨트랙트가 permit2612.value == permittedAmount를 강제한다"는 주석을 담고 있다[^s18]. 이는 실재하는 트레이드오프(영구 permit 한 번 vs 결제마다 permit 한 번 — 후자는 순차 논스로 재직렬화됨)의 서로 다른 지점을 반영하며, 이 표면이 아직 정리되는 중임을 보여준다 _(초기 신호)_[^s05][^s18].

### 생태계 확산

permit 기반 경로의 지원은 레퍼런스 스택 너머로 확장되고 있다. Coinbase의 호스팅 퍼실리테이터는 "모든 ERC-20"에 대한 Permit2 정산을 광고하고[^s20]; 서드파티 구현들은 이 확장을 명시적으로 추적한다 — 예컨대 t402 프로젝트는 x402의 `specs/extensions/eip2612_gas_sponsoring.md`를 인용하며 "EIP-2612 가스 스폰서링 명세 구현 … 기존 퍼실리테이터와의 통합"이라는 작업 항목을 두고 있다[^s09]. 클라이언트 이슈 트래커들은 EIP-3009 전용 서명에서 Permit2 토큰 지원으로 옮겨가는 v1→v2 마이그레이션의 어려움을 기록하고 있다[^s09]. x402 SDK는 TypeScript, Go, Python에서 이 확장을 제공한다[^s17].

## 구현 워크스루

이 절은 레퍼런스 SDK와 명세를 따라 각 역할별 구체적 단계를 재구성한다. 코드 발췌는 x402 저장소에서 요약한 것이다.

### 클라이언트: EIP-2612 permit 서명

클라이언트가 EIP-712 도메인을 구성하려면 토큰 메타데이터 네 가지 — 이름, 버전, 체인 ID, 검증 컨트랙트 — 와 상태 하나, 즉 소유자의 현재 permit 논스가 필요하다. 서버는 `PaymentRequired.extra`에서 `name`과 `version`을 제공한다(잘못된 도메인으로 구성된 서명은 실패하기 때문에 필수 필드다. 예컨대 USDC의 버전은 "2"다)[^s04][^s11]. Go 클라이언트가 표준적 순서를 보여준다: 토큰에서 `nonces(owner)`를 읽고, 광고된 이름/버전에 체인 ID와 토큰 주소를 더해 타입 데이터 도메인을 만들고, `spender`를 표준 Permit2 주소로 고정한 `Permit` 메시지를 조립한 뒤, 타입 데이터에 서명한다[^s18]:

```go
// go/mechanisms/evm/exact/client/eip2612.go 요약
nonce, _ := signer.ReadContract(ctx, token, EIP2612NoncesABI, "nonces", owner)
domain := TypedDataDomain{Name: tokenName, Version: tokenVersion,
                          ChainID: chainID, VerifyingContract: token}
message := map[string]interface{}{
    "owner": owner, "spender": PERMIT2Address,
    "value": amount, "nonce": nonce, "deadline": deadline,
}
sig, _ := signer.SignTypedData(ctx, domain, GetEIP2612EIP712Types(), "Permit", message)
```

TypeScript SDK에서는 이 결정 전체가 자동화되어 있다: 서버가 `eip2612GasSponsoring`을 광고하고, 전송 방식이 `permit2`이며, 클라이언트의 Permit2 허용량이 부족할 때마다 `ExactEvmScheme`이 "EIP-2612 permit에 서명해 결제 페이로드에 포함한다" — 통합자는 permit 관련 코드를 전혀 쓰지 않는다[^s17]. 내부적으로 이는 명세에 정의된 `Permit` 구조체에 대한 표준 EIP-712 타입 데이터 서명이다[^s01][^s15].

그다음 클라이언트는 하나의 결제 페이로드에 *두 개의* 서명을 보낸다: `payload`에는 Permit2 `permitWitnessTransferFrom` 서명, `extensions.eip2612GasSponsoring.info`에는 EIP-2612 permit 필드다[^s05].

### 서버: 확장 광고

리소스 서버는 기성 미들웨어(`@x402/express`, `@x402/hono`, `@x402/next`, 또는 Python/Go 대응물)로 라우트를 게이트하고 라우트 구성에서 확장을 선언한다[^s23][^s17]:

```typescript
import { declareEip2612GasSponsoringExtension } from "@x402/extensions/eip2612-gas-sponsoring";

const routes = {
  "GET /api/data": {
    accepts: [{ scheme: "exact", network: "eip155:84532",
                price: "$0.01", payTo: "0xYourAddress" }],
    extensions: { ...declareEip2612GasSponsoringExtension() },
  },
};
```

나머지 — 402 발행, 헤더 파싱, 퍼실리테이터 호출 — 는 모두 미들웨어의 몫이다. x402 README의 요지는 `app.use(paymentMiddleware({...}))` 한 줄이다[^s23]. 검증과 정산은 `/verify`와 `/settle`을 구현한 퍼실리테이터에 HTTP로 위임된다[^s06].

### 퍼실리테이터: 검증 후 원자적 정산

스킴 명세에 따르면 Permit2 방식 결제를 받은 퍼실리테이터는 먼저 Permit2 서명이 지불자로 복원되는지 확인하고, `ERC20.allowance(from, Permit2)`를 확인한다. 허용량이 부족하면 `eip2612GasSponsoring` 페이로드(또는 후원 approve 대안)를 찾고, 둘 다 없을 때에만 오류 코드 `PERMIT2_ALLOWANCE_REQUIRED`와 함께 `412 Precondition Failed`를 반환하여 일회성 온체인 승인이 불가피함을 클라이언트에 알린다[^s04]. permit 경로에서는 자산이 `IERC20Permit`을 구현하는지 검증하고, permit의 스펜더가 표준 Permit2 컨트랙트인지 검증하고, 브로드캐스트 전에 `settleWithPermit`을 시뮬레이션해야 한다[^s05]. 정산은 프록시로 들어가는 단일 트랜잭션이다[^s04]:

```solidity
function settleWithPermit(EIP2612Permit calldata permit2612,
    ISignatureTransfer.PermitTransferFrom calldata permit,
    address owner, Witness calldata witness, bytes calldata signature) external {
  IERC20Permit(permit.permitted.token).permit(owner, address(PERMIT2),
      permit2612.value, permit2612.deadline, permit2612.v, permit2612.r, permit2612.s);
  _settleInternal(permit, owner, witness, signature); // permitWitnessTransferFrom
}
```

`_settleInternal` 본문은 `block.timestamp >= witness.validAfter`를 강제하고 witness에 명시된 수취인으로만 전송을 구성하므로, 악의적 퍼실리테이터가 자기 주소를 끼워 넣을 수 없다[^s04].

### 시점과 만료의 대응 관계

두 표준의 신선도 제어는 서로 대응된다: EIP-2612는 승인에 단일 `deadline`을 제공하고, Permit2 승인은 자체 `deadline`을, witness는 `validAfter`를 실어 — 합쳐서 EIP-3009이 네이티브로 가진 양방향 `validAfter`/`validBefore` 창을 재현한다[^s01][^s02][^s04]. 퍼실리테이터는 만료되었거나 아직 유효하지 않은 승인을 가스를 쓰기 전인 검증 시점에 거부해야 한다[^s05][^s06].

## 보안 고려사항과 함정

### 프런트러닝과 "permit 그리핑" 패턴

permit은 누가 제출하든 유효하므로 "다른 당사자가 언제든 이 트랜잭션을 프런트런하여 의도된 당사자보다 먼저 permit을 호출할 수 있다. Permit 서명자 입장에서 최종 결과는 같다"[^s01]. OpenZeppelin 문서는 이 경고를 일반화한다: permit은 "누구나 제출할 수 있으므로" "프런트런될 수 있다". 통합 컨트랙트는 이미 반영된 permit(논스 소비됨, 허용량 설치됨)을 실패가 아닌 성공으로 취급해야 한다[^s15]. x402 퍼실리테이터의 완화책은 구조적이다 — `settleWithPermit`은 브로드캐스트 직전에 시뮬레이션되고, 프런트런된 permit은 내부 `permit()` 호출을 불필요하게 만들 뿐이다. 그러나 permit 되돌림을 치명적 오류로 취급하는 구현은 비용 없는 그리핑 수단을 결제 거부로 바꿔버린다[^s15][^s05].

### 피싱 자산 탈취 사건

permit을 가스리스로 만드는 바로 그 속성이 permit을 강력한 피싱 프리미티브로 만든다: 악성 사이트에서 타입 데이터 메시지 하나에 서명한 피해자는, 보이지 않게 그리고 가스 비용 없이, 공격자에게 허용량을 부여한 것이다. SlowMist의 사건 분석은 이 패턴을 재구성한다 — "피해자는 블록체인에 브로드캐스트하지 않은 채 permit에 서명해 피싱 웹사이트에 넘겼다 … 해커는 이 서명 정보를 획득해 permit을 온체인에 제출했다" — 그 후 `transferFrom`으로 자금을 탈취했으며, 2023년 5월까지 악성 permit 계열 서명으로 300명 이상의 피해자와 약 69만 달러의 피해를 보고했다[^s13]. Neptune Mutual은 Scam Sniffer 데이터를 인용해 2024년 1월 한 달에만 피싱으로 손실된 5,500만 달러의 대부분을 서명된 ERC-20 permit 탓으로 돌린다[^s22]. 기반이 되는 허용량 메커니즘에 대한 학술 측정은 연구된 2,540만 건의 승인 트랜잭션 중 60%에서 무제한 승인을 발견했으며, 사용자의 22%가 승인되었으나 사용되지 않은 허용량을 통한 토큰 탈취 고위험군이었다[^s26].

x402의 설계는 결제 경로에서 이 표면을 좁힌다: `exact` 스킴은 지불자가 짧은 유효 창과 함께 정확한 금액에 서명하게 하고, Permit2 witness가 수취인을 고정하므로, 퍼실리테이터든 관찰자든 결제 서명을 자산 탈취로 증폭할 수 없다[^s04][^s06]. 잔여 위험은 명세 예시의 MaxUint 패턴 — Permit2에 대한 무제한 허용량 — 이 사용될 때 EIP-2612 승인 자체에 집중되며, 그 경우 안전성은 전적으로 Permit2 자체의 서명 검사에 달려 있다. Go SDK가 서명하는 정확한 값의 permit이 보수적인 대안이다[^s05][^s18][^s26].

### 팬텀 permit

`permit`이 아예 없는 토큰은 요란하게가 아니라 *조용히* 실패할 수 있다. Dedaub의 "팬텀 함수" 연구는 permit이 없는 WETH가 `permit()` 호출을 되돌리지 않고 받아들인다는 것을 보였다 — 구식 폴백이 `deposit()`을 실행하기 때문이다. 유효하지 않은 승인에 대해 `permit()`이 되돌아온다는 가정에 의존한 Multichain/Anyswap 컨트랙트는 이 때문에 사용자 허용량을 탈취당할 수 있었고, 실증된 최악의 경우는 "단 3개의 피해자 계정에서 단일 직접 트랜잭션으로 4억 3,100만 달러의 WETH"였다 _(단일 출처 기술 세부사항: 발견자의 자체 문서)_[^s14]. 이것이 바로 x402 확장 명세가 "자산 주소가 실제로 IERC20Permit을 구현하는지 검증"을 퍼실리테이터의 첫 검증 단계로 두는 이유다. 명세는 탐지 방법을 규정하지 않지만, 명세가 의무화한 전체 정산 시뮬레이션은 실행되는 대신 조용히 no-op이 되는 permit을 드러낼 것이다[^s05][^s14].

### 프로토콜 계층 공격

x402 자체에 대한 초기 학술 검증은 동기식 HTTP 승인과 비동기식 블록체인 정산의 결합이 "기존 웹 및 온체인 결제에 없는 크로스 레이어 공격 표면을 도입한다"고 보고한다: 승인, 페이로드 바인딩, 재사용 방지, 웹 계층 처리 전반의 다섯 가지 실용적 공격이 테스트넷, 라이브 엔드포인트, 세 개의 오픈소스 SDK에서 검증되었으며, 무료 서비스 이용 또는 지불-후-거부 결과를 낳는다[^s24]. 두 번째 프리프린트는 자금 안전과 별개의 프라이버시 공백을 지적한다: 결제 메타데이터(리소스 URL, 설명, 사유 문자열)가 정산 전에 리소스 서버와 중앙화된 퍼실리테이터로 흘러가며, 통상 어떤 데이터 처리 계약도 없다[^s25]. 두 논문 모두 2026년 프리프린트이므로 그에 맞게 가중해야 한다 _(초기 신호)_[^s24][^s25].

### 실무 실패 모드 체크리스트

위 출처들로부터 통합자의 체크리스트는 다음으로 요약된다: 배포본별로 실제 EIP-2612 적합성을 검증하라(메인넷 DAI의 `bool allowed` 변형은 표준 `Permit` 구조체와 다른 메시지에 서명한다)[^s01][^s17]; EIP-712 도메인(`name`, `version`)을 가정하지 말고 실시간으로 가져오라 — USDC의 버전은 "2"다[^s11][^s18]; 서명 시점에 현재 순차 논스를 읽고 온보딩 중 직렬화를 예상하라[^s01][^s15]; 프런트런된 permit을 성공으로 취급하라[^s15]; 데드라인을 정산이 아닌 검증 시점에 강제하라[^s05][^s06]; 되돌아오지 않는 호출로부터 permit 지원을 추론하지 말라[^s14].

## 논의: 설계 트레이드오프와 생태계 현황

### 왜 EIP-3009이 먼저이고 EIP-2612가 다음인가

x402 자체의 스킴 표가 위계를 코드화한다: EIP-3009는 "권장(가장 단순, 진정한 가스리스)", Permit2는 "범용 폴백"이다[^s04]. 이유는 표준들의 구조로 직접 소급된다. EIP-3009는 허용량이 아닌 전송을 승인한다 — 서명 하나, 온체인 호출 하나, 소비된 논스 외에 지속 상태 없음 — 그리고 무작위 논스는 무제한 동시 승인을 허용하므로, 에이전트가 많은 결제를 동시에 진행할 수 있는 기계 속도 마이크로페이먼트에 맞는다[^s02]. EIP-2612는 이후에 소비되어야 하는 허용량을 승인하고, 순서에 민감한 순차 논스를 쓰며, 지속적인 허용량 상태를 남긴다[^s01][^s02]. 결제 자체에는 EIP-3009이 그저 더 알맞은 형태의 프리미티브이며, 호스팅 퍼실리테이터가 x402의 대표 자산인 USDC와 EURC를 정산하는 경로가 바로 EIP-3009이다[^s20][^s04].

EIP-2612가 EIP-3009에 없이 가진 것은 *도달 범위*다. EIP-3009는 여전히 Draft ERC이고 USDC가 대표적인 프로덕션 구현인 반면[^s02][^s11], permit은 현대 ERC-20에서 널리 퍼져 있다 — OpenZeppelin은 `ERC20Permit`을 표준 빌딩 블록으로 제공하고, x402 문서는 "많은 현대 ERC-20 토큰"의 EIP-2612 지원을 언급한다[^s15][^s17]. x402의 아키텍처는 둘을 합리적으로 조합한다: EIP-2612의 동시성 한계가 모든 결제에 전염되는 독자적 permit-후-transferFrom 결제 스킴을 정의하는 대신, EIP-2612 서명 하나로 Permit2에 부트스트랩하고, 기능적으로 EIP-3009과 유사한 Permit2의 무순서 논스 witness 전송이 이후의 모든 결제를 나른다[^s04][^s16]. 따라서 정상 경로에서 EIP-2612는 (소유자, 토큰, 체인)당 정확히 한 번 소비된다.

### 같은 아키텍처 안의 대안들

EIP-2612가 차지한 슬롯은 다른 메커니즘으로도 채울 수 있으며, 명세는 이들을 동급으로 취급한다: permit 없는 토큰을 위한 퍼실리테이터 후원 온체인 `approve` 배치(`erc20ApprovalGasSponsoring`), 그리고 스마트 계정을 위한 ERC-7710 위임 — 후자는 EIP-2612가 구조적으로 서비스할 수 없는 집단도 포괄하는데, Safe 같은 컨트랙트 지갑은 permit이 요구하는 EOA 서명을 만들 수 없기 때문이다[^s04][^s15]. Cloudflare는 추가로 HTTP 메시지 서명과 전통 결제 레일 정산을 쓰는 지연 결제 스킴을 제안하고 있으며, 일부 흐름에서는 토큰 수준 승인을 아예 우회하게 된다[^s10].

### 채택 신호

생태계 지표는 강하지만 잡음이 많고, 수치들은 범위와 날짜에 따라 충돌한다. BlockEden은 2026년 3월 기준 Base 약 1억 1,900만 건, Solana 3,500만 건의 트랜잭션과 연환산 약 6억 달러의 거래량을 보고한다 — 동시에 2025년 12월(일 73만 1천 건)에서 2026년 2월(일 5만 7천 건) 사이 일일 트랜잭션의 92% 급감을 투기적 트래픽의 퇴장으로 읽는다[^s21]. InfoQ는 2026년 1월에 프로토콜 첫 6개월간 "1억 건 이상의 결제 흐름"을 보고했다[^s19]. 재단 구성(Cloudflare 공동 설립; 다수 보도에 따르면 Google Cloud, AWS, Stripe, Vercel 등 참여)과 SDK 표면(레퍼런스 스택의 TypeScript, Go, Python; Rust 퍼실리테이터 x402-rs 같은 커뮤니티 구현)은 어느 거래량 수치를 신뢰하든 제도적 투자의 지속성을 가리킨다 _(벤더 인접 수치; 독립 감사 없음)_[^s10][^s21][^s17][^s28]. 서드파티 트래커들은 permit 경로가 레퍼런스 스택 너머로 확산되고 있음을 확증한다: t402는 `eip2612GasSponsoring` 명세 구현 작업 항목을 두고 있고, 클라이언트 이슈 트래커들은 EIP-3009 전용 서명에서 Permit2 토큰 지원으로 향하는 v1→v2 마이그레이션을 기록하고 있다[^s09][^s27].

## 한계

- **명세 변동성.** x402 v2, Permit2 자산 전송 방식, `eip2612GasSponsoring` 확장은 활발히 수정 중인 2025–2026년 산출물이다. 우리는 하나의 살아있는 명세/SDK 불일치(MaxUint vs 정확한 값 permit)를 기록했고, 프록시 컨트랙트 주소/타입 문자열에는 최근 변경을 시사하는 "감사 후(post-audit)" 주석이 붙어 있다. 본 보고서의 세부사항은 달라질 수 있다[^s05][^s18][^s04].
- **벤더 편중 출처.** 메커니즘 기술은 불가피하게 x402 자체의 명세, 문서, SDK 코드(1차 출처이나 프로젝트 호스팅)에 기댄다. 독립 구현들은 인터페이스는 확증하지만 모든 동작 주장까지 확증하지는 않는다. 채택 수치는 생태계발이고 상호 불일치하며 감사되지 않았다[^s21][^s19].
- **얇은 동료평가 기반.** 발견된 x402에 대한 학술적 논의는 2026년 arXiv 프리프린트 두 편뿐이다[^s24][^s25]. `eip2612GasSponsoring` 경로에 대한 동료평가 분석은 아직 없으며, 해당 조합에 대한 본 보고서의 보안 분석은 구성요소 수준 출처들로부터 종합한 것이다.
- **DAI 모호성 미해결.** 메인넷 DAI 적합성에 관한 EIP-2612 명세 본문과 x402 문서 간 충돌은 보고하되, 체인별 현재 DAI 배포본을 독립적으로 검증하지는 않았다[^s01][^s17].
- **실증 측정 없음.** 본 보고서는 문헌 기반이다. 퍼실리테이터를 계측하거나, 정산 지연/가스를 측정하거나, 기술된 공격을 시도하지 않았다.
