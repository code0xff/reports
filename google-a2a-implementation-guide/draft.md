# Google A2A 상세 리서치와 구현 전략

## 초록

Google이 `2025-04-09`에 발표한 `A2A(Agent2Agent)`는 독립적인 에이전트 시스템 사이의 상호운용을 위한 공개 프로토콜이며, `2025-06-23`에는 Linux Foundation 프로젝트로 이관되었다.[^s01][^s02] `2026-04-21` 기준 최신 공식 스펙은 `1.0.0`이고, 프로토콜은 발견(`Agent Card`), 상태ful 작업(`Task`), 결과물(`Artifact`), 다중 모달 파트(`Part`), 그리고 JSON-RPC·HTTP+JSON/REST·gRPC 바인딩을 중심으로 구성된다.[^s03] 핵심은 "에이전트를 도구처럼 호출"하는 것이 아니라, 서로 독립적으로 운영되는 에이전트가 기능을 광고하고, 장기 작업을 수행하며, 스트리밍이나 푸시 알림으로 상태를 교환하게 만드는 데 있다.[^s01][^s03]

실무적으로 A2A는 개념적으로 단순해 보여도 구현 난이도가 낮지 않다. 최소한 `Agent Card`, 인증 선언, `Task` 저장소, 상태기계, 아티팩트 저장, SSE 스트리밍, 취소 처리, 관측성, API 관리까지 함께 설계해야 한다.[^s05][^s12][^s13] 또한 공식 스펙은 `1.0.0`이지만 일부 공식 SDK README는 여전히 `0.3.x` 호환성을 전면에 두고 있어, 실제 구현에서는 스펙과 SDK 버전을 분리해서 관리해야 한다.[^s03][^s09][^s10] 결론적으로 A2A는 "멀티 에이전트 협업의 표준 외부 인터페이스"로는 매우 유망하지만, 프로덕션 도입은 `hello world` 수준 예제를 넘어 운영 설계를 포함한 제품 엔지니어링 문제로 접근해야 한다.[^s05][^s08]

## 1. Google A2A는 무엇이며 현재 어디까지 왔나

Google의 발표에 따르면 A2A는 서로 다른 벤더와 프레임워크로 구현된 에이전트가 안전하게 정보를 교환하고 작업을 조정할 수 있도록 만든 공개 프로토콜이다.[^s01] 발표 시점부터 Google은 A2A를 MCP의 대체재가 아니라 보완재로 설명했다. MCP가 에이전트에 도구와 컨텍스트를 제공하는 문제를 다룬다면, A2A는 에이전트와 에이전트 사이의 협업을 다룬다는 구분이다.[^s01][^s06]

프로젝트의 제도적 상태도 중요하다. A2A는 `2025-06-23`에 Linux Foundation 프로젝트로 이관되었고, 공식 프로젝트 페이지는 현재 스펙, 여러 언어 SDK, 샘플, 인스펙터, TCK를 함께 운영하는 구조를 보여준다.[^s02][^s08] 이 점은 A2A가 단순한 Google 단독 문서가 아니라, 커뮤니티 운영과 중립 거버넌스를 전제로 한 표준화 경로에 들어섰다는 의미다.[^s02][^s08]

다만 구현 관점에서 한 가지 현실적인 주의점이 있다. 공식 스펙 최신본은 `1.0.0`인데, `2026-04-21` 기준 공식 Python SDK와 JavaScript SDK의 공개 README는 여전히 `0.3` 또는 `0.3.0` 호환성을 명시한다.[^s03][^s09][^s10] 따라서 "스펙은 1.0인데 런타임/샘플은 0.3 계열"이라는 과도기를 전제로 설계를 시작하는 것이 안전하다. 실무에서는 `Agent Card.protocolVersion`, transport별 호환성, 테스트 스위트 버전을 함께 잠그는 방식이 필요하다.[^s03][^s09][^s10]

## 2. 프로토콜 핵심 모델

### 2.1 Agent Card: 발견과 계약의 시작점

