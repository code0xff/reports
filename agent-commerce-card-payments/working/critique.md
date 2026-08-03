# Critique — round 1 (2026-08-03)

Adversarial pass over `draft.md` (ko, primary) and `draft.en.md` (en).

## 1. Unsupported claims

| # | Location | Finding | Class |
|---|---|---|---|
| U1 | 3장 "봇 방어와의 충돌" | "가맹점의 기본 동작은 자동화 트래픽 차단이다"가 무인용. 실제 업계 분포는 48% 기본 허용 / 31% 기본 차단(s31)으로, 원문 주장은 사실과 반대에 가깝다. | must-fix → 해결됨(R2) |
| U2 | 4장 대조군 | x402의 "분쟁 창구가 없다"를 s37(당시 whitepaper PDF)로 인용했으나 해당 PDF는 바이너리로 추출 실패 — 읽지 않은 출처를 인용한 것. | must-fix → 해결됨(R2) |
| U3 | 6-1 온보딩 | "구현·적합성 테스트는 월 단위"를 일반화했는데, Shopify Agentic Storefronts는 2026년 1분기부터 적격 가맹점에 자동 활성화되며 커스텀 통합이 불필요하다(s39). 플랫폼 가맹점과 자체 스택 가맹점의 구분이 없다. | must-fix → 해결됨(R2) |
| U4 | 6-6 관측성 | 문단 전체가 `_(해석)_` 표기는 있으나 근거 인용이 s26/s01/s28에 한정. 유지 가능하나 "인지조차 못하게 된다"는 단정 → 완화 필요. | nit |
| U5 | 7장 "지금 해야 할 것" | 권고 자체는 인용된 근거에서 도출되나 명령형 어조가 강함. | nit |

## 2. Citation integrity

- 기계 검사(R1 시점): `draft.md`·`draft.en.md` 각 37개 ref, 모두 `sources.jsonl`에 존재, 누락 0.
  R2 수정 후 재검사: 각 42개 ref, 누락 0, 미사용 출처 0.
- 수동 footnote 정의 블록 없음, 수동 References 섹션 없음 (PROTOCOL §3 Draft 준수).
- `accessed` 전부 2026-08-03 (90일 이내).
- URL 42건 curl 확인: 200이 37건, 403이 5건(s08, s17, s25, s30, s33). 403은 curl UA 차단이며 5건 모두 WebFetch로 본문 추출에 성공한 URL이다. dead link 아님.
- 인용문 스팟체크 3건:
  - s01(Visa TAP 사양) — "two specific interactions with the Merchant", 8분 서명 유효창, RFC 9421 필드: 원문 확인.
  - s28(Amex ACE) — 5개 서비스명과 "'best' or 'really nice'" 배제 조항: 원문 확인.
  - s21(ACP repo) — 2026-04-17 stable, Beta, Apache 2.0, 1.5k★/78 issues: 원문 확인.
- 미사용 출처였던 s38을 Visa Core Rules로 교체(아래 M1 참조). s37은 접근 실패한 whitepaper PDF에서 열람 가능한 x402.org 홈페이지로 교체.

## 3. Reasoning gaps

| # | Finding | Class |
|---|---|---|
| R1 | "OpenAI의 후퇴 → AI 플랫폼의 체크아웃 소유 시도 실패"는 사례 1건의 일반화. 같은 기간 Google은 UCP 체크아웃을 확대했고(s40) Shopify는 자동 활성화로 채널을 늘렸다(s39). 반증을 병기해야 한다. | must-fix → 해결됨(R2) |
| R2 | "Walmart 전환율 3배 저하"에 분모·기간·표본이 없다(s11의 2차 인용). 조건 표기 필요. | nit |
| R3 | 프롬프트 인젝션 성공률 0.5~8.5%를 결제 위험으로 옮기는 추론. 초안이 이미 도메인 불일치를 명시하고 있어 허용 범위. | nit |
| R4 | "사이트의 80%가 검증하지 않는다"는 벤더 자체 측정이며 초안이 이를 표기하고 있음. 다만 "대부분/거의 없다" 어투가 함께 쓰여 중복 강조. | nit |

## 4. Missing counter-evidence — 가장 중대한 항목

추가 스윕에서 초안의 핵심 주장 세 개를 뒤집는 증거가 나왔다.

**M1 — Visa는 이미 에이전트 거래를 공개 규정에 넣었다. (must-fix → 해결됨)**
초안은 "네트워크 운영 규정은 가맹점·acquirer에게만 배포되어 구조적으로 접근이 어렵다"고 한계에 적었다. 이는 **사실이 아니다.** `Visa Core Rules and Visa Product and Service Rules, 18 April 2026`은 공개 PDF이며, §4.1.24 Agentic Platform Requirements가 신설되어 있다(s38). 구체적으로:
- `Agentic Transaction`이 정식 정의된 거래 유형으로 신설됐다 — "Cardholder-defined payment instruction에 기반하고, Cardholder와 Merchant 간 직접 상호작용 없이 완료되는 전자상거래 거래".
- `Agentic Payment Provider`와 `Agentic Payment Enabler`라는 두 개의 등록 역할이 신설됐고, Visa Intelligent Commerce 프로그램 등록이 의무다.
- §4.1.24.3은 사전 요건으로 **"카드소지자가 Agentic Payment Provider의 행위에 대해 책임이 있다는 확인(acknowledgement)을 획득할 것"** 을 요구한다.
- §4.1.24.2는 Card-Present 환경에서의 Agentic Transaction과 복수 Agentic Transaction의 단일 거래 합산을 금지한다.
- 분쟁 파트에는 별도 reason code가 신설되지 않았고, 대신 compelling evidence 항목에 "Agentic Payment Provider의 로그인 ID"가 추가됐다.

