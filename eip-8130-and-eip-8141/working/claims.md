# Claims — EIP-8130과 EIP-8141

## 배경
- [ ] c01: 두 제안 모두 Standards Track / Core 카테고리의 Draft이며, EIP-8130은
  2025-10-14, EIP-8141은 2026-01-29에 생성되어 8130이 약 3개월 앞선다.
  - kind: factual
  - needs: 두 EIP 헤더 원문
- [ ] c02: EIP-8130은 저자가 Coinbase 소속 1인인 반면 EIP-8141은 Vitalik
  Buterin과 이더리움 클라이언트·ERC-4337 진영을 포함한 10인 공동 저자다.
  - kind: factual
  - needs: 두 EIP 헤더의 author 필드
- [ ] c03: 두 제안은 서로를 참조하지 않으며, 각자의 ethereum-magicians 토론
  스레드에서도 상대 제안이 언급되지 않는다.
  - kind: factual
  - needs: 두 EIP의 requires 필드 + 두 토론 스레드

## EIP-8130
- [ ] c04: EIP-8130의 동기는 검증을 지갑 코드에 위임하는 방식이 노드로 하여금
  임의 EVM을 시뮬레이션하게 만들고 전체 상태 접근·트레이싱·평판 시스템을
  요구한다는 것이다.
  - kind: technical
  - needs: EIP-8130 Motivation 원문
- [ ] c05: EIP-8130에서 트랜잭션은 자신의 인증자를 명시적으로 선언하며, 노드는
  코드를 실행하기 전에 인증자 신원만으로 수용 여부를 판단할 수 있다.
  - kind: technical
  - needs: EIP-8130 Abstract/Overview 원문
- [ ] c06: 모든 인증자는 `authenticate(hash, data)` 단일 인터페이스를 공유하고
  actorId를 입력받는 대신 반환하므로 프로토콜에 알고리즘별 로직이 없다.
  - kind: technical
  - needs: EIP-8130 Rationale 원문
- [ ] c07: EIP-8130은 두 개의 채택 프로파일을 두어, L1 프로파일에서는 가스
  스케줄이 규범적이고 인증자 수용이 permissive한 반면 L2 프로파일에서는
  스케줄이 설정 가능하고 트랜잭션 경로가 정식 집합으로만 제한된다.
  - kind: technical
  - needs: EIP-8130 Adoption Profiles 원문
- [ ] c08: EIP-8130은 EVM 변경을 요구하지 않는다고 명시한다.
  - kind: technical
  - needs: EIP-8130 Abstract 원문
- [ ] c09: 코드가 없는 EOA가 8130 트랜잭션을 처음 보내면 프로토콜이 자동으로
  `DEFAULT_ACCOUNT_ADDRESS`로 위임시킨다.
  - kind: technical
  - needs: EIP-8130 Block Execution 원문

## EIP-8141
- [ ] c10: EIP-8141은 트랜잭션을 최대 `MAX_FRAMES`(64)개의 프레임으로 분해하며
  각 프레임은 DEFAULT·VERIFY·SENDER 세 모드 중 하나로 실행된다.
  - kind: technical
  - needs: EIP-8141 Constants + 모드 표 원문
- [ ] c11: 가스 지불 승인은 새 명령어 `APPROVE`(0xaa)를 통해 이뤄지며, 스코프
  비트마스크로 실행 승인과 지불 승인을 구분한다.
  - kind: technical
  - needs: EIP-8141 APPROVE 절 원문
- [ ] c12: EIP-8141의 공개 멤풀 정책은 ERC-7562에서 영감을 받았으나 스테이킹과
  평판을 전부 제거했다고 명시한다.
  - kind: technical
  - needs: EIP-8141 Mempool 절 원문
- [ ] c13: 공개 멤풀 규칙은 `payer`가 설정되는 지점까지의 "검증 프리픽스"에만
  적용되며 그 이후 프레임은 임의일 수 있다.
  - kind: technical
  - needs: EIP-8141 Validation Prefix 절 원문
- [ ] c14: EIP-8141은 검증에 쓸 수 있는 가스를 `MAX_VERIFY_GAS` 100,000으로
  제한한다.
  - kind: technical
  - needs: EIP-8141 Mempool Constants 원문
- [ ] c15: EIP-8141은 프레임 트랜잭션에서 `ORIGIN` 의미를 바꾸며, 이를 EIP-7702의
  선례와 일치한다고 서술한다.
  - kind: technical
  - needs: EIP-8141 Backwards Compatibility 원문
- [ ] c16: EIP-8141의 동기에는 타원곡선 기반 인증에서 포스트 양자 보안 체계로
  가는 네이티브 오프램프 제공이 포함된다.
  - kind: technical
  - needs: EIP-8141 Motivation 원문

## 대조
- [ ] c17: 8130이 비판하는 "평판 시스템 필요"라는 부담을 8141은 스테이킹·평판
  제거로 정면 반박하지만, "임의 EVM 시뮬레이션" 부담은 경계를 지을 뿐
  제거하지 않는다.
  - kind: interpretive
  - needs: c04 + c12 + c14의 결합, 그리고 반대 해석 가능성 검토
- [ ] c18: 노드 운영자 관점에서 EIP-8141은 정적 검사 대신 사전 시뮬레이션,
  검증 프레임 내 옵코드 샌드박싱, 페이마스터 가스 예약 추적을 새로 요구한다.
  - kind: factual
  - needs: 노드 운영자 관점 분석 1건 + 명세 대조

## 표준화 현황
- [ ] c19: EIP-8141은 2026-03 ACD에서 Hegotá에 대해 CFI를 받았고 2026-08-27
  ACDE에서 SFI로 상향됐으나 헤드라이너 여부는 Hegotá 스코핑 마감까지 미정이다.
  - kind: factual
  - needs: ACD 보도 2건
- [ ] c20: 2026년 9월 Base와 이더리움의 계정 추상화 협업이 결렬되어 Base는
  EIP-8130을, 이더리움 L1은 EIP-8141을 각각 추진하게 됐다.
  - kind: factual
  - needs: 보도 원문
- [ ] c21: EIP-8130은 Base의 vibenet 데브넷에서 시험되고 있으며 일부 전송
  유형에서 최대 63% 가스 절감을 주장한다.
  - kind: factual
  - needs: 보도 원문 (단일 출처 가능성)