A2A의 첫 번째 핵심 객체는 `Agent Card`다. Agent Card는 에이전트의 이름, 설명, 서비스 URL, 프로토콜 버전, capabilities, skills, 보안 요구사항을 기술하는 발견용 메타데이터다.[^s03][^s11] 공식 문서가 강조하듯이, 다른 에이전트는 이 카드를 보고 "이 에이전트가 무엇을 할 수 있는지", "어떤 입력/출력을 받는지", "어떤 인증이 필요한지"를 판단한다.[^s01][^s11]

실무적으로 Agent Card는 단순한 소개 문서가 아니라 계약서에 가깝다. 특히 `skills`, `inputModes`, `outputModes`, `securityRequirements`, transport 인터페이스를 어떻게 기술하느냐에 따라 클라이언트가 에이전트를 잘못 호출할지 여부가 결정된다.[^s03][^s11] 따라서 스킬 설명은 마케팅 문구보다 "입력 형식, 출력 형식, 권한 요구, 실패 조건"을 정확히 드러내는 방식으로 설계하는 편이 좋다.[^s11]

### 2.2 Message, Part, Artifact: 콘텐츠 모델

A2A는 메시지를 단일 문자열로 가정하지 않는다. 스펙에서 `Part`는 텍스트, 파일 바이트, 파일 URL, 구조화 JSON 데이터 중 하나를 담는 컨테이너이며, MIME 타입과 메타데이터를 함께 가진다.[^s03] 그 위에 `Message`와 `Artifact`가 `Part`의 집합으로 구성된다.[^s03]

이 설계의 의미는 명확하다. A2A는 처음부터 "텍스트 챗"만을 대상으로 만든 프로토콜이 아니라, 문서, 이미지, 구조화 데이터, 향후 오디오/비디오 같은 다양한 매체를 교환하는 멀티모달 협업 인터페이스를 겨냥한다.[^s01][^s03] 따라서 구현 시에도 내부 애플리케이션을 문자열 기반으로만 설계하면 나중에 파일 업로드, 구조화 결과, UI 위젯 연동에서 다시 뜯어고치게 될 가능성이 높다.[^s01][^s03]

### 2.3 Task와 Context: 상태ful 협업의 중심

A2A의 가장 중요한 차별점은 `Task` 중심 모델이다. Google의 초기 발표와 최신 스펙은 모두 A2A를 장기 실행과 멀티턴 상호작용을 지원하는 프로토콜로 설명한다.[^s01][^s03] `Task`는 단순 요청-응답이 아니라 작업 단위의 생명주기를 표현하고, `Artifact`는 그 작업의 산출물이다.[^s01][^s03]

또한 스펙은 `contextId`와 `taskId`를 통해 같은 대화 맥락 안에서 후속 메시지와 새 작업을 연결할 수 있게 한다.[^s03] 이는 "한 번 호출하고 끝나는 RPC"보다 훨씬 강한 상태 모델이다. 예를 들어 원격 리서치 에이전트가 초안 작성 도중 추가 입력을 요구하거나, 인증이 더 필요하거나, 일부 결과만 먼저 내보내고 나중에 최종 산출물을 추가하는 흐름을 자연스럽게 표현할 수 있다.[^s03][^s05]

## 3. 전송 바인딩과 비동기 실행 모델

스펙 최신본은 A2A가 세 가지 표준 바인딩을 제공한다고 설명한다. `JSON-RPC`, `HTTP+JSON/REST`, `gRPC`가 그것이며, 핵심 의미론은 transport가 달라도 유지된다.[^s03] 이 구조는 매우 실용적이다. 사내 웹 서비스와 API 게이트웨이 환경에서는 HTTP 계열 바인딩이 자연스럽고, 고성능 내부 통신이나 strongly typed 계약이 중요하면 gRPC를 사용할 수 있기 때문이다.[^s03][^s14]

특히 최신 스펙의 JSON-RPC 바인딩은 HTTP 위에서 JSON-RPC 2.0을 사용하고, 스트리밍은 `Server-Sent Events`로 제공한다고 명시한다.[^s03] 이 점 때문에 A2A 서버는 동기 응답만 구현해서는 충분하지 않다. 장기 작업을 지원하려면 적어도 다음 세 가지 업데이트 경로 중 하나 이상을 설계해야 한다.

