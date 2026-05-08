# Solana Foundation과 pay.sh: 공식 사이트 및 GitHub 코드 기반 상세 분석

## 초록

pay.sh는 Solana Foundation이 **Stripe가 아닌 Google Cloud**와 공동으로 2026년 5월 출시한 AI 에이전트용 API 결제 게이트웨이다. AI 에이전트가 계정 생성이나 API 키 없이 Solana 지갑만으로 유료 API를 즉각 호출하고 USDC로 결제하는 pay-per-request 인프라를 제공한다. Stripe는 pay.sh를 직접 공동 개발하지 않았으나, Stripe가 Tempo와 공동 저작한 Machine Payments Protocol(MPP)을 pay.sh가 지원하여 간접적으로 연결된다. 본 보고서는 공식 웹사이트(pay.sh), Solana 공식 블로그, GitHub 공개 저장소(`solana-foundation/pay`, `solana-foundation/mpp-sdk`) 기반으로 기술 아키텍처, 핵심 프로토콜(x402, MPP), 생태계 현황, 그리고 한계를 상세히 분석한다.

## 소개

자율 AI 에이전트가 인터넷에서 독립적으로 서비스를 소비하는 시대가 도래하면서, 기존의 API 결제 방식인 월정액 구독, API 키 발급, 계정 생성 등이 에이전트의 즉각적이고 소액의 pay-per-use 요구를 충족하지 못한다는 문제의식이 커지고 있다[^s15]. 이에 대응하여 2025–2026년 사이 Coinbase의 x402, Tempo와 Stripe의 MPP 등 HTTP 402 상태 코드 기반 기계-기계 결제 표준들이 경쟁적으로 등장했다[^s05][^s09].

이 배경 속에서 Solana Foundation은 Google Cloud와 협력하여 2026년 5월 5일 **pay.sh**를 공개 출시했다[^s10][^s11]. Solana Foundation CPO Vibhu Norby는 "In collaboration with Google Cloud, we're introducing Pay.sh, a gateway service designed to bridge the gap between autonomous agents and enterprise infrastructure(Google Cloud와의 협력을 통해, 자율 에이전트와 엔터프라이즈 인프라 사이의 간극을 해소하는 게이트웨이 서비스 pay.sh를 소개합니다)"라고 밝혔다[^s11].

한 가지 중요한 사실 확인이 필요하다. 일부 보도에서 Stripe가 pay.sh의 공동 개발사로 묘사되지만, 이는 정확하지 않다. Stripe는 Tempo와 함께 MPP를 공동 개발했으며[^s05][^s13], pay.sh는 MPP를 지원 프로토콜 중 하나로 채택함으로써 Stripe 생태계와 **간접적으로** 연결될 뿐이다[^s03][^s09]. pay.sh의 직접 공동 개발 파트너는 Google Cloud다[^s01].

## 배경: AI 에이전트 결제 인프라의 부상

### HTTP 402의 역사와 부활

HTTP 402 Payment Required 상태 코드는 1990년대 초 Tim Berners-Lee 등이 HTTP 표준을 설계할 때 디지털 캐시나 마이크로결제 체계를 위해 "미래 사용을 위해 예약"해둔 코드다. 그러나 적합한 결제 인프라가 등장하지 않아 30년 이상 사실상 미사용 상태로 남아 있었다. 다양한 기업들이 비율 제한이나 미납 알림 등에 비표준적으로 활용했지만, 표준화된 결제 흐름으로 구현된 사례는 없었다[^s17].

2025–2026년에 이르러 AI 에이전트 경제가 본격화되면서 HTTP 402는 새로운 주목을 받았다. Coinbase가 x402를 개발하고, Tempo와 Stripe가 MPP(Machine Payments Protocol)를 발표하면서 HTTP 402를 중심으로 한 기계-기계 결제 표준 경쟁이 시작되었다[^s09][^s13].

### 기존 결제 방식의 한계

기존 API 결제 방식은 구독 계약, API 키 발급, 청구 계정 설정 등 인간 중심의 온보딩 절차를 전제로 설계되어 있다. AI 에이전트가 수천 개의 API를 즉각적으로 discover하고 소액을 지불하며 접근해야 하는 환경에서는 이 방식이 적합하지 않다[^s15]. pay.sh, x402, MPP는 모두 "결제 자체가 인증(Payment is the credential)"이라는 원칙을 공유하며, API 키나 계정 없이 HTTP 협상 한 번으로 접근을 완결하는 설계를 추구한다[^s01].

