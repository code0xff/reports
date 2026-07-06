# Outline — x402 Sign-In with X (SIWX) 확장 분석

분석 대상: https://docs.x402.org/extensions/sign-in-with-x (x402 프로토콜 공식 문서의 SIWX 확장)

1. **초록 (Abstract)** — 본문 완성 후 작성.
2. **서론 (Introduction)** — x402 결제 프로토콜에서 "이미 결제한 클라이언트의 재접근"과 "결제 없는 지갑 인증" 문제, SIWX의 위치, 리서치 범위(메커니즘·구현·동작).
3. **배경: x402 확장 모델과 지갑 인증 표준 계보** — x402 프로토콜 개요(402 응답, facilitator), 확장(extension) 메커니즘, EIP-4361(SIWE) → CAIP-122(체인 불가지론적 일반화) → SIWS(Solana) 계보.
4. **SIWX 메커니즘 분석** — 402 챌린지의 sign-in-with-x 확장 파라미터, CAIP-122 메시지 구성(domain/uri/nonce/issuedAt/expirationTime/chainId 등), SIGN-IN-WITH-X 헤더(Base64 인코딩), 서명 스킴(eip191/eip1271/eip6492/ed25519), 서버 검증 파이프라인, facilitator 비관여.
5. **구현과 동작 (코드 수준)** — TypeScript/Go/Python 라이브러리의 API 표면(declareSIWxExtension, createSIWxResourceServerExtension, createSIWxClientExtension, 훅 어댑터), SIWxStorage 인터페이스(hasPaid/recordPayment/논스 추적), 실제 저장소 코드 검증, 동작 시나리오(결제 후 재접근, 인증 전용 라우트).
6. **보안 분석** — 리플레이 방지(논스·시간 경계), 도메인 바인딩과 피싱, 스마트 컨트랙트 지갑 검증의 RPC 의존성, SIWE 계열의 알려진 취약점·공격 사례와 SIWX 설계의 대응, 남은 위험.
7. **논의 (Discussion)** — 세션·인증 대안(API 키, JWT, 결제 영수증 재제시)과의 비교, x402 생태계에서의 채택 신호, 설계 트레이드오프.
8. **한계 (Limitations)** — 미확인 사항(스펙 변경 가능성, 채택 데이터 부족 등).
9. **References** — sources.jsonl에서 자동 생성.
