# L402 프로토콜과 Aperture — Lightning Network 기반 HTTP 402 결제 표준 심층 분석

## 초록

본 보고서는 Lightning Labs가 2020년 3월에 **LSAT**(Lightning Service Authentication Tokens)라는 이름으로 처음 발표하고[^s03], 이후 HTTP 402 상태 코드를 직접 참조하는 이름으로 개명한 **L402** 프로토콜을 1차 사양 수준에서 해체한다[^s01][^s04][^s05]. L402는 (a) HTTP 402 Payment Required, (b) **macaroons** 토큰, (c) **Lightning Network** 결제를 결합하여 데이터베이스 조회 없이 stateless로 결제·인증을 검증하는 모델이다[^s04][^s05][^s07]. 그 위에 Lightning Labs가 직접 운영하는 Go 구현체 **Aperture**가 얹혀 있다 — MIT 라이선스, 2026년 3월 25일 기준 v0.5.0, Lightning Loop의 프로덕션 트래픽을 받아 온 리버스 프록시다[^s02][^s10]. 본 보고서는 두 GitHub 리포(`lightninglabs/L402`, `lightninglabs/aperture`) README와 명세 파일, `sample-conf.yaml`, `aperture.go` 코드, 그리고 2020·2026 두 차례의 Lightning Engineering 공식 블로그[^s03][^s08][^s09]를 통째로 인용해 L402가 (i) 어떻게 작동하는지 (ii) Aperture가 그 추상을 어떻게 구현하는지 (iii) x402·MPP 같은 후발 표준과 어떻게 다른지를 정리한다.

## 1. 서론 — L402가 왜 다시 주목받는가

L402는 2020년에 이미 출시된 표준이다. Lightning Labs CTO Olaoluwa Osuntokun이 같은 해 3월 30일 LSAT의 출범을 다음과 같이 발표했다 — "By leveraging L402s, a service or business is able to offer a new tier of paid APIs that sits between free and subscription: metered, with no login, email or passwords required!"[^s03]. 그 자리에 6년 동안 비교적 조용히 존재하던 표준이, 2025–2026년 AI 에이전트 결제 흐름이 폭발하면서 다시 무대 위로 올라오고 있다.

Lightning Labs 자신의 2026년 3월 11일 블로그가 그 변화를 명료하게 정리한다 — "Agents can read documentation, write code, orchestrate multi-step workflows, and call APIs across the web. They cannot, by and large, pay for things"[^s08]. L402는 처음부터 "사람이 아닌 클라이언트가 한 번의 HTTP 왕복으로 결제와 인증을 동시에 끝낸다"는 자리에 설계되었고, 그래서 에이전트 결제 시나리오에 매우 자연스럽다는 것이 Lightning Labs 측 주장이다[^s06][^s08].

독립 매체의 정리도 같은 결을 따라간다 — "L402 lets a client pay for online resources in one automated step"[^s18]. 본 보고서는 (a) 표준 자체 (b) 표준의 레퍼런스 구현 Aperture (c) 비교를 세 갈래로 풀어 본다.

## 2. 배경 — 표준 스택

### 2.1 HTTP 402의 부활과 세 표준의 경합

HTTP 402 "Payment Required"는 RFC 7231 시점부터 "reserved for future use"로 남아 있던 상태 코드다. 2025–2026년 사이에 이 자리를 노리는 세 표준이 거의 동시에 부상했다 — L402(Lightning + macaroon)[^s01], x402(EVM + EIP-712 / EIP-3009)[^s17], MPP(다레일 인텐트)[^s16]. ln.bot의 비교 글은 L402가 "Lightning Labs publishing the spec in 2020 under the name LSAT, later renamed to reference the status code it activates"로서 가장 먼저 자리잡은 표준임을 명시한다[^s16].

### 2.2 Lightning Network와 BOLT 11 invoice

L402의 결제 레이어는 Lightning Network다. 머천트는 BOLT 11 형식의 invoice를 발행하고, 클라이언트가 그 invoice를 결제하면 `preimage`(`r`, 32바이트)를 받는다. `sha256(r) == payment_hash`라는 해시 관계가 결제 완료의 *암호학적 증명*이다[^s04][^s05]. 이 한 줄이 L402의 핵심이다 — 클라이언트가 preimage만 들고 있으면 누구든지 "이 결제는 완료됐다"를 데이터베이스 조회 없이 검증할 수 있다.

### 2.3 Macaroons — HMAC 체인 + 카비엇(caveat)

