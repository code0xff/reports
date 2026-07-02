# Google ADK (Agent Development Kit)

## 초록

Google ADK(Agent Development Kit)는 Google이 2025년 4월 Cloud NEXT에서 공개한 오픈소스 에이전트 개발 프레임워크로, 공식 사이트 adk.dev를 통해 "엔터프라이즈 규모에서 신뢰할 수 있는 AI 에이전트를 빌드·디버그·배포"하는 코드 우선(code-first) 툴킷을 표방한다. 본 보고서는 adk.dev 공식 문서를 1차 소스로 삼아 ADK의 개념·아키텍처·기술 특징·구현 방법을 정리하고, GitHub 저장소·발표문·독립 비교 분석으로 교차 검증했다. ADK의 실행 모델은 Agent(LlmAgent와 결정적 워크플로 에이전트)·Tool·Runner·Event를 축으로 하는 이벤트 구동 구조이며, Session/State/Memory의 계층적 컨텍스트 관리, MCP·A2A 프로토콜의 양방향 통합, 내장 평가 프레임워크, Cloud Run·GKE·관리형 Agent Runtime으로 이어지는 배포 경로를 갖춘다. 2026년의 ADK 2.0은 계층형 실행기를 그래프 기반 실행 엔진으로 전환하며 결정적 코드와 LLM 추론을 노드 단위로 혼합하는 그래프 워크플로를 도입했다. 독립 분석은 다국어 SDK·엔터프라이즈 통합·A2A 네이티브 지원을 강점으로, 상대적으로 짧은 생태계 성숙도와 Google Cloud 종속 위험을 약점으로 지적한다.

## 1. 서론

LLM 기반 에이전트를 프로토타입에서 프로덕션으로 옮기려면 오케스트레이션, 상태 관리, 도구 연동, 평가, 배포라는 공학 문제를 풀어야 한다. Google ADK는 이 전 과정을 하나의 프레임워크로 묶으려는 시도로, 공식 사이트(사용자가 지정한 `https://adk.dev/`)는 ADK를 "엔터프라이즈 규모에서 신뢰할 수 있는 AI 에이전트를 빌드, 디버그, 배포할 수 있게 하는 오픈소스 에이전트 개발 프레임워크"로 정의한다[^s01]. 전 SDK가 Apache-2.0 라이선스로 GitHub `google` 조직에 공개되어 있으며[^s14], Google은 이것이 "Agentspace와 Customer Engagement Suite 같은 Google 제품 내 에이전트를 구동하는 것과 동일한 프레임워크"라고 밝혔다[^s17][^s18].

본 보고서는 ADK가 무엇인지(2장), 어떻게 동작하는지(3장), 어떻게 구현하고 사용하는지(4장)를 공식 문서 기준으로 기술하고, 5장에서 생태계 내 위치와 한계를 논한다.

## 2. 배경: 연혁과 위치

ADK는 2025년 4월 9일 Google Cloud NEXT 2025에서 Python SDK로 처음 공개됐다[^s17][^s18]. 이후 언어 지원이 단계적으로 확장되어 2025년 11월 Go SDK가 추가될 시점의 라인업은 Python·Java·Go였고[^s19], 2026년 7월 현재 adk.dev는 Python(`pip install google-adk`), TypeScript/JavaScript(`npm install @google/adk`), Go(`go get google.golang.org/adk`), Java, Kotlin 5개 언어를 안내한다[^s01]. 다만 Google Cloud 문서는 아직 4개 언어(Python·TypeScript·Go·Java)만 기재하고 있고[^s21], Kotlin SDK는 v0.1.0의 초기 단계다[^s04][^s16].

