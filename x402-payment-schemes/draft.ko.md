## 서론

x402는 휴면 상태이던 HTTP 402 "Payment Required" 상태 코드를 다시 사용하여 결제를 HTTP 레벨에서 처리하는 개방형 결제 프로토콜이다. Coinbase가 발의했고 현재는 다자 벤더 기반 재단(x402 Foundation)이 거버넌스를 맡고 있다.[^s01][^s13] 설계 목표는 유료 기사, API, AI 에이전트 도구 등 모든 HTTP 자원에 대해 별도의 계정·세션·결제 인프라 없이 인라인 결제를 가능하게 하는 것이다.[^s02][^s13] 그중 **scheme(스킴)** 은 "돈이 어떻게 흐르는가"를 정의한다 — 고정가, 사용량 기반, 오프체인 채널 일괄 정산, 그리고 (제안 단계인) 지연 정산. 본 보고서는 2026년 5월 시점 정의된 모든 스킴, 각 스킴이 지원하는 네트워크, 서버/클라이언트 개발자가 마주하는 구현 선택지를 정리한다.

Coinbase 발표에 따르면 2026년 4월 말 기준 x402 누적 거래 약 1.65억 건, 누적 거래액 약 $50M, 활성 에이전트 약 6.9만 개가 보고되었다.[^s13] 다만 이는 벤더 측 수치이며, 독립 분석은 이 수치 상당 부분이 결제 활동이 아니라 "x402" 테마 밈코인 거래에 기인했다고 본다.[^s14] _(초기 신호)_

## 배경

기본 흐름은 한 번의 challenge–retry 왕복이다. 클라이언트가 자원을 요청하면 서버가 `402 Payment Required`와 함께 `PAYMENT-REQUIRED` 헤더(V2에서 이전 `X-PAYMENT-REQUIRED`를 대체)에 하나 이상의 결제 요구사항을 담아 응답한다. 클라이언트는 그중 하나를 선택해 페이로드에 서명하고 `PAYMENT-SIGNATURE` 헤더로 재요청한다. 서버는 직접 또는 facilitator(중개자)를 통해 검증·결제 정산을 수행하고, 응답에 `PAYMENT-RESPONSE` 확인을 담아 자원을 전달한다.[^s02][^s15] V2는 SDK를 재구성하여 체인과 스킴을 플러그인으로 등록하게 했고 기존 `X-*` 헤더 일부를 폐기했다.[^s12]

결제 요구사항(payment requirement)은 최소 `scheme`, `network`, `amount`, `asset`, `payTo`, `maxTimeoutSeconds` 필드와 네트워크별 메타데이터를 담는 `extra` 블록으로 구성된다.[^s01] `network`는 CAIP-2 식별자(`eip155:<chainId>`, `solana:<genesisHash>`, `tvm:<workchain>`, `aptos:<chainId>` 등)이므로 같은 헤더 계약으로 ERC-20, SPL 토큰, TON 제튼, Soroban 토큰까지 다룰 수 있다.[^s06]

Facilitator는 별도의 서비스 계층으로 두 엔드포인트를 제공한다: `/verify`는 서명된 페이로드와 결제 요구사항을 받아 광고된 `scheme`/`network`에 대해 검증 결과를 반환하고, `/settle`은 결제를 온체인에 제출하고 확정을 기다린다.[^s07] 서버가 전 과정을 직접 운영할 수도 있지만 실무에서는 핫월렛·가스 운영을 피하기 위해 facilitator(Coinbase CDP facilitator, PayAI, x402.rs, Mogami 등)에 위임하는 경우가 일반적이다.[^s14] 다수의 프로덕션 facilitator가 Base, Solana, Polygon, Avalanche 등을 지원한다.[^s07]

## 현재 정의된 스킴

2026년 5월 시점 x402 공식 명세는 세 가지 프로덕션 스킴 — `exact`, `upto`, `batch-settlement` — 을 정의한다.[^s01][^s10] 네 번째인 `deferred`는 Cloudflare가 제안한 상태이며 아직 명세에 병합되지 않았다.[^s11]

