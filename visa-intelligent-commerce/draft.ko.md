## 서론

Visa Intelligent Commerce(VIC)는 AI 에이전트가 소비자·기업을 대신해 Visa 결제 인프라 위에서 거래를 수행할 수 있도록 한 Visa의 플랫폼이다. 에이전트 전용 토큰, 패스키 기반 인증, Payment Instructions API, 그리고 머천트가 와이어 레벨에서 에이전트를 검증할 수 있도록 한 디렉토리 백킹 프로토콜로 구성된다.[^s01][^s02] VIC는 2025년 4월에 출시되었고 Visa는 2026년 연말 시즌 본격 대중화를 목표로 한다. Agentic Ready 프로그램은 영국·유럽에서 운영 중이며 2026년 4월 29일 자로 아시아태평양과 라틴아메리카까지 확장되었다.[^s09][^s11][^s12] 2026년 중반 시점, 전체 시스템은 여전히 파일럿 규모이며 검증 가능한 라이브 거래는 수백 건 수준이다.[^s09]

본 보고서는 (1) VIC 플랫폼의 네 가지 서비스 영역, (2) VIC와 파트너 프로토콜이 올라타는 Trusted Agent Protocol(TAP) 와이어 포맷, (3) 구체적인 개발자 표면(Visa Developer API, `visa/mcp` 툴킷, AWS Bedrock AgentCore 레퍼런스 아키텍처), (4) 더 넓은 에코시스템과 AP2·ACP·x402 같은 결제 프로토콜 사이에서 VIC의 위치를 다룬다.

## 배경

Visa 네트워크의 규모(자격증명 48억, 머천트 1.5억 곳 이상, 연간 거래 3000억 건 이상)는 "에이전트도 결제하게 한다"는 시도가 경제적으로 의미를 갖는 이유다.[^s01] 그러나 기존 카드 자격증명은 사람 카드 보유자에게 묶여 있으며 보유자를 대신해 동작하는 소프트웨어 에이전트에 묶여 있지 않다. VIC는 이 간극을 메우기 위해 **에이전트에 결속된 토큰(agent-bound token)** 을 발급하고, HTTP 요청이 실제로 신뢰된 에이전트에서 왔다는 것을 증명하는 프로토콜을 함께 제공한다.[^s02][^s10] 독립 논평은 이를 네트워크의 신뢰 모델을 결제 명령(mandate) 자체가 아닌 **행위자(actor)** 중심으로 재배치한 것으로 설명한다.[^s13]

## 아키텍처 — VIC 플랫폼

Visa Developer 개요는 VIC를 네 가지 통합 서비스로 분해한다:[^s02]

1. **Tokenization(토큰화).** Visa가 받는 머천트에서 사용할 수 있는 "에이전트 전용 패스스루 결제 토큰"을 발급한다. 이 토큰은 에이전트에 결속되며 "그 에이전트가 사용자를 대신해 구매하는 컨텍스트에서만 사용 가능"하다. Visa Token Service를 통해 프로비저닝된다.[^s02]
2. **Authentication(인증).** 카드 소유자 스텝업 검증과 Passkey 설정. VIC는 이후 Payment Instructions를 인증할 Visa Payment Passkey를 보관한다. 레퍼런스 구현은 등록 시 FIDO 디바이스 바인딩으로 passkey를 생성한다.[^s02][^s06]
3. **Payment Instructions(결제 지시).** 에이전트 토큰 등록, 사용자 지시 제출, 머천트에서 그 지시를 이행하는 데 필요한 자격증명 조회, 그리고 구매 결과를 Visa에 다시 제출하는 API 집합.[^s02]
4. **Signals(시그널).** 분쟁 해결과 사후 보호 기록에 쓰이는 커머스 데이터 백채널.[^s02]

문서가 제시하는 운영 라이프사이클은 다음과 같다: 에이전트 온보딩 → 사용자 계정 생성 및 카드 프로비저닝, 스텝업 검증 → passkey 등록 → 특정 구매 지시에 대한 사용자 인가 → 에이전트의 결제 자격증명 조회(인가된 지시와 대조 검증) → 머천트 결제 완료(guest checkout 또는 key entry) → VisaNet의 네트워크 레벨 컨트롤 적용 → 분쟁 해결을 위한 commerce signal 제출.[^s02]

