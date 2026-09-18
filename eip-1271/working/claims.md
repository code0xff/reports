# Claims — eip-1271

모든 항목 충족(2026-09-18). 근거는 draft의 인용과 working/verify/의 실행 로그에 있다.

각 항목은 참/거짓 판정이 가능한 단문이다. `[x]`는 CLAUDE.md §2.3의 최소 출처
기준을 만족했다는 뜻이다.

## 2. 표준이 규정한 것과 규정하지 않은 것

- [x] c01: EIP-1271은 `isValidSignature(bytes32,bytes)`를 `view`로 규정하고
  성공 시 매직값 `0x1626ba7e`를 반환하도록 MUST로 요구한다.
  - kind: technical
  - needs: 명세 Specification 절 원문
- [x] c02: 매직값은 `bytes4(keccak256("isValidSignature(bytes32,bytes)"))`와
  같다.
  - kind: technical
  - needs: 명세 주석 + 직접 계산해 대조
- [x] c03: `view` 제약의 명시된 근거는 GasToken 발행류 공격 차단이다.
  - kind: technical
  - needs: 명세 Rationale 절
- [x] c04: 명세는 실패 시 반환값을 규범으로 정하지 않으며, `0xffffffff`는
  참조 구현에서 온 관행이다.
  - kind: technical
  - needs: 명세 본문에 실패값 MUST 부재 + 참조 구현 + 구현체의 "convention" 언급
- [x] c05: EIP-1271의 Security Considerations는 가스 한도 하드코딩 금지와
  구현자 책임 두 가지만 다루며, 재사용·미배포 계정·검증자 분기 문제를
  언급하지 않는다.
  - kind: technical
  - needs: 명세 Security Considerations 전문
- [x] c06: 컨트랙트 서명은 시간에 따라 유효성이 바뀔 수 있으나 명세는 이를
  다루지 않는다.
  - kind: technical
  - needs: 명세에 해당 서술 부재 + 구현 라이브러리의 명시적 경고

## 3. 이력 — 매직값이 바뀐 날

- [x] c07: EIP-1271은 2018-07-25에 생성되어 2022-01-28에 Final이 되었다.
  - kind: factual
  - needs: 명세 헤더 + 파이널라이즈 커밋
- [x] c08: 2020-07-09 커밋이 함수 시그니처를 `(bytes,bytes)`에서
  `(bytes32,bytes)`로, 매직값을 `0x20c13b0b`에서 `0x1626ba7e`로 바꿨다.
  - kind: factual
  - needs: 해당 커밋 diff
- [x] c09: 그 커밋의 제목은 "Automatically merged updates to draft EIP(s) 1271"
  로, 호환성을 깨는 변경임을 드러내지 않는다.
  - kind: factual
  - needs: 커밋 메시지 원문
- [x] c10: Safe v1.3.0의 `CompatibilityFallbackHandler`는 두 함수를 모두
  구현하며, `EIP1271_MAGIC_VALUE`가 구 값 `0x20c13b0b`를 가리킨다.
  - kind: technical
  - needs: v1.3.0 소스
- [x] c11: 현재 Safe main에서는 같은 이름 `EIP1271_MAGIC_VALUE`가
  `0x1626ba7e`를 가리키고 구 함수는 제거되었다.
  - kind: technical
  - needs: main 소스 대조

## 4. 교차 계정 재사용과 ERC-7739

- [x] c12: 2023-10-27 Alchemy가 ERC-1271 교차 계정 서명 재사용 취약점을
  발견했고, 독립 연구자가 그보다 한 달 앞서 같은 문제를 찾았다.
  - kind: factual
  - needs: Alchemy 공개 글
- [x] c13: 영향 범위에는 다수의 스마트 계정 구현과 Permit2·CowSwap이
  포함되었고, 자금 손실은 보고되지 않았다.
  - kind: factual
  - needs: Alchemy 공개 글 + 가능하면 독립 확인