L402의 토큰은 일반 OAuth Bearer Token이 아니라 **macaroon**이다. Lightning Engineering의 macaroon 페이지는 다음과 같이 정리한다 — "Macaroons can be attenuated by the user with their own restrictions. This allows to delegate permissions and functions in a safe way"[^s07]. macaroon은 HMAC 체인으로 서명되며, 각 체인 단계에 "caveat"라는 제약이 추가될 수 있다. 카비엇은 단방향이다 — 후속 카비엇은 권한을 **좁힐 수만 있고 넓힐 수는 없다**[^s05][^s07]. 이 단방향성 덕에 부모 에이전트가 자기 macaroon에 "USDC 100달러까지, 24시간 안에" 같은 추가 카비엇을 붙여 자식 에이전트에 위임할 수 있다.

## 3. L402 프로토콜 명세

### 3.1 챌린지 / 응답 흐름

표준 헤더 형식은 두 줄로 압축된다[^s05].

```text
WWW-Authenticate: L402 macaroon="<base64>", invoice="<bolt11>"
Authorization:    L402 <base64(macaroon)>:<hex(preimage)>
```

전체 흐름은 다음 4단계다.

1. **클라이언트가 보호 자원 요청.**
2. **서버가 402로 응답** — `WWW-Authenticate` 헤더에 macaroon과 BOLT 11 invoice를 동봉한다[^s05].
3. **클라이언트가 Lightning invoice를 결제** — preimage `r`을 얻는다.
4. **클라이언트가 재요청** — `Authorization: L402 <base64(macaroon)>:<hex(preimage)>` 헤더로 자원을 받는다[^s05].

### 3.2 토큰 형식과 payment hash binding

토큰의 결정적 디테일은 **macaroon의 identifier가 invoice의 payment_hash `H`에 commit한다**는 것이다[^s05]. 명세는 이를 다음과 같이 적시한다 — "The macaroon's identifier commits to the payment hash H of the Lightning invoice. This commitment enables in-band payment verification: the server can confirm a client has paid using only the macaroon and preimage, with no additional state or backend lookup"[^s05]. 즉 검증자는 (1) macaroon에서 H를 꺼내고 (2) 들어온 preimage `r`로 sha256(r)을 계산해 H와 같은지 확인하고 (3) macaroon HMAC 체인이 유효한지, 카비엇이 통과하는지 확인한다 — 모두 stateless다[^s04][^s05][^s07].

### 3.3 402 vs 401 분리

명세는 두 상태 코드를 의도적으로 분리한다 — "402 Payment Required: Used exclusively for initial challenges when no credential exists. 401 Unauthorized: Returned when credentials are present but invalid, tampered, or verification fails"[^s05]. 즉 자격증명이 아예 없으면 402, 자격증명이 있는데 검증에 실패하면 401이다. 표준은 명시적으로 "Once a client presents a credential (valid or not), the server MUST respond with 401 if verification fails, not 402"라고 못박는다[^s05]. 이 분리는 클라이언트가 결제를 새로 시도해야 할 상황과 단순히 기존 자격증명이 깨진 상황을 구분하게 해 준다.

### 3.4 캐비엇과 위임

macaroon의 캐비엇은 서비스 액세스, 능력, 만료, 볼륨 제한 등 임의의 조건을 인코딩할 수 있다 — "Caveats can encode service access, capabilities, expiration, volume limits, and other constraints. Each successive caveat can only narrow the macaroon's authority, never widen it"[^s05]. Lightning Labs 측 예시는 "Loop가 거래소에 macaroon을 발급하고, 거래소가 추가 제약을 더 붙여 end user에게 넘긴다"는 다단 위임 패턴이다[^s07].

### 3.5 gRPC 어댑테이션

gRPC는 HTTP/2 위에서 항상 200을 반환해야 하므로, L402 명세는 별도 어댑테이션을 둔다 — "For gRPC, servers return HTTP 200 but encode the L402 challenge in trailing headers (`grpc-status: 402`) since gRPC requires 200 responses"[^s05]. 결과적으로 같은 토큰 형식이 REST와 gRPC 양쪽에서 동일하게 동작한다.

### 3.6 BLIP-0026 표준화 트래킹

L402는 `lightning/blips` 리포에 BLIP-0026(Bitcoin Lightning Improvement Proposal)으로 PR이 열려 있어 Lightning 측 표준화 트랙에서도 추적되고 있다[^s15]. 본 보고서 시점에는 IANA HTTP authentication scheme registry 등재 여부는 확정되지 않았다.