1. `Get Task` 기반 polling
2. `message/stream` 또는 동등한 streaming endpoint 기반 SSE 구독
3. push notification webhook 기반 비동기 업데이트

공식 스펙은 blocking 모드에서 작업이 terminal state뿐 아니라 interrupted state(`INPUT_REQUIRED`, `AUTH_REQUIRED`)에 도달할 때까지 기다릴 수 있다고 설명한다.[^s03] 또 enterprise 문서는 추가 자격증명이 필요한 경우 A2A 바깥의 OAuth 같은 절차로 secondary credential을 획득한 뒤 작업을 계속하라고 안내한다.[^s05] 즉 A2A는 "한 번의 요청에 답을 반환"하는 인터페이스라기보다, "작업이 중단되거나 완료될 때까지 상태를 진전시키는 인터페이스"로 이해해야 한다.[^s03][^s05]

이 특성은 설계에 직접 영향을 준다. `message/send`만 구현하고 끝내면 demo는 가능하지만, 프로덕션에서는 결국 `tasks/get`, `tasks/cancel`, streaming, push config, history length, task resume 정책까지 필요해질 가능성이 높다.[^s03][^s13][^s14]

## 4. 엔터프라이즈 설계 포인트

### 4.1 인증과 권한

엔터프라이즈 문서는 A2A payload 자체에 신원을 싣지 않고, 인증은 transport/HTTP 계층에서 처리한다고 명시한다.[^s05] 동시에 Agent Card는 `security` 필드로 자신이 지원하는 인증 scheme을 선언하며, 이 구조는 OpenAPI의 인증 모델과 정렬된다.[^s05][^s03] 다시 말해 A2A는 자체 인증 프로토콜을 새로 만들기보다, 기존 HTTP 보안 관행 위에 올라탄다.

이 설계는 현실적이지만, 구현자에게 책임을 미룬다. 서버는 인증된 주체가 누구인지, 그 주체가 어떤 skill을 호출할 수 있는지, 백엔드 데이터 접근 권한이 있는지를 직접 판정해야 한다.[^s05] 공식 엔터프라이즈 문서는 skill 단위 권한 제어와 최소 권한 원칙을 명시적으로 권장한다.[^s05] 따라서 A2A 서버를 "프롬프트를 받는 LLM API"처럼 취급하면 안 되고, 일반 API 서버와 동일한 수준의 authorization 계층을 둬야 한다.[^s05]

### 4.2 발견 전략

공식 discovery 문서는 세 가지 대표 패턴을 제시한다. well-known URL의 Agent Card, 중앙 registry, 직접 구성이다.[^s04] 인터넷 공개 서비스나 사내 표준 URL 정책이 분명한 경우에는 `/.well-known/agent-card.json` 패턴이 단순하다.[^s04] 반면 대기업이나 마켓플레이스 환경에서는 registry가 더 중요하다. registry가 스킬, 태그, 보안 요구, 버전 같은 기준으로 에이전트를 검색 가능하게 만들기 때문이다.[^s04]

실무적으로는 파트너 수가 적은 초기 단계에는 direct configuration이 빠르지만, 에이전트 수가 늘어나면 registry 없이는 온보딩과 거버넌스가 금방 무너진다. 따라서 첫 배포부터 완전한 중앙 카탈로그를 만들 필요는 없더라도, 최소한 Agent Card 스키마 검증과 등록 절차를 별도 컴포넌트로 분리해 두는 편이 낫다.[^s04][^s05]

### 4.3 관측성, 감사, API 관리

엔터프라이즈 문서는 A2A가 HTTP 기반이기 때문에 OpenTelemetry, 표준 로깅, 메트릭, API management와 자연스럽게 통합된다고 본다.[^s05] 또한 `taskId`, `sessionId`, correlation ID, trace context를 로깅하라고 권고한다.[^s05] 이 부분은 매우 중요하다. A2A 시스템의 장애는 보통 단일 요청 실패가 아니라 "어느 에이전트가 어떤 상태에서 멈췄는지"를 모르는 상태로 나타나기 때문이다.[^s05]

