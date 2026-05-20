# x402 batch-settlement vs MPP session — 메커니즘 비교와 구현 분석

## 초록

본 보고서는 2026년 5월 시점에 거의 동시에 떠오른 두 HTTP 402 기반 오프체인 결제 채널 표준 — Coinbase·x402 Foundation의 **`batch-settlement` 스킴**[^s04]과 Tempo·Stripe의 **MPP `session` 인텐트**[^s14][^s20] — 를 같은 6개 축(결제 단위, 신뢰 모델, 다체인성, 거버넌스, 정산 트리거, 분쟁/환불)으로 비교한다. 두 표준은 "단건 온체인 결제로는 AI 에이전트 마이크로결제를 감당할 수 없다"는 같은 문제 의식에서 출발해, **단일 디포짓 → 누적 EIP-712 바우처 → 주기적 배치 정산**이라는 거의 같은 추상에 도달했다. 동시에 결제 단위(머천트 측 N개 vs 사용자 측 N개), 다체인성(EVM 전용 vs Tempo·Stellar·…), 거버넌스(Foundation vs IETF draft)에서는 분명한 분기가 있다. 후반부에서는 x402 Foundation 리포의 EVM 바인딩 명세[^s04]와 mppx TypeScript SDK[^s19]에서 발췌한 코드를 인용해, 두 표준을 실제 서버·클라이언트에 얹는 흐름을 단계별로 보인다.

## 1. 서론 — 두 표준이 같이 풀려는 문제

x402의 `exact` 스킴은 EIP-3009 `transferWithAuthorization` 한 번에 한 건의 USDC 결제를 정산한다[^s11]. MPP의 `charge` 인텐트도 본질적으로 같은 단건 결제다[^s12][^s14]. 두 표준 모두 시작은 단건 결제였다. 문제는 단건 결제로 LLM 토큰 단위 과금, 실시간 데이터 피드, 머신-투-머신 API 호출 같은 시나리오를 감당할 때 발생한다 — 매 요청마다 온체인 트랜잭션을 일으키면 (a) 가스 비용이 결제액보다 비싸고 (b) 블록 확정 지연이 응답 지연이 되며 (c) facilitator 비용·운용 부담이 N에 비례해 폭증한다.

두 표준은 거의 같은 시점(2026년 1분기–2분기)에 같은 답을 들고 나왔다 — "사용자가 미리 한 번 에스크로에 디포짓하고, 그 위에서 EIP-712 누적 바우처를 오프체인으로 교환하다가, 머천트(혹은 채널 매니저)가 주기적으로 배치 정산한다." x402는 이 답을 `batch-settlement` 스킴으로[^s04][^s07], MPP는 `session` 인텐트로[^s14][^s20] 표현한다. 본 보고서가 6개 축으로 두 표준을 나란히 놓고 보는 이유는, 같은 추상이 어떤 결정에서 갈라지는지를 코드와 명세 수준에서 추적하기 위함이다.

## 2. 배경 — 공통 토대

### 2.1 HTTP 402 챌린지-리트라이

두 표준은 같은 HTTP 402 위에 얹힌다. x402 V2는 `PAYMENT-REQUIRED`/`PAYMENT-SIGNATURE` 헤더를 정의하고[^s09], MPP는 `WWW-Authenticate: Payment` / `Authorization: Payment` / `Payment-Receipt` 헤더를 정의한다[^s14][^s18]. 두 헤더 컨벤션은 IETF 차원에서 부분적으로 통합 중이다 — MPP가 IETF `draft-ryan-httpauth-payment-01`로 제출되어 있고, 저자는 Tempo Labs(Brendan Ryan, Jake Moxey, Tom Meagher)와 Stripe(Jeff Weinstein, Steve Kaliski) 다섯 명이다[^s14]. x402는 RFC 직접 제출 대신 x402 Foundation 거버넌스를 택했고, 2025년 9월 Coinbase·Cloudflare 공동 설립으로 출범했다[^s10].

### 2.2 EIP-712 / EIP-3009