**`exact` — 고정가 단발 결제.** 구매자는 광고된 금액 그대로를 인가한다. "응답을 생성하기 전에 최종 청구액이 결정되어 있는 경우(고정가 API 호출, 파일 다운로드, 유료 페이지 등)"에 권장된다.[^s03] EVM에서는 토큰 자체의 EIP-3009 `transferWithAuthorization`이 기본값이며(예: USDC), EIP-3009를 지원하지 않는 ERC-20에 대해서는 표준 프록시 컨트랙트를 통한 Permit2 경로로 폴백한다(자세한 내용은 분석 절 참조).[^s03][^s09] EVM 외에는 Solana(SPL/Token-2022 전송), TON(서명된 W5R1 제튼 메시지), Stellar(SEP-41 `transfer()`), Aptos(`primary_fungible_store::transfer`), Hedera(HBAR/HTS Transfer Transaction)에서 구현된다.[^s06]

**`upto` — 단일 요청 사용량 기반 청구.** 구매자는 한 번 서명으로 최대치만 인가한다. 서버는 요청을 처리한 뒤 정산 시점에 실제 청구액을 선언하며 facilitator가 그 값을 서명된 최대치와 대조해 검증한다.[^s04][^s08] LLM 토큰 생성, 대역폭 미터링 등 "응답을 만들어야 비용을 안다"는 케이스를 위한 스킴이다.[^s04] 정산 오버라이드는 원자단위 정수(`"50000"`), 백분율(`"50%"`), 달러 문자열(`"$0.05"`), 또는 무료 응답을 위한 `"0"`을 허용한다.[^s04] 명세는 두 가지 절대 규칙을 둔다: 각 인가는 **최대 1회만** 정산되어야 하고, 정산 금액은 인가된 최대치를 초과해서는 안 된다.[^s08]

**`batch-settlement` — 무상태 단방향 채널.** 구매자가 1회 온체인 에스크로 예치를 하고, 이후 매 요청마다 채널의 **누적 청구 가능 총액**을 담은 voucher에 서명한다. 서버는 즉시 검증하고 응답을 제공하며 온체인 결제는 뒤로 미룬다.[^s05] 서버의 채널 매니저는 주기적으로 세 가지 배치 작업을 수행한다: **claim**(여러 voucher를 한 트랜잭션에 청구), **settle**(청구된 자금을 수신자에게 이전), **refund**(voucher 청구 후 미활성 채널에 대한 협조적 환불).[^s05] 요청 단위 `price`는 여전히 최대치이며, 명세는 갑작스러운 사용량에도 채널이 지급 능력을 유지하도록 예치금 정책으로 요청 단위 최대치의 **최소 3배, 기본 5배** 곱셈을 권고한다.[^s05] _(미검증 — 단일 출처: `scheme_batch_settlement_evm.md`의 GitHub 직접 조회는 실패했다.)_

**스킴별 네트워크.** `exact`는 EVM, Solana, TON, Stellar, Aptos, Hedera에서 동작한다. `upto`의 문서화된 변형은 EVM 전용(Permit2 기반)이며, `batch-settlement` 역시 EVM 전용이고 `eip155:84532`(Base Sepolia)에서 실제 가동되었다.[^s05][^s06]

## 제안 중인 스킴

Cloudflare의 `deferred` 스킴은 아직 병합되지 않은 제안으로, **암호학적 검증과 금융 정산을 분리**한다. 서버는 구매자의 서명된 의도를 즉시 검증하지만 실제 정산은 구독, 일일 배치, 심지어 전통 은행 채널로 나중에 처리한다.[^s11] 동기는 Cloudflare의 "pay per crawl"처럼 요청별 온체인 정산 비용이 결제액 자체를 압도하는 실제 에이전트 워크로드다.[^s11] _(초기 신호 — 벤더 제안이며 아직 정식 스킴은 아니다.)_

## 분석 — 구현 경로

### EVM에서의 `exact`: EIP-3009 vs Permit2

