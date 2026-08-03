# Claims

Status legend: `[ ]` unsourced, `[x]` sourcing threshold met (see PROTOCOL §3 Gather).
`~` = 부분 충족(초안에서 단일출처/벤더발언으로 표기).

## 서론 — 문제 정의와 범위

- [x] c01: "agentic commerce"와 "agent payments"는 서로 다른 계층을 가리킨다 — 전자는 발견·카트·
  체크아웃까지의 상거래 흐름(ACP/UCP), 후자는 자금 이동 승인·위임 계층(AP2/Agent Pay/VIC).
  - kind: interpretive → sources: s03, s05, s14, s30
- [x] c02: 카드 레일 기반 에이전트 결제 이니셔티브는 2025년 4월부터 2026년 6월 사이에 최소
  7개(Mastercard Agent Pay, Visa Intelligent Commerce, ACP, Visa TAP, UCP, Amex ACE, AP4M)가 공개됐다.
  - kind: factual → sources: s30(2025-04-29), s25(VIC 2025), s04/s21(2025-09-29), s01/s38(2025-10),
    s14/s15(2026-01-11), s28(2026-04-14), s17(2026-06-10)
- [x] c03: 2026년 8월 기준 이들 중 범용 상용 가동에 도달한 것은 일부이며, 다수가 파일럿·
  limited availability·early access 단계다.
  - kind: factual → sources: s07(pilot), s15(early access, 3개국), s21(Beta), s24(limited availability),
    s28(2개 컴포넌트 개발 중)

## 카드 레일과 에이전트 구매자: 구조적 충돌

- [x] c04: 카드 규칙은 거래를 CIT/MIT로 이분하며, MIT는 "최초 CIT에 후속하는" 거래로 정의된다.
  에이전트 거래는 이 이분법에 정확히 들어맞지 않아 각 프로그램이 별도 식별자를 도입했다.
  - kind: technical → sources: s27(정의), s01(agent-payer-auth tag), s28(Agent Registration ID)
- [x] c05: 에이전트 트래픽 식별이 프로토콜의 1차 관심사가 된 이유는 봇 방어와의 충돌이며,
  Visa TAP은 Cloudflare Web Bot Auth의 HTTP Message Signature를 확장해 이를 해결한다.
  - kind: technical → sources: s01, s13, s36
- [x] c06: EU에서 에이전트 결제는 PSD2/SCA의 예외 대상이 아니며, "무엇이 유효한 위임 승인인가"가
  미해결 쟁점으로 남아 있다.
  - kind: interpretive → sources: s18
- [x] c07: 미식별 자동화(봇) 경로는 실무상 지속 불가능하다 — 사이트의 80%가 에이전트 신원을
  검증하지 않는 현 상태 자체가 스푸핑 유인이 되고 있다.
  - kind: interpretive → sources: s33, s26

## 프로토콜 지형과 기술 메커니즘

- [x] c08: AP2 v0.2는 위임을 Checkout Mandate(가맹점 공유)와 Payment Mandate(발급사·네트워크 공유)로
  분리하고, 각각 open/closed 단계를 두어 서명된 Verifiable Digital Credential로 표현한다.
  (초기 문헌의 Intent/Cart Mandate 명명은 v0.2에서 대체됨)
  - kind: technical → sources: s05, s22
- [~] c09: Mastercard Agentic Token은 MDES 등 기존 토큰화 인프라를 확장해 에이전트·사용자·
  거래 조건을 바인딩한다.
  - kind: technical → sources: s30(1차, 다만 필드 수준 사양 비공개), s17
  - 미해결: 공개 개발자 스펙 부재 → 초안에서 "공개 사양 없음"으로 명시
- [x] c10: Visa TAP은 결제 승인이 아니라 가맹점의 에이전트 식별·검증 계층을 정의하며,
  RFC 9421 HTTP Message Signatures 기반이다.
  - kind: technical → sources: s01, s02
- [x] c11: ACP는 카드 네트워크 프로토콜이 아니라 에이전트-가맹점 체크아웃 API 규격이며,
  결제 수단은 Shared Payment Token / Delegate Payment로 범위 제한된 토큰을 넘긴다.
  - kind: technical → sources: s03, s04, s20, s21
- [x] c12: 이들은 대체재가 아니라 계층이 달라 한 거래에 둘 이상이 관여할 수 있다.
  Visa ICC는 TAP·MPP·ACP·UCP를 동시에 수용하고, Adyen은 UCP·AP2·ACP·Meta를 함께 지원한다.
  - kind: interpretive → sources: s07, s24, s14(UCP↔AP2 연계)