두 표준 모두 **EIP-712 typed-data signing**을 핵심 서명 프리미티브로 쓴다[^s22]. EVM 측 정산 함수는 양쪽 모두 EIP-3009 `transferWithAuthorization` 흐름을 부분적으로 참조하지만[^s23], 디포짓 단계에서 x402 batch-settlement는 USDC 등 EIP-3009 호환 토큰에는 `receiveWithAuthorization`을 쓰고, 그렇지 않은 ERC-20에는 **Permit2**를 폴백으로 쓴다[^s04]. MPP `session`은 채널 컨트랙트가 자체 디포짓 함수를 갖고, EIP-712 도메인을 그 컨트랙트 주소·체인 ID에 바인딩한다[^s15][^s16].

### 2.3 거버넌스의 갈림

- **x402 Foundation** — 2025년 9월 Coinbase + Cloudflare 공동 설립[^s10]. 명세는 `x402-foundation/x402` 리포의 `specs/schemes/` 아래에 모인다[^s02]. 라이선스 Apache-2.0[^s01].
- **MPP** — Tempo Labs + Stripe 공동 운영, 명세는 `tempoxyz/mpp-specs` 리포(CC0 1.0 / Apache 또는 MIT 듀얼) + `paymentauth.org` 호스팅[^s13][^s26]. IETF 드래프트 `draft-ryan-httpauth-payment-01` 만료일은 2026년 9월 19일[^s14].

## 3. x402 batch-settlement 심층 분석

### 3.1 스킴의 자리와 출시 시점

x402의 정식 스킴은 2026년 5월 기준으로 `exact`, `upto`, `batch-settlement` 셋이고, Cloudflare가 `deferred`를 제안 중이다[^s06]. 그중 `batch-settlement`는 2026년 5월 13일에 정식 발표되었고[^s07][^s08], 단일 디포짓 + 오프체인 누적 바우처 + 주기적 배치 정산이라는 모델로 "0.0001달러 미만의 마이크로결제"를 가능하게 한다는 명시적 목표를 갖는다[^s24][^s25]. 같은 리포는 Foundation 출범 이전 `coinbase/x402`에서 미러링되어 운영되고 있다[^s21].

x402 Foundation 리포의 `specs/schemes/batch-settlement/`에는 세 문서가 있다[^s02]:

- `scheme_batch_settlement.md` — 개념 명세(네트워크 비특화).
- `scheme_batch_settlement_evm.md` — EVM 바인딩.
- `scheme_batch_settlement_cloudflare.md` — Cloudflare가 Merchant of Record가 되어 식별 가능한 에이전트에 청구하는 변종.

### 3.2 세 단계 — Commit / Accumulate / Redeem

개념 명세는 모든 batch-settlement 바인딩이 따라야 할 3단계 생명주기를 정의한다.

> "The client produces a cryptographic payment commitment and attaches it to the request. The commitment is validated and stored. The resource is served immediately."[^s03]
>
> "The network retains the commitment in a voucher store, channel state, account ledger, or billing system."[^s03]
>
> "Value is transferred out of band through an onchain contract call, a channel close, a fiat batch invoice, or any rail the network defines."[^s03]

개념 명세는 두 신뢰 모델(capital-backed = 사용자가 온체인에 자금을 락업, credit-backed = 식별 가능한 사용자가 사후 청구)을 명시적으로 허용한다[^s03]. EVM 바인딩은 capital-backed이고, Cloudflare 바인딩은 credit-backed이다[^s04][^s05].

### 3.3 EVM 바인딩 — channelId, ChannelConfig, 바우처

EVM 바인딩 명세[^s04]에 따르면, 채널의 정체성은 다음 한 줄로 정의된다.

```text
channelId = EIP712Hash(ChannelConfig)
```

`ChannelConfig`는 (a) `payer` (b) `payerAuthorizer` (서명용 EOA, EIP-1271 호환 시 zero) (c) `receiver` (d) `receiverAuthorizer` (claim/refund 권한자) (e) `token` (ERC-20) (f) `withdrawDelay` (15분–30일 강제 구간) (g) `salt`의 7개 필드를 담고, "x402 Batch Settlement" EIP-712 도메인 안에서 해시된다[^s04]. 도메인은 `chainId`와 배포된 `x402BatchSettlement` 컨트랙트 주소에 바인딩되어, 같은 ChannelConfig라도 체인이 다르면 다른 channelId를 갖는다[^s04].