EVM 명세는 두 전송 경로를 문서화한다. 기본은 토큰의 EIP-3009 `transferWithAuthorization`이다. 페이로드는 `{signature, authorization{from, to, value, validAfter, validBefore, nonce}}` 형태이고 facilitator는 (a) 서명을 `from`으로 복원하고, (b) 잔액을 확인하고, (c) 인가 파라미터가 결제 요구사항과 일치하는지 확인하고, (d) 호출을 시뮬레이션한 뒤, (e) 브로드캐스트한다.[^s09] Permit2 경로는 토큰이 EIP-3009를 지원하지 않을 때 사용된다: 구매자는 `permitWitnessTransferFrom`에 서명하고 witness가 `recipient + validAfter`를 묶는다. facilitator는 표준 프록시 `x402ExactPermit2Proxy`(주소 `0x402085c248EeA27D92E8b30b2C58ed07f9E20001`)를 통해 라우팅하며, 이 프록시는 CREATE2로 모든 체인에 동일 주소로 배포되어 "facilitator가 목적지를 임의로 바꿀 수 없음"을 보장한다.[^s09] Permit2는 1회성 승인이 필요하며 직접 승인, 가스 스폰서링된 승인, 또는 토큰이 지원하는 경우 EIP-2612 permit로 처리할 수 있다.[^s09]

### EVM에서의 `upto`: 왜 Permit2만이 실용적인가

`upto`는 EIP-3009를 그대로 쓸 수 없다. 구매자가 서명하는 값은 **최대치**이고 실제 청구액이 아니며, EIP-3009에는 금액 변동을 위한 nonce/witness 메커니즘이 없기 때문이다. 그래서 EVM `upto` 구현은 Permit2의 nonce·witness 메커니즘을 활용하여 수신자와 유효 시간을 묶고, 최종 금액은 정산 시점의 선택으로 남기되 facilitator가 서명된 상한과 대조해 검증한다.[^s04][^s08] "최대 1회 정산" 규칙 때문에 최종 금액이 0이어도 nonce는 1회용으로 소비된다.[^s08]

### `batch-settlement` 운영 측면

`batch-settlement`의 서버 측 구성은 (a) 채널 저장소(단일 프로세스용 파일 기반 또는 분산 환경용 Redis), (b) claim/settle/refund 작업의 주기, (c) 요청 단위 최대치의 최소 3배·기본 5배 예치 정책 곱셈자다.[^s05] 클라이언트 측 등록은 `"eip155:*"`로 모든 EVM 체인에서 batch-settlement에 옵트인한다.[^s05]

### SDK 면

레퍼런스 SDK는 TypeScript, Python, Go다. TypeScript 스택은 `@x402/core`와 네트워크별 모듈(`@x402/evm`, `@x402/svm`), Express 미들웨어(`@x402/express`), 클라이언트용 fetch 래퍼(`@x402/fetch`)로 배포된다. Python과 Go도 대응 패키지를 제공한다.[^s10][^s02] 서버는 "광고하는 네트워크에 대한 스킴 구현을 등록"하고, 클라이언트는 "결제 가능한 네트워크에 대한 구현을 등록"한다.[^s01]

## 논의

x402는 2025년 말 Coinbase 단독 운영에서 x402 Foundation으로 이관되었다. 거버닝 바디에는 Cloudflare와 Stripe가 포함되고 창립 멤버에는 Adyen, AWS, American Express, Google, Mastercard, Microsoft, Shopify, Visa가 있다.[^s11][^s13] 2026년 초 V2 출시로 스킴/체인 등록의 플러그인 아키텍처가 정식화되었고, 요청 단위 동적 라우팅·가격이 추가되었으며, LLM 추론 루프 같은 고빈도 워크로드를 위해 "이전에 결제한 자원에 재접근 시 전체 결제 흐름을 건너뛸 수 있는" wallet-based session 개념이 도입되었다.[^s12]

