# AI 에이전트 결제용 스마트 계정 — 핵심 기능 요구사항과 구현 청사진

## 초록

본 보고서는 "AI 에이전트가 사용자를 대신해 결제를 실행하는" 시나리오에 맞는 스마트 계정에서 어떤 기능이 핵심적으로 필요한지, 그리고 그 기능을 실제로 어떻게 조립해야 하는지를 1차 사양과 기존 제품을 가로질러 정리한다. 카드 네트워크(Visa TAP[^s01][^s02], Mastercard Agent Pay[^s03]), 모델 사업자(OpenAI + Stripe ACP[^s04][^s05]), 클라우드(Google AP2[^s06][^s07]), 그리고 온체인 결제 표준(x402[^s08][^s09], MPP[^s11][^s12])이 같은 문제를 다른 추상으로 풀어 가는 가운데, 그 위에 얹히는 스마트 계정 인프라(Safe[^s19], ZeroDev[^s20][^s38], Biconomy[^s22], Privy[^s23][^s24], Crossmint[^s25], Coinbase AgentKit + Spend Permissions[^s26][^s27][^s28])가 공통적으로 노출해야 하는 능력의 합집합이 점차 또렷해진다. 본 보고서는 그 합집합을 **10개 핵심 기능**으로 정리하고, 6개 인프라가 각 기능을 얼마나 채우는지 매트릭스로 비교한 뒤, **ERC-7579 + EIP-7702 + SmartSessions + ERC-4337 Paymaster + AP2 Mandate 운반**을 코어로 하는 구현 청사진을 단계별 코드 인용과 함께 제시한다.

## 1. 서론 — 무엇을 풀려고 하는가

AI 에이전트가 "내가 자고 있는 사이에 카트 결제를 끝내 둬" 같은 명령을 받아 자율적으로 결제를 실행한다는 시나리오는 2024년 이후 거의 모든 1차 결제 사업자가 받아들였다 — Visa는 2025년 10월 Trusted Agent Protocol을 공식 발표했고[^s01], Mastercard는 Agent Pay 프로그램을 발표했고[^s03], OpenAI는 ChatGPT Instant Checkout을 Stripe ACP 위에 출시했고[^s04][^s05], Google은 AP2를 공개했고[^s06], Coinbase는 x402와 AgentKit를 공개했다[^s08][^s26].

이 모든 시나리오의 공통점은 **결제 행위의 주체가 사람이 아니라 에이전트**라는 것이다. 그리고 그 결과 가장 단순한 결제 단위인 **EOA + 단일 키 + 단일 서명** 모델은 구조적으로 비어 있는 자리가 너무 많다. 에이전트에 권한을 위임할 표준화된 자리가 없고, 한도·머천트 화이트리스트·만료를 매번 새로운 서명으로 표현할 수밖에 없고, prompt injection으로 에이전트가 설득당했을 때 손실 상한을 끊을 메커니즘이 없다 — 학계와 업계 모두 이 점을 정확히 같은 결론으로 지적한다[^s31][^s32][^s33].

스마트 계정은 이 빈 자리를 메우는 도구상자다. 하지만 도구상자가 너무 크고 빠르게 자라고 있어 "무엇을 골라 써야 하는지"가 그 자체로 문제가 된다. 본 보고서는 다음 6개 축으로 그 문제를 풀어 본다.

- **(a) 위협 모델** — EOA 모델로 무엇이 비어 있는가.
- **(b) 기능 체크리스트** — 그 빈 자리를 메우는 데 무엇이 1차 필수인가.
- **(c) 인프라 매핑** — 누가 무엇을 얼마나 채우는가.
- **(d) 청사진** — 어떤 표준을 코어로 두고, 어떤 모듈을 끼워 넣을 것인가.
- **(e) 코드 흐름** — 실제 SDK·계약 어디서 무엇이 어떻게 호출되는가.
- **(f) 트레이드오프** — 출시 우선 / 보안 우선 / 다레일 지원의 균형은 어디인가.

## 2. 배경 — 사례 정리

