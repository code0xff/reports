# Gaps — x402-extensions

2026-09-18 기준. 게더 3회차 종료 시점. 남은 항목은 Limitations에 그대로 옮긴다.

## 해소된 갭

| # | 갭 | 처리 |
|---|----|------|
| G1 | 확장 9종의 SDK 구현 여부를 디렉터리 목록만으로 판정하면 이름이 다른 곳에 구현된 경우를 놓친다 | 코드 검색으로 교차 확인. `offer-receipt`/`offerreceipt`/`OfferReceipt` 세 철자 모두 `go/`·`python/` 히트 0건, `auth-hints`·`http-message-signatures`는 명세 파일 외 히트 0건 |
| G2 | Go의 `erc20approvalgassponsor`에 `facilitator.go`가 없어 구현 누락으로 보였다 | **오판이었다.** facilitator 로직은 `go/mechanisms/evm/exact/facilitator/erc20_approval.go`에 있다. 패키지 배치가 다를 뿐 기능은 존재하므로 공식 문서의 "TypeScript, Go, Python" 표기는 정확하다. 본문에서 주장하지 않는다 |
| G3 | 공식 문서 훅 매트릭스와 소스의 불일치를 grep으로만 판정하면 들여쓰기·팩토리 생성 방식 때문에 오탐이 난다 | 배포된 `@x402/extensions@2.26.0`을 설치해 런타임 객체를 직접 조사. `working/verify/verify_hooks.mjs` |
| G4 | 환불이 코어에 없다는 주장의 근거 | v1·v2 명세와 확장 명세 9건 전부에서 "refund" 출현 0회. 서드파티 표에는 환불 SDK 2종 등재 |
| G5 | 문서 사이트(docs.x402.org)와 저장소 `docs/`의 내용이 어긋날 가능성 | 게시된 Available Extensions 표를 별도로 조회해 저장소 `.mdx`와 동일함을 확인 |
| G6 | v2 이전에도 확장 개념이 있었는지 | v1 명세 전문에 "extension" 출현 0회. v2 Version History가 "extensions support"를 v2.0 변경점으로 기재 |

## 남은 갭

| # | 갭 | 상태 |
|---|----|------|
| G7 | **확장 레이어를 다룬 독립 보안 분석이 없다.** x402에 대한 가장 체계적인 외부 분석(arXiv 2605.30998)은 HTTP 의미론·스킴·SDK 배포 선택을 다루지만 `extensions` 필드와 에코 검증은 범위에 넣지 않았다. 따라서 §3의 미선언 키 주입 서술은 필자의 코드 독해이며 외부 교차검증이 없다 | 미해소. Limitations에 기재 |
| G8 | 에코 검증의 미선언 키 경로가 실제 배포에서 악용 가능한지 확인하지 못했다 | **부분 해소.** 반대 증거 스윕에서 리소스 서버 쪽 방어를 코드로 확인했다. enrich 경로와 훅 디스패치가 모두 `declaredExtensions` 기준으로 순회하고, 훅에는 `ctx.declaredExtensions[extensionKey] === undefined`면 즉시 반환하는 가드가 있다. 클라이언트가 지어낸 키는 서버에서 확장 코드를 실행시키지 못한다. 남은 미확인 범위는 facilitator 구현으로 좁혔다 |
| G9 | Go·Python의 에코 검증이 TypeScript와 동일한 하드코딩 테이블을 갖는지 대조하지 못했다. 세 언어 모두 `extension_echo_mismatch` 식별자를 갖는 것까지만 확인했다 | 미해소. TypeScript 기준임을 명시 |
| G10 | `offer-receipt`의 서명자 권한 검증 공백을 실제 구현이 어떻게 메우는지 — `@x402/extensions/offer-receipt`의 검증 함수가 권한 확인을 강제하는지 — 소스를 끝까지 읽지 못했다 | 미해소. 명세 수준 서술로 한정 |
| G11 | 서드파티 확장 6종의 실제 사용량·품질을 확인하지 못했다. 등재는 문서 표 한 줄일 뿐이다 | 미해소. 등재 사실만 서술 |
| G12 | `payment-identifier`가 훅 없이 정적 선언만으로 동작한다면 멱등성 강제가 어느 계층에서 일어나는지 — 미들웨어인지 애플리케이션인지 — 추적하지 못했다 | 미해소 |
