# Google AP2 (Agent Payments Protocol) — 상세 기술 분석과 예제 구현

## 서론

Agent Payments Protocol(이하 AP2)는 구글이 2025년 9월 17일에 발표한, **AI 에이전트가 사용자를 대신해 결제를 개시할 때** 그 권한과 의도를 암호학적으로 입증하기 위한 개방 표준이다 [^s03]. 첫 발표 시 Mastercard·American Express·JCB·UnionPay·PayPal·Adyen·Worldpay 등의 카드/PSP, Salesforce·ServiceNow·Coinbase·MetaMask·Mysten Labs 같은 기술/Web3 파트너 60여 곳이 함께 합류했다 [^s03][^s10][^s12].

AP2가 답하려는 질문은 표면적으로 단순하다 — *비결정적인(LLM이 자율적으로 움직이는) 에이전트의 결제 요청을 가맹점과 결제망이 어떻게 신뢰할 수 있는가?* 답은 **Mandate** 라는 사용자/에이전트 서명 디지털 위임장을 결제 흐름의 모든 단계에 끼워 넣고, 각 Mandate를 W3C 검증 가능 자격증명(Verifiable Credential)으로 다루는 것이다 [^s01][^s10][^s11]. AP2 자체는 **결제 권한 검증** 만 명세하며, 카탈로그 API, 체크아웃 전송 같은 "Commerce Protocol" 의 나머지는 명시적으로 범위 밖이다 [^s01].

## 배경 — A2A·MCP 그리고 AP2가 메우는 자리

구글은 이미 두 개의 인접 표준을 갖고 있었다 — 모델/도구에 컨텍스트를 공급하는 **MCP** 와, 에이전트-에이전트 간 호출/위임을 표준화한 **A2A** 다. 둘 다 *대화* 를 다루지만 *돈* 을 다루지는 않는다. AP2 는 그 빈자리에 들어간다. 스펙은 명시적으로 "AP2 operates as a security feature within a Commerce Protocol. … AP2 is designed explicitly to be compatible with the Universal Commerce Protocol (UCP) and integrates seamlessly" 라고 적고 있다 [^s01]. 즉 AP2 는 *결제 권한* 만 책임지고, *상품/카트 정보 자체의 운반* 은 UCP 같은 별개 프로토콜이 책임진다.

2026년 4월 28일에는 두 가지가 동시에 일어났다 — AP2 v0.2 가 GitHub에 공개됐고, 구글은 표준 거버넌스를 **FIDO Alliance** 로 이양(donation)했다 [^s12]. v0.2 가 도입한 두 가지 핵심 추가는 (1) Human-Not-Present 결제와 (2) Mastercard와 공동 개발하여 FIDO에 함께 기증된 **Verifiable Intent** (사용자가 권한 부여한 에이전트 행동의 변조 방지 로그)이다 [^s12].

## 아키텍처와 Mandate 모델

### 다섯 역할

스펙은 다섯 개의 역할을 정의한다 [^s01]:

| 역할 | 약자 | 책임 | Agentic 가능 여부 |
|---|---|---|---|
| Shopping Agent | SA | 상품 발견·카트 구성·구매 실행 | **반드시 agentic** |
| Credential Provider | CP | 결제 자격(카드·지갑 등)의 제공·범위 제한 | 가능 |
| Merchant | M | 체크아웃 제공·인벤토리/가격 무결성 | 가능 |
| Merchant Payment Processor | MPP | 결제 처리·Payment Mandate 검증 | 가능 |
| Trusted Surface | TS | 사용자 동의 확보 후 사용자-서명 Mandate 생성 | **반드시 non-agentic** |

핵심 보안 가정은 명시적이다 — "AP2 assumes that, at a minimum, the Shopping Agent is agentic … the Agent itself is a potential attacker" [^s01]. 즉 AP2 는 Shopping Agent 를 *잠재적 공격자* 로 간주하고, 사용자 의도의 진위는 *Trusted Surface 가 생성한 사용자 서명* 으로만 확보한다. 한 개의 법인 실체가 여러 역할을 동시에 할 수 있지만, 검증·처리는 *역할이 agentic 이든 아니든 결정론적 코드 안에서만* 일어나야 한다 [^s01].

### 두 가지 위임 모델

AP2의 별도 문서 `agent_authorization.md` 는 Mandate 위임을 다시 두 가지 신뢰 모델로 갈라놓는다 [^s07].

