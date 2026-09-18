# Claims — x402-extensions

모든 항목 충족(2026-09-18). 각 주장의 근거는 draft의 인용과 working/verify/의 실행 로그에 있다.

각 주장은 참/거짓 판정이 가능한 단문으로 쓴다. `[x]`는 CLAUDE.md §2.3의
최소 출처 기준을 만족했다는 뜻이다.

## 2. 서론 — 확장 레이어가 떠안은 문제

- [x] c01: x402 v2는 `extensions`를 `PaymentRequired`·`PaymentPayload`·
  `SettleResponse`·`VerifyResponse` 네 스키마 모두에 선택 필드로 정의한다.
  - kind: technical
  - needs: v2 명세의 네 스키마 필드 표
- [x] c02: v2 릴리스(2025-12-09)의 변경 내역에 "extensions support"가
  명시되어 있으며, 그 이전 v1에는 확장 필드가 없었다.
  - kind: factual
  - needs: v2 명세 Version History + v1 명세 대조
- [x] c03: 환불은 x402 코어 명세에 존재하지 않으며, 서드파티 확장이 그
  자리를 메우고 있다.
  - kind: factual
  - needs: 코어 명세에 refund 부재 + 서드파티 목록에 환불 SDK 등재

## 3. 확장 메커니즘과 봉쇄 설계

- [x] c04: 확장 항목은 `info`(서버 제공 데이터)와 `schema`(그 `info`의 JSON
  Schema) 두 필드를 갖는 맵 원소이며, 코어 명세는 둘 다 Required로 규정한다.
  - kind: technical
  - needs: v2 명세 §5.1.2 Extensions 객체 표
- [x] c05: 클라이언트는 서버가 보낸 `info`를 최소한 그대로 포함해야 하고,
  추가는 가능하지만 삭제·덮어쓰기는 불가능하다.
  - kind: technical
  - needs: v2 명세 §5.1.2 본문 + 코어 구현의 에코 검증 코드
- [x] c06: 이 에코 규칙은 리소스 서버의 `validateExtensions`가
  `extension_echo_mismatch` 사유로 거부하는 방식으로 강제되며, TypeScript·
  Go·Python 세 구현 모두에 존재한다.
  - kind: technical
  - needs: 코어 소스 + 세 언어 저장소 내 동일 식별자 존재
- [x] c07: 서버가 광고하지 않은 확장 키를 클라이언트가 주입해도 에코 일치
  검사는 건너뛰며, 오직 코어에 하드코딩된 `SERVER_OWNED_INFO_FIELDS` 항목만
  이를 막는다.
  - kind: technical
  - needs: `validateExtensions`의 `hasOwnProperty` 분기 + 상수 테이블
- [x] c08: 그 하드코딩 테이블 3종에는 `builder-code` 단 한 건만 등재되어
  있고, 소스 주석이 이를 수기 동기화 대상으로 명시한다.
  - kind: technical
  - needs: `core/src/utils/index.ts`의 세 상수 정의와 주석
- [x] c09: 리소스 서버 확장은 선언·402 응답·정산 응답·verify/settle 훅의 네
  지점에 개입할 수 있고, facilitator 확장은 `key`만 갖는 별도 인터페이스다.
  - kind: technical
  - needs: 공식 문서 overview + `core/src/types/extensions.ts`
- [x] c10: 확장의 enrich 반환값은 가산적으로만 병합되며, `scheme`·`network`·
  `maxTimeoutSeconds`·`extra.paymentFlow`·`extra.assetTransferMethod`는
  런타임 assertion으로 불변 고정된다.
  - kind: technical
  - needs: `ResourceServerExtension` 주석 + assert 함수 임포트 목록
- [x] c11: facilitator는 확장 처리 결과를 `EXTENSION-RESPONSES` 헤더라는
  별도 사이드채널로 전달하며, 이 값은 JSON 본문에 포함되지 않고 구매자에게
  전달되지 않는다.
  - kind: technical
  - needs: v2 명세 §7.2.1

## 4. 확장 9종 전수 카탈로그

- [x] c12: 2026-09-18 기준 `specs/extensions/`에는 확장 명세가 정확히 9건
  존재한다.
  - kind: factual
  - needs: 저장소 트리 + 디렉터리 랜딩 페이지
- [x] c13: 공식 문서 `docs/extensions/`는 그중 7건만 문서화하며, `auth-hints`와
  `http-message-signatures`에는 문서 페이지가 없다.
  - kind: factual
  - needs: docs 트리 + overview의 Available Extensions 표
