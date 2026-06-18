# Outline — Behavior Control Techniques for AI Agent Payments / AI 에이전트 결제의 행동 통제 기법

주제: AI Agent Payments를 구현할 때 **"에이전트의 결제 행동을 어떻게 통제할 것인가"**라는
관점에서 도입 가능한 기술적 기법을 층위별로 정리한다. 통제 대상은 *무엇을 / 누구에게 /
얼마까지 / 언제 / 어떤 조건에서* 결제하는가이며, 이를 강제하는 메커니즘을 암호학·정책·
런타임·감사의 네 층으로 나눠 본다.

## 1. Abstract / 초록
- 본 보고서의 범위(결제 행동 통제 기법)와 핵심 결론 요약. (본문 작성 후 마지막에 기술)

## 2. Introduction — 문제 정의
- "에이전트 결제(agentic payment)"란 무엇이며 왜 통제가 어려운가(비결정성·프롬프트 인젝션·위임).
- 통제해야 할 행동 차원: 금액·머천트·카테고리·빈도·시간·승인 주체.
- 통제 기법을 네 층(암호/자격증명, 정책/한도, 런타임 가드레일+HITL, 검증/감사)으로 분류하는 프레임.

## 3. Background — 위협 모델과 통제 층위 taxonomy
- 에이전트 결제 파이프라인(사용자→에이전트→결제 자격증명→정산)과 각 단계 공격면.
- 신뢰 경계: 단일 키 = 단일 신뢰 모델의 한계, 위임/스코프의 필요성.
- 주요 위협: 프롬프트 인젝션 유발 무단 결제, 과다지출, 잘못된 머천트, 재현·재생 공격, 책임 귀속 실패.

## 4. Layer A — 암호학·자격증명 수준 제약 (cryptographic & credential constraints)
- 4.1 서명된 의도/위임(Mandate·Intent): Google AP2의 Intent/Cart/Payment Mandate, Visa TAP, Mastercard Agent Pay.
- 4.2 스코프된 위임·세션 키: ERC-7579 SmartSessions, EIP-7702, MetaMask Delegation Toolkit, ERC-4337.
- 4.3 온체인 결제 1회성·금액 한정 권한: x402(exact/upto), EIP-3009, Permit2.
- 4.4 토큰화·일회성 자격증명: 네트워크 토큰, Stripe ACP shared payment token(SPT).

## 5. Layer B — 정책·한도 엔진 (policy & spending-limit enforcement)
- 5.1 지출 한도(건당/일/월), 속도(velocity) 제한.
- 5.2 머천트 allowlist/denylist, 카테고리(MCC) 제약.
- 5.3 온체인 정책 모듈/검증기(policy validator)로의 강제 vs 오프체인 정책 엔진.
- 5.4 카드 네트워크 측 컨트롤(가맹점·금액·기간 제약을 발급 토큰에 바인딩).

## 6. Layer C — 런타임 가드레일과 휴먼 인 더 루프 (agent-side runtime controls & HITL)
- 6.1 LLM/에이전트 측 가드레일: 도구 호출 게이팅, 입력/출력 필터, 의도 확인.
- 6.2 프롬프트 인젝션 방어가 결제 통제의 전제(데이터=명령 아님) — OWASP LLM, 설계 패턴.
- 6.3 휴먼 인 더 루프 / step-up: 임계값 초과 시 사용자 승인, OOB 확인.
- 6.4 결정성 강화: 서명된 카트/의도를 LLM 출력과 분리하여 비결정성 격리.

## 7. Layer D — 검증·귀속·감사 (verification, attestation & audit)
- 7.1 검증가능 자격증명/신원: ERC-8004, DID/VC, 위임 체인 검증.
- 7.2 비부인(non-repudiation): 서명된 mandate 체인으로 책임 귀속(누가 무엇을 승인했나).
- 7.3 감사 로그·관측성: 결제 컨텍스트 기록, 이상탐지.

## 8. Analysis & Discussion — 기법 조합과 트레이드오프
- 심층 방어(defense-in-depth) 매핑: 각 위협을 어느 층이 막는가.
- 강제력 스펙트럼: 암호학적 강제(가장 강함) ↔ 정책 엔진 ↔ 가드레일(가장 약함, 우회 가능).
- 온체인 vs 카드네트워크 vs 모델사업자 스택에서의 통제 위치 차이.
- 표준 성숙도·상호운용성·UX 마찰의 트레이드오프.

## 9. Limitations
- 빠르게 변하는 표준(2026 시점 스냅샷), 벤더 발표 위주 자료, 일부 사양 초안 단계.

## 10. References — auto-generated from sources.jsonl
