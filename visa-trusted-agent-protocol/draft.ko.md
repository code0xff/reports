# VISA 신뢰형 에이전트 프로토콜(TAP): AI 에이전트가 비자 결제를 처리하는 방식

## 초록

비자(Visa)의 **신뢰형 에이전트 프로토콜(Trusted Agent Protocol, TAP)** 은 모든 HTTP 요청에 대해 "이 요청은 비자가 인증한 AI 에이전트 런타임에서 발생했으며, 그 뒤에는 식별 가능한 소비자가 존재하고, 선택적으로 결제 수단까지 동봉되어 있다"는 사실을 암호학적으로 증명하기 위한 카드 네트워크 사양이다. TAP는 IETF의 RFC 9421 HTTP 메시지 서명 표준 위에서 동작하며, 에이전트 공개키는 `https://mcp.visa.com/.well-known/jwks` JWKS 엔드포인트로 배포된다. 모든 요청은 *Agent Intent*, *Consumer Recognition*, *Payment Information* 세 가지 논리 블록으로 분해되어 각각 전용 HTTP 헤더와 JSON 본문 객체에 매핑된다. TAP 자체는 결제를 승인하지 않는다 — 실제 거래는 여전히 비자의 기존 승인/청산/정산 파이프라인을 타며, ACP, MPP, AP2, x402, UCP 등 다른 에이전틱 커머스 프로토콜과 경쟁이 아니라 보완 관계에 있다[^s01][^s03][^s11].

## 1. 서론

비자는 2025년 10월 TAP를 **Visa Intelligent Commerce** 라는 우산 프로그램의 신원 봉투(identity envelope)로 발표했다. Intelligent Commerce는 API 묶음, "신뢰형 에이전트 레지스트리(Trusted Agent Registry)", 그리고 가맹점 측 진입 통로인 "Intelligent Commerce Connect"를 포함한다[^s02][^s05][^s15]. 출시 명분은 명확했다 — 비자가 Adobe Data Insights(2025년 8월 자료)를 인용하며 발표한 바에 따르면, 직전 1년간 미국 리테일 사이트의 AI 발 트래픽이 약 4,700% 증가했다 _(벤더 발표 수치)_[^s03]. 가맹점들은 이 트래픽을 무차별 차단으로 대응했고, 그 결과 적법한 에이전틱 체크아웃까지 함께 막혀버렸다. 비자는 새 결제 레일을 강요하는 대신 "재생할 수 없는 시간 한정 검증 가능 서명"을 발급해 가맹점이 에이전트 트래픽 수용 여부를 스스로 선택하게 만드는 쪽을 택했다[^s02].

독립 매체들은 TAP를 더 넓은 "에이전틱 커머스 프로토콜 전쟁" 안에 위치시킨다 — OpenAI/Stripe의 Agentic Commerce Protocol(ACP)[^s16], 마스터카드의 Agent Pay / Agentic Tokens, 구글의 AP2, Stripe의 Machine Payments Protocol(MPP), Coinbase의 x402가 함께 비교 대상이다[^s09][^s11][^s12][^s13]. 제3자 분석의 공통된 결론은 이 프로토콜들이 스택의 서로 다른 층 — 신원, 권한, 체크아웃, 정산 — 에서 작동하며 대체로 상호 보완적이라는 것이다[^s11].

## 2. 배경: 카드 등록(card-on-file)에서 에이전트 등록(agent-on-file)으로

지난 20년간 비대면 카드 거래의 인증은 3-D Secure, EMV 토큰화, 네트워크 토큰에 기대 PAN 탈취 공격을 무력화해 왔다. 그러나 이들 모두는 *호출 주체 소프트웨어* 에 대해 아무것도 말하지 않는다 — 브라우저나 가맹점이 알고 있는 SDK가 호출한다는 전제를 깔고 있다. 에이전틱 커머스는 이 전제를 깬다. 호출 주체가 이제 로그인한 소비자를 대신해 행동하는 자율 LLM 런타임이 될 수 있기 때문이다.

