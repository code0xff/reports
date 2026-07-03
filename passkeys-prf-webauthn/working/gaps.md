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