따라서 프로덕션 설계에서는 애플리케이션 로그보다 `task lifecycle telemetry`를 우선 설계해야 한다. 최소한 `created -> working -> input_required/auth_required -> completed/failed/canceled/rejected` 흐름과 artifact 생성 이벤트를 추적해야 운영이 가능하다.[^s03][^s05]

### 4.4 확장과 호환성

공식 extension 문서는 A2A extension이 새 데이터, 요구사항, RPC method, 상태기계를 추가할 수 있다고 설명한다.[^s07] 그러나 동시에 core 구조를 직접 바꾸거나 enum을 함부로 깨는 식의 변경은 지양한다.[^s07] 이 원칙은 중요하다. A2A를 도입하는 팀이 초기부터 조직 고유 확장을 남발하면 상호운용성 이점이 빠르게 사라진다.[^s07]

따라서 권장 전략은 이렇다. 우선 코어 프로토콜만으로 충분한지 확인하고, 정말 필요한 경우에만 `metadata`와 공식 extension 메커니즘을 사용해 점진적으로 확장한다.[^s07] 특히 보안, 규제, 산업별 의미 체계를 넣어야 할 때는 extension의 `required` 사용 범위를 최소화하는 편이 좋다.[^s07]

## 5. 기술 구현 예시

이 섹션의 예시는 공식 Python/JavaScript SDK와 튜토리얼이 보여주는 구조를 바탕으로 재구성한 참조 구현이다.[^s09][^s10][^s12][^s13] 핵심 아이디어는 같다. `Agent Card`로 외부 계약을 선언하고, `AgentExecutor`에 비즈니스 로직을 넣고, `DefaultRequestHandler`가 표준 A2A 메서드와 task store를 조정하게 만든다.[^s10][^s12][^s13]

### 5.1 최소 Python 서버 구조

```python
from a2a.types import AgentCard, AgentSkill
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from my_agent import ResearchAgentExecutor

skill = AgentSkill(
    id="research",
    name="Research",
    description="조사 요청을 받아 보고서를 작성한다",
    tags=["research", "analysis"],
    inputModes=["text/plain", "application/json"],
    outputModes=["text/plain", "application/json"]
)

card = AgentCard(
    name="Research Agent",
    description="A2A 기반 리서치 에이전트",
    url="https://agent.example.com/a2a",
    version="1.0.0",
    skills=[skill],
    defaultInputModes=["text/plain", "application/json"],
    defaultOutputModes=["text/plain", "application/json"],
)

executor = ResearchAgentExecutor()
task_store = InMemoryTaskStore()
handler = DefaultRequestHandler(
    agent_executor=executor,
    task_store=task_store,
)
```

이 구조가 의미하는 바는 단순하다. 외부 프로토콜 계층과 내부 업무 로직을 분리하라는 것이다.[^s12][^s13] executor는 요청을 해석하고 내부 오케스트레이터나 워커를 호출하며, request handler는 표준 메서드 매핑과 task lifecycle을 맡는다.[^s12][^s13] REST 바인딩이 필요하면 공식 REST handler를 두고, JSON-RPC나 gRPC가 필요하면 각각 대응하는 핸들러를 붙이면 된다.[^s14][^s10]

### 5.2 Task 우선 설계 예시

단기적으로는 direct message response만 반환하는 stateless 에이전트가 가장 쉽다.[^s10][^s12] 그러나 실제 업무형 에이전트는 보통 외부 API 호출, 사람 승인, 검색, 문서 생성처럼 시간이 걸리는 단계를 포함한다. 이런 경우에는 처음부터 Task 중심으로 구현하는 편이 훨씬 낫다.[^s01][^s03][^s12]

예를 들어 "벤더 리스크 리포트를 생성하는 에이전트"는 다음과 같이 동작할 수 있다.

1. `message/send` 수신
2. Task 생성 후 즉시 `working`
3. 검색/수집/분석 워커 실행
4. 중간 초안 아티팩트 생성
5. 추가 자료가 필요하면 `input_required`
6. 사용자가 보충 자료를 보내면 동일 `taskId`와 `contextId`로 재개
7. 최종 PDF/JSON 아티팩트 저장 후 `completed`

