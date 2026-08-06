## 초록

머신 결제 프로토콜(Machine Payments Protocol, MPP)에서 *메서드(method)* 는 HTTP 402 교환 뒤에 놓인 구체적인 결제 레일을 가리키는 용어다. MPP는 레일에 종속된 모든 요소를 코어에서 밀어내고, 메서드마다 지켜야 할 계약 — 와이어 식별자, 요청 스키마, 크리덴셜 페이로드 스키마, 검증 절차, 정산 절차 — 만 남겼다.[^s17][^s05] 이 보고서는 MPP가 기본 제공하지 않는 레일을 추가하려면 실제로 무엇을 해야 하는지를 다룬다. 레퍼런스 TypeScript SDK인 `mppx`의 확장 지점 — 공유 정의를 만드는 `Method.from()`, 크리덴셜 생성을 담당하는 `Method.toClient()`, 서버 수명주기를 담당하는 `Method.toServer()`[^s02][^s01] — 을 정리하고, `strict` TypeScript로 컴파일하고 `mppx` 0.8.15에서 실제로 실행한 완전한 커스텀 메서드를 제시한다. 실행 결과에는 실제 402 챌린지, 정산된 영수증, 거부된 재전송(replay), 거부된 위조 챌린지가 모두 포함된다.

세 가지 발견이 이 그림을 한정한다. 첫째, 정산 계약이 최근 바뀌었는데 프로젝트의 두 문서 표면이 아직 수렴하지 않았다. 0.8.14에서 결합형 `verify` 훅이 비변경(non-mutating) `validate` 와 종단(terminal) `broadcast` 로 분리되면서 사용 중단(deprecated) 처리되었고, `Method.toServer`의 옵션 타입은 둘 중 하나만 받는 판별 유니온이 되었다.[^s22][^s02] API 레퍼런스는 이를 반영해 `verify` 를 "레거시"로 표시하지만,[^s33] 새 구현자가 가장 먼저 도달하는 서술형 커스텀 메서드 가이드는 여전히 `verify` 만 가르친다.[^s01] 둘째, 이 확장 지점은 문서상으로만이 아니라 실제로 열려 있다. Stellar, Solana Foundation, 그리고 개인 개발자가 각각 독립 패키지로 MPP 메서드를 배포했고, NEAR Intents 메서드 초안은 외부 저자가 명세 저장소에 제출했다.[^s25][^s30][^s27][^s28] 셋째, 신뢰 경계는 전적으로 메서드 안에 있다. 코어 초안은 단일 사용(single-use) 증명 의미론을 "결제 메서드 인프라"의 책임으로 규정하고, SDK의 서버 디스패치는 HMAC 챌린지 출처 검증과 라우트 바인딩은 제공하지만 크리덴셜 소비 저장소는 제공하지 않는다. 재전송 방어는 구현자가 직접 해야 하는 작업이다.[^s03][^s10][^s32] 이 조건에서 새 레일의 엔지니어링 비용은 크지 않지만, 정확성에 대한 부담은 결코 작지 않다.

## 서론

2026년 3월 18일에 출시되었고 Stripe가 "Tempo와 Stripe의 공동 저술"이라 밝힌[^s35][^s16] MPP는, 오랫동안 잠들어 있던 HTTP `402 Payment Required` 상태 코드를, 돈이 실제로 어떻게 움직이는지에 대해 의도적으로 무관심한 챌린지–크리덴셜–영수증 교환으로 표준화한다.[^s16][^s18] 그 무관심이 설계의 전부다. 코어 명세는 HTTP 의미론과 헤더, 레지스트리를 다루고, 별도의 계층이 *인텐트(intent)* — charge, subscription 같은 추상적 결제 패턴 — 를, 세 번째 계층이 *메서드* — Tempo, Stripe, Solana 같은 구체적 레일 — 를 다룬다.[^s23] Cloudflare의 독립 문서도 같은 해석에 도달해 MPP를 "결제 수단 비종속적(payment-method agnostic)"이라 설명하며, 하나의 서비스가 여러 메서드를 동시에 제공할 수 있다고 적는다.[^s15]

이 보고서가 답하려는 질문은 "MPP란 무엇인가"보다 좁다. **필요한 레일이 기본 제공 목록에 없다면, 무엇을 만들어야 하고, 어디에 꽂히며, 무엇이 잘못될 수 있는가?**

답은 두 가지가 있고 서로 다른 계층에서 작동한다. 명세 수준의 답은 공개된 템플릿에 맞춰 메서드 초안을 작성하고 `mpp-specs` 저장소에 풀 리퀘스트를 여는 것이다.[^s06][^s05] 구현 수준의 답은 SDK의 `Method` API로 메서드 객체를 만들어 양쪽 `Mppx.create()`에 넘기고, 나머지는 아무것도 바꾸지 않는 것이다.[^s01][^s02] 둘은 대안이 아니라 상보적이다. 전자는 다른 사람의 클라이언트와의 상호운용성을 사고, 후자는 오늘 오후에 동작하는 결제 흐름을 산다. 이 보고서의 대부분은 코드가 있는 후자를 다루지만, 6장에서 전자로 돌아온다.

범위: 주된 구현 표면은 `mppx`이고, 와이어 계약은 `Payment` HTTP 인증 스킴이다. Rust SDK와의 언어 간 대칭성은 검토하되 전수 감사하지는 않았다. 레일 간 경제성 비교나 Tempo 체인 자체에 대한 평가는 다루지 않는다. 모든 SDK 관련 발견은 `mppx` 0.8.15와 2026-08-06 시점의 저장소 상태에 고정되어 있으며, 그 고정의 대가는 8장에서 밝힌다.

## 배경 — MPP의 메서드 추상화

### 와이어 교환

MPP 교환에는 헤더가 셋 있다. 결제를 요구하는 서버는 `402`와 함께 `WWW-Authenticate: Payment` 챌린지로 응답하고, 클라이언트는 `Authorization: Payment` 크리덴셜을 담아 재시도하며, 성공 응답은 `Payment-Receipt`를 실을 수 있다.[^s17][^s21] 챌린지는 표준 RFC 9110 auth-param 목록이며 필수 파라미터는 `id`, `realm`, `method`, `intent`, `request` 다섯 개이고 `expires`, `digest`, `description`, `opaque`가 선택이다.[^s03] `request` 파라미터는 JSON Canonicalization Scheme으로 직렬화된 뒤 base64url로 인코딩된다. 이 점이 커스텀 메서드에 중요한 이유는, 여러분의 요청 스키마가 코어가 결코 해석하지 않는 불투명한 블롭으로 운반된다는 뜻이기 때문이다.[^s03]

이 중 두 파라미터가 확장을 실어 나른다.