**Visa Intelligent Commerce Connect** 는 수용(acceptance) 측 대응물이다. Visa Acceptance Platform 위에 올라간 **네트워크·스킴·토큰 볼트 비종속적** 계층으로, 단일 통합을 통해 에이전트가 개시한 Visa 및 비-Visa 카드 결제를 중개한다.[^s07][^s08] Visa는 Connect가 "Trusted Agent Protocol, Machine Payments Protocol(MPP), Agentic Commerce Protocol(ACP), Universal Commerce Protocol(UCP)" 를 통해 개시된 결제를 수용한다고 명시했다.[^s08] 발표 시점 초기 파일럿 파트너로 Aldar, AWS, Diddo, Highnote, Mesh, Payabli, Sumvin이 거론된다.[^s08] Connect는 또한 "AI-ready" 카탈로그 정규화를 처리해 머천트의 재고가 에이전트 플랫폼에서 탐색 가능하도록 만든다.[^s07]

## Trusted Agent Protocol (TAP)

TAP는 와이어 레벨 조각이다. "AI 에이전트의 신원을 HTTP 요청 헤더에 서명하여 박는 개방형 명세"로, 모든 머천트가 "이 요청이 신뢰된 에이전트에서 왔는가"를 암호학적으로 답할 수 있게 한다.[^s10][^s15]

**HTTP 메시지 서명.** 명세 페이지는 서명을 담는 두 헤더를 문서화한다: `Signature-Input`(created/expires 타임스탬프, 키 식별자, 알고리즘, nonce, tag를 포함하는 메타데이터)와 실제 서명 값을 담는 `Signature`.[^s04] 에이전트 인식 서명은 **Ed25519**, 일부 컨테이너 객체(소비자·결제 데이터)는 **PS256**으로 서명된다.[^s04] 이는 RFC 9421 HTTP Message Signatures 형식이며 신흥 Web Bot Auth 설계의 변형이다.[^s15]

**키 디렉토리.** Visa는 well-known 엔드포인트 `https://mcp.visa.com/.well-known/jwks`에 JWKS를 게시한다. 머천트는 key ID로 에이전트 공개키를 이 집합에서 조회한다.[^s04]

**요청 바인딩과 재생 방어.** 서명은 최소한 HTTP 메시지의 `@authority`와 `@path` 컴포넌트를 커버하므로, authority 또는 path의 어떤 변경도 서명을 무효화한다. "merchant-specific, purpose-bound, time-limited" 의미와 결합되어 캡처된 서명을 다른 사이트나 페이지에서 재사용하는 것을 막는다.[^s03][^s04] nonce는 8분 created/expires 윈도 안에서 재생을 차단한다 — "기록된 nonce와 일치하는 nonce를 받으면 메시지를 차단해야 한다."[^s04]

**세 가지 시그널 원소.** 요청마다 TAP가 운반하는 정보:[^s03]

- **Agent Intent** — 해당 에이전트가 Visa 신뢰 에이전트라는 attestation과 의도(브라우즈, 상품 상세 조회, 특정 상품 구매).
- **Consumer Recognition** — 머천트 계정 토큰, 재방문 디바이스 식별자, 국가/우편번호 등 검증 가능한 소비자 데이터. 머천트가 방문자를 알려진 계정으로 취급할 수 있게 한다.
- **Payment Information** — 결제 데이터의 유연한 전달: 키 엔트리 검증용 해시 자격증명, API/프로토콜 기반 토큰 전달, 또는 지연 정산을 위한 IOU 형태.

명세는 개방형이며 GitHub의 `visa/trusted-agent-protocol`에서 호스팅된다.[^s05]

## 구현 — VIC 위에서 빌드하기

Visa는 `visa/mcp`(미러: `visa/ai`) 저장소에 MCP 우선 통합 툴킷을 게시한다. 세 가지 Node/TypeScript 패키지와 레퍼런스 앱이 포함된다:[^s06]

- **`@visa/token-manager`** — MCP 인증을 위한 JWE 토큰 생성.
- **`@visa/mcp-client`** — 자동 인증 와이어링이 된 MCP 클라이언트.
- **`@visa/api-client`** — **X-Pay 토큰 기반 인증** 과 **Message Level Encryption(MLE)** 을 지원하는 REST 클라이언트. 중요하게도 API 표면은 OAuth가 아닌 X-Pay를 사용하며, 트래픽은 TLS에 더해 MLE로 추가 암호화된다.[^s06]

저장소는 또한 `https://sandbox.mcp.visa.com/mcp/doc`에 Documentation MCP Server를 제공하여 `get-docs` 도구로 구조화된 API 스키마를 빌드·런타임에 조회할 수 있게 한다. `vic-agent/` 데모(LangGraph 기반)는 VTS 카드 토큰화, FIDO 디바이스 바인딩, Visa Payment Passkey 생성, VIC 등록을 한 워크플로우에 묶어 보여준다.[^s06]

