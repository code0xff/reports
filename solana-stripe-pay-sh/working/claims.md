# Claims: solana-stripe-pay-sh

## Introduction
- [x] c01: pay.sh는 Solana Foundation이 Stripe가 아닌 Google Cloud와 공동으로 개발·출시한 서비스다.
  - kind: factual
  - needs: 공식 발표 자료(solana.com), The Block, crypto.news 등 2개 이상 독립 소스
- [x] c02: Stripe는 pay.sh를 직접 공동 개발하지 않았으나, Stripe가 공동 저작한 MPP(Machine Payments Protocol)를 pay.sh가 지원함으로써 간접적으로 연관된다.
  - kind: factual
  - needs: Stripe 공식 블로그(MPP 발표), pay.sh 기술 문서에서 MPP 지원 확인

## Background: AI 에이전트 결제 인프라의 부상
- [x] c03: HTTP 402 Payment Required 상태 코드는 1990년대 초 정의되었으나 2025–2026년에 이르러 AI 에이전트 결제 표준으로 본격 활용되기 시작했다.
  - kind: factual
  - needs: RFC 또는 HTTP 표준 문서, x402/MPP 발표 자료
- [x] c04: 기존 API 결제 방식(구독, API 키, 계정 생성)은 자율 AI 에이전트의 즉각적 pay-per-use 요구를 충족하지 못한다는 것이 x402, MPP 등 신규 프로토콜의 공통된 문제 인식이다.
  - kind: interpretive
  - needs: x402.org, MPP 발표 자료, pay.sh 공식 문서 중 1건 이상
- [x] c05: 2026년 현재 AI 에이전트 결제 시장에는 x402(Coinbase → Linux Foundation), MPP(Tempo + Stripe), Google 자체 결제 방안 등 복수의 경쟁 프로토콜이 공존한다.
  - kind: factual
  - needs: 각 프로토콜 공식 소스 또는 이를 비교한 신뢰 가능한 기술 미디어

## pay.sh: 개요, 출시 배경 및 비즈니스 모델
- [x] c06: pay.sh는 2026년 5월에 공개 출시되었다.
  - kind: factual
  - needs: solana.com 공식 발표 또는 2개 이상 뉴스 소스
- [x] c07: pay.sh는 GCP(Google Cloud Platform) 위에 구축된 API 프록시로, 에이전트가 Solana 지갑만으로 인증·결제·접근을 완결한다.
  - kind: technical
  - needs: pay.sh 공식 문서 또는 solana.com 발표
- [x] c08: pay.sh의 API 요금은 건당 무료에서 최대 $10.00까지이며, 서비스에 따라 $0.001 수준의 마이크로결제도 지원한다.
  - kind: factual
  - needs: pay.sh 공식 웹사이트의 요금 정보
- [x] c09: 출시 시점 기준 pay.sh 마켓플레이스에는 72개 이상의 API 공급자가 등록되어 있다.
  - kind: factual
  - needs: pay.sh 공식 웹사이트 또는 발표 자료

## 기술 아키텍처 및 GitHub 코드 분석
- [x] c10: solana-foundation/pay GitHub 저장소의 주요 언어는 Rust(83.9%)이며, TypeScript(13.5%)가 보조한다.
  - kind: technical
  - needs: GitHub 저장소 언어 통계 (1차 소스)
- [x] c11: pay CLI는 curl, claude, codex 등 기존 CLI 도구를 래핑하여 HTTP 402 응답을 자동 감지하고 스테이블코인 서명 후 재요청하는 방식으로 동작한다.
  - kind: technical
  - needs: README 또는 공식 문서
- [x] c12: pay CLI에는 MCP(Model Context Protocol) 서버가 내장되어 Claude Code, Codex 등 AI 어시스턴트가 로컬 지갑 승인 흐름을 통해 유료 API를 호출할 수 있다.
  - kind: technical
  - needs: README 또는 공식 문서
- [x] c13: pay CLI는 macOS Touch ID, Windows Hello, Linux GNOME Keyring 등 플랫폼 생체인증을 통해 AI 에이전트가 개인 키에 직접 접근하지 못하도록 차단한다.
  - kind: technical
  - needs: README 또는 공식 문서
- [x] c14: solana-foundation/mpp-sdk는 TypeScript, Rust, Go, Python, Lua 등 다중 언어로 MPP의 Solana 결제 방식을 구현한 독립 SDK다.
  - kind: technical
  - needs: GitHub 저장소 (solana-foundation/mpp-sdk)

## 핵심 프로토콜: x402와 MPP
- [x] c15: x402는 Coinbase가 개발한 오픈 표준으로, 2026년 4월 Linux Foundation 산하 x402 Foundation으로 이관되었으며 Solana Foundation도 창립 멤버다.
  - kind: factual
  - needs: thedefiant.io 또는 theblock.co 등 2개 이상 독립 소스
- [x] c16: MPP(Machine Payments Protocol)는 Tempo와 Stripe가 공동 저작한 오픈 표준으로, 2026년 3월 18일 공식 발표되었으며 IETF 드래프트(draft-httpauth-payment-00)로 제출되었다.
  - kind: factual
  - needs: Stripe 공식 블로그 + Fortune/PYMNTS 등 독립 소스
- [x] c17: MPP는 스테이블코인(Tempo), 신용카드(Stripe), 비트코인(Lightning), Solana SPL 토큰, Stellar 등 다양한 결제 수단을 단일 HTTP 협상 흐름으로 지원한다.
  - kind: technical
  - needs: mpp.dev 또는 Stripe MPP 문서
- [x] c18: pay.sh는 x402와 MPP 두 프로토콜을 모두 지원하며, 이를 통해 Coinbase/Linux Foundation 생태계와 Stripe/Tempo 생태계 모두에 연결된다.
  - kind: technical
  - needs: pay.sh 공식 문서 또는 README

## 생태계 및 파트너십
- [x] c19: Google Cloud는 pay.sh를 통해 Gemini, BigQuery, Vertex AI, Cloud Run, BigTable 등 자사 공식 API를 스테이블코인 pay-per-request 방식으로 제공한다.
  - kind: factual
  - needs: solana.com 발표 또는 pay.sh 공식 문서
- [x] c20: x402 Foundation의 창립 멤버에는 Google, AWS, Microsoft, Stripe, Visa, Mastercard, Solana Foundation, Shopify, Circle 등 주요 기술·결제 기업이 포함된다.
  - kind: factual
  - needs: thedefiant.io 또는 theblock.co 발표 기사
- [x] c21: pay.sh는 AI 클라이언트로 Claude Code, Gemini, Codex, Openclaw, Hermes 등을 공식 지원한다.
  - kind: technical
  - needs: pay.sh 공식 문서 또는 GitHub README

## 한계 및 불확실성
- [x] c22: pay.sh는 Google Cloud 인프라에 크게 의존하므로, GCP 장애나 정책 변경이 전체 서비스 가용성에 직접 영향을 미칠 수 있다.
  - kind: interpretive
  - needs: 아키텍처 설명 1건 이상
- [x] c23: x402와 MPP는 기술적으로 유사하지만 서로 다른 재단·기업이 주도하는 별개의 표준이므로, 생태계 파편화 위험이 존재한다.
  - kind: interpretive
  - needs: 두 프로토콜을 비교한 소스 1건 이상
