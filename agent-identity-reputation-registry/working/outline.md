# Outline — AI 에이전트 신원인증 · 평판 · 탐색 프로토콜과 레지스트리

Eight top-level sections. Mandatory Abstract / Introduction / Limitations / References pinned.
Primary language: ko. Alternate: en.

1. **초록 (Abstract)** — 한 단락 요약: 에이전트 신뢰 스택(신원 → 인증/위임 → 탐색/노출 → 평판)의 2025–2026 현황, 어떤 표준이 실제로 배포되었고 어떤 것이 제안 단계인지, 핵심 결론.

2. **서론 및 배경 (Introduction and Background)** — 에이전트 경제가 만드는 새로운 신뢰 문제(누가 호출하는가, 무엇을 대신하는가, 신뢰할 만한가, 어떻게 찾는가), 기존 웹 신원 스택(TLS·OAuth·robots.txt)이 왜 부족한지, 본 보고서가 쓰는 4계층 분류(identity / authentication & delegation / discovery & exposure / reputation & verification), 논의 범위와 시점(2026-07 기준).

3. **신원과 인증 (Identity and Authentication)** — W3C DID·Verifiable Credentials, HTTP Message Signatures(RFC 9421) 기반 Web Bot Auth, Cloudflare 서명 에이전트, Visa Trusted Agent Protocol, OAuth 2.1 기반 MCP 인가와 Cross-App Access(ID-JAG), 엔터프라이즈 워크로드 신원(Microsoft Entra Agent ID, SPIFFE/SPIRE), 온체인 신원(ERC-8004 Identity Registry, ENS), 위임(delegation)과 대리 권한 표현 방식의 차이.

4. **탐색 · 레지스트리 · 노출 (Discovery, Registries, and Exposure)** — A2A Agent Card와 `/.well-known/agent-card.json`, MCP 공식 레지스트리와 서브 레지스트리 모델, NANDA Index / Agent Name Service류 분산 인덱스, `llms.txt`·`agents.md` 류 노출 관례, robots.txt/Cloudflare 크롤러 정책과 "탐색 가능성"의 반대편(차단·유료화), 온체인 레지스트리(ERC-8004, x402 Bazaar), 마켓플레이스형 카탈로그(AWS Marketplace AI Agents, Microsoft Agent Store, Salesforce AgentExchange 등)와 그 신원·심사 모델.

5. **평판 · 검증 · 신뢰 신호 (Reputation, Verification, and Trust Signals)** — ERC-8004 Reputation·Validation 레지스트리, 어테스테이션 기반 접근(EAS, ERC-8126류 검증), 스테이킹/재실행/TEE/zkML 검증 계층, Sybil 저항 문제, 학술 문헌의 에이전트 평판·신뢰 모델, 실제 배포된 평판 신호가 얼마나 희소한지.

6. **비교 분석 (Comparative Analysis)** — 계층별 표준 경쟁 구도(웹 계층 vs 엔터프라이즈 IAM 계층 vs 온체인 계층), 상호운용 가능한 지점과 실제 충돌 지점, 신원 없이 평판이 성립하지 않는 의존 관계, 마켓플레이스가 실질적 신뢰 게이트키퍼가 되는 경향, 파편화 vs 수렴 증거.

7. **한계와 열린 질문 (Limitations and Open Questions)** — 채택률 데이터의 부재/벤더 자체 발표 의존, 평판 레지스트리의 실사용 증거 부족, 위임 체인의 감사 가능성, 프라이버시(에이전트 카드·피드백 파일 공개), 표준 초안의 변동성, 본 보고서가 다루지 못한 영역(결제 프로토콜 상세, 지역 규제).

8. **참고문헌 (References)** — `sources.jsonl`에서 렌더러가 생성.