- [x] c14: 같은 두 확장은 TypeScript·Go·Python 어느 SDK에도 구현이 없다.
  - kind: technical
  - needs: 세 언어 extensions 디렉터리 전수
- [x] c15: `offer-receipt`는 TypeScript에만 구현되어 있고 Go·Python에는 없으며,
  공식 문서도 SDK 지원을 TypeScript 단독으로 표기한다.
  - kind: technical
  - needs: 세 언어 디렉터리 + overview 표
- [x] c16: `auth-hints`가 동기로 든 사용 사례는 `deferred` 스킴인데, 그 스킴은
  `specs/schemes/`에 존재하지 않는다.
  - kind: technical
  - needs: auth-hints 본문 + schemes 디렉터리 전수
- [x] c17: 명세만 존재하는 두 확장은 각각 커밋이 1건뿐이며 최초 작성 이후
  수정된 적이 없다.
  - kind: factual
  - needs: 파일별 커밋 이력 API

## 5. offer-receipt

- [x] c18: offer-receipt는 x402에 서버 측 서명을 도입하며, 이는 코어 결제
  흐름이 클라이언트 서명만 다루는 것과 대비된다.
  - kind: technical
  - needs: 확장 명세 §1 + 코어 명세의 payload 서명 정의
- [x] c19: 서명 아티팩트는 EIP-712와 JWS 두 포맷을 지원하고, EIP-712의
  `chainId`는 결제 네트워크와 무관하게 1로 고정된다.
  - kind: technical
  - needs: 확장 명세 §3.1.1, §3.2
- [x] c20: 명세는 서명자 권한 검증을 MUST로 요구하면서 그 메커니즘은
  규정하지 않고 네 가지 선택지를 제시하는 데 그친다.
  - kind: technical
  - needs: 확장 명세 §4.5.1, §7
- [x] c21: 명세 스스로 와이어 형태가 안정적이지 않다고 선언하며, 버전 이력의
  최신 항목은 0.6이다.
  - kind: technical
  - needs: 확장 명세 §2, §12
- [x] c22: 2026-07-23 커밋이 서명자 권한 절을 추가했으나 버전 이력 표는
  갱신되지 않아 0.6(2026-02-04)에 멈춰 있다.
  - kind: factual
  - needs: 커밋 diff 통계 + 버전 이력 표

## 6. 공식 문서와 구현의 불일치

- [x] c23: 공식 문서 overview의 훅 매트릭스 7행 중 3행(Builder Code,
  Payment Identifier, Sign-In-With-X)이 TypeScript 소스와 일치하지 않는다.
  - kind: technical
  - needs: overview 표 + 각 확장의 server 모듈 소스, 실행 가능한 대조
- [x] c24: 그중 Payment Identifier는 소스 주석이 "enrichment hook이 필요
  없다"고 명시해 문서 표와 정면으로 어긋난다.
  - kind: technical
  - needs: `payment-identifier/resourceServer.ts` 주석
- [x] c25: 문서가 게시한 `ResourceServerExtension` 인터페이스에는 실제
  타입 정의에 있는 `transportHooks`와 `onVerifiedPaymentCanceled`가 빠져 있다.
  - kind: technical
  - needs: overview 코드 블록 + `core/src/types/extensions.ts`
- [x] c26: 코어 명세는 `schema`를 Required로 규정하는데
  `http-message-signatures` 명세는 생략 가능하다고 기술해 두 1차 문서가
  충돌한다.
  - kind: technical
  - needs: v2 명세 §5.1.2 표 + 해당 확장 명세의 Schema Omission 절

## 7. 생태계와 거버넌스

- [x] c27: 공식 문서는 서드파티 확장 6종을 등재하고 있으며 전부 TypeScript를
  지원한다.
  - kind: factual
  - needs: third-party-extensions 문서
- [x] c28: 그중 OMATrust는 offer-receipt의 미규정 영역인 서명 키 권한 부여를
  정확히 겨냥한다.
  - kind: interpretive
  - needs: 서드파티 표의 설명 문구 + offer-receipt §4.5.1
- [x] c29: 확장은 메인테이너 검토·승인을 거쳐야 SDK에 포함되므로 확장
  레지스트리는 무허가형이 아니라 큐레이션형이다.
  - kind: technical
  - needs: overview의 "Building a Custom Extension" 6단계
