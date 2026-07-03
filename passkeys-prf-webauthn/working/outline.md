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