바우처(Voucher)는 다음 두 필드를 EIP-712로 서명한다[^s04]:

- `channelId` — 위에서 파생한 값.
- `maxClaimableAmount` — **단조 증가**하는 누적 상한.

서버는 자기 채널 상태로 `chargedCumulativeAmount`를 유지하고, "새 바우처의 ceiling이 (이전 charged cumulative + 이번 요청량)과 같은가"를 검증한다[^s04]. 즉 바우처는 "다음 한 번의 요청까지를 포함한 누적 한도"를 매번 갱신하는 셈이다 — 이 ceiling 모델 덕분에 같은 요청이 두 번 청구되지 않으면서도 채널 잔액의 단조성이 유지된다.

### 3.4 디포짓 — ERC-3009 또는 Permit2

명세는 디포짓 자체에 두 가지 가스리스 방법을 정의한다[^s04]:

1. **ERC-3009 `receiveWithAuthorization`** — USDC 등 EIP-3009 호환 토큰.
2. **Permit2** — 일반 ERC-20 폴백.

두 방법 모두 카노니컬 배포 주소를 가진 collector 컨트랙트를 통해 제출된다[^s04]:

- `ERC3009DepositCollector`: `0x4020806089470a89826cB9fB1f4059150b550004`
- `Permit2DepositCollector`: `0x4020425FAf3B746C082C2f942b4E5159887B0005`

이 덕분에 사용자가 미리 `approve()` 트랜잭션을 보낼 필요가 없고, 페이마스터가 facilitator 측에서 가스를 후원하면 사용자는 토큰만 보유하면 된다 — Cointelegraph의 표현으로는 "deposits, batched settlements and refunds are all sponsored by the transaction's facilitator"[^s07].

### 3.5 claim / settle / refund / 강제 withdraw

EVM 바인딩의 정산 함수는 네 가지로 분리된다[^s04].

- **claim** — `claimWithSignature`로 다수 채널의 다수 바우처를 한 번에 검증하고 채널별 `totalClaimed`를 갱신한다. 이 단계에서 **토큰 이체는 일어나지 않는다.** 릴레이 친화 변종으로 `receiverAuthorizer`가 EIP-712 `ClaimBatch`에 서명해 위임할 수 있다[^s04].
- **settle** — `receiver`+`token` 페어의 누적 미정산분을 한 트랜잭션으로 전송한다. **퍼미션리스**다[^s04].
- **refund** — 협조적 환불. `receiver` 측이 `balance - totalClaimed` 까지를 `payer`에게 돌려보낸다. EIP-712로 위임 가능하고, refund nonce는 금액 캡 적용 전에 증가하므로 0 환불 요청도 nonce를 진행시킨다[^s04].
- **timed withdrawal (escape hatch)** — `payer`가 grace period(15분–30일)를 시작하면, 그 안에 server가 vouchers를 claim해야 한다. 이후 `finalizeWithdraw`로 잔여 미청구 escrow가 사용자에게 돌아간다[^s04].

명세는 server 측에 세 가지 정산 전략을 제시한다: 주기 배치(N분), 임계치 트리거, 강제 withdraw 직전 청구[^s04]. server는 사실상 **채널 상태 보관자**다 — facilitator의 운용 부담을 머천트 측 channel manager로 옮겨 둔 셈이다.

### 3.6 다토큰성과 EVM 한정

핵심 차별점은 **모든 EVM ERC-20에 동작한다**는 것이다. Cointelegraph 보도는 "AI agents using batch settlement will be able to accept any Ethereum-native ERC-20 tokens, not just stablecoins"고 명시한다[^s07]. 이는 EIP-3009를 직접 요구하지 않고 Permit2 폴백을 갖춘 덕이다. 다만 batch-settlement는 EVM 전용이다 — x402 docs는 "x402 supports the batch-settlement scheme on EVM" 한 줄로 못박는다[^s06].

## 4. MPP session 심층 분석

### 4.1 인텐트의 자리