- **User Credential 모델** — 에이전트와 별개의 Issuer(예: 사용자의 지갑/패스키 제공자)가 사용자 인증을 보장한다. 이 모델의 장점은 *한 개의 사용자 자격* 이 여러 에이전트에 Mandate 를 위임할 수 있다는 점이다 [^s07].
- **Trusted Agent Provider 모델** — 에이전트 자체의 제공자가 Verifier 가 신뢰하는 당사자가 된다. 신뢰 그래프는 단순하지만 Verifier 가 *모든 Agent Provider 와 직접 신뢰 관계를 맺어야* 한다 [^s07].

### v0.1 vs v0.2 — Mandate 종류가 두 번 바뀌었다

이 부분은 표준을 처음 보는 통합 개발자가 가장 혼동하는 지점이다. 같은 저장소에 두 세대의 모델이 공존한다.

**v0.1 (발표 시점, Pydantic SDK).** `code/sdk/python/ap2/models/mandate.py` 에는 세 가지 Mandate 모델이 그대로 살아 있다 [^s04]:

```python
class IntentMandate(BaseModel):
    user_cart_confirmation_required: bool = True
    natural_language_description: str   # 예: "High top, old school, red basketball shoes"
    merchants: list[str] | None
    skus: list[str] | None
    requires_refundability: bool | None
    intent_expiry: str                  # ISO 8601

class CartContents(BaseModel):
    id: str
    user_cart_confirmation_required: bool
    payment_request: PaymentRequest     # W3C PaymentRequest
    cart_expiry: str
    merchant_name: str

class CartMandate(BaseModel):
    contents: CartContents
    merchant_authorization: str | None  # base64url-encoded JWT (merchant 서명)

class PaymentMandate(BaseModel):
    payment_mandate_contents: PaymentMandateContents
    # payment_mandate_id, payment_details_id, payment_details_total,
    # payment_response, merchant_agent, timestamp
```

여기서 `merchant_authorization` 의 docstring 은 JWT payload 가 `iss/sub/aud/iat/exp/jti/cart_hash` 를 담아야 하며 `cart_hash` 는 CartContents 의 정규(canonical) JSON 해시여야 한다고 명시한다 [^s04]. 최초 발표 보도자료들이 묘사하는 "Intent → Cart → Payment" 라는 3단 Mandate 구조가 바로 이 SDK 다 [^s03][^s10][^s13].

**v0.2 (2026-04, 현행 스펙).** 스펙 문서 `specification.md` 는 Mandate를 **두 종류** — Checkout Mandate, Payment Mandate — 로 통합했다 [^s01]. 두 종류 모두 SD-JWT(Selective Disclosure JWT) 로 표현되며 `vct` (Verifiable Credential Type) claim 으로 스키마 버전을 명시한다. v0.2 의 JSON 스키마는 다음과 같다 [^s05]:

```jsonc
// checkout_mandate.json — 요구 필드
{
  "vct":          "mandate.checkout.1",     // 정확히 매칭 필수
  "checkout_jwt": "<base64url JWT>",        // merchant-signed Checkout payload
  "checkout_hash":"<base64url sha-256>",    // checkout_jwt 의 해시
  "iat": 1746...,
  "exp": 1746...
}
```

```jsonc
// payment_mandate.json — 요구 필드
{
  "vct":            "mandate.payment.1",
  "transaction_id": "<base64url hash of checkout_jwt>",  // ← 핵심 링크
  "payee":          { /* merchant.json */ },
  "payment_amount": { "currency":"USD", "amount":27999 }, // ISO 4217 minor units
  "payment_instrument": { /* payment_instrument.json */ },
  "execution_date": "2026-05-29T...",       // 부재 시 즉시 실행
  "risk_data":      { /* TS가 수집한 위험 신호 */ }
}
```

두 Mandate 는 **Checkout JWT 의 해시** 로 영구히 결합된다 — Payment Mandate 의 `transaction_id` 는 Checkout Mandate 의 `checkout_hash` 와 같은 값이다 [^s01][^s05]. 스펙은 동일한 해시 값을 충돌 없이 사용하기 위해 **Merchant 의 Checkout JWT 는 ECDSA 같은 *확률적* 서명 스킴을 써야 하며, Ed25519 같은 *결정론적* 서명은 안 된다** 고 명시한다 — 결정론적 서명은 동일 입력에 대해 동일 서명을 만들고, 그러면 검증자가 미리 만든 레인보우 테이블로 Checkout JWT 를 역추적할 수 있기 때문이다 [^s01].

### Human-Present vs Human-Not-Present

