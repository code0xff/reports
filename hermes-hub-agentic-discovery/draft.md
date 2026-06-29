## 초록

Hermes Hub는 스스로를 "AI 에이전트가 일을 수주하고 대가를 받는 work board(작업 게시판)"로 정의하는 오픈소스 마켓플레이스다[^s01][^s03]. 핵심 차별점은 이것이 **Agentic Resource Discovery(ARD)** 라는 신흥 산업 표준 위에 구현된다는 점이다 — ARD는 Google·Microsoft·Hugging Face 소속 저자들이 2026년 5월 발표한 v0.9 Draft 사양으로, AI 클라이언트가 "이 작업에 무엇이 가능한가"를 호출(invocation) 이전에 발견하도록 표준화한다[^s05][^s06][^s08]. Hermes Hub는 Hermes Capability Taxonomy(28개 도메인 340개 역량)로 역량을 선언하고, `urn:air` 식별자와 `/.well-known/ai-catalog.json`을 노출하며, Ed25519 서명 입찰과 Stripe 기반 MPP·Link 정산(크립토 x402는 Phase 2)을 결합한다[^s03][^s04]. 다만 본 보고서는 두 가지를 분명히 한다: (1) Hermes Hub 고유의 사실은 거의 전적으로 자체 1차 문서에 의존하며 독립적 제3자 검증·채택 증거가 사실상 없다는 점, (2) 저장소 설명이 시사하는 "Nous Research의 Hermes Agent" 연계는 공식 제휴가 아니라 개방 표준을 통한 커뮤니티 상호운용 수준이며 제품 자체는 범용 ARD work board라는 점이다[^s02][^s03][^s10][^s16].

## 서론

Hermes Hub는 공식 사이트와 GitHub 저장소(amanning3390/hermeshub)를 통해 "AI 에이전트가 일을 발견하고 대가를 받게 하는 ARD 호환 마켓플레이스"로 제시된다[^s01][^s02]. 기본 흐름은 의뢰자(requester)가 작업을 게시하면, 역량을 갖춘 에이전트가 개방형 ARD 표준을 통해 이를 발견하고, Ed25519로 서명된 입찰을 제출한 뒤, Stripe MPP·Link·x402 레일로 정산하는 구조다[^s01][^s03].

이 보고서는 사용자가 제시한 세 가지 1차 출처 — 공식 사이트, GitHub 저장소, 그리고 그 기반인 `agenticresourcediscovery.org` 사양 — 을 근거로 Hermes Hub의 기술 구조를 분해한다. 두 사이트가 모두 클라이언트 사이드 렌더링 SPA여서 정적 페치로는 내용이 제한적이므로, 본문은 저장소 README, 머신 판독용 카탈로그(`ai-catalog.json`), 그리고 ARD 사양의 1차 텍스트에 주로 의존한다.

한 가지 중요한 주의가 필요하다. "Hermes"라는 이름은 Nous Research가 만든 별도의 오픈소스 에이전트 "Hermes Agent"와 겹친다[^s10][^s11]. 아래 §6에서 다루듯, 이 둘은 개방 표준을 통한 커뮤니티 호환 관계일 뿐 공식 제휴는 확인되지 않으므로, 본 보고서의 "Hermes Hub"는 amanning3390 저장소가 가리키는 ARD work board만을 의미한다.

## 배경 — Agentic Resource Discovery(ARD) 프로토콜

Hermes Hub를 이해하려면 먼저 그 토대인 ARD를 보아야 한다. ARD 사양은 "AI 아티팩트가 연합(federated) 네트워크 전반에서 카탈로그·발견·검색되는 방식을 정의"한다[^s05]. 여기서 아티팩트란 에이전트, MCP 서버, Skill, API, 워크플로 등 "AI 클라이언트가 작업을 위해 호출할 수 있는 외부 역량"을 포괄한다[^s06].

ARD의 설계 원칙은 명확한 경계 설정이다. ARD는 "호출 이전 단계에 전적으로 위치"하며, 클라이언트가 올바른 자원을 찾도록 돕되 그 자원은 자체 네이티브 메커니즘으로 호출된다[^s06]. 즉 ARD는 실행 런타임이 아니며(MCP·A2A·Skills·API 런타임이 아님), 중앙집중 카탈로그도 아니다 — 각자의 거버넌스·신뢰·랭킹 정책을 가진 다수의 분산 발견 서비스를 전제한다[^s06]. 동작 흐름은 "도메인의 well-known 경로에 `ai-catalog.json`을 게시 → 레지스트리가 크롤링 → 에이전트가 의도(intent)로 검색 → 게시자 검증 → 연결"의 5단계다[^s06]. 식별자는 `urn:air:<publisher>:<namespace>:<name>` 형식이며, `<publisher>`는 검증 가능한 FQDN이어야 해서 중앙 등록 없이 신뢰를 정착시킨다[^s05].

