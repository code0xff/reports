# Claims

## 서론 (Introduction)
- [x] c01: L402(구 LSAT)는 Lightning Labs가 2020년 발표한, 라이트닝 네트워크로 API/서비스 접근을 결제·인증하는 개방형 프로토콜이다.
  - kind: factual
  - needs: Lightning Labs 2020 포스트 + 리포지토리. (s03, s04)
- [x] c02: L402는 HTTP 402 상태코드를 재활용해 macaroon(베어러 크리덴셜)과 라이트닝 마이크로페이먼트를 결합한다.
  - kind: technical
  - needs: 빌더 가이드/스펙. (s01, s06)

## 결제 플로우 (Payment flow)
- [x] c03: 서버는 402 응답에서 `WWW-Authenticate: L402 macaroon="<base64>", invoice="<bolt11>"` 헤더로 macaroon과 라이트닝 인보이스를 함께 제시한다.
  - kind: technical
  - needs: 프로토콜 스펙 헤더. (s02)
- [x] c04: 클라이언트는 인보이스를 라이트닝으로 결제해 preimage를 얻고, `Authorization: L402 <base64(macaroon)>:<hex(preimage)>` 형식으로 재요청한다.
  - kind: technical
  - needs: 스펙 Authorization 헤더. (s02, s01)
- [x] c05: macaroon이 인보이스의 payment_hash에 커밋되어 있어, 서버는 백엔드 LN 노드 조회 없이 macaroon+preimage만으로 결제를 검증할 수 있다(스테이트리스 검증).
  - kind: technical
  - needs: 빌더 가이드 + awesome-L402 + 2026 포스트. (s01, s06, s07)

## 참고 라이브러리 (Reference libraries)
- [x] c06: Aperture는 Lightning Labs의 L402 리버스 프록시 구현으로, gRPC/REST 백엔드 요청을 프록시하며 새 사용자에게 macaroon과 인보이스를 발급한다.
  - kind: technical
  - needs: aperture 리포 + awesome-L402. (s05, s06)
- [x] c07: L402 라이브러리 생태계에는 서버측(Boltwall, LSAT-middleware, Rust l402_middleware)과 클라이언트측(lsat-js, l402-ts, gol402, Fewsats/l402-python) 구현이 존재한다.
  - kind: factual
  - needs: awesome-L402 목록 + 개별 리포. (s06, s13, s14)
- [x] c08: lsat-js/Boltwall/Aperture 간 상호운용이 가능해, 한 구현에서 만든 L402를 다른 구현에서 검증할 수 있다.
  - kind: interpretive
  - needs: 상호운용 서술. (s06)

## 라이트닝 생태계 활용 (Lightning ecosystem usage)
- [x] c09: Lightning Labs의 Lightning Loop 서비스가 Aperture를 통해 L402를 실제 운영에 사용해 왔다.
  - kind: factual
  - needs: 2026 L402-for-agents 포스트. (s07)
- [x] c10: L402는 AI 에이전트 결제 도구(LangChainBitcoin, n8n 노드, MCP 서버 등)와 Fewsats Sherlock/Amazon-MCP 같은 응용에서 활용된다.
  - kind: factual
  - needs: awesome-L402 + Fewsats 리포. (s06, s10)
- [x] c11: L402를 라이트닝 프로토콜 표준으로 규격화하려는 blip-0026 제안이 있으며, 다수 팀이 이미 구현 중이다.
  - kind: factual
  - needs: blip-0026 PR. (s12)

## 타 프로토콜·비라이트닝 결제 접근 (Cross-rail support)
- [x] c12: 표준으로서의 L402는 라이트닝/BOLT-11 전용이며, blip-0026도 다른 결제수단을 규정하지 않는 'Lightning-native' 프로토콜로 명시한다.
  - kind: technical
  - needs: blip-0026 + 2026 포스트 + 중립 랜드스케이프. (s12, s07, s11)
- [x] c13: 체인-애그노스틱(Base/Solana/EVM, USDC) 영역은 L402가 아니라 별도 프로토콜 x402(Coinbase, 2025)가 담당하며, L402는 BTC/라이트닝에 단일-레일로 정착한다.
  - kind: interpretive
  - needs: x402 vs L402 비교 + 랜드스케이프. (s08, s11)
- [x] c14: Fewsats는 L402 'offer'를 USD 표시·payment_methods 배열로 일반화하여, Sherlock에서 credit_card(Stripe checkout URL)와 lightning을 함께 지원한다.
  - kind: technical
  - needs: Fewsats l402-python + sherlock core 문서. (s09, s10)
- [x] c15: Fewsats 클라이언트는 L402(카드/라이트닝)와 별개로 x402(USDC on Base, Coinbase CDP) 구매 플로우도 병행 제공한다.
  - kind: technical
  - needs: sherlock core + l402-python(onchain). (s10, s09)

## 논의 (Discussion)
- [x] c16: L402는 베어러 macaroon으로 후속 요청에 재사용 가능한 크리덴셜을 발급한다는 점에서, 요청당 단건 결제 중심의 x402/MPP와 구조적으로 구분된다.
  - kind: interpretive
  - needs: 중립 랜드스케이프 인용. (s11)
- [x] c17: L402(BTC/라이트닝, ms급 정산·스테이트리스 검증)와 x402(USDC, 온체인 1~3초)는 변동성·정산확정성·지연에서 상이한 트레이드오프를 가진다.
  - kind: interpretive
  - needs: ln.bot 비교. (s08)
