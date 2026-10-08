# Claims — glamsterdam
## 2. 현황
- [x] c01: 메타 EIP-7773은 18개 EIP를 Scheduled로 나열하며 Sepolia 활성화만 정해져 있다. (factual; s01,s03)
- [x] c02: Sepolia 첫 글램스테르담 블록은 11,856,337이며 blockAccessListHash·slotNumber 필드를 갖는다. (factual; s27,s01)
- [x] c03: 메인넷 GLOAS_FORK_EPOCH는 consensus-specs에서 미정(uint64 최대값)이다. (factual; s25,s03)
- [x] c04: Sepolia 목표는 8월 3일에서 10월 6일로 밀렸고 메인넷 목표는 2026 상반기에서 4분기로 밀렸다. (factual; s30,s29)
## 3. ePBS
- [x] c05: EIP-7732는 실행 페이로드를 빌더의 서명된 입찰 약속으로 대체하고 PTC 의무를 추가한다. (technical; s04)
- [x] c06: 빌더 입찰은 페이로드 전달 시 또는 동일 슬롯 증명 가중이 슬롯당 지분의 60% 이상일 때 정산된다. (technical; s24)
- [x] c07: 빌더는 MIN_DEPOSIT_AMOUNT(1 ETH)+미결 출금 이상을 남기고만 입찰할 수 있다. (technical; s24)
- [x] c08: 빌더 예치·종료는 EIP-8282의 요청 버스 계약으로 처리된다. (technical; s14)
- [x] c09: Potuz는 다수 빌더 신원으로 고액 입찰 후 페이로드를 내지 않는 공격을 경고했다. (factual, single news source; s29)
## 4. BAL
- [x] c10: EIP-7928은 블록 실행 중 접근한 모든 계정·슬롯과 사후 값을 기록해 병렬 처리를 가능하게 한다. (technical; s05)
## 5. 가스
- [x] c11: EIP-8037의 CPSB 1530은 150M 기준 한도·50% 이용률·연 120 GiB 목표에서 재계산된다. (technical; s06, verify)
- [x] c12: 새 계정 상태 가스는 183,600(기존 25,000의 7.34배), 새 슬롯은 97,920이다. (technical; s06, verify)
- [x] c13: 블록 검사 tx.gas ≤ 블록 한도 − 사용 상태 가스 때문에, 60M 한도에서는 65,536바이트 계약을 단일 tx로 배포할 수 없다. (technical; s06,s09,s28, verify)
- [x] c14: EIP-7976의 약 37%는 비영(非零) 바이트 기준이며 영 바이트 기준으로는 84%다. (technical; s10, verify)
- [x] c15: EIP-8038은 STORAGE_WRITE를 2,800→10,000, COLD_ACCOUNT_ACCESS를 2,600→3,000으로 올리고 2,300 스티펜드는 유지한다. (technical; s07)
## 6. 기타
- [x] c16: EIP-7954는 계약 크기 상한을 24,576→65,536바이트로 올린다. (technical; s09)
- [x] c17: EIP-8061은 약 7일의 약한 주관성 기간을 받아들이며 종료 처리량을 약 4배로 늘린다. (technical; s13)
- [x] c18: EIP-8261은 합의 규칙을 바꾸지 않는 에폭 기반 가스 한도 권고 일정이며, Sepolia는 이를 써서 포크 에폭에 2억을 예약했고 메인넷 일정은 빈 목록이다. (technical; s12,s26,s31,s32,s25)
## 7. 영향
- [x] c19: EF는 고정 가스 스티펜드·하드코딩된 가스 한도에 기대는 계약이 수정이 필요할 수 있다고 경고했다. (factual; s03)