핵심 채택 수치 — 약 1.65억 건, $50M, 6.9만 에이전트 — 는 조심스럽게 읽어야 한다. Bankless 분석을 인용한 독립 자료는 2025년 10월 기준 주당 약 15만~16.3만 건 거래 중 약 15만 건이 결제 활동이 아니라 PING 밈코인의 "x402" 라벨 활동이었다고 추정한다.[^s14] 진짜 효용 신호는 구체적 배치에서 온다: Pinata의 무계정 IPFS 업로드, Snack Money의 기사 단위 페이월, Questflow의 자율 마이크로트랜잭션(~13만 건), Lowe's Innovation Lab PoC, 그리고 Google이 Agent Payments Protocol 내부의 암호화폐 레일로 x402를 채택한 사례 등이다.[^s14]

도입자에게 가장 중요한 설계 선택은 "어떤 스킴을 광고할 것인가"이다. 트레이드오프는 단순하다: `exact`는 모든 것을 한 트랜잭션에 두므로 통합이 가장 쉽다. `upto`는 Permit2와 정산 시점 금액 로직이 필요하지만 LLM 워크로드의 비용 구조에 맞는다. `batch-settlement`는 다수 요청에 걸쳐 가스를 분산시키지만 채널 매니저 운영과 3~5배 예치금 락업 비용을 떠안는다. 제안 단계인 `deferred`는 "검증은 즉시, 정산은 나중"이라는 네 번째 축이지만 아직 정식 스킴이 아니다.[^s05][^s08][^s11]

## 한계

- 정식 `batch-settlement` EVM 명세 파일은 본 리서치 시점 GitHub 직접 조회에서 404를 반환했다. 위 설명은 docs.x402.org(벤더 측 1차 자료)에만 의존하며 독립된 기술적 2차 자료가 부족하다.
- `deferred` 스킴은 Cloudflare 제안이고 아직 x402 명세에 병합되지 않았다. 위에서는 "제안"으로만 다뤘다.
- 거래 수와 거래액은 모두 벤더 측 발표이며, 본 자료에서 확보한 유일한 독립 코멘트는 밈코인 기인 인플레이션을 지적한다. Bankless 원문은 직접 확보되지 않았다.
- 명세는 Permit2 프록시가 CREATE2로 모든 광고 EVM 체인에 동일 주소로 배포된다고 단언하지만, 본 리서치에서는 체인별 실제 배포 여부를 재검증하지 않았다.

## 초록

x402는 `402 Payment Required` 상태 코드를 활용하여 모든 웹 자원이 요청 흐름 안에서 암호학적 결제 인가를 요구할 수 있도록 한 HTTP 네이티브 결제 프로토콜이다. 2026년 5월 시점 세 가지 프로덕션 스킴 — `exact`(고정가 단발), `upto`(서명된 최대치를 가진 단일 요청 사용량 기반), `batch-settlement`(오프체인 누적 voucher 채널과 배치 온체인 정산) — 과 한 가지 제안 스킴인 Cloudflare의 `deferred`(검증과 정산을 분리)를 정의한다. `exact`는 가장 폭넓게 지원되어 EVM, Solana, TON, Stellar, Aptos, Hedera에서 동작하고, `upto`와 `batch-settlement`는 EVM 전용이다. EVM 구현은 가능하면 EIP-3009 `transferWithAuthorization`을, 아니면 CREATE2로 동일 주소에 배포된 `x402ExactPermit2Proxy`를 통한 Permit2 경로를 사용한다. `upto`가 Permit2를 선택한 이유는 구매자가 최종 금액을 사전 서명할 수 없기 때문이다. 프로토콜은 2025년 말 Coinbase 단독 운영에서 다자 벤더 재단으로 이관되었고, 2026년 초 V2에서 플러그인 기반 체인/스킴 등록으로 SDK가 재구성되었다. 헤드라인 채택 수치는 크지만 벤더 측 발표이며, 신뢰할 만한 독립 분석은 그 상당 부분이 결제 활동이 아닌 밈코인 거래에 의한 인플레이션이라고 지적한다.
