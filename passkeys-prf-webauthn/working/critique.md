# Critique — passkeys-prf-webauthn (verification pass, 2026-07-03)

## 1. Unsupported claims
- 본문 팩트 문장은 모두 [^sNN] 인용 보유 (draft.md / draft.en.md 전수 스캔). 해석적 권고("키 검증 절차와 대체 복구 경로를 함께 설계") 는 분석 서술로 명시되어 있어 유지.
- 판정: 통과.

## 2. Citation integrity
- draft.md와 draft.en.md의 참조 집합 = {s01..s25} (개정 후 s26, s27 추가) — sources.jsonl과 1:1 대응 확인.
- 전 소스 accessed=2026-07-03 (90일 이내).
- 전 25(+2)개 URL curl HEAD/GET → 모두 200.
- 인용문 스팟 체크: s10(Miller) "permanently lose access to all of its PRF-protected data!" 원문 확인. s02(W3C) evalByCredential 규범 문구 존재 확인. s11(WebKit)은 페이지 렌더링 특성상 grep 부분 일치만 확인(WebFetch 추출로 재확인됨).
- 판정: 통과.

## 3. Reasoning gaps
- "표준 레시피(PRF→HKDF→AES-GCM)로 굳었다"는 3개 독립 소스(s03, s04, s10)로 지지 — 유지.
- iOS 18.0–18.3 버그를 '데이터 손실'로 부르는 것은 Corbado의 프레이밍임을 명시했고, Apple 포럼은 '값 불일치'까지만 확인 — uncertainties.md에 기재됨. 통과.
- Windows KB 번호 등 단일 소스 항목은 본문 표기 완료. 통과.

## 4. Missing counter-evidence — **must-fix (1건)**
- **[must-fix] PRF 기반 사용자 데이터 암호화에 대한 표준 진영의 공개 반대가 누락됨.**
  - Tim Cappalli(W3C WebAuthn L3 공동 편집자)의 2026-02-27 글 "Please, please, please stop using passkeys for encrypting user data" (s27): 인증 크리덴셜에 암호화를 겹치면 분실의 blast radius가 커지고, 크리덴셜 매니저들은 패스키 삭제가 암호화 데이터 파괴로 이어진다는 경고를 주지 않음. 단, 크리덴셜 매니저 볼트 잠금 해제는 정당한 용도로 인정.
  - SimpleWebAuthn 공식 문서(s26): PRF를 "footgun"으로 규정, 라이브러리 차원의 단순화 지원 계획 없음.
  - 조치: 초안 '보안 고려사항과 논의'에 반대 입장 문단 추가, 초록·활용 사례 문구 조정, 두 소스 인용. → **개정에서 반영**
- Corbado(2026-05 수정판)가 이 논쟁(2026-02 발생)을 다루지 않는다는 점 자체도 아티클 평가에 유의미 — 본문에 반영.

## 5. Tone and structure
- Abstract는 본문 결론(지원 개선 + 제약 유효 + WebKit 버그 사례)을 충실 반영. counter-evidence 추가에 맞춰 한 문장 보강 필요 → 개정에서 반영.
- Limitations는 gaps.md의 수용 갭(CTAP 원문, 단일 소스 항목, 학술 레인 429, 매트릭스 시효)을 모두 반영. 통과.
- 이모지·마케팅 어조 없음. 6문장 초과 문단 없음(지원 현황의 Apple 문단이 최장 — 논리 단위로 유지).

## 6. Must-fix vs nit
| # | 분류 | 항목 | 상태 |
|---|------|------|------|
| 1 | must-fix | Cappalli/SimpleWebAuthn 반대 증거 미반영 | **개정 완료 (아래 개정 노트)** |
| 2 | nit | s11 인용문 완전 일치 미확인(렌더링 이슈) | 수용 (WebFetch로 문장 확인됨) |
| 3 | nit | "논커스터디얼" 사례가 저스타 PoC 위주 | _(early signal)_ 표기로 처리됨 |

## 개정 노트 (2026-07-03)
- draft.md / draft.en.md: '보안 고려사항과 논의'에 "생태계 내부의 반대: 인증 크리덴셜로 암호화하지 마라" 문단 추가(s26, s27 인용), 볼트 잠금 해제 vs 일반 데이터 암호화 구분 반영, 초록 1문장 보강.
- must-fix 잔여: **0건.**
