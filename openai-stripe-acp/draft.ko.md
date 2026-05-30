# OpenAI × Stripe Agentic Commerce Protocol (ACP)

## 서론

**Agentic Commerce Protocol(ACP)** 는 Apache-2.0 라이선스 오픈 표준으로, 현재 `beta` 상태이며 *구매자의 AI 에이전트와 가맹점이 결제를 어떻게 완료할지* — 그리고 가맹점이 사용자의 원본 카드 데이터를 *전혀 보지 않은 채* 어떻게 정산받을 수 있는지를 정의한다. OpenAI와 Stripe가 Founding Maintainer로 공동 유지보수하며, 추후 더 넓은 커뮤니티 거버넌스로 확장하기로 명시되어 있다 [^s01][^s02]. 첫 프로덕션 쇼케이스는 ChatGPT 안의 **"Instant Checkout"** 이고, Stripe가 첫 호환 PSP 역할이다 [^s01][^s04].

ACP는 세 당사자 — 에이전트·PSP·가맹점 — 사이의 *상호작용 표면* 만 명세한다. 에이전트 런타임, 가맹점 커머스 백엔드, PSP 정산 인프라는 그대로 둔다. 표준화하는 것은 와이어 위의 JSON과 그 둘레의 헤더뿐이다 [^s01][^s04].

## 배경 — 세 당사자와 날짜 기반 버전

명세상 행위자 모델은 셋이다 [^s04]:

- **Agent (ChatGPT).** "ChatGPT collects buyer, fulfillment, and payment information from the user" — 사용자로부터 구매자/배송/결제 정보를 모아 가맹점의 ACP 엔드포인트를 호출한다 [^s04].
- **Merchant.** 검증·배송 옵션 결정·세금 계산·결제 신호 분석·결제 처리를 자체 시스템에서 수행한다 [^s04].
- **PSP (Payment Service Provider).** 결제 토큰을 발급해 OpenAI에 돌려주고, 그 토큰이 가맹점으로 전달된다 [^s04].

ACP는 **날짜 스냅샷** 으로 릴리즈된다. 공개된 시리즈는 `2025-09-29`(초기), `2025-12-12`(fulfillment 보강), `2026-01-16`(capability negotiation), `2026-01-30`(extensions·discounts·payment handlers), `2026-04-17`(cart·feed·orders·delegate-authentication·MCP binding) 이다 [^s02]. RFC 와 SEP(Specification Enhancement Proposal) 프로세스가 저장소에 명시되어 있고(`rfcs/`, `docs/sep-guidelines.md`), 진행 중인 작업은 `unreleased/` 디렉터리에 살아 있다 [^s02].

## 아키텍처 — Agentic Checkout + Delegated Payment

ACP 는 두 개의 REST 하위 명세가 결합된 구조다 [^s07][^s08].

### Agentic Checkout

**가맹점이** 호스팅한다. 2026-04-17 OpenAPI 기준 엔드포인트 [^s08]:

```
POST   /checkout_sessions                                    createCheckoutSession
PATCH  /checkout_sessions/{checkout_session_id}              updateCheckoutSession
GET    /checkout_sessions/{checkout_session_id}              getCheckoutSession
POST   /checkout_sessions/{checkout_session_id}/complete     completeCheckoutSession
POST   /checkout_sessions/{checkout_session_id}/cancel       cancelCheckoutSession
```

세션 응답은 *이 가맹점이 어떻게 결제받기를 원하는가* 를 알려주는 능력(capability) 표면을 광고한다. 2026-04-17 예제는 동일 응답에 두 개의 payment handler 를 한꺼번에 노출한다 — Stripe 를 통한 토큰화 카드 핸들러 하나, 가맹점 자체 관리(saved card) 핸들러 하나 — 각각 reverse-DNS id 와 명시적 PSP 귀속으로 식별된다 [^s06]:

```json
{
  "capabilities": {
    "payment": {
      "handlers": [
        {
          "id": "card_tokenized",
          "name": "dev.acp.tokenized.card",
          "requires_delegate_payment": true,
          "requires_pci_compliance": false,
          "psp": "stripe",
          "config": {
            "accepted_brands": ["visa","mastercard","amex","discover"],
            "supports_3ds": true,
            "3ds_versions": ["2.1.0","2.2.0"]
          }
        },
        {
          "id": "seller_pm_123",
          "name": "dev.acp.seller_backed.saved_card",
          "requires_delegate_payment": true,
          "requires_pci_compliance": false,
          "psp": "seller_managed"
        }
      ]
    },
    "interventions": {
      "supported": ["3ds","address_verification"],
      "enforcement": "conditional"
    }
  },
  "status": "ready_for_payment"
}
```

빌더 입장에서 가장 중요한 플래그는 `requires_pci_compliance: false` 다. 가맹점은 원본 카드를 다루지 않고 vault token 하나만 받는다. PCI 범위는 PSP 쪽으로 옮겨간다.

### Delegated Payment

**PSP가** 호스팅한다. 엔드포인트는 단 하나 [^s07]:

```
POST /agentic_commerce/delegate_payment        delegatePayment
```

OpenAPI 기준 요청 헤더 [^s07]:

| 헤더 | 용도 |
|---|---|
| `Authorization: Bearer …` | PSP API 자격증명 |
| `Idempotency-Key` | 오류 모델(`idempotency_key_required`)에서 강제 |
| `Request-Id` | 상관관계 ID |
| `Signature` | 요청 검증용 detached JSON signature |
| `Timestamp` | ISO 8601 시간 — 재전송 방지 |
| `API-Version` | 날짜 기반 ACP 버전 (예: `2026-04-17`) |
| `Accept-Language`, `User-Agent`, `Content-Type` | 표준 |

OpenAPI 자체는 `Signature` 를 `required: false` 로 선언하지만, 오류 모델과 헤더 목록이 검증 기본 요소로 다루는 만큼 프로덕션에서는 사실상 필수일 것이다 — 이 모호함은 보고서의 *uncertainties* 에 기록했다 [^s07].

본문은 네 개의 최상위 객체로 구성된다 — `payment_method`, `allowance`, `risk_signals`, `metadata` [^s05]:

```json
{
  "payment_method": {
    "type": "card",
    "card_number_type": "fpan",
    "number": "4242424242424242",
    "exp_month": "11", "exp_year": "2026",
    "name": "Jane Doe", "cvc": "223",
    "checks_performed": ["avs","cvv"],
    "display_brand": "visa", "display_last4": "4242"
  },
  "allowance": {
    "reason": "one_time",
    "max_amount": 2000,
    "currency": "usd",
    "checkout_session_id": "csn_01HV3P3XYZ9ABC",
    "merchant_id": "acme_store",
    "expires_at": "2025-10-09T07:20:50.52Z"
  },
  "risk_signals": [
    { "type": "card_testing", "score": 10, "action": "manual_review" }
  ],
  "metadata": { "source": "chatgpt_checkout" }
}
```

PSP 는 `vt_…` 접두어를 가진 vault token id 를 응답한다 [^s05]:

```json
{
  "id": "vt_01J8Z3WXYZ9ABC",
  "created": "2025-09-29T11:00:00Z",
  "metadata": { "source": "agent_checkout", "merchant_id": "acme_store" }
}
```

이 토큰은 **single-use** 이며, `allowance` 가 정의한 범위 — `max_amount` 이하 금액으로, `currency` 통화로, `merchant_id` 가맹점에 대해, 명시된 `checkout_session_id` 에 한정해, `expires_at` 이전에만 — 결제될 수 있다 [^s03][^s05]. OpenAI 스펙 페이지는 보안 주장을 분명히 적는다 — "PSP-returned credentials are narrowly scoped and cannot be used outside the defined limits of the user-approved purchase" [^s03].