→ 초안의 "CIT/MIT에 제3의 범주를 규칙으로 추가하는 대신 부가 신호를 실어 보내는 방식을 택했다"는 서술과, "분쟁 규칙 비공개" 한계 항목, "Amex만이 명시적"이라는 6-3절 결론이 모두 수정되어야 한다.

**M2 — 책임의 기본값은 미결이 아니라 "카드소지자"다. (must-fix → 해결됨)**
Rivero의 분석은 "현행 카드 스킴 규정 하에서 카드소지자는 자신의 에이전트가 대신 한 행위에 대해 책임이 있다"고 정리하고, 에이전틱 거래가 "현재 카드 부재 전자상거래 결제와 구별되지 않으며 기존 승인·분쟁 규칙의 적용을 받는다"고 본다(s41, s42). 같은 글은 Mastercard가 인증된 에이전트에 대한 스킴 부담 책임을 도입할 계획이라고 *보도된다*고 전한다(s41, 미확인). 이는 s38의 규정 문구와 일치한다. 초안은 "책임 귀속이 미결"이라고 썼는데, 정확히는 **기본값은 정해져 있고(카드소지자), 다툼은 그 기본값이 에이전트 오류에 적용될 때 발생한다.**

**M3 — "온보딩은 월 단위"는 플랫폼 가맹점에 적용되지 않는다. (must-fix → 해결됨)**
Shopify Agentic Storefronts는 2026년 1분기부터 적격 가맹점에 자동 활성화되며 "설치할 앱도, 커스텀 통합도, 표준 처리 수수료를 넘는 거래 수수료도 없다"(s39). 유통되는 "100만 가맹점 라이브" 서술의 정체가 이것이며, 초안 7장의 각주 처리보다 본문에서 명확히 다뤄야 한다.

**M4 — UCP는 정체가 아니라 확장 중이다. (must-fix → 해결됨)**
초안은 UCP를 "3개국 early access"로만 서술했다. 2026년 5월 19일 Google은 Universal Cart를 발표하고 UCP 체크아웃의 미국 Search·Gemini 확대(2026년 여름), 캐나다·호주 후속, 영국 예정, YouTube 및 호텔·음식배달 버티컬 확대를 밝혔다. 초기 가맹점에 Nike, Sephora, Target, Ulta Beauty, Walmart, Wayfair가 포함된다(s40).

**M5 — 반증 탐색 결과 확인된 공백(추가 근거 없음).** 에이전트 거래 승인율 실측치는 반대 방향 탐색에서도 나오지 않았다. 기존 한계 유지.

## 5. Tone and structure

- 초록은 본문과 정합하나, M1~M4 반영 후 재작성 필요. must-fix → 해결됨(R2)(정합성).
- 한계 절의 "분쟁 규칙 비공개" 항목은 M1에 의해 오류로 판명 — 삭제 후 정확한 형태로 교체. must-fix → 해결됨(R2)
- 이모지 없음. 마케팅 어투 없음.
- 6문장 초과 문단: 4장 AP2 절, 6-3절 첫 문단 — 분할 권고. nit
- ko/en 두 초안의 구조·주장 일치 확인. 수정은 양쪽에 동일 적용해야 함.

## 6. Must-fix vs nit

must-fix 8건 → 전부 해결됨(R2): U1, U2, U3, R1, M1, M2, M3, M4 + 초록·한계 정합성(§5 두 항목은 M1 반영에 포함).
**nit (6)**: U4, U5, R2, R3, R4, 문단 길이.

---

## Round 2 — 재검증 (2026-08-03, 수정 후)

- U1: 수정됨 — 3장에 Darwinium 분포(48/31/20)를 명시하고 "기본 차단"이라는 단정을 제거.
- U2: 수정됨 — x402 인용을 열람 가능한 x402.org(s37)로 교체하고, 최종성 대조는 s26·s29·s37로 재구성.
- U3/M3: 수정됨 — 6-1절에 플랫폼 추상화 경로(s39)를 별도 단락으로 추가하고 "월 단위" 주장을 자체 스택 가맹점으로 한정.
- R1: 수정됨 — 7장에 Google UCP 확대(s40)와 Shopify 자동 활성화(s39)를 반증으로 병기.
- M1: 수정됨 — 3장·4장·6-3절·한계에 Visa Core Rules §4.1.24(s38) 반영. 신규 소절 "규정은 이미 쓰였다" 추가.
- M2: 수정됨 — 6-3절 결론을 "미결"에서 "기본값은 카드소지자, 다툼은 에이전트 오류 구간"으로 재작성(s38, s41, s42).
- M4: 수정됨 — 4장 UCP 절과 7장에 s40 반영.
- 초록·한계: 재작성 완료.
- nits: 문단 분할과 어조 완화만 부분 반영. R2·R3·R4는 초안이 이미 조건을 표기하고 있어 유지.

**남은 must-fix: 0.**