ARD의 위상도 분명히 해야 한다. 이것은 2026년 5월 28일자 **v0.9 Draft(Proposal)** 이며, 저자는 Junjie Bu(Google)·R.V. Guha(Microsoft)·Shaun Smith(Hugging Face)로 표기된다[^s05]. 독립 보도에 따르면 Google·Microsoft·GitHub·Hugging Face를 포함한 11개 기업이 ARD를 발표했고 Nvidia·Salesforce·Snowflake 등도 참여한다[^s08]. Hugging Face의 Discover 도구가 참조 구현으로 제시된다[^s07]. 다만 채택은 아직 초기다 — 한 독립 분석은 사양 공개 사흘 뒤 11개 출범 기업 중 메인 도메인의 `/.well-known/ai-catalog.json`에 실제 카탈로그를 제공한 곳은 Hugging Face가 유일했다고 지적한다[^s09].

## Hermes Hub 아키텍처와 기능

Hermes Hub는 이 ARD 표준을 구현한 하나의 마켓플레이스다. 워커는 **Hermes Capability Taxonomy(HCT)** 로 자신이 할 수 있는 일을 선언하는데, README에 따르면 이는 "28개 도메인에 걸친 340개의 기계판독 가능 역량"이며 `/.well-known/ai-catalog.json`으로 노출된다[^s03]. 실제 배포된 카탈로그는 `specVersion: "1.0"`, 호스트 `did:web:hermeshub.xyz`, 그리고 `urn:air:hermeshub.xyz:registry:capabilities`("340+ capabilities across 28 domains") 등 세 개의 URN 엔트리를 담고 있다[^s04].

신원과 입찰은 암호학적으로 처리된다. 익명 가입 시 `urn:air` 식별자와 Ed25519 키쌍이 발급되며 개인키는 클라이언트 측에 보관되어 입찰·선언 서명에 쓰인다 _(unverified — single source)_[^s02]. 입찰은 "Ed25519로 서명되어 서버에서 검증"되고, "수주(award) 시점에 플랫폼 수수료가 스냅샷되어 이후 수수료 변경이 소급 적용되지 않는다"[^s03]. 모든 에이전트·작업·카탈로그 엔트리는 RFC 8141을 따르는 `urn:air:<publisher>:<namespace>:<name>` URN을 쓴다[^s03].

기술 스택은 전형적인 서버리스 웹 구성이다. 프런트엔드는 Vite + React + TypeScript SPA(해시 라우팅, Tanstack Query, shadcn/ui, Tailwind)이고, 백엔드는 Vercel 서버리스 함수와 Neon Postgres(Drizzle ORM, 16개 테이블)이며, 저장소 언어 구성은 TypeScript가 96.7%다[^s02]. 또한 Hermes Hub는 다른 ARD 레지스트리(GitHub Agent Finder, Hugging Face Discover)와 연합(federation)하여 단일 카탈로그가 아닌 생태계 전체에 접근한다고 밝힌다[^s03].

## 결제·정산 레일

정산은 두 갈래다. 무인(unattended) 에이전트 간 정산은 **MPP(Machine Payments Protocol)** 로, README는 이를 "PaymentIntent + HTTP 402를 통한 무인 에이전트 간 정산"으로 기술한다[^s03]. 사람 감독형 흐름은 **Stripe Link/Checkout** 으로 처리된다[^s03]. 여기서 "MPP"는 별도로 표준화된 외부 규격이라기보다 Hermes Hub의 Stripe 기반 정산에 붙인 자체 명칭으로 보이며, 본 보고서는 프로젝트가 기술한 그대로 옮긴다 _(vendor-defined)_.

크립토 레일은 로드맵 단계다. README와 사이트는 "크립토 레일(x402)은 Phase 2이며, Base/Solana 상의 온체인 USDC 정산이 동일한 서명 입찰·수수료 스냅샷 보장과 함께 로드맵에 있다"고 밝힌다[^s03][^s01]. 참고로 x402는 Coinbase가 만든 실재하는 개방형 결제 프로토콜로, HTTP 402 상태코드를 이용해 스테이블코인 결제를 HTTP에 내장하며 이후 Linux Foundation 산하 x402 재단에 기부되었다[^s13][^s14]. 마지막으로 가격 정책상 최초 500명의 워커("Founder-500")는 표준 5% 대신 1.5%의 평생 수수료를 적용받는다[^s01][^s03].

## 정체성·관계 분석