MPP는 인텐트 단위로 결제 패턴을 분류한다. mppx TypeScript SDK는 `charge`, `stream`, `session`, `free` 네 인텐트를 노출한다[^s19]. 그 중 `session`은 "Multiple paid requests over a single payment channel"이라는 정의로[^s19], 본 보고서가 비교 대상으로 삼는 채널 결제 모델이다.

### 4.2 단방향 채널 + 누적 commitment

Stellar developer docs의 MPP Session Guide는 모델을 다음과 같이 정리한다.

> "The funder deposits tokens once, then makes many off-chain payments by signing cumulative commitments."[^s15]
>
> "Each commitment is cumulative. The server tracks the highest commitment it has seen; closing the channel batch-settles all payments in a single on-chain transaction."[^s15]

즉 MPP `session`은 (1) 사전 디포짓 → (2) 오프체인에서 EIP-712 누적 commitment 서명 교환 → (3) 채널 close 시 가장 높은 commitment로 단일 정산이라는 흐름이다. server는 "지금까지 본 가장 높은 commitment"만 보존하면 되므로 상태가 단순하다[^s15].

### 4.3 Tempo 체인 결합과 SSE 흐름

MPP `session`은 Tempo 체인의 특수 능력(sub-second finality, 결제 메모, 수수료 후원, TIP-20)과 강하게 결합되어 있다. Tempo docs의 "Accept streamed payments"는 server-side 흐름을 다음과 같이 설명한다.

> "If the channel balance runs out mid-stream, the server emits a payment-need-voucher event and the client automatically signs a new voucher."[^s16]

`stream`은 본질적으로 `session` 위에 Server-Sent Events를 얹어 토큰 단위 과금을 가능하게 한 확장이다. mpp.dev의 가이드는 같은 흐름을 LLM 토큰 단위 과금 시나리오로 보여 준다[^s17].

### 4.4 다체인성과 IETF 표준화

MPP `session`은 처음부터 다체인성을 전제하고 설계되었다. Stellar는 Soroban 컨트랙트로 자체 구현을 제공하고[^s15], Tempo는 자체 메인넷에서 `TempoStreamChannel` 에스크로 컨트랙트를 제공한다[^s16]. Stripe docs는 같은 인텐트 위에 카드 / SPT / Lightning 같은 비-EVM 레일을 끼워 넣는 방법을 설명한다[^s18]. 표준 자체는 IETF `draft-ryan-httpauth-payment-01`로 제출되어 있고, 인텐트별 method 정의는 paymentauth.org에서 함께 호스팅된다[^s14][^s26].

### 4.5 보안: mpp-rs 사례

MPP `session`의 모델이 안전한 것과, 그것을 구현한 특정 SDK가 안전한 것은 별개의 문제다. 2026년의 GHSA-fxc9-7j2w-vx54 advisory는 mpp-rs라는 Rust SDK에서 "tempo/session handler가 active·paid 상태를 강제하지 못해 무한 세션 생성이 가능"한 결함을 보고했다[^s31]. 이는 프로토콜이 아니라 그 구현의 버그지만, server 측 회계 모델이 channel state를 정확히 유지하지 못하면 어떤 결제 채널 표준이든 같은 종류의 위협에 노출된다는 것을 보여 준다.

## 5. 비교 — 6개 축

| 축 | x402 batch-settlement | MPP session |
|---|---|---|
| 결제 단위 (트래픽 방향) | **머천트 1 × 사용자 N** — receiver+token 페어의 모든 채널을 한 번에 claim/settle 하는 모델[^s04] | **사용자 1 × 머천트 1** — 한 사용자가 한 channel을 한 머천트에 대해 운영, server는 highest commitment만 보존[^s15] |
| 신뢰 모델 | EVM 바인딩은 capital-backed(에스크로). Cloudflare 바인딩은 credit-backed(MoR)[^s04][^s05] | capital-backed 단방향 채널. Tempo 외에 Stellar에서도 동일 패턴[^s15][^s16] |
| 다체인성 | EVM 전용 (Base, Ethereum 등 EVM 호환 ERC-20 전체)[^s06][^s07] | Tempo · Stellar · Stripe 카드/SPT 등 다체인·다레일[^s14][^s15][^s16][^s18] |
| 거버넌스 | x402 Foundation (Coinbase + Cloudflare, 2025-09 설립), `x402-foundation/x402` Apache-2.0[^s01][^s10] | Tempo Labs + Stripe, `tempoxyz/mpp-specs` CC0 1.0, IETF `draft-ryan-httpauth-payment-01`[^s13][^s14][^s26] |
| 정산 트리거 | claim → settle 두 단계 분리. claim은 무이체, settle은 퍼미션리스 일괄 이체[^s04] | server-side close 한 단계. 가장 높은 commitment를 한 트랜잭션으로 정산[^s15] |
| 분쟁 / 환불 | 협조적 refund + timed withdrawal escape hatch(15분–30일)[^s04] | server가 임의 시점에 close하는 모델; 명세는 dispute 절차를 별도 규정하지 않고 신뢰된 server를 전제[^s15][^s20] |

