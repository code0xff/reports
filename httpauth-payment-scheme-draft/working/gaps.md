# Gaps

2회 게더 후 상태 (대상 드래프트 정독 + IETF datatracker + 생태계 해설/문서).

## 과제 성격
- "특정 문서(draft-httpauth-payment-00) 정독·분석"이 과업. 문서 *내용* 클레임(c02·c03·c05~c13)은 그 문서(s01)를 1차 출처로 함 — PROTOCOL §2.3 기술 클레임 충족. "문서가 규정한다" ≠ "안전·채택됨"을 Limitations에 명시.

## 교차 출처가 된 항목
- 402/401 차이·x402 호환(c04·c17): 독립 비교(s06, s07/s05).
- IETF 지위(c14): datatracker(s02) + 문서 의도(s01) — 대비를 본문에서 명시.
- 생태계·채택(c16): 해설(s05) + Cloudflare/Stripe 문서(s04, s07).

## 상충 (병기, 해소하지 않음)
- **버전·일자 불일치**: datatracker `draft-ryan-httpauth-payment-01`(2026-03-17 갱신·2026-09-19 만료) vs paymentauth.org `draft-httpauth-payment-00`(2026-06-03자·2026-12-05 만료). 또 MPP 해설은 "draft-httpauth-payment-00, 2026-03-30 공개"로 언급 — 명명·날짜 체계가 둘(개인 draft-ryan-… vs 사이트 draft-httpauth-…)로 갈림. 본문/uncertainties에 그대로 병기.
- **지위**: 본문 'Standards Track' 의도 vs datatracker '미채택·IETF 미보증·공식지위 없음'. 대비로 제시.

## 미충족
- 없음(차단 수준).

## 오픈 퀘스천 (Limitations로)
- 두 명명(draft-ryan-httpauth-payment vs draft-httpauth-payment)이 완전 동일 문서인지(사이트 재배포본 vs IETF 제출본) 확정 못함 — 동일 계열로 보되 단정 안 함.
- 실제 상호운용 테스트 스위트·레퍼런스 구현 성숙도 미확인.

## 종합
must-fix 갭 없음. 버전/지위 불일치는 병기, 단일-문서 의존·미채택은 Limitations로.
