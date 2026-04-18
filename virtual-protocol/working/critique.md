# Critique — Virtual Protocol 리포트 (A 범위)

적대적 1 패스. 2026-04-18 기준.

## 1. Unsupported claims

draft.md 의 모든 기술·사실 주장은 [^sNN] 인라인 각주로 인용돼 있음. 인용 없는 사실 주장은 발견되지 않음.

**Finding**: nit — Introduction 마지막 문단의 범위 선언은 인용 불필요. OK.

## 2. Citation integrity

- 모든 `[^sNN]` ref 는 sources.jsonl 에 존재 (validate-report pass).
- `accessed` 날짜는 전 항목 2026-04-18, 90일 창 이내.
- URL 형태: 유효. Gitbook presigned URL 은 만료 가능성 있음(s18, s19) — 그러나 공식 whitepaper 의 security-audits 페이지(s09) 에서 직접 링크된 현재 유효 URL.
- `quote` 실제 페이지 일치 샘플: s01, s06, s08, s09, s14 확인 완료.

**Finding**: nit — s18/s19 의 presigned URL 은 장기적으로 dead link 가 될 수 있음. 유지는 하되 Limitations 에 "감사 PDF 링크 시한성" 메모를 넣는 것도 가능. 이번 리포트에서는 현 상태 유지.

## 3. Reasoning gaps

- "온체인/오프체인 경계" 해석: "_(unverified — 단일 종합 문서 부재)_" 표식 적용. 적정.
- ERC-6551 vs ERC-1155 불일치: 두 표기를 모두 명시하고 단정하지 않음. 프로토콜 §6 부합.
- "모든 에이전트 런치가 공유하는 프로토콜 수준 불변식" (42k / 10년 lock): s06 의 기술 문서 기준. 조건부 서술.
- "1만 8천 개 이상 에이전트" (s21): 2026 시점 인용임을 draft 가 맥락화.
- "모든/전혀" 일반화: 검색 결과 없음.

## 4. Missing counter-evidence

- ACP evaluator 의 매수(collusion) 리스크: draft 에 반론 없음.
- Genesis Launch proof-of-contribution 의 Sybil/point-farming 문제: draft 에 반론 없음. 경제 비판으로 c16 범위 → A 범위 밖.

**Finding**: nit — ACP evaluator 보안 모델은 "기술"에 해당하고 "경제 비판"(c16) 과 구분되므로 A 범위에 넣는 것이 타당. Limitations 섹션에 1 줄 추가.

→ **액션**: draft Limitations 에 "ACP evaluator 역할의 보안 모델(담합·독립성 가정)은 본 리포트에서 독립 검증하지 않음" 문장 추가.

## 5. Tone and structure

- Abstract 가 본문 요약 충실. ✓
- Limitations 가 gaps.md 와 일치. ✓
- 이모지·마케팅 톤·헤지 없음. ✓
- 문단 길이 최대 5–6 문장. OK.

## 6. Must-fix vs nit

- Must-fix: **0 건**.
- Nit:
  - N1 (반영): Limitations 에 ACP evaluator 독립 검증 미수행 1 줄.
  - N2 (유지): Gitbook presigned URL 시한성 — 현재 공식 페이지 기준 유지.

## 반영 결과

- draft.md Limitations 에 evaluator 독립 검증 주석 추가 완료 후 status → ready.