### 2.1 카드 네트워크 측

Visa TAP은 카드 네트워크 메시지 위에 (a) Agent Intent, (b) Consumer Recognition, (c) Payment Information의 세 청크를 RFC 9421 HTTP Message Signature로 묶어 운반한다[^s02]. 서명은 "특정 머천트와 목적에 한정되며, 시간 제한이 있고, 리플레이/릴레이가 불가능"하다[^s02]. Mastercard Agent Pay는 같은 문제를 카드 네트워크 토큰화 위에 "Agentic Token"을 얹는 방식으로 푼다[^s03].

### 2.2 모델 사업자 측

OpenAI + Stripe ACP는 Shared Payment Token(SPT)이라는 새 결제 프리미티브로 사용자 자격증명을 노출하지 않고 머천트에 결제를 트리거한다 — "Stripe issues a Shared Payment Token (SPT), a new payment primitive that lets applications like ChatGPT initiate a payment without exposing the buyer's payment credentials"[^s04]. 명세는 OpenAI + Stripe가 founding maintainer로 공동 운영하는 Apache-2.0 리포에 호스팅된다[^s05].

### 2.3 클라우드 측

Google AP2는 세 Mandate(Intent / Cart / Payment)를 Verifiable Credentials로 묶어 "의도 → 카트 → 결제"의 비부인성 체인을 만든다[^s06][^s07]. AP2는 A2A 위에도, MCP 위에도 운반될 수 있도록 메시지 캐리어를 분리한다는 점이 특징이다[^s06].

### 2.4 온체인 결제 표준

x402와 MPP는 같은 HTTP 402 위에 다른 추상을 얹는다. x402는 `exact` / `upto` / `batch-settlement` 같은 **스킴**으로[^s08][^s09], MPP는 `charge` / `session` / `stream` 같은 **인텐트**로[^s11][^s12] 결제 패턴을 나눈다. x402 `batch-settlement` EVM 바인딩은 channelId · ChannelConfig · 누적 바우처 · claim/settle/refund 4단계 정산을 정의한다[^s10]. 두 표준 모두 IETF 표준화(`draft-ryan-httpauth-payment-01`)와 Apache-2.0 Foundation을 양쪽으로 거버넌스를 갈라 둔다[^s09][^s12].

### 2.5 스마트 계정 인프라

이 위에 얹히는 스마트 계정은 (a) 컨트랙트 진영 — Safe[^s19], ZeroDev Kernel[^s20], Biconomy Nexus[^s22], (b) 풀스택 SaaS — Privy[^s23][^s24], Crossmint[^s25], Coinbase CDP / Spend Permissions[^s27][^s28][^s36], (c) 어댑터 SDK — Coinbase AgentKit[^s26], MetaMask Delegation Toolkit[^s17][^s18]으로 세 갈래다. 세 갈래는 사실상 같은 추상(signer / policy / action 또는 etc.)으로 수렴 중이며[^s21][^s38][^s39], 다만 키 모델·SDK 결·다체인 지원의 결이 다르다 _(interpretive)_.

## 3. Required Features — 위협 모델에서 도출한 10개 핵심 기능

다음 10개 기능은 본 보고서가 1차 자료들의 합집합으로 추출한 체크리스트다. 어느 항목도 "있으면 좋다" 수준이 아니라, 빠지면 해당 시나리오가 안전하게 동작하지 않는 1차 안전망에 속한다.

### F1. 권한 위임 + 세션 키 (Scope · 한도 · 만료)

에이전트에 매번 마스터 키 서명을 요구할 수 없으므로, "이 키는 이 머천트의 이 함수만, 이 한도 안에서, 이 시각까지" 행사할 수 있다는 사전 서명된 권한이 1차 필수다. ERC-7579 validator 슬롯에 등록되는 SmartSessions 모듈이 이 추상의 표준 후보다 — "SmartSession is an advanced module for ERC-7579 compatible smart accounts, enabling granular control over session keys"[^s21]. ZeroDev는 같은 추상을 "Permissions"로 일반화하고, 한 권한이 N개의 정책(최대 254)과 1개의 시너로 합성된다[^s38][^s39]. MetaMask Delegation Toolkit은 ERC-7710/7715 위에서 "DCA 30일, 하루 10 USDC까지" 같은 한도를 단일 권한으로 요청·승인하는 흐름을 명시적 AI 에이전트 예시로 보여 준다[^s18].

