# Critique — eip-4361-siwe (verification pass, 2026-07-06)

## 1. Unsupported claims
- 전 팩트 문장 [^sNN] 인용 보유. "발주된 표준이라는 점에서 이례적" 등 해석 문장은 해석임이 드러나는 서술로 유지.

## 2. Citation integrity
- 참조 집합 {s01..s18}(개정 후 s19 추가) = sources.jsonl 정합. 전 소스 accessed=2026-07-06.
- URL 체크: s04(Cointelegraph) 404 → **EF/ENS RFP 원문(notes.ethereum.org, 더 나은 1차 사료)으로 교체 완료**. s10(rainbowkit.com) 402/npm 403 봇 차단 → access_limited 플래그. s15(ACM) 403 → 기존 access_limited 유지. 나머지 200.
- 인용 스팟 체크: s01 EIP-4361 규범 문구(fetch 원문), s05 "not yet undergone a formal security audit"(fetch 원문), s04 RFP "decentralized, open, non-proprietary"(fetch 원문) 확인.

## 3. Reasoning gaps
- "사실상 원형이 됐다" — CAIP-122·SIWS·x402 3건의 명시적 자기 서술로 지지(s12, s13, s14). 통과.
- ERC-1271 리플레이를 "SIWE가 정확히 이 형태로 당하지는 않지만"으로 한정 — 과잉 일반화 방지 처리됨. 통과.

## 4. Missing counter-evidence — **must-fix (1건)**
- **[must-fix] 자기 주권 모델 자체에 대한 커뮤니티 회의론 미반영.** HN 공개 토론(2021): 크리덴셜 분실의 비가역성("the last thing home users want"), 기업 SSO의 정책 통제(온·오프보딩) 관점에서 "전역 분산 인증 패브릭은 반기능"이라는 비판(s19, tier-5 소스이므로 '커뮤니티 논의'로 귀속 표기). → **논의 섹션에 반영 완료.**

## 5. Tone and structure
- Abstract 본문 정합. Limitations는 gaps.md 반영. 이모지·마케팅 어조 없음.

## 6. Must-fix vs nit
| # | 분류 | 항목 | 상태 |
|---|------|------|------|
| 1 | must-fix | 커뮤니티 회의론(HN) 미반영 | 반영 완료 |
| 2 | must-fix | s04 데드링크 | RFP 원문으로 교체 완료 |
| 3 | nit | s10/s15 봇 차단 | access_limited 플래그로 수용 |
| 4 | nit | s19가 tier-5 | '커뮤니티 논의' 귀속 서술로 한정 사용 |

must-fix 잔여: **0건.**
