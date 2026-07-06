# Claims — eip-4361-siwe

## 서론 (Introduction)
- [x] c01: EIP-4361은 이더리움 계정으로 오프체인 서비스에 인증하는 표준 메시지 형식을 정의하며, 중앙화 신원 제공자에 대한 자기 주권적 대안을 표방한다.
  - kind: factual
  - needs: EIP 원문의 abstract/motivation
- [x] c02: EIP-4361은 Standards Track ERC로 Final 상태에 도달했다.
  - kind: factual
  - needs: eips.ethereum.org 상태 표기

## 배경과 표준화 이력
- [x] c03: 표준화 이전에도 dApp들은 임의 형식의 personal_sign 메시지로 지갑 로그인들을 구현하고 있었고, EIP-4361은 이 관행을 표준화한 것이다.
  - kind: interpretive
  - needs: 제안 배경 서술/커뮤니티 문서
- [x] c04: Sign-In with Ethereum 작업은 Ethereum Foundation과 ENS의 공동 RFP로 시작됐고 Spruce가 수행자로 선정됐다.
  - kind: factual
  - needs: EF/ENS/Spruce 측 발표 2건
- [x] c05: EIP-4361은 2021-10-11 생성됐고 저자는 Wayne Chang, Gregory Rocco, Brantly Millegan, Nick Johnson, Oliver Terbu다.
  - kind: factual
  - needs: EIP 원문 메타데이터

## 메시지 형식과 프로토콜 분석
- [x] c06: SIWE 메시지는 ABNF로 정의된 구조화 평문으로, domain·address·uri·version·chain-id·nonce·issued-at이 필수이고 statement·expiration-time·not-before·request-id·resources가 선택이다.
  - kind: technical
  - needs: EIP 원문 ABNF
- [x] c07: EOA 서명은 EIP-191 personal_sign(버전 0x45) 검증을 MUST로, 컨트랙트 지갑은 ERC-1271 검증을 SHOULD로 규정한다.
  - kind: technical
  - needs: EIP 원문
- [x] c08: address 필드는 EIP-55 체크섬 표기를 MUST로 요구한다.
  - kind: technical
  - needs: EIP 원문
- [x] c09: 메시지의 첫 줄은 "${domain} wants you to sign in with your Ethereum account:" 형식이며, 지갑은 이 구조를 파싱해 사용자에게 표시할 수 있다.
  - kind: technical
  - needs: EIP 원문/참조 구현
- [x] c10: nonce는 최소 8자의 영숫자여야 하며 리플레이 방지를 위해 RP가 세션마다 생성한다.
  - kind: technical
  - needs: EIP 원문 ABNF의 nonce 규칙
- [x] c11: 검증 절차는 메시지 파싱 → 필드 검증(도메인, 시간 경계, 논스) → 서명 검증(ecrecover 또는 isValidSignature) → 세션 수립 순이다.
  - kind: technical
  - needs: EIP/참조 구현 문서

## 보안 요구사항과 알려진 위험
- [x] c12: 지갑 구현자는 요청 출처를 scheme·domain 필드와 대조해 피싱을 방지해야 한다(MUST)고 스펙이 규정한다.
  - kind: technical
  - needs: EIP 보안 섹션
- [x] c13: 세션은 주소에 바인딩되어야 하며(MUST), 변할 수 있는 해석 리소스(ENS 이름 등)에 바인딩하면 안 된다.
  - kind: technical
  - needs: EIP 보안 섹션
- [x] c14: ERC-1271 경로에는 동일 소유자의 복수 스마트 계정 간 서명 리플레이 실사례(2023)가 존재하며, 서명 대상에 계정 컨텍스트를 포함하지 않은 애플리케이션들이 영향을 받았다.
  - kind: factual
  - needs: 보안 연구/공개 보고 1건 이상 + 스펙 대조
- [x] c15: SIWE 로그인은 지갑 주소를 서비스에 노출하므로 온체인 활동과의 연결성(프라이버시) 문제가 지적된다.
  - kind: interpretive
  - needs: 분석 글/논문 1건
- [x] c16: 지갑 UI가 SIWE 메시지를 구조화 표시하지 않으면 사용자가 도메인 불일치를 알아채기 어렵다는 지적이 있다(블라인드 서명 문제).
  - kind: interpretive
  - needs: 보안 분석/지갑 문서

## 생태계와 채택 현황
- [x] c17: SpruceID가 TypeScript·Rust 등 참조 라이브러리(siwe)를 공개 유지하며, 주요 지갑 연결 SDK(wagmi/RainbowKit/NextAuth 등)에 통합됐다.
  - kind: factual
  - needs: GitHub 저장소 + 프레임워크 문서
- [x] c18: SIWE를 OpenID Connect로 브리지하는 siwe-oidc 게이트웨이가 존재해 기존 OIDC 클라이언트가 SIWE를 쓸 수 있다.
  - kind: technical
  - needs: siwe-oidc 저장소/문서
- [x] c19: EIP-4361은 CAIP-122(체인 불가지론), SIWS(Solana), x402 SIWX 등 파생 표준의 모델이 됐다.
  - kind: factual
  - needs: 각 파생 표준의 원문 참조
- [x] c20: 대형 서비스(Coinbase 등)와 dApp 생태계 전반이 SIWE 형식을 로그인에 채택했다.
  - kind: factual
  - needs: 서비스 문서/보도 2건

## 논의 (Discussion)
- [x] c21: OAuth/OIDC 대비 SIWE는 IdP 불요·검열 회피가 장점이나, 계정 복구·키 순환·동의 관리 등 IdP가 제공하던 기능이 부재하다.
  - kind: interpretive
  - needs: 비교 분석 소스/논문
- [x] c22: 학술 연구는 SIWE류 지갑 인증을 기존 인증 프로토콜과 브리지하거나 인증 요인 관점에서 분류하는 방향으로 진행되고 있다.
  - kind: interpretive
  - needs: 논문 1건 이상
- [x] c23: 패스키(WebAuthn)와 SIWE는 경쟁이 아니라 계층이 다르며(장치 인증 vs 온체인 계정 인증), 결합 시도가 존재한다.
  - kind: interpretive
  - needs: 기술 분석/구현 사례