버전 축에서는 2026년이 전환점이다. ADK 2.0은 Python이 2026년 5월 19일, Go가 2026년 6월 30일 GA에 도달했으며, "계층형 에이전트 실행기에서 그래프 기반 실행 엔진으로" 아키텍처를 전환했다[^s13]. GitHub 지표 기준 adk-python은 20,400 스타(v2.3.0), adk-go 8,325 스타(v2.0.0), 예제 모음 adk-samples는 9,807 스타로[^s14][^s15][^s16], 공개 15개월 만에 주류 에이전트 프레임워크 대열에 들었다.

## 3. 아키텍처와 동작 원리

### 3.1 기본 단위: Agent, Tool, Runner, Event

ADK의 기초 실행 단위는 Agent다. 공식 문서는 에이전트를 "특정 목표를 달성하기 위해 자율적으로 행동하도록 설계된 자기완결적 실행 단위"로 정의하며, AI 모델·작업 지시·(선택적) 도구 집합의 결합으로 본다[^s03]. Agent는 두 갈래로 나뉜다. 추론 중심 작업을 맡는 `LlmAgent`와, AI 모델 개입 없이 "미리 정의된 로직에 따라 실행 순서를 결정"하는 결정적 컨트롤러인 워크플로 에이전트다[^s02][^s06]. 워크플로 에이전트는 세 템플릿 — 하위 에이전트를 순서대로 실행하는 `SequentialAgent`, 동시에 실행하는 `ParallelAgent`, 종료 조건까지 반복하는 `LoopAgent` — 을 제공하며, "AI 모델에 오케스트레이션을 묻지 않으므로 결정적이고 예측 가능한 실행 패턴"을 만든다[^s06].

Tool은 "대화를 넘어서는 능력"을 에이전트에 부여하는 확장점으로, 외부 API 호출·정보 검색·코드 실행을 담당한다[^s02]. 실행은 Runner가 총괄한다: "실행 흐름을 관리하고, Event에 기반해 에이전트 상호작용을 오케스트레이션하며, 백엔드 서비스와 조율"하는 실행 엔진이다[^s02]. Event는 "세션 중 발생하는 일들을 표현하는 기본 통신 단위"(사용자 메시지, 에이전트 응답, 도구 호출)로, 이벤트 스트림이 곧 대화 이력이 된다[^s02].

### 3.2 컨텍스트 계층: Session, State, Memory

컨텍스트 관리는 세 계층으로 나뉜다. Session은 "사용자와 에이전트 시스템 사이의 단일한 진행 중 상호작용"을 표현하고 그 안의 Event 시퀀스와 State(현재 대화에만 유효한 키-값 데이터)를 담는다[^s04]. Memory는 "여러 과거 세션에 걸치거나 외부 데이터 소스를 포함할 수 있는 정보 저장소"로 장기 지식을 담당한다[^s04]. 각 계층은 서비스 인터페이스(SessionService, MemoryService)로 추상화되어 인메모리 구현(로컬 개발용 — "애플리케이션 재시작 시 모든 데이터가 사라진다")부터 데이터베이스·클라우드 관리형 백엔드까지 교체 가능하다[^s04].

### 3.3 ADK 2.0: 그래프 기반 워크플로

ADK 2.0의 핵심 변화는 그래프 워크플로다. "에이전트 로직을 실행 노드와 엣지의 그래프로 정의해, AI 기반 에이전트 추론과 결정적 도구·코드를 결합"할 수 있으며, 노드는 에이전트·도구 호출·커스텀 코드 함수가 될 수 있다[^s05]. 조건 분기는 `workflow.StringRoute`·`IntRoute`·`BoolRoute` 같은 라우트 매칭으로 처리하고, "생성형 AI 모델을 호출하지 않고 도구와 자체 코드만으로 함수 체인을 실행"하는 것도 가능하다[^s05]. 2.0은 여기에 동적 워크플로(코드 기반 반복·분기)와 협업 워크플로(코디네이터 에이전트 + 다중 서브에이전트)를 더했으며, Event 스키마 확장(`node_info`, `output` 필드) 등 파괴적 변경을 수반했다[^s13]. 현재 그래프 워크플로는 Python v2.0.0과 Go v2.0.0에서 지원된다[^s05].