**레퍼런스 클라우드 아키텍처(AWS).** AWS는 VIC 도구를 **Amazon Bedrock AgentCore** 위에 호스팅하는 공동 레퍼런스 통합을 공개했다.[^s12] 아키텍처는 AgentCore의 다섯 빌딩 블록에 기댄다: **Runtime**(에이전트와 MCP 서버를 위한 서버리스 호스트, 결제 자격증명·PII를 격리하는 마이크로 VM 샌드박스), **Identity**(인바운드 인증은 Amplify로, 아웃바운드 인증은 Visa 엔드포인트로), **Gateway**(MCP 서버와 외부 도구에 대한 거버넌스·감사 가능 접근), **Memory**(단기 대화 상태, 향후 장기 선호), **Observability**(OpenTelemetry 기반으로 모든 추론 단계, 툴 호출, MCP 호출, 인증 흐름의 감사 트레이스).[^s12] 결제 시점에 에이전트는 `request_purchase_confirmation` 툴을 호출해 명시적 사용자 확인을 띄우고, 그 다음에만 `confirm_purchase`를 트리거하여 VIC API가 자격증명 조회·passkey 인증·거래 완료를 수행하게 한다.[^s12]

**엔드 투 엔드 구현 개요.** 위 조각들을 합치면 최소 에이전트 → VIC → 머천트 흐름은 다음과 같다:

1. 에이전트 등록과 사용자 온보딩 — VTS 토큰화, 스텝업 검증, FIDO 디바이스 바인딩, Passkey 생성.[^s02][^s06]
2. 사용자가 지시("400달러 이하 항공권 예약")를 내릴 때, 그것을 Payment Instruction으로 제출해 VIC가 passkey에 묶인 인증 기록을 보유하게 한다.[^s02]
3. 에이전트가 머천트를 탐색한다. TAP에 참여하는 머천트에 대해서는, 에이전트가 보내는 모든 요청에 `Signature-Input` + `Signature` 헤더가 실리며, 머천트는 `mcp.visa.com/.well-known/jwks`에 대해 검증하고 세 시그널 원소를 요청에서 읽는다.[^s03][^s04]
4. 체크아웃 시점에 에이전트는 VIC Payment Instructions API를 호출해 필요한 자격증명을 조회한다(AWS 레퍼런스 아키텍처에서는 먼저 명시적 사용자 확인을 요구).[^s02][^s12] 머천트가 Intelligent Commerce Connect 위에 있다면 같은 흐름이 동일 통합으로 비-Visa 네트워크에서도 동작한다.[^s07][^s08]
5. 구매 후, 에이전트는 결과와 Signals를 VIC로 다시 게시해 분쟁·정합성 기록을 남긴다.[^s02]

## 채택 현황과 논의

현재 채택 규모는 파일럿 수준이다. Visa는 Skyfire, Nekuda, PayOS, Ramp 등 명시된 파일럿 파트너와 함께 "수백 건의 통제된 실제 환경 에이전트 개시 거래"를 보고했다. 글로벌 파트너 100개 이상, VIC 샌드박스에 30개 이상, 에이전트 20개 이상이 직접 통합되어 있다고 회사는 밝힌다.[^s09] 검증된 유스케이스는 Skyfire/Consumer Reports 상품 구매, Nekuda가 가능하게 한 Gensmo의 Fabrique 구매, PayOS의 BeyondStyle/Jomashop을 통한 B2B/온라인 쇼핑, Ramp의 B2B 청구서 결제와 캐시백 캡처 등이다.[^s09] Agentic Ready 프로그램은 원래 영국/EU에서 시작했고 2026년 4월 29일 자로 아시아태평양과 라틴아메리카로 확장되었으며 85개 이상의 추가 파트너가 합류 중이다.[^s11]

경쟁 맥락에서 독립 분석은 TAP를 본질적으로 **행위자 검증(actor verification)** — "이 HTTP 요청이 정당한 Visa 온보딩 에이전트에서 왔는가" — 으로 규정하고, 카드/은행 송금/스테이블코인을 가로지르는 결제 mandate 프레임워크인 Google AP2, 그리고 행위자 검증 프로토콜이 아닌 대화형 체크아웃 UX인 OpenAI/Stripe Instant Checkout과 대비한다.[^s13] 이들은 엄밀히 경쟁 관계가 아니라 보완 관계다 — Intelligent Commerce Connect는 TAP, MPP, ACP, UCP를 통해 개시된 결제를 수용한다고 명시했으므로 같은 머천트가 여러 프로토콜 패밀리의 에이전트 트래픽을 한 통합으로 흡수할 수 있다.[^s08] 같은 독립 분석은 또한 암호학적 행위자 검증만으로는 충분하지 않으며 *정당하게 온보딩된* 에이전트가 정상 경로를 벗어나는 경우를 잡으려면 행동·리스크 인프라와 결합되어야 한다고 경고한다.[^s13]