### F2. 정책 엔진 — 머천트 화이트리스트 / 카테고리 / 일·월 한도

권한 객체 안에 정책이 합성되려면, 정책 표현이 1급 시민이어야 한다. SmartSessions는 (UserOp 검증 정책 / action별 정책 / ERC-1271 서명 정책) 세 종류로 정책을 분리하고[^s21], Privy는 정책을 (전송 한도 / 컨트랙트 화이트리스트 / 수취인 제한 / 시간 기반 제어 / 행위별 규칙)으로 분리한다 — "Policies are critical as they define the boundaries within which your agents can operate"[^s23]. Coinbase Spend Permissions의 데이터 모델은 (account, spender, token, allowance, period, start, end, salt, extraData) 9개 필드로 같은 추상을 EIP-712 객체로 표현한다[^s28].

### F3. 가스 추상화 + Paymaster (USDC gas)

에이전트가 ETH를 보유하지 않고 USDC만으로 결제할 수 있어야 운영이 단순해진다. ERC-4337 Paymaster는 "user operation의 가스 결제 책임을 위임받는 특수 컨트랙트"라는 정의로[^s30], Pimlico의 오픈소스 ERC-20 Paymaster는 표준 패턴(오라클 가격 + maximum fee 선취 + 잔여분 환불)을 보인다[^s30]. Circle Paymaster는 같은 추상을 SaaS로 제공하며 Arbitrum / Avalanche / Base / Ethereum / OP / Polygon / Unichain 7개 EVM 체인을 지원한다[^s29]. Circle Paymaster는 ERC-4337 SCA뿐 아니라 EIP-7702 경로의 EOA에도 동작한다[^s29].

### F4. 다체인 / 다자산 라우팅 (인텐트 + 브리지)

에이전트는 자산 위치를 의식하지 않고 "원하는 결과"만 표현할 수 있어야 한다. x402 `batch-settlement`는 임의 EVM ERC-20을 받을 수 있는 멀티토큰성을 갖고[^s10], LI.FI는 2026년에 "For Agents" 문서 탭과 Intents Stack을 출시해 27 브리지·31 DEX·58 체인을 단일 API로 추상화한다[^s37].

### F5. 키 관리 모델 — EOA+컨트랙트 / SSS+TEE / dual-key+TEE

키가 어디에 어떻게 보관되느냐가 위협 모델의 절반을 결정한다. Privy는 키를 2-of-2 SSS로 (Enclave 샤드 + Auth 샤드)로 쪼개 TEE 안에서만 잠시 결합한다 — "Keys are only stored as encrypted shares distributed across separate security boundaries"[^s24]. Crossmint는 Owner Key는 사용자 측, Agent Key는 TEE 안에서 운영하는 dual-key 모델을 택한다 — "Each agent gets a smart contract wallet with two keys: An Owner Key that stays with the owner and an Agent Key that lives in a Trusted Execution Environment (TEE)"[^s25]. ERC-4337 + EIP-7702 모델은 EOA가 사용자 디바이스/패스키에 남고 컨트랙트가 그 위에서 동작한다[^s13][^s14]. **단일 EOA가 직접 결제를 트리거하는 모델은 권장되지 않는다** — Marino & Juels는 이 점을 "doing so … could lead to formidable new vectors of AI harm"으로 적시한다[^s31].

### F6. 인증·신원·소비자 보호 (Mandate / Trusted Agent)

카드 네트워크 측에서는 "이 결제가 정말 사용자가 사전 허락한 에이전트의 것인가"를 카드 네트워크 메시지로 운반해야 한다. Visa TAP의 Agent Intent · Consumer Recognition · Payment Information 세 청크[^s02]와 AP2의 Intent Mandate · Cart Mandate · Payment Mandate 세 객체[^s06][^s07]가 같은 추상의 카드망 / 클라우드 변종이다. 스마트 계정 측은 이 두 객체를 HTTP 레벨에서 받아 정책 엔진(F2)이 검증할 수 있어야 한다.

