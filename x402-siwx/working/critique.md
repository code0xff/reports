# Critique — x402-siwx (verification pass, 2026-07-06)

## 1. Unsupported claims
- "V2 스펙은 402 응답에 extensions 필드를 도입해" — 역사적 서술("V2가 도입")의 직접 근거(스펙 changelog 원문)를 확보하지 못함. 코드 주석이 CHANGELOG-v2.md를 참조하나 저장소 트리에서 해당 파일 미발견. → **must-fix(완화)**: "x402 V2의 402 응답에는 extensions 필드가 있으며"로 서술 변경(도입 시점 주장 제거). 개정 완료.
- 그 외 팩트 문장은 [^sNN] 인용 보유.

## 2. Citation integrity
- draft.md / draft.en.md 참조 집합 {s01..s18} = sources.jsonl(개정 후 s01..s20)과 정합. 전 소스 accessed=2026-07-06.
- URL 체크: 17/20 → 200. s12(Coinbase)·s14(The Defiant)·s18(ACM)은 403(봇 차단/페이월) → `access_limited: true` 플래그 부여 완료. s12·s14의 인용문은 검색 인덱스 경유 확보임을 감안해 본문에서 해당 수치는 _(vendor-stated)_ 유지.
- 인용문 스팟 체크: s06(validate.ts) DEFAULT_MAX_AGE_MS·도메인 검사 — 코드 직접 정독으로 확인. s02(CAIP-122) "generalize and abstract" — fetch 원문 확인. s03(EIP-4361) MUST/SHOULD 문구 — fetch 원문 확인.

## 3. Reasoning gaps
- "SIWX는 신원 계층으로 확장되는 첫 공식 신호" — '첫'은 과주장 소지 → "첫 공식 신호라는 점에서"를 유지하되 확장 목록 검토 범위가 본 리포트에 한정됨을 암시하도록 "공식 신호"로 완화. 개정 완료.
- 논스 미추적 리스크 서술은 코드 근거(s04) + 문서 자인(s01)으로 지지, TLS 환경 의존성 명시 — 통과.
- facilitator 비관여 설계 해석("지연 민감") — "으로 읽히지만"으로 해석임을 표시 — 통과.

## 4. Missing counter-evidence — **must-fix (1건)**
- **[must-fix] x402 수준의 외부 보안 분석·비판 미반영.**
  - Halborn(2026-03): 결제 증명을 single-use로 만들지 않으면 동일 결제로 다중 접근 가능 — 논스·짧은 만료 권고. SIWX의 옵셔널 논스 추적과 직접 병렬(s19).
  - GoPlus 감사(2025-11): x402 생태계에서 과도한 승인·서명 리플레이·허니팟 등 리스크 실측(s20).
  - 402bridge 사고(17,000+ USDC, 키 유출), KuCoin 보도의 "관심 감소" 비판 — 생태계 서술의 균형추.
  - 조치: 논의 §"x402 생태계에서의 위치"에 외부 비판 문단 추가(s19, s20 인용). → **개정 완료**
- SIWX 확장 자체에 대한 반대 견해는 미존재(신규) — uncertainties.md에 이미 기재.

## 5. Tone and structure
- Abstract는 본문 결론(메커니즘 4개 축 + 논스 창 + early signal)을 충실 반영. 통과.
- Limitations는 gaps.md(ACM 403, API 429, Go/Python 미정독, 채택 데이터 부재)를 모두 반영. 통과.
- 이모지·마케팅 어조 없음. "보안 분석" 섹션 문단 일부 6문장 근접 — 논리 단위 유지 판단.

## 6. Must-fix vs nit
| # | 분류 | 항목 | 상태 |
|---|------|------|------|
| 1 | must-fix | x402 외부 보안 분석(Halborn/GoPlus) 미반영 | 개정 완료 |
| 2 | must-fix | "V2가 extensions 도입" 근거 부족 | 완화 개정 완료 |
| 3 | nit | s12/s14 인용문이 검색 인덱스 경유 | access_limited 플래그 + vendor-stated 표기로 수용 |
| 4 | nit | "첫 공식 신호" 표현 | 완화 완료 |

## 개정 노트 (2026-07-06)
- draft.md / draft.en.md: 논의 섹션에 Halborn·GoPlus 비판 문단 추가, V2 서술 완화, "첫 공식 신호" 완화.
- must-fix 잔여: **0건.**
