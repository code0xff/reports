# Claims — passkeys-prf-webauthn

## 서론 (Introduction)
- [x] c01: Corbado 블로그 아티클(passkeys-prf-webauthn)은 Vincent Delitz가 작성했고 2025-04-16 초판, 2026-05-19 최종 수정본이다.
  - kind: factual
  - needs: 아티클 페이지의 메타데이터 확인
- [x] c02: WebAuthn PRF 확장은 W3C WebAuthn Level 3 스펙에 정의된 클라이언트 확장이다.
  - kind: technical
  - needs: W3C WebAuthn Level 3 스펙 §10.1.4 (prf extension) 원문
- [x] c03: PRF 확장의 핵심 동기는 인증 크리덴셜에서 대칭 암호화 키 재료를 유도해 종단간 암호화를 가능하게 하는 것이다.
  - kind: interpretive
  - needs: 스펙 서술 + 구현자(브라우저/패스워드 매니저) 측 문서

## 배경: WebAuthn, 패스키, CTAP2 hmac-secret
- [x] c04: PRF 확장은 CTAP2의 hmac-secret 확장을 웹에 노출하는 표준화된 통로이며, 인증기 내부 비밀키에 대한 HMAC-SHA-256 연산으로 구현된다.
  - kind: technical
  - needs: CTAP2.1 스펙의 hmac-secret 정의 + WebAuthn 스펙의 매핑 서술
- [x] c05: hmac-secret 확장은 원래 Windows Hello의 오프라인 자격 증명(예: 오프라인 데이터 복호화) 시나리오를 위해 도입되었다.
  - kind: factual
  - needs: FIDO/CTAP 스펙 서술 또는 MS/FIDO 측 문서 2건
- [x] c06: 패스키(동기화 크리덴셜)의 경우 PRF 비밀도 크리덴셜과 함께 클라우드(iCloud Keychain, Google Password Manager 등)로 동기화된다.
  - kind: technical
  - needs: 플랫폼 벤더 문서 또는 구현 분석

## PRF 확장 기술 분석
- [x] c07: PRF 확장의 입력 salt는 hmac-secret에 전달되기 전에 "WebAuthn PRF" 컨텍스트 문자열과 널 바이트를 앞에 붙여 SHA-256으로 해싱되며, 이는 웹 컨텍스트 출력과 비-웹(native) hmac-secret 출력을 분리하기 위함이다.
  - kind: technical
  - needs: WebAuthn L3 스펙 원문의 해당 알고리즘 단계
- [x] c08: PRF 출력은 salt당 32바이트이며, 요청은 first(필수)/second(선택) 두 개의 salt를 지원해 키 회전 스킴을 가능하게 한다.
  - kind: technical
  - needs: 스펙 원문 + 실무 가이드 1건
- [x] c09: evalByCredential은 get() 시 특정 credential ID별로 다른 salt를 지정할 수 있게 하며 allowCredentials가 비어 있으면 사용할 수 없다.
  - kind: technical
  - needs: 스펙 원문
- [x] c10: create() 시 PRF 평가(등록과 동시에 출력 획득)는 스펙상 허용되지만 인증기/플랫폼별로 지원이 갈리며, 미지원 플랫폼에서는 등록 직후 get()을 한 번 더 수행해야 한다.
  - kind: technical
  - needs: 스펙 + 브라우저 구현 노트(Chromium/WebKit) 또는 실무 보고
- [x] c11: hmac-secret의 실제 CTAP 레벨 출력은 UV(사용자 검증) 여부에 따라 서로 다른 두 개의 비밀(credRandom)에서 유도되므로, UV 상태가 다르면 같은 salt라도 PRF 출력이 달라진다.
  - kind: technical
  - needs: CTAP2.1 스펙의 credRandomWithUV/WithoutUV 서술
- [x] c12: PRF 출력 자체를 암호화 키로 바로 쓰기보다 HKDF 등 KDF를 거쳐 AES-GCM 등의 키로 유도하는 것이 권장 패턴이다.
  - kind: interpretive
  - needs: 실무 가이드/구현 예제(Levi/Yubico/browser 데모 등) 1건 이상