### 3.4 도구 시스템과 모델 지원

도구는 여러 방식으로 공급된다: 일반 함수를 그대로 등록하는 함수 도구(quickstart 예제의 `get_current_time`처럼 파이썬 함수를 `tools=[...]`에 전달)[^s10], Google Search·코드 실행 같은 빌트인 및 Google Cloud 통합 도구, OpenAPI 명세 기반 도구, 그리고 MCP 도구다[^s08][^s17]. adk.dev의 통합 카탈로그에는 BigQuery·GitHub·Atlassian 등 수십 개의 MCP/파트너 통합과 Datadog·Arize 등 옵저버빌리티 연동이 나열되어 있다[^s01].

모델 축에서 ADK는 "다양한 LLM을 에이전트에 통합할 수 있는 유연성"을 표방한다[^s07]. Gemini·Claude·Agent Platform 엔드포인트는 모델명 문자열을 내부 레지스트리가 해석하는 네이티브 경로로, Ollama·vLLM·LiteRT-LM 및 LiteLLM 프록시는 래퍼 클래스(`LiteLlm` 등)를 인스턴스화하는 커넥터 경로로 지원된다[^s07]. 즉 모델 애그노스틱 구조는 사실이지만, 네이티브 통합의 중심은 Google 생태계다[^s07][^s23].

### 3.5 프로토콜 통합: MCP와 A2A

ADK는 두 개방 프로토콜을 양방향으로 통합한다. MCP에 대해서는 "ADK 에이전트가 MCP 클라이언트로서 외부 MCP 서버가 제공하는 도구를 사용"할 수 있고, 반대로 ADK 도구를 감싸 "어떤 MCP 클라이언트에서도 접근 가능한 MCP 서버를 빌드"할 수도 있다[^s08]. Python 구현은 FastMCP를 활용해 "대부분의 경우 함수에 데코레이터를 붙이는 것으로 충분"하다[^s08].

A2A(Agent2Agent)는 서로 다른 런타임의 에이전트 간 협업 프로토콜로, ADK 문서는 자신의 에이전트를 A2A로 노출하는 방법과 원격 A2A 에이전트를 소비하는 방법을 모두 안내하며, 루트 에이전트–로컬 서브에이전트–원격 A2A 에이전트로 구성된 멀티에이전트 예제를 제공한다(Python·Go·Java 지원)[^s09]. InfoQ는 "A2A로 주 에이전트가 특화된 서브에이전트들에 작업을 매끄럽게 오케스트레이션·위임할 수 있다"고 전한다[^s19]. 멀티에이전트 구성 자체는 계층적 합성(부모-자식 위임)과 LLM 주도 라우팅 — "사용자 메시지를 처리할 때 LLM이 질의, 현재 에이전트의 description, 관련 에이전트들의 description을 함께 고려"해 위임을 결정 — 을 기본 문법으로 한다[^s02][^s17].

## 4. 구현과 사용법

### 4.1 설치와 최소 에이전트

Python 기준 설치는 `pip install google-adk` 한 줄이다[^s10]. `adk create my_agent`를 실행하면 `agent.py`(에이전트 본체), `.env`(API 키/프로젝트 ID), `__init__.py`로 구성된 패키지가 생성된다[^s10]. 모든 ADK 에이전트는 `root_agent` 정의를 노출해야 하며, 공식 quickstart의 최소 예제는 다음과 같다[^s10]:

```python
from google.adk.agents.llm_agent import Agent

def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city."""
    return {"status": "success", "city": city, "time": "10:30 AM"}

root_agent = Agent(
    model='gemini-flash-latest',
    name='root_agent',
    description="Tells the current time in a specified city.",
    instruction="You are a helpful assistant that tells the current time in cities.",
    tools=[get_current_time],
)
```

일반 파이썬 함수가 곧바로 도구가 되고, 모델·지시문·도구를 선언적으로 묶는 것이 ADK의 기본 문법이다[^s10].

