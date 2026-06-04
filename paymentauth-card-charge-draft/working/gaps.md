# Gaps

2회 게더 후 상태 (대상 드래프트 정독 + MPP 카드 문서 + EMVCo/Visa/토큰화 1차 + 독립 해설).

## 과제 성격
- "특정 문서(draft-card-charge-00) 정독·분석"이 과업. 문서 *내용* 클레임(c02·c05~c09·c11~c15)은 그 문서(s01)를 1차 출처로 함 — PROTOCOL §2.3 기술 클레임 충족. "문서가 규정한다 ≠ 안전·채택됨"을 Limitations에 명시.

## 교차 출처가 된 항목
- 카드 메서드 동작(c03·c04): 문서(s01) + MPP 카드 문서(s02).
- 네트워크 토큰화 기반(c10): EMVCo(s03) + Boston Fed(s06) — 본 드래프트 외부 1차 자료로 교차.
- Visa TAP/Intelligent Commerce(c16): 문서 참조(s01) + Visa Developer(s04) + Visa 뉴스(s05).
- evm-charge 대비(c17): 두 드래프트 + 멀티레일 해설(s07, s08).

## 상충/주의
- 'card' 메서드(이 Visa 드래프트, 네트워크 토큰) vs 'stripe' 메서드(Stripe 프로세서)는 MPP 내 **별개 결제수단**이다 — 혼동 주의. 본문에서 구분. (s01, s02, s07)
- 문서 상태가 **Informational**(베이스 스킴의 Standards Track 의도와 다름) — 본문에서 명시.

## 미충족
- 없음(차단 수준).

## 오픈 퀘스천 (Limitations로)
- 3DS/SCA·환불은 드래프트 범위 밖(미규정) — 한계로 이관.
- 실제 구현·상호운용·배포 사례는 미확인(신규 v00).
- IETF datatracker 등재 여부는 확인하지 못함 — paymentauth.org 배포본 기준으로 분석.

## 종합
must-fix 갭 없음. card/stripe 구분·Informational·미규정(3DS/환불)·단일 저자 이해관계를 본문/Limitations로.
