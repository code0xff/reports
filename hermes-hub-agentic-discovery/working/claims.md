# Claims

> All claims checked off in gather iteration 1 (2026-06-29). See gaps.md for conflicts and uncertainties.md for shaky items.

## Introduction
- [x] c01: Hermes Hub는 AI 에이전트가 일을 발견·수주하고 대가를 받는 마켓플레이스("work board")로 스스로를 정의한다.
  - kind: factual
  - needs: 공식 사이트/저장소의 자기 기술
- [x] c02: Hermes Hub는 GitHub(amanning3390/hermeshub)에 오픈소스로 공개되어 있다.
  - kind: factual
  - needs: GitHub 저장소 + 검색 확인

## Background — ARD
- [x] c03: ARD(Agentic Resource Discovery)는 AI 아티팩트(에이전트, MCP 서버, 스킬 등)를 연합 네트워크에서 카탈로그·발견·검색하는 방식을 정의하는 사양이다.
  - kind: technical
  - needs: ARD 사양 1차 문서
- [x] c04: ARD는 2026년 5월 28일자 v0.9 Draft/Proposal 상태이며, 저자는 Google·Microsoft·Hugging Face 소속으로 표기된 Junjie Bu·R.V. Guha·Shaun Smith이다.
  - kind: factual
  - needs: ARD 사양 + 가능하면 독립 확인
- [x] c05: ARD는 호출(invocation) 이전 단계의 발견 레이어로, 실행 런타임이나 중앙집중 카탈로그가 아니다.
  - kind: technical
  - needs: ARD 사양 문구
- [x] c06: ARD는 `urn:air:<publisher>:<namespace>:<name>` URN과 `/.well-known/ai-catalog.json` well-known 엔드포인트를 사용하며 publisher는 검증 가능한 FQDN이어야 한다.
  - kind: technical
  - needs: ARD 사양 + HermesHub 카탈로그

## Hermes Hub 아키텍처
- [x] c07: Hermes Hub는 Hermes Capability Taxonomy(HCT)로 28개 도메인에 걸친 340개 기계판독 가능 역량을 선언하고 `/.well-known/ai-catalog.json`으로 노출한다.
  - kind: technical
  - needs: 저장소 README + 카탈로그 엔드포인트
- [x] c08: 입찰(bid)은 Ed25519로 서명되어 서버에서 검증되며, 수주(award) 시점에 플랫폼 수수료가 스냅샷되어 이후 수수료 변경이 소급 적용되지 않는다.
  - kind: technical
  - needs: README 문구
- [x] c09: 익명 가입 시 urn:air 식별자와 Ed25519 키쌍이 발급되고 개인키는 클라이언트 측에 보관된다.
  - kind: technical
  - needs: 저장소/제품 기술
- [x] c10: 기술 스택은 Vite+React+TypeScript SPA 프런트엔드와 Vercel 서버리스 함수 + Neon Postgres(Drizzle ORM, 16개 테이블) 백엔드로 구성된다.
  - kind: technical
  - needs: GitHub 저장소

## 결제·정산
- [x] c11: Hermes Hub는 무인 에이전트 간 정산을 위한 MPP(Machine Payments Protocol, PaymentIntent+HTTP 402)와 사람 감독형 Stripe Link/Checkout 흐름을 지원한다.
  - kind: technical
  - needs: README 문구
- [x] c12: 크립토 레일(x402, Base/Solana USDC 온체인 정산)은 로드맵상 Phase 2로 표기된다.
  - kind: technical
  - needs: README/사이트
- [x] c13: 최초 500명의 워커("Founder-500")는 표준 5% 대신 1.5% 평생 수수료를 적용받는다.
  - kind: factual
  - needs: 사이트/README

## 정체성·관계 분석
- [x] c14: GitHub 저장소 설명은 Hermes Hub를 "Nous Research의 Hermes Agent를 위한 Skills Hub"로 표기하지만, 제품 README와 사이트는 ARD work board로 기술하며 Nous Research를 언급하지 않는다.
  - kind: factual
  - needs: 저장소 메타 설명 vs README/사이트 (충돌 제시)
- [x] c15: Nous Research의 "Hermes Agent"는 별도의 오픈소스 자기개선 에이전트 프로젝트이며, Hermes Hub(amanning3390)와의 직접적 제품 연계 근거는 1차 제품 문서에서 확인되지 않는다.
  - kind: interpretive
  - needs: Nous Research 출처 + Hermes Hub 문서 비교

## Discussion
- [x] c16: Hermes Hub와 ARD는 모두 매우 초기 단계(저장소 수십 커밋 규모, 사양 v0.9 Draft)이며 독립적 제3자 감사·채택 증거가 제한적이다.
  - kind: interpretive
  - needs: 저장소 활동 지표 + 독립 출처 부재 확인