- **`method`** 는 레일의 이름이다. 코어 초안의 수집 ABNF에서 문법은 `payment-method-id = 1*LOWERALPHA`이고 `LOWERALPHA`는 `%x61-7A`, 즉 **소문자 알파벳만** 허용된다. 숫자도 하이픈도 안 된다.[^s03][^s04]
- **`intent`** 는 결제 패턴의 이름이며, `1*( ALPHA / DIGIT / "-" )` 로 문법이 더 느슨하다.[^s03]

이 두 사실에서 끌어낼 추론은 이렇다. 메서드 이름은 헤더 속 문자열일 뿐이고 요청 본문은 코어가 결코 해석하지 않는 불투명한 블롭일 뿐이므로, 새 메서드에 합의한 서버와 클라이언트는 코어를 전혀 바꾸지 않은 채 수정되지 않은 MPP 인프라 위에서 거래할 수 있다. 서드파티 메서드가 애초에 가능한 구조적 이유가 여기에 있으며, 아래 절들은 이 추론을 실제로 배포된 메서드들에 대조해 검증한다.

크리덴셜은 챌린지를 거울처럼 반영한다. `Authorization: Payment <base64url-nopad>` 는 되돌려 담은 `challenge`, 메서드별 `payload`, 그리고 명세가 DID 형식을 권고하는 선택적 `source` 지불자 식별자를 담은 객체로 디코딩된다.[^s03] 영수증도 마찬가지로 base64url JSON이며 `status`, `method`, `timestamp`, `reference`를 싣는다.[^s03][^s08]

### 계층 구조, 그리고 "가산적"이라는 말의 의미

`mpp-specs` 저장소는 core / intents / methods / extensions 로 구성되며, 코어는 "HTTP 402 의미론, 헤더, IANA 레지스트리"를, 메서드는 "특정 네트워크를 위한 구체적 구현"을 담는다.[^s23] 따라서 새 레일은 코어를 편집하는 일이 아니라 `specs/methods/` 에 *문서를 하나 추가하는* 일이며, 기여 가이드는 "New method"를 곧장 메서드 템플릿으로 안내한다.[^s06]

인텐트 계층은 더 제약적이다. SDK 상수 테이블에 실린 인텐트는 `charge`, `session`, `subscription` 이고,[^s21] 메서드 템플릿은 `charge`를 REQUIRED, `authorize`와 `subscription`을 OPTIONAL로 둔다.[^s05] 그럼에도 메서드는 *새* 인텐트를 정의할 수 있으며, 프로젝트는 이를 **실험적(experimental)** 으로 분류한다. 메서드 명세 안에서만 정의된 인텐트는 실험적이고, 둘 이상의 메서드가 구현하면 `specs/intents/` 로 승격된다.[^s06] 정직하게 요약하면, 인텐트는 커스텀 메서드가 재사용하도록 기대되는 작고 선별된 집합이며, 새로 추가하는 경로는 문서화되어 있으나 의도적으로 느리다.

### 기본 제공 메서드에 특권은 없다

확장 지점이 실재한다는 가장 확실한 증거는 기본 제공 메서드들이 그것을 쓴다는 사실이다. `mppx`의 EVM charge 메서드는 사람이 읽을 수 있는 금액을 받아 와이어 값으로 변환하는 `z.pipe` 요청 스키마를 가진 평범한 `Method.from()` 호출이다.[^s11]

```ts
export const charge = Method.from({
  name: Types.paymentMethod,
  intent: Types.chargeIntent,
  schema: {
    credential: { payload: Types.ChargePayloadSchema },
    request: z.pipe(
      Types.ChargeRequestInputSchema,
      z.transform(({ amount, decimals, currency, recipient, chainId, ...request }) => ({
        ...request,
        amount: parseUnits(amount, decimals).toString(),
        currency: getAddress(currency),
        recipient: getAddress(recipient),
        methodDetails: { chainId, decimals },
      })),
    ),
  },
})
```

서드파티가 접근할 수 없는 비공개 인터페이스는 여기에 없다. SDK 자체 테스트 스위트는 같은 방식으로 `mock`이라는 일회용 메서드를 정의하고,[^s12] Stellar가 배포한 SDK도 같은 방식으로 `name: 'stellar'`를 정의한다.[^s26]

## 확장 표면

### 공유 정의

`Method.from()` 은 평범한 객체를 받아 그대로 돌려준다. 동작이 아니라 타입 추론을 위해 존재한다. `Method` 타입에는 의미 있는 필드가 정확히 네 개 있다(브라우저용 결제 페이지를 위한 선택적 `html` 블록 제외).[^s02]

```ts
export type Method = {
  name: string
  html?: Html.Options | undefined
  intent: string
  schema: {
    credential: { payload: z.ZodMiniType }
    request: z.ZodMiniType<Record<string, unknown>>
  }
}
```

이 객체가 계약이며, 양쪽 절반이 모두 임포트하는 모듈에 두어야 한다. `name`과 `intent`는 와이어 식별자가 되고, `schema.request`는 서버가 챌린지에 담는 내용을, `schema.credential.payload`는 클라이언트가 크리덴셜에 담는 내용을 규정한다.[^s01]

기본 제공 메서드에서 가져올 만한 스키마 관례가 둘 있다. 최상위 필드 이름으로 `amount`, `currency`, `recipient`를 쓰라. SDK의 기본 크리덴셜–라우트 바인딩이 정확히 이 셋을 *코어* 바인딩 필드로 인식하고,[^s10] 독립적으로 작성된 Stellar 메서드도 같은 셋을 쓴다.[^s26] 레일 고유 항목은 `methodDetails` 객체 아래에 중첩하라. 이는 스키마 충돌을 피하기 위한 문서상의 권고이자[^s01] 기본 제공 EVM 메서드와 서드파티 Stellar 메서드가 실제로 하는 방식이다.[^s11][^s26]

### 클라이언트 절반

`Method.toClient()` 는 함수 하나를 요구한다. `createCredential`은 파싱된 챌린지를 받아 직렬화된 크리덴셜 문자열을 반환한다.[^s02]

```ts
export type CreateCredentialFn<method extends Method, context = unknown> = (
  parameters: { challenge: Challenge.Challenge<...> } & (...),
) => Promise<string>
```

`Credential.serialize({ challenge, payload, source? })` 가 그 문자열을 만들며, 되돌려 담은 챌린지와 페이로드를 함께 base64url로 인코딩한다.[^s07][^s13] 동작을 다듬는 옵션이 둘 있다. `context`는 호출별 파라미터를 위한 Zod 스키마로 SDK가 `createCredential` 호출 전에 검증하고, `canHandleChallenge`는 여러 클라이언트 구현이 동일한 와이어 method/intent 쌍을 공유할 때 쓰는 서술자다.[^s02] 호출별 컨텍스트는 fetch init 객체의 `context` 필드로 전달한다.

