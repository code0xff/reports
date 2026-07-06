# Claims — caip-122

## 서론 (Introduction)
- [x] c01: CAIP-122는 블록체인 계정이 오프체인 서비스에 인증·인가하는 체인 불가지론적 메시지 표준으로, EIP-4361을 일반화·추상화해 EIP-4361을 자신의 특정 구현으로 만드는 것을 명시적 목표로 한다.
  - kind: factual
  - needs: CAIP-122 원문
- [x] c02: CAIP-122는 2022-06-23 생성됐고 현재 Review 상태다.
  - kind: factual
  - needs: CAIP 원문 메타데이터

## 배경: CAIP 체계와 ChainAgnostic 표준 스택
- [x] c03: CAIP는 CASA(Chain Agnostic Standards Alliance)가 관리하는 체인 불가지론적 제안 체계이며, CAIP-2(체인 식별자)와 CAIP-10(계정 식별자)이 기반 표준이다.
  - kind: factual
  - needs: CASA/CAIP 저장소 문서
- [x] c04: CAIP-104는 체인 네임스페이스별 프로파일 문서 체계를 정의하며, CAIP-122는 각 네임스페이스가 서명 알고리즘·type 문자열·signing input 절차를 프로파일로 제공할 것을 MUST로 요구한다.
  - kind: technical
  - needs: CAIP-122 + CAIP-104 원문
- [x] c05: CAIP-122는 CAIP-74(CACAO: 체인 불가지론적 오브젝트 캐퍼빌리티)를 확장해 서명된 사인인 메시지를 이식 가능한 캐퍼빌리티 오브젝트로 직렬화할 수 있게 한다.
  - kind: technical
  - needs: CAIP-122/CAIP-74 원문

## CAIP-122 데이터 모델 분석
- [x] c06: 추상 데이터 모델의 필수 필드는 domain, iss/account_address(CAIP-10 세그먼트), uri, version, chain_id(CAIP-2), type(서명 타입), signature이고, nonce·issued-at·statement 등은 선택이다.
  - kind: technical
  - needs: CAIP-122 원문 필드 표
- [x] c07: eip155 네임스페이스의 CAIP-122 프로파일은 EIP-4361 메시지 형식과 EIP-191/ERC-1271 서명을 그대로 사용한다.
  - kind: technical
  - needs: namespaces 저장소 eip155 프로파일
- [x] c08: solana 등 비EVM 네임스페이스 프로파일은 각자의 서명 알고리즘(ed25519 등)과 메시지 직렬화(평문 또는 raw bytes)를 정의한다.
  - kind: technical
  - needs: namespaces 저장소 solana(또는 tezos 등) 프로파일
- [x] c09: CAIP-122 메시지는 did:pkh와 결합해 체인 계정을 DID 주체로 하는 세션 증명(CACAO)에 쓰인다.
  - kind: technical
  - needs: CACAO/did:pkh 문서 또는 Ceramic 문서

## 구현과 생태계
- [x] c10: Reown(구 WalletConnect) AppKit의 SIWX 기능은 CAIP-122를 따르는 다중 체인 사인인 구현이며 SIWE 설정을 대체한다.
  - kind: factual
  - needs: Reown 공식 문서
- [x] c11: x402 프로토콜의 SIWX 확장은 CAIP-122를 HTTP 402 결제 흐름에 결합한 구현이다.
  - kind: factual
  - needs: x402 문서
- [x] c12: Ceramic 네트워크의 DID 세션(did-session)은 CACAO/CAIP-122 계열 사인인을 프로덕션에서 사용해 왔다.
  - kind: factual
  - needs: Ceramic 문서/저장소
- [x] c13: CAIP-122 네임스페이스 프로파일은 일부 체인(eip155, solana, tezos 등)에만 존재하며, 전 체인 커버리지에는 이르지 못했다.
  - kind: factual
  - needs: namespaces.chainagnostic.org 목록

## 평가와 논의
- [x] c14: 추상 데이터 모델과 체인별 프로파일의 분리는 새 체인 추가를 쉽게 하지만, 프로파일 간 보안 속성(논스 처리, 도메인 검증)의 일관성은 프로파일 작성자에 달려 있다.
  - kind: interpretive
  - needs: 스펙 구조 + 프로파일 대조
- [x] c15: CAIP-122는 2022년 이후 Review 상태에 머물러 있으나, 구현(Reown, x402 등)은 표준 확정 전에 이미 확산되고 있다.
  - kind: interpretive
  - needs: 상태 표기 + 구현 문서들
- [x] c16: 서명 검증의 보안 요구(도메인 바인딩, 논스, 시간 경계)는 EIP-4361에서 상속되나, CAIP-122 자체의 보안 섹션은 EIP-4361보다 간결해 세부는 프로파일·구현에 위임된다.
  - kind: interpretive
  - needs: 두 스펙 보안 섹션 대조
