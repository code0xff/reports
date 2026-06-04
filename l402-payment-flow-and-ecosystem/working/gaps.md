# Gaps

3회 게더 후 상태 (Lightning Labs 1차 + 라이브러리 리포 + Fewsats + 중립 랜드스케이프 + 비교).

## 미충족 클레임
- 없음(차단 수준). 17개 클레임 모두 ≥1개 적격 출처. 기술/구현 클레임은 1차(스펙·리포)로 직접 확인.

## 상충/스냅샷 차이 (병기/표기)
- **Fewsats offer의 payment_methods 값**: l402-python 예시는 `['onchain']`(USDC/Base), Sherlock 문서는 `['credit_card','lightning']`. → 동일 'offer' 추상화의 서로 다른 스냅샷/제품으로 병기. Fewsats가 카드·라이트닝·온체인(x402)을 *병행* 지원한다는 결론은 두 출처가 함께 뒷받침. (s09, s10)
- **"L402가 타 체인을 지원하는가"**: 프로토콜 수준=아니오(s12, s07, s11) vs 애그리게이터 수준=Fewsats가 x402 플로우 병행(s10). 본문에서 "프로토콜 vs 생태계" 층위를 명확히 구분.

## 1차 자료 접근 이슈
- `lightninglabs/L402/blob/master/introduction.md`가 404(경로/브랜치 변경) → 스펙은 docs 사이트(s02)와 리포 랜딩(s04)으로 대체 확인.
- 2020 LSAT 포스트(s03) 원문 직접 인용은 요약 기반(원 포스트는 접근). 핵심(2020 발표·LSAT→L402 개명)은 다중 출처로 교차.

## 오픈 퀘스천 (Limitations로)
- Boltwall/lsat-js는 Tierion이 유지하나 최근 활성도/유지보수 상태는 미확인.
- Fewsats가 x402를 "L402의 일부"로 보는지, "병행 별도 프로토콜"로 보는지 — 문서상 후자(별도 mechanism)로 읽힘.

## 종합
must-fix 게더 갭 없음. 스냅샷 차이는 층위 구분·병기로 처리, 404/유지보수/표준화 진행형은 Limitations로 이관.
