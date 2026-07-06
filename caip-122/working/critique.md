# Critique — caip-122 (verification pass, 2026-07-06)

## 1. Unsupported claims
- 초안의 잘못된 인용 표기(`[^s08의 자매 리포트…]`) 1건 발견 → SIWS 소스(s12) 추가 후 정상 인용으로 교체 완료.
- 그 외 팩트 문장 [^sNN] 인용 보유.

## 2. Citation integrity
- 참조 집합 {s01..s12}(개정 후 s13, s14 추가) = sources.jsonl 정합. 전 소스 accessed=2026-07-06, 전 URL 200.
- 인용 스팟 체크: s01 필드 표(raw 원문 grep으로 nonce·resources 선택 표기 재확인), s02 eip155 프로파일 문구(fetch 원문), s04 CACAO "composable and replay-able authorization receipt"(fetch 원문) 확인.

## 3. Reasoning gaps
- "nonce 규범 강도 하향" — EIP-4361 원문(필수, 8+ 영숫자)과 CAIP-122 원문(선택) 직접 대조로 지지. 통과.
- "구현이 스펙보다 엄격한 경향" — 표본 1건(x402) 한계를 본문·uncertainties에 명시. 통과.

## 4. Missing counter-evidence — **must-fix (1건)**
- **[must-fix] 표준 저장소의 공개 구현자 비판 미반영.**
  - #262(Pedro Gomes, 2024): 단일 체인 설계 한계 — 멀티체인 인증에 다중 서명 필요, 미해결(s13).
  - #264(bumblefudge, 2024): resources 필수/선택의 CAIP-122↔EIP-4361 불일치 보고(s14). 검증 중 현행 본문에서는 선택으로 확인 → 보고 후 본문이 수정된 정황. Review 상태 표준의 무버전 규범 변경이라는 메타 관찰로 본문에 반영.
  - → **평가와 논의에 "구현자들의 공개 비판" 문단 추가 완료.**

## 5. Tone and structure
- Abstract 본문 정합(비판 반영 후에도 초록의 '득실' 프레임과 일치). Limitations는 gaps.md 반영. 이모지·마케팅 어조 없음.

## 6. Must-fix vs nit
| # | 분류 | 항목 | 상태 |
|---|------|------|------|
| 1 | must-fix | 구현자 공개 비판(#262, #264) 미반영 | 반영 완료 |
| 2 | must-fix | 잘못된 인용 표기 1건 | 수정 완료 |
| 3 | nit | resources 표기 이력(스펙 수정 정황)은 커밋 이력 미추적 | '정황' 표현으로 한정 |

must-fix 잔여: **0건.**
