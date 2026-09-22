# Outline — x402 Lifecycle Hooks와 Wallet Compatibility

1. 초록
2. 서론 — 두 문서의 위치(Advanced Concepts), V2에서 훅이 생긴 배경, 이 사이트의 기존 x402 보고서와의 관계
3. Lifecycle Hooks — 다섯 개 표면(ResourceServer, HTTPResourceServer, Client, HTTPClient, Facilitator, MCP), 각 훅의 발동 지점과 반환 계약(abort/skip/recovered/grantAccess), settle phase, 체이닝, SDK 지원(TS/Python/Go), 실제 사용 예(bazaar 카탈로그, 컴플라이언스, 신뢰 점수 확장 제안)
4. Wallet Compatibility — 다섯 지갑 유형(A EOA, B 배포된 ERC-4337, C 반사실적 ERC-6492, D/E ERC-7702 관대/엄격 위임)과 다섯 스킴 경로의 5×5 매트릭스, 서명 검증 경로(ECDSA, EIP-1271, EIP-6492 universal validator), eip6492AllowedFactories, 미지원 조합 두 가지의 원인
5. 기반 표준 — EIP-712, EIP-1271, EIP-6492, EIP-3009(transferWithAuthorization), Permit2 permitWitnessTransferFrom, ERC-4337/7579, ERC-7702; 어떤 표준이 어느 셀을 결정하는가
6. 구현 이력과 현재 상태 — Python SDK 2.14.0(2026-06-26) 지갑 호환, 2.16.0(2026-07-17) after-verify 훅, GitHub 이슈(#639 ERC-4337 요청, #2299 trust-provider), 페이실리테이터별 지원 차이
7. 분석 — 훅이 만드는 신뢰 경계(누가 abort/recover할 수 있나), "verify가 통과하면 settle도 통과한다"는 불변식의 의미, 반사실적 지갑의 팩토리 allowlist가 보안 경계인 이유, 남은 공백
8. 한계
9. 참고문헌(자동)