핵심 차이는 **결제 단위의 트래픽 방향**이다. x402 batch-settlement는 "한 머천트가 다수 사용자에게서 받은 다수 바우처를 한 번에 처리"하는 시나리오(API 서버, 에이전트 다수가 같은 endpoint를 호출)에 자연스럽고[^s04], MPP `session`은 "한 사용자가 한 머천트에 대해 운영하는 단일 채널"(에이전트가 특정 LLM endpoint에 길게 머무는 경우)에 자연스럽다[^s15]. 두 표준 모두 단방향 채널을 정의하지만 그 위에 얹는 시나리오가 다르다 _(interpretive)_[^s07][^s20].

## 6. 구현 패턴 — 코드 레벨 톺아보기

### 6.1 x402 서버 측 — paymentMiddleware + batch-settlement 스킴 등록

x402 V2의 Express 예시는 `paymentMiddleware`로 라우트별 결제 요구사항을 선언하고, `x402ResourceServer.register(network, scheme)`로 스킴을 등록한다[^s27]. 동일 리포의 advanced server 예시(all_networks, bazaar, hooks, dynamic-price, eip2612-gas-sponsoring 등)는 같은 미들웨어가 다체인·후크·가스 후원 등 V2 확장과 결합되는 방식을 보여 준다[^s28]. 일반적인 `exact` 등록은 다음과 같다.

```typescript
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();
app.use(
  paymentMiddleware(
    {
      "GET /your-endpoint": {
        accepts: {
          scheme: "exact",
          price: "$0.10",
          network: "eip155:84532",
          payTo: evmAddress,
        },
        description: "Your endpoint",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(
      new HTTPFacilitatorClient({ url: facilitatorUrl }),
    ).register("eip155:84532", new ExactEvmScheme()),
  ),
);
```

`batch-settlement`로 전환하려면 (개념적으로) 같은 자리에 `BatchSettlementEvmScheme`을 등록하고, 라우트의 `accepts`에서 `scheme: "batch-settlement"`로 바꾼다. server 측에는 추가로 (a) **channel storage**(단일 프로세스는 파일, 분산 배포는 Redis), (b) **batch cadence**(주기 / 임계치 / withdraw-직전 트리거 중 하나), (c) **deposit policy multiplier**(per-request maximum의 3× 최소, 5× 기본 권장)를 설정해야 한다 — 이 세 항목은 본 보고서의 자매 보고서[`x402-payment-schemes`](../x402-payment-schemes/)와 명세 본문[^s04]에서 권장 값으로 정리된 것이다. server는 결국 자기 측 **channel manager** 역할을 맡아 누적 바우처를 보관하고 주기적으로 `claimWithSignature` + `settle`을 부른다[^s04].

### 6.2 사용자 측 — 디포짓 → 누적 바우처 서명

사용자 측 흐름은 다음 세 단계로 압축된다[^s04][^s07].

1. **Open / top up channel** — `ERC3009DepositCollector` 또는 `Permit2DepositCollector`를 통해 ChannelConfig를 만들고 USDC(또는 임의 ERC-20)를 디포짓한다. 사용자는 `approve()` 트랜잭션을 보낼 필요가 없다.
2. **Per-request voucher** — 매 요청마다 (channelId, maxClaimableAmount = 이전 chargedCumulativeAmount + 이번 요청량) 을 EIP-712로 서명한다.
3. **Optional withdraw** — 사용을 마치면 `initiateWithdraw` → 15분~30일 grace period 후 `finalizeWithdraw`로 남은 잔액을 회수한다. 서버가 비협조적이면 grace 안에 claim하지 않을 경우 사용자가 잔액 전부를 회수할 수 있다.

