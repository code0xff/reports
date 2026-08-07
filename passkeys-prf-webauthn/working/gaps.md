# Gaps — passkeys-prf-webauthn

## Iteration 1–2 (2026-07-03) 이후 상태

### 해소된 갭
- W3C 스펙 원문(prf 확장) 확보 (s02), 익스플레이너 확보 (s06).
- 지원 매트릭스: WebKit(s11)·Firefox(s12)·Windows(s13, s25) 1차/독립 소스 확보.
- iOS 18 CDA 버그: Apple Dev Forums(s15)로 Corbado 외 독립 확인.
- Dashlane(s08)·Bitwarden(s07, s24)·1Password(s16, s21) 채택 사례 확보.
- 학술 소스: arXiv 2501.07380(s18), 2509.05893(s19), 2604.24920(s20).
- GitHub 구현체: passkey-rs(s21), portkey-client(s22), nostr-passkey-poc(s23).

### 남은 갭 (수용 — Limitations로 이동)
- CTAP2.1 스펙 원문(fidoalliance.org)은 페치 실패(대용량 HTML 잘림). credRandomWithUV/WithoutUV 서술은 Yubico 기술문서(s09)로 대체. → Limitations에 명시.
- "모든 GPM 패스키가 PRF 지원"은 Corbado(s01) 서술이며 Google 1차 문서 미확인. → vendor-stated로 표기.
- Windows KB5077181/빌드 26200.7840 세부는 Corbado 단독(s01), 단 Bitwarden 이슈(s13)가 25H2+Chrome 147에서 prfEnabled=true를 독립 확인. → 부분 검증으로 표기.
- arXiv/Semantic Scholar API 429로 헬퍼 스크립트 실패, WebSearch 폴백 사용(도메인 한정). 검색 재현성 제한.

### 소스 충돌 (본문에 양쪽 제시)
- **WebKit 보안 키 PRF 버그**: Corbado(s01, 2026-05-19 수정판)는 "미해결 open bugs (311099, 314934)"라 서술하나, WebKit Bugzilla(s14)는 311099가 수정 완료(Safari TP 241에서 확인)로 표시. → 아티클 스냅샷 이후 수정된 것으로 해석하고 양쪽 제시.
- **플랫폼 인증기 PRF 지원**: Miller(s10, 2023)는 "플랫폼 인증기는 PRF 미지원"이라 썼으나 이는 2023년 시점 서술로, 2024–2026 릴리스(s11, s12, s13)로 상황이 바뀜. → 시점 명시로 해소.

### Critique 패스에서 발견·해소 (2026-07-03)
- 반대 증거 누락(must-fix): Cappalli 경고(s27)·SimpleWebAuthn footgun(s26) → 논의 섹션에 반영 완료.

**판단: 남은 갭은 모두 Limitations로 수용 가능. must-fix 0건. 퍼블리시 단계 진행.**

---

## 개정 2 (2026-08-07)

### 해소된 갭
- **CTAP 규범 원문 대조 완료** (초판의 최대 갭). `curl`로 스펙 HTML을 내려받아
  로컬에서 태그 제거·추출하는 방식으로 WebFetch 절단 문제를 우회했다.
  CTAP 2.1 PS와 2.2 PS 양쪽에서 동일한 hmac-secret 규범 텍스트를 확인(s28).
  `CredRandomWithUV`/`WithoutUV`, uv 비트 선택 규칙, 32/64바이트 salt 검증과
  `CTAP1_ERR_INVALID_PARAMETER`, `saltEnc`/`saltAuth`/`pinUvAuthProtocol`,
  `output = HMAC-SHA-256(CredRandom, saltN)` 전부 1차 사료 확보.
- **create 시점 평가의 정체 규명**: WebAuthn L3의 "a future extension to
  [FIDO-CTAP]"이 CTAP 2.2 PS §12.8 `hmac-secret-mc`임을 특정(s29, s31, s32).
  초판의 "스펙상 가능" 서술을 정정했다.
- **W3C 공식 테스트 벡터 확보**(s30, §16.17.1). 인증기 없이 전 체인을 재현할 수
  있게 되어, 초판에서 문서 인용으로만 뒷받침했던 도메인 분리·HMAC 구조를
  실행 검증으로 승격했다.
- **Firefox 지원 내역 1차 확인**(s33): 메타 버그 RESOLVED FIXED, 135/137/139
  플랫폼별 출하, Android는 149 예정. 초판의 "Android Firefox 미지원" 서술에
  시효가 생겼음을 확인.
- **WebKit 311099 충돌 해소**: Bugzilla가 2026-04-09 "Safari TP 241에서 수정
  확인"으로 종결(s14). 초판이 병기했던 Corbado(미해결) 대 Bugzilla(수정) 충돌은
  Bugzilla 쪽으로 정리.

### 신규 소스 충돌 (본문에 양쪽 제시)
- **`hmac-secret-mc`의 CTAP 버전 귀속**: Yubico는 YubiKey 5.8 펌웨어를
  "CTAP 2.3"으로 표기하며 hmac-secret-mc를 신규 확장으로 열거(s34). 반면 본
  조사가 규범 정의를 확인한 문서는 CTAP 2.2 PS(2025-07-14) §12.8(s29)이고,
  Yubico 자신의 CTAP 2.2 요약도 이를 2.2 추가 항목으로 열거한다(s31).
  → 버전 표기 차이(2.3이 2.2를 포함)로 해석하고 규범 근거는 2.2 PS로 기재.
  참고: 2.2 **Review Draft**(rd-20230321)에는 hmac-secret-mc가 없어,
  2.2 계열 안에서도 드래프트 단계에 따라 존재 여부가 갈린다.

### 남은 갭 (Limitations로 수용)
- **Chromium 이슈 41493623** — `GetNextAssertion`으로 반환되는 CTAP 크리덴셜에서
  PRF가 평가되지 않는 문제. 이슈 트래커가 로그인을 요구해 본문 확인 실패.
  다중 크리덴셜 매칭 시의 실패 모드로 보여 구현 가이드에 관련성이 있으나
  **인용하지 않았다.** 재개 시 우선 확인 대상.
- **안정판 Safari 전파 시점** 미확인(TP 241에서만 확인).
- **Firefox 149 Android 실제 출하** 미확인(예정 상태).
- **검증 범위**: 브라우저·인증기 계층은 Node.js로 재현 불가. §Limitations에 명시.
- 초판의 잔존 갭(GPM 전면 지원의 Google 1차 문서, Windows KB 세부, arXiv API
  429)은 그대로 유지.

**판단: must-fix 0건. 개정 2 퍼블리시 가능.**