### F7. 감사 가능성 — 영구 로그와 호출 컨텍스트

결제는 사후 감사 가능해야 한다. 온체인 측에서는 모든 UserOperation이 EntryPoint 이벤트로 영구 기록된다[^s13]. 카드 측에서는 SPT가 "프로그램적으로 통제·권한·로깅"된다고 명시되고[^s04], AP2의 세 Mandate가 "non-repudiable audit trail"을 만든다고 선언한다[^s06]. 1차 안전망으로 (a) on-chain UserOperation events, (b) AP2 Mandate 체인, (c) ACP receipt를 모두 저장해 두는 것이 권장된다 _(interpretive)_[^s06][^s13].

### F8. 분쟁·환불·복구 (timed withdraw / dispute / social recovery)

장기 운용을 위해서는 (a) 사용자가 키를 잃어도 계정을 복구할 수 있어야 하고, (b) 에이전트가 통제 불능 상태가 됐을 때 자금을 회수할 수 있어야 한다. ERC-7093은 social recovery의 표준 인터페이스를 정의한다 — "A standard interface for social recovery of smart contract accounts"[^s34]. x402 `batch-settlement`는 timed withdraw(15분–30일 grace period)를 사용자 측 escape hatch로 명시한다 — server가 비협조적이면 사용자가 잔액을 전부 회수한다[^s10]. Crossmint의 owner key는 같은 목적의 마스터 오버라이드다[^s25].

### F9. 마이크로결제 채널 (x402 batch-settlement / MPP session)

단건 온체인 결제로는 LLM 토큰 단위 과금이나 머신-투-머신 API 호출을 감당하기 어렵다. x402 `batch-settlement`는 단일 디포짓 + 누적 EIP-712 바우처 + 주기적 batched claim/settle/refund로 이를 해결하고[^s10], MPP `session`은 단방향 채널 + cumulative commitment + close-on-highest로 같은 문제를 푼다[^s11][^s12][^s35]. 두 표준은 같은 추상이지만 트래픽 방향이 다르고(전자는 머천트 1 × 사용자 N, 후자는 사용자 1 × 머천트 1) 거버넌스 / 다체인 결이 다르다 — 그래서 시나리오별로 골라 쓰는 결정이 필요하다.

### F10. LLM 안전 가드 — 정합성과 prompt injection 방어

스마트 계정은 컨트랙트 측 가드만으로 충분하지 않다. LLM이 잘못 설득되면 정책 엔진이 손실 상한을 끊는 마지막 방어선이지만, 그 이전에 (a) 에이전트가 보는 카트 콘텐츠 자체가 서명된 객체여야 한다(AP2 Cart Mandate가 그 역할)[^s06][^s07]. (b) 정책 엔진은 LLM 외부에서 강제 가드 역할을 해야 한다 — Whispers of Wealth는 "simple adversarial prompts can reliably subvert agent behavior"라는 결론에 도달했고[^s32], Grok/Bankr 사건은 "The failure point was intent parsing, not reentrancy"임을 보였다[^s33]. Marino & Juels의 위협 모델은 이를 새로운 카테고리의 AI harm으로 정리한다[^s31].

## 4. Cross-comparison — 누가 무엇을 충족하는가

