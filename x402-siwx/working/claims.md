# Claims — x402-siwx

## 서론 (Introduction)
- [x] c01: SIWX는 x402 공식 문서에 등재된 확장으로, "이미 결제한 클라이언트의 재결제 없는 재접근"과 "결제 없는 지갑 인증 전용 라우트" 두 문제를 해결하기 위해 설계됐다.
  - kind: factual
  - needs: docs.x402.org SIWX 페이지 원문
- [x] c02: x402는 HTTP 402 상태 코드를 활용한 온체인 결제 프로토콜로 Coinbase가 주도해 공개했다.
  - kind: factual
  - needs: x402 공식 문서/저장소 + 독립 보도 1건

## 배경: x402 확장 모델과 지갑 인증 표준 계보
- [x] c03: x402는 코어 스펙과 별도로 extensions 메커니즘을 정의하며, SIWX는 그 확장 중 하나다.
  - kind: technical
  - needs: x402 스펙/저장소의 확장 정의
- [x] c04: CAIP-122는 EIP-4361(Sign-In with Ethereum)을 체인 불가지론적으로 일반화한 ChainAgnostic 표준이다.
  - kind: factual
  - needs: CAIP-122 스펙 원문 + EIP-4361 원문
- [x] c05: EIP-4361 SIWE 메시지는 domain, address, statement, uri, version, chain-id, nonce, issued-at 등의 필드를 갖는 구조화 평문이며 EIP-191 personal_sign으로 서명된다.
  - kind: technical
  - needs: EIP-4361 스펙 원문
- [x] c06: Sign-In-With-Solana(SIWS)는 SIWE와 유사한 필드 구조를 가지되 ed25519 서명을 사용하며 Phantom 등 지갑이 표준화했다.
  - kind: technical
  - needs: SIWS 스펙/저장소
- [x] c07: SIWX(x402 확장)와 WalletConnect/Reown AppKit의 "SIWX" 인터페이스는 같은 CAIP-122 기반이지만 별개의 구현물이다.
  - kind: interpretive
  - needs: Reown 문서와 x402 문서 대조

## SIWX 메커니즘 분석
- [x] c08: 서버는 402 응답의 extensions 안에 sign-in-with-x 챌린지 파라미터(도메인, 논스, 시간 경계 등)를 내려보내고, 클라이언트는 서명된 CAIP-122 메시지를 SIGN-IN-WITH-X HTTP 헤더에 Base64로 인코딩해 재요청한다.
  - kind: technical
  - needs: 공식 문서 + 저장소 코드
- [x] c09: 서명 스킴은 EVM에서 eip191(EOA), eip1271(배포된 스마트 컨트랙트 지갑), eip6492(미배포 카운터팩추얼 지갑), Solana에서 ed25519를 지원한다.
  - kind: technical
  - needs: 공식 문서 + 코드의 스킴 식별자
- [x] c10: 검증은 리소스 서버가 로컬(및 필요시 RPC)로 수행하며 facilitator는 인증 경로에 관여하지 않는다.
  - kind: technical
  - needs: 공식 문서 + 코드 흐름
- [x] c11: 서버는 검증 성공 시 (a) 인증 전용 라우트면 즉시 접근 허용, (b) 결제 이력 라우트면 SIWxStorage.hasPaid로 지갑 주소의 결제 이력을 확인해 허용한다.
  - kind: technical
  - needs: 공식 문서 + 코드
- [x] c12: 결제 이력 기록은 x402 결제 정산(settle) 시점에 훅(createSIWxSettleHook)으로 recordPayment를 호출해 남긴다.
  - kind: technical
  - needs: 코드/문서
- [x] c13: EIP-1271 검증은 지갑 컨트랙트의 isValidSignature 온체인 호출(RPC)이 필요하고, EIP-6492는 미배포 지갑까지 포괄하는 래퍼 검증이다.
  - kind: technical
  - needs: EIP-1271/6492 스펙 + SIWX 코드
- [x] c14: 논스 리플레이 방지는 선택적(hasUsedNonce/recordNonce 옵셔널)이며, 기본 보호는 시간 경계와 도메인 바인딩에 의존한다.
  - kind: technical
  - needs: 코드/문서의 옵셔널 시그니처

## 구현과 동작 (코드 수준)
- [x] c15: 공식 구현은 coinbase/x402 모노레포(TypeScript 중심, Go/Python 포함)에 존재하며 SIWX 확장 코드가 공개되어 있다.
  - kind: technical
  - needs: GitHub 저장소의 SIWX 디렉토리/파일
- [x] c16: 서버 측은 declareSIWxExtension/createSIWxResourceServerExtension, 클라이언트 측은 createSIWxClientExtension({signers})로 통합하며, 미들웨어 훅 어댑터가 제공된다.
  - kind: technical
  - needs: 코드/README
- [x] c17: 개발용 인메모리 스토리지가 기본 제공되고, 프로덕션에는 영속 스토리지 구현이 요구된다.
  - kind: technical
  - needs: 코드/문서
- [x] c18: 멀티체인 클라이언트는 복수 signer를 등록하고 서버 챌린지의 체인 ID(eip155:*/solana:*)에 맞는 signer를 선택한다.
  - kind: technical
  - needs: 코드/문서

## 보안 분석
- [x] c19: 도메인 바인딩은 다른 서비스에서 받은 서명의 재사용(크로스 서비스 리플레이)을 막기 위한 SIWE 계열의 핵심 방어다.
  - kind: technical
  - needs: EIP-4361 보안 섹션 + SIWX 문서
- [x] c20: SIWE 계열에는 도메인 검증 부실로 인한 실제 피싱/서명 재사용 취약점 사례가 보고된 바 있다.
  - kind: factual
  - needs: 보안 권고/연구 2건
- [x] c21: 지갑 주소 기반 인증은 결제 주체와 접근 주체가 같은 지갑임을 전제하므로, 지갑 키 유출·양도 시 결제 이력 접근권도 함께 이전된다.
  - kind: interpretive
  - needs: 문서 서술 + 분석
- [x] c22: EIP-1271 스마트 월렛 서명 검증에는 자체 위험(악의적 컨트랙트의 가변 응답 등)이 알려져 있다.
  - kind: technical
  - needs: 보안 연구/권고 1건 이상

## 논의 (Discussion)
- [x] c23: SIWX 방식(지갑 서명 재인증)은 API 키·JWT 세션 대비 서버 측 비밀 발급이 불필요하고 지갑 소유 증명과 결제 이력을 같은 식별자로 묶는 이점이 있다.
  - kind: interpretive
  - needs: 문서 + 비교 분석 소스
- [x] c24: x402 생태계는 2025–2026년에 급성장했으며 SIWX 같은 확장은 프로토콜이 결제 단발성에서 세션·신원 계층으로 확장되는 신호다.
  - kind: interpretive
  - needs: 생태계 보도/지표 1건 이상
- [x] c25: SIWX의 결제 이력 조회는 서버 로컬 스토리지에 의존하므로, 리소스 서버 간 이력 공유나 서버 재시작 내구성은 구현자 책임이다.
  - kind: technical
  - needs: 문서/코드의 스토리지 계약
