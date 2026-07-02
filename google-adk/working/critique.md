# Critique — google-adk (verification pass 1)

## 1. Unsupported claims
- §2 "공개 15개월 만에 주류 에이전트 프레임워크 대열에 들었다": 스타 수치는 s14–s16으로 인용됨; "주류" 판단은 해석 — 수치가 인접 인용되어 있어 통과 (interpretive).
- §5.1 마지막 문장(2.0 그래프 전환이 경쟁 구도를 바꾼다)은 `_(해석)_` 표기 처리. 통과.
- 나머지 사실 서술은 [^sNN] 보유. 양 초안 refs 25종 전부 sources.jsonl에 존재, 미사용 소스 없음, 각주 정의 블록 없음.

## 2. Citation integrity
- 25개 소스 전수 HEAD 체크: 전부 200 OK.
- accessed 전부 2026-07-02 (당일).
- 인용문 스팟 체크 3건: s10("pip install google-adk", "gemini-flash-latest", "not meant for use in production deployments") 원문 일치. s13("released for general availability as of May 19, 2026" / "June 30, 2026", "hierarchical agent executor to a graph-based execution engine") 원문 일치. s05("graph of execution nodes and edges", workflow.StringRoute) 원문 일치.

## 3. Reasoning gaps
- 스타 수(20.4k 등)는 확인 시점(2026-07-02)이 소스 quote에 명시됨. 통과.
- s22의 "ADK 15K stars"와 GitHub API 값 20.4k 불일치 → 초안은 블로그의 정량 수치를 인용하지 않고 정성 평가만 사용, Limitations 6항에 명시. 통과.
- 언어 수 충돌(adk.dev 5개 vs Google Cloud 문서 4개)은 §2와 Limitations 4항에서 양쪽 병기. 통과.

## 4. Missing counter-evidence
- **[해소] must-fix**: 초안 §5.2가 "2.0 마이그레이션에 대한 독립 평가가 아직 없다"고 서술했으나, 반대 증거 스윕에서 실무 현장 보고(dev.to, 무증상 500 장애·in-place 마이그레이션 불가)와 미해결 GitHub 이슈(#3343, 수동 스키마 갱신 강제)를 발견. → s24·s25 추가, §5.2에 '업그레이드 경로의 마찰' 문단 신설, Limitations 5항을 "초기 실무 보고 몇 건에 그침"으로 정정 (양 언어).

## 5. Tone and structure
- 초록은 본문(이벤트 구동 모델, 컨텍스트 계층, 프로토콜 통합, 2.0 전환, 강점/약점)과 일치. 통과.
- Limitations 6개 항목은 gaps.md·uncertainties.md의 전 항목(vendor 의존, 명칭 리브랜딩, Kotlin 지위, 2.0 시효, 비교 소스 시효)을 반영. 통과.
- 이모지·마케팅 어조 없음. 6문장 초과 문단 없음. 수동 References 섹션 없음.

## 6. Must-fix vs nit
| # | 항목 | 분류 | 상태 |
|---|------|------|------|
| 1 | §5.2 "독립 평가 부재" 서술이 실무 보고 존재와 모순 (반대 증거 미반영) | must-fix | 해소 (s24·s25 반영) |
| 2 | c15의 api_server 서브커맨드 미확인 → 초안에서 확인된 서브커맨드만 기술 | nit | 수용 (이미 반영) |
| 3 | 비교 블로그(s22)의 스타 수치 부정확 → 정성 평가만 인용 | nit | 수용 |

**미해결 must-fix: 0건.**