비자는 새로운 자격증명을 발명하는 대신 웹 전체가 모이고 있는 신뢰 기반 — **HTTP 메시지 서명(RFC 9421)** — 을 차용했다. Cloudflare는 자사 구현을 "Web Bot Auth"라 부르며 "HTTP 메시지 서명은 요청 송신자의 암호학적 인증을 정의한 표준"이라고 설명한다. 또한 봇 신원의 확장성 측면에서 키 디렉터리가 IP 화이트리스트를 능가한다고 주장한다[^s07]. IETF 초안 `draft-meunier-web-bot-auth-architecture-05` 는 이를 "자동화 클라이언트가 송신 요청에 암호학적으로 서명함으로써 HTTP 서버가 그 신원을 확신하고 검증할 수 있게 하는 아키텍처"로 공식화한다(활성 인터넷 초안, 만료 2026년 9월 3일)[^s08]. TAP는 이 서명 봉투에 비자 특유의 커머스 데이터(소비자 힌트, 결제 컨테이너)를 끼워넣는 형태다[^s01][^s07].

비자와 Cloudflare는 TAP를 공동 개발했음을 밝히고, 사양을 IETF·OpenID Foundation·EMVCo와 정합화하겠다고 약속했다[^s03]. 이 표준화 약속이 TAP를 비자 전용 헤더 집합이 아닌 웹 표준 위에서 동작하는 사양으로 보게 만드는 가장 강한 비-비자 신호다 _(초기 신호)_[^s03][^s07].

## 3. 프로토콜 구조

### 3.1 세 가지 구성 요소

비자는 TAP 요청을 세 구성 요소로 분해한다[^s01][^s09]:

1. **Agent Intent** — 요청이 비자가 인지한 에이전트 런타임에서 출발했음을, 그리고 무엇을 하려는지를 HTTP 수준에서 암호학적으로 증명. 독립 매체는 이를 "나는 구매 의도를 가진 비자 신뢰형 에이전트"라는 신호로 읽는다[^s12].
2. **Consumer Recognition** — JSON 본문 객체 `agenticConsumer`. 비자가 발급해 JWS로 서명한 `idToken` 과 `contextualData`(기기, IP, 국가, 우편번호)를 담는다[^s01].
3. **Payment Information** — 선택적 JSON 본문 객체 `agenticPaymentContainer`. 해시화된 자격증명, 암호화된 결제 페이로드, 카드 메타데이터, HTTP 402용 `browsingIOU` 가운데 어느 것이든 담을 수 있다[^s01].

### 3.2 와이어 포맷: Agent Intent

Agent Intent는 RFC 9421이 정의한 두 개의 HTTP 헤더로 운반된다:

```
Signature-Input: sig2=("@authority" "@path");
                   created=...; expires=...;
                   keyid="..."; alg="..."; nonce="...";
                   tag="agent-payer-auth"
Signature: sig2=:<base64 signature>:
```

커버드 컴포넌트(covered components)는 `@authority`, `@path`를 포함한다. 메타데이터 파라미터는 `created` 와 `expires`(둘 사이 간격은 최대 **8분** 으로 제한), 비자 JWKS로 해석되는 `keyid`, 선택된 서명 알고리즘 `alg`, 재생 방지용 `nonce`, 그리고 카탈로그 탐색용 `agent-browser-auth` 또는 체크아웃용 `agent-payer-auth` 둘 중 하나의 `tag` 를 포함한다[^s01]. 지원 서명 알고리즘은 `Ed25519`, `PS256`(RSA-PSS, RS256보다 권장), `ES256` 이다[^s01]. 비자의 레퍼런스 구현(`github.com/visa/trusted-agent-protocol`)은 Ed25519 키페어를 사용하며, CDN 프록시·에이전트 레지스트리·가맹점 프론트엔드·가맹점 백엔드를 모두 포함해 위 헤더들을 종단 간 검증한다[^s06].

### 3.3 공개키 배포