| 기능 | Safe (+7579) | ZeroDev Kernel | Biconomy Nexus | Privy | Crossmint | Coinbase AgentKit / CDP |
|---|---|---|---|---|---|---|
| F1 세션 키 / 위임 | Safe7579 + SmartSessions[^s19][^s21] | Composable Permissions[^s20][^s38][^s39] | Nexus + SmartSessions[^s21][^s22] | 정책 SaaS[^s23] | Owner / Agent Key[^s25] | Spend Permissions[^s27][^s28][^s36] |
| F2 정책 엔진 | 모듈로 외부 위임[^s19] | N×policy + 1×signer[^s38][^s39] | 3 종 policy 분리[^s21] | 5 종 정책[^s23] | 머천트 화이트리스트 + 한도[^s25] | EIP-712 9개 필드[^s28] |
| F3 Paymaster | 4337 외부 인프라 | Kernel + 4337 Paymaster[^s20] | Nexus Paymaster[^s22] | embedded 가스 후원[^s23] | 카드+USDC 동시[^s25] | CDP Smart Wallet 가스[^s36] |
| F4 다체인 / 라우팅 | Safe 자체 멀티체인 | 15+ EVM[^s20] | EVM 위주[^s22] | "any chain"[^s23] | 40+ 체인[^s25] | EVM + Solana, x402[^s26] |
| F5 키 모델 | 컨트랙트 다중서명 | EOA + 컨트랙트 | EOA + 컨트랙트 | SSS + TEE[^s24] | dual-key + TEE[^s25] | WalletProvider 위임[^s26] |
| F6 Mandate / TAP | 어댑터 외부 | 어댑터 외부 | 어댑터 외부 | 어댑터 외부 | Visa Intelligent Platform 직접 통합[^s25] | x402 + AP2 어댑터[^s26] |
| F7 감사 / 로그 | EntryPoint 이벤트 | EntryPoint 이벤트 | EntryPoint 이벤트 | SaaS audit log[^s23] | audit log[^s25] | EntryPoint + SDK 로그[^s27] |
| F8 분쟁 / 복구 | ERC-7093 모듈 옵션[^s34] | 모듈 옵션[^s20] | 모듈 옵션[^s22] | TEE recovery[^s24] | Owner Key 회수[^s25] | Spend revoke[^s27] |
| F9 마이크로채널 | 외부 어댑터 | 외부 어댑터 | 외부 어댑터 | 외부 SDK | 외부 어댑터 | x402 native[^s26] |
| F10 LLM 가드 | 외부 (AP2 / Cart Mandate) | 외부 | 외부 | 외부 | 외부 | 외부 |

핵심 관찰은 **모든 10개 기능을 한 인프라가 자체적으로 채우는 경우는 없다**는 것이다 _(interpretive)_[^s15]. 실제 제품은 (a) 코어 계정(Safe / ZeroDev / Biconomy / CDP) 위에 (b) 정책 모듈(SmartSessions / Permissions / Spend Permissions) (c) 가스 후원(Pimlico / Circle / CDP) (d) 결제 어댑터(x402 / MPP / Stripe ACP) (e) Mandate 운반(AP2 / TAP)을 어댑터로 합치는 형태로 만들어진다.

## 5. Implementation Blueprint — 어떻게 만들 것인가

본 절은 위 10개 기능을 하나의 참조 구현으로 묶기 위한 청사진을 단계별로 제시한다.

### 5.1 코어 — ERC-7579 모듈러 계정 + EIP-7702 옵션

코어 계정은 **ERC-7579 모듈러 인터페이스**를 기본으로, EIP-7702 위임 경로를 함께 받는 것이 합리적 기본값이다.

- ERC-7579는 4개 모듈 타입(validator, executor, fallback, hook)과 `installModule(uint256 moduleTypeId, address module, bytes initData)` 표준 ABI를 정의한다[^s15].
- 같은 계정에 EIP-7702 위임을 더하면, EOA가 임시로 같은 컨트랙트 코드를 자기 주소에 끼울 수 있어 기존 사용자도 마이그레이션 없이 흡수된다[^s14].

코어 구현체로는 (a) **자기 컨트롤이 중요한 경우** Safe + Safe7579 Adapter[^s19], (b) **모듈러 + 가스 효율이 중요한 경우** ZeroDev Kernel[^s20] 또는 Biconomy Nexus[^s22] 중 하나를 선택할 수 있다.

### 5.2 권한 모듈 — SmartSessions 또는 자체 PolicyValidator