이 흐름의 디자인 포인트는 **사용자가 같은 server를 다시 쓸 때 디포짓은 한 번만**이라는 것이다. 1주일에 한 번씩 30일 grace로 채널을 운영하면, 한 사용자가 같은 머천트에 보내는 수천 건의 마이크로결제가 (디포짓 1 + 정산 1) = 2건의 온체인 트랜잭션으로 끝난다.

### 6.3 MPP `session` 클라이언트 — `tempo.session()` + `.sse()`

mpp.dev의 streamed-payments 가이드는 클라이언트 흐름을 다음 한 블록으로 보여 준다.

```typescript
const session = tempo.session({
  account: privateKeyToAccount("0x..."),
  maxDeposit: "1", // Lock up to 1 pathUSD per channel
});

const stream = await session.sse("http://localhost:3000/api/sessions/poem");

for await (const word of stream) {
  process.stdout.write(word + " ");
}

await session.close(); // Settle and reclaim unspent deposit
```

이 한 블록 안에 (1) channel open + 디포짓 (2) SSE 연결과 동시에 토큰 단위 과금 (3) channel close + 미사용 잔액 회수의 전체 생명주기가 들어 있다[^s17]. `session.sse()`는 server가 보내는 `payment-need-voucher` 이벤트를 받아 새 바우처를 자동 서명하므로, 잔액이 한 번 비더라도 스트림이 끊기지 않는다[^s16][^s17]. WebSocket이 필요한 대화형 시나리오에서는 `.sse()` 대신 `.ws()`를 사용하고, "vouchers and content travel over a single socket rather than separate HTTP requests"가 된다[^s17].

### 6.4 MPP server 측 — 누적 commitment 검증 → close

Stellar developer docs의 MPP Session Guide는 server 측을 다음과 같이 정리한다.

> "Server (`@stellar/mpp/channel/server`): Validates ed25519 signatures via Soroban simulation."[^s15]
> "Client (`@stellar/mpp/channel/client`): Signs commitments with the private key; handles automatic 402 responses."[^s15]
> "Close function: Submits settlement using the highest cumulative amount and corresponding signature."[^s15]

EVM에서는 ed25519 대신 EIP-712 + ecrecover를 쓰지만 server 측 로직은 동일하다 — server는 들어오는 각 commitment를 검증하고 자기 측의 `highestCommitment`를 갱신하고, close 시점에 그 최고값으로 단일 트랜잭션을 부른다[^s15][^s20]. 본 보고서의 자매 보고서[`mpp-session-mechanism`](../mpp-session-mechanism/)에는 `TempoStreamChannel` 컨트랙트의 정확한 메인넷·테스트넷 주소와 channelId 파생식이 별도로 기록되어 있다.

### 6.5 두 흐름을 옆에 놓고 보면

같은 추상이지만 코드의 결이 다르다.

- **server 책임의 크기** — x402 batch-settlement는 server에 **다수 사용자의 다수 채널 상태**를 관리하라고 요구한다(channel storage, cadence, multiplier). MPP `session`은 server에 **단일 사용자의 단일 채널 highest commitment**만 보관하라고 요구한다.
- **클라이언트 추상의 결** — x402는 server가 매번 `accepts`로 결제 요구사항을 선언하면 클라이언트가 그에 맞게 바우처를 서명하는 "프로토콜 자체 추상"이고, MPP는 `tempo.session()` 같은 SDK 한 줄이 전체 생명주기를 감싸는 "SDK 추상"이 일차다. 두 표준 모두 다른 쪽 추상도 노출하지만, 출발점이 다르다.
- **다체인 시 코드 갈림** — x402는 `network: "eip155:84532"` 같은 CAIP-2 식별자로 EVM 안에서만 갈라지고, MPP는 `tempo.session()` / Stellar `@stellar/mpp/channel` / Stripe `stripe.charge()`처럼 메서드 단위로 코드가 완전히 갈린다.