### 4.2 실행과 디버깅: adk CLI와 개발 UI

실행은 adk CLI가 담당한다. `adk run my_agent`는 터미널 대화형 인터페이스를 열고, `adk web --port 8000`은 `localhost:8000`에서 개발용 웹 UI를 띄운다[^s10]. 이 웹 UI는 실행 추적(execution tracing)을 갖춘 디버깅 표면으로 소개되지만, 공식 문서는 "프로덕션 배포용이 아니다"라고 명시한다[^s10][^s18].

### 4.3 평가

ADK는 평가를 프레임워크에 내장했다. 문서는 "모델의 확률적 특성 때문에 결정적 pass/fail 단정은 에이전트 성능 평가에 부적합한 경우가 많다"며, 평가 차원을 실행 궤적·도구 사용(trajectory)과 최종 응답(final response) 둘로 나눈다[^s12]. 개발 중에는 세션 단위 테스트 파일(`.test.json`)을, 통합 테스트에는 다중 턴 EvalSet을 쓰고, `adk eval <AGENT_MODULE> <EVAL_SET_FILE>`로 CI/CD에 편입할 수 있다[^s12]. 기본 기준값은 `tool_trajectory_avg_score: 1.0`, `response_match_score: 0.8`이며 ROUGE 유사도·LLM 심판·루브릭·환각 탐지·안전성 검사 등이 제공된다[^s12].

### 4.4 배포

배포 경로는 네 가지가 문서화되어 있다[^s11]: ① Agent Platform의 Agent Runtime — "AI 에이전트의 배포·관리·확장을 위해 특별히 설계된 Google Cloud의 완전 관리형 오토스케일링 서비스", ② 컨테이너 기반 오토스케일링 플랫폼인 Cloud Run, ③ "배포에 대한 더 많은 제어와 오픈 모델 구동"을 위한 GKE, ④ 임의의 컨테이너 인프라(수동 패키징). 관리형 런타임은 2025년 발표 시점에는 "Vertex AI Agent Engine"으로 불렸고[^s17], 현행 Google Cloud 문서는 Gemini Enterprise Agent Platform 아래에서 세션 관리·Memory Bank 등 관리 서비스와 함께 ADK를 안내한다[^s21] — 명칭이 리브랜딩 전환기에 있다 _(명칭 혼재)_.

### 4.5 안전과 가드레일

공식 safety 문서는 위험 원천으로 "모호한 지시, 모델 환각, 적대적 사용자의 jailbreak·프롬프트 인젝션, 도구 사용을 통한 간접 프롬프트 인젝션"을 명시하고, 완화책으로 도구 호출 전 검증을 수행하는 Before Tool Callback, 도구 내부의 결정적 정책 강제(Tool Context 활용), 모델 생성 코드의 샌드박스 실행, Gemini 내장 콘텐츠 필터, VPC-SC 경계를 통한 데이터 유출 차단을 제시한다[^s20]. 신원 축에서는 전 사용자가 동일 권한을 공유하는 Agent-Auth와 "사용자가 직접 할 수 있었을 행동만 에이전트가 수행하도록" OAuth를 쓰는 User-Auth를 구분한다[^s20].

## 5. 논의

### 5.1 경쟁 구도 속의 ADK

독립 비교 분석들은 ADK의 차별점을 다국어 SDK와 엔터프라이즈 통합에서 찾는다. 한 2026년 비교는 ADK를 "다국어 SDK가 필요한 팀에게 최고의 엔터프라이즈 선택지"로 평가하며, MCP는 LangGraph·CrewAI도 지원하지만 "A2A 네이티브 지원은 ADK뿐"이라고 정리한다[^s22]. 다른 분석은 A2A 덕분에 "ADK 에이전트가 LangGraph나 CrewAI로 만든 에이전트를 발견하고 호출할 수 있다"는 상호운용성과 Gemini 멀티모달 API 활용을 강점으로 꼽는다[^s23].