에러 모델은 구조화되어 있고 PSP 쪽 조건들에 안정적인 코드를 둔다 [^s05]:

```
invalid_card
idempotency_conflict          (같은 키, 다른 바디)
idempotency_in_flight         (같은 키, 처리 중)
idempotency_key_required
too_many_requests
```

## 코드 레벨 워크스루 — 예제 구현

해피 패스는 네 번의 HTTP 호출이다. 아래는 `requests` 만 사용하는 실행 가능한 Python 스케치다 — 요청 바디는 저장소의 예제 페이로드 [^s05][^s06][^s07][^s08] 와 동일한 모양이다.

```python
import json, time, uuid, requests

MERCHANT = "https://acme.example.com"
PSP      = "https://stripe-acp.example.com"   # Stripe ACP base
API_VER  = "2026-04-17"

def H(idempotency_key=None, signature=None):
    h = {
        "Content-Type": "application/json",
        "API-Version": API_VER,
        "Request-Id": str(uuid.uuid4()),
        "Timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if idempotency_key: h["Idempotency-Key"] = idempotency_key
    if signature:       h["Signature"]       = signature
    return h

# 1) Agent → Merchant: 체크아웃 세션 생성
r = requests.post(f"{MERCHANT}/checkout_sessions",
    headers=H(idempotency_key="agent-" + str(uuid.uuid4())),
    json={
        "currency": "usd",
        "line_items": [{"id": "item_123"}],
        "fulfillment_details": {
            "name": "John Doe", "phone_number": "15551234567",
            "email": "johndoe@example.com",
            "address": {
                "name": "John Doe", "line_one": "1234 Chat Road",
                "city": "San Francisco", "state": "CA",
                "country": "US", "postal_code": "94131"
            }
        }
    })
session = r.json()
checkout_session_id = session["id"]

# 2) Agent 는 capabilities.payment.handlers[] 에서 핸들러 선택
#    requires_delegate_payment=true 인 핸들러는 vault token 이 필요함
handler = next(h for h in session["capabilities"]["payment"]["handlers"]
               if h["requires_delegate_payment"])
assert handler["name"] == "dev.acp.tokenized.card"
assert handler["psp"]  == "stripe"

# 3) Agent → PSP: delegate_payment 호출, allowance 로 vault token 발급
total = next(t for t in session["totals"] if t["type"] == "total")["amount"]
r = requests.post(f"{PSP}/agentic_commerce/delegate_payment",
    headers=H(idempotency_key="delegate-" + checkout_session_id,
              signature="<detached-jws-of-request-body>"),
    json={
        "payment_method": {
            "type": "card", "card_number_type": "fpan",
            "number": "4242424242424242",
            "exp_month": "11", "exp_year": "2026",
            "name": "Jane Doe", "cvc": "223",
            "checks_performed": ["avs", "cvv"]
        },
        "allowance": {
            "reason": "one_time",
            "max_amount": total,
            "currency": "usd",
            "checkout_session_id": checkout_session_id,
            "merchant_id": handler["config"]["merchant_id"],
            "expires_at": "2026-05-30T07:20:50.52Z"
        },
        "risk_signals": [{"type": "card_testing", "score": 10, "action": "manual_review"}],
        "metadata": {"source": "chatgpt_checkout"}
    })
vault = r.json()
assert vault["id"].startswith("vt_")    # vault token 확인

# 4) Agent → Merchant: vault token 으로 세션 완료
r = requests.post(f"{MERCHANT}/checkout_sessions/{checkout_session_id}/complete",
    headers=H(idempotency_key="complete-" + checkout_session_id),
    json={"payment_token": vault["id"]})
print(r.json())                          # 완료 상태, order id 등
```

이 흐름은 저장소의 정식 예제 JSON 의 구조 [^s05][^s06] 와 같다. 프로덕션 코드라면 바디 서명(`Signature` 는 detached JSON signature [^s07])과 문서화된 오류 코드 처리가 추가되어야 한다 [^s05]. 실제 Stripe API 와 연결한 독립 참조 구현은 `locus-technologies/agentic-commerce-protocol-demo` 가 있다 [^s12].

