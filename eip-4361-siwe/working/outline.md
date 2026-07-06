# Outline — EIP-4361 (Sign-In with Ethereum) 심층 분석

1. **초록 (Abstract)** — 본문 완성 후 작성.
2. **서론 (Introduction)** — 중앙화 신원 제공자(OAuth 소셜 로그인)에 대한 자기 주권적 대안이라는 문제의식, 표준의 위치, 리서치 범위.
3. **배경과 표준화 이력** — 지갑 서명 로그인의 관행(표준화 이전), EF/ENS의 지원과 Spruce 선정, 2021 제안 → Final 도달, 저자 구성.
4. **메시지 형식과 프로토콜 분석** — ABNF 문법, 필수·선택 필드(domain/address/statement/uri/version/chain-id/nonce/issued-at/expiration-time/not-before/request-id/resources), EIP-191 personal_sign 서명, ERC-1271 컨트랙트 검증, EIP-55 주소 표기, 검증 절차와 세션 수립.
5. **보안 요구사항과 알려진 위험** — 도메인 바인딩과 피싱 방어(지갑 측 MUST), 논스·리플레이, 세션-주소 바인딩, ERC-1271 크로스 계정 리플레이 실사례, 프라이버시(주소 노출) 고려.
6. **생태계와 채택 현황** — 참조 라이브러리(siwe TS/Rust/Go/Python), 지갑·서비스 채택(Coinbase 등), OIDC 브리지(SIWE OIDC), EIP-4361 이후 파생 표준(CAIP-122, SIWS, x402 SIWX 등).
7. **논의 (Discussion)** — Web2 인증(OAuth/OIDC/패스키)과의 비교, 자기 주권 서사의 실제 한계(키 관리 집중, 계정 복구 부재), 학술 평가.
8. **한계 (Limitations)**
9. **References** — 자동 생성.
