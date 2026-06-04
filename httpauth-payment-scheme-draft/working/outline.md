# Outline

1. **초록 (Abstract)** — 문서 정체(MPP 코어인 "Payment" HTTP 인증 스킴), 핵심(402+method/intent 레지스트리로 결제수단 불가지 표준화), 보안 모델(HMAC 챌린지 바인딩·단일사용·멱등성·TLS), IETF 지위(개인 드래프트·미채택)와 x402 호환.

2. **서론 (Introduction)** — 문서 메타데이터(제목·저자·상태·일자), 문제(예약만 되고 미정의였던 402에 의미 부여), 본 보고서 범위(정독 분석 + 생태계·지위 맥락).

3. **프로토콜 개요와 402의 위치 (Protocol overview)** — 요청 흐름, 상태코드, 401과의 차이(실패 크리덴셜에도 402 사용), 402를 언제 반환/미반환하는지.

4. **챌린지·크리덴셜·리시트 (Scheme mechanics)** — WWW-Authenticate: Payment 파라미터(id·realm·method·intent·request·expires·digest·description·opaque), Authorization: Payment {challenge·source·payload}, Payment-Receipt.

5. **method/intent 레지스트리와 협상 (Registry & negotiation)** — method(소문자)·intent(영숫자+하이픈) 식별자, Specification Required IANA 정책, 다중 챌린지, Accept-Payment q-가중 협상.

6. **보안 모델 (Security model)** — HMAC-SHA256 챌린지 바인딩(7-슬롯), 단일사용 재생방지, 멱등성·동시요청, 금액검증(description 비의존), TLS 필수, 크리덴셜 비로깅, no-store 캐싱.

7. **IETF 지위·생태계·x402 관계 (Standing & ecosystem)** — datatracker 개인 드래프트(미채택·IETF 미보증)와 본문 'Standards Track' 의도 간 긴장, 버전·일자 불일치, Tempo+Stripe 저자, 두 프로덕션 메서드(Tempo/Stripe), Cloudflare·Stripe 채택 신호, x402 하위호환(exact→charge).

8. **한계 (Limitations)** — v00·미채택, 단일-문서 의존, 버전/일자 불일치, 미구현 세부, 빠른 변동.

9. **참고문헌 (References)** — sources.jsonl 기반.