2026-04-17 릴리즈는 **MCP binding**(`examples.mcp.agentic_checkout.json`) 도 추가했다 — 즉 동일한 Agentic Checkout 연산을 REST 대신 MCP 전송으로 호출할 수 있다. ACP 는 스스로를 "REST 와 MCP 둘 다 호환" 으로 광고한다 [^s01][^s02].

## 분석 — 비교와 트레이드오프

**Vault token vs Mandate.** Google AP2 는 사용자 서명 Mandate(SD-JWT) 로 권한을 표현하고, ACP 는 PSP 발급 vault token(`vt_…`) + Allowance 로 권한을 표현한다. Mandate 는 *사용자 서명* 에 신뢰의 뿌리를 두고, vault token 은 *PSP 의 범위 제한* 에 뿌리를 둔다. 둘은 공존할 수 있다 — Mandate 가 *어떤 체크아웃을 시도해도 되는가* 를 권한으로 주고, vault token 이 *그 결제가 어떻게 흘러갈 수 있는가* 를 제한하는 식 — 그러나 답하는 질문 자체가 다르다. _(interpretive)_

**ACP vs Coinbase x402.** x402 는 결제 레일(HTTP 402) 프로토콜이고, ACP 는 *체크아웃* 프로토콜이다. 2026-04-17 에서 Delegated Payment 가 지원하는 자격 타입은 `card` 뿐이다 — "Exactly one credential type is currently supported: card" [^s07]. 크립토 레일을 표현하려면 미래의 `payment_method.type` 으로 들어오거나, `capabilities.payment.handlers[]` 의 다른 핸들러로 들어와야 한다. 핸들러 모델은 *reverse-DNS 이름* 기반으로 확장 가능하므로 자연스러운 자리는 거기다 [^s06].

**ACP vs EIP-8004.** EIP-8004 는 에이전트의 *온체인 신원·평판·검증* 레이어로 결제 권한을 다루지 않는다. ACP 와 EIP-8004 는 직교한다 — EIP-8004 신원이 ACP `metadata` 의 `agent_id` 가 될 수 있지만, 실제 자금 이동은 ACP 쪽에서 일어난다.

**PCI 스코프가 핵심 가치.** ACP 를 도입한 가맹점은 `vt_…` 만 받는다. 핸들러 디스크립터는 *말 그대로* `requires_pci_compliance: false` 를 가맹점 쪽에 명시한다 [^s06]. Delegated Payment OpenAPI 도 카드 원본 데이터는 PSP 경계 안에 가둔다 [^s03][^s07]. 에이전트 흐름을 위해 PCI 아키텍처를 추가로 짜야 했던 가맹점에게 이게 도입 동기 1순위다.

**Stripe 가 얻는 것.** 첫 호환 PSP 라는 자리는 ChatGPT Instant Checkout 트래픽의 기본 vault-token 발급자 자리로 직결된다 [^s01][^s04]. 프로토콜은 Apache-2.0 오픈이므로 미래의 다른 PSP 도 자기 `vt_…` 를 발급할 수 있지만, ChatGPT 와 *함께 출시* 된 네트워크 효과는 실재한다.

## 논의

**창시자 귀속에 대한 충돌.** Stripe 자체 ACP 문서 페이지와 일부 검색 요약은 ACP 를 "Stripe, OpenAI, Meta 가 만든 표준" 으로 묘사한다 [^s10][^s11]. 그러나 정식 랜딩 페이지 agenticcommerce.dev [^s01] 와 GitHub README [^s02] 는 Founding Maintainer 로 OpenAI 와 Stripe 만 적는다. `MAINTAINERS.md` 에 Meta 는 없다. 가장 깔끔한 해석은 — 거버넌스 측면에서는 README 가 정식이고, Meta 는 일부 다운스트림 글이 잘못 귀속했거나, 정확한 역할이 아직 maintainer 목록에 반영되지 않은 참여자다. 보고서는 둘 다 인용하고 *해결하지 않는다*.

