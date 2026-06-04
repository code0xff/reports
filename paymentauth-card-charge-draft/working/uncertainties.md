# Uncertainties

게재 가능하나 흔들릴 수 있는 사항.

1. **v00·Informational·미채택.** draft-card-charge-00은 2026-06-03자 초판이며 상태가 Informational이다(베이스 "Payment" 스킴의 Standards Track 의도와 다름). 필드·절차는 개정에서 바뀔 수 있고, "문서가 규정한다"가 "표준·안전·채택됨"을 뜻하지 않는다. (s01)

2. **단일-문서 의존.** 문서 내용 클레임은 그 문서(s01)가 유일 1차 출처다. 네트워크 토큰화 기반(EMVCo/Boston Fed)과 카드 메서드 동작(MPP 문서)·Visa 맥락은 외부 1차/뉴스로 교차했으나, 본 드래프트의 세부 스키마는 단일-문서 기반이다.

3. **'card' vs 'stripe' 혼동.** MPP에는 'card'(이 Visa 네트워크-토큰 드래프트)와 'stripe'(Stripe 프로세서) 메서드가 별도로 존재한다. "MPP의 카드 결제"라는 일반 진술이 둘을 뭉뚱그릴 수 있어 본문은 이 드래프트=네트워크 토큰 방식으로 한정한다. (s01, s02, s07)

4. **3DS/SCA·환불 미규정.** 문서는 cryptogram이 카드망에 따라 인증요건을 충족할 수 있다고만 언급하고 3DS/SCA·환불을 규범적으로 정의하지 않는다 — 가역성은 카드망 차지백 규칙에 맡긴다. 실제 SCA 준수는 구현·관할에 의존한다. (s01)

5. **단일 저자·이해관계.** 저자가 Visa(J. Brans) 1인이며, 참조 토큰 출처([VISA-INTELLIGENT-COMMERCE])·식별 보증([VISA-TAP])이 Visa 제품이다. 스펙은 PSP/TSP 불가지를 표방하나 저자·예시가 Visa 중심이라는 독립성 유의점이 있다. (s01, s04)

6. **채택·구현 성숙도.** Visa Intelligent Commerce Connect가 MPP를 수용한다는 신호(s05)는 있으나, 본 card-charge 드래프트의 광범위 프로덕션 구현·상호운용은 본 보고서 범위에서 확정하지 않는다.
