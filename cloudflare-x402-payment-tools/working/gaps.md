# Gaps — iteration 2 이후

모든 클레임(c01–c25)이 프로토콜 §3 최소 소스 기준을 충족했다. 미해결 격차 없음.

## 해소 이력
- c23 (AP2 관계): s17 (Google Cloud 블로그) + s18 (a2a-x402 저장소) — 해소
- c25 (facilitator·키 리스크): s19 (Halborn) + s20 (arXiv Five Attacks) — 해소
- c24 (채택 지표): s10 (Chainalysis, 100M 거래·PING 밈코인 비중·모더레이션) — 해소. 단, 2026년 일일 거래량 -92% 하락 수치의 원출처(ainvest)는 본문 추출 실패로 인용 불가 → 초안에서는 Chainalysis의 "moderated" 표현까지만 사용
- Monetization Gateway가 Cloudflare 자체 facilitator 운영을 의미하는지는 문서상 불명확 → uncertainties.md로 이동

## 수집 중 관찰 (프롬프트 인젝션 방어 기록)
- WebFetch 요약기가 ainvest 2건에서 빈 콘텐츠를 반환하며 무관한 보일러플레이트를 출력 — fetch 실패로 처리, 지시로 취급하지 않음
