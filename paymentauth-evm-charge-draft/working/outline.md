# Outline

1. **초록 (Abstract)** — draft-evm-charge-00이 무엇인지(MPP의 EVM charge intent 바인딩), 핵심 메커니즘(402+Payment 스킴+4종 크리덴셜), 저자 구성(MegaETH·Coinbase·Monad)과 x402 호환이라는 함의.

2. **서론 (Introduction)** — 문서 메타데이터(제목·저자·상태·일자), 문제의식(체인마다 별도 결제 메서드 대신 단일 'evm' 메서드로 통합), 본 보고서 범위(문서 정독 분석 + 프레임워크 맥락).

3. **상위 프레임워크: MPP와 "Payment" HTTP 인증 스킴 (Background)** — paymentauth.org=MPP 스펙 모음, 베이스 draft-httpauth-payment, method/intent 레지스트리, 결제수단 불가지(agnostic) 설계, charge vs session intent.

4. **Charge 플로우와 HTTP 헤더 (Charge flow)** — 6단계(요청→402→WWW-Authenticate: Payment 챌린지→서명→Authorization: Payment→검증·정산→200+Payment-Receipt), 챌린지/크리덴셜/리시트 데이터 구조.

5. **네 가지 크리덴셜 타입 (Credential types)** — permit2(권장)·authorization(EIP-3009)·transaction·hash의 동작·가스 부담·챌린지 바인딩·분할결제(splits) 지원 차이.

6. **검증·정산·재생방지 (Verification/Settlement/Replay)** — permit2 검증 6단계, 정산 호출(permitWitnessTransferFrom/Batch, transferWithAuthorization 등), 챌린지 바인딩과 재생방지 메커니즘.

7. **보안 고려사항과 x402와의 관계 (Security & x402)** — 챌린지 바인딩, 가스 스폰서십 DoS, split 원자성, RPC 신뢰; x402 charge-레이어 호환·facilitator 제거·독립 비판(Tempo L1 중앙화·Stripe 게이트키핑).

8. **한계 (Limitations)** — 00 버전 드래프트(미확정·비표준), 단일 1차 문서 의존, 미배포·미구현, 빠른 변동.

9. **참고문헌 (References)** — sources.jsonl 기반.