## 플랫폼·브라우저 지원 현황
- [x] c13: Android의 Google Password Manager 패스키는 전면적으로 PRF를 지원하며, 2026년 중반 기준 가장 넓은 플랫폼 지원을 제공한다.
  - kind: factual
  - needs: Google/Chrome 문서 + 독립 테스트 보고 각 1건
- [x] c14: Safari 18(macOS 15, iOS 18)부터 iCloud Keychain 패스키에 대해 PRF를 지원한다.
  - kind: factual
  - needs: WebKit/Apple 릴리스 노트 + 독립 확인 1건
- [x] c15: iOS 18.0–18.3에서 크로스 디바이스 인증(CDA) 소스로 쓸 때 PRF 관련 데이터 손실 버그가 있었고 18.4에서 수정되었다.
  - kind: factual
  - needs: 버그 리포트/커뮤니티 보고 + Corbado 서술 (2건)
- [x] c16: Windows Hello(Windows 11)는 오랫동안 플랫폼 인증기에서 PRF를 지원하지 않았고, Windows 11 25H2(2026년 초 업데이트)부터 PRF 값을 반환하기 시작했다.
  - kind: factual
  - needs: MS 문서/Windows WebAuthn API 버전(WEBAUTHN_API_VERSION) 자료 + 독립 보고
- [x] c17: 하드웨어 보안 키(예: YubiKey 5)는 CTAP2 hmac-secret을 통해 브라우저 전반에서 PRF를 지원하지만, macOS Safari의 보안 키 PRF에는 미해결 WebKit 버그가 있다.
  - kind: factual
  - needs: Yubico 문서 + WebKit 버그 트래커
- [x] c18: Firefox는 데스크톱에서 PRF를 지원하지만(139+), Android용 Firefox는 지원하지 않는다.
  - kind: factual
  - needs: Mozilla 릴리스 노트/버그질라 + 지원 매트릭스 1건

## 활용 사례와 생태계 채택
- [x] c19: Dashlane은 PRF 지원 패스키로 마스터 패스워드 없는 볼트 복호화를 상용 배포했다.
  - kind: factual
  - needs: Dashlane 공식 블로그/문서 + 독립 보도 1건
- [x] c20: Bitwarden은 PRF 기반 볼트 잠금 해제(및/또는 암호화 키 롤오버)를 구현했다.
  - kind: factual
  - needs: Bitwarden 공식 문서/블로그
- [x] c21: 1Password 등 서드파티 크리덴셜 매니저도 자사 저장 패스키에 대해 PRF 확장을 지원하기 시작했다.
  - kind: factual
  - needs: 벤더 릴리스 노트 또는 커뮤니티 확인
- [x] c22: PRF는 아이덴티티 월렛·논커스터디얼 키 관리(개인키를 서버에 노출하지 않는 시스템)에 활용될 수 있으며 실제 구현 사례가 존재한다.
  - kind: technical
  - needs: GitHub 구현체/프로젝트 1건 이상
- [x] c23: 표준 패턴은 "PRF 출력 → HKDF → KEK로 DEK(데이터 키)를 랩핑"이며, 이는 다중 패스키 등록과 키 회전을 가능하게 한다.
  - kind: technical
  - needs: 구현 가이드/코드 예제 1건 이상

## 보안 고려사항과 논의
- [x] c24: PRF로 유도한 키로 암호화한 데이터는 해당 패스키 분실 시 복구 불가능하므로 별도 복구 메커니즘 설계가 필수다.
  - kind: interpretive
  - needs: 실무 가이드/벤더 권고 2건
- [x] c25: 동기화 패스키의 PRF 비밀은 동기화 패브릭 운영자(Apple/Google 등)의 보안에 의존하므로, 하드웨어 바운드 키 대비 위협 모델이 다르다.
  - kind: interpretive
  - needs: 보안 분석 글/학술 논문 1건 이상