흐름 문서 `flows.md` 는 두 가지 시나리오를 비교한다 [^s06].

- **Human Present (`direct`).** 사용자가 결제 순간에 직접 *closed* Checkout/Payment Mandate 에 서명한다. Shopping Agent 는 Mandate Content 를 만들고 Trusted Surface 에 띄워 사용자의 생체 인증/동의를 받아 `user_sk` 로 서명한다. `checkout_jwt` 해시가 두 Mandate를 영구 결합하며, `agent_pk` 가 confirmation claim 으로 들어가 *발신자 제약(sender-constrained)* 으로 다른 에이전트가 가로채 못 쓰게 한다 [^s06].
- **Human Not Present (`autonomous`).** Phase 1a 에서 사용자는 *open* Checkout/Payment Mandate (가격 상한·기간·SKU 등 *제약 묶음* 만 들어 있는 사용자 서명 위임장) 를 미리 서명한다. 사용자가 떠난 뒤 Phase 1b 에서 에이전트가 실제 카트를 자율 조립하고 Phase 2 에서 결제를 실행한다. 가맹점이나 Credential Provider 가 `unresolved_constraint` 오류를 반환하면 Human-Not-Present 흐름은 Human-Present 흐름으로 *되돌아갈 수 있다* — 다시 사용자를 호출해 closed Mandate 를 받게 한다 [^s06].

## 코드 레벨 워크스루 — 예제 구현

저장소는 동일 흐름을 Python·Go·Android 시나리오 세 갈래로 제공한다. Python 샘플은 Google ADK (`google.adk.tools.tool_context`) 와 A2A 메시지 빌더, 그리고 역할별 MCP 서버 변형을 함께 사용한다 [^s02][^s09]. 다음은 `code/samples/python/src/roles/shopping_agent/tools.py` 의 일부를 압축한 흐름이다 [^s09]:

```python
# 1) 사용자/에이전트 ECDSA P-256 서명 키 준비
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from jwcrypto.jwk import JWK

raw_key = ec.generate_private_key(ec.SECP256R1())
jwk_key = JWK.from_pyca(raw_key)
# kid 부여 → 검증자가 키를 찾을 수 있게

# 2) Shopping Agent → Merchant Agent: A2A 로 "체크아웃 생성" 요청
from common.a2a_message_builder import A2aMessageBuilder

message = (
    A2aMessageBuilder()
    .set_context_id(shopping_context_id)
    .add_text("Create a checkout for the selected cart.")
    .add_data("cart_id", chosen_cart_id)
    .add_data("shopping_agent_id", "trusted_shopping_agent")
    .add_data("debug_mode", False)
    .build()
)
task = await merchant_agent_client.send_a2a_message(message)

# Merchant 는 ap2.checkout 아티팩트로 응답: { checkout_jwt, checkout_hash, amount, ... }
checkout_data = _extract_first_data(task.artifacts, "ap2.checkout")
```

이 시점에 `checkout_jwt` 는 *Merchant 가 ECDSA 로 서명한 JWT* 이고 `checkout_hash` 는 그 base64url SHA-256 해시다 [^s01][^s05][^s09]. 다음 단계에서 Shopping Agent 는 두 SD-JWT 를 빌드해야 한다.

```python
# 3) Checkout Mandate (SD-JWT) 빌드
from ap2.sdk.generated.checkout_mandate import CheckoutMandate
from ap2.sdk.generated.payment_mandate import PaymentMandate
from ap2.sdk.mandate import MandateClient

checkout_mandate = CheckoutMandate(
    vct="mandate.checkout.1",
    checkout_jwt=checkout_data["checkout_jwt"],
    checkout_hash=checkout_data["checkout_hash"],
    iat=int(time.time()),
    exp=int(time.time()) + DEFAULT_MANDATE_TTL_SECONDS,  # 5–15분 권장
)

# 4) Payment Mandate (SD-JWT) — checkout_jwt 의 해시로 두 Mandate 를 묶음
payment_mandate = PaymentMandate(
    vct="mandate.payment.1",
    transaction_id=checkout_data["checkout_hash"],   # ← 링크
    payee=DEMO_MERCHANT,
    payment_amount=Amount(currency="USD", amount=27999),  # $279.99
    payment_instrument=DEMO_PAYMENT_INSTRUMENT,            # 예: 카드 •••4242
)

# 5) Trusted Surface 가 user_sk 로 두 Mandate 를 SD-JWT 로 서명
mandate_client = MandateClient(signing_key=jwk_key)
checkout_sd_jwt = mandate_client.sign(checkout_mandate)
payment_sd_jwt  = mandate_client.sign(payment_mandate)

# 6) Credential Provider 로 Payment Mandate 전달 → 토큰 수령
token = await credentials_provider_client.exchange(payment_sd_jwt)

# 7) Merchant 에게 토큰 + Checkout Mandate 전달 → 결제 개시
receipt = await merchant_agent_client.finalize(
    token=token,
    checkout_sd_jwt=checkout_sd_jwt,
)
# Merchant Payment Processor 는 Payment Mandate 안의 transaction_id 가
# 자신이 보고 있는 Checkout JWT 의 해시와 같은지 확인한다.
```