### 서버 절반

`Method.toServer()` 에 수명주기가 있고, 최근 SDK가 모양을 바꾼 지점도 여기다. 과거에는 서버 메서드가 훅 하나, `verify`를 제공했고 이것이 증명 검사와 결제 정산을 모두 했다.[^s01] `mppx` 0.8.14부터 이 훅은 2단계 분리를 위해 사용 중단되었고, 옵션 타입은 판별 유니온이 되었다. **`{ broadcast, validate? }` 또는 `{ verify }` 중 하나만** 넘길 수 있으며 둘 다는 안 된다.[^s02][^s22]

```ts
| { broadcast: BroadcastFn<method>; validate?: ValidateFn<method>; verify?: undefined }
| { broadcast?: undefined; validate?: undefined; /** @deprecated */ verify: VerifyFn<method> }
```

SDK 자체 주석이 근거를 밝힌다. `validate`는 "결제 상태를 정산하거나 예약하거나 소비해서는 안 되며", `broadcast`는 "종단 결제 연산을 수행"하고, 결합형 훅은 "결제 상태를 변경할 수 있어 안전한 검증 전용 엔드포인트를 지원할 수 없다".[^s02] 이 분리 덕분에 비파괴적 사전 점검인 `mppx.validateCredential()` 이 가능해진다. 내부적으로는 새 쌍만 제공하면 SDK가 `validate` 후 `broadcast`를 호출하는 `verify`를 합성하므로 이후 디스패치는 변하지 않는다.[^s02]

**프로젝트의 두 문서 표면이 이 점에서 서로 다르다.** `Method.toServer` API 레퍼런스는 최신 상태다. `validate` 를 "결제 상태를 정산·예약·브로드캐스트하거나 소비하지 않고 크리덴셜을 검증한다", `broadcast` 를 "결제를 완료하고 영수증을 반환한다", `verify` 를 "레거시 결합형 검증·정산 함수. 새 메서드에는 `validate` 와 `broadcast` 를 사용하라" 로 기술한다.[^s33] 같은 날 읽은 `mpp.dev/payment-methods/custom` 의 서술형 커스텀 메서드 가이드는 여전히 `Method.toServer(lightning, { async verify({ credential }) { ... } })` 를 가르치며 두 새 훅을 전혀 언급하지 않는다.[^s01] 가이드의 형태도 여전히 컴파일되고 동작한다 — 다만 유니온의 사용 중단된 분기를 선택할 뿐이다. 대부분의 구현자가 먼저 닿는 진입점이 이 가이드이므로, 옛 형태를 배우게 되리라 예상하고 레퍼런스와 교차 확인하는 편이 좋다.

정산 외에도 서버 옵션은 각기 다른 역할을 가진 선택적 훅 집합을 노출한다. 아래 표는 SDK 타입 정의에서 도출한 것으로,[^s02] 레퍼런스 페이지의 목록보다 넓다. `authorize`, `preflight`, `stableBinding`, `alias`, `extensions`, `html` 은 타입에는 있으나 레퍼런스 페이지에는 문서화되어 있지 않다.[^s33]

| 훅 | 실행 시점 | 목적 |
|---|---|---|
| `request` | 챌린지 발급 전, 그리고 재제출 시 다시 | 요청 필드 보강·정규화 — 예: 인보이스 발행 |
| `defaults` | 챌린지 구성 시 | 요청 필드를 미리 채워 라우트마다 반복하지 않게 함 |
| `authorize` | 정규화 후, 402 경로 전 | 기존 상태(예: 활성 구독)로 접근 허용, 새 크리덴셜 불필요 |
| `preflight` | 챌린지/검증 경로 전 | 메서드 고유 관리 요청을 직접 응답 |
| `canOffer` | 설정된 오퍼당 1회 | 해당 요청에 대해 이 메서드의 오퍼를 철회 |
| `respond` | 정산 성공 후 | Response를 직접 반환하고 `withReceipt()`를 단락 |
| `stableBinding` | 크리덴셜 바인딩 | `request` 훅 변환을 거쳐도 고정되어야 할 필드 선언 |
| `alias`, `extensions`, `transport`, `html` | — | 등록 이름, 임의 부가 데이터, 트랜스포트 재정의, 브라우저 결제 페이지 |

`request` 훅은 두 번 호출된다는 점 때문에 강조할 가치가 있다. 최초 402에서 한 번, 크리덴셜 재제출에서 또 한 번 실행되며, SDK는 두 번째 호출에 `credential`을 넘겨 구분할 수 있게 한다. SDK 자체 테스트는 트랜스포트가 요청을 정확히 두 번 캡처함을 단언한다.[^s12] 문서가 밝히는 귀결은, 인보이스 발행처럼 부수 효과가 있는 준비 작업은 멱등해야 한다는 것이다.[^s01]

### `defaults`: 알아둘 만한 런타임/타입 수준 괴리

가이드는 `defaults`를 "호출 지점에서 요청 파라미터를 선택적으로 만드는" 수단으로 소개한다.[^s01] 런타임에서는 정확히 그렇다. `defaults: { currency: 'usd', recipient: 'acct_merchant_1' }` 로 선언한 라우트를 `mppx.charge({ amount: '1.50' })` 로 호출하자 디코딩된 요청이 `{"amount":"150","currency":"usd","methodDetails":{"decimals":2},"recipient":"acct_merchant_1"}` 인 챌린지가 생성되었다. 이 결과를 비롯해 "실행"으로 귀속된 이 보고서의 모든 측정치는 인용된 출처가 아니라 일차 실험 증거이며, 코드·컴파일러 출력·런타임 로그를 이 보고서의 `working/verification/` 디렉터리에 커밋해 재현할 수 있게 했다.

그러나 `mppx` 0.8.15의 타입 수준에서는 그렇지 않다. 같은 호출을 `strict`로 컴파일하면 실패한다.

```
error TS2345: Argument of type '{ amount: string; }' is not assignable to parameter of type
'Options<Server<..., {}, undefined, {}, undefined>, {}>'.
  Type '{ amount: string; }' is missing the following properties: currency, recipient
```

출력된 `Server<...>` 타입의 `{}` 가 진단이다. `Method.toServer`의 `defaults` 타입 파라미터는 `options` 인자와 별도의 추론 지점이라 `{}` 로 붕괴하고, `WithDefaults` 매핑이 적용되지 않는다. 타입 인자를 명시적으로 주면 해결되며, 아래는 깨끗하게 컴파일된다.

```ts
const defaults = { currency: 'usd', recipient: 'acct_merchant_1' } as const

const ledger = Method.toServer<typeof charge, typeof defaults>(charge, {
  defaults,
  // ...
})
```

