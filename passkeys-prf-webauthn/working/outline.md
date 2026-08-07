# Outline — WebAuthn PRF 확장과 패스키 기반 종단간 암호화

분석 대상: https://www.corbado.com/blog/passkeys-prf-webauthn (Vincent Delitz, 초판 2025-04-16, 수정 2026-05-19)

1. **초록 (Abstract)** — 본문 완성 후 작성.
2. **서론 (Introduction)** — 패스키가 인증을 넘어 암호화 키 유도 수단으로 확장되는 맥락, Corbado 아티클의 위치, 본 리포트의 범위와 방법.
3. **배경: WebAuthn, 패스키, CTAP2 hmac-secret** — WebAuthn Level 3 확장 모델, CTAP2.1 hmac-secret 확장의 기원(Windows Hello 오프라인 잠금해제), 패스키(동기화 크리덴셜)의 등장.
4. **PRF 확장 기술 분석** — `prf` 확장의 API 형태(eval / evalByCredential), 입력 salt의 컨텍스트 해싱("WebAuthn PRF" || 0x00), 출력 32바이트, 두 개 salt와 키 회전, create 시 평가 vs get 시 평가, hmac-secret과의 매핑, UV(사용자 검증)와 PRF 출력의 관계.
5. **플랫폼·브라우저 지원 현황 (2026 중반 기준)** — Windows 11 25H2 / Windows Hello, macOS·Safari 18, iOS 18(18.0–18.3 데이터 손실 버그 포함), Android·Google Password Manager, Firefox, 보안 키(YubiKey 등), 서드파티 크리덴셜 매니저.
6. **활용 사례와 생태계 채택** — 브라우저 기반 E2EE, 패스워드 매니저의 마스터 패스워드 대체(Dashlane, Bitwarden 등), 아이덴티티 월렛/논커스터디얼 키 관리, WebCrypto(HKDF, AES-GCM)와의 결합 패턴.
7. **보안 고려사항과 논의** — 패스키 분실 = 데이터 영구 손실 문제와 복구 설계, 동기화 패브릭 신뢰 문제(PRF 값이 클라우드 동기화 크리덴셜에서 파생될 때의 위협 모델), RP 입장에서의 다중 패스키 키 랩핑 전략, "enhancement, not dependency" 권고의 타당성, Corbado 아티클 주장 중 검증 결과가 다른 지점.
8. **한계 (Limitations)** — 본 리서치가 확인하지 못한 것(비공개 구현 세부, 빠르게 변하는 지원 매트릭스 등).
9. **References** — 렌더러가 sources.jsonl에서 자동 생성.

---

## 개정 2 (2026-08-07) — 구현 가이드 추가

사용자 요청: "PRF가 뭔지, 기술 베이스는 무엇인지, 어떻게 사용하면 되는지".
기존 리포트는 3번째 질문(사용법)을 다루지 않았고 코드 예제가 0건이었다.
아래 변경을 적용한다.

### 신규 섹션 (기존 §4 뒤, §5 지원 현황 앞에 삽입)

**§5. 구현 가이드: PRF를 실제로 쓰는 방법**
- 5.1 전체 데이터 흐름 — RP 입력 → 클라이언트 도메인 분리 해싱 →
  인증기 HMAC → 출력 → HKDF → AES-GCM. W3C 공식 테스트 벡터로
  각 단계를 실행 검증한 결과를 제시.
- 5.2 등록(`create()`) — `prf: { eval: ... }`, `enabled` 판정,
  `hmac-secret-mc` 유무에 따른 create 시점 평가 가능성, 폴백.
- 5.3 인증(`get()`) — `eval` vs `evalByCredential`, 해결 우선순위,
  스펙이 규정하는 오류(NotSupportedError / SyntaxError).
- 5.4 출력에서 키로 — HKDF-SHA-256 + info 문자열로 목적 구속,
  `extractable: false`.
- 5.5 봉투 암호화 — 랜덤 DEK, 크리덴셜별 KEK 랩핑, 다중 패스키,
  추가·폐기가 데이터 재암호화를 요구하지 않음.
- 5.6 키 회전 — 두 salt를 한 셀레머니에서 사용해 재랩핑.
- 5.7 실패 모드 방어 — KCV(키 검증값)로 조용한 PRF 값 불일치 탐지,
  BufferSource 타입 정규화, UV 일관성.
- 5.8 체크리스트.

### 기존 섹션 변경
- **§3 배경**: CTAP 원문 대조 완료로 승격. `CredRandomWithUV/WithoutUV`,
  `output = HMAC-SHA-256(CredRandom, saltN)`, salt 길이 검증(32/64바이트),
  saltEnc/saltAuth/pinUvAuthProtocol 파라미터를 1차 사료로 서술.
- **§4 기술 분석**: create 시점 평가를 "스펙상 가능"에서
  "CTAP `hmac-secret-mc`에 의존"으로 정정. WebAuthn L3 원문이
  "a future extension to [FIDO-CTAP]"이라 쓴 그 확장이 무엇인지 특정.
- **§6 지원 현황**: 2026-08 스냅샷으로 갱신. WebKit 311099 수정 확인,
  Firefox 메타 버그 RESOLVED FIXED 및 버전별 내역, Android Firefox 149,
  YubiKey 5.8 펌웨어의 hmac-secret-mc.
- **§9 한계**: "CTAP2.1 스펙 원문 미대조" 항목 삭제(해소됨).
  검증 스크립트의 범위 한계를 새 항목으로 추가.

### 감사 산출물
`working/verify/` — 실행 가능한 검증 스크립트 2개와 결과 로그.
