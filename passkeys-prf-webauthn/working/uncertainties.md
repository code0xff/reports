# Uncertainties — passkeys-prf-webauthn

- **지원 매트릭스의 휘발성**: 브라우저/OS별 PRF 지원은 월 단위로 변한다. 본 리포트의 매트릭스는 2026-07-03 기준 스냅샷이며, 특히 Windows(Chrome 147+/Firefox 148+)와 Safari 보안 키 경로는 곧 달라질 수 있다.
- **"모든 GPM 패스키 PRF 지원"** (c13): Corbado 및 커뮤니티 테스트 기반 서술. Google의 공식 문서에서 명시 확인 못함. vendor-stated.
- **KB5077181/빌드 26200.7840** (c16): Corbado 단독 서술. Bitwarden 이슈로 25H2+Chrome 147 동작은 교차 확인되나 정확한 KB 번호·빌드 경계는 단일 소스.
- **credRandomWithUV/WithoutUV** (c11): CTAP2.1 스펙 원문 대신 Yubico 기술문서로 뒷받침. 정확한 규범 문구는 미대조.
- **Corbado "커뮤니티 테스트 수백 회, synced provider 100% PRF-on-create"**: Corbado 자체 데모 데이터로, 독립 재현 없음. vendor-stated.
- **1Password PRF 지원 범위** (c21): 1Password 자사 블로그(2024-07) 기준. 이후 정식(비베타) 릴리스 범위는 미확인.
- **iOS 18.0–18.3 '데이터 손실' 표현** (c15): Apple 포럼은 "hybrid에서 다른 PRF 값 반환"을 확인. '영구 데이터 손실'로 이어지는지는 앱 설계에 따라 다름 — 해석적 서술로 처리.
- **Windows 10에서의 PRF 문제** (s24): Bitwarden 문서의 한 줄 서술. 구체적 실패 모드는 미상.