### 2026년의 결제 프로토콜 경쟁

2026년 현재 AI 에이전트 결제 시장에는 세 가지 주요 방향이 공존한다[^s09][^s12][^s13]:

- **x402** (Coinbase → Linux Foundation): HTTP 402를 스테이블코인 결제로 활용하는 오픈 표준. 2026년 4월 Linux Foundation에 이관.
- **MPP** (Tempo + Stripe): HTTP 인증 체계로 제안된 오픈 표준. 스테이블코인과 법정화폐를 모두 지원.
- **Solana pay.sh**: x402와 MPP를 모두 지원하는 API 게이트웨이로, Google Cloud 인프라 위에 구축.

## pay.sh: 개요, 출시 배경 및 비즈니스 모델

### 출시 배경 및 파트너십

pay.sh는 2026년 5월 5일 Solana Foundation과 Google Cloud의 공동 발표로 공개되었다[^s10]. 플랫폼은 AI 에이전트가 Solana 지갑을 Gemini, Claude Code, Codex 등 AI 인터페이스에 연결한 후 신용카드 또는 스테이블코인으로 약 60초 내에 잔액을 충전하고, 이후 마켓플레이스에서 API를 검색하여 실시간 가격을 확인하고 즉시 결제할 수 있는 구조로 설계되었다[^s01][^s07].

### 비즈니스 모델: Pay-per-Request

pay.sh의 핵심 가치 제안은 구독이나 최소 지출 요건 없이 요청 단위로 API를 사용하는 것이다[^s10]. 요금 체계는 서비스에 따라 무료에서 최대 건당 $10.00까지이며, 다수의 API는 $0.001 수준의 극소액 결제를 지원한다[^s02] _(unverified — single source)_. 출시 시점 기준 70개 이상의 API 공급자가 등록되어 있으며(s02는 72+, s11은 75+로 약간의 차이 존재), 이 수치는 공개 GitHub PR을 통해 지속적으로 성장 중이다[^s02][^s11].

결제 수단으로는 USDC(USD Coin) 스테이블코인이 Solana 네트워크 위에서 사용되며, Solana의 약 400밀리초 최종 확정 시간과 $0.00025 수준의 수수료가 마이크로결제에 유리한 조건을 제공한다[^s14].

## 기술 아키텍처 및 GitHub 코드 분석

### 전체 아키텍처: GCP 기반 API 프록시

pay.sh는 Google Cloud Platform(GCP) 위에 구축된 API 프록시로 동작한다. 에이전트의 요청을 받아 접근 제어, 속도 제한, 검증을 처리한 후 Google Cloud 서비스나 커뮤니티 API로 요청을 전달한다. 에이전트는 별도의 Google 계정 없이 Solana 지갑이 신원과 결제 수단을 동시에 담당한다[^s01][^s15].

```
AI Agent → pay CLI/MCP → [HTTP 402 감지] → 지갑 서명 요청
→ 결제 증명(x402 or MPP) → GCP API Proxy → 실제 API 서비스
```

### solana-foundation/pay: CLI 도구

GitHub 저장소 `solana-foundation/pay`는 pay.sh의 핵심 클라이언트 도구다[^s03]. 주요 기술 특성:

- **주요 언어**: Rust 83.9%, TypeScript 13.5% _(unverified — single source)_[^s03]
- **설치 방법**: Homebrew(`brew install pay`), NPM(`npm install -g @solana/pay`), 소스 빌드(`just install pay`)
- **핵심 동작**: curl, claude, codex 등 기존 CLI 도구를 래핑하여 HTTP 402 응답을 자동 감지, 스테이블코인 서명 후 재요청 _(unverified — single source)_[^s03]
- **MCP 서버 내장**: Claude Code, Codex 등 AI 어시스턴트가 로컬 지갑 승인 흐름을 통해 유료 API 호출 가능 _(unverified — single source)_[^s03]
- **생체인증 보안**: macOS Touch ID, Windows Hello, Linux GNOME Keyring 등 플랫폼 생체인증을 통해 AI 에이전트가 개인 키에 직접 접근하지 못하도록 차단 _(unverified — single source)_[^s03]
- **Payment Debugger**: 로컬에서 동작하는 웹 UI로 402 challenge-response 사이클을 시각화, 헤더와 프로토콜 세부 정보를 시퀀스 다이어그램으로 표시[^s03]