위 흐름의 단계 6–7 은 가맹점이 보는 *Closed Checkout Mandate 가 정말로 사용자/에이전트 서명을 가지고 있는지*, 그리고 *Payment Mandate 가 같은 Checkout 에 묶여 있는지* 를 결정론적 코드로 검증할 수 있게 한다 [^s01][^s06]. 사용자가 자리에 없는 시나리오는 거의 동일하지만, 사용자 서명은 *open* Mandate 위에 미리 받아두고, 에이전트가 거기에 자기 서명을 덧붙여 *closed* Mandate 를 만든다는 점이 다르다 [^s06].

### 크립토 레일 — x402 시나리오

`code/samples/python/scenarios/a2a/human-not-present/x402/README.md` 는 크립토 결제를 Human-Not-Present 모드로 시연한다 [^s08]. 트리거는 *가맹점이 발행한 가격 하락 이벤트* 이고, 가격이 사용자 의도에 부합하면 Shopping Agent 가 OTP 같은 인터랙티브 단계를 건너뛴 채 자율로 구매를 완료한다 [^s08]. Merchant Agent 는 자신의 **agent card** 와 CartMandate 안에서 x402 지원을 광고하고, 결제 흐름은 x402 호환 결제 수단(스테이블코인 등)으로 진행된다 [^s08]. 즉 *카드 레일* 과 *크립토 레일* 의 Mandate 구조는 동일하고, 차이는 PSP/Credential Provider 의 구현체뿐이다.

## 분석 — 비교와 트레이드오프

**AP2 vs A2A 단독.** A2A 는 *대화* 만 표준화하므로, Shopping Agent 가 보낸 "이 카트로 결제해줘" 메시지가 *사용자가 정말 동의한 카트* 인지 보장할 수단이 없다. AP2 는 그 위에 *사용자/에이전트 서명 위임장* 레이어를 얹어, 비결정적인 LLM 호출을 *결정론적으로 검증 가능한 권한* 으로 환원한다 [^s01][^s03].

**AP2 vs MCP.** MCP 는 모델-도구 컨텍스트, AP2 는 결제 권한이다. 둘은 직교한다 — 구글의 발표문도 두 표준이 *나란히* 산다고 명시한다 [^s03][^s10]. 저장소의 샘플은 MCP 변형(`merchant_agent_mcp`, `credentials_provider_mcp` 등) 을 통해 AP2 흐름을 MCP 위에서도 그대로 굴린다 [^s02].

**AP2 vs Coinbase x402 단독.** x402 는 HTTP 402 응답을 사용하는 머신-투-머신 결제 프로토콜이고, *결제 권한이 누구에게 있는가* 는 자체적으로 풀지 않는다. AP2 는 x402 를 *결제 레일* 로 사용하고 그 위에 Mandate 기반 권한 레이어를 얹는다 [^s03][^s08].

**AP2 vs Mastercard Agent Pay.** Mastercard 는 자체 Agent Pay 노력을 갖고 있으나, v0.2 의 Verifiable Intent 작업은 Mastercard 와 *공동 개발해* FIDO 로 함께 기증되었다 [^s12]. 즉 두 표준 사이에 노골적 충돌이 있는 것은 아니고, Mastercard 는 자기 자산 일부를 AP2 의 Verifiable Intent 로 흡수시키는 길을 선택했다 _(unverified — single source: NoHacks)_.

**FIDO 거버넌스 이관의 함의.** 표준이 한 회사 손에 있으면 가맹점·발급사가 기술 결정을 채택하기 어렵다. FIDO 이관은 다년간 다중 이해관계자 의사결정을 허용하는 대신, *변경 속도* 가 느려질 가능성을 받아들이는 트레이드오프다 [^s12].