## 7. 논의 — 어떤 표준을 언제 쓰는가

### 7.1 결제 시나리오별 적합성

(interpretive) 두 표준의 설계 결정은 자연스러운 적합성을 만든다.

- **단일 endpoint에 N명의 에이전트가 같은 요금으로 결제** — x402 batch-settlement가 자연스럽다. 머천트 측 channel manager가 다수 채널을 한 번에 claim/settle하는 모델이 그대로 맞아 들어간다[^s04][^s07].
- **한 에이전트가 한 LLM endpoint에 길게 머무르며 토큰 단위 과금** — MPP `stream`/`session`이 자연스럽다. SSE/WebSocket 위에 `payment-need-voucher` 이벤트를 얹어 단일 채널을 길게 운영한다[^s16][^s17].
- **카드/SPT/스테이블코인이 같은 endpoint에 섞이는 시나리오** — MPP가 우세하다. `WWW-Authenticate: Payment` 여러 줄로 결제 방법을 동시에 광고하는 패턴이 명세에 박혀 있다[^s18].
- **임의 ERC-20을 결제 자산으로 받기** — x402 batch-settlement가 우세하다. Permit2 폴백으로 EIP-3009 미호환 토큰도 가스리스 디포짓이 가능하다[^s04][^s07].

### 7.2 두 표준의 잠재적 결합

장기적으로는 **같은 SDK 어댑터 안에서 두 표준이 결합**될 가능성이 분석가 사이에서 거론된다 _(interpretive)_. x402 측에서는 "Enable EIP-4337 Smart Wallet / UserOperation Support in x402 Protocol" 이슈가 공개되어 있고[^s30], MPP 측에서는 `mpp-specs`가 인텐트·메서드의 직교성을 명시적으로 설계 원칙으로 둔다[^s13]. 한 SDK가 "x402 `batch-settlement` + MPP `session`" 같은 다중 인텐트를 동시 노출하는 것은 사양 수준에서 막혀 있지 않다.

### 7.3 표준 단편화의 비용

두 표준은 서로의 거버넌스에 직접 들어가 있지는 않다. x402 Foundation 명세는 Apache-2.0이지만 RFC는 아니고[^s01], MPP는 IETF 드래프트지만 RFC 승격까지는 시간이 걸린다[^s14]. 머천트 입장에서는 (a) "내 사용자가 어떤 표준 SDK를 들고 들어올지" 모른다는 단편화 비용과, (b) "그 비용을 어댑터 한 겹으로 흡수할 수 있다"는 추상의 수렴이 동시에 있다.

## 8. 한계

- 본 보고서는 2026년 5월 20일 시점의 1차 사양과 SDK 문서를 기준으로 한다. x402 V2와 MPP 인텐트 정의는 빠르게 변동 중이라, 특정 버전 이후의 필드/함수 명세는 향후 갱신될 가능성이 있다.
- batch-settlement TypeScript / Go 구현체의 정확한 패키지 경로와 entry-point는 GitHub UI를 통한 raw 접근이 일부 차단되어, 본 보고서의 코드 인용은 명세 문서[^s04]와 카노니컬 `paymentMiddleware` 예시[^s27]에서 재구성되었다.
- MPP `session` 인텐트의 `session.md` 명세는 `raw.githubusercontent.com` 경로에서 직접 접근되지 않아, 본 보고서는 Stellar 가이드[^s15], Tempo docs[^s16], mpp.dev 가이드[^s17][^s20]를 1차 자료로 삼는다. 자매 보고서[`mpp-session-mechanism`](../mpp-session-mechanism/)에 동일 인텐트의 더 깊은 인용이 있다.
- 본 보고서는 두 표준을 1차 비교 대상으로 삼았다. Lightning Network 채널, Solana state-channel 변종, 또는 ERC-7824 같은 인접 패밀리는 별도 보고서가 필요하다.
- 일부 정량 수치(예: x402 batch-settlement의 sub-cent micropayment 주장)는 vendor가 발표한 값이며 독립 감사를 거치지 않은 점을 본문에 명시했다.