### solana-foundation/mpp-sdk: 다중 언어 SDK

`solana-foundation/mpp-sdk`는 MPP의 Solana 결제 방식(Solana Charge Intent)을 구현한 독립 SDK다[^s04]. 다중 언어를 지원한다 _(unverified — single source)_:

| 언어 | 패키지 | 비중 |
|------|--------|------|
| TypeScript | `@solana/mpp` | 26.0% |
| Rust | `solana-mpp` | 39.5% |
| Go | — | 14.8% |
| Python | — | 11.8% |
| Lua | — | 6.8% |

서버 측 기능으로는 SPL 토큰 및 Token-2022 자산 수납, 수수료 후원(서버가 트랜잭션 비용 부담), 복수 수신자에게 분할 지불, 리플레이 공격 방어, 세션 기반 결제 등을 지원한다[^s04].

## 핵심 프로토콜: x402와 MPP

### x402: Coinbase에서 Linux Foundation으로

x402는 Coinbase가 개발한 오픈 HTTP 결제 표준으로, HTTP 402 상태 코드를 활용해 서비스가 결제를 요구하면 클라이언트가 스테이블코인 서명 페이로드(`X-PAYMENT` 헤더)를 첨부해 재요청하는 원자적 흐름을 구현한다[^s09].

2026년 4월 2일, Coinbase는 x402를 Linux Foundation에 이관하여 **x402 Foundation**을 출범시켰다[^s08]. 창립 멤버에는 Adyen, Amazon Web Services, American Express, Ampersend.ai, Base, Circle, Cloudflare, Coinbase, Fiserv, Google, KakaoPay, Mastercard, Merit Systems, Microsoft, Polygon Labs, PPRO, Shopify, Sierra, **Solana Foundation**, **Stripe**, thirdweb, Visa가 포함된다[^s08]. Solana Foundation은 창립 시점 기준 전체 x402 거래의 약 65%를 처리하는 최대 사용 블록체인으로 기록되었다[^s14] _(vendor-stated)_.

2026년 5월 기준 x402는 약 1억 6,500만 건의 거래와 48만 명 이상의 거래 에이전트를 처리했다[^s09] _(vendor-stated)_.

### MPP: Stripe와 Tempo의 공동 표준

MPP(Machine Payments Protocol)는 Tempo와 Stripe가 공동 저작한 오픈 표준으로, 2026년 3월 18일 공식 발표되었다[^s05][^s13]. 2026년 3월 30일에는 Tempo Labs와 Stripe 엔지니어들이 IETF에 `draft-httpauth-payment-00`으로 제출하며 Standards Track Internet-Draft 지위를 획득했다[^s16] _(early signal)_.

Tempo는 Stripe와 벤처 펀드 Paradigm이 공동 인큐베이션한 블록체인 스타트업으로, 2025년 기준 50억 달러 평가를 받아 5억 달러를 조달했다[^s13].

MPP의 기술적 차별화 요소는 결제 방법의 다양성이다[^s07][^s06]:

- **스테이블코인**: Tempo의 결제 채널(TIP-20 토큰)
- **법정화폐**: Stripe 카드(Visa, Mastercard 등)
- **비트코인**: Lightning Network BOLT11 인보이스
- **Solana**: SOL 및 SPL 토큰
- **Stellar, Monad, RedotPay**: 각 네트워크 고유 자산

MPP는 단일 HTTP 협상 흐름에서 클라이언트가 선호 결제 수단을 선택하는 다중 방법 챌린지(multi-method challenge)를 지원하며, 세션 기반 결제로 요청 당 지연을 최소화한다[^s07].

### pay.sh의 프로토콜 통합

pay.sh는 x402와 MPP 두 프로토콜을 모두 지원함으로써 Coinbase/Linux Foundation 생태계와 Stripe/Tempo 생태계 모두를 포괄한다[^s03][^s09][^s15]. x402 Foundation과 MPP는 기술 철학에서 유사하지만(HTTP 402 기반, 계정 불필요) 서로 다른 재단이 주도하는 별개 표준이다. pay.sh가 두 프로토콜을 모두 지원하는 것은 생태계 파편화 위험을 분산하는 전략적 선택으로 해석할 수 있다 _(interpretive)_.

