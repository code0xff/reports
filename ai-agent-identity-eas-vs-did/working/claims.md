## Introduction
- [x] c01: DID는 사람뿐 아니라 조직, 사물, 데이터 모델, 추상 엔터티 등 임의의 주체를 식별할 수 있도록 설계된 식별자 체계다.
  - kind: factual
  - needs: DID Core의 정의와 DID subject 범위

## EAS
- [x] c02: EAS는 온체인과 오프체인 모두에서 어테스테이션을 만들 수 있는 범용 인프라로 정의된다.
  - kind: factual
  - needs: EAS 공식 사이트 또는 공식 문서의 정의
- [x] c03: EAS의 온체인 코어는 스키마 등록과 어테스테이션 생성을 담당하는 두 계약을 중심으로 설명된다.
  - kind: technical
  - needs: eas-contracts README나 공식 문서의 계약 구조
- [x] c04: EAS SDK는 오프체인 어테스테이션과 위임 어테스테이션을 모두 지원한다.
  - kind: technical
  - needs: EAS SDK 예제 또는 공식 문서

## DID and VC
- [x] c05: DID Document는 verification methods와 services를 표현할 수 있고, 이는 인증과 서비스 발견의 기반이 된다.
  - kind: technical
  - needs: DID Core의 DID document 설명
- [x] c06: DID Core는 authentication과 capabilityInvocation 같은 verification relationship을 구분한다.
  - kind: technical
  - needs: DID Core의 verification relationship 설명
- [x] c07: VC 2.0은 선택적 공개와 영지식증명 계열 프라이버시 강화 메커니즘을 수용한다.
  - kind: factual
  - needs: VC 2.0의 selective disclosure / zero-knowledge proofs 설명
- [x] c08: DID/VC 계열은 장기 식별자와 프라이버시 상관관계 위험을 명시적으로 다룬다.
  - kind: factual
  - needs: DID Core correlation risk와 VC correlation risk 설명

## Analysis
- [x] c09: AI agent 신원 문제를 식별, 인증, 권한, 평판으로 분해하면 DID는 식별·인증에 강하고 EAS는 평판·역할·허가 증명에 강하다.
  - kind: interpretive
  - needs: DID와 EAS의 공식 모델을 대조한 분석
- [x] c10: EVM 중심의 agent marketplace나 온체인 권한 게이팅에는 EAS가 구현 단순성과 composability 측면에서 유리하다.
  - kind: interpretive
  - needs: EAS의 온체인 계약 구조와 사용 사례
- [x] c11: 크로스플랫폼 이식성, 프라이버시, 선택적 공개가 중요하면 DID/VC 또는 하이브리드가 더 적합하다.
  - kind: interpretive
  - needs: DID/VC 프라이버시 및 상호운용성 목표
