# Claims

## 서론
- [ ] c01: Leaky Paywall(2026-07-17)은 봇 트래픽이 페이지뷰의 1–2%이며 월 100만 뷰 사이트가 페이지당 $0.001–0.01에 과금하면 월 $20–200에 그친다고 계산했다.
  - kind: factual
  - needs: 원문 + 계산 재현
- [x] c02: Leaky Paywall은 Leaky Paywall이라는 WordPress 페이월 플러그인 벤더의 블로그로, 등록벽·뉴스레터를 권하는 결론에 상업적 이해가 있다.
  - kind: interpretive
  - needs: 사이트 정보

## 배경
- [x] c03: Cloudflare는 2025년 7월 1일부터 신규 도메인에 대해 AI 크롤러를 기본 차단으로 바꿨고 같은 날 pay-per-crawl 프라이빗 베타를 발표했다.
  - kind: factual
  - needs: Cloudflare 블로그 + 독립 보도
- [x] c04: Cloudflare Radar 데이터에 따르면 AI 크롤러의 크롤-대-참조 비율은 검색엔진보다 수십~수천 배 높다(예: Anthropic 수만:1, OpenAI 수천:1, Google 수십:1).
  - kind: factual
  - needs: Cloudflare Radar 블로그 + 보도
- [x] c05: HTTP 402 Payment Required는 1997년 HTTP/1.1 이후 "미래 사용을 위해 예약"된 상태 코드였고 pay-per-crawl이 이를 실사용한다.
  - kind: technical
  - needs: RFC + Cloudflare 블로그

## 메커니즘
- [x] c06: 크롤러는 crawler-price 헤더 없이 요청하면 402와 함께 crawler-price 헤더로 가격을 받고, crawler-exact-price 또는 crawler-max-price 헤더로 지불 의사를 표시해 재요청하면 200과 crawler-charged 헤더를 받는다.
  - kind: technical
  - needs: Cloudflare 블로그/문서
- [x] c07: 크롤러 신원은 Web Bot Auth(HTTP Message Signatures)로 검증되며, 크롤러는 Cloudflare에 사전 등록하고 결제 수단을 연결해야 한다.
  - kind: technical
  - needs: 문서 + IETF 드래프트
- [x] c08: 퍼블리셔는 도메인 전체에 단일 페이지 가격을 설정하고, 크롤러별로 허용/차단/과금을 선택할 수 있으며, Cloudflare가 대금 수취·정산 상인(merchant of record)을 맡는다.
  - kind: technical
  - needs: 문서
- [x] c09: Cloudflare는 2025년 9월 x402 Foundation 참여와 함께 pay-per-crawl 결제를 x402/스테이블코인으로도 처리하는 방향을 발표했다.
  - kind: factual
  - needs: Cloudflare 블로그 + 보도

## 경제학
- [x] c10: 실제 퍼블리셔 데이터에서 AI 크롤러 요청은 총 요청의 수 퍼센트 이상을 차지할 수 있으며, 봇이 페이지뷰의 1–2%라는 글의 가정은 사이트에 따라 크게 달라진다.
  - kind: factual
  - needs: Cloudflare Radar/TollBit 보고서 2건
- [ ] c11: TollBit 등 경쟁 시장에서 관측된 페이지당 크롤 가격은 $0.001–0.05 범위이며, 특정 콘텐츠는 더 높다.
  - kind: factual
  - needs: TollBit 보고서/보도
- [x] c12: 프라이빗 베타 1년 시점에 Cloudflare나 참여 퍼블리셔가 공개한 pay-per-crawl 실제 수익 수치는 없다.
  - kind: factual
  - needs: 검색 결과 부재 + 보도
- [x] c13: 주요 AI 기업(OpenAI, Anthropic, Google)이 pay-per-crawl에 결제자로 참여했다는 공개 확인은 없다.
  - kind: factual
  - needs: 보도 2건

## 현재 상태와 대안
- [x] c14: pay-per-crawl은 발표 후 1년 이상 프라이빗 베타에 머물렀다(또는 GA로 전환된 시점이 있다).
  - kind: factual
  - needs: Cloudflare 문서/보도
- [x] c15: RSL(Really Simple Licensing) 1.0이 2025년 9월 Reddit·Yahoo·Medium 등 참여로 발표되어 robots.txt 기반 라이선스 조건 표기를 표준화하려 한다.
  - kind: factual
  - needs: RSL 발표 + 보도
- [x] c16: IETF AIPREF 워킹그룹이 AI 사용 선호 표기를 표준화 중이며, 이는 결제가 아닌 허용/거부 신호에 국한된다.
  - kind: technical
  - needs: IETF 문서
- [x] c17: 대형 퍼블리셔의 AI 수입은 크롤 과금이 아니라 직접 라이선스 계약(예: News Corp–OpenAI 5년 $250M 이상)에서 나온다.
  - kind: factual
  - needs: 보도 2건
- [x] c18: Cloudflare는 2025년 하반기 AI Crawl Control 등으로 기능을 확장했고, 402 응답에 퍼블리셔 메시지를 싣는 기능을 추가했다.
  - kind: technical
  - needs: Cloudflare 블로그/문서

## 분석
- [x] c19: 기본 차단이 pay-per-crawl 자체보다 퍼블리셔 협상력에 더 큰 영향을 미쳤다는 평가가 있다.
  - kind: interpretive
  - needs: 독립 분석 1건
- [x] c20: 페이지당 과금 모델은 크롤 볼륨이 낮은 롱테일 퍼블리셔에게 구조적으로 적은 금액을 주며, 이는 글의 결론과 독립 분석이 일치하는 부분이다.
  - kind: interpretive
  - needs: 독립 분석
- [x] c21: Cloudflare는 pay-per-crawl을 단독 수입원이 아니라 에이전트 시대의 가격 발견·접근 제어 인프라로 위치시킨다.
  - kind: interpretive
  - needs: Cloudflare 자체 발언

## 추가 (수집 중 발견)
- [x] c22: 2026년 7월 1일 Cloudflare는 pay-per-crawl을 "Pay Per Use"(답변에 인용될 때 지불)로 확장한다고 발표했고, 크롤 트래픽의 절반 이상이 변경 없는 페이지 재수집이라는 근거를 들었으며, 9월 15일부터 광고 페이지에서 mixed-use 크롤러를 기본 차단한다.
  - kind: factual
  - needs: Cloudflare 보도자료 + 독립 보도
- [x] c23: Stack Overflow는 2026년 2월 pay-per-crawl 도입을 공개했고, 켜자마자 크롤러들이 트래픽을 끊었다고 밝혔다(지불보다 이탈).
  - kind: factual
  - needs: Stack Overflow 블로그 + 2번째 출처
- [ ] c24: Cloudflare 네트워크는 하루 약 10억 건의 402 응답을 AI 크롤러에 보낸다(2026년 CSO 발언).
  - kind: factual
  - needs: CoinDesk + 2번째 출처