## 생태계 및 파트너십

### Google Cloud 공식 API

pay.sh의 핵심 파트너십은 Google Cloud다. GCP 프록시를 통해 다음 공식 서비스를 스테이블코인 pay-per-request 방식으로 제공한다[^s01][^s11]:

- **Gemini** (생성형 AI 추론)
- **BigQuery** (데이터 분석)
- **BigTable** (NoSQL 데이터베이스)
- **Cloud Run** (서버리스 컨테이너)
- **Vertex AI / Model Garden** (ML 플랫폼)

### 커뮤니티 API 생태계

Google Cloud 외에도 70개 이상의 커뮤니티 API 공급자가 참여한다[^s02]. 카테고리별 주요 서비스:

- **이커머스**: Rye, BigCommerce, Purch
- **데이터·인텔리전스**: Exa, Dune Analytics, Nansen, ATXP
- **커뮤니케이션**: AgentMail, StablePhone, StableEmail
- **Solana 인프라**: Helius, Alchemy, Quicknode, Allium, The Graph
- **AI/ML**: fal.ai, dTelecom, Alibaba Cloud OCR

등록 절차는 개방형 오픈소스 방식으로, GitHub 저장소에 Pull Request를 제출하면 된다[^s02].

### 지원 AI 클라이언트 및 런치 파트너

pay.sh는 다음 AI 클라이언트를 공식 지원한다[^s02][^s03]: Claude Code (Anthropic), Gemini (Google), Codex (OpenAI), Openclaw, Hermes. 런치 파트너로는 PayAI, Crossmint, Merit Systems, Corbits, Moonpay, Sponge Wallet, ATXP, Tektonic Company가 참여했다[^s01].

### x402 Foundation에서의 위치

Solana Foundation은 x402 Foundation 창립 멤버이자 x402 거래량의 약 65%를 담당하는 최대 채택 네트워크로서 AI 에이전트 결제 생태계의 핵심 인프라 역할을 하고 있다[^s08][^s14] _(vendor-stated)_. Stripe 역시 x402 Foundation 창립 멤버로, x402와 MPP 두 진영 모두에 참여하는 독특한 위치에 있다[^s08].

## 한계 및 불확실성

pay.sh는 출시 초기 단계로 여러 구조적 한계를 내포한다.

**Google Cloud 중앙화 의존성**: pay.sh는 GCP 위에 구축된 프록시이므로 Google Cloud 장애나 정책 변경이 서비스 가용성에 직접 영향을 미친다[^s15]. "탈중앙화" 블록체인 결제 레이어와 중앙화된 클라우드 인프라가 결합된 구조적 모순이 존재한다.

**프로토콜 파편화 위험**: x402와 MPP는 기술적으로 유사하지만 서로 다른 재단·기업이 주도하는 별개의 표준이다. 두 진영의 생태계가 각자 성장할 경우 개발자는 분산된 지원 비용을 부담해야 한다[^s13]. 이는 아직 이른 시장에서 흔히 나타나는 파편화 위험이다[^s05].

**MPP의 이른 표준화 단계**: MPP는 2026년 3월 30일 IETF 드래프트로 제출되었으나, IETF 드래프트는 6개월 후 갱신되지 않으면 만료되며 표준 승인까지 수년이 걸릴 수 있다 _(early signal)_[^s16].

**Stripe의 지역 제한**: Stripe를 통한 MPP 결제(법정화폐)는 미국 사업자 대상이며, 뉴욕과 텍사스는 제외된다[^s06]. 글로벌 AI 에이전트 환경에서 Stripe MPP 경로의 실용성에 제약이 있다.

**독립 감사 부재**: solana-foundation/pay 및 solana-foundation/mpp-sdk의 공개 보안 감사 보고서는 2026년 5월 기준 존재하지 않는다. 생체인증 기반 키 격리, 리플레이 방어 등의 보안 속성은 README 문서에만 기재되어 있으며 외부 검증되지 않았다.

**수익 모델 불명확**: Solana Foundation의 pay.sh 운영 수익 모델(프로토콜 수수료 부과 여부 등)이 공개 자료에서 명시되지 않았다.
