# Claims — erc-8434

## 2. 제안 내용
- [x] c01: ERC-8434는 2026-09-30 생성된 Draft이며 ethereum/ERCs에 병합되지 않은 PR #2044로만 존재한다.
  - kind: factual
  - needs: PR 메타데이터, master에 파일 부재
- [x] c02: AID의 앵커는 주소이고 정식 표기는 CAIP-10 `eip155:{chainId}:{address}`이다.
  - kind: technical
  - needs: 명세 §1
- [x] c03: 명세는 모든 주소를 DORMANT AID로 정의하고, ERC-8004 에이전트 바인딩·라이브니스·자기 행동이 갖춰질 때 활성으로 본다.
  - kind: technical
  - needs: 명세 Abstract·§2

## 3. 상태와 바인딩
- [x] c04: 온체인 state()는 RETIRED→DORMANT→ACTIVE/STALE 순서로, ownerOf 또는 getAgentWallet가 앵커와 같고 lastSeen+window가 현재 이상일 때만 ACTIVE를 반환한다.
  - kind: technical
  - needs: 명세 §2 + 참조 구현
- [x] c05: 바인딩 술어가 깨진 앵커는 술어를 만족하는 다른 주소에 의해 한 트랜잭션 안에서 대체(takeover)된다.
  - kind: technical
  - needs: 명세 §3 + 실행 프로브
- [x] c06: 바인딩이 다시 성립해도 그 공백 기간의 증거는 그 AID의 것으로 인정되지 않으며, 이 권한 구간은 온체인에 저장되지 않고 이벤트로 재구성된다.
  - kind: technical
  - needs: 명세 §3·§11
- [x] c07: 권한 구간 재구성은 ERC-8004 지갑 변경마다 MetadataSet이 나온다는 전제에 기대는데, ERC-8004 명세 본문은 register 외 경로에서 이를 요구하지 않는다.
  - kind: technical
  - needs: AID §12 + ERC-8004 본문 + 8004 참조 구현

## 4. 문서·패싯·출처
- [x] c08: 모든 패싯은 SELF·OBSERVED·ATTESTED·PROVED 중 하나의 출처 등급과 0이 아닌 validUntil을 가져야 한다.
  - kind: technical
  - needs: 명세 §8·§9
- [x] c09: 스킴 해시로 고정되지 않은 OBSERVED 패싯은 SELF로 취급해야 한다(MUST).
  - kind: technical
  - needs: 명세 §8
- [x] c10: committedAt은 출처와 독립된 시간 축이며, 타임스탬프만으로는 배타성을 증명할 수 없어 발행자 선언 커밋 로그를 둔다.
  - kind: technical
  - needs: 명세 §8

## 5. 개정 경위
- [x] c11: committedAt·권한 구간·takeover는 Magicians 토론 2026-09-30~10-01에 세 명의 외부 참여자가 제기한 뒤 명세에 들어갔다.
  - kind: factual
  - needs: Magicians 스레드 원문
- [x] c12: Bitcoin 블록 타임스탬프의 약 2시간 오차에 관한 단서는 제안되었으나 명세 본문에는 없다.
  - kind: factual
  - needs: 스레드 #9 + 명세 grep

## 6. 검증
- [x] c13: 공개된 테스트 벡터 16개는 독립 구현으로 모두 재현된다.
  - kind: technical
  - needs: 실행 결과
- [x] c14: 명세와 참조 구현 모두 바인딩 대상 레지스트리가 실제 ERC-8004 배포인지 검사하지 않아, 두 함수짜리 컨트랙트로 ACTIVE를 얻을 수 있다.
  - kind: technical
  - needs: 명세 §3 + 리졸버 소스 + forge 프로브
- [x] c15: 참조 리졸버는 미고정 OBSERVED→SELF 강등과 assertion registry 확인을 구현하지 않는다.
  - kind: technical
  - needs: resolve.js 소스 + 픽스처 실행
- [x] c16: 표본 문서의 OBSERVED 패싯 두 개는 스킴 고정 없이 발행되어 명세 자신의 규칙상 SELF여야 한다.
  - kind: technical
  - needs: 벡터/픽스처 + §8
- [x] c17: 술어 실패 후 owner 주소가 먼저 바인딩하면, 명세가 권장하는 agentWallet 앵커는 owner가 토큰을 보유하는 동안 바인딩할 수 없다.
  - kind: technical
  - needs: forge 프로브
- [x] c18: 벡터의 자리표시 verifyingContract 주소는 EIP-55 체크섬을 통과하지 않는다.
  - kind: technical
  - needs: strict isAddress

## 7. 스택과 표준화 위치
- [x] c19: AID가 이름으로 참조하는 ERC-8338·8414·8419는 같은 저자의 미병합 PR이다.
  - kind: factual
  - needs: PR 목록
- [x] c20: requires 헤더에는 155·165·712·1271·8004만 있고 8419 등은 없다.
  - kind: factual
  - needs: 명세 헤더
- [x] c21: ERC-8004 자체도 Draft 상태다.
  - kind: factual
  - needs: ERC-8004 헤더
- [x] c22: PR은 2026-10-01 기준 편집자 1인의 리뷰를 더 기다리고 있고 CI는 통과한다.
  - kind: factual
  - needs: 봇 코멘트 + check-runs