이 모델은 A2A 스펙의 task lifecycle과 multi-turn continuation 모델에 정확히 부합한다.[^s03][^s12] 또한 운영 측면에서도 재시도, resume, 감사 추적이 쉬워진다.[^s05]

### 5.3 TypeScript/Express 엣지 예시

공식 JavaScript SDK README는 Express 기반 서버에서 `AgentExecutor`, `DefaultRequestHandler`, `InMemoryTaskStore`, 그리고 JSON-RPC/REST/gRPC transport adapter를 조합하는 예시를 제공한다.[^s10] 따라서 Node.js 생태계에서는 "Express를 A2A edge로 사용하고, 실제 에이전트 실행은 별도 서비스로 분리"하는 구성이 자연스럽다.[^s10]

이 경우 권장 구조는 다음과 같다.

```text
internet / partner agents
        |
   API gateway / WAF
        |
   A2A edge (Express)
        |
   authn/authz middleware
        |
   request handler + task store
        |
   orchestrator / worker queue
        |
   tools, models, databases, artifact storage
```

이 구조는 공식 enterprise 문서의 API management, tracing, authorization 권고와 잘 맞는다.[^s05] 또한 SDK가 request handler와 task store를 명시적 구성요소로 분리해 둔 이유도 이 같은 layered architecture를 염두에 둔 것으로 해석할 수 있다.[^s09][^s10][^s13]

## 6. 실서비스 설계와 구현 전략

### 6.1 권장 아키텍처

실서비스에서는 A2A 서버를 LLM 애플리케이션 안에 직접 녹여 넣기보다 다음 다섯 계층으로 분리하는 편이 낫다.

1. `A2A edge`
2. `authn/authz and policy`
3. `task orchestration`
4. `worker/tool execution`
5. `artifact and audit storage`

이 분리는 공식 엔터프라이즈 문서의 HTTP-layer auth, tracing, audit, API management 권고와 SDK의 executor/request handler/task store 분리 구조를 조합한 실무적 귀결이다.[^s05][^s09][^s10][^s13] 이렇게 두면 A2A는 외부 계약과 상태기계에 집중하고, 내부 LLM·툴 체인은 비교적 자유롭게 교체할 수 있다.

### 6.2 데이터 모델 전략

최소한 다음 필드는 영속 저장하는 편이 좋다.

1. `taskId`, `contextId`, tenant, caller identity
2. 현재 상태와 상태 전이 이력
3. 요청 메시지와 요약된 history
4. artifact 메타데이터와 실제 blob 참조
5. push notification 설정
6. trace ID, correlation ID, 감사 이벤트

이 구조는 스펙의 task/context/artifact 모델과 enterprise observability 요구를 그대로 반영한 것이다.[^s03][^s05] 특히 artifact 본문을 DB에 그대로 넣을지, object storage URL만 저장할지는 데이터 크기와 규제 요구에 따라 분리하는 편이 일반적으로 유리하다.[^s03][^s05]

### 6.3 보안 전략

보안에서 가장 중요한 원칙은 "원격 에이전트가 보내는 모든 것"을 비신뢰 입력으로 취급하는 것이다. Message/Artifact의 Part는 텍스트뿐 아니라 파일, URL, 구조화 JSON도 담을 수 있으므로, prompt injection뿐 아니라 schema abuse, oversized payload, malicious URL, content-type spoofing까지 고려해야 한다.[^s03][^s05][^s07]

권장 방어선은 다음과 같다.

1. Agent Card 스키마 검증과 allowlist
2. media type 및 크기 제한
3. URL fetch sandbox
4. skill별 권한 분리
5. 서명 또는 registry 기반 신뢰 부여
6. extension 입력 검증

특히 extension은 새 메서드와 새 상태를 열 수 있으므로, 코어 메서드와 동일한 인증·권한 검사를 반드시 적용해야 한다는 공식 문서의 경고를 무시하면 안 된다.[^s07]

### 6.4 버전 전략