- [x] c13: 카드 레일과 x402는 최종성 설계가 반대다 — 카드는 분쟁·되돌림을 전제로,
  x402는 온체인 확정을 전제로 한다.
  - kind: interpretive → sources: s29, s37, s26

## 서비스·구현 현황

- [x] c14: Stripe는 ACP 기반 에이전트 체크아웃을 상용 제품(Agentic Commerce Suite)으로 제공하며
  Shared Payment Token을 문서화한다.
  - kind: technical → sources: s03, s20
- [x] c15: ChatGPT Instant Checkout은 2025년 9월 Etsy 한정으로 출시됐고, 2026년 3월 OpenAI가
  네이티브 체크아웃을 중단하고 리테일러 앱 방식으로 선회했다.
  - kind: factual → sources: s08, s11
- [x] c16: PSP 다수가 에이전트 결제를 발표했지만 공개 문서 수준의 성숙도는 크게 다르다
  (Stripe: 상용 문서 / Adyen: limited availability / Amex: 컴포넌트 일부 개발 중).
  - kind: factual → sources: s03, s24, s28
- [x] c17: 공개 레퍼런스 구현의 성숙도 차이가 뚜렷하다
  (ACP 1.5k★·78 issues·date-based 릴리스 / AP2 3.1k★·54 commits·PyPI 미배포 /
   TAP 192★·6 commits·데모 성격).
  - kind: technical → sources: s21, s22, s02

## 실사용 및 운영 관점 평가

- [x] c18: 에이전트 체크아웃 도입의 실질 비용은 결제 통합이 아니라 실시간 상품 데이터 정비이며,
  구현·적합성 테스트는 "주 단위가 아닌 월 단위"로 측정된다.
  - kind: technical → sources: s32, s14/s15(feed 요구사항), s34(카탈로그 품질과 전환율)
- [x] c19: 에이전트 거래는 별도 식별자/신호를 요구하며, 이를 누락하면 봇으로 차단되거나
  승인율이 떨어질 수 있다. 다만 승인율 실측치는 공개되지 않았다.
  - kind: technical → sources: s01, s27, s12
- [x] c20: 분쟁 책임 귀속 규칙의 명시 수준은 프로토콜마다 다르고, Amex를 제외하면
  공개 문서에서 확정되지 않았다. 가맹점의 2/3가 표준 책임 프레임워크가 시급하다고 답했다.
  - kind: factual → sources: s28, s35, s26, s18
- [x] c21: 프롬프트 인젝션은 실증된 공격 표면이며(대규모 공개 대회에서 8,648건 성공),
  서명된 mandate 구조는 "무엇을 승인했는가"를 증명할 뿐 "왜 그것을 승인했는가"를 방어하지 못한다.
  - kind: interpretive → sources: s16(측정), s05(mandate 설계), s31
  - 주의: s16은 결제 시나리오가 아닌 일반 에이전트 태스크 기준 → 초안에 명시
- [x] c22: 공개 채택 지표는 층위가 뒤섞여 있고 대부분 벤더 발표다
  (Visa "수백 건" / Shopify AI 유입 8배 / Alipay 주간 1.2억 건 / Instant Checkout 라이브 약 30곳).
  - kind: factual → sources: s25, s34, s11, s08
- [x] c23: 한국은 전자금융거래법의 접근매체 제3자 위임 제한과 금융실명법의 대리 규정 때문에
  해외 모델을 그대로 적용하기 어렵고, 규제 샌드박스가 현실적 경로로 제안됐다.
  - kind: interpretive → sources: s19

## 논의 — 채택 신호와 미해결 쟁점

- [x] c24: 네트워크와 플랫폼은 협력을 발표했지만 체크아웃 계층의 통제권을 두고 경쟁한다 —
  UCP·ACP는 모두 "가맹점이 seller/merchant of record"를 강조하고, Visa ICC는 그 위에
  프로토콜 중립 온램프를 놓는다.
  - kind: interpretive → sources: s14, s15, s07, s04
- [x] c25: 단일 프로토콜만 채택하면 특정 에이전트 유입 채널을 놓치므로 다중 대응이 기본값이 된다.
  - kind: interpretive → sources: s07, s24, s32
- [x] c26: 단기 실사용은 저위험·반복·데이터가 정리된 카테고리에 집중된다
  (Alipay 식음료, x402 마이크로페이먼트, 카탈로그 품질이 전환율을 2배 가름).
  - kind: interpretive → sources: s11, s29, s34
