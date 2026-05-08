# Outline: Solana Foundation과 pay.sh — 공식 사이트 및 GitHub 코드 기반 상세 분석

## 1. Abstract (초록)
pay.sh의 핵심 개요, 실제 공동 개발 파트너(Google Cloud), Stripe의 간접 연관(MPP), 기술 아키텍처 요약.

## 2. Introduction (소개)
- AI 에이전트 경제의 부상과 결제 인프라 필요성
- 사용자 전제 명확화: pay.sh는 Solana Foundation + Google Cloud 협업 (Stripe는 MPP를 통한 간접 참여)
- 연구 범위: 공식 웹사이트(pay.sh), Solana 공식 블로그, GitHub 공개 코드

## 3. Background: AI 에이전트 결제 인프라의 부상
- HTTP 402 Payment Required의 역사와 부활
- 기존 API 결제 방식의 한계 (구독, API 키, 계정 필수)
- 2025–2026년 AI 에이전트 결제 프로토콜 경쟁: x402 vs MPP vs 기타

## 4. pay.sh: 개요, 출시 배경 및 비즈니스 모델
- 2026년 5월 출시, Solana Foundation + Google Cloud 공동 발표
- 핵심 가치 제안: "결제가 곧 인증(The payment is the credential)"
- pay-per-request 모델, 요금 체계(fractions of a cent ~ $10.00/call)
- 72개 이상 공급자, Google Cloud 공식 API 및 커뮤니티 API 50+

## 5. 기술 아키텍처 및 GitHub 코드 분석
- GCP 기반 API 프록시 아키텍처
- solana-foundation/pay 저장소: Rust(83.9%) + TypeScript(13.5%) CLI 도구
- solana-foundation/mpp-sdk 저장소: 다중 언어 SDK (TypeScript, Rust, Go, Python, Lua)
- MCP(Model Context Protocol) 서버 내장, 생체인증 기반 지갑 승인
- Payment Debugger: 로컬 웹 UI, 402 challenge-response 시각화

## 6. 핵심 프로토콜: x402와 MPP
- x402: Coinbase 개발 → 2026년 4월 Linux Foundation 이관, Solana Foundation 창립 멤버
- MPP(Machine Payments Protocol): Tempo + Stripe 공동 개발, IETF 드래프트(draft-httpauth-payment-00, 2026년 3월)
- 두 프로토콜의 기술적 차이 및 보완 관계
- Stripe의 역할: MPP 공동 저작자, pay.sh는 MPP를 지원함으로써 Stripe 생태계와 간접 연결

## 7. 생태계 및 파트너십
- Google Cloud 공식 파트너십 및 제공 API (Gemini, BigQuery, Vertex AI 등)
- 런치 파트너: PayAI, Crossmint, Merit Systems, Moonpay 등
- x402 재단 멤버: Google, AWS, Stripe, Coinbase, Visa, Mastercard, Solana Foundation 등
- AI 클라이언트 지원: Claude Code, Gemini, Codex, Openclaw, Hermes

## 8. 한계 및 불확실성 (Limitations & Discussion)
- 초기 생태계: 중앙화 리스크 (Google Cloud 의존도)
- 규제 및 컴플라이언스 불확실성
- 스테이블코인 결제의 변동성 및 온램프 마찰
- Stripe의 직접 참여 부재 — MPP를 통한 간접 연관의 한계
- 경쟁 프로토콜과의 파편화 위험