## 4. Aperture — Lightning Labs 리버스 프록시

### 4.1 구현체 개요

Aperture는 L402를 받아 들이고 처리하는 머천트 측 인프라의 **레퍼런스 구현**이다. 리포 한 줄 정의는 다음과 같다 — "An HTTP 402 reverse proxy that supports proxying requests for gRPC (HTTP/2) and REST (HTTP/1 and HTTP/2) backends using the L402 Protocol Standard"[^s02]. MIT 라이선스이며, 2026년 3월 25일 기준 v0.5.0이 pkg.go.dev에 게시되어 있다[^s10]. Lightning Loop가 production에서 사용한다 — "Aperture is a Lightning HTTP 402 (L402) reverse proxy … used in production by Lightning Loop for non-custodial on/off ramps on the Lightning Network"[^s10].

### 4.2 패키지 구조

pkg.go.dev는 Aperture의 패키지를 다음 7개로 나눠 보여 준다[^s10]:

| 패키지 | 역할 |
|---|---|
| `auth` | L402 토큰과 macaroon 인증 |
| `proxy` | HTTP/2와 gRPC 백엔드 라우팅 |
| `mint` | 토큰 발행과 invoice 생성 |
| `l402` | L402 프로토콜 구현 |
| `admin` | 어드민 API와 관리 엔드포인트 |
| `aperturedb` | DB 백엔드 (SQLite/Postgres/etcd) |
| `challenger` | 결제 챌린지 생성 |

핵심 구조체는 `Aperture`이고, 라이프사이클 함수는 다음 세 개다[^s10][^s12]:

```go
func NewAperture(cfg *Config) *Aperture
func (a *Aperture) Start(errChan chan error, shutdown <-chan struct{}) error
func (a *Aperture) Stop() error
```

추가로 `UpdateServices(services []*proxy.Service) error`로 런타임에 서비스 목록을 갱신할 수 있다[^s10]. `Start` 단계에서 Prometheus 메트릭, DB 연결(etcd/Postgres/SQLite), TLS, gRPC/REST 서버, HTTP listener가 모두 차곡차곡 올라오고, `Stop`은 challenger·admin·proxy·DB·HTTP 순으로 우아하게 내려간다[^s12].

### 4.3 `sample-conf.yaml` — LND 인증 + 백엔드 선택

Aperture의 표준 설정 파일은 ~/.aperture/aperture.yaml이며, `sample-conf.yaml`이 그 템플릿이다[^s11]. 핵심 블록을 정리하면 다음과 같다.

```yaml
listenaddr: localhost:8081
debuglevel: debug
basedir: /path/to/.aperture
insecure: false
autocert: false

authenticator:
  network: simnet
  lnd:
    host: localhost:10009
    tlspath: /path/to/lnd/tls.cert
    macdir: /path/to/lnd/data/chain/bitcoin/simnet

database:
  backend: sqlite   # 또는 postgres / etcd
  sqlite:
    dbfile: /path/to/.aperture/aperture.db

services:
  - name: example
    hostregexp: ^example\.com$
    pathregexp: ^/api/.*$
    address: backend.local:8080
    protocol: https
    authwhitelistpaths: [...]
    auth: L402
    capabilities: "add,subtract"
    pricing: { ... }
```

서비스는 다수 등록 가능하며 각 서비스는 hostregexp / pathregexp로 라우팅, capability(macaroon caveat에 들어갈 능력 목록), pricing 룰(고정·동적·티어), rate limit 룰을 각자 갖는다[^s11]. Tor 옵션·hashmail 서버(Lightning Node Connect용)·Prometheus 메트릭도 옵션이다[^s11].

### 4.4 LND 연결과 invoice 발행

`authenticator.lnd`가 핵심이다. Aperture는 lnd에 macaroon·TLS 인증으로 붙어 (a) 매 요청마다 BOLT 11 invoice를 발행하고 (b) preimage 도착 여부를 polling/subscription으로 확인한다[^s02][^s20]. 머천트는 lnd를 직접 운영해야 하지만 — 그 대신 facilitator 같은 외부 의존성이 없다[^s04][^s20].

### 4.5 admin API · dashboard · CLI · MCP

옵션 기능 셋이 풍성하다.