**거버넌스.** 저장소에는 `docs/governance.md`, `docs/operating-model.md`, RFC/SEP 프로세스(`rfcs/`, `docs/sep-guidelines.md`), CLA 프로세스(`legal/cla/`) 가 있다 [^s02]. "블로그 글로 발표" 류의 명세 치고는 거버넌스 스캐폴딩이 훨씬 두껍다. 날짜 스냅샷 릴리즈 케이던스와 합치면, ACP 는 Stripe SDK 가 아니라 *표준화 노력* 으로 운영되고 있는 형태다.

**아직 빈 자리.** Delegated Payment OpenAPI 는 "Exactly one credential type is currently supported: card" 라고 못박는다 [^s07] — 카드 외 레일(스테이블코인·은행·비-카드토큰 지갑) 은 아직 명세되어 있지 않다. 분쟁/차지백 의미론은 order 예제 파일에 간접적으로 비치지만 normative 스펙 본문은 없다. `Signature` 헤더는 OpenAPI 상 optional 로 선언되지만 프로덕션 배포에서는 사실상 필수일 것이다 — 이 격차는 구현이 아니라 *스펙* 의 문제다 [^s07].

## 한계

이 보고서가 다루지 않는 것: (1) Stripe 내부에서 `vt_…` 가 `PaymentIntent` / vault key 로 어떻게 매핑되는지, (2) OpenAI 출시 블로그(`access_limited: true`) 의 직접 인용, (3) `Signature` 헤더의 프로덕션 동작(우리는 OpenAPI 텍스트만 인용), (4) 아직 dated snapshot 으로 들어오지 않은 RFC 단계 기능(예: `rfc.delegate_authentication.md`, `rfc.intent_traces.md`, `rfc.marketing_consent.md`) 의 본문, (5) discount/extension JSON Schema 의 세부.

## 초록

Agentic Commerce Protocol(ACP) 은 AI 에이전트 주도 구매를 위한 Apache-2.0 오픈 표준으로, OpenAI 와 Stripe 가 유지보수하며 현재 `beta` 상태다. 두 개의 REST 하위 명세 — **Agentic Checkout** (가맹점이 호스팅: `/checkout_sessions` 의 create/update/complete/cancel) 와 **Delegated Payment** (PSP 가 호스팅: `POST /agentic_commerce/delegate_payment`) — 가 payment-handler 디스크립터(`dev.acp.tokenized.card`, `psp: "stripe"`, `requires_pci_compliance: false`) 로 결합된다. 에이전트는 가맹점에 세션을 만들고, `capabilities.payment.handlers[]` 중 핸들러를 골라, PSP 의 Delegated Payment 호출로 Allowance(`reason: "one_time"`, `max_amount`, `currency`, `checkout_session_id`, `merchant_id`, `expires_at`) 가 제약하는 single-use vault token(`vt_…`) 을 발급받고, 그 토큰을 가맹점 `/complete` 에 다시 제출한다. 헤더는 `Idempotency-Key`, `Signature`(detached JSON signature), `Timestamp`, `API-Version` 이며, 오류는 구조화되어 있다(`invalid_card`, `idempotency_conflict`, ...). 날짜 스냅샷은 `2025-09-29` 부터 `2026-04-17` 까지 다섯 번 릴리즈되었고 가장 최근 릴리즈는 MCP binding 을 추가했다. OpenAI 의 ChatGPT "Buy it in ChatGPT" Instant Checkout 이 쇼케이스 소비자이고 Stripe 가 founding PSP 다. 일부 3자 보고는 Meta 도 공동 창시자라 주장하지만 정식 README/랜딩 페이지는 OpenAI 와 Stripe 만 적는다. 2026-04-17 스펙은 자격 타입이 `card` 만 — 비-카드 레일과 분쟁 절차는 아직 빈 자리다.