가맹점 검증자는 서명의 `keyid` 를 다음 호출로 해석한다:

```
GET https://mcp.visa.com/.well-known/jwks?keyID={keyid}
```

응답은 JSON Web Key 객체이다(RFC 7517 스타일의 `kty`, `kid`, `use`, `alg` 와 RSA의 `n`/`e` 같은 알고리즘별 키 재료)[^s01]. 이는 구조적으로 Cloudflare의 Web Bot Auth가 제안하는 키 디렉터리 모델과 동일하다. Cloudflare는 이를 "원 서버가 에이전트의 서명 검증에 사용할 공개키를 어디서 찾을 수 있는지를 가리키는 `Signature-Agent` 헤더"로 설명한다[^s07][^s08].

### 3.4 Consumer Recognition

`agenticConsumer` 는 요청 본문에 들어가는 JSON 객체로, 그 필드들은 비자 사양에서 그대로 옮기면 다음과 같다[^s01]:

- `nonce` — `Signature-Input` 내부의 `nonce` 와 일치해야 한다.
- `idToken` — 비자가 서명한 JWT/JWS. `iss`, `sub`, `aud`, `exp`, `iat` 클레임에 더해 난독화된 `phone_number`/`email`, 그리고 UI 렌더링용 `phone_number_mask`/`email_mask` 가 포함된다.
- `contextualData` — 기기 식별자, 국가 코드(ISO 3166-1 alpha-2), 우편번호, IP.
- `kid`, `alg`, `signature` — 가맹점이 토큰을 독립적으로 검증할 수 있게 해주는 JWS 메타데이터.

`sub` 클레임은 "비자 내부에서 로컬로 유일한 소비자 식별자"로 명시되어 있다[^s01]. 가맹점은 해시된 `phone_number`/`email` 을 자체 CRM의 고객 레코드에 매핑하는 책임을 진다 — 그렇게 함으로써 에이전트 런타임에 PII를 노출하지 않고도 기존 관계를 인식할 수 있다[^s01].

### 3.5 Payment Information

`agenticPaymentContainer` 는 선택적 결제 봉투이다[^s01]. 다음 중 하나 이상을 담을 수 있다:

- `paymentCredentialsHash` — `계좌번호 || 만료일 || CVV` 의 해시. PAN을 에이전트에 노출하지 않고 핑거프린트만 전달한다.
- `payload` — 가맹점 공개키로 봉인된 암호화 블롭. 네트워크 토큰, 만료일, 카드 소지자명, 배송/청구지 주소를 담는다.
- `cardMetadata` — 비밀이 아닌 렌더링 힌트(`lastFour`, `paymentAccountReference`, 카드 아트 URL).
- `browsingIOU` — HTTP `402 Payment Required` 흐름용. `invoiceId`, `amount`, `CAID`, `AID`, `sequenceCounter`, `kid`, `alg`, 그리고 가맹점 측 `signature` 를 담아, 가맹점이 견적 가격에 반대 서명하고 에이전트가 결제 시점에 이를 다시 제출하게 한다[^s01].

이 컨테이너는 의도적으로 스키마가 유연하다. 비자 사양은 "웹 체크아웃 폼 키잉"과 "API 스타일 암호화 페이로드 전달"을 모두 허용해, 가맹점이 체크아웃을 재구현하지 않고도 TAP를 도입할 수 있도록 한다[^s01][^s02].

## 4. 트랜잭션 라이프사이클

TAP 인식 체크아웃은 대략 여섯 단계로 진행된다[^s01][^s07]:

1. **서명.** 에이전트 런타임이 `@authority`, `@path`, `created`, `expires`, `keyid`, `alg`, `nonce`, `tag` 를 포함하는 RFC 9421 서명 베이스를 구성하고, 개인키(Ed25519/PS256/ES256)로 서명한 뒤 `Signature-Input` 과 `Signature` 헤더를 첨부한다.
2. **전송.** 에이전트가 HTTP 요청을 송신한다(탐색 또는 체크아웃). 본문에는 `agenticConsumer` 와 — 해당될 경우 — `agenticPaymentContainer` 가 들어 있다.
3. **키 해석.** 가맹점이 `keyid` 를 추출해 `GET https://mcp.visa.com/.well-known/jwks?keyID={id}` 를 호출하고 JWK를 로컬에 캐시한다.
4. **검증.** 가맹점은 `Signature-Input` 의 최소 필수 파라미터를 점검하고, `created < now < expires`(≤ 8분) 인지 확인하고, 동일 윈도 안에서 중복 `nonce` 를 거부하고, `tag` 값을 검증하고, 정규화된 서명 베이스 문자열을 재구성한 뒤 RFC 9421 라이브러리로 서명을 검증한다[^s01][^s17].
5. **소비자·결제 검사.** 가맹점은 `agenticConsumer.idToken` 을 JWKS로 검증하고, 난독화된 `phone_number`/`email` 을 자체 CRM과 매칭하며, `agenticPaymentContainer.payload` 를 자신의 개인키로 복호화한다(또는 카드 등록 자격증명을 `paymentCredentialsHash` 로 비교한다).
6. **승인.** 에이전트와 소비자가 모두 암호학적으로 입증되면, 가맹점은 기존 비자 레일로 실제 승인을 수행한다 — 네트워크 토큰, 리스크가 요구할 경우 3-D Secure 스텝업, 이어서 표준 승인/청산/정산. TAP 자체는 결제를 *승인하지 않는다* — 출처를 입증할 뿐이다[^s01][^s12].

`browsingIOU` 는 TAP의 HTTP-네이티브 설계를 가장 잘 보여주는 예다. 가맹점이 탐색 요청에 대해 HTTP `402 Payment Required` 로 응답하며 자신의 키로 서명한 IOU를 함께 돌려주고, 에이전트는 결제 시점에 이 IOU를 다시 제시한다. 가맹점은 자신이 발급한 견적과 소비자가 최종적으로 사용하는 자격증명을 일치시킬 수 있다[^s01].

## 5. 생태계와 채택

비자는 TAP를 "생태계 주도 프레임워크"로 발표하면서 출시 시점의 협력사로 Adyen, Ant International, Checkout.com, Cloudflare, Coinbase, CyberSource, Elavon, Fiserv, Microsoft, Nuvei, Shopify, Stripe, Worldpay를 명시했다[^s03]. 2025년 10월 14일 보도자료는 IETF·OpenID Foundation·EMVCo와의 표준화 정합 약속, 그리고 ACP 및 x402와의 명시적 상호운용성도 함께 약속했다[^s03].

2025년 12월 18일 비자는 첫 종단 간 보안 에이전틱 트랜잭션을 발표하며 에이전트 인에이블러(Skyfire, Nekuda, PayOS, Ramp), 가맹점·플랫폼 협력사(Consumer Reports, Gensmo, Henry Labs, BeyondStyle, Bose, Fabrique, Honeylove, Jomashop, Rye, Price.com), 보안 제공자(Akamai)를 함께 거명했다. 누적 생태계 파트너 100개 이상, 샌드박스 참가자 30개 이상이라고 밝혔다[^s04]. 동일 보도자료는 2026년 휴가철을 "수백만 명의 소비자가 AI 에이전트로 구매를 마무리"하는 시점으로 제시하고, 2026년 초 아시아태평양·유럽 파일럿 확장을 예고했다 _(벤더 발표)_[^s04].

가맹점 진입 통로인 **Intelligent Commerce Connect** 는 2026년 4월 8일 공개됐다. 비자는 이를 "네트워크·프로토콜·토큰 볼트에 종속되지 않는 '온램프'"로 정의하며, 단일 통합으로 Trusted Agent Protocol, Stripe MPP, OpenAI/Stripe ACP, Google UCP 결제를 모두 수용한다고 설명한다[^s15]. 독립 분석은 Connect를 "어느 한 프로토콜이 단독으로 이긴다는 가정을 비자가 포기했으며, 결국 가맹점에는 스위치보드가 필요할 것"이라는 베팅으로 읽는다[^s11][^s13].