현재 시점의 가장 현실적인 설계 포인트는 버전 정렬이다. 스펙은 `1.0.0`이지만 SDK README와 샘플 일부는 `0.3.x` 호환성 기준으로 설명된다.[^s03][^s09][^s10] 따라서 초기 도입 시에는 다음 원칙이 안전하다.

1. 지원할 `protocolVersion`을 명시적으로 고정한다.
2. transport별 호환 테스트를 자동화한다.
3. Agent Card와 서버 구현의 버전 값을 CI에서 교차 검증한다.
4. 파트너 온보딩 문서에 "검증된 버전 조합"을 명시한다.

이 과정을 건너뛰면 표면적으로는 같은 A2A 서버처럼 보여도 method 이름, field 이름, enum 처리, transport behavior 차이로 쉽게 깨질 수 있다.[^s03][^s09][^s10]

### 6.5 단계적 구현 전략

가장 현실적인 도입 순서는 다음과 같다.

1. `JSON-RPC + direct config + polling`만으로 1차 배포
2. Task persistence와 cancel 지원 추가
3. SSE streaming 추가
4. webhook push notification 추가
5. registry 기반 discovery 추가
6. 필요한 경우에만 extension 도입

이 순서는 스펙의 기능 집합을 부정하는 것이 아니라, 운영 리스크가 낮은 순서로 채택하는 전략이다.[^s03][^s04][^s07] 처음부터 discovery registry, custom extension, push, multi-tenant policy engine까지 한 번에 넣으면 구현보다 운영 실패가 먼저 올 가능성이 높다.[^s04][^s05][^s07]

## 7. 언제 A2A를 쓰고, 언제 다른 패턴을 택해야 하나

A2A는 "원격의 독립 서비스"와 "상태ful 협업"이라는 두 조건이 함께 있을 때 가장 빛난다.[^s03][^s06] 예를 들어 파트너사 에이전트, 조직 간 승인 워크플로, 장기 리서치, 문서 생성, 사람 승인 포함 프로세스는 A2A와 잘 맞는다.[^s01][^s03]

반대로 단일 프로세스 내부의 서브에이전트 호출, 단순 함수 실행, 툴/리소스 접속 표준화가 주목적이라면 MCP나 내부 orchestration만으로도 충분한 경우가 많다.[^s06] 공식 문서도 A2A와 MCP를 상보적 관계로 설명한다.[^s01][^s06] 따라서 설계 질문은 "A2A가 최신이라서 써야 하나?"가 아니라, "우리가 지금 풀려는 문제가 외부 에이전트 협업 문제인가, 아니면 내부 도구 연결 문제인가?"가 되어야 한다.[^s06]

## 결론

Google A2A는 현재 가장 유력한 에이전트 상호운용 프로토콜 후보 중 하나다. 공식 스펙은 이미 `1.0.0`에 도달했고, Linux Foundation 거버넌스와 다수 언어 SDK, 샘플, 테스트 도구를 갖추고 있다.[^s02][^s03][^s08] 특히 `Agent Card + Task + Artifact + multi-binding` 조합은 단순 도구 호출로는 다루기 어려운 상태ful 협업 문제를 상당히 잘 모델링한다.[^s01][^s03]

다만 구현의 성공 여부는 프로토콜 이해보다 시스템 설계에 달려 있다. 인증과 권한을 HTTP 계층과 skill 정책에 붙이고, task store와 artifact store를 분리하고, SSE/push/polling을 운영에 맞게 선택하고, 버전 호환성 테스트를 자동화해야 한다.[^s05][^s09][^s10][^s13][^s14] 실무적으로 가장 설득력 있는 전략은 "작게 시작하되, 상태기계와 운영 계층은 처음부터 제대로 만든다"는 것이다.[^s03][^s05]

## 참고문헌

본 리포트는 Google Developers Blog의 A2A 발표 및 Linux Foundation 이관 공지, A2A 최신 스펙, Agent Discovery / Enterprise / Extensions / A2A and MCP 문서, 그리고 공식 Python/JavaScript SDK 및 튜토리얼 문서를 근거로 작성했다.[^s01][^s02][^s03][^s04][^s05][^s06][^s07][^s09][^s10][^s11][^s12][^s13][^s14]