- **gRPC/REST admin API** — 10개의 RPC로 서비스 등록·변경, 트랜잭션 조회, 토큰 통계, 매출 모니터링을 한다. "services persist to the database and survive restarts" / "changes take effect immediately"[^s02].
- **dashboard 빌드 태그** — `dashboard` 빌드 태그로 빌드하면 Next.js 기반 임베디드 대시보드가 같이 컴파일된다[^s02].
- **`aperturecli`** — 별도 CLI 바이너리로 일상 운영을 처리한다. MCP 서버를 내장해 Claude Code / OpenAI Codex 같은 AI 에이전트에서 직접 부를 수 있다[^s02].

### 4.6 rate limiting

token bucket 알고리즘 기반 rate limit이 표준 기능이다 — "path-based rules" + per-client isolation으로 라우트마다 다른 한도를 둘 수 있다[^s02]. 한도를 넘기면 REST는 `HTTP 429 + Retry-After`, gRPC는 `ResourceExhausted` 상태를 돌려준다[^s02].

## 5. 코드 & SDK 생태계

### 5.1 클라이언트 측 라이브러리

L402 호환 클라이언트 SDK는 주로 Tierion 진영에서 출발했다.

- **`Tierion/lsat-js`** — JavaScript 유틸리티 라이브러리. "A javascript library for working with LSATs (Lightning Service Authentication Tokens)"[^s13]. macaroon 직렬화/역직렬화, preimage 부착·검증, caveat 추가를 SDK 수준에서 처리한다.
- **`Tierion/boltwall`** — Node.js + TypeScript 미들웨어. "Bitcoin Lightning paywall and authentication using LSATs. Built with LND, Nodejs, and Typescript"[^s14]. 사실상 Node 진영의 Aperture에 해당하는 페이월 미들웨어다.

(현 시점에는 `lsat-go`로 통칭되는 공식 Go 클라이언트 SDK는 단일 표준 리포로 굳어지지 않았고, 클라이언트 코드 대부분은 Aperture 자체의 `l402` 패키지를 직접 import해 쓰는 패턴을 따른다 _(unverified — single source)_.)

### 5.2 Lightning Agent Tools (2026-02-11 발표)

2026년 2월 11일, Lightning Labs는 "Lightning Agent Tools"라는 7개 스킬 패키지를 공개했다[^s09][^s19]. 발표문은 다음과 같이 정리한다 — "The new Lightning agent tools repo ships with seven composable skills covering the full agent commerce stack: running a Lightning node, isolating private keys with a remote signer, baking scoped credentials, paying for L402-gated APIs, hosting paid endpoints, querying node state via MCP"[^s09]. 일곱 스킬은 (1) Lightning 노드 운영, (2) remote signer로 키 격리, (3) scoped credential baking, (4) **`lnget`** — L402 게이트 API 자동 결제 클라이언트, (5) **`aperture` 스킬** — paid endpoint 호스팅, (6) MCP로 노드 상태 조회, (7) buyer/seller 워크플로 오케스트레이션이다[^s09]. 모두 Claude Code · Codex · npx · ClawHub 경로로 배포된다[^s09].

### 5.3 표준화 트래킹

L402는 lightning/blips PR #26로 **BLIP-0026**이 제안되어 있다[^s15]. Lightning 표준 트랙 안에서 추적되고 있다는 점에서 단순 vendor spec과는 위치가 다르다.

## 6. 비교 — L402 vs x402 vs MPP

| 축 | L402 | x402 | MPP |
|---|---|---|---|
| 결제 자산 | BTC / Lightning sats[^s01][^s16] | USDC 등 EVM ERC-20[^s17] | USDC / 카드 / SPT 등 다레일[^s16] |
| 토큰 | macaroon + preimage[^s05] | EIP-712 / EIP-3009 서명 | EIP-712 voucher / 카드 토큰 |
| 정산 모델 | 즉시 Lightning 결제 + stateless 검증[^s04] | facilitator의 `/verify` + `/settle`[^s17] | 채널 + 누적 commitment[^s16] |
| 출시 | 2020 LSAT[^s03], 이후 L402로 개명[^s16] | 2025[^s17] | 2025–2026[^s16] |
| 가격 단위 | 1 sat (분당 1 cent 미만)[^s16] | 가스+토큰 1 cent~수십 cent[^s16] | 다양 (sub-cent ~ 달러) |
| 거버넌스 | Lightning Labs + BLIP-0026[^s15] | x402 Foundation (Coinbase + Cloudflare)[^s17] | IETF draft (Tempo + Stripe) |
| 검열 저항성 | Bitcoin PoW 합의[^s16] | EVM 체인 + Circle USDC 발행자[^s16] | 운영자/체인 따라 다름 |
| 가격 안정성 | BTC 가격 변동 노출[^s16] | USD pegged[^s16] | 다양 |