이는 명시적 제네릭 유무 각각에 대해, 그리고 평범한 객체 스키마와 `z.pipe` 스키마 각각에 대해 컴파일과 실행으로 확인했다. _(구현 하나, 버전 하나 — 설계 의도가 아니라 0.8.15의 특이점으로 다루는 것이 안전하다.)_

## 구현 — 실제로 동작하는 커스텀 메서드

아래 예제는 완결된 `ledger` 메서드다. 블록체인도, 외부 결제 처리사도, 퍼실리테이터도 없는 사내 선불 잔액 레일이다. 의도적으로 심심하게 만들었다. 흥미로운 부분은 배관이기 때문이다. 전체 파일과 컴파일러 출력, 런타임 출력은 이 보고서의 `working/verification/` 디렉터리에 있다.

**검증 상태.** 이 코드는 `mppx` 0.8.15에 대해 `tsc --strict`로 컴파일했고(오류 없음), `tsx`로 실행했다. 아래 인용된 출력은 그 실행의 실제 출력이며 예시가 아니다.

### 1단계 — 공유 정의

양쪽 절반이 이 모듈을 임포트한다. 명세에 부합하는 이름(`ledger` — 소문자 알파벳만), 사람이 읽는 `"1.50"` 을 받아 기본 단위 `"150"` 을 내보내는 `z.pipe` 요청 스키마, 레일 고유 필드를 위한 `methodDetails` 에 주목하라.

```ts
import { Credential, Method, Receipt, z } from 'mppx'

export const charge = Method.from({
  name: 'ledger',
  intent: 'charge',
  schema: {
    credential: {
      payload: z.object({
        nonce: z.string(),
        signature: z.string(),
        type: z.literal('balance-debit'),
      }),
    },
    request: z.pipe(
      z.object({
        amount: z.string(),
        currency: z.string(),
        decimals: z.optional(z.number()),
        recipient: z.string(),
      }),
      z.transform(({ amount, currency, decimals = 2, recipient }) => ({
        amount: parseUnits(amount, decimals),
        currency: currency.toLowerCase(),
        methodDetails: { decimals },
        recipient,
      })),
    ),
  },
})

/** 정수 전용 기본 단위 변환. 돈에 Number()를 쓰지 말 것. */
function parseUnits(value: string, decimals: number): string {
  const [whole = '0', frac = ''] = value.split('.')
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  return (BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || '0')).toString()
}

/** 지불자가 서명하는 정확한 바이트열. 증명을 챌린지·금액·수취인에 결속한다. */
export function signingMessage(p: {
  amount: string
  challengeId: string
  nonce: string
  recipient: string
}) {
  return Buffer.from(`ledger:v1:${p.challengeId}:${p.amount}:${p.recipient}:${p.nonce}`)
}
```

서명 메시지가 이 메서드 전체의 보안 핵심이므로, 각 구성 요소가 왜 있는지 밝혀둘 가치가 있다. `challengeId`는 서명을 특정 챌린지 하나에 결속해 증명이 다른 요청으로 옮겨지지 못하게 한다. SDK는 이 id를 `realm|method|intent|request|expires|digest|opaque` 에 대한 HMAC-SHA256으로 계산하므로 공격자가 고를 수 없다.[^s09] `amount`와 `recipient`는 지불자의 의사를 결속해, 탈취된 서버가 서명의 대상을 바꿔치기하지 못하게 한다. `nonce`는 지불자 자신의 중복 제거를 위한 핸들이다.

### 2단계 — 클라이언트 절반

팩토리가 지불자의 키를 클로저로 감싼다. 기본 제공 메서드와 서드파티 메서드가 취하는 구조다.[^s26]

```ts
import { sign } from 'node:crypto'
import { Credential, Method, z } from 'mppx'
import { charge, signingMessage } from './Methods.js'

export function ledger(parameters: { account: { id: string; key: KeyObject } }) {
  const { account } = parameters
  return Method.toClient(charge, {
    context: z.object({ maxAmount: z.optional(z.string()) }),
    async createCredential({ challenge, context }) {
      const { amount, recipient } = challenge.request

      // 서버가 제시한 견적에 대해 평가되는 클라이언트 측 지출 한도.
      if (context?.maxAmount && BigInt(amount) > BigInt(context.maxAmount))
        throw new Error(`quote ${amount} exceeds maxAmount ${context.maxAmount}`)

      const nonce = `n-${challenge.id.slice(0, 8)}`
      const signature = sign(
        null,
        signingMessage({ amount, challengeId: challenge.id, nonce, recipient }),
        account.key,
      ).toString('base64url')

      return Credential.serialize({
        challenge,
        payload: { nonce, signature, type: 'balance-debit' as const },
        source: `did:web:ledger.example#${account.id}`,
      })
    },
  })
}
```

지출 한도는 `context`가 있어야 할 자리다. 선언된 Zod 스키마로 `createCredential` 실행 전에 검증되고,[^s02] 챌린지가 파싱된 뒤에 검사가 이뤄지므로 에이전트는 추정치가 아니라 서버의 실제 견적과 비교하게 된다.

### 3단계 — 서버 절반

`validate` / `broadcast` 형태다. `validate`는 순수하다. 크리덴셜이 수용 가능함을 증명할 뿐 아무것도 건드리지 않는다. `broadcast`는 상태가 움직이는 유일한 지점이다.

```ts
import { verify } from 'node:crypto'
import { Method, Receipt } from 'mppx'
import { charge, signingMessage } from './Methods.js'

const defaults = { currency: 'usd', recipient: 'acct_merchant_1' } as const