Hermes Hub를 조사할 때 가장 먼저 부딪히는 문제는 정체성 혼동이다. GitHub 저장소의 설명문은 이 프로젝트를 "HermesHub - Nous Research의 Hermes Agent를 위한 Skills Hub. 커뮤니티 스킬을 탐색·공유·설치"로 표기한다[^s02]. 반면 제품 README와 공식 사이트는 동일 프로젝트를 "AI 에이전트가 일을 수주·정산하는 ARD work board"로 기술하며 Nous Research를 일절 언급하지 않는다[^s01][^s03]. 제3자 애그리게이터(Hermes Atlas)는 저장소 설명 쪽을 그대로 따라 "Hermes Agent Skills & Skill Registries"로 분류한다[^s12]. 두 자기 기술이 충돌하므로 본 보고서는 어느 한쪽으로 정리하지 않고 둘 다 제시한다.

정확한 관계는 "공식 제휴는 아니지만 상호운용을 의도한 커뮤니티 호환"이다. 한편으로 Nous Research의 "Hermes Agent"는 개인 서버에서 동작하는 별도의 오픈소스 자기개선 에이전트로, 스킬은 `agentskills.io`에서 설치하며 MIT 라이선스로 배포된다 — 그 1차 문서 어디에도 "Hermes Hub"나 `amanning3390`에 대한 언급이 없고, Hermes Hub README에도 Nous Research 언급이 없다[^s10][^s11][^s03]. 다른 한편으로 amanning3390은 HermesHub와 연동하는 보조 도구를 함께 공개한다 — `hermes-ard-capabilities`("에이전트가 ARD 호환 ai-catalog.json을 게시하고 HermesHub와 상호작용하게 하는 드롭인 스킬+CLI")[^s15]와, Nous의 Hermes Agent를 대상으로 하되 상류 저장소가 아닌 커뮤니티 포크(`outsourc-e/hermes-agent`)에 의존한다고 명시한 `hermes-workspace` 스킬이 그것이다[^s16]. 즉 Hermes Hub는 개방 표준(agentskills.io, ARD)을 통해 Nous의 Hermes Agent와 **상호운용하도록 설계된 커뮤니티 프로젝트**이지, Nous Research의 공식·승인 제품은 아니며, 제품 자체는 범용 ARD work board로 재정의되어 있다 _(interpretive)_[^s03][^s16].

## Discussion — 성숙도·검증가능성 평가

Hermes Hub의 기술 설계 자체는 일관되고 표준 정합적이다. ARD의 `urn:air`·well-known 카탈로그·연합 모델을 충실히 따르고[^s04][^s05], Ed25519 서명과 클라이언트 보관 키, 수수료 스냅샷 같은 장치는 에이전트 마켓플레이스가 갖춰야 할 합리적 요소다[^s03]. x402 같은 외부 결제 표준을 로드맵에 둔 점도 생태계 흐름과 부합한다[^s13].

그러나 검증가능성 측면에서는 분명한 한계가 있다. Hermes Hub 고유의 거의 모든 사실 — 역량 수, 서명 검증, 정산 동작, 사용자 수 — 은 프로젝트 자체 출처(사이트·README·카탈로그)에서만 확인되며, 독립적 제3자 감사나 채택·사용량 데이터는 발견되지 않았다 _(interpretive)_. 토대인 ARD 역시 v0.9 Draft로 매우 이르고, 실제 라이브 레지스트리는 Hugging Face가 거의 유일하다[^s05][^s09]. 저장소 활동도 수십 커밋 규모의 초기 단계다[^s02]. 요컨대 Hermes Hub는 "유망한 산업 표준의 충실한 초기 구현"으로 읽는 것이 정확하며, 검증된 상용 인프라로 보기에는 독립 증거가 부족하다.

## 한계

- **자체 출처 의존.** Hermes Hub 고유의 사실은 거의 전적으로 프로젝트 자신의 사이트·README·카탈로그에 근거한다. 독립적 감사·보안 리뷰·사용량 통계는 확인되지 않았다.
- **정체성.** "Nous Research의 Hermes Agent를 위한 Skills Hub"라는 저장소 설명과 "ARD work board"라는 제품 기술이 표면상 충돌한다. 본 보고서는 이를 "개방 표준을 통한 커뮤니티 상호운용(공식 제휴 아님)"으로 정리하되, Nous Research 측의 확인은 받지 못했다.
- **버전 불일치.** README는 ARD v0.9를, 배포된 `ai-catalog.json`은 `specVersion 1.0`을 선언한다. 라이브 배포가 어느 쪽을 따르는지는 검증하지 못했다.
- **MPP의 위상.** "Machine Payments Protocol"은 외부 표준이 아니라 Hermes Hub의 Stripe 기반 정산 명칭으로 보이며, 프로젝트 기술 그대로 옮겼다.
- **빠르게 변하는 대상.** 저장소 지표(별 293·포크 98·커밋 67)와 스펙·로드맵은 2026-06-29 기준이며 변동한다.
