# Outline — x402-extensions

주제: x402 공식 문서·명세의 2026-09 기준 최신 내용을 근거로 확장(extension)
기능 전반을 분석한다. 대상은 `x402-foundation/x402` 모노레포의
`specs/extensions/` 9건, `docs/extensions/` 8건, 그리고 TypeScript·Go·Python
세 SDK의 실제 구현이다.

기존 리포트와의 관계: 본 사이트는 이미 `x402-protocol`(2026-04),
`x402-bazaar`(2026-05), `x402-siwx`(2026-07)를 발행했다. 앞의 것은 확장을
한 절로만 다뤘고 그 내용은 이미 낡았다(SIWX를 "명세 없음"으로 기술). 뒤의
두 건은 개별 확장 심층 분석이다. 본 리포트는 **확장 메커니즘 자체**와
**9종 전수 카탈로그**를 다루며, Bazaar·SIWX의 내부 구현은 재서술하지 않고
해당 리포트로 넘긴다.

## 1. 초록

본문 완성 후 마지막에 작성.

## 2. 서론 — 확장 레이어가 떠안은 문제

- x402 코어가 의도적으로 남긴 빈칸(디스커버리·환불·영수증·귀속·인증)
- v2가 `extensions`를 1급 필드로 승격시킨 배경과 시점
- 본 리포트의 범위와 1차 자료 목록, 기존 리포트와의 경계

## 3. 확장 메커니즘과 봉쇄(containment) 설계

- 와이어 포맷: `extensions[key] = {info, schema}`, 4개 메시지에 모두 존재
- 서버 광고 → 클라이언트 에코 → 정산 응답 회신의 왕복 구조
- 리소스 서버 확장의 4개 훅 + facilitator 확장
- 에코 검증(`extension_echo_mismatch`)과 `dynamicInfoFields`
- 봉쇄: enrich 후 assertion이 `scheme`/`network`/`maxTimeoutSeconds`/
  `extra.paymentFlow`/`extra.assetTransferMethod`를 불변으로 고정
- 코어의 하드코딩 테이블 3종이 `builder-code` 한 건만 담고 있는 이유
- `EXTENSION-RESPONSES` 사이드채널과 구매자 비노출 경계
- `GET /supported`의 `extensions[]` 광고
- Figure 1(생애주기 시퀀스), Figure 2(에코 검증 흐름)

## 4. 확장 9종 전수 카탈로그 — 명세에서 구현까지의 거리

- 3개 층위: 3언어 구현(6건) / TypeScript 전용(1건) / 명세만(2건)
- 각 확장의 역할·소유 주체(server/client/facilitator)·최초 커밋·최종 수정
- 명세만 존재하는 두 건이 멈춘 이유 (auth-hints는 미출시 `deferred` 스킴을
  전제로 쓰였음)
- Figure 3(성숙도 층위)

## 5. offer-receipt — 서버 서명의 도입과 신뢰 앵커의 공백

- x402 코어에는 없던 **서버 측 서명**을 도입한 유일한 확장
- 서명 오퍼(가격 약정)와 영수증(전달 증명), EIP-712 / JWS 이중 포맷
- `chainId: 1` 고정과 그 이유, 전송되지 않는 정규 스키마
- §4.5.1이 서명자 권한 검증을 MUST로 두면서 메커니즘은 규정하지 않은 문제
- 자체 선언한 불안정성(§2), 버전 0.6, TypeScript 전용
- Figure 4(신뢰 앵커 분기)

## 6. 공식 문서와 구현의 불일치 — 코드 대조 검증

- 문서 overview의 훅 매트릭스 7행 중 3행이 소스와 불일치
- 문서가 게시한 `ResourceServerExtension` 인터페이스의 누락 필드
- 코어 명세는 `schema`를 Required로, http-message-signatures는 Optional로 규정
- 검증 스크립트와 실행 결과

## 7. 생태계와 거버넌스

- 서드파티 확장 6종, 그중 둘이 offer-receipt의 공백을 메우는 구조
- 환불이 코어 밖 서드파티로 밀려난 사실
- "메인테이너 승인 후 SDK 포함" — 큐레이션형 레지스트리의 함의
- 키 네임스페이스에 등록처가 없다는 점

## 8. Limitations

- 미해결 갭, 단일 출처 항목, 검증하지 못한 범위

## References

렌더러가 `working/sources.jsonl`에서 생성한다. 수기 작성 금지.