export function ledger(parameters: { accounts: Accounts; store: AtomicStore }) {
  const { accounts, store } = parameters

  function resolveAccount(source: string | undefined) {
    const id = source?.split('#')[1]
    const account = id ? accounts.get(id) : undefined
    if (!id || !account) throw new Error('unknown payer account')
    return { account, id }
  }

  return Method.toServer<typeof charge, typeof defaults>(charge, {
    defaults,

    // 기본 바인딩은 amount/currency/recipient만 고정한다. request 훅 변환이
    // 소수 자릿수를 조용히 바꾸지 못하도록 `decimals`를 추가한다.
    stableBinding(request) {
      return {
        amount: request.amount,
        currency: request.currency,
        decimals: request.methodDetails.decimals,
        recipient: request.recipient,
      }
    },

    // 비변경. 결제 상태를 정산·예약·소비해서는 안 된다.
    async validate({ credential }) {
      const { challenge, payload, source } = credential
      const { amount, recipient } = challenge.request
      const { account, id } = resolveAccount(source)

      const ok = verify(
        null,
        signingMessage({ amount, challengeId: challenge.id, nonce: payload.nonce, recipient }),
        account.pubkey,
        Buffer.from(payload.signature, 'base64url'),
      )
      if (!ok) throw new Error('invalid ledger authorisation signature')
      if (account.balance < BigInt(amount)) throw new Error('insufficient ledger balance')

      return {
        challenge,
        credential,
        details: { accountId: id, availableBalance: account.balance.toString() },
        intent: 'charge' as const,
        method: 'ledger' as const,
        request: challenge.request,
        source,
      }
    },

    // 종단. 챌린지를 선점한 뒤 정확히 한 번만 돈을 옮긴다.
    async broadcast({ credential }) {
      const { challenge, source } = credential
      const { amount } = challenge.request
      const { account, id } = resolveAccount(source)

      // 재전송 방어: 챌린지 id에 대한 원자적 compare-and-set.
      const claim = await store.update(`ledger:challenge:${challenge.id}`, (current) =>
        current
          ? { op: 'noop' as const, result: 'replay' as const }
          : {
              op: 'set' as const,
              result: 'claimed' as const,
              value: { claimedAt: new Date().toISOString() },
            },
      )
      if (claim === 'replay') throw new Error('challenge already settled — replay rejected')

      account.balance -= BigInt(amount)
      accounts.set(id, account)

      return Receipt.from({
        externalId: id,
        method: 'ledger',
        reference: `ldg_${challenge.id.slice(0, 12)}`,
        status: 'success',
        timestamp: new Date().toISOString(),
      })
    },
  })
}
```

`Receipt.from()` 은 필수 필드가 `method`, `reference`, `status`, RFC 3339 `timestamp` 이고 `externalId`와 `subscriptionId`가 선택인 스키마로 검증한다. `status`는 리터럴 `'success'` 인데, 실패는 실패한 영수증이 아니라 402와 Problem Details로 전달되기 때문이다.[^s08] 알려지지 않은 필드는 파싱·직렬화 왕복에서 보존되므로 메서드가 자체 필드를 추가할 수 있다.[^s08]

이 분리가 들여오는 주의점이 하나 있다. **`validate` 결과는 권고적일 뿐, `broadcast` 시점에도 여전히 성립한다는 보증이 아니다.** API 레퍼런스가 명시한다 — "이전 `validate` 결과는 권고적이므로, 종단 연산 전에 외부 상태나 온체인 상태를 다시 검증하라."[^s33] 두 훅은 별개의 호출이므로 `validate` 에서 확인한 것이 `broadcast` 실행 시점에는 바뀌어 있을 수 있다. 위 예제에서 `validate` 의 잔액 검사는 권위가 아니라 빠른 거절 수단이다. `broadcast` 는 차감 전에 챌린지를 원자적으로 선점하며, 프로덕션 버전이라면 한 훅에서 잔액을 읽고 다른 훅에서 쓰는 대신 차감과 잔액 단언을 하나의 원자적 연산으로 수행해야 한다. `validate` 는 작업을 아껴주는 사전 점검으로 다루고, 실제로 반드시 성립해야 하는 불변식은 모두 종단 연산 안에 두라.

저장소 관용구는 여기서 발명한 것이 아니라 실제 배포된 메서드에서 가져왔다. Stellar의 서버 charge 메서드는 원자적 저장소 없이는 생성 자체를 거부하며 — "재전송 방어를 위해 `update()` 를 통한 compare-and-set 의미론을 제공하는 원자적 저장소가 필요하다" — 정산 작업 전에 위와 똑같이 compare-and-set으로 `challenge.id` 를 선점한다.[^s32]

### 4단계 — 양쪽 배선

커스텀 메서드라고 해서 `Mppx.create()` 에 달라지는 것은 없다. README가 기본 제공 Tempo 메서드에 대해 보여주는 호출과 같은 모양이고, `methods` 배열에 든 객체만 다르다.[^s24] 통합의 전부가 이것이다.

```ts
// 서버
const mppx = ServerMppx.create({
  methods: [ledgerServer({ accounts, store: Store.memory() })],
  realm: 'api.example.com',
  secretKey: process.env.MPP_SECRET_KEY!,
})

async function app(request: Request): Promise<Response> {
  const result = await mppx.charge({ amount: '1.50' })(request)
  if (result.status === 402) return result.challenge
  return result.withReceipt(Response.json({ data: 'the paid resource' }))
}

// 클라이언트
const client = ClientMppx.create({
  methods: [ledgerClient({ account: { id: 'alice', key: privateKey } })],
  polyfill: false,   // 생략하면 전역 fetch를 패치한다
})

const response = await client.fetch('https://api.example.com/resource', {
  context: { maxAmount: '500' },
})
```

`mppx.charge(...)` 는 인텐트 이름을 딴 핸들러이며, 여러 메서드가 이름을 공유하면 SDK는 `handler['<name>/<intent>']` 형태도 노출한다.[^s12] `Store.memory()` 는 다섯 개의 기본 제공 저장소 생성자 중 하나이며, 모듈은 `cloudflare`, `redis`, `upstash` 와 범용 `from` 도 익스포트한다.[^s37] 메모리 저장소는 상태를 프로세스 안에 두므로 재시작을 견디지 못하고 인스턴스 간에 공유되지도 않는다. 아래의 재전송 방어가 그 둘을 가로질러 유지되어야 한다면 지속성 있는 저장소를 고르라.

### 실행했을 때 실제로 일어난 일

**미결제 요청** 은 커스텀 메서드를 명시한 챌린지를 만들었다.

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment id="5xgDTLEF1cB2sOql7mB5qgsuXfLWoWmrr_HjvQFHr0A",
    realm="api.example.com", method="ledger", intent="charge",
    request="eyJhbW91bnQiOiIxNTAiLCJjdXJyZW5jeSI6InVzZCIsIm1ldGhvZERldGFpbHMiOnsiZGVjaW1hbHMiOjJ9LCJyZWNpcGllbnQiOiJhY2N0X21lcmNoYW50XzEifQ",
    expires="2026-08-06T02:33:14.865Z"
```

`request` 를 디코딩하면 `{"amount":"150","currency":"usd","methodDetails":{"decimals":2},"recipient":"acct_merchant_1"}` 로, `z.pipe` 변환과 런타임 `defaults` 가 모두 출력에 드러난다.

**결제된 요청** 은 영수증과 함께 200을 반환했고, 지불자 잔액은 기본 단위 1000에서 850으로 움직였다.

```
status: 200
decoded receipt: {
  method: 'ledger',
  reference: 'ldg_BTa8NRa--cMq',
  externalId: 'alice',
  status: 'success',
  timestamp: '2026-08-06T02:28:14.871Z'
}
body: { data: 'the paid resource' }
```