구현자 관점에서 실용적 결론은 단순하다. 결제하는 에이전트를 만든다면 `visa/mcp` 툴킷(또는 AWS라면 Bedrock AgentCore 레퍼런스)을 통해 VIC의 Payment Instructions + Tokenization API를 타겟팅한다. 머천트를 만든다면 Visa Acceptance Platform 위의 Intelligent Commerce Connect를 타겟팅하고 인바운드 TAP 서명을 well-known JWKS에 대해 검증한다. 두 경우 모두 OAuth가 아닌 X-Pay + MLE를 전제로 하며, 정산되는 모든 거래 앞에 사용자 확인 단계를 계획해야 한다.[^s02][^s04][^s06][^s12]

## 한계

- 프로덕션 규모는 파일럿 수준이다. "수백 건"이 검증 가능한 최대치이며, "2026년 연말 시즌 대중화"는 측정된 결과가 아닌 벤더 전망이다.[^s09]
- Visa의 well-known JWKS 엔드포인트와 정확한 `alg`/키 회전 정책은 현재 계약으로 문서화되어 있으나 외부 표준 단체에 의해 고정된 것은 아니다. 통합자는 URL과 알고리즘 목록을 구성 가능한 값으로 취급해야 한다.
- VisaNet이 에이전트 결속 토큰에 대해 인가 시점에 적용하는 정확한 룰셋(어떤 에이전트가 어떤 한도 하에서 결제 가능한지)은 제품 카피에서 정성적으로만 기술되어 있으며 공개 문서가 컨트롤을 열거하지는 않는다.
- AWS 레퍼런스 통합의 툴 이름(`request_purchase_confirmation`, `confirm_purchase`)은 AWS 블로그에만 출처가 있으며 Visa 자체 개발자 문서로 독립 재검증되지 않았다.

## 초록

Visa Intelligent Commerce(VIC)는 Visa의 에이전트 커머스 플랫폼이다. 네 가지 서비스 표면(Tokenization, Authentication/Passkey, Payment Instructions, Signals)과 수용 측 집계자(Intelligent Commerce Connect)로 구성되며, 후자는 Visa Acceptance Platform 위에서 단일 통합으로 Visa 및 비-Visa 카드 결제를 중개한다. 와이어 레벨에서는 Trusted Agent Protocol(TAP), 즉 RFC 9421 HTTP Message Signatures로 에이전트 신원을 HTTP 요청 헤더에 서명하여 박는 개방형 명세를 사용한다. 에이전트 인식 서명은 Ed25519(일부 컨테이너는 PS256), 공개키는 `mcp.visa.com/.well-known/jwks` JWKS로 해결하며, 서명은 `@authority`/`@path`를 묶고 재생은 8분 윈도와 nonce로 제한된다. TAP 요청은 세 가지 시그널 원소(Agent Intent, Consumer Recognition, Payment Information)를 운반한다. 구현은 오늘 시점 구체적이다. Visa는 `visa/mcp` Node/TypeScript 툴킷(`@visa/token-manager`, `@visa/mcp-client`, `@visa/api-client`)을 게시하며 X-Pay 토큰과 Message Level Encryption(OAuth 아님)을 사용한다. AWS는 Bedrock AgentCore 레퍼런스 통합을 제공하며 격리된 마이크로 VM 런타임, identity/gateway/memory/observability 컴포넌트, 정산 전 필수 사용자 확인 단계를 포함한다. 채택은 여전히 파일럿 규모(수백 건의 실거래, Skyfire/Nekuda/PayOS/Ramp 등 파트너)이지만, Intelligent Commerce Connect는 다수 프로토콜 패밀리(TAP, MPP, ACP, UCP)의 개시를 수용한다. Agentic Ready 프로그램은 영국/EU에서 2026년 4월 29일 자로 아시아태평양·라틴아메리카까지 확장되었다. TAP의 기여는 행위자 검증으로 이해하는 것이 가장 적절하며 — Google AP2 같은 mandate 중심 프레임워크와 직교한다 — 독립 분석은 온보딩되었으나 오작동하는 에이전트를 잡으려면 행동 리스크 도구와 결합되어야 한다고 지적한다.