약점 지적도 일관된다: CrewAI보다 가파른 학습 곡선, "LangGraph나 CrewAI 대비 적은 서드파티 튜토리얼·통합·프로덕션 사례", 그리고 Gemini·Vertex AI에 최적화된 데서 오는 Google Cloud 종속 위험이다[^s22][^s23]. 한 분석은 ADK의 프로덕션 성숙도를 "early"로 분류했다[^s23]. 오케스트레이션 모델 관점에서 ADK의 계층 트리는 LangGraph의 조건부 엣지 그래프와 대비되어 왔으나[^s22], ADK 2.0의 그래프 엔진 전환은 이 구도를 바꾸는 움직임이다[^s13] _(해석)_.

### 5.2 채택 신호와 남은 질문

GitHub 지표(adk-python 20.4k 스타, 15개월)와 방대한 파트너 통합 카탈로그는 빠른 생태계 형성을 보여준다[^s14][^s01]. 그러나 공개 직후부터 거버넌스 질문도 제기됐다. InfoQ가 전한 연구자 논평은 "시스템이 자율적으로 행동하기 시작할 때 오케스트레이션 로직은 누가 정의하는가"라며 과제 성공률 너머의 "편향·회복력·창발 행동" 평가 지표를 요구했다[^s18].

업그레이드 경로의 마찰은 실무 보고로 확인된다. 2.0으로의 전환을 다룬 한 현장 보고는 events 테이블에 추가된 필수 JSONB 컬럼 두 개가 없으면 "컨테이너는 정상 기동하고 /health는 200을 반환하지만 모든 채팅 턴이 500으로 실패"하는 무증상 장애, 비동기 드라이버 강제에 따른 접속 URL 충돌, 그리고 제자리(in-place) 마이그레이션이 불가능한 스토리지 재구조화(pickled bytea → 통합 JSONB)를 문제로 꼽았다[^s24]. 스키마 자동 마이그레이션 부재는 1.x 시절부터의 불만이기도 하다 — adk-python 이슈 트래커에는 "사용자가 스키마를 수동으로 갱신할 수밖에 없다", "필요한 변경이 릴리스 노트에 언급조차 안 돼 직접 알아내야 했다"는 보고가 미해결로 남아 있다[^s25].

## 6. 한계

본 보고서의 한계는 다음과 같다. 첫째, 아키텍처·사용법 서술은 대부분 adk.dev 공식 문서(벤더 1차 소스)에 의존한다 — 기술 클레임에는 1차 소스가 적절하지만, "엔터프라이즈 규모 신뢰성" 같은 품질 주장은 독립 검증이 없다 _(vendor-stated)_. 둘째, Runner 이벤트 루프의 내부 동작은 기술 개요 페이지 요약 수준으로만 확인했고 소스 코드 수준 분석은 수행하지 않았다. 셋째, 관리형 런타임 명칭이 "Vertex AI Agent Engine"(2025)과 "Agent Runtime on Agent Platform"·"Gemini Enterprise Agent Platform"(2026) 사이에서 리브랜딩 중이라 문서 간 표기가 어긋난다. 넷째, 언어 지원 수는 adk.dev(5개, Kotlin 포함)와 Google Cloud 문서(4개)가 불일치하며, Kotlin SDK는 v0.1.0 초기 단계다. 다섯째, ADK 2.0(Python 2026-05, Go 2026-06 GA)은 매우 최근이어서 마이그레이션에 대한 독립 평가가 초기 실무 보고 몇 건(§5.2)에 그치며, 그래프 엔진 전환의 체계적 사후 평가와 TypeScript·Java·Kotlin의 2.0 로드맵은 미확인이다. 여섯째, 경쟁 비교(5.1)는 개인·기업 블로그에 의존하며 이들 글의 정량 수치(스타 수 등)는 이미 시점이 어긋나 정성 평가만 인용했다.