**Independent writeup 의 불일치.** Vellum, Eco, Medium 의 독립 기술 해설은 모두 AP2 의 Mandate / VC 모델을 같은 방향으로 묘사하지만, 일부는 v0.1 의 "Intent / Cart / Payment" 명명을, 일부는 v0.2 의 "Checkout / Payment" 명명을 쓴다 [^s10][^s11][^s13]. 두 모델이 같은 저장소에 공존하므로 *어느 묘사가 옳다* 가 아니라 *어느 버전을 다루고 있는지를 명시하는 것이 옳다*.

## 논의

스펙 본문은 "AP2 assumes that … the Agent itself is a potential attacker" 라는 한 문장에 표준의 보안 모델 전체를 압축한다 [^s01]. 그 결과 (1) Trusted Surface 가 **반드시 비-agentic** 이어야 한다는 강제, (2) 모든 검증 코드가 결정론적이어야 한다는 강제, (3) Mandate 간 결합이 ECDSA 서명을 강제하는 이유까지 일관되게 떨어진다 [^s01]. 이 구조는 한 가지 *불편한 진실* 을 인정한다 — *에이전트 자체* 는 신뢰의 출발점이 될 수 없고, 신뢰는 *사용자의 서명* 또는 *별도의 비-agentic 서피스* 에서만 나올 수 있다.

남은 미해결 영역은 (1) 분쟁/차지백 흐름이 spec 에서 "Mandate 가 증거로 쓰일 수 있다" 수준으로만 묘사되고 절차적 normative 가 비어 있다는 점, (2) Trusted Agent Provider 모델에서 *제공자 평판/감사* 를 누가 어떻게 부여하는지, (3) v0.1 SDK 와 v0.2 스키마 사이의 마이그레이션 도구가 아직 보이지 않는다는 점이다 [^s01][^s07].

생태계 측면에서 AP2 의 가장 큰 단기 의미는 *결제 권한 표면* 의 동상을 잡았다는 것이다. 결제망·PSP 가 *어떤 객체* 를 받아 검증해야 하는지가 정해지면 그 위에 위험 모델·보험·인증 마크 같은 산업 인프라가 붙을 수 있다 [^s03][^s12].

## 한계

이 보고서가 다루지 않는 것 — (1) AP2 SDK 의 보안 감사 보고서, (2) v0.1 → v0.2 의 자동 마이그레이션 가이드(존재하지 않음), (3) FIDO 거버넌스 절차 안에서 결정될 *Verifiable Intent* 의 최종 형태, (4) 카드 네트워크 측의 토큰 발급/스코프 제한의 구체적 정책, (5) 사용자 ID 패스키/생체 인증을 Trusted Surface 에 묶는 디바이스-OS 수준 통합. 인용한 파트너 수 ("60+") 와 도입 사례 다수는 *벤더 발표 수치* 이며 독립 검증되지 않았다.

## 초록

AP2 는 *에이전트가 사용자를 대신해 결제를 개시* 하는 흐름에 *사용자/에이전트가 서명한 Mandate* 를 결합·검증 가능 자격증명(VC)/SD-JWT 로 강제 주입하는 결제 권한 표준이다. 다섯 역할(Shopping Agent, Credential Provider, Merchant, Merchant Payment Processor, Trusted Surface) 중 Shopping Agent 는 본질적으로 agentic 이고 Trusted Surface 는 반드시 비-agentic 이며, 모든 검증은 결정론적 코드 안에서만 일어나야 한다. 발표 시점의 v0.1 SDK 는 Intent / Cart / Payment 세 Mandate 를 Pydantic 모델로 두지만, 2026-04 의 v0.2 스펙은 이를 SD-JWT 로 표현되는 Checkout Mandate + Payment Mandate 두 종류로 통합했으며, 두 Mandate 는 *merchant-signed Checkout JWT 의 해시* 로 영구 결합된다. Human-Present 흐름은 사용자가 closed Mandate 에 직접 서명하고, Human-Not-Present 흐름은 open Mandate 의 제약 안에서 에이전트가 자율 실행한다. 표준은 카드·실시간 송금·스테이블코인·x402 크립토 레일에 모두 적용되고, 2026-04 에 FIDO Alliance 로 거버넌스가 이양됐다. 저장소(`google-agentic-commerce/AP2`, Apache-2.0)는 Python·Go·Android 샘플과 SD-JWT 기반 Python SDK 를 함께 제공하므로 본 보고서의 예제 코드는 그대로 실행 가능한 형태의 단계별 흐름이다.