세션 키는 ERC-7579 validator(`moduleTypeId = 1`) 슬롯에 등록되는 모듈로 처리한다[^s15][^s21]. 표준 등록 패턴은 다음과 같다(코드 인용은 ERC-7579 명세 본문에서 발췌)[^s15]:

```solidity
function installModule(
    uint256 moduleTypeId, // 1 = validator
    address module,       // SmartSessionValidator address
    bytes calldata initData // 세션 정책 인코딩
) external;
```

이 등록 자체를 UserOperation으로 보내면, EntryPoint가 그 동작을 마스터 키로 인증한다[^s13]. 이후 모든 후속 UserOperation은 그 세션 키 validator로 라우팅되어 (1) 세션 키 서명 검증, (2) callData가 인코딩된 scope 안에 있는지 검증, (3) 한도·만료 통과를 차례로 확인한다[^s21][^s38].

ZeroDev Permissions 모델을 그대로 차용한다면, 권한 객체는 다음 구조다[^s38][^s39]:

```text
Permission = {
  signer:   { type: "ECDSA" | "WebAuthn" | "Multisig", ... },
  policies: [
    { type: "callPolicy", allowedContracts: [...] },
    { type: "gasPolicy", maxGas: ... },
    { type: "signaturePolicy", ... },
    ... (up to ~254 policies)
  ],
  action:   { selector: 0x..., executeFn: ... },
}
```

이 객체는 사용자 마스터 키로 EIP-712 서명되어 모듈 install 단계에 전달된다.

### 5.3 결제 어댑터 레이어 — x402 + MPP 동시 노출

머천트 측 서버는 결제 표준이 단일이 아님을 가정해야 한다. 본 청사진은 한 미들웨어가 두 표준을 동시에 받을 수 있는 어댑터를 둔다.

```typescript
// 의사 코드 — server-side
app.use(
  paymentAdapter({
    routes: {
      "GET /llm/stream": [
        // x402 batch-settlement
        { scheme: "batch-settlement", network: "eip155:8453", token: USDC, payTo },
        // MPP session
        { intent: "session", method: "tempo", currency: PATH_USD, recipient },
      ],
    },
    facilitator: { url: "https://x402.org/facilitator" },
    channelStore: new RedisChannelStore(),
    depositMultiplier: 5n, // 3× 최소, 5× 기본
  }),
);
```

`x402.org/facilitator`로 가는 검증 경로와 `tempo.session()`/`session.sse()` 클라이언트 흐름은 본 보고서의 자매 보고서 [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/)에 자세하다.

### 5.4 가스 후원 — Paymaster 경로

ERC-4337 SCA 경로에는 ERC-4337 Paymaster를 표준 진입점으로 둔다. 두 가지 모드를 권장한다.

- **USDC 가스** — Circle Paymaster 또는 Pimlico ERC-20 Paymaster. `claimWithSignature`/`transferWithAuthorization` 위에서 동작하며, 오라클이 토큰 가격을 가져온다[^s29][^s30].
- **머천트 후원** — facilitator(또는 머천트 측 채널 매니저)가 가스를 후원한다 — x402 측에서는 "deposits, batched settlements and refunds are all sponsored by the transaction's facilitator" 형태로 명시된다[^s10].

EOA-only 경로(7702 미사용)에는 EIP-3009 `receiveWithAuthorization`(EIP-3009 호환 토큰) 또는 Permit2(일반 ERC-20)로 가스리스 디포짓을 제공한다 — x402 batch-settlement는 카노니컬 collector 컨트랙트로 이를 표준화한다[^s10].

### 5.5 신원·Mandate 운반 — AP2 + TAP 헤더 어댑터

결제 어댑터 레이어 위에 추가 어댑터를 두어 카드 네트워크 / 클라우드 표준이 발신하는 인증 객체를 받는다.

- **AP2 Mandate 어댑터** — Intent / Cart / Payment Mandate를 HTTP 헤더 또는 A2A/MCP 메시지로 받아 정책 엔진의 검증 단계로 넘긴다[^s06][^s07].
- **Visa TAP 어댑터** — RFC 9421 HTTP Message Signature 위의 Agent Intent / Consumer Recognition / Payment Information을 검증해 카드 네트워크 측 dispute 모델을 그대로 유지한다[^s02].