- [x] c26: PRF 출력은 RP 서버로 보내지 않고 클라이언트에서만 사용하는 것이 전제이며, 서버가 PRF 출력을 수집하면 E2EE 보장이 깨진다.
  - kind: interpretive
  - needs: 스펙 프라이버시 섹션 또는 실무 가이드
- [x] c27: Corbado의 "PRF를 핵심 의존성이 아닌 향상 기능으로 취급하라"는 권고는 2026년 현재도 지원 매트릭스 불균일성 때문에 타당하다.
  - kind: interpretive
  - needs: 지원 현황 소스들로부터의 종합

---

## 개정 2 (2026-08-07) — 구현 가이드 클레임

## 구현 가이드
- [ ] c28: WebAuthn L3는 prf 확장의 입력을 `AuthenticationExtensionsPRFInputs`
  (`eval`, `evalByCredential`), 출력을 `AuthenticationExtensionsPRFOutputs`
  (`enabled`, `results`)로 정의하며, `enabled`는 등록 시에만 보고되고 인증
  응답에는 존재하지 않는다.
  - kind: technical
  - needs: W3C L3 §10.1.4 IDL 및 출력 정의 원문

- [ ] c29: 클라이언트의 salt 변환 `SHA-256(UTF8("WebAuthn PRF") || 0x00 || input)`과
  인증기의 `HMAC-SHA-256(CredRandom, salt)`는 W3C 공식 테스트 벡터로
  독립 재현이 가능하다.
  - kind: technical
  - needs: L3 §16.17.1 테스트 벡터 + 실행 검증

- [ ] c30: WebAuthn L3가 create 시점 PRF 평가의 전제로 언급한
  "a future extension to [FIDO-CTAP]"은 CTAP 2.2 PS §12.8에 표준화된
  `hmac-secret-mc`이며, 이 확장은 makeCredential에만 적용되고
  `hmac-secret`이 함께 true로 설정되어야 한다.
  - kind: technical
  - needs: L3 §10.1.4 + CTAP 2.2 PS §12.8 원문

- [ ] c31: CTAP 규범 텍스트는 인증기가 크리덴셜마다 32바이트 난수 두 개
  (`CredRandomWithUV`, `CredRandomWithoutUV`)를 생성하고 응답의 uv 비트로
  어느 쪽을 쓸지 정하며, 복호화된 salt가 32 또는 64바이트가 아니면
  `CTAP1_ERR_INVALID_PARAMETER`를 반환하도록 규정한다.
  - kind: technical
  - needs: CTAP 2.1 PS / 2.2 PS hmac-secret 절 원문 (기존 Limitations 해소)

- [ ] c32: 하나의 PRF 출력에서 HKDF의 `info`를 달리하면 서로 독립적인
  목적 구속 키를 결정적으로 유도할 수 있다.
  - kind: technical
  - needs: RFC 5869 + 실행 검증

- [ ] c33: 봉투 암호화 구성에서는 크리덴셜 추가·폐기가 데이터 재암호화를
  요구하지 않으며, 서로 다른 패스키가 같은 평문을 열 수 있다.
  - kind: technical
  - needs: 구현 가이드 + 실행 검증

- [ ] c34: 기능 감지(`enabled`)로는 걸러지지 않는 "조용한 PRF 값 불일치"를
  키 검증값(KCV)으로 탐지할 수 있다.
  - kind: interpretive
  - needs: iOS CDA 버그 사례 + 실행 검증

- [ ] c35: `results.first`/`second`는 임의의 BufferSource 타입으로 반환될 수
  있어(스펙 예제가 Uint8Array와 Uint32Array를 함께 제시) 바이트 단위
  정규화 없이 길이나 내용을 다루면 오류가 발생한다.
  - kind: technical
  - needs: L3 §16.17.1 예제 + 실행 검증

- [ ] c36: Firefox는 PRF 미지원 인증기에서 `{"prf":{"enabled":false}}`가 아니라
  빈 객체를 반환하는 동작 차이가 있었고 후속 버그로 수정됐다.
  - kind: factual
  - needs: Mozilla Bugzilla 메타 버그 코멘트