## 6. 분석: 신뢰 모델과 한계

### 6.1 TAP가 인증하는 것과 인증하지 않는 것

TAP는 매 요청에 대해 두 가지 사실을 인증한다 — (a) 요청이 비자가 인지한 에이전트 런타임에 묶인 개인키로 서명되었다는 사실(Agent Intent), (b) 비자가 가맹점 레코드에 매핑 가능한 소비자 신원을 주장하는 JWS 서명 ID 토큰을 발급했다는 사실(Consumer Recognition)[^s01]. TAP는 결제를 **승인하지 않는다** — 성공적인 TAP 검증은 가맹점이 응대하기로 선택하는 *전제 조건* 일 뿐이며, 실제 거래는 여전히 비자의 기존 승인/청산/정산 레일을 타고, 리스크가 요구하면 3-D Secure 스텝업이 붙는다[^s01][^s05]. 독립 매체의 해석도 같은 결을 가리킨다 — "TAP의 핵심은 에이전트가 어떻게 가맹점에 자격증명을 제시하는가" 라는 *자격증명 계층* 의 문제이지 *권한 부여 계층* 의 문제가 아니다[^s12].

### 6.2 에이전틱 커머스 스택 안에서 TAP의 위치

Crossmint는 에이전틱 결제 프로토콜을 비교하며 ACP를 체크아웃 계층, AP2를 권한 부여 계층, x402를 정산 계층, MPP를 예산/세션 계층에 배치한다. 이들은 "경쟁이 아니라 보완 관계 — 한 에이전트 시스템이 권한은 AP2, 전자상거래 체크아웃은 ACP, 머신-투-머신 결제는 x402나 MPP를 동시에 쓸 수 있다"고 단언한다[^s11]. TAP는 이 모든 계층의 아래에서 HTTP 트랜스포트 위의 신원 봉투로 자리잡는다. Fintech Brainfood의 Simon Taylor 역시 일관된 해석을 내놓는다 — "카드 레일 기반 에이전틱 결제는 비자·마스터카드·아멕스 망과 기존 인수사 관계 위에, 에이전트 특화 암호 계층(일회용 Shared Payment Tokens, AP2 만데이트, 서명된 신원 헤더)을 얹어 작동한다"[^s13].

마스터카드의 병행 프레임워크 "Agent Pay"는 마스터카드 자신의 표현으로 "AI 에이전트가 무엇을, 누구의 의도로, 어떤 한도 내에서 구매하는지를 네트워크가 검증하기 위한 프레임워크"이다[^s14]. TAP가 신원 중심인 반면 마스터카드는 *의도 만데이트(intent mandate)* 와 *에이전트 토큰* 을 중심에 두며 — 이는 TAP의 요청 서명 계층보다는 AP2의 권한 부여 계층에 더 가깝다. 결과적으로 TAP와 Agent Pay는 같은 유스 케이스를 두고도 서로 다른 자리에 위치한다[^s09][^s14]. Digital Commerce 360의 동일자 비교 기사는 이 구분을 "비자는 매끄러운 자격증명 전달을, 마스터카드는 거래 전 에이전트 인증과 규모를 강조"라고 요약한다[^s09].

### 6.3 정직한 공백

공개된 사양에서 여전히 충분히 정의되지 않은 운영 영역이 셋 있다:

- **취소(revocation).** 키 라이프사이클은 JWKS 엔드포인트와 서명의 `expires` 타임스탬프에 의존한다. 에이전트별 명시적 취소 메시지나 상태 엔드포인트는 사양에 기술되어 있지 않다[^s01]. Oscilar는 이를 더 넓게 비판한다 — "TAP 같은 암호 프로토콜은 *필요하지만 충분하지 않다* — 보완적 사기 방지가 함께 필요하다"[^s10]. _(해석 — 단일 독립 출처)_
- **레지스트리 거버넌스.** TAP의 `keyid` 해석은 현재 비자가 운영하는 JWKS(`https://mcp.visa.com/.well-known/jwks`)로 향한다[^s01]. 비자는 사양을 IETF·OpenID Foundation·EMVCo와 정합화하겠다고 약속했지만[^s03], 공동 거버넌스 합의(누가 키를 등록할 수 있는가, 분쟁은 어떻게 중재되는가)는 아직 공개되지 않았다 _(초기 신호)_[^s03].
- **책임 배분.** TAP 서명이 첨부된 거래가 분쟁(chargeback)될 때 책임이 어떻게 흐르는지에 대한 공개 문서는 없다. 카드 레일의 책임 배분은 발급사/인수사 규정에서 흐르지 프로토콜 계층에서 흐르지 않지만, *분쟁 시 TAP 서명의 증거적 역할* 은 아직 명시되어 있지 않다.
- **프라이버시 자세.** 독립 보도(Sam Boboev / Finextra; 원문 URL은 스크립트 페치에 `403` 을 반환해 본 보고서는 검색 발췌만으로 의역했다)는 마스터카드의 Verifiable Intent가 "단일 자격 증명 체인 내 선택적 공개(selective disclosure) 약정"을 중심으로 설계된 반면, TAP는 난독화와 페이로드 분할에 기반해 가맹점이 해시된 신원 필드에 대한 매핑 테이블을 보유하는 모델을 택했다고 대비시킨다. 결함이라기보다는 설계 선택이지만, 경쟁 프로토콜이 소비자 신원 노출에 더 보수적인 자세를 취하고 있다는 점은 독자에게 알릴 필요가 있다. _(해석 — 1차 출처 미수신; 초기 신호로 취급)_

## 7. 한계(Limitations)

- **개발 진행 중 상태.** 비자는 TAP를 "개발 및 배포 진행 중" 상태로 라벨링하고 있으며, 공개 디테일의 대부분은 벤더 발표에 의존한다[^s02][^s05]. TAP가 기대고 있는 IETF Web Bot Auth 트랙은 활성 인터넷 초안(`-05`, 만료 2026년 9월 3일)이지 공식 RFC가 아니다[^s08]. 프로토콜 공동 개발자인 Cloudflare도 TAP와 마스터카드 Agent Pay가 "계속 진화할 것"이라고 명시했다[^s17].
- **독립적인 보안 분석 부재.** 본 보고서 작성 시점까지 TAP에 대한 동료 평가(peer-reviewed) 암호학적 분석은 존재하지 않는다. 가장 강한 독립 자료([s10], [s11], [s13])도 사양 문서를 *읽는* 수준이지 *감사* 수준은 아니다.
- **상호운용 적합성 검증 코퍼스 부재.** 비자는 Cloudflare와의 공동 개발[^s03], 그리고 Intelligent Commerce Connect를 통한 ACP/MPP/UCP/x402 호환을 약속했지만[^s15], 공개된 적합성 테스트 코퍼스는 없다.
- **파일럿 단계의 채택 신호.** 비자가 초기 Intelligent Commerce 파일럿에서 거론한 은행 명단(DBS, OCBC, UOB, HSBC 싱가포르, Standard Chartered, Bank of China 싱가포르)은 비자 보도자료와 그 요약 보도를 통해서만 확인되며, 거명된 각 은행의 독립적 확인은 본 조사 범위에서 찾지 못했다 _(벤더 발표)_[^s04].

2026년 중반 시점의 에이전틱 커머스 스택은 TAP·ACP·AP2·MPP·x402·UCP를 계층 아키텍처로 추론할 수 있을 만큼 윤곽이 잡혔지만, 이들 사이의 *통합 디테일*, *레지스트리 거버넌스*, *책임 모델* 은 모두 아직 초기 신호다. 후속 개정판에서는 IETF Web Bot Auth의 상태, 비자의 공개된 취소/거버넌스 문서, 그리고 독립적인 암호학적 분석의 등장 여부를 다시 점검해야 한다.
