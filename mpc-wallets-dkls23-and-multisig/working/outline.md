아홉 개의 상위 섹션. Mandatory Abstract / Introduction / Limitations / References 포함.

1. **Abstract** — MPC wallet가 무엇인지, multisig와 어떻게 다른지, DKLs23가 왜 중요한지, 어떤 선택 기준을 제시하는지 한 단락으로 요약.
2. **Introduction** — 문제 설정: “키를 어디에 두는가”가 아니라 “키를 어떻게 분산 소유하고 어떤 서명 표면을 노출하는가”라는 관점. 보고서 범위와 독자(보안팀, wallet infra builder, 프로토콜 설계자)를 명시.
3. **수학적 기초** — 유한체, secret sharing(특히 Shamir), 타원곡선 공개키, threshold signature의 선형성/Schnorr 직관, ECDSA가 더 어려운 이유.
4. **MPC wallet의 작동 원리** — DKG, key share, nonce/ephemeral share, signing rounds, refresh/rotation, 복구/정책 계층.
5. **DKLs23** — 무엇을 개선했는지, 어떤 가정 아래 동작하는지, 2-party/threshold ECDSA 문맥에서 왜 실무적 의미가 있는지, 한계는 무엇인지.
6. **MPC wallet vs multisig** — 온체인 가시성, 체인 호환성, 수수료/가스, 정책 표현력, 공격면, 운영 복잡도, 감사 가능성 비교.
7. **언제 무엇을 선택해야 하는가** — 커스터디, 거래소, embedded wallet, DAO treasury, 기관 승인 흐름, cross-chain 운영 등 시나리오별 선택 기준.
8. **Limitations** — 프로토콜별 보안 가정, vendor 문서 의존, 구현 세부 비공개 영역, benchmarking 수치의 제한.
9. **References** — `working/sources.jsonl` 기반 참고문헌.