**재전송된 크리덴셜** — 바이트 단위로 동일한 `Authorization` 헤더를 두 번 제출 — 은 한 번 성공한 뒤 실패했고, 잔액은 정확히 한 번만 차감되었다.

```
first use  status: 200
second use status: 402
second body: {
  type: 'https://paymentauth.org/problems/verification-failed',
  title: 'Verification Failed', status: 402,
  detail: 'Payment verification failed.'
}
```

**위조된 챌린지** — 유효한 챌린지의 `amount` 를 `1` 로 낮춰 편집한 뒤 크리덴셜로 직렬화 — 는 메서드 자체 코드가 실행되기도 전에 SDK의 HMAC 출처 검사에서 거부되었다.[^s09][^s10]

```
forged status: 402 {
  type: 'https://paymentauth.org/problems/invalid-challenge',
  title: 'Invalid Challenge', status: 402,
  detail: 'Challenge "2TsW..." is invalid: challenge was not issued by this server.'
}
```

마지막 결과가 SDK가 얼마나 해주는지를 가늠하는 데 유용하다. 챌린지 변조는 프레임워크가 잡는다. 재전송은 잡지 않는다 — 메서드가 잡았고, 그 메서드가 직접 공급해야 했던 저장소를 사용했다.

### 변형

- **먼저 무언가를 발행해야 하는 레일** — Lightning 인보이스, 호스팅 체크아웃 세션 — 은 `request` 훅으로 챌린지 발급 전에 요청을 보강하며, 훅이 재제출 때 다시 실행되므로 그 발행은 멱등해야 한다.[^s01][^s12]
- **관리 연산이 있는 레일** — 채널 개설·종료 — 은 `respond` 로 Response를 직접 반환해 `withReceipt()` 를 단락시킨다.[^s02]
- **때때로 거절해야 하는 레일** — 특정 요청에 사용할 수 없는 메서드 — 은 `canOffer` 로 다른 메서드의 오퍼는 남긴 채 자기 오퍼만 철회한다.[^s02]

## 패키징, 디스커버리, 상호운용성

### 인라인 대 배포

가이드는 두 경로를 든다. 애플리케이션 안에 메서드를 인라인으로 정의하거나, 생태계 재사용을 위해 독립 npm 모듈로 패키징하는 것이다.[^s01] 권장 패키지 레이아웃은 공유 정의 모듈에 `./client` 와 `./server` 하위 경로 익스포트를 더한 형태이며, 애플리케이션이 단일 인스턴스를 공유하도록 `mppx` 를 peer dependency로 선언하고, 소비자가 한 곳에서 임포트하도록 `Mppx` 자체를 재익스포트한다.[^s01]

실제 배포된 서드파티 패키지들이 이를 확인하면서 동시에 다듬는다. `@stellar/mpp` 는 `mppx` 를 peer dependency로 선언하고 `.`, `./charge`, `./charge/client`, `./charge/server`, `./channel`, `./channel/client`, `./channel/server` 를 익스포트한다.[^s25] 동일한 공유/클라이언트/서버 분할이되 한 단계 더 중첩해 인텐트마다 자기 트리를 갖는다. 소스도 같은 구조로, `sdk/src/charge/Methods.ts` 가 `Method.from()` 정의를, `charge/client/Methods.ts` 와 `charge/server/Charge.ts` 가 두 절반을 담는다.[^s26][^s32] 인텐트를 둘 이상 지원하는 메서드라면 인텐트별 중첩이 더 나은 패턴이다.

### 디스커버리

결제로부터의 거리가 서로 다른 세 가지 기제가 작동한다.

요청 시점에는 클라이언트가 자신이 무엇으로 지불할 수 있는지 광고한다. `Accept-Payment` 는 선택적 q-값과 함께 `method/intent` 토큰을 싣고 — `Accept-Payment: tempo/charge, stripe/charge;q=0.5` — 여러 메서드를 지원하는 서버는 그에 따라 챌린지를 정렬할 수 있다.[^s03] `mppx` 클라이언트는 `AcceptPayment.resolve(methods, config.paymentPreferences)` 로 등록된 메서드에서 이 헤더를 자동 생성하므로,[^s29] 커스텀 메서드는 등록 절차 없이 서버에 대해 발견 가능해진다.

402 자체에서는 서버가 제공하는 method/intent 쌍마다 하나씩 여러 `WWW-Authenticate: Payment` 챌린지를 내보내 클라이언트가 고르게 할 수 있다.[^s03]

요청 이전 단계에서는 디스커버리 확장이 `x-service-info` 와 `x-payment-info` 로 주석된 OpenAPI 문서를 정의해 가격, 결제 메서드, 인텐트 유형을 기술한다 — 다만 "런타임 402 챌린지가 모든 결제 파라미터에 대해 여전히 권위를 갖는다"고 못박는다.[^s19] 커스텀 메서드는 거기에 다른 메서드와 똑같이 하나의 결제 오퍼로 등장한다. 이 초안이 Tempo Labs와 Merit Systems 두 조직에 걸쳐 공동 저술되었다는 점은[^s19] 확장 계층이 순수한 단일 벤더 영역이 아니라는 작은 신호이기도 하다.

### 이름 짓기, 그리고 아직 존재하지 않는 레지스트리

코어 초안은 RFC 8126의 **Specification Required** 정책 아래 IANA "HTTP Payment Methods" 레지스트리를 설립하며, 소문자 ASCII 알파벳 메서드 식별자, 설명, 명세 포인터, 등록자 연락처를 요구하고, 레지스트리가 "처음에는 비어 있다"고 명시한다.[^s04] 메서드 템플릿의 IANA 절은 바로 그 등록을 위해 미리 작성되어 있다.[^s05]

그러나 레지스트리는 제안된 것이지 운영되는 것이 아니며, 이는 추론이 아니라 IANA에서 직접 확인할 수 있다. IANA HTTP 인증 스킴 레지스트리에는 현재 열여섯 개 스킴 — Basic, Bearer, Concealed, Digest, DPoP, GNAP, HOBA, Mutual, Negotiate, OAuth, PrivateToken, SCRAM 변종들, vapid — 이 등재되어 있고 **"Payment" 는 그 안에 없다.** 해당 페이지는 "HTTP Payment Methods" 레지스트리를 참조하지도 않는다.[^s34] 이유는 초안 자체의 상태에서 드러난다. IETF Datatracker는 `draft-ryan-httpauth-payment` 를 리비전 01, 제출일 2026년 3월 18일, 만료일 2026년 9월 19일로 기록하며 stream은 null, 의도된 표준 수준도 null, group은 1027 — "Individual Submissions" 로 해석된다 — 이다.[^s31] 어떤 워킹 그룹에도 채택되지 않은 개인 제출물이다.

