# Claims — Google ADK

## Introduction
- [x] c01: ADK는 Google이 공개한 오픈소스 에이전트 개발 프레임워크로, 공식 사이트는 adk.dev이며 "build, debug, and deploy reliable AI agents at enterprise scale"을 표방한다.
  - kind: factual
  - needs: adk.dev + GitHub 조직/저장소 확인
- [x] c02: ADK는 Apache-2.0 라이선스의 오픈소스이며 Google이 자사 제품(Agentspace, Customer Engagement Suite)에 실제 사용하는 프레임워크와 동일하다.
  - kind: factual
  - needs: GitHub 라이선스 + Google 발표문
- [x] c03: ADK는 2025년 4월 Google Cloud NEXT에서 처음 공개되었고, 이후 Java·Go 등으로 언어 지원이 확장되었다.
  - kind: factual
  - needs: Google 발표 블로그 + 독립 보도

## Background
- [x] c04: 2026년 현재 ADK는 Python, TypeScript/JavaScript, Go, Java, Kotlin 5개 언어 SDK를 제공한다.
  - kind: factual
  - needs: adk.dev 설치 안내 + 각 패키지 레지스트리/저장소
- [x] c05: ADK 2.0(Go GA 포함)은 그래프 워크플로를 도입해 결정적 코드와 LLM 추론을 혼합한 오케스트레이션을 지원한다.
  - kind: technical
  - needs: adk.dev 문서 + 릴리스 노트/발표
- [x] c06: ADK는 모델 애그노스틱을 표방하며 Gemini 외에 Claude 등 서드파티·로컬 모델을 지원하지만 Gemini/Google 생태계에 최적화되어 있다.
  - kind: interpretive
  - needs: 공식 문서 모델 페이지 + 독립 분석

## 아키텍처와 동작 원리
- [x] c07: ADK의 기본 단위는 Agent이며, LLM 기반 LlmAgent와 결정적 워크플로 에이전트(Sequential/Parallel/Loop)로 나뉜다.
  - kind: technical
  - needs: 공식 문서 agents 페이지 + 소스 코드
- [x] c08: 실행은 Runner가 담당하며 이벤트 루프 방식으로 에이전트 실행·도구 호출·상태 변경을 Event 스트림으로 처리한다.
  - kind: technical
  - needs: 공식 문서 runtime 페이지 + 소스 코드
- [x] c09: 컨텍스트는 Session(대화 스레드)·State(키-값)·Memory(장기)·Artifact(파일)로 계층화되어 관리된다.
  - kind: technical
  - needs: 공식 문서 sessions 페이지
- [x] c10: 도구는 함수 도구, 빌트인(Google Search, Code Execution), OpenAPI, MCP 도구를 지원한다.
  - kind: technical
  - needs: 공식 문서 tools 페이지 + 코드 예제
- [x] c11: ADK는 MCP(Model Context Protocol)를 클라이언트·서버 양방향으로 통합한다.
  - kind: technical
  - needs: 공식 문서 MCP 페이지
- [x] c12: ADK는 A2A(Agent2Agent) 프로토콜로 원격 에이전트 간 협업을 지원하며, A2A는 ADK와 함께 발표된 Google 주도 개방 프로토콜이다.
  - kind: technical
  - needs: 공식 문서 A2A 페이지 + A2A 발표
- [x] c13: 멀티에이전트는 계층 구조(sub_agents)와 LLM 주도 위임(transfer)으로 구성된다.
  - kind: technical
  - needs: 공식 문서 multi-agent 페이지

## 구현과 사용법
- [x] c14: Python 설치는 `pip install google-adk`이며, 에이전트는 관례적으로 root_agent를 노출하는 패키지 구조로 작성한다.
  - kind: technical
  - needs: 공식 quickstart + PyPI
- [x] c15: adk CLI는 web(개발 UI), run(터미널 실행), api_server(REST 서버) 등의 서브커맨드를 제공한다.
  - kind: technical
  - needs: 공식 문서 CLI 레퍼런스
- [x] c16: ADK는 평가 프레임워크(adk eval, EvalSet)를 내장해 응답 품질과 실행 궤적을 테스트한다.
  - kind: technical
  - needs: 공식 문서 evaluate 페이지
- [x] c17: 배포 경로는 Cloud Run, GKE, Vertex AI Agent Engine(Agent Runtime)이 공식 지원된다.
  - kind: technical
  - needs: 공식 문서 deploy 페이지
- [x] c18: 개발 UI(adk web)는 이벤트·상태·트레이스 검사를 제공해 디버깅에 사용된다.
  - kind: technical
  - needs: 공식 문서 + 스크린샷/독립 튜토리얼

## Discussion
- [x] c19: adk-python 저장소는 공개 후 빠르게 스타를 모아 주요 에이전트 프레임워크 중 하나로 자리잡았다.
  - kind: factual
  - needs: GitHub 스타/포크 수 + 독립 보도
- [x] c20: ADK는 LangGraph·CrewAI 등과 경쟁하며, 독립 비교 분석에서 Google Cloud 통합·엔터프라이즈 지향이 차별점으로, 생태계 성숙도가 약점으로 지적된다.
  - kind: interpretive
  - needs: 독립 비교 분석 2건 이상
- [x] c21: ADK 기반 에이전트의 보안 리스크(도구 오남용, 프롬프트 인젝션)와 그 완화책(콜백, 가드레일)이 문서화되어 있다.
  - kind: technical
  - needs: 공식 safety 문서 + 독립 분석/논문
- [x] c22: Vertex AI Agent Engine은 ADK 에이전트의 관리형 런타임으로 세션·메모리 등 관리 서비스를 제공한다.
  - kind: technical
  - needs: Google Cloud 문서