이 두 어댑터는 정책 엔진의 외부 인터페이스에 동일한 모양으로 들어와야 한다 — 결과적으로 정책 엔진은 "이 결제가 사용자의 사전 허락된 의도에 부합하는가"만 확인하면 된다.

### 5.6 정책 엔진 데이터 모델 — signer / policy / action

정책 엔진의 데이터 모델은 다음 세 자리를 갖춰야 한다(F1·F2의 통합 형태):

```text
SignedPermission = EIP712({
  signer:   PublicKey | DelegationAuthority,
  policies: Policy[],  // 한도, 화이트리스트, 시간 윈도우, 카테고리, ...
  action:   { contract: address, selector: bytes4 },
  expiry:   timestamp,
  nonce:    uint256,
})
```

ERC-7710 / ERC-7715의 정의는 거의 같은 추상을 다른 단어로 표현한다 — ERC-7710은 "스마트 컨트랙트가 다른 스마트 컨트랙트나 EOA에게 능력을 위임"하는 표준[^s16], ERC-7715는 "dapp-to-wallet permission requests with upfront user approval"이다[^s18]. MetaMask Delegation Toolkit은 두 표준을 한 SDK로 받는다 — "Let AI agents trade on your behalf by assigning limited execution permissions via ERC-7710"[^s18].

Base Spend Permissions는 같은 추상을 EVM 컨트랙트 수준에서 표현한다 — (account, spender, token, allowance, period, start, end, salt, extraData) 9개 필드의 EIP-712 객체로 권한을 정의하고[^s28], `SpendPermissionManager`가 그 권한 안에서만 사용자 자금을 옮긴다[^s27].

### 5.7 감사 로그 / 알림 / 사용자 콘솔

(a) 온체인 측 — 모든 UserOperation을 EntryPoint 이벤트로 저장하고, 사용자 콘솔에서 시간 순으로 표시한다[^s13]. (b) Mandate 측 — AP2 Intent / Cart / Payment Mandate 체인을 그대로 보존한다[^s06]. (c) Card 측 — Stripe receipts와 SPT 사용 로그를 함께 묶는다[^s04]. 사용자는 이 셋이 합쳐진 단일 타임라인에서 "어떤 에이전트가 / 어떤 의도로 / 어떤 권한으로 / 얼마를 결제했는지"를 한눈에 본다.

### 5.8 LLM 안전 가드 — Signed cart + 외부 정책 강제

마지막 안전망은 두 겹이다.

1. **Signed cart** — 사용자가 보는 카트가 곧 LLM이 결제하는 카트여야 한다. AP2 Cart Mandate는 정확히 이 보증을 제공한다[^s06][^s07]. ACP의 SPT는 "scoped to a specific merchant and cart total" 속성으로 같은 보증을 강제한다[^s04].
2. **외부 정책 강제** — 컨트랙트 측 정책 엔진은 LLM 외부에서 강제 가드 역할을 한다. Whispers of Wealth와 Grok 사건은 모두 "에이전트가 잘못 설득됐을 때 손실 상한을 끊을 마지막 줄"이 컨트랙트 측 정책이어야 함을 시사한다[^s32][^s33]. Marino & Juels의 위협 분류는 이를 새로운 카테고리의 AI harm으로 정리하며, "기술적 작업이 필요한 영역"으로 적시한다[^s31].

## 6. 논의 — 트레이드오프와 우선순위

### 6.1 단방향 채널 vs 단건 결제

(interpretive) "한 endpoint에 한 에이전트가 길게 머무르며 토큰 단위 과금" 시나리오는 MPP `session`이 자연스럽고[^s11][^s35], "한 endpoint에 다수 에이전트가 같은 요금으로 결제" 시나리오는 x402 `batch-settlement`가 자연스럽다[^s10]. 단건 결제(`exact` / `charge`)는 두 시나리오 모두에서 폴백 역할로만 충분하다. 청사진은 세 추상을 모두 등록 가능한 결제 어댑터 레이어를 권장한다.