실질적 귀결은 이렇다. **이 조사에서 관찰된 어떤 레지스트리나 도구도 두 구현자가 각자 `name: 'bank'` 를 배포하는 것을 막지 못한다.** 유일성은 관례와, 사실상의 조율 지점 역할을 하는 `mpp-specs` 저장소로 유지된다.

이름 규칙에는 적합성 함정도 있다. ABNF는 소문자 알파벳만 허용하는데,[^s03][^s04] 공식 가이드의 패키지 SDK 예제는 `name: 'my-method'` 를 쓴다. 하이픈이 들어 있어 `1*LOWERALPHA` 를 만족하지 못한다.[^s01] 이 보고서에서 살펴본 모든 서드파티 메서드는 `stellar` 처럼[^s26] 순수한 소문자 한 단어를 쓴다. 위 예제의 `ledger` 도 마찬가지다. 소문자 한 단어를 고르라.

### 실제로 누가 이 위에 만들고 있는가

확장 지점의 채택은 확인 가능하며, Tempo 바깥으로 뻗어 있다.

| 산출물 | 저자 | 근거 |
|---|---|---|
| `@stellar/mpp` v0.7.1 | Stellar Development Foundation | `mppx ^0.6.29` peer 의존; charge + channel 인텐트[^s25][^s26] |
| `solana-foundation/mpp-sdk` | Solana Foundation | MPP를 위한 Solana 결제 메서드[^s30] |
| `mppx-hedera` v0.2.2 | 개인 개발자 | "네이티브 Hedera 결제 메서드… charge + session 인텐트, 퍼실리테이터 없음"; 최초 배포 2026-04-11[^s27] |
| `draft-nearintents-charge-01` | Near One | `mpp-specs` 내, `submissiontype: independent`[^s28] |

`mpp-specs` 트리에는 tempo, evm, stripe와 함께 lightning, card, usdc, hedera, solana, stellar 메서드 초안도 실려 있다.[^s23] 이들은 구현 산출물이지 사용량 통계가 아니다. 실제 트랜잭션 볼륨에 대해서는 아무것도 말해주지 않는다.

### 언어 간: Rust SDK는 대칭이 아니다

`mpp-rs` 도 서드파티 확장 표면을 노출하고 문서화한다. `ChargeMethod` 트레이트에는 "커스텀 결제 네트워크를 위한 구현"이라는 제목의 완결된 예제가 붙어 있다.[^s14] 다만 추상화의 모양이 다르다. Rust 트레이트는 **인텐트 범위** — `ChargeMethod`, `SessionMethod` — 이고, 각각 고정된 타입의 요청 스키마를 강제한다. 소스가 이를 설계 원칙으로 명시한다.

> 인텐트("charge")는 공유 스키마(`ChargeRequest`)를 정의하고, 메서드(예: "tempo")는 그 스키마에 대한 검증을 구현한다. … 모든 구현이 동일한 `ChargeRequest` 스키마를 사용해 IETF 명세에 따른 일관된 필드 이름을 강제한다.[^s14]

반면 `mppx` 는 메서드마다 임의의 요청 스키마를 선언하게 한다.[^s02] Rust 설계는 메서드 간 일관성을 사고 스키마 자유도를 포기한다. TypeScript 설계는 그 반대다. `ChargeRequest` 바깥의 요청 필드가 필요한 메서드는 TypeScript에서는 간단하고 Rust에서는 제약을 받는다. _(트레이트 정의로부터 성격을 규정한 것이며, Rust 서버 통합 전체는 감사하지 않았다 — 8장 참조.)_

## 보안 및 설계 분석

### SDK의 몫, 그리고 여러분의 몫

경계를 정확히 짚어둘 가치가 있다. 프레임워크가 실제로 어디서 멈추는지를 보기 전까지는 가이드의 경고가 일반론처럼 읽히기 때문이다.

**SDK가 처리하는 것:** 챌린지 출처 검증. `realm|method|intent|request|expires|digest|opaque` 에 대한 HMAC-SHA256 챌린지 id로, 재제출 시 상태 없이 검증된다 — "데이터베이스 조회가 필요 없다".[^s09][^s10] 라우트 바인딩. 저렴한 라우트에서 발급된 크리덴셜을 비싼 라우트에 제시할 수 없게 하며, SDK 테스트가 바로 이 "라우트 간 스코프 혼동" 사례를 다룬다.[^s12] 챌린지 만료. 페이로드 스키마 파싱. 그리고 본문이 있는 요청에는 크리덴셜을 요청 본문에 결속하는 선택적 RFC 9530 콘텐츠 다이제스트 파라미터.[^s03]

**여러분의 메서드가 처리하는 것:** 결제가 진짜인지에 관한 모든 것. 코어 명세는 단일 사용 의미론이 레일의 몫임을 명시한다 — "이 명세와 함께 사용되는 결제 메서드는 반드시 단일 사용 증명 의미론을 제공해야 한다. 결제 증명은 정확히 한 번만 사용 가능해야 하며… 동일 증명의 이후 사용 시도는 결제 메서드 인프라가 반드시 거부해야 한다."[^s03] `mppx` 의 서버 디스패치 경로를 읽으면 HMAC 출처 검사와 바인딩 검사는 있으나 크리덴셜 소비 저장소는 없고,[^s10] 이 보고서를 위한 실행이 그 귀결을 직접 확인했다. 위조 챌린지는 프레임워크가 거부했고, 재전송은 예제 메서드가 원자적 저장소에서 `challenge.id` 를 선점했기 때문에만 거부되었다. Stellar의 프로덕션 메서드도 독립적으로 같은 결론에 도달해, 원자적 저장소를 생성 전제 조건으로 요구하고 챌린지 id와 트랜잭션 해시 양쪽에서 중복을 제거한다.[^s32]

요컨대 **`validate` 와 `broadcast` 가 결제 진위에 대한 신뢰 경계의 전부다.** "항상 유효하지 않은 증명을 거부하라… 증명 검증 없이 성공을 반환하지 말라"는 지침은[^s01] 상투구가 아니다. 프레임워크에는 영수증을 반환한 메서드를 재검토할 수단이 없다.

### 설계로 대비할 만한 실패 유형

**챌린지는 공개된다.** 요청 필드는 `WWW-Authenticate` 헤더로 직렬화되어 지불자에게 건네지므로,[^s09][^s03] `schema.request` 안의 모든 것이 노출된다. API 키와 개인 키를 요청 필드에 두지 말라는 가이드의 지시는[^s01] 관례가 아니라 와이어 형식에서 곧바로 따라 나온다.

