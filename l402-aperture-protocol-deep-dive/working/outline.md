# Outline — L402 & Aperture Deep Dive

## 1. Abstract / 초록
- 한 줄 요약: Lightning Labs가 만든 HTTP 402 + Lightning + macaroon 표준 L402와 그 리버스 프록시 Aperture.

## 2. Introduction — L402가 왜 다시 주목받는가
- 2020 LSAT 출범 → 2024 L402 개명.
- 2025–2026 에이전트 결제 흐름에서의 자리.

## 3. Background — 표준 스택
- 3.1 HTTP 402의 부활: L402 / x402 / MPP가 다른 자산으로 같은 자리를 노린다.
- 3.2 Lightning Network와 BOLT 11 invoice.
- 3.3 Macaroons: HMAC chain + 카비엇(caveat).

## 4. L402 Protocol Spec
- 4.1 챌린지/응답 흐름과 HTTP 헤더.
- 4.2 토큰 형식: `<base64(macaroon)>:<hex(preimage)>`.
- 4.3 Payment hash binding: H == sha256(r).
- 4.4 402 vs 401 분리.
- 4.5 캐비엇과 위임(attenuation/delegation).
- 4.6 gRPC 어댑테이션.

## 5. Aperture — Lightning Labs 리버스 프록시
- 5.1 v0.5.0 (MIT) Go 구현체, lnd 종속.
- 5.2 패키지 구조(`auth`, `proxy`, `mint`, `l402`, `challenger`, `aperturedb`).
- 5.3 `sample-conf.yaml` 구성: LND 인증, etcd/Postgres/SQLite 백엔드, 서비스 정의.
- 5.4 시작·종료·서비스 갱신 라이프사이클(NewAperture/Start/Stop/UpdateServices).
- 5.5 admin API와 dashboard 빌드 태그, `aperturecli` + MCP.
- 5.6 rate limiting과 HTTP 429 / gRPC ResourceExhausted.

## 6. Code & SDK Ecosystem
- 6.1 Tierion `lsat-js`(JS), `boltwall`(Node), `lsat-playground`.
- 6.2 Lightning Agent Tools (lnget · aperture skill · macaroon bakery).
- 6.3 BLIP-0026: L402 in lightning/blips.

## 7. Comparison — L402 vs x402 vs MPP
- 결제 자산, 정산 지연, 거버넌스, 검열 저항성, 가격 안정성.

## 8. Discussion — 언제 L402를 골라야 하는가
- Bitcoin-native 결제 / 비-EVM 환경 / 마이크로결제 단가 / agent commerce.

## 9. Limitations — 본 분석의 한계.

## 10. References — auto-generated.