- [x] c14: Safe 코어는 이 취약점의 영향을 받지 않았으며, 그 이유는 들어온
  해시를 Safe 도메인의 `SafeMessage`로 다시 해싱하기 때문이다.
  - kind: technical
  - needs: Alchemy의 비영향 서술 + Safe 소스의 재해싱 코드
- [x] c15: ERC-7739가 "안전하지 않다"고 제시한 예제는 EIP-1271 자신의 참조
  구현과 구조적으로 같다.
  - kind: interpretive
  - needs: 두 코드 블록 직접 대조
- [x] c16: ERC-7739는 최소한 해시·계정 주소·체인 ID를 묶어 최종 해시를
  만들도록 요구한다.
  - kind: technical
  - needs: ERC-7739 Motivation·Specification
- [x] c17: ERC-7739는 별도 인터페이스 대신 `isValidSignature`의 해시 공간을
  써서 지원 여부를 탐지한다.
  - kind: technical
  - needs: ERC-7739 Support detection + Solady 구현

## 5. 미배포 계정과 ERC-6492

- [x] c18: 미배포 카운터팩추얼 계정에서는 `isValidSignature`를 호출할 수
  없으므로 1271 검증이 구조적으로 불가능하다.
  - kind: technical
  - needs: ERC-6492 Abstract·Motivation
- [x] c19: ERC-6492는 서명 끝에 `0x6492…6492` 매직 바이트를 붙이는 래퍼
  포맷을 정의하고, 검증자가 호출 전에 배포를 수행하도록 MUST로 요구한다.
  - kind: technical
  - needs: ERC-6492 Specification
- [x] c20: ERC-6492는 2023-02-24 제안되어 2023-09-05에 Final이 되었다.
  - kind: factual
  - needs: 커밋 이력

## 6. 검증자의 딜레마

- [x] c21: OpenZeppelin `SignatureChecker`는 `signer.code.length == 0`으로
  ecrecover 경로와 ERC-1271 경로를 분기한다.
  - kind: technical
  - needs: 현재 소스
- [x] c22: 이 분기는 2024-03-14 병합된 PR #4951에서 도입되었고, 그 전에는
  ecrecover를 먼저 시도하고 실패 시 1271로 넘어가는 `||` 형태였다.
  - kind: factual
  - needs: PR 메타데이터 + OZ 이슈 본문의 코드 비교
- [x] c23: 전환의 이유는 `||` 형태에서 ECDSA 키에서 파생된 주소가 그 키를
  응용 계층에서 폐기할 수 없기 때문이다.
  - kind: technical
  - needs: OZ 이슈 본문
- [x] c24: EIP-7702로 위임된 EOA는 23바이트 코드를 가지므로
  `code.length == 0` 분기에서 ERC-1271 경로로 넘어간다.
  - kind: technical
  - needs: EIP-7702의 위임 지시자 규정 + OZ 분기 코드
- [x] c25: OpenZeppelin은 이 문제의 해소를 EIP-8151과 EIP-8298에 걸어 두고
  이슈를 보류 상태로 두었다.
  - kind: factual
  - needs: OZ 이슈 #6773 본문과 라벨
- [x] c26: 두 EIP는 Hegotá 하드포크 메타에서 "Proposed for Inclusion"
  단계에 있을 뿐 Scheduled가 아니다.
  - kind: factual
  - needs: EIP-8081 본문

## 7. 세 표준의 속도 차이

- [x] c27: EIP-1271은 Final까지 약 3년 6개월, ERC-6492는 약 6개월이 걸렸고,
  ERC-7739는 2026-09-18 현재까지 Draft다.
  - kind: factual
  - needs: 세 명세의 헤더와 커밋 이력
- [x] c28: ERC-7739 명세 파일은 2025-06-17 이후 수정되지 않았다.
  - kind: factual
  - needs: ERCs 저장소 커밋 이력
- [x] c29: ERC-7739는 표준이 Draft인 상태에서 이미 주요 구현 라이브러리에
  들어가 있다.
  - kind: technical
  - needs: Solady·OpenZeppelin 소스