**바인딩은 여러분의 스키마보다 좁다.** `stableBinding` 이 없으면 SDK는 `amount`, `currency`, `recipient` 와 `methodDetails` 아래의 `chainId`, `memo`, `sessionProtocol`, `splits`, `unitType` 를 고정한다.[^s10] 여러분이 새로 만든 다른 필드 — 위 예제의 `decimals` — 는 그 이차 검사의 대상이 *아니다*. SDK는 HMAC 바인딩이 일차 무결성 검사이고 `stableBinding` 은 `request()` 훅이 크리덴셜에 의존하는 출력을 낼 때를 위한 "이차 안전망"이라고 밝힌다.[^s10] 실용적 규칙: 지불자가 낼 금액을 바꾸는 필드라면 `stableBinding` 에 선언하라.

**돈은 `Number` 가 아니다.** 금액은 기본 단위의 십진 문자열로 와이어를 건넌다. 살펴본 모든 스키마에서 `amount: z.string()` 이고,[^s11][^s26] 기본 제공 EVM 메서드는 `parseUnits` 를 쓴다.[^s11] 가이드의 규칙은 `parseUnits`/`formatUnits` 를 쓰고 `Number()` 를 쓰지 말라는 것이다.[^s01] 위 예제가 `BigInt` 산술을 쓰는 이유도 같다.

**`request` 는 두 번 실행된다.** 멱등성 키 없이 `request` 훅 안에서 인보이스를 발행하거나 재고를 예약하거나 세션을 열면, 결제 한 건마다 두 번 하게 된다.[^s01][^s12]

**정산과 검증을 분리하라.** `verify` 를 쓰더라도 0.8.14의 근거는 새겨둘 가치가 있다. 결제 상태를 변경하는 훅은 사전 점검으로 안전하게 호출될 수 없다.[^s02] 둘을 융합한 메서드는 "이 크리덴셜이 통할까?"를 소비하지 않고 답할 능력을 잃는다.

**언어 간·버전 간 표류.** 메서드 식별자는 벌거벗은 문자열이다. `ledger` 를 독립적으로 구현한 둘은 와이어에서 조용히 충돌하며, 오늘 그것을 막을 레지스트리는 없다.[^s31]

## 한계

**버전 고정.** 모든 SDK 관련 발견은 `mppx` 0.8.15와 2026-08-06 시점의 저장소 상태에 고정되어 있다. 이 패키지는 1.0 이전이고, 최초 배포는 2026-02-12, 마지막 수정은 이 보고서 작성 전날이다.[^s20] 가장 최근 두 릴리스 사이에 서버 훅 집합에 `validate`, `broadcast`, `canOffer` 가 추가되고 `verify` 가 사용 중단되었다.[^s02][^s22] 여기 있는 어떤 것도 안정적인 API 계약이 아니며, 예제 코드는 마이너 버전이 오를 때마다 기계적 수정이 필요하리라 예상해야 한다.

**서술형 가이드가 API 레퍼런스보다 뒤처져 있다.** 이는 "문서가 낡았다" 보다 좁은 진술이다. `Method.toServer` API 레퍼런스는 최신이며 `verify` 를 레거시로 표시하고,[^s33] `validateCredential` 과 비변경 사전 점검을 다루는 전용 페이지도 있다.[^s36] 사용 중단된 `verify` 만 가르치는 것은 구체적으로 `mpp.dev/payment-methods/custom` 의 커스텀 메서드 가이드다.[^s01] 셋 모두 2026-08-06에 읽었다. 이 보고서는 이 지연이 의도적인지 판정하려 하지 않는다.

**명세에 공식적 지위가 없다.** `draft-ryan-httpauth-payment-01` 은 어떤 IETF 워킹 그룹에도 채택되지 않은 개인 제출물이며 2026년 9월 19일 만료된다.[^s31] 메서드 식별자 문법, 인텐트 집합, 레지스트리 정책 모두 RFC 발행 전에 — 혹은 발행 대신 — 바뀔 수 있다. 규범적으로 들리는 MUST들은 당분간 벤더 진술로 읽어야 한다.

**재전송 방어에 관한 부재의 증거.** `mppx` 가 단일 사용 크리덴셜을 강제하지 않는다는 주장은, 서버 디스패치 경로를 읽고 소비 저장소를 찾지 못한 것,[^s10] 실행에서 관찰된 동작, 그리고 서드파티 메서드가 자체 방어를 구축한 사실에[^s32] 기댄다. 근거는 탄탄하지만 여전히 SDK 한 계층에서의 부재 논증이며, 향후 릴리스가 범용 방어를 추가할 수도 있다.

**언어 간 동등성은 성격 규정이지 감사가 아니다.** `mpp-rs` 관련 발견은 `ChargeMethod` 와 `SessionMethod` 트레이트 정의에 기댄다.[^s14] Rust 서버 통합 전체를 읽지 않았으므로 "요청 스키마 측면에서 덜 유연하다"는 것은 트레이트 시그니처에 대한 진술이지 SDK에 대한 평결이 아니다.

**채택 폭은 측정되지 않았다.** 서드파티 메서드 패키지가 실재하고 버전이 매겨져 있으며,[^s25][^s27][^s30] 메서드 명세 하나는 Tempo 바깥에서 왔다.[^s28] 그 어느 것도 프로덕션 트랜잭션 볼륨의 증거는 아니며, 이 보고서는 그것을 측정하려 시도하지 않았다.

**동료 심사된 자료는 존재하지 않는다.** MPP는 2026년 3월에 출시되었고,[^s16][^s31] 이를 다루는 학술 문헌은 없다. 여기서의 출처는 일차 자료 — IETF 초안, 명세 저장소, SDK 소스 — 이며, 독립 구현체들과 한 플랫폼 벤더의 문서,[^s15] 한 서드파티 해설로[^s16] 뒷받침된다. 저작자 귀속에 관해서는 자료들이 상충하기보다 일치한다. Stripe의 출시 게시글은 MPP를 "에이전트가 결제할 수 있게 하는, 인터넷 네이티브한 개방형 표준 — Tempo와 Stripe의 공동 저술"로 기술하며 2026년 3월 18일에 게시되었고,[^s35] 이는 독립 해설과 부합한다.[^s16] `mpp.dev/overview` 는 저작자를 부정하는 것이 아니라 언급하지 않을 뿐이며 SDK에 대해 Tempo Labs와 Wevm을 밝히고,[^s18] 개별 명세 초안들은 각자의 저자를 싣는데 그중에는 Merit Systems 소속도 있다.[^s19]

**완결된 예제 하나, 레일 형태 하나.** `ledger` 메서드는 동기적이고 단일 서버이며 잔액을 차감하는 레일이다. 비동기 정산, 외부 확인 지연, 다자 분배가 있는 레일은 이 예제가 다루지 않은 훅 — 특히 `request`, `preflight`, `respond` — 을 사용하게 된다.
