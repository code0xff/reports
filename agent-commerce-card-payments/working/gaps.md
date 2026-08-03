# Gaps — sweep 4 (2026-08-03)

## Resolved in sweeps 1–4

- 프로토콜 1차 사양: Visa TAP(s01/s02), ACP(s03/s04/s21), AP2(s05/s22), UCP(s14/s15),
  Mastercard Agent Pay/AP4M(s30/s17), Amex ACE(s28) 모두 1차 출처 확보.
- 운영 데이터: OpenAI Instant Checkout 중단(s08 + s11 독립 확인), Walmart 전환율 3배 저하(s11),
  Shopify AI 트래픽 8배·주문 13배(s34), DataDome 스푸핑 실측(s33), Darwinium 설문(s31),
  PayPal 가맹점 설문(s35).
- 책임/분쟁: Amex Agent Purchase Protection 약관 수준(s28/s10), Checkout.com 증거 요건(s26),
  PSD2/SCA 미해결 쟁점(s18), 한국 규제 장벽(s19).

## Conflicts to present in the draft (해결하지 말고 양측 제시)

1. **Shopify 가맹점 "라이브" 수**
   - A: Forrester 인용 애널리스트 — 2026년 2월 기준 Instant Checkout에 실제 라이브인
     Shopify 가맹점은 약 30곳(s11 맥락에서 확인된 CNBC 보도 요약).
   - B: 여러 2차 자료 — "100만 Shopify 가맹점이 에이전틱 커머스에 라이브".
   - 해석: B는 UCP/Agentic Storefronts 기반 *노출 가능* 범위, A는 ACP Instant Checkout에
     실제 결제까지 연결된 수. 층위가 다름 → 초안에서 구분해 제시.
   - 상태: CNBC 본문 WebFetch 403. Forrester(s11)가 동일 사실(2026-03 중단)을 독립 확인하므로
     "약 30곳" 수치는 단일 출처 표기 필요.

2. **ACP 수수료율**
   - A: Sam Altman 초기 발언 "약 2%".
   - B: 2026년 1월 Shopify 온보딩 시점 보도 "4%"(s23).
   - 상태: OpenAI 공식 페이지 403으로 1차 확인 실패 → 초안에서 "보도 기준, 공식 미공개"로 표기.

3. **에이전틱 커머스 성숙도**
   - A: Forrester — 5단계 중 1~2단계, "너무 일찍 과대평가됨"(s11).
   - B: Shopify 실적 — AI 유입 8배, 주문 13배(s34); Alipay 주간 1.2억 건(s11).
   - 해석: 채널로서의 "AI 유입"과 "에이전트 자율 결제"는 다른 지표. 초안에서 명시적으로 분리.

## Remaining gaps (수용하고 Limitations로 이관)

- **승인율(authorization rate) 실측치 부재**: 에이전트 거래의 발급사 승인율을 공개한
  1차 데이터를 찾지 못함. PYMNTS(s12)는 메커니즘만 서술하고 수치 없음.
  → Limitations에 명시.
- **분쟁 코드(chargeback reason code) 신설 여부**: Visa/Mastercard가 에이전트 거래 전용
  reason code를 신설했는지 공개 문서에서 확인 불가. Amex만 별도 보상 프로그램(s28) 공개.
  → "공개 문서상 확정되지 않음"이 곧 발견 사항이므로 그대로 서술.
- **Mastercard Agentic Token의 필드 수준 사양**: 공개 개발자 문서 미확인(보도자료 수준).
  Visa TAP·ACP·AP2와 달리 공개 스펙 저장소가 없음 → 비교표에서 "비공개"로 표기.
- **한국 카드사/PG 실제 대응**: NHN KCP의 AP2 파트너 참여는 2차 출처(PortOne 블로그)뿐.
  국내 카드사 공식 발표 미확인 → 초안에서 약하게 표기하거나 생략.
- **DataDome 수치의 독립 검증**: 벤더 자체 측정. 동일 현상에 대한 제3자 측정 미확보.
  → 벤더 측정임을 명시.
- **UCP/ACP 수수료 비교 수치(3.2% vs 7.2%)**: 2차 블로그만 근거. 초안 미사용.

## Iteration count

4 gather sweeps used of 6. 남은 갭은 구조적으로(비공개 규정·미공개 수수료) 획득 불가에
가까우므로 추가 스윕 대신 Limitations 이관.
