# Claims — eip-7708
## 1. 서론
- [x] c01: 컨트랙트가 보내는 ETH는 7708 이전 어디에도 자동 기록되지 않아 트레이싱이 필요했다. (factual; s01,s05,s13)
## 2. 명세
- [x] c02: 로그는 SYSTEM_ADDRESS에서 ERC-20 Transfer와 같은 LOG3 형식으로 나온다. (technical; s01,s08)
- [x] c03: 0원·자기 송금·되돌려진 프레임은 로그를 남기지 않는다. (technical; s08,s09,s12)
## 3. 변천
- [x] c04: 소각 로그가 2026-02에 추가됐다가 EIP-8246을 조건으로 2026-05에 삭제됐다. (factual; s02,s04,s03)
- [x] c05: 수수료·인출 로그는 의도적으로 제외됐다. (factual; s01,s04)
## 4. 비용
- [x] c06: 거래 수준 로그 비용은 EIP-2780 TX_VALUE_COST 6,000에 포함된다. (technical; s07, 실측 s12)
- [x] c07: 생성 트랜잭션의 로그 비용은 미정이라는 질문이 Last Call 중 제기됐다. (factual; s09)
## 5. 실측
- [x] c08: Sepolia 200블록에서 위반 0건, 포크 블록에서 정확히 시작. (factual; s12 필자 측정)
## 6. 논의
- [x] c09: 주소 필터 없이 토픽만 보면 위조·ERC-20 로그와 섞인다. (interpretive; s05,s01)
- [x] c10: 7708만으로는 잔액 변화 전체를 로그로 재구성할 수 없다. (interpretive; s01,s05)
