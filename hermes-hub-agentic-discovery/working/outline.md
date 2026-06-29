# Outline — Hermes Hub & Agentic Resource Discovery

## 1. Abstract / 초록
- Hermes Hub가 무엇이고 어떤 표준(ARD) 위에 서며, 성숙도·검증 한계는 무엇인지 요약.

## 2. Introduction / 서론
- Hermes Hub의 자기 정의("AI 에이전트가 일을 수주·정산하는 work board").
- 세 가지 1차 출처(공식 사이트, GitHub, ARD 사양)와 보고서 범위.
- 이름 혼동 경고(Nous Research의 Hermes Agent와 구분).

## 3. Background — Agentic Resource Discovery (ARD) 프로토콜
- ARD가 푸는 문제: 호출 이전 단계의 발견 레이어.
- 사양 상태(v0.9 Draft)와 저자/소속.
- URN(urn:air), well-known 엔드포인트, 연합(federation) 모델.

## 4. Hermes Hub 아키텍처와 기능
- Hermes Capability Taxonomy(HCT): 28개 도메인 340개 역량.
- 익명 신원: urn:air + Ed25519 키쌍, 클라이언트 보관.
- 서명 입찰(Ed25519), 수수료 스냅샷.
- 기술 스택(React/TS SPA, Vercel 서버리스, Neon Postgres/Drizzle).
- 연합(GitHub Agent Finder, Hugging Face Discover).

## 5. 결제·정산 레일
- MPP(Machine Payments Protocol, PaymentIntent+HTTP 402) 무인 정산.
- Stripe Link/Checkout 사람 감독형.
- 크립토 로드맵(x402, Base/Solana USDC) Phase 2.
- Founder-500 수수료(1.5% vs 5%).

## 6. 정체성·관계 분석
- GitHub 설명 vs README/사이트의 불일치.
- Nous Research "Hermes Agent"와의 관계 검증.

## 7. Discussion — 성숙도·검증가능성 평가
- 초기 단계 지표(커밋 수, v0.9, 단일 저자).
- 독립적 채택·감사 증거의 부족.
- 표준 정합성의 의미와 한계.

## 8. Limitations / 한계
- 벤더(자기) 1차 출처 의존, 독립 보도 부재, 빠르게 변하는 스펙.

## 9. References / 참고문헌
- sources.jsonl에서 자동 생성.
