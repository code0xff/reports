## 1. Executive Summary

- A2A는 도구 호출 프로토콜이 아니라 독립적인 에이전트 간 협업 프로토콜로 설계되었다.
- A2A의 실무 핵심은 `Agent Card` 기반 발견, `Task` 기반 장기 실행, `Message/Artifact/Part` 기반 다중 모달 교환이다.
- 구현 난이도는 "HTTP 엔드포인트 하나 추가"보다 높으며, 태스크 상태기계, 아티팩트 저장, 인증 전달, 스트리밍/웹훅 운영까지 포함해 설계해야 한다.

## 2. Google A2A는 무엇이며 현재 어디까지 왔나

- Google은 2025-04-09에 A2A를 공개 발표했고, 2025-06-23에는 Linux Foundation 산하 Agent2Agent 프로젝트로 이관했다고 밝혔다.
- 최신 공식 스펙은 1.0.0이며, 프로토콜은 데이터 모델, 작업(Operation), 바인딩(Binding) 계층으로 구성된다.
- 공식 프로젝트는 핵심 스펙 외에도 Python, JavaScript/TypeScript, Java, Go, .NET, Rust SDK와 샘플, 인스펙터, TCK를 함께 운영한다.

## 3. 생태계 성숙도와 아직 남은 불확실성

- Linux Foundation은 2026-04-09 시점에 A2A가 150개 이상 조직의 지지를 받고 주요 클라우드 플랫폼에 통합됐다고 발표했다.
- AWS는 AgentCore Runtime에서 A2A 서버 배포 가이드를 공개했고, Microsoft는 Foundry Agent Service에서 A2A endpoint 연결 기능을 문서화했지만 일부 기능은 preview 단계다.
- 공식 TCK와 Inspector는 존재하지만, 공개 문서상 TCK의 quality/features 검사는 기본적으로 CI를 막지 않고 Inspector에도 인증 처리 공백 이슈가 남아 있다.
- 공식 이슈 트래커에는 버전 전이, 식별자 명명, request handler 동작 같은 구현 마찰이 기록되어 있어, 생태계가 성숙 중이라는 점을 보여준다.
- 따라서 A2A는 “실험 수준”을 넘었지만, 공개 운영 증거의 상당수는 여전히 프로젝트·벤더 주도 자료에 기대며 독립적 postmortem은 많지 않다.

## 4. 프로토콜 핵심 모델

- Agent Card는 에이전트의 신원, 서비스 URL, capabilities, auth scheme, skills를 기술하는 발견용 메타데이터다.
- Task는 장기 실행과 멀티턴 상호작용을 추적하는 상태ful 단위이며, 결과물은 Artifact로 표현된다.
- Message와 Artifact는 Part의 집합이며, Part는 텍스트, 파일, 구조화 데이터 같은 다양한 매체를 담는다.
- A2A는 `TASK_STATE_INPUT_REQUIRED`, `TASK_STATE_AUTH_REQUIRED` 같은 중단 상태를 통해 인간 개입이나 추가 인증을 자연스럽게 모델링한다.
- 스펙은 `contextId`와 `taskId`의 역할을 분리하지만, 공개 이슈를 보면 이 구분이 구현자에게 실제 혼동 지점으로 남아 있다.

## 5. 전송 바인딩과 비동기 실행 모델

- A2A는 JSON-RPC, HTTP+JSON/REST, gRPC 바인딩을 정의하며 핵심 의미론은 바인딩 간 일관성을 유지한다.
- 스트리밍은 SSE 기반으로 설계되어 장기 작업의 상태 업데이트와 아티팩트 청크 전송을 지원한다.
- 연결 유지가 어려운 경우 push notification webhook을 통해 비동기 업데이트를 전달할 수 있다.
- 실무 구현에서는 `message/send`, `message/stream`, `tasks/get`, `tasks/list`, `tasks/cancel`, push config 관련 작업을 우선 지원하는 것이 현실적이다.

## 6. 엔터프라이즈 설계 포인트

- 프로덕션 A2A 통신은 HTTPS를 전제로 하며 인증은 payload가 아니라 HTTP 계층에서 처리된다.
- Agent Card 기반 discovery는 well-known URL, curated registry, direct configuration의 세 가지가 대표적이며, 기업 환경에서는 registry 방식이 특히 중요하다.
- 권한 부여는 skill 단위까지 세분화할 수 있으며, 인증 scheme은 Agent Card에 선언된다.
- 확장(Extension)은 새 데이터, RPC, 상태기계를 추가할 수 있지만, 코어를 대체하기보다 보수적으로 도입하는 편이 호환성에 유리하다.
- MCP와 A2A는 경쟁 관계가 아니라 상호 보완 관계이며, 일반적으로 도구 연결은 MCP, 외부 에이전트 협업은 A2A가 더 적합하다.

## 7. 기술 구현 예시

- 공식 SDK는 서버 측에서 Agent Card, request handler, task store, executor를 조합하는 구조를 권장한다.
- 가장 작은 구현 단위는 단일 스킬 Agent Card와 direct message 응답만 제공하는 "stateless hello agent"다.
- 실전에서는 direct response보다 Task 기반 응답을 우선 설계하는 편이 멀티턴, 재시도, 추적성 면에서 유리하다.
- Python/FastAPI 또는 TypeScript/Express 기반으로 A2A edge를 두고, 내부 실제 업무 로직은 별도 orchestrator/service 계층으로 분리하는 것이 바람직하다.

## 8. 실서비스 설계와 구현 전략

- A2A 서버를 곧바로 LLM 애플리케이션에 붙이기보다 `edge -> authz -> task service -> worker/orchestrator -> artifact store` 구조로 분리하는 편이 운영에 유리하다.
- 태스크 저장소는 최소한 id, contextId, status, history, artifact metadata, auth/session linkage를 보존해야 한다.
- 외부 에이전트에서 온 Agent Card, Message, Artifact는 모두 비신뢰 입력으로 취급해야 하며, prompt injection과 schema abuse를 방어해야 한다.
- 도입 초기에는 단일 transport와 제한된 skill set으로 시작하고, 이후 streaming, push, extension, registry를 단계적으로 확장하는 편이 리스크가 낮다.
- 배포 전 검증에서는 inspector와 TCK류 도구, 계약 테스트, 상태기계 회귀 테스트가 중요하다.

## 9. 언제 A2A를 쓰고, 언제 다른 패턴을 택해야 하나

- 원격 독립 서비스 간 상태ful 협업이 필요하면 A2A가 적합하다.
- 단일 프로세스 내부 서브에이전트나 단순 함수 호출 수준이면 로컬 orchestration 또는 MCP/tool calling이 더 단순하다.
- 파트너사 또는 타 벤더 에이전트와의 상호운용성이 목표일수록 A2A의 가치가 커진다.