ln.bot의 정리는 결론을 다음과 같이 요약한다 — L402는 "stateless cryptographic verification requiring no external dependencies"이고, x402는 "facilitators or chain queries that introduce latency and operational complexity"에 의존한다는 차이[^s16]. 검열 저항성 측면에서도 L402는 "nobody can freeze your sats, censor your payment, or unilaterally shut down the network"인 반면, x402는 USDC 발행자(Circle)와 Base 시퀀서(Coinbase)에 의존한다는 비교가 같은 글에서 명시적으로 이루어진다[^s16].

이 비교는 어느 한쪽이 우월하다는 결론이 아니다 — 본 보고서의 자매 보고서 [`x402-batch-vs-mpp-session`](../x402-batch-vs-mpp-session/)에서 x402 batch-settlement와 MPP session의 다른 트래픽 형상이 정리되어 있고, L402는 그 두 표준이 *그 위에서 우열을 다투기 전에 이미 존재하던* Bitcoin-native 진영이다.

## 7. 논의 — 언제 L402를 골라야 하는가

(interpretive) 본 보고서의 종합 판단은 다음과 같다.

- **AI agent commerce와 1 sat 단위 마이크로결제** — Lightning 라우팅 수수료가 1 sat 수준이라 "한 호출당 1 cent 미만" 가격대가 경제적으로 성립한다[^s16]. 본 보고서가 다룬 다른 표준들이 단가 floor를 낮추는 데 별도의 채널/배치 인프라가 필요한 반면, L402는 단건 결제만으로도 단가 floor가 같은 수준이다.
- **비-EVM 환경 / Bitcoin-native 운영자** — Bitcoin 인프라(lnd)를 이미 운영 중이거나, EVM 의존성을 피하고 싶은 머천트에게 L402가 자연 선택이다.
- **stateless 검증이 결정적인 환경** — 외부 facilitator·RPC·체인 인덱서에 의존하지 않고 자체 서버로 자기 매출을 검증하고 싶은 경우, macaroon + preimage 두 값만으로 충분한 L402가 다른 어떤 표준보다 단순하다[^s04].
- **반대로** USD-pegged 가격 정책이 필요한 비즈니스(가격표가 USD 단위), 카드 분쟁/chargeback이 필요한 소비자 결제, EVM 토큰을 자산으로 받아야 하는 시나리오에서는 x402·MPP·ACP가 더 맞을 수 있다 _(interpretive)_[^s16].
- **에이전트 측에서는 동시에 여러 표준을 받아들이는 어댑터 패턴이 더 현실적**이라는 결론이 자매 보고서 [`agent-payments-smart-account-design`](../agent-payments-smart-account-design/)에 정리되어 있다 — L402는 그 어댑터 셋의 Bitcoin-native 슬롯을 담당하는 셈이다.

## 8. 한계

- 본 보고서는 2026년 5월 20일 시점의 1차 사양·docs·GitHub·블로그를 기준으로 한다. `lightning/blips` PR #26의 BLIP-0026 본문은 직접 인용하지 않았으며 이슈의 존재만 확인되었다[^s15].
- L402 명세 파일 경로가 `specification.md`와 `protocol-specification.md` 사이에서 이동한 흔적이 있어, 본 보고서는 후자 경로[^s05]를 1차 인용으로 삼는다.
- 클라이언트 SDK 관점에서 `lsat-js`(JS)·`boltwall`(Node) 외의 공식 다언어 라이브러리는 본 보고서 범위 안에서 별도 표준 리포로 확인되지 않았다.
- Aperture의 `aperture.go` 코드 인용은 master 브랜치 기준이며, v0.5.0 릴리스 이후 master에 새 변경이 들어왔을 수 있다.
- L402의 USD 가격 안정성 부재나 x402의 검열 저항성 비교는 ln.bot 비교 글[^s16]을 1차 인용으로 삼았고, 이는 Lightning 옹호 입장에서의 정리에 가깝다 — 본 보고서의 uncertainties에 그대로 기록되어 있다.
- Lightning Loop 외에 Aperture가 production 트래픽을 받고 있는 서비스 전수 조사는 본 보고서 범위가 아니다.