### 6.2 풀스택 SaaS vs 모듈러 컨트랙트

풀스택 SaaS(Privy, Crossmint, Coinbase CDP)는 빠른 출시에 유리하고, 모듈러 컨트랙트(Safe, ZeroDev, Biconomy)는 모듈 자유도와 vendor lock-in 회피에 유리하다 — 자매 보고서 [`smart-account-providers-deep-dive`](../smart-account-providers-deep-dive/)에 같은 결론이 정리되어 있다. Coinbase AgentKit이 `PrivyWalletProvider` / `ZeroDevWalletProvider`를 1급으로 받아들이고[^s26], MetaMask Delegation Toolkit이 ERC-7710/7715를 표준 어댑터로 노출하는 것은[^s17][^s18] 어느 한 진영의 승리가 아니라 두 진영이 서로를 흡수하는 방향임을 보여 준다 _(interpretive)_.

### 6.3 카드 네트워크 vs 온체인 결제 (dispute 비대칭)

카드 네트워크 측은 dispute / chargeback / KYC 책임을 자기 perimeter 안에 둔다[^s01][^s02][^s03]. 온체인 측은 사용자가 한 번 서명한 권한이 잘못 행사되었을 때의 dispute 경로가 표준화되어 있지 않다. AP2가 Verifiable Credentials와 FIDO를 끌어들이는 것[^s06]과 ERC-7093이 social recovery를 표준화하는 것[^s34]은 이 비대칭을 일부 메우는 시도다.

### 6.4 출시 우선 vs 보안 우선

출시 우선이라면 Coinbase AgentKit + CDP Smart Wallet + Spend Permissions의 풀스택 경로가 가장 짧다[^s26][^s27][^s36]. 보안 우선이라면 ERC-7579 Safe + SmartSessions + Circle Paymaster + ERC-7093 social recovery의 모듈러 경로가 더 안전하다 — 같은 모듈을 여러 진영의 계정에서 동일하게 검증할 수 있기 때문이다[^s15][^s19][^s21]. 본 청사진은 후자를 권장 기본값으로 두고, 출시 일정에 따라 전자를 단계적 마이그레이션 경로로 둔다.

## 7. 한계

- 본 보고서는 2026년 5월 20일 시점의 1차 사양과 SDK 문서를 기준으로 한다. 표준은 빠르게 변동 중이라(특히 ERC-7710 / 7715 / 7093, EIP-7702, ERC-7579 모듈 생태계, x402 V2 후속 스킴) 특정 버전 이후의 필드/함수 명세는 향후 갱신될 가능성이 있다.
- 10개 기능 리스트는 본 보고서의 합성 판단이다. 각 항목은 1차 소스로 받쳐져 있지만, 리스트 자체가 표준화된 합의가 아니라는 점을 명시한다.
- 6개 인프라 비교 매트릭스는 각 회사 공식 docs와 GitHub README 수준의 비교다. 실제 운용 환경에서의 정량 벤치마크(가스, 클레임 cadence, 처리량)는 본 보고서 범위가 아니다.
- LLM 안전 가드(F10)는 외부에 의존하는 부분이 크다. Cart Mandate / SPT / 외부 정책 강제의 조합이 권장되지만, prompt injection을 100% 차단하는 메커니즘은 현존하지 않는다[^s31][^s32].
- Coinbase Spend Permissions의 ERC-4337 EntryPoint 우회 결정[^s27]은 의도된 보안 설계이지만, 이로 인해 같은 권한 객체가 다른 7579 계정에서 그대로 재사용되지 않는다는 호환성 비용을 안는다. 본 청사진은 이를 어댑터 레이어로 흡수하는 것을 권장한다.
- Pimlico ERC-20 Paymaster 리포는 2025년 11월 archived 처리되어 `singleton-paymaster`로 이전됐다[^s30]. 본 청사진의 코드 인용은 패턴 이해용이며, 실제 채택 시에는 후속 리포를 확인해야 한다.
